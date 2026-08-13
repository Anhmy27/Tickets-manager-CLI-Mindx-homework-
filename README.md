# Tickets Manager CLI — MindX Homework

Repository này chứa bài làm **Week 2: Ticket Manager CLI** của MindX Engineer Onboarding.

Nếu bạn mới mở link GitHub, hãy vào **3 folder chính** bên dưới để đọc tài liệu chi tiết. README ở root này chỉ mang tính hướng dẫn định hướng.

## Bắt đầu từ đâu?

| Folder | Đọc gì ở đây? |
|---|---|
| [`research-week-1/`](./research-week-1/) | Research Week 1: TDD + Hexagonal Architecture (học thêm) |
| [`ticket-manager-cli/`](./ticket-manager-cli/) | Source code CLI, kiến trúc Hexagonal, hướng dẫn cài đặt/dùng lệnh, và cách chạy test |
| [`research-and-ai-implementation/`](./research-and-ai-implementation/) | Export chat AI và ghi chú quá trình implement Week 2 |

## Nên đọc theo thứ tự

1. Vào [`research-week-1/README.md`](./research-week-1/README.md)  
   để xem research Week 1 (TDD + Hexagonal).
2. Vào [`ticket-manager-cli/README.md`](./ticket-manager-cli/README.md)  
   để hiểu dự án là gì, chạy lệnh thế nào, kiến trúc ra sao.
3. Vào [`research-and-ai-implementation/README.md`](./research-and-ai-implementation/README.md)  
   để xem export chat AI và ghi chú implement.

## Tóm tắt nhanh

- Xây CLI quản lý ticket bằng **TypeScript**, lưu dữ liệu local bằng JSON.
- Thực hành TDD: Red → Green → Refactor.
- Tổ chức code theo Hexagonal Architecture: domain, application, inbound/outbound ports & adapters.
- Các lệnh chính: `create`, `list`, `show`, `update`.

## Chạy nhanh project

```bash
cd ticket-manager-cli
npm install
npm test
npx tsx src/cli.ts list
```

Hoặc:

```bash
npm start -- list
```

Chi tiết đầy đủ nằm trong README của từng folder, không nằm ở file này.
