# Package 232 - Telegram WebView Startapp Manual QA Protocol

## Scope

Added manual QA protocol page:

`/dashboard/networks/zodiac/telegram-webview-startapp-manual-qa-protocol`

## Protocol coverage

- Telegram iOS WebView.
- Telegram Android WebView.
- startapp param present/missing.
- deep link open.
- browser fallback.
- Telegram WebApp ready/expand.
- BackButton.
- haptics.
- initData presence manual observation.
- cache/live marker.
- what is NOT a code failure in browser mode.
- BotFather not changed.
- Telegram API not used.
- no messages sent.

## QA coverage

Added:

- `scripts/qa-aphrodite-telegram-webview-startapp-manual-qa-protocol.mjs`.
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

## Current flags

- `publicLaunchApproved=false`.
- `ownerManualReviewRequired=true`.
