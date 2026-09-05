# Week 2

## Mục tiêu

Implement Ticket Manager CLI bằng TDD: các lệnh `create`, `list`, `show`, `update`, lưu ticket bằng JSON local.

## Trong folder này

| Mục | Vai trò |
|-----|---------|
| [`ticket-manager-cli/`](./ticket-manager-cli/) | Source CLI chính (ticket + sau đó nối KB ở Week 3) |
| [`research/ai-summary.md`](./research/ai-summary.md) | Tóm tắt quá trình làm việc với AI tuần 2 |

## Chạy nhanh

```bash
cd ticket-manager-cli
npm install
npx tsx src/cli.ts create --title "Bug login" --priority high
npx tsx src/cli.ts list
npm test
```

Chi tiết lệnh và kiến trúc: [`ticket-manager-cli/README.md`](./ticket-manager-cli/README.md)
