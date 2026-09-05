# Phân tích ticket và lý do chọn tool xử lý đăng nhập

---

## 1. Kết luận

Trong tuần 4 có **6 tình huống**, mỗi tình huống là một loại vấn đề khác nhau chứ không phải 6 ticket cùng một lỗi.

Sau khi xem lại, em chia 6 tình huống thành **4 nhóm**. Trong đó nhóm **LMS chạy kém / lỗi hệ thống** có nhiều tình huống và ảnh hưởng nhiều người nhất. Tuy nhiên, em chọn vấn đề **không đăng nhập được LMS** để làm tool vì đây là công việc support phải làm theo các bước khá giống nhau, và phần lớn các bước đều có thể kiểm tra / xử lý bằng dữ liệu.

Tool hiện tại nằm trong `week-5/odoo-automation`, đã nối với Odoo Helpdesk (scan stage + webhook).

---

## 2. Em đã làm gì?

### Bước 1 — Xem lại 6 tình huống tuần 4

Em mở lại các ticket trên Odoo và đối chiếu với 6 bài tập tuần 4. Với mỗi tình huống, em xem:

- Khách đang gặp vấn đề gì
- Support phải làm những bước nào để xử lý
- Thời gian xử lý thủ công khoảng bao lâu
- Việc đó có lặp lại hay không
- Có phần nào máy có thể làm thay support không

### Bước 2 — Chia thành các nhóm

Sau khi xem lại, em chia 6 tình huống thành 4 nhóm:

- Tài khoản LMS
- LMS chạy kém / lỗi hệ thống
- Yêu cầu tính năng
- Công việc nội bộ có hạn chót

Việc chia nhóm giúp nhìn rõ hơn loại vấn đề nào xuất hiện nhiều, loại nào ảnh hưởng nhiều người, và loại nào phù hợp để tự động hóa.

### Bước 3 — Chọn vấn đề đăng nhập

Mặc dù nhóm LMS chạy kém có nhiều tình huống hơn và ảnh hưởng nhiều người hơn, em không chọn nhóm này vì nguyên nhân thường nằm ở hệ thống và cần Dev Team kiểm tra.

Với ticket đăng nhập, quy trình rõ hơn: kiểm tra người dùng còn hiệu lực không, kiểm tra trạng thái tài khoản LMS, rồi kích hoạt lại / xử lý tiếp nếu đủ điều kiện. Đây là chuỗi việc máy có thể làm thay phần lớn nên em chọn loại này.

### Bước 4 — Làm tool và nối Odoo

Em làm package `odoo-automation` để xử lý nhóm login trên Helpdesk. Phần chi tiết chạy tool nằm ở README package; báo cáo này tập trung vào phân tích và lý do chọn bài toán.

---

## 3. Sáu loại vấn đề trong tuần 4

### 01 — Không đăng nhập được / tài khoản LMS

- Nhóm: Tài khoản LMS
- Ảnh hưởng: 1 giáo viên
- Thời gian làm tay: khoảng 5–10 phút
- Các bước xử lý khá giống nhau giữa các lần
- Máy có thể kiểm tra trạng thái nhân sự và tài khoản

*Đây là loại em chọn để làm tool.*

### 02 — LMS chậm, không tải được trang

- Nhóm: LMS chạy kém
- Ảnh hưởng: khoảng 15 học viên trong một lớp
- Thời gian xử lý: khoảng 15–30 phút để kiểm tra ban đầu và trao đổi
- Support có thể kiểm tra sơ bộ và thông báo cho khách
- Nếu lỗi từ hệ thống thì vẫn cần Dev Team tìm nguyên nhân

### 03 — Hệ thống lỗi, không nộp được bài

- Nhóm: LMS chạy kém
- Ảnh hưởng: hơn 50 học viên ở nhiều lớp
- Mức độ ảnh hưởng lớn, cần ưu tiên xử lý
- Support chủ yếu tiếp nhận, cập nhật tình hình và chuyển Dev Team

### 04 — Yêu cầu tính năng mới

- Nhóm: Yêu cầu tính năng / Product
- Ảnh hưởng trực tiếp: 1 người gửi yêu cầu
- Nội dung có thể khác nhau ở mỗi ticket
- Support không tự quyết định hoặc tự triển khai được
- Cần chuyển Product Team đánh giá

