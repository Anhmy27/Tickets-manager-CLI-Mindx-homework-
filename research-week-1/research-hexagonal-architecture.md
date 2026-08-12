# Tuần 1 — Research Hexagonal Architecture

## 1. Hexagonal Architecture là gì? Các thành phần chính và cách hoạt động như thế nào?

Hexagonal Architecture, hay còn gọi là Ports and Adapters Architecture, là một kiểu kiến trúc phần mềm dùng để tách business logic khỏi các yếu tố bên ngoài như database, file system, API, framework, CLI hoặc UI.

Ý tưởng chính là đặt domain/business logic ở trung tâm. Domain không nên biết dữ liệu đến từ đâu hoặc được lưu bằng công nghệ gì. Thay vào đó, domain giao tiếp với bên ngoài thông qua các interface gọi là ports. Các phần code cụ thể kết nối với bên ngoài được gọi là adapters.

Các thành phần chính gồm:

- **Domain:** nơi chứa business logic, entity, rule và use case chính của hệ thống.
- **Ports:** interface/contract định nghĩa hệ thống cần gì từ bên ngoài hoặc bên ngoài có thể gọi vào hệ thống như thế nào.
- **Adapters:** phần triển khai cụ thể của port, ví dụ CLI adapter, JSON file adapter, database adapter hoặc API adapter.
- **External systems:** các hệ thống bên ngoài như file, database, HTTP API, terminal hoặc UI.

## 2. Ưu điểm và nhược điểm của Hexagonal Architecture là gì?

Ưu điểm đầu tiên là dễ test. Vì domain phụ thuộc vào interface thay vì implementation cụ thể, ta có thể test business logic bằng mock adapter mà không cần dùng database, file system hoặc API thật. Ví dụ, TicketService có thể được test bằng FakeTicketRepository thay vì ghi vào file `tickets.json`.

Ưu điểm thứ hai là dễ thay đổi công nghệ. Nếu ban đầu ticket được lưu bằng JSON file, sau này muốn chuyển sang PostgreSQL hoặc Odoo API, ta chỉ cần viết adapter mới. Domain logic không cần thay đổi nhiều vì nó vẫn làm việc qua port.

Ưu điểm thứ ba là code có ranh giới rõ ràng. Business logic, input/output và infrastructure được tách riêng. Điều này giúp project dễ đọc, dễ bảo trì và dễ mở rộng hơn khi hệ thống lớn dần.

Ưu điểm thứ tư là giảm coupling. Domain không bị phụ thuộc chặt vào framework, thư viện hay database cụ thể. Khi công nghệ bên ngoài thay đổi, phần lõi của ứng dụng ít bị ảnh hưởng.

Nhược điểm là kiến trúc này làm tăng số lượng file và layer. Với một ứng dụng rất nhỏ, việc tạo domain, ports, adapters, services có thể khiến project phức tạp hơn cần thiết.

Một nhược điểm khác là người mới cần thời gian để hiểu cách chia trách nhiệm giữa port và adapter. Nếu chưa quen, dễ viết nhầm business logic vào adapter hoặc để domain phụ thuộc ngược lại vào infrastructure.

Ngoài ra, Hexagonal Architecture có thể bị over-engineering nếu áp dụng cho prototype ngắn hạn hoặc app CRUD quá đơn giản. Trong trường hợp đó, một cấu trúc đơn giản hơn có thể phù hợp hơn.

**Workflow AI đã áp dụng:** Solution Exploration. Yêu cầu AI liệt kê ưu/nhược điểm, sau đó so sánh trong context bài Ticket Manager CLI. Kết luận là Hexagonal Architecture có thêm overhead, nhưng phù hợp với mục tiêu học Week 2 vì cần luyện testability và ports/adapters.

## 3. Khi nào nên áp dụng Hexagonal Architecture?

Nên áp dụng Hexagonal Architecture khi ứng dụng có business logic quan trọng và cần được bảo vệ khỏi sự thay đổi của công nghệ bên ngoài. Nếu logic chính bị trộn với framework, database hoặc API, việc sửa đổi và test sau này sẽ khó hơn.

