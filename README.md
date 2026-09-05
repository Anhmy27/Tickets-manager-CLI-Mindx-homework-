# Tickets Manager CLI — MindX Homework

Repository này chứa bài làm MindX Engineer Onboarding:

README root này chỉ để định hướng nhanh theo tuần. Chi tiết chạy/cài đặt nằm trong README của từng package.

## Cấu trúc hiện tại

| Folder                                               | Vai trò                                                     |
| ---------------------------------------------------- | ----------------------------------------------------------- |
| [`week-1/`](./week-1/)                               | Nghiên cứu nền tảng TDD + Hexagonal                         |
| [`week-2/ticket-manager-cli/`](./week-2/ticket-manager-cli/) | Ứng dụng CLI chính (ticket + KB commands)             |
| [`week-3/kb-api-client/`](./week-3/kb-api-client/)   | HTTP client package để gọi KB API                           |
| [`week-3/kb-api-server/`](./week-3/kb-api-server/)   | KB API server chạy độc lập cho HTTP mode end-to-end         |
| [`week-4/`](./week-4/)                               | CS/OE training, ticket handling, scenario và AI summary     |
| [`week-5/odoo-automation/`](./week-5/odoo-automation/) | Bot tự động hóa ticket login trên Odoo (mock HR + mock LMS) |
| [`docs/plans/`](./docs/plans/)                       | Kế hoạch và mục tiêu theo tuần                              |

## Nên đọc theo thứ tự

1. [`week-1/tdd-foundation/README.md`](./week-1/tdd-foundation/README.md)
2. [`week-2/research/ai-summary.md`](./week-2/research/ai-summary.md)
3. [`week-2/ticket-manager-cli/README.md`](./week-2/ticket-manager-cli/README.md)
4. [`week-3/research/ai-summary.md`](./week-3/research/ai-summary.md)
5. [`week-3/kb-api-server/README.md`](./week-3/kb-api-server/README.md)
6. [`week-3/kb-api-client/README.md`](./week-3/kb-api-client/README.md)
7. [`week-4/research/ai-summary.md`](./week-4/research/ai-summary.md)
8. [`week-5/research/ai-summary.md`](./week-5/research/ai-summary.md)
9. [`week-5/odoo-automation/README.md`](./week-5/odoo-automation/README.md)

## Chạy nhanh end-to-end (HTTP mode)

### 1) Chạy server

```bash
cd week-3/kb-api-server
npm install
npm start
```

Mặc định server listen ở `http://127.0.0.1:4100`.

### 2) Chạy CLI

```bash
cd week-2/ticket-manager-cli
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
cd week-2/ticket-manager-cli && npm test
cd ../../week-3/kb-api-client && npm test
cd ../kb-api-server && npm test
```

## Tuần 5: Odoo automation (login issue)

`week-5/odoo-automation` là package độc lập để xử lý ticket đăng nhập trong Odoo:

- Quét ticket ở stage intake theo `requiredStageId`.
- Nhận diện login issue theo rules, ưu tiên tag rồi fallback sang title/description.
- Check trạng thái nhân sự từ **mock HR** và trạng thái tài khoản từ **mock LMS**.
- Chỉ auto xử lý case `LMS=deactivated` + `HR=active`.
- Các case còn lại ghi note nội bộ để agent xử lý thủ công.

### Chạy nhanh

```bash
cd week-5/odoo-automation
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

`requiredStageId` và `resolvedStageId` được cấu hình trong `week-5/odoo-automation/ticket-rules.json` (single source of truth).

Chi tiết flow quyết định, SLA ACK và nội dung note/mail nằm trong [`week-5/odoo-automation/README.md`](./week-5/odoo-automation/README.md).
