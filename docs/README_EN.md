# MailBatch for Gmail V1.6 - English Guide

Developer: Nguyen Khang

MailBatch is a Chrome extension embedded in Gmail for creating personalized email batches from a recipient table. Each row becomes its own message, and keywords such as `{{Name}}`, `{{Time}}`, and `{{MeetLink}}` are resolved from that row.

## V1.5 interface update

### Global EN / VI interface
Use the language dropdown in the MailBatch header to switch the complete application UI. The choice is stored locally and restored automatically. The in-app Guide and Cloud Setup also provide explicit English/Tiếng Việt controls.

### Movable MailBatch launcher
Drag the floating MailBatch chip anywhere inside the Gmail viewport if it covers another Gmail control. MailBatch remembers the chip position. Clicking the chip still opens the normal right-side panel; dragging the chip does not move the panel itself.

### Clearer Cloud Setup
Open **Schedule -> Cloud -> Setup**. The setup modal now mirrors the Guide layout and walks through Apps Script creation, script copy, secret generation, Web app deployment, `/exec` URL, Test, and first Cloud schedule in order. Use the language tabs at the top of that modal independently of the main UI language.

## Hyperlinks in the message editor

Highlight text in **Message** and press `Ctrl+K` (`Cmd+K` on macOS), or click the chain-link button in the formatting toolbar. Enter the destination and click **Apply**. MailBatch supports `https://`, `http://`, email addresses / `mailto:`, and phone numbers / `tel:`. If the cursor is already inside a link, `Ctrl+K` opens the same dialog so the link can be edited or removed. Links are preserved in Preview, Gmail Drafts, and scheduled sends.


## 1. Update from V1.0-V1.4

If your current MailBatch already connects to Gmail successfully:

1. Do not remove the old extension from `chrome://extensions`.
2. Extract the V1.5 package.
3. Run `UPDATE_EXISTING.bat`.
4. Select the existing MailBatch folder Chrome currently loads.
5. The updater backs up important source files, copies V1.5, and preserves the OAuth Client ID and extension key.
6. Open `chrome://extensions`.
7. Click Reload on MailBatch for Gmail.
8. Return to Gmail and press `Ctrl+Shift+R`.

You normally do not recreate the Google Cloud project, Gmail API, OAuth Client, Audience, or Test User configuration as long as the Extension ID and OAuth Client remain unchanged.

## 2. Fresh installation

### Step 1 - Load the extension

1. Extract the ZIP.
2. Open `chrome://extensions`.
3. Enable Developer mode.
4. Click `Load unpacked`.
5. Choose the folder that directly contains `manifest.json`.
6. Keep the extension loaded because its Extension ID is required for OAuth.

### Step 2 - Enable MFA if Google Cloud requires it

If Google Cloud shows `Google Cloud access blocked`, enable 2-Step Verification/MFA on the Google account and then refresh Google Cloud after the status updates.

### Step 3 - Create the Google Cloud project

1. Open Google Cloud Console.
2. Create a project such as `MailBatch Gmail`.
3. `No organization` is normal for a personal Gmail account.
4. Select the new project.

### Step 4 - Enable Gmail API

1. Open `APIs & Services`.
2. Open `Library`.
3. Search for `Gmail API`.
4. Click `Enable`.

### Step 5 - Configure Google Auth Platform

1. Search Google Cloud for `Google Auth Platform`.
2. Complete the Branding/consent information.
3. App name: `MailBatch`.
4. User support email: your Gmail.
5. For a personal Gmail account, Audience is normally `External`.
6. While the app is in Testing, open `Audience` -> `Test users` and add the Gmail account that will use MailBatch.

If the account is not a Test User, Google can return `403 access_denied` and say the app has not completed verification.

### Step 6 - Create a Chrome Extension OAuth Client

1. `Google Auth Platform` -> `Clients`.
2. `Create OAuth client`.
3. Application type: `Chrome Extension`.
4. Open `chrome://extensions` in another tab.
5. Copy MailBatch's `ID`.
6. Paste that ID into the OAuth Client `Item ID`.
7. Create the client.
8. Copy the OAuth Client ID ending in `.apps.googleusercontent.com`.

