# Aphrodite Manual Real-Device QA Evidence Capture

Package 231 turns the real-device QA execution pack into a clear manual
evidence capture flow. It does not complete real-device QA automatically.

## Required device evidence

- iPhone Safari.
- Android Chrome.
- Telegram iOS WebView.
- Telegram Android WebView.
- Desktop browser.

## Manual fields

- device name.
- OS version.
- Telegram version manual field.
- public URL checked.
- startapp/deep link checked.
- screenshots required.
- owner notes.
- status: `NOT CHECKED` / `PASS` / `FAIL` / `BLOCKED` / `OWNER REVIEW REQUIRED`.
- severity.
- timestamp manual field.

## Mini App flows

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

## Safety

- No automatic PASS claims were added.
- No real-device QA was completed automatically.
- No Telegram API call was made.
- No payment or VIP unlock was added.
- `publicLaunchApproved=false`.
- `ownerManualReviewRequired=true`.
