# Package 222 - Manual Launch Runbook & Rollback Pack

Package 222 adds a final safe manual launch runbook and rollback pack for Aphrodite/Zodiac before owner go/no-go.

This is not production launch. It is static runbook/readiness documentation only.

## Route

`/dashboard/networks/zodiac/manual-launch-runbook-rollback-pack`

## Launch state

- publicLaunchApproved=false.
- ownerManualReviewRequired=true.
- Launch not performed. This runbook is manual readiness only.
- READY FOR OWNER REVIEW is only a manual future state, not current approval.

## Runbook sections added

- Launch freeze status.
- Required pre-launch checks.
- Owner approval checklist.
- Manual launch sequence.
- Abort conditions.
- Rollback plan.
- Post-launch monitoring checklist.
- Incident response checklist.
- Current blockers.
- Safety confirmation.

## Required pre-launch checks

- TypeScript PASS.
- Build PASS.
- zodiac:dashboard:qa PASS.
- all public launch QA scripts PASS.
- DATABASE_URL configured manually.
- TELEGRAM_BOT_TOKEN configured manually.
- backup fresh <24h.
- restore rehearsal checked manually.
- real-device visual QA completed.
- Telegram WebView/startapp QA completed.
- content/CTA inventory reviewed.
- owner manual approval granted.

## Rollback plan

- freeze/disable launch mode.
- revert to previous verified commit.
- stop affected workflow manually, if needed.
- verify no duplicate posting.
- verify ledger consistency.
- verify Mini App fallback.
- document incident.
- do not retry blindly.

## Statuses

- NOT APPROVED.
- OWNER REVIEW REQUIRED.
- BLOCKED BY ENV.
- BLOCKED BY BACKUP.
- BLOCKED BY MANUAL QA.
- READY FOR OWNER REVIEW, only as manual future state, not current approval.
- LAUNCH NOT PERFORMED.

## Remaining blockers

- DATABASE_URL.
- TELEGRAM_BOT_TOKEN.
- backup freshness.
- restore rehearsal.
- real-device QA.
- Telegram WebView/startapp QA.
- owner manual approval.

## Safety confirmation

- Production launch done: No.
- Telegram API used: No.
- Messages sent: No.
- BotFather changed: No.
- Active CTA logic changed: No.
- DB write added: No.
- External analytics added: No.
- Payment added: No.
- VIP unlock added: No.
- Cron/workflows/publish scripts changed: No.
- Secrets added: No.
