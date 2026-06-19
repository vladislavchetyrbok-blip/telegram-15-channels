# Zodiac Soft Launch Release Candidate

Date: 2026-06-19
Base HEAD: `e54a0fd docs: add zodiac monetization readiness plan`
Branch: `main`

This document freezes the current Zodiac product state as a soft-launch release candidate for the first controlled `5-20` users. It does not authorize mass launch, weekly live publishing, payments, Telegram Stars, manual daily live publish, or manual ledger edits.

Package 37 adds Telegram WebApp `initData` server-validation readiness for
future identity-dependent features. It does not enable profile sync, remote
profile storage, payments, Stars, or weekly live.

Package 38 adds disabled-by-default Profile Sync API readiness. It does not
enable remote sync, backend writes, a frontend sync provider, payments, Stars,
or weekly live.

Package 39 adds a disabled-by-default frontend Profile Sync client/hook
scaffold. It is not mounted, does not show sync UI, and does not call remote
GET/POST/DELETE while flags are OFF.

Package 40 adds pure Profile Sync merge and retention-mapping helpers. They are
not mounted, do not fetch remote profiles, do not write to backend storage, and
keep sync disabled.

Package 41 adds Profile Sync storage adapter readiness and env validation. The
default backend remains `none`, test-memory is check-only, production
Redis/Vercel KV/Supabase adapters are not wired, and profile sync reads/writes
remain OFF.

Package 42 adds a disabled Profile Sync status block in `Мой профиль`. It is
display-only, has no toggle, does not mount a provider, and must not call
`/api/zodiac/profile/sync` while flags are OFF.

Package 43 adds Profile Sync privacy stress tests and route hardening. Raw birth
data, city, name, phone, questions, intentions, feedback, result text, and
Telegram initData are stripped or rejected without enabling sync.

Package 44 adds the Real Astro Engine fixture harness. Exact astrology remains
unavailable, fixtures are non-personal placeholders, and no external astro API
calls are added.

Package 45 completes the post-sync-foundation regression. Full checks pass,
profile sync remains disabled/no-network, and the release candidate remains for
controlled soft launch only.

## Release Candidate Status

- RC status: READY for controlled `5-20` users.
- Mass launch: NOT READY.
- Weekly live: NOT READY / OFF.
- Payments/Stars: NOT READY / OFF.
- Redis analytics: code ready, storage currently `noop`.
- Real phone Telegram WebView pass: still required before mass launch.
- Telegram initData auth foundation: READY, profile sync OFF.
- Profile Sync API foundation: READY but disabled.
- Profile Sync frontend scaffold: READY but disabled and not mounted.
- Profile Sync merge logic: READY but disabled and not wired to UI.
- Profile Sync storage readiness: READY but disabled, production writes OFF.
- Profile Sync status UI: READY, disabled/no-network.
- Profile Sync privacy stress tests: PASS.
- Real Astro Engine fixture harness: PASS, exact mode unavailable.
- Post-sync-foundation regression: PASS.
- Product readiness: `92%` for controlled soft launch.

## Current Product Readiness

| Area | Status |
| --- | --- |
| Horoscopes | PASS |
| Compatibility | PASS |
| Angel Numbers | PASS |
| Birth Matrix | PASS |
| Numerology | PASS |
| Mystic | PASS |
| Tarot/Rune | PASS |
| Lunar/Ritual | PASS |
| VIP 11/11 | PASS |
| Profile/History/Favorites | PASS |
| Feedback flow | PASS |
| Safe share loop | PASS |

Mini App smoke baseline:

- Main menu categories: `10/10`.
- VIP cards/tools: `11/11`.
- Feedback CTA/panel: PASS.
- Safe share drafts: Compatibility, Lunar/Ritual, Angel Numbers, Premium Natal, Tarot, Rune, Birth Matrix.
- Telegram mock: PASS.
- Console errors: `0`.
- Runtime errors: `0`.
- HTTP/network errors: `0`.

## Infrastructure Readiness

