# Zodiac Full Project Audit And Roadmap

Date: 2026-06-20
Package: 53, updated through Package 64
Audit base HEAD: `98b28a322b16d8bb3e91f4422cfea9f7caeb8d54`
Branch: `main`
Scope: full-product audit, analytics review, quality review, and improvement roadmap.

This document is documentation-only. It does not authorize live publish, weekly
live, payments, Telegram Stars, profile sync, exact astrology claims, manual
ledger edits, scheduler timing changes, or storage of raw personal inputs.

## Executive Summary

```text
Controlled soft launch readiness: YES, about 92/100
Mass launch readiness: NO, about 70/100
Commercial readiness: NO, about 55/100
P0 count: 0
P1 count: 0
P2 count: 11
Main blockers: real Telegram phone evidence,
first-user feedback loop, profile sync still disabled, exact astro provider
unavailable, weekly live still gated, payments/Stars still gated.
```

The project is strong enough for a small trusted soft launch. The Mini App now
opens to the main/home path by default, clears stale Mystic state on fresh open,
keeps Sonnik hidden/backlog, and preserves explicit deep links such as
`startapp=mystic`, `startapp=birth_matrix`, `startapp=vip`,
`startapp=angel_numbers`, `startapp=profile`, `startapp=history`, and
`startapp=favorites`.

The product is not ready for mass public launch or monetization. The remaining
work is mostly operational and evidence-driven: real Telegram phone checks,
persistent privacy-safe analytics review, daily stability observation, first-user
feedback, and then carefully staged profile sync, weekly publishing, exact astro,
and payments packages.

## Baseline Evidence

Package 53 started after Package 52 was pushed. Repository state at baseline:

```text
Current branch: main
Current HEAD: 98b28a322b16d8bb3e91f4422cfea9f7caeb8d54
Latest Package 52 commit: 98b28a3 fix: reset stale mystic mini app launch state
Working tree at baseline: clean
Working tree during audit: docs-only change after fixing a NUL-byte doc tail
```

Baseline checks before the master doc:

| Check | Result |
| --- | --- |
| `npm run lint` | PASS |
| `npm run build` | PASS |
| `npm run zodiac:miniapp:smoke` | PASS |
| `npm run zodiac:desktop:qa` | PASS |
| `npm run zodiac:astro:check` | PASS |
| `npm run zodiac:astro:fixtures:check` | PASS |
| `npm run zodiac:ledger:safety:check` | PASS |
| `npm run zodiac:telegram-auth:check` | PASS |
| `npm run zodiac:profile-sync:check` | PASS |
| `npm run zodiac:analytics:check` | PASS |
| `npm run zodiac:analytics:storage:check` | PASS with expected `noop` warning |
| `npm run zodiac:workflow:check -- --date 2026-06-20` | PASS with expected warning status |
| `npm run zodiac:publish-date:dry -- --date 2026-06-20` | PASS, 0 Telegram API calls, 0 ledger writes |
| `npm run production:safety:check` | PASS |
| `git diff --check` | PASS |

Desktop QA evidence:

```text
Latest report: data/runtime/zodiac-desktop-qa/latest-report.json
Run dir: data/runtime/zodiac-desktop-qa/2026-06-19-23-34
Viewports: 390x844, 412x915, 1440x900
Status: PASS
Console errors: 0
Runtime errors: 0
HTTP/network errors: 0
Manual limitation: real Telegram phone pass still required
Manual limitation: real phone keyboard overlay still required
```

## Status Matrix

