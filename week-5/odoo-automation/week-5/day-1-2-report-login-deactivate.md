# Phân tích data ticket và lý do chọn tool xử lý đăng nhập

---

## 1. Kết luận

Em phân tích export Helpdesk Odoo: `Phiếu hỗ trợ (helpdesk.ticket).xlsx`.

Sau khi gom theo ticket ID, dataset có **18 ticket**. Em chia thành các nhóm theo tiêu đề + thẻ:

| Nhóm                                 |  Số |   % |
| ------------------------------------ | --: | --: |
| Tài khoản LMS / không đăng nhập được |  10 | 56% |
| LMS chạy kém / lỗi hệ thống          |   5 | 28% |
| Yêu cầu tính năng                    |   1 |  6% |
| Công việc nội bộ có hạn chót         |   1 |  6% |
| Khác (tải tài liệu)                  |   1 |  6% |

**Nhóm login chiếm nhiều ticket nhất (10/18 ≈ 56%).** Em chọn nhóm này để làm tool vì:

- Volume cao nhất trên data hiện tại
- Quy trình xử lý lặp, nhiều bước check được bằng dữ liệu
- Phù hợp để automation trong phạm vi support/ops

Nhóm LMS chạy kém / lỗi hệ thống ít ticket hơn nhưng từng đợt có thể ảnh hưởng nhiều user và thường cần Dev — em không chọn auto-resolve nhóm này trước.

Tool: `week-5/odoo-automation` (scan stage + webhook Odoo Helpdesk).

---

## 2. Nguồn data và cách đếm

- File: `Phiếu hỗ trợ (helpdesk.ticket).xlsx`
- Export có thể có nhiều dòng cho một ticket (tách theo thẻ / dòng nhóm stage)
- Trước khi thống kê: gom theo cột **`Trình tự ID phiếu hỗ trợ`**
- Kết quả: **18 ticket duy nhất**
- Phân loại: đọc **tiêu đề + thẻ**, gán vào nhóm vấn đề

Đây là data luyện tập trên Odoo training. Dùng để có bằng chứng số liệu trong homework, không dùng để kết luận volume cả tháng production.

---

## 3. Phân bố ticket theo nhóm

| Nhóm                         |  Số |   % | Ticket ID                                                            | Cách nhận diện trên data                                             |
| ---------------------------- | --: | --: | -------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Tài khoản LMS / login        |  10 | 56% | 00003, 00011, 00012, 00014, 00016, 00019, 00020, 00021, 00022, 00023 | Title chứa login / đăng nhập / ko login; nhiều ticket có thẻ `LMS`   |
| LMS chạy kém / lỗi hệ thống  |   5 | 28% | 00004, 00005, 00007, 00008, 00009                                    | Performance class; submission DOWN; video playback cùng lesson/class |
| Yêu cầu tính năng            |   1 |  6% | 00006                                                                | Feature request báo cáo PDF                                          |
| Công việc nội bộ có hạn chót |   1 |  6% | 00010                                                                | Enrollment report, fixed deadline                                    |
| Khác — tải tài liệu          |   1 |  6% | 00013                                                                | Không tải được tài liệu bài học                                      |

### Đọc nhanh

1. **Login là nhóm lớn nhất về số ticket.**
2. **Nhóm hệ thống (5 ticket)** gồm chậm LMS, nộp bài sập, và 3 ticket video cùng một pattern nội dung.
3. Feature / deadline / tải tài liệu mỗi nhóm chỉ 1 ticket trên dataset này.

---

## 4. Nhìn từng nhóm trên data

### 4.1 Login / tài khoản LMS — 10 ticket (~56%)

Title điển hình: `LMS Login Issue`, `không đăng nhập được`, `ko login dc`, `login lỗi`, `Login hỏng`…

- Phần lớn có thẻ `LMS`
- Một số ticket không có thẻ (00019, 00023) nhưng title vẫn rõ là login
- Mỗi ticket thường ảnh hưởng 1 user, nhưng **số lượng ticket cao** nên tốn thời gian support lặp lại

