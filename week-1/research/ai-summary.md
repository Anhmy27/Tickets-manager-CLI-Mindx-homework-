# Week 1 - Tóm tắt làm việc với AI

## Mục tiêu tuần

- Nghiên cứu nền tảng TDD để chuẩn bị làm Ticket Manager CLI ở tuần 2.
- Hiểu vòng lặp Red - Green - Refactor và cách dùng test để kiểm soát code do AI hỗ trợ.
- Tìm hiểu thêm Hexagonal Architecture như phần mở rộng kiến thức, không phải yêu cầu bắt buộc của bài.

## AI đã hỗ trợ gì?

- Tổng hợp lại lý thuyết TDD theo hướng dễ áp dụng vào CLI: viết test trước, để test fail, implement tối thiểu cho pass, sau đó refactor.
- Làm rõ “test là lớp kiểm soát AI”: mình không để AI viết code tự do, mà dùng test/spec để khóa hành vi mong muốn.
- Bổ sung phần testing cho CLI: test input validation, command parsing, lưu file JSON, xử lý lỗi, và kiểm tra end-to-end.
- Dịch và format lại tài liệu tuần 1 để dễ đọc hơn khi review.
- Giải thích Hexagonal Architecture ở mức nền tảng: domain/use case/adapter, inbound/outbound port, và vì sao kiến trúc này giúp tách business logic khỏi I/O.

## Quyết định mình đã chốt sau khi trao đổi với AI

- Dùng TDD làm cách triển khai chính cho các tuần sau, đặc biệt là tuần 2.
- Khi làm CLI, test sẽ đi từ phần nhỏ đến phần lớn: validation -> service -> storage -> CLI wiring -> E2E.
- Học Hexagonal Architecture để hiểu tư duy tách lớp, nhưng khi nộp bài vẫn cần cân nhắc bám đúng yêu cầu mentor.

## Mình đã chủ động kiểm chứng/chỉnh AI ở đâu?

- Không chỉ nhận lý thuyết TDD chung chung, mình yêu cầu AI gắn vào bài Ticket Manager CLI cụ thể.
- Hỏi lại nhiều khái niệm chưa rõ như Red/Green/Refactor, unit/integration/E2E, domain logic vs I/O.
- Yêu cầu bổ sung phần “CLI cần test những gì” để tài liệu không chỉ là research lý thuyết.

## Kết quả và artifact

- Tài liệu nền tảng chính thức nằm ở:
  - `week-1/tdd-foundation/README.md`
  - `week-1/tdd-foundation/research-tdd-ticket-manager-cli.md`
  - `week-1/tdd-foundation/research-hexagonal-architecture.md`

## Kết luận tuần 1

Tuần 1 là tuần xây nền: hiểu TDD, hiểu cách biến yêu cầu thành test, và chuẩn bị mindset để tuần 2 không bắt đầu bằng code ngay mà bắt đầu bằng spec/test rõ ràng.
