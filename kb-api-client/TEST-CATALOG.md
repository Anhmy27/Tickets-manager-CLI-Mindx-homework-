# Test Catalog — kb-api-client

Mục tiêu file này: liệt kê chi tiết test **nội bộ package client thật** `kb-api-client`  
(không gồm test gọi từ CLI — phần đó nằm ở `ticket-manager-cli/tests`).

Hiện tại đang ở bước **TDD Green**:

- `npm test` = **10 pass / 0 fail**
- Test chia rõ unit và integration trong chính folder `kb-api-client/tests`

## Tổng số test

| Nhóm | File | Số test |
|---|---|---:|
| Unit — HTTPKBClient | `tests/unit/http-kb-client.test.ts` | 8 |
| Integration — HTTPKBClient + HTTP server cục bộ | `tests/integration/http-kb-client.test.ts` | 2 |
| **Tổng** |  | **10** |

## Cách chạy

```bash
cd kb-api-client
npm test
node --import tsx --test tests/unit/http-kb-client.test.ts
node --import tsx --test tests/integration/http-kb-client.test.ts
```

---

## 1. Unit — HTTPKBClient (8 tests)

File: `tests/unit/http-kb-client.test.ts`

### Test 1

1. `HTTPKBClient search: sends POST /search with query/topK`
   - Setup: inject `fetchImpl` giả để bắt request
   - Đầu vào:
     ```js
     client.search({ query: 'response', topK: 3 })
     ```
   - Mong đợi:
     - URL gọi đúng: `http://localhost:4100/search`
     - body đúng:
       ```js
       { query: 'response', topK: 3 }
       ```
     - dữ liệu trả về map đúng `id/title/nodePath`

### Test 2

2. `HTTPKBClient retrieve: maps 404 to KBClientNotFoundError`
   - Setup: `fetchImpl` trả status `404`
   - Đầu vào:
     ```js
     client.retrieve('missing-id')
     ```
   - Mong đợi: ném `KBClientNotFoundError`

### Test 3

3. `HTTPKBClient: maps 400 to KBClientValidationError`
   - Setup: `fetchImpl` trả status `400`
   - Đầu vào:
     ```js
     client.list({ nodePath: '' })
     ```
   - Mong đợi: ném `KBClientValidationError`

### Test 4

4. `HTTPKBClient list: sends POST /list with nodePath and limit`
   - Setup: inject `fetchImpl` giả để bắt request
   - Đầu vào:
     ```js
     client.list({ nodePath: '/templates/email', limit: 2 })
     ```
   - Mong đợi:
     - URL gọi đúng: `http://localhost:4100/list`
     - body đúng:
       ```js
       { nodePath: '/templates/email', limit: 2 }
       ```

### Test 5

5. `HTTPKBClient retrieve: sends POST /retrieve with docId`
   - Setup: inject `fetchImpl` giả
   - Đầu vào:
     ```js
     client.retrieve('doc-001')
     ```
   - Mong đợi:
     - URL gọi đúng: `http://localhost:4100/retrieve`
     - body đúng:
       ```js
       { docId: 'doc-001' }
       ```

### Test 6

6. `HTTPKBClient add: normalizes comma tags before POST /add`
   - Setup: inject `fetchImpl` giả
   - Đầu vào:
     ```js
     client.add({
       title: 'new-template',
       content: 'Body',
       nodePath: '/templates/sms',
       tags: 'sms, template, '
     })
     ```
   - Mong đợi:
     - body gửi đi có:
       ```js
       tags: ['sms', 'template']
       ```

### Test 7

7. `HTTPKBClient: network error maps to KBClientRequestError`
   - Setup: `fetchImpl` ném lỗi mạng (ví dụ `ECONNREFUSED`)
   - Mong đợi: ném `KBClientRequestError`

### Test 8

8. `HTTPKBClient: maps 500 to KBClientRequestError`
   - Setup: `fetchImpl` trả status `500`
   - Mong đợi: ném `KBClientRequestError`

---

## 2. Integration — HTTPKBClient (2 tests)

File: `tests/integration/http-kb-client.test.ts`

1. `HTTPKBClient integration: call real HTTP endpoints`
   - Setup:
     - spin up server HTTP cục bộ trong test
     - seed 3 document mẫu
   - Luồng gọi:
     - `search({ query: 'response', topK: 3 })`
     - `list({ nodePath: '/templates/email', limit: 10 })`
     - `retrieve('doc-001')`
     - `add({ ... })`
     - `retrieve(id vừa add)`
   - Mong đợi:
     - search/list/retrieve trả đúng dữ liệu seed
     - add thành công
     - retrieve theo id vừa tạo trả đúng doc mới

2. `HTTPKBClient integration: retrieve unknown id maps to not found error`
   - Setup: dùng server cục bộ cùng seed
   - Đầu vào:
     ```js
     client.retrieve('missing-id')
     ```
   - Mong đợi: ném `KBClientNotFoundError`

---

## Bảng thể hiện các rule mà test đang cover

| Chủ đề | Rule |
|---|---|
| API contract | Gọi đúng endpoint `POST /search`, `/list`, `/retrieve`, `/add` |
| Payload mapping | `query/topK`, `nodePath/limit`, `docId`, `title/content/nodePath/tags` |
| Error mapping | `404 -> KBClientNotFoundError`, `400 -> KBClientValidationError` |
| HTTP failure mapping | lỗi mạng hoặc `500` -> `KBClientRequestError` |
| End-to-end ở mức client | Cùng một `HTTPKBClient` có thể search/list/retrieve/add/retrieve qua HTTP thật |
