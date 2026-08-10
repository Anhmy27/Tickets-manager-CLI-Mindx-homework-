# Tickets Manager CLI — MindX Homework

Repository này chứa bài làm **Week 2: Ticket Manager CLI** của MindX Engineer Onboarding.

Nếu bạn mới mở link GitHub, hãy vào **2 folder chính** bên dưới để đọc tài liệu chi tiết. README ở root này chỉ mang tính hướng dẫn định hướng.

## Bắt đầu từ đâu?

| Folder | Đọc gì ở đây? |
|---|---|
| [`ticket-manager-cli/`](./ticket-manager-cli/) | Source code CLI, kiến trúc Hexagonal, hướng dẫn cài đặt/dùng lệnh, và cách chạy test |
| [`research-and-ai-implementation/`](./research-and-ai-implementation/) | Tài liệu research và quá trình dùng AI để thiết kế/implement bài |

## Nên đọc theo thứ tự

1. Vào [`ticket-manager-cli/README.md`](./ticket-manager-cli/README.md)  
   để hiểu dự án là gì, chạy lệnh thế nào, kiến trúc ra sao.
2. Vào [`research-and-ai-implementation/README.md`](./research-and-ai-implementation/README.md)  
   để xem cách dùng AI trong quá trình làm bài và nơi đặt file export chat/research notes.

## Tóm tắt nhanh

- Xây CLI quản lý ticket, lưu dữ liệu local bằng JSON.
- Thực hành TDD: Red → Green → Refactor.
- Tổ chức code theo Hexagonal Architecture: domain, application, inbound/outbound ports & adapters.
- Các lệnh chính: `create`, `list`, `show`, `update`.

## Chạy nhanh project

```bash
cd ticket-manager-cli
npm install
npm test
node src/cli.js --help
```

Chi tiết đầy đủ nằm trong README của từng folder, không nằm ở file này.
