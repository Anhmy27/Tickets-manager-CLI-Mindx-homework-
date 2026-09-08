# Tuần 3 — Research: Knowledge Base

Tài liệu research về Knowledge Base, gắn với nhóm lệnh `kb` trong bài tuần 3 (`ticket-manager-cli` + `kb-api-client` + `kb-api-server`).

---

## 1. Vai trò của KB trong xử lý ticket

Support nhận ticket mỗi ngày. Có những ticket gần như lặp lại: không login được, quên mật khẩu, hỏi cách làm một thao tác trên hệ thống…

Nếu mỗi lần đều phải tự nhớ cách xử lý, hỏi người khác, hoặc viết lại câu trả lời từ đầu thì tốn thời gian và dễ mỗi người làm một kiểu.

KB xuất hiện để giải bài toán đó: **gom kiến thức xử lý sẵn có vào một chỗ**, để lần sau gặp ticket giống thì tìm ra và dùng lại.

| Thành phần | Vai trò |
| --- | --- |
| Ticket | Việc đang cần xử lý *bây giờ* |
| KB | Tài liệu / hướng dẫn / template đã có để *giúp xử lý* |

KB không thay ticket. KB hỗ trợ người cầm ticket làm nhanh và thống nhất hơn.

---

## 2. Cách tổ chức tài liệu trong KB

Không phải cứ có nhiều file là thành KB tốt.

Một tài liệu trong KB thường cần đủ thông tin để tìm và đọc:

- định danh và tên bài (`id`, `title`)
- nội dung (`content`)
- vị trí trên cây thư mục (`nodePath`)
- nhãn chủ đề (`tags`)

Cây thư mục giúp browse theo nhóm. Search giúp khi không nhớ tài liệu nằm đâu.

Trong bài tuần 3, `nodePath` kiểu `/templates/email` chính là mục chứa tài liệu. Server lưu xuống folder tương ứng trong `data/`. CLI `add --file` chỉ gửi nội dung lên server, không gửi đường dẫn trên máy người dùng.

---

## 3. Các thao tác chính của KB

Bốn lệnh `kb` có thể hiểu theo nhu cầu sử dụng:

| Nhu cầu | Lệnh | Ý nghĩa |
| --- | --- | --- |
| Biết vấn đề nhưng chưa biết bài nào | `search` | Trả về các tài liệu liên quan |
| Đã biết muốn mở mục nào | `list` | Xem danh sách trong mục đó |
| Đã có đúng ID, muốn đọc full | `retrieve` | Mở đúng một tài liệu |
| Có quy trình / guide mới cần lưu | `add` | Thêm kiến thức mới vào KB |

`topK` dùng để giới hạn số kết quả trả về.

Mock mode và HTTP mode đều thực hiện cùng 4 thao tác này. Khác nhau chủ yếu ở chỗ dữ liệu nằm trong process giả hay nằm trên server thật.

---

## 4. Các kiểu search trong KB

Có chức năng search chưa đồng nghĩa search đã tốt. Điểm quan trọng là hệ thống quyết định “liên quan” theo tiêu chí nào.

**Keyword / text search**  
Tài liệu có chữ gần giống query thì được trả về.  
Ví dụ search `hoàn tiền` khớp bài “Hướng dẫn hoàn tiền…”.  
Nhưng search `khách muốn lấy lại tiền` có thể không ra, dù người đọc hiểu là cùng ý.

Trong `kb-api-server` tuần 3, search đang làm theo hướng này: chuẩn hóa chữ thường rồi `includes` trên title + content + nodePath. Cách này đủ cho homework, dễ test và dễ giải thích.

**Semantic search**  
Không đòi wording giống nhau. Câu hỏi tự nhiên vẫn có thể khớp tài liệu cùng chủ đề. Thường dùng embedding/vector để so mức gần nghĩa.

**Hybrid search**  
Keyword mạnh với mã lỗi hoặc tên feature. Semantic mạnh với câu hỏi diễn đạt tự do. Nhiều KB thực tế kết hợp cả hai.

Điều cần nắm: **cách match quyết định người dùng có tìm ra đúng guide hay không**, nhất là khi câu hỏi không trùng title tài liệu.

---

## 5. Luồng search trong hệ thống tuần 3

```text
Người dùng gõ lệnh
  → CLI nhận query
  → client (mock / HTTP)
  → phía KB tìm trong kho
  → trả tài liệu về
```

CLI không cần biết bên trong match bằng chữ hay bằng vector. CLI chỉ gửi yêu cầu tìm kiếm.  
Phía KB mới quyết định cách tìm và tài liệu nào được trả về.

- Mock: giữ một số document giả rồi tự lọc
- HTTP: `kb-api-client` gọi `kb-api-server`

---

## 6. Yêu cầu đối với một KB sử dụng được

Search chỉ là một phần. Nếu title mơ hồ, nội dung cũ, tài liệu trùng, hoặc không cập nhật khi quy trình đổi thì search tốt vẫn khó dùng.

Chuỗi cần có:

**có kiến thức đúng → xếp đúng chỗ → tìm được → đọc được → cập nhật khi thay đổi**

Sang tuần 5, khi phân tích ticket login, các giả định cũng đi theo hướng này:

- thiếu tài liệu hướng dẫn → bổ sung docs vào KB trước
- đã có docs mà user vẫn không được → automation reply kèm tài liệu
- case deactivate / inactive → nhánh xử lý account, không chỉ gửi guide

KB không đứng riêng. Nó nằm trong vòng: ticket lặp → chuẩn hóa kiến thức → (nếu đủ điều kiện) mới automation.

---

## 7. Kết luận

Knowledge Base là kho kiến thức được tổ chức để mọi người hoặc hệ thống khác có thể tìm, đọc và sử dụng lại khi cần. Nội dung phải đủ rõ để người khác làm theo được.

Trong homework tuần 3 đã có đường ống tối thiểu: thêm bài, xem theo nhóm, tìm theo chữ, mở đúng bài. Keyword search đủ để demo. Semantic/hybrid là hướng mở rộng khi KB dùng thật với câu hỏi diễn đạt tự nhiên, không trùng 100% chữ trong tài liệu.
