# Week 3 — Research: Text search và Semantic search

Tài liệu tìm hiểu thêm theo góp ý mentor, gắn với lệnh `kb search` trong Knowledge Base tuần 3.

## 1. Vì sao cần phân biệt các kiểu search?

KB dùng để tìm tài liệu hỗ trợ (template mail, SOP, FAQ…).  
Câu hỏi thực tế thường không trùng 100% chữ trong tài liệu. Vì vậy cách search ảnh hưởng trực tiếp đến việc CS/ops tìm được đúng doc hay không.

Trong bài tuần 3, `kb search` hiện đang làm theo hướng **text / keyword đơn giản**.

## 2. Text search (keyword / full-text)

### Là gì?

Tìm theo **chữ / từ khóa** xuất hiện trong tài liệu.

Các mức thường gặp:

- **Exact / substring match:** chuỗi query có nằm trong title/content không
- **Token / keyword search:** tách từ, có thể bỏ dấu câu, không phân biệt hoa thường
- **Full-text search (nâng hơn):** ranking theo tần suất từ, fuzzy (gần đúng chính tả), boolean (`AND`/`OR`)

### Trong bài của mình đang làm gì?

Ở `kb-api-server`, search đang gần với substring match:

- Chuẩn hóa query về chữ thường
- Ghép `title + content + nodePath`
- Dùng `includes(query)` để lọc
- Cắt kết quả theo `topK`

Ưu điểm:

- Dễ hiểu, dễ implement, dễ test
- Nhanh với kho tài liệu nhỏ (homework)
- Kết quả dự đoán được: có chữ thì ra, không có chữ thì không

Hạn chế:

- Query phải “gần” chữ trong doc
- Ví dụ user gõ `không vào được hệ thống` có thể **không ra** doc chỉ viết `login issue` / `account deactivated`
- Không hiểu nghĩa gần nhau (đồng nghĩa, diễn đạt khác)

## 3. Semantic search

### Là gì?

Tìm theo **nghĩa**, không chỉ theo chữ trùng.

Luồng phổ biến:

1. Biến câu hỏi và từng document thành **vector embedding** (dãy số biểu diễn ngữ nghĩa)
2. So sánh độ tương đồng (cosine similarity…)
3. Trả về doc “gần nghĩa” nhất, dù wording khác

Ví dụ:

- Query: `user không đăng nhập được`
- Doc title: `Reset mật khẩu LMS` / `Account deactivated`
- Semantic có thể vẫn tìm ra vì cùng chủ đề login/account

Ưu điểm:

- Phù hợp KB thật: user hỏi kiểu tự nhiên, CS viết doc kiểu khác
- Bắt được đồng nghĩa / diễn đạt gần

Hạn chế:

- Phức tạp hơn: cần model embedding, lưu vector, ranking
- Khó giải thích hơn keyword (“vì sao ra doc này?”)
- Có thể trả doc “na ná” nhưng không đúng ý nếu corpus/noise lớn
- Overkill với dataset homework nhỏ nếu chỉ cần demo CRUD/search cơ bản

## 4. So sánh nhanh

| Tiêu chí                | Text / keyword search                | Semantic search                |
| ----------------------- | ------------------------------------ | ------------------------------ |
| Tiêu chí khớp           | Chữ / từ khóa                        | Nghĩa / ngữ cảnh               |
| Ví dụ mạnh              | Tìm đúng cụm `SLA`, `reset password` | Hỏi tự nhiên, wording khác doc |
| Độ phức tạp             | Thấp → trung bình                    | Cao hơn                        |
| Giải thích kết quả      | Dễ                                   | Khó hơn                        |
| Phù hợp homework tuần 3 | Đúng hướng hiện tại                  | Hướng mở rộng / production KB  |

## 5. Hybrid search (thường gặp ngoài thực tế)

Nhiều hệ thống KB thật dùng **hybrid**:

- Keyword bắt term quan trọng (`error code`, id, tên feature)
- Semantic bắt câu hỏi diễn đạt tự do
- Gộp / xếp hạng lại kết quả

Với CS/OE: hybrid thường thực tế hơn “chỉ semantic” hoặc “chỉ exact match”.

## 6. Liên hệ bài tuần 3 và hướng mở rộng

Hiện tại:

- Mục tiêu tuần 3 là mock → HTTP client/server → persist disk
- Search đủ dùng để demo `kb search` và TDD

Nếu mentor hỏi “biết thêm gì về search?”:

Hướng nâng cấp có thể (không bắt buộc tuần 3):

1. Cải thiện text search: tách token, bỏ dấu, ranking đơn giản
2. Thêm semantic / hybrid nếu kho tài liệu lớn và query đa dạng
3. Vẫn giữ contract CLI `kb search` — chỉ đổi cách xếp hạng phía server

## 7. Kết luận

- **Text search:** khớp chữ, đơn giản, đúng với implementation hiện tại của `kb search`
- **Semantic search:** khớp nghĩa, mạnh khi wording khác nhau, phức tạp hơn
- Homework tuần 3 chọn text search là hợp lý với scope; semantic/hybrid là phần cần hiểu thêm khi mang KB ra môi trường thật
