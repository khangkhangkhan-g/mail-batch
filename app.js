const STORAGE_STATE = 'mailbatchStateV2';
const LEGACY_STORAGE_STATE = 'mailbatchStateV1';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CORE_COLUMNS = ['Name', 'Email', 'Date', 'Time'];
const KEYWORD_RE = /{{\s*([^{}]+?)\s*}}/g;
const MAX_ATTACHMENT_BYTES = 25_000_000;
const ATTACHMENT_DB = 'mailbatchAttachments';
const ATTACHMENT_STORE = 'files';
const GMAIL_BLOCKED_EXTENSIONS = new Set(['ade','adp','apk','appx','appxbundle','bat','cab','chm','cmd','com','cpl','diagcab','diagcfg','diagpkg','dll','dmg','ex','ex_','exe','hta','img','ins','iso','isp','jar','jnlp','js','jse','lib','lnk','mde','mjs','msc','msi','msix','msixbundle','msp','mst','nsh','pif','ps1','scr','sct','shb','sys','vb','vbe','vbs','vhd','vxd','wsc','wsf','wsh','xll']);
const ARCHIVE_EXTENSIONS = new Set(['zip','tgz','gz','bz2','rar','7z']);
const BANNER_ALLOWED_EXTENSIONS = new Set(['png','jpg','jpeg','gif','webp']);
const CLOUD_HOST_ORIGINS = ['https://script.google.com/*', 'https://script.googleusercontent.com/*'];
const LANGUAGE_KEY = 'mailbatchUiLanguage';
const I18N = {
  "en": {
    "guide": "Guide",
    "guide_title": "Setup and usage guide",
    "connect": "Connect",
    "connect_title": "Connect or reconnect the Gmail account",
    "close_mailbatch": "Close MailBatch",
    "interface_language": "Interface language",
    "gmail_not_connected": "Gmail not connected",
    "oauth_setup_required": "OAuth setup required",
    "connected": "Connected: {email}",
    "recipients": "Recipients",
    "recipients_help": "Each row creates one personalized email.",
    "add_row": "Add row",
    "add_row_title": "Add one recipient row",
    "add_keyword": "Add keyword",
    "add_keyword_title": "Add a new {{Keyword}} column",
    "paste": "Paste",
    "paste_title": "Paste rows from Excel or Google Sheets",
    "import": "Import",
    "import_csv_title": "Import a CSV file",
    "clear_rows": "Clear rows",
    "compose": "Compose",
    "compose_help": "Keywords such as <code>{{Name}}</code> are replaced with values from each recipient row.",
    "subject": "Subject",
    "subject_placeholder": "Interview invitation - {{Name}}",
    "message": "Message",
    "message_formatting": "Message formatting",
    "size_small": "Small",
    "size_normal": "Normal",
    "size_large": "Large",
    "size_huge": "Huge",
    "text_color": "Text color",
    "insert_link_title": "Insert link (Ctrl+K)",
    "insert_link_modal": "Insert link",
    "link_text": "Text",
    "link_text_placeholder": "Text to display",
    "link_url": "Link",
    "link_url_placeholder": "https://example.com",
    "link_help": "Highlight text and press Ctrl+K to attach a link. HTTP, HTTPS, email, and phone links are supported.",
    "apply": "Apply",
    "remove_link": "Remove link",
    "link_url_required": "Enter a link first.",
    "link_url_invalid": "Enter a valid web, email, or phone link.",
    "link_text_required": "Enter text to display, or select text before pressing Ctrl+K.",
    "body_placeholder": "Hi {{Name}},\n\nYour interview is at {{Time}} on {{Date}}.",
    "keywords": "Keywords",
    "keywords_help": "Click a keyword to insert it.",
    "banner": "Banner",
    "banner_help": "Optional PNG/JPG/GIF/WebP shown above the email body.",
    "add_banner": "Add banner",
    "replace": "Replace",
    "remove": "Remove",
    "banner_button_title": "Add or replace the email banner",
    "no_banner": "No banner",
    "banner_alt": "Email banner preview",
    "attachments": "Attachments",
    "attachments_help": "Use common files or assign different files per recipient.",
    "all_emails": "All emails",
    "per_person": "Per person",
    "common_files_help": "These files go to every recipient.",
    "add_files": "Add files",
    "add_common_files_title": "Add common files",
    "drop_files": "Drop files here",
    "for_every_email": "for every email",
    "recipient": "Recipient",
    "add_person_files_title": "Add files for this recipient only",
    "attachment_limit_note": "The 25 MB check is calculated separately for each email: banner + common files + that recipient's files. Workspace administrators may set different limits.",
    "no_common_files": "No common files.",
    "no_personal_files": "No personal files for this recipient.",
    "add_recipient_first": "Add a recipient first.",
    "no_recipients": "No recipients",
    "every_email": "Every email",
    "this_recipient": "This recipient",
    "common_size": "{size} common",
    "personal_size": "{size} personal",
    "this_email_size": "{size} / 25 MB for this email",
    "share_files": "{count} email(s) share these files",
    "remove_file": "Remove {name}",
    "preview": "Preview",
    "preview_help": "Review the exact email before creating drafts or scheduling sends.",
    "prev": "Prev",
    "next": "Next",
    "previous_recipient": "Previous recipient",
    "next_recipient": "Next recipient",
    "preflight_initial": "Run a check before processing the batch.",
    "to": "To",
    "no_recipient_selected": "No recipient selected.",
    "empty_message": "(empty message)",
    "check": "Check",
    "check_title": "Check emails, keywords, and duplicates",
    "drafts": "Drafts",
    "drafts_title": "Create personalized drafts in Gmail",
    "open_drafts": "Open Drafts",
    "open_drafts_title": "Open the Gmail Drafts folder",
    "schedule": "Schedule",
    "schedule_help": "Choose a date and time using your browser's local time zone.",
    "local_time": "Local time",
    "same_time": "Same time",
    "date": "Date",
    "choose_date": "Choose date",
    "today": "Today",
    "time": "Time",
    "send": "Send",
    "choose_a_date": "Choose a date",
    "choose_valid_time": "Choose a valid time",
    "one_time_per_recipient": "One time per recipient",
    "sendat_help": "Use the <code>{{SendAt}}</code> keyword column. Enter values such as <code>2026-09-28 9:00 AM</code>.",
    "delivery": "Delivery",
    "cloud_not_checked": "Cloud setup not checked.",
    "cloud": "Cloud",
    "local": "Local",
    "cloud_note": "<strong>Cloud</strong> works while this computer is off. Messages stay in Gmail Drafts until send time; this is not Gmail's native Scheduled folder.",
    "setup": "Setup",
    "local_note": "<strong>Local</strong> is the fallback scheduler. Chrome and the computer must be awake; missed sends run after the device wakes.",
    "schedule_title": "Schedule all ready emails",
    "refresh": "Refresh",
    "refresh_title": "Refresh the selected schedule queue",
    "upcoming": "Upcoming",
    "nothing_scheduled": "Nothing scheduled.",
    "cancel_all": "Cancel all",
    "retry": "Retry",
    "pending_sent_failed": "Pending {pending} · Sent {sent} · Failed {failed}",
    "unknown_recipient": "(unknown recipient)",
    "unknown_time": "Unknown time",
    "cancel": "Cancel",
    "status_pending": "PENDING",
    "status_processing": "PROCESSING",
    "status_failed": "FAILED",
    "status_sent": "SENT",
    "status_cancelled": "CANCELLED",
    "status_unknown": "UNKNOWN",
    "project": "Project",
    "project_help": "Recipient data and templates stay in this Chrome profile. Cloud queue data stays in your own Apps Script when enabled.",
    "export": "Export",
    "export_title": "Export this MailBatch project as JSON",
    "import_project_title": "Import a MailBatch JSON project",
    "close": "Close",
    "confirm": "Confirm",
    "save": "Save",
    "test": "Test",
    "copy_script": "Copy script",
    "english": "English",
    "vietnamese": "Tiếng Việt",
    "no_recipients_yet": "No recipients yet. Add a row, paste a table, or import CSV.",
    "remove_keyword": "Remove {column}",
    "delete_row": "Delete row",
    "insert_keyword": "Insert {{{{{column}}}}}",
    "recipient_count": "{count} recipient(s)",
    "add_keyword_modal": "Add keyword",
    "keyword_name": "Keyword name",
    "keyword_help": "This adds a recipient column and creates the email keyword {{MeetLink}}.",
    "enter_keyword": "Enter a keyword name.",
    "keyword_chars": "Use letters, numbers, spaces, hyphens, or underscores only.",
    "keyword_exists": "That keyword already exists.",
    "name_exists": "{name} already exists.",
    "remove_keyword_confirm": "Remove the keyword \"{column}\" and its recipient data?",
    "clear_rows_confirm": "Clear all recipient rows? Keywords and the email template will stay.",
    "paste_recipients": "Paste recipients",
    "paste_data": "Paste data from Excel, Google Sheets, or CSV",
    "paste_help": "The first row becomes keyword names. Tab-separated spreadsheet data works best.",
    "paste_some_rows": "Paste some rows first.",
    "no_table_data": "No usable table data was found.",
    "imported_rows": "Imported {count} row(s).",
    "csv_needs_rows": "CSV must contain a header row and at least one data row.",
    "preflight_none": "No recipient rows are ready to process.",
    "preflight_blocked": "{ready}/{total} ready. {details}",
    "preflight_ok": "{ready}/{total} ready. No blocking issues found.",
    "rows_blocked": "{count} row(s) blocked.",
    "warnings_count": "{count} warning(s).",
    "file_missing_global": "{count} local file(s) are missing. Remove and add the file again.",
    "common_over_limit": "Banner + common files total {size}, above the 25 MB per-email limit.",
    "gmail_blocks_common": "Gmail blocks these common file type(s): {files}.",
    "archive_warning": "Archive file(s) {files} may still be blocked if they contain restricted file types.",
    "missing_keyword": "Missing keyword: {{{{{keyword}}}}.",
    "email_duplicate": "{email} appears {count} times.",
    "email_empty": "Email is empty",
    "email_invalid": "Email format is invalid",
    "keyword_empty": "{{{{{column}}}}} is empty",
    "personal_files_missing": "{count} personal attachment file(s) missing",
    "gmail_blocks_files": "Gmail blocks file type(s): {files}",
    "row_archive_warning": "Row {row} includes archive file(s); Gmail can block archives containing restricted types.",
    "files_total": "Files total {size} (25 MB max)",
    "batch_blocking": "Batch has blocking setup issue(s)",
    "no_valid_rows": "No valid recipient rows are ready.",
    "create_drafts_confirm": "Create {ready} Gmail draft(s){skip}?{warnings}",
    "skip_invalid": " and skip {count} invalid row(s)",
    "duplicate_warning_suffix": " There are {count} duplicate warning(s).",
    "working": "Working...",
    "creating_drafts": "Creating {count} draft(s)...",
    "draft_result": "{created} draft(s) created{failed}.",
    "draft_failed_suffix": ", {count} failed",
    "gmail_drafts_created": "{count} Gmail draft(s) created.",
    "draft_creation_failed": "Draft creation failed.",
    "cloud_runs_here": "Runs on this computer.",
    "cloud_setup_required": "Cloud setup required.",
    "cloud_ready": "Cloud ready{quota}.",
    "cloud_saved_test": "Cloud saved - test recommended.",
    "cloud_quota_short": " · script quota {count}",
    "cloud_setup_title": "Cloud schedule setup",
    "cloud_intro_title": "Send while your computer is off",
    "cloud_intro_copy": "MailBatch creates Gmail drafts now. Your own Google Apps Script stores the schedule and sends those drafts later, so Chrome and the computer can be closed after a Cloud job is registered. This is separate from Gmail's native Scheduled folder.",
    "cloud_section_setup": "A. One-time Google Apps Script setup",
    "cloud_section_connect": "B. Connect MailBatch",
    "cloud_section_use": "C. After setup",
    "cloud_step1_title": "Open Apps Script with the correct account",
    "cloud_step1_copy": "Go to script.google.com and sign in with the SAME Gmail account shown as Connected in MailBatch. Create a new Apps Script project. Using a different account will fail the MailBatch account check.",
    "cloud_step2_title": "Copy the MailBatch scheduler code",
    "cloud_step2_copy": "Click Copy script below. In Apps Script, open Code.gs, replace its contents with the copied code, and Save the project. The source file is also included at cloud/CLOUD_SCHEDULER.gs in this package.",
    "cloud_step3_title": "Create your private scheduler secret",
    "cloud_step3_copy": "In Apps Script, select setupMailBatchCloud from the function dropdown and click Run once. Approve the Gmail permission for your own script. Open the execution log and copy the value labelled MAILBATCH CLOUD SECRET. Keep this secret private.",
    "cloud_step4_title": "Deploy the script as a Web app",
    "cloud_step4_copy": "Click Deploy > New deployment > Web app. Set Execute as to Me. Set Who has access to Anyone. Deploy, then copy the Web app URL ending in /exec. Do not use a /dev test URL.",
    "cloud_step5_title": "Paste the URL and secret into MailBatch",
    "cloud_step5_copy": "Paste the /exec Web App URL and the MAILBATCH CLOUD SECRET into the fields below, then click Save. The URL and secret are stored locally in this Chrome profile.",
    "cloud_step6_title": "Test the connection",
    "cloud_step6_copy": "Reopen Setup and click Test. Chrome may ask MailBatch for permission to contact script.google.com and script.googleusercontent.com. Allow it. MailBatch verifies the Apps Script account and reads the remaining Apps Script email quota.",
    "cloud_step7_title": "Verify before relying on Cloud scheduling",
    "cloud_step7_copy": "After Test says Cloud scheduling is ready, schedule one test email a few minutes ahead. Confirm it appears under Upcoming with a Cloud badge. Once a Cloud job is Pending, you may close Gmail, Chrome, sleep, or shut down this computer.",
    "cloud_after1_title": "Schedule normally",
    "cloud_after1_copy": "Choose Same time or Per person, keep Delivery set to Cloud, then click Schedule. MailBatch creates Gmail Drafts immediately and registers their draft IDs with Apps Script.",
    "cloud_after2_title": "Keep Drafts until they are sent",
    "cloud_after2_copy": "Do not manually delete a draft that belongs to a Pending Cloud job. The cloud scheduler needs that Gmail Draft ID at send time.",
    "cloud_after3_title": "Cancel before uninstalling",
    "cloud_after3_copy": "Cloud jobs live in Apps Script, not in the extension. If you no longer want pending messages to send, click Cancel or Cancel all before removing MailBatch.",
    "cloud_security_title": "Security note",
    "cloud_security_copy": "The Web App URL is not treated as the only secret. Requests also require the generated MailBatch secret. Keep the secret private, deploy the Apps Script from your own Gmail account, and rotate the secret if you believe it was exposed.",
    "web_app_url": "Web App URL",
    "secret": "Secret",
    "secret_placeholder": "Paste the generated secret",
    "save_before_test": "Save the configuration before testing.",
    "testing_cloud": "Testing cloud scheduler...",
    "cloud_connected_owner": "Connected as {owner}. Cloud scheduling is ready{quota}.",
    "cloud_connected": "Connected. Cloud scheduling is ready{quota}.",
    "cloud_quota_today": " · script quota today: {count} recipient(s) remaining",
    "cloud_config_save_failed": "Could not save cloud configuration.",
    "apps_script_copied": "Apps Script copied.",
    "cloud_setup_saved": "Cloud setup saved. Use Test to verify before a real schedule.",
    "cloud_wrong_account": "Apps Script runs as {owner}, but MailBatch is connected to {gmail}. Use the same Gmail account.",
    "cloud_test_failed": "Cloud test failed.",
    "cloud_permission_needed": "Cloud scheduling needs permission to contact your Apps Script Web App.",
    "cloud_setup_first": "Set up Cloud scheduling first.",
    "cloud_press_test": "Open Cloud Setup and press Test once to grant Apps Script access.",
    "sendat_first": "Add the {{SendAt}} keyword first.",
    "invalid_sendat": "Row {row}: invalid or past {{SendAt}} value.",
    "future_date": "Choose a future date and time.",
    "schedule_blocked": "Schedule blocked",
    "schedule_specific": "{count} recipient-specific send time(s)",
    "schedule_confirm": "Schedule {count} email(s) for {detail} ({zone})?\n\n{note}",
    "cloud_schedule_note": "MailBatch will create Gmail Drafts now and register them with your Google cloud scheduler. The computer may be turned off afterward. Pending cloud jobs keep running until sent or cancelled.",
    "local_schedule_note": "MailBatch will create Gmail drafts now. Chrome and this computer must be awake at send time.",
    "scheduling_failed": "Scheduling failed.",
    "scheduled_via": "{count} email(s) scheduled via {backend}.",
    "queue_refreshed": "Queue refreshed.",
    "could_not_load_queue": "Could not load queue.",
    "cloud_not_configured": "Cloud scheduler is not configured.",
    "could_not_cancel": "Could not cancel schedule.",
    "cancelled_kept": "{count} scheduled email(s) cancelled. Gmail drafts are kept.",
    "no_pending": "No pending emails.",
    "cancel_pending_confirm": "Cancel {count} pending scheduled email(s)? Their Gmail drafts will be kept.",
    "no_failed": "No failed emails.",
    "retry_failed_confirm": "Retry {count} failed email(s)?",
    "could_not_retry": "Could not retry queue.",
    "retry_requested": "Retry requested.",
    "wait": "Wait...",
    "could_not_connect": "Could not connect Gmail.",
    "gmail_connected": "Gmail connected.",
    "sendat_ready": "{{SendAt}} is ready.",
    "guide_title_full": "MailBatch guide",
    "copy_id": "Copy ID",
    "first_setup": "A. First-time Gmail connection",
    "using_mailbatch": "B. Using MailBatch",
    "trust_safety": "C. Trust & safety",
    "oauth_configured": "An OAuth Client ID is configured in this extension.",
    "oauth_not_configured": "This package still needs its OAuth Client ID patched.",
    "extension_id_copied": "Extension ID copied.",
    "project_imported": "Project imported. Banner and attachment files are not included in JSON imports.",
    "invalid_project": "This is not a valid MailBatch project file."
  },
  "vi": {
    "guide": "Hướng dẫn",
    "guide_title": "Hướng dẫn cài đặt và sử dụng",
    "connect": "Kết nối",
    "connect_title": "Kết nối hoặc kết nối lại tài khoản Gmail",
    "close_mailbatch": "Đóng MailBatch",
    "interface_language": "Ngôn ngữ giao diện",
    "gmail_not_connected": "Chưa kết nối Gmail",
    "oauth_setup_required": "Cần thiết lập OAuth",
    "connected": "Đã kết nối: {email}",
    "recipients": "Người nhận",
    "recipients_help": "Mỗi dòng sẽ tạo một email được cá nhân hóa.",
    "add_row": "Thêm dòng",
    "add_row_title": "Thêm một người nhận",
    "add_keyword": "Thêm keyword",
    "add_keyword_title": "Thêm cột {{Keyword}} mới",
    "paste": "Dán",
    "paste_title": "Dán dữ liệu từ Excel hoặc Google Sheets",
    "import": "Nhập",
    "import_csv_title": "Nhập file CSV",
    "clear_rows": "Xóa dòng",
    "compose": "Soạn mail",
    "compose_help": "Các keyword như <code>{{Name}}</code> sẽ được thay bằng dữ liệu của từng người nhận.",
    "subject": "Tiêu đề",
    "subject_placeholder": "Lời mời phỏng vấn - {{Name}}",
    "message": "Nội dung",
    "message_formatting": "Định dạng nội dung email",
    "size_small": "Nhỏ",
    "size_normal": "Thường",
    "size_large": "Lớn",
    "size_huge": "Rất lớn",
    "text_color": "Màu chữ",
    "insert_link_title": "Chèn liên kết (Ctrl+K)",
    "insert_link_modal": "Chèn liên kết",
    "link_text": "Văn bản",
    "link_text_placeholder": "Nội dung hiển thị",
    "link_url": "Liên kết",
    "link_url_placeholder": "https://example.com",
    "link_help": "Bôi đen văn bản rồi nhấn Ctrl+K để gắn liên kết. Hỗ trợ web, email và số điện thoại.",
    "apply": "Áp dụng",
    "remove_link": "Gỡ liên kết",
    "link_url_required": "Hãy nhập liên kết trước.",
    "link_url_invalid": "Hãy nhập liên kết web, email hoặc số điện thoại hợp lệ.",
    "link_text_required": "Hãy nhập nội dung hiển thị hoặc bôi đen văn bản trước khi nhấn Ctrl+K.",
    "body_placeholder": "Chào {{Name}},\n\nBuổi phỏng vấn của bạn diễn ra lúc {{Time}} ngày {{Date}}.",
    "keywords": "Keywords",
    "keywords_help": "Bấm keyword để chèn vào vị trí con trỏ.",
    "banner": "Banner",
    "banner_help": "Ảnh PNG/JPG/GIF/WebP tùy chọn hiển thị phía trên nội dung email.",
    "add_banner": "Thêm banner",
    "replace": "Thay ảnh",
    "remove": "Xóa",
    "banner_button_title": "Thêm hoặc thay banner email",
    "no_banner": "Chưa có banner",
    "banner_alt": "Xem trước banner email",
    "attachments": "Tệp đính kèm",
    "attachments_help": "Dùng file chung hoặc gán file khác nhau cho từng người nhận.",
    "all_emails": "Tất cả",
    "per_person": "Từng người",
    "common_files_help": "Các file này sẽ gửi cho mọi người nhận.",
    "add_files": "Thêm file",
    "add_common_files_title": "Thêm file dùng chung",
    "drop_files": "Thả file vào đây",
    "for_every_email": "cho mọi email",
    "recipient": "Người nhận",
    "add_person_files_title": "Thêm file chỉ cho người nhận này",
    "attachment_limit_note": "Giới hạn 25 MB được tính riêng cho từng email: banner + file chung + file riêng của người nhận đó. Quản trị viên Workspace có thể đặt giới hạn khác.",
    "no_common_files": "Chưa có file chung.",
    "no_personal_files": "Người nhận này chưa có file riêng.",
    "add_recipient_first": "Hãy thêm người nhận trước.",
    "no_recipients": "Chưa có người nhận",
    "every_email": "Mọi email",
    "this_recipient": "Người này",
    "common_size": "{size} file chung",
    "personal_size": "{size} file riêng",
    "this_email_size": "{size} / 25 MB cho email này",
    "share_files": "{count} email dùng chung các file này",
    "remove_file": "Xóa {name}",
    "preview": "Xem trước",
    "preview_help": "Kiểm tra chính xác email trước khi tạo draft hoặc hẹn giờ gửi.",
    "prev": "Trước",
    "next": "Sau",
    "previous_recipient": "Người nhận trước",
    "next_recipient": "Người nhận tiếp theo",
    "preflight_initial": "Hãy kiểm tra trước khi xử lý cả batch.",
    "to": "Đến",
    "no_recipient_selected": "Chưa chọn người nhận.",
    "empty_message": "(nội dung trống)",
    "check": "Kiểm tra",
    "check_title": "Kiểm tra email, keyword và dữ liệu trùng",
    "drafts": "Tạo draft",
    "drafts_title": "Tạo các draft được cá nhân hóa trong Gmail",
    "open_drafts": "Mở Drafts",
    "open_drafts_title": "Mở thư mục Drafts của Gmail",
    "schedule": "Hẹn giờ",
    "schedule_help": "Chọn ngày giờ theo múi giờ hiện tại của trình duyệt.",
    "local_time": "Giờ địa phương",
    "same_time": "Cùng giờ",
    "date": "Ngày",
    "choose_date": "Chọn ngày",
    "today": "Hôm nay",
    "time": "Giờ",
    "send": "Gửi",
    "choose_a_date": "Chọn ngày",
    "choose_valid_time": "Chọn giờ hợp lệ",
    "one_time_per_recipient": "Mỗi người một thời gian",
    "sendat_help": "Dùng cột keyword <code>{{SendAt}}</code>. Nhập ví dụ <code>2026-09-28 9:00 AM</code>.",
    "delivery": "Cách gửi",
    "cloud_not_checked": "Chưa kiểm tra Cloud.",
    "cloud": "Cloud",
    "local": "Local",
    "cloud_note": "<strong>Cloud</strong> vẫn hoạt động khi máy tính tắt. Email nằm trong Gmail Drafts đến giờ gửi; đây không phải thư mục Scheduled gốc của Gmail.",
    "setup": "Thiết lập",
    "local_note": "<strong>Local</strong> là chế độ dự phòng. Chrome và máy tính phải còn thức; email bị lỡ giờ sẽ chạy sau khi thiết bị thức lại.",
    "schedule_title": "Hẹn giờ tất cả email sẵn sàng",
    "refresh": "Làm mới",
    "refresh_title": "Làm mới hàng đợi hẹn giờ",
    "upcoming": "Sắp tới",
    "nothing_scheduled": "Chưa có email hẹn giờ.",
    "cancel_all": "Hủy tất cả",
    "retry": "Thử lại",
    "pending_sent_failed": "Chờ {pending} · Đã gửi {sent} · Lỗi {failed}",
    "unknown_recipient": "(không rõ người nhận)",
    "unknown_time": "Không rõ thời gian",
    "cancel": "Hủy",
    "status_pending": "ĐANG CHỜ",
    "status_processing": "ĐANG XỬ LÝ",
    "status_failed": "LỖI",
    "status_sent": "ĐÃ GỬI",
    "status_cancelled": "ĐÃ HỦY",
    "status_unknown": "KHÔNG RÕ",
    "project": "Dự án",
    "project_help": "Dữ liệu người nhận và template nằm trong Chrome profile này. Hàng đợi Cloud nằm trong Apps Script của chính bạn khi được bật.",
    "export": "Xuất",
    "export_title": "Xuất dự án MailBatch thành JSON",
    "import_project_title": "Nhập dự án MailBatch từ JSON",
    "close": "Đóng",
    "confirm": "Xác nhận",
    "save": "Lưu",
    "test": "Kiểm tra",
    "copy_script": "Sao chép script",
    "english": "English",
    "vietnamese": "Tiếng Việt",
    "no_recipients_yet": "Chưa có người nhận. Hãy thêm dòng, dán bảng hoặc nhập CSV.",
    "remove_keyword": "Xóa {column}",
    "delete_row": "Xóa dòng",
    "insert_keyword": "Chèn {{{{{column}}}}}",
    "recipient_count": "{count} người nhận",
    "add_keyword_modal": "Thêm keyword",
    "keyword_name": "Tên keyword",
    "keyword_help": "Thao tác này thêm một cột dữ liệu người nhận và tạo keyword email {{MeetLink}}.",
    "enter_keyword": "Nhập tên keyword.",
    "keyword_chars": "Chỉ dùng chữ, số, khoảng trắng, dấu gạch nối hoặc gạch dưới.",
    "keyword_exists": "Keyword này đã tồn tại.",
    "name_exists": "{name} đã tồn tại.",
    "remove_keyword_confirm": "Xóa keyword \"{column}\" và toàn bộ dữ liệu trong cột này?",
    "clear_rows_confirm": "Xóa toàn bộ dòng người nhận? Keyword và template email vẫn được giữ.",
    "paste_recipients": "Dán người nhận",
    "paste_data": "Dán dữ liệu từ Excel, Google Sheets hoặc CSV",
    "paste_help": "Dòng đầu tiên sẽ trở thành tên keyword. Dữ liệu dạng bảng ngăn bằng tab hoạt động tốt nhất.",
    "paste_some_rows": "Hãy dán dữ liệu trước.",
    "no_table_data": "Không tìm thấy dữ liệu bảng có thể dùng.",
    "imported_rows": "Đã nhập {count} dòng.",
    "csv_needs_rows": "CSV phải có một dòng tiêu đề và ít nhất một dòng dữ liệu.",
    "preflight_none": "Không có dòng người nhận nào sẵn sàng xử lý.",
    "preflight_blocked": "{ready}/{total} sẵn sàng. {details}",
    "preflight_ok": "{ready}/{total} sẵn sàng. Không phát hiện lỗi chặn.",
    "rows_blocked": "{count} dòng bị chặn.",
    "warnings_count": "{count} cảnh báo.",
    "file_missing_global": "Thiếu {count} file cục bộ. Hãy xóa và thêm lại file.",
    "common_over_limit": "Banner + file chung tổng cộng {size}, vượt giới hạn 25 MB cho mỗi email.",
    "gmail_blocks_common": "Gmail chặn các loại file chung sau: {files}.",
    "archive_warning": "File nén {files} vẫn có thể bị Gmail chặn nếu bên trong chứa loại file bị hạn chế.",
    "missing_keyword": "Thiếu keyword: {{{{{keyword}}}}.",
    "email_duplicate": "{email} xuất hiện {count} lần.",
    "email_empty": "Email đang trống",
    "email_invalid": "Định dạng email không hợp lệ",
    "keyword_empty": "{{{{{column}}}}} đang trống",
    "personal_files_missing": "Thiếu {count} file đính kèm riêng",
    "gmail_blocks_files": "Gmail chặn loại file: {files}",
    "row_archive_warning": "Dòng {row} có file nén; Gmail có thể chặn nếu file nén chứa loại file bị hạn chế.",
    "files_total": "Tổng file {size} (tối đa 25 MB)",
    "batch_blocking": "Batch có lỗi thiết lập đang chặn",
    "no_valid_rows": "Không có dòng người nhận hợp lệ nào sẵn sàng.",
    "create_drafts_confirm": "Tạo {ready} Gmail draft{skip}?{warnings}",
    "skip_invalid": " và bỏ qua {count} dòng lỗi",
    "duplicate_warning_suffix": " Có {count} cảnh báo trùng dữ liệu.",
    "working": "Đang xử lý...",
    "creating_drafts": "Đang tạo {count} draft...",
    "draft_result": "Đã tạo {created} draft{failed}.",
    "draft_failed_suffix": ", {count} lỗi",
    "gmail_drafts_created": "Đã tạo {count} Gmail draft.",
    "draft_creation_failed": "Tạo draft thất bại.",
    "cloud_runs_here": "Chạy trên máy tính này.",
    "cloud_setup_required": "Cần thiết lập Cloud.",
    "cloud_ready": "Cloud sẵn sàng{quota}.",
    "cloud_saved_test": "Đã lưu Cloud - nên kiểm tra lại.",
    "cloud_quota_short": " · quota script {count}",
    "cloud_setup_title": "Thiết lập gửi Cloud",
    "cloud_intro_title": "Gửi ngay cả khi máy tính đã tắt",
    "cloud_intro_copy": "MailBatch tạo Gmail Drafts ngay bây giờ. Google Apps Script của chính bạn sẽ lưu lịch và gửi các draft đó sau, nên sau khi job Cloud được đăng ký, bạn có thể đóng Chrome hoặc tắt máy. Đây là hệ thống riêng, không phải thư mục Scheduled gốc của Gmail.",
    "cloud_section_setup": "A. Thiết lập Google Apps Script một lần",
    "cloud_section_connect": "B. Kết nối MailBatch",
    "cloud_section_use": "C. Sau khi thiết lập",
    "cloud_step1_title": "Mở Apps Script bằng đúng tài khoản",
    "cloud_step1_copy": "Vào script.google.com và đăng nhập bằng CÙNG tài khoản Gmail đang hiển thị là Đã kết nối trong MailBatch. Tạo một dự án Apps Script mới. Nếu dùng tài khoản khác, bước kiểm tra tài khoản của MailBatch sẽ thất bại.",
    "cloud_step2_title": "Sao chép code scheduler của MailBatch",
    "cloud_step2_copy": "Bấm Sao chép script bên dưới. Trong Apps Script, mở Code.gs, thay toàn bộ nội dung bằng code vừa sao chép rồi bấm Save. File nguồn cũng có sẵn tại cloud/CLOUD_SCHEDULER.gs trong package.",
    "cloud_step3_title": "Tạo secret riêng cho scheduler",
    "cloud_step3_copy": "Trong Apps Script, chọn hàm setupMailBatchCloud ở danh sách hàm rồi bấm Run một lần. Chấp thuận quyền Gmail cho script của chính bạn. Mở execution log và sao chép giá trị MAILBATCH CLOUD SECRET. Hãy giữ secret này riêng tư.",
    "cloud_step4_title": "Deploy script thành Web app",
    "cloud_step4_copy": "Bấm Deploy > New deployment > Web app. Execute as chọn Me. Who has access chọn Anyone. Deploy rồi sao chép Web app URL kết thúc bằng /exec. Không dùng URL thử nghiệm kết thúc bằng /dev.",
    "cloud_step5_title": "Dán URL và secret vào MailBatch",
    "cloud_step5_copy": "Dán Web App URL /exec và MAILBATCH CLOUD SECRET vào hai ô bên dưới rồi bấm Lưu. URL và secret chỉ được lưu trong Chrome profile này.",
    "cloud_step6_title": "Kiểm tra kết nối",
    "cloud_step6_copy": "Mở lại Thiết lập và bấm Kiểm tra. Chrome có thể hỏi quyền để MailBatch liên hệ script.google.com và script.googleusercontent.com. Hãy cho phép. MailBatch sẽ xác minh tài khoản Apps Script và đọc quota email Apps Script còn lại.",
    "cloud_step7_title": "Kiểm tra thử trước khi dùng thật",
    "cloud_step7_copy": "Khi bước Kiểm tra báo Cloud đã sẵn sàng, hãy hẹn một email thử trước vài phút. Xác nhận email xuất hiện trong Sắp tới với badge Cloud. Khi job Cloud ở trạng thái ĐANG CHỜ, bạn có thể đóng Gmail, Chrome, sleep hoặc tắt máy.",
    "cloud_after1_title": "Hẹn giờ như bình thường",
    "cloud_after1_copy": "Chọn Cùng giờ hoặc Từng người, giữ Cách gửi là Cloud rồi bấm Hẹn giờ. MailBatch tạo Gmail Drafts ngay và đăng ký draft ID với Apps Script.",
    "cloud_after2_title": "Giữ Draft cho tới khi gửi",
    "cloud_after2_copy": "Không xóa thủ công draft thuộc một job Cloud đang chờ. Scheduler cần Gmail Draft ID đó khi đến giờ gửi.",
    "cloud_after3_title": "Hủy trước khi gỡ extension",
    "cloud_after3_copy": "Job Cloud nằm trong Apps Script, không nằm trong extension. Nếu không muốn email đang chờ tiếp tục gửi, hãy bấm Hủy hoặc Hủy tất cả trước khi gỡ MailBatch.",
    "cloud_security_title": "Lưu ý bảo mật",
    "cloud_security_copy": "Web App URL không phải secret duy nhất. Request còn phải có MailBatch secret đã tạo. Hãy giữ secret riêng tư, deploy Apps Script từ chính tài khoản Gmail của bạn và tạo secret mới nếu nghi ngờ đã bị lộ.",
    "web_app_url": "Web App URL",
    "secret": "Secret",
    "secret_placeholder": "Dán secret đã tạo",
    "save_before_test": "Hãy lưu cấu hình trước khi kiểm tra.",
    "testing_cloud": "Đang kiểm tra Cloud scheduler...",
    "cloud_connected_owner": "Đã kết nối bằng {owner}. Cloud scheduling đã sẵn sàng{quota}.",
    "cloud_connected": "Đã kết nối. Cloud scheduling đã sẵn sàng{quota}.",
    "cloud_quota_today": " · quota script hôm nay còn {count} người nhận",
    "cloud_config_save_failed": "Không thể lưu cấu hình Cloud.",
    "apps_script_copied": "Đã sao chép Apps Script.",
    "cloud_setup_saved": "Đã lưu thiết lập Cloud. Hãy bấm Kiểm tra trước khi hẹn giờ thật.",
    "cloud_wrong_account": "Apps Script đang chạy bằng {owner}, nhưng MailBatch kết nối với {gmail}. Hãy dùng cùng một tài khoản Gmail.",
    "cloud_test_failed": "Kiểm tra Cloud thất bại.",
    "cloud_permission_needed": "Cloud scheduling cần quyền liên hệ Web App Apps Script của bạn.",
    "cloud_setup_first": "Hãy thiết lập Cloud scheduling trước.",
    "cloud_press_test": "Mở Thiết lập Cloud và bấm Kiểm tra một lần để cấp quyền Apps Script.",
    "sendat_first": "Hãy thêm keyword {{SendAt}} trước.",
    "invalid_sendat": "Dòng {row}: giá trị {{SendAt}} không hợp lệ hoặc đã qua.",
    "future_date": "Chọn ngày giờ trong tương lai.",
    "schedule_blocked": "Không thể hẹn giờ",
    "schedule_specific": "{count} thời gian gửi riêng theo người nhận",
    "schedule_confirm": "Hẹn {count} email cho {detail} ({zone})?\n\n{note}",
    "cloud_schedule_note": "MailBatch sẽ tạo Gmail Drafts ngay và đăng ký chúng với Google cloud scheduler của bạn. Sau đó có thể tắt máy. Các job Cloud đang chờ vẫn chạy cho đến khi được gửi hoặc bị hủy.",
    "local_schedule_note": "MailBatch sẽ tạo Gmail draft ngay. Chrome và máy tính phải còn thức vào thời điểm gửi.",
    "scheduling_failed": "Hẹn giờ thất bại.",
    "scheduled_via": "Đã hẹn {count} email qua {backend}.",
    "queue_refreshed": "Đã làm mới hàng đợi.",
    "could_not_load_queue": "Không thể tải hàng đợi.",
    "cloud_not_configured": "Cloud scheduler chưa được cấu hình.",
    "could_not_cancel": "Không thể hủy lịch.",
    "cancelled_kept": "Đã hủy {count} email hẹn giờ. Gmail drafts vẫn được giữ.",
    "no_pending": "Không có email đang chờ.",
    "cancel_pending_confirm": "Hủy {count} email đang chờ? Gmail drafts của chúng vẫn được giữ.",
    "no_failed": "Không có email lỗi.",
    "retry_failed_confirm": "Thử lại {count} email lỗi?",
    "could_not_retry": "Không thể thử lại hàng đợi.",
    "retry_requested": "Đã yêu cầu thử lại.",
    "wait": "Chờ...",
    "could_not_connect": "Không thể kết nối Gmail.",
    "gmail_connected": "Đã kết nối Gmail.",
    "sendat_ready": "{{SendAt}} đã sẵn sàng.",
    "guide_title_full": "Hướng dẫn MailBatch",
    "copy_id": "Sao chép ID",
    "first_setup": "A. Kết nối Gmail lần đầu",
    "using_mailbatch": "B. Cách dùng MailBatch",
    "trust_safety": "C. Tin cậy & an toàn",
    "oauth_configured": "OAuth Client ID đã có trong extension này.",
    "oauth_not_configured": "Package này vẫn cần patch OAuth Client ID.",
    "extension_id_copied": "Đã sao chép Extension ID.",
    "project_imported": "Đã nhập dự án. Banner và file đính kèm không nằm trong file JSON.",
    "invalid_project": "Đây không phải file dự án MailBatch hợp lệ."
  }
};
let uiLang = 'en';
let lastQueueJobs = [];
let lastQueueBackend = 'cloud';

