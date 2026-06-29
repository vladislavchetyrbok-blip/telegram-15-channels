# Package 345 - One Channel Soft Launch Plan Candidate

## Summary

Document one channel soft launch plan candidate for Telegram Mini App manual evidence gates without closing blockers, faking evidence, launching production, calling Telegram, changing BotFather, adding payment/VIP unlock, writing to DB, changing workflows, touching apps/mobile, or adding secrets.

Status field: `oneChannelSoftLaunchPlanStatus`  
Status value: `DRAFT_BLOCKED`

## Required Evidence And Gates

- one channel/test link launch later
- not now
- monitoring plan
- rollback plan
- owner go/no-go first
- no Telegram posting now

## manual evidence gate

- one channel/test link launch later: DRAFT_BLOCKED. one channel/test link launch later is required before this gate can close. This package records the requirement only. Owner action: Provide real owner/manual evidence later.
- not now: DRAFT_BLOCKED. not now is required before this gate can close. This package records the requirement only. Owner action: Provide real owner/manual evidence later.
- monitoring plan: DRAFT_BLOCKED. monitoring plan is required before this gate can close. This package records the requirement only. Owner action: Provide real owner/manual evidence later.

## blocked safety boundary

- rollback plan: DRAFT_BLOCKED. rollback plan remains blocked or future-only until owner/manual evidence exists. Owner action: Do not mark this complete automatically.
- owner go/no-go first: DRAFT_BLOCKED. owner go/no-go first remains blocked or future-only until owner/manual evidence exists. Owner action: Do not mark this complete automatically.
- no Telegram posting now: LOCKED. no Telegram posting now remains blocked or future-only until owner/manual evidence exists. Owner action: Do not mark this complete automatically.

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
