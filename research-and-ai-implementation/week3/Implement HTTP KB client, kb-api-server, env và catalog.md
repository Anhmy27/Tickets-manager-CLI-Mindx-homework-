# Tóm tắt phiên AI — HTTP KB client, kb-api-server, env và catalog

> Phiên Cursor: 16/8/2026, từ câu hỏi “giờ đến phần client thật / URL API tự thiết kế đúng không?” đến khi có HTTP client, `.env`, KB API server layered, unit/integration test, catalog, README root, và dọn workspace.  
> Đã được rút gọn thành bản tóm tắt này — không phải export chat nguyên xi.

## Mục tiêu phiên này

Làm nốt Tuần 3 sau mock-first: **HTTP KB client** gọi API thật, switch bằng env, rồi có **KB API server cùng cấp CLI** để chạy end-to-end (không chỉ stub trong test).

## AI đã giúp gì?

### 1. Làm rõ hợp đồng URL (đề bài vs tự thiết kế)

- Đề tuần 3 chỉ chốt **protocol**: JSON + HTTP, 4 thao tác `search/list/retrieve/add`.
- **Không** bắt tên host/cổng/env. `nodePath` là field JSON, không phải URL folder.
- Tự thiết kế: `KB_API_BASE_URL` (ví dụ `http://127.0.0.1:4100`) + path cứng `POST /search|/list|/retrieve|/add`.
- Lệnh CLI `kb ...` **không đổi** khi chuyển mock → HTTP; chỉ đổi client phía dưới.

### 2. Package `kb-api-client` (HTTP caller)

- Tách HTTP (`fetch`, URL, status, parse JSON, map lỗi) khỏi CLI.
- CLI import qua `"kb-api-client": "file:../kb-api-client"` + adapter `HttpKbClientAdapter`.
- Factory `createKbClientFromEnv()`: `KB_CLIENT_MODE=http` → adapter; không set / `mock` → `MockKBClient`.
- Test client: unit (inject `fetchImpl`) + integration (stub `listen(0)` trong test). Catalog `kb-api-client/TEST-CATALOG.md` (10 test).
- User hỏi vì sao “ít test”: client **không lặp** business mock; unit khóa URL/payload/status mapping. Bổ sung thêm case mạng/`500`/normalize tags khi user bảo “cần thì phải bổ sung”.

### 3. `.env` cho CLI

- User: “thế env đâu?” → CLI đã đọc `process.env` nhưng chưa có file.
- Thêm `loadEnvFile` lúc `runCli`; `.env.example` + `.env` local; shell thắng file.
- `4100` chỉ là **placeholder local** trong `KB_API_BASE_URL`.

### 4. Vai trò client vs server

- `kb-api-client`: **thư viện caller**. CLI import để gửi `POST` tới `${baseUrl}/search|/list|/retrieve|/add`, map status → lỗi. Không listen cổng.
- `kb-api-server`: **HTTP service**. Process riêng, `listen` (mặc định `127.0.0.1:4100`), nhận request, chạy business KB, trả JSON.
- CLI nối client bằng `"kb-api-client": "file:../kb-api-client"` rồi `import { HTTPKBClient } from 'kb-api-client'`.
- Đề không bắt tách client thành package riêng; tách để HTTP details không nằm trong CLI, test độc lập, tái dùng.

### 5. Package `kb-api-server` (provider listen port)

- Server cùng cấp: `POST /search|/list|/retrieve|/add`, mặc định `127.0.0.1:4100`.
- User bắt layered: `controllers/routes/services/repositories/models/errors/utils/config`.
- Entry: `src/cli.ts` (`npm start`); `server.ts` = bootstrap; `index.ts` = public export (không chạy process).
- Integration 20 case (happy + error matrix) rồi user hỏi unit: thêm unit `KbService` / `routeKbRequest` / `readPort` → **36 pass**.
- Catalog tiếng Việt giống CLI/client; gitignore `kb-api-server/node_modules`.

### 6. Docs + commit message

- README root: 3 package + luồng E2E HTTP.
- User tự commit; AI **chỉ nghĩ message**, tách test → code → docs (mỗi README/catalog 1 commit khi user yêu cầu).

## Workflow AI đã áp dụng

| Giai đoạn     | Workflow             | Ví dụ                                                |
| ------------- | -------------------- | ---------------------------------------------------- |
| Hợp đồng API  | Layered Questioning  | Đề chốt path JSON, không chốt base URL               |
| HTTP client   | Iterative Refinement | Package + adapter + env + catalog                    |
| Học kiến trúc | Solution Exploration | Client = caller; server = listener                   |
| Server        | Iterative Refinement | MVP 1 folder `src` → layered; 5 test → 36 test       |
| Docs/commit   | Iterative Refinement | User sửa wording, tách commit, không để AI commit hộ |

## Quyết định kỹ thuật (AI gợi ý → tôi chọn/verify)

- Base URL tự đặt: `http://127.0.0.1:4100`; path theo đề.
- HTTP client: package sibling + `file:` dependency (không bắt buộc bởi đề).
- Server: **phải có** ở root để HTTP mode chạy thật; in-memory store + seed 3 doc giống mock.
- Env: `KB_CLIENT_MODE`, `KB_API_BASE_URL`; load `.env` không ghi đè shell.
- Test: unit (service/route/env) + integration HTTP contract; catalog tiếng Việt.
- User tự commit; Conventional Commits.

## Chỗ tôi đã chủ động / sửa AI

- Hỏi lại: đề có bắt tên URL không; tự thiết kế `KB_API_BASE_URL`.
- Đòi server cùng cấp CLI để HTTP mode chạy end-to-end.
- Bắt chia folder server, thêm unit (TDD), catalog chi tiết, gitignore `node_modules`.
- Dọn workspace: xóa hẳn folder, không để thư mục rỗng.
- Undo/chặn AI commit; bắt nghĩ message đúng thứ tự test → code → docs; mỗi file docs 1 commit.

## Kết quả cuối phiên

- `ticket-manager-cli`: mock + HTTP qua env/`.env`; adapter import `kb-api-client`.
- `kb-api-client`: HTTP caller, 10 test + catalog.
- `kb-api-server`: layered, listen 4100, 36 test + catalog + README.
- README root mô tả 3 package và cách chạy E2E.
- Workspace gọn: docs/plans + 3 package + research folders.

## Bằng chứng tham khảo

- CLI: [`ticket-manager-cli/`](../../ticket-manager-cli/)
- HTTP client: [`kb-api-client/`](../../kb-api-client/)
- KB server: [`kb-api-server/`](../../kb-api-server/)
- Catalog CLI HTTP: [`ticket-manager-cli/test-KBClient.md`](../../ticket-manager-cli/test-KBClient.md)
- Catalog client: [`kb-api-client/TEST-CATALOG.md`](../../kb-api-client/TEST-CATALOG.md)
- Catalog server: [`kb-api-server/TEST-CATALOG.md`](../../kb-api-server/TEST-CATALOG.md)
- Kế hoạch tuần 3: [`docs/plans/week-3/`](../../docs/plans/week-3/)
