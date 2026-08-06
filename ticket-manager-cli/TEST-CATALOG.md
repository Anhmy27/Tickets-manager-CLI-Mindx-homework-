# Test Catalog — Ticket Manager CLI

Mục tiêu file này: cho bạn nhìn nhanh **hàm nào**, **đầu vào gì**, **mong đợi gì**.

Hiện tại đang ở bước **TDD Red**:
- code đang stub
- `npm test` hiện tại = **42 fail / 0 pass**

## Tổng số test

| Nhóm | File | Số test |
|---|---|---:|
| Unit — validation | `tests/unit/ticket-model.test.js` | 14 |
| Unit — service | `tests/unit/ticket-service.test.js` | 11 |
| Integration — JSON storage | `tests/integration/json-ticket-storage.test.js` | 4 |
| Integration — CLI wiring | `tests/integration/cli.test.js` | 12 |
| E2E | `tests/e2e/cli.e2e.test.js` | 1 |
| **Tổng** |  | **42** |

## Cách chạy

```bash
cd ticket-manager-cli
npm test
npm run test:unit
npm run test:integration
npm run test:e2e
```

---

## 1. Unit — Validation (14 tests)

File: `tests/unit/ticket-model.test.js`

### Hàm `validateCreateTicketInput(input)`

1. `create validation: valid title normalizes defaults and optional fields`
   (Title hợp lệ thì chuẩn hóa dữ liệu và gán default)
   - Đầu vào:
     ```js
     {
       title: '  Bug login  ',
       description: '  cannot sign in  ',
       tags: 'bug, auth'
     }
     ```
   - Mong đợi:
     ```js
     {
       title: 'Bug login',
       description: 'cannot sign in',
       status: 'open',
       priority: 'medium',
       tags: ['bug', 'auth']
     }
     ```

2. `create validation: accepts explicit status, priority, and tags array`
   (Nhận đúng status, priority, tags khi user truyền rõ)
   - Đầu vào:
     ```js
     {
       title: 'API timeout',
       description: 'slow endpoint',
       status: 'in_progress',
       priority: 'high',
       tags: ['api', 'backend']
     }
     ```
   - Mong đợi: giữ nguyên `status`, `priority`, `tags`

3. `create validation: rejects missing title`
   (Thiếu title thì lỗi)
   - Đầu vào: `{}`
   - Mong đợi: `ValidationError`, có `title is required`

4. `create validation: rejects empty title`
   (Title toàn khoảng trắng thì lỗi)
   - Đầu vào: `{ title: '   ' }`
   - Mong đợi: `ValidationError`, có `title is required`

5. `create validation: rejects invalid status`
   (Status sai thì lỗi)
   - Đầu vào: `{ title: 'Bug login', status: 'done' }`
   - Mong đợi: `ValidationError`, có `status must be one of`

6. `create validation: rejects invalid priority`
   (Priority sai thì lỗi)
   - Đầu vào: `{ title: 'Bug login', priority: 'urgent' }`
   - Mong đợi: `ValidationError`, có `priority must be one of`

7. `create validation: rejects tags with unsupported type`
   (Tags sai kiểu dữ liệu thì lỗi)
   - Đầu vào: `{ title: 'Bug login', tags: 123 }`
   - Mong đợi: `ValidationError`, có `tags must be a string or an array of strings`

### Hàm `validateListFilters(filters)`

8. `list validation: accepts valid status, priority, and tags filters`
   (Filter hợp lệ thì normalize được)
   - Đầu vào:
     ```js
     { status: 'open', priority: 'high', tags: 'bug,auth' }
     ```
   - Mong đợi:
     ```js
     { status: 'open', priority: 'high', tags: ['bug', 'auth'] }
     ```

9. `list validation: rejects unsupported status filter`
   (Status filter sai thì lỗi)
   - Đầu vào: `{ status: 'done' }`
   - Mong đợi: `ValidationError`

