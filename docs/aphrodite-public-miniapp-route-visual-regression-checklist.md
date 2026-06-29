# Package 307 - Public Mini App Route Visual Regression Checklist

## Summary

Consolidate visual regression checks for all public Mini App routes after Package 303.

Status field: `visualRegressionChecklistStatus`  
Status value: `READY_FOR_RECHECK`

## routes for recheck

- /miniapp: READY_FOR_RECHECK. Public Mini App home must render without dashboard shell. Owner action: Owner/visual QA should inspect this route.
- /compatibility: READY_FOR_RECHECK. Compatibility route must render public result flow only. Owner action: Confirm compact 30-day result.
- /birth-matrix: READY_FOR_RECHECK. Birth matrix route must remain public and readable. Owner action: Confirm inputs are stable.
- /vip-preview: READY_FOR_RECHECK. VIP preview route must remain locked and compact. Owner action: Confirm no active payment.
- /vip-compatibility-report: READY_FOR_RECHECK. Standalone report preview must remain locked. Owner action: Confirm no full report unlock.
- /miniapp?startapp=mystic: READY_FOR_RECHECK. Mystic startapp path must open the correct public surface. Owner action: Confirm bottom nav stability.
- /miniapp?startapp=compatibility: READY_FOR_RECHECK. Compatibility startapp path must remain public. Owner action: Confirm no admin shell.
- /miniapp?startapp=birth_matrix: READY_FOR_RECHECK. Birth matrix startapp path must remain public. Owner action: Confirm no broken inputs.
- /miniapp?startapp=vip: READY_FOR_RECHECK. VIP startapp path must remain locked and compact. Owner action: Confirm no payment or unlock.

## visual assertions

- no admin shell: READY_FOR_RECHECK. Public routes must not show dashboard shell. Owner action: Reject screenshots with admin chrome.
- no Aphrodite visible: READY_FOR_RECHECK. Public Mini App routes must not expose internal Aphrodite branding. Owner action: Confirm customer-facing brand only.
- no broken bottom nav: READY_FOR_RECHECK. Bottom navigation must remain stable. Owner action: Check after scrolling generated results.
- no horizontal overflow: READY_FOR_RECHECK. No public route should scroll horizontally. Owner action: Check 390px and real Telegram widths.
- no broken inputs: READY_FOR_RECHECK. Date, time, and city controls must remain usable. Owner action: Capture input screenshots.
- no unlocked VIP: READY_FOR_RECHECK. VIP content must remain locked. Owner action: Confirm entitlement remains closed.
- no active payment: READY_FOR_RECHECK. No checkout or active payment flow appears. Owner action: Keep manual blockers open.

## Required Safety State

- publicLaunchApproved=false
- ownerManualReviewRequired=true
- readyForProductionLaunch=false
- softLaunchStatus=NO / NOT_APPROVED unless this package records a stricter NO-GO value
- all manual blockers remain open unless real evidence exists
- no fake screenshots
- no fake backup freshness
- no fake env closure
- no fake BotFather setup

## Open Blockers

- owner real-device screenshots and explicit approval are still required
- DATABASE_URL is missing
- TELEGRAM_BOT_TOKEN is missing
- backup freshness is older than 24h
- restore rehearsal evidence is still required
- PUBLIC_APP_URL evidence is still required
- BotFather Mini App URL setup remains manual and not done

## Safety

- Production launch done: No
- Telegram API used: No
- Messages sent: No
- BotFather changed: No
- Payment added: No
- VIP unlock added: No
- Entitlement bypass added: No
- DB write added: No
- External analytics added: No
- Cron/workflows changed: No
- Secrets added: No
- .env.local committed: No

## Next Package

Package 308 - Input Controls Final Owner Review Gate
