# Báo cáo phân tích ticket — Technical Support

**Nguồn dữ liệu:** `docs/plans/week-5/data/sample.xlsx`  
**Phạm vi:** 131 ticket Technical Support

---

## 1. Mục tiêu

Báo cáo dùng dữ liệu sample để:

- Nhận diện ticket đang tập trung ở đâu và theo nhóm vấn đề nào.
- Đưa ra **giả định** cho từng nhóm khi dữ liệu chưa đủ xác nhận root cause.
- Với mỗi giả định, nêu **phương án** xử lý tương ứng.
- Chọn nhóm phù hợp để thử automation theo hướng Operating Engineer và xác định cần đo gì tiếp theo.

---

## 2. Nguồn dữ liệu

Report dùng file `docs/plans/week-5/data/sample.xlsx`. Sau khi gom theo mã ticket và phân loại bằng `Subject + Tags`, dataset có **131 ticket**.

File hiện chủ yếu có Subject/Tags, chưa có log xử lý, thời gian phản hồi hay nguyên nhân cuối cùng. Vì vậy các nhánh dưới đây là **giả định vận hành** để định hướng xử lý, không phải root cause đã xác nhận.

---

## 3. Ticket đang tập trung ở đâu?

```mermaid
pie title Ticket theo hệ thống — 131 ticket
  "CRM" : 37
  "LMS" : 26
  "TMS" : 20
  "Test" : 12
  "Denise" : 8
  "E-contract" : 7
  "Mail" : 6
  "Khác" : 6
  "Crystal" : 4
  "Ecount" : 3
  "Nội bộ" : 2
```

CRM, LMS và TMS có tổng cộng **83/131 ticket (~63,4%)**.

Số ticket cao chưa đồng nghĩa hệ thống có tỷ lệ lỗi cao. File không có số người dùng theo hệ thống, nên chưa tính được ticket trên mỗi user.

Các nhóm việc nổi bật:

```mermaid
pie title Các nhóm việc nổi bật
  "Enroll" : 15
  "Thanh toán" : 13
  "Không đăng nhập" : 12
  "Chấm công" : 12
  "Test" : 12
  "Lead / trạng thái" : 7
  "Lớp / GV / học phần" : 7
  "Hợp đồng" : 7
```

Enroll có 15 ticket (LMS 9, CRM 6). Thanh toán có 13 ticket, toàn bộ trên CRM. Không đăng nhập và chấm công mỗi nhóm 12 ticket.

---

## 4. Phân tích ba hệ thống có nhiều ticket nhất

### 4.1. CRM — 37 ticket

```mermaid
pie title CRM — phân bố 37 ticket
  "Thanh toán" : 13
  "Lead / trạng thái" : 7
  "Enroll" : 6
  "Gọi / SMS" : 4
  "Sửa / xuất dữ liệu" : 3
  "Dropout" : 2
  "Cấp / chuyển TK" : 1
  "Không đăng nhập" : 1
```

Ba nhóm lớn nhất là Thanh toán 13, Lead/trạng thái 7 và Enroll 6, tổng **26/37 ticket (~70,3%)**.

#### Thanh toán — 13 ticket

Nhóm gồm tạo QR, add/gỡ payment, hủy hoặc confirm giao dịch, cập nhật trạng thái đóng tiền, hóa đơn và mã giảm giá. Volume cao nhưng chưa chứng minh cùng một lỗi lặp 13 lần.

| Giả định | Phương án | Auto? |
| --- | --- | --- |
| Ticket thiếu mã lead/enrollment, số tiền hoặc yêu cầu cụ thể | Chuẩn hóa form đầu vào trước khi support xử lý | Không auto sửa dữ liệu |
| Người dùng được phép tự làm nhưng chưa biết thao tác | Gửi hướng dẫn | Có thể auto-reply hướng dẫn |
| Chưa có tài liệu hướng dẫn | Bổ sung guide/SOP | Không — cần người viết docs |
| Đã có tài liệu nhưng user vẫn tạo ticket | Kiểm tra tài liệu còn đúng; nếu đúng thì auto-reply kèm tài liệu | Có thể auto-reply kèm docs |
| Người dùng không có quyền | Route đến người/bộ phận có quyền | Có thể auto-routing, không auto sửa payment |
| Thao tác đúng, quyền đủ nhưng CRM vẫn lỗi | Escalate Dev kèm bước tái hiện và ảnh lỗi | Không auto-resolve |
| Thao tác tài chính bắt buộc phải có người duyệt | Giữ xử lý thủ công | Không auto |

