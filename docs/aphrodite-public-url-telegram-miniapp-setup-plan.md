# Aphrodite Public URL and Telegram Mini App Setup Plan

Package 281 documents the manual public URL and Telegram Mini App setup gate.

This package does not launch production, does not call Telegram, does not send messages, does not mutate BotFather, does not add secrets, does not write DB, does not add payment, and does not unlock VIP.

## Public URL

- public URL requirement: owner must choose and approve the deployed public URL manually.
- HTTPS requirement: Telegram Mini App traffic must use HTTPS.
- public URL must point to public isolated routes, not dashboard.
- Dashboard/admin routes remain internal.

## Telegram Mini App

- Telegram Mini App URL setup is manual.
- BotFather changes are manual only and not done by this package.
- no Telegram API calls.
- no messages.
- no BotFather mutation.

## Required Test Routes

- `/miniapp`
- `/compatibility`
- `/birth-matrix`
- `/vip-preview`
- `/vip-compatibility-report`

route isolation must remain PASS before any public URL can be used for Telegram Mini App setup.

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
- `publicLaunchApproved=false`
- `ownerManualReviewRequired=true`

## Next Step

Package 282 - Owner Real Device Verification Checklist.
