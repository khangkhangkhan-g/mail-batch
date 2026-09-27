# MailBatch for Gmail V1.6 - Hướng dẫn tiếng Việt

Developer: Nguyen Khang

MailBatch là Chrome Extension chạy trực tiếp trong Gmail để tạo nhiều email personalized từ một bảng recipient. Mỗi dòng là một email riêng, mỗi keyword như `{{Name}}`, `{{Time}}`, `{{MeetLink}}` được thay bằng dữ liệu tương ứng của dòng đó.

## Cập nhật giao diện V1.5

### Giao diện EN / VI toàn cục
Dùng dropdown ngôn ngữ ở header MailBatch để chuyển toàn bộ giao diện ứng dụng giữa English và Tiếng Việt. Lựa chọn được lưu cục bộ và tự khôi phục ở lần mở sau. Guide và Cloud Setup cũng có nút chuyển English/Tiếng Việt riêng.

### Di chuyển chip MailBatch
Kéo chip MailBatch nổi trên Gmail đến bất kỳ vị trí nào trong vùng hiển thị nếu nó che nút khác. MailBatch sẽ nhớ vị trí chip. Bấm chip vẫn mở panel bên phải như bình thường; kéo chip không làm thay đổi vị trí panel chính.

### Cloud Setup rõ ràng hơn
Mở **Hẹn giờ -> Cloud -> Thiết lập**. Popup mới dùng layout đồng bộ với Guide và hướng dẫn lần lượt việc tạo Apps Script, copy script, tạo secret, deploy Web app, lấy URL `/exec`, Test và tạo lịch Cloud đầu tiên. Có thể đổi English/Tiếng Việt ngay trong popup này.

## Gắn liên kết trong nội dung email

Bôi đen chữ trong phần **Message** rồi nhấn `Ctrl+K` (`Cmd+K` trên macOS), hoặc bấm nút hình mắt xích trên thanh format. Nhập đường dẫn và bấm **Áp dụng**. MailBatch hỗ trợ `https://`, `http://`, địa chỉ email / `mailto:` và số điện thoại / `tel:`. Nếu con trỏ đang nằm trong một link có sẵn, `Ctrl+K` sẽ mở lại hộp thoại để sửa hoặc gỡ link. Link được giữ nguyên trong Preview, Gmail Draft và email đã hẹn giờ.


## 1. Update từ V1.0-V1.4

Nếu MailBatch trên máy đã Connect Gmail thành công, đây là cách nên dùng:

1. Không Remove extension cũ trong `chrome://extensions`.
2. Giải nén package V1.5.
3. Double-click `UPDATE_EXISTING.bat`.
4. Chọn folder MailBatch cũ mà Chrome đang Load unpacked.
5. Updater sẽ backup source quan trọng, copy code V1.5, giữ nguyên OAuth Client ID và extension key.
6. Mở `chrome://extensions`.
7. Bấm Reload trên MailBatch for Gmail.
8. Quay lại Gmail và bấm `Ctrl+Shift+R`.

Bạn không cần tạo lại Google Cloud project, Gmail API, OAuth Client, Audience hay Test User nếu Extension ID và OAuth Client hiện tại vẫn giữ nguyên.

## 2. Cài mới hoàn toàn

### Bước 1 - Load extension

1. Giải nén ZIP.
2. Mở `chrome://extensions`.
3. Bật `Chế độ dành cho nhà phát triển`.
4. Bấm `Tải tiện ích đã giải nén` / `Load unpacked`.
5. Chọn đúng folder có `manifest.json`.
6. Giữ extension này trong `chrome://extensions`, vì Extension ID của nó sẽ được dùng cho OAuth.

### Bước 2 - Bật MFA nếu Google Cloud yêu cầu

Google Cloud có thể chặn account chưa bật 2-Step Verification.

1. Nếu thấy `Google Cloud access blocked`, bấm `Enable MFA`.
2. Bật 2-Step Verification cho Google account.
3. Quay lại Google Cloud và refresh sau vài phút nếu trạng thái chưa cập nhật.

### Bước 3 - Tạo Google Cloud project

1. Mở Google Cloud Console.
2. Tạo project mới, ví dụ `MailBatch Gmail`.
3. Parent resource có thể giữ `No organization` nếu là Gmail cá nhân.
4. Chọn project vừa tạo.