| Area | Status | Score | Risk | Next action |
| --- | --- | ---: | --- | --- |
| Product UX | GO for first 5 users | 92 | Real phone evidence still manual | Run real Telegram phone checklist |
| Horoscopes | PASS | 86 | Content can feel text-heavy | Add richer daily/week presentation later |
| Compatibility | PASS | 92 | Long result and dense flows | Keep testing drop-off and pair reopen |
| Angel Numbers | PASS | 84 | Share policy needs final product decision | Keep direct deep link tested; decide share target later |
| Birth Matrix | PASS | 90 | Symbolic framing must stay honest | Keep exact-data restrictions and safe share |
| Numerology | PASS | 82 | Depth is uneven across free/VIP paths | Improve explanations after launch feedback |
| Mystic | PASS without Sonnik | 84 | Sonnik hidden due quality | Keep Sonnik backlog until rebuilt |
| Tarot / Rune | PASS | 86 | Questions are intentionally not stored | Add spread-library polish later |
| Moon / Ritual | PASS | 86 | Symbolic lunar, not exact ephemeris | Keep honesty badge and improve date UX later |
| VIP 11/11 | PASS | 88 | Payments and entitlements are OFF | Keep free promo and locked giveaways |
| Profile / History / Favorites | PASS local-only | 84 | Cross-device state absent | Profile sync read-only test mode later |
| Feedback | PASS local draft | 78 | No backend feedback loop yet | Add privacy-safe intake after first testers |
| Safe share | PASS | 88 | Fallback copy state can feel stale after navigation | Consider reset/polish package |
| Analytics | Redis active in production | 88 | Local/dev may remain `noop` without env | Watch first-users funnel |
| Profile sync | OFF by design | 70 | Remote state not proven in production | Read-only test mode after storage/auth gates |
| Telegram auth | READY foundation | 90 | Needs production identity policy before sync | Keep validating `initData`, never store raw value |
| Real Astro Engine | Symbolic only | 62 | Exact provider unavailable | Provider research and fixture package |
| Scheduler | Daily ready | 90 | Weekly live still OFF | Observe daily stability, then weekly dry-run plan |
| Weekly | OFF | 55 | Live cadence not proven | Controlled first-run plan only |
| Payments/Stars | OFF | 50 | No entitlement/support/refund flow | Test-mode monetization package later |
| Real phone | Manual gate | 68 | Desktop cannot prove WebView keyboard/safe-area | Complete evidence checklist |
| Docs | PASS after small hygiene fix | 88 | Some package history is long/noisy | Keep master audit linked |
| Tests | Strong | 94 | Real-device and live-user gaps remain | Keep smoke/desktop strict; add real evidence |

## 10 Category Product Audit

| Category | Opens | Input UX | Result depth | Visual quality | Trust/honesty | Save/share | History/favorites | Privacy | Mobile layout |
| --- | --- | ---: | ---: | ---: | ---: | --- | --- | --- | --- |
| Horoscopes | YES | 8 | 7 | 8 | 9 | PASS | PASS | PASS | PASS |
| Compatibility / Relationship Map | YES | 9 | 9 | 9 | 9 | PASS | PASS | PASS | PASS |
| Angel Numbers | YES | 8 | 7 | 8 | 9 | PASS | PASS | PASS | PASS |
| Birth Matrix | YES | 9 | 9 | 9 | 9 | PASS | PASS | PASS | PASS |
| Numerology | YES | 8 | 8 | 8 | 9 | PASS | PASS | PASS | PASS |
| Mystic | YES | 8 | 7 | 8 | 9 | PASS | PASS | PASS | PASS |
| Tarot / Rune | YES | 8 | 8 | 9 | 9 | PASS | PASS | PASS | PASS |
| Moon / Ritual | YES | 8 | 8 | 9 | 9 | PASS | PASS | PASS | PASS |
| VIP 11/11 | YES | 8 | 9 | 9 | 8 | PASS | PASS | PASS | PASS |
| Profile / History / Favorites / Feedback | YES | 8 | 7 | 8 | 10 | PASS/N/A | PASS | PASS | PASS |

### Horoscopes

Strong spots:
- Clear home and forecast grouping.
- Today/week/lucky/lunar/talisman paths are covered by smoke and desktop QA.
- Dates use the mobile-friendly `DD.MM.YYYY` normalization pattern where needed.

Weak spots:
- Some results are still more text-led than interactive.
- Weekly live remains OFF, so the weekly product is not yet operationally proven
  as a live publishing loop.

Improvement ideas:
- Add richer daily/week visual summaries after first-user feedback.
- Use analytics to find which forecast cards users actually reopen.

### Compatibility / Relationship Map

Strong spots:
- Best current product core.
- Pair inputs, autosign normalization, result, relationship map, calendar,
  save, favorite reopen, history reopen, share, and profile retention pass.
- Package 52 default-open regression is covered: fresh app open is home/main,
  stale Mystic state is cleared, `startapp=compat` opens home, BackButton does
  not return to stale Mystic.

Weak spots:
- Long scroll and multiple modes may overwhelm brand-new testers.

Improvement ideas:
- Track drop-off from input to result after Redis analytics is enabled.
- Add clearer mode comparison only after live usage data exists.

### Angel Numbers

Strong spots:
- Top-level menu entry opens the correct Forecasts feature.
- `startapp=angel_numbers` deep link works and is not routed through Mystic.
- Raw number input is not stored or sent; safe preset/pattern fields are used.

Weak spots:
- Current safe share behavior routes to `startapp=compat` by smoke contract,
  while the direct deep link exists. This is not a Mystic bug, but it is a
  product decision to revisit.

Improvement ideas:
- Decide whether Angel share should remain home-safe or use
  `startapp=angel_numbers`.
- Add more explanation around preset groups after analytics shows demand.

### Birth Matrix

Strong spots:
- `startapp=birth_matrix` opens the Birth Matrix feature directly.
- Date normalization works for `01012000 -> 01.01.2000`.
- Result depth, visual matrix, central number, legend, six tabs, save/share,
  and local retention privacy pass.

