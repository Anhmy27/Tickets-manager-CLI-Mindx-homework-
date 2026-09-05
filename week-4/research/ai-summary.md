# Week 4 - Tóm tắt làm việc với AI

## Mục tiêu tuần

- Học mindset Operating Engineer và quy trình xử lý ticket.
- Thực hành phân loại ticket theo impact, SLA, Class of Service và giao tiếp với user.
- Chuẩn bị nền để tuần 5 chọn bài toán automation trên Odoo.

## AI đã hỗ trợ gì?

### 1. Làm rõ quy trình CS/OE

- Tóm tắt quy trình 7 bước xử lý ticket:
  1. Reception
  2. Initial Response/ACK
  3. Diagnosis
  4. Resolution
  5. Communication
  6. Follow-up
  7. Trend Analysis/Automation
- Giải thích điểm dễ nhầm: communication không chỉ là bước 5, mà diễn ra xuyên suốt; bước 2 chủ yếu là ACK ban đầu.
- Làm rõ cách đóng ticket khi không có phản hồi: cần resolve, nhắc lại, chờ một khoảng hợp lý rồi mới close theo quy trình no-response close.

### 2. Operating Engineer vs Software Engineer

- AI giúp mình diễn đạt sự khác nhau:
  - Software Engineer tập trung build/fix product system, sửa code và tối ưu dài hạn.
  - Operating Engineer tập trung vận hành, xử lý ticket nhanh, dùng config/workaround/automation trước khi cần code fix.
- Làm rõ tư duy non-invasive: không can thiệp core code nếu có thể resolve bằng thao tác ops an toàn.
- Giải thích các khái niệm trong slide:
  - Automation rate.
  - Configuration management.
  - Boundary awareness.
  - Ticket resolution time.

### 3. Chuẩn bị trả lời mentor

- AI hỗ trợ dựng câu trả lời dạng intern cho các câu hỏi:
  - “Bạn hiểu Operating Engineer là gì?”
  - “Vì sao OE cần automation?”
  - “Khi nào escalate cho dev team?”
  - “Configuration management là gì?”
  - “Automation rate đo cái gì?”
- Chuyển câu trả lời từ kiểu lý thuyết sang ví dụ gần bài làm: ticket login, HR/LMS status, Odoo stage/tag, webhook, manual review.

## Quyết định mình đã chốt

- Week 4 không cần package code riêng trong repo, vì phần chính là thực hành process trên Odoo và học CS/OE.
- `week-4` nên có README/link/evidence mô tả rõ tuần này làm gì, thay vì cố tạo code giả cho đủ folder.
- Các tài liệu chính của tuần 4 là CS training, Operating Engineer slides và scenario/ticket handling notes.

## Mình đã chủ động kiểm chứng/chỉnh AI ở đâu?

- Hỏi lại khi thấy các khái niệm dễ hiểu sai, ví dụ configuration management không chỉ là `.env` mà là quản lý setting hệ thống nói chung.
- Yêu cầu câu trả lời ở vai intern để chuẩn bị phỏng vấn/mentor review.
- Liên tục gắn lý thuyết với bài Odoo automation để câu trả lời không bị chung chung.

## Kết quả và artifact

- Tài liệu học:
  - `CS Training For Engineers.vi.md`
  - `slides-operating-engineer.md`
- Kế hoạch/scenario:
  - `docs/plans/week-4/`
- Output chính:
  - Hiểu quy trình CS.
  - Hiểu mindset Operating Engineer.
  - Có cách trả lời mentor về SLA, ticket priority, automation, config/workaround và escalation.

## Kết luận tuần 4

Tuần 4 là cầu nối giữa code và vận hành: mình học cách nhìn ticket theo impact/user/SLA, từ đó tuần 5 mới chọn được một pattern lặp lại để automation.
