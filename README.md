# Tickets Manager CLI — MindX Homework

Repository này chứa bài làm MindX Engineer Onboarding: **Tuần 2 Ticket Manager CLI** và **Tuần 3 Knowledge Base** (mock client + HTTP client package riêng).

Nếu bạn mới mở link GitHub, hãy vào **4 folder chính** bên dưới để đọc tài liệu chi tiết. README ở root này chỉ mang tính hướng dẫn định hướng.

## Bắt đầu từ đâu?

| Folder | Đọc gì ở đây? |
|---|---|
| [`research-week-1/`](./research-week-1/) | Research Week 1: TDD + Hexagonal Architecture (học thêm) |
| [`ticket-manager-cli/`](./ticket-manager-cli/) | Source code CLI, kiến trúc layered, hướng dẫn cài đặt/dùng lệnh ticket và `kb`, cách chạy test |
| [`kb-api-client/`](./kb-api-client/) | HTTP client thật cho KB API (package riêng ở root), test riêng cho client |
| [`research-and-ai-implementation/`](./research-and-ai-implementation/) | Export chat AI và ghi chú quá trình implement Week 2 |

## Nên đọc theo thứ tự

1. Vào [`research-week-1/README.md`](./research-week-1/README.md)  
   để xem research Week 1 (TDD + Hexagonal).
2. Vào [`ticket-manager-cli/README.md`](./ticket-manager-cli/README.md)  
   để hiểu dự án là gì, chạy lệnh thế nào, kiến trúc ra sao.
3. Vào [`research-and-ai-implementation/README.md`](./research-and-ai-implementation/README.md)  
   để xem export chat AI và ghi chú implement.

## Tóm tắt nhanh

- Xây CLI bằng **TypeScript**: ticket lưu JSON local; KB có cả mock in-memory và HTTP client.
- Thực hành TDD: Red → Green → Refactor.
- Tổ chức code theo layered architecture: commands, services, models, storage, clients.
- Tách HTTP client thật thành package root `kb-api-client` để test độc lập.
- Lệnh ticket: `create`, `list`, `show`, `update`.
- Lệnh KB: `kb search`, `kb list`, `kb retrieve`, `kb add` (mock hoặc HTTP qua env).

## Chạy nhanh project

```bash
cd ticket-manager-cli
npm install
npm test
npx tsx src/cli.ts list
npx tsx src/cli.ts kb search "response" --top-k 3
```

Hoặc:

```bash
npm start -- list
npm start -- kb search "response" --top-k 3
```

Chi tiết đầy đủ nằm trong README của từng folder, không nằm ở file này.
