# Package 289 - Backup Freshness Verification

## Status

Package 289 records the current backup freshness state as `BLOCKED_STALE_OR_UNVERIFIED_BACKUP`.

This package does not fabricate backup freshness and does not clear launch blockers.

## Current Evidence

- Current main head before this package: `dbea676ec2f1e3a623429a4a3dea40f43b68487b`
- Backup freshness requirement: backup must be newer than 24h before launch.
- Latest local backup evidence path: `data/backups/2026-06-20-01-09-37`
- Latest backup created at: `2026-06-19T22:09:37.374Z`
- Latest backup age at baseline safety check: `228.88h`
- Latest backup measured at: `2026-06-29T11:02:29.747Z`
- Backup marked fresh: `false`
- Restore rehearsal status: `REQUIRED_NOT_COMPLETED`

The known local backup is stale. Owner action is still required.

## Verification Rules

- Do not claim backup freshness unless real backup metadata proves age is under 24h.
- Do not create fake backup files.
- Do not modify backup timestamps.
- Do not connect to production DB.
- Do not restore data from this package.
- Do not write to DB.
- Record path, timestamp, age, reviewer, and result without secrets.

## Safe Local Metadata Check

`scripts/check-backup-freshness-redacted.mjs` may inspect known local backup evidence directories only.

It reports:

- backup evidence status
- latest backup evidence path
- latest backup timestamp
- latest backup age in hours
- stale/fresh status based only on local file metadata
- manual backup requirement if evidence is missing or stale

It must never print secrets, connect to DB, create backups, modify backup files, call Telegram API, send messages, or clear launch blockers.

## Restore Rehearsal

Restore rehearsal remains required and not completed.

Before launch can be reconsidered, owner must run a manual restore rehearsal against an isolated non-production target and record:

- backup source timestamp
- non-production restore target
- start and finish time
- aggregate verification checks
- reviewer
- pass/fail result
- rollback notes

## Production Blockers

- DATABASE_URL missing
- TELEGRAM_BOT_TOKEN missing
- backup freshness blocked
- owner real-device approval pending

## Safety Confirmation

- Production launch done: No
- Telegram API used: No
- Messages sent: No
- BotFather changed: No
- Payment added: No
- VIP unlock added: No
- DB write added: No
- Production DB connected: No
- External analytics added: No
- Cron/workflows changed: No
- Secrets added: No
- `.env.local` committed: No
- `publicLaunchApproved=false`
- `ownerManualReviewRequired=true`

## Next Package

Package 290 - Public URL Telegram Setup Manual Gate