10. `list validation: rejects unsupported priority filter`
    (Priority filter sai thì lỗi)
    - Đầu vào: `{ priority: 'urgent' }`
    - Mong đợi: `ValidationError`

11. `list validation: rejects tags filter with unsupported type`
    (Tags filter sai kiểu dữ liệu thì lỗi)
    - Đầu vào: `{ tags: { name: 'bug' } }`
    - Mong đợi: `ValidationError`

### Hàm `validateTicketId(id)`

12. `show validation: rejects missing ticket id`
    (Thiếu id thì lỗi)
    - Đầu vào: `' '`
    - Mong đợi: `ValidationError`, có `ticket id is required`

### Hàm `validateUpdateTicketInput(input)`

13. `update validation: requires a valid status`
    (Update bắt buộc có status hợp lệ)
    - Đầu vào 1: `{}`
      - Mong đợi: `ValidationError`, có `status is required`
    - Đầu vào 2: `{ status: 'done' }`
      - Mong đợi: `ValidationError`, có `status must be one of`

14. `update validation: accepts allowed status values`
    (Status hợp lệ thì nhận)
    - Đầu vào: `{ status: 'closed' }`
    - Mong đợi:
      ```js
      { status: 'closed' }
      ```

---

## 2. Unit — Service / nghiệp vụ (11 tests)

File: `tests/unit/ticket-service.test.js`

### Hàm `createTicket(input)`

15. `createTicket: creates ticket with id, defaults, and saves once`
    (Tạo ticket thành công, có id/default, lưu đúng 1 lần)
    - Đầu vào:
      ```js
      {
        title: 'Bug login',
        description: 'cannot sign in',
        tags: ['bug']
      }
      ```
    - Setup: repository mock rỗng, `idGenerator = 'ticket-1'`, time cố định
    - Mong đợi: ticket trả về có `id`, `status=open`, `priority=medium`, timestamp đúng; `saveTickets` gọi 1 lần

16. `createTicket: rejects invalid input before saving`
    (Input create sai thì lỗi trước khi lưu)
    - Đầu vào: `{ title: '' }`
    - Mong đợi: `ValidationError`, không gọi lưu

### Hàm `listTickets(filters)`

17. `listTickets: returns only tickets matching status, priority, and tags`
    (Chỉ trả ticket khớp filter)
    - Đầu vào:
      ```js
      { status: 'open', priority: 'high', tags: ['bug'] }
      ```
    - Setup: repo mock có 3 ticket, chỉ ticket `1` khớp
    - Mong đợi: trả đúng 1 ticket, `id = '1'`

18. `listTickets: rejects invalid filters before reading repository data`
    (Filter sai thì lỗi trước khi đọc repo)
    - Đầu vào: `{ status: 'done' }`
    - Mong đợi: `ValidationError`, không gọi `loadTickets`

### Hàm `showTicket(id)`

19. `showTicket: returns the matching ticket`
    (Có ticket thì trả đúng ticket)
    - Đầu vào: `'1'`
    - Setup: repo mock có ticket id `1`
    - Mong đợi: ticket trả về có `id = '1'`, `title = 'Bug login'`

20. `showTicket: throws not found when ticket does not exist`
    (Không có ticket thì not found)
    - Đầu vào: `'missing-id'`
    - Setup: repo rỗng
    - Mong đợi: `NotFoundError`

21. `showTicket: rejects empty id before reading repository data`
    (Id rỗng thì lỗi trước khi đọc repo)
    - Đầu vào: `' '`
    - Mong đợi: `ValidationError`, không gọi `loadTickets`

### Hàm `updateTicket(id, input)`

22. `updateTicket: updates only the target ticket status and preserves other fields`
    (Chỉ update ticket mục tiêu, giữ field khác)
    - Đầu vào:
      ```js
      updateTicket('1', { status: 'closed' })
      ```
    - Setup: repo mock có ticket `1` và `2`
    - Mong đợi: ticket `1` thành `closed`, field khác giữ nguyên; ticket `2` không đổi

