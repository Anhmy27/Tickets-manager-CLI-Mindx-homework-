# Week 2 - Tóm tắt làm việc với AI

## Mục tiêu tuần

Hoàn thiện Ticket Manager CLI theo TDD: scaffold project, viết test trước, implement để test pass, refactor cấu trúc, viết README và cải thiện UX CLI.

## AI đã hỗ trợ gì?

### 1. Scaffold `ticket-manager-cli`

- Tạo folder `ticket-manager-cli` với các phần chính: `src`, `tests`, `data`, `README.md`, `package.json`.
- Giải thích vai trò folder `data`: nơi lưu JSON thật khi chạy CLI.
- Giải thích vì sao integration/E2E test dùng temp folder, không ghi trực tiếp vào `data/tickets.json` thật.

### 2. Thiết kế test suite trước khi implement

- Đọc yêu cầu Week 2 rồi viết test cho validation, service, storage, CLI và E2E.
- Dùng Node.js built-in test runner (`node:test`, `node:assert`), không thêm framework ngoài.
- Ban đầu có khoảng 31 test, sau bổ sung thêm case lỗi thành 42 test.
- Tạo `TEST-CATALOG.md`, mỗi test có mô tả đầu vào và kết quả mong đợi.
- Làm rõ thứ tự test thực tế cho CLI: validation -> service -> storage -> CLI wiring -> E2E.

### 3. Implement để test pass

- AI đọc lại `docs/plans` Week 1-2 và map yêu cầu sang code.
- Xác nhận repo đang ở trạng thái test đỏ rồi implement lần lượt:
  - Domain validation và `Ticket` entity.
  - `TicketService` cho `create`, `list`, `show`, `update`.
  - `JsonTicketRepository` để load/save JSON.
  - CLI controller (`runCli`, parse args, handle commands).
- Sửa validation chạy trước I/O để khi input sai thì fail fast, không đọc/ghi file không cần thiết.

### 4. Học và refactor theo Hexagonal Architecture

- AI giải thích `domain/tickets`, `TicketService`, inbound/outbound adapter và port.
- Refactor source sang hướng hexagonal tối giản:
  - domain/rule nghiệp vụ
  - application/use cases
  - inbound adapter cho CLI
  - outbound adapter cho JSON repository
- Giải thích CLI command là inbound adapter, còn JSON file là outbound adapter.
- Refactor plain object thành `Ticket` class entity với `create`, `updateStatus`, `fromPersistence`, `toJSON`.
- Thêm port rõ hơn cho use case và repository.

### 5. Hoàn thiện README và UX CLI

- Viết README tiếng Việt: overview, cài đặt, cách chạy lệnh, kiến trúc, test.
- Giải thích cú pháp command/options như `--title`, `--status`, `--data-file`.
- Giải thích `#!/usr/bin/env node` và `bin.tickets` trong `package.json`.
- Bổ sung case-insensitive cho command và option names sau khi mình nhận ra UX còn thiếu.

## Workflow AI đã áp dụng

| Giai đoạn | Workflow | Ví dụ |
|---|---|---|
| Đọc yêu cầu | Layered Questioning | Hỏi domain/service/adapter làm gì trước khi code |
| Thiết kế test | Iterative Refinement | 31 test -> bổ sung case lỗi -> 42 test |
| Implement | Iterative Refinement | Stub -> Green -> refactor entity class -> thêm ports |
| Kiến trúc | Solution Exploration | So sánh MVC/layered/hexagonal; chọn hexagonal để học |
| UX CLI | Solution Exploration | Thảo luận option, `--data-file`, case-insensitive |

## Quyết định kỹ thuật mình đã chốt/verify

- Dùng Node.js built-in test runner (`node:test`, `node:assert`), không thêm test framework nặng.
- Storage dùng JSON file qua repository/outbound adapter, không dùng database.
- Entity dùng class `Ticket` thay vì chỉ là plain object.
- `update` chỉ đổi `status`, đúng phạm vi Week 2.
- JSON root phải là array `[...]`, không phải `{ tickets: [] }`.
- File JSON thiếu thì trả `[]`; file corrupt thì báo lỗi rõ.
- Test isolation dùng temp folder cho integration/E2E.

## Mình đã chủ động kiểm chứng/chỉnh AI ở đâu?

- Chọn học hexagonal dù đề Week 2 không bắt buộc.
- Yêu cầu chuyển sang class entity vì plain object nhìn chưa đủ rõ behavior.
- Yêu cầu README tiếng Việt.
- Yêu cầu `TEST-CATALOG.md` ghi rõ input/expected result.
- Chủ động hỏi lại các phần chưa hiểu: Red-Green-Refactor, validation vs nghiệp vụ, `#!/usr/bin/env node`, `errors.js`, list/show qua entity.
- Không để AI commit thay; mình tự commit, AI chỉ gợi ý message.

## Kết quả và artifact

- Source chính: `week-2/ticket-manager-cli/`
- CLI chạy được các lệnh:
  - `create`
  - `list`
  - `show`
  - `update`
- Tài liệu:
  - `week-2/ticket-manager-cli/README.md`
  - `week-2/ticket-manager-cli/TEST-CATALOG.md`
- Kết quả kiểm tra sau khi restructure repo:
  - `npm test`: pass `95/95`
  - `npm run build`: pass
  - `npm run typecheck`: pass

Ghi chú: source hiện tại đã có thêm phần KB ở các tuần sau, nên số test hiện tại lớn hơn mốc 42 test ban đầu của Week 2.

## Kết luận tuần 2

Tuần 2 là phần biến research TDD thành code thật: viết test trước, implement theo test, refactor để hiểu kiến trúc, rồi hoàn thiện README và trải nghiệm CLI.
