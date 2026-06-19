# Zodiac Production Readiness Snapshot

Date: 2026-06-19
Repository: `vladislavchetyrbok-blip/telegram-15-channels`
Branch: `main`

This snapshot captures the current production-readiness state after the Zodiac Daily scheduler hardening, Mini App redesign, VIP functional core, channel packaging live rollout, content quality upgrade, interaction bugfixes, analytics readiness, and backup freshness refresh.

## Current Status

The Zodiac product is ready for controlled live operation of the daily publishing lane and user-facing Mini App checks, with the following boundaries:

- Daily Zodiac publishing is active and ledger-protected.
- Weekly Zodiac posts are prepared and dry-run ready, but weekly live scheduling remains OFF.
- Mini App core UX is implemented: 10-category home, Angel Numbers top-level, Compatibility pair core, Horoscopes, Mystic, premium Birth Matrix, VIP, Profile, History, Favorites, and Share.
- VIP is free until `2026-09-17`; payments and Telegram Stars remain OFF.
- Mini App interaction hardening is implemented and smoke-verified: custom dark selects, safe share fallback, non-dead pair gates, inline VIP pair pickers, and symbolic Final AstroMap visuals for relationship/VIP tools.
- Channel packaging live was applied and post-live verified for `13/13` channels.
- Daily and weekly content quality was upgraded while keeping date/range headers and CTA buttons.
- Lunar/Ritual now has a richer symbolic flow with modes, 14-day visual calendar, ritual result sections, safe Save/Share, and localStorage privacy checks.
- Analytics is privacy-safe but storage mode is currently `noop` unless Redis REST env vars are configured.
- Production backup freshness is currently OK after backup `2026-06-19-01-06-53` and restore dry-run PASS.
- Soft-launch pack is ready for `5-20` first users through `docs/zodiac-soft-launch-runbook.md`.
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
faad69e feat: polish zodiac channel packaging
1dfeef0 feat: complete zodiac vip functional tools
1de7b6e fix: verify zodiac vip functional tools
556b48b feat: improve zodiac daily and weekly content quality
3798167 fix: repair mini app interactions and chart visuals
ef2a970 fix: repair mini app interactions and chart visuals
bd68e02 docs: add zodiac final production audit
```

## Daily Autopublish

Workflow:

```text
.github/workflows/zodiac-scheduler.yml
Workflow name: Zodiac Daily Publisher
```

Scheduled attempts:

```text
7 6 * * *
19 6 * * *
37 6 * * *
52 6 * * *
11 7 * * *
```

Policy:

- GitHub Actions cron is UTC-only and can be delayed.
- Staggered attempts avoid common `:00` / `:30` GitHub Actions congestion minutes.
- Current UTC window: `06:07`, `06:19`, `06:37`, `06:52`, and `07:11`.
- During Kyiv summer time this maps to roughly `09:07`, `09:19`, `09:37`, `09:52`, and `10:11 Kyiv`.
- Scheduled runs use live mode.
- Duplicate safety is provided by durable ledger and publish-date dedupe before Telegram API calls.
- Target date is calculated using the Europe/Kyiv calendar policy.
- 2026-06-19 autopublish completed successfully (`13/13 sent`) but arrived late, around `13:36 Kyiv` start with ledger entries at `13:46-13:47 Kyiv`; this timing hardening shifts future attempts away from the most congested minute marks.

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

Package 28 weekly live readiness audit:

```text
docs/zodiac-weekly-live-readiness-audit.md
```

Result: weekly dry-run is ready, weekly live remains OFF, and enabling weekly live now is `NO`.

Weekly live publishing should be enabled only after several stable daily publishing days, a completed real-phone Telegram WebView pass, two consecutive weekly dry-run passes, confirmed weekly duplicate-block behavior, and a separate explicit GO decision. The first weekly live run should be controlled/manual, not cron.

## Soft Launch

Soft-launch runbook:

```text
docs/zodiac-soft-launch-runbook.md
```

Soft-launch state:

- Controlled first-user test: READY for `5-20` trusted testers.
- Public/mass launch: NOT READY until real phone Telegram WebView pass is completed and P0/P1 issues are `0`.
- Analytics: Redis env is still missing, so metrics remain `noop` unless hosting env is configured.
- Weekly live: OFF and not ready to enable.
- Payments/Stars: OFF.

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
- Final AstroMap visuals are symbolic energy maps. They must not claim exact houses, ascendant, or ephemeris-level calculation unless a future package adds a real astronomical engine and required inputs.

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
- Pair-dependent VIP tools include inline sign/mode pickers and can calculate even when the user has not created a pair in the main compatibility wizard.
- Key VIP result screens render symbolic Final AstroMap visuals: Natal Chart, Extended Compatibility, Mental Map, Numerology, and VIP Mystic Day.
- Final AstroMap captions must stay honest: `Символическая карта энергий` and `Базовая визуализация без точных домов и асцендента`.
- Premium Natal Chart now has a structured premium result layout: hero summary, 12-sign symbolic visual map, highlighted sign/element, symbolic aspect lines, element/quality/polarity/leading-energy labels, 6 internal tabs, and one bottom Save/Share action area. It still does not claim exact houses, ascendant, planet degrees, or real aspects without a future astro engine.
- `lib/zodiac-astro-engine.ts` exposes the current `symbolic` / `exact_unavailable` status so a future exact engine can be added without changing the UI contract.
- VIP message helper supports copy state without storing message text.
- Giveaways remain locked/preview.

Mystic:

- Mystic category opens and renders content.
- Tarot and Runes now have richer symbolic flows: topic/mode selection, optional unsaved question input, deterministic safe spread generation, visual Tarot/Rune components, structured result sections, safe Save/Share, and smoke coverage for visual cards/runes plus localStorage privacy.
- Lunar/Ritual now has modes (`Лунный день`, `Ритуал дня`, `Любовный ритуал`, `Деньги / работа`, `Очищение`, `Сон / интуиция`), date selection (`Сегодня`, `Завтра`, custom date), optional unsaved intention, a 14-day `LunarCalendarVisual`, structured sections (`Энергия дня`, `Что делать`, `Что не делать`, `Ритуал`, `Чек-лист`, `Действие сегодня`, `Вечерний итог`), and safe Save/Share.
- Lunar/Ritual is explicitly a symbolic lunar interpretation. It must not claim exact astronomical phase, medical/financial/love guarantees, or ephemeris-level precision until a future real lunar engine is added.
- Tarot, Runes, Daily Card, Lunar Ritual, Aura, Talismans, and related features are covered by smoke checks.

Birth Matrix:

- Opens from the Mini App.
- Accepts a sample birth date in smoke.
- Renders a premium symbolic result with hero summary, visual matrix, central number, legend, 6 sections, recommendations, and safe Save/Share.
- Stores only safe shortcut fields in localStorage: feature key, matrix type, archetype key, central number, label, and timestamp. Raw birth date/name/result text are not retained.

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

Real phone status:

- Browser smoke and Telegram mock are PASS.
- Real physical-phone Telegram WebView pass is still manual-required and must not be claimed from browser/mock checks.
- Manual checklist: `docs/zodiac-real-phone-webview-checklist.md`.

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
VIP chart visuals checked: 5/5
VIP Natal autosign checked: YES
VIP Premium Natal Chart checked: YES
Final Astro Maps checked: 6
Karta+ pair gate checked: YES
30 days pair gate checked: YES
Dead CTA checked: YES
VIP message copy checked: YES
Giveaways locked: YES
Mystic checked: YES
Lunar ritual checked: YES
Lunar calendar visual checked: YES
Lunar calendar legend checked: YES
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

Production activation checklist:

1. Use a Redis REST URL/token pair, not a raw `redis://` TCP URL.
2. Add both env vars only in hosting/deployment settings; never commit `.env`, `.env.local`, or token values.
3. Redeploy so the server runtime receives both variables.
4. Run `npm run zodiac:analytics:storage:check` and confirm mode `redis`.
5. Open `/dashboard/networks/zodiac/analytics`.
6. Trigger a safe Mini App action such as a category open, sign selection, save, or share.
7. Refresh the dashboard and confirm aggregate counters move.
8. Confirm no names, birth dates, birth times, cities, raw questions, raw intentions, raw result text, generated messages, Telegram initData, tokens, or raw angel-number inputs appear in logs, API responses, dashboard, or storage.

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

