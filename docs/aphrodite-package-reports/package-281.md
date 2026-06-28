# Package 281: Public URL and Telegram Mini App Setup Plan

## Summary

Package 281 adds a manual setup plan for the public HTTPS URL and Telegram Mini App URL.

It documents the public URL requirement, HTTPS requirement, required public routes, route isolation PASS requirement, and the rule that BotFather changes are manual only and not done by this package.

## Files changed

- `lib/zodiac/aphrodite-public-url-telegram-miniapp-setup-plan.ts`
- `app/dashboard/networks/zodiac/public-url-telegram-miniapp-setup-plan/page.tsx`
- `app/dashboard/networks/zodiac/page.tsx`
- `scripts/qa-zodiac-dashboard.mjs`
- `scripts/qa-aphrodite-public-url-telegram-miniapp-setup-plan.mjs`
- `docs/aphrodite-public-url-telegram-miniapp-setup-plan.md`
- `docs/aphrodite-package-reports/package-281.md`

## Manual owner actions

- Choose the public URL manually.
- Confirm HTTPS manually.
- Verify `/miniapp`, `/compatibility`, `/birth-matrix`, `/vip-preview`, and `/vip-compatibility-report`.
- Configure Telegram Mini App URL manually only after owner approval.
- Keep BotFather setup as NOT_DONE until a separate manual gate records it.

## Safety

- Production launch done: No
- Telegram API used: No
- Messages sent: No
- BotFather changed: No
- Payment added: No
- VIP unlock added: No
- DB write added: No
- External analytics added: No
- Cron/workflows/publish scripts changed: No
- Secrets added: No
- `.env.local` committed: No
- no Telegram API calls
- no messages
- no BotFather mutation
- `publicLaunchApproved=false`
- `ownerManualReviewRequired=true`
