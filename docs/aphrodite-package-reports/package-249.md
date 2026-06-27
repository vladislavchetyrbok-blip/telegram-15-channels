# Package 249: Soft Launch Preflight Checklist

## Summary

Package 249 adds an owner-facing Soft Launch Preflight Checklist. It lists exactly what must be checked before any future limited soft launch.

This package is readiness only. It does not launch anything and does not approve launch.

## Added

- Static model: `lib/zodiac/aphrodite-soft-launch-preflight-checklist.ts`
- Dashboard page: `/dashboard/networks/zodiac/soft-launch-preflight-checklist`
- QA script: `scripts/qa-aphrodite-soft-launch-preflight-checklist.mjs`
- Docs: `docs/aphrodite-soft-launch-preflight-checklist.md`
- Dashboard navigation link and dashboard QA registration

## Checklist Categories

- Code checks
- Production env
- Backup/restore
- Real-device QA
- Telegram WebView/startapp QA
- Content/CTA owner review
- Safety
- Stop conditions

## Known Blockers

- DATABASE_URL manual blocker
- TELEGRAM_BOT_TOKEN manual blocker
- APHRODITE_SESSION_SECRET manual blocker
- public app URL manual verification
- Telegram Mini App URL manual verification
- backup <24h
- restore rehearsal
- rollback point
- last verified commit
- real-device QA manual execution
- Telegram WebView/startapp QA
- content/CTA owner review
- owner explicit approval

## Stop Conditions

- smoke fail
- dashboard QA fail
- stale backup
- broken Telegram WebView
- CTA confusion
- duplicate post risk
- missing rollback plan
- owner approval missing

## Safety Confirmation

- Production launch done: No
- Telegram API used: No
- Messages sent: No
- BotFather changed: No
- Active CTA logic changed: No
- Channel mappings changed: No
- DB write added: No
- External analytics added: No
- Payment added: No
- VIP unlock added: No
- Entitlement bypass added: No
- Cron/workflows/publish scripts changed: No
- Secrets added: No
- Production DB connected: No
- Manual checks marked complete: No
- publicLaunchApproved=false
- ownerManualReviewRequired=true

## Next Package

Package 250 - Owner Manual Review Pack.