23. `updateTicket: throws not found when ticket does not exist`
    (Ticket không tồn tại thì not found)
    - Đầu vào:
      ```js
      updateTicket('missing-id', { status: 'closed' })
      ```
    - Mong đợi: `NotFoundError`

24. `updateTicket: rejects invalid status before saving`
    (Status sai thì lỗi trước khi lưu)
    - Đầu vào:
      ```js
      updateTicket('1', { status: 'done' })
      ```
    - Mong đợi: `ValidationError`

25. `updateTicket: rejects missing status before loading repository data`
    (Thiếu status thì lỗi trước khi đọc repo)
    - Đầu vào:
      ```js
      updateTicket('1', {})
      ```
    - Mong đợi: `ValidationError`, không gọi `loadTickets`

---

## 3. Integration — JSON storage (4 tests)

File: `tests/integration/json-ticket-storage.test.js`

### Hàm `saveTickets(tickets)` / `loadTickets()`

26. `JsonTicketRepository: creates file and persists tickets`
    (Tạo file và lưu ticket được)
    - Đầu vào `saveTickets`:
      ```js
      [{
        id: '1',
        title: 'Bug login',
        description: 'cannot sign in',
        status: 'open',
        priority: 'medium',
        tags: ['bug']
      }]
      ```
    - Mong đợi: `loadTickets()` đọc lại đúng mảng trên; file có chữ `Bug login`

27. `JsonTicketRepository: returns empty list when file is missing`
    (File chưa có thì trả mảng rỗng)
    - Đầu vào: path chưa tồn tại
    - Mong đợi: `[]`

28. `JsonTicketRepository: throws clear error for corrupted JSON`
    (JSON hỏng thì báo lỗi rõ)
    - Đầu vào file: `{ not valid json`
    - Mong đợi: `StorageError`

29. `JsonTicketRepository: throws clear error when JSON root is not an array`
    (JSON không phải mảng thì báo lỗi rõ)
    - Đầu vào file:
      ```json
      { "tickets": [] }
      ```
    - Mong đợi: `StorageError`

---

## 4. Integration — CLI wiring (12 tests)

File: `tests/integration/cli.test.js`

Nhóm này test `runCli(argv, io)`.

### Command `create`

30. `CLI create: writes ticket fields to JSON and prints success`
    (Create thành công thì ghi đúng vào file và in success)
    - Đầu vào argv:
      ```js
      [
        'create',
        '--title', 'Bug login',
        '--description', 'cannot sign in',
        '--priority', 'high',
        '--tags', 'bug,auth',
        '--data-file', '<temp>/tickets.json'
      ]
      ```
    - Mong đợi: exit `0`; stdout có `Created ticket`; file có ticket với `title`, `description`, `status=open`, `priority=high`, `tags=['bug','auth']`

31. `CLI create: prints clear error for invalid input and does not create ticket`
    (Thiếu title thì báo lỗi và không tạo file)
    - Đầu vào argv:
      ```js
      ['create', '--data-file', '<temp>/tickets.json']
      ```
    - Mong đợi: exit `1`; stderr có `title is required`; file không được tạo

32. `CLI create: prints clear error for invalid priority`
    (Priority sai thì báo lỗi rõ)
    - Đầu vào argv:
      ```js
      ['create', '--title', 'Bug login', '--priority', 'urgent', '--data-file', '<temp>/tickets.json']
      ```
    - Mong đợi: exit `1`; stderr có `priority must be one of`

### Command `list`

33. `CLI list: filters tickets by status and prints matches`
    (Lọc theo status và in ticket khớp)
    - Setup: file có 2 ticket, 1 `open`, 1 `closed`
    - Đầu vào argv:
      ```js
      ['list', '--status', 'open', '--data-file', '<temp>/tickets.json']
      ```
    - Mong đợi: exit `0`; stdout có `Bug login`; không có `Docs update`

