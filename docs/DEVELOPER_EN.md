# MailBatch V1.6 - Developer Guide

Developer: Nguyen Khang

## Architecture

- Manifest V3 Chrome extension.
- `content.js`: mounts the resizable MailBatch iframe in Gmail.
- `app.html`, `app.css`, `app.js`: HUD, recipient grid, keywords, compose, assets, preview, pre-flight, schedule UI.
- `service-worker.js`: Google OAuth, Gmail API, draft creation, MIME builder, local queue, Cloud Web App client.
- IndexedDB `mailbatchAttachments/files`: banner and attachment blobs.
- `cloud/CLOUD_SCHEDULER.gs`: optional user-owned Apps Script scheduler.

## Extension identity

Do not change `manifest.key` for compatible updates. The Chrome Extension OAuth Client is bound to the Extension ID. Changing the key can change the ID and break the existing OAuth Client mapping.

Fresh packages keep an OAuth Client placeholder. `UPDATE_EXISTING` reads the configured Client ID from the current install and writes it into the V1.5 manifest.

## OAuth

Current Gmail scope:

`https://www.googleapis.com/auth/gmail.compose`

V1.5 does not add Google Drive scope. Apps Script host access is declared under `optional_host_permissions`; the UI requests it only when the user presses Test in Cloud Setup.

## Data model

Each recipient row has a stable internal `__mbId`. It is not exposed as a keyword.

Per-recipient files:

`recipientAttachmentIds[rowId] -> [attachmentId...]`

Common files:

`attachmentIds -> [attachmentId...]`

Banner:

`bannerId -> attachmentId`

Metadata is cached in the UI process; binary blobs live in IndexedDB.

## MIME

`service-worker.js` builds RFC 822 MIME with:

- top-level `multipart/mixed`;
- `multipart/related` when a banner exists;
- `multipart/alternative` for text/plain + text/html;
- banner Content-ID `mailbatch-banner`;
- normal files using attachment Content-Disposition.

Messages are uploaded through the Gmail API media-upload endpoint.

## Cloud scheduling flow

1. Validate recipient rows.
2. Create every Gmail Draft first.
3. If one draft creation fails, delete drafts created for that batch and stop.
4. Build remote jobs containing `id`, `draftId`, `when`, `to`, and `subject`.
5. POST them to the Apps Script Web App using URL + secret.
6. If registration fails, clean up the new drafts.
7. Apps Script stores each job in its own Script Property to avoid the per-property value-size limit.
8. Apps Script creates a primary time trigger plus a fallback trigger.
9. When due, `GmailApp.getDraft(draftId).send()` sends the existing draft.
10. If a draft disappears during ambiguous interrupted processing, mark Failed rather than blindly resend.

## Why no native Gmail Scheduled item

The public Gmail API documents Draft and Send operations. It does not expose a documented native Schedule-send resource/operation. MailBatch does not use private Gmail endpoints or Gmail UI automation for this production path.

## Apps Script properties

V1.5 no longer serializes the full queue into one property. Each job uses:

`MAILBATCH_JOB_V1_<jobId>`

The secret uses:

`MAILBATCH_SECRET_V1`

Legacy `MAILBATCH_JOBS_V1` is migrated automatically.

## Trigger strategy

Only the earliest pending job drives scheduling:

- primary trigger at its due timestamp;
- fallback trigger 10 minutes later.

A successful handler clears MailBatch triggers and creates the next pair if pending jobs remain.

## Local scheduling

Local mode also creates Gmail Drafts immediately. The local queue stores draft IDs and sends them using Gmail API `drafts.send` when due.

Legacy raw-email local jobs are still supported for backward compatibility.

## File cleanup

`maybeDeleteAttachment` removes a blob only when it is no longer referenced by compose state and the service worker does not report a legacy pending raw-email job reference.

V1.5 draft-based Local/Cloud jobs no longer need local attachment blobs after the Gmail Draft exists.

## Pre-flight checks

Current checks include email format, unresolved keywords, blank keyword values, duplicates, missing blobs, blocked extensions, archive warnings, conservative 25 MB per-message budget, and per-recipient totals.

## Date/time

Cloud jobs use epoch milliseconds, so Apps Script project timezone cannot reinterpret the requested instant. The UI displays browser/device timezone.

Per-recipient `SendAt` parsing is strict and rejects invalid rollover dates.

## Cloud security

The Web App can be reachable by `Anyone`, but every request requires a secret. Users can rotate it using `resetMailBatchCloudSecret()`.

Apps Script should run under the same Google account as connected Gmail. MailBatch compares the returned `ownerEmail` when available.

## Known constraints

- Cloud pending queue max: 100.
- No Gmail-native Scheduled-folder item.
- Apps Script has separate daily service quotas.
- Browser local timezone is used because Gmail profile does not provide an account timezone.
- Project JSON does not include binary files.
- Gmail can block content beyond the publicly listed extensions.

See `BUG_AUDIT.md` for the V1.5 audit.

## V1.6 hyperlink safety

The rich-text sanitizer now allows `<a>` only with safe `http:`, `https:`, `mailto:`, or `tel:` destinations. Unsafe schemes such as `javascript:` are stripped. `target` and `rel` are normalized to `_blank` and `noopener noreferrer`. No OAuth scope changes are required.