Weak spots:
- The feature is powerful but dense.
- A desktop QA screenshot can show a previous share fallback draft after
  navigation, even though the Birth Matrix share assertion itself passes with
  `startapp=birth_matrix`.

Improvement ideas:
- Reset or scope visible fallback share copy by feature in a polish package.
- Add a short explanatory layer for first-time users.

### Numerology

Strong spots:
- Numerology is represented in profile/VIP paths and uses the safe shortcut
  model for retention.
- No raw names, dates, cities, or result text are stored.

Weak spots:
- The feature feels less independently framed than Compatibility, Birth Matrix,
  and VIP.

Improvement ideas:
- Improve the free numerology explanation after early usage data.
- Keep any name-related input screen-only until profile sync policy is finished.

### Mystic

Strong spots:
- Mystic opens only from explicit Mystic navigation or deep link.
- Card, Tarot/Rune, Lunar/Ritual, talisman/aura/karma style paths remain active.
- Sonnik/Dream Dictionary is hidden/backlog.

Weak spots:
- Some symbolic features are lighter than the flagship Compatibility and Birth
  Matrix flows.

Improvement ideas:
- Rebuild Sonnik only as a future quality package.
- Use analytics to rank which Mystic tools deserve depth first.

### Tarot / Rune

Strong spots:
- Structured spread visuals render.
- Question text is not stored or sent.
- Safe share excludes raw question text and uses generic Mystic deep link.

Weak spots:
- Repeated use may need more spread variety.

Improvement ideas:
- Add a spread library only after retention/share data proves demand.
- Keep privacy restrictions on question text unchanged.

### Moon / Ritual

Strong spots:
- Ritual mode, intention entry, symbolic lunar calendar, legend, save/share, and
  privacy checks pass.
- Intention text is not stored or sent.

Weak spots:
- Lunar logic is symbolic and must not be presented as exact ephemeris.

Improvement ideas:
- Add exact lunar calculations only through the Real Astro Engine path.
- Improve real-phone keyboard checks for textarea flows.

### VIP 11/11

Strong spots:
- All 11 VIP tools calculate.
- VIP is clearly free during early access until `2026-09-17`.
- Giveaways are locked/preview intentionally.
- Payments, Stars, and entitlement enforcement are OFF.

Weak spots:
- Commercial readiness is low because there is no payment, entitlement, refund,
  support, or legal flow yet.

Improvement ideas:
- Add a test-mode entitlement plan before enabling any real payment surface.
- Use analytics to find which VIP tools deserve paid packaging.

### Profile / History / Favorites / Feedback

Strong spots:
- Local profile, history, favorites, quick actions, feedback draft, and local
  data clearing are present.
- Profile sync status is visible and disabled.
- No remote profile network calls occur while flags are OFF.

Weak spots:
- Retention is device-local only.
- Feedback is safe but not yet a persistent product feedback loop.

Improvement ideas:
- Add privacy-safe feedback intake after the first tester loop.
- Move to profile sync read-only test mode only after real phone and storage
  gates are complete.

## P0 / P1 / P2 Findings

### P0

None found.

### P1

None found.

### P2

1. `docs/zodiac-soft-launch-release-candidate.md` contained a NUL/UTF-16 tail
   fragment that made `rg` treat the file as binary. Fixed as docs hygiene.
2. Analytics storage is still `noop`; dashboard counters remain empty until
   Redis env is configured.
3. Real Telegram phone pass is still manual.
4. Real phone keyboard overlay and bottom safe-area behavior are still manual.
5. Profile sync is disabled/local-only; cross-device retention is unavailable.
6. Exact astro provider is unavailable; product must remain symbolic/honest.
7. Weekly live publishing remains OFF and unproven in live mode.
8. Payments, Stars, entitlement enforcement, refunds, support, and legal flows
   remain OFF/not ready.
9. Sonnik/Dream Dictionary is hidden backlog because quality is not launch-ready.
10. No first-user production feedback loop has run yet.
11. Visible fallback share copy can appear stale across QA navigation even when
    feature-specific share assertions pass. Consider a focused UI polish package.

## Analytics Audit

Current status:

```text
analytics mode: noop
Redis env: missing
dashboard counters: empty
storage readiness: PASS
tracked events checked by storage audit: 128
allowlisted events: 136
```

Coverage verified:
- app open and main menu;
- Compatibility and pair flows;
- Premium Natal and VIP 11 tools;
- Birth Matrix;
- Tarot and Rune;
- Lunar/Ritual;
- Angel Numbers;
- feedback draft/copy/share;
- save/share/history/favorites/profile;
- Telegram WebApp readiness/back/haptics;
- FinalAstroMap-style visual/chart events;
- profile sync disabled/readiness status where applicable.

