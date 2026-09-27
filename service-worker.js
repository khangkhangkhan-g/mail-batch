const GMAIL_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';
const STORAGE_JOBS = 'mailbatchScheduledJobs';
const STORAGE_HISTORY = 'mailbatchSendHistory';
const STORAGE_CLOUD = 'mailbatchCloudConfigV1';
const SCHEDULER_ALARM = 'mailbatch-scheduler';
const ATTACHMENT_DB = 'mailbatchAttachments';
const ATTACHMENT_STORE = 'files';
const LANGUAGE_KEY = 'mailbatchUiLanguage';

async function currentUiLanguage() {
  try {
    const stored = await chrome.storage.local.get(LANGUAGE_KEY);
    return stored[LANGUAGE_KEY] === 'vi' ? 'vi' : 'en';
  } catch { return 'en'; }
}

ensureScheduler().catch(() => {});

chrome.runtime.onInstalled.addListener(() => {
  ensureScheduler().catch(() => {});
});

chrome.runtime.onStartup.addListener(() => {
  ensureScheduler().catch(() => {});
  recoverProcessingJobs().then(() => processDueJobs()).catch(() => {});
});

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: 'https://mail.google.com/' });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === SCHEDULER_ALARM) processDueJobs().catch(() => {});
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  handleMessage(message)
    .then(sendResponse)
    .catch((error) => sendResponse({ ok: false, error: friendlyError(error) }));
  return true;
});

async function handleMessage(message) {
  switch (message?.type) {
    case 'AUTH': {
      assertOauthConfigured();
      const token = await getToken(true);
      const profile = await gmailFetch('/profile', { token });
      return { ok: true, profile };
    }
    case 'DISCONNECT': {
      await chrome.identity.clearAllCachedAuthTokens();
      return { ok: true };
    }
    case 'GET_PROFILE': {
      assertOauthConfigured();
      const token = await getToken(false);
      const profile = await gmailFetch('/profile', { token });
      return { ok: true, profile };
    }
    case 'CREATE_DRAFTS': {
      assertOauthConfigured();
      const emails = Array.isArray(message.emails) ? message.emails : [];
      if (!emails.length) throw new Error('No emails were supplied.');
      return createDraftBatch(emails);
    }
    case 'DELETE_DRAFTS': {
      const ids = Array.isArray(message.ids) ? message.ids.filter(Boolean) : [];
      const deleted = await deleteDrafts(ids);
      return { ok: true, deleted };
    }
    case 'SCHEDULE_EMAILS':
    case 'SCHEDULE_LOCAL_DRAFTS': {
      assertOauthConfigured();
      const jobs = Array.isArray(message.jobs) ? message.jobs : [];
      if (!jobs.length) throw new Error('No scheduled emails were supplied.');
      return scheduleLocalDrafts(jobs);
    }
    case 'GET_SCHEDULED': {
      const backend = message.backend === 'cloud' ? 'cloud' : 'local';
      if (backend === 'cloud') return getCloudJobs();
      const { [STORAGE_JOBS]: jobs = [] } = await chrome.storage.local.get(STORAGE_JOBS);
      return { ok: true, backend: 'local', jobs };
    }
    case 'CANCEL_SCHEDULED': {
      const backend = message.backend === 'cloud' ? 'cloud' : 'local';
      const ids = Array.isArray(message.ids) ? message.ids.filter(Boolean) : [];
      if (backend === 'cloud') return cloudAction('cancel', { ids });
      return cancelLocalJobs(ids);
    }
    case 'RETRY_FAILED': {
      const backend = message.backend === 'cloud' ? 'cloud' : 'local';
      const ids = Array.isArray(message.ids) ? message.ids.filter(Boolean) : [];
      if (backend === 'cloud') return cloudAction('retry', { ids });
      return retryLocalJobs(ids);
    }
    case 'IS_ATTACHMENT_REFERENCED': {
      const id = String(message.id || '');
      const { [STORAGE_JOBS]: jobs = [] } = await chrome.storage.local.get(STORAGE_JOBS);
      const referenced = jobs.some((job) => {
        if (!['pending', 'processing', 'failed'].includes(job.status)) return false;
        const attachments = job.email?.attachments || [];
        const banner = job.email?.banner;
        return attachments.some((item) => item?.id === id) || banner?.id === id;
      });
      return { ok: true, referenced };
    }
    case 'GET_CLOUD_CONFIG': {
      const config = await getCloudConfig();
      return { ok: true, config };
    }
    case 'SET_CLOUD_CONFIG': {
      const url = normalizeCloudUrl(message.url);
      const secret = String(message.secret || '').trim();
      if (url && secret.length < 16) throw new Error('Cloud secret must be at least 16 characters.');
      const config = { url, secret };
      await chrome.storage.local.set({ [STORAGE_CLOUD]: config });
      return { ok: true, config };
    }
    case 'TEST_CLOUD': {
      const response = await cloudAction('ping', {});
      return { ok: true, response };
    }
    case 'CLOUD_SCHEDULE': {
      assertOauthConfigured();
      const jobs = Array.isArray(message.jobs) ? message.jobs : [];
      if (!jobs.length) throw new Error('No scheduled emails were supplied.');
      return scheduleCloudDrafts(jobs);
    }
    default:
      throw new Error('Unknown MailBatch request.');
  }
}

