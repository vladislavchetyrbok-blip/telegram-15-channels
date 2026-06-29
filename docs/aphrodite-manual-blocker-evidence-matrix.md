# Package 310 - Manual Blocker Evidence Matrix

## Summary

Create one matrix for all manual blockers and evidence requirements, keeping every blocker open unless real evidence exists.

Status field: `manualBlockerEvidenceMatrixStatus`  
Status value: `BLOCKERS_OPEN`

## manual blocker matrix

- owner screenshots/approval: BLOCKERS_OPEN. Owner real-device screenshots and explicit approval are still missing. Owner action: Provide real evidence before closure.
- DATABASE_URL: BLOCKERS_OPEN. DATABASE_URL is not configured in the safe local/prod evidence path. Owner action: Configure outside Git.
- TELEGRAM_BOT_TOKEN: BLOCKERS_OPEN. TELEGRAM_BOT_TOKEN is not configured. Owner action: Configure outside Git only.
- backup <24h: BLOCKERS_OPEN. Latest backup remains older than 24 hours. Owner action: Refresh backup and capture evidence.
- restore rehearsal: BLOCKERS_OPEN. Restore rehearsal evidence is not completed. Owner action: Run and document rehearsal manually.
- PUBLIC_APP_URL: BLOCKERS_OPEN. Public app URL evidence is still missing. Owner action: Verify real public URL manually.
- BotFather Mini App URL: BLOCKERS_OPEN. BotFather Mini App URL setup remains manual and not done. Owner action: Owner must set it manually later.

## closure rule

- all remain open unless real evidence exists: LOCKED. This matrix does not close any blocker by assertion. Owner action: Close only with owner/manual evidence.

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

Package 311 - Pre-Soft-Launch No-Go Enforcement Record
