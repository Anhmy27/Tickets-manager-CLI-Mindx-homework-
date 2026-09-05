# Week 5

## Mục tiêu

Tự động hóa ticket login issue trên Odoo theo mindset Operating Engineer: chỉ auto khi đủ điều kiện an toàn, case mơ hồ chuyển `NEED_REVIEW`.

## Trong folder này

| Mục | Vai trò |
|-----|---------|
| [`odoo-automation/`](./odoo-automation/) | Bot scan / webhook + mock HR/LMS |
| [`research/ai-summary.md`](./research/ai-summary.md) | Tóm tắt quá trình làm việc với AI tuần 5 |

Report chọn bài toán: [`odoo-automation/week-5/day-1-2-report-login-deactivate.md`](./odoo-automation/week-5/day-1-2-report-login-deactivate.md)

## Chạy nhanh

```bash
cd odoo-automation
npm install
copy .env.example .env
# điền ODOO_URL, ODOO_DB, ODOO_LOGIN, ODOO_API_KEY
npm test
npm start      # quét ticket intake một lần
npm run dev    # webhook server: POST /webhook
```

Stage IDs cấu hình trong `odoo-automation/ticket-rules.json`.

Chi tiết flow / decision: [`odoo-automation/README.md`](./odoo-automation/README.md)
