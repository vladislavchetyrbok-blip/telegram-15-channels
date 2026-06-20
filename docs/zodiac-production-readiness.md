# Zodiac Production Readiness Snapshot

Date: 2026-06-19
Repository: `vladislavchetyrbok-blip/telegram-15-channels`
Branch: `main`

This snapshot captures the current production-readiness state after the Zodiac Daily scheduler hardening, Mini App redesign, VIP functional core, channel packaging live rollout, content quality upgrade, interaction bugfixes, analytics readiness, and backup freshness refresh.

Package 37 adds Telegram WebApp `initData` server-validation readiness. Profile
sync, remote profile storage, payments, Telegram Stars, and weekly live remain
OFF.

Package 38 adds disabled-by-default Profile Sync API readiness. Remote profile
sync, frontend sync provider, and backend writes remain OFF.

Package 39 adds a disabled-by-default frontend Profile Sync client/hook scaffold.
It is not mounted in the Mini App, does not show a sync UI, and does not call
GET/POST/DELETE while sync flags are OFF. localStorage remains the source of
truth for Profile, History, Favorites, and saved readings.

Package 40 adds pure Profile Sync merge and retention-mapping helpers. They are
not wired to UI, do not fetch remote profiles, do not write to any backend, and
keep profile sync disabled by default.

Package 41 adds Profile Sync storage adapter readiness and env validation. The
default backend remains `none`, the test-memory adapter is check-only, production
Redis/Vercel KV/Supabase adapters are not wired, and profile sync reads/writes
remain OFF.

Package 42 adds a small disabled Profile Sync status block in `Мой профиль`.
It is display-only: no toggle, no mounted provider, and no remote sync network
calls while flags are OFF.

Package 43 adds stronger Profile Sync privacy stress checks and route hardening.
Malicious payloads with birth data, city, name, phone, raw questions,
intentions, feedback, result text, and initData are stripped or rejected without
echoing user input. Profile sync still remains OFF.

Package 44 adds the Real Astro Engine provider fixture harness and provider
decision docs. Exact mode remains `exact_unavailable`; fixtures are non-personal
placeholders and no external astro API calls are added.

Package 45 completes the full post-sync-foundation regression. The full local
suite passes, profile sync remains disabled/no-network, exact astro remains
unavailable, analytics storage remains `noop`, and the product is still limited
to controlled soft launch rather than mass launch.

Package 50 adds the controlled launch freeze checkpoint:
`docs/zodiac-controlled-launch-freeze.md`. The freeze decision is first 5 users
`GO`, 20 users `CONDITIONAL`, mass launch `STOP`, weekly live `STOP`,
payments/Stars `STOP`, profile sync `STOP`, exact astro claims `STOP`, and Redis
analytics activation `CONDITIONAL` with env.

Package 51 adds a new-chat context handoff snapshot:
`docs/zodiac-new-chat-handoff.md`.

Package 52 hides weak Sonnik/Dream Dictionary from the current soft-launch path
and keeps it as future backlog only. It also replaces Mini App date fields with
a mobile-friendly `ДД.ММ.ГГГГ` input, verifies `01012000 -> 01.01.2000`, and
removes personal test fixture values from smoke/docs.

Package 53 adds the full project audit and improvement roadmap:
`docs/zodiac-full-project-audit-and-roadmap.md`. It keeps controlled soft launch
as the only approved launch stage and keeps mass launch, weekly live,
payments/Stars, profile sync, and exact astro claims OFF.

## Current Status

The Zodiac product is ready for controlled live operation of the daily publishing lane and user-facing Mini App checks, with the following boundaries:

