# Package 257 - Backup Freshness Restore Rehearsal Execution Plan

## Summary

Package 257 adds a static owner-facing execution plan for backup freshness, restore rehearsal, rollback point, stop conditions, failure response, incident response, and owner sign-off.

This package does not create a backup, run restore, connect to production DB, add DB writes, add secrets, use Telegram API, send messages, or approve launch.

## Files Added

- `lib/zodiac/aphrodite-backup-freshness-restore-rehearsal-execution-plan.ts`
- `app/dashboard/networks/zodiac/backup-freshness-restore-rehearsal-execution-plan/page.tsx`
- `scripts/qa-aphrodite-backup-freshness-restore-rehearsal-execution-plan.mjs`
- `docs/aphrodite-backup-freshness-restore-rehearsal-execution-plan.md`
- `docs/aphrodite-package-reports/package-257.md`

## Files Updated

- `app/dashboard/networks/zodiac/page.tsx`
- `scripts/qa-zodiac-dashboard.mjs`

## Backup Freshness Requirements

- backup must be <24h before soft launch.
- backup timestamp must be manually verified.
- backup location must be manually verified.
- backup integrity must be manually checked where possible.
- backup owner/evidence must be recorded.
- stale backup blocks launch.
- missing backup blocks launch.
- backup cannot be assumed from docs alone.

## Restore Rehearsal Requirements

- restore rehearsal must be completed manually.
- restore target must be safe/non-production unless owner explicitly approves otherwise.
- no production restore during this package.
- verify restore procedure can recover critical data.
- verify rollback point / last known good commit.
- verify who is responsible for restore decision.
- restore failure blocks soft launch.

## Rollback Requirements

- last known good commit.
- current HEAD.
- package commits status.
- rollback owner.
- rollback trigger conditions.
- rollback verification steps.
- post-rollback checks.
- do not retry blindly.

## Evidence Checklist

Backup evidence:

- Backup timestamp.
- Backup location.
- Backup age classification.
- Backup integrity evidence.
- Backup evidence owner.

Restore evidence:

- Restore rehearsal completed.
- Restore target.
- Rollback point.
- Critical data recovered.
- Restore evidence owner.

## Stop Conditions

- backup older than 24h.
- backup missing.
- restore rehearsal failed.
- rollback point unclear.
- DATABASE_URL missing.
- TELEGRAM_BOT_TOKEN missing.
- smoke fail.
- build fail.
- dashboard QA fail.
- real-device QA missing.
- Telegram WebView QA missing.
- owner approval missing.

## Failure Response Protocol

- stop launch.
- preserve current evidence.
- do not send Telegram messages.
- do not change workflows.
- do not run live publish.
- document failure.
- create fix issue.
- rerun checks after fix.

## What Remains Blocked

- DATABASE_URL.
- TELEGRAM_BOT_TOKEN.
- backup freshness.
- restore rehearsal.
- real-device QA manual execution.
- Telegram WebView/startapp QA.
- owner approval.

## What Was Not Changed

- production launch started: No.
- backup created automatically: No.
- restore executed: No.
- production DB connected: No.
- DB writes added: No.
- Telegram API used: No.
- messages sent: No.
- BotFather changed: No.
- active CTA logic changed: No.
- channel mappings changed: No.
- env/secrets configured: No.
- payment added: No.
- VIP unlock added: No.
- entitlement bypass added: No.
- cron/workflow changed: No.
- owner approval granted: No.

## Current Flags

- `publicLaunchApproved=false`
- `ownerManualReviewRequired=true`

## Next Package Recommendation

Package 258 - Owner Approval Gate Final Manual Decision Plan.