Do not use the Google Cloud Project ID as the Item ID.

### Step 7 - Patch the Client ID

1. Open the MailBatch folder.
2. Run `PATCH_OAUTH_CLIENT_ID.bat`.
3. Paste the OAuth Client ID.
4. Press Enter.
5. Open `chrome://extensions` and Reload MailBatch.
6. Refresh Gmail with `Ctrl+Shift+R`.

If an old Gmail tab reports `Extension context invalidated`, refresh the tab because Chrome invalidated the old content script after the extension reload.

### Step 8 - Connect Gmail

1. Open Gmail.
2. Open MailBatch.
3. Click `Connect`.
4. Choose the correct Google account.
5. Approve the permissions Google displays.

MailBatch uses Google's OAuth flow. You never enter the Gmail password into MailBatch.

## 3. Recipients and Keywords

Each recipient row becomes one email. You can add rows manually, paste from Excel/Google Sheets, or import CSV.

`Add keyword` creates both a new recipient column and a matching template token. For example, adding `MeetLink` creates `{{MeetLink}}`.

## 4. Rich-text compose

Subject and Message both support keywords. The Message editor supports font, size, bold, italic, underline, text color, alignment, numbered/bulleted lists, indent/outdent, quote, strikethrough, and clear formatting.

Highlight text before pressing a formatting control to format only that selection. With no selection, formatting applies to text typed next.

## 5. Banner

Under `Compose -> Banner`:

1. Click `Add banner`.
2. Choose PNG, JPG/JPEG, GIF, or WebP.
3. The banner renders above the email body.
4. Preview shows it before Draft/Schedule.
5. Remove or replace it at any time.

The image is embedded as an inline MIME Content-ID image. It is not hosted on a developer server.

## 6. Attachments

### All emails

Add common files once. They are attached to every ready recipient.

### Per person

1. Open `Attachments -> Per person`.
2. Select a recipient.
3. Click `Add files`.
4. Repeat for another recipient with different files.

MailBatch maps files to a stable internal row ID instead of only the display name, so recipients with the same name can still receive different files.

### Size and security checks

MailBatch calculates the budget independently per message:

`banner + common files + that recipient's personal files`

For personal Gmail, MailBatch uses a 25 MB per-message attachment budget. Workspace administrators can configure managed-account limits.

Pre-flight also checks Gmail's publicly documented blocked extensions and warns about archives because Gmail can block restricted content even when it is inside an archive.

Project JSON exports do not embed file binaries. Banner and attachment blobs remain in extension IndexedDB.

## 7. Preview and Check

Use Prev/Next to inspect each recipient's rendered message. Run `Check` before Draft or Schedule.

Pre-flight validates email format, unresolved/missing keywords, blank required keyword values, duplicate recipients, missing local blobs, blocked file types, archive warnings, per-recipient attachments, and per-message file size.

## 8. Gmail Drafts

`Drafts` creates personalized Gmail Drafts through the Gmail API. It does not send them. This is the safest review-first workflow.

## 9. Scheduling - Cloud and Local

### Why MailBatch does not create Gmail-native Scheduled-folder items

Gmail's web UI has Schedule send. The public Gmail API documents Draft and Send operations, but does not expose a documented operation for creating the Gmail-native Scheduled item.

MailBatch does not call private Gmail endpoints or automate the Gmail UI to click Schedule send because those approaches are fragile and can create unsafe failure modes.

### Cloud - recommended

Cloud mode works when the computer is off:

1. MailBatch creates Gmail Drafts immediately.
2. It sends only draft IDs + timestamps to your own Google Apps Script.
3. Apps Script creates Google time-driven triggers.
4. At the due time, Apps Script sends the existing Gmail Draft.
5. Your computer can be off or asleep after registration succeeds.

Until send time, the message stays in `Drafts`, not Gmail's native `Scheduled` folder.

Cloud jobs continue independently after Chrome closes. Cancel pending jobs before uninstalling MailBatch if you do not want them to send later.

### One-time Cloud setup

