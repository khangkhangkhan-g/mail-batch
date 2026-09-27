/**
 * MailBatch Cloud Scheduler V1.4
 * Developer: Nguyen Khang
 *
 * Purpose:
 * - MailBatch creates real Gmail Drafts through the Gmail API in Chrome.
 * - This Apps Script stores only draft IDs + send times.
 * - A time-driven trigger sends those existing drafts while the computer is off.
 *
 * One-time setup:
 * 1) Paste this file into a new Google Apps Script project.
 * 2) Run setupMailBatchCloud() once and approve Gmail permission.
 * 3) Copy the secret from the execution log.
 * 4) Deploy > New deployment > Web app.
 *    Execute as: Me
 *    Who has access: Anyone
 * 5) Paste the /exec URL and secret into MailBatch > Schedule > Setup.
 *
 * Security:
 * - The Web App URL alone is not enough. Every request must include the generated secret.
 * - The secret lives in Script Properties and in the user's local MailBatch Chrome profile.
 * - Regenerate it with resetMailBatchCloudSecret() if it is exposed.
 * - Use the SAME Google account in Apps Script and MailBatch Gmail.
 *
 * Important:
 * - This is a MailBatch cloud queue, not Gmail's private/native Scheduled folder.
 * - Cancelled jobs leave their Gmail Draft intact, matching a safe review-first workflow.
 */

const MB_LEGACY_JOBS_KEY = 'MAILBATCH_JOBS_V1';
const MB_JOB_PREFIX = 'MAILBATCH_JOB_V1_';
const MB_SECRET_KEY = 'MAILBATCH_SECRET_V1';
const MB_HANDLER = 'processMailBatchQueue';
const MB_MAX_PENDING = 100;
const MB_MAX_HISTORY = 250;
const MB_HISTORY_MS = 30 * 24 * 60 * 60 * 1000;
const MB_PROCESSING_STALE_MS = 10 * 60 * 1000;
const MB_TRIGGER_FALLBACK_MS = 10 * 60 * 1000;
const MB_MAX_SENDS_PER_RUN = 25;

function setupMailBatchCloud() {
  const props = PropertiesService.getScriptProperties();
  let secret = props.getProperty(MB_SECRET_KEY);
  if (!secret) {
    secret = makeSecret_();
    props.setProperty(MB_SECRET_KEY, secret);
  }

  // Forces the Gmail permission prompt during setup instead of at the first scheduled send.
  GmailApp.getDrafts();
  migrateLegacyJobs_();

  console.log('MAILBATCH CLOUD SECRET: ' + secret);
  console.log('Keep this secret private. Paste it into MailBatch > Schedule > Setup.');
  console.log('Apps Script recipient quota remaining today: ' + remainingEmailQuota_());
  return secret;
}

function resetMailBatchCloudSecret() {
  const secret = makeSecret_();
  PropertiesService.getScriptProperties().setProperty(MB_SECRET_KEY, secret);
  console.log('NEW MAILBATCH CLOUD SECRET: ' + secret);
  return secret;
}

function doGet() {
  // Public health response intentionally excludes account identity and quota.
  // Authenticated scheduler operations use POST + secret.
  return json_({ ok: true, service: 'MailBatch Cloud Scheduler', version: '1.4' });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(15000);
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    assertSecret_(body.secret);
    migrateLegacyJobs_();
    recoverProcessing_();

    const action = String(body.action || '');
    if (action === 'ping') {
      return json_(baseResponse_({ now: Date.now() }));
    }
    if (action === 'schedule') {
      const jobs = scheduleJobs_(body.jobs || []);
      return json_(baseResponse_({ scheduled: jobs.length, jobs: jobs }));
    }
    if (action === 'list') {
      const jobs = pruneJobs_(loadJobs_());
      saveJobs_(jobs);
      scheduleNextTrigger_(jobs);
      return json_(baseResponse_({ jobs: jobs }));
    }
    if (action === 'cancel') {
      const result = cancelJobs_(body.ids || []);
      return json_(baseResponse_({ cancelled: result.cancelled, jobs: result.jobs }));
    }
    if (action === 'retry') {
      const result = retryJobs_(body.ids || []);
      return json_(baseResponse_({ retried: result.retried, jobs: result.jobs }));
    }
    return json_({ ok: false, error: 'Unknown action.' });
  } catch (error) {
    return json_({ ok: false, error: String(error && error.message ? error.message : error) });
  } finally {
    lock.releaseLock();
  }
}

