# Package 283: Soft Launch Dry Run and Rollback Plan

## Summary

Package 283 adds a dry-run-only soft launch and rollback plan.

It keeps `softLaunchStatus = NOT_APPROVED`, documents the future one-channel/test-link approach later, and records rollback steps, incident checklist, and owner go/no-go gate.

## Files changed

- `lib/zodiac/aphrodite-soft-launch-dry-run-rollback-plan.ts`
- `app/dashboard/networks/zodiac/soft-launch-dry-run-rollback-plan/page.tsx`
- `app/dashboard/networks/zodiac/page.tsx`
- `scripts/qa-zodiac-dashboard.mjs`
- `scripts/qa-aphrodite-soft-launch-dry-run-rollback-plan.mjs`
- `docs/aphrodite-soft-launch-dry-run-rollback-plan.md`
- `docs/aphrodite-package-reports/package-283.md`

## Manual owner actions

- Keep dry-run only.
- Consider one-channel/test-link approach later only after all blockers clear.
- Record rollback steps before any future limited launch.
- Complete incident checklist template.
- Record owner go/no-go gate in a separate owner-approved package.

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
- Cron/workflows/publish scripts changed: No
- Secrets added: No
- `.env.local` committed: No
- no messages sent
- no Telegram API
- no BotFather
- no env changes
- no cron/workflow changes
- `publicLaunchApproved=false`
- `ownerManualReviewRequired=true`
