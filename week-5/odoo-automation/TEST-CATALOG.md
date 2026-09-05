# Test Catalog — odoo-automation

Mục tiêu file này: cho bạn nhìn nhanh **flow nào được test**, **đầu vào gì**, **mong đợi gì**.

Hiện tại đang ở bước **TDD Green**:

- `npm test` = **54 pass / 0 fail**
- Loại test hiện có: **unit test**

## Tổng số test

| Nhóm | File | Số test |
|---|---|---:|
| Unit — Analyze ticket intent | `tests/unit/analyze-ticket.test.ts` | 9 |
| Unit — Config loading/validation | `tests/unit/config.test.ts` | 6 |
| Unit — Env parser | `tests/unit/load-env.test.ts` | 5 |
| Unit — Mock HR/LMS clients | `tests/unit/mock-directory-clients.test.ts` | 4 |
| Unit — Odoo JSON-RPC client | `tests/unit/odoo-jsonrpc-client.test.ts` | 14 |
| Unit — Webhook payload parser | `tests/unit/webhook-payload.test.ts` | 6 |
| Unit — Webhook ticket normalization | `tests/unit/webhook-ticket.test.ts` | 1 |
| Unit — Workflow decisions/actions | `tests/unit/workflow.test.ts` | 9 |
| **Tổng** |  | **54** |

## Cách chạy

```bash
cd odoo-automation
npm test
npm run test:unit
```

---

## 1. Unit — Analyze ticket intent (9 tests)

File: `tests/unit/analyze-ticket.test.ts`

Mục tiêu: nhận diện login candidate khi đúng stage và có ít nhất một tín hiệu login theo thứ tự ưu tiên **tag -> title -> description**.

1. `analyzeTicket: marks login candidate from login tag`  
   - Đầu vào: stage intake + có login tag  
   - Mong đợi: `kind='login_candidate'`

2. `analyzeTicket: skips ticket when stage is not intake stage`  
   - Đầu vào: `stageId` khác `requiredStageId`  
   - Mong đợi: `kind='skip'` + reason stage mismatch

3. `analyzeTicket: skips ticket when login signals are missing`  
   - Đầu vào: ticket không có tín hiệu login  
   - Mong đợi: `kind='skip'`

4. `analyzeTicket: skips content/file issue because no login intent`  
   - Đầu vào: ticket LMS nhưng thuộc nhóm content/file  
   - Mong đợi: `kind='skip'`

5. `analyzeTicket: allows title login signal when login tag is missing`  
   - Đầu vào: thiếu login tag, title có keyword login  
   - Mong đợi: `kind='login_candidate'`

6. `analyzeTicket: allows description login signal when login tag is missing`  
   - Đầu vào: thiếu login tag, title không match, description match  
   - Mong đợi: `kind='login_candidate'`

7. `analyzeTicket: allows tag-only signal when title and description do not match`  
   - Đầu vào: có login tag, title/description không match keyword  
   - Mong đợi: `kind='login_candidate'`

8. `analyzeTicket: allows description-only signal when login tag exists`  
   - Đầu vào: có login tag, description match  
   - Mong đợi: `kind='login_candidate'`

9. `analyzeTicket: allows title-only signal when login tag exists`  
   - Đầu vào: có login tag, title match  
   - Mong đợi: `kind='login_candidate'`

---

## 2. Unit — Config và env (11 tests)

### 2.1 `tests/unit/config.test.ts` (6 tests)

Mục tiêu: fail fast khi cấu hình sai, load đúng khi cấu hình đúng.

1. `loadConfig: loads defaults from .env and root json files`  
2. `loadConfig: supports custom rules and directory file names`  
3. `loadConfig: throws when required env var is missing`  
4. `loadConfig: throws when requiredStageId is invalid`  
5. `loadConfig: throws when resolvedStageId is invalid`  
6. `loadConfig: throws when tagKeywords is empty`

### 2.2 `tests/unit/load-env.test.ts` (5 tests)

Mục tiêu: parser `.env` ổn định, không phá env runtime.

1. `loadEnvFile: loads keys and strips quotes`  
2. `loadEnvFile: ignores comments, empty lines, and malformed entries`  
3. `loadEnvFile: does not override existing env values`  
4. `loadEnvFile: keeps values containing additional equals signs`  
5. `loadEnvFile: missing file is ignored`

---

## 3. Unit — Mock directory clients (4 tests)

File: `tests/unit/mock-directory-clients.test.ts`

Mục tiêu: dữ liệu giả HR/LMS phản hồi đúng để test workflow.

