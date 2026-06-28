# Package 280: Backup Freshness and Restore Rehearsal Protocol

## Summary

Package 280 adds a manual protocol for backup freshness and restore rehearsal.

The status remains `backupFreshnessStatus = BLOCKED_STALE_BACKUP`. The package explicitly says do not fabricate backup freshness, backup must be <24h before launch, restore rehearsal required, and launch remains blocked.

## Files changed

- `lib/zodiac/aphrodite-backup-freshness-restore-rehearsal-protocol.ts`
- `app/dashboard/networks/zodiac/backup-freshness-restore-rehearsal-protocol/page.tsx`
- `app/dashboard/networks/zodiac/page.tsx`
- `scripts/qa-zodiac-dashboard.mjs`
- `scripts/qa-aphrodite-backup-freshness-restore-rehearsal-protocol.mjs`
- `docs/aphrodite-backup-freshness-restore-rehearsal-protocol.md`
- `docs/aphrodite-package-reports/package-280.md`

## Manual owner actions

- Capture fresh backup evidence in an owner-controlled evidence path.
- Confirm backup is newer than 24 hours before launch decision.
- Run restore rehearsal against a non-production target.
- Complete restore verification checklist with masked or aggregate checks only.
- Record rollback note with commit, backup timestamp, target, and rollback owner.

## Safety

- Production launch done: No
- Telegram API used: No
- Messages sent: No
- BotFather changed: No
- Payment added: No
- VIP unlock added: No
- DB write added: No
- Production DB connected: No
- External analytics added: No
- Cron/workflows/publish scripts changed: No
- Secrets added: No
- `.env.local` committed: No
- no DB writes
- no prod DB connect
- no cron/workflow changes
- `publicLaunchApproved=false`
- `ownerManualReviewRequired=true`
