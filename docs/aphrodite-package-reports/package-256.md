# Package 256 Report - Production Env Manual Setup Execution Plan

## Summary

Package 256 adds a static owner-facing execution plan for manual production env setup before soft launch.

It documents required env/secrets, manual setup procedure, verification procedure, secret hygiene, leak response protocol, current blockers, and safety boundaries. It does not configure real env values and does not connect to production systems.

## New dashboard page

- `/dashboard/networks/zodiac/production-env-manual-setup-execution-plan`

## New model/config

- `lib/zodiac/aphrodite-production-env-manual-setup-execution-plan.ts`

## New QA script

- `scripts/qa-aphrodite-production-env-manual-setup-execution-plan.mjs`

## Docs

- `docs/aphrodite-production-env-manual-setup-execution-plan.md`
- `docs/aphrodite-package-reports/package-256.md`

## Production env setup status

- `DATABASE_URL`: BLOCKED, manual secret-manager configuration required
- `TELEGRAM_BOT_TOKEN`: BLOCKED, manual secret-manager configuration required
- `APHRODITE_SESSION_SECRET`: MANUAL REQUIRED, dashboard auth secret must be configured manually
- public app URL: MANUAL REQUIRED
- Telegram Mini App URL: MANUAL REQUIRED
- backup config: BLOCKED until backup freshness under 24h and restore rehearsal are manually confirmed
- launch flags: OWNER REVIEW REQUIRED, `publicLaunchApproved=false` and `ownerManualReviewRequired=true`
- owner approval: OWNER REVIEW REQUIRED

## Secret hygiene

- real secrets added: No
- `.env` production created: No
- secrets printed: No
- leak response documented: Yes

Secret rules documented:

- never commit `.env` production secrets;
- never paste secrets into chat reports;
- never print secrets in logs;
- use masked display only;
- rotate token if leaked;
- do not store real `TELEGRAM_BOT_TOKEN`, `DATABASE_URL`, or `APHRODITE_SESSION_SECRET` in docs/reports.

## Verification procedure

After owner manually configures env values, run:

```powershell
git status -sb
npm run typecheck
npm run lint
npm run build
npm run zodiac:miniapp:smoke
npm run zodiac:dashboard:qa
```

Then manually verify:

- production safety check if available;
- backup freshness;
- Telegram bot token without sending messages;
- dashboard auth;
- Mini App public URL;
- no production launch happened.

## What was not changed

- production launch started: No
- Telegram API used: No
- messages sent: No
- BotFather changed: No
- active CTA logic changed: No
- channel mappings changed: No
- env/secrets configured: No
- production DB connected: No
- payment added: No
- VIP unlock added: No
- entitlement bypass added: No
- DB/storage writes added: No
- cron/workflow changed: No
- owner approval granted: No

## Current flags

- `publicLaunchApproved=false`
- `ownerManualReviewRequired=true`

## Remaining blockers

- `DATABASE_URL`
- `TELEGRAM_BOT_TOKEN`
- backup freshness
- restore rehearsal
- real-device QA manual execution
- Telegram WebView/startapp QA
- owner approval

## Next package recommendation

Package 257 - Backup Freshness Restore Rehearsal Execution Plan.
