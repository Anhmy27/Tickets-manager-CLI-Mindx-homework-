# Tickets Manager CLI — MindX Homework

Repository này chứa bài làm MindX Engineer Onboarding:

- **Tuần 2:** Ticket Manager CLI
- **Tuần 3:** Knowledge Base integration (mock client + HTTP client + KB API server)

README root này chỉ để định hướng nhanh. Chi tiết chạy/cài đặt nằm trong README của từng package.

## Cấu trúc hiện tại

| Folder | Vai trò |
|---|---|
| [`docs/plans/`](./docs/plans/) | Kế hoạch và mục tiêu theo tuần |
| [`ticket-manager-cli/`](./ticket-manager-cli/) | Ứng dụng CLI chính (ticket + KB commands) |
| [`kb-api-client/`](./kb-api-client/) | HTTP client package để gọi KB API |
| [`kb-api-server/`](./kb-api-server/) | KB API server chạy độc lập cho HTTP mode end-to-end |
| [`research-week-1/`](./research-week-1/) | Research Week 1 (TDD + Hexagonal) |
| [`research-and-ai-implementation/`](./research-and-ai-implementation/) | Ghi chú, transcript và artifact quá trình làm bài |

## Nên đọc theo thứ tự

1. [`docs/plans/week-3/overview.md`](./docs/plans/week-3/overview.md)
2. [`ticket-manager-cli/README.md`](./ticket-manager-cli/README.md)
3. [`kb-api-server/README.md`](./kb-api-server/README.md)
4. [`kb-api-client/README.md`](./kb-api-client/README.md)

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
