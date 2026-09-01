# odoo-automation

Week 5 automation script for Odoo login tickets.

## Scope

- Scan tickets in intake stage by ID (`requiredStageId`).
- Detect login candidates from `tagKeywords` plus strong title/description intent.
- Check mock HR + mock LMS status by ticket email.
- Auto resolve only when `LMS=deactivated` and `HR=active`.
- Auto-resolve action order is: move stage -> internal note -> customer reply.
- Support Odoo Studio webhook envelopes (`_id`) and standard payload shapes (`id`, `data.id`).
- Skip safely when ticket has no valid customer email (no crash, no side effects).

## SLA interpretation

- Ticket logging/prioritization (`15m`) is handled by Odoo process.
- Initial response (`30m`) remains required.
  - `AUTO_RESOLVE`: this script sends one merged ACK + resolved reply.
  - `NEED_REVIEW`/`ESCALATE_HR`: script posts internal note, human agent sends ACK and continues manually.

## Setup

1. Copy `.env.example` to `.env` and fill real values.
2. Edit `ticket-rules.json` after reviewing your Odoo export/patterns (including stage IDs).
3. Edit `mock-users.json` with the exact test emails used in Odoo tickets.

## Commands

```bash
npm install
npm test
npm start
npm run dev
```

- `npm start`: one-shot scan mode from intake stage.
- `npm run dev`: webhook mode with Express server on `POST /webhook`.

## Expected decisions

- `AUTO_RESOLVE`: reactivated in mock LMS, moved to resolved stage, internal note posted, customer reply posted.
- `NEED_REVIEW`: internal note only, needs human ACK.
- `ESCALATE_HR`: internal note only, no reactivation.
- `SKIP`: no Odoo updates (includes missing login signal or missing customer email).

## Stage source of truth

`requiredStageId` and `resolvedStageId` are configured only in `ticket-rules.json`.

`NEED_REVIEW` is only used after a ticket is confirmed as login-related.

This version does not use `skipKeywords`; skip is determined by rule checks (stage/tag/intent) or missing customer email.

## Webhook payload notes

When using Odoo Studio automation "Send webhook notification", payload may include:

```json
{
  "_action": "Send webhook notification(...)",
  "_id": 15,
  "_model": "helpdesk.ticket"
}
```

This project accepts `_id` directly as ticket ID for webhook processing.