Privacy verified:
- raw birth date is not sent;
- raw birth time is not sent;
- raw city is not sent;
- raw question is not sent;
- raw intention is not sent;
- raw feedback text is not sent;
- raw result text is not sent;
- raw `initData` is not sent or stored;
- raw angel number input policy is safe: payloads use safe preset keys and
  pattern categories rather than arbitrary raw text.

Current dashboard:
- `/dashboard/networks/zodiac/analytics` exists and is dynamic.
- It shows the `noop` warning instead of pretending counters are live.
- It documents what is not tracked: names, birth dates, birth times, cities,
  raw messages, dream text, raw angel input, bot token, and raw initData.

Recommended improvements:
1. Activate Redis analytics with Upstash/Vercel env only after secrets are set.
2. Add dashboard funnel from app open -> category open -> result -> save/share.
3. Add top sections, top signs, top modes, and top pair metrics.
4. Add retention/favorites/share conversion metrics.
5. Add drop-off points for long forms.
6. Correlate first-user feedback with safe categorical events only.
7. Expand privacy-safe events cautiously; never add raw dates, names, cities,
   questions, intentions, feedback, result text, or raw initData.

## Profile Sync Audit

Current status:

```text
Profile sync: disabled
Provider mounted: no
Network while disabled: 0
Backend writes: 0
LocalStorage fallback: preserved
```

Verified design:
- frontend flags default OFF;
- outside Telegram or missing `initData` means no sync network calls;
- sync API validates Telegram `initData` before accepting identity-dependent
  work;
- disabled route does not read or store POST payloads;
- production backends cannot use test-memory by accident;
- sanitizer strips raw birth date, birth time, city, question, intention,
  feedback text, result text, name, phone, and initData;
- merge logic is safe, bounded, and summary-only.

Readiness for controlled read-only sync:
- Foundation is good.
- Do not enable yet.
- Required first: real phone pass, Redis/storage decision, auth identity policy,
  server-side privacy logs, rollback switch, and a read-only canary plan.

## Telegram Auth Audit

Current status:

```text
Telegram WebApp initData validation: ready foundation
Raw initData storage: no
Route response: safe/masked
```

Verified:
- HMAC validation uses the Telegram WebApp secret derivation.
- `auth_date` expiry is enforced.
- hash comparison is timing-safe.
- invalid hash is rejected.
- missing bot token fails safely.
- malformed input is handled safely.
- raw initData is not stored or logged.
- success response masks identity and does not echo raw input.

Before profile sync:
- Decide the identity key policy: Telegram user id or hashed server-side key.
- Store only safe summaries keyed by that identity.
- Count only safe auth metrics such as valid/invalid/expired/missing-token
  status counts, never raw initData or raw user payload.

## Real Astro Engine Audit

Current status:

```text
Exact provider: unavailable
Symbolic provider: active
Fake planets: no
Fake houses: no
Fake ascendant: no
External astro API calls in fixtures: 0
```

The UI and docs remain honest: current natal and map outputs are symbolic. They
must not claim exact houses, ascendant, real planet degrees, aspects, transits,
or ephemeris precision.

What is needed for real exact astrology:
- ephemeris provider decision;
- timezone database strategy;
- geocoding/city selection strategy;
- house system choice;
- DST and historical timezone tests;
- non-personal fixtures with known outputs;
- runtime validation and fallback;
- clear UX language about precision limits.

Recommended next package:
- Real Astro Engine provider research and exact-mode fixture design, still with
  exact claims OFF.

## Scheduler / Publishing / Ledger Audit

Current status:

```text
Daily scheduler: active and ledger-protected
Weekly live: OFF
Dry-run publish for 2026-06-20: PASS
Dry-run Telegram API calls: 0
Dry-run ledger writes: 0
Manual ledger edits: none
```

Verified:
- cron timings are staggered away from `:00` and `:30`;
- daily live workflow uses ledger-protected command;
- manual workflow default is dry-run;
- duplicate protection uses protected statuses;
- ledger read/parse failures are fail-closed;
- corrupted-ledger safety tests pass;
- daily dry-run reports 13/13 CTA rows OK and image posts ready;
- GitHub token/local-report workflow warnings are expected in local audit.

Remaining gates:
- observe daily stability over multiple scheduled days;
- keep backup/restore dry-run docs current;
- run weekly dry-run repeatedly before any weekly live plan;
- never manually edit the ledger.

## Monetization / VIP / Stars Audit

Current status:

```text
VIP free access: enabled
VIP free access until: 2026-09-17
Payments: OFF
Telegram Stars: OFF
Entitlements: OFF
Giveaways: locked/preview
```

VIP is currently a product-quality and retention test, not a commercial system.
No real payment hooks should be enabled before:
- payment sandbox/test-mode plan;
- entitlement model;
- support and refund policy;
- legal text;
- analytics conversion funnel;
- real phone proof;
- rollback plan;
- no-secret logging review.