function assertOauthConfigured() {
  const manifest = chrome.runtime.getManifest();
  const clientId = manifest.oauth2?.client_id || '';
  if (!clientId || clientId.startsWith('REPLACE_WITH_')) {
    throw new Error('OAuth is not configured yet. Open the Guide and add your Google OAuth Client ID.');
  }
}

async function getToken(interactive) {
  const result = await chrome.identity.getAuthToken({ interactive });
  const token = typeof result === 'string' ? result : result?.token;
  if (!token) throw new Error('Google authorization did not return an access token.');
  return token;
}

async function gmailFetch(path, { method = 'GET', body, token, retryAuth = true, allow404 = false } = {}) {
  let accessToken = token || await getToken(false);
  const response = await fetch(`${GMAIL_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (response.status === 401 && retryAuth) {
    await chrome.identity.removeCachedAuthToken({ token: accessToken });
    accessToken = await getToken(false);
    return gmailFetch(path, { method, body, token: accessToken, retryAuth: false, allow404 });
  }
  if (allow404 && response.status === 404) return null;

  const text = await response.text();
  let payload = null;
  try { payload = text ? JSON.parse(text) : null; } catch { payload = text; }

  if (!response.ok) {
    const detail = payload?.error?.message || payload?.error_description || text || `HTTP ${response.status}`;
    throw new Error(`Gmail API: ${detail}`);
  }
  return payload;
}

async function gmailMediaFetch(path, bytes, { token, retryAuth = true } = {}) {
  let accessToken = token || await getToken(false);
  const url = `https://gmail.googleapis.com/upload/gmail/v1/users/me${path}?uploadType=media`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'message/rfc822'
    },
    body: bytes
  });

  if (response.status === 401 && retryAuth) {
    await chrome.identity.removeCachedAuthToken({ token: accessToken });
    accessToken = await getToken(false);
    return gmailMediaFetch(path, bytes, { token: accessToken, retryAuth: false });
  }

  const text = await response.text();
  let payload = null;
  try { payload = text ? JSON.parse(text) : null; } catch { payload = text; }
  if (!response.ok) {
    const detail = payload?.error?.message || payload?.error_description || text || `HTTP ${response.status}`;
    throw new Error(`Gmail API: ${detail}`);
  }
  return payload;
}

function openAttachmentDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(ATTACHMENT_DB, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(ATTACHMENT_STORE)) db.createObjectStore(ATTACHMENT_STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open local attachment storage.'));
  });
}

async function getAttachmentRecord(id) {
  const db = await openAttachmentDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ATTACHMENT_STORE, 'readonly');
    const request = tx.objectStore(ATTACHMENT_STORE).get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error || new Error('Could not read attachment.'));
    tx.oncomplete = () => db.close();
  });
}

async function loadAttachments(attachments) {
  const records = [];
  for (const meta of Array.isArray(attachments) ? attachments : []) {
    const record = await getAttachmentRecord(meta?.id);
    if (!record?.blob) throw new Error(`Attachment missing locally: ${meta?.name || meta?.id || 'unknown file'}. Add the file again.`);
    records.push(record);
  }
  return records;
}

async function loadBanner(banner) {
  if (!banner?.id) return null;
  const record = await getAttachmentRecord(banner.id);
  if (!record?.blob) throw new Error(`Banner missing locally: ${banner.name || banner.id}. Add the banner again.`);
  return record;
}

