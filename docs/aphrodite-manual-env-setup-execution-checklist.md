# Aphrodite Manual Env Setup Execution Checklist

Package 279 documents how the owner should place production environment variables safely without exposing secrets or clearing launch gates falsely.

This package does not add real secrets, does not commit `.env.local`, does not connect to production DB, does not call Telegram, does not send messages, does not launch production, does not enable payment, and does not unlock VIP.

## Required Destinations

- `DATABASE_URL`: hosting provider env panel or deployment provider env panel.
- `DATABASE_URL`: local .env.local only for local testing when owner-approved manual local verification is needed.
- `DATABASE_URL`: never Git.
- `TELEGRAM_BOT_TOKEN`: hosting provider env panel or deployment provider env panel.
- `TELEGRAM_BOT_TOKEN`: never Git.
- `.env.example safe placeholders only`.

## Verification

- Verify env presence without printing secret values.
- Report only configured/not configured.
- Use masked provider UI indicators when possible.
- Do not test production DB connectivity in this package.
- Do not call Telegram API and do not send messages.

## Redaction Rules

- redaction rules: variable names are allowed, values are not.
- Replace any exposed value with `[REDACTED]`.
- Rotate any value that appears in logs, screenshots, docs, chat, or commits.
- Evidence may show masked presence only.

## Safety

- Production launch done: No
- Telegram API used: No
- Messages sent: No
- BotFather changed: No
- Payment added: No
- VIP unlock added: No
- DB write added: No
- Production DB connected: No
- External analytics added: No
- Cron/workflows changed: No
- Secrets added: No
- `.env.local` committed: No
- no real secrets
- no production connection
- no Telegram API calls
- `publicLaunchApproved=false`
- `ownerManualReviewRequired=true`

## Next Step

Package 280 - Backup Freshness and Restore Rehearsal Protocol.
