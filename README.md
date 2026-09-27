<div align="center">

# MailBatch for Gmail

**Personalized batch email inside Gmail - without Excel mail merge, VBA, or a separate email platform.**

![Version](https://img.shields.io/badge/version-1.6.0-1a73e8)
![Platform](https://img.shields.io/badge/platform-Chrome%20%2B%20Gmail-5f6368)
![Manifest](https://img.shields.io/badge/manifest-V3-34a853)
![Language](https://img.shields.io/badge/UI-English%20%7C%20Ti%E1%BA%BFng%20Vi%E1%BB%87t-fbbc04)

**Developer: Nguyen Khang**

[English](#english) · [Tiếng Việt](#tiếng-việt)

</div>

---

# English

## What MailBatch helps you do

MailBatch turns Gmail into a small spreadsheet-style personalized mail workspace.

Instead of manually opening dozens of Compose windows, replacing names one by one, attaching different files, and checking each recipient separately, you can prepare the data once and let MailBatch generate a separate Gmail message for every row.

A typical workflow looks like this:

```text
Recipient table
      ↓
{{Keywords}}
      ↓
Rich-text email template
      ↓
Preview + pre-flight check
      ↓
Gmail Drafts or scheduled delivery
```

Example:

| Name | Email | Time | MeetLink |
| --- | --- | --- | --- |
| Anna | anna@example.com | 9:00 AM | https://meet.google.com/... |
| Ben | ben@example.com | 2:30 PM | https://meet.google.com/... |

Write one template:

```text
Hi {{Name}},

Your interview is scheduled for {{Time}}.
Join here: {{MeetLink}}
```

MailBatch resolves every row independently and creates a personalized email for each person.

## Main features

- Spreadsheet-style recipient table inside Gmail
- Custom **keywords** such as `{{Name}}`, `{{Time}}`, `{{MeetLink}}`, `{{Score}}`, or any field you create
- Paste data directly from Excel or Google Sheets
- CSV import
- Rich-text editor with fonts, size, bold, italic, underline, color, alignment, lists, indent, quote, strikethrough, and clear formatting
- `Ctrl+K` / `Cmd+K` hyperlink editing for selected text
- Subject and message personalization
- Per-recipient preview before anything is created or sent
- Pre-flight validation for email addresses, missing keywords, duplicate recipients, missing files, invalid dates, and attachment limits
- Gmail Draft creation through the Gmail API
- Common attachments for the whole batch
- Different attachments for different recipients
- Optional image banner at the top of the email
- Cloud scheduling through your own Google Apps Script so the computer can be off or asleep
- Local scheduling fallback
- English / Vietnamese interface switch
- Movable MailBatch launcher chip inside Gmail
- Resizable right-side panel
- Local project persistence and update-safe extension identity

---

## Requirements

- Google Chrome 114 or newer
- Gmail or Google Workspace account
- A Google Cloud project for Gmail OAuth
- Google 2-Step Verification if Google Cloud requires it
- For cloud scheduling: a Google Apps Script project under the same Gmail account

MailBatch is currently designed to run as an unpacked Chrome extension during development.

---

# Installation - step by step

## 1. Extract the package

Extract the MailBatch ZIP to a permanent folder.

Do not run the extension directly from inside the ZIP.

The selected folder must directly contain files such as:

```text
manifest.json
app.html
app.js
content.js
service-worker.js
PATCH_OAUTH_CLIENT_ID.bat
UPDATE_EXISTING.bat
```

## 2. Load MailBatch into Chrome

1. Open Chrome.
2. Go to:

   ```text
   chrome://extensions
   ```

3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the MailBatch folder containing `manifest.json`.
6. Keep this page open for the next step.

MailBatch uses a fixed extension key so its development Extension ID stays stable across supported updates.

Current development Extension ID:

```text
dfgbjlfbiljgndbcapkncfdkodhnelcd
```

You should still use the ID shown by your own `chrome://extensions` page when configuring OAuth.

---

## 3. Create a Google Cloud project

1. Open Google Cloud Console.
2. Create a new project.
3. Suggested project name:

   ```text
   MailBatch Gmail
   ```

4. `No organization` is normal for a personal Google account.
5. Make sure the new project is selected before continuing.

If Google Cloud shows **Google Cloud access blocked**, enable 2-Step Verification / MFA on your Google account, wait for the status to update, then refresh Google Cloud.

---

## 4. Enable Gmail API

Inside the selected Google Cloud project:

1. Open **APIs & Services**.
2. Open **Library**.
3. Search for **Gmail API**.
4. Open it.
5. Click **Enable**.

MailBatch uses the Gmail API to create drafts and send messages after you explicitly authorize it.

---

## 5. Configure Google Auth Platform

1. Search Google Cloud for **Google Auth Platform**.
2. Complete the app / branding information.
3. Suggested app name:

   ```text
   MailBatch
   ```

4. Set the user support email to your Google account.
5. For a personal Gmail account, the audience is normally **External**.
6. If the OAuth app is still in **Testing**, open:

   ```text
   Google Auth Platform
   → Audience
   → Test users
   ```

7. Add the Gmail account that will use MailBatch.

If the correct Gmail account is not listed as a test user, Google can show:

```text
Error 403: access_denied
MailBatch has not completed the Google verification process
```

For personal development/testing, add your account as a Test User instead of trying to bypass Google's authorization flow.

---

## 6. Create the Chrome Extension OAuth client

1. Open:

   ```text
   Google Auth Platform
   → Clients
   ```

2. Click **Create Client**.
3. Application type: **Chrome Extension**.
4. Name: `MailBatch Gmail`.
5. Return to `chrome://extensions`.
6. Copy MailBatch's 32-character Extension ID.
7. Paste that value into **Item ID**.
8. Create the client.
9. Copy the OAuth Client ID, which ends with:

   ```text
   .apps.googleusercontent.com
   ```

Do not paste the Google Cloud Project ID into Item ID. Item ID must be the Chrome extension ID.

---

## 7. Patch the OAuth Client ID into MailBatch

Inside the MailBatch folder:

1. Run:

   ```text
   PATCH_OAUTH_CLIENT_ID.bat
   ```

2. Paste the OAuth Client ID created in Google Cloud.
3. Press Enter.
4. Return to:

   ```text
   chrome://extensions
   ```

5. Click **Reload** on MailBatch.
6. Return to Gmail and hard-refresh it:

   ```text
   Ctrl + Shift + R
   ```

If Gmail shows:

```text
Extension context invalidated
```

refresh the Gmail tab. That message usually means Chrome reloaded the extension while the old Gmail tab was still using the previous content-script context.

---

## 8. Connect Gmail

1. Open Gmail.
2. Click the floating **MailBatch** chip.
3. Click **Connect**.
4. Select the intended Google account.
5. Review Google's permission screen.
6. Approve the requested access.

MailBatch currently requests the Gmail OAuth scope:

```text
https://www.googleapis.com/auth/gmail.compose
```

This scope allows the app to manage drafts and send email after authorization.

MailBatch does **not** ask you to type your Gmail password into the extension and does not bypass Google 2-Step Verification.

---

# Using MailBatch

## 1. Add recipients

You can:

- add rows manually
- paste a table copied from Excel / Google Sheets
- import CSV

Each recipient row becomes one independent email.

## 2. Add keywords

Click **Add keyword** to create a new recipient column and template keyword.

Example:

```text
Keyword name: InterviewTime
```

becomes:

```text
{{InterviewTime}}
```

Use the same keyword in Subject or Message.

## 3. Compose the message

MailBatch supports formatted HTML email.

Available controls include:

- font family
- font size
- bold
- italic
- underline
- text color
- alignment
- numbered list
- bullet list
- indent / outdent
- quote
- strikethrough
- clear formatting

### Add a link with Ctrl+K

1. Highlight text in the Message editor.
2. Press `Ctrl+K` on Windows/Linux or `Cmd+K` on macOS.
3. Enter the URL.
4. Click **Apply**.

The same link dialog can edit or remove an existing hyperlink.

## 4. Add a banner

Use **Banner** to place an image above the message body.

Supported formats include common web image types such as PNG, JPG/JPEG, GIF, and WebP.

The banner is embedded in the email instead of requiring a separate developer-hosted image server.

## 5. Add attachments

### All emails

Use this when every recipient should receive the same file or files.

### Per person

Use this when recipients need different files.

Example:

```text
Anna → Anna_Result.pdf
Ben  → Ben_Result.pdf
Cara → Cara_Result.pdf
```

MailBatch maps personal files to the recipient's internal row ID, not only the displayed name.

Attachment limits are checked per individual email, not across the whole batch.

## 6. Preview and Check

Before creating drafts or scheduling:

1. Browse recipients with Preview.
2. Run **Check**.
3. Resolve any warning or blocked item.

Pre-flight can catch problems such as:

- invalid email address
- duplicate recipient
- unresolved keyword
- empty keyword value
- missing local file
- blocked attachment type
- oversized message attachments
- invalid schedule date/time

## 7. Create Gmail Drafts

Click **Drafts** to create personalized messages inside Gmail Drafts.

This does not send them immediately.

Draft-first is the recommended workflow when reviewing a new batch or template.

---

# Cloud scheduling - send while the computer is off

MailBatch cannot create Gmail's native **Scheduled** folder item through a documented public Gmail API operation.

Instead, Cloud mode uses your own Google Apps Script:

```text
MailBatch
   ↓
Create Gmail Draft now
   ↓
Register draft ID + send time with your Apps Script
   ↓
Google time-driven trigger
   ↓
Draft is sent at the scheduled time
```

After a Cloud job is successfully registered, Chrome can be closed and the computer can sleep or shut down.

Until send time, the message remains in **Drafts**, not Gmail's native **Scheduled** folder.

## Cloud setup - step by step

### Step 1 - Open Apps Script

Sign in to:

```text
https://script.google.com
```

Use the **same Gmail account** that is connected to MailBatch.

Create a new Apps Script project.

### Step 2 - Copy the scheduler code

In the MailBatch package, open:

```text
cloud/CLOUD_SCHEDULER.gs
```

Copy all code into the Apps Script project's `Code.gs`, replacing the default sample code.

Save the project.

### Step 3 - Generate the MailBatch Cloud secret

In Apps Script:

1. Select the function:

   ```text
   setupMailBatchCloud
   ```

2. Click **Run**.
3. Approve the Google permissions requested by the script.
4. Open the execution log.
5. Copy the value labelled:

   ```text
   MAILBATCH CLOUD SECRET
   ```

Keep this value private.

### Step 4 - Deploy as a Web app

In Apps Script:

1. Click **Deploy**.
2. Click **New deployment**.
3. Choose **Web app**.
4. Set **Execute as** to `Me`.
5. Configure access as required by the MailBatch cloud script setup.
6. Click **Deploy**.
7. Copy the Web App URL ending in:

   ```text
   /exec
   ```

Do not use a `/dev` test-deployment URL for normal MailBatch scheduling.

### Step 5 - Save the cloud configuration in MailBatch

Open:

```text
MailBatch
→ Schedule
→ Cloud
→ Setup
```

Paste:

- **Web App URL** - the `/exec` Apps Script URL
- **Secret** - the `MAILBATCH CLOUD SECRET`

Click **Save**.

### Step 6 - Test

Reopen Cloud Setup and click **Test**.

Chrome may request optional permission to contact `script.google.com` or `script.googleusercontent.com`. Approve it if you want to use Cloud scheduling.

Only schedule real mail after the Cloud test succeeds and shows the expected Gmail account.

### Step 7 - Schedule a test message

Start with one low-risk test recipient and a time a few minutes in the future.

When the queue shows:

```text
Cloud
PENDING
```

the job has been registered with Apps Script.

At that point the browser and computer no longer need to remain awake for that job.

### Important Cloud notes

- Do not manually delete a Gmail Draft that is still scheduled.
- Cancelling a MailBatch Cloud job prevents that queue job from sending, but the Gmail Draft is intentionally kept for review.
- Pending Cloud jobs can remain active even if the extension is later removed. Cancel unwanted pending jobs before uninstalling MailBatch.
- Google Apps Script and Gmail have service quotas. MailBatch does not bypass those limits.
- Keep the Cloud secret private. If it is exposed, rotate it from Apps Script and update MailBatch.

---

# Local scheduling

Local mode is a fallback scheduler using Chrome alarms.

Use it only when Chrome and the computer will remain awake.

If the device sleeps through the target time, delivery can be delayed until Chrome wakes again.

For unattended delivery while the computer is off, use **Cloud** mode.

---

# Language and interface

Use the EN / VI dropdown in the MailBatch header to switch the interface language.

MailBatch remembers the selected language locally.

The floating MailBatch launcher can also be dragged to another location inside Gmail if it covers an important control. Moving the launcher does not move the main right-side panel.

---

# Updating an existing MailBatch installation

If Gmail already connects successfully, **do not remove the old extension first**.

1. Extract the new MailBatch release.
2. Run:

   ```text
   UPDATE_EXISTING.bat
   ```

3. Select the folder currently loaded by Chrome.
4. Open `chrome://extensions`.
5. Reload MailBatch.
6. Refresh Gmail with `Ctrl+Shift+R`.

The updater is designed to preserve the existing OAuth Client ID and extension key.

You normally do not recreate the Google Cloud project, OAuth client, consent configuration, Test User, or Apps Script deployment for a normal UI/code update.

---

# Troubleshooting

### `403 access_denied`

Open:

```text
Google Auth Platform
→ Audience
→ Test users
```

Add the Gmail account you are using, save, and connect again.

### `Extension context invalidated`

The extension was reloaded while Gmail was still open. Refresh Gmail with `Ctrl+Shift+R`.

### `Google authorization is required`

Click **Connect** and complete Google's OAuth flow before creating drafts or sending.

### Cloud test fails

Check that:

- the Web App URL ends in `/exec`
- URL and Secret were saved
- the Secret matches the current Apps Script secret
- the Apps Script deployment is active
- the Apps Script owner is the same Gmail account connected to MailBatch
- Chrome granted the optional Apps Script host permission when requested

### Scheduled Cloud message fails

Check that the corresponding Gmail Draft still exists. Cloud scheduling sends a previously created draft by ID.

---

# Trust, privacy, and safety

MailBatch is designed around explicit user authorization and reviewable email creation.

- No Gmail password is collected by MailBatch.
- Google OAuth is used for Gmail authorization.
- MailBatch does not bypass 2FA.
- It does not read Gmail login cookies to impersonate a session.
- Draft creation is separate from sending.
- Cloud scheduling uses the user's own Google Apps Script deployment.
- Attachment and banner data are kept locally by the extension until required for message creation.
- Cloud scheduling uses draft identifiers and scheduling metadata rather than requiring your Gmail password.
- MailBatch does not attempt to bypass Gmail or Apps Script quotas.

The Gmail `gmail.compose` scope is classified by Google as a restricted scope. A developer who distributes MailBatch publicly may need to complete Google's OAuth verification and any applicable restricted-scope requirements.

---

# Known limitations

- Cloud scheduled messages are not shown in Gmail's native **Scheduled** folder before delivery; they remain as Drafts until Apps Script sends them.
- Local scheduling depends on an awake browser/device.
- Gmail / Apps Script service quotas still apply.
- JSON project exports intentionally do not embed large attachment/banner binaries.
- An unpacked development extension requires manual Google OAuth configuration.

---

# Project structure

```text
MailBatch/
├── manifest.json
├── app.html
├── app.css
├── app.js
├── content.js
├── service-worker.js
├── cloud/
│   └── CLOUD_SCHEDULER.gs
├── icons/
├── docs/
│   ├── README_EN.md
│   ├── README_VI.md
│   ├── TRUST_SAFETY_EN.md
│   ├── TRUST_SAFETY_VI.md
│   ├── DEVELOPER_EN.md
│   ├── DEVELOPER_VI.md
│   └── BUG_AUDIT.md
├── PATCH_OAUTH_CLIENT_ID.bat
├── UPDATE_EXISTING.bat
├── START_HERE.txt
└── sample_recipients.csv
```

---

# Developer

**Nguyen Khang**

MailBatch started from a simple practical problem: sending the same type of email to many people should not require manually duplicating messages, managing an Excel/VBA mail merge, or moving the whole workflow to a marketing platform.

The project focuses on lightweight Gmail-native workflow, personalization, review-before-send, and understandable local/cloud scheduling.

---

# Official references

- Google Workspace - Create access credentials: https://developers.google.com/workspace/guides/create-credentials
- Gmail API OAuth scopes: https://developers.google.com/workspace/gmail/api/auth/scopes
- Chrome Identity API: https://developer.chrome.com/docs/extensions/reference/api/identity
- Google Apps Script Web Apps: https://developers.google.com/apps-script/guides/web

---

# Tiếng Việt

## MailBatch giúp gì?

MailBatch biến Gmail thành một workspace gửi email cá nhân hóa theo dạng bảng dữ liệu.

Thay vì mở từng email, sửa từng tên, thay giờ, gắn link và file riêng cho từng người, bạn chỉ cần chuẩn bị dữ liệu một lần. Mỗi dòng trong bảng sẽ trở thành một email riêng.

Ví dụ:

| Name | Email | Time | MeetLink |
| --- | --- | --- | --- |
| An | an@example.com | 09:00 | https://meet.google.com/... |
| Bình | binh@example.com | 14:30 | https://meet.google.com/... |

Template:

```text
Chào {{Name}},

Buổi phỏng vấn của bạn được xếp vào {{Time}}.
Link tham gia: {{MeetLink}}
```

MailBatch sẽ tự thay keyword theo đúng dữ liệu của từng người.

### Các tính năng chính

- Bảng recipient dạng spreadsheet ngay trong Gmail
- Keyword tùy chỉnh như `{{Name}}`, `{{Time}}`, `{{MeetLink}}`
- Paste dữ liệu từ Excel / Google Sheets
- Import CSV
- Soạn rich-text
- `Ctrl+K` để gắn link vào text
- Preview từng người
- Pre-flight check trước khi tạo/gửi mail
- Tạo Gmail Draft hàng loạt
- File chung cho mọi email
- File riêng cho từng recipient
- Banner hình ảnh ở đầu email
- Cloud Schedule để gửi kể cả khi máy đã tắt/sleep
- Local Schedule dự phòng
- Chuyển toàn bộ giao diện EN / VI
- Kéo chip MailBatch sang vị trí khác trong Gmail
- Resize panel chính

---

## Cài mới - từng bước

### Bước 1 - Load extension vào Chrome

1. Giải nén ZIP MailBatch.
2. Mở:

   ```text
   chrome://extensions
   ```

3. Bật **Developer mode**.
4. Chọn **Load unpacked / Tải tiện ích đã giải nén**.
5. Chọn folder chứa trực tiếp `manifest.json`.

Không chọn file ZIP.

### Bước 2 - Tạo Google Cloud Project

1. Mở Google Cloud Console.
2. Tạo project mới, ví dụ `MailBatch Gmail`.
3. Với Gmail cá nhân, `No organization` là bình thường.
4. Chọn đúng project vừa tạo.

Nếu Google Cloud báo `Google Cloud access blocked`, hãy bật 2-Step Verification / MFA cho tài khoản Google rồi refresh lại.

### Bước 3 - Enable Gmail API

1. `APIs & Services`
2. `Library`
3. Tìm `Gmail API`
4. Bấm `Enable`

### Bước 4 - Cấu hình Google Auth Platform

1. Mở `Google Auth Platform`.
2. App name: `MailBatch`.
3. User support email: Gmail của bạn.
4. Với Gmail cá nhân, Audience thường là `External`.
5. Nếu app đang ở Testing:

   ```text
   Google Auth Platform
   → Audience
   → Test users
   ```

6. Add Gmail mà bạn sẽ dùng MailBatch.

Nếu không add Test User, Google có thể báo `403 access_denied`.

### Bước 5 - Tạo OAuth Client cho Chrome Extension

1. Vào:

   ```text
   Google Auth Platform
   → Clients
   ```

2. `Create Client`.
3. Application type: `Chrome Extension`.
4. Mở `chrome://extensions` ở tab khác.
5. Copy Extension ID của MailBatch.
6. Paste Extension ID đó vào `Item ID`.
7. Create.
8. Copy OAuth Client ID có đuôi `.apps.googleusercontent.com`.

Không dùng Google Cloud Project ID làm Item ID.

### Bước 6 - Patch OAuth Client ID

Trong folder MailBatch:

1. Chạy `PATCH_OAUTH_CLIENT_ID.bat`.
2. Paste OAuth Client ID.
3. Enter.
4. Vào `chrome://extensions`.
5. Reload MailBatch.
6. Quay lại Gmail và bấm `Ctrl+Shift+R`.

Nếu hiện `Extension context invalidated`, chỉ cần refresh lại Gmail vì tab cũ đang giữ context của extension trước khi Reload.

### Bước 7 - Kết nối Gmail

1. Mở Gmail.
2. Bấm chip MailBatch.
3. Bấm **Kết nối / Connect**.
4. Chọn đúng Google account.
5. Đọc permission screen.
6. Allow / Continue.

MailBatch dùng OAuth của Google, không yêu cầu bạn nhập Gmail password vào extension.

---

## Cách sử dụng

### Recipient

Mỗi dòng là một email riêng.

Có thể:

- Add row
- paste bảng từ Excel/Sheets
- import CSV

### Keyword

`Add keyword` tạo thêm một cột dữ liệu và đồng thời tạo keyword tương ứng.

Ví dụ:

```text
InterviewTime
```

sẽ dùng trong email dưới dạng:

```text
{{InterviewTime}}
```

### Soạn email

Message hỗ trợ font, size, bold, italic, underline, màu chữ, alignment, list, indent, quote, strikethrough và clear formatting.

Để gắn link:

1. Bôi đen text.
2. `Ctrl+K`.
3. Nhập URL.
4. Apply.

### Banner

Có thể thêm PNG/JPG/GIF/WebP ở đầu email.

### Tệp đính kèm

- **All emails**: file chung cho tất cả recipient.
- **Per person**: mỗi recipient có file riêng.

MailBatch tính giới hạn file theo từng email riêng, không cộng toàn bộ batch lại thành một email.

### Preview và Check

Nên preview từng recipient và bấm **Check** trước khi Draft hoặc Schedule.

### Drafts

`Drafts` tạo email vào Gmail Drafts để bạn kiểm tra trước. Nó không tự gửi ngay.

---

## Cloud Schedule - gửi khi máy đã tắt

Cloud mode dùng Google Apps Script của chính bạn.

Flow:

```text
MailBatch tạo Gmail Draft
        ↓
Gửi draft ID + thời gian lên Apps Script
        ↓
Google tạo time-driven trigger
        ↓
Tới giờ Apps Script gửi draft
```

Sau khi queue hiện `Cloud - PENDING`, máy có thể sleep hoặc shutdown.

Mail vẫn nằm trong **Drafts** trước giờ gửi. Đây không phải thư mục `Scheduled` native của Gmail.

### Setup Cloud từng bước

1. Mở `https://script.google.com` bằng **cùng Gmail** đang kết nối MailBatch.
2. Tạo Apps Script project mới.
3. Mở file `cloud/CLOUD_SCHEDULER.gs` trong package MailBatch.
4. Copy toàn bộ code vào `Code.gs`.
5. Save.
6. Chạy function `setupMailBatchCloud` một lần.
7. Approve permission Google yêu cầu.
8. Mở execution log và copy `MAILBATCH CLOUD SECRET`.
9. Chọn `Deploy -> New deployment -> Web app`.
10. Execute as: `Me`.
11. Deploy.
12. Copy Web App URL có đuôi `/exec`.
13. Trong MailBatch: `Schedule -> Cloud -> Setup`.
14. Paste Web App URL + Secret.
15. Save.
16. Mở Setup lại và bấm **Test**.
17. Chỉ dùng mail thật khi Test thành công và account hiển thị đúng Gmail của bạn.

Không dùng URL `/dev` của Test deployment cho workflow bình thường.

Không xóa Gmail Draft đang Pending bằng tay.

---

## Update bản mới

Nếu MailBatch hiện tại đã Connect Gmail thành công, **không nên Remove extension cũ trước**.

1. Giải nén version mới.
2. Chạy `UPDATE_EXISTING.bat`.
3. Chọn folder MailBatch hiện tại.
4. `chrome://extensions` -> Reload.
5. Gmail -> `Ctrl+Shift+R`.

Updater giữ OAuth Client ID và extension key hiện tại, nên update bình thường không cần tạo lại Google Cloud Project, OAuth Client hay Test User.

---

## Trust & Safety

- MailBatch không thu Gmail password.
- Dùng Google OAuth.
- Không bypass 2FA.
- Không đọc cookie đăng nhập Gmail để giả session.
- Draft và Send là hai bước riêng.
- Cloud schedule chạy trên Apps Script của chính người dùng.
- Không tìm cách vượt Gmail hoặc Apps Script quota.
- Secret của Cloud phải được giữ riêng tư.

Scope Gmail hiện dùng:

```text
https://www.googleapis.com/auth/gmail.compose
```

Google phân loại đây là restricted scope. Nếu phát hành MailBatch công khai cho nhiều người dùng, developer có thể cần hoàn tất quy trình OAuth verification và các yêu cầu liên quan của Google.

---

## Developer

**Nguyen Khang**

MailBatch được xây dựng để xử lý một pain point rất đơn giản: gửi cùng một loại email cho nhiều người không nên bắt người dùng phải sửa từng email thủ công, dựng Mail Merge bằng Excel/VBA, hoặc chuyển toàn bộ workflow sang một nền tảng email marketing khác.

Mục tiêu của project là giữ workflow nằm gần Gmail, dễ kiểm tra, dễ cá nhân hóa và có thể hiểu rõ email nào sẽ được tạo hoặc gửi trước khi hành động xảy ra.

