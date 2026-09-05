# Tóm tắt phiên AI — Git setup, implement Green phase và hoàn thiện CLI

> Phiên Cursor: cấu hình git, implement code từ test đỏ → xanh, refactor hexagonal, docs và UX CLI.  
> Export gốc: 8/10/2026 — đã được rút gọn thành bản tóm tắt này.

## Mục tiêu phiên này

Hoàn thiện Ticket Manager CLI Week 2: implement business logic, làm test pass, refactor entity/ports, viết README tiếng Việt, cải thiện CLI.

## AI đã giúp gì?

### 1. Setup Git repository

- Cấu hình root `.gitignore` chỉ track `ticket-manager-cli/` (ban đầu).
- Sau mở thêm `research-and-ai-implementation/`, `week-1/tdd-foundation/`.
- Giải thích `.gitkeep` giữ folder `data/` trên git.

### 2. Nắm yêu cầu & implement Green phase

- Đọc `docs/plans` Week 1–2, map yêu cầu sang hexagonal.
- Xác nhận repo đang Red phase (42 test fail) → implement để test pass.
- Implement lần lượt:
  - Domain validation + `Ticket` entity
  - `TicketService` (create, list, show, update)
  - `JsonTicketRepository` (load/save JSON)
  - CLI controller (`runCli`, parse args, handle commands)
- Sửa validation chạy **trước** I/O (fail fast khi thiếu status).

### 3. Học Hexagonal qua code thật

- Giải thích `domain/tickets`: rule nghiệp vụ, validation.
- Giải thích `TicketService`: use case, orchestration.
- Map `commands/services/models` (đề bài) → `adapters/application/domain` (hexagonal).
- Giải thích CLI command = inbound adapter.
- Refactor plain object → **`Ticket` class entity** (create, updateStatus, fromPersistence, toJSON).
- Thêm inbound/outbound ports; đổi tên file port rõ `inbound-port` / `outbound-port`.

### 4. CLI & developer experience

- Viết README tiếng Việt: overview, cài đặt, lệnh, kiến trúc, chạy test.
- Giải thích cú pháp `--title`, `--status`, `--data-file` (option vs positional).
- Giải thích `#!/usr/bin/env node`, `bin.tickets` trong package.json.
- Implement **case-insensitive** cho command và option names + test cover.

### 5. Folder research-and-ai-implementation

- Tạo folder ở root để lưu quá trình làm việc với AI.
- Ban đầu export chat; sau chuyển sang **tóm tắt có cấu trúc** (file này).

## Workflow AI đã áp dụng

| Giai đoạn | Workflow | Ví dụ |
|---|---|---|
| Đọc yêu cầu | Layered Questioning | Hỏi domain/service/adapter làm gì trước khi code |
| Implement | Iterative Refinement | Stub → Green → refactor entity class → thêm ports |
| UX CLI | Solution Exploration | Thảo luận `--` cho field entity vs `--data-file` kỹ thuật |
| Case-insensitive | Solution Exploration | User nhận ra thiếu → AI thêm feature + test |

## Quyết định kỹ thuật (AI gợi ý → tôi chọn/verify)

- Entity dùng class `Ticket` thay vì plain object.
- Port naming: `ticket-use-cases-inbound-port`, `ticket-repository-outbound-port`.
- Update ticket **chỉ đổi status** (theo đề Week 2).
- JSON root phải là array `[...]`, không phải `{ tickets: [] }`.
- File missing → `[]`; file corrupt → `StorageError`.

## Chỗ tôi đã chủ động / sửa AI

- Chọn hexagonal để học dù không bắt buộc.
- Yêu cầu chuyển sang class entity vì thấy plain object “thiếu chuẩn”.
- Yêu cầu inbound port rõ ràng, tên file port dễ đọc.
- Yêu cầu README tiếng Việt.
- Chủ động yêu cầu case-insensitive CLI vì UX quan trọng.
- Hỏi lại nhiều chỗ lý thuyết: env node, errors.js, list/show qua entity.

## Kết quả cuối phiên

- **42/42 test pass** (unit + integration + E2E).
- CLI chạy được: `create`, `list`, `show`, `update`.
- Code hexagonal: domain → application/ports → adapters.
- README + TEST-CATALOG tiếng Việt/ song ngữ phục vụ review.

## Bằng chứng tham khảo

- Source: [`ticket-manager-cli/`](../../ticket-manager-cli/)
- Test catalog: [`ticket-manager-cli/TEST-CATALOG.md`](../../ticket-manager-cli/TEST-CATALOG.md)
- TDD foundation Week 1: [`week-1/tdd-foundation/`](../../week-1/tdd-foundation/)
