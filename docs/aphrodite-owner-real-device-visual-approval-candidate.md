# Package 335 - Owner Real Device Visual Approval Candidate

## Summary

Document owner real device visual approval candidate for Telegram Mini App manual evidence gates without closing blockers, faking evidence, launching production, calling Telegram, changing BotFather, adding payment/VIP unlock, writing to DB, changing workflows, touching apps/mobile, or adding secrets.

Status field: `ownerVisualApprovalCandidateStatus`  
Status value: `PENDING_OWNER_DECISION`

## Required Evidence And Gates

- what owner must explicitly approve
- no admin shell
- no Aphrodite
- no payment/VIP unlock
- acceptable mobile layout
- bottom nav
- input controls
- VIP preview density

## manual evidence gate

- what owner must explicitly approve: PENDING_OWNER_DECISION. what owner must explicitly approve is required before this gate can close. This package records the requirement only. Owner action: Provide real owner/manual evidence later.
- no admin shell: PENDING_OWNER_DECISION. no admin shell is required before this gate can close. This package records the requirement only. Owner action: Provide real owner/manual evidence later.
- no Aphrodite: PENDING_OWNER_DECISION. no Aphrodite is required before this gate can close. This package records the requirement only. Owner action: Provide real owner/manual evidence later.
- no payment/VIP unlock: PENDING_OWNER_DECISION. no payment/VIP unlock is required before this gate can close. This package records the requirement only. Owner action: Provide real owner/manual evidence later.

## blocked safety boundary

- acceptable mobile layout: PENDING_OWNER_DECISION. acceptable mobile layout remains blocked or future-only until owner/manual evidence exists. Owner action: Do not mark this complete automatically.
- bottom nav: PENDING_OWNER_DECISION. bottom nav remains blocked or future-only until owner/manual evidence exists. Owner action: Do not mark this complete automatically.
- input controls: PENDING_OWNER_DECISION. input controls remains blocked or future-only until owner/manual evidence exists. Owner action: Do not mark this complete automatically.
- VIP preview density: PENDING_OWNER_DECISION. VIP preview density remains blocked or future-only until owner/manual evidence exists. Owner action: Do not mark this complete automatically.

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
