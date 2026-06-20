# Zodiac OS Environment and Settings Center

Zodiac OS is a highly decoupled platform consisting of a Telegram Mini App, local dashboard UI, and separate data services. The Environment and Settings Center gives the owner a single unified view of these modules.

## Route

- **Route:** `/dashboard/networks/zodiac/settings`
- **Label:** `Настройки` (Zodiac OS Settings)

## Safety Model

1. **No live values displayed.** This page explicitly omits secrets (e.g. `ZODIAC_DASHBOARD_SESSION_SECRET`, `ZODIAC_ANALYTICS_REDIS_TOKEN`, Telegram Bot tokens).
2. **No write APIs.** There are no toggle buttons that hit a `/api/zodiac/settings` endpoint. Switching major modes requires Vercel Environment Variable changes.
3. **Read-Only / Local-Only state.** UI checklists and matrix states are stored in `localStorage` for convenience and task tracking, not on the server.

## Vercel Environment Checklist

To transition from local/dev to production, the owner needs to manually configure variables in Vercel:

- `ZODIAC_DASHBOARD_AUTH_ENABLED` - Enables the dashboard auth gate. Required before passing 20 users.
- `ZODIAC_DASHBOARD_ADMIN_PASSWORD_SHA256` - Admin password hash. Required before passing 20 users.
- `ZODIAC_DASHBOARD_SESSION_SECRET` - Cookie signing secret. Required before passing 20 users.
- `ZODIAC_ANALYTICS_REDIS_URL` - Upstash Redis URL. Required before first 5 users.
- `ZODIAC_ANALYTICS_REDIS_TOKEN` - Upstash Redis Token. Required before first 5 users.

## Production Entry Points

The settings center provides safe, copyable links to:
- **Zodiac Mini:** The user-facing Telegram Mini App endpoint.
- **Zodiac Control:** The root dashboard `/dashboard/networks/zodiac`.
- **Zodiac Pulse:** Analytics dashboard.
- **Launch Control:** Checklist for launch stages.

## Features Mode Matrix

Feature | Current mode | Production rule
--- | --- | ---
**Dashboard auth** | code-ready / pending env | enable before 20
**Analytics** | redis prod / noop local | OK
**Feedback** | local-only | OK for first 5
**Channel drafts** | local-only | OK
**Content drafts** | local-only | OK
**Publishing drafts** | local-only | OK
**Live publish** | **disabled** | explicit approval only
**Payments** | off | future
**Profile sync** | off | future
**Server writes** | **disabled** | future after RBAC

## Audit Checklist (Package 69)

- [x] Read-only environment settings dashboard built
- [x] Vercel env checklist visible without exposing values
- [x] Production entry points listed
- [x] Mode matrix and manual actions panel (localStorage) active
- [x] No `live publish` action in Settings
- [x] No server write APIs required
