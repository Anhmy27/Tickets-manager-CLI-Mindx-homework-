# Ticket Manager CLI

Ticket Manager CLI là công cụ dòng lệnh viết bằng **TypeScript**, dùng để quản lý ticket (lưu JSON cục bộ) và truy vấn Knowledge Base.

Dự án bắt đầu từ Tuần 2 (ticket + TDD). Tuần 3 hỗ trợ 2 client cho lệnh `kb`: `MockKBClient` (in-memory) và HTTP client thật (qua package root `kb-api-client`). Code được tổ chức theo **layered architecture**: commands, services, models, storage, clients.

## Trạng Thái

Ticket tuần 2 và KB tuần 3 (mock + HTTP wiring) đã implement; `npm test` đang pass.

```bash
npm test
```

Kết quả mong đợi:

```text
92 pass / 0 fail
```

## Chức Năng Chính

| Lệnh | Mô tả |
|---|---|
| `create` | Tạo ticket mới với title, description, status, priority, tags |
| `list` | Liệt kê ticket, có thể filter theo status, priority, tags |
| `show <id>` | Xem chi tiết một ticket theo id |
| `update <id>` | Cập nhật status của ticket |
| `kb search <query>` | Tìm document KB theo title/content |
| `kb list --node <path>` | Liệt kê document trong một nhánh KB |
| `kb retrieve <id>` | Xem đầy đủ một document KB |
| `kb add --file --path` | Thêm document từ file markdown vào mock KB |

## Kiến Trúc

Dự án dùng layered architecture đơn giản:

```text
User / Terminal
    |
    v
Command Layer: parse and route CLI commands
    |
    +------------------+------------------+
    |                                     |
    v                                     v
Service Layer                      Client Layer
ticket use-case                    KbClient contract
orchestration                      MockKBClient / HTTP client adapter
    |                                     |
    v                                     v
Model Layer                        Model Layer
ticket rules                       KB document types
    |
    v
Storage Layer: JSON file persistence
```

### Ý nghĩa từng layer

- `commands/`: nhận command từ terminal, parse arguments; ticket thì gọi service, `kb` thì gọi KB client.
- `services/`: chứa `TicketService`, điều phối luồng tạo/list/show/update ticket.
- `models/`: chứa `Ticket`, kiểu KB (`KbDocument`, ...), validation rules và custom error.
- `storage/`: hiện thực lưu trữ ticket bằng file JSON (`JsonTicketRepository`).
- `clients/`: hợp đồng `KbClient`, `MockKBClient`, và adapter để gọi HTTP client thật từ package root `kb-api-client`.

## Cấu Trúc Thư Mục

```text
ticket-manager-cli/
├── src/
│   ├── cli.ts
│   ├── commands/ticket-cli-controller.ts
│   ├── clients/
│   │   ├── kb-client-contract.ts
│   │   ├── mock-kb-client.ts
│   │   ├── http-kb-client-adapter.ts
│   │   └── create-kb-client.ts
│   ├── services/
│   │   ├── ticket-service.ts
│   │   └── ticket-use-cases-contract.ts
│   ├── models/
│   │   ├── errors.ts
│   │   ├── kb.ts
│   │   └── ticket.ts
│   └── storage/
│       ├── json-ticket-repository.ts
│       └── ticket-storage-contract.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── data/
│   └── .gitkeep
├── TEST-CATALOG.md
├── test-mockKBClient.md
├── package.json
├── tsconfig.json
└── README.md
```

## Cài Đặt

Yêu cầu:

- Node.js `>=18`
- npm

Chạy trong thư mục dự án:

```bash
cd ticket-manager-cli
npm install
```

## Hướng Dẫn Sử Dụng

Chạy CLI bằng `tsx` (dev):

```bash
npx tsx src/cli.ts <command>
```

Hoặc qua npm script:

```bash
npm start -- <command>
```

Sau khi build:

```bash
npm run build
node dist/src/cli.js <command>
```

