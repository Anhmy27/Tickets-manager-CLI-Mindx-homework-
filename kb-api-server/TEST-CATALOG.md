# Test Catalog — kb-api-server

Mục tiêu file này: liệt kê test cho `kb-api-server` (provider HTTP thật cho KB), tách biệt với test của CLI và client package.

Hiện tại đang ở bước **TDD Green**:

- `npm test` = **41 pass / 0 fail**
- Chia rõ 2 lớp: unit + integration

## Tổng số test

| Nhóm | File | Số test |
|---|---|---:|
| Unit — KbService | `tests/unit/kb-service.test.ts` | 9 |
| Unit — routeKbRequest | `tests/unit/kb-routes.test.ts` | 4 |
| Unit — readPort | `tests/unit/env.test.ts` | 3 |
| Unit — FileSystemKbRepository | `tests/unit/file-system-kb-repository.test.ts` | 3 |
| Integration — HTTP API contract | `tests/integration/server.test.ts` | 22 |
| **Tổng** |  | **41** |

## Cách chạy

```bash
cd kb-api-server
npm test
node --import tsx --test tests/unit/*.test.ts
node --import tsx --test tests/integration/server.test.ts
```

---

## 1) Unit — KbService (9 tests)

File: `tests/unit/kb-service.test.ts`

1. `KbService.search: finds by title/content and respects topK`
   - Đầu vào: `query='template'`, `topK=1`
   - Mong đợi: tìm được kết quả theo title/content và chỉ trả tối đa 1 phần tử

2. `KbService.search: rejects invalid topK`
   - Đầu vào: `topK=0`
   - Mong đợi: ném `ValidationError` với message về `topK` phải là số nguyên dương

3. `KbService.list: filters by nodePath and limit`
   - Đầu vào: `nodePath='/templates/email'`, `limit=1`
   - Mong đợi: chỉ trả doc trong node tương ứng và tôn trọng `limit`

4. `KbService.list: rejects missing nodePath`
   - Đầu vào: `nodePath=''`
   - Mong đợi: ném `ValidationError` (`nodePath is required`)

5. `KbService.retrieve: returns document by id`
   - Đầu vào: `docId='doc-001'`
   - Mong đợi: trả đúng document theo id

6. `KbService.retrieve: throws not found for unknown id`
   - Đầu vào: `docId='missing-id'`
   - Mong đợi: ném `NotFoundError`

7. `KbService.add: creates document and normalizes string tags`
   - Đầu vào: `tags='sms, otp, '`
   - Mong đợi: tạo doc mới thành công, tags được normalize thành `['sms', 'otp']`

8. `KbService.add: regenerates id when generated id already exists`
   - Setup: hàm sinh id trả `doc-001` (đã có) rồi `doc-999`
   - Mong đợi: add thành công với `id='doc-999'`; seed `doc-001` không bị ghi đè

9. `KbService.add: rejects invalid tags type`
   - Đầu vào: `tags=123`
   - Mong đợi: ném `ValidationError` (`tags must be a string or an array of strings`)

---

## 2) Unit — routeKbRequest (4 tests)

File: `tests/unit/kb-routes.test.ts`

1. `routeKbRequest: returns 405 for non-POST method`
   - Đầu vào: `GET /search`
   - Mong đợi: status `405`, payload `{ error: 'Method not allowed' }`

2. `routeKbRequest: returns 404 for unknown path`
   - Đầu vào: `POST /unknown`
   - Mong đợi: status `404`, payload `{ error: 'Not found' }`

3. `routeKbRequest: dispatches /search and returns service payload`
   - Setup: fake service để bắt input
   - Mong đợi: route chuyển đúng body vào `service.search(...)` và trả payload từ service

4. `routeKbRequest: dispatches /add and returns service payload`
   - Setup: fake service để bắt input
   - Mong đợi: route chuyển đúng body vào `service.add(...)` và trả payload từ service

---

## 3) Unit — readPort (3 tests)

File: `tests/unit/env.test.ts`

1. `readPort: uses fallback when raw is undefined`
   - Đầu vào: `undefined`
   - Mong đợi: trả về fallback (mặc định `4100` hoặc giá trị fallback truyền vào)

2. `readPort: parses valid integer port`
   - Đầu vào: `'4100'`, `'65535'`
   - Mong đợi: parse đúng về number

3. `readPort: rejects invalid port values`
   - Đầu vào: `'0'`, `'-1'`, `'99999'`, `'3.14'`, `'abc'`
   - Mong đợi: ném lỗi `KB_API_PORT must be an integer between 1 and 65535`