function t(key, params = {}) {
  const table = I18N[uiLang] || I18N.en;
  let value = table[key] ?? I18N.en[key] ?? key;
  return String(value).replace(/\{(\w+)\}/g, (_m, name) => Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : `{${name}}`);
}

function appLocale() { return uiLang === 'vi' ? 'vi-VN' : 'en-US'; }

async function loadLanguage() {
  try {
    const stored = await chrome.storage.local.get(LANGUAGE_KEY);
    const saved = stored[LANGUAGE_KEY];
    uiLang = saved === 'vi' || saved === 'en' ? saved : (String(navigator.language || '').toLowerCase().startsWith('vi') ? 'vi' : 'en');
  } catch { uiLang = String(navigator.language || '').toLowerCase().startsWith('vi') ? 'vi' : 'en'; }
}

function applyStaticLanguage() {
  document.documentElement.lang = uiLang === 'vi' ? 'vi' : 'en';
  if ($('languageSelect')) $('languageSelect').value = uiLang;
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach((el) => { el.innerHTML = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-title]').forEach((el) => { el.title = t(el.dataset.i18nTitle); });
  document.querySelectorAll('[data-i18n-aria]').forEach((el) => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  document.querySelectorAll('[data-i18n-data-placeholder]').forEach((el) => { el.dataset.placeholder = t(el.dataset.i18nDataPlaceholder); });
  const languageSelect = $('languageSelect');
  if (languageSelect) { languageSelect.title = t('interface_language'); languageSelect.setAttribute('aria-label', t('interface_language')); }
  const weekday = uiLang === 'vi' ? ['CN','T2','T3','T4','T5','T6','T7'] : ['Su','Mo','Tu','We','Th','Fr','Sa'];
  document.querySelectorAll('.calendar-weekdays span').forEach((el, i) => { if (weekday[i]) el.textContent = weekday[i]; });
  const labels = uiLang === 'vi' ? {
    fontSelect: 'Phông chữ', sizeSelect: 'Cỡ chữ', textColorBtn: 'Màu chữ',
    calendarPrevBtn: 'Tháng trước', calendarNextBtn: 'Tháng sau', datePickerBtn: 'Chọn ngày gửi',
    hourSelect: 'Giờ', minuteSelect: 'Phút', attachmentDropZone: 'Thả file chung vào đây hoặc chọn file'
  } : {
    fontSelect: 'Font', sizeSelect: 'Text size', textColorBtn: 'Text color',
    calendarPrevBtn: 'Previous month', calendarNextBtn: 'Next month', datePickerBtn: 'Choose send date',
    hourSelect: 'Hour', minuteSelect: 'Minute', attachmentDropZone: 'Drop common files here or choose files'
  };
  for (const [id, label] of Object.entries(labels)) {
    const el = $(id); if (!el) continue; el.title = label; el.setAttribute('aria-label', label);
  }
  const formatLabels = uiLang === 'vi' ? {
    bold: 'Đậm', italic: 'Nghiêng', underline: 'Gạch chân', justifyLeft: 'Căn trái', justifyCenter: 'Căn giữa', justifyRight: 'Căn phải',
    insertOrderedList: 'Danh sách số', insertUnorderedList: 'Danh sách chấm', outdent: 'Giảm thụt lề', indent: 'Tăng thụt lề', formatBlock: 'Trích dẫn', strikeThrough: 'Gạch ngang', removeFormat: 'Xóa định dạng'
  } : {
    bold: 'Bold', italic: 'Italic', underline: 'Underline', justifyLeft: 'Align left', justifyCenter: 'Align center', justifyRight: 'Align right',
    insertOrderedList: 'Numbered list', insertUnorderedList: 'Bulleted list', outdent: 'Outdent', indent: 'Indent', formatBlock: 'Quote', strikeThrough: 'Strikethrough', removeFormat: 'Clear formatting'
  };
  document.querySelectorAll('.format-btn[data-cmd]').forEach((el) => {
    const label = formatLabels[el.dataset.cmd]; if (!label) return; el.title = label; el.setAttribute('aria-label', label);
  });
}

async function changeLanguage(lang) {
  uiLang = lang === 'vi' ? 'vi' : 'en';
  await chrome.storage.local.set({ [LANGUAGE_KEY]: uiLang });
  applyStaticLanguage();
  renderGrid();
  renderKeywords();
  renderRecipientCount();
  renderAttachments();
  renderPersonAttachments();
  renderBanner();
  updatePreview();
  if (!$('preflightSummary').classList.contains('neutral')) renderPreflight(preflight());
  updateScheduleSummary();
  renderCalendar();
  updateCloudStatus();
  renderQueue(lastQueueJobs, lastQueueBackend);
  updateLocalClock();
  if (connectedGmail) setAccount(connectedGmail); else setDisconnected(lastDisconnectReason);
  parent.postMessage({ type: 'MAILBATCH_LANGUAGE', language: uiLang }, '*');
}

const TEXT_COLORS = [
  '#000000','#202124','#3c4043','#5f6368','#80868b','#9aa0a6','#bdc1c6','#dadce0','#f1f3f4','#ffffff',
  '#cc0000','#ff0000','#ff9900','#ffff00','#00ff00','#00ffff','#4a86e8','#0000ff','#9900ff','#ff00ff',
  '#f4cccc','#fce5cd','#fff2cc','#d9ead3','#d0e0e3','#c9daf8','#cfe2f3','#d9d2e9','#ead1dc','#f4cccc',
  '#ea9999','#f9cb9c','#ffe599','#b6d7a8','#a2c4c9','#9fc5e8','#a4c2f4','#b4a7d6','#d5a6bd','#ea9999',
  '#e06666','#f6b26b','#ffd966','#93c47d','#76a5af','#6fa8dc','#6d9eeb','#8e7cc3','#c27ba0','#e06666',
  '#990000','#b45f06','#bf9000','#38761d','#134f5c','#0b5394','#1155cc','#351c75','#741b47','#660000'
];

let state = {
  columns: [...CORE_COLUMNS],
  rows: [emptyRow(CORE_COLUMNS)],
  subject: '',
  bodyHtml: '',
  scheduleDate: '',
  scheduleHour: '8',
  scheduleMinute: '00',
  schedulePeriod: 'AM',
  perPersonSchedule: false,
  scheduleBackend: 'cloud',
  attachmentIds: [],
  recipientAttachmentIds: {},
  bannerId: ''
};

let previewIndex = 0;
let saveTimer = null;
let modalConfirmHandler = null;
let lastEditor = 'body';
let savedBodyRange = null;
let calendarView = new Date();
let queueTimer = null;
let clockTimer = null;
let attachmentRecords = [];
let attachmentMetaCache = new Map();
let personAttachmentRecords = [];
let bannerRecord = null;
let bannerObjectUrl = '';
let selectedPersonRowId = null;
let cloudConfig = { url: '', secret: '' };
let cloudReachable = false;
let cloudQuotaRemaining = null;
let connectedGmail = '';
let lastDisconnectReason = '';

const $ = (id) => document.getElementById(id);

document.addEventListener('DOMContentLoaded', init);

async function init() {
  await loadLanguage();
  applyStaticLanguage();
  populateTimeControls();
  populateTextColorPalette();
  bindStaticEvents();
  await loadState();
  ensureScheduleDefaults();
  ensureRowIds();
  renderAll();
  await refreshAttachments();
  await refreshBanner();
  await refreshPersonAttachments();
  await loadCloudConfig();
  await checkAccount();
  await refreshQueue(true);
  updateLocalClock();
  queueTimer = setInterval(() => refreshQueue(true), 15000);
  clockTimer = setInterval(updateLocalClock, 1000);
}

function bindStaticEvents() {
  $('closeBtn').addEventListener('click', () => parent.postMessage({ type: 'MAILBATCH_CLOSE' }, '*'));
  $('languageSelect').addEventListener('change', () => changeLanguage($('languageSelect').value));
  $('guideBtn').addEventListener('click', () => showGuideModal(uiLang));
  $('connectBtn').addEventListener('click', connectGmail);
  $('addRowBtn').addEventListener('click', addRow);
  $('addKeywordBtn').addEventListener('click', openAddKeywordModal);
  $('clearRowsBtn').addEventListener('click', clearRows);
  $('importBtn').addEventListener('click', () => $('csvInput').click());
  $('csvInput').addEventListener('change', importCsvFile);
  $('pasteBtn').addEventListener('click', openPasteModal);
  $('addAttachmentBtn').addEventListener('click', () => $('attachmentInput').click());
  $('attachmentInput').addEventListener('change', async (event) => {
    const files = [...(event.target.files || [])];
    event.target.value = '';
    if (files.length) await addAttachmentFiles(files);
  });
  const dropZone = $('attachmentDropZone');
  dropZone.addEventListener('click', () => $('attachmentInput').click());
  dropZone.addEventListener('keydown', (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); $('attachmentInput').click(); } });
  for (const type of ['dragenter','dragover']) dropZone.addEventListener(type, (event) => { event.preventDefault(); dropZone.classList.add('dragging'); });
  for (const type of ['dragleave','drop']) dropZone.addEventListener(type, (event) => { event.preventDefault(); dropZone.classList.remove('dragging'); });
  dropZone.addEventListener('drop', async (event) => { const files = [...(event.dataTransfer?.files || [])]; if (files.length) await addAttachmentFiles(files); });

  $('commonAttachmentsTab').addEventListener('click', () => setAttachmentMode('common'));
  $('personAttachmentsTab').addEventListener('click', () => setAttachmentMode('person'));
  $('personAttachmentSelect').addEventListener('change', async () => { selectedPersonRowId = $('personAttachmentSelect').value || null; await refreshPersonAttachments(); });
  $('addPersonAttachmentBtn').addEventListener('click', () => $('personAttachmentInput').click());
  $('personAttachmentInput').addEventListener('change', async (event) => {
    const files = [...(event.target.files || [])];
    event.target.value = '';
    if (files.length) await addPersonAttachmentFiles(files);
  });
  $('addBannerBtn').addEventListener('click', () => $('bannerInput').click());
  $('bannerInput').addEventListener('change', async (event) => {
    const file = event.target.files?.[0] || null;
    event.target.value = '';
    if (file) await setBannerFile(file);
  });

  $('subjectInput').addEventListener('focus', () => { lastEditor = 'subject'; });
  $('subjectInput').addEventListener('input', () => {
    state.subject = $('subjectInput').value;
    scheduleSave();
    updatePreview();
  });

  const body = $('bodyEditor');
  body.addEventListener('focus', () => { lastEditor = 'body'; saveBodySelection(); });
  body.addEventListener('keyup', saveBodySelection);
  body.addEventListener('mouseup', saveBodySelection);
  body.addEventListener('input', () => {
    state.bodyHtml = body.innerHTML;
    saveBodySelection();
    scheduleSave();
    updatePreview();
  });
  body.addEventListener('paste', () => setTimeout(() => {
    state.bodyHtml = body.innerHTML;
    scheduleSave();
    updatePreview();
  }, 0));

  $('editorToolbar').addEventListener('pointerdown', () => saveBodySelection());
  document.querySelectorAll('.format-btn[data-cmd]').forEach((button) => {
    button.addEventListener('mousedown', (event) => event.preventDefault());
    button.addEventListener('click', () => applyFormatting(button.dataset.cmd, button.dataset.value || null));
  });
  $('insertLinkBtn').addEventListener('mousedown', (event) => { event.preventDefault(); saveBodySelection(); });
  $('insertLinkBtn').addEventListener('click', () => openLinkModal());
  body.addEventListener('keydown', (event) => {
    if ((event.ctrlKey || event.metaKey) && !event.altKey && String(event.key).toLowerCase() === 'k') {
      event.preventDefault();
      event.stopPropagation();
      saveBodySelection();
      openLinkModal();
    }
  });
  $('fontSelect').addEventListener('mousedown', saveBodySelection);
  $('fontSelect').addEventListener('change', () => applyFormatting('fontName', $('fontSelect').value));
  $('sizeSelect').addEventListener('mousedown', saveBodySelection);
  $('sizeSelect').addEventListener('change', () => applyFormatting('fontSize', $('sizeSelect').value));
  $('textColorBtn').addEventListener('mousedown', (event) => { event.preventDefault(); saveBodySelection(); });
  $('textColorBtn').addEventListener('click', (event) => {
    event.stopPropagation();
    const pop = $('textColorPopover');
    pop.classList.toggle('hidden');
    $('textColorBtn').setAttribute('aria-expanded', String(!pop.classList.contains('hidden')));
  });
  document.addEventListener('selectionchange', () => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    if ($('bodyEditor').contains(range.commonAncestorContainer)) {
      savedBodyRange = range.cloneRange();
      lastEditor = 'body';
      updateFormatState();
    }
  });

  $('prevPreviewBtn').addEventListener('click', () => movePreview(-1));
  $('nextPreviewBtn').addEventListener('click', () => movePreview(1));
  $('preflightBtn').addEventListener('click', runPreflightAndRender);
  $('createDraftsBtn').addEventListener('click', createDrafts);
  $('openDraftsBtn').addEventListener('click', () => {
    const account = connectedGmail ? encodeURIComponent(connectedGmail) : '0';
    window.open(`https://mail.google.com/mail/u/${account}/#drafts`, '_blank', 'noopener');
  });

  $('sameTimeModeBtn').addEventListener('click', () => setScheduleMode(false));
  $('perPersonModeBtn').addEventListener('click', () => setScheduleMode(true));
  $('cloudScheduleBtn').addEventListener('click', () => setScheduleBackend('cloud'));
  $('localScheduleBtn').addEventListener('click', () => setScheduleBackend('local'));
  $('cloudSetupBtn').addEventListener('click', openCloudSetupModal);
  $('ensureSendAtBtn').addEventListener('click', () => {
    if (!findColumn('SendAt')) addKeyword('SendAt');
    toast(t('sendat_ready'));
  });

  $('datePickerBtn').addEventListener('click', (event) => {
    event.stopPropagation();
    const pop = $('calendarPopover');
    pop.classList.toggle('hidden');
    if (!pop.classList.contains('hidden')) {
      calendarView = selectedScheduleDate() || new Date();
      renderCalendar();
    }
  });
  $('calendarPrevBtn').addEventListener('click', (event) => {
    event.stopPropagation();
    calendarView = new Date(calendarView.getFullYear(), calendarView.getMonth() - 1, 1);
    renderCalendar();
  });
  $('calendarNextBtn').addEventListener('click', (event) => {
    event.stopPropagation();
    calendarView = new Date(calendarView.getFullYear(), calendarView.getMonth() + 1, 1);
    renderCalendar();
  });
  $('todayBtn').addEventListener('click', (event) => {
    event.stopPropagation();
    chooseScheduleDate(new Date());
    $('calendarPopover').classList.add('hidden');
  });
  document.addEventListener('click', (event) => {
    if (!$('calendarPopover').contains(event.target) && event.target !== $('datePickerBtn')) {
      $('calendarPopover').classList.add('hidden');
    }
    if (!$('textColorPopover').contains(event.target) && !$('textColorBtn').contains(event.target)) {
      $('textColorPopover').classList.add('hidden');
      $('textColorBtn').setAttribute('aria-expanded', 'false');
    }
  });

  $('hourSelect').addEventListener('change', () => {
    state.scheduleHour = $('hourSelect').value;
    scheduleSave();
    updateScheduleSummary();
  });
  $('minuteSelect').addEventListener('change', () => {
    state.scheduleMinute = $('minuteSelect').value;
    scheduleSave();
    updateScheduleSummary();
  });
  $('amBtn').addEventListener('click', () => setSchedulePeriod('AM'));
  $('pmBtn').addEventListener('click', () => setSchedulePeriod('PM'));

  $('scheduleBtn').addEventListener('click', scheduleEmails);
  $('refreshQueueBtn').addEventListener('click', () => refreshQueue(false));
  $('cancelPendingBtn').addEventListener('click', cancelAllPending);
  $('retryFailedBtn').addEventListener('click', retryAllFailed);

  $('exportBtn').addEventListener('click', exportProject);
  $('importProjectBtn').addEventListener('click', () => $('projectInput').click());
  $('projectInput').addEventListener('change', importProject);

  $('modalCloseBtn').addEventListener('click', closeModal);
  $('modalCancelBtn').addEventListener('click', closeModal);
  $('modalBackdrop').addEventListener('mousedown', (event) => {
    if (event.target === $('modalBackdrop')) closeModal();
  });
  $('modalConfirmBtn').addEventListener('click', async () => {
    if (modalConfirmHandler) await modalConfirmHandler();
  });
  document.addEventListener('keydown', async (event) => {
    if ($('modalBackdrop').classList.contains('hidden')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal();
    } else if (event.key === 'Enter' && !event.shiftKey && event.target?.tagName !== 'TEXTAREA') {
      event.preventDefault();
      if (modalConfirmHandler) await modalConfirmHandler();
    }
  });
}