async function createDraftBatch(emails) {
  const token = await getToken(false);
  const results = [];
  for (let i = 0; i < emails.length; i++) {
    const email = emails[i];
    try {
      const mime = await buildMimeMessage(email);
      const draft = await gmailMediaFetch('/drafts', mime, { token });
      results.push({ index: i, ok: true, id: draft?.id || null });
    } catch (error) {
      results.push({ index: i, ok: false, error: friendlyError(error) });
    }
    if (i < emails.length - 1) await sleep(120);
  }
  return {
    ok: true,
    created: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    results
  };
}

async function deleteDrafts(ids) {
  let deleted = 0;
  for (const id of ids) {
    try {
      await gmailFetch(`/drafts/${encodeURIComponent(id)}`, { method: 'DELETE' });
      deleted++;
    } catch {}
  }
  return deleted;
}

async function sendDraftById(draftId) {
  return gmailFetch('/drafts/send', { method: 'POST', body: { id: draftId } });
}

async function sendEmail(email) {
  const mime = await buildMimeMessage(email);
  return gmailMediaFetch('/messages/send', mime);
}

async function scheduleLocalDrafts(jobs) {
  const normalizedInput = validateScheduleJobs(jobs);
  const draftBatch = await createDraftBatch(normalizedInput.map((job) => job.email));
  if (draftBatch.failed) {
    const createdIds = draftBatch.results.filter((r) => r.ok && r.id).map((r) => r.id);
    await deleteDrafts(createdIds);
    const firstError = draftBatch.results.find((r) => !r.ok)?.error || 'Could not create all scheduled drafts.';
    throw new Error(`Scheduling stopped before queue creation: ${firstError}`);
  }

  const now = Date.now();
  const queued = normalizedInput.map((job, index) => ({
    id: crypto.randomUUID(),
    draftId: draftBatch.results[index].id,
    when: job.when,
    to: job.email.to,
    subject: job.email.subject,
    status: 'pending',
    backend: 'local',
    createdAt: now,
    updatedAt: now,
    lastError: null
  }));
  const { [STORAGE_JOBS]: existing = [] } = await chrome.storage.local.get(STORAGE_JOBS);
  await chrome.storage.local.set({ [STORAGE_JOBS]: [...existing, ...queued] });
  await ensureScheduler();
  return { ok: true, backend: 'local', scheduled: queued.length, jobs: queued };
}

async function scheduleCloudDrafts(jobs) {
  const normalizedInput = validateScheduleJobs(jobs);
  const config = await getCloudConfig();
  assertCloudConfigured(config);

  const draftBatch = await createDraftBatch(normalizedInput.map((job) => job.email));
  if (draftBatch.failed) {
    const createdIds = draftBatch.results.filter((r) => r.ok && r.id).map((r) => r.id);
    await deleteDrafts(createdIds);
    const firstError = draftBatch.results.find((r) => !r.ok)?.error || 'Could not create all cloud-scheduled drafts.';
    throw new Error(`Cloud scheduling stopped: ${firstError}`);
  }

  const remoteJobs = normalizedInput.map((job, index) => ({
    id: crypto.randomUUID(),
    draftId: draftBatch.results[index].id,
    when: job.when,
    to: job.email.to,
    subject: job.email.subject
  }));

  try {
    const response = await cloudPost(config, { action: 'schedule', jobs: remoteJobs });
    if (!response?.ok) throw new Error(response?.error || 'Cloud scheduler rejected the request.');
    if (response.ownerEmail) {
      const profile = await gmailFetch('/profile');
      const connected = String(profile?.emailAddress || '').toLowerCase();
      if (connected && connected !== String(response.ownerEmail).toLowerCase()) {
        await cloudPost(config, { action: 'cancel', ids: remoteJobs.map((job) => job.id) }).catch(() => {});
        await deleteDrafts(remoteJobs.map((job) => job.draftId));
        throw new Error(`Cloud scheduler belongs to ${response.ownerEmail}, but MailBatch is connected to ${profile.emailAddress}. Deploy Apps Script from the same Gmail account.`);
      }
    }
    return { ok: true, backend: 'cloud', scheduled: remoteJobs.length, jobs: response.jobs || remoteJobs, ownerEmail: response.ownerEmail || '', quotaRemaining: response.quotaRemaining ?? null };
  } catch (error) {
    await deleteDrafts(remoteJobs.map((job) => job.draftId));
    throw new Error(`Cloud scheduler setup or request failed. Drafts were cleaned up. ${friendlyError(error)}`);
  }
}