34. `CLI list: prints clear error for invalid status filter`
    (Status filter sai thì báo lỗi rõ)
    - Đầu vào argv:
      ```js
      ['list', '--status', 'done', '--data-file', '<temp>/tickets.json']
      ```
    - Mong đợi: exit `1`; stderr có `status must be one of`

35. `CLI list: prints clear error when JSON file is corrupted`
    (JSON hỏng thì báo lỗi rõ)
    - Setup: file chứa `{ not valid json`
    - Đầu vào argv:
      ```js
      ['list', '--data-file', '<temp>/tickets.json']
      ```
    - Mong đợi: exit `1`; stderr có `corrupted`

### Command `show`

36. `CLI show: prints clear not found error`
    (Không thấy ticket thì báo not found)
    - Đầu vào argv:
      ```js
      ['show', 'missing-id', '--data-file', '<temp>/tickets.json']
      ```
    - Mong đợi: exit `1`; stderr có `not found`

37. `CLI show: prints clear error when id is missing`
    (Thiếu id thì báo lỗi rõ)
    - Đầu vào argv:
      ```js
      ['show', '--data-file', '<temp>/tickets.json']
      ```
    - Mong đợi: exit `1`; stderr có `ticket id is required`

### Command `update`

38. `CLI update: rewrites ticket status in JSON file`
    (Update thành công thì ghi lại status mới)
    - Setup: file có ticket id `1`, status `open`
    - Đầu vào argv:
      ```js
      ['update', '1', '--status', 'closed', '--data-file', '<temp>/tickets.json']
      ```
    - Mong đợi: exit `0`; stdout có `Updated ticket 1`; file có `status = 'closed'`; `title` giữ nguyên

39. `CLI update: prints clear error for invalid status`
    (Status update sai thì báo lỗi rõ)
    - Đầu vào argv:
      ```js
      ['update', '1', '--status', 'done', '--data-file', '<temp>/tickets.json']
      ```
    - Mong đợi: exit `1`; stderr có `status must be one of`

40. `CLI update: prints clear error when id is missing`
    (Thiếu id thì báo lỗi rõ)
    - Đầu vào argv:
      ```js
      ['update', '--status', 'closed', '--data-file', '<temp>/tickets.json']
      ```
    - Mong đợi: exit `1`; stderr có `ticket id is required`

41. `CLI update: prints clear error when status is missing`
    (Thiếu status thì báo lỗi rõ)
    - Đầu vào argv:
      ```js
      ['update', '1', '--data-file', '<temp>/tickets.json']
      ```
    - Mong đợi: exit `1`; stderr có `status is required`

---

## 5. E2E (1 test)

File: `tests/e2e/cli.e2e.test.js`

42. `E2E happy path: create → list → show → update against temp JSON`
    (Luồng thật từ terminal: create → list → show → update)
    - Đầu vào: chạy thật các lệnh
      1. `create --title "Bug login" --description "cannot sign in" --tags bug,auth`
      2. `list --status open`
      3. `show <id vừa tạo>`
      4. `update <id> --status closed`
    - Mong đợi:
      - create: stdout có `Created ticket`, ticket có field đúng
      - list: thấy ticket vừa tạo
      - show: thấy đúng id
      - update: stdout có `Updated ticket`, file JSON cuối cùng có `status = 'closed'`

---

## Rule nghiệp vụ đang bị khóa bởi test

| Field | Rule |
|---|---|
| `title` | Bắt buộc, không rỗng sau trim |
| `description` | Tùy chọn, trim chuỗi |
| `status` | `open` \| `in_progress` \| `closed`, mặc định `open` |
| `priority` | `low` \| `medium` \| `high`, mặc định `medium` |
| `tags` | Tự do, nhận chuỗi `"a,b"` hoặc mảng; mặc định `[]` |
| `id` | Bắt buộc cho `show` và `update` |
| Storage | file thiếu → `[]`; JSON hỏng / không phải array → `StorageError` |
