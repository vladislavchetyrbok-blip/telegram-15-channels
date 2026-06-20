# Zodiac Zodiac OS Admin Safety Center

Package 62-64 | 2026-06-20

Route:

```text
/dashboard/networks/zodiac/security
```

The Admin Safety Center is the owner-facing safety and approval page for the
Zodiac Zodiac OS. It is intentionally read-only for live systems and
does not add any server-side write API.

## Safety Status

The page shows the current operating guardrails:

- Dashboard auth: env-controlled passcode gate, disabled by default for local/dev.
- Auth configured: shown without env values.
- Session cookie: local browser only, httpOnly, 12h when auth is enabled.
- Live publish: forbidden from dashboard UI.
- Weekly live: OFF.
- Payments/Stars: OFF.
- Profile sync: OFF.
- Exact astro: symbolic only / `exact_unavailable`.
- Ledger: protected.
- Dry-run API calls: 0 expected.
- Redis analytics: active in production.
- Mass launch: STOP.

## Approval Matrix

| Action | Status | Approval | UI |
|---|---|---|---|
| Daily dry-run | allowed | no | command hint only |
| Daily live publish | blocked | explicit owner approval | no UI button |
| Weekly live | OFF | explicit owner approval | no UI button |
| Payments/Stars | OFF | product + legal + technical approval | no UI button |
| Profile sync writes | OFF | privacy approval | no UI button |
| Exact astro provider | unavailable | provider + accuracy approval | no UI button |
| Add new channel | draft-only | manual config review | local draft only |
| Manual post | draft-only | manual publish process | local draft only |

## Local Audit Log

The audit log is browser-local only:

- storage: `localStorage`;
- label: `Локальный журнал, не серверная база`;
- no server write API;
- no raw Telegram `initData`;
- no raw feedback;
- no raw birth date/time/city/question/intention/result text;
- no tokens, Redis values, env values, or result text.

Allowed event fields:

- action type;
- timestamp;
- route;
- sanitized short label;
- status/risk.

Current local dashboard actions recorded:

- channel draft created/updated;
- manual post draft created/updated;
- feedback entry created/updated;
- safety checklist item changed;
- approval note created.

The page supports clearing the local log and copying/exporting a sanitized
audit log summary.

## Package 63 Content Drafts

The Content Engine route is:

```text
/dashboard/networks/zodiac/content
```

Content drafts are localStorage-only and remain covered by this safety model:

- no server write API;
- no Telegram API calls;
- no live publish button;
- no ledger writes;
- no weekly live scheduling;
- no raw personal data;
- exact astrology remains `symbolic only / exact_unavailable`.

## Package 64 Dashboard Auth Gate

The dashboard auth route is:

```text
/dashboard/login
```

Package 64 adds an owner-dashboard passcode gate:

- env contract: `ZODIAC_DASHBOARD_AUTH_ENABLED`,
  `ZODIAC_DASHBOARD_ADMIN_PASSWORD_SHA256`,
  `ZODIAC_DASHBOARD_SESSION_SECRET`;
- route-level guard for `/dashboard` and `/dashboard/networks/zodiac/*`;
- login/logout/status APIs under `/api/dashboard/auth/*`;
- signed httpOnly session cookie with 12-hour expiry;
- fail-closed behavior when auth is enabled but hash/secret are missing;
- conditional logout button when auth is enabled and the browser has a session.

This is not full RBAC and does not create server-side platform writes. The
Security page must not display env values, passcodes, session secrets, Telegram
tokens, Redis tokens, or raw Telegram `initData`.

## Checklist Before 20 Users

The `Перед 20 пользователями` checklist is also localStorage-only and does not
write to backend systems. It covers first 5 users, P0/P1 status, iPhone/Android
real-phone checks, analytics funnel evidence, feedback review, sensitive-data
visibility, dry-run API calls, dry-run ledger writes, weekly live, payments, and
profile sync.

## Future Roles

Future authenticated admin backend roles are documented but not enforced by a
server write API yet:

- Viewer: read analytics/docs/status.
- Editor: prepare drafts only.
- Admin: approve config changes after auth exists.
- Owner: live approval only.

Warning:

```text
Сейчас server write API intentionally disabled. Перед включением write-действий нужен authenticated admin backend, audit log and role checks.
```

## Before Enabling Writes

Do not enable dashboard write actions until all of these exist:

- authenticated admin backend;
- role checks for Owner/Admin/Editor/Viewer;
- server-side audit log;
- approval workflow;
- privacy review;
- tests proving no raw sensitive data is stored;
- safety check proving live Telegram actions cannot run accidentally.

- [Production Dashboard Auth Activation Runbook](zodiac-production-dashboard-auth-activation.md)

## Zodiac OS Naming System (Package 66)

* **Full platform** = Zodiac OS
* **Dashboard/admin** = Zodiac Control
* **Mini App** = Zodiac Mini
