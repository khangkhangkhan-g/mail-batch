# MailBatch V1.6 - Conflict and Bug Audit

## V1.5 UI and localization audit

### Language switching can leave stale dynamic text
Risk: translating only static HTML would leave recipient counts, preflight results, schedule summaries, queue states, tooltips, and connection status in the previous language.

Fix: V1.5 stores the selected language, reapplies static labels, then rerenders dynamic recipient, attachment, preview, preflight, scheduling, cloud, queue, clock, and account UI. EN and VI dictionaries are kept key-compatible.

### Cloud Setup language switch can erase credentials being typed
Risk: rebuilding the modal when the user switches English/Tiếng Việt could discard the Web App URL or Secret.

Fix: V1.5 captures the current input values and passes them into the rebuilt modal before changing the setup language.

### Draggable launcher can accidentally open the panel
Risk: a tiny pointer movement while trying to drag could be interpreted as a click.

Fix: V1.5 uses a movement threshold. A real drag saves the new launcher position; a non-drag pointer release opens the panel.

### Launcher can be dragged off-screen or stranded after a window resize
Risk: saved coordinates could become invalid when the browser window or display changes.

Fix: launcher coordinates are clamped to the current viewport on drag, restore, and resize.

### Dragging the launcher could move the main panel
Risk: coupling launcher position to panel position would make the core UI inconsistent.

Fix: launcher coordinates and panel geometry are independent. The panel remains anchored to the right and keeps its existing resize behavior.

### OAuth identity can break during an update
Risk: replacing a configured install with a fresh manifest placeholder can invalidate Gmail connection setup.

Fix: `UPDATE_EXISTING.bat` preserves the configured OAuth Client ID and fixed extension key while updating V1.5 source files.

## V1.4 scheduling, attachment, and safety audit
Developer: Nguyen Khang

This audit focuses on failures that can cause wrong recipients, wrong files, duplicate sends, missing scheduled sends, broken OAuth updates, or misleading UI state.

## Fixed in V1.4

### 1. Recipient-specific file collision
Risk: mapping a personal file only by recipient name or email can break when rows are duplicated or edited.

Fix: each row has a stable internal `__mbId`; personal attachments map to the row ID.

### 2. Per-email size miscalculation
Risk: common files may fit by themselves while common + banner + one recipient's personal files exceed Gmail's limit.

Fix: pre-flight calculates `banner + common + personal` independently for every ready row.

### 3. Gmail blocked attachment types
Risk: a batch is prepared successfully but Gmail rejects executable/security-sensitive files.

Fix: MailBatch blocks publicly documented prohibited extensions and warns about archives. Gmail remains the final security scanner.

### 4. Banner preview timing race
Risk: the preview can render before the local banner Blob URL is ready.

Fix: preview is refreshed again after the banner Blob has loaded and its object URL is created.

### 5. Orphan local files after row deletion/import
Risk: recipient-specific blobs remain in IndexedDB after their row disappears.

Fix: deleted/cleared/imported recipient mappings are detached and safely garbage-collected when they are no longer referenced.

### 6. Apps Script single-property queue overflow
Risk: Apps Script Script Properties have a small per-value limit. Serializing a large queue into one JSON property can fail well below 100 jobs.

Fix: V1.4 stores each Cloud job in its own `MAILBATCH_JOB_V1_<id>` property and migrates the old combined property if present.

### 7. Partial Cloud setup creates abandoned drafts
Risk: Gmail Draft creation succeeds but Cloud registration fails.

Fix: V1.4 deletes the drafts created by that failed schedule transaction.

### 8. Wrong Gmail account vs Apps Script account
Risk: the extension creates Drafts in account A while the Apps Script is deployed under account B.

Fix: Cloud Test and Cloud registration compare the Apps Script owner email with the connected Gmail address whenever Google exposes the owner email. A mismatch blocks the schedule and cleans up new drafts.

### 9. Duplicate send after interrupted execution
Risk: a scheduler marks a job as processing, crashes after sending, then retries blindly.

Fix: schedules are draft-based. If a stale processing job no longer has a Gmail Draft, V1.4 marks it Failed instead of reconstructing and re-sending it.

### 10. Computer sleep breaks scheduled send
Risk: Chrome alarms cannot send while the device is off/asleep.