## Mobile / Telegram WebView Audit

Desktop QA passed responsive viewports:
- `390x844`;
- `412x915`;
- `1440x900`.

Desktop QA cannot prove:
- real Telegram WebView keyboard overlay;
- physical safe-area behavior;
- native share behavior on iOS/Android;
- touch feel on low-end phones.

Real-phone GO checklist:
- open regular `/compatibility` or `startapp=compat`: lands on home/main, not
  stale Mystic;
- open `startapp=mystic`: lands on Mystic;
- open `startapp=birth_matrix`: lands on Birth Matrix;
- open `startapp=vip`: lands on VIP;
- open `startapp=angel_numbers`: lands on Angel Numbers;
- input date fields normalize `01012000 -> 01.01.2000`;
- bottom nav is not covered by keyboard or Telegram UI;
- share sheets open or fallback text is clear;
- Profile/History/Favorites reopen the right feature;
- Sonnik is not visible;
- no white native selects;
- no horizontal overflow;
- no dead CTA.

STOP conditions:
- app opens fresh into stale Mystic;
- Angel Numbers routes through Mystic incorrectly;
- bottom CTA is covered by keyboard;
- raw personal input appears in share/history/analytics;
- console/runtime/network errors appear in real phone flow;
- payments or profile sync become visible unexpectedly.

## Docs Consistency Audit

Checked docs for contradictions around:
- Sonnik active vs hidden/backlog;
- mass launch claims;
- weekly live claims;
- payments/Stars active claims;
- exact astro claims;
- Redis analytics active claims;
- profile sync enabled claims;
- personal test data.

Result:
- No product-policy contradiction found.
- One docs hygiene issue fixed: `docs/zodiac-soft-launch-release-candidate.md`
  no longer contains the NUL-byte tail that made it look binary to `rg`.
- This master audit is linked from the key handoff/freeze/readiness docs.

## Improvement Roadmap

### Package 54: Redis Analytics Activation

Goal:
- Turn analytics storage from `noop` to Redis-backed persistence.

Why:
- Dashboard counters are currently empty; product decisions need real safe data.

Risk:
- Secret/env handling and accidental sensitive payload storage.

Prerequisites:
- Redis env configured securely, no secrets committed, analytics checks updated.

What stays OFF:
- profile sync, payments/Stars, weekly live, exact astro claims.

### Package 55: Real Phone Bugfix Batch

Goal:
- Complete physical Telegram WebView verification and fix only observed issues.

Why:
- Desktop QA cannot prove native keyboard, safe area, touch, or share behavior.

Risk:
- Fixes may be device-specific; keep changes narrow.

Prerequisites:
- Screenshots/video evidence from iOS/Android Telegram.

What stays OFF:
- profile sync, payments/Stars, weekly live, exact astro claims.

### Package 56: First 5 Users Feedback Triage

Goal:
- Invite the first trusted users and convert feedback into ranked fixes.

Why:
- Product quality now needs real behavior, not only synthetic tests.

Risk:
- Feedback may include personal data; intake must remain privacy-safe.

Prerequisites:
- Real phone GO pass and safe feedback instructions.

What stays OFF:
- profile sync, payments/Stars, weekly live, exact astro claims.

### Package 57: Daily Stability Monitoring

Goal:
- Observe scheduled daily publishing over multiple real days.

Why:
- Mass launch depends on scheduler reliability, backups, and duplicate safety.

Risk:
- Misclassifying local warnings as production failures.

Prerequisites:
- Daily reports, backup freshness, ledger integrity checks.

What stays OFF:
- weekly live and manual ledger edits.

### Package 58: Profile Sync Read-Only Test Mode

Goal:
- Add a read-only controlled sync test without writing production user state.

Why:
- Cross-device retention is the biggest profile limitation.

Risk:
- Identity/privacy mistakes.

Prerequisites:
- Telegram auth policy, storage backend decision, real phone pass, rollback flag.

What stays OFF:
- production writes and user-visible sync toggle.

### Package 59: Zodiac OS Management Console

Goal:
- Add an owner-facing management console for channels, Mini App, bot/startapp,
  publishing, analytics, soft launch, safety, docs, and new-channel drafts.

Why:
- The project owner needs one clear place to understand and operate the
  Telegram platform without hunting through scripts.

Risk:
- Accidentally creating live Telegram write controls or unauthenticated admin
  writes.

Result:
- Implemented with `/dashboard/networks/zodiac/channels`,
  `/dashboard/networks/zodiac/operations`, and
  `/dashboard/networks/zodiac/docs`. The new-channel builder is localStorage
  draft-only.