1. `MockHrClient: matches email case-insensitively`  
2. `MockHrClient: returns unknown for missing email`  
3. `MockLmsClient: reactivates known user account`  
4. `MockLmsClient: ignores reactivation for unknown user`

---

## 4. Unit — Odoo JSON-RPC client (14 tests)

File: `tests/unit/odoo-jsonrpc-client.test.ts`

Mục tiêu: gọi Odoo đúng protocol, map record bền trước dữ liệu xấu.

1. `fetchTicketsByStage: calls /jsonrpc endpoint and maps ticket fields`  
   - Mong đợi: map đúng `ticketRef`, `description`, `emailFrom`, `tags`

2. `fetchTicketsByStage: falls back to padded ref and stage fallback when missing`  
   - Mong đợi: fallback `ticketRef`, `stageId`, `stageName`, `customerName`

3. `fetchTicketById: returns null when no record is found`  
4. `fetchTicketById: returns mapped ticket when record exists`  
5. `fetchTicketById: tolerates falsey Odoo fields and leaves email empty`  
   - Mong đợi: không crash khi field là `false/null/non-string`

6. `hasAutomationNote: returns true when at least one bot message exists`  
7. `hasAutomationNote: returns false when search is empty`  
8. `postInternalNote: sends HTML note with note subtype`  
9. `postCustomerReply: sends comment subtype and subject`  
10. `moveToStage: writes stage id to helpdesk ticket`  
11. `client reuses uid and authenticates only once across operations`  
12. `RPC throws clear error on HTTP failure`  
13. `RPC throws clear error on JSON-RPC error payload`  
14. `RPC throws when result field is missing`

---

## 5. Unit — Webhook payload & ticket normalization (7 tests)

### 5.1 `tests/unit/webhook-payload.test.ts` (6 tests)

Mục tiêu: parse ticket id đúng với payload thực tế từ Odoo Studio.

1. `extractTicketId: reads numeric id from flat payload`  
2. `extractTicketId: reads id from Odoo field tuple`  
3. `extractTicketId: reads nested payload.data.id`  
4. `extractTicketId: reads Odoo Studio webhook envelope _id`  
5. `extractTicketId: returns null for invalid payload`  
6. `extractTicketId: rejects non-positive or non-integer ids`

### 5.2 `tests/unit/webhook-ticket.test.ts` (1 test)

1. `forceIntakeStage: overrides stage id and stage name for webhook processing`  
   - Mong đợi: webhook path luôn xử lý như ticket intake

---

## 6. Unit — Workflow decisions/actions (9 tests)

File: `tests/unit/workflow.test.ts`

Mục tiêu: decision đúng và side effects đúng thứ tự.

1. `processTicket: auto resolves deactivated account when HR is active`  
   - Mong đợi: `AUTO_RESOLVE` + có `reactivate`, `move`, `note`, `mail`  
   - Thứ tự bắt buộc: `move -> note -> mail`

2. `processTicket: marks review when HR status is terminated`  
   - Mong đợi: `NEED_REVIEW`, không `reactivate`, không mail

3. `processTicket: marks review when LMS is active`  
   - Mong đợi: `NEED_REVIEW`

4. `processTicket: skips non-login ticket without side effects`  
   - Mong đợi: `SKIP`, không side effects

5. `processTicket: skips login candidate when customer email is missing`  
   - Mong đợi: `SKIP`, không gọi HR/LMS, không crash

6. `processTicket: does not duplicate NEED_REVIEW note when bot note already exists`  
7. `processTicket: does not duplicate NEED_REVIEW note for terminated HR when bot note already exists`  
   - Mong đợi chung: idempotent note (`already noted`)

8. `processTicket: marks review when HR status is unknown`  
9. `processTicket: marks review when LMS status is unknown`

---

## Coverage nghiệp vụ đã có

- Nhận diện login ticket theo stage và tín hiệu fallback tag/title/description.
- Parse webhook payload đủ 4 shape hay gặp (`id`, tuple, `data.id`, `_id`).
- Quyết định đủ 3 nhánh: `AUTO_RESOLVE`, `NEED_REVIEW`, `SKIP`.
- Side effects của `AUTO_RESOLVE` đúng thứ tự `move -> note -> mail`.
- Hardening dữ liệu Odoo falsey để tránh crash.
- Guard thiếu email để skip an toàn.

## Chưa cover trong bộ unit này

- Integration test gọi Odoo thật qua network.
- E2E webhook full đường đi Odoo -> ngrok -> local server.
- Retry/backoff cho lỗi mạng kéo dài.
- Webhook auth/signature nếu bật ở production.
