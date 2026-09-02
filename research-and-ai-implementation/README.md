# Research And AI Implementation

Folder này ghi **tóm tắt quá trình dùng AI** khi làm Ticket Manager CLI — không phải export chat nguyên xi.

Mục tiêu:

- Chỉ ra **đã làm gì với AI**, workflow nào, quyết định gì.
- Giải thích **chỗ nào tôi verify / sửa / không tin AI mù quáng**.
- Có tài liệu ngắn gọn để mentor review nhanh.

## Nội dung

### [`week1,2/`](./week1,2/)

Phiên AI đầu (Week 1–2): research TDD, scaffold, test Red, git, Green phase, hexagonal.

| File | Phiên AI làm gì |
|---|---|
| [`Research TDD, test và implement Ticket Manager CLI.md`](./week1,2/Research%20TDD,%20test%20và%20implement%20Ticket%20Manager%20CLI.md) | Research TDD, scaffold project, thiết kế test suite, refactor hexagonal, tạo TEST-CATALOG |
| [`Git setup, implement Green phase và hoàn thiện CLI.md`](./week1,2/Git%20setup,%20implement%20Green%20phase%20và%20hoàn%20thiện%20CLI.md) | Setup git, implement Green phase, học hexagonal, entity class, README, case-insensitive CLI |

### [`week3/`](./week3/)

Phiên AI tuần 3: mock-first, HTTP client + KB API server, rồi persist disk.

| File | Phiên AI làm gì |
|---|---|
| [`Implement MockKBClient, kb CLI, test và README.md`](./week3/Implement%20MockKBClient,%20kb%20CLI,%20test%20và%20README.md) | MockKBClient + lệnh `kb`, test/catalog/README; phiên còn gồm migrate TS và layered |
| [`Implement HTTP KB client, kb-api-server, env và catalog.md`](./week3/Implement%20HTTP%20KB%20client,%20kb-api-server,%20env%20và%20catalog.md) | HTTP client (caller), `.env`, `kb-api-server` (listener) layered, unit/integration, dọn repo |
| [`Persist KB documents to disk with index and markdown.md`](./week3/Persist%20KB%20documents%20to%20disk%20with%20index%20and%20markdown.md) | Chuyển persistence RAM → disk: `data/index.json` + `{id}.md` theo `nodePath`, TDD |

### [`week5/`](./week5/)

Phiên AI tuần 5: chuẩn bị báo cáo/automation, tích hợp Odoo webhook, hardening runtime và đồng bộ tài liệu.

| File | Phiên AI làm gì |
|---|---|
| [`Tong-hop-tuan-5-Odoo-automation.md`](./week5/Tong-hop-tuan-5-Odoo-automation.md) | Tổng hợp end-to-end tuần 5: kiến trúc, flow quyết định, webhook/ngrok debugging, fix `_id`, chống crash thiếu email, cập nhật README và test |

## Liên quan

- Research Week 1 (TDD + Hexagonal): [`research-week-1/`](../research-week-1/)
- Source CLI: [`ticket-manager-cli/`](../ticket-manager-cli/)
- HTTP client: [`kb-api-client/`](../kb-api-client/)
- KB API server: [`kb-api-server/`](../kb-api-server/)

## Ghi chú

Folder này nằm ở root repository và đã được mở trong `.gitignore`, nên có thể add/commit/push lên GitHub.

`week1,2/` phản ánh quá trình lúc code còn JavaScript / hexagonal rồi hoàn thiện CLI tuần 2.  
`week3/` là mock KB, HTTP client + server, rồi persist disk. Source hiện tại: TypeScript + layered. Xem hướng dẫn chạy mới nhất ở [`README.md`](../README.md) root và [`ticket-manager-cli/README.md`](../ticket-manager-cli/README.md).
`week5/` tổng hợp quá trình triển khai Odoo automation cho login issue từ chuẩn bị đến chạy webhook thực tế.
