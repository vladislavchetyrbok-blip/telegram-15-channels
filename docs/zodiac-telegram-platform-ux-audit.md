# Zodiac Telegram Platform UX Audit

Package 57 | 2026-06-20 | HEAD: `b467e51`

---

## Executive Verdict

| Area | Score | Notes |
|---|---|---|
| Platform clarity | **8/10** | Clean architecture, clear safety controls |
| Admin dashboard clarity | **8/10** | Improved: dead anchors fixed, steps updated |
| User entry clarity | **8/10** | Multiple startapp params, clear CTA buttons |
| Analytics clarity | **9/10** | Rich counters, funnels, privacy-safe labeling |
| Publishing safety clarity | **9/10** | Fail-closed ledger, dry-run safe, 0 API calls |
| Soft-launch readiness | **8/10** | Baseline captured, docs ready, feedback flow exists |

---

## P0 Findings

None.

---

## P1 Findings

### P1-1: Dead hash anchors on main dashboard (FIXED in this package)
- 3 action cards linked to `#weekly`, `#settings`, `#reports` anchors that did not exist.
- Fix: Redirected to real routes (`/dashboard/networks/zodiac` and `/dashboard/networks/zodiac/analytics`).

### P1-2: Unused imports in zodiac overview page (FIXED in this package)
- `BarChart3`, `FileText`, `Settings` were imported but unused after Package 54 removed dead buttons.
- Fix: Removed unused imports.

### P1-3: Stale recommended steps (FIXED in this package)
- "Подключить Redis analytics" was listed as a TODO, but Redis is already active in production.
- Fix: Updated steps to reflect current state (invite first 5 users, monitor analytics, etc.).

---

## P2 Backlog

| # | Item | Priority | Status |
|---|---|---|---|
| 1 | Sidebar has no entry for Zodiac overview page | P2 | Backlog |
| 2 | Sidebar is flat (no grouping) | P2 | Backlog |
| 3 | Recommended steps are static, not interactive | P2 | Backlog |
| 4 | No individual channel drill-down from zodiac overview | P2 | Backlog |
| 5 | Compatibility preview page not linked from overview | P2 | Backlog |

---

## What Was Improved in This Package

1. **Fixed 3 dead hash anchors** on main dashboard action cards:
   - "Еженедельный гороскоп" → `/dashboard/networks/zodiac`
   - "Комментарии" → `/dashboard/networks/zodiac`
   - "Аналитика" → `/dashboard/networks/zodiac/analytics` (direct route)

2. **Removed 3 unused imports** from `app/dashboard/networks/zodiac/page.tsx`.

3. **Updated recommended steps** to reflect current operational state:
   - Replaced "Подключить Redis analytics" with actionable next steps.
   - Added "Не запускать массовый запуск" explicitly.

4. **Created platform map** (`docs/zodiac-telegram-platform-map.md`):
   - Full route inventory (36 routes verified).
   - All npm scripts mapped.
   - Operational systems status table.
   - Architecture diagram.

5. **Created this UX audit document.**

---

## Remaining Recommended Platform Improvements

| # | Improvement | Package |
|---|---|---|
| 1 | Real phone evidence pass | Next |
| 2 | First 5 users feedback collection | Next |
| 3 | Redis analytics report after 5 users | After feedback |
| 4 | Dashboard analytics cards/funnels improvement | Future |
| 5 | Publishing calendar view | Future |
| 6 | Weekly live controlled plan | Requires explicit approval |
| 7 | Profile sync test mode | Requires explicit approval |
| 8 | Exact astro provider research | Requires explicit approval |
| 9 | Monetization test mode | Requires explicit approval |
| 10 | Mass launch readiness | Requires all above |

---

## Button / Navigation Map

### Main Dashboard (`/dashboard`)

| Button | Route | Exists | Risk |
|---|---|---|---|
| Zodiac network card | `/dashboard/networks/zodiac` | YES | None |
| Все Zodiac-каналы | `/channels/zodiac` | YES | None |
| Проверить scheduled run | `/publishing-center` | YES | None |
| Еженедельный гороскоп | `/dashboard/networks/zodiac` | YES | None |
| Комментарии | `/dashboard/networks/zodiac` | YES | None |
| Аналитика | `/dashboard/networks/zodiac/analytics` | YES | None |

### Zodiac Overview (`/dashboard/networks/zodiac`)

| Button | Route | Exists | Risk |
|---|---|---|---|
| Назад к пульту | `/dashboard` | YES | None |
| Открыть Mini App | `/channels/zodiac` | YES | None |
| Открыть аналитику | `/dashboard/networks/zodiac/analytics` | YES | None |
| Проверить публикации | `/publishing-center` | YES | None |

### Sidebar (global)

| Button | Route | Exists | Risk |
|---|---|---|---|
| Дашборд | `/dashboard` | YES | None |
| Каналы | `/channels` | YES | None |
| Центр публикаций | `/publishing-center` | YES | None |
| Посты | `/posts` | YES | None |
| Черновики | `/drafts` | YES | None |
| Очередь | `/queue` | YES | None |
| Контент-план | `/content-plan` | YES | None |
| Календарь | `/content-calendar` | YES | None |
| Визуалы | `/visuals` | YES | None |
| Аналитика | `/dashboard/networks/zodiac/analytics` | YES | None |
| Настройки | `/settings` | YES | None |

---

## STOP / GO Platform Matrix

| Action | Decision | Condition |
|---|---|---|
| Invite first 5 users | **GO** | Analytics baseline captured, feedback flow ready |
| Invite 20 users | **CONDITIONAL** | Only after first 5 feedback and no P0/P1 |
| Mass launch | **STOP** | Requires full readiness audit |
| Weekly live | **STOP** | Dry-run only |
| Payments / Stars | **STOP** | Not activated |
| Profile sync | **STOP** | Foundation only, disabled |
| Exact astro | **STOP** | No real provider connected |

---

## Package 58 Analytics Funnel Dashboard

Package 58 improves `/dashboard/networks/zodiac/analytics` for first-user
observation without changing Mini App product flows.

Added dashboard checks:

* overview cards for `Mini App opens`, `Feature opens`, `Results calculated`,
  `Save actions`, `Share actions`, and `Feedback opened`;
* top first-user sections: `Compatibility`, `Premium Natal`, `Birth Matrix`,
  `Tarot/Rune`, `Lunar/Ritual`, `Angel Numbers`, `VIP`, `Profile`;
* first-users funnel: `Open Mini App -> Open Feature -> Get Result ->
  Save/Share -> Feedback`;
* visible Redis/noop state as `Production analytics: Redis active` or
  `Production analytics: noop`;
* doc path references for baseline, execution, and batch template docs;
* QA assertion that configured Redis URL/token values are not rendered.

Bad signs after first 5 users:

* opens grow but feature opens do not;
* feature opens grow but result events do not;
* no save/share intent appears;
* feedback opens spike after low result completion;
* any raw personal input or Redis secret value appears.