**Kết luận automation:** chưa auto sửa payment/giao dịch vì rủi ro tài chính cao và chưa có rule duyệt rõ. Chỉ cân nhắc auto-reply guide hoặc routing.

#### Lead / trạng thái — 7 ticket

| Giả định | Phương án | Auto? |
| --- | --- | --- |
| User có quyền nhưng chưa biết đổi trạng thái | Hướng dẫn hoặc gửi guide | Có thể auto-reply guide |
| User không có quyền | Chuyển người có quyền | Có thể auto-routing |
| Dữ liệu hợp lệ nhưng CRM không cho đổi | Ghi lỗi và escalate hệ thống | Không auto-resolve |
| Đổi trạng thái ảnh hưởng quy trình kinh doanh | Giữ người xử lý | Không auto đổi trạng thái |

**Kết luận automation:** không auto đổi trạng thái lead. Side effect nghiệp vụ cao; chỉ hỗ trợ guide/routing.

#### Enroll trên CRM — 6 ticket

| Giả định | Phương án | Auto? |
| --- | --- | --- |
| Thiếu mã enrollment/lead hoặc thông tin cần sửa | Bắt buộc field đầu vào | Không auto sửa dữ liệu |
| User được phép tự sửa nhưng chưa biết cách | Hướng dẫn / gửi guide | Có thể auto-reply guide |
| Đã có guide nhưng ticket vẫn vào | Auto-reply kèm tài liệu nếu guide còn đúng | Có thể auto-reply kèm docs |
| User không có quyền | Route đúng owner | Có thể auto-routing |
| Quyền và dữ liệu đủ nhưng CRM vẫn lỗi | Escalate Dev | Không auto-resolve |

**Kết luận automation:** chưa auto sửa enrollment trên CRM. Chưa đủ rule nghiệp vụ; ưu tiên form + guide + routing trước.

---

### 4.2. LMS — 26 ticket

```mermaid
pie title LMS — phân bố 26 ticket
  "Enroll" : 9
  "Lớp / GV / học phần" : 7
  "Compass / học tập" : 3
  "Cấp / chuyển TK" : 2
  "Dropout" : 2
  "Điểm thưởng" : 1
  "Không đăng nhập" : 1
  "Điểm danh lớp" : 1
```

Hai nhóm lớn nhất là Enroll 9 và Lớp/GV/học phần 7, tổng **16/26 ticket (~61,5%)**.

#### Enroll trên LMS — 9 ticket

| Giả định | Phương án | Auto? |
| --- | --- | --- |
| User thao tác chưa đúng | Gửi hướng dẫn enroll | Có thể auto-reply guide |
| Chưa có guide enroll LMS | Bổ sung tài liệu | Không — cần người viết docs |
| Đã có guide nhưng user vẫn không enroll được | Auto-reply kèm guide; nếu vẫn fail thì kiểm tra dữ liệu/quyền | Có thể auto-reply; không auto enroll |
| Không tìm thấy lớp hoặc slot | Kiểm tra dữ liệu lớp trước khi kết luận lỗi hệ thống | Không auto ghi dữ liệu lớp |
| Enroll trùng | Kiểm tra học viên đã tồn tại trong lớp hay hệ thống hiển thị sai | Không auto enroll |
| User thiếu quyền | Chuyển người có quyền | Có thể auto-routing |
| Dữ liệu và quyền đúng nhưng LMS vẫn lỗi | Escalate Dev kèm ảnh lỗi và bước đã thử | Không auto-resolve |

**Kết luận automation:** chưa auto enroll học viên vì thiếu rule/ngoại lệ rõ và có rủi ro dữ liệu học tập. Chỉ nên auto-reply guide hoặc hỗ trợ kiểm tra thông tin.

#### Lớp / giáo viên / học phần — 7 ticket