function validateScheduleJobs(jobs) {
  const now = Date.now();
  return jobs.map((job, index) => {
    const when = Number(job.when);
    if (!Number.isFinite(when) || when <= now) throw new Error(`Scheduled time for row ${index + 1} must be in the future.`);
    return { when, email: normalizeEmail(job.email) };
  });
}

async function ensureScheduler() {
  const alarm = await chrome.alarms.get(SCHEDULER_ALARM);
  if (!alarm) {
    await chrome.alarms.create(SCHEDULER_ALARM, { delayInMinutes: 1, periodInMinutes: 1 });
  }
}

async function recoverProcessingJobs() {
  const stored = await chrome.storage.local.get(STORAGE_JOBS);
  const jobs = Array.isArray(stored[STORAGE_JOBS]) ? stored[STORAGE_JOBS] : [];
  let changed = false;
  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    if (job.status !== 'processing' || !job.draftId) continue;
    if (Date.now() - Number(job.updatedAt || 0) < 5 * 60 * 1000) continue;
    const draft = await gmailFetch(`/drafts/${encodeURIComponent(job.draftId)}`, { allow404: true }).catch(() => undefined);
    if (draft === undefined) continue;
    if (draft) {
      jobs[i] = { ...job, status: 'pending', lastError: 'Recovered after an interrupted local scheduler run.', updatedAt: Date.now() };
    } else {
      jobs[i] = { ...job, status: 'failed', lastError: 'The Gmail draft no longer exists. It may have been sent or deleted; MailBatch will not resend it automatically.', updatedAt: Date.now() };
    }
    changed = true;
  }
  if (changed) await chrome.storage.local.set({ [STORAGE_JOBS]: jobs });
}

async function processDueJobs() {
  await recoverProcessingJobs();
  const stored = await chrome.storage.local.get([STORAGE_JOBS, STORAGE_HISTORY]);
  let jobs = Array.isArray(stored[STORAGE_JOBS]) ? stored[STORAGE_JOBS] : [];
  let history = Array.isArray(stored[STORAGE_HISTORY]) ? stored[STORAGE_HISTORY] : [];
  const now = Date.now();
  const due = jobs.filter((job) => job.status === 'pending' && job.when <= now);
  if (!due.length) {
    await pruneOldJobs(jobs, history);
    return;
  }

  let sent = 0;
  let failed = 0;
  for (const dueJob of due) {
    const index = jobs.findIndex((job) => job.id === dueJob.id);
    if (index < 0) continue;
    jobs[index] = { ...jobs[index], status: 'processing', updatedAt: Date.now() };
    await chrome.storage.local.set({ [STORAGE_JOBS]: jobs });

    try {
      const response = dueJob.draftId ? await sendDraftById(dueJob.draftId) : await sendEmail(dueJob.email);
      jobs[index] = {
        ...jobs[index], status: 'sent', sentAt: Date.now(), gmailMessageId: response?.id || null,
        lastError: null, updatedAt: Date.now()
      };
      history.unshift(jobs[index]);
      sent++;
    } catch (error) {
      jobs[index] = { ...jobs[index], status: 'failed', lastError: friendlyError(error), updatedAt: Date.now() };
      failed++;
    }
    await chrome.storage.local.set({ [STORAGE_JOBS]: jobs, [STORAGE_HISTORY]: history.slice(0, 200) });
    await sleep(150);
  }

  if (sent || failed) {
    const lang = await currentUiLanguage();
    await chrome.notifications.create({
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon128.png'),
      title: lang === 'vi' ? 'MailBatch đã xử lý lịch gửi' : 'MailBatch schedule processed',
      message: lang === 'vi' ? `${sent} đã gửi${failed ? `, ${failed} lỗi` : ''}.` : `${sent} sent${failed ? `, ${failed} failed` : ''}.`
    });
  }
  await pruneOldJobs(jobs, history);
}

async function cancelLocalJobs(ids) {
  const set = new Set(ids);
  const { [STORAGE_JOBS]: jobs = [] } = await chrome.storage.local.get(STORAGE_JOBS);
  let cancelled = 0;
  const next = jobs.map((job) => {
    if (set.has(job.id) && job.status === 'pending') {
      cancelled++;
      return { ...job, status: 'cancelled', updatedAt: Date.now(), lastError: null };
    }
    return job;
  });
  await chrome.storage.local.set({ [STORAGE_JOBS]: next });
  return { ok: true, backend: 'local', cancelled };
}