function scheduleJobs_(incoming) {
  if (!Array.isArray(incoming) || !incoming.length) throw new Error('No jobs supplied.');
  const now = Date.now();
  let jobs = pruneJobs_(loadJobs_());
  const pendingCount = jobs.filter(j => j.status === 'pending' || j.status === 'processing').length;
  if (pendingCount + incoming.length > MB_MAX_PENDING) {
    throw new Error('Cloud scheduler supports up to ' + MB_MAX_PENDING + ' pending emails at a time.');
  }

  const existingIds = new Set(jobs.map(j => String(j.id || '')));
  const added = [];
  incoming.forEach((job, index) => {
    const id = String(job && job.id || '');
    const draftId = String(job && job.draftId || '');
    const when = Number(job && job.when);
    if (!id || existingIds.has(id)) throw new Error('Duplicate or missing job ID at item ' + (index + 1) + '.');
    if (!draftId) throw new Error('Missing Gmail draft ID at item ' + (index + 1) + '.');
    if (!isFinite(when) || when <= now) throw new Error('Scheduled time must be in the future at item ' + (index + 1) + '.');

    const normalized = {
      id: id,
      draftId: draftId,
      when: when,
      to: String(job.to || '').slice(0, 320),
      subject: String(job.subject || '').slice(0, 250),
      status: 'pending',
      backend: 'cloud',
      createdAt: now,
      updatedAt: now,
      sentAt: null,
      lastError: null
    };
    jobs.push(normalized);
    added.push(normalized);
    existingIds.add(id);
  });

  saveJobs_(jobs);
  scheduleNextTrigger_(jobs);
  return added;
}

function cancelJobs_(ids) {
  const wanted = new Set((Array.isArray(ids) ? ids : []).map(String));
  let jobs = loadJobs_();
  let cancelled = 0;
  jobs = jobs.map(job => {
    if (wanted.has(String(job.id)) && job.status === 'pending') {
      cancelled++;
      return Object.assign({}, job, { status: 'cancelled', updatedAt: Date.now(), lastError: null });
    }
    return job;
  });
  jobs = pruneJobs_(jobs);
  saveJobs_(jobs);
  scheduleNextTrigger_(jobs);
  return { cancelled: cancelled, jobs: jobs };
}

function retryJobs_(ids) {
  const wanted = new Set((Array.isArray(ids) ? ids : []).map(String));
  let jobs = loadJobs_();
  let retried = 0;
  jobs = jobs.map(job => {
    if (wanted.has(String(job.id)) && job.status === 'failed') {
      retried++;
      return Object.assign({}, job, {
        status: 'pending',
        when: Math.max(Date.now() + 15000, Number(job.when) || 0),
        updatedAt: Date.now(),
        lastError: null
      });
    }
    return job;
  });
  saveJobs_(jobs);
  scheduleNextTrigger_(jobs);
  return { retried: retried, jobs: jobs };
}

function processMailBatchQueue() {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return;
  try {
    migrateLegacyJobs_();
    recoverProcessing_();
    let jobs = loadJobs_();
    const now = Date.now();
    const dueIds = jobs
      .filter(job => job.status === 'pending' && Number(job.when) <= now)
      .sort((a, b) => Number(a.when) - Number(b.when))
      .slice(0, MB_MAX_SENDS_PER_RUN)
      .map(job => job.id);

    dueIds.forEach(id => {
      const index = jobs.findIndex(job => job.id === id);
      if (index < 0 || jobs[index].status !== 'pending') return;

      jobs[index] = Object.assign({}, jobs[index], { status: 'processing', updatedAt: Date.now() });
      saveJob_(jobs[index]);

      try {
        const draft = GmailApp.getDraft(jobs[index].draftId);
        draft.send();
        jobs[index] = Object.assign({}, jobs[index], {
          status: 'sent', sentAt: Date.now(), updatedAt: Date.now(), lastError: null
        });
      } catch (error) {
        jobs[index] = Object.assign({}, jobs[index], {
          status: 'failed', updatedAt: Date.now(),
          lastError: String(error && error.message ? error.message : error)
        });
      }
      saveJob_(jobs[index]);
    });

    jobs = pruneJobs_(jobs);
    saveJobs_(jobs);
    scheduleNextTrigger_(jobs);
  } finally {
    lock.releaseLock();
  }
}

function recoverProcessing_() {
  const jobs = loadJobs_();
  const staleBefore = Date.now() - MB_PROCESSING_STALE_MS;
  jobs.forEach((job, index) => {
    if (job.status !== 'processing' || Number(job.updatedAt || 0) > staleBefore) return;
    try {
      GmailApp.getDraft(job.draftId);
      jobs[index] = Object.assign({}, job, {
        status: 'pending',
        when: Math.max(Date.now() + 15000, Number(job.when) || 0),
        updatedAt: Date.now(),
        lastError: 'Recovered after an interrupted scheduler run.'
      });
    } catch (error) {
      // If the draft no longer exists, do not guess whether it was sent or deleted.
      // Mark failed instead of risking a duplicate send.
      jobs[index] = Object.assign({}, job, {
        status: 'failed', updatedAt: Date.now(),
        lastError: 'Draft no longer exists. It may have been sent or deleted; it will not be resent automatically.'
      });
    }
    saveJob_(jobs[index]);
  });
}

