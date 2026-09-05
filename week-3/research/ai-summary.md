# Week 3 - Tóm tắt làm việc với AI

## Mục tiêu tuần

- Mở rộng Ticket CLI với nhóm lệnh `kb`.
- Làm theo hướng mock-first trước, sau đó chuyển sang HTTP mode.
- Tách `kb-api-client` và `kb-api-server`.
- Chuyển KB persistence từ RAM sang disk để restart server vẫn còn dữ liệu.

## AI đã hỗ trợ gì?

### 1. Migrate sang TypeScript

- Chuyển source/test từ JavaScript sang TypeScript.
- Thêm `typescript`, `tsx`, `@types/node`.
- Cập nhật script:
  - `npm start` dùng `tsx src/cli.ts`.
  - `npm test` dùng `node --import tsx --test`.
  - Thêm `typecheck` và `build`.
- Giải thích `implements`, `Promise<T>`, interface/port, và vì sao vẫn cần runtime assert ở ranh giới inject/mocking.

### 2. Mock-first cho KB

- Làm rõ `MockKBClient` chỉ là class in-memory trong `ticket-manager-cli`, không phải server riêng.
- Thiết kế 4 thao tác KB theo đề: `search`, `list`, `retrieve`, `add`.
- Giữ behavior mock và HTTP giống nhau để sau này đổi client không đổi command CLI.
- Viết test cho mock client và CLI command trước khi implement.
- Bổ sung các case lỗi/biên: query rỗng, thiếu flag, `--top-k`/`--limit` sai, retrieve id không tồn tại, search không có kết quả.

### 3. HTTP KB client

- Tách package `kb-api-client` để chứa logic HTTP caller.
- Thiết kế `KB_API_BASE_URL` và các endpoint `POST /search`, `/list`, `/retrieve`, `/add`.
- CLI chọn client bằng env:
  - Không set hoặc `mock` -> dùng `MockKBClient`.
  - `KB_CLIENT_MODE=http` -> dùng HTTP client adapter.
- Thêm `.env.example` và logic load `.env`, nhưng biến shell vẫn được ưu tiên.
- Viết test unit/integration cho HTTP client: payload, URL, status mapping, network error, 400/404/500.

### 4. KB API server

- Tạo package `kb-api-server` làm HTTP provider, listen mặc định `127.0.0.1:4100`.
- Tổ chức server theo layered structure: `config`, `controllers`, `routes`, `services`, `repositories`, `models`, `errors`, `utils`.
- Entry chính:
  - `src/cli.ts` để chạy process.
  - `src/server.ts` để bootstrap server.
  - `src/index.ts` để export public API cho test/import.
- Thêm test integration và unit cho route, service, config, repository.

### 5. Persistence xuống disk

- Làm rõ khác nhau giữa:
  - RAM/in-memory: restart là mất dữ liệu.
  - Disk persistence: dữ liệu nằm trong `kb-api-server/data`.
- Chốt thiết kế lưu:
  - `index.json` giữ metadata.
  - File `{id}.md` giữ content markdown.
  - Cây folder được tạo theo `nodePath`, ví dụ `/templates/email`.
- `kb add --file` là CLI đọc file local rồi gửi content lên server; server không nhận path máy user.
- Test Red trước cho `FileSystemKbRepository`, sau đó implement để pass.

## Quyết định kỹ thuật mình đã chốt

- Dùng TypeScript nhưng vẫn giữ runtime guard ở boundary.
- Bám layered architecture vì hợp đề hơn hexagonal trong source nộp.
- Mock client là in-process class, không dùng Jest mock/nock/mock server.
- HTTP client là package riêng để CLI không chứa chi tiết HTTP.
- Server local dùng port `4100`; đây là placeholder do mình tự thiết kế, không phải đề bắt buộc.
- Persistence dùng hybrid `index.json` + markdown files để vừa dễ search/list vừa giữ content dạng tài liệu.

## Mình đã chủ động kiểm chứng/chỉnh AI ở đâu?

- Hỏi lại đề có bắt URL cụ thể không; sau đó tự chốt `KB_API_BASE_URL`.
- Yêu cầu có server thật để HTTP mode chạy end-to-end, không chỉ stub trong test.
- Bắt thêm unit test khi integration chưa đủ.
- Chốt `nodePath` là nhãn cây KB, không phải path file nguồn.
- Yêu cầu catalog tiếng Việt và tách docs/commit rõ ràng.
- Không để AI commit thay; mình tự commit sau khi hiểu thay đổi.

## Kết quả và artifact

- CLI + KB commands: `week-2/ticket-manager-cli/`
- HTTP client: `week-3/kb-api-client/`
- HTTP server: `week-3/kb-api-server/`
- Test/catalog:
  - `week-2/ticket-manager-cli/test-mockKBClient.md`
  - `week-2/ticket-manager-cli/test-KBClient.md`
  - `week-3/kb-api-client/TEST-CATALOG.md`
  - `week-3/kb-api-server/TEST-CATALOG.md`
- Kết quả kiểm tra sau restructure repo:
  - `week-3/kb-api-client`: `npm test` pass `10/10`, `typecheck` pass.
  - `week-3/kb-api-server`: `npm test` pass `53/53`, `typecheck` pass.

## Kết luận tuần 3

Tuần 3 là bước mở rộng từ CLI local sang mô hình client/server: bắt đầu bằng mock để khóa behavior, sau đó thay backend bằng HTTP và cuối cùng thêm disk persistence để dữ liệu bền hơn.
