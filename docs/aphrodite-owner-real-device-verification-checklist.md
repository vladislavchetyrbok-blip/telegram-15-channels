# Aphrodite Owner Real Device Verification Checklist

Package 282 records the owner real-device verification checklist for public Mini App flows.

This package does not perform owner approval, does not launch production, does not call Telegram, does not send messages, does not add payment, does not unlock VIP, and does not write data.

## Status

- `ownerRealDeviceApproval = false`
- `ownerManualReviewRequired=true`
- `publicLaunchApproved=false`

## Device Matrix

- Android Telegram WebView
- iPhone Telegram WebView

## Public Routes

- `/miniapp`
- `/compatibility`
- `/birth-matrix`
- `/vip-preview`
- `/vip-compatibility-report`

## Input and UI Checks

- date input 01012000 -> 01.01.2000
- time input
- city Днепр / Дніпро suggestions
- bottom nav
- no Aphrodite
- no admin shell
- no payment
- no VIP unlock
- no Telegram send
- no horizontal overflow

## Safety

- Production launch done: No
- Telegram API used: No
- Messages sent: No
- BotFather changed: No
- Payment added: No
- VIP unlock added: No
- DB write added: No
- External analytics added: No
- Cron/workflows changed: No
- Secrets added: No
- `.env.local` committed: No
- `publicLaunchApproved=false`
- `ownerManualReviewRequired=true`

## Next Step

Package 283 - Soft Launch Dry Run and Rollback Plan.
