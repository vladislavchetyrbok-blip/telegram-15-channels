# Package 290 - Public URL Telegram Setup Manual Gate

## Status

Package 290 records the public URL and Telegram Mini App setup gate as manual and not completed.

- Public URL status: `REQUIRED_NOT_CONFIGURED`
- Telegram Mini App URL status: `MANUAL_BOTFATHER_SETUP_NOT_DONE`
- `publicUrlApproved=false`
- `botFatherSetupDone=false`
- `publicLaunchApproved=false`
- `ownerManualReviewRequired=true`

This package does not configure BotFather, call Telegram API, send messages, set Telegram Mini App URL automatically, set actual public URL in production, or clear production blockers.

## HTTPS Requirement

HTTPS requirement is mandatory. `PUBLIC_APP_URL` must start with `https://` before owner can approve Telegram Mini App setup.

Owner must manually verify:

- certificate validity
- host ownership
- HTTPS redirects
- public route behavior
- no dashboard/admin route exposure

## Required Public Routes

- `/miniapp`
- `/compatibility`
- `/birth-matrix`
- `/vip-preview`
- `/vip-compatibility-report`
- `/miniapp?startapp=mystic`
- `/miniapp?startapp=compatibility`
- `/miniapp?startapp=birth_matrix`
- `/miniapp?startapp=vip`

## Manual BotFather Steps

BotFather setup is manual only and not done by this package.

Owner must not proceed until public URL, real-device approval, backup freshness, restore rehearsal, env setup, and release gates are complete.

Future manual evidence should include:

- reviewer
- date
- final approved HTTPS public URL
- masked Telegram UI state
- confirmation that no token or secret is exposed

## Safe Redacted PUBLIC_APP_URL Check

`scripts/check-public-url-routes-redacted.mjs` may inspect `PUBLIC_APP_URL` presence and format only.

If `PUBLIC_APP_URL` is missing, it reports:

- `PUBLIC_APP_URL: missing`
- `manual setup required`

If present, it reports presence and HTTPS format only. It does not call Telegram API, open BotFather, send messages, fetch routes, mutate settings, or approve the public URL.

## Production Blockers

- DATABASE_URL missing
- TELEGRAM_BOT_TOKEN missing
- backup older than 24h
- restore rehearsal required
- owner real-device approval pending
- public URL not configured/approved
- BotFather Mini App URL not configured

## Safety Confirmation

- Production launch done: No
- Telegram API used: No
- Messages sent: No
- BotFather changed: No
- Telegram Mini App URL set automatically: No
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

## Next Package

Package 291 - Production Blocker Closure Checklist
