# Package 271: Public Mini App Route Shell Isolation Fix

## Summary

Package 271 isolates public Telegram Mini App routes from the internal dashboard
AppShell. The fix is scoped to route-shell classification and does not redesign
Mini App screens or change user-flow logic.

## Files changed

- `components/AppShell.tsx`
- `lib/zodiac/aphrodite-public-miniapp-route-shell-isolation.ts`
- `app/dashboard/networks/zodiac/public-miniapp-route-shell-isolation/page.tsx`
- `app/dashboard/networks/zodiac/page.tsx`
- `scripts/qa-zodiac-dashboard.mjs`
- `scripts/qa-aphrodite-public-miniapp-route-shell-isolation.mjs`
- `docs/aphrodite-public-miniapp-route-shell-isolation.md`
- `docs/aphrodite-package-reports/package-271.md`

## Public route classification

Public Mini App routes bypass internal Sidebar/Header chrome:

- `/miniapp`
- `/compatibility`
- `/birth-matrix`
- `/vip-preview`
- `/vip-compatibility-report`
- `/mystic-numbers`
- `/affirmations`
- `/mystic-cards` reserved for a future public route

Dashboard/admin routes remain internal:

- `/dashboard`
- `/dashboard/networks/zodiac`
- `/dashboard/networks/aphrodite`
- readiness/QA pages
- admin/platform routes

## QA

Required checks:

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run zodiac:miniapp:smoke`
- `npm run zodiac:dashboard:qa`
- `node scripts/qa-aphrodite-public-miniapp-route-shell-isolation.mjs`
- key previous Package 267/269/270 QA scripts
- mobile smoke at 360x844, 390x844, 430x844

## Safety

- Production launch done: No
- Telegram API used: No
- Messages sent: No
- BotFather changed: No
- Active CTA logic changed: No
- DB write added: No
- External analytics added: No
- Payment added: No
- VIP unlock added: No
- Cron/workflows/publish scripts changed: No
- Secrets added: No
- Production DB connected: No
- Dashboard made public: No
- publicLaunchApproved=false
- ownerManualReviewRequired=true
