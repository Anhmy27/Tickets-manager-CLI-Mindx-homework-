# Knowledge Base

---

## 1. Knowledge Base là gì?

Knowledge Base (KB) có thể hiểu đơn giản là **một kho kiến thức chung của team hoặc công ty**.

Trong quá trình làm việc, có rất nhiều thông tin cần được sử dụng lại nhiều lần, ví dụ:

* Hướng dẫn xử lý khi người dùng không đăng nhập được
* Câu trả lời cho những câu hỏi thường gặp
* Mẫu email gửi khách hàng
* Quy trình xử lý sự cố
* Hướng dẫn cho nhân viên mới
* Tài liệu và thông tin nội bộ của team

Thay vì những kiến thức này nằm rải rác trong tin nhắn, email hoặc chỉ có một vài người biết, chúng được tập trung vào Knowledge Base để mọi người có thể tìm và sử dụng lại khi cần.

Ví dụ:

Khách hàng báo **không đăng nhập được LMS**.

Nếu công ty đã có một bài trong KB tên là **“Hướng dẫn xử lý lỗi đăng nhập LMS”**, nhân viên support có thể tìm bài đó và làm theo thay vì phải tự nghĩ lại cách xử lý hoặc đi hỏi người khác.

### KB khác Ticket như thế nào?

Có thể hiểu rất đơn giản:

**Ticket = vấn đề đang xảy ra.**

**Knowledge Base = kiến thức đã có để giúp xử lý vấn đề.**

Ví dụ:

> Ticket: Khách hàng A không đăng nhập được LMS.

Trong KB có thể có:

> Hướng dẫn xử lý khi người dùng không đăng nhập được LMS.

Nhân viên nhận ticket → tìm KB → đọc hướng dẫn → xử lý ticket.

Vì vậy KB giúp team:

* Không phải giải quyết lại một vấn đề từ đầu nhiều lần
* Có cách xử lý thống nhất
* Người mới cũng có thể tìm tài liệu để làm theo
* Giảm việc phải hỏi những người có kinh nghiệm

---

## 2. Kiến thức trong KB được tổ chức như thế nào?

KB không nên là một nơi chứa hàng nghìn tài liệu lộn xộn.

Các tài liệu cần được **sắp xếp và phân loại** để sau này dễ tìm.

Một tài liệu trong KB thường có:

* **ID** — mã riêng của tài liệu
* **Title** — tên tài liệu
* **Content** — nội dung
* **Node / vị trí** — tài liệu thuộc nhóm nào
* **Tags** — các nhãn liên quan đến tài liệu

Ví dụ một tài liệu:

**Title:** Hướng dẫn hoàn tiền cho khách hàng  
**Node:** `/templates/email`  
**Tags:** `refund`, `email`, `support`

KB có thể được tổ chức giống một cái cây:

```text
Knowledge Base
│
├── Templates
│   └── Email
│       ├── Email xin lỗi khách hàng
│       └── Email xác nhận hoàn tiền
│
├── Support
│   ├── Lỗi đăng nhập LMS
│   └── Hướng dẫn reset mật khẩu
│
└── Team
    ├── DevOps
    └── Support
```

Nhờ vậy, người dùng có thể **đi vào đúng nhóm để xem tài liệu**, hoặc **search khi không biết tài liệu nằm ở đâu**.

---

## 3. Các chức năng chính của KB

Trong bài tuần 3, KB có 4 chức năng chính:

### Search – Tìm tài liệu

Dùng khi mình biết vấn đề cần tìm nhưng **không biết chính xác tài liệu nào**.

Ví dụ:

```text
Search: "không đăng nhập được LMS"
```

KB sẽ tìm những tài liệu có liên quan và trả kết quả về.

Có thể giới hạn số lượng kết quả, ví dụ `topK = 5` nghĩa là chỉ lấy tối đa 5 tài liệu phù hợp nhất.

---

### List – Xem tài liệu trong một nhóm

Dùng khi mình đã biết muốn xem nhóm nào.

Ví dụ:

```text
/templates/email
```

KB có thể trả về:

```text
Email xin lỗi khách hàng
Email xác nhận hoàn tiền
Email thông báo bảo trì
```

Có thể hiểu `list` giống như **mở một mục và xem bên trong có những tài liệu gì**.

---

### Retrieve – Lấy một tài liệu cụ thể

Sau khi đã tìm được tài liệu mình muốn, `retrieve` dùng để lấy **đầy đủ nội dung của đúng tài liệu đó**.

Ví dụ:

```text
ID: DOC_001
```

KB trả về:

```text
Title: Hướng dẫn reset mật khẩu LMS

Content:
Bước 1...
Bước 2...
Bước 3...
```

Nói đơn giản:

**Search giúp tìm bài → Retrieve giúp mở đúng bài đó ra đọc.**

---

### Add – Thêm kiến thức mới

KB không phải kho cố định mãi mãi.

Khi team có thêm một quy trình hoặc kiến thức mới, tài liệu đó cần được thêm vào KB.

Ví dụ team vừa có quy trình mới:

> Cách xử lý khi tài khoản LMS bị khóa.

Có thể dùng `add` để đưa tài liệu đó vào KB, đặt đúng nhóm và thêm các tag liên quan để sau này mọi người tìm được.

---

## 4. Search trong KB hoạt động như thế nào?

