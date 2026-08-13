# Tuần 1 — Research TDD cho Ticket Manager CLI

##1. TDD và Red-Green-Refactor
TDD là gì?
TDD (Test-Driven Development) là cách phát triển trong đó viết test trước, rồi mới viết code. Mục đích cốt lõi của việc viết test trước và code sau giúp cho dev nắm rõ behavior của hệ thống, có một quy trình làm việc chuyên nghiệp, làm đến đâu chắc đến đấy, code chuẩn, đủ và không bị thừa so với scope để tránh những trường hợp code rác, ko hợp lý. đặc biệt là viết unit test trước cũng giúp dev thiết kế hệ thống tốt hơn, tách module chuẩn chỉ, giảm tải việc một file làm rất nhiều việc( đặc điểm rất dễ gặp nếu code trước rồi mới test). Đặc biệt với việc AI gần như giúp việc viết code như hiện nay thì TDD lại càng trở lên quan trọng. dev sẽ là người cần test và kiểm tra lại xem AI code như thế nào.
Red-Green-Refactor
Red: Viết test trước rồi chạy test. Test phải fail vì chức năng chưa được implement hoặc chưa đúng.
Green: Viết lượng code tối thiểu để test pass. Lúc này ưu tiên làm đúng behavior đã xác định, chưa cần tối ưu code.
Refactor: Khi test đã pass, chỉnh sửa cấu trúc code để dễ đọc, dễ maintain hoặc giảm duplication, nhưng không thay đổi behavior. Sau mỗi thay đổi, chạy lại test để đảm bảo chức năng cũ vẫn đúng.
##2. Unit vs Integration vs E2E
Unit test
Kiểm tra một đơn vị logic nhỏ như function hoặc class, giúp các hàm xử lý chuẩn xác nghiệp vụ. Ví dụ: tạo tickets thiếu title thì phải báo lỗi, filter không hợp lệ thì lỗi,.... Câu hỏi chính: Logic này đúng chưa?
Integration test
Kiểm tra nhiều thành phần module khi ghép lại với nhau . Ví dụ API nhận POST /users → Controller → UserService → UserRepository → ghi JSON file thật → trả response.. Câu hỏi chính: Các phần kết nối với nhau có chạy đúng không?
E2E test
Kiểm tra toàn bộ flow từ đầu đến cuối theo cách gần với người dùng thật. Ví dụ với CLI, test chạy command thật, truyền input và kiểm tra kết quả cuối cùng. Phạm vi rộng nhất, thường chậm và tốn công setup nhất nên chỉ cần tập trung vào các flow quan trọng. Câu hỏi chính: Người dùng có sử dụng hệ thống được không?

## 3. Ví dụ về hướng test cho Ticket Manager CLI

Lấy lệnh `create` làm ví dụ. Mỗi cấp test sẽ trả lời một câu hỏi khác nhau.

### Unit test — logic có đúng không?

Unit test nên tách riêng validation và service, không đụng file thật. Storage được mock, test chỉ quan tâm hành vi trong memory.
Với `create`, nên kiểm tra:

- Title rỗng phải báo lỗi
- Title hợp lệ thì ticket có `id`
- Status mặc định là `open`
- Priority có giá trị mặc định nếu user không truyền
- Service create xong phải gọi lưu đúng một lần với dữ liệu đúng shape
  Không cần biết ticket được lưu vào đâu. Unit test chỉ cần biết service có gọi lưu đúng hay không.

### Integration test — các phần nối với nhau có chạy không?

Integration test dùng file JSON thật trong thư mục tạm, không mock storage nữa.
Với `create`, nên kiểm tra:

- Gọi service create xong thì mở file JSON thấy ticket mới trong file
- Field đọc lại khớp với dữ liệu đã tạo
- File chưa tồn tại thì app tự tạo
- File corrupt thì báo lỗi rõ, không crash im lặng

### E2E test — người dùng gõ lệnh có dùng được không?

E2E test không gọi trực tiếp hàm `create` trong code. Test chạy đúng như user thật trên terminal.
Ví dụ:
tickets create --title "Bug login"
Kỳ vọng:

- Terminal báo tạo thành công
- File lưu ticket có ticket mới
- Nếu quên title thì chương trình báo lỗi rõ ràng
- Khi lỗi xảy ra thì không tạo ticket sai
  E2E chỉ nên viết ít, mỗi lệnh một case thành công là đủ. Case lỗi chi tiết như title rỗng, file hỏng, id không tồn tại nên để unit và integration test xử lý.