Mặc định dữ liệu runtime được lưu tại:

```text
<data package>/data/tickets.json
```

Đường dẫn mặc định được neo theo thư mục package của CLI, không theo thư mục bạn đang đứng. Vì vậy sau `npm link`, dù chạy `tickets list` từ bất kỳ đâu cũng vẫn đọc cùng một file data của project.

File `data/tickets.json` được gitignore vì đây là dữ liệu local khi chạy app. Folder `data/` vẫn được giữ trong repo bằng file `data/.gitkeep`.

### Tạo ticket

```bash
npx tsx src/cli.ts create --title "Bug login"
```

Tạo ticket với nhiều thông tin hơn:

```bash
npx tsx src/cli.ts create --title "API timeout" --description "Endpoint phản hồi chậm" --priority high --tags api,backend
```

Các field hỗ trợ:

- `--title`: bắt buộc
- `--description`: không bắt buộc
- `--status`: `open`, `in_progress`, `closed`
- `--priority`: `low`, `medium`, `high`
- `--tags`: danh sách tag, phân tách bằng dấu phẩy

Command và option name không phân biệt chữ hoa/thường. Ví dụ `CREATE`, `create`, `--TITLE`, `--title` đều được parser hiểu đúng. Giá trị của `status` và `priority` cũng được normalize về chữ thường.

Giá trị mặc định:

- `status`: `open`
- `priority`: `medium`
- `tags`: `[]`

### Liệt kê ticket

```bash
npx tsx src/cli.ts list
```

Filter theo status:

```bash
npx tsx src/cli.ts list --status open
```

Filter theo priority và tags:

```bash
npx tsx src/cli.ts list --priority high --tags api
```

### Xem chi tiết ticket

```bash
npx tsx src/cli.ts show <id>
```

Ví dụ:

```bash
npx tsx src/cli.ts show ticket-1
```

### Cập nhật status ticket

```bash
npx tsx src/cli.ts update <id> --status closed
```

Ví dụ:

```bash
npx tsx src/cli.ts update ticket-1 --status in_progress
```

### Dùng file dữ liệu tùy chỉnh

Có thể dùng `--data-file` để chỉ định file JSON khác:

```bash
npx tsx src/cli.ts create --title "Bug login" --data-file ./tmp/tickets.json
```

Tính năng này hữu ích khi test hoặc muốn chạy thử mà không ghi vào `data/tickets.json` mặc định.

### Knowledge Base (mock + HTTP)

Mặc định CLI dùng `MockKBClient`: 3 document mẫu trong RAM. Mỗi lần chạy lệnh là một process mới, nên `kb add` không còn sau khi lệnh kết thúc.

Dữ liệu mẫu:

```text
/templates/email
  doc-001  Customer Response Template
  doc-003  Follow-up Email Template
/team/devops
  doc-002  DevOps Team Members
```

Tìm template:

```bash
npx tsx src/cli.ts kb search "response" --top-k 3
```

Liệt kê document trong một nhánh:

```bash
npx tsx src/cli.ts kb list --node /templates/email --limit 10
```

Tra cứu thông tin team:

```bash
npx tsx src/cli.ts kb list --node /team/devops
```

Xem đầy đủ một document:

```bash
npx tsx src/cli.ts kb retrieve doc-001
```

Thêm document từ file markdown (chỉ tồn tại trong process đó):

```bash
npx tsx src/cli.ts kb add --file ./new-template.md --path /templates/sms --tags sms
```

Các flag:

- `kb search`: query positional bắt buộc; `--top-k` số nguyên dương, tùy chọn
- `kb list`: `--node` bắt buộc; `--limit` số nguyên dương, tùy chọn
- `kb retrieve`: id positional bắt buộc
- `kb add`: `--file` và `--path` bắt buộc; `--tags` tùy chọn (chuỗi phân tách bằng dấu phẩy)

Giống lệnh ticket, `kb` / `KB` và `search` / `SEARCH` đều được nhận.

