# MailBatch V1.6 - Hướng dẫn Developer

Developer: Nguyen Khang

## Kiến trúc

- Manifest V3 Chrome Extension.
- `content.js`: mount/resizable MailBatch iframe trong Gmail.
- `app.html`, `app.css`, `app.js`: HUD, recipient grid, keywords, compose, assets, preview, pre-flight, schedule UI.
- `service-worker.js`: Google OAuth, Gmail API, draft creation, MIME builder, local queue, Cloud Web App client.
- IndexedDB `mailbatchAttachments/files`: lưu banner + attachment blob.
- `cloud/CLOUD_SCHEDULER.gs`: optional Apps Script serverless scheduler do user tự deploy.

## Extension identity

Không đổi `manifest.key` cho update tương thích. OAuth Chrome Extension Client được bind vào Extension ID. Nếu key đổi, Extension ID đổi và OAuth Client hiện tại có thể không còn match.

Fresh package giữ placeholder OAuth Client ID. `UPDATE_EXISTING` lấy Client ID từ install cũ rồi ghi vào manifest V1.5.

## OAuth

Scope Gmail hiện tại:

`https://www.googleapis.com/auth/gmail.compose`

Không thêm Drive scope ở V1.5. Apps Script host access được đặt trong `optional_host_permissions`; UI chỉ request khi user bấm Test trong Cloud Setup.

## Data model

Recipient row có internal `__mbId` ổn định. Field này không hiển thị như keyword. Per-recipient attachment mapping:

`recipientAttachmentIds[rowId] -> [attachmentId...]`

Common attachments:

`attachmentIds -> [attachmentId...]`

Banner:

`bannerId -> attachmentId`

Attachment metadata cache ở `app.js`; binary blob ở IndexedDB.

## MIME

`service-worker.js` tạo RFC 822 MIME:

- `multipart/mixed` top level;
- `multipart/related` khi có banner;
- `multipart/alternative` cho text/plain + text/html;
- banner Content-ID `mailbatch-banner`;
- normal attachments dùng Content-Disposition attachment.

Email được upload qua Gmail API media upload endpoint.

## Cloud scheduling flow

1. Extension validate rows.
2. Extension tạo tất cả Gmail Drafts.
3. Nếu một draft fail, xóa các draft đã tạo trong batch đó và stop.
4. Tạo remote job gồm `id`, `draftId`, `when`, `to`, `subject`.
5. POST tới Apps Script Web App bằng URL + secret.
6. Nếu registration fail, extension cleanup các draft mới.
7. Apps Script lưu job bằng một Script Property riêng cho từng job để không đụng giới hạn value của một property.
8. Apps Script tạo primary time trigger + fallback trigger.
9. Khi due, `GmailApp.getDraft(draftId).send()`.
10. Nếu draft không tồn tại sau interrupted processing, mark Failed, không blind resend.

## Vì sao không native Gmail Scheduled

Public Gmail API model cho Draft dùng `DRAFT`, send chuyển sang `SENT`. Không có documented Scheduled resource/label operation cho native Schedule send. Không implement internal Gmail endpoint hoặc DOM bot trong production path.

## Cloud Script Properties

V1.5 không lưu toàn bộ queue trong một property JSON. Apps Script có giới hạn nhỏ trên mỗi property value, nên mỗi job được lưu tại:

`MAILBATCH_JOB_V1_<jobId>`

Secret dùng property riêng:

`MAILBATCH_SECRET_V1`

Legacy `MAILBATCH_JOBS_V1` được migrate khi script chạy.

## Trigger strategy

Chỉ schedule cho job pending sớm nhất:

- primary trigger tại due time;
- fallback trigger 10 phút sau.

Khi handler chạy thành công, nó xóa trigger MailBatch hiện tại và tạo pair cho job pending tiếp theo.

## Local scheduling

Local mode cũng tạo Gmail Draft ngay. Queue local chỉ giữ draft ID và metadata. Khi due, service worker gọi Gmail API `drafts.send`.

Legacy raw-email local jobs vẫn được hỗ trợ để không làm hỏng queue cũ.

## File cleanup

`maybeDeleteAttachment` chỉ xóa blob khi:

- ID không còn reference trong compose state;
- service worker không báo reference từ legacy local pending job.

Cloud/local V1.5 draft-based jobs không cần giữ local blob sau khi Gmail Draft đã tạo.

## Pre-flight

Check hiện tại:

- email format;
- unresolved keyword;
- empty keyword values;
- duplicate recipients;
- missing local blobs;
- common/personal Gmail-blocked extensions;
- archive warnings;
- 25 MB per-email conservative budget;
- per-row file totals.

## Date/time

Cloud nhận epoch milliseconds, nên Apps Script project timezone không làm thay đổi instant cần gửi. UI hiển thị browser/device timezone.

`parseLocalDateTime` chấp nhận format document và validate strict calendar date để tránh JS Date rollover.

## Cloud security

Web App để `Anyone` nhưng mọi request cần secret. Không log secret trong extension UI sau setup. User có thể rotate bằng `resetMailBatchCloudSecret()`.

Cloud Script phải chạy cùng Google account với Gmail đã connect. Extension compare `ownerEmail` khi Apps Script có thể trả giá trị này.

## Known constraints

- Cloud pending queue max 100 trong V1.5.
- Native Gmail Scheduled folder không được tạo.
- Apps Script có daily quotas riêng.
- Browser local timezone được dùng thay vì Gmail account timezone vì Gmail profile API không trả timezone.
- Project JSON export không bao gồm file binary.
- Gmail có thể block nội dung ngoài extension list đã biết.

Xem `BUG_AUDIT.md` cho audit V1.5.

## An toàn hyperlink V1.6

Rich-text sanitizer chỉ cho phép thẻ `<a>` với đích `http:`, `https:`, `mailto:` hoặc `tel:` an toàn. Scheme nguy hiểm như `javascript:` bị loại. `target` và `rel` được chuẩn hóa thành `_blank` và `noopener noreferrer`. Không cần thêm OAuth scope.
