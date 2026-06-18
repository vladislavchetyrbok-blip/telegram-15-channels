# Zodiac Production Readiness Snapshot

Date: 2026-06-18
Repository: `vladislavchetyrbok-blip/telegram-15-channels`
Branch: `main`

This snapshot captures the current production-readiness state after the Zodiac Daily scheduler hardening, Mini App redesign, VIP/Mystic polish, retention UX, analytics readiness, and Mini App smoke coverage.

## Current Status

The Zodiac product is ready for controlled live operation of the daily publishing lane and user-facing Mini App checks, with the following boundaries:

- Daily Zodiac publishing is active and ledger-protected.
- Weekly Zodiac posts are prepared and dry-run ready, but weekly live scheduling remains OFF.
- Mini App core UX is implemented: 10-category home, Angel Numbers top-level, Compatibility pair core, Horoscopes, Mystic, Birth Matrix, VIP, Profile, History, Favorites, and Share.
- VIP is free until `2026-09-17`; payments and Telegram Stars remain OFF.
- Analytics is privacy-safe but storage mode is currently `noop` unless Redis REST env vars are configured.
- Manual live publish remains forbidden unless a dry-run and ledger audit prove it is safe.

## Key Recent Commits

```text
49b01c6 feat: add zodiac daily workflow monitor
034bea3 feat: add telegram webapp integration
7541c78 refactor: split zodiac mini app foundations
f916a90 refactor: split zodiac mini app ui sections
605605e feat: add date ranges to zodiac weekly posts
611dd51 feat: add zodiac mini app smoke test
014ced0 feat: add zodiac analytics storage readiness check
74f17cd feat: polish zodiac retention cta
5ce933e feat: redesign zodiac mini app main menu
d943df9 feat: improve zodiac mini app main categories
f36b683 feat: complete zodiac mini app profile retention
485fa5e feat: complete package 10C final Mini App UX polish
b3cd52b docs: align mini app smoke category order
62e0d49 docs: align analytics mini app menu order
```

## Daily Autopublish

Workflow:

```text
.github/workflows/zodiac-scheduler.yml
Workflow name: Zodiac Daily Publisher
```

Scheduled attempts:

```text
0 6 * * *
30 6 * * *
0 7 * * *
30 7 * * *
0 8 * * *
```

Policy:

- GitHub Actions cron is UTC-only and can be delayed.
- Primary window: `06:00/06:30 UTC`.
- Backup window: `07:00/07:30/08:00 UTC`.
- Scheduled runs use live mode.
- Duplicate safety is provided by durable ledger and publish-date dedupe before Telegram API calls.
- Target date is calculated using the Europe/Kyiv calendar policy.

Required safe check:

```bash
npm run zodiac:workflow:check -- --date YYYY-MM-DD
npm run zodiac:publish-date:dry -- --date YYYY-MM-DD
npm run zodiac:ledger:check
```

Manual live is allowed only if dry-run shows publishable posts and no sent ledger entries for the target date. If dry-run shows `Already Sent 13` or `Duplicate Blocked 13`, manual live is forbidden.

## Daily Post Format

Daily posts now include the target date in the first line from the explicit publish target date, not from system wall clock.

Examples:

```html
<b>✨ Общий гороскоп на 19.06.2026</b>
<b>♈️ Овен | Гороскоп на 19.06.2026</b>
```

Daily post CTA is retention-oriented and links users into the Mini App / compatibility flow.

## Weekly Lane

Weekly lane state:

- Assets: expected `91/91`.
- Weekly dry-run is ready.
- Weekly posts include a date range in the first line.
- Weekly live schedule remains OFF.

Example:

```html
<b>✨ Общий гороскоп на неделю 15.06–21.06.2026</b>
<b>♈ Овен | Гороскоп на неделю 15.06–21.06.2026</b>
```

Required safe checks:

```bash
npm run zodiac:weekly-assets:validate
npm run zodiac:weekly:dry -- --week YYYY-Www
npm run zodiac:weekly:ledger:check
```

Weekly live publishing should be enabled only after several stable daily publishing days and a separate GO decision.

## Mini App UX

Route:

```text
/compatibility
```

Primary product structure:

```text
Home -> Category -> Feature -> Result
```

Compatibility product structure:

```text
Compatibility -> Pair Setup -> Relationship Map -> 30-Day Couple Calendar -> Actions / Messages / Save / Share
```

Home menu has exactly 10 large top-level categories in this order:

1. `Гороскопы`
2. `Совместимость`
3. `Ангельские числа`
4. `Матрица судьбы`
5. `Нумерология`
6. `Мистика`
7. `Таро и руны`
8. `Луна и ритуалы`
9. `VIP раздел`
10. `Мой профиль`

Important UX rules:

- Angel Numbers must be visible in the first screen zone and must be directly reachable.
- Giveaways must not be a top-level category; they remain locked/preview inside VIP.
- Bottom navigation: `Главная`, `Гороскопы`, `Совмест.`, `VIP`, `Профиль`.
- Profile, History, and Favorites use localStorage only.
- Share text must be generic and must not include personal data.

Supported `startapp` params:

