# odoo-automation

Week 5 automation script for Odoo login tickets.

## Scope

- Scan tickets in intake stage by ID (`requiredStageId`).
- Detect login candidates only from strong title/description intent.
- Check mock HR + mock LMS status by ticket email.
- Auto resolve only when `LMS=deactivated` and `HR=active`.
- Post internal notes for all handled decisions.
- Post customer reply + move stage to `resolvedStageId` only for auto-resolved tickets.

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
npm run start
```

## Expected decisions

- `AUTO_RESOLVE`: reactivated in mock LMS, note posted, customer reply posted, moved to resolved stage.
- `NEED_REVIEW`: internal note only, needs human ACK.
- `ESCALATE_HR`: internal note only, no reactivation.
- `SKIP`: no Odoo updates.

## Stage source of truth

`requiredStageId` and `resolvedStageId` are configured only in `ticket-rules.json`.

`REVIEW` is only used after a ticket is confirmed as login-related. Non-login tickets are skipped.

This version does not use `skipKeywords`; skip is determined only by missing login intent.