| Giả định | Phương án | Auto? |
| --- | --- | --- |
| User được phép tự chỉnh nhưng chưa biết cách | Hướng dẫn / gửi guide | Có thể auto-reply guide |
| User không có quyền chỉnh lớp/GV | Route đúng owner | Có thể auto-routing |
| Chức năng đang lỗi | Ghi thao tác, dữ liệu đầu vào, ảnh lỗi rồi escalate Dev | Không auto sửa lớp/GV |

**Kết luận automation:** không auto sửa dữ liệu lớp/giáo viên/học phần. Ưu tiên guide, routing và escalate khi đủ bằng chứng lỗi.

---

### 4.3. TMS — 20 ticket

```mermaid
pie title TMS — phân bố 20 ticket
  "Chấm công / bảng công" : 12
  "Lỗi hệ thống" : 6
  "Không đăng nhập" : 2
```

Có **18/20 ticket TMS (~90%)** nằm ở chấm công hoặc lỗi hệ thống.

#### Chấm công / bảng công — 12 ticket

| Giả định | Phương án | Auto? |
| --- | --- | --- |
| Ticket thiếu cơ sở, thời điểm, ca hoặc số người bị ảnh hưởng | Chuẩn hóa field đầu vào | Không auto sửa công |
| Chỉ một người bị sai công | Kiểm tra lịch/dữ liệu của cá nhân đó | Không auto sửa công |
| Nhiều người cùng ca hoặc cùng cơ sở | Kiểm tra dữ liệu/cấu hình chung | Không auto; hỗ trợ gom pattern |
| Nhiều cơ sở cùng thời điểm | Kiểm tra incident hệ thống | Không auto-resolve |
| User chỉ chưa biết xem/duyệt công | Gửi guide nếu có quyền tự làm | Có thể auto-reply guide |
| Đã có guide nhưng vẫn hỏi | Auto-reply kèm tài liệu nếu guide còn đúng | Có thể auto-reply kèm docs |

**Kết luận automation:** không auto sửa bảng công vì ảnh hưởng dữ liệu công/lương. Chỉ cân nhắc auto-reply guide hoặc gợi ý ticket cùng pattern để support xác nhận.

#### Lỗi hệ thống — 6 ticket

Ticket **233** và **234** cùng liên quan Tỉnh Nam 2, triệu chứng tương tự và cùng nhắc lỗi từ ngày 31.

| Giả định | Phương án | Auto? |
| --- | --- | --- |
| Chỉ một người gặp | Kiểm tra tài khoản/dữ liệu cá nhân | Không auto-resolve |
| Nhiều người cùng cơ sở | Kiểm tra cấu hình/dữ liệu chung của cơ sở | Không auto; escalate theo phạm vi |
| Nhiều cơ sở cùng thời điểm | Điều tra theo incident hệ thống | Không auto-resolve |
| Nhiều ticket trùng thời gian, khu vực, triệu chứng | Gợi ý gom ticket liên quan để support xác nhận | Có thể auto-gợi ý liên kết ticket |

**Kết luận automation:** không auto sửa lỗi hệ thống. Có thể hỗ trợ phát hiện/gom ticket cùng pattern rồi escalate.

---

## 5. Pattern xuất hiện trên nhiều hệ thống

### 5.1. Không đăng nhập / tài khoản — 12 ticket trên 7 hệ thống

```mermaid
pie title Không đăng nhập — 12 ticket trên 7 hệ thống
  "Denise" : 2
  "TMS" : 2
  "Mail" : 2
  "Ecount" : 2
  "Nội bộ" : 2
  "LMS" : 1
  "CRM" : 1
```

Không hệ thống nào chiếm phần lớn nhóm login. Chuỗi kiểm tra thường lặp: xác định user → kiểm tra nhân sự → kiểm tra tài khoản → xác định nguyên nhân → reset/mở khóa nếu đủ điều kiện → phản hồi.

Đây là nhóm phù hợp để thử workflow hơn một số nhóm volume cao hơn, vì điều kiện xử lý có thể giới hạn rõ. Workflow Week 5 không cover hết mọi hệ thống; ưu tiên LMS theo Scenario 1.

### 5.2. Enroll LMS và Enroll CRM

```mermaid
pie title Enroll theo hệ thống
  "Enroll LMS" : 9
  "Enroll CRM" : 6
```

