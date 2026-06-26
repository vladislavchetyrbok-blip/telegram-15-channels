# Package 221 - Production Env Handoff Checklist

## Scope

Added a safe, read-only production environment handoff checklist for Aphrodite/Zodiac public launch preparation.

New route:

`/dashboard/networks/zodiac/production-env-handoff-checklist`

No secrets were added. No real env values are stored here. No production DB connection was made. No Telegram API call was made.

## Files added or updated

- Static production env handoff checklist config/model.
- Dashboard production env handoff checklist page.
- Zodiac dashboard navigation link.
- Dashboard QA coverage.
- Dedicated Package 221 QA script.
- Package 221 docs/report.

## Env checklist items added

- DATABASE_URL.
- TELEGRAM_BOT_TOKEN.
- COMPATIBILITY_MINI_APP_URL / Telegram Mini App URL.
- NEXT_PUBLIC_APP_URL / APP_URL.
- Backup location/freshness marker.
- Launch mode/freeze flag.
- Owner approval flag/status.

## Secret hygiene rules added

- never commit .env production secrets.
- never paste secrets into chat reports.
- never print secrets in logs.
- use masked display only.
- rotate token if leaked.
- verify BotFather manually but do not change automatically.

## Values

- publicLaunchApproved=false.
- ownerManualReviewRequired=true.

## Safety confirmation

- Production launch done: No.
- Secrets added: No.
- Real env values stored: No.
- Real secrets read: No.
- Secrets printed in logs: No.
- Production DB connection made: No.
- Production DB write added: No.
- Telegram API call made: No.
- Messages sent: No.
- BotFather changed: No.
- Active CTA logic changed: No.
- Payment added: No.
- VIP unlock added: No.
- Cron/workflows/publish scripts changed: No.

## Remaining env blockers

- DATABASE_URL missing in production env.
- TELEGRAM_BOT_TOKEN missing in production env.
- Telegram Mini App URL/public URL marker manual verification.
- public app base URL manual verification.
- backup freshness marker manual verification.
- owner approval.
