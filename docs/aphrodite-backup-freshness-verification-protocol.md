# Aphrodite Backup Freshness Verification Protocol

Package 230 adds a manual protocol for backup freshness and restore rehearsal
verification before a future soft/public launch.

## Scope

This is readiness documentation only.

- No production DB connection was made.
- No DB write was added.
- No backup was created automatically.
- No restore was executed automatically.
- No data was deleted or overwritten.
- No Telegram API call was made.
- No messages were sent.
- No payment or VIP unlock was added.
- No cron, workflow, publish script or active CTA logic changed.

## Required manual checks

- backup must be `<24h` before launch.
- backup older than 24h is a launch blocker.
- backup location must be checked manually in the provider console.
- restore rehearsal required in a safe non-production target.
- rollback point / last verified commit required.
- owner sign-off required.

## If backup is stale

Launch remains blocked. The owner must create or confirm a fresh backup manually
through the provider, record evidence, and rerun safety/readiness checks.

## If restore rehearsal fails

Launch remains blocked. The owner must document the failure, fix the restore
path, repeat rehearsal, and approve only after evidence review.

## Current flags

- `publicLaunchApproved=false`.
- `ownerManualReviewRequired=true`.
