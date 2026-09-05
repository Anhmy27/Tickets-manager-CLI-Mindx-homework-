# Week 5 - Tóm tắt làm việc với AI

## Mục tiêu tuần

- Không mở rộng thêm Ticket CLI, mà làm một package riêng cho bài toán Operating Engineer.
- Tự động hóa nhóm ticket “không đăng nhập được do tài khoản LMS bị deactivate”.
- Tích hợp với Odoo theo hai cách:
  - Scan ticket theo stage bằng `npm start`.
  - Nhận webhook real-time bằng `npm run dev`.
- Giữ an toàn: chỉ auto-resolve khi đủ điều kiện, còn case mơ hồ chuyển cho người review.

## Vì sao chọn bài toán login deactivate?

- Dựa trên dữ liệu export Odoo, nhóm login issue là nhóm lớn nhất: `8/16` ticket, tương đương khoảng `50%`.
- Đây là pattern vận hành lặp lại, không phải mỗi ticket là một bug mới.
- Quy trình quyết định rõ:
  - Có tín hiệu login.
  - Có email hợp lệ.
  - Check HR status.
  - Check LMS status.
  - Quyết định `AUTO_RESOLVE`, `NEED_REVIEW` hoặc `SKIP`.
- Hành động đầu ra chuẩn hóa được: move stage, ghi internal note, gửi customer reply.
- Case này đúng mindset Operating Engineer: giảm thao tác tay bằng automation trước khi đụng đến root-cause code của LMS.

## AI đã hỗ trợ gì?

### 1. Thiết kế workflow

- Tách logic thành các phần rõ:
  - `analyze-ticket.ts`: nhận diện ticket có thuộc scope login hay không.
  - `workflow.ts`: quyết định và gọi side effects.
  - Odoo client: fetch ticket, move stage, post note, post reply.
  - Mock HR/LMS: kiểm tra trạng thái nhân sự và tài khoản học viên.
- Chốt 3 outcome:
  - `AUTO_RESOLVE`: login issue + email hợp lệ + `HR=active` + `LMS=deactivated`.
  - `NEED_REVIEW`: login issue nhưng không đủ điều kiện auto.
  - `SKIP`: không đúng scope hoặc thiếu điều kiện đầu vào.

### 2. Hoàn thiện rule an toàn

- Nhận diện login candidate theo fallback: tag -> title -> description.
- Tag login là tín hiệu mạnh, nhưng title/description vẫn là fallback khi CS quên tag.
- Bỏ hướng `ESCALATE_HR`; `HR=terminated` chuyển sang `NEED_REVIEW` để người thật xử lý.
- Nếu thiếu email hợp lệ thì `SKIP`, không gọi side effects.
- Với `NEED_REVIEW`, tránh ghi note trùng bằng bot marker.

### 3. Tích hợp Odoo webhook

- Thêm `src/webhook-server.ts` với:
  - `POST /webhook`.
  - `GET /health`.
- Parse ticket id từ nhiều dạng payload:
  - `id`.
  - tuple `[id, name]`.
  - `data.id`.
  - `_id` từ Odoo Studio webhook envelope.
- Với webhook path, server fetch ticket thật từ Odoo rồi normalize stage intake trong memory để reuse cùng `processTicket()`.
- Dùng ngrok để nhận webhook từ Odoo về local.

### 4. Debug runtime thực tế

- Fix sai route `/weebhook` thay vì `/webhook`.
- Nhận ra sau khi sửa code webhook phải restart `npm run dev`, nếu không Odoo vẫn gọi server cũ.
- Dùng ngrok inspector (`127.0.0.1:4040`) để xem payload/status.
- Harden Odoo field parser vì Odoo có thể trả `false/null/non-string`, ví dụ lỗi `value.match is not a function`.

### 5. Tài liệu và test

- AI hỗ trợ cập nhật `README.md`, `TEST-CATALOG.md`, report day 1-2 và hướng dẫn chạy local.
- Viết test cho:
  - Detect login theo tag/title/description.
  - Parse webhook `_id`.
  - Missing email không crash và không side effect.
  - Odoo falsey fields.
  - Order `AUTO_RESOLVE`: move stage -> internal note -> customer reply.
  - Idempotency cho note `NEED_REVIEW`.

## Quyết định kỹ thuật mình đã chốt

- Dùng Node/TypeScript, không chuyển Python.
- `odoo-automation` là package độc lập, không nhét vào Ticket CLI.
- Mock HR/LMS dùng cho demo và test, vì không có quyền gọi hệ thống HR/LMS thật.
- `requiredStageId` và `resolvedStageId` lấy từ `ticket-rules.json` như single source of truth.
- `AUTO_RESOLVE` không cố làm idempotent tuyệt đối để demo/replay dễ hơn, nhưng `NEED_REVIEW` note thì cần idempotent để tránh spam note.
- Automation không đóng ticket hoàn toàn; chỉ move sang stage đã cấu hình và gửi phản hồi.

## Mình đã chủ động kiểm chứng/chỉnh AI ở đâu?

- Chọn bài toán dựa trên data, không chọn vì “nghe hay”: login issue chiếm 50% dataset.
- Hỏi lại ranh giới OE vs SE: automation vận hành không thay thế root-cause code fix.
- Chốt `HR=terminated` không auto-reactivate, vì đó là quyết định nhạy cảm.
- Bắt harden payload thật từ Odoo thay vì chỉ pass mock unit test.
- Yêu cầu giải thích các khái niệm mentor có thể hỏi: automation rate, configuration management, non-invasive, boundary awareness.

## Kết quả và artifact

- Source package: `week-5/odoo-automation/`
- Report chọn bài toán automation:
  - `week-5/odoo-automation/week-5/day-1-2-report-login-deactivate.md`
- Test catalog:
  - `week-5/odoo-automation/TEST-CATALOG.md`
- Kết quả kiểm tra sau restructure repo:
  - `npm test`: pass `54/54`
  - `npm run build`: pass
  - `npm run typecheck`: pass

## Kết luận tuần 5

Tuần 5 là phần nối giữa Operating Engineer mindset và automation thật: mình chọn một nhóm ticket có volume cao, rule rõ, rủi ro kiểm soát được, rồi tự động hóa phần lặp lại nhưng vẫn giữ human-in-the-loop cho case không chắc chắn.