async function loadState() {
  const stored = await chrome.storage.local.get([STORAGE_STATE, LEGACY_STORAGE_STATE]);
  const saved = stored[STORAGE_STATE] || stored[LEGACY_STORAGE_STATE];
  if (!saved || typeof saved !== 'object') return;

  const columns = Array.isArray(saved.columns) ? saved.columns.filter(validColumnName) : [];
  state.columns = uniqueCaseInsensitive(columns.length ? columns : CORE_COLUMNS);
  if (!state.columns.some((c) => c.toLowerCase() === 'email')) state.columns.unshift('Email');
  state.rows = Array.isArray(saved.rows) && saved.rows.length
    ? saved.rows.map((row) => normalizeRow(row, state.columns))
    : [emptyRow(state.columns)];
  state.subject = String(saved.subject || '');
  state.bodyHtml = typeof saved.bodyHtml === 'string'
    ? saved.bodyHtml
    : textToHtml(String(saved.body || ''));
  state.scheduleDate = String(saved.scheduleDate || '');
  state.scheduleHour = String(saved.scheduleHour || '8');
  state.scheduleMinute = String(saved.scheduleMinute || '00').padStart(2, '0');
  state.schedulePeriod = saved.schedulePeriod === 'PM' ? 'PM' : 'AM';
  state.perPersonSchedule = Boolean(saved.perPersonSchedule ?? saved.perRowSchedule);
  state.scheduleBackend = saved.scheduleBackend === 'local' ? 'local' : 'cloud';
  state.attachmentIds = Array.isArray(saved.attachmentIds) ? saved.attachmentIds.filter((id) => typeof id === 'string' && id) : [];
  state.recipientAttachmentIds = saved.recipientAttachmentIds && typeof saved.recipientAttachmentIds === 'object' ? saved.recipientAttachmentIds : {};
  state.bannerId = typeof saved.bannerId === 'string' ? saved.bannerId : '';

  if (!state.scheduleDate && saved.globalSchedule) {
    const oldDate = new Date(saved.globalSchedule);
    if (Number.isFinite(oldDate.getTime())) {
      state.scheduleDate = localIsoDate(oldDate);
      const h = oldDate.getHours();
      state.schedulePeriod = h >= 12 ? 'PM' : 'AM';
      state.scheduleHour = String(h % 12 || 12);
      state.scheduleMinute = String(oldDate.getMinutes()).padStart(2, '0');
    }
  }
}

function ensureScheduleDefaults() {
  if (!state.scheduleDate) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    state.scheduleDate = localIsoDate(tomorrow);
  }
  if (!/^(?:[1-9]|1[0-2])$/.test(state.scheduleHour)) state.scheduleHour = '8';
  if (!/^\d{2}$/.test(state.scheduleMinute) || Number(state.scheduleMinute) > 59) state.scheduleMinute = '00';
}