### Bước 4 - Enable Gmail API

1. Trong Google Cloud, vào `APIs & Services`.
2. Mở `Library`.
3. Tìm `Gmail API`.
4. Bấm `Enable`.

### Bước 5 - Google Auth Platform

1. Tìm `Google Auth Platform` trên thanh Search của Google Cloud.
2. Hoàn tất Branding/consent screen.
3. App name: `MailBatch`.
4. User support email: Gmail của bạn.
5. Với Gmail cá nhân, Audience thường chọn `External`.
6. Khi app còn ở Testing, mở `Audience` -> `Test users` -> thêm chính Gmail sẽ dùng MailBatch.

Nếu không thêm Test User, Google có thể báo `403 access_denied` và nói app chưa hoàn tất verification.

### Bước 6 - Tạo OAuth Client cho Chrome Extension

1. `Google Auth Platform` -> `Clients`.
2. `Create OAuth client`.
3. Application type: `Chrome Extension`.
4. Mở `chrome://extensions` ở tab khác.
5. Copy `ID` của MailBatch.
6. Paste ID này vào `Item ID` trong Google Cloud.
7. Create.
8. Copy OAuth Client ID có dạng `...apps.googleusercontent.com`.

Không dùng Google Cloud Project ID thay cho Extension ID.

### Bước 7 - Patch Client ID

1. Mở folder MailBatch.
2. Chạy `PATCH_OAUTH_CLIENT_ID.bat`.
3. Paste OAuth Client ID vừa copy.
4. Enter.
5. Mở `chrome://extensions` -> Reload MailBatch.
6. Refresh Gmail bằng `Ctrl+Shift+R`.

Nếu Gmail tab cũ báo `Extension context invalidated`, chỉ cần refresh tab vì content script cũ đã bị Chrome invalidate sau khi extension reload.

### Bước 8 - Connect Gmail

1. Mở Gmail.
2. Mở panel MailBatch.
3. Bấm `Connect`.
4. Chọn đúng Google account.
5. Approve quyền Google hiển thị.

MailBatch dùng OAuth chính thức. Không nhập Gmail password vào MailBatch.

## 3. Recipients và Keywords

### Recipients

Mỗi row là một email riêng.

Ví dụ:

| Name | Email | Date | Time |
| --- | --- | --- | --- |
| Thùy | thuy@example.com | 28/09/2026 | 11:30 AM |
| Ngân | ngan@example.com | 29/09/2026 | 7:00 PM |

Bạn có thể:

- Add row
- Paste bảng từ Excel/Google Sheets
- Import CSV
- Xóa row
- Clear recipients

### Keywords

`Add keyword` tạo một column mới và đồng thời tạo keyword tương ứng.

Ví dụ tạo keyword `MeetLink` thì trong email dùng:

`{{MeetLink}}`

Template:

`Hi {{Name}}, your interview is at {{Time}}. Link: {{MeetLink}}`

MailBatch render riêng theo từng row.

## 4. Compose và format chữ

Subject và Message đều hỗ trợ keywords. Message dùng rich-text editor tích hợp.

Bạn có thể highlight một đoạn rồi chỉnh:

- font
- size
- bold
- italic
- underline
- text color
- align left/center/right
- numbered list
- bullet list
- indent/outdent
- quote
- strikethrough
- clear formatting

Nếu không highlight gì, format sẽ áp dụng cho chữ gõ tiếp theo.

## 5. Banner

Trong `Compose -> Banner`:

1. Bấm `Add banner`.
2. Chọn PNG, JPG/JPEG, GIF hoặc WebP.
3. Banner sẽ được render ở đầu email, trước body.
4. Preview hiển thị banner trước khi Draft/Schedule.
5. Bấm `Remove` để bỏ banner.

MailBatch chèn banner dạng inline MIME image bằng Content-ID, không phải link ảnh từ server của developer.

Banner cũng được tính vào budget file của từng email.

## 6. File đính kèm

### All emails

Dùng khi mọi recipient nhận cùng file.

1. `Attachments` -> `All emails`.
2. `Add files` hoặc kéo thả file.
3. Các file này sẽ xuất hiện trên mọi email trong batch.

