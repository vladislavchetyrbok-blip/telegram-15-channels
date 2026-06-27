# Aphrodite Public API Exposure Hardening

Package 226 hardens two public unauthenticated API routes found by audit.

## Routes

`/api/system/unified-status`

- The public response is redacted.
- Bot username is not returned.
- Raw `lastError` text is not returned.
- Scheduler timing internals are nulled.
- Exact target/admin/post counts are nulled or reduced to coarse status.
- Exact content counts are redacted.

`/api/zodiac/analytics/event`

- Body size cap remains.
- Allow-list validation remains.
- JSON content type is required.
- Same-origin is required when the browser sends an `Origin` header.
- Local smoke on equivalent loopback origins such as `localhost` and `127.0.0.1` is allowed only when protocol and port match.
- Payload shape is limited.
- Obvious spam/secret-like fields are rejected.
- In-memory IP-light rate limiting is applied, with a higher same-origin browser ceiling for Mini App smoke flows and a stricter anonymous/no-origin ceiling.
- The route reports `trust: preview_no_trust`.

## What was not added

- No production launch.
- No secrets.
- No production DB connection.
- No DB write.
- No external analytics activation.
- No Telegram API call.
- No Telegram messages.
- No payment.
- No VIP unlock.
- No cron, workflow, publish script or active CTA logic change.

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