function renderAll() {
  $('subjectInput').value = state.subject;
  $('bodyEditor').innerHTML = sanitizeHtml(state.bodyHtml);
  $('hourSelect').value = state.scheduleHour;
  $('minuteSelect').value = state.scheduleMinute;
  setSchedulePeriod(state.schedulePeriod, false);
  setScheduleMode(state.perPersonSchedule, false);
  setScheduleBackend(state.scheduleBackend, false);
  renderGrid();
  renderKeywords();
  renderRecipientCount();
  updatePreview();
  updateScheduleSummary();
  updateTimezoneLabels();
}

function populateTextColorPalette() {
  const palette = $('textColorPalette');
  palette.replaceChildren();
  for (const color of TEXT_COLORS) {
    const swatch = document.createElement('button');
    swatch.type = 'button';
    swatch.className = 'color-swatch';
    swatch.style.backgroundColor = color;
    swatch.title = color.toUpperCase();
    swatch.setAttribute('aria-label', `Text color ${color}`);
    if (color === '#ffffff') swatch.classList.add('light-swatch');
    swatch.addEventListener('mousedown', (event) => { event.preventDefault(); saveBodySelection(); });
    swatch.addEventListener('click', (event) => {
      event.stopPropagation();
      document.querySelector('.color-a').style.borderBottomColor = color;
      applyFormatting('foreColor', color);
      $('textColorPopover').classList.add('hidden');
      $('textColorBtn').setAttribute('aria-expanded', 'false');
    });
    palette.appendChild(swatch);
  }
}

function updateFormatState() {
  for (const cmd of ['bold','italic','underline','strikeThrough']) {
    const button = document.querySelector(`.format-btn[data-cmd="${cmd}"]`);
    if (!button) continue;
    let active = false;
    try { active = document.queryCommandState(cmd); } catch {}
    button.classList.toggle('active', Boolean(active));
  }
}

function populateTimeControls() {
  const hour = $('hourSelect');
  const minute = $('minuteSelect');
  for (let i = 1; i <= 12; i++) {
    const option = document.createElement('option');
    option.value = String(i);
    option.textContent = String(i);
    hour.appendChild(option);
  }
  for (let i = 0; i < 60; i++) {
    const value = String(i).padStart(2, '0');
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    minute.appendChild(option);
  }
}

function renderGrid() {
  const wrap = $('gridWrap');
  wrap.replaceChildren();

  if (!state.rows.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-grid';
    empty.textContent = t('no_recipients_yet');
    wrap.appendChild(empty);
    return;
  }

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  const actionTh = document.createElement('th');
  headerRow.appendChild(actionTh);

  state.columns.forEach((column) => {
    const th = document.createElement('th');
    const label = document.createElement('span');
    label.textContent = column;
    th.appendChild(label);

    if (column.toLowerCase() !== 'email') {
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'column-delete';
      remove.textContent = '×';
      remove.title = t('remove_keyword', { column });
      remove.addEventListener('click', () => removeKeyword(column));
      th.appendChild(remove);
    }
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  state.rows.forEach((row, rowIndex) => {
    const tr = document.createElement('tr');
    const actionTd = document.createElement('td');
    const del = document.createElement('button');
    del.className = 'row-delete';
    del.type = 'button';
    del.textContent = '×';
    del.title = t('delete_row');
    del.addEventListener('click', () => deleteRow(rowIndex));
    actionTd.appendChild(del);
    tr.appendChild(actionTd);

    state.columns.forEach((column) => {
      const td = document.createElement('td');
      const input = document.createElement('input');
      input.className = 'cell-input';
      input.type = column.toLowerCase() === 'email' ? 'email' : 'text';
      input.value = row[column] ?? '';
      if (column.toLowerCase() === 'sendat') input.placeholder = '2026-09-28 9:00 AM';
      input.dataset.row = String(rowIndex);
      input.dataset.column = column;
      input.addEventListener('input', () => {
        state.rows[rowIndex][column] = input.value;
        scheduleSave();
        renderRecipientCount();
        if (['name','email'].includes(column.toLowerCase())) renderPersonAttachmentSelector();
        updatePreview();
      });
      input.addEventListener('focus', () => {
        previewIndex = rowIndex;
        updatePreview();
      });
      td.appendChild(input);
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  wrap.appendChild(table);
}

function renderKeywords() {
  const chips = $('keywordChips');
  chips.replaceChildren();
  for (const column of state.columns) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'chip';
    btn.textContent = `{{${column}}}`;
    btn.title = uiLang === 'vi' ? `Chèn {{${column}}}` : `Insert {{${column}}}`;
    btn.addEventListener('mousedown', (event) => event.preventDefault());
    btn.addEventListener('click', () => insertKeyword(column));
    chips.appendChild(btn);
  }
}

function saveBodySelection() {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) return;
  const range = selection.getRangeAt(0);
  if ($('bodyEditor').contains(range.commonAncestorContainer)) savedBodyRange = range.cloneRange();
}

function restoreBodySelection() {
  const editor = $('bodyEditor');
  editor.focus();
  const selection = window.getSelection();
  selection.removeAllRanges();
  if (savedBodyRange && editor.contains(savedBodyRange.commonAncestorContainer)) {
    selection.addRange(savedBodyRange);
  } else {
    const range = document.createRange();
    range.selectNodeContents(editor);
    range.collapse(false);
    selection.addRange(range);
  }
}

function insertKeyword(column) {
  const token = `{{${column}}}`;
  if (lastEditor === 'subject') {
    const target = $('subjectInput');
    target.focus();
    const start = Number.isInteger(target.selectionStart) ? target.selectionStart : target.value.length;
    const end = Number.isInteger(target.selectionEnd) ? target.selectionEnd : start;
    target.setRangeText(token, start, end, 'end');
    target.dispatchEvent(new Event('input', { bubbles: true }));
    return;
  }

  restoreBodySelection();
  document.execCommand('insertText', false, token);
  state.bodyHtml = $('bodyEditor').innerHTML;
  saveBodySelection();
  scheduleSave();
  updatePreview();
}

function selectionLinkContext() {
  const editor = $('bodyEditor');
  const selection = window.getSelection();
  let range = null;
  if (selection && selection.rangeCount) {
    const candidate = selection.getRangeAt(0);
    if (editor.contains(candidate.commonAncestorContainer)) range = candidate.cloneRange();
  }
  if (!range && savedBodyRange && editor.contains(savedBodyRange.commonAncestorContainer)) range = savedBodyRange.cloneRange();
  if (!range) return { range: null, anchor: null, text: '' };

  const startNode = range.startContainer.nodeType === Node.ELEMENT_NODE ? range.startContainer : range.startContainer.parentElement;
  const endNode = range.endContainer.nodeType === Node.ELEMENT_NODE ? range.endContainer : range.endContainer.parentElement;
  const startAnchor = startNode?.closest?.('a') || null;
  const endAnchor = endNode?.closest?.('a') || null;
  const anchor = startAnchor && startAnchor === endAnchor && editor.contains(startAnchor) ? startAnchor : null;
  return { range, anchor, text: range.toString() };
}

function normalizeLinkUrl(raw) {
  let value = String(raw || '').trim();
  if (!value) return '';
  if (/^mailto:/i.test(value)) {
    const address = value.slice(7).trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address) ? `mailto:${address}` : '';
  }
  if (/^tel:/i.test(value)) {
    const phone = value.slice(4).trim();
    return /^[+()0-9.\-\s]{3,}$/.test(phone) ? `tel:${phone.replace(/\s+/g, '')}` : '';
  }
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return `mailto:${value}`;
  if (/^[+]?[(]?[0-9][0-9() .\-]{2,}$/.test(value)) return `tel:${value.replace(/\s+/g, '')}`;
  if (/^(www\.)/i.test(value) || /^[a-z0-9][a-z0-9.-]+\.[a-z]{2,}(?:[/:?#]|$)/i.test(value)) value = `https://${value}`;
  try {
    const parsed = new URL(value);
    if (!['http:', 'https:'].includes(parsed.protocol)) return '';
    return parsed.href;
  } catch {
    return '';
  }
}

function safeLinkHref(raw) {
  const value = String(raw || '').trim();
  if (/^mailto:/i.test(value)) return normalizeLinkUrl(value);
  if (/^tel:/i.test(value)) return normalizeLinkUrl(value);
  try {
    const parsed = new URL(value);
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : '';
  } catch {
    return '';
  }
}

function syncBodyAfterEdit() {
  state.bodyHtml = sanitizeHtml($('bodyEditor').innerHTML);
  scheduleSave();
  updatePreview();
}

function placeCaretAfter(node) {
  const selection = window.getSelection();
  const range = document.createRange();
  range.setStartAfter(node);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);
  savedBodyRange = range.cloneRange();
}

function applyLinkFromModal(text, rawUrl, context) {
  const href = normalizeLinkUrl(rawUrl);
  if (!href) {
    toast(rawUrl.trim() ? t('link_url_invalid') : t('link_url_required'), true);
    return false;
  }
  const displayText = String(text || '').trim();
  if (!displayText) {
    toast(t('link_text_required'), true);
    return false;
  }

  const editor = $('bodyEditor');
  if (context.anchor && editor.contains(context.anchor)) {
    context.anchor.textContent = displayText;
    context.anchor.setAttribute('href', href);
    context.anchor.setAttribute('target', '_blank');
    context.anchor.setAttribute('rel', 'noopener noreferrer');
    placeCaretAfter(context.anchor);
  } else {
    if (context.range && editor.contains(context.range.commonAncestorContainer)) savedBodyRange = context.range.cloneRange();
    restoreBodySelection();
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return false;
    const range = selection.getRangeAt(0);
    const selected = range.toString();
    if (!range.collapsed && displayText === selected) {
      document.execCommand('createLink', false, href);
      const current = selection.rangeCount ? selection.getRangeAt(0) : null;
      const root = current?.commonAncestorContainer?.nodeType === Node.ELEMENT_NODE
        ? current.commonAncestorContainer
        : current?.commonAncestorContainer?.parentElement;
      const links = root?.querySelectorAll ? [...root.querySelectorAll('a')] : [];
      const parentLink = root?.closest?.('a');
      if (parentLink) links.push(parentLink);
      links.filter((a, index, arr) => arr.indexOf(a) === index && editor.contains(a) && a.getAttribute('href') === href)
        .forEach((a) => { a.setAttribute('target', '_blank'); a.setAttribute('rel', 'noopener noreferrer'); });
    } else {
      range.deleteContents();
      const anchor = document.createElement('a');
      anchor.textContent = displayText;
      anchor.setAttribute('href', href);
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('rel', 'noopener noreferrer');
      range.insertNode(anchor);
      placeCaretAfter(anchor);
    }
  }
  syncBodyAfterEdit();
  saveBodySelection();
  return true;
}

function removeExistingLink(context) {
  const anchor = context.anchor;
  const editor = $('bodyEditor');
  if (!anchor || !editor.contains(anchor)) return;
  const lastChild = anchor.lastChild;
  const parent = anchor.parentNode;
  while (anchor.firstChild) parent.insertBefore(anchor.firstChild, anchor);
  anchor.remove();
  if (lastChild && document.contains(lastChild)) placeCaretAfter(lastChild);
  syncBodyAfterEdit();
  closeModal();
}

function openLinkModal() {
  lastEditor = 'body';
  saveBodySelection();
  const context = selectionLinkContext();
  const existingHref = context.anchor?.getAttribute('href') || '';
  const selectedText = context.anchor ? context.anchor.textContent || '' : context.text || '';
  const defaultUrl = existingHref || (/^(https?:\/\/|www\.)/i.test(selectedText.trim()) ? selectedText.trim() : '');

  showModal({
    title: t('insert_link_modal'),
    confirmText: t('apply'),
    cancelText: t('cancel'),
    contentBuilder: (container) => {
      const grid = document.createElement('div');
      grid.className = 'link-dialog-grid';

      const textWrap = document.createElement('div');
      const textLabel = document.createElement('label');
      textLabel.className = 'field-label';
      textLabel.htmlFor = 'linkTextInput';
      textLabel.textContent = t('link_text');
      const textInput = document.createElement('input');
      textInput.id = 'linkTextInput';
      textInput.className = 'modal-input';
      textInput.type = 'text';
      textInput.placeholder = t('link_text_placeholder');
      textInput.value = selectedText;
      textWrap.append(textLabel, textInput);

      const urlWrap = document.createElement('div');
      const urlLabel = document.createElement('label');
      urlLabel.className = 'field-label';
      urlLabel.htmlFor = 'linkUrlInput';
      urlLabel.textContent = t('link_url');
      const urlInput = document.createElement('input');
      urlInput.id = 'linkUrlInput';
      urlInput.className = 'modal-input';
      urlInput.type = 'text';
      urlInput.inputMode = 'url';
      urlInput.autocomplete = 'off';
      urlInput.placeholder = t('link_url_placeholder');
      urlInput.value = existingHref;
      urlWrap.append(urlLabel, urlInput);

      const help = document.createElement('div');
      help.className = 'link-dialog-help';
      help.textContent = t('link_help');
      grid.append(textWrap, urlWrap, help);

      if (context.anchor) {
        const actions = document.createElement('div');
        actions.className = 'link-dialog-actions';
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.className = 'btn secondary danger-text';
        remove.textContent = t('remove_link');
        remove.addEventListener('click', () => removeExistingLink(context));
        actions.appendChild(remove);
        grid.appendChild(actions);
      }

      container.appendChild(grid);
      setTimeout(() => {
        if (!selectedText) textInput.focus();
        else urlInput.focus();
      }, 0);
    },
    onConfirm: async () => {
      const textInput = $('linkTextInput');
      const urlInput = $('linkUrlInput');
      if (!textInput || !urlInput) return;
      if (applyLinkFromModal(textInput.value, urlInput.value, context)) closeModal();
    }
  });
}

function openAttachmentDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(ATTACHMENT_DB, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(ATTACHMENT_STORE)) db.createObjectStore(ATTACHMENT_STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open attachment storage.'));
  });
}

async function attachmentDbPut(record) {
  const db = await openAttachmentDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ATTACHMENT_STORE, 'readwrite');
    tx.objectStore(ATTACHMENT_STORE).put(record);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { const error = tx.error; db.close(); reject(error || new Error('Could not save attachment.')); };
  });
}

async function attachmentDbGet(id) {
  const db = await openAttachmentDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ATTACHMENT_STORE, 'readonly');
    const request = tx.objectStore(ATTACHMENT_STORE).get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error || new Error('Could not read attachment.'));
    tx.oncomplete = () => db.close();
  });
}

async function attachmentDbDelete(id) {
  const db = await openAttachmentDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ATTACHMENT_STORE, 'readwrite');
    tx.objectStore(ATTACHMENT_STORE).delete(id);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { const error = tx.error; db.close(); reject(error || new Error('Could not remove attachment.')); };
  });
}

async function storeFiles(files) {
  const stored = [];
  for (const file of files) {
    const id = crypto.randomUUID();
    const record = {
      id,
      name: file.name || 'attachment',
      type: file.type || 'application/octet-stream',
      size: Number(file.size || 0),
      lastModified: file.lastModified || Date.now(),
      blob: file
    };
    await attachmentDbPut(record);
    const meta = attachmentMeta(record);
    attachmentMetaCache.set(id, meta);
    stored.push(meta);
  }
  return stored;
}

function attachmentMeta(record) {
  return {
    id: String(record?.id || ''),
    name: String(record?.name || 'attachment'),
    type: String(record?.type || 'application/octet-stream'),
    size: Number(record?.size || 0),
    lastModified: Number(record?.lastModified || 0)
  };
}

async function getAttachmentMeta(id) {
  if (!id) return null;
  if (attachmentMetaCache.has(id)) return attachmentMetaCache.get(id);
  try {
    const record = await attachmentDbGet(id);
    if (!record) return null;
    const meta = attachmentMeta(record);
    attachmentMetaCache.set(id, meta);
    return meta;
  } catch {
    return null;
  }
}

async function getAttachmentMetas(ids) {
  const records = [];
  for (const id of Array.isArray(ids) ? ids : []) {
    const meta = await getAttachmentMeta(id);
    if (meta) records.push(meta);
  }
  return records;
}

async function addAttachmentFiles(files) {
  try {
    const incoming = [...files];
    const incomingBytes = incoming.reduce((sum, file) => sum + Number(file.size || 0), 0);
    const commonBytes = attachmentRecords.reduce((sum, file) => sum + Number(file.size || 0), 0);
    const bannerBytes = Number(bannerRecord?.size || 0);
    const maxPersonal = maxRecipientAttachmentBytes();
    if (commonBytes + bannerBytes + incomingBytes + maxPersonal > MAX_ATTACHMENT_BYTES) {
      return toast(uiLang === 'vi' ? `Ít nhất một người nhận sẽ có tổng file ${formatBytes(commonBytes + bannerBytes + incomingBytes + maxPersonal)}. Mỗi email phải không vượt quá 25 MB.` : `At least one recipient would reach ${formatBytes(commonBytes + bannerBytes + incomingBytes + maxPersonal)} in files. Keep every email at or below 25 MB.`, true);
    }
    const stored = await storeFiles(incoming);
    state.attachmentIds.push(...stored.map((item) => item.id));
    await refreshAttachments();
    await refreshPersonAttachments();
    scheduleSave();
    updatePreview();
    toast(uiLang === 'vi' ? `Đã thêm ${stored.length} file chung.` : `${stored.length} common file${stored.length === 1 ? '' : 's'} added.`);
  } catch (error) {
    toast(error.message || String(error), true);
  }
}

async function addPersonAttachmentFiles(files) {
  const rowId = selectedPersonRowId || firstRecipientRowId();
  if (!rowId) return toast(uiLang === 'vi' ? 'Hãy thêm người nhận trước khi gán file riêng.' : 'Add a recipient before assigning a personal file.', true);
  const row = state.rows.find((item) => getRowId(item) === rowId);
  if (!row) return toast(uiLang === 'vi' ? 'Người nhận này không còn tồn tại.' : 'That recipient no longer exists.', true);
  try {
    const currentIds = Array.isArray(state.recipientAttachmentIds[rowId]) ? state.recipientAttachmentIds[rowId] : [];
    const current = await getAttachmentMetas(currentIds);
    const incoming = [...files];
    const total = attachmentRecords.reduce((sum, file) => sum + Number(file.size || 0), 0)
      + Number(bannerRecord?.size || 0)
      + current.reduce((sum, file) => sum + Number(file.size || 0), 0)
      + incoming.reduce((sum, file) => sum + Number(file.size || 0), 0);
    if (total > MAX_ATTACHMENT_BYTES) {
      return toast(uiLang === 'vi' ? `Email của người nhận này sẽ có tổng file ${formatBytes(total)}. Hãy giữ ở mức tối đa 25 MB.` : `This recipient's email would total ${formatBytes(total)} in files. Keep it at or below 25 MB.`, true);
    }
    const stored = await storeFiles(incoming);
    state.recipientAttachmentIds[rowId] = [...currentIds, ...stored.map((item) => item.id)];
    await refreshPersonAttachments();
    renderAttachments();
    scheduleSave();
    updatePreview();
    toast(uiLang === 'vi' ? `Đã gán ${stored.length} file cho người nhận này.` : `${stored.length} file${stored.length === 1 ? '' : 's'} assigned to this recipient.`);
  } catch (error) {
    toast(error.message || String(error), true);
  }
}

