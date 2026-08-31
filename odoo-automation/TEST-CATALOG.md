# Test Catalog — odoo-automation

Mục tiêu file này: liệt kê test cho package `odoo-automation` (Week 5), tập trung vào logic nhận diện ticket login và workflow quyết định tự động hóa.

Hiện tại đang ở bước **TDD Green**:

- `npm test` = **8 pass / 0 fail**
- Chia rõ 2 nhóm unit test: `analyze-ticket` và `workflow`

## Tổng số test

| Nhóm | File | Số test |
|---|---|---:|
| Unit — Analyze ticket intent | `tests/unit/analyze-ticket.test.ts` | 4 |
| Unit — Workflow decisions/actions | `tests/unit/workflow.test.ts` | 4 |
| **Tổng** |  | **8** |

## Cách chạy

```bash
cd odoo-automation
npm test
node --import tsx --test tests/unit/analyze-ticket.test.ts
node --import tsx --test tests/unit/workflow.test.ts
```

---

## 1) Unit — Analyze Ticket (4 tests)

File: `tests/unit/analyze-ticket.test.ts`

1. `analyzeTicket: marks login candidate from strong title/description intent`
   - Đầu vào: ticket stage intake, title/description chứa intent đăng nhập
   - Mong đợi: `kind='login_candidate'`

2. `analyzeTicket: skips ticket when stage is not intake stage`
   - Đầu vào: ticket có `stageId` khác `requiredStageId`
   - Mong đợi: `kind='skip'`, reason nêu rõ stage mismatch

3. `analyzeTicket: skips ticket when login signals are missing`
   - Đầu vào: ticket CRM không có intent đăng nhập
   - Mong đợi: `kind='skip'`, reason `no login signals`

4. `analyzeTicket: skips content/file issue because no login intent`
   - Đầu vào: ticket lỗi file/content (dù có tag LMS)
   - Mong đợi: `kind='skip'`, không vào luồng login

---

## 2) Unit — Workflow (4 tests)

File: `tests/unit/workflow.test.ts`

1. `processTicket: auto resolves deactivated account when HR is active`
   - Đầu vào: `LMS=deactivated`, `HR=active`
   - Mong đợi: decision `AUTO_RESOLVE`, có đủ side effects:
     - reactivate mock LMS
     - post internal note
     - post customer reply (có `#ticketRef` và lời chào theo tên)
     - move stage sang `resolvedStageId`

2. `processTicket: escalates when HR status is terminated`
   - Đầu vào: `HR=terminated`
   - Mong đợi: decision `ESCALATE_HR`, chỉ ghi note, không mail/reactivate

3. `processTicket: marks review when LMS is active`
   - Đầu vào: `LMS=active`, `HR=active`
   - Mong đợi: decision `NEED_REVIEW`, cần người ACK, không auto mail

4. `processTicket: skips non-login ticket without side effects`
   - Đầu vào: ticket không match login intent
   - Mong đợi: decision `SKIP`, không có side effects lên Odoo/LMS

---

## Phạm vi đã được test

- Nhận diện intent login theo title/description
- Chặn non-login ngay từ bước analyze
- Ma trận quyết định cốt lõi:
  - `AUTO_RESOLVE`
  - `NEED_REVIEW`
  - `ESCALATE_HR`
  - `SKIP`
- Side effects quan trọng (note, mail, move stage) cho nhánh auto

## Chưa test trong unit hiện tại

- Tích hợp thật với Odoo JSON-RPC endpoint
- Độ bền trước lỗi mạng / timeout / lỗi auth Odoo
- Chạy end-to-end với ticket thật trên instance Odoo
