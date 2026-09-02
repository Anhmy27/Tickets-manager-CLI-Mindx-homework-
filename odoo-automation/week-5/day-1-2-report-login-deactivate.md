# Week 5 - Day 1-2 Report: Why Automate Login Deactivate

Tài liệu này là phần báo cáo ngày 1-2 của tuần 5, tập trung giải thích vì sao chọn tự động hóa cho nhóm ticket "không đăng nhập được do tài khoản bị deactivate".

## 1) Bối cảnh vấn đề

Trong quá trình xử lý ticket hỗ trợ, nhóm login issue xuất hiện lặp lại. Mẫu điển hình:

- Người dùng báo không đăng nhập được LMS.
- Ticket có tag hoặc nội dung liên quan "login/đăng nhập".
- Khi kiểm tra thực tế, tài khoản đã bị deactive do không hoạt động một thời gian.

Vấn đề này không phải bug mới mỗi lần, mà là pattern vận hành lặp lại.

## 2) Phân tích tác động

Nếu xử lý thủ công từng ticket:

- Mỗi ticket cần thao tác lặp: đọc ticket, kiểm tra HR, kiểm tra LMS, kích hoạt lại hoặc ghi chú.
- Tốn thời gian CS cho tác vụ giống nhau.
- Dễ sai sót khi khối lượng ticket tăng.
- Tăng thời gian phản hồi người dùng ở các giờ cao điểm.

## 3) Vì sao chọn automation cho case này

Case login deactivate phù hợp tự động hóa vì:

- Quy trình quyết định rõ ràng, ít mơ hồ.
- Dữ liệu đầu vào có cấu trúc (tag, title/description, email, trạng thái HR/LMS).
- Hành động đầu ra chuẩn hóa được (reactivate, note, reply, move stage).
- Đây là hướng đúng với Operating Engineer: giảm thao tác lặp, tăng tốc xử lý trước khi chạm vào root-cause code của hệ thống gốc.

## 4) Logic quyết định đã chốt

Workflow đang triển khai theo 4 quyết định:

- `AUTO_RESOLVE`: login issue + `LMS=deactivated` + `HR=active`
- `NEED_REVIEW`: login issue nhưng không đủ điều kiện auto
- `ESCALATE_HR`: login issue + `HR=terminated`
- `SKIP`: không đúng scope login hoặc thiếu điều kiện đầu vào

Luồng `AUTO_RESOLVE` hiện tại:

1. Đổi trạng thái ticket (`move stage`)
2. Ghi note nội bộ (`internal note`)
3. Gửi phản hồi khách hàng (`customer reply`)

## 5) Cách giảm rủi ro khi chạy automation

Để tránh xử lý sai hoặc crash:

- Chỉ xử lý khi ticket match rule theo stage + tag + intent.
- Hỗ trợ payload webhook thực tế từ Odoo Studio (bao gồm `_id`).
- Idempotency cho note để không ghi trùng ở các nhánh cần review/escalate.
- Nếu thiếu email hợp lệ thì `SKIP` an toàn, không gọi side effects.
- Parser dữ liệu Odoo đã harden cho `false/null/non-string`.

## 6) Kết quả mong đợi sau automation

- Giảm thời gian xử lý cho nhóm ticket login lặp lại.
- Tăng tính nhất quán phản hồi (note/email theo template).
- Giảm tải thao tác thủ công cho CS.
- Hạn chế lỗi do thao tác tay trong giờ cao điểm.

## 7) Phạm vi và giới hạn

Automation này giải quyết tầng vận hành, không thay thế hoàn toàn xử lý người:

- Không sửa root cause của hệ thống LMS/Odoo.
- Không tự xử lý các trường hợp ngoài rules (được chuyển `NEED_REVIEW`/`ESCALATE_HR`).
- Cần tiếp tục theo dõi metrics thực tế để tuning rule theo dữ liệu mới.

## 8) Kết luận

Chọn automation cho login deactivate là quyết định phù hợp với mục tiêu tuần 5:

- Đúng bài toán lặp lại
- Có điều kiện quyết định rõ
- Triển khai nhanh và đo được hiệu quả
- Giữ được ranh giới giữa Operating Engineer và Software Engineer
