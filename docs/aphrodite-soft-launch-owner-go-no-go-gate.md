# Aphrodite Soft Launch Owner Go/No-Go Gate

Package 235 adds the final owner go/no-go gate for a future soft launch. This
package does not approve launch automatically.

## Gate state

- `publicLaunchApproved=false`.
- `ownerManualReviewRequired=true`.
- soft launch not approved.
- production launch not done.
- Telegram API not used.
- messages not sent.
- payments not added.
- VIP unlock not added.
- DB writes not added.
- cron/workflows/publish scripts not changed.

## Required before future owner approval

- DATABASE_URL configured manually.
- TELEGRAM_BOT_TOKEN configured manually.
- backup `<24h` confirmed manually.
- restore rehearsal manually checked.
- real-device QA completed manually.
- Telegram WebView/startapp QA completed manually.
- content/CTA owner review completed manually.
- launch simulation report reviewed.
- rollback plan understood.
- owner explicit approval.

## Safety

- No auto approval.
- No production launch.
- No Telegram API call.
- No messages sent.
- No payment or VIP unlock.
- No DB write.