What stays OFF:
- live publish, manual ledger edits, weekly live, payments/Stars, profile sync,
  exact astro claims.

### Package 61: Zodiac OS Feedback and QA Evidence Center

Goal:
- Add an owner-facing center for first-user feedback, P0/P1/P2 triage,
  real-phone QA evidence, analytics correlation, and the 5 -> 20 users decision.

Why:
- After the first 5 users, the owner needs one clear place to see who tested
  on iPhone/Android/Desktop, what worked, what confused users, what broke, and
  whether expanding to 20 users is safe.

Risk:
- Accidentally storing raw tester data or creating an unauthenticated feedback
  write API.

Result:
- Implemented with `/dashboard/networks/zodiac/feedback`, localStorage-only
  sanitized feedback intake, real-phone QA checklist, overview cards, triage
  summary, analytics correlation, and decision matrix.

What stays OFF:
- server write API, raw tester data storage, screenshots in repo, live publish,
  manual ledger edits, weekly live, payments/Stars, profile sync, exact astro
  claims, mass launch.

### Package 62: Zodiac OS Admin Safety Center

Goal:
- Add a dedicated owner-facing safety center for live-action guardrails,
  approvals, local audit log, pre-20-user checklist, and future roles/auth
  readiness.

Why:
- Safety was visible across operations/publishing/feedback, but the owner needs
  one clear route that prevents accidental live action and explains approvals.

Risk:
- Accidentally creating live publish controls, unauthenticated server writes, or
  audit storage containing sensitive raw user data.

Result:
- Implemented with `/dashboard/networks/zodiac/security`, status cards,
  Approval Matrix, localStorage-only audit log, sanitized export/copy, clear
  local log, `Перед 20 пользователями` checklist, and future
  Owner/Admin/Editor/Viewer role readiness.

What stays OFF:
- server write API, live publish, manual ledger edits, weekly live,
  payments/Stars, profile sync, exact astro provider/claims, and mass launch.

### Package 63: Zodiac OS Content Engine and Template Studio

Goal:
- Add owner-facing content engine for templates, rubrics, CTA/startapp previews,
  RU/UA/EN quality checks, Telegram preview, and local-only draft prep.

Why:
- Publishing Center prepares manual posts, but the owner needs a dedicated safe
  place to shape content before dry-run/manual approval.

Risk:
- Accidentally creating a server-backed CMS, storing raw sensitive inputs, or
  implying exact astrology.

Result:
- Implemented with `/dashboard/networks/zodiac/content`, template catalog,
  Template Studio, Telegram preview, generated text/config/checklist, RU/UA
  quality checklist, and rubric planner.

What stays OFF:
- server write API, live publish, ledger writes, weekly live, payments/Stars,
  profile sync, exact astro provider/claims, and mass launch.

### Package 64: Zodiac OS Dashboard Admin Auth Gate

Goal:
- Add a safe owner-dashboard auth gate with login, logout, env-controlled
  passcode hash, signed httpOnly session cookie, route protection, status cards,
  and QA for enabled/disabled/fail-closed modes.

Why:
- The management console is now useful enough to need an access layer before
  wider production exposure, while still avoiding server-side platform writes.

Risk:
- Accidentally storing raw passwords, printing secrets, breaking Telegram Mini
  App public routes, or implying full RBAC/write authorization.

Result:
- Implemented with `/dashboard/login`, `/api/dashboard/auth/login`,
  `/api/dashboard/auth/logout`, `/api/dashboard/auth/status`,
  `lib/zodiac-dashboard-auth.ts`, route-level dashboard guards, Security page
  auth cards, conditional logout, and `zodiac:dashboard:auth:check`.

What stays OFF:
- full RBAC, server write API, live publish, ledger writes, weekly live,
  payments/Stars, profile sync, exact astro provider/claims, and mass launch.

### Package 65: Real Astro Engine Provider Research

Goal:
- Choose a provider strategy and fixture design for exact astrology.

Why:
- The current engine is honest but symbolic only.

Risk:
- False precision if timezone/geocoding/house fixtures are weak.

Prerequisites:
- Provider comparison, timezone/geocoding plan, non-personal known fixtures.

What stays OFF:
- exact astro claims and UI labels implying exact planets/houses/ascendant.

### Package 66: Weekly Live Controlled First Run Plan

Goal:
- Prepare a weekly live plan without enabling it yet.

Why:
- Weekly content can add retention but must not threaten daily stability.

Risk:
- Duplicate posts, timing overlap, poor rollback.

Prerequisites:
- Daily stability evidence, weekly dry-runs, ledger/report gates.

What stays OFF:
- weekly live until explicit approval after plan/checks.

### Package 67: VIP Monetization Test Mode

Goal:
- Build payment/Stars/entitlement test-mode readiness only.

Why:
- VIP has product depth but no commercial infrastructure.