### Per person

Dùng khi mỗi người cần file khác nhau.

1. `Attachments` -> `Per person`.
2. Chọn recipient trong dropdown.
3. Bấm `Add files`.
4. Gán file riêng cho recipient đó.
5. Chuyển sang recipient khác để gán file khác.

Ví dụ:

- Thùy -> `Thuy_Result.pdf`
- Ngân -> `Ngan_Result.pdf`
- Hân -> `Han_Result.pdf`

MailBatch dùng ID nội bộ ổn định cho từng row, không map file chỉ theo Name, nên hai người trùng tên vẫn có thể nhận file khác nhau.

### Size limit

MailBatch tính riêng cho từng email:

`Banner + Common files + Personal files của recipient`

Với Gmail cá nhân, app dùng 25 MB làm giới hạn per-email. Google Workspace có thể có policy khác do admin đặt.

MailBatch cũng chặn trước một số extension mà Gmail không cho phép và cảnh báo với archive vì Gmail có thể chặn file nguy hiểm ngay cả khi nằm trong ZIP/RAR/7z.

Project JSON không chứa binary file. Banner và attachments được lưu trong IndexedDB của Chrome profile.

## 7. Preview và Check

Trước Draft hoặc Schedule:

1. Dùng `Prev` / `Next` để xem từng recipient.
2. Bấm `Check`.

Pre-flight hiện kiểm tra:

- Email trống/sai format
- Keyword chưa có column
- Keyword value bị trống
- Recipient trùng email
- Attachment local bị mất
- File type bị Gmail block
- Archive warning
- Tổng file per-email vượt limit
- File riêng theo recipient

## 8. Drafts

`Drafts` tạo từng personalized email vào Gmail Drafts bằng Gmail API.

MailBatch không tự gửi ở action này. Đây là mode an toàn nhất khi muốn review thủ công.

Nếu batch có invalid row, app cho biết row nào bị block trước khi xử lý.

## 9. Schedule - Cloud và Local

### Vì sao không dùng trực tiếp thư mục Scheduled native của Gmail?

Gmail web có tính năng Schedule send riêng. Tuy nhiên public Gmail API hiện cung cấp Draft/Send nhưng không có API được document để tạo native Scheduled-folder item.

MailBatch V1.5 không gọi private Gmail endpoint và không dùng bot click UI Gmail để giả lập Schedule send, vì cách đó dễ vỡ khi Gmail đổi giao diện và có rủi ro click nhầm Send.

### Cloud - khuyến nghị

Cloud mode giải quyết vấn đề máy tắt:

1. MailBatch tạo Gmail Draft ngay lúc bạn bấm Schedule.
2. Extension gửi draft ID + timestamp tới Google Apps Script thuộc tài khoản của bạn.
3. Apps Script tạo time-driven trigger trên hệ thống Google.
4. Đến giờ, Apps Script gửi Gmail Draft.
5. Máy tính có thể tắt/sleep sau khi job đã đăng ký thành công.

Trong lúc chờ, email nằm trong `Drafts`, không nằm trong native `Scheduled` của Gmail.

Cloud jobs tiếp tục tồn tại bên Apps Script kể cả Chrome đóng. Nếu bạn định uninstall MailBatch và không muốn email gửi sau, hãy Cancel pending jobs trước.

### Setup Cloud một lần

1. MailBatch -> `Schedule` -> `Cloud` -> `Setup`.
2. Đăng nhập `script.google.com` bằng CÙNG Gmail đang Connect trong MailBatch.
3. Tạo project Apps Script mới.
4. Mở file `cloud/CLOUD_SCHEDULER.gs` trong package MailBatch.
5. Copy toàn bộ code vào `Code.gs`.
6. Save.
7. Chọn function `setupMailBatchCloud` -> Run.
8. Approve Gmail permission cho script.
9. Mở execution log, copy dòng `MAILBATCH CLOUD SECRET`.
10. Apps Script -> Deploy -> New deployment -> Web app.
11. Execute as: `Me`.
12. Who has access: `Anyone`.
13. Deploy.
14. Copy Web App URL kết thúc bằng `/exec`.
15. Quay lại MailBatch -> Setup.
16. Paste URL + secret -> Save.
17. Mở Setup lại -> `Test`. Chrome có thể hỏi quyền truy cập `script.google.com`/`script.googleusercontent.com`; Allow để Cloud mode gọi Web App của chính bạn.
18. Nếu Test báo đúng Gmail account, Cloud đã sẵn sàng.

