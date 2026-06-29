# Package 312 - Native iPhone Android Future Roadmap Draft

## Summary

Draft a future native iPhone/Android roadmap after Telegram Mini App stabilization, without adding native app code or store actions now.

Status field: `nativeRoadmapStatus`  
Status value: `DRAFT_AFTER_TELEGRAM_STABILITY`

## roadmap principles

- Telegram Mini App first: DRAFT_AFTER_TELEGRAM_STABILITY. Stabilize Telegram Mini App and manual evidence before native investment. Owner action: Use soft launch metrics first.
- native app later: DRAFT_AFTER_TELEGRAM_STABILITY. iPhone/Android native apps are future roadmap items, not this release. Owner action: Do not start native implementation now.
- shared backend/content core: DRAFT_AFTER_TELEGRAM_STABILITY. Future native apps should reuse the same content and safety model. Owner action: Plan after Mini App metrics.
- iPhone/Android only after soft launch metrics: DRAFT_AFTER_TELEGRAM_STABILITY. Native work waits until soft launch evidence supports it. Owner action: Review retention and UX data later.

## excluded actions

- no native app code in this package: LOCKED. No iOS, Android, Expo, React Native, App Store, or Play code is added. Owner action: Keep codebase unchanged for native.
- no App Store / Google Play action now: LOCKED. No store listing, signing, account, or submission action is performed. Owner action: Future owner decision only.
- no payment changes: LOCKED. No native payment or web payment change is introduced. Owner action: Keep payment blocker open.

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

Package 313 - Post-303 Final Readiness Summary