1. MailBatch -> `Schedule` -> `Cloud` -> `Setup`.
2. Sign in to `script.google.com` using the SAME Gmail account connected to MailBatch.
3. Create a new Apps Script project.
4. Open `cloud/CLOUD_SCHEDULER.gs` from the MailBatch package.
5. Copy all code into `Code.gs` and Save.
6. Run `setupMailBatchCloud` once.
7. Approve Gmail permission for the script.
8. Open the execution log and copy `MAILBATCH CLOUD SECRET`.
9. Apps Script -> Deploy -> New deployment -> Web app.
10. Execute as: `Me`.
11. Who has access: `Anyone`.
12. Deploy and copy the Web App URL ending in `/exec`.
13. Back in MailBatch, paste URL + secret and Save.
14. Reopen Setup and click `Test`. Chrome may ask for access to `script.google.com`/`script.googleusercontent.com`; allow it so Cloud mode can call your own Web App.
15. Confirm the account shown by Test matches the Gmail account connected to MailBatch.

Keep the secret private. If it is exposed, run `resetMailBatchCloudSecret()` in Apps Script and replace the stored secret in MailBatch.

Apps Script has its own service quotas. At V1.5 release time, Google documents 100 email recipients/day for consumer Apps Script accounts and 1,500/day for Google Workspace, in addition to associated Gmail limits. Cloud Test displays remaining daily quota when Google exposes it.

### Local fallback

Local mode creates Gmail Drafts immediately, then uses Chrome alarms to send them later. Chrome and the computer must remain awake. A sleeping device can delay the send until it wakes.

## 10. Same time vs Per person

### Same time

Choose date, time, and AM/PM. MailBatch uses the browser/device timezone and converts the selection into an absolute timestamp before sending it to Cloud.

### Per person

1. Select `Per person`.
2. Add the `SendAt` keyword if it does not exist.
3. Use values such as:
   - `2026-09-28 9:00 AM`
   - `28/09/2026 7:30 PM`
4. V1.5 strictly validates date/time input and rejects rollover dates such as 31/02.

## 11. Cancel and Retry

- Cancelling a pending Cloud/Local job prevents that queue job from sending.
- The Gmail Draft remains available for manual review.
- Retry is for Failed jobs.
- If a draft disappears and MailBatch cannot determine whether it was sent or deleted, the job is marked Failed instead of being sent again blindly.

## 12. Data and exports

Stored locally in the Chrome profile:

- recipient rows
- keywords
- subject/body and formatting
- banner blob
- attachment blobs
- Cloud Web App URL + secret

Project JSON exports intentionally do not include attachment/banner binaries or the Cloud secret.

## 13. Common errors

### `403 access_denied`

Google Auth Platform -> Audience -> Test users -> add the correct Gmail -> Save -> Connect again.

### `Extension context invalidated`

Chrome reloaded the extension but Gmail still has the previous content script. Refresh Gmail with `Ctrl+Shift+R`.

### `OAuth setup required`

A fresh package still contains the placeholder Client ID. Run `PATCH_OAUTH_CLIENT_ID.bat`, then Reload the extension.

### Cloud Test shows another account

Deploy Apps Script from the same Gmail account connected to MailBatch.

### Cloud queue does not send

- Setup -> Test the Web App.
- Confirm the deployment is still active.
- Confirm the secret is correct.
- Confirm the Gmail Draft still exists.
- Check Apps Script quota.
- Refresh the queue and inspect Last error.

### Gmail rejects a file even though MailBatch did not block it

Gmail can scan file content, macros, archives, and links, and its security policy can change. MailBatch pre-flight is not a replacement for Gmail's security scanner.

## 14. Trust and Safety

- Developer: Nguyen Khang
- No Gmail password collection.
- No sign-in cookie reading.
- No 2FA bypass.
- Gmail OAuth scope: `gmail.compose`.
- No developer-operated MailBatch telemetry/backend in V1.5.
- Cloud Scheduler is an Apps Script project owned by the user.
- The Web App URL alone is insufficient to operate the queue; requests also require a random secret.
- No private Gmail Schedule API.
- No attempt to bypass Gmail sending limits, attachment security, or account policy.

See `TRUST_SAFETY_EN.md` and `BUG_AUDIT.md` for more detail.