async function retryLocalJobs(ids) {
  const set = new Set(ids);
  const { [STORAGE_JOBS]: jobs = [] } = await chrome.storage.local.get(STORAGE_JOBS);
  let retried = 0;
  const next = jobs.map((job) => {
    if (set.has(job.id) && job.status === 'failed') {
      retried++;
      return { ...job, status: 'pending', lastError: null, updatedAt: Date.now(), when: Math.max(Date.now() + 5000, Number(job.when) || 0) };
    }
    return job;
  });
  await chrome.storage.local.set({ [STORAGE_JOBS]: next });
  await processDueJobs();
  return { ok: true, backend: 'local', retried };
}

async function pruneOldJobs(jobs, history) {
  const keepAfter = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const nextJobs = jobs.filter((job) => {
    if (['pending', 'processing', 'failed'].includes(job.status)) return true;
    return (job.updatedAt || job.createdAt || 0) >= keepAfter;
  });
  const nextHistory = history.filter((job) => (job.updatedAt || job.createdAt || 0) >= keepAfter).slice(0, 200);
  await chrome.storage.local.set({ [STORAGE_JOBS]: nextJobs, [STORAGE_HISTORY]: nextHistory });
}

async function getCloudConfig() {
  const stored = await chrome.storage.local.get(STORAGE_CLOUD);
  const raw = stored[STORAGE_CLOUD];
  return {
    url: typeof raw?.url === 'string' ? raw.url : '',
    secret: typeof raw?.secret === 'string' ? raw.secret : ''
  };
}

function normalizeCloudUrl(value) {
  const url = String(value || '').trim();
  if (!url) return '';
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec(?:\?.*)?$/.test(url)) {
    throw new Error('Paste the Apps Script Web App URL ending in /exec.');
  }
  return url;
}

function assertCloudConfigured(config) {
  if (!config?.url || !config?.secret) throw new Error('Cloud scheduler is not configured. Open Schedule > Setup.');
}

async function cloudPost(config, payload) {
  assertCloudConfigured(config);
  const response = await fetch(config.url, {
    method: 'POST',
    redirect: 'follow',
    headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    body: JSON.stringify({ ...payload, secret: config.secret })
  });
  const text = await response.text();
  let data;
  try { data = JSON.parse(text); } catch { throw new Error(`Cloud scheduler returned an invalid response (HTTP ${response.status}).`); }
  if (!response.ok || !data?.ok) throw new Error(data?.error || `Cloud scheduler HTTP ${response.status}`);
  return data;
}

async function cloudAction(action, payload) {
  const config = await getCloudConfig();
  assertCloudConfigured(config);
  const response = await cloudPost(config, { action, ...payload });
  return { ok: true, backend: 'cloud', ...response };
}

async function getCloudJobs() {
  const config = await getCloudConfig();
  if (!config.url || !config.secret) return { ok: true, backend: 'cloud', configured: false, jobs: [] };
  const response = await cloudPost(config, { action: 'list' });
  return { ok: true, backend: 'cloud', configured: true, jobs: Array.isArray(response.jobs) ? response.jobs : [], quotaRemaining: response.quotaRemaining ?? null, ownerEmail: response.ownerEmail || '' };
}

