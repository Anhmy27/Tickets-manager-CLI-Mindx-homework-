# Week 3

## Mục tiêu

Mở rộng CLI với Knowledge Base: mock-first → HTTP client → KB API server → persist document xuống disk.

## Trong folder này

| Mục | Vai trò |
|-----|---------|
| [`kb-api-client/`](./kb-api-client/) | HTTP client gọi KB API |
| [`kb-api-server/`](./kb-api-server/) | KB API server (listen local, lưu `data/`) |
| [`research/ai-summary.md`](./research/ai-summary.md) | Tóm tắt quá trình làm việc với AI tuần 3 |

Lệnh `kb` nằm trong CLI Week 2: [`../week-2/ticket-manager-cli/`](../week-2/ticket-manager-cli/)

## Chạy nhanh (HTTP mode)

```bash
# Terminal 1 — server
cd kb-api-server
npm install
npm start
# mặc định http://127.0.0.1:4100

# Terminal 2 — CLI
cd ../week-2/ticket-manager-cli
npm install
copy .env.example .env
# set KB_CLIENT_MODE=http và KB_API_BASE_URL=http://127.0.0.1:4100
npx tsx src/cli.ts kb search "response" --top-k 3
```

## Test

```bash
cd kb-api-client && npm test
cd ../kb-api-server && npm test
```

Chi tiết: [`kb-api-client/README.md`](./kb-api-client/README.md) · [`kb-api-server/README.md`](./kb-api-server/README.md)