Giữ secret riêng tư. Nếu bị lộ, trong Apps Script chạy `resetMailBatchCloudSecret()` rồi update secret mới trong MailBatch.

Google Apps Script có quota riêng. Tại thời điểm V1.5, Google document mức email recipients/day của Apps Script là 100 cho consumer account và 1.500 cho Google Workspace, ngoài các giới hạn Gmail liên quan. Popup Test hiển thị quota còn lại trong ngày khi Google trả được giá trị này.

### Local

Local là fallback:

- MailBatch tạo Gmail Draft ngay khi schedule.
- Chrome alarm xử lý draft khi đến giờ.
- Chrome và máy phải awake.
- Nếu máy sleep qua giờ, send có thể bị trễ tới khi máy hoạt động lại.

## 10. Schedule cùng giờ hoặc từng người

### Same time

Chọn Date, Time, AM/PM. MailBatch dùng timezone của browser/device hiện tại và chuyển thành timestamp tuyệt đối trước khi gửi tới Cloud.

### Per person

1. Chọn `Per person`.
2. Add keyword `SendAt` nếu chưa có.
3. Điền từng row theo format được hỗ trợ, ví dụ:
   - `2026-09-28 9:00 AM`
   - `28/09/2026 7:30 PM`
4. MailBatch validate nghiêm ngặt ngày giờ, không tự rollover ngày sai như 31/02.

## 11. Cancel và Retry

- Cancel pending Cloud/Local job: job không gửi nữa.
- Gmail Draft được giữ lại để bạn review hoặc xử lý thủ công.
- Retry chỉ áp dụng cho job Failed.
- Nếu MailBatch không chắc một draft bị mất là do đã gửi hay bị xóa, app/script không tự gửi lại để tránh duplicate.

## 12. Dữ liệu và export

Lưu local trong Chrome profile:

- recipient rows
- keywords
- subject/body
- formatting
- banner blob
- attachment blobs
- Cloud Web App URL + secret

Project JSON Export không nhúng banner/attachment binary và không export Cloud secret.

## 13. Lỗi thường gặp

### `403 access_denied`

Google Auth Platform -> Audience -> Test users -> add đúng Gmail -> Save -> Connect lại.

### `Extension context invalidated`

Extension vừa Reload nhưng Gmail tab đang giữ script cũ. Refresh Gmail bằng `Ctrl+Shift+R`.

### `OAuth setup required`

Fresh package chưa được patch Client ID. Chạy `PATCH_OAUTH_CLIENT_ID.bat`, sau đó Reload extension.

### Cloud Test báo account khác

Apps Script phải deploy từ cùng Gmail account đang Connect trong MailBatch. Tạo/deploy script lại bằng đúng account.

### Cloud queue không chạy

- Mở Setup -> Test.
- Kiểm tra Apps Script deployment vẫn active.
- Kiểm tra secret đúng.
- Kiểm tra Gmail Draft chưa bị xóa.
- Kiểm tra Apps Script quota.
- Refresh queue để xem Last error.

### File bị Gmail từ chối dù MailBatch cho qua

Gmail có thể scan nội dung/macro/archive và policy có thể thay đổi. Pre-flight chỉ chặn các extension công khai đã biết, không thể thay thế toàn bộ malware/security scanner của Gmail.

## 14. Trust & Safety

- Developer: Nguyen Khang
- Không yêu cầu Gmail password.
- Không đọc sign-in cookies.
- Không bypass 2FA.
- Gmail OAuth scope: `gmail.compose`.
- Không có MailBatch telemetry/backend trong V1.5.
- Cloud scheduler là Apps Script do chính user tạo và sở hữu.
- Web App URL không đủ để điều khiển queue; request còn phải có secret ngẫu nhiên.
- Không dùng private Gmail Schedule API.
- Không cố lách Gmail sending limits, attachment security hoặc account policy.

Đọc thêm `TRUST_SAFETY_VI.md` và `BUG_AUDIT.md`.
