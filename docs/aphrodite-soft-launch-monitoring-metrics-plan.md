# Package 346 - Soft Launch Monitoring Metrics Plan

## Summary

Document soft launch monitoring metrics plan for Telegram Mini App manual evidence gates without closing blockers, faking evidence, launching production, calling Telegram, changing BotFather, adding payment/VIP unlock, writing to DB, changing workflows, touching apps/mobile, or adding secrets.

Status field: `monitoringMetricsPlanStatus`  
Status value: `DRAFT_NOT_ACTIVE`

## Required Evidence And Gates

- what to watch after soft launch
- errors
- clicks
- user drop-off
- VIP clicks
- compatibility usage
- no external analytics added
- no DB writes

## manual evidence gate

- what to watch after soft launch: DRAFT_NOT_ACTIVE. what to watch after soft launch is required before this gate can close. This package records the requirement only. Owner action: Provide real owner/manual evidence later.
- errors: DRAFT_NOT_ACTIVE. errors is required before this gate can close. This package records the requirement only. Owner action: Provide real owner/manual evidence later.
- clicks: DRAFT_NOT_ACTIVE. clicks is required before this gate can close. This package records the requirement only. Owner action: Provide real owner/manual evidence later.
- user drop-off: DRAFT_NOT_ACTIVE. user drop-off is required before this gate can close. This package records the requirement only. Owner action: Provide real owner/manual evidence later.

## blocked safety boundary

- VIP clicks: DRAFT_NOT_ACTIVE. VIP clicks remains blocked or future-only until owner/manual evidence exists. Owner action: Do not mark this complete automatically.
- compatibility usage: DRAFT_NOT_ACTIVE. compatibility usage remains blocked or future-only until owner/manual evidence exists. Owner action: Do not mark this complete automatically.
- no external analytics added: LOCKED. no external analytics added remains blocked or future-only until owner/manual evidence exists. Owner action: Do not mark this complete automatically.
- no DB writes: LOCKED. no DB writes remains blocked or future-only until owner/manual evidence exists. Owner action: Do not mark this complete automatically.

## Required Safety State

- publicLaunchApproved=false
- ownerManualReviewRequired=true
- readyForProductionLaunch=false
- softLaunchStatus=NO / NOT_APPROVED while blockers remain open
- all manual blockers remain open unless real evidence exists
- no fake owner evidence
- no fake screenshots
- no fake approval
- no fake env closure
- no fake backup freshness
- no fake restore rehearsal
- no fake public URL
- no fake BotFather setup

## Open Blockers

- owner real Telegram screenshots are still required
- owner visual approval is not granted
- DATABASE_URL is missing or not redacted-verified
- TELEGRAM_BOT_TOKEN is missing or not redacted-verified
- backup freshness is older than 24h or not verified
- restore rehearsal evidence is still required
- PUBLIC_APP_URL evidence is still required
- BotFather Mini App URL setup remains manual and not done
- production:safety:check is still red on expected blockers
- owner final go/no-go remains NO-GO

## Safety

- Production launch done: No
- Telegram API used: No
- Messages sent: No
- BotFather changed: No
- Payment added: No
- VIP unlock added: No
- Entitlement bypass added: No
- DB write added: No
- Production DB connected: No
- External analytics added: No
- Cron/workflows changed: No
- Secrets added: No
- .env.local committed: No
- apps/mobile touched: No

## Next Package

Package 355 - Owner Manual Evidence Review
