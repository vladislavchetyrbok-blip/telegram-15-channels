# Aphrodite Real Device QA Execution Gate

Package 251 adds a manual execution gate for real-device QA before any future limited soft launch.

This is not automatic completion. It does not fake screenshots, does not mark device QA as passed, does not use Telegram API, does not send messages, does not enable payment, does not unlock VIP, and does not write to a database.

## Current State

- Current state: NOT CHECKED / OWNER REVIEW REQUIRED.
- publicLaunchApproved=false.
- ownerManualReviewRequired=true.
- No manual QA completed automatically.
- Telegram WebView remains manual required unless checked on a real Telegram device.

## Required Devices

- iPhone Safari
- Android Chrome
- Telegram iOS WebView
- Telegram Android WebView
- Desktop sanity

## Required Viewports

- 360px
- 390px
- 430px
- desktop sanity

## Required Flows

- Home
- Compatibility input/result
- Birth Matrix input/result
- Mystic Cards closed/selected/revealed
- VIP preview locked
- Result/share cards
- startapp/deep link
- browser fallback

## Evidence Fields

- device
- OS version
- Telegram app version
- browser version
- public URL
- screenshot/evidence
- tester notes
- status
- severity
- timestamp
- owner sign-off

## Status Values

- NOT CHECKED
- PASS
- FAIL
- BLOCKED
- OWNER REVIEW REQUIRED

## Safety

- No fake screenshots.
- No real-device QA completed automatically.
- No Telegram API calls.
- No Telegram messages.
- No BotFather changes.
- No active CTA logic changes.
- No channel mapping changes.
- No payment.
- No VIP unlock.
- No entitlement bypass.
- No DB writes.
- No cron/workflow/publish script changes.
- No secrets.

Next package: Package 252 - Soft Launch Candidate Report.