- Daily scheduler: ON and timing-hardened.
- Daily duplicate protection: ledger/dedupe confirmed.
- Daily dry-run for `2026-06-20`: `Would Publish 13/13`, CTA rows `13/13 OK`, Telegram API calls `0`, ledger writes `0`.
- Weekly live: OFF.
- Redis analytics: API/privacy model ready, storage mode `noop`, required Redis env missing.
- Payments/Stars: OFF.
- VIP entitlements: OFF, no paid gates active.
- Backups/safety: production safety PASS.
- Channel packaging: already live and verified in earlier package.
- Real Astro Engine: readiness scaffold added, current natal chart remains symbolic, exact mode is `exact_unavailable`, and no fake planet/house/ascendant values are shown.
- Profile Sync storage: backend `none`, production reads/writes OFF, check-only
  memory adapter for local validation.
- Profile Sync UI status: visible in Profile as disabled; no remote sync calls.
- Profile Sync privacy: malicious sync payloads stripped/rejected; raw
  sensitive values are not accepted.
- Real Astro Engine: symbolic-only current mode, exact provider
  `exact_unavailable`, fixture harness PASS.
- Package 45 full regression: PASS, see
  `docs/zodiac-post-sync-foundation-regression.md`.

## Manual Blockers Before Mass Launch

- Complete a real phone Telegram WebView pass after the latest UI/share/feedback changes.
- Configure Redis env or explicitly accept `noop` analytics for the first test group.
- Observe several stable daily scheduler runs after cron timing shift.
- Keep P0/P1 feedback count at `0`.
- Keep weekly live OFF until weekly readiness gates are met.
- Keep payments/Stars OFF until a separate monetization implementation package is approved.

## First User Test Link

```text
https://t.me/zodiac_love_check_bot?startapp=compat
```

## Telegram initData Auth Foundation

- Server-side `initData` validation foundation is available.
- `initDataUnsafe` is not trusted as identity.
- Raw `initData` is not stored or sent to analytics.
- Profile sync remains OFF and not implemented.
- Remote profile storage remains not implemented.
- Payments/Stars remain OFF.
- Weekly live remains OFF.

Before any profile sync or identity-dependent feature, validate `initData` on
the server and keep raw Telegram/auth payloads out of localStorage, analytics,
logs, and dashboards.

## Profile Sync API Foundation

- Route exists: `GET|POST|DELETE /api/zodiac/profile/sync`.
- Route requires Telegram `initData` validation.
- Default response with valid auth: `disabled`.
- Backend storage: `none`.
- Backend writes: NO.
- Frontend sync client/hook scaffold: YES, disabled by default.
- Frontend sync provider mounted in app: NO.
- Frontend sync UI status: NO.
- GET/POST/DELETE while disabled: NO.
- Existing localStorage Profile/History/Favorites: unchanged.
- Safe schema and rollout plan: `docs/zodiac-profile-sync-readiness.md`.

## Profile Sync Frontend Scaffold

- Client file: `components/zodiac-mini-app/profile-sync-client.ts`.
- Hook file: `components/zodiac-mini-app/useProfileSync.ts`.
- Mounted in the Mini App: NO.
- Auto-sync loop: NO.
- Remote merge: NO.
- `initDataUnsafe` usage: NO.
- Raw `initData` stored/logged/analytics: NO.
- localStorage remains the only active Profile/History/Favorites storage.
- Future read-only sync rollout requires a separate package and real-phone
  Telegram WebView validation.

## Profile Sync Merge Logic

- Merge utility: `lib/zodiac-profile-sync-merge.ts`.
- Retention mapper: `lib/zodiac-profile-sync-retention-map.ts`.
- Mounted in Mini App: NO.
- Remote reads/writes: NO.
- Backend writes: NO.
- Behavior: sanitize-first, append-only history merge, set-like favorites merge,
  duplicate-safe, newest timestamp wins, deterministic newest-first sorting,
  max clamps, and malformed input safe fallback.
- Raw birth date/time/city/question/intention/feedback/result text: stripped.
- Future rollout path: Package 42 read-only fetch, Package 43 controlled write,
  Package 44 conflict UX/status.

## Profile Sync Storage Readiness

- Storage adapter contract: READY but disabled.
- Backend default: `none`.
- Production reads: OFF.
- Production writes: OFF.
- Test-memory adapter: check-only.
- Production Redis REST / Vercel KV adapter: not wired.
- Production Supabase adapter: not wired.
- Env validation: presence-only; secret values must never be printed.
- Remote sync for users: OFF.
- Existing localStorage Profile/History/Favorites: unchanged.