### 05 — Video không xem được, nhiều người gặp cùng lúc

- Nhóm: LMS chạy kém
- Ảnh hưởng: khoảng 12 học viên
- Support cần xác định đây là lỗi từng người hay lỗi chung
- Nếu lỗi hệ thống / content thì chuyển Dev Team
- Quan trọng ở bước gom ticket cùng một sự cố, không trả lời như 3 lỗi riêng

### 06 — Yêu cầu báo cáo gấp, có hạn chót

- Nhóm: Công việc nội bộ / hạn chót
- Ảnh hưởng trực tiếp: 1 giám đốc
- Cần báo cáo trước một mốc giờ cụ thể
- Support cần làm rõ yêu cầu và liên hệ người có quyền xử lý
- Không phù hợp để máy tự quyết định

---

## 4. Phân loại theo nhóm

Em không để 6 tình huống thành 6 trường hợp rời mà gom theo loại vấn đề:

- **Nhóm A — Tài khoản LMS:** tình huống 01
- **Nhóm B — LMS chạy kém / lỗi hệ thống:** tình huống 02, 03, 05
- **Nhóm C — Yêu cầu tính năng:** tình huống 04
- **Nhóm D — Công việc nội bộ có hạn chót:** tình huống 06

Nhóm B nhiều nhất: **3/6 tình huống**.

Nhóm A trong bài tuần 4 chỉ có 1 tình huống. Nhưng nếu thực tế hay gặp quên mật khẩu hoặc tài khoản bị khóa do lâu không đăng nhập thì quy trình vẫn lặp lại nhiều. Vì vậy em chọn nhóm A để thử tự động hóa.

---

## 5. So sánh nhanh từ dữ liệu luyện tập

Số liệu dưới đây lấy từ các tình huống tuần 4 trên Odoo (kèm export `Phiếu hỗ trợ (helpdesk.ticket).xlsx` khi cần đối chiếu). Đây là data practice, không dùng để kết luận volume cả tháng thật.

### Theo nhóm (6 tình huống gốc)

- Nhóm A — Tài khoản LMS: **1/6 (~17%)**
- Nhóm B — LMS chạy kém: **3/6 (50%)**
- Nhóm C — Yêu cầu tính năng: **1/6 (~17%)**
- Nhóm D — Công việc nội bộ có hạn chót: **1/6 (~17%)**

### Theo mức độ ảnh hưởng

- 1 người, không phải sự cố hệ thống gấp: tình huống 01, 04
- Nhiều người (khoảng 5–25): tình huống 02, 05
- Rất nhiều người, cần xử lý ngay: tình huống 03
- Có hạn chót cụ thể: tình huống 06

### Số người bị ảnh hưởng

- 01 — đăng nhập: 1 giáo viên
- 02 — LMS chậm: ~15 học viên
- 03 — không nộp được bài: 50+ học viên
- 04 — yêu cầu tính năng: 1 người
- 05 — video lỗi: ~12 học viên
- 06 — báo cáo: 1 giám đốc, có hạn chót

Nhóm B ảnh hưởng nhiều người nhất; riêng tình huống 03 nặng nhất.  
Nhưng **ảnh hưởng lớn không có nghĩa là support tự làm tool được**. Các lỗi nhóm B chủ yếu cần Dev Team tìm nguyên nhân trong hệ thống.

---

## 6. Thời gian support xử lý thủ công (ước lượng)

Ước lượng khi em làm các tình huống tuần 4:

- **01 — Đăng nhập:** khoảng 8 phút/ticket
- **02 — LMS chậm:** khoảng 15–30 phút kiểm tra ban đầu, trao đổi và chuyển Dev
- **03 — Sự cố lớn:** phải theo dõi / cập nhật đến khi Dev xử lý xong
- **04 — Yêu cầu tính năng:** ghi nhận và chuyển Product
- **05 — Video lỗi:** kiểm tra phạm vi, xử lý tạm nếu có, chuyển Dev nếu là lỗi chung
- **06 — Báo cáo gấp:** làm rõ yêu cầu rồi chuyển người có quyền; thời gian còn phụ thuộc phía nhận

Từ đây em rút ra:

