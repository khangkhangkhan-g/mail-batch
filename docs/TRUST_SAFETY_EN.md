# MailBatch V1.6 - Trust, Security, and Privacy

Developer: Nguyen Khang

## Security goal

MailBatch is intended to support legitimate personalized email workflows from the user's own Gmail account. It is not designed to bypass Gmail security, 2FA, spam controls, or sending limits.

## Gmail authentication

MailBatch:

- does not ask for the Gmail password;
- does not read or export Gmail sign-in cookies;
- does not bypass 2-Step Verification;
- uses Chrome Identity + Google OAuth;
- uses the Gmail OAuth scope `https://www.googleapis.com/auth/gmail.compose` for drafts and user-requested sending.

For an unpacked/local install, the OAuth Client belongs to the Google Cloud project created by the user.

## Recipient and message data

The extension stores these in its Chrome profile:

- recipient table;
- keywords;
- subject/body;
- formatting;
- schedule settings;
- banner and attachment blobs in IndexedDB;
- Cloud scheduler Web App URL + secret when Cloud is enabled.

V1.5 has no developer-operated telemetry server, mail relay, or CRM backend.

## Attachments and banner

Binary files are transferred to Google only when the user explicitly creates Gmail Drafts or schedules emails, because scheduling creates the Gmail Draft first.

The banner is embedded as an inline MIME image. Per-recipient files are mapped using a stable internal row ID.

MailBatch pre-flight checks size and publicly documented Gmail-blocked extensions, but Gmail remains the final security layer and may reject additional content, macros, archives, or links.

## Cloud Scheduler

Cloud Scheduler is optional and is not a developer-owned server. Host access to `script.google.com` and `script.googleusercontent.com` is declared as optional and requested only when the user explicitly Tests Cloud setup.

The user creates the Google Apps Script project in their own Google account. MailBatch registers only:

- Gmail draft ID;
- send timestamp;
- recipient/subject metadata for queue display;
- a random secret used to authenticate requests.

Attachments do not need to be uploaded to Apps Script because they are already inside the Gmail Draft.

### Web App access

The deployment uses `Execute as: Me` and `Who has access: Anyone` so the Chrome extension can POST to the Web App without adding a second Google OAuth flow. Because the endpoint can be reached by URL, MailBatch requires a long random secret on every API request.

If the secret is exposed:

1. Open Apps Script.
2. Run `resetMailBatchCloudSecret()`.
3. Copy the new secret.
4. Replace the secret under MailBatch -> Schedule -> Cloud -> Setup.

## Cloud jobs continue after Chrome closes

This is the point of Cloud scheduling. Once a job is registered successfully, Apps Script can continue after the Gmail tab closes, Chrome closes, or the laptop sleeps/shuts down.

Cancel pending Cloud jobs before uninstalling MailBatch if they should not send later.

## Native Gmail Scheduled folder

Gmail's UI provides Schedule send, but the public Gmail API does not document an endpoint for creating the Gmail-native Scheduled item. V1.5 does not call private Gmail endpoints and does not automate Gmail UI clicks to imitate Schedule send.

Cloud jobs therefore remain in Gmail Drafts until Apps Script sends them.

## Duplicate-send safety

V1.5 prefers fail-safe behavior over blind retries:

- Local and Cloud schedules create Gmail Drafts first.
- A successfully sent draft disappears.
- If execution is interrupted and the draft no longer exists, MailBatch marks the job Failed instead of reconstructing and sending it again.
- Cloud scheduling creates a backup time trigger to re-check the queue if an earlier execution is interrupted.

There is no perfect distributed transaction across Gmail and Apps Script, so the default is to avoid duplicate sending when state is ambiguous.

## Apps Script quota

Google Apps Script has separate service quotas, including recipient quotas. Google currently documents 100 recipients/day for consumer Apps Script accounts and 1,500/day for Google Workspace for Apps Script email sending. Cloud Test displays remaining daily recipient quota when Google exposes it. A job can fail if the account reaches the applicable quota and can be retried after quota recovery.

MailBatch does not attempt to bypass those limits.

## Extension updates

`UPDATE_EXISTING.bat` preserves the OAuth Client ID, extension key, and Extension ID, and backs up important source files before copying the new build. Keep the existing extension installed for normal upgrades.

## Public distribution

If MailBatch is distributed publicly through the Chrome Web Store or to users outside a private test setup, the developer must meet current Google OAuth verification, Chrome Web Store policy, Gmail scope, privacy disclosure, and other applicable requirements.
