# Tóm tắt phiên AI — Implement MockKBClient, kb CLI, test và README

> Phiên Cursor: 13–15/8/2026. Từ migrate JS → TypeScript, đổi hexagonal → layered, rồi mock-first Tuần 3 (MockKBClient + lệnh `kb` + test + README).  
> Đã được rút gọn thành bản tóm tắt này — không phải export chat nguyên xi.

## Mục tiêu phiên này

Tiếp tục `ticket-manager-cli` sau Week 2 JS/hexagonal: chuyển TypeScript với port/adapter thật, bám layered theo đề bài, rồi làm Tuần 3 **mock-first** (chưa HTTP).

## AI đã giúp gì?

### 1. Migrate JS → TypeScript (13/8)

- Chuyển source + test `.js` → `.ts`; thêm `typescript`, `tsx`, `@types/node`.
- Script: `start` = `tsx src/cli.ts`; `test` = `node --import tsx --test`; `typecheck`; `build`.
- Port/adapter: `implements` + `assert*` runtime (vì type TS bị xóa lúc chạy).
- Sửa IDE gạch đỏ: unhide `node_modules`, `"types": ["node"]`.
- Giải thích chạy CLI: `npx tsx src/cli.ts list` / `npm start -- list` (cần `--` để npm không nuốt arg); không còn `node src/cli.js`.
- Cập nhật README cho TypeScript.

### 2. Học TypeScript / hợp đồng port (14/8)

- `implements` = kiểm tra lúc compile: class phải có đủ method của interface.
- Logic vẫn viết trong service/client; interface không chứa business logic.
- `Promise<...>` = kiểu giá trị **đầu ra bất đồng bộ**.
- Vẫn giữ `assertTicketUseCases` / `assertKbClient` giống JS: TS không chặn object thiếu method lúc runtime (inject mock, JS thuần).
- Kết luận: TS = JS + kiểm tra compile; runtime check vẫn cần nếu ranh giới không được type bảo vệ.

### 3. Docs Tuần 3 tiếng Việt + hiểu KB

- Dịch `overview` / `architecture` / `tasks` tuần 3 sang `.vi.md`.
- Làm rõ: KB **production** là server khác; `MockKBClient` **không** phải folder/server riêng — class in-memory trong `ticket-manager-cli`.
- Không cần thư viện mock (Jest mock, nock, …) cho bước này: tự viết class implement `KbClient`.
- Thứ tự: test + mock client **trước**; HTTP/server thật **sau**. Không dựng mock HTTP server ở ngày 1–2.
- Cây KB (`/templates/email`, `/team/devops`) lấy từ `architecture` tuần 3, rút còn 3 doc seed.

### 4. Đổi hexagonal → layered (15/8)

- User lo mentor coi hexagonal là lệch đề (`commands/services/models/storage`).
- AI refactor: bỏ `adapters` / `application` / `domain`; thêm `commands/`, `services/`, `models/`, `storage/`.
- Test/README ticket cập nhật theo layout mới; Conventional Commits: type **`refactor`** (hợp lệ, không phải `fix`).

### 5. Catalog test Tuần 3 rồi TDD mock

- Viết `docs/plans/week-3/test-cases.vi.md` (đề xuất ~72 case mock → HTTP → E2E).
- Behavior nghiệp vụ mock và HTTP **giống nhau**; khác nguồn dữ liệu và lỗi mạng/API.
- TDD: test `MockKBClient` **fail trước**, rồi implement 4 thao tác + 3 seed doc.
- Commit user tự làm: `feat(ticket-manager-cli): add MockKBClient with unit tests`.

### 6. TDD nối CLI với MockKBClient

- Xác nhận bước: test CLI `kb ...` (Red) → code controller (Green). Không quên: inject client, 4 lệnh đề bài, lỗi thiếu input.
- Implement `kb search/list/retrieve/add` trong `ticket-cli-controller.ts`.
- Integration + E2E mock; catalog `test-mockKBClient.md` **để trong** `ticket-manager-cli/` cùng cấp `TEST-CATALOG.md`.
- Rà soát lỗ hổng: case lỗi/biên (query rỗng, flag thiếu, `--top-k`/`--limit` sai, search `[]`, case-insensitive). Suite **86 pass**.
- Test mới xanh trên code đã có; không thêm HTTP.

