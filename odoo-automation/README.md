# odoo-automation

Script tự động hóa tuần 5 cho nhóm ticket đăng nhập trên Odoo.

## Phạm vi

- Quét ticket ở stage intake theo ID (`requiredStageId`).
- Nhận diện ticket login theo `tagKeywords` kết hợp tín hiệu mạnh từ title/description.
- Kiểm tra trạng thái HR (mock) và LMS (mock) theo email trong ticket.
- Chỉ auto resolve khi `LMS=deactivated` và `HR=active`.
- Thứ tự `AUTO_RESOLVE`: đổi stage -> ghi note nội bộ -> gửi phản hồi khách hàng.
- Hỗ trợ payload webhook của Odoo Studio (`_id`) và các dạng phổ biến (`id`, `data.id`).
- Nếu ticket không có email hợp lệ thì `SKIP` an toàn (không crash, không side effects).

## Diễn giải SLA

- Bước ghi nhận/ưu tiên ticket (`15m`) do quy trình Odoo xử lý.
- Bước phản hồi ban đầu (`30m`) vẫn giữ nguyên yêu cầu.
  - `AUTO_RESOLVE`: script gửi một phản hồi gộp ACK + hướng đã xử lý.
  - `NEED_REVIEW`/`ESCALATE_HR`: script chỉ ghi note nội bộ, agent xử lý thủ công tiếp.

## Cài đặt

1. Copy `.env.example` thành `.env` và điền giá trị thật.
2. Sửa `ticket-rules.json` theo dữ liệu/pattern bạn xuất từ Odoo (bao gồm stage IDs).
3. Sửa `mock-users.json` theo đúng email test dùng trong ticket Odoo.

## Lệnh chạy

```bash
npm install
npm test
npm start
npm run dev
```

- `npm start`: chế độ quét một lần từ intake stage.
- `npm run dev`: chế độ webhook với Express server tại `POST /webhook`.

## Các quyết định đầu ra

- `AUTO_RESOLVE`: kích hoạt lại tài khoản trong mock LMS, đổi sang resolved stage, ghi note nội bộ, gửi phản hồi khách hàng.
- `NEED_REVIEW`: chỉ ghi note nội bộ, cần agent ACK và xử lý tiếp.
- `ESCALATE_HR`: chỉ ghi note nội bộ, không kích hoạt lại tài khoản.
- `SKIP`: không cập nhật gì lên Odoo (bao gồm thiếu tín hiệu login hoặc thiếu email khách hàng).

## Nguồn cấu hình stage

`requiredStageId` và `resolvedStageId` chỉ cấu hình trong `ticket-rules.json`.

`NEED_REVIEW` chỉ dùng sau khi ticket đã được xác nhận là login-related.

Phiên bản này không dùng `skipKeywords`; `SKIP` được quyết định theo rule checks (stage/tag/intent) hoặc thiếu email khách hàng.

## Ghi chú payload webhook

Khi dùng Odoo Studio automation "Send webhook notification", payload có thể có dạng:

```json
{
  "_action": "Send webhook notification(...)",
  "_id": 15,
  "_model": "helpdesk.ticket"
}
```

Project này nhận trực tiếp `_id` làm ticket ID để xử lý webhook.
