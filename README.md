# Tickets Manager CLI — MindX Homework

Repository này chứa bài làm MindX Engineer Onboarding:

README root này chỉ để định hướng nhanh. Chi tiết chạy/cài đặt nằm trong README của từng package.

## Cấu trúc hiện tại

| Folder                                                                 | Vai trò                                                     |
| ---------------------------------------------------------------------- | ----------------------------------------------------------- |
| [`docs/plans/`](./docs/plans/)                                         | Kế hoạch và mục tiêu theo tuần                              |
| [`ticket-manager-cli/`](./ticket-manager-cli/)                         | Ứng dụng CLI chính (ticket + KB commands)                   |
| [`kb-api-client/`](./kb-api-client/)                                   | HTTP client package để gọi KB API                           |
| [`kb-api-server/`](./kb-api-server/)                                   | KB API server chạy độc lập cho HTTP mode end-to-end         |
| [`odoo-automation/`](./odoo-automation/)                               | Bot tự động hóa ticket login trên Odoo (mock HR + mock LMS) |
| [`research-week-1/`](./research-week-1/)                               | Research Week 1 (TDD + Hexagonal)                           |
| [`research-and-ai-implementation/`](./research-and-ai-implementation/) | Ghi chú, transcript và artifact quá trình làm bài           |

## Nên đọc theo thứ tự

1. [`docs/plans/week-3/overview.md`](./docs/plans/week-3/overview.md)
2. [`ticket-manager-cli/README.md`](./ticket-manager-cli/README.md)
3. [`kb-api-server/README.md`](./kb-api-server/README.md)
4. [`kb-api-client/README.md`](./kb-api-client/README.md)
5. [`docs/plans/week-5/overview.vi.md`](./docs/plans/week-5/overview.vi.md)
6. [`odoo-automation/README.md`](./odoo-automation/README.md)

## Chạy nhanh end-to-end (HTTP mode)

### 1) Chạy server

```bash
cd kb-api-server
npm install
npm start
```

Mặc định server listen ở `http://127.0.0.1:4100`.

### 2) Chạy CLI

```bash
cd ticket-manager-cli
npm install
copy .env.example .env
```

Sửa `.env`:

```env
KB_CLIENT_MODE=http
KB_API_BASE_URL=http://127.0.0.1:4100
```

Chạy lệnh:

```bash
npx tsx src/cli.ts kb search "response" --top-k 3
```

## Test nhanh

```bash
cd ticket-manager-cli && npm test
cd ../kb-api-client && npm test
cd ../kb-api-server && npm test
```

## Tuần 5: Odoo automation (login issue)

`odoo-automation` là package độc lập để xử lý ticket đăng nhập trong Odoo:

- Quét ticket ở stage intake theo `requiredStageId`.
- Nhận diện login issue theo rules (`tags/title/description`).
- Check trạng thái nhân sự từ **mock HR** và trạng thái tài khoản từ **mock LMS**.
- Chỉ auto xử lý case `LMS=deactivated` + `HR=active`.
- Các case còn lại ghi note nội bộ để agent xử lý thủ công.

### Chạy nhanh

```bash
cd odoo-automation
npm install
copy .env.example .env
npm test
npm start
npm run dev
```

- `npm start`: quét một lần các ticket ở stage intake.
- `npm run dev`: chạy webhook server (`POST /webhook`) để nhận ticket real-time từ Odoo/ngrok.

### Biến môi trường chính

```env
ODOO_URL=https://mindx-training.odoo.com
ODOO_DB=mindx-training
ODOO_LOGIN=your-odoo-login@example.com
ODOO_API_KEY=replace-with-your-api-key
```

`requiredStageId` và `resolvedStageId` được cấu hình trong `odoo-automation/ticket-rules.json` (single source of truth).

Chi tiết flow quyết định, SLA ACK và nội dung note/mail nằm trong [`odoo-automation/README.md`](./odoo-automation/README.md).
