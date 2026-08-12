# Tuần 1 — Research TDD cho Ticket Manager CLI

## 1. TDD và Red-Green-Refactor

### TDD là gì?

TDD là cách làm trong đó mình viết test trước khi viết code chính. Test đóng vai trò như một yêu cầu nhỏ:

- Chương trình cần nhận input gì
- Chương trình cần trả ra kết quả gì
- Khi gặp lỗi thì chương trình phải xử lý ra sao

Điểm quan trọng của TDD là không bắt đầu bằng việc code ngay. Mình bắt đầu bằng việc làm rõ hành vi mong muốn, sau đó mới viết code để đáp ứng hành vi đó.

### Red-Green-Refactor

**Red** là bước viết test trước và chạy test. Ở bước này test nên fail, vì code chưa có hoặc chưa xử lý đúng yêu cầu. Nếu test pass ngay từ đầu thì có thể test đang quá yếu hoặc chưa kiểm tra đúng thứ cần kiểm tra.

**Green** là bước viết code vừa đủ để test pass. Mục tiêu ở bước này không phải viết code hoàn hảo, mà là làm cho hành vi đã mô tả trong test chạy đúng.

**Refactor** là bước dọn lại code sau khi test đã pass. Có thể đổi tên hàm, tách logic, làm code dễ đọc hơn, nhưng không được làm thay đổi hành vi. Vì đã có test giữ lại, mình biết việc dọn code có làm hỏng chức năng cũ hay không.

## 2. Unit vs Integration vs E2E

Ba loại test khác nhau ở câu hỏi cần trả lời, không phải ở độ dài.

### Unit test

Unit test cô lập một mảnh logic, ví dụ một hàm hoặc một class.

- Dependency bên ngoài như file, API, DB được mock, không dùng thật
- Chạy nhanh, viết nhiều, cover edge case chi tiết
- Câu hỏi chính: **logic này đúng chưa?**

### Integration test

Integration test ghép nhiều mảnh lại và để chúng nói chuyện với nhau, thường dùng I/O thật như file JSON hoặc HTTP.

- Không cô lập hoàn toàn như unit test
- Có thể dùng file JSON thật trong thư mục tạm
- Câu hỏi chính: **các phần nối với nhau có chạy không?**

### E2E test

E2E test chạy từ đầu đến cuối như user thật.

- Với CLI, test sẽ gõ lệnh thật trên terminal
- Kiểm tra output và kết quả cuối cùng
- Chậm nhất, viết ít nhất, chủ yếu cover happy path
- Câu hỏi chính: **người dùng dùng được không?**

### Nhầm lẫn thường gặp

Nhiều người nghĩ integration test chỉ đơn giản là test dài hơn unit test. Thực ra điểm khác nhau là **cô lập hay ghép thật**. Integration test có thể ngắn, nhưng vẫn phải chạm file/API thật hoặc ghép nhiều phần thật với nhau.

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

Các ví dụ khác:

- `list`: filter theo status chỉ trả ticket đúng status
- `show`: id không tồn tại phải báo lỗi
- `update`: status không hợp lệ phải reject

### Integration test — các phần nối với nhau có chạy không?

Integration test dùng file JSON thật trong thư mục tạm, không mock storage nữa.

Với `create`, nên kiểm tra:

- Gọi service create xong thì mở file JSON thấy ticket mới trong file
- Field đọc lại khớp với dữ liệu đã tạo
- File chưa tồn tại thì app tự tạo
- File corrupt thì báo lỗi rõ, không crash im lặng

Với `list`, `show`, `update`, có thể setup vài ticket trong file trước, chạy thao tác, rồi kiểm tra file và output thay đổi đúng.

### E2E test — người dùng gõ lệnh có dùng được không?

E2E test không gọi trực tiếp hàm `create` trong code. Test chạy đúng như user thật trên terminal.

Ví dụ:

```bash
tickets create --title "Bug login"
```

Kỳ vọng:

- Terminal báo tạo thành công
- File lưu ticket có ticket mới
- Nếu quên title thì chương trình báo lỗi rõ ràng
- Khi lỗi xảy ra thì không tạo ticket sai

E2E chỉ nên viết ít, mỗi lệnh một case thành công là đủ. Case lỗi chi tiết như title rỗng, file hỏng, id không tồn tại nên để unit và integration test xử lý.

### Thứ tự viết test cho tuần 2

1. Kiểm tra validation
2. Kiểm tra service
3. Kiểm tra lưu file
4. Kiểm tra lệnh CLI nối với storage
5. Cuối cùng E2E chạy lệnh thật

## 4. Cách testing giúp kiểm soát code do AI sinh ra

### Cần test những gì cho CLI tool (Ticket Manager CLI)

Với Ticket Manager CLI, không nên chỉ test xem terminal có hiện chữ "success" hay không. CLI cần được test theo hành vi thật của người dùng và kết quả thật sau khi chạy lệnh.

**1. Test các lệnh chính**

Cần test các lệnh:

- `tickets create`
- `tickets list`
- `tickets show <id>`
- `tickets update <id>`

Mỗi lệnh cần kiểm tra input hợp lệ có chạy đúng không, output có rõ ràng không, và command có gọi đúng logic phía sau không.

**2. Test validation**

CLI nhận input trực tiếp từ user, nên input sai phải được chặn sớm.

Ví dụ:

- `create` thiếu title thì phải báo lỗi
- Status không hợp lệ thì bị reject
- Priority sai thì không được lưu
- Thiếu field bắt buộc thì không được tạo ticket

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

Test là lớp kiểm soát nhanh:

1. Viết test trước hoặc review kỹ test
2. Nhờ AI implement
3. Chạy test
4. Nếu test fail thì biết AI thiếu gì hoặc sai gì
5. Nếu test pass thì mới tiếp tục code phần khác
6. Khi AI refactor xong, chạy lại test để chắc rằng hành vi cũ không bị phá

Nhưng test pass chưa đủ. Vẫn cần tự verify:

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
