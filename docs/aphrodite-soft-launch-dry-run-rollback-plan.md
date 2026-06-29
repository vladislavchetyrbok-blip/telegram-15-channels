# Aphrodite Soft Launch Dry Run and Rollback Plan

Package 283 records a dry-run-only soft launch and rollback plan.

This package does not launch production, does not send messages, does not call Telegram API, does not change BotFather, does not edit env, does not change cron/workflows, does not write DB, does not add payment, and does not unlock VIP.

## Status

- `softLaunchStatus = NOT_APPROVED`
- dry-run only
- one-channel/test-link approach later
- production blockers still block launch
- `publicLaunchApproved=false`
- `ownerManualReviewRequired=true`

## Rollback Steps

- rollback steps include latest safe commit.
- rollback steps include deployed target and public URL.
- rollback steps include backup timestamp.
- rollback steps include rollback owner and communication owner.
- Failed public route, shell leak, payment exposure, VIP unlock, or Telegram send requires immediate stop.

## Incident Checklist

- incident checklist includes severity.
- incident checklist includes affected route.
- incident checklist includes timestamp and screenshots.
- incident checklist includes owner decision.
- incident checklist excludes secrets and private data.

## Owner Go/No-Go Gate

- owner go/no-go gate is required before any future limited launch.
- Production blockers must be cleared before Go is possible.
- No-Go remains the default state.

## Safety

- Production launch done: No
- Telegram API used: No
- Messages sent: No
- BotFather changed: No
- Env changes added: No
- Payment added: No
- VIP unlock added: No
- DB write added: No
- External analytics added: No
- Cron/workflows changed: No
- Secrets added: No
- `.env.local` committed: No
- no messages sent
- no Telegram API
- no BotFather
- no env changes
- no cron/workflow changes

## Next Step

Package 284 - Release Gate Status Consolidation Dashboard.