CLI đọc env từ `ticket-manager-cli/.env` (không ghi đè biến đã set trên shell). Copy `.env.example` nếu file `.env` chưa có:

```bash
copy .env.example .env
```

| Biến | Ý nghĩa |
| --- | --- |
| `KB_CLIENT_MODE` | `mock` (mặc định) hoặc `http` |
| `KB_API_BASE_URL` | Bắt buộc khi `KB_CLIENT_MODE=http` |

Chuyển sang HTTP client thật: sửa `.env` thành `KB_CLIENT_MODE=http` và set `KB_API_BASE_URL`, rồi:

```bash
npx tsx src/cli.ts kb search "response" --top-k 3
```

Hoặc set trên shell (PowerShell) — shell thắng `.env`:

```powershell
$env:KB_CLIENT_MODE="http"
$env:KB_API_BASE_URL="http://127.0.0.1:4100"
npx tsx src/cli.ts kb search "response" --top-k 3
```

## Rule Nghiệp Vụ

Ticket có shape chuẩn:

```ts
{
  id: string
  title: string
  description: string
  status: 'open' | 'in_progress' | 'closed'
  priority: 'low' | 'medium' | 'high'
  tags: string[]
  createdAt: string
  updatedAt: string
}
```

Các rule chính:

- `title` là bắt buộc và không được rỗng sau khi trim.
- `status` chỉ nhận `open`, `in_progress`, `closed`.
- `priority` chỉ nhận `low`, `medium`, `high`.
- `tags` có thể là chuỗi `"api,backend"` hoặc mảng string.
- Khi đọc ticket từ JSON storage, dữ liệu được hydrate qua `Ticket.fromPersistence(...)` trước khi service sử dụng.

## Xử Lý Lỗi

CLI trả exit code `1` và in lỗi rõ ràng khi gặp các trường hợp:

- Thiếu title khi tạo ticket.
- Status hoặc priority không hợp lệ.
- Không tìm thấy ticket theo id.
- File JSON bị hỏng hoặc root JSON không phải array.
- Thiếu query / `--node` / id / `--file` / `--path` cho lệnh `kb`.
- `--top-k` hoặc `--limit` không phải số nguyên dương.
- Không tìm thấy document KB theo id, file markdown `kb add` không tồn tại, hoặc HTTP request tới KB API thất bại.

Ví dụ:

```bash
npx tsx src/cli.ts create
```

Kết quả:

```text
title is required
```

```bash
npx tsx src/cli.ts kb retrieve missing-id
```

Kết quả:

```text
Document missing-id not found
```

## Chạy Test

Chạy typecheck:

```bash
npm run typecheck
```

Chạy toàn bộ test:

```bash
npm test
```

Chạy từng nhóm test:

```bash
npm run test:unit
npm run test:integration
npm run test:e2e
```

Các nhóm test:

- Unit test: kiểm tra domain validation, ticket use case, mock client, env client factory, và CLI-to-client wiring.
- Integration test: kiểm tra JSON storage, CLI với mock client, và CLI với HTTP client adapter.
- E2E test: chạy command thật từ terminal (`tsx src/cli.ts`) với file JSON tạm hoặc seed mock KB.

Chi tiết từng case:

- Ticket: [`TEST-CATALOG.md`](./TEST-CATALOG.md)
- KB mock: [`test-mockKBClient.md`](./test-mockKBClient.md)
- KB HTTP client package: [`../kb-api-client/README.md`](../kb-api-client/README.md)

## Ghi Chú Học TDD

Dự án này bắt đầu từ test fail trước, sau đó mới implement code để test pass. Cách làm này giúp:

- Biến yêu cầu thành test rõ ràng.
- Kiểm soát code do AI sinh ra.
- Refactor kiến trúc mà vẫn giữ behavior đúng.
- Tự tin rằng các command CLI chính vẫn hoạt động sau khi sửa code.