Risk:
- Exposing fake or confusing payment UI.

Prerequisites:
- Legal/support/refund copy, test-mode payments, entitlement model, analytics.

What stays OFF:
- real payments, real Stars, paid entitlement enforcement.

### Package 68: Performance / Mobile Polish

Goal:
- Reduce visual density, stale fallback share copy, and long-scroll friction.

Why:
- QA passes, but first-time mobile comprehension can improve.

Risk:
- Polishing can accidentally weaken strict tests.

Prerequisites:
- First-user feedback and real-phone evidence.

What stays OFF:
- new product features, payments, sync, exact astro claims.

### Package 69: Mass Launch Readiness Audit

Goal:
- Re-audit after analytics, phone evidence, first users, and daily stability.

Why:
- Mass launch should be a separate explicit decision.

Risk:
- Launching before operational gates are proven.

Prerequisites:
- Redis analytics, real phone pass, first-user fixes, scheduler evidence.

What stays OFF:
- anything not explicitly approved in that package.

## Final Recommendation

```text
Invite first 5 users: YES, after or together with real-phone sanity evidence
Invite 20 users: CONDITIONAL, only after first 5 feedback and no P0/P1
Mass launch: NO
Weekly live: NO
Payments/Stars: NO
Profile sync: NO
Exact astro claims: NO
Live publish from Package 53: NO
Manual ledger changes from Package 53: NO
```

The current best next move is not another feature. It is a controlled evidence
loop: activate privacy-safe analytics, complete real phone checks, invite the
first 5 trusted users, triage feedback, and keep every high-risk switch OFF
until the relevant package proves it.


## Analytics Navigation & Dashboard QA Update

* **Direct Analytics Route**: `/dashboard/networks/zodiac/analytics`
* **Dashboard Navigation Behavior**: The overview page provides clear status indicators, quick action buttons, and operational safety cards. A prominent CTA links directly to the Analytics page. The sidebar also contains an `Аналитика` link pointing to the analytics route.
* **Where to check analytics**: Navigate to the Overview page and use the 'Открыть аналитику' CTA, or use the sidebar link.
* **Current Redis / noop state**: Displayed as a status badge on the Overview page. If Redis is missing env variables, a warning is prominently displayed.
* **Soft launch dashboard checklist**: Review the 'Рекомендованные шаги' card on the Overview page for instructions.
* **Platform Map**: `docs/zodiac-telegram-platform-map.md`
* **UX Audit**: `docs/zodiac-telegram-platform-ux-audit.md`

## Package 59 Management Console Update

Package 59 adds a dedicated owner-facing Zodiac OS Management Console:

* **Login route**: `/dashboard/login`
* **Overview**: `/dashboard/networks/zodiac`
* **Channels route**: `/dashboard/networks/zodiac/channels`
* **Publishing route**: `/dashboard/networks/zodiac/publishing`
* **Analytics route**: `/dashboard/networks/zodiac/analytics`
* **Feedback route**: `/dashboard/networks/zodiac/feedback`
* **Operations route**: `/dashboard/networks/zodiac/operations`
* **Safety route**: `/dashboard/networks/zodiac/security`
* **Content route**: `/dashboard/networks/zodiac/content`
* **Docs route**: `/dashboard/networks/zodiac/docs`

The channel console shows the 13-channel Zodiac network, Telegram handles,
Mini App `startapp` links, navigation status, description status, daily
publishing status, analytics status, and risk badges. The new-channel builder is
localStorage-only and generates config/checklist output for later manual commit.

Safety verdict remains unchanged:

```text
Live publish from dashboard: NO
Manual ledger changes: NO
Weekly live: NO
Payments/Stars: NO
Profile sync: NO
Exact astro claims: NO
Mass launch: NO
First 5 users: GO
```

## Package 60 Publishing Center Update

Package 60 adds `/dashboard/networks/zodiac/publishing` as the owner-facing
publishing center:

* daily/weekly/dry-run/ledger status cards;
* today/tomorrow/week calendar preview;
* channel coverage from the Package 59 central registry;
* dry-run command helper;
* localStorage-only manual post draft builder;
* publishing ledger/safety explanation.

Safety verdict remains unchanged:

```text
Live publish from dashboard: NO
Manual ledger changes: NO
Weekly live: NO
Payments/Stars: NO
Profile sync: NO
Exact astro claims: NO
Mass launch: NO
```

## Package 61 Feedback Center Update

Package 61 adds `/dashboard/networks/zodiac/feedback` as the owner-facing
Feedback and QA Evidence Center:

* first 5 users overview cards;
* average rating, P0 bugs, P1 issues, P2 backlog, and 20-user readiness;
* localStorage-only sanitized feedback intake;
* real-phone QA checklist;
* analytics correlation link to `/dashboard/networks/zodiac/analytics`;
* decision matrix for first 5 users, 20 users, and mass launch;
* sanitized local owner summary export.