## 4. Cách testing giúp kiểm soát code do AI sinh ra

### Cần test những gì cho CLI tool (VD: Ticket Manager CLI)

Với Ticket Manager CLI, không nên chỉ test xem terminal có hiện chữ "success" hay không. CLI cần được test theo hành vi thật của người dùng và kết quả thật sau khi chạy lệnh.

1. Test validation
   CLI nhận input trực tiếp từ user, nên input sai phải được chặn sớm.
   Ví dụ:

- `create` thiếu title thì phải báo lỗi
- Status không hợp lệ thì bị reject
- Priority sai thì không được lưu
- Thiếu field bắt buộc thì không được tạo ticket

2. Test service
   Sau khi input hợp lệ thì service sẽ xử lý như thế nào?
   ví dụ:

- input hợp lệ thì sẽ gọi hàm tạo/update ticket với id, title chuẩn xác với những gì user nhập.
- response trả về chuẩn xác.
  **3. Test lưu file JSON**
  Không chỉ kiểm tra màn hình báo thành công. Cần kiểm tra dữ liệu có thật sự được lưu đúng không.
  Ví dụ:
- Create xong thì ticket phải có trong file JSON
- `list` và `show` phải đọc đúng dữ liệu từ file
- `update` phải ghi lại thay đổi đúng
- File chưa tồn tại thì app nên tự tạo
- File JSON bị hỏng thì phải báo lỗi rõ, không crash im lặng
  **4. Test error cases**
  Cần kiểm tra các lỗi thường gặp:
- Ticket id không tồn tại
- Thiếu argument bắt buộc
- Dữ liệu trong file bị corrupt
- Command sai cú pháp
  Mục tiêu là khi lỗi xảy ra, chương trình phải fail rõ ràng, không làm hỏng dữ liệu và không khiến user khó hiểu.

### Testing kiểm soát AI như thế nào?

Test là lớp kiểm soát nhanh,nhưng test pass chưa đủ. Vẫn cần tự verify:

- Đọc code AI, hiểu nó làm gì trước khi dùng
- Kiểm tra test có yếu không, ví dụ assertion mơ hồ hoặc thiếu case lỗi
- Kiểm tra có hallucination không, ví dụ API giả hoặc logic không khớp yêu cầu
  Test nói đúng/sai theo spec đã viết. Bạn vẫn là người quyết định spec đó có đủ và code có đáng tin không.

## 5. Lỗi thường gặp

### Chỉ test trường hợp thành công

Nhiều người chỉ test `create` với title hợp lệ, thấy tạo được ticket là dừng. Như vậy chưa đủ, vì lỗi thường nằm ở input thiếu, status sai, id không tồn tại, hoặc file JSON bị hỏng.
Nên luôn có thêm vài case lỗi quan trọng.

### Test quá chung chung

Ví dụ chỉ kiểm tra “có kết quả trả về” hoặc “màn hình có chữ success”. Code vẫn có thể sai dữ liệu bên trong.
Nên kiểm tra rõ:

- Title có đúng không
- Status có đúng mặc định không
- Ticket có được lưu vào file không

### Test phụ thuộc dữ liệu cũ

Chạy test trên file data thật rồi quên dọn dữ liệu sẽ làm test không ổn định. Hôm nay pass, mai fail vì trong file đã có ticket từ lần chạy trước.
Nên dùng file tạm cho test, mỗi test tự chuẩn bị dữ liệu và tự dọn sau khi chạy.

### Chỉ kiểm tra màn hình, không kiểm tra kết quả thật

Với CLI, thấy terminal báo “created” chưa chắc ticket đã được lưu.
Nếu command có ghi file, test nên kiểm tra cả file sau khi chạy.

### Để AI viết test theo code sai

Nếu đưa code hiện tại cho AI rồi bảo “viết test cho code này”, AI dễ viết test khớp với implementation đang có, kể cả implementation sai yêu cầu.
Nên mô tả yêu cầu trước, review test trước, rồi mới dùng test để kiểm soát code.

## 6. Quá trình research với AI

- https://chatgpt.com/share/6a705a6c-2650-83ec-8e00-735ebc6c84fa
- https://chatgpt.com/share/6a705b06-d460-83ec-8c8a-50818a70af9b
- https://chatgpt.com/share/6a705c15-7708-83ec-9bc2-ff5c454b8717
- https://chatgpt.com/share/6a7063f6-79f4-83ec-ba7e-a0d2597c17bc
