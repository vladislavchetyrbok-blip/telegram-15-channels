# Package 304 - Post-303 Real Device Screenshot Evidence Pack

## Summary

Prepare a screenshot evidence pack checklist after Package 303 without fabricating screenshots or marking owner evidence received.

Status field: `post303ScreenshotEvidenceStatus`  
Status value: `PENDING_OWNER_SCREENSHOTS`

## required screenshots

- /miniapp: PENDING_OWNER_SCREENSHOTS. Owner must capture the public Mini App home route on a real Telegram device. Owner action: Upload or reference the real screenshot before approval.
- /compatibility: PENDING_OWNER_SCREENSHOTS. Owner must capture compatibility result state after Package 303. Owner action: Confirm no admin shell, no Aphrodite, and no overflow.
- /birth-matrix: PENDING_OWNER_SCREENSHOTS. Owner must capture the public birth matrix route. Owner action: Confirm input controls stay readable on device.
- /vip-preview: PENDING_OWNER_SCREENSHOTS. Owner must capture the direct VIP preview route. Owner action: Confirm VIP preview is compact and locked.
- /vip-compatibility-report: PENDING_OWNER_SCREENSHOTS. Owner must capture the standalone VIP compatibility report preview. Owner action: Confirm full report remains closed.
- /miniapp?startapp=mystic: PENDING_OWNER_SCREENSHOTS. Owner must capture Mystic startapp routing. Owner action: Confirm bottom nav and cards remain stable.
- VIP preview compact result: PENDING_OWNER_SCREENSHOTS. Evidence must show the compact locked preview after the density fix. Owner action: Confirm no full-report unlock is implied.
- 30-day result after density fix: PENDING_OWNER_SCREENSHOTS. Evidence must show first 5 days compact and days 6-30 compressed. Owner action: Confirm no wall of text.
- bottom nav: PENDING_OWNER_SCREENSHOTS. Evidence must show bottom navigation remains reachable after scrolling. Owner action: Confirm no overlap.
- date input: PENDING_OWNER_SCREENSHOTS. Evidence must show date entry is readable. Owner action: Use the manual input checklist.
- time input: PENDING_OWNER_SCREENSHOTS. Evidence must show time input/unknown time state. Owner action: Confirm keyboard does not hide critical CTA.
- city Днепр / Дніпро: PENDING_OWNER_SCREENSHOTS. Evidence must show city suggestions for Днепр / Дніпро where applicable. Owner action: Do not use an external city API.

## evidence policy

- no fake screenshots: LOCKED. This package creates only an evidence checklist and does not create or claim real-device screenshots. Owner action: Owner must provide real Telegram screenshots.
- owner screenshots received: PENDING_OWNER_SCREENSHOTS. No owner screenshots are marked received by Codex. Owner action: Keep approval pending.

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

Package 305 - VIP Preview Lock and Copy Consistency Gate
