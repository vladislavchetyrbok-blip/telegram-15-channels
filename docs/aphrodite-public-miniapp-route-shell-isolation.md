# Aphrodite Public Mini App Route Shell Isolation

Package 271 fixes a launch-blocking UI shell issue: public Telegram Mini App
routes must not render the internal dashboard Sidebar, Header, UnifiedStatusStrip,
or dashboard main padding.

## What changed

- Added one route classifier in `components/AppShell.tsx`.
- Public Mini App user routes now bypass the internal dashboard shell.
- Dashboard/admin routes remain inside the internal shell.
- `/dashboard/login` keeps its existing minimal wrapper behavior.
- `/compatibility` keeps its existing public shell behavior.

## Public routes without dashboard shell

- `/miniapp`
- `/compatibility`
- `/birth-matrix`
- `/vip-preview`
- `/vip-compatibility-report`
- `/mystic-numbers`
- `/affirmations`
- `/mystic-cards` is reserved in the route classifier for a future public route.

## Dashboard routes that must keep shell/auth behavior

- `/dashboard`
- `/dashboard/networks/zodiac`
- `/dashboard/networks/zodiac/*`
- `/dashboard/networks/aphrodite`
- `/dashboard/networks/aphrodite/*`
- admin/platform pages

## Manual browser checks

Open these public routes and verify that no internal admin labels, sidebar,
dashboard header, or readiness flags are visible:

- `/miniapp`
- `/compatibility`
- `/birth-matrix`
- `/vip-preview`
- `/vip-compatibility-report`

Open `/dashboard/networks/zodiac` and verify the internal dashboard still works.

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