Có chức năng Search chưa có nghĩa là mọi KB tìm kiếm giống nhau.

Điểm khác nhau quan trọng là:

> **KB dựa vào đâu để biết tài liệu nào liên quan đến câu người dùng đang tìm?**

Có một số cách phổ biến.

### Keyword Search – tìm theo từ

Đây là cách đơn giản nhất.

Ví dụ KB có tài liệu:

> **Hướng dẫn hoàn tiền cho khách hàng**

Người dùng search:

```text
hoàn tiền
```

KB thấy tài liệu có chữ **“hoàn tiền”** nên trả tài liệu đó về.

Vấn đề xảy ra khi người dùng search:

```text
khách muốn lấy lại tiền
```

Con người hiểu:

> “lấy lại tiền” và “hoàn tiền” gần như đang nói cùng một việc.

Nhưng Keyword Search đơn giản chỉ nhìn vào **từ được viết trong tài liệu**. Nếu không có từ giống nhau, nó có thể không tìm thấy.

Trong KB tuần 3 hiện tại, phần search đang sử dụng cách **tìm theo từ như vậy**.

---

### Semantic Search – tìm theo ý nghĩa

Semantic Search giải quyết hạn chế trên.

Thay vì chỉ xem:

> “Có cùng chữ không?”

nó cố gắng tìm:

> “Có đang nói về cùng một vấn đề không?”

Ví dụ tài liệu là:

```text
Hướng dẫn hoàn tiền cho khách hàng
```

Người dùng hỏi:

```text
Khách muốn lấy lại tiền thì xử lý thế nào?
```

Mặc dù câu hỏi không viết giống tiêu đề tài liệu, Semantic Search vẫn có thể nhận ra hai nội dung có ý nghĩa gần nhau và đưa tài liệu đó lên.

Bên trong hệ thống, nội dung tài liệu và câu hỏi sẽ được chuyển thành dạng số để máy có thể so sánh xem chúng gần nhau về ý nghĩa đến mức nào.

Phần này thường được gọi là **embedding/vector**.

Không cần hiểu vector là “máy thực sự hiểu tiếng người”. Chỉ cần hiểu ở mức:

> **Hệ thống biến nội dung thành dạng mà máy có thể so sánh mức độ giống nhau về ý nghĩa.**

---

### Hybrid Search – kết hợp cả hai

Keyword Search có lợi thế khi người dùng biết chính xác từ cần tìm.

Ví dụ:

```text
LMS_ERROR_001
```

Nếu đây là mã lỗi, tìm đúng chữ này rất hiệu quả.

Semantic Search lại hữu ích khi người dùng diễn đạt vấn đề bằng ngôn ngữ tự nhiên.

Ví dụ:

```text
Học viên bảo không vào được trang học
```

có thể liên quan đến:

```text
Hướng dẫn xử lý lỗi đăng nhập LMS
```

Vì vậy một số hệ thống KB kết hợp cả hai:

```text
Keyword Search
      +
Semantic Search
      ↓
Hybrid Search
```

Tức là vừa tìm những tài liệu **trùng từ**, vừa tìm những tài liệu **gần về ý nghĩa**.

---

## 5. Ai thực hiện việc Search?

Trong hệ thống của tuần 3 có thể hình dung:

```text
Người dùng
    ↓
   CLI
    ↓
Knowledge Base
    ↓
Tìm tài liệu
    ↓
Trả kết quả
```

Ví dụ người dùng nhập:

```text
kb search "refund"
```

CLI nhận câu `"refund"` và gửi yêu cầu sang KB.

KB mới là phía tìm trong kho tài liệu và trả kết quả lại.

Vì vậy CLI không cần biết bên trong KB đang dùng Keyword Search, Semantic Search hay kết hợp cả hai.

CLI chỉ cần:

> “Tôi muốn tìm tài liệu liên quan đến câu này.”

KB chịu trách nhiệm:

> “Tôi sẽ tìm bằng cách nào và trả tài liệu nào cho anh.”

Trong project hiện tại, khi chạy bằng Mock thì chưa có KB server thật nên `MockKBClient` tự giữ một số tài liệu giả và tự tìm trong đó. Khi dùng HTTP client, CLI gửi yêu cầu sang KB server.

---

## 6. Một KB tốt không chỉ cần Search tốt

Search rất quan trọng, nhưng KB vẫn cần **nội dung được tổ chức tốt**.

Ví dụ nếu có 500 tài liệu nhưng:

* Tên tài liệu không rõ ràng
* Nội dung đã cũ
* Tài liệu bị trùng nhau
* Không biết tài liệu thuộc nhóm nào
* Không được cập nhật khi quy trình thay đổi

thì dù Search tốt, người dùng vẫn khó sử dụng KB.

Vì vậy một KB tốt cần:

**Có kiến thức hữu ích → được sắp xếp rõ ràng → dễ tìm → dễ đọc → được cập nhật khi kiến thức thay đổi.**

Search chỉ là một phần giúp người dùng tìm được kiến thức đó.

---

## 7. Tóm tắt

Có thể hiểu Knowledge Base bằng một câu:

> **Knowledge Base là một kho kiến thức được tổ chức để mọi người hoặc các hệ thống khác có thể dễ dàng tìm, đọc và sử dụng lại kiến thức khi cần.**
