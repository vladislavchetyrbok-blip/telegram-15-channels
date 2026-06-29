# Package 305 - VIP Preview Lock and Copy Consistency Gate

## Summary

Document and verify that VIP wording remains consistent after Package 303 and never implies active payment or unlocked access.

Status field: `vipPreviewLockConsistencyStatus`  
Status value: `REVIEW_REQUIRED`

## copy terms to verify

- VIP превью: REVIEW_REQUIRED. Use the Russian preview term on visible locked preview surfaces. Owner action: Owner should confirm wording on real device.
- без оплаты: REVIEW_REQUIRED. Locked preview surfaces must continue to state there is no payment. Owner action: Confirm no active payment is implied.
- VIP закрыт: REVIEW_REQUIRED. VIP state must remain closed until a future approved package. Owner action: Confirm no unlocked state appears.
- полный отчёт закрыт: REVIEW_REQUIRED. Full report access must be described as closed. Owner action: Confirm preview cannot be mistaken for full paid access.

## negative assertions

- no active payment copy: LOCKED. No wording should imply checkout, invoice, subscription, Stars purchase, or payment activation. Owner action: Keep payment inactive.
- no unlocked VIP copy: LOCKED. No wording should imply VIP is unlocked or entitlement was granted. Owner action: Keep VIP closed.
- no entitlement bypass: LOCKED. No bypass terminology or access shortcut is introduced. Owner action: Keep access gates intact.

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

Package 306 - Mobile Result Density Guardrails
