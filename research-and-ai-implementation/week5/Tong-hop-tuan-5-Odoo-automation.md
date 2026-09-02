# Tổng hợp Tuần 5 - Odoo Automation (Login Issue)

Tài liệu này tổng hợp lại những gì mình và AI đã làm từ lúc chuẩn bị tuần 5 đến khi chạy được automation end-to-end với Odoo webhook.

## 1) Mục tiêu tuần 5 đã chốt

- Không mở rộng thêm `ticket-manager-cli` cho tuần 5.
- Làm package riêng `odoo-automation/` theo mindset Operating Engineer.
- Tự động hóa case login issue:
  - Nhận ticket
  - Phân tích login intent
  - Check HR + LMS (mock)
  - Quyết định xử lý (`AUTO_RESOLVE`, `NEED_REVIEW`, `SKIP`)

## 2) Giai đoạn chuẩn bị

- Rà đề bài và tài liệu trong `docs/plans/week-5/`.
- Việt hóa tài liệu tuần 5 để dễ bám roadmap:
  - `overview.vi.md`
  - `tasks.vi.md`
  - `architecture.vi.md`
- Chốt hướng làm:
  - Dùng Node/TypeScript (không chuyển Python)
  - Mock-first cho HR/LMS
  - Odoo là entrypoint qua API + webhook

## 3) Thiết kế giải pháp

### Hai mode chạy

- `npm start`: quét 1 lần các ticket ở intake stage.
- `npm run dev`: chạy webhook server để nhận event real-time.

### Luồng webhook

- Odoo automation gửi webhook đến ngrok URL `/webhook`.
- Server parse ticket id từ payload.
- Fetch ticket theo id từ Odoo JSON-RPC.
- Normalize stage intake cho webhook path.
- Gọi workflow xử lý như mode `npm start`.

### Nguồn cấu hình

- Biến môi trường Odoo ở `.env`.
- `requiredStageId` và `resolvedStageId` chỉ lấy từ `ticket-rules.json`.
- Dữ liệu mock HR/LMS lấy từ `mock-users.json`.

## 4) Những thay đổi kỹ thuật chính đã triển khai

### A. Core workflow và rules

- Tách rõ phân tích (`analyze-ticket.ts`) và hành động (`workflow.ts`).
- Nhận diện login candidate theo fallback: tag -> title -> description.
- Đổi stage resolved sang `2` (in progress), không tự đóng ticket.

### B. Webhook server

- Thêm `src/webhook-server.ts` với:
  - `POST /webhook`
  - `GET /health`
- `npm run dev` giữ trạng thái listen, không polling loop.

### C. Fix payload Odoo Studio

- Hỗ trợ parse id từ các dạng:
  - `id`
  - `id: [id, name]`
  - `data.id`
  - `_id` (Odoo Studio webhook envelope)

### D. Idempotency và an toàn xử lý

- Tránh duplicate note bằng marker bot (`hasAutomationNote`).
- Harden parser field Odoo để chịu được dữ liệu `false/null/non-string`.
- Nếu ticket thiếu email hợp lệ:
  - Không crash
  - Trả `SKIP` an toàn
  - Không gọi side effects (note/mail/move stage/HR/LMS)

### E. Thứ tự AUTO_RESOLVE đã cập nhật

Thứ tự cuối cùng:

1. Move stage
2. Post internal note
3. Post customer reply

Áp dụng cho cả `npm start` và `npm run dev` vì dùng chung `processTicket()`.

## 5) Debug và vận hành thực tế với Odoo/ngrok

Các issue thực tế đã gặp và xử lý:

- 404 do sai path `/weebhook` thay vì `/webhook`.
- 400 do server cũ chưa restart sau khi sửa parser `_id`.
- Runtime error `value.match is not a function` khi Odoo trả field kiểu `false`.

Kinh nghiệm chốt:

- Mỗi lần đổi code webhook phải restart `npm run dev`.
- Dùng ngrok inspector (`127.0.0.1:4040`) để kiểm payload và status code.
- Với UI Odoo:
  - Trigger `Khi tạo và chỉnh sửa`
  - `Khi cập nhật` chọn `Email khách hàng`
  - Thêm domain/miền để giảm webhook call không cần thiết

## 6) Test và chất lượng

- Mở rộng test unit lên 52 test pass.
- Bổ sung test cho:
  - Parse `_id` webhook
  - Order `move -> note -> mail` trong `AUTO_RESOLVE`
  - Case thiếu email không crash và `SKIP`
  - Tolerate Odoo falsey fields khi map record
- Kiểm tra lint sau các lần chỉnh sửa chính: không có lỗi mới.

## 7) Kết quả cuối cùng đạt được

- Automation tuần 5 chạy được theo hai mode scan + webhook.
- Webhook Odoo qua ngrok hoạt động ổn định.
- Bot xử lý login issue đúng logic đã chốt.
- Hệ thống an toàn hơn với payload thực tế từ Odoo (đặc biệt ticket thiếu email ở thời điểm autosave).
- README root và `odoo-automation/README.md` đã đồng bộ theo behavior mới nhất.

## 8) Commit theme đã dùng xuyên suốt

- `fix(webhook...)`: fix parse payload và route
- `refactor/workflow...`: đổi thứ tự xử lý auto resolve
- `fix(odoo-automation...)`: chống crash thiếu email
- `docs(readme...)`: cập nhật tài liệu theo phiên bản mới nhất

---

Nếu cần nộp mentor, có thể dùng tài liệu này làm "AI implementation log" của tuần 5, kèm screenshot ngrok/Odoo và test pass.
