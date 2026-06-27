# Package 229 - Production Env Setup Protocol

## Scope

Added a manual production env setup protocol page:

`/dashboard/networks/zodiac/production-env-setup-protocol`

## Protocol coverage

- `DATABASE_URL` manual setup.
- `TELEGRAM_BOT_TOKEN` manual setup.
- `APHRODITE_SESSION_SECRET`.
- Public app URL and Telegram Mini App URL.
- Supabase envs if used.
- Analytics envs if used.
- Backup location/freshness config.
- Dry-run/live publish flags.
- Launch gate flags.
- Secret masking.
- Token rotation if leaked.
- Never paste secrets into chat reports.
- Never commit `.env` production values.

## QA coverage

Added:

- `scripts/qa-aphrodite-production-env-setup-protocol.mjs`.
- dashboard navigation link.
- dashboard QA route/content assertions.

## Safety confirmation

- Production launch done: No.
- Telegram API used: No.
- Messages sent: No.
- BotFather changed: No.
- Active CTA logic changed: No.
- DB write added: No.
- External analytics added: No.
- Payment added: No.
- VIP unlock added: No.
- Cron/workflows/publish scripts changed: No.
- Secrets added: No.
- Production DB connected: No.

## Current flags

- `publicLaunchApproved=false`.
- `ownerManualReviewRequired=true`.

## Remaining blockers

- `DATABASE_URL` manual configuration.
- `TELEGRAM_BOT_TOKEN` manual configuration.
- backup freshness `<24h`.
- restore rehearsal.
- real-device QA manual execution.
- Telegram WebView/startapp manual QA.
- content/CTA owner review.
- owner explicit approval.
