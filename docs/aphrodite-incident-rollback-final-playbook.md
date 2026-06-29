# Package 347 - Incident Rollback Final Playbook

## Summary

Document incident rollback final playbook for Telegram Mini App manual evidence gates without closing blockers, faking evidence, launching production, calling Telegram, changing BotFather, adding payment/VIP unlock, writing to DB, changing workflows, touching apps/mobile, or adding secrets.

Status field: `rollbackPlaybookStatus`  
Status value: `READY_DRAFT_NOT_EXECUTED`

## Required Evidence And Gates

- disable Mini App URL manually
- revert public link if needed
- stop posting CTA
- keep Telegram send disabled
- incident owner checklist
- no rollback executed now

## manual evidence gate

- disable Mini App URL manually: READY_DRAFT_NOT_EXECUTED. disable Mini App URL manually is required before this gate can close. This package records the requirement only. Owner action: Provide real owner/manual evidence later.
- revert public link if needed: READY_DRAFT_NOT_EXECUTED. revert public link if needed is required before this gate can close. This package records the requirement only. Owner action: Provide real owner/manual evidence later.
- stop posting CTA: READY_DRAFT_NOT_EXECUTED. stop posting CTA is required before this gate can close. This package records the requirement only. Owner action: Provide real owner/manual evidence later.

## blocked safety boundary

- keep Telegram send disabled: READY_DRAFT_NOT_EXECUTED. keep Telegram send disabled remains blocked or future-only until owner/manual evidence exists. Owner action: Do not mark this complete automatically.
- incident owner checklist: READY_DRAFT_NOT_EXECUTED. incident owner checklist remains blocked or future-only until owner/manual evidence exists. Owner action: Do not mark this complete automatically.
- no rollback executed now: LOCKED. no rollback executed now remains blocked or future-only until owner/manual evidence exists. Owner action: Do not mark this complete automatically.

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
