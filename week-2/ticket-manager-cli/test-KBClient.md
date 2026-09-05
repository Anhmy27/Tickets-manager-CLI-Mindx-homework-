# Test Catalog — KBClient (CLI side)

Mục tiêu file này: nhìn nhanh phần test KB ở **phía CLI** (`ticket-manager-cli`) sau khi thêm client thật, và thấy rõ đã tăng thêm bao nhiêu test so với mock-only.

Hiện tại đang ở bước **TDD Green**:

- `npm test` hiện tại = **95 pass / 0 fail**
- Mock flow vẫn giữ nguyên
- Đã thêm flow HTTP client thật (qua adapter)
- CLI load `ticket-manager-cli/.env` lúc `runCli`

## Tổng số test KB phía CLI

| Nhóm | File | Số test |
|---|---|---:|
| Unit — MockKBClient | `tests/unit/mock-kb-client.test.ts` | 19 |
| Integration — CLI + MockKBClient | `tests/integration/kb-cli-mock.test.ts` | 20 |
| E2E — terminal + mock seed | `tests/e2e/kb-cli.e2e.test.ts` | 2 |
| Unit — chọn client theo env | `tests/unit/create-kb-client.test.ts` | 3 |
| Unit — load `.env` | `tests/unit/load-env.test.ts` | 3 |
| Unit — CLI gọi đúng contract KbClient | `tests/unit/kb-cli-client-wiring.test.ts` | 1 |
| Integration — CLI + HTTP adapter | `tests/integration/kb-cli-real-client.test.ts` | 2 |
| **Tổng KB phía CLI** |  | **50** |

## Đã tăng bao nhiêu test?

Trước khi thêm client thật, phần KB ở CLI có:

- `19 + 20 + 2 = 41` test (mock-only)

Sau khi thêm client thật, tăng:

- `3 + 1 + 2 + 3 = 9` test mới (HTTP wiring + load `.env`)

Tổng hiện tại:

- `41 + 9 = 50` test KB phía CLI

## Cách chạy nhanh

```bash
cd ticket-manager-cli
node --import tsx --test tests/unit/mock-kb-client.test.ts
node --import tsx --test tests/integration/kb-cli-mock.test.ts
node --import tsx --test tests/e2e/kb-cli.e2e.test.ts
node --import tsx --test tests/unit/create-kb-client.test.ts
node --import tsx --test tests/unit/load-env.test.ts
node --import tsx --test tests/unit/kb-cli-client-wiring.test.ts
node --import tsx --test tests/integration/kb-cli-real-client.test.ts
```

---

## 1. Unit — Chọn client theo env (3 tests)

File: `tests/unit/create-kb-client.test.ts`

1. `createKbClientFromEnv: default mode returns MockKBClient`
   - Đầu vào env: `{}`
   - Mong đợi: trả về instance `MockKBClient`

2. `createKbClientFromEnv: http mode returns HttpKbClientAdapter`
   - Đầu vào env:
     ```js
     {
       KB_CLIENT_MODE: 'http',
       KB_API_BASE_URL: 'http://127.0.0.1:4100'
     }
     ```
   - Mong đợi: trả về instance `HttpKbClientAdapter`

3. `createKbClientFromEnv: invalid config throws ValidationError`
   - Đầu vào env:
     ```js
     {
       KB_CLIENT_MODE: 'http'
       // thiếu KB_API_BASE_URL
     }
     ```
   - Mong đợi: `ValidationError`

---

## 1b. Unit — Load `.env` (3 tests)

File: `tests/unit/load-env.test.ts`

1. `loadEnvFile: reads KEY=VALUE and skips comments`
   - Đầu vào: file `.env` có comment + `KB_CLIENT_MODE=http` + `KB_API_BASE_URL="http://127.0.0.1:4100"`
   - Mong đợi: env object nhận đúng 2 key; quote được bỏ

2. `loadEnvFile: does not override existing env values`
   - Đầu vào: `env.KB_CLIENT_MODE` đã là `mock`; file ghi `http`
   - Mong đợi: vẫn là `mock` (shell thắng file)

3. `loadEnvFile: missing file is ignored`
   - Đầu vào: path không tồn tại
   - Mong đợi: không throw; env object không đổi

---

## 2. Unit — CLI gọi đúng contract KbClient (1 test)

File: `tests/unit/kb-cli-client-wiring.test.ts`

1. `CLI kb search: forwards query and topK to injected KbClient`
   - Đầu vào argv:
     ```js
     ['kb', 'search', 'response', '--top-k', '3']
     ```
   - Setup: inject fake `KbClient` có thu log input của `search(...)`
   - Mong đợi:
     - exit code `0`
     - `search` được gọi đúng payload:
       ```js
       { query: 'response', topK: 3 }
       ```

---

## 3. Integration — CLI + HTTP adapter (2 tests)

File: `tests/integration/kb-cli-real-client.test.ts`

> Test này vẫn nằm ở `ticket-manager-cli/tests` vì mục tiêu là kiểm tra luồng từ CLI đi ra client thật.

1. `CLI kb real client: search/list/retrieve from HTTP server`
   - Setup:
     - spin up HTTP server cục bộ trong test
     - tạo `HttpKbClientAdapter({ baseUrl })`
   - Đầu vào argv:
     - `kb search response --top-k 3`
     - `kb list --node /templates/email --limit 10`
     - `kb retrieve doc-001`
   - Mong đợi:
     - cả 3 lệnh exit `0`
     - output có đúng dữ liệu template/team

2. `CLI kb real client: add persists for next retrieve`
   - Setup:
     - spin up HTTP server cục bộ
     - tạo file markdown tạm
   - Đầu vào argv:
     - `kb add --file <temp>.md --path /templates/sms --tags sms`
     - `kb retrieve <id vừa tạo>`
   - Mong đợi:
     - add và retrieve đều exit `0`
     - `nodePath` đúng `/templates/sms`
     - retrieve có nội dung `123456`

---

## Liên kết với catalog mock

- Catalog mock-only chi tiết: [`test-mockKBClient.md`](./test-mockKBClient.md)
- File này chỉ bổ sung phần tăng thêm khi có client thật ở phía CLI.

## Bảng thể hiện các rule mà test đang cover (phần mới)

| Field / luồng | Rule |
|---|---|
| `KB_CLIENT_MODE` | Không set / `.env` = `mock` -> dùng mock; `http` -> dùng HTTP adapter. Shell thắng `.env`. |
| `KB_API_BASE_URL` | Bắt buộc khi `KB_CLIENT_MODE=http` |
| `.env` | CLI load `ticket-manager-cli/.env` lúc `runCli`; file thiếu thì bỏ qua |
| CLI -> `KbClient` contract | `kb search` truyền đúng `query` và `topK` |
| CLI + HTTP adapter | `search/list/retrieve/add` chạy được qua HTTP server thật |