Kiến trúc này phù hợp khi hệ thống có nhiều cách input khác nhau, ví dụ CLI, REST API, webhook hoặc background job. Nó cũng phù hợp khi hệ thống có nhiều output/integration như database, file system, external API hoặc message queue.

Hexagonal Architecture cũng nên dùng khi project cần unit test tốt. Vì domain làm việc qua interface, ta có thể thay adapter thật bằng mock adapter trong test. Điều này giúp test nhanh hơn, ổn định hơn và không phụ thuộc vào môi trường bên ngoài.

Một số ví dụ phù hợp:

- Ticket Manager CLI có thể lưu ticket bằng JSON file ở Week 2, rồi tích hợp API ở Week 3.
- Payment service cần tách logic thanh toán khỏi payment gateway cụ thể.
- Order processing system cần tích hợp database, message queue và external API.
- Support/operation tool cần thay đổi nguồn dữ liệu hoặc hệ thống tích hợp theo thời gian.

Không nên áp dụng quá nặng khi app chỉ là prototype nhỏ, CRUD đơn giản, ít logic nghiệp vụ, không cần test sâu và không có nhu cầu thay đổi integration. Khi đó, kiến trúc đơn giản sẽ nhanh và dễ hiểu hơn.

**Workflow AI đã áp dụng:** Layered Questioning kết hợp Validation. Sau khi hỏi "khi nào nên dùng?", hỏi tiếp "khi nào không nên dùng?" và "edge cases/risk khi áp dụng là gì?" để tránh kết luận một chiều.

## 4. Hexagonal Architecture khác gì so với các architecture pattern khác?

So với Layered Architecture, Hexagonal Architecture nhấn mạnh mạnh hơn vào việc domain phụ thuộc vào interface thay vì implementation. Layered Architecture thường chia thành controller, service, repository, nhưng nếu không cẩn thận, service vẫn có thể phụ thuộc trực tiếp vào repository/database cụ thể. Hexagonal Architecture yêu cầu rõ hơn việc adapter ở ngoài và domain ở trong.

So với Clean Architecture, hai kiến trúc này khá giống nhau vì đều đặt business logic ở trung tâm và đẩy framework/database ra ngoài. Clean Architecture thường mô tả nhiều vòng layer như entities, use cases, interface adapters và frameworks. Hexagonal Architecture diễn đạt đơn giản hơn bằng ports và adapters, nên dễ liên hệ với các bài integration như CLI, file system hoặc API.

So với MVC, MVC phù hợp cho ứng dụng có UI hoặc web app rõ ràng, chia thành Model, View, Controller. Tuy nhiên, MVC không bắt buộc tách domain khỏi infrastructure mạnh như Hexagonal Architecture. Nếu code không cẩn thận, business logic có thể bị trộn vào controller hoặc model gắn chặt với database.

So với Simple CRUD Architecture, Hexagonal Architecture phức tạp hơn nhưng dễ mở rộng và dễ test hơn. Simple CRUD phù hợp khi app nhỏ, ít logic và cần làm nhanh. Hexagonal Architecture phù hợp hơn khi muốn code có ranh giới rõ, có thể đổi adapter, test domain độc lập và phát triển lâu dài.

Với bài Week 2, Hexagonal Architecture là lựa chọn hợp lý hơn Simple CRUD vì mục tiêu không chỉ là build CLI chạy được, mà còn là luyện cách tách domain, ports và adapters. Ticket Manager CLI sẽ bắt đầu với JSON file adapter, nhưng về sau có thể thêm HTTP/API adapter mà không phải viết lại toàn bộ business logic.

**Workflow AI đã áp dụng:** Iterative Refinement. Ban đầu AI gợi ý cấu trúc kiểu `controllers/services/repositories/models`, nhưng tôi nhận thấy cấu trúc đó là Layered Architecture đã thường xuyên code rồi. Tôi refine lại thành `domain/ports/adapters` vì tôi muốn hiểu thêm về hexagonal.

## 5. Quá trình research với AI

- https://chatgpt.com/share/6a7059e8-40e4-83ec-aaa3-8fbe0ce63a5c
- https://chatgpt.com/share/6a705a39-6fac-83ec-b3cb-77aa01e779eb