async function setBannerFile(file) {
  const ext = fileExtension(file?.name);
  const type = String(file?.type || '').toLowerCase();
  if (!String(type).startsWith('image/') || !BANNER_ALLOWED_EXTENSIONS.has(ext)) {
    return toast(uiLang === 'vi' ? 'Banner phải là PNG, JPG, GIF hoặc WebP.' : 'Banner must be PNG, JPG, GIF, or WebP.', true);
  }
  const commonBytes = attachmentRecords.reduce((sum, item) => sum + Number(item.size || 0), 0);
  const maxPersonal = maxRecipientAttachmentBytes();
  if (commonBytes + Number(file.size || 0) + maxPersonal > MAX_ATTACHMENT_BYTES) {
    return toast(uiLang === 'vi' ? `Ít nhất một người nhận sẽ có tổng file ${formatBytes(commonBytes + Number(file.size || 0) + maxPersonal)} khi thêm banner này. Mỗi email phải không vượt quá 25 MB.` : `At least one recipient would reach ${formatBytes(commonBytes + Number(file.size || 0) + maxPersonal)} with this banner. Keep every email at or below 25 MB.`, true);
  }
  try {
    const previousId = state.bannerId;
    const [stored] = await storeFiles([file]);
    state.bannerId = stored.id;
    await refreshBanner();
    await refreshPersonAttachments();
    renderAttachments();
    scheduleSave();
    updatePreview();
    if (previousId && previousId !== stored.id) await maybeDeleteAttachment(previousId);
    toast(uiLang === 'vi' ? 'Đã thêm banner.' : 'Banner added.');
  } catch (error) {
    toast(error.message || String(error), true);
  }
}

async function removeBanner() {
  const id = state.bannerId;
  state.bannerId = '';
  await refreshBanner();
  await refreshPersonAttachments();
  renderAttachments();
  scheduleSave();
  updatePreview();
  if (id) await maybeDeleteAttachment(id);
  toast(uiLang === 'vi' ? 'Đã xóa banner.' : 'Banner removed.');
}

async function removeAttachment(id) {
  state.attachmentIds = state.attachmentIds.filter((item) => item !== id);
  await refreshAttachments();
  await refreshPersonAttachments();
  scheduleSave();
  updatePreview();
  await maybeDeleteAttachment(id);
}

async function removePersonAttachment(rowId, id) {
  const ids = Array.isArray(state.recipientAttachmentIds[rowId]) ? state.recipientAttachmentIds[rowId] : [];
  state.recipientAttachmentIds[rowId] = ids.filter((item) => item !== id);
  if (!state.recipientAttachmentIds[rowId].length) delete state.recipientAttachmentIds[rowId];
  await refreshPersonAttachments();
  renderAttachments();
  scheduleSave();
  updatePreview();
  await maybeDeleteAttachment(id);
}

function attachmentReferencedInState(id) {
  if (!id) return false;
  if (state.bannerId === id) return true;
  if ((state.attachmentIds || []).includes(id)) return true;
  return Object.values(state.recipientAttachmentIds || {}).some((ids) => Array.isArray(ids) && ids.includes(id));
}

async function maybeDeleteAttachment(id) {
  if (!id || attachmentReferencedInState(id)) return;
  try {
    const response = await chrome.runtime.sendMessage({ type: 'IS_ATTACHMENT_REFERENCED', id });
    if (response?.referenced) return;
  } catch {
    return; // keep the blob if reference status is unknown
  }
  await attachmentDbDelete(id).catch(() => {});
  attachmentMetaCache.delete(id);
}

async function refreshAttachments() {
  const allIds = new Set(state.attachmentIds || []);
  if (state.bannerId) allIds.add(state.bannerId);
  for (const ids of Object.values(state.recipientAttachmentIds || {})) {
    for (const id of Array.isArray(ids) ? ids : []) allIds.add(id);
  }
  await getAttachmentMetas([...allIds]);
  attachmentRecords = (state.attachmentIds || []).map((id) => attachmentMetaCache.get(id)).filter(Boolean);
  renderAttachments();
}

async function refreshPersonAttachments() {
  renderPersonAttachmentSelector();
  const rowId = selectedPersonRowId || firstRecipientRowId();
  selectedPersonRowId = rowId || null;
  const ids = rowId && Array.isArray(state.recipientAttachmentIds[rowId]) ? state.recipientAttachmentIds[rowId] : [];
  personAttachmentRecords = await getAttachmentMetas(ids);
  renderPersonAttachments();
}

async function refreshBanner() {
  bannerRecord = state.bannerId ? await getAttachmentMeta(state.bannerId) : null;
  if (state.bannerId && !bannerRecord) state.bannerId = '';
  renderBanner();
}

function setAttachmentMode(mode) {
  const person = mode === 'person';
  $('commonAttachmentsTab').classList.toggle('active', !person);
  $('personAttachmentsTab').classList.toggle('active', person);
  $('commonAttachmentsPanel').classList.toggle('hidden', person);
  $('personAttachmentsPanel').classList.toggle('hidden', !person);
  if (person) refreshPersonAttachments().catch(() => {});
}

function renderPersonAttachmentSelector() {
  const select = $('personAttachmentSelect');
  if (!select) return;
  const previous = selectedPersonRowId;
  select.replaceChildren();
  const rows = activeRows();
  rows.forEach(({ row, index }) => {
    const id = getRowId(row);
    const option = document.createElement('option');
    option.value = id;
    const name = getValue(row, 'Name').trim();
    const email = getValue(row, 'Email').trim();
    option.textContent = name && email ? `${name} - ${email}` : email || name || (uiLang === 'vi' ? `Dòng ${index + 1}` : `Row ${index + 1}`);
    select.appendChild(option);
  });
  if (!rows.length) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = t('no_recipients');
    select.appendChild(option);
    select.disabled = true;
    selectedPersonRowId = null;
  } else {
    select.disabled = false;
    const valid = rows.some(({ row }) => getRowId(row) === previous);
    selectedPersonRowId = valid ? previous : getRowId(rows[0].row);
    select.value = selectedPersonRowId;
  }
}

function renderPersonAttachments() {
  const list = $('personAttachmentList');
  if (!list) return;
  list.replaceChildren();
  const rowId = selectedPersonRowId;
  for (const file of personAttachmentRecords) {
    list.appendChild(makeAttachmentItem(file, t('this_recipient'), () => removePersonAttachment(rowId, file.id)));
  }
  if (!personAttachmentRecords.length) {
    const empty = document.createElement('div');
    empty.className = 'queue-empty';
    empty.textContent = rowId ? t('no_personal_files') : t('add_recipient_first');
    list.appendChild(empty);
  }
  const personal = personAttachmentRecords.reduce((sum, file) => sum + Number(file.size || 0), 0);
  const total = commonAttachmentBytes() + bannerBytes() + personal;
  $('personAttachmentSizeSummary').textContent = t('personal_size', { size: formatBytes(personal) });
  $('personAttachmentTotalSummary').textContent = t('this_email_size', { size: formatBytes(total) });
  $('personAttachmentTotalSummary').classList.toggle('danger-text', total > MAX_ATTACHMENT_BYTES);
}

function renderAttachments() {
  const list = $('attachmentList');
  if (!list) return;
  list.replaceChildren();
  for (const file of attachmentRecords) {
    list.appendChild(makeAttachmentItem(file, t('every_email'), () => removeAttachment(file.id)));
  }
  if (!attachmentRecords.length) {
    const empty = document.createElement('div');
    empty.className = 'queue-empty';
    empty.textContent = t('no_common_files');
    list.appendChild(empty);
  }
  const total = commonAttachmentBytes();
  $('attachmentSizeSummary').textContent = t('common_size', { size: formatBytes(total) });
  const activeCount = activeRows().length;
  $('attachmentBatchEstimate').textContent = total ? t('share_files', { count: activeCount }) : t('no_common_files');
}

function makeAttachmentItem(file, statusText, onRemove) {
  const item = document.createElement('div');
  item.className = 'attachment-item';
  const info = document.createElement('div');
  info.className = 'attachment-file';
  const name = document.createElement('span');
  name.className = 'attachment-name';
  name.textContent = file.name;
  const meta = document.createElement('span');
  meta.className = 'attachment-meta';
  meta.textContent = `${formatBytes(file.size)}${file.type ? ` · ${file.type}` : ''}`;
  info.append(name, meta);
  const status = document.createElement('span');
  status.className = 'attachment-status';
  status.textContent = statusText;
  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'attachment-remove';
  remove.textContent = '×';
  remove.title = t('remove_file', { name: file.name });
  remove.addEventListener('click', onRemove);
  item.append(info, status, remove);
  return item;
}

function renderBanner() {
  const wrap = $('bannerPreview');
  if (!wrap) return;
  if (bannerObjectUrl) {
    URL.revokeObjectURL(bannerObjectUrl);
    bannerObjectUrl = '';
  }
  wrap.replaceChildren();
  if (!bannerRecord) {
    wrap.className = 'banner-preview empty';
    const empty = document.createElement('span');
    empty.textContent = t('no_banner');
    wrap.appendChild(empty);
    $('addBannerBtn').textContent = t('add_banner');
    return;
  }
  wrap.className = 'banner-preview';
  attachmentDbGet(bannerRecord.id).then((record) => {
    if (!record?.blob || state.bannerId !== bannerRecord.id) return;
    bannerObjectUrl = URL.createObjectURL(record.blob);
    const img = document.createElement('img');
    img.src = bannerObjectUrl;
    img.alt = t('banner_alt');
    const actions = document.createElement('div');
    actions.className = 'banner-actions';
    const remove = document.createElement('button');
    remove.className = 'btn secondary';
    remove.type = 'button';
    remove.textContent = t('remove');
    remove.addEventListener('click', removeBanner);
    actions.appendChild(remove);
    const meta = document.createElement('div');
    meta.className = 'banner-meta';
    meta.textContent = `${bannerRecord.name} · ${formatBytes(bannerRecord.size)}`;
    wrap.replaceChildren(img, actions, meta);
    updatePreview();
  }).catch(() => {});
  $('addBannerBtn').textContent = t('replace');
}

function commonAttachmentBytes() {
  return attachmentRecords.reduce((sum, file) => sum + Number(file.size || 0), 0);
}

function bannerBytes() {
  return Number(bannerRecord?.size || 0);
}

function recipientAttachmentMetas(row) {
  const ids = state.recipientAttachmentIds?.[getRowId(row)] || [];
  return ids.map((id) => attachmentMetaCache.get(id)).filter(Boolean);
}

function recipientAttachmentBytes(row) {
  return recipientAttachmentMetas(row).reduce((sum, file) => sum + Number(file.size || 0), 0);
}

function maxRecipientAttachmentBytes() {
  return state.rows.reduce((max, row) => Math.max(max, recipientAttachmentBytes(row)), 0);
}

function fileExtension(name) {
  const match = String(name || '').toLowerCase().match(/\.([a-z0-9_]+)$/);
  return match ? match[1] : '';
}

function blockedAttachmentNames(files) {
  return files.filter((file) => GMAIL_BLOCKED_EXTENSIONS.has(fileExtension(file.name))).map((file) => file.name);
}

function archiveAttachmentNames(files) {
  return files.filter((file) => ARCHIVE_EXTENSIONS.has(fileExtension(file.name))).map((file) => file.name);
}

function formatBytes(bytes) {
  const value = Number(bytes || 0);
  if (value < 1000) return `${value} B`;
  if (value < 1_000_000) return `${(value / 1000).toFixed(value < 10_000 ? 1 : 0)} KB`;
  return `${(value / 1_000_000).toFixed(value < 10_000_000 ? 1 : 0)} MB`;
}

function applyFormatting(command, value = null) {
  lastEditor = 'body';
  restoreBodySelection();
  try { document.execCommand('styleWithCSS', false, true); } catch {}
  document.execCommand(command, false, value);
  state.bodyHtml = $('bodyEditor').innerHTML;
  saveBodySelection();
  updateFormatState();
  scheduleSave();
  updatePreview();
}

function addRow() {
  state.rows.push(emptyRow(state.columns));
  previewIndex = state.rows.length - 1;
  renderGrid();
  renderRecipientCount();
  refreshPersonAttachments().catch(() => {});
  updatePreview();
  scheduleSave();
}

async function deleteRow(index) {
  const removed = state.rows[index];
  const removedId = getRowId(removed);
  const detachedIds = removedId && Array.isArray(state.recipientAttachmentIds?.[removedId])
    ? [...state.recipientAttachmentIds[removedId]] : [];
  state.rows.splice(index, 1);
  if (removedId && state.recipientAttachmentIds?.[removedId]) delete state.recipientAttachmentIds[removedId];
  if (!state.rows.length) state.rows.push(emptyRow(state.columns));
  previewIndex = Math.min(previewIndex, state.rows.length - 1);
  if (selectedPersonRowId === removedId) selectedPersonRowId = null;
  renderGrid();
  renderRecipientCount();
  await refreshPersonAttachments().catch(() => {});
  updatePreview();
  scheduleSave();
  for (const id of detachedIds) await maybeDeleteAttachment(id);
}

async function clearRows() {
  if (!confirm(t('clear_rows_confirm'))) return;
  const detachedIds = Object.values(state.recipientAttachmentIds || {}).flatMap((ids) => Array.isArray(ids) ? ids : []);
  state.rows = [emptyRow(state.columns)];
  state.recipientAttachmentIds = {};
  selectedPersonRowId = null;
  previewIndex = 0;
  renderGrid();
  renderRecipientCount();
  await refreshPersonAttachments().catch(() => {});
  updatePreview();
  scheduleSave();
  for (const id of detachedIds) await maybeDeleteAttachment(id);
}

function openAddKeywordModal() {
  showModal({
    title: t('add_keyword_modal'),
    confirmText: t('add_keyword'),
    contentBuilder: (container) => {
      const label = document.createElement('label');
      label.className = 'field-label';
      label.textContent = t('keyword_name');
      const input = document.createElement('input');
      input.id = 'newKeywordName';
      input.className = 'modal-input';
      input.placeholder = 'MeetLink';
      input.autocomplete = 'off';
      const help = document.createElement('p');
      help.className = 'modal-help';
      help.textContent = t('keyword_help');
      container.append(label, input, help);
      setTimeout(() => input.focus(), 0);
    },
    onConfirm: () => {
      const name = $('newKeywordName').value.trim();
      if (!name) return toast(t('enter_keyword'), true);
      if (!validColumnName(name)) return toast(t('keyword_chars'), true);
      if (findColumn(name)) return toast(t('keyword_exists'), true);
      addKeyword(name);
      closeModal();
    }
  });
}

function addKeyword(name) {
  name = String(name || '').trim();
  if (!name || findColumn(name)) {
    if (findColumn(name)) toast(t('name_exists', { name }));
    return;
  }
  state.columns.push(name);
  state.rows.forEach((row) => { row[name] = ''; });
  renderGrid();
  renderKeywords();
  scheduleSave();
}

function removeKeyword(column) {
  if (!confirm(t('remove_keyword_confirm', { column }))) return;
  state.columns = state.columns.filter((c) => c !== column);
  state.rows = state.rows.map((row) => {
    const next = { ...row };
    delete next[column];
    return next;
  });
  if (column.toLowerCase() === 'sendat') {
    state.perPersonSchedule = false;
    setScheduleMode(false, false);
  }
  renderGrid();
  renderKeywords();
  updatePreview();
  scheduleSave();
}

function openPasteModal() {
  showModal({
    title: t('paste_recipients'),
    confirmText: t('import'),
    contentBuilder: (container) => {
      const label = document.createElement('label');
      label.className = 'field-label';
      label.textContent = t('paste_data');
      const area = document.createElement('textarea');
      area.id = 'pasteTableArea';
      area.className = 'modal-textarea';
      area.rows = 10;
      area.placeholder = 'Name\tEmail\tDate\tTime\nThuy\tthuy@example.com\t28/09/2026\t11:30';
      const help = document.createElement('p');
      help.className = 'modal-help';
      help.textContent = t('paste_help');
      container.append(label, area, help);
      setTimeout(() => area.focus(), 0);
    },
    onConfirm: () => {
      const text = $('pasteTableArea').value.trim();
      if (!text) return toast(t('paste_some_rows'), true);
      const parsed = parsePastedTable(text);
      if (!parsed.headers.length || !parsed.rows.length) return toast(t('no_table_data'), true);
      importTabularData(parsed.headers, parsed.rows);
      closeModal();
      toast(t('imported_rows', { count: parsed.rows.length }));
    }
  });
}

async function importCsvFile(event) {
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file) return;
  try {
    const text = await file.text();
    const data = parseCsv(text);
    if (data.length < 2) throw new Error(t('csv_needs_rows'));
    const headers = data[0].map((h) => String(h).trim()).filter(Boolean);
    const rows = data.slice(1).filter((r) => r.some((v) => String(v).trim() !== ''));
    importTabularData(headers, rows);
    toast(t('imported_rows', { count: rows.length }));
  } catch (error) {
    toast(error.message || String(error), true);
  }
}

function importTabularData(headers, rows) {
  const mappings = [];
  const seen = new Set();
  headers.forEach((header, index) => {
    let candidate = String(header || '').trim();
    if (!validColumnName(candidate)) candidate = `Keyword${index + 1}`;
    let unique = candidate;
    let suffix = 2;
    while (seen.has(unique.toLowerCase())) unique = `${candidate}_${suffix++}`;
    seen.add(unique.toLowerCase());
    mappings.push({ sourceIndex: index, name: unique });
  });

  if (!mappings.some((m) => m.name.toLowerCase() === 'email')) {
    mappings.unshift({ sourceIndex: -1, name: 'Email' });
  }
  const cleanHeaders = mappings.map((m) => m.name);
  state.columns = cleanHeaders;
  state.rows = rows.map((values) => {
    const row = emptyRow(cleanHeaders);
    mappings.forEach(({ sourceIndex, name }) => {
      row[name] = sourceIndex >= 0 ? String(values[sourceIndex] ?? '').trim() : '';
    });
    return row;
  });
  state.recipientAttachmentIds = {};
  selectedPersonRowId = null;
  if (!state.rows.length) state.rows = [emptyRow(state.columns)];
  previewIndex = 0;
  renderGrid();
  renderKeywords();
  renderRecipientCount();
  updatePreview();
  scheduleSave();
}

function renderRecipientCount() {
  const rows = activeRows();
  $('recipientCount').textContent = t('recipient_count', { count: rows.length });
  renderAttachments();
  renderPersonAttachmentSelector();
}

function movePreview(delta) {
  if (!state.rows.length) return;
  previewIndex = (previewIndex + delta + state.rows.length) % state.rows.length;
  updatePreview();
}

function updatePreview() {
  if (!state.rows.length) {
    $('previewTo').textContent = '-';
    $('previewSubject').textContent = '-';
    $('previewBody').textContent = t('no_recipient_selected');
    return;
  }
  previewIndex = Math.min(previewIndex, state.rows.length - 1);
  const row = state.rows[previewIndex] || {};
  $('previewTo').textContent = getValue(row, 'Email') || '-';
  $('previewSubject').textContent = renderTemplateText(state.subject, row) || '-';
  const html = renderTemplateHtml(state.bodyHtml, row);
  const bannerHtml = bannerObjectUrl ? `<div style="margin:0 0 14px;line-height:0"><img src="${escapeHtml(bannerObjectUrl)}" alt="" style="display:block;width:100%;max-width:680px;height:auto;margin:0 auto"></div>` : '';
  $('previewBody').innerHTML = `${bannerHtml}${html || `<span style="color:#9aa0a6">${escapeHtml(t('empty_message'))}</span>`}`;
}

function runPreflightAndRender() {
  const result = preflight();
  renderPreflight(result);
  return result;
}

