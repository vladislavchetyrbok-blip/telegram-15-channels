# Package 279: Manual Env Setup Execution Checklist

## Summary

Package 279 adds a manual execution checklist for placing `DATABASE_URL` and `TELEGRAM_BOT_TOKEN` safely outside Git.

It documents hosting provider env panel placement, local .env.local only for local testing, never Git, masked presence verification, redaction rules, and `.env.example safe placeholders only`.

## Files changed

- `lib/zodiac/aphrodite-manual-env-setup-execution-checklist.ts`
- `app/dashboard/networks/zodiac/manual-env-setup-execution-checklist/page.tsx`
- `app/dashboard/networks/zodiac/page.tsx`
- `scripts/qa-zodiac-dashboard.mjs`
- `scripts/qa-aphrodite-manual-env-setup-execution-checklist.mjs`
- `docs/aphrodite-manual-env-setup-execution-checklist.md`
- `docs/aphrodite-package-reports/package-279.md`

## Manual owner actions

- Configure `DATABASE_URL` in the hosting provider env panel or deployment provider env panel.
- Configure `TELEGRAM_BOT_TOKEN` in the hosting provider env panel or deployment provider env panel.
- Use local `.env.local` only for local testing and never Git.
- Verify env presence without printing secret values.
- Keep `.env.example` to safe placeholders only.

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
- no real secrets
- no production connection
- no Telegram API calls
- `publicLaunchApproved=false`
- `ownerManualReviewRequired=true`