## Profile Sync Status UI

- Visible in `Мой профиль`: YES.
- Text: `Синхронизация между устройствами: выключена`.
- Toggle or `sync now` button: NO.
- Mounted provider: NO.
- Remote profile sync network calls while disabled: `0`.
- localStorage fallback remains the active storage for History/Favorites.

Ask testers to open this from a phone inside Telegram.

## First Tester Message

```text
Привет! Я собрал Telegram Mini App с гороскопами, совместимостью, натальной картой, матрицей судьбы, таро/рунами, лунными практиками и VIP-разделом.

Открой, пожалуйста, с телефона прямо в Telegram:
https://t.me/zodiac_love_check_bot?startapp=compat

Проверь 2-3 функции, которые тебе интересны. Особенно важно:
- понятно ли, куда нажимать;
- красиво ли выглядит на телефоне;
- работает ли результат;
- работает ли "Поделиться";
- где текст слишком длинный или слишком общий;
- где хочется закрыть приложение.

Напиши честно: что понравилось, что непонятно, что сломано и какую функцию ты бы отправил(а) другу.
```

## Stop Conditions

Stop inviting users and triage immediately if any of these happen:

- Mini App white screen.
- Telegram WebView buttons overlap or become unreachable.
- Save/share broken.
- Privacy leak: raw name, birth date, birth time, city query, raw question/intention, raw result text, or raw feedback stored/sent.
- Result screens fail or show empty content.
- Daily publish duplicates.
- Any P0/P1 bug is found.

## Commands Before Showing Users

Run this local checklist before sending the test link:

```bash
npm run lint
npm run build
npm run zodiac:miniapp:smoke
npm run zodiac:astro:check
npm run zodiac:analytics:check
npm run zodiac:analytics:storage:check
npm run production:safety:check
```

For a full RC baseline, also run:

```bash
npm run zodiac:workflow:check -- --date YYYY-MM-DD
npm run zodiac:publish-date:dry -- --date YYYY-MM-DD
git diff --check
```

## Current Forbidden Actions

- No weekly live.
- No payments/Stars.
- No VIP entitlement enforcement.
- No manual live publish without explicit approval and dry-run/ledger proof.
- No manual ledger edits.
- No mass launch.
- No scheduler timing changes during this RC.
- No Mini App UX changes unless a clear P0/P1 bug is found.

## Recommended Next Sequence

1. Run a real phone Telegram WebView pass.
2. Invite `5-10` trusted testers first.
3. Collect feedback using `docs/zodiac-soft-launch-runbook.md` and `docs/zodiac-bug-triage.md`.
4. Fix P0/P1 only if found.
5. Add Redis env if ready, or explicitly accept `noop` for the first loop.
6. Observe daily scheduler timing and duplicate protection.
7. Invite up to `20` users only if P0/P1 remains `0`.
8. Decide weekly live later.
9. Decide payments/Stars later using `docs/zodiac-monetization-readiness.md`.

## Baseline Checks

Clean baseline was run after removing `.next`.

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
| `npm run zodiac:profile-sync:check` | PASS, `65/65` |
| `npm run zodiac:analytics:check` | PASS |
| `npm run zodiac:analytics:storage:check` | PASS, storage `noop` warning |
| `npm run zodiac:workflow:check -- --date 2026-06-20` | Static PASS, warning only: no GitHub token/local report |
| `npm run zodiac:publish-date:dry -- --date 2026-06-20` | PASS, Would Publish `13/13`, Telegram API calls `0`, ledger writes `0` |
| `npm run production:safety:check` | PASS |
| `git diff --check` | PASS |

## Recommendation

- Can invite `5-20` users: YES, after real-phone Telegram WebView sanity pass or with it as the first tester activity.
- Can mass launch: NO.
- Can enable weekly live: NO.
- Can enable payments/Stars: NO.
-   G i v e a w a y s   l o c k e d / p r e v i e w   i s   a n   i n t e n t i o n a l   p r o d u c t   d e c i s i o n .  
 
