# Ticket Manager CLI

Ticket Manager CLI là công cụ dòng lệnh dùng để quản lý ticket và lưu dữ liệu cục bộ trong file JSON.

Dự án này được xây dựng cho Tuần 2 của MindX Engineer Onboarding với mục tiêu thực hành TDD theo vòng lặp Red -> Green -> Refactor. Code cũng được tổ chức theo hướng Hexagonal Architecture để tách rõ nghiệp vụ, use case, CLI adapter và JSON storage adapter.

## Trạng Thái

Hiện tại các chức năng tuần 2 đã được implement và test đang pass.

```bash
npm test
```

Kết quả mong đợi:

```text
44 pass / 0 fail
```

## Chức Năng Chính

| Lệnh | Mô tả |
|---|---|
| `create` | Tạo ticket mới với title, description, status, priority, tags |
| `list` | Liệt kê ticket, có thể filter theo status, priority, tags |
| `show <id>` | Xem chi tiết một ticket theo id |
| `update <id>` | Cập nhật status của ticket |

## Kiến Trúc

Dự án dùng cấu trúc Hexagonal Architecture ở mức đơn giản:

```text
User / Terminal
    |
    v
Inbound Adapter: CLI
    |
    v
Inbound Port: Ticket use cases
    |
    v
Application: TicketService
    |
    v
Domain: Ticket entity + validation rules
    |
    v
Outbound Port: TicketRepository
    |
    v
Outbound Adapter: JSON file storage
```

### Ý nghĩa từng layer

- `domain/`: chứa lõi nghiệp vụ của ticket, gồm `Ticket` entity, validation rules và domain errors.
- `application/`: chứa use case `TicketService`, điều phối luồng tạo/list/show/update ticket.
- `application/ports/`: định nghĩa inbound port cho use case và outbound port cho repository.
- `adapters/inbound/cli/`: nhận command từ terminal, parse arguments, gọi application service.
- `adapters/outbound/json/`: hiện thực repository bằng file JSON.

## Cấu Trúc Thư Mục

```text
ticket-manager-cli/
├── src/
│   ├── cli.js
│   ├── domain/
│   │   ├── shared/errors.js
│   │   └── tickets/ticket.js
│   ├── application/
│   │   ├── ports/ticket-repository-outbound-port.js
│   │   ├── ports/ticket-use-cases-inbound-port.js
│   │   └── use-cases/ticket-service.js
│   └── adapters/
│       ├── inbound/cli/ticket-cli-controller.js
│       └── outbound/json/json-ticket-repository.js
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── data/
│   └── .gitkeep
├── package.json
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

CLI có thể chạy trực tiếp bằng Node:

```bash
node src/cli.js <command>
```

Mặc định dữ liệu runtime được lưu tại:

```text
data/tickets.json
```

File `data/tickets.json` được gitignore vì đây là dữ liệu local khi chạy app. Folder `data/` vẫn được giữ trong repo bằng file `data/.gitkeep`.

### Tạo ticket

```bash
node src/cli.js create --title "Bug login"
```

Tạo ticket với nhiều thông tin hơn:

```bash
node src/cli.js create --title "API timeout" --description "Endpoint phản hồi chậm" --priority high --tags api,backend
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
node src/cli.js list
```

Filter theo status:

```bash
node src/cli.js list --status open
```

Filter theo priority và tags:

```bash
node src/cli.js list --priority high --tags api
```

### Xem chi tiết ticket

```bash
node src/cli.js show <id>
```

Ví dụ:

```bash
node src/cli.js show ticket-1
```

### Cập nhật status ticket

```bash
node src/cli.js update <id> --status closed
```

Ví dụ:

```bash
node src/cli.js update ticket-1 --status in_progress
```

### Dùng file dữ liệu tùy chỉnh

Có thể dùng `--data-file` để chỉ định file JSON khác:

```bash
node src/cli.js create --title "Bug login" --data-file ./tmp/tickets.json
```

Tính năng này hữu ích khi test hoặc muốn chạy thử mà không ghi vào `data/tickets.json` mặc định.

## Rule Nghiệp Vụ

Ticket có shape chuẩn:

```js
{
  id: string,
  title: string,
  description: string,
  status: 'open' | 'in_progress' | 'closed',
  priority: 'low' | 'medium' | 'high',
  tags: string[],
  createdAt: string,
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

Ví dụ:

```bash
node src/cli.js create
```

Kết quả:

```text
title is required
```

## Chạy Test

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

- Unit test: kiểm tra domain validation và use case logic.
- Integration test: kiểm tra JSON storage và CLI wiring.
- E2E test: chạy command thật từ terminal với file JSON tạm.

## Ghi Chú Học TDD

Dự án này bắt đầu từ test fail trước, sau đó mới implement code để test pass. Cách làm này giúp:

- Biến yêu cầu thành test rõ ràng.
- Kiểm soát code do AI sinh ra.
- Refactor kiến trúc sang Hexagonal mà vẫn giữ behavior đúng.
- Tự tin rằng các command CLI chính vẫn hoạt động sau khi sửa code.
