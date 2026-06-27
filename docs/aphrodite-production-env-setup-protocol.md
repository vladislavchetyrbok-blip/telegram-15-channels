# Aphrodite Production Env Setup Protocol

Package 229 adds an owner-facing manual protocol for configuring production
environment variables and secrets before a future soft/public launch.

## Scope

This is readiness documentation only.

- No secrets were added.
- No real env values are stored here.
- No production DB connection was made.
- No Telegram API call was made.
- No messages were sent.
- No payment or VIP unlock was added.
- No cron, workflow, publish script or active CTA logic changed.

## Manual setup areas

- `DATABASE_URL` manual setup.
- `TELEGRAM_BOT_TOKEN` manual setup.
- `APHRODITE_SESSION_SECRET` for dashboard auth.
- Public app URL and Telegram Mini App URL.
- Supabase envs if used.
- Analytics envs if used.
- Backup location and freshness config.
- Dry-run/live publish flags.
- Launch gate flags.
- Secret masking and token rotation.

## Secret hygiene

- Never commit `.env` production values.
- Never paste secrets into chat reports.
- Never print secrets in logs.
- Use masked display only.
- Rotate any token if leaked.
- Verify BotFather manually, but do not change it automatically.

## Current blockers

- `DATABASE_URL` manual configuration.
- `TELEGRAM_BOT_TOKEN` manual configuration.
- backup freshness `<24h`.
- owner explicit approval.

## Current flags

- `publicLaunchApproved=false`.
- `ownerManualReviewRequired=true`.