function renderPreflight(result) {
  const box = $('preflightSummary');
  const messages = [];
  if (result.globalErrors.length) messages.push(result.globalErrors.join(' '));
  if (result.rowErrors.length) messages.push(t('rows_blocked', { count: result.rowErrors.length }));
  if (result.warnings.length) messages.push(t('warnings_count', { count: result.warnings.length }));

  if (!result.total) {
    box.className = 'preflight error';
    box.textContent = t('preflight_none');
  } else if (result.globalErrors.length || result.rowErrors.length) {
    box.className = 'preflight error';
    box.textContent = t('preflight_blocked', { ready: result.ready.length, total: result.total, details: messages.join(' ') });
  } else if (result.warnings.length) {
    box.className = 'preflight warn';
    box.textContent = t('preflight_blocked', { ready: result.ready.length, total: result.total, details: messages.join(' ') });
  } else {
    box.className = 'preflight ok';
    box.textContent = t('preflight_ok', { ready: result.ready.length, total: result.total });
  }
}

function preflight() {
  const variables = extractKeywords(`${state.subject}\n${state.bodyHtml}`);
  const globalErrors = [];
  const warnings = [];
  const rowErrors = [];
  const ready = [];
  const rows = activeRows();

  const expectedIds = new Set(state.attachmentIds || []);
  if (state.bannerId) expectedIds.add(state.bannerId);
  for (const ids of Object.values(state.recipientAttachmentIds || {})) {
    for (const id of Array.isArray(ids) ? ids : []) expectedIds.add(id);
  }
  const missingIds = [...expectedIds].filter((id) => !attachmentMetaCache.has(id));
  if (missingIds.length) globalErrors.push(t('file_missing_global', { count: missingIds.length }));

  const commonAndBanner = commonAttachmentBytes() + bannerBytes();
  if (commonAndBanner > MAX_ATTACHMENT_BYTES) {
    globalErrors.push(t('common_over_limit', { size: formatBytes(commonAndBanner) }));
  }

  const commonBlocked = blockedAttachmentNames(attachmentRecords);
  if (commonBlocked.length) globalErrors.push(t('gmail_blocks_common', { files: commonBlocked.join(', ') }));
  const commonArchives = archiveAttachmentNames(attachmentRecords);
  if (commonArchives.length) warnings.push(t('archive_warning', { files: commonArchives.join(', ') }));

  for (const keyword of variables) {
    if (!findColumn(keyword)) globalErrors.push(uiLang === 'vi' ? `Thiếu keyword: {{${keyword}}}.` : `Missing keyword: {{${keyword}}}.`);
  }

  const emailCounts = new Map();
  for (const { row } of rows) {
    const email = getValue(row, 'Email').trim().toLowerCase();
    if (email) emailCounts.set(email, (emailCounts.get(email) || 0) + 1);
  }
  for (const [email, count] of emailCounts) {
    if (count > 1) warnings.push(t('email_duplicate', { email, count }));
  }

  rows.forEach(({ row, index }) => {
    const errors = [];
    const email = getValue(row, 'Email').trim();
    if (!email) errors.push(t('email_empty'));
    else if (!EMAIL_RE.test(email)) errors.push(t('email_invalid'));

    for (const keyword of variables) {
      const column = findColumn(keyword);
      if (column && String(row[column] ?? '').trim() === '') errors.push(uiLang === 'vi' ? `{{${column}}} đang trống` : `{{${column}}} is empty`);
    }

    const personalIds = state.recipientAttachmentIds?.[getRowId(row)] || [];
    const missingPersonal = personalIds.filter((id) => !attachmentMetaCache.has(id));
    if (missingPersonal.length) errors.push(t('personal_files_missing', { count: missingPersonal.length }));
    const personalFiles = recipientAttachmentMetas(row);
    const blockedPersonal = blockedAttachmentNames(personalFiles);
    if (blockedPersonal.length) errors.push(t('gmail_blocks_files', { files: blockedPersonal.join(', ') }));
    const personalArchives = archiveAttachmentNames(personalFiles);
    if (personalArchives.length) warnings.push(t('row_archive_warning', { row: index + 1 }));

    const totalBytes = commonAndBanner + recipientAttachmentBytes(row);
    if (totalBytes > MAX_ATTACHMENT_BYTES) errors.push(t('files_total', { size: formatBytes(totalBytes) }));

    if (globalErrors.length) errors.push(t('batch_blocking'));
    if (errors.length) rowErrors.push({ index, errors });
    else ready.push({ row, index, email: makeEmail(row), totalBytes });
  });

  return { total: rows.length, variables, globalErrors, warnings, rowErrors, ready };
}

async function createDrafts() {
  const result = runPreflightAndRender();
  if (!result.ready.length) return toast(t('no_valid_rows'), true);

  const skipped = result.total - result.ready.length;
  const warningText = result.warnings.length ? t('duplicate_warning_suffix', { count: result.warnings.length }) : '';
  const skipText = skipped ? t('skip_invalid', { count: skipped }) : '';
  const message = t('create_drafts_confirm', { ready: result.ready.length, skip: skipText, warnings: warningText });
  if (!confirm(message)) return;

  setBusy($('createDraftsBtn'), true, t('working'));
  $('draftProgress').textContent = t('creating_drafts', { count: result.ready.length });
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'CREATE_DRAFTS',
      emails: result.ready.map((item) => item.email)
    });
    if (!response?.ok) throw new Error(response?.error || t('draft_creation_failed'));
    $('draftProgress').textContent = t('draft_result', { created: response.created, failed: response.failed ? t('draft_failed_suffix', { count: response.failed }) : '' });
    toast(t('gmail_drafts_created', { count: response.created }));
  } catch (error) {
    handleApiError(error);
    $('draftProgress').textContent = error.message || String(error);
  } finally {
    setBusy($('createDraftsBtn'), false, t('drafts'));
  }
}

function setScheduleMode(perPerson, save = true) {
  state.perPersonSchedule = Boolean(perPerson);
  $('sameTimeModeBtn').classList.toggle('active', !state.perPersonSchedule);
  $('perPersonModeBtn').classList.toggle('active', state.perPersonSchedule);
  $('sameTimePanel').classList.toggle('hidden', state.perPersonSchedule);
  $('perPersonPanel').classList.toggle('hidden', !state.perPersonSchedule);
  if (save) scheduleSave();
}

function setScheduleBackend(backend, save = true) {
  state.scheduleBackend = backend === 'local' ? 'local' : 'cloud';
  const cloud = state.scheduleBackend === 'cloud';
  $('cloudScheduleBtn').classList.toggle('active', cloud);
  $('localScheduleBtn').classList.toggle('active', !cloud);
  $('cloudScheduleNote').classList.toggle('hidden', !cloud);
  $('localScheduleNote').classList.toggle('hidden', cloud);
  $('queueBackendBadge').textContent = cloud ? t('cloud') : t('local');
  updateCloudStatus();
  if (save) {
    scheduleSave();
    refreshQueue(true).catch(() => {});
  }
}

function setSchedulePeriod(period, save = true) {
  state.schedulePeriod = period === 'PM' ? 'PM' : 'AM';
  $('amBtn').classList.toggle('active', state.schedulePeriod === 'AM');
  $('pmBtn').classList.toggle('active', state.schedulePeriod === 'PM');
  if (save) {
    scheduleSave();
    updateScheduleSummary();
  }
}

function selectedScheduleDate() {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(state.scheduleDate)) return null;
  const [year, month, day] = state.scheduleDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (!Number.isFinite(date.getTime())) return null;
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

function chooseScheduleDate(date) {
  const today = startOfDay(new Date());
  const selected = startOfDay(date);
  if (selected < today) return;
  state.scheduleDate = localIsoDate(selected);
  calendarView = new Date(selected.getFullYear(), selected.getMonth(), 1);
  scheduleSave();
  updateScheduleSummary();
  renderCalendar();
}

function renderCalendar() {
  const year = calendarView.getFullYear();
  const month = calendarView.getMonth();
  $('calendarMonthLabel').textContent = new Intl.DateTimeFormat(appLocale(), { month: 'long', year: 'numeric' }).format(new Date(year, month, 1));
  const days = $('calendarDays');
  days.replaceChildren();

  const first = new Date(year, month, 1);
  const start = new Date(year, month, 1 - first.getDay());
  const today = startOfDay(new Date());
  const selected = selectedScheduleDate();

  for (let i = 0; i < 42; i++) {
    const date = new Date(start);
    date.setDate(start.getDate() + i);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'calendar-day';
    button.textContent = String(date.getDate());
    if (date.getMonth() !== month) button.classList.add('other');
    if (sameDay(date, today)) button.classList.add('today');
    if (selected && sameDay(date, selected)) button.classList.add('selected');
    if (startOfDay(date) < today) {
      button.disabled = true;
      button.style.opacity = '.28';
      button.style.cursor = 'default';
    } else {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        chooseScheduleDate(date);
        $('calendarPopover').classList.add('hidden');
      });
    }
    days.appendChild(button);
  }
}

function updateScheduleSummary() {
  const selected = selectedScheduleDate();
  if (!selected) {
    $('datePickerText').textContent = t('choose_date');
    $('scheduleSummary').textContent = t('choose_a_date');
  } else {
    $('datePickerText').textContent = new Intl.DateTimeFormat(appLocale(), { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).format(selected);
    const timestamp = globalScheduleTimestamp();
    $('scheduleSummary').textContent = Number.isFinite(timestamp)
      ? new Intl.DateTimeFormat(appLocale(), { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true }).format(new Date(timestamp))
      : t('choose_valid_time');
  }
  $('hourSelect').value = state.scheduleHour;
  $('minuteSelect').value = state.scheduleMinute;
  updateTimezoneLabels();
}

function globalScheduleTimestamp() {
  const date = selectedScheduleDate();
  if (!date) return NaN;
  let hour = Number(state.scheduleHour);
  const minute = Number(state.scheduleMinute);
  if (!Number.isFinite(hour) || hour < 1 || hour > 12 || !Number.isFinite(minute) || minute < 0 || minute > 59) return NaN;
  if (state.schedulePeriod === 'AM') hour = hour === 12 ? 0 : hour;
  else hour = hour === 12 ? 12 : hour + 12;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, minute, 0, 0).getTime();
}

function updateLocalClock() {
  const now = new Date();
  $('localClock').textContent = new Intl.DateTimeFormat(appLocale(), { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true }).format(now);
}

function updateTimezoneLabels() {
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || t('local_time');
  const offset = formatUtcOffset(new Date());
  const text = `${zone} (${offset})`;
  $('timezoneLabel').textContent = text;
  $('scheduleZoneSummary').textContent = text;
}

async function ensureCloudHostPermission() {
  // Called directly from the Cloud Setup Test button so Chrome treats it as a user gesture.
  const granted = await chrome.permissions.request({ origins: CLOUD_HOST_ORIGINS });
  if (!granted) throw new Error(t('cloud_permission_needed'));
  return true;
}

async function loadCloudConfig() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_CLOUD_CONFIG' });
    if (response?.ok) cloudConfig = response.config || { url: '', secret: '' };
  } catch {
    cloudConfig = { url: '', secret: '' };
  }
  cloudReachable = Boolean(cloudConfig.url && cloudConfig.secret);
  updateCloudStatus();
}

function updateCloudStatus() {
  const status = $('scheduleBackendStatus');
  if (!status) return;
  if (state.scheduleBackend === 'local') {
    status.textContent = t('cloud_runs_here');
    return;
  }
  if (!cloudConfig.url || !cloudConfig.secret) {
    status.textContent = t('cloud_setup_required');
    status.classList.remove('connected');
    return;
  }
  const quota = Number.isFinite(Number(cloudQuotaRemaining)) ? t('cloud_quota_short', { count: cloudQuotaRemaining }) : '';
  status.textContent = cloudReachable ? t('cloud_ready', { quota }) : t('cloud_saved_test');
  status.classList.toggle('connected', cloudReachable);
}

function openCloudSetupModal(language = uiLang, draft = null) {
  const isVi = language === 'vi';
  const oldLang = uiLang;
  const lt = (key, params = {}) => {
    const table = I18N[isVi ? 'vi' : 'en'] || I18N.en;
    let value = table[key] ?? I18N.en[key] ?? key;
    return String(value).replace(/\{(\w+)\}/g, (_m, name) => Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : `{${name}}`);
  };
  const initialUrl = draft?.url ?? cloudConfig.url ?? '';
  const initialSecret = draft?.secret ?? cloudConfig.secret ?? '';

  showModal({
    title: lt('cloud_setup_title'),
    confirmText: lt('save'),
    cancelText: lt('close'),
    modalClass: 'guide-modal cloud-guide-modal',
    contentBuilder: (container) => {
      const tabs = document.createElement('div');
      tabs.className = 'guide-language';
      const en = document.createElement('button');
      en.type = 'button'; en.className = `mode-btn ${!isVi ? 'active' : ''}`; en.textContent = 'English';
      const vi = document.createElement('button');
      vi.type = 'button'; vi.className = `mode-btn ${isVi ? 'active' : ''}`; vi.textContent = 'Tiếng Việt';
      en.addEventListener('click', () => openCloudSetupModal('en', { url: $('cloudUrlInput')?.value ?? initialUrl, secret: $('cloudSecretInput')?.value ?? initialSecret }));
      vi.addEventListener('click', () => openCloudSetupModal('vi', { url: $('cloudUrlInput')?.value ?? initialUrl, secret: $('cloudSecretInput')?.value ?? initialSecret }));
      tabs.append(en, vi);
      container.appendChild(tabs);

      const intro = document.createElement('div');
      intro.className = 'guide-intro';
      const introTitle = document.createElement('strong'); introTitle.textContent = lt('cloud_intro_title');
      const introCopy = document.createElement('span'); introCopy.textContent = lt('cloud_intro_copy');
      intro.append(introTitle, introCopy);
      container.appendChild(intro);

      const setupTitle = document.createElement('h4');
      setupTitle.className = 'guide-section-title';
      setupTitle.textContent = lt('cloud_section_setup');
      container.appendChild(setupTitle);

      const steps = [
        ['1', lt('cloud_step1_title'), lt('cloud_step1_copy')],
        ['2', lt('cloud_step2_title'), lt('cloud_step2_copy')],
        ['3', lt('cloud_step3_title'), lt('cloud_step3_copy')],
        ['4', lt('cloud_step4_title'), lt('cloud_step4_copy')],
        ['5', lt('cloud_step5_title'), lt('cloud_step5_copy')],
        ['6', lt('cloud_step6_title'), lt('cloud_step6_copy')],
        ['7', lt('cloud_step7_title'), lt('cloud_step7_copy')]
      ];
      const stepList = document.createElement('div'); stepList.className = 'guide-steps';
      for (const [num, heading, copyText] of steps) {
        const item = document.createElement('div'); item.className = 'guide-step';
        const badge = document.createElement('span'); badge.className = 'guide-step-num'; badge.textContent = num;
        const body = document.createElement('div');
        const headingEl = document.createElement('strong'); headingEl.textContent = heading;
        const copyEl = document.createElement('p'); copyEl.textContent = copyText;
        body.append(headingEl, copyEl); item.append(badge, body); stepList.appendChild(item);
      }
      container.appendChild(stepList);

      const connectTitle = document.createElement('h4');
      connectTitle.className = 'guide-section-title';
      connectTitle.textContent = lt('cloud_section_connect');
      container.appendChild(connectTitle);

      const grid = document.createElement('div');
      grid.className = 'cloud-setup-grid';
      const urlLabel = document.createElement('label'); urlLabel.className = 'field-label'; urlLabel.textContent = lt('web_app_url');
      const url = document.createElement('input'); url.id = 'cloudUrlInput'; url.className = 'text-input'; url.placeholder = 'https://script.google.com/macros/s/.../exec'; url.value = initialUrl;
      const urlHelp = document.createElement('div'); urlHelp.className = 'modal-help cloud-field-help'; urlHelp.textContent = isVi ? 'Dùng URL deployment kết thúc bằng /exec. Không dùng URL /dev.' : 'Use the deployed Web App URL ending in /exec. Do not use a /dev test URL.';
      const secretLabel = document.createElement('label'); secretLabel.className = 'field-label'; secretLabel.textContent = lt('secret');
      const secret = document.createElement('input'); secret.id = 'cloudSecretInput'; secret.className = 'text-input'; secret.type = 'password'; secret.placeholder = lt('secret_placeholder'); secret.value = initialSecret;
      const secretHelp = document.createElement('div'); secretHelp.className = 'modal-help cloud-field-help'; secretHelp.textContent = isVi ? 'Đây là MAILBATCH CLOUD SECRET được tạo khi chạy setupMailBatchCloud. Không chia sẻ secret này.' : 'This is the MAILBATCH CLOUD SECRET created by setupMailBatchCloud. Do not share it.';

      const buttonRow = document.createElement('div'); buttonRow.className = 'toolbar cloud-setup-buttons';
      const copy = document.createElement('button'); copy.type = 'button'; copy.className = 'btn secondary'; copy.textContent = lt('copy_script');
      copy.addEventListener('click', async () => {
        try {
          const text = await (await fetch(chrome.runtime.getURL('cloud/CLOUD_SCHEDULER.gs'))).text();
          await navigator.clipboard.writeText(text);
          toast(lt('apps_script_copied'));
        } catch (error) { toast(error.message || String(error), true); }
      });
      const test = document.createElement('button'); test.type = 'button'; test.className = 'btn primary'; test.textContent = lt('test');
      const result = document.createElement('div'); result.id = 'cloudSetupStatus'; result.className = 'cloud-setup-status';
      result.textContent = cloudReachable
        ? (isVi ? 'Cloud đã được kiểm tra thành công. Bạn vẫn có thể bấm Kiểm tra để xác minh lại.' : 'Cloud has already passed a connection test. You can test again at any time.')
        : (isVi ? 'Dán URL và secret, sau đó bấm Kiểm tra. MailBatch sẽ lưu hai giá trị trước khi kiểm tra.' : 'Paste the URL and secret, then click Test. MailBatch saves both values before testing them.');
      if (cloudReachable) result.classList.add('ok');

      test.addEventListener('click', async () => {
        test.disabled = true;
        const original = test.textContent;
        test.textContent = isVi ? 'Đang kiểm tra...' : 'Testing...';
        try {
          await ensureCloudHostPermission();
          const save = await chrome.runtime.sendMessage({ type: 'SET_CLOUD_CONFIG', url: url.value.trim(), secret: secret.value.trim() });
          if (!save?.ok) throw new Error(save?.error || lt('cloud_config_save_failed'));
          cloudConfig = save.config;
          result.textContent = lt('testing_cloud');
          result.className = 'cloud-setup-status';
          const ping = await chrome.runtime.sendMessage({ type: 'TEST_CLOUD' });
          if (!ping?.ok) throw new Error(ping?.error || lt('cloud_test_failed'));
          const owner = ping.response?.ownerEmail || '';
          if (owner && connectedGmail && owner.toLowerCase() !== connectedGmail.toLowerCase()) {
            throw new Error(lt('cloud_wrong_account', { owner, gmail: connectedGmail }));
          }
          cloudReachable = true;
          cloudQuotaRemaining = Number.isFinite(Number(ping.response?.quotaRemaining)) ? Number(ping.response.quotaRemaining) : null;
          const quota = cloudQuotaRemaining !== null ? lt('cloud_quota_today', { count: cloudQuotaRemaining }) : '';
          result.textContent = owner ? lt('cloud_connected_owner', { owner, quota }) : lt('cloud_connected', { quota });
          result.className = 'cloud-setup-status ok';
          updateCloudStatus();
        } catch (error) {
          cloudReachable = false;
          result.textContent = error.message || String(error);
          result.className = 'cloud-setup-status error';
          updateCloudStatus();
        } finally {
          test.disabled = false;
          test.textContent = original;
        }
      });
      buttonRow.append(copy, test);
      grid.append(urlLabel, url, urlHelp, secretLabel, secret, secretHelp, buttonRow, result);
      container.appendChild(grid);

      const useTitle = document.createElement('h4');
      useTitle.className = 'guide-section-title';
      useTitle.textContent = lt('cloud_section_use');
      container.appendChild(useTitle);
      const afterSteps = [
        ['1', lt('cloud_after1_title'), lt('cloud_after1_copy')],
        ['2', lt('cloud_after2_title'), lt('cloud_after2_copy')],
        ['3', lt('cloud_after3_title'), lt('cloud_after3_copy')]
      ];
      const afterList = document.createElement('div'); afterList.className = 'guide-steps compact-guide';
      for (const [num, heading, copyText] of afterSteps) {
        const item = document.createElement('div'); item.className = 'guide-step';
        const badge = document.createElement('span'); badge.className = 'guide-step-num'; badge.textContent = num;
        const body = document.createElement('div'); const headingEl = document.createElement('strong'); headingEl.textContent = heading;
        const copyEl = document.createElement('p'); copyEl.textContent = copyText;
        body.append(headingEl, copyEl); item.append(badge, body); afterList.appendChild(item);
      }
      container.appendChild(afterList);

      const safety = document.createElement('div'); safety.className = 'guide-intro cloud-security-note';
      const safetyTitle = document.createElement('strong'); safetyTitle.textContent = lt('cloud_security_title');
      const safetyCopy = document.createElement('span'); safetyCopy.textContent = lt('cloud_security_copy');
      safety.append(safetyTitle, safetyCopy); container.appendChild(safety);
    },
    onConfirm: async () => {
      const response = await chrome.runtime.sendMessage({
        type: 'SET_CLOUD_CONFIG',
        url: $('cloudUrlInput').value.trim(),
        secret: $('cloudSecretInput').value.trim()
      });
      if (!response?.ok) return toast(response?.error || lt('cloud_config_save_failed'), true);
      cloudConfig = response.config;
      cloudReachable = false;
      updateCloudStatus();
      closeModal();
      toast(lt('cloud_setup_saved'));
    }
  });
  uiLang = oldLang;
}

