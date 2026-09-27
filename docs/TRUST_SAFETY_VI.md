# MailBatch V1.6 - Tin cậy, bảo mật và quyền riêng tư

Developer: Nguyen Khang

## Mục tiêu bảo mật

MailBatch được thiết kế để hỗ trợ gửi email personalized hợp pháp từ chính Gmail của user, không phải để bypass bảo mật, 2FA, spam control hay giới hạn gửi của Google.

## Gmail authentication

MailBatch:

- không yêu cầu Gmail password;
- không đọc hoặc export cookie đăng nhập Gmail;
- không bypass 2-Step Verification;
- dùng Chrome Identity + Google OAuth;
- dùng Gmail OAuth scope `https://www.googleapis.com/auth/gmail.compose` để tạo draft và gửi email do user yêu cầu.

OAuth Client ID thuộc Google Cloud project mà user tự tạo khi chạy bản local/unpacked.

## Dữ liệu recipient và nội dung email

Các dữ liệu sau được lưu trong Chrome profile của extension:

- recipient table;
- keywords;
- subject/body;
- formatting;
- schedule settings;
- banner và attachment blobs trong IndexedDB;
- Cloud scheduler Web App URL + secret nếu user bật Cloud.

V1.5 không có developer-operated telemetry server, mail relay server hoặc CRM backend.

## Attachments và banner

Binary file chỉ được gửi tới Google khi user chủ động:

- tạo Gmail Draft; hoặc
- đăng ký Schedule, vì Schedule tạo Gmail Draft trước.

Banner được nhúng dạng inline MIME image. Per-recipient attachments được map bằng stable row ID.

MailBatch áp dụng pre-flight cho dung lượng và các extension bị Gmail block công khai, nhưng Gmail vẫn là lớp security cuối cùng và có thể từ chối thêm nội dung, macro, archive hoặc link mà app không thể xác định trước.

## Cloud Scheduler

Cloud Scheduler là tùy chọn. Nó không phải server của developer. Quyền host tới `script.google.com` và `script.googleusercontent.com` được khai báo optional và chỉ được yêu cầu khi user chủ động Test Cloud setup.

User tự tạo Google Apps Script trong Google account của mình. Extension đăng ký job bằng:

- Gmail draft ID;
- send timestamp;
- recipient/subject metadata để hiển thị queue;
- random secret để xác thực request.

Apps Script không cần nhận attachment binary vì attachment/banner đã nằm sẵn trong Gmail Draft.

### Web App access

Deployment dùng `Execute as: Me` và `Who has access: Anyone` để extension có thể POST từ Chrome mà không cần một OAuth flow thứ hai tới Apps Script Web App. Vì endpoint có thể truy cập bằng URL, MailBatch bắt buộc thêm random secret dài cho mỗi request.

Giữ secret riêng tư. Nếu secret bị lộ:

1. Mở Apps Script.
2. Run `resetMailBatchCloudSecret()`.
3. Copy secret mới.
4. MailBatch -> Schedule -> Cloud -> Setup -> thay secret.

## Cloud jobs tiếp tục khi Chrome đóng

Đây là mục đích của Cloud Scheduler. Sau khi job đã được đăng ký thành công, Apps Script có thể chạy dù:

- Gmail tab đóng;
- Chrome đóng;
- laptop sleep/tắt.

Vì vậy trước khi uninstall MailBatch, hãy Cancel các pending Cloud jobs nếu không muốn chúng gửi sau.

## Native Gmail Scheduled folder

Gmail UI có Schedule send, nhưng public Gmail API không document endpoint để tạo native Scheduled-folder item. V1.5 không dùng private/internal Gmail endpoint và không dùng UI bot để click nút Schedule send.

Cloud job vì thế ở Gmail Drafts cho tới lúc Apps Script gửi.

## Duplicate-send safety

V1.5 ưu tiên fail-safe hơn auto-retry mù:

- Local và Cloud đều tạo Gmail Draft trước.
- Khi gửi thành công, draft biến mất.
- Nếu một job bị gián đoạn và draft không còn tồn tại, MailBatch đánh dấu Failed thay vì tự dựng email mới rồi resend.
- Cloud scheduler có backup time trigger để re-check queue nếu một execution bị gián đoạn trước khi xử lý.

Không có hệ thống distributed transaction hoàn hảo giữa Gmail và Apps Script, nên nguyên tắc mặc định là tránh duplicate send khi trạng thái không chắc chắn.

## Apps Script quota

Google Apps Script có quota riêng cho email recipients và các service khác. Google hiện document 100 recipients/day cho consumer account và 1.500/day cho Google Workspace cho Apps Script email sending. Cloud Test cố hiển thị remaining daily recipient quota nếu Google trả được giá trị. Nếu quota hết, job có thể Failed và cần Retry sau khi quota reset.

MailBatch không tìm cách lách quota này.

## Extension updates

`UPDATE_EXISTING.bat`:

- giữ OAuth Client ID;
- giữ extension key;
- giữ Extension ID;
- giữ Chrome local storage do extension identity không đổi;
- backup các source file quan trọng trước khi copy update.

Không Remove extension cũ nếu chỉ muốn update.

## Distribution

Nếu phát hành public trên Chrome Web Store hoặc cho user ngoài nhóm test, developer cần tuân thủ Google OAuth verification, Chrome Web Store policy, Gmail restricted/sensitive scope requirements nếu áp dụng, privacy disclosure và các requirement hiện hành của Google.
