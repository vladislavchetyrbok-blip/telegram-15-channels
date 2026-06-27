# Aphrodite Telegram WebView Startapp Manual QA Protocol

Package 232 adds a manual QA protocol for Telegram WebView, startapp and
deep-link behavior.

## Manual checks

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

## Browser mode note

Missing startapp or Telegram initData in normal browser mode is NOT a code
failure. Telegram WebView must be checked manually on a real device.

## Safety

- BotFather not changed.
- Telegram API not used.
- no messages sent.
- no production launch.
- `publicLaunchApproved=false`.
- `ownerManualReviewRequired=true`.