Fix: Cloud mode uses Google Apps Script time-driven triggers. Local mode remains available but is clearly labelled as device-dependent.

### 11. Invalid JavaScript Date rollover
Risk: inputs such as `31/02/2026 9:00 AM` can silently become a March date in JavaScript.

Fix: V1.4 validates year/month/day/hour/minute after Date construction and rejects rollover values.

### 12. One missed Apps Script trigger stalls the queue
Risk: an interrupted one-time trigger can leave a pending queue without another execution.

Fix: V1.4 creates a primary trigger plus a fallback trigger 10 minutes later for the earliest pending job. A successful run replaces them with the next job's trigger pair.

### 13. Cloud schedule continues after extension removal
Risk: a user assumes uninstalling Chrome extension cancels cloud jobs.

Fix: the UI and documentation now state that registered Cloud jobs run independently. Users are instructed to cancel pending jobs before uninstalling if those messages must not send.

### 14. Unsupported business banner formats
Risk: `image/*` includes formats that many email clients do not reliably render inline, such as SVG.

Fix: V1.4 limits banners to PNG, JPG/JPEG, GIF, or WebP.


### 15. Public Cloud health endpoint leaked account metadata
Risk: an unauthenticated GET request to a Web App deployed to Anyone could reveal the Apps Script owner email or daily quota if those fields were returned.

Fix: V1.4 `doGet()` returns only generic service/version health information. Account identity and quota are returned only through authenticated POST requests that include the scheduler secret.

### 16. Large due batches can hit Apps Script execution runtime
Risk: processing a very large due batch in one Apps Script execution can approach the script runtime limit.

Fix: V1.4 processes at most 25 due emails per trigger execution, then schedules the next pending job immediately. This keeps each execution bounded while the fallback trigger remains available.

### 17. Multi-account Drafts navigation
Risk: a hard-coded Gmail `/u/0/` Drafts URL can open the wrong mailbox when several Google accounts are signed in.

Fix: Open Drafts now targets the Gmail address connected through MailBatch instead of assuming account index 0.

## Known constraints, not hidden bugs

### Gmail-native Scheduled folder
The public Gmail API does not expose a documented operation for creating Gmail-native Schedule-send items. V1.4 Cloud jobs stay in Gmail Drafts until the Apps Script sends them.

### Apps Script service quota
Google Apps Script has separate daily service quotas. A consumer account can have a lower Apps Script recipient quota than the normal Gmail web sending limit. Cloud Test reports remaining daily quota when available. MailBatch does not bypass it.

### Schedule timing is not real-time infrastructure
Google time-driven triggers and native Gmail Schedule send can execute slightly after the selected time. MailBatch stores an absolute timestamp but cannot guarantee second-level delivery.

### Dynamic Gmail security policy
Gmail can reject content beyond the static extension list, including malicious macros, password-protected archives, links, or newly blocked formats.

### Workspace-specific policy
Managed Google Workspace accounts can have different attachment and sending restrictions configured by an administrator.

### Project JSON excludes binary assets
Exported MailBatch JSON contains campaign structure but not banner/attachment blobs. This avoids enormous project files and accidental binary leakage. Re-add files after importing a project on another Chrome profile.

### Cloud secret is a credential
Anyone who obtains both the Apps Script Web App URL and its secret can call the MailBatch scheduler endpoint. Keep the secret private and rotate it if exposed.

### Managed Workspace can restrict Apps Script Web Apps
Some Google Workspace administrators can restrict Web App deployment or the `Anyone` access option. In that environment, Cloud mode may be unavailable without administrator approval. Local scheduling and Gmail Draft creation remain separate fallback workflows.

## V1.6 hyperlink audit

- Browser `Ctrl+K` conflict: intercepted only while the MailBatch message editor is focused, so Chrome's address-bar shortcut is unchanged elsewhere.
- Lost selection when opening the link dialog: the editor range is saved before focus leaves the composer and restored on Apply.
- Unsafe URL schemes: sanitizer accepts only HTTP(S), mailto, and tel links and strips unsupported link attributes.
- Link loss during save/preview: `<a>` is now part of the allowed rich-text set and rendered HTML is sanitized again after keyword substitution.
- Existing-link editing: Ctrl+K with the caret inside one anchor edits/removes that anchor instead of nesting links.