### 7. README, commit, HTTP sau này

- User undo commit AI tự tạo; chỉ cần **gợi ý message**.
- `wire` = nối CLI vào client.
- Tách commit: nối CLI (`feat`) vs README (`docs: add kb CLI usage to READMEs`).
- Cập nhật README liên quan (`ticket-manager-cli` + root); giữ README research AI tuần 2.
- Khi có HTTP: **lệnh `kb` không đổi**; factory đọc env (`KB_CLIENT_MODE`) sau inject test: `http` → `HTTPKBClient`, không set → mock.

## Workflow AI đã áp dụng

| Giai đoạn | Workflow | Ví dụ |
|---|---|---|
| Migrate TS | Iterative Refinement | Đổi file → sửa cách chạy CLI → hết gạch đỏ IDE → README |
| Học port/TS | Layered Questioning | `implements` → Promise → vì sao vẫn `assert*` lúc runtime |
| Tuần 3 mock-first | Solution Exploration | Mock in-process vs server giả vs HTTP thật |
| Kiến trúc | Solution Exploration | Hexagonal (học) → layered (bám đề / mentor) |
| TDD KB | Iterative Refinement | Catalog → unit mock Red/Green → CLI Red/Green → rà test còn thiếu |
| Docs/commit | Iterative Refinement | User sửa wording catalog, tách commit, AI không commit hộ |

## Quyết định kỹ thuật (AI gợi ý → tôi chọn/verify)

- Dev runner: `tsx`, không chạy `node` trực tiếp file `.ts`.
- Port: type `implements` + assert runtime.
- Layout: **layered** theo đề tuần 2, không giữ hexagonal trên source nộp.
- Mock: class in-process trong cùng package; không Jest mock, không server riêng.
- Cùng `KbClient` cho mock và HTTP; HTTP/`KB_CLIENT_MODE` chưa viết.
- Catalog mock tách file, nằm trong `ticket-manager-cli/`.
- User tự commit; AI chỉ đề xuất Conventional Commits.

## Chỗ tôi đã chủ động / sửa AI

- Hỏi lại cách chạy (`npm start -- list`, có cần `npm i`, còn dùng Node không).
- Đòi giải thích `implements` / Promise / assert runtime, không implement xong là xong.
- Chọn **layered** vì không chắc hexagonal được mentor cộng điểm.
- Bắt TDD: test fail hết rồi mới viết code mock và CLI.
- Catalog mock không ghi “cố ý chưa viết HTTP”.
- Đổi tên bảng rule thành “các rule mà test đang cover”.
- Undo commit AI; README commit phải có chữ **add**; chỉ cập nhật README liên quan.

## Kết quả cuối phiên

- CLI TypeScript, layered: ticket tuần 2 + `kb` tuần 3 trên MockKBClient.
- Test: ticket cũ + mock unit/integration/E2E; **86 pass**.
- Docs: tuần 3 tiếng Việt, `TEST-CATALOG.md`, `test-mockKBClient.md`, README có HDSD `kb`.
- **Chưa có** `HTTPKBClient` / đọc env — bước lớn tiếp theo.

## Bằng chứng tham khảo

- Source: [`ticket-manager-cli/`](../../ticket-manager-cli/)
- README CLI: [`ticket-manager-cli/README.md`](../../ticket-manager-cli/README.md)
- Catalog ticket: [`ticket-manager-cli/TEST-CATALOG.md`](../../ticket-manager-cli/TEST-CATALOG.md)
- Catalog mock: [`ticket-manager-cli/test-mockKBClient.md`](../../ticket-manager-cli/test-mockKBClient.md)
- Kế hoạch tuần 3: [`docs/plans/week-3/`](../../docs/plans/week-3/)
