# Changelog

## V1.6

- Added Gmail-style hyperlink insertion in the rich-text composer.
- Highlight text and press `Ctrl+K` (or `Cmd+K` on macOS) to attach an HTTP/HTTPS, email, or phone link.
- Added a compact link button to the formatting toolbar.
- Existing links can be edited or removed from the same dialog.
- Hyperlinks survive preview, project save/load, Gmail Draft creation, attachments, and Cloud/Local scheduled sends.
- Hardened HTML sanitization to allow only safe `http:`, `https:`, `mailto:`, and `tel:` links while stripping unsafe link attributes/schemes.
- No new Gmail OAuth scopes, Google Cloud setup, or Apps Script redeploy is required.

# MailBatch for Gmail - Changelog

## V1.5
### Bilingual interface
- Added a compact global **EN / VI** selector in the MailBatch header.
- Main labels, buttons, status text, scheduling UI, validation results, queue states, tooltips, rich-text controls, and dynamic messages follow the selected language.
- Language preference is stored locally and restored on the next session.
- The launcher tooltip and panel resize accessibility labels also follow the selected language.

### Movable Gmail launcher
- The floating **MailBatch** chip can now be dragged freely within the Gmail viewport.
- A movement threshold prevents accidental panel opens while dragging.
- Position is clamped to the visible viewport and saved locally.
- Clicking or pressing Enter/Space still opens the same anchored right-side panel.

### Cloud Setup UX
- Rebuilt Cloud Setup as a Guide-style step-by-step modal.
- Added independent **English / Tiếng Việt** tabs inside Cloud Setup.
- Switching setup language preserves the typed Web App URL and Secret.
- Added clear steps for Apps Script project creation, script copy, `setupMailBatchCloud`, Web app deployment, `/exec` URL, Secret, Test, and first Cloud schedule.
- Added clearer account, quota, Draft behavior, cancellation, and security notes.
- Test now saves the entered URL/Secret before verifying the endpoint.

### Compatibility
- Same extension public key and Extension ID as prior releases.
- Same Gmail OAuth scope (`gmail.compose`).
- Existing Google Cloud OAuth setup remains reusable.
- Existing V1.4 Cloud Scheduler deployment remains compatible; no Apps Script redeploy is required solely for the V1.5 UI update.
- Use `UPDATE_EXISTING.bat` to preserve the configured OAuth Client ID and extension identity.

## V1.4
- Added per-recipient attachments.
- Added inline banner images.
- Added Google Apps Script Cloud scheduling that can continue while the computer is off.
- Added Cloud/Local queue status, cancellation, retry, quota/account checks, and stronger preflight validation.
- Added conflict/bug audit and fail-safe scheduling behavior.

## V1.3
- Added common attachments for every recipient in a batch.
- Added drag-and-drop file selection and per-email attachment size checks.
- Added MIME `multipart/mixed` Gmail draft/send support.

## V1.2
- Expanded rich-text editor fonts and Gmail-style text color palette.
- Preserved text selection when applying formatting.
- Expanded the bilingual setup/usage guide.

## V1.1
- Added resizable side panel.
- Added rich-text email formatting.
- Reworked scheduling UI with calendar/time controls and timezone display.

## V1.0
- Initial Gmail-integrated MailBatch release with recipients, custom keywords, preview, preflight, Gmail Draft creation, and local scheduling.
