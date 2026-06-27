# Package 225 - Dashboard Auth System Decision

## Scope

Resolved and documented the dashboard auth decision after the audit found two
conflicting dashboard auth systems.

New route:

`/dashboard/networks/zodiac/dashboard-auth-system-decision`

No production launch was performed.

## Auth decision

- Canonical dashboard auth: `aphrodite_session` via `middleware.ts`.
- Canonical session/cookie: `aphrodite_session`.
- Canonical login path: `/login`.
- Canonical protected route pattern: `/dashboard/*`.
- Legacy/orphan auth: `zodiac_dashboard_session` / `/api/dashboard/auth/*`.
- `/dashboard` remains protected: Yes.
- `/dashboard` public bypass added: No.
- Secrets added: No.

## Legacy/orphan handling

- `app/api/dashboard/auth/login` now returns `410 Disabled` and does not set cookies.
- `app/api/dashboard/auth/logout` now returns `410 Disabled` and does not set cookies.
- `app/api/dashboard/auth/status` now returns `410 Disabled` and reports canonical auth guidance.
- `DashboardLoginForm` is documented as legacy UI and non-authoritative.
- `ZODIAC_DASHBOARD_SESSION_SECRET` remains a legacy env name only; no value was added.

## Files added or updated

- Static dashboard auth system decision config/model.
- Dashboard auth decision page.
- Zodiac dashboard navigation link.
- Dashboard QA coverage for the new page, disabled legacy APIs, and fake `zodiac_dashboard_session`.
- Dedicated Package 225 QA script.
- Package 225 docs/report.

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
- Production DB connected: No.
- Dashboard made public: No.

## Current flags

- `publicLaunchApproved=false`.
- `ownerManualReviewRequired=true`.

## Remaining blockers

- `DATABASE_URL`.
- `TELEGRAM_BOT_TOKEN`.
- backup freshness `<24h`.
- restore rehearsal.
- real-device QA manual execution.
- Telegram WebView/startapp manual QA.
- content/CTA owner review.
- owner manual approval.

## Next recommended package

Package 226 - Public API Exposure Hardening.
