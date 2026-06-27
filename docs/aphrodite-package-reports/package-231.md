# Package 231 - Manual Real-Device QA Evidence Capture

## Scope

Added a manual evidence capture page:

`/dashboard/networks/zodiac/manual-real-device-qa-evidence-capture`

## Evidence fields/checks added

- iPhone Safari.
- Android Chrome.
- Telegram iOS WebView.
- Telegram Android WebView.
- Desktop browser.
- device name.
- OS version.
- Telegram version manual field.
- public URL checked.
- startapp/deep link checked.
- screenshots required.
- owner notes.
- status and severity.
- timestamp manual field.

## Mini App flow coverage

- main screen.
- compatibility.
- Birth Matrix.
- Mystic Cards.
- VIP locked state.
- CTA visibility.
- no active payment.
- no VIP unlock without entitlement.
- back button.
- haptics.
- cache marker.

## QA coverage

Added:

- `scripts/qa-aphrodite-manual-real-device-qa-evidence-capture.mjs`.
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
- No automatic PASS claims were added.
- No real-device QA was completed automatically.

## Current flags

- `publicLaunchApproved=false`.
- `ownerManualReviewRequired=true`.
