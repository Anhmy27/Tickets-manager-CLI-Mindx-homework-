# Test Catalog — MockKBClient

Mục tiêu file này: nhìn nhanh **hàm/lệnh nào**, **đầu vào gì**, **mong đợi gì** cho phần mock KB (Tuần 3, chưa gồm HTTP client).

Hiện tại đang ở bước **TDD Green** cho mock:
- `MockKBClient` và CLI `kb ...` đã implement theo test
- Toàn bộ suite hiện tại = **86 pass / 0 fail** (gồm cả ticket tuần 2)

## Dữ liệu mẫu trong mock

```text
KB Root
├─ /templates/email
│    ├─ doc-001  Customer Response Template
│    └─ doc-003  Follow-up Email Template
└─ /team/devops
     └─ doc-002  DevOps Team Members
```

## Tổng số test mock

| Nhóm | File | Số test |
|---|---|---:|
| Unit — MockKBClient | `tests/unit/mock-kb-client.test.ts` | 19 |
| Integration — CLI + MockKBClient | `tests/integration/kb-cli-mock.test.ts` | 21 |
| E2E — terminal + mock seed | `tests/e2e/kb-cli.e2e.test.ts` | 2 |
| **Tổng mock** |  | **42** |

## Cách chạy

```bash
cd ticket-manager-cli
npx tsx --test tests/unit/mock-kb-client.test.ts
npx tsx --test tests/integration/kb-cli-mock.test.ts
npx tsx --test tests/e2e/kb-cli.e2e.test.ts
npm test
```

---

## 1. Unit — MockKBClient (19 tests)

File: `tests/unit/mock-kb-client.test.ts`

Setup mặc định: `new MockKBClient()` với 3 document mẫu ở trên.

### Hàm `search(input)`

1. `search: returns matches by title`
   - Đầu vào: `{ query: 'Customer Response' }`
   - Mong đợi: 1 kết quả, `id = 'doc-001'`, title `Customer Response Template`, `nodePath = '/templates/email'`

2. `search: returns matches by content`
   - Đầu vào: `{ query: 'on-call' }`
   - Mong đợi: 1 kết quả, `id = 'doc-002'`, title `DevOps Team Members`

3. `search: supports nodePath filter`
   - Đầu vào: `{ query: 'template', nodePath: '/templates/email' }`
   - Mong đợi: mọi kết quả đều có `nodePath = '/templates/email'`

4. `search: respects topK`
   - Đầu vào: `{ query: 'template', topK: 1 }`
   - Mong đợi: đúng 1 kết quả

5. `search: returns empty array when no match`
   - Đầu vào: `{ query: 'zzzz-no-match' }`
   - Mong đợi: `[]`

6. `search: rejects empty query`
   - Đầu vào: `{ query: '   ' }`
   - Mong đợi: `ValidationError`

7. `search: rejects invalid topK`
   - Đầu vào: `topK: 0` và `topK: 1.5`
   - Mong đợi: `ValidationError`

### Hàm `list(input)`

8. `list: returns docs in nodePath`
   - Đầu vào: `{ nodePath: '/templates/email' }`
   - Mong đợi: ít nhất 2 document, tất cả `nodePath = '/templates/email'`

9. `list: respects limit`
   - Đầu vào: `{ nodePath: '/templates/email', limit: 1 }`
   - Mong đợi: đúng 1 document

10. `list: returns empty when nodePath not found`
    - Đầu vào: `{ nodePath: '/missing/path' }`
    - Mong đợi: `[]`

11. `list: rejects missing nodePath`
    - Đầu vào: `{ nodePath: '' }`
    - Mong đợi: `ValidationError`

### Hàm `retrieve(docId)`

12. `retrieve: returns full doc by id`
    - Đầu vào: `'doc-001'`
    - Mong đợi: `id`, `title`, `nodePath`, `content` có `reaching out`, `tags = ['template', 'email']`

13. `retrieve: throws not found for unknown id`
    - Đầu vào: `'missing-id'`
    - Mong đợi: `NotFoundError`

14. `retrieve: rejects empty id`
    - Đầu vào: `'   '`
    - Mong đợi: `ValidationError`

### Hàm `add(input)`

15. `add: creates doc with generated id`
    - Đầu vào: title/content/nodePath/tags đầy đủ
    - Mong đợi: `id` là string khác `doc-001`; giữ nguyên title, content, nodePath, tags

16. `add: persists doc in in-memory dataset for next queries`
    - Mong đợi: `retrieve(id)` ra đúng doc; `list('/templates/sms')` có 1 doc; `search('123456')` ra đúng id

17. `add: rejects duplicated id if id is provided manually`
    - Đầu vào: `{ id: 'doc-001', ... }`
    - Mong đợi: `ValidationError`

18. `add: rejects missing title, content, or nodePath`
    - Đầu vào: lần lượt title/content/nodePath rỗng
    - Mong đợi: `ValidationError`

19. `add: normalizes tags from comma string`
    - Đầu vào: `tags: 'sms, template, '`
    - Mong đợi: `['sms', 'template']`

---

## 2. Integration — CLI + MockKBClient (21 tests)

File: `tests/integration/kb-cli-mock.test.ts`

Setup: `runCli(..., io, { kbClient: new MockKBClient() })` — inject mock, không gọi HTTP.

### Lệnh `kb search`

20. `CLI kb search: finds template by query and respects --top-k`
    - argv: `['kb', 'search', 'response', '--top-k', '3']`
    - Mong đợi: exit `0`; stdout có `Customer Response Template`, `doc-001`, `/templates/email`

