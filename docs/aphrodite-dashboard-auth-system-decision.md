# Aphrodite Dashboard Auth System Decision

Package 225 records the dashboard auth decision after the audit found two
conflicting dashboard auth surfaces.

## Decision

- Canonical dashboard auth: `aphrodite_session` via `middleware.ts`.
- Canonical session/cookie: `aphrodite_session`.
- Canonical login path: `/login`.
- Canonical login API: `/api/auth/login`.
- Canonical logout API: `/api/auth/logout`.
- Protected route pattern: `/dashboard/*`.
- `/dashboard` remains protected: Yes.
- Public dashboard bypass added: No.

## Legacy/orphan auth

The old Zodiac dashboard auth surface is now documented as legacy,
orphaned, and non-authoritative:

- Legacy cookie: `zodiac_dashboard_session`.
- Legacy secret name: `ZODIAC_DASHBOARD_SESSION_SECRET`.
- Legacy login path: `/dashboard/login`.
- Legacy API routes: `/api/dashboard/auth/*`.

Handling:

- `POST /api/dashboard/auth/login` returns `410 Disabled` and does not set a cookie.
- `POST /api/dashboard/auth/logout` returns `410 Disabled` and does not set a cookie.
- `GET /api/dashboard/auth/status` returns `410 Disabled` with canonical auth guidance.
- `app/dashboard/login` remains behind canonical `/dashboard` middleware and is not the canonical login path.
- `components/DashboardLoginForm` is legacy UI and is not authoritative.

## Why the dashboard remains protected

`middleware.ts` still checks `/dashboard` and `/dashboard/*` requests before
dashboard page code runs. It reads `aphrodite_session`, verifies the signed
cookie with `APHRODITE_SESSION_SECRET`, and redirects unauthenticated requests
to `/login`.

A `zodiac_dashboard_session` cookie alone must not grant access to `/dashboard`.

## What was not changed

- No production launch was performed.
- No secrets were added.
- No production env values were added.
- No production DB connection was made.
- No DB write was added.
- No Telegram API call was made.
- No Telegram messages were sent.
- No BotFather change was made.
- No payment was added.
- No VIP unlock was added.
- No cron, workflow, publish script or active CTA logic was changed.

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
