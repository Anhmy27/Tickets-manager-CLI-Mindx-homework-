# Test Catalog — kb-api-client

Mục tiêu file này: mô tả toàn bộ test của package `kb-api-client` (HTTP client thuần), tách biệt với test ở `ticket-manager-cli`.

Hiện tại đang ở bước **TDD Green**:

- `npm test` = **10 pass / 0 fail**
- Chia rõ 2 lớp: `unit` và `integration`

## Tổng số test

| Nhóm | File | Số test |
|---|---|---:|
| Unit — HTTPKBClient | `tests/unit/http-kb-client.test.ts` | 8 |
| Integration — HTTPKBClient + local HTTP server | `tests/integration/http-kb-client.test.ts` | 2 |
| **Tổng** |  | **10** |

## Cách chạy

```bash
cd kb-api-client
npm test
node --import tsx --test tests/unit/http-kb-client.test.ts
node --import tsx --test tests/integration/http-kb-client.test.ts
```

---

## 1) Unit — HTTPKBClient (8 tests)

File: `tests/unit/http-kb-client.test.ts`

1. `HTTPKBClient search: sends POST /search with query/topK`
   - Input: `search({ query: 'response', topK: 3 })`
   - Expected:
     - gọi `POST /search`
     - body đúng `{ query, topK }`
     - map response về `KbSearchResult[]`

2. `HTTPKBClient retrieve: maps 404 to KBClientNotFoundError`
   - Input: `retrieve('missing-id')`
   - Expected: ném `KBClientNotFoundError`

3. `HTTPKBClient: maps 400 to KBClientValidationError`
   - Input: request bị API trả `400`
   - Expected: ném `KBClientValidationError`

4. `HTTPKBClient list: sends POST /list with nodePath and limit`
   - Input: `list({ nodePath: '/templates/email', limit: 2 })`
   - Expected:
     - gọi `POST /list`
     - body đúng `{ nodePath, limit }`

5. `HTTPKBClient retrieve: sends POST /retrieve with docId`
   - Input: `retrieve('doc-001')`
   - Expected:
     - gọi `POST /retrieve`
     - body đúng `{ docId: 'doc-001' }`

6. `HTTPKBClient add: normalizes comma tags before POST /add`
   - Input:
     - `tags: 'sms, template, '`
   - Expected:
     - payload gửi đi có `tags: ['sms', 'template']`

7. `HTTPKBClient: network error maps to KBClientRequestError`
   - Setup: `fetchImpl` ném lỗi mạng
   - Expected: ném `KBClientRequestError`

8. `HTTPKBClient: maps 500 to KBClientRequestError`
   - Setup: API trả `500`
   - Expected: ném `KBClientRequestError`

---

## 2) Integration — HTTPKBClient (2 tests)

File: `tests/integration/http-kb-client.test.ts`

1. `HTTPKBClient integration: call real HTTP endpoints`
   - Setup:
     - spin up local HTTP server trong test
     - seed 3 document mẫu
   - Flow:
     - `search` -> `list` -> `retrieve` -> `add` -> `retrieve(doc mới)`
   - Expected:
     - tất cả call thành công
     - dữ liệu trả về đúng với seed + doc vừa add

2. `HTTPKBClient integration: retrieve unknown id maps to not found error`
   - Input: `retrieve('missing-id')`
   - Expected: ném `KBClientNotFoundError`

---

## Bảng rule đang cover

| Chủ đề | Rule |
|---|---|
| Endpoint contract | Gọi đúng `POST /search`, `/list`, `/retrieve`, `/add` |
| Payload mapping | `query/topK`, `nodePath/limit`, `docId`, `title/content/nodePath/tags` |
| Input normalization | `tags` dạng chuỗi được chuẩn hóa thành mảng string |
| Error mapping | `404 -> KBClientNotFoundError`, `400 -> KBClientValidationError`, `5xx/network -> KBClientRequestError` |
| Integration confidence | Cùng một `HTTPKBClient` chạy được luồng search/list/retrieve/add với HTTP server thật |