21. `CLI kb search: prints clear error when query is missing`
    - argv: `['kb', 'search', '--top-k', '3']`
    - Mong đợi: exit `1`; stderr có `query is required`

22. `CLI kb search: prints empty array when no match`
    - argv: `['kb', 'search', 'zzzz-no-match']`
    - Mong đợi: exit `0`; stdout parse ra `[]`

23. `CLI kb search: --top-k limits the number of printed results`
    - argv: `['kb', 'search', 'template', '--top-k', '1']`
    - Mong đợi: exit `0`; đúng 1 kết quả

24. `CLI kb search: prints clear error for invalid --top-k`
    - argv: `['kb', 'search', 'template', '--top-k', '0']`
    - Mong đợi: exit `1`; stderr có `top-k`

### Lệnh `kb list`

25. `CLI kb list: lists documents under --node and respects --limit`
    - argv: `['kb', 'list', '--node', '/templates/email', '--limit', '10']`
    - Mong đợi: exit `0`; có 2 email template; không có `DevOps Team Members`

26. `CLI kb list: looks up team info by node path`
    - argv: `['kb', 'list', '--node', '/team/devops']`
    - Mong đợi: exit `0`; stdout có `DevOps Team Members`, `doc-002`

27. `CLI kb list: prints clear error when node path is missing`
    - argv: `['kb', 'list', '--limit', '10']`
    - Mong đợi: exit `1`; stderr có `node`

28. `CLI kb list: --limit limits the number of printed documents`
    - argv: `['kb', 'list', '--node', '/templates/email', '--limit', '1']`
    - Mong đợi: exit `0`; đúng 1 document

29. `CLI kb list: prints clear error for invalid --limit`
    - argv: `['kb', 'list', '--node', '/templates/email', '--limit', 'abc']`
    - Mong đợi: exit `1`; stderr có `limit`

### Lệnh `kb retrieve`

30. `CLI kb retrieve: prints full document by id`
    - argv: `['kb', 'retrieve', 'doc-001']`
    - Mong đợi: exit `0`; stdout có id, title, content, path

31. `CLI kb retrieve: prints not found error and exits 1`
    - argv: `['kb', 'retrieve', 'missing-id']`
    - Mong đợi: exit `1`; stderr có `not found`

32. `CLI kb retrieve: prints clear error when id is missing`
    - argv: `['kb', 'retrieve']`
    - Mong đợi: exit `1`; stderr có `id`

### Lệnh `kb add`

33. `CLI kb add: reads markdown file and creates document`
    - argv: `--file <temp>/new-template.md --path /templates/sms --tags sms`
    - Mong đợi: exit `0`; stdout có `Created document`, path, content, tag

34. `CLI kb add: created document can be retrieved immediately`
    - Add rồi `kb retrieve <id>` trên cùng mock instance
    - Mong đợi: cả hai lệnh exit `0`; retrieve ra đúng nội dung vừa add

35. `CLI kb add: prints clear error when file is missing`
    - `--file missing-template.md` (file không tồn tại trên đĩa)
    - Mong đợi: exit `1`; stderr có `file`

36. `CLI kb add: prints clear error when --file is missing`
    - argv: `['kb', 'add', '--path', '/templates/sms']`
    - Mong đợi: exit `1`; `file is required`

37. `CLI kb add: prints clear error when --path is missing`
    - argv: `['kb', 'add', '--file', 'new-template.md']`
    - Mong đợi: exit `1`; `path is required`

### Parse / routing

38. `CLI kb: prints clear error for unknown subcommand`
    - argv: `['kb', 'foo']`
    - Mong đợi: exit `1`; `unknown kb command`

39. `CLI kb: accepts case-insensitive command and subcommand names`
    - argv: `['KB', 'SEARCH', 'response']`
    - Mong đợi: exit `0`; có `Customer Response Template`

---

## 3. E2E — terminal + mock seed (2 tests)

File: `tests/e2e/kb-cli.e2e.test.ts`

Mỗi lệnh spawn process mới → mock RAM không giữ `add` giữa các lệnh. E2E chỉ khóa seed docs.

40. `E2E kb mock: search → list → retrieve against seed documents`
    - `kb search response --top-k 3` rồi `kb list --node /team/devops` rồi `kb retrieve doc-001`
    - Mong đợi: stdout có template, team, full content

41. `E2E kb mock: retrieve unknown id exits 1`
    - `kb retrieve missing-id`
    - Mong đợi: process exit `1`; stderr có `not found`

---

## Bảng thể hiện các rule mà test đang cover

| Field / lệnh | Rule |
|---|---|
| Search query | Bắt buộc; rỗng → lỗi; không khớp → `[]` |
| Search `topK` | Phải là số nguyên dương; CLI `--top-k` cắt số kết quả |
| List `nodePath` | CLI `--node` bắt buộc; nhánh không có → `[]` |
| List `limit` | Phải là số nguyên dương; CLI `--limit` cắt số document |
| Retrieve id | Có thì trả full doc; thiếu id → lỗi; id sai → not found / exit `1` |
| Add `--file` | Flag bắt buộc; file không tồn tại → lỗi |
| Add `--path` | Flag bắt buộc; gán `nodePath` |
| Add `--tags` | Chuỗi comma được tách và bỏ khoảng trống |
| Persist mock | Document add vào RAM **cùng process**, retrieve/list/search ngay được |
| Duplicate id | `add({ id: 'doc-001' })` → `ValidationError` |
| Unknown `kb` subcommand | exit `1` |
| Case | `KB` / `SEARCH` vẫn chạy |