**Hướng xử lý:** check HR + trạng thái LMS → reactive nếu đủ điều kiện, hoặc review nếu không chắc.  
**Có nên auto?** Có — ưu tiên trên data này.

### 4.2 LMS chạy kém / lỗi hệ thống — 5 ticket (~28%)

Gồm:

- 00004 — performance, title ghi ~15 users trong class
- 00005 — submission system DOWN, 50+ users, mức độ khẩn cấp
- 00007, 00008, 00009 — video playback cùng Lesson 3 / class `JS-ADV-HN-2412` (~12 users); hai phiếu có chữ “(sao chép)” → cùng một sự cố được tạo nhiều ticket

**Hướng xử lý:** xác định phạm vi ảnh hưởng, gom ticket cùng pattern, cập nhật chung, escalate Dev nếu là lỗi hệ thống/content.  
**Có nên auto-resolve?** Chưa. Khác login: không có chuỗi check account cố định để bot tự sửa.

### 4.3 Yêu cầu tính năng — 1 ticket (~6%)

00006 — xin báo cáo PDF tiến độ gửi phụ huynh.

**Hướng xử lý:** ghi nhận, chuyển Product.  
**Auto-resolve?** Không.

### 4.4 Công việc nội bộ có hạn chót — 1 ticket (~6%)

00010 — báo cáo cho Director, có deadline.

**Hướng xử lý:** làm rõ scope rồi chuyển người có quyền.  
**Auto-resolve?** Không.

### 4.5 Khác — tải tài liệu — 1 ticket (~6%)

00013 — không tải được tài liệu bài 5.

**Hướng xử lý:** check quyền/file/assignment.  
**Auto?** Chưa — volume thấp trên dataset này.

---

## 5. Vì sao chọn login sau khi nhìn data

| Tiêu chí                            | Login                          | Nhóm hệ thống trên data               | Feature / deadline / tải tài liệu |
| ----------------------------------- | ------------------------------ | ------------------------------------- | --------------------------------- |
| Số ticket                           | 10 (56%)                       | 5 (28%)                               | Mỗi nhóm 1 ticket                 |
| Tính lặp quy trình support          | Cao (check account/HR lặp lại) | Thấp hơn — mỗi sự cố nguyên nhân khác | Thấp — judgment / clarify         |
| Khả năng auto trong phạm vi support | Cao nếu đủ điều kiện           | Thấp (thường cần Dev)                 | Thấp                              |

Kết luận từ data: **login vừa nhiều ticket nhất, vừa phù hợp để support tự động hóa các bước kiểm tra/xử lý lặp.**

Nhóm hệ thống có thể “nặng” hơn về số người bị ảnh hưởng từng đợt, nhưng không phải bài toán tool support tự resolve ổn định trong homework này.

---

## 6. Giả định và phương án cho ticket đăng nhập

Sau khi chọn nhóm login từ data, em tách các nhánh có thể gặp khi xử lý:

### Trường hợp 1 — User còn active, LMS bị deactivate

**Giả định:** Còn hiệu lực nhưng account deactivate.  
**Phương án:** Check user → check LMS → activate → cập nhật ticket → phản hồi.  
**Automation:** Có thể tự xử lý.

### Trường hợp 2 — User không còn active

**Giả định:** Đã nghỉ / không active trên HR.  
**Phương án:** Không tự activate; chuyển support.  
**Automation:** Không tự quyết.

### Trường hợp 3 — Không tìm thấy tài khoản LMS

**Giả định:** User active nhưng không thấy LMS account.  
**Phương án:** Kiểm tra lại thông tin; thiếu data thì yêu cầu bổ sung; ngoài phạm vi thì chuyển support.  
**Automation:** Hỗ trợ kiểm tra / hỏi bổ sung, không tự tạo account nếu chưa đủ rule.

### Trường hợp 4 — Quên mật khẩu

**Giả định:** Account vẫn active.  
**Phương án:** Gửi hướng dẫn reset.  
**Automation:** Có thể tự phản hồi hướng dẫn.