---

## 4) Unit — FileSystemKbRepository (3 tests)

File: `tests/unit/file-system-kb-repository.test.ts`

1. `initializes index and markdown files from seed`
   - Mong đợi: tạo `index.json` và các file markdown theo `nodePath/id`

2. `create persists across repository re-instantiation`
   - Mong đợi: tạo doc mới, khởi tạo lại repository vẫn `findById` được

3. `stores metadata in index.json`
   - Mong đợi: metadata của doc mới được ghi vào `index.json`

---

## 5) Integration — HTTP API contract (22 tests)

### Happy path (1 test)

1. `search/list/retrieve/add happy path`
   - Luồng:
     - `POST /search`
     - `POST /list`
     - `POST /retrieve`
     - `POST /add`
     - `POST /retrieve` cho document vừa tạo
   - Mong đợi:
     - tất cả trả `200`
     - dữ liệu seed và dữ liệu mới trả đúng

---

### Search validation (4 tests)

1. `returns 400 for invalid payload` (`query` rỗng)
2. `returns 400 when search query missing`
3. `returns 400 when topK is zero`
4. `returns 400 when topK is non-integer`

Giải thích: nhóm này đảm bảo endpoint `/search` luôn fail fast khi input sai, không rò business logic xuống tầng dưới.

Rule cover: `query` bắt buộc; `topK` phải là số nguyên dương.

---

### List validation & behavior (3 tests)

1. `returns 400 when list nodePath missing`
2. `returns 400 when limit is invalid`
3. `list returns empty array for unknown node`

Giải thích: `/list` vừa cần validation (`nodePath`, `limit`) vừa cần behavior ổn định cho case node không tồn tại.

Rule cover: `nodePath` bắt buộc; `limit` số nguyên dương; node không tồn tại thì trả `[]`.

---

### Retrieve validation & not-found (3 tests)

1. `returns 404 for missing document`
2. `returns 400 when retrieve docId missing`
3. `returns 400 when retrieve docId is empty`

Giải thích: tách rõ lỗi input (`400`) và lỗi business not-found (`404`) để client map lỗi chính xác.

Rule cover: `docId` bắt buộc; id không tồn tại trả `404`.

---

### Add validation & normalization (6 tests)

1. `returns 400 when add title missing`
2. `returns 400 when add content missing`
3. `returns 400 when add nodePath missing`
4. `returns 400 when add tags type invalid`
5. `add ignores client-provided id`
6. `add normalizes comma-separated tags`

Rule cover:
- `title/content/nodePath` bắt buộc
- `tags` phải là chuỗi hoặc mảng string
- `id` không nhận từ client; server tự sinh và retry nếu trùng
- `tags` dạng `"a, b, "` được normalize thành `["a", "b"]`

---

### HTTP-level contract (3 tests)

1. `returns 405 for non-POST methods`
2. `returns 404 for unknown route`
3. `returns 400 for invalid JSON body`

Rule cover:
- Chỉ cho phép `POST`
- route ngoài `/search|/list|/retrieve|/add` trả `404`
- body JSON hỏng trả `400`

---

### Persistence on disk (2 tests)

1. `persists added document across server restart`
2. `writes index and markdown file on add`

Rule cover:
- dữ liệu được lưu trong `data/index.json` và `data/<nodePath>/<id>.md`
- restart server vẫn retrieve được doc đã add trước đó

---

## Bảng rule đang cover

| Chủ đề | Rule |
|---|---|
| Service business rules | Validate input, normalize tags, generate unique id (retry on collision), map not-found |
| Routing | Method/path dispatch đúng cho 4 endpoint |
| Env parsing | `KB_API_PORT` phải là integer trong [1, 65535] |
| Disk persistence | Ghi metadata vào `index.json`, ghi content vào `.md`, restart không mất dữ liệu |
| Endpoint contract | Chỉ hỗ trợ `POST /search`, `/list`, `/retrieve`, `/add` |
| Status mapping | Validation -> `400`, Not Found -> `404`, Method sai -> `405` |
| Search/List params | `query`, `nodePath` bắt buộc; `topK`, `limit` phải là số nguyên dương |
| Add contract | `title/content/nodePath` bắt buộc, `tags` được normalize/validate; `id` do server sinh, không nhận từ client |
| Robust parsing | JSON body sai format trả lỗi rõ ràng (`400`) |
