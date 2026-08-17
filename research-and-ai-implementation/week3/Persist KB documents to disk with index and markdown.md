# Tóm tắt phiên AI — Persist KB documents xuống disk (index + markdown)

> Phiên Cursor: 17/8/2026, từ câu hỏi “server lưu document ở đâu (RAM hay disk)?” đến khi `kb-api-server` ghi `data/index.json` + file `{id}.md` theo `nodePath`, TDD Red → Green.  
> Đã được rút gọn thành bản tóm tắt này — không phải export chat nguyên xi.

## Mục tiêu phiên này

Đổi persistence KB từ **in-memory** sang **disk**, restart server vẫn còn document. Giữ nguyên 4 lệnh API.

## AI đã giúp gì?

### 1. Làm rõ RAM vs disk

- Mock và HTTP server ban đầu đều giữ document trong **mảng RAM**, không ghi folder.
- `nodePath` (`/templates/email`) là **nhãn cây logic**, không phải folder trên ổ cứng.
- `kb add --file` chỉ để CLI đọc markdown thành chuỗi `content`; server nhận JSON, không nhận path file máy user.
- Đề tuần 3 **không cấm** folder `data`; in-memory là lựa chọn tối giản khi tự dựng server local. User muốn bền nên chuyển disk.

### 2. Thiết kế lưu trữ đã chốt

```
kb-api-server/data/
├─ index.json
├─ templates/email/doc-001.md
└─ team/devops/doc-002.md
```

- File md đặt tên `{id}.md` (ổn định, dễ retrieve).
- `index.json` cùng cấp folder node: metadata `{ id, title, nodePath, tags, filePath }`.
- `.md` thuần content; không parse heading/frontmatter.
- Search: lọc title/path/tags trên index; chưa khớp thì đọc md để match content; trả `{ id, title, nodePath }`.
- List: lọc index theo `nodePath`.
- Retrieve: index → đọc md → JSON full.
- Add: CLI đọc `--file` (cwd hoặc path tuyệt đối Windows) → server ghi md + cập nhật index.
- `--path` = node KB, không phải chỗ file nguồn đang nằm.

### 3. TDD rồi implement

- Test Red trước: unit `FileSystemKbRepository` (seed, persist sau re-instantiate, ghi index) + integration (restart vẫn retrieve, tạo `index.json` + `{id}.md`).
- Implement `FileSystemKbRepository`; wire `createDefaultKbService({ dataDir })`; mặc định `kb-api-server/data`.
- Test isolation dùng `mkdtemp` cho `dataDir`.
- `data/.gitkeep` + gitignore runtime files trong `data/`.
- Kết quả: `kb-api-server` **41 pass**; CLI **95 pass**.

### 4. Docs

- README server: layout `index.json` + `.md`.
- TEST-CATALOG: thêm nhóm persistence.

## Workflow AI đã áp dụng

| Giai đoạn | Workflow | Ví dụ |
|---|---|---|
| Hiểu persistence | Layered Questioning | RAM vs disk, nodePath vs folder, md vs JSON |
| Thiết kế | Solution Exploration | Một JSON vs cây folder + index |
| Implement | TDD Iterative Refinement | Test fail → filesystem repo → Green |

## Quyết định kỹ thuật (AI gợi ý → tôi chọn/verify)

- Hybrid: index JSON + content md theo cây `nodePath`.
- Tên file = `id.md`, không dùng title.
- Search vẫn soi content md để giữ behavior cũ.
- CLI `--file` là path local Windows; server tự lưu copy trong `data/`.

## Chỗ tôi đã chủ động / sửa AI

- Đòi persist disk, không chấp nhận “homework bắt RAM”.
- Chốt `data/` ngay root `kb-api-server`, folder con theo nodePath.
- Bắt TDD: test đầy đủ trước khi code.
- Hỏi rõ `--file` vs `--path`, path Downloads trên Windows.

## Kết quả cuối phiên

- Server mặc định ghi `kb-api-server/data`.
- Restart vẫn retrieve doc đã add.
- API 4 POST không đổi.

## Bằng chứng tham khảo

- Repo disk: [`kb-api-server/src/repositories/file-system-kb-repository.ts`](../../kb-api-server/src/repositories/file-system-kb-repository.ts)
- Test unit: [`kb-api-server/tests/unit/file-system-kb-repository.test.ts`](../../kb-api-server/tests/unit/file-system-kb-repository.test.ts)
- Test integration persist: [`kb-api-server/tests/integration/server.test.ts`](../../kb-api-server/tests/integration/server.test.ts)
- README server: [`kb-api-server/README.md`](../../kb-api-server/README.md)
- Catalog: [`kb-api-server/TEST-CATALOG.md`](../../kb-api-server/TEST-CATALOG.md)