### Trường hợp 5 — Chưa có tài liệu hướng dẫn

**Giả định:** Cần hướng dẫn nhưng KB/docs chưa có.  
**Phương án:** Bổ sung tài liệu trước; sau đó automation mới dùng được để gửi lại.  
**Automation:** Người viết docs; máy có thể gửi sau khi đã có.

### Trường hợp 6 — Đã có tài liệu nhưng user vẫn không được

**Giả định:** Đã gửi hướng dẫn mà vẫn fail.  
**Phương án:** Automation reply kèm tài liệu + bước kiểm tra cơ bản; vẫn không xong thì chuyển support.  
**Automation:** Có thể tự reply kèm tài liệu.

### Trường hợp 7 — Ticket thiếu thông tin

**Giả định:** Chỉ ghi “không login được”, thiếu email/định danh.  
**Phương án:** Không đổi account; yêu cầu bổ sung thông tin.  
**Automation:** Có thể tự yêu cầu bổ sung; không side effect.

---

## 7. Phạm vi automation (từ các giả định trên)

| Điều kiện / tình huống                         | Phương án                    | Automation        |
| ---------------------------------------------- | ---------------------------- | ----------------- |
| User active + LMS deactivate                   | Activate tài khoản           | Có                |
| User inactive                                  | Chuyển support               | Không             |
| Không tìm thấy LMS account                     | Kiểm tra / bổ sung thông tin | Một phần          |
| Quên mật khẩu                                  | Gửi hướng dẫn                | Có                |
| Chưa có tài liệu                               | Bổ sung tài liệu             | Không (cần người) |
| Có tài liệu nhưng vẫn lỗi                      | Reply kèm tài liệu           | Có                |
| Ticket thiếu thông tin                         | Yêu cầu bổ sung              | Có                |
| Không xác định nguyên nhân / nghi lỗi hệ thống | Chuyển support / Dev         | Không             |

Nguyên tắc: **đủ dữ liệu + điều kiện rõ → auto; thiếu data / rủi ro → người xử lý.**

---

## 8. Làm tool hay chờ sửa gốc?

Nếu LMS tự deactivate account sau thời gian không dùng, đó có thể là rule hệ thống chứ không hẳn bug.

Đổi rule cần Product/Dev và mất thời gian; support vẫn phải xử lý ticket hằng ngày.  
Vì vậy em làm tool trước để giảm thao tác lặp trên nhóm login — đúng nhóm đang chiếm **56%** ticket trong export.

Về lâu dài vẫn có thể xem nguyên nhân gốc (nhắc trước khi khóa, bổ sung docs, xem lại rule).  
**Tool giảm việc hiện tại, không thay sửa gốc.**

---

## 9. Phương án ngắn cho nhóm không chọn auto trước

- **LMS chạy kém / lỗi hệ thống:** gom ticket cùng pattern, cập nhật chung, escalate Dev; không auto-sửa hệ thống.
- **Yêu cầu tính năng:** ghi nhận đủ → Product; không hứa deadline.
- **Báo cáo có hạn chót:** clarify scope → chuyển người có quyền; không để máy tự xuất báo cáo.
- **Tải tài liệu:** SOP quyền/file; theo dõi nếu volume tăng.

---

## 10. Tổng kết

Từ file Excel Helpdesk:

- **18 ticket** sau khi gom ID
- **Login = 10/18 (~56%)** — nhóm nhiều nhất
- Hệ thống / performance / video = **5/18 (~28%)**
- Các nhóm còn lại mỗi nhóm 1 ticket

Em chọn làm tool cho **không đăng nhập được LMS** vì data cho thấy đây là nhóm volume cao và quy trình support tự động hóa được.

Khi triển khai, automation chỉ chạy ở nhánh đủ điều kiện; thiếu docs thì bổ sung tài liệu; thiếu thông tin thì hỏi bổ sung; không chắc thì chuyển người.

Evidence: `Phiếu hỗ trợ (helpdesk.ticket).xlsx` · Tool: `week-5/odoo-automation`