- Daily Zodiac publishing is active and ledger-protected.
- Weekly Zodiac posts are prepared and dry-run ready, but weekly live scheduling remains OFF.
- Mini App core UX is implemented: 10-category home, Angel Numbers top-level, Compatibility pair core, Horoscopes, Mystic, premium Birth Matrix, VIP, Profile, History, Favorites, and Share.
- Sonnik/Dream Dictionary is hidden/backlog for the current soft launch; Mystic continues through Card of the Day, Tarot/Rune, Lunar/Ritual, talismans, aura, karma, and Birth Matrix.
- Date input UX uses visible `ДД.ММ.ГГГГ` text fields with digit entry/paste normalization instead of native date controls in Mini App birth date, natal, matrix, ritual, and VIP date flows.
- VIP is free until `2026-09-17`; payments and Telegram Stars remain OFF.
- Mini App interaction hardening is implemented and smoke-verified: custom dark selects, safe share fallback, non-dead pair gates, inline VIP pair pickers, and symbolic Final AstroMap visuals for relationship/VIP tools.
- Channel packaging live was applied and post-live verified for `13/13` channels.
- Daily and weekly content quality was upgraded while keeping date/range headers and CTA buttons.
- Lunar/Ritual now has a richer symbolic flow with modes, 14-day visual calendar, ritual result sections, safe Save/Share, and localStorage privacy checks.
- Analytics is privacy-safe but storage mode is currently `noop` unless Redis REST env vars are configured.
- Production backup freshness is currently OK after backup `2026-06-19-01-06-53` and restore dry-run PASS.
- Soft-launch pack is ready for `5-20` first users through `docs/zodiac-soft-launch-runbook.md`.
- Soft-launch release candidate snapshot is available at `docs/zodiac-soft-launch-release-candidate.md`.
- Controlled launch freeze checkpoint is available at `docs/zodiac-controlled-launch-freeze.md`.
- New chat handoff snapshot is available at `docs/zodiac-new-chat-handoff.md`.
- Desktop visual QA harness is available at `docs/zodiac-desktop-qa-harness.md` and runs through `npm run zodiac:desktop:qa`; it accelerates local/staging UI checks but does not replace the real phone pass.
- Safe share loop is ready for controlled testing: generic share drafts, no raw personal inputs, no referral IDs, and aggregate-only share lifecycle analytics.
- Monetization readiness is documented in `docs/zodiac-monetization-readiness.md`; payments, Telegram Stars, and entitlement enforcement remain OFF.
- Frontend Profile Sync scaffold is available for a future controlled rollout,
  but sync remains disabled, unmounted, and localStorage-only.
- Profile Sync merge logic is available for future read-only rollout tests, but
  no provider is mounted and no remote reads/writes are active.
- Profile Sync storage readiness is available for a future backend rollout, but
  production profile reads/writes remain fail-closed and OFF.
- Profile shows that cross-device sync is currently disabled; History and
  Favorites remain local-only and smoke checks that no profile sync API calls
  happen while disabled.
- Profile Sync privacy stress tests pass: disabled/auth/backend-unavailable
  route paths do not read POST bodies, production route cannot use test-memory
  storage, and raw sensitive fields are stripped from sanitizer/merge/storage
  checks.
- Real Astro Engine fixture harness is available. It validates placeholder
  fixtures and confirms exact provider remains unavailable with no fake planets,
  houses, ascendant, or external API calls.
- Post-sync-foundation regression report is available at
  `docs/zodiac-post-sync-foundation-regression.md`; current controlled
  soft-launch readiness is `92%`.
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

Stability report:

```text
docs/zodiac-daily-autopilot-stability-report.md
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
- 2026-06-19 dry-run after publish shows `Already Sent 13`, `Duplicate Blocked 13`, Telegram API calls `0`, ledger writes `0`.
- 2026-06-20 pre-cron dry-run shows `Would Publish 13/13`, CTA rows `13/13 OK`, Telegram API calls `0`, ledger writes `0`.

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

Release candidate snapshot:

```text
docs/zodiac-soft-launch-release-candidate.md
```

Controlled execution pack:

```text
docs/zodiac-controlled-soft-launch-execution.md
docs/zodiac-soft-launch-batch-template.md
```

Controlled launch freeze:

```text
docs/zodiac-controlled-launch-freeze.md
```

New chat handoff snapshot:

```text
docs/zodiac-new-chat-handoff.md
```

Real phone evidence intake:

```text
docs/zodiac-real-phone-evidence-intake.md
docs/zodiac-real-phone-bug-report-template.md
```

Feedback intake and triage:

```text
docs/zodiac-soft-launch-feedback.md
docs/zodiac-bug-triage.md
```

Soft-launch state:

- Controlled first-user test: READY for `5-20` trusted testers.
- Public/mass launch: NOT READY until real phone Telegram WebView pass is completed and P0/P1 issues are `0`.
- Batch 1 should start with `5` Telegram-only users; expand toward `20` only if P0 = `0`, P1 = `0` or fixed, average rating is `>= 7`, share/save work, and no privacy leaks are reported.
- Real phone screenshots/videos should be collected through the evidence intake templates and must not be committed if they include personal data.
- Analytics: Redis env is still missing, so metrics remain `noop` unless hosting env is configured.
- In-app feedback CTA: READY in `Мой профиль` with `Оставить отзыв` / `Сообщить о баге`; comments stay transient and analytics uses only safe categorical payload.
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
- Future monetization must use disabled-by-default flags: `ZODIAC_PAYMENTS_ENABLED=false`, `ZODIAC_STARS_ENABLED=false`, `ZODIAC_VIP_ENTITLEMENTS_ENABLED=false`, and `ZODIAC_VIP_FREE_UNTIL=2026-09-17`.
- Candidate future paid surfaces are documented, but no current VIP tool is locked by payment or entitlement checks.
- 11 active VIP cards are functional tools with visible inputs, calculate/show action, non-empty result, safe Save, and safe Share.
- Pair-dependent VIP tools include inline sign/mode pickers and can calculate even when the user has not created a pair in the main compatibility wizard.
- Key VIP result screens render symbolic Final AstroMap visuals: Natal Chart, Extended Compatibility, Mental Map, Numerology, and VIP Mystic Day.
- Final AstroMap captions must stay honest: `Символическая карта энергий` and `Базовая визуализация без точных домов и асцендента`.
- Premium Natal Chart now has a structured premium result layout: hero summary, 12-sign symbolic visual map, highlighted sign/element, symbolic aspect lines, element/quality/polarity/leading-energy labels, 6 internal tabs, and one bottom Save/Share action area. It still does not claim exact houses, ascendant, planet degrees, or real aspects without a future astro engine.
- Package 35 adds a Real Astro Engine readiness layer. `lib/zodiac-astro-engine.ts` exposes typed `symbolic`, `exact_unavailable`, and future `exact_available` status; `lib/zodiac-astro-providers/symbolic-provider.ts` powers current symbolic mode; `lib/zodiac-astro-providers/exact-provider-placeholder.ts` returns `exact_unavailable` without fake planets, houses, ascendant, or degrees.
- Premium Natal Chart shows an engine status panel explaining that the exact engine is not connected yet and the current chart remains symbolic.
- `npm run zodiac:astro:check` must pass before soft launch and before any future exact-engine work.
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

Desktop visual QA harness:

```bash
npm run zodiac:desktop:qa
```

Artifacts:

```text
data/runtime/zodiac-desktop-qa/latest-report.json
data/runtime/zodiac-desktop-qa/<run>/screenshots/
```

This harness checks iPhone-like, Android-like, and desktop viewports through local CDP automation. It captures screenshots and verifies no horizontal overflow, visible native white selects, console/runtime/network errors, and raw sensitive localStorage/share leaks. It does not replace `docs/zodiac-real-phone-webview-checklist.md`.

Command:

```bash
npm run zodiac:miniapp:smoke
npm run zodiac:astro:check
```

Expected summary:

```text
Mini App Smoke: PASS
Browser mode: PASS
Telegram mock: PASS
Main menu categories checked: 10/10
Angel Numbers / Ангельские числа checked: YES
Compatibility result checked: YES
Date input UX checked: YES
Compatibility autosign cases: 01012000 -> 01.01.2000 -> Козерог, 2000-03-21 -> Овен, 2000-12-22 -> Козерог
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

Activation runbook:

