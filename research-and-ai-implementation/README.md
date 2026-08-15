# Research And AI Implementation

Folder này ghi **tóm tắt quá trình dùng AI** khi làm Ticket Manager CLI — không phải export chat nguyên xi.

Mục tiêu:

- Chỉ ra **đã làm gì với AI**, workflow nào, quyết định gì.
- Giải thích **chỗ nào tôi verify / sửa / không tin AI mù quáng**.
- Có tài liệu ngắn gọn để mentor review nhanh.

## Nội dung

### [`week1/`](./week1/)

Phiên AI đầu: research TDD, scaffold, test Red, git, Green phase, hexagonal.

| File | Phiên AI làm gì |
|---|---|
| [`Research TDD, test và implement Ticket Manager CLI.md`](./week1/Research%20TDD,%20test%20và%20implement%20Ticket%20Manager%20CLI.md) | Research TDD, scaffold project, thiết kế test suite, refactor hexagonal, tạo TEST-CATALOG |
| [`Git setup, implement Green phase và hoàn thiện CLI.md`](./week1/Git%20setup,%20implement%20Green%20phase%20và%20hoàn%20thiện%20CLI.md) | Setup git, implement Green phase, học hexagonal, entity class, README, case-insensitive CLI |

### [`week2/`](./week2/)

Phiên AI sau (13–15/8): TypeScript, layered, Tuần 3 mock-first.

| File | Phiên AI làm gì |
|---|---|
| [`Implement MockKBClient, kb CLI, test và README.md`](./week2/Implement%20MockKBClient,%20kb%20CLI,%20test%20và%20README.md) | MockKBClient + lệnh `kb`, test/catalog/README; phiên còn gồm migrate TS và layered |

## Liên quan

- Research Week 1 (TDD + Hexagonal): [`research-week-1/`](../research-week-1/)
- Source code CLI (TypeScript + layered): [`ticket-manager-cli/`](../ticket-manager-cli/)

## Ghi chú

Folder này nằm ở root repository và đã được mở trong `.gitignore`, nên có thể add/commit/push lên GitHub.

`week1/` phản ánh quá trình lúc code còn JavaScript / hexagonal. Source hiện tại đã migrate TypeScript và layered; tuần 3 đang ở bước mock KB. Xem hướng dẫn chạy mới nhất ở [`ticket-manager-cli/README.md`](../ticket-manager-cli/README.md).