async function scheduleEmails() {
  const result = runPreflightAndRender();
  if (!result.ready.length) return toast(t('no_valid_rows'), true);

  if (state.scheduleBackend === 'cloud' && (!cloudConfig.url || !cloudConfig.secret)) {
    openCloudSetupModal();
    return toast(t('cloud_setup_first'), true);
  }
  if (state.scheduleBackend === 'cloud') {
    const allowed = await chrome.permissions.contains({ origins: CLOUD_HOST_ORIGINS });
    if (!allowed) {
      openCloudSetupModal();
      return toast(t('cloud_press_test'), true);
    }
  }

  const jobs = [];
  const errors = [];
  if (state.perPersonSchedule) {
    const sendAtColumn = findColumn('SendAt');
    if (!sendAtColumn) return toast(t('sendat_first'), true);
    for (const item of result.ready) {
      const raw = String(item.row[sendAtColumn] || '').trim();
      const when = parseLocalDateTime(raw);
      if (!when || when <= Date.now()) errors.push(t('invalid_sendat', { row: item.index + 1 }));
      else jobs.push({ when, email: item.email });
    }
  } else {
    const when = globalScheduleTimestamp();
    if (!Number.isFinite(when) || when <= Date.now()) return toast(t('future_date'), true);
    for (const item of result.ready) jobs.push({ when, email: item.email });
  }

  if (errors.length) {
    showTextModal(t('schedule_blocked'), errors.slice(0, 12).join('\n'), t('close'));
    return;
  }

  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone || t('local_time');
  const detail = state.perPersonSchedule
    ? t('schedule_specific', { count: jobs.length })
    : new Intl.DateTimeFormat(appLocale(), { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(jobs[0].when));
  const cloud = state.scheduleBackend === 'cloud';
  const note = cloud
    ? t('cloud_schedule_note')
    : t('local_schedule_note');
  if (!confirm(t('schedule_confirm', { count: jobs.length, detail, zone, note }))) return;

  setBusy($('scheduleBtn'), true, t('working'));
  try {
    const response = await chrome.runtime.sendMessage({ type: cloud ? 'CLOUD_SCHEDULE' : 'SCHEDULE_LOCAL_DRAFTS', jobs });
    if (!response?.ok) throw new Error(response?.error || t('scheduling_failed'));
    toast(t('scheduled_via', { count: response.scheduled, backend: cloud ? t('cloud') : t('local') }));
    if (cloud) {
      cloudReachable = true;
      cloudQuotaRemaining = Number.isFinite(Number(response.quotaRemaining)) ? Number(response.quotaRemaining) : cloudQuotaRemaining;
    }
    updateCloudStatus();
    await refreshQueue(true);
  } catch (error) {
    handleApiError(error);
  } finally {
    setBusy($('scheduleBtn'), false, t('schedule'));
  }
}

async function refreshQueue(silent = false) {
  try {
    const backend = state.scheduleBackend === 'cloud' ? 'cloud' : 'local';
    const response = await chrome.runtime.sendMessage({ type: 'GET_SCHEDULED', backend });
    if (!response?.ok) throw new Error(response?.error || t('could_not_load_queue'));
    if (backend === 'cloud') {
      cloudReachable = Boolean(response.configured ?? true);
      cloudQuotaRemaining = Number.isFinite(Number(response.quotaRemaining)) ? Number(response.quotaRemaining) : cloudQuotaRemaining;
      updateCloudStatus();
    }
    renderQueue(Array.isArray(response.jobs) ? response.jobs : [], backend);
    if (!silent) toast(t('queue_refreshed'));
  } catch (error) {
    if (state.scheduleBackend === 'cloud') {
      cloudReachable = false;
      updateCloudStatus();
    }
    renderQueue([], state.scheduleBackend);
    if (!silent) toast(error.message || String(error), true);
  }
}

function renderQueue(jobs, backend = state.scheduleBackend) {
  lastQueueJobs = Array.isArray(jobs) ? jobs : [];
  lastQueueBackend = backend;
  const pending = jobs.filter((j) => j.status === 'pending' || j.status === 'processing');
  const failed = jobs.filter((j) => j.status === 'failed');
  const sent = jobs.filter((j) => j.status === 'sent');
  $('queueCounts').textContent = t('pending_sent_failed', { pending: pending.length, sent: sent.length, failed: failed.length });
  $('queueBackendBadge').textContent = backend === 'cloud' ? t('cloud') : t('local');

  const ordered = [...jobs].sort((a, b) => {
    const rank = { pending: 0, processing: 0, failed: 1, sent: 2, cancelled: 3 };
    const diff = (rank[a.status] ?? 9) - (rank[b.status] ?? 9);
    if (diff) return diff;
    return ['pending','processing'].includes(a.status) ? Number(a.when || 0) - Number(b.when || 0) : Number(b.updatedAt || 0) - Number(a.updatedAt || 0);
  }).slice(0, 12);

  const list = $('queueList');
  list.replaceChildren();
  if (!ordered.length) {
    const empty = document.createElement('div');
    empty.className = 'queue-empty';
    empty.textContent = backend === 'cloud' && (!cloudConfig.url || !cloudConfig.secret) ? t('cloud_not_configured') : t('nothing_scheduled');
    list.appendChild(empty);
  } else {
    for (const job of ordered) {
      const item = document.createElement('div');
      item.className = 'queue-item';
      const main = document.createElement('div');
      main.className = 'queue-main';
      const email = document.createElement('div');
      email.className = 'queue-email';
      email.textContent = job.to || job.email?.to || t('unknown_recipient');
      const source = document.createElement('span');
      source.className = 'queue-source';
      source.textContent = backend === 'cloud' ? t('cloud') : t('local');
      email.appendChild(source);
      const time = document.createElement('div');
      time.className = 'queue-time';
      const timestamp = Number(job.when || 0);
      time.textContent = Number.isFinite(timestamp) && timestamp > 0
        ? new Intl.DateTimeFormat(appLocale(), { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(timestamp))
        : t('unknown_time');
      if (job.lastError) time.title = job.lastError;
      main.append(email, time);

      const actions = document.createElement('div');
      actions.className = 'queue-item-actions';
      const status = document.createElement('span');
      status.className = `queue-status ${job.status || ''}`;
      status.textContent = t(`status_${job.status || 'unknown'}`);
      actions.appendChild(status);
      if (job.status === 'pending') {
        const cancel = document.createElement('button');
        cancel.className = 'link-btn danger-text';
        cancel.textContent = t('cancel');
        cancel.addEventListener('click', () => cancelScheduledIds([job.id]));
        actions.appendChild(cancel);
      }
      item.append(main, actions);
      list.appendChild(item);
    }
  }

  $('queueActions').classList.toggle('hidden', !pending.length && !failed.length);
  $('cancelPendingBtn').style.display = pending.some((j) => j.status === 'pending') ? '' : 'none';
  $('retryFailedBtn').style.display = failed.length ? '' : 'none';
}

async function cancelScheduledIds(ids) {
  const backend = state.scheduleBackend === 'cloud' ? 'cloud' : 'local';
  const result = await chrome.runtime.sendMessage({ type: 'CANCEL_SCHEDULED', backend, ids });
  if (!result?.ok) return toast(result?.error || t('could_not_cancel'), true);
  toast(t('cancelled_kept', { count: result.cancelled || 0 }));
  await refreshQueue(true);
}

async function cancelAllPending() {
  const backend = state.scheduleBackend === 'cloud' ? 'cloud' : 'local';
  const response = await chrome.runtime.sendMessage({ type: 'GET_SCHEDULED', backend });
  const pending = (response?.jobs || []).filter((j) => j.status === 'pending');
  if (!pending.length) return toast(t('no_pending'));
  if (!confirm(t('cancel_pending_confirm', { count: pending.length }))) return;
  await cancelScheduledIds(pending.map((j) => j.id));
}

async function retryAllFailed() {
  const backend = state.scheduleBackend === 'cloud' ? 'cloud' : 'local';
  const response = await chrome.runtime.sendMessage({ type: 'GET_SCHEDULED', backend });
  const failed = (response?.jobs || []).filter((j) => j.status === 'failed');
  if (!failed.length) return toast(t('no_failed'));
  if (!confirm(t('retry_failed_confirm', { count: failed.length }))) return;
  const result = await chrome.runtime.sendMessage({ type: 'RETRY_FAILED', backend, ids: failed.map((j) => j.id) });
  if (!result?.ok) return toast(result?.error || t('could_not_retry'), true);
  toast(t('retry_requested'));
  await refreshQueue(true);
}

async function connectGmail() {
  setBusy($('connectBtn'), true, t('wait'));
  try {
    const response = await chrome.runtime.sendMessage({ type: 'AUTH' });
    if (!response?.ok) throw new Error(response?.error || t('could_not_connect'));
    setAccount(response.profile?.emailAddress || t('connect'));
    toast(t('gmail_connected'));
  } catch (error) {
    handleApiError(error);
  } finally {
    setBusy($('connectBtn'), false, t('connect'));
  }
}

async function checkAccount() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_PROFILE' });
    if (response?.ok) setAccount(response.profile?.emailAddress || t('connect'));
    else setDisconnected(response?.error);
  } catch (error) {
    setDisconnected(error.message || String(error));
  }
}

function setAccount(email) {
  connectedGmail = String(email || '');
  lastDisconnectReason = '';
  const status = $('accountStatus');
  status.textContent = t('connected', { email });
  status.classList.add('connected');
}

function setDisconnected(reason = '') {
  connectedGmail = '';
  lastDisconnectReason = String(reason || '');
  const status = $('accountStatus');
  status.textContent = /OAuth is not configured/i.test(reason || '') ? t('oauth_setup_required') : t('gmail_not_connected');
  status.classList.remove('connected');
}

function handleApiError(error) {
  const message = error?.message || String(error);
  if (/OAuth is not configured/i.test(message)) showOauthHelp();
  else toast(message, true);
}

function showOauthHelp() {
  showGuideModal(uiLang, true);
}

function showGuideModal(language = uiLang, setupOnly = false) {
  const id = chrome.runtime.id;
  const clientConfigured = !String(chrome.runtime.getManifest()?.oauth2?.client_id || '').startsWith('REPLACE_WITH_');
  const isVi = language === 'vi';
  const title = isVi ? 'Hướng dẫn MailBatch' : 'MailBatch guide';
  showModal({
    title,
    confirmText: isVi ? 'Sao chép ID' : 'Copy ID',
    cancelText: isVi ? 'Đóng' : 'Close',
    modalClass: 'guide-modal',
    contentBuilder: (container) => {
      const tabs = document.createElement('div');
      tabs.className = 'guide-language';
      const en = document.createElement('button');
      en.type = 'button'; en.className = `mode-btn ${!isVi ? 'active' : ''}`; en.textContent = 'English';
      const vi = document.createElement('button');
      vi.type = 'button'; vi.className = `mode-btn ${isVi ? 'active' : ''}`; vi.textContent = 'Tiếng Việt';
      en.addEventListener('click', () => { closeModal(); showGuideModal('en', setupOnly); });
      vi.addEventListener('click', () => { closeModal(); showGuideModal('vi', setupOnly); });
      tabs.append(en, vi);
      container.appendChild(tabs);

      const intro = document.createElement('div');
      intro.className = 'guide-intro';
      intro.innerHTML = isVi
        ? `<strong>MailBatch dùng OAuth chính thức của Google.</strong><span>Không nhập mật khẩu Gmail vào MailBatch. Thiết lập Google Cloud chỉ cần làm một lần cho mỗi Extension ID.</span>`
        : `<strong>MailBatch uses Google's official OAuth flow.</strong><span>You never enter your Gmail password into MailBatch. Google Cloud setup is normally one-time for this Extension ID.</span>`;
      container.appendChild(intro);

      const setupTitle = document.createElement('h4');
      setupTitle.className = 'guide-section-title';
      setupTitle.textContent = isVi ? 'A. Kết nối Gmail lần đầu' : 'A. First-time Gmail connection';
      container.appendChild(setupTitle);

      const steps = isVi ? [
        ['1', 'Cài extension', 'Giải nén ZIP → mở chrome://extensions → bật Chế độ dành cho nhà phát triển → Tải tiện ích đã giải nén → chọn thư mục chứa manifest.json.'],
        ['2', 'Tạo Google Cloud project', 'Mở Google Cloud Console. Nếu Google yêu cầu, bật xác minh 2 bước (MFA). Tạo project mới, ví dụ “MailBatch Gmail”.'],
        ['3', 'Bật Gmail API', 'Trong project: APIs & Services → Library → Gmail API → Enable. Không cần bật billing chỉ để dùng Gmail API theo flow này.'],
        ['4', 'Cấu hình Google Auth Platform', 'Mở Google Auth Platform. Điền Branding/consent screen. Audience chọn External nếu là Gmail cá nhân. Khi app đang Testing, thêm chính Gmail bạn sẽ dùng vào Test users.'],
        ['5', 'Tạo OAuth Client', `Google Auth Platform → Clients → Create OAuth client → Application type: Chrome Extension. Dán Extension ID bên dưới vào Item ID.\nExtension ID: ${id}`],
        ['6', 'Gắn Client ID vào MailBatch', 'Copy OAuth Client ID dạng …apps.googleusercontent.com. Trong thư mục MailBatch chạy PATCH_OAUTH_CLIENT_ID.bat, paste Client ID rồi Enter.'],
        ['7', 'Reload extension', 'Mở chrome://extensions → bấm Reload trên MailBatch → quay lại Gmail và Ctrl+Shift+R. Nếu tab Gmail cũ báo “Extension context invalidated”, refresh lại tab.'],
        ['8', 'Connect Gmail', 'Mở MailBatch → Connect → chọn đúng Google account → Allow/Continue. Nếu gặp 403 access_denied, quay lại Google Auth Platform → Audience → Test users và thêm Gmail đó.']
      ] : [
        ['1', 'Install the extension', 'Extract the ZIP → open chrome://extensions → enable Developer mode → Load unpacked → choose the folder that directly contains manifest.json.'],
        ['2', 'Create a Google Cloud project', 'Open Google Cloud Console. If Google requires it, enable 2-Step Verification (MFA). Create a project such as “MailBatch Gmail”.'],
        ['3', 'Enable Gmail API', 'Inside the project: APIs & Services → Library → Gmail API → Enable. Billing is not required just to follow this Gmail API setup flow.'],
        ['4', 'Configure Google Auth Platform', 'Open Google Auth Platform and complete Branding/consent details. Use External for a personal Gmail account. While the app is in Testing, add the Gmail account you will use under Test users.'],
        ['5', 'Create the OAuth Client', `Google Auth Platform → Clients → Create OAuth client → Application type: Chrome Extension. Paste the Extension ID below into Item ID.\nExtension ID: ${id}`],
        ['6', 'Patch MailBatch with the Client ID', 'Copy the OAuth Client ID ending in …apps.googleusercontent.com. In the MailBatch folder run PATCH_OAUTH_CLIENT_ID.bat, paste the Client ID, then press Enter.'],
        ['7', 'Reload the extension', 'Open chrome://extensions → Reload MailBatch → return to Gmail and press Ctrl+Shift+R. If an old Gmail tab says “Extension context invalidated”, refresh that tab.'],
        ['8', 'Connect Gmail', 'Open MailBatch → Connect → choose the correct Google account → Allow/Continue. For 403 access_denied, add that Gmail under Google Auth Platform → Audience → Test users.']
      ];
      const stepList = document.createElement('div');
      stepList.className = 'guide-steps';
      for (const [num, heading, copy] of steps) {
        const item = document.createElement('div'); item.className = 'guide-step';
        const badge = document.createElement('span'); badge.className = 'guide-step-num'; badge.textContent = num;
        const body = document.createElement('div');
        const h = document.createElement('strong'); h.textContent = heading;
        const p = document.createElement('p'); p.textContent = copy;
        body.append(h, p); item.append(badge, body); stepList.appendChild(item);
      }
      container.appendChild(stepList);

      if (!setupOnly) {
        const useTitle = document.createElement('h4');
        useTitle.className = 'guide-section-title';
        useTitle.textContent = isVi ? 'B. Cách dùng MailBatch' : 'B. Using MailBatch';
        container.appendChild(useTitle);
        const useSteps = isVi ? [
          ['1', 'Recipients', 'Mỗi dòng là một email. Nhập Name + Email, hoặc Paste từ Excel/Sheets, hoặc Import CSV.'],
          ['2', 'Keywords', 'Add keyword tạo thêm một cột dữ liệu và một keyword tương ứng, ví dụ cột MeetLink → {{MeetLink}}. Mỗi người có thể có giá trị khác nhau.'],
          ['3', 'Compose', 'Viết Subject và Message. Highlight đoạn chữ rồi dùng font, size, bold, italic, underline, màu chữ, alignment, list, indent, quote hoặc clear format. Nếu không highlight, format áp dụng cho chữ gõ tiếp theo.'],
          ['4', 'Banner & attachments', 'Banner: Add banner để chèn hình ở đầu email. Attachments có All emails cho file chung và Per person để gán file riêng cho từng recipient. MailBatch tính giới hạn 25 MB riêng cho từng email: banner + file chung + file riêng.'],
          ['5', 'Insert keywords', 'Click chip {{Name}}, {{Time}}, {{MeetLink}} để chèn vào vị trí con trỏ. MailBatch thay keyword bằng dữ liệu của từng row.'],
          ['6', 'Preview & Check', 'Dùng Prev/Next để xem từng email. Bấm Check trước khi chạy batch để bắt email sai, keyword thiếu, ô trống hoặc recipient trùng.'],
          ['7', 'Drafts', 'Bấm Drafts để tạo từng email personalized vào Gmail Drafts. Đây là lựa chọn an toàn để review trước khi gửi.'],
          ['8', 'Schedule', 'Same time dùng một giờ cho cả batch; Per person dùng {{SendAt}}. Cloud là chế độ khuyến nghị: MailBatch tạo Gmail Drafts trước, sau đó Google Apps Script gửi đúng lịch kể cả khi máy tắt. Local là fallback và cần máy còn thức. Gmail API công khai không có endpoint để tạo item trong thư mục Scheduled gốc của Gmail, nên Cloud jobs nằm ở Drafts trước khi gửi.'],
          ['9', 'Update', 'Nếu đã setup OAuth rồi, dùng UPDATE_EXISTING.bat cho bản mới. Không Remove extension cũ; updater giữ Client ID, Extension ID và local project data.'],
          ['10', 'Ngôn ngữ & nút MailBatch', 'Dùng menu EN/VI trên thanh đầu để đổi toàn bộ giao diện. Nút MailBatch nổi trên Gmail có thể kéo tự do đến vị trí khác; bấm nút để mở panel. Vị trí nút được nhớ cho lần sau.']
        ] : [
          ['1', 'Recipients', 'Each row becomes one email. Enter Name + Email, Paste from Excel/Sheets, or Import a CSV file.'],
          ['2', 'Keywords', 'Add keyword creates both a data column and a matching token. For example MeetLink creates {{MeetLink}}. Each recipient can have a different value.'],
          ['3', 'Compose', 'Write the Subject and Message. Highlight text, then apply font, size, bold, italic, underline, text color, alignment, lists, indent, quote, or clear formatting. With no selection, formatting applies to text you type next.'],
          ['4', 'Banner & attachments', 'Add banner inserts an image above the email body. Attachments supports All emails for common files and Per person for recipient-specific files. The 25 MB check is calculated separately for each email: banner + common files + that recipient’s files.'],
          ['5', 'Insert keywords', 'Click chips such as {{Name}}, {{Time}}, or {{MeetLink}} to insert them at the cursor. MailBatch replaces them with each row’s data.'],
          ['6', 'Preview & Check', 'Use Prev/Next to inspect each email. Run Check before processing a batch to catch invalid emails, missing keywords, blanks, and duplicate recipients.'],
          ['7', 'Drafts', 'Click Drafts to create personalized emails in Gmail Drafts. This is the safest option when you want to review before sending.'],
          ['8', 'Schedule', 'Same time uses one date/time; Per person uses {{SendAt}}. Cloud is recommended: MailBatch creates Gmail Drafts first, then Google Apps Script sends them later even if the computer is off. Local is the fallback and requires the device to stay awake. The public Gmail API does not expose a native Scheduled-folder creation endpoint, so Cloud jobs remain in Drafts until send time.'],
          ['9', 'Update', 'Once OAuth is configured, use UPDATE_EXISTING.bat for new builds. Do not remove the old extension; the updater preserves Client ID, Extension ID, and local project data.'],
          ['10', 'Language & launcher', 'Use the EN/VI menu in the top bar to switch the full interface. The floating MailBatch button on Gmail can be dragged anywhere convenient; click it to open the panel. Its position is remembered.']
        ];
        const useList = document.createElement('div'); useList.className = 'guide-steps compact-guide';
        for (const [num, heading, copy] of useSteps) {
          const item = document.createElement('div'); item.className = 'guide-step';
          const badge = document.createElement('span'); badge.className = 'guide-step-num'; badge.textContent = num;
          const body = document.createElement('div'); const h = document.createElement('strong'); h.textContent = heading;
          const p = document.createElement('p'); p.textContent = copy; body.append(h,p); item.append(badge,body); useList.appendChild(item);
        }
        container.appendChild(useList);

        const safetyTitle = document.createElement('h4');
        safetyTitle.className = 'guide-section-title';
        safetyTitle.textContent = isVi ? 'C. Tin cậy & an toàn' : 'C. Trust & safety';
        container.appendChild(safetyTitle);
        const safety = document.createElement('div');
        safety.className = 'guide-intro';
        safety.innerHTML = isVi
          ? `<strong>Developer: Nguyen Khang</strong><span>MailBatch dùng scope Gmail <code>gmail.compose</code>, không yêu cầu Gmail password, không đọc cookie đăng nhập và không bypass 2FA. Recipient data, template, banner và attachment được lưu local trong Chrome profile. Cloud schedule là tuỳ chọn: URL Web App + secret được lưu local; Google Apps Script chạy dưới chính tài khoản của bạn để gửi Gmail Draft đã được tạo sẵn. Secret phải được giữ riêng tư. Gmail API công khai không cung cấp native Schedule Send endpoint, nên MailBatch không giả lập hay bypass cơ chế bảo mật của Gmail.</span>`
          : `<strong>Developer: Nguyen Khang</strong><span>MailBatch uses the Gmail <code>gmail.compose</code> scope. It does not ask for your Gmail password, read sign-in cookies, or bypass 2FA. Recipient data, templates, banners, and attachment files are stored locally in the Chrome profile. Cloud scheduling is optional: the Web App URL and secret stay local, while Google Apps Script runs under your own account to send Gmail Drafts that MailBatch created beforehand. Keep the secret private. The public Gmail API does not provide a native Schedule Send endpoint, and MailBatch does not bypass Gmail security to manufacture one.</span>`;
        container.appendChild(safety);
      }

      const status = document.createElement('div');
      status.className = `guide-status ${clientConfigured ? 'ok' : 'warn'}`;
      status.textContent = clientConfigured
        ? (isVi ? 'OAuth Client ID đã có trong extension này.' : 'An OAuth Client ID is configured in this extension.')
        : (isVi ? 'OAuth Client ID chưa được patch vào package này.' : 'This package still needs its OAuth Client ID patched.');
      container.appendChild(status);
    },
    onConfirm: async () => {
      await navigator.clipboard.writeText(id);
      toast(isVi ? 'Đã sao chép Extension ID.' : 'Extension ID copied.');
    }
  });
}