- Nhóm xuất hiện nhiều nhất trong 6 tình huống: **LMS chạy kém**
- Tình huống ảnh hưởng nhiều người nhất: **03**
- Công việc support **tự động hóa rõ nhất**: **01 — đăng nhập**

Nếu chỉ nhìn số lượng tình huống thì nhóm B đáng ưu tiên. Nhưng mục tiêu tool là giảm việc lặp lại mà support đang làm tay, nên em chọn đăng nhập.

---

## 7. Vì sao chọn vấn đề đăng nhập?

Khi người dùng báo không đăng nhập được, support thường làm gần như cùng một chuỗi:

1. Kiểm tra người dùng còn hiệu lực / còn làm việc không
2. Kiểm tra có tài khoản LMS không
3. Kiểm tra trạng thái tài khoản
4. Nếu bị deactivate / khóa và đủ điều kiện thì kích hoạt lại
5. Phản hồi người dùng
6. Ghi kết quả trên ticket

Các bước này điều kiện khá rõ, dữ liệu kiểm tra được, nên máy làm thay được phần lớn.

Trong khi đó 5 tình huống còn lại khó để support tự động xử lý hết:

- LMS chậm, sập, video lỗi → cần Dev tìm nguyên nhân
- Yêu cầu tính năng → Product quyết định
- Báo cáo gấp → phụ thuộc nội dung yêu cầu và quyền từng người

Vì vậy em chọn bài toán nhỏ hơn nhưng quy trình rõ và tự động hóa được.

---

## 8. Làm tool hay chờ sửa LMS?

Nếu LMS có rule tự khóa / deactivate tài khoản sau một thời gian không dùng, đó thường là quy định hệ thống chứ không hẳn bug.

Muốn đổi rule thì cần Product xem xét, có thể phải chờ Dev sửa LMS. Trong lúc đó support vẫn phải xử lý ticket hằng ngày.

Vì vậy em chọn làm tool trước để giảm phần việc của support. Nếu người dùng vẫn còn hiệu lực và tài khoản đủ điều kiện thì tool xử lý được ngay.

Về lâu dài, nếu loại ticket này nhiều thật, vẫn nên xem nguyên nhân gốc (nhắc trước khi khóa, hoặc Product xem lại rule).  
**Tool giúp giảm việc hiện tại, không thay việc sửa gốc.**

---

## 9. Phương án cho từng nhóm

### Nhóm A — Tài khoản LMS

Dùng tool đã làm ở `odoo-automation`.

Với case đủ điều kiện (ví dụ còn active phía nhân sự và LMS đang deactivate), tool có thể xử lý giúp.  
Nếu đã nghỉ việc / thiếu thông tin / không chắc → để support xem tay, không tự xử lý.

### Nhóm B — LMS chạy kém / lỗi hệ thống

Support kiểm tra phạm vi ảnh hưởng trước.  
Nếu nhiều người cùng một lỗi thì gom thông tin, cập nhật chung, chuyển Dev Team.  
Em không chọn viết tool tự “sửa LMS” vì support không đủ thông tin và quyền để xử lý lỗi bên trong hệ thống.

### Nhóm C — Yêu cầu tính năng

Ghi nhận đủ yêu cầu, chuyển Product đánh giá.  
Không hứa thời gian khi Product chưa xác nhận.

### Nhóm D — Công việc có hạn chót

Hỏi rõ cần báo cáo gì, kỳ dữ liệu nào, hạn bao giờ, rồi chuyển người có quyền.  
Có thể dùng mẫu câu hỏi để đỡ hỏi lại, nhưng không để máy tự phê duyệt.

---

## 10. Tóm lại

Qua 6 tình huống tuần 4, em chia được 4 nhóm vấn đề.

Nhóm **LMS chạy kém** nhiều tình huống và ảnh hưởng nhiều người nhất, nhưng chủ yếu cần Dev Team nên không phù hợp để support tự làm tool trong thời gian ngắn.

Em chọn **tài khoản LMS / không đăng nhập được** vì quy trình rõ, lặp lại, và phần lớn bước kiểm tra được bằng dữ liệu.

Mục tiêu của tool không phải thay Dev Team hay đổi rule LMS, mà là giảm phần việc thủ công lặp lại của support.
