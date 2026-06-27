# Aphrodite Env Example Expansion Readiness

Package 227 expands `.env.example` so a fresh setup can see the runtime
variables that matter before a future soft/public launch.

## Scope

This is documentation/readiness only.

- No real secrets were added.
- No production env values were added.
- No production DB connection was made.
- No Telegram API call was made.
- No messages were sent.
- No payment or VIP unlock was added.
- No cron, workflow, publish script or active CTA logic changed.

## Documented groups

- App/Public URLs.
- Dashboard/Admin auth.
- Telegram Bot / Mini App.
- Database / Supabase.
- Publishing / dry-run / live safety flags.
- Analytics.
- Backup / restore.
- Launch gates / owner approval.
- Development / QA.
- Legacy env names.

## Required production blockers

- `DATABASE_URL` is required for production DB-backed storage.
- `TELEGRAM_BOT_TOKEN` is required for production Telegram operations.
- `APHRODITE_SESSION_SECRET` is required for dashboard auth.
- `ZODIAC_DASHBOARD_SESSION_SECRET` is legacy/non-authoritative after Package 225.
- Production launch remains blocked without manual owner approval.

## Current flags

- `publicLaunchApproved=false`.
- `ownerManualReviewRequired=true`.

## Owner reminder

Never commit production `.env` values. Configure real secrets only in the
approved secret store, keep reports masked, and rotate any token if leaked.