```text
compat
compat_love
compat_reconciliation
compat_gemini
mystic
vip
birth_matrix
angel_numbers
week
profile
history
favorites
```

## VIP / Mystic / Birth Matrix

VIP:

- Free access until `2026-09-17`.
- Payments and Telegram Stars are OFF.
- 11 active VIP cards are functional tools with visible inputs, calculate/show action, non-empty result, safe Save, and safe Share.
- VIP message helper supports copy state without storing message text.
- Giveaways remain locked/preview.

Mystic:

- Mystic category opens and renders content.
- Tarot, Runes, Daily Card, Lunar Ritual, Aura, Talismans, and related features are covered by smoke checks.

Birth Matrix:

- Opens from the Mini App.
- Accepts a sample birth date in smoke.
- Renders a non-empty result.

Angel Numbers:

- Top-level category.
- Direct start param: `startapp=angel_numbers`.
- Quick numbers such as `11:11`, `22:22`, `15:15`, `12:12`, and `02:22` are expected to work.

## Telegram WebApp Integration

Implemented capabilities:

- `ready()` / `expand()`
- BackButton show/hide/onClick/offClick
- haptics
- theme / safe-area handling
- browser fallback when `window.Telegram` is absent

Navigation policy:

- detail screen -> category
- category -> home
- home -> BackButton hidden

## Mini App Regression Smoke

Command:

```bash
npm run zodiac:miniapp:smoke
```

Expected summary:

```text
Mini App Smoke: PASS
Browser mode: PASS
Telegram mock: PASS
Main menu categories checked: 10/10
Angel Numbers / Ангельские числа checked: YES
Compatibility result checked: YES
Compatibility autosign cases: 1998-06-15 -> Близнецы, 2000-03-21 -> Овен, 2000-12-22 -> Козерог
Compatibility 30-day calendar checked: YES
Compatibility action today checked: YES
Compatibility messages checked: YES
Compatibility pair saved/reopened: YES
Compatibility share checked: YES
VIP cards checked: 11/11
VIP tools calculated: 11/11
VIP save/share checked: 11/11 saved, 11/11 shared
VIP message copy checked: YES
Giveaways locked: YES
Mystic checked: YES
Birth Matrix / Матрица судьбы checked: YES
Profile checked: YES
History empty state checked: YES
Favorites empty state checked: YES
Favorite saved/opened: YES
Share checked: YES
Console errors: 0
Runtime errors: 0
HTTP/network errors: 0
```

Smoke must never run live publish, never change ledgers, and never enable weekly live scheduling.

Package 12 UX markers: the compatibility result should render as `Карта отношений` with score, quick metrics, `Главный совет`, readable sections, the 30-day mobile feed, `Скопировано` after copying a message, and `Пара сохранена` after saving the pair.

## Analytics / Privacy

Commands:

```bash
npm run zodiac:analytics:check
npm run zodiac:analytics:storage:check
```

Current storage mode:

```text
noop unless Redis REST env vars are configured
```

Required env names for real analytics storage:

```text
ZODIAC_ANALYTICS_REDIS_URL
ZODIAC_ANALYTICS_REDIS_TOKEN
```

Privacy rules:

- No names.
- No birth dates.
- No birth times.
- No city query or selected city id.
- No raw message, dream, angel number, or personal text input.
- No Telegram initData.
- No tokens, chat ids, or secrets.

Allowed analytics are aggregate-safe counters and safe categorical fields such as sign slug, section, category, featureKey, mode, score tier, and flags.

Compatibility retention is local-only and stores only safe pair summaries: first sign, second sign, relationship mode, score tier, label, feature key, and timestamp. It must not store names, birth dates, birth times, city query, selected city id, raw result text, or raw message text.

## Operations Checklist

Before declaring a release/checkpoint ready:

```bash
npm run lint
npm run build
npm run zodiac:workflow:check -- --date YYYY-MM-DD
npm run zodiac:publish-date:dry -- --date YYYY-MM-DD
npm run zodiac:weekly-assets:validate
npm run zodiac:weekly:dry -- --week YYYY-Www
npm run zodiac:weekly:ledger:check
npm run zodiac:miniapp:smoke
npm run zodiac:analytics:check
npm run zodiac:analytics:storage:check
npm run zodiac:ledger:check
npm run production:safety:check
git diff --check
```

## Known Gaps / Next Work

P1/P2 gaps that remain:

1. Real human-device Telegram WebView pass on a physical phone.
2. Redis analytics storage configuration for real retention metrics.
3. Weekly live scheduling decision after daily stability is proven.
4. Channel descriptions / pinned navigation are dry-run ready with Mini App startapp links; live pin/description apply still needs explicit approval.
5. Content quality improvement: less template feel, stronger first lines, more daily variation.
6. Further Mini App refactor: split remaining stateful sections once product behavior stabilizes.
7. Monetization plan after audience and analytics validate demand: entitlement model, Telegram Stars/payments, legal text, giveaways rules.
8. Backup freshness automation if `production:safety:check` reports stale backups.

## Current Decision

The system is safe for continued daily autonomous publishing and controlled Mini App user testing.

Do not start manual live publishing unless dry-run and ledger checks prove it is required and safe. Do not enable weekly live or payments until they are approved as separate packages.