Hai nhóm cùng tên nhưng cần form và SOP riêng. LMS thiên về thêm học viên/lớp/slot. CRM thiên về enrollment hoặc chỉnh thông tin enrollment.

---

## 6. Giả định và phương án cho Login Issue

Dữ liệu sample cho thấy có pattern login/account, nhưng chưa đủ để khẳng định mọi ticket đều cùng một root cause. Vì vậy automation chỉ chạy theo từng giả định đủ điều kiện.

| Giả định | Phương án | Auto? |
| --- | --- | --- |
| Ticket không phải login issue | `SKIP`, không xử lý | Không |
| Thiếu email/định danh của account cần kiểm tra | Không đoán user; hỏi bổ sung hoặc `NEED_REVIEW` | Không side effect; có thể hỏi bổ sung |
| Chưa có tài liệu hướng dẫn reset/login | Bổ sung guide/SOP trước | Không — cần người viết docs |
| Đã có tài liệu nhưng user vẫn không đăng nhập được | Automation reply kèm tài liệu hướng dẫn | Có — auto-reply kèm docs |
| HR active + LMS deactivated | Reactivate, ghi note, phản hồi | Có — `AUTO_RESOLVE` |
| HR inactive | Không bật lại LMS; `NEED_REVIEW` | Không |
| LMS active nhưng user quên mật khẩu | Gửi hướng dẫn reset nếu có template | Có thể auto-reply guide |
| Không tìm thấy LMS account | Không tự tạo account; `NEED_REVIEW` | Không |
| Nhiều người cùng lúc không login được cùng hệ thống | Không xử lý như quên pass riêng lẻ; kiểm tra incident | Không auto-resolve hàng loạt |
| Nghi lỗi hệ thống / ngoài phạm vi tool | Escalate support/Dev | Không |

**Kết luận automation:** Login là nhóm nên thử auto trước vì có nhánh điều kiện rõ và side effect kiểm soát được. Chỉ auto ở nhánh đủ điều kiện; thiếu docs thì bổ sung trước; đã có docs mà vẫn fail thì reply kèm tài liệu; rủi ro hoặc thiếu dữ liệu thì `NEED_REVIEW`/`SKIP`.

### Workflow tương ứng

```text
Odoo ticket mới
  -> nhận diện login issue
  -> trích xuất email/định danh account cần kiểm tra
  -> kiểm tra HR + LMS
  -> quyết định theo giả định ở bảng trên
  -> cập nhật Odoo ticket + phản hồi
```

Nếu nguyên nhân gốc là rule deactivate sau thời gian không hoạt động, Dev/Product có thể sửa rule về lâu dài. Trong ngắn hạn, automation giúp giảm thao tác lặp mà không cần chờ sửa code trước.

---

## 7. Metrics cần đo sau automation

- Số ticket login được workflow nhận diện.
- Tỷ lệ xử lý hoàn toàn (`AUTO_RESOLVE`).
- Tỷ lệ vẫn cần support (`NEED_REVIEW`).
- Tỷ lệ `SKIP` vì thiếu thông tin hoặc ngoài phạm vi.
- Thời gian xử lý trước và sau automation.
- Số false action hoặc xử lý sai account.

Chỉ nên kết luận mức tiết kiệm thời gian sau khi có số liệu thực tế.

---

## 8. Kết luận

CRM, LMS và TMS chiếm **83/131 ticket (~63,4%)**, nên đây là ba hệ thống cần ưu tiên theo workload. Với các nhóm volume cao như Payment, Enroll và Chấm công, hướng trước mắt là chuẩn hóa thông tin đầu vào, guide/routing theo quyền, và chỉ escalate khi đủ bằng chứng lỗi hệ thống.

Login không phải nhóm lớn nhất, nhưng có chuỗi kiểm tra lặp và có thể đặt giả định–phương án rõ. Vì vậy Week 5 chọn Login LMS để thử automation có điều kiện: thiếu docs thì bổ sung; đã có docs mà vẫn fail thì reply kèm tài liệu; HR active + LMS deactivated thì auto reactivate; các case thiếu dữ liệu hoặc rủi ro thì chuyển review.

Bước tiếp theo là đo coverage, tỷ lệ xử lý hoàn toàn, tỷ lệ cần support can thiệp và thời gian xử lý thực tế trước khi mở rộng automation sang nhóm khác.
