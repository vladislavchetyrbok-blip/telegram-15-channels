# Aphrodite Manual Env Setup Execution

Package 288 prepares and records manual environment setup execution for production readiness without committing secrets and without launching production.

This package does not add real secrets to Git, does not create `.env.local`, does not connect to production DB, does not call Telegram API, does not send messages, does not touch BotFather, does not add payment, does not unlock VIP, does not write to DB, does not change cron/workflows, does not set `publicLaunchApproved=true`, and does not set `ownerManualReviewRequired=false`.

## Status

- manualEnvSetupStatus = `PENDING_OWNER_SECRET_CONFIGURATION`
- databaseUrlConfigured = false
- telegramBotTokenConfigured = false
- secretsCommitted = false
- envLocalCommitted = false
- `publicLaunchApproved=false`
- `ownerManualReviewRequired=true`

## Secret Handling

- configure only in hosting provider env panel
- local `.env.local` only on owner machine if needed
- never commit secrets
- never paste secrets in ChatGPT/Codex/Claude/Antigravity reports
- verification must be redacted
- do not print secret values
- do not screenshot revealed secret values

## Manual Setup Steps

1. Owner configures `DATABASE_URL` in the hosting provider env panel or deployment provider secret store.
2. Owner configures `TELEGRAM_BOT_TOKEN` in the hosting provider env panel or deployment provider secret store.
3. Owner may use local `.env.local` only on owner machine if needed.
4. Owner confirms `.env.local` is not tracked, staged, or committed.
5. Owner records only masked configured/not configured evidence.

## Safe Verification Steps

- Use `node scripts/check-env-presence-redacted.mjs` only for local redacted presence checks.
- The script prints only `DATABASE_URL: present/missing`.
- The script prints only `TELEGRAM_BOT_TOKEN: present/missing`.
- The script must not print values.
- The script must not connect to a database.
- The script must not call Telegram API.
- The script must not validate a token through Telegram.

## Unresolved Blockers

- DATABASE_URL missing
- TELEGRAM_BOT_TOKEN missing
- backup older than 24h
- owner real-device approval pending

## Safety

- Production launch done: No
- Telegram API used: No
- Messages sent: No
- BotFather changed: No
- Payment added: No
- VIP unlock added: No
- DB write added: No
- External analytics added: No
- Cron/workflows changed: No
- Secrets added: No
- `.env.local` committed: No
- `publicLaunchApproved=false`
- `ownerManualReviewRequired=true`

## Next Step

Package 289 - Backup Freshness Verification.
