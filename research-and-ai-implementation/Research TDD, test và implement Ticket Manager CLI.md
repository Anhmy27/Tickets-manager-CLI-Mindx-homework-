# Tóm tắt phiên AI — Research TDD, test và implement Ticket Manager CLI

> Phiên Cursor: research Week 1, scaffold tuần 2, thiết kế test, chuyển sang hexagonal.  
> Export gốc: 8/10/2026 — đã được rút gọn thành bản tóm tắt này.

## Mục tiêu phiên này

Chuẩn bị và triển khai Week 2 theo TDD: từ research → scaffold project → viết test (Red) → hiểu rõ unit/integration/E2E → refactor sang Hexagonal Architecture.

## AI đã giúp gì?

### 1. Research & làm rõ Week 1

- Giữ nguyên bài research TDD, copy vào `docs/plans/week-1/`.
- Dịch `overview.md` tuần 1 sang tiếng Việt.
- Giải thích thêm phần **Testing cho CLI** (lệnh, validation, lưu file, lỗi).
- Làm rõ đoạn “test là lớp kiểm soát AI”: viết/review test → AI implement → chạy test → refactor → chạy lại test.
- Format lại research cho dễ đọc; bổ sung mục “cần test những gì cho CLI”.
- Giải thích thứ tự viết test tuần 2: validation → service → storage → CLI wiring → E2E.

### 2. Scaffold `ticket-manager-cli/`

- Tạo folder `ticket-manager-cli/` ở root (cùng cấp slides/docs).
- Cấu trúc ban đầu: `src/` (domain, services, adapters), `tests/`, `data/`, README, package.json.
- Giải thích `data/` dùng lưu JSON; integration test dùng **temp folder**, không dùng `data/` thật.

### 3. Thiết kế test suite (Red phase)

- Đọc yêu cầu Week 2, viết test validation + service + storage + CLI + E2E.
- Dùng Node.js built-in test runner (`node:test`), không thêm framework ngoài.
- Ban đầu ~31 test; sau đó bổ sung thêm case lỗi → tổng **42 test**.
- Tạo `TEST-CATALOG.md`: mỗi test ghi rõ đầu vào, mong đợi, dịch tiếng Việt.

### 4. Chuyển sang Hexagonal Architecture

- User chọn học hexagonal dù Week 2 không bắt buộc.
- AI xác nhận JSON file adapter thay cho DB.
- Refactor `src/` sang: `domain/`, `application/ports`, `application/use-cases`, `adapters/inbound`, `adapters/outbound`.
- Giải thích vai trò CLI adapter vs controller, `cli.js` là entrypoint mỏng.
- Cập nhật import trong test theo cấu trúc mới.

### 5. Học & hỏi đáp trong lúc làm

- Phân biệt MVC vs hexagonal; folder services/models map sang domain/use-cases/adapters.
- Priority (`low` / `medium` / `high`), tags tự do.
- TDD: unit là trọng tâm; integration/E2E có thể viết sớm hoặc sau refactor.
- Thứ tự TDD thực tế: Red (test fail) trước khi có implementation.

## Workflow AI đã áp dụng

| Giai đoạn | Workflow | Ví dụ |
|---|---|---|
| Research TDD | Layered Questioning | Hỏi “test CLI cần gì?” → ví dụ → kiểm chứng với Ticket Manager |
| Chọn kiến trúc | Solution Exploration | So sánh MVC/layered vs hexagonal; chọn hexagonal để học |
| Refactor cấu trúc | Iterative Refinement | Scaffold MVC → user yêu cầu hexagonal → AI refactor lại |
| Thiết kế test | Iterative Refinement | 31 test → user phát hiện thiếu case lỗi → bổ sung lên 42 |

## Quyết định kỹ thuật (AI gợi ý → tôi chọn/verify)

- Test runner: Node built-in `node:test` + `node:assert`.
- Storage: JSON file qua outbound adapter, không dùng DB.
- Kiến trúc: hexagonal tối giản (domain + ports + adapters).
- Test isolation: temp dir cho integration/E2E, không đụng `data/tickets.json` thật.

## Chỗ tôi đã chủ động / sửa AI

- Chọn hexagonal dù đề Week 2 chỉ yêu cầu layered đơn giản.
- Yêu cầu format research, bổ sung phần testing CLI, dịch overview.
- Yêu cầu TEST-CATALOG rõ đầu vào/mong đợi thay vì chỉ liệt kê tên test.
- Hỏi lại khi chưa hiểu Red-Green-Refactor, thứ tự viết test, validate vs nghiệp vụ.

## Kết quả cuối phiên

- Project scaffold sẵn ở trạng thái **Red phase** (test fail, stub implementation).
- Test suite + TEST-CATALOG khóa spec hành vi Week 2.
- Source đã chuyển layout hexagonal, sẵn sàng implement Green phase ở phiên tiếp theo.

## Bằng chứng tham khảo

- Research Week 1 đầy đủ: [`research-week-1/`](../research-week-1/)
- ChatGPT research links: xem cuối `research-week-1/research-tdd-ticket-manager-cli.md`
