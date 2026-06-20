# Zodiac Telegram Platform Map

Last updated: 2026-06-20 | Package 61

## Architecture Overview

```text
Telegram Channels (13) ──► Bot / Mini App ──► User Flows ──► Analytics (Redis)
         │                       │
         │               startapp params:
         │               compat / mystic / birth_matrix / vip / week
         │
Dashboard ──► Overview ──► Analytics Dashboard
         │           │
         │    Publishing Center ──► Ledger ──► Safety Checks
         │
         └────► Feedback Center ──► Real Phone QA ──► 20 Users Decision
         │
Soft Launch ──► First 5 Users ──► Feedback ──► Triage
```

---

## User-Facing Entry Points

| Entry Point | Route / URL | Status |
|---|---|---|
| Telegram bot startapp (default) | `https://t.me/zodiac_love_check_bot?startapp=compat` | LIVE |
| startapp=compat | Opens Mini App home/main route | LIVE |
| startapp=mystic | Opens Mystic hub | LIVE |
| startapp=birth_matrix | Opens Birth Matrix | LIVE |
| startapp=vip | Opens VIP section | LIVE |
| startapp=week | Opens weekly horoscope | LIVE |
| Channel pinned navigation | Cross-links between 13 channels | DRY-RUN READY |
| Channel descriptions | Zodiac Mini App CTA in each description | DRY-RUN READY |
| Mini App `/compatibility` route | Main user-facing web route | LIVE |

---

## Admin / Platform Entry Points

| Entry Point | Route | Exists | Purpose |
|---|---|---|---|
| Main dashboard | `/dashboard` | YES | 15-channel command center |
| Zodiac network overview | `/dashboard/networks/zodiac` | YES | Zodiac control panel |
| Zodiac channel console | `/dashboard/networks/zodiac/channels` | YES | 13-channel table and local new-channel draft builder |
| Zodiac publishing center | `/dashboard/networks/zodiac/publishing` | YES | Safe publishing calendar, dry-run helpers, manual post drafts |
| Analytics dashboard | `/dashboard/networks/zodiac/analytics` | YES | Privacy-safe analytics |
| Feedback center | `/dashboard/networks/zodiac/feedback` | YES | Local sanitized feedback, real-phone QA, P0/P1 triage |
| Operations / safety | `/dashboard/networks/zodiac/operations` | YES | Soft launch, safety, ledger and launch limits |
| Docs / runbooks | `/dashboard/networks/zodiac/docs` | YES | Document path index |
| Compatibility preview | `/dashboard/networks/zodiac/compatibility-preview` | YES | Compat widget preview |
| Publishing center | `/publishing-center` | YES | Post scheduling & publishing |
| Publish readiness | `/publish-readiness` | YES | Pre-publish checks |
| Preflight | `/preflight` | YES | Safety preflight |
| Production send | `/production-send` | YES | Controlled send |
| Telegram safety | `/telegram-safety` | YES | Telegram safety checks |
| Channels list | `/channels` | YES | All channels overview |
| Zodiac channels | `/channels/zodiac` | YES | Zodiac channels list |

---

## Operational Systems

| System | Status | Notes |
|---|---|---|
| Daily autopublish | **ON** | 13 channels, image+CTA mode |
| Weekly live | **OFF** | Dry-run only |
| Payments / Stars | **OFF** | Not activated |
| Profile sync | **OFF** | Foundation only, disabled |
| Exact astro | **UNAVAILABLE** | No real provider connected |
| Analytics | **REDIS** (production) | Privacy-safe, counters active |
| Ledger safety | **PASS** | Fail-closed on corruption |
| Backup | **ACTIVE** | < 24h freshness |
| Telegram initData auth | **FOUNDATION** | Validation code ready, not enforced |

---

## Package 59 Management Console Routes

Package 59 adds a clearer owner-facing management console layer:

```text
/dashboard/networks/zodiac
  -> /dashboard/networks/zodiac/channels
  -> /dashboard/networks/zodiac/publishing
  -> /dashboard/networks/zodiac/analytics
  -> /dashboard/networks/zodiac/feedback
  -> /dashboard/networks/zodiac/operations
  -> /dashboard/networks/zodiac/docs
```

The channel console is read-only for live Telegram state. Its "new channel" builder stores drafts in browser `localStorage` and only generates a JSON/config snippet plus a manual checklist.

Package 60 adds the publishing center. Its manual post builder is also `localStorage` only and the page only shows dry-run command hints. It does not publish to Telegram.

Package 61 adds the feedback center. Its intake board and real-phone QA checklist are `localStorage` only, store sanitized summaries, and do not create a server write API.

---

## NPM Scripts Map

### Publishing
| Script | Purpose |
|---|---|
| `zodiac:publish-date:dry` | Daily dry-run publish by date |
| `zodiac:navigation:all:dry` | Navigation pinned posts dry-run |
| `zodiac:descriptions:dry` | Channel descriptions dry-run |
| `zodiac:weekly:dry` | Weekly posts dry-run |
| `zodiac:weekly-assets:validate` | Weekly visual assets validation |
| `zodiac:weekly:ledger:check` | Weekly ledger integrity |

### QA & Safety
| Script | Purpose |
|---|---|
| `zodiac:miniapp:smoke` | Mini App smoke tests |
| `zodiac:desktop:qa` | Desktop visual QA screenshots |
| `zodiac:dashboard:qa` | Dashboard route QA |
| `zodiac:analytics:check` | Analytics privacy & event check |
| `zodiac:analytics:storage:check` | Analytics storage readiness |
| `zodiac:ledger:safety:check` | Ledger corruption/safety check |
| `zodiac:astro:check` | Astro engine readiness |
| `zodiac:workflow:check` | Full workflow check |
| `zodiac:telegram-auth:check` | Telegram auth check |
| `zodiac:profile-sync:check` | Profile sync safety check |
| `production:safety:check` | Production safety center |
