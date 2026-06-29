# Aphrodite Backup Freshness and Restore Rehearsal Protocol

Package 280 records the manual protocol for proving backup freshness and rehearsing restore before launch can be reconsidered.

This package does not create a backup, does not run restore, does not connect to production DB, does not write data, does not change cron/workflows, does not launch production, does not call Telegram, and does not send messages.

## Status

- `backupFreshnessStatus = BLOCKED_STALE_BACKUP`
- do not fabricate backup freshness
- backup must be <24h before launch
- restore rehearsal required
- `publicLaunchApproved=false`
- `ownerManualReviewRequired=true`

## Backup Evidence Path Rules

- backup evidence path rules require owner-controlled storage.
- Evidence must include provider timestamp, project name, backup scope, retention window, reviewer, and evidence path.
- Evidence must not include credentials, connection strings, tokens, passwords, or private row data.
- Old evidence must not be overwritten without preserving history.

## Restore Verification Checklist

- restore verification checklist confirms schema presence.
- Confirm expected tables exist.
- Confirm aggregate counts or masked checks only.
- Confirm app compatibility against a non-production restore target.
- Record start time, finish time, duration, reviewer, and pass/fail result.

## Rollback Note

- rollback note must include latest safe commit.
- rollback note must include backup timestamp.
- rollback note must include deployment target and rollback owner.
- Failed or incomplete restore rehearsal keeps launch blocked.

## Safety

- Production launch done: No
- Telegram API used: No
- Messages sent: No
- BotFather changed: No
- Payment added: No
- VIP unlock added: No
- DB write added: No
- Production DB connected: No
- Backup created automatically: No
- Restore executed automatically: No
- External analytics added: No
- Cron/workflows changed: No
- Secrets added: No
- `.env.local` committed: No
- no DB writes
- no prod DB connect
- no cron/workflow changes

## Next Step

Package 281 - Public URL and Telegram Mini App Setup Plan.
