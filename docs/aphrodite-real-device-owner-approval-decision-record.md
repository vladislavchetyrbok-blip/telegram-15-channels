# Package 309 - Real Device Owner Approval Decision Record

## Summary

Create a decision record for owner approval while keeping approval pending until owner explicitly provides real evidence and go/no-go.

Status field: `ownerApprovalDecision`  
Status value: `PENDING`

## approval rules

- approval cannot be granted by Codex: LOCKED. Codex cannot mark real-device approval true without owner evidence. Owner action: Owner must explicitly approve.
- owner screenshots required: PENDING. Real Telegram screenshots after Package 303 remain required. Owner action: Attach or reference screenshots before approval.
- owner explicit go/no-go required: PENDING. A real owner go/no-go decision is still required. Owner action: Record the decision in a future package only after evidence.
- no automatic launch: LOCKED. No automation can treat this record as launch approval. Owner action: Keep launch blocked.

## launch flags

- publicLaunchApproved=false: LOCKED. Public launch remains unapproved. Owner action: Do not flip without explicit owner decision.
- ownerManualReviewRequired=true: LOCKED. Owner manual review remains required. Owner action: Keep manual gate active.

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

Package 310 - Manual Blocker Evidence Matrix