async function buildMimeMessage(email) {
  const normalized = normalizeEmail(email);
  const to = cleanHeader(normalized.to);
  const subject = encodeHeader(normalized.subject || '');
  const plain = normalizeCrlf(normalized.text || stripHtml(normalized.html));
  const html = normalizeCrlf(normalized.html || escapeHtml(plain).replace(/\r\n/g, '<br>'));
  const attachments = await loadAttachments(normalized.attachments);
  const banner = await loadBanner(normalized.banner);

  const mixedBoundary = `mailbatch_mixed_${crypto.randomUUID().replace(/-/g, '')}`;
  const altBoundary = `mailbatch_alt_${crypto.randomUUID().replace(/-/g, '')}`;
  const relatedBoundary = `mailbatch_related_${crypto.randomUUID().replace(/-/g, '')}`;
  const lines = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${mixedBoundary}"`,
    '',
    `--${mixedBoundary}`
  ];

  if (banner) {
    lines.push(`Content-Type: multipart/related; boundary="${relatedBoundary}"`, '', `--${relatedBoundary}`);
  }

  lines.push(
    `Content-Type: multipart/alternative; boundary="${altBoundary}"`,
    '',
    `--${altBoundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    plain,
    `--${altBoundary}`,
    'Content-Type: text/html; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    html,
    `--${altBoundary}--`
  );

  if (banner) {
    const bytes = new Uint8Array(await banner.blob.arrayBuffer());
    const mimeType = cleanMimeType(banner.type) || 'image/png';
    const asciiName = safeAsciiFilename(banner.name || 'banner');
    const encodedName = encodeURIComponent(banner.name || 'banner').replace(/'/g, '%27');
    const cid = cleanContentId(normalized.banner?.cid || 'mailbatch-banner');
    lines.push(
      `--${relatedBoundary}`,
      `Content-Type: ${mimeType}; name="${asciiName}"`,
      'Content-Transfer-Encoding: base64',
      `Content-ID: <${cid}>`,
      `Content-Disposition: inline; filename="${asciiName}"; filename*=UTF-8''${encodedName}`,
      '',
      wrapBase64(bytesToBase64(bytes)),
      `--${relatedBoundary}--`
    );
  }

  for (const file of attachments) {
    const bytes = new Uint8Array(await file.blob.arrayBuffer());
    const b64 = wrapBase64(bytesToBase64(bytes));
    const mimeType = cleanMimeType(file.type) || 'application/octet-stream';
    const asciiName = safeAsciiFilename(file.name || 'attachment');
    const encodedName = encodeURIComponent(file.name || 'attachment').replace(/'/g, '%27');
    lines.push(
      `--${mixedBoundary}`,
      `Content-Type: ${mimeType}; name="${asciiName}"`,
      'Content-Transfer-Encoding: base64',
      `Content-Disposition: attachment; filename="${asciiName}"; filename*=UTF-8''${encodedName}`,
      '',
      b64
    );
  }
  lines.push(`--${mixedBoundary}--`, '');
  return new TextEncoder().encode(lines.join('\r\n'));
}

function normalizeEmail(email) {
  const banner = email?.banner?.id ? {
    id: String(email.banner.id), name: String(email.banner.name || 'banner'),
    type: String(email.banner.type || 'image/png'), size: Number(email.banner.size || 0),
    cid: cleanContentId(email.banner.cid || 'mailbatch-banner')
  } : null;
  return {
    to: String(email?.to || '').trim(),
    subject: String(email?.subject || ''),
    html: String(email?.html || ''),
    text: String(email?.text || ''),
    attachments: Array.isArray(email?.attachments) ? email.attachments.map((item) => ({
      id: String(item?.id || ''), name: String(item?.name || 'attachment'),
      type: String(item?.type || 'application/octet-stream'), size: Number(item?.size || 0)
    })).filter((item) => item.id) : [],
    banner
  };
}

function cleanContentId(value) {
  const clean = String(value || 'mailbatch-banner').replace(/[^A-Za-z0-9._-]/g, '');
  return clean || 'mailbatch-banner';
}

function wrapBase64(value) {
  return String(value || '').match(/.{1,76}/g)?.join('\r\n') || '';
}

function safeAsciiFilename(value) {
  const clean = String(value || 'attachment').replace(/[\r\n"]/g, '_');
  const ascii = clean.replace(/[^\x20-\x7E]/g, '_').trim();
  return ascii || 'attachment';
}

function cleanMimeType(value) {
  const clean = String(value || '').trim().toLowerCase();
  return /^[a-z0-9!#$&^_.+-]+\/[a-z0-9!#$&^_.+-]+$/.test(clean) ? clean : '';
}

function cleanHeader(value) {
  return String(value || '').replace(/[\r\n]+/g, ' ').trim();
}

function encodeHeader(value) {
  const clean = cleanHeader(value);
  if (/^[\x00-\x7F]*$/.test(clean)) return clean;
  const encoded = bytesToBase64(new TextEncoder().encode(clean));
  return `=?UTF-8?B?${encoded}?=`;
}

function normalizeCrlf(value) {
  return String(value || '').replace(/\r?\n/g, '\r\n');
}

function stripHtml(value) {
  return String(value || '')
    .replace(/<br\s*\/?\s*>/gi, '\n')
    .replace(/<\/(div|p|li|blockquote)>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;/gi, "'");
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function bytesToBase64(bytes) {
  let binary = '';
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function friendlyError(error) {
  if (!error) return 'Unknown error.';
  const message = typeof error === 'string' ? error : error.message || String(error);
  if (/OAuth2 not granted|user did not approve|The user turned off browser signin/i.test(message)) {
    return 'Google authorization is required. Click Connect and approve access.';
  }
  return message;
}
