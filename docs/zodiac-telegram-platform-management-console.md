# Zodiac Zodiac OS Management Console

Package 59-64 | 2026-06-20

This document describes the owner-facing Zodiac OS dashboard for the Zodiac network. It is an admin console and runbook index, not a live publisher.

Package 64 adds a dashboard auth gate. Local/dev can run with auth disabled, but
production should set the `ZODIAC_DASHBOARD_*` env contract before wider access.
The auth gate uses an httpOnly session cookie and does not store user personal
data or create platform write APIs.

## Dashboard Navigation

Main routes:

| Label | Route | Purpose |
|---|---|---|
| Login | `/dashboard/login` | Env-controlled owner passcode gate for dashboard access |
| Обзор | `/dashboard/networks/zodiac` | Owner overview for platform status and next actions |
| Каналы | `/dashboard/networks/zodiac/channels` | 13-channel management table and safe new-channel draft builder |
| Mini App | `/compatibility` | User-facing Mini App route |
| Контент | `/dashboard/networks/zodiac/content` | Content Engine, template catalog, Template Studio, RU/UA checklist, rubric planner |
| Публикации | `/dashboard/networks/zodiac/publishing` | Safe publishing center, calendar preview, dry-run helpers, manual draft prep |
| Аналитика | `/dashboard/networks/zodiac/analytics` | Privacy-safe Mini App analytics and first-users funnel |
| Отзывы | `/dashboard/networks/zodiac/feedback` | Local-only sanitized feedback intake, P0/P1 triage, and real-phone QA evidence |
| Soft Launch | `/dashboard/networks/zodiac/operations` | First 5 users GO / mass launch STOP status |
| Безопасность | `/dashboard/networks/zodiac/security` | Admin safety center, approvals, local audit log, checklist, and role readiness |
| Документы | `/dashboard/networks/zodiac/docs` | Runbook and project doc paths |

## Channel Management Page

Route:

```text
/dashboard/networks/zodiac/channels
```

The page shows the current 13-channel Zodiac network with:

- sign/topic name;
- slug;
- language;
- Telegram channel handle/URL when available;
- Mini App `startapp` link;
- navigation status;
- description status;
- daily publishing status;
- analytics status;
- risk/status badge.

The action cards are safe by design. Navigation and descriptions are shown as command hints only:

```bash
npm run zodiac:navigation:all:dry
npm run zodiac:descriptions:dry
```

The UI does not call Telegram live APIs and does not write to the ledger.

## Publishing Center

Route:

```text
/dashboard/networks/zodiac/publishing
```

Package 60 adds a dedicated safe publishing center for:

- daily publishing status;
- weekly live OFF status;
- today/tomorrow/week calendar preview;
- channel coverage;
- dry-run command hints;
- localStorage-only manual post draft builder;
- ledger/safety explanation.

It does not render a live publish button and does not execute commands from the UI.

## Feedback Center

Route:

```text
/dashboard/networks/zodiac/feedback
```

Package 61 adds an owner-facing feedback and QA evidence center for:

- first 5 users overview cards;
- average rating and P0/P1/P2 triage;
- localStorage-only sanitized feedback intake;
- real-phone QA checklist;
- analytics correlation link;
- decision matrix for first 5 users, 20 users, and mass launch.

It does not create a server-side write API, does not store raw tester data, and
does not expose token/env values.

## Admin Safety Center

Route:

```text
/dashboard/networks/zodiac/security
```

Package 62 adds a dedicated safety route for:

- current guardrail status cards;
- Approval Matrix for dry-run, live publish, weekly live, payments, profile sync, exact astro, new channels, and manual posts;
- localStorage-only audit log labeled `Локальный журнал, не серверная база`;
- export/copy sanitized audit log;
- `Перед 20 пользователями` checklist;
- future roles: Owner, Admin, Editor, Viewer;
- explicit warning that server write API is intentionally disabled until authenticated admin backend, audit log, and role checks exist.

The route has no live publish button, no Telegram write action, no ledger write
action, and no server-side write API.

## Dashboard Auth Gate

Route:

```text
/dashboard/login
```

Package 64 adds:

- `POST /api/dashboard/auth/login`;
- `POST /api/dashboard/auth/logout`;
- `GET /api/dashboard/auth/status`;
- route-level protection for `/dashboard` and `/dashboard/networks/zodiac/*`;
- httpOnly, sameSite=lax session cookie with 12-hour expiry;
- fail-closed missing-config state if auth is enabled without hash/secret.

Auth disabled local mode keeps the dashboard accessible but shows a warning on
the Security page. Auth enabled mode protects the dashboard with a passcode
session. No env values are displayed.

## Content Engine

Route:

```text
/dashboard/networks/zodiac/content
```

Package 63 adds a local-only Content Engine for:

- content template catalog;
- Template Studio with Telegram preview;
- generated text/config/checklist;
- RU/UA/EN quality checks;
- CTA/startapp preview;
- rubric planner;
- localStorage-only draft state.

It does not create a server-side write API, does not publish to Telegram, does
not write the ledger, and does not enable weekly live scheduling.

## New Channel Draft Builder

The builder on `/dashboard/networks/zodiac/channels` is local-only because there is no authenticated admin write backend for channel registry changes.

Safety model:

- no server-side write API;
- draft stored in browser `localStorage`;
- no token, Redis, Telegram bot token, or secret fields;
- generated output is a config snippet and checklist for a later manual commit.

Fields:

- Channel title;
- Slug;
- Language: `RU` / `UA` / `EN`;
- Category/topic;
- Telegram handle or URL;
- Emoji/icon;
- Description;
- Mini App `startapp` parameter;
- Publishing cadence: `daily` / `weekly` / `manual`;
- Status: `draft` / `ready`;
- Notes.

Validation:

- slug is required;
- slug must be lowercase/url-safe;
- slug must not duplicate an existing channel;
- language must be selected;
- Telegram handle/URL must look like `@channel_name` or `https://t.me/channel_name`;
- `startapp` must be a safe short token;
- no secret fields are present.

## Convert Draft Into Real Config

Manual path after approval:

1. Create Telegram channel.
2. Add bot/admin.
3. Add channel to registry.
4. Run navigation dry-run.
5. Run description dry-run.
6. Run publishing dry-run.
7. Approve live manually.

No generated draft is automatically committed or published.

## Live Publish Rules

Allowed from dashboard:

- read state;
- open docs;
- open analytics;
- open Mini App;
- copy local draft output;
- copy dry-run command hints.

Not allowed from dashboard:

- live Telegram navigation publish;
- live channel description publish;
- ledger mutation;
- weekly live enablement;
- payments or Telegram Stars enablement;
- profile sync enablement;
- exact astro claims.

## Safety Limits

Current operational flags:

| Item | Status |
|---|---|
| Daily autopublish | ON / safe |
| Weekly live | OFF |
| Ledger | protected |
| Analytics | Redis active in production |
| Profile sync | OFF |
| Payments / Stars | OFF |
| Exact astro | `exact_unavailable`, symbolic only |
| First 5 users | GO |
| Mass launch | STOP |

Next safe steps:

1. Invite first 5 users.
2. Watch analytics funnel.
3. Collect feedback.
4. Fix P0/P1.
5. Only then consider 20 users.

## Zodiac OS Naming System (Package 66)

* **Full platform** = Zodiac OS
* **Dashboard/admin** = Zodiac Control
* **Mini App** = Zodiac Mini