Safety verdict remains unchanged:

```text
Server write API: NO
Raw sensitive data stored: NO
Live publish from dashboard: NO
Manual ledger changes: NO
Weekly live: NO
Payments/Stars: NO
Profile sync: NO
Exact astro claims: NO
Mass launch: NO
First 5 users: GO
20 users: CONDITIONAL
```

## Package 63 Content Engine Update

Package 63 adds `/dashboard/networks/zodiac/content` as the owner-facing
Content Engine and Template Studio:

* overview cards for templates, rubrics, RU/UA quality, CTA/startapp, drafts,
  and publication readiness;
* template catalog for daily horoscope, weekly forecast, compatibility,
  Mini App invite, VIP teaser, birth matrix, natal chart, tarot/runes, moon
  ritual, angel numbers, navigation post, soft launch invite, and custom/manual;
* localStorage-only Template Studio with language, channel/topic, tone, title,
  body, CTA, startapp parameter, emoji intensity, status, and notes;
* validation for title, body, language, startapp, tokens, raw personal data,
  exact astrology claims, long posts, mixed RU/UA/EN, and missing CTA;
* Telegram post preview, compact channel-card preview, generated text,
  generated config/snippet, copy controls, and manual approval checklist;
* localStorage-only RU/UA quality checklist and rubric planner;
* links from overview, sidebar, Publishing Center, Channels, Operations, and
  Safety Center without adding live actions.

Safety verdict remains unchanged:

```text
Server write API: NO
Raw sensitive data stored: NO
Live publish from dashboard: NO
Manual ledger changes: NO
Weekly live: NO
Payments/Stars: NO
Profile sync: NO
Exact astro provider: NO
Mass launch: NO
First 5 users: GO
20 users: CONDITIONAL
```

## Package 64 Dashboard Auth Gate Update

Package 64 adds `/dashboard/login` as the owner-facing Dashboard Auth Gate:

* env contract for `ZODIAC_DASHBOARD_AUTH_ENABLED`,
  `ZODIAC_DASHBOARD_ADMIN_PASSWORD_SHA256`, and
  `ZODIAC_DASHBOARD_SESSION_SECRET`;
* route-level guard for `/dashboard` and `/dashboard/networks/zodiac/*`;
* login, logout, and read-only auth status APIs under `/api/dashboard/auth/*`;
* signed httpOnly, sameSite=lax session cookie with 12-hour expiry;
* fail-closed missing-config path when auth is enabled without hash/secret;
* Security page auth cards for Dashboard auth, Auth configured, Session cookie,
  Server write API, and Roles;
* conditional logout action only when auth is enabled and the browser has a
  valid session;
* `zodiac:dashboard:auth:check` for disabled, enabled, and fail-closed modes.

Safety verdict remains unchanged:

```text
Server write API: NO
Raw sensitive data stored: NO
Live publish from dashboard: NO
Manual ledger changes: NO
Weekly live: NO
Payments/Stars: NO
Profile sync: NO
Exact astro provider: NO
Full RBAC: NO
Mass launch: NO
First 5 users: GO
20 users: CONDITIONAL
```

## Package 62 Admin Safety Center Update

Package 62 adds `/dashboard/networks/zodiac/security` as the owner-facing
Admin Safety Center:

* safety status cards for live publish, weekly live, payments/Stars, profile
  sync, exact astro, ledger, dry-run API calls, Redis analytics, and mass launch;
* Approval Matrix for daily dry-run, daily live publish, weekly live,
  payments/Stars, profile sync writes, exact astro provider, adding channels,
  and manual posts;
* localStorage-only audit log labeled `Локальный журнал, не серверная база`;
* sanitized audit log export/copy and local clear control;
* `Перед 20 пользователями` checklist;
* future roles/auth readiness for Owner, Admin, Editor, and Viewer;
* explicit warning that server write API is disabled until authenticated admin
  backend, audit log, and role checks exist.

Safety verdict remains unchanged:

```text
Server write API: NO
Raw sensitive data stored: NO
Live publish from dashboard: NO
Manual ledger changes: NO
Weekly live: NO
Payments/Stars: NO
Profile sync: NO
Exact astro provider: NO
Mass launch: NO
First 5 users: GO
20 users: CONDITIONAL
```

- [Production Dashboard Auth Activation Runbook](zodiac-production-dashboard-auth-activation.md)

## Zodiac OS Naming System (Package 66)

* **Full platform** = Zodiac OS
* **Dashboard/admin** = Zodiac Control
* **Mini App** = Zodiac Mini

- [Zodiac Real Phone QA Evidence Center](zodiac-real-phone-qa-evidence-center.md)
