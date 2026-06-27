# Package 226 - Public API Exposure Hardening

## Scope

Hardened public unauthenticated API exposure without adding external
infrastructure, secrets, DB writes, Telegram calls, payments or VIP unlock.

New route:

`/dashboard/networks/zodiac/public-api-exposure-hardening`

## Hardened routes

### `/api/system/unified-status`

Changed the public response to a redacted variant:

- no bot username;
- no raw `lastError`;
- no scheduler timing internals;
- no exact target/admin/post counts;
- no exact content counts;
- keeps safe coarse status needed by existing UI.

### `/api/zodiac/analytics/event`

Added no-trust analytics hardening:

- JSON-only request check;
- body size cap retained;
- event allow-list retained;
- same-origin check when `Origin` exists;
- safe loopback handling for local `localhost`/`127.0.0.1` Mini App smoke on the same protocol and port;
- payload shape guard;
- spam/secret-like field rejection;
- in-memory IP-light rate limit with a higher same-origin browser ceiling and stricter anonymous/no-origin ceiling;
- returns `trust: preview_no_trust`.

## QA coverage

Added:

- `scripts/qa-aphrodite-public-api-exposure-hardening.mjs`.
- dashboard navigation link.
- dashboard QA coverage for the new readiness page.

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