```text
docs/zodiac-redis-analytics-activation.md
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
npm run zodiac:astro:check
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
5. Monetization implementation remains future work after `docs/zodiac-monetization-readiness.md`: entitlements, Telegram Stars/payments, legal/refund/support text, and giveaways rules.
6. Backup freshness automation for future release checkpoints.
7. Further Mini App refactor: split remaining stateful sections once product behavior stabilizes.

## Current Decision

The system is safe for continued daily autonomous publishing and controlled Mini App user testing.

Do not start manual live publishing unless dry-run and ledger checks prove it is required and safe. Do not enable weekly live or payments until they are approved as separate packages.

## Package 37: Telegram initData Auth Foundation

Status:

- Server-side Telegram WebApp `initData` validation foundation added.
- `initDataUnsafe` must not be treated as trusted identity.
- Raw `initData` must not be stored, logged, or sent to analytics.
- Profile sync remains OFF and not implemented.
- Remote profile storage remains not implemented.
- Payments/Stars remain OFF.
- Weekly live remains OFF.

New command:

```bash
npm run zodiac:telegram-auth:check
```

Profile sync flags remain documented as disabled:

```text
ZODIAC_PROFILE_SYNC_ENABLED=false
ZODIAC_PROFILE_SYNC_BACKEND=none
ZODIAC_PROFILE_SYNC_READ_ENABLED=false
ZODIAC_PROFILE_SYNC_WRITE_ENABLED=false
```

## Package 38: Profile Sync API Foundation

Status:

- Profile sync API route: READY but disabled.
- Route: `GET|POST|DELETE /api/zodiac/profile/sync`.
- Auth: requires Telegram `initData` validation.
- Safe sync schema: history/favorites summary only.
- Sanitizer strips unknown and sensitive fields.
- Backend storage: `none`.
- Backend writes: NO.
- Frontend sync provider: NO.
- Existing localStorage fallback: unchanged.
- Payments/Stars: OFF.
- Weekly live: OFF.

New command:

```bash
npm run zodiac:profile-sync:check
```

Readiness doc:

```text
docs/zodiac-profile-sync-readiness.md
```

## Package 39: Frontend Profile Sync Scaffold

Status:

- Frontend sync client scaffold: READY but disabled.
- Files: `components/zodiac-mini-app/profile-sync-client.ts` and
  `components/zodiac-mini-app/useProfileSync.ts`.
- Mounted in Mini App: NO.
- Visible sync UI status: NO.
- Auto-sync loop: NO.
- GET while disabled: NO.
- POST while disabled: NO.
- DELETE while disabled: NO.
- Outside Telegram or missing `window.Telegram.WebApp.initData`: no network
  calls.
- `initDataUnsafe`: not used.
- Raw `initData`: not stored, logged, or sent to analytics.
- Existing localStorage Profile/History/Favorites: unchanged.
- Backend writes: NO.
- Profile sync enabled: NO.
- Payments/Stars: OFF.
- Weekly live: OFF.

Client public flags remain disabled by default:

```text
NEXT_PUBLIC_ZODIAC_PROFILE_SYNC_ENABLED=false
NEXT_PUBLIC_ZODIAC_PROFILE_SYNC_READ_ENABLED=false
NEXT_PUBLIC_ZODIAC_PROFILE_SYNC_WRITE_ENABLED=false
```

Future rollout must start with a controlled read-only merge test. Write sync
requires a separate package, explicit storage backend decision, and real-phone
Telegram WebView validation.

## Package 40: Profile Sync Read-Only Merge Logic

Status:

- Pure merge helper: READY but disabled.
- Retention mapper helper: READY but disabled.
- Files: `lib/zodiac-profile-sync-merge.ts` and
  `lib/zodiac-profile-sync-retention-map.ts`.
- Mounted in Mini App: NO.
- Remote GET from UI: NO.
- Remote POST/DELETE from UI: NO.
- Backend writes: NO.
- localStorage fallback: unchanged.
- Merge behavior: sanitize-first, history append-only, favorites set-like,
  duplicate-safe, newest timestamp wins, newest-first sorting, max clamps, and
  malformed input fail-safe.
- Raw birth date/time/city/question/intention/feedback/result text: stripped.
- Raw `initData`: not stored, logged, or sent to analytics.
- Profile sync enabled: NO.
- Payments/Stars: OFF.
- Weekly live: OFF.

## Package 41: Profile Sync Storage Adapter Readiness

Status:

- Storage adapter contract: READY but disabled.
- Backend default: `none`.
- Storage status default: `disabled`.
- Test-memory adapter: check-only, explicit allow flag required.
- Production Redis REST / Vercel KV adapter: not wired.
- Production Supabase adapter: not wired.
- Required env validation: presence-only, no secret values printed.
- Mounted in Mini App: NO.
- Remote GET from UI: NO.
- Remote POST/DELETE from UI: NO.
- Backend writes: NO.
- localStorage fallback: unchanged.
- Sanitizer before save: enforced by the check-only memory adapter.
- Raw birth date/time/city/question/intention/feedback/result text: stripped.
- Raw `initData`: not stored, logged, or sent to analytics.
- Profile sync enabled: NO.
- Payments/Stars: OFF.
- Weekly live: OFF.

Future rollout:

1. Package 42: disabled status UI in Profile.
2. Package 43: privacy stress tests and route hardening.
3. Package 44: real astro engine provider fixture harness.
4. Package 45: full safety regression after sync/astro foundations.

## Package 42: Profile Sync Status UI

Status:

- Profile status UI: READY, disabled/no-network.
- Text: `Синхронизация между устройствами: выключена`.
- Mounted `ProfileSyncProvider`: NO.
- Sync toggle/button: NO.
- Remote GET/POST/DELETE from UI: NO.
- Smoke guard for `/api/zodiac/profile/sync`: YES.
- localStorage fallback: unchanged.
- Profile sync enabled: NO.
- Backend writes: NO.
- Payments/Stars: OFF.
- Weekly live: OFF.

## Package 43: Profile Sync Privacy Stress Tests

Status:

- Malicious payload checks: READY.
- Additional raw values covered: birth date, birth time, city, name, phone, raw
  question, raw intention, raw feedback, raw result text, raw initData.
- Sanitizer strips malicious fragments from labels/summaries: YES.
- Merge reintroduces stripped fields: NO.
- Check-only memory storage sanitizes before save: YES.
- Disabled POST reads body: NO.
- Invalid auth reads body: NO.
- Backend unavailable reads body: NO.
- Runtime route can use `test_memory`: NO.
- Route responses echo raw submitted payload: NO.
- Profile sync enabled: NO.
- Backend writes: NO.
- Payments/Stars: OFF.
- Weekly live: OFF.

## Package 44: Real Astro Engine Fixture Harness

Status:

- Fixture directory: `data/fixtures/zodiac-astro-engine/`.
- Fixture command: `npm run zodiac:astro:fixtures:check`.
- Fixture data: non-personal placeholders only.
- Exact provider enabled: NO.
- Exact mode: `exact_unavailable`.
- Fake planet degrees: NO.
- Fake houses: NO.
- Fake ascendant: NO.
- External astro API calls: NO.
- Birth data sent remotely: NO.
- Current Premium Natal UI mode: symbolic.
- Payments/Stars: OFF.
- Weekly live: OFF.

## Package 45: Post Sync Foundation Regression

Status:

- Regression report: `docs/zodiac-post-sync-foundation-regression.md`.
- Full local suite: PASS.
- Product readiness for controlled soft launch: `92%`.
- Controlled `5-20` tester invite: YES, with real-phone Telegram WebView sanity
  pass as the next practical gate.
- Mass launch: NO.
- Profile sync enabled: NO.
- Profile sync provider mounted: NO.
- Profile sync API calls while disabled: `0`.
- Backend profile writes: NO.
- localStorage fallback: preserved.
- Exact astro mode: `exact_unavailable`.
- Fake planets/houses/ascendant: NO.
- Redis analytics: `noop`; Redis env missing.
- Daily dry-run for `2026-06-20`: Would Publish `13/13`, CTA rows `13/13 OK`,
  Telegram API calls `0`, ledger writes `0`.
- Weekly live: OFF.
- Payments/Stars: OFF.


## Analytics Navigation & Dashboard QA Update

* **Direct Analytics Route**: `/dashboard/networks/zodiac/analytics`
* **Dashboard Navigation Behavior**: The overview page provides clear status indicators, quick action buttons, and operational safety cards. A prominent CTA links directly to the Analytics page. The sidebar also contains an `Аналитика` link pointing to the analytics route.
* **Where to check analytics**: Navigate to the Overview page and use the 'Открыть аналитику' CTA, or use the sidebar link.
* **Current Redis / noop state**: Displayed as a status badge on the Overview page. If Redis is missing env variables, a warning is prominently displayed.
* **Soft launch dashboard checklist**: Review the 'Рекомендованные шаги' card on the Overview page for instructions.
* **Platform Map**: `docs/zodiac-telegram-platform-map.md`
* **UX Audit**: `docs/zodiac-telegram-platform-ux-audit.md`

## Analytics Baseline & First Users Observation

* Redis analytics is active in production.
* Do not reset counters before first users unless explicitly approved.
* Package 55 test events are baseline noise.
* First 5 users must be observed through analytics + feedback.