## Backup / Restore Readiness

Latest confirmed backup:

```text
data/backups/2026-06-19-01-06-53
```

Status:

- Backup manifest exists.
- Runtime files copied: `35`.
- Telegram posts/assets manifest entries: `165`.
- Secret policy confirmed: `.env.local`, database URL, and Telegram token were not copied.
- Restore dry-run: PASS.
- Restore dry-run changed files: `0`.
- Restore dry-run wrote database records: NO.
- `production:safety:check`: OK after refresh.

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

1. Watch the next daily runs after the cron-minute shift and confirm they arrive closer to the intended Kyiv morning window.
2. Redis analytics storage configuration for real retention metrics.
3. Real human-device Telegram WebView pass after the latest select/share/CTA/chart fixes.
4. Weekly live scheduling decision after daily stability is proven.
5. Monetization plan after audience and analytics validate demand: entitlement model, Telegram Stars/payments, legal text, giveaways rules.
6. Backup freshness automation for future release checkpoints.
7. Further Mini App refactor: split remaining stateful sections once product behavior stabilizes.

## Current Decision

The system is safe for continued daily autonomous publishing and controlled Mini App user testing.

Do not start manual live publishing unless dry-run and ledger checks prove it is required and safe. Do not enable weekly live or payments until they are approved as separate packages.
