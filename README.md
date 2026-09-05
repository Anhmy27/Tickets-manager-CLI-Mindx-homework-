# Tickets Manager CLI — MindX Homework

Bài làm MindX Engineer Onboarding, tổ chức theo tuần. Chi tiết sâu nằm trong README của từng package.

## Cấu trúc theo tuần

| Tuần | Nội dung | Đi vào |
|------|----------|--------|
| Week 1 | Research TDD + Hexagonal | [`week-1/tdd-foundation/`](./week-1/tdd-foundation/) · [`research`](./week-1/research/ai-summary.md) |
| Week 2 | Ticket Manager CLI | [`week-2/ticket-manager-cli/`](./week-2/ticket-manager-cli/) · [`research`](./week-2/research/ai-summary.md) |
| Week 3 | KB HTTP client + server | [`week-3/kb-api-client/`](./week-3/kb-api-client/) · [`week-3/kb-api-server/`](./week-3/kb-api-server/) · [`research`](./week-3/research/ai-summary.md) |
| Week 4 | CS / Operating Engineer | [`week-4/research/ai-summary.md`](./week-4/research/ai-summary.md) |
| Week 5 | Odoo automation (login issue) | [`week-5/odoo-automation/`](./week-5/odoo-automation/) · [`research`](./week-5/research/ai-summary.md) |

## Week 2–3: Ticket CLI + KB

### Cài đặt

```bash
# 1) Cài và chạy KB API server (HTTP mode)
cd week-3/kb-api-server
npm install
npm start
# Server mặc định listen: http://127.0.0.1:4100

# 2) Terminal khác — cài CLI
cd week-2/ticket-manager-cli
npm install
copy .env.example .env
```

Trong `.env` của CLI:

```env
# mock = dùng MockKBClient in-memory
# http = gọi kb-api-server qua kb-api-client
KB_CLIENT_MODE=http
KB_API_BASE_URL=http://127.0.0.1:4100
```

### Chạy CLI

```bash
cd week-2/ticket-manager-cli

# Cách chạy chung
npx tsx src/cli.ts <command>
# hoặc
npm start -- <command>
```

### Lệnh ticket

```bash
# Tạo ticket mới
npx tsx src/cli.ts create --title "Bug login" --description "Cannot sign in" --priority high --tags login,lms

# Liệt kê ticket (có thể lọc status / priority / tags)
npx tsx src/cli.ts list
npx tsx src/cli.ts list --status open --priority high

# Xem chi tiết theo id
npx tsx src/cli.ts show <ticket-id>

# Cập nhật status (Week 2 chỉ đổi status)
npx tsx src/cli.ts update <ticket-id> --status in_progress
```

### Lệnh KB

```bash
# Tìm document theo query
npx tsx src/cli.ts kb search "response" --top-k 3

# Liệt kê document trong một nhánh KB
npx tsx src/cli.ts kb list --node /templates/email --limit 5

# Lấy full document theo id
npx tsx src/cli.ts kb retrieve <doc-id>

# Thêm document từ file markdown vào KB
npx tsx src/cli.ts kb add --file ./note.md --path /templates/email --title "ACK template"
```

### Test Week 2–3

```bash
cd week-2/ticket-manager-cli && npm test   # ticket CLI + kb mock/http wiring
cd ../../week-3/kb-api-client && npm test  # HTTP client package
cd ../kb-api-server && npm test            # KB API server
```

## Week 5: Odoo automation

```bash
cd week-5/odoo-automation
npm install
copy .env.example .env
```

Trong `.env` điền credentials Odoo:

```env
ODOO_URL=https://mindx-training.odoo.com
ODOO_DB=mindx-training
ODOO_LOGIN=your-odoo-login@example.com
ODOO_API_KEY=replace-with-your-api-key
```

Stage IDs cấu hình trong `ticket-rules.json` (`requiredStageId`, `resolvedStageId`).

```bash
npm test       # chạy unit test
npm start      # quét một lần ticket ở stage intake, xử lý theo rule
npm run dev    # chạy webhook server: POST /webhook, GET /health
```

Quyết định chính:

- `AUTO_RESOLVE` — `LMS=deactivated` + `HR=active` → reactive mock LMS, move stage, note nội bộ, reply khách
- `NEED_REVIEW` — login issue nhưng chưa đủ điều kiện auto → chỉ ghi note nội bộ
- `SKIP` — không thuộc scope / thiếu email → không side effect

Chi tiết: [`week-5/odoo-automation/README.md`](./week-5/odoo-automation/README.md)