function makeEmail(row) {
  const bodyHtml = renderTemplateHtml(state.bodyHtml, row);
  const html = bannerRecord
    ? `<div style="margin:0 0 16px 0;line-height:0"><img src="cid:mailbatch-banner" alt="" style="display:block;width:100%;max-width:680px;height:auto;border:0;margin:0 auto"></div>${bodyHtml}`
    : bodyHtml;
  const specific = recipientAttachmentMetas(row);
  const attachments = [...attachmentRecords, ...specific].map(({ id, name, type, size }) => ({ id, name, type, size }));
  return {
    to: getValue(row, 'Email').trim(),
    subject: renderTemplateText(state.subject, row),
    html,
    text: htmlToPlainText(bodyHtml),
    attachments,
    banner: bannerRecord ? { id: bannerRecord.id, name: bannerRecord.name, type: bannerRecord.type, size: bannerRecord.size, cid: 'mailbatch-banner' } : null
  };
}

function renderTemplateText(template, row) {
  return String(template || '').replace(KEYWORD_RE, (_match, key) => {
    const column = findColumn(key);
    return column ? String(row[column] ?? '') : `{{${key.trim()}}}`;
  });
}

function renderTemplateHtml(template, row) {
  const safeTemplate = sanitizeHtml(template);
  const rendered = safeTemplate.replace(KEYWORD_RE, (_match, key) => {
    const column = findColumn(key);
    return column ? escapeHtml(String(row[column] ?? '')) : `{{${escapeHtml(key.trim())}}}`;
  });
  return sanitizeHtml(rendered);
}

function extractKeywords(text) {
  const result = [];
  const seen = new Set();
  const regex = new RegExp(KEYWORD_RE.source, 'g');
  for (const match of String(text || '').matchAll(regex)) {
    const value = match[1].trim();
    const normalized = value.toLowerCase();
    if (!seen.has(normalized)) {
      seen.add(normalized);
      result.push(value);
    }
  }
  return result;
}

function sanitizeHtml(html) {
  const template = document.createElement('template');
  template.innerHTML = String(html || '');
  const allowedTags = new Set(['DIV', 'P', 'BR', 'B', 'STRONG', 'I', 'EM', 'U', 'S', 'STRIKE', 'SPAN', 'FONT', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'A']);
  const allowedAttrs = new Set(['style', 'face', 'size', 'color', 'align', 'href', 'target', 'rel']);
  const elements = [...template.content.querySelectorAll('*')];
  for (const el of elements) {
    if (!allowedTags.has(el.tagName)) {
      el.replaceWith(...el.childNodes);
      continue;
    }
    for (const attr of [...el.attributes]) {
      if (!allowedAttrs.has(attr.name.toLowerCase())) el.removeAttribute(attr.name);
    }
    if (el.tagName === 'A') {
      const href = safeLinkHref(el.getAttribute('href'));
      if (!href) {
        el.replaceWith(...el.childNodes);
        continue;
      }
      el.setAttribute('href', href);
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
    } else {
      el.removeAttribute('href');
      el.removeAttribute('target');
      el.removeAttribute('rel');
    }
    if (el.hasAttribute('style')) {
      const clean = sanitizeStyle(el.getAttribute('style'));
      if (clean) el.setAttribute('style', clean);
      else el.removeAttribute('style');
    }
  }
  return template.innerHTML;
}

function sanitizeStyle(styleText) {
  const allowed = new Set(['font-family', 'font-size', 'color', 'background-color', 'text-align', 'font-weight', 'font-style', 'text-decoration', 'margin-left']);
  return String(styleText || '').split(';').map((entry) => entry.trim()).filter(Boolean).map((entry) => {
    const index = entry.indexOf(':');
    if (index < 1) return '';
    const prop = entry.slice(0, index).trim().toLowerCase();
    const value = entry.slice(index + 1).trim();
    if (!allowed.has(prop)) return '';
    if (/url\s*\(|expression\s*\(|javascript:/i.test(value)) return '';
    return `${prop}: ${value}`;
  }).filter(Boolean).join('; ');
}

function htmlToPlainText(html) {
  const container = document.createElement('div');
  container.innerHTML = sanitizeHtml(html);
  const walk = (node) => {
    if (node.nodeType === Node.TEXT_NODE) return node.nodeValue || '';
    if (node.nodeType !== Node.ELEMENT_NODE) return '';
    if (node.tagName === 'BR') return '\n';
    const content = [...node.childNodes].map(walk).join('');
    if (['DIV', 'P', 'LI', 'BLOCKQUOTE'].includes(node.tagName)) return `${content}\n`;
    return content;
  };
  return [...container.childNodes].map(walk).join('').replace(/\n{3,}/g, '\n\n').trimEnd();
}

function textToHtml(text) {
  return escapeHtml(String(text || '')).replace(/\r?\n/g, '<br>');
}

function activeRows() {
  return state.rows
    .map((row, index) => ({ row, index }))
    .filter(({ row }) => state.columns.some((column) => String(row[column] ?? '').trim() !== ''));
}

function getValue(row, requested) {
  const column = findColumn(requested);
  return column ? String(row[column] ?? '') : '';
}

function findColumn(name) {
  const lower = String(name || '').trim().toLowerCase();
  return state.columns.find((c) => c.toLowerCase() === lower) || null;
}

function emptyRow(columns) {
  return { __mbId: crypto.randomUUID(), ...Object.fromEntries(columns.map((column) => [column, ''])) };
}

function normalizeRow(row, columns) {
  const next = emptyRow(columns);
  if (!row || typeof row !== 'object') return next;
  if (typeof row.__mbId === 'string' && row.__mbId) next.__mbId = row.__mbId;
  for (const column of columns) {
    const sourceKey = Object.keys(row).find((key) => key.toLowerCase() === column.toLowerCase());
    if (sourceKey) next[column] = String(row[sourceKey] ?? '');
  }
  return next;
}

function getRowId(row) {
  if (!row || typeof row !== 'object') return '';
  if (!row.__mbId) row.__mbId = crypto.randomUUID();
  return row.__mbId;
}

function ensureRowIds() {
  state.rows.forEach((row) => getRowId(row));
  const valid = new Set(state.rows.map((row) => getRowId(row)));
  for (const key of Object.keys(state.recipientAttachmentIds || {})) {
    if (!valid.has(key)) delete state.recipientAttachmentIds[key];
  }
}

function firstRecipientRowId() {
  const first = activeRows()[0]?.row || state.rows[0];
  return first ? getRowId(first) : '';
}

function validColumnName(value) {
  return typeof value === 'string' && /^[\p{L}\p{N}_ -]{1,40}$/u.test(value.trim());
}

function uniqueCaseInsensitive(values) {
  const result = [];
  const seen = new Set();
  for (const value of values) {
    const text = String(value || '').trim();
    if (!text) continue;
    const key = text.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      result.push(text);
    }
  }
  return result;
}

function parsePastedTable(text) {
  const firstLine = text.split(/\r?\n/, 1)[0] || '';
  if (firstLine.includes('\t')) {
    const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
    return {
      headers: lines[0].split('\t').map((x) => x.trim()),
      rows: lines.slice(1).map((line) => line.split('\t'))
    };
  }
  const csv = parseCsv(text);
  return { headers: csv[0] || [], rows: csv.slice(1) };
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n') {
      row.push(field.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += ch;
    }
  }
  row.push(field.replace(/\r$/, ''));
  if (row.some((x) => x !== '') || rows.length === 0) rows.push(row);
  return rows;
}

function parseLocalDateTime(raw) {
  const text = String(raw || '').trim();
  if (!text) return NaN;

  let match = text.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (match) {
    const [, y, m, d, h, min, period] = match;
    return strictLocalDateTime(Number(y), Number(m), Number(d), Number(h), Number(min), period || '');
  }

  match = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (match) {
    const [, d, m, y, h, min, period] = match;
    return strictLocalDateTime(Number(y), Number(m), Number(d), Number(h), Number(min), period || '');
  }

  return NaN;
}

function strictLocalDateTime(year, month, day, inputHour, minute, period = '') {
  if (!Number.isInteger(year) || year < 1970 || year > 9999) return NaN;
  if (!Number.isInteger(month) || month < 1 || month > 12) return NaN;
  if (!Number.isInteger(day) || day < 1 || day > 31) return NaN;
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) return NaN;

  let hour = inputHour;
  const p = String(period || '').trim().toUpperCase();
  if (p) {
    if (!['AM', 'PM'].includes(p) || !Number.isInteger(hour) || hour < 1 || hour > 12) return NaN;
    if (p === 'AM') hour = hour === 12 ? 0 : hour;
    else hour = hour === 12 ? 12 : hour + 12;
  } else if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    return NaN;
  }

  const date = new Date(year, month - 1, day, hour, minute, 0, 0);
  if (!Number.isFinite(date.getTime())) return NaN;
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day || date.getHours() !== hour || date.getMinutes() !== minute) return NaN;
  return date.getTime();
}

function localIsoDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatUtcOffset(date) {
  const minutes = -date.getTimezoneOffset();
  const sign = minutes >= 0 ? '+' : '-';
  const abs = Math.abs(minutes);
  const h = String(Math.floor(abs / 60)).padStart(2, '0');
  const m = String(abs % 60).padStart(2, '0');
  return `UTC${sign}${h}:${m}`;
}

function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveState, 250);
}

async function saveState() {
  state.bodyHtml = sanitizeHtml($('bodyEditor').innerHTML);
  await chrome.storage.local.set({ [STORAGE_STATE]: state });
}

function exportProject() {
  state.bodyHtml = sanitizeHtml($('bodyEditor').innerHTML);
  const exportState = {
    ...state,
    attachmentIds: [],
    recipientAttachmentIds: {},
    bannerId: '',
    attachmentNote: 'Banner and attachment files are stored locally in Chrome and are not included in project JSON exports.'
  };
  const blob = new Blob([JSON.stringify(exportState, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mailbatch-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

async function importProject(event) {
  const file = event.target.files?.[0];
  event.target.value = '';
  if (!file) return;
  const detachedIds = new Set(state.attachmentIds || []);
  if (state.bannerId) detachedIds.add(state.bannerId);
  for (const ids of Object.values(state.recipientAttachmentIds || {})) {
    for (const id of Array.isArray(ids) ? ids : []) detachedIds.add(id);
  }
  try {
    const imported = JSON.parse(await file.text());
    if (!Array.isArray(imported.columns) || !Array.isArray(imported.rows)) throw new Error(t('invalid_project'));
    const columns = uniqueCaseInsensitive(imported.columns.filter(validColumnName));
    if (!columns.some((c) => c.toLowerCase() === 'email')) columns.unshift('Email');
    state = {
      columns,
      rows: imported.rows.map((row) => normalizeRow(row, columns)),
      subject: String(imported.subject || ''),
      bodyHtml: typeof imported.bodyHtml === 'string' ? imported.bodyHtml : textToHtml(String(imported.body || '')),
      scheduleDate: String(imported.scheduleDate || ''),
      scheduleHour: String(imported.scheduleHour || '8'),
      scheduleMinute: String(imported.scheduleMinute || '00').padStart(2, '0'),
      schedulePeriod: imported.schedulePeriod === 'PM' ? 'PM' : 'AM',
      perPersonSchedule: Boolean(imported.perPersonSchedule ?? imported.perRowSchedule),
      scheduleBackend: imported.scheduleBackend === 'local' ? 'local' : 'cloud',
      attachmentIds: [],
      recipientAttachmentIds: {},
      bannerId: ''
    };
    if (!state.rows.length) state.rows = [emptyRow(state.columns)];
    ensureScheduleDefaults();
    previewIndex = 0;
    attachmentRecords = [];
    personAttachmentRecords = [];
    bannerRecord = null;
    selectedPersonRowId = null;
    ensureRowIds();
    renderAll();
    renderAttachments();
    renderBanner();
    await refreshPersonAttachments();
    await saveState();
    for (const id of detachedIds) await maybeDeleteAttachment(id);
    toast(t('project_imported'));
  } catch (error) {
    toast(error.message || String(error), true);
  }
}

function showModal({ title, confirmText = null, cancelText = null, contentBuilder, onConfirm, modalClass = '' }) {
  $('modalTitle').textContent = title;
  const modal = document.querySelector('#modalBackdrop .modal');
  modal.className = `modal ${modalClass}`.trim();
  $('modalConfirmBtn').textContent = confirmText ?? t('confirm');
  $('modalCancelBtn').textContent = cancelText ?? t('cancel');
  const content = $('modalContent');
  content.replaceChildren();
  contentBuilder(content);
  modalConfirmHandler = onConfirm;
  $('modalBackdrop').classList.remove('hidden');
}

function showTextModal(title, message, confirmText = null) {
  showModal({
    title,
    confirmText: confirmText ?? 'OK',
    cancelText: t('close'),
    contentBuilder: (container) => {
      const div = document.createElement('div');
      div.style.cssText = 'white-space:pre-wrap;font-size:12px;line-height:1.6;color:#3c4043';
      div.textContent = message;
      container.appendChild(div);
    },
    onConfirm: closeModal
  });
}

function closeModal() {
  $('modalBackdrop').classList.add('hidden');
  const modal = document.querySelector('#modalBackdrop .modal');
  if (modal) modal.className = 'modal';
  modalConfirmHandler = null;
}

function toast(message, isError = false) {
  const el = $('toast');
  el.textContent = String(message || '');
  el.style.background = isError ? '#b3261e' : '#303134';
  el.classList.remove('hidden');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.add('hidden'), 4200);
}

function setBusy(button, busy, label) {
  button.disabled = busy;
  button.textContent = label;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