function scheduleNextTrigger_(jobs) {
  ScriptApp.getProjectTriggers().forEach(trigger => {
    if (trigger.getHandlerFunction() === MB_HANDLER) ScriptApp.deleteTrigger(trigger);
  });

  const next = (jobs || [])
    .filter(job => job.status === 'pending')
    .sort((a, b) => Number(a.when) - Number(b.when))[0];
  if (!next) return;

  const primaryTime = Math.max(Date.now() + 5000, Number(next.when));
  ScriptApp.newTrigger(MB_HANDLER).timeBased().at(new Date(primaryTime)).create();
  // Safety trigger: if the first execution is interrupted, another cloud execution re-checks the queue.
  ScriptApp.newTrigger(MB_HANDLER).timeBased().at(new Date(primaryTime + MB_TRIGGER_FALLBACK_MS)).create();
}

function loadJobs_() {
  const props = PropertiesService.getScriptProperties().getProperties();
  const jobs = [];
  Object.keys(props).forEach(key => {
    if (!key.startsWith(MB_JOB_PREFIX)) return;
    try {
      const job = JSON.parse(props[key]);
      if (job && job.id) jobs.push(job);
    } catch (error) {}
  });
  return jobs;
}

function saveJob_(job) {
  if (!job || !job.id) return;
  PropertiesService.getScriptProperties().setProperty(MB_JOB_PREFIX + String(job.id), JSON.stringify(job));
}

function saveJobs_(jobs) {
  const props = PropertiesService.getScriptProperties();
  const current = props.getProperties();
  const keep = new Set();
  const batch = {};

  (jobs || []).forEach(job => {
    if (!job || !job.id) return;
    const key = MB_JOB_PREFIX + String(job.id);
    keep.add(key);
    batch[key] = JSON.stringify(job);
  });

  if (Object.keys(batch).length) props.setProperties(batch, false);
  Object.keys(current).forEach(key => {
    if (key.startsWith(MB_JOB_PREFIX) && !keep.has(key)) props.deleteProperty(key);
  });
}

function migrateLegacyJobs_() {
  const props = PropertiesService.getScriptProperties();
  const legacy = props.getProperty(MB_LEGACY_JOBS_KEY);
  if (!legacy) return;
  try {
    const jobs = JSON.parse(legacy);
    if (Array.isArray(jobs) && jobs.length) {
      const existing = loadJobs_();
      const existingIds = new Set(existing.map(job => String(job.id || '')));
      jobs.forEach(job => {
        if (job && job.id && !existingIds.has(String(job.id))) existing.push(job);
      });
      saveJobs_(existing);
    }
  } catch (error) {}
  props.deleteProperty(MB_LEGACY_JOBS_KEY);
}

function pruneJobs_(jobs) {
  const cutoff = Date.now() - MB_HISTORY_MS;
  const filtered = (jobs || []).filter(job => {
    if (job.status === 'pending' || job.status === 'processing') return true;
    return Number(job.updatedAt || job.createdAt || 0) >= cutoff;
  });

  const active = filtered.filter(job => job.status === 'pending' || job.status === 'processing');
  const history = filtered
    .filter(job => job.status !== 'pending' && job.status !== 'processing')
    .sort((a, b) => Number(b.updatedAt || b.createdAt || 0) - Number(a.updatedAt || a.createdAt || 0))
    .slice(0, Math.max(0, MB_MAX_HISTORY - active.length));
  return active.concat(history);
}

function assertSecret_(provided) {
  const expected = PropertiesService.getScriptProperties().getProperty(MB_SECRET_KEY);
  if (!expected) throw new Error('Cloud scheduler is not initialized. Run setupMailBatchCloud() first.');
  if (!provided || String(provided) !== expected) throw new Error('Unauthorized MailBatch cloud request.');
}

function makeSecret_() {
  return (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '');
}

function ownerEmail_() {
  try { return Session.getEffectiveUser().getEmail() || ''; } catch (error) { return ''; }
}

function remainingEmailQuota_() {
  try { return MailApp.getRemainingDailyQuota(); } catch (error) { return null; }
}

function baseResponse_(extra) {
  return Object.assign({
    ok: true,
    ownerEmail: ownerEmail_(),
    quotaRemaining: remainingEmailQuota_()
  }, extra || {});
}

function json_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON);
}
