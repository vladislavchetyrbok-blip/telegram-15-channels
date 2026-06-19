# Zodiac Final Production Audit

Audit date: 2026-06-19 01:07 Europe/Kyiv
Audit refresh base HEAD: `bd68e02aa58468ee30b0ac2f991b6e32d548f7b6`
Branch: `main`

This audit is read-only for product/runtime behavior. No live publishing was run, no ledger was edited manually, weekly live schedule stays off, and payments/Telegram Stars stay off.

Package 37 adds Telegram WebApp `initData` server-validation readiness. It does
not implement profile sync, remote profile storage, payments, Stars, or weekly
live.

Package 38 adds disabled-by-default Profile Sync API readiness. It does not
enable remote sync, backend storage writes, a frontend sync provider, payments,
Stars, or weekly live.

Package 39 adds a disabled-by-default frontend Profile Sync client/hook
scaffold. It does not mount a provider, show sync UI, auto-sync, call remote
GET/POST/DELETE while disabled, enable backend writes, payments, Stars, or
weekly live.

Package 40 adds pure Profile Sync merge and retention-mapping helpers. It does
not mount a provider, fetch remote data, write to any backend, enable profile
sync, payments, Stars, or weekly live.

Package 41 adds Profile Sync storage adapter readiness and env validation. It
keeps backend `none` by default, exposes only a check-only test-memory adapter,
does not wire production Redis/Vercel KV/Supabase storage, and does not enable
profile sync reads/writes.

Package 50 adds the controlled launch freeze checkpoint:
`docs/zodiac-controlled-launch-freeze.md`. It preserves the same safety boundary:
first 5 controlled testers are `GO`, expansion to 20 is `CONDITIONAL`, and mass
launch, weekly live, payments/Stars, profile sync, and exact astrology claims
remain `STOP`.

## Executive Status

The Zodiac product is broadly production-ready for the current free-access phase:

- Daily publishing workflow is hardened and ledger-protected.
- Mini App smoke passes across main menu, Couple Core, VIP, Mystic, Birth Matrix, Angel Numbers, profile/history/favorites/share, Telegram mock, custom selects, pair gates, and chart visuals.
- VIP has 11/11 functional tools with save/share and privacy-safe localStorage behavior.
- Channel packaging has live-updated navigation/descriptions and current dry-runs remain valid.
- Daily and weekly content formats include date/range headers and CTA buttons.
- Analytics privacy model passes, but persistent storage is not enabled because Redis env is missing.
- Mini App select/share/dead CTA/chart interaction bugs were repaired and verified by smoke.
- Fresh production backup was created and restore dry-run passed.
- Soft-launch runbook is available for a controlled `5-20` first-user test.
- Soft-launch release candidate snapshot is available at `docs/zodiac-soft-launch-release-candidate.md`.
- Controlled launch freeze checkpoint is available at `docs/zodiac-controlled-launch-freeze.md`.
- Profile Sync frontend scaffold is ready for a future controlled rollout, but
  sync remains disabled, unmounted, and localStorage-only.
- Profile Sync merge logic is ready for a future read-only rollout test, but no
  remote reads/writes are active.
- Profile Sync storage readiness is documented and check-covered, but production
  profile reads/writes remain OFF and fail-closed.

Main remaining production gaps:

- Redis analytics storage is still `noop`.
- 2026-06-19 daily posts were later published by automation (`13/13 sent`), but the run arrived late around `13:36 Kyiv`; scheduler minutes have been shifted away from `:00` / `:30` to reduce GitHub Actions congestion risk.
- Weekly lane is dry-run ready, but weekly live schedule remains intentionally off.
- Real phone Telegram WebView pass remains manual-required after the latest Mini App visual/interactions fixes; browser smoke and Telegram mock do not count as a real phone pass.
- Monetization readiness is documented, but payments, Telegram Stars, and entitlement enforcement remain OFF.
- Real Astro Engine readiness layer is documented and scaffolded: current natal chart remains symbolic, exact mode is `exact_unavailable`, and fake exact planet/house/ascendant data is blocked by `npm run zodiac:astro:check`.
- Mass public launch should wait until real-phone pass is complete, Redis analytics is enabled or explicitly waived, daily stability is observed, and P0/P1 issues are `0`.

## Real Astro Engine Readiness

Package 35 status:

- Current Premium Natal Chart remains symbolic and visually preserved.
- `lib/zodiac-astro-engine.ts` defines `AstroEngineMode`, `BirthInput`, `AstroEngineStatus`, and `ExactChartResult`.
- `lib/zodiac-astro-providers/symbolic-provider.ts` supports the current symbolic UI.
- `lib/zodiac-astro-providers/exact-provider-placeholder.ts` returns `exact_unavailable`.
- The exact placeholder does not return planet degrees, houses, ascendant, or fake ephemeris values.
- Premium Natal UI shows an exact-unavailable engine status panel.
- Privacy policy remains unchanged: no raw birth date, birth time, city query, names, raw results, or generated content in analytics/localStorage.
- Future exact work must follow `docs/zodiac-real-astro-engine.md`.

## Daily Status

Commands:

```bash
npm run zodiac:workflow:check -- --date 2026-06-19
npm run zodiac:publish-date:dry -- --date 2026-06-19
npm run zodiac:report:daily -- --date 2026-06-19 --out data/runtime/zodiac-daily-report-2026-06-19.json
```

Result:

- Workflow file exists: `.github/workflows/zodiac-scheduler.yml`.
- Workflow name: `Zodiac Daily Publisher`.
- Cron attempts after timing hardening: `7 6 * * *`, `19 6 * * *`, `37 6 * * *`, `52 6 * * *`, `11 7 * * *`.
- Static workflow checks: PASS.
- GitHub API run lookup: WARNING only, token not configured in this local environment.
- Ledger for `2026-06-19` after post-cron verification: `sent=13`, `missing=0`, `failed=0`, `pending=0`, `duplicateBlocked=13`.
- Dry-run for `2026-06-19` after publication: `Already Sent 13`, `Duplicate Blocked 13`, `Would Publish 0`, `Telegram API calls 0`.
- Date headers: present, including `Общий гороскоп на 19.06.2026`.
- CTA rows: `13/13 OK`.
- Image posts: `13`.
- Telegram API calls: `0`.
- Live publish calls: `0`.
- Ledger writes: `0`.

Interpretation:

The original audit ran before the expected Kyiv publication window. Post-cron verification later confirmed that automation sent `13/13`, but it was late for the target window. Manual live was not needed. If a future window passes and posts are still missing, run dry-run first and allow manual live only when it reports `Would Publish 13`, `Already Sent 0`, and `Duplicate Blocked 0`.

## Mini App Status

Command:

```bash
npm run zodiac:miniapp:smoke
```

Result: PASS.

Coverage confirmed:

- `/compatibility` HTTP 200.
- Browser mode PASS.
- Telegram mock PASS.
- Main menu categories: `10/10`.
- Angel Numbers checked.
- Couple Core result checked.
- Autosign checks passed.
- 30-day couple calendar checked.
- Action today checked.
- Messages/copy checked.
- Pair save/reopen/share checked.
- Custom selects checked; native visible count `0`.
- VIP cards checked `11/11`.
- VIP tools calculated `11/11`.
- VIP save/share checked `11/11 saved`, `11/11 shared`.
- VIP chart visuals checked `4/4`.
- Pair gates checked.
- Dead CTA checked.
- localStorage privacy checked.
- Free VIP access visible.
- Giveaways locked.
- Mystic checked `3/3`.
- Birth Matrix checked.
- Startapp params checked: `compat`, `compat_love`, `compat_reconciliation`, `compat_gemini`, `mystic`, `vip`, `birth_matrix`, `angel_numbers`, `week`, `profile`, `history`, `favorites`.
- Console errors: `0`.
- Runtime errors: `0`.
- HTTP/network errors: `0`.

## VIP Status

VIP is usable as a functional free-access premium area until `2026-09-17`.

Confirmed by smoke:

- `11/11` VIP cards open.
- `11/11` VIP tools calculate.
- `11/11` VIP save/share flows work.
- Chart visuals are not blank.
- Pair-dependent VIP screens have inline pair actions.
- Giveaways remain locked.
- Payments and Telegram Stars are not enabled.

Monetization readiness:

- Readiness plan: `docs/zodiac-monetization-readiness.md`.
- Current flags remain free/promo: `vipFreeAccessEnabled=true`, `vipPaymentsEnabled=false`, `telegramStarsEnabled=false`.
- Future payment flags must default OFF and must not lock current promo access without a separate approved package.
- No payment-sensitive data is stored.

## Couple Core Status

Couple Core is stable in smoke:

- Pair wizard works.
- Gender/sign/date autosign path works.
- Relationship result opens.
- 30-day couple calendar opens.
- "What to write" copy flow works.
- "Action today" opens.
- Pair save/reopen/share works.
- Profile/history/favorites interactions remain stable.

## Channel Packaging Status

Commands:

```bash
npm run zodiac:navigation:all:dry
npm run zodiac:descriptions:dry
```

Result:

- Navigation targets: `13`.
- Links found: `13/13`.
- Missing links: `0`.
- Invalid links: `0`.
- Navigation errors: `0`.
- Self-link excluded: `12/12`.
- Startapp links: `compat`, `angel_numbers`, `birth_matrix`, `vip`, `mystic`, `week`.
- Telegram API calls: `0`.
- Live publish calls: `0`.
- Ledger writes: `0`.
- Descriptions valid: `13/13`.
- Description warnings: `0`.

The live channel packaging previously applied remains consistent with current dry-run output.

## Weekly Status

Commands:

```bash
npm run zodiac:weekly-assets:validate
npm run zodiac:weekly:dry -- --week 2026-W25
npm run zodiac:weekly:ledger:check
```

Result:

- Weekly visual assets: `91/91 complete`.
- Weekly ledger entries: `0`.
- Weekly ledger problems: `0`.
- Weekly dry-run for `2026-W25`: `Would Publish 13/13`.
- Week range: `15.06–21.06.2026`.
- Weekly range lines: `13/13`.
- CTA rows: `13/13 OK`.
- Image posts: `13`.
- Telegram API calls: `0`.
- Live publish calls: `0`.
- Ledger writes: `0`.

Package 28 weekly live readiness audit:

```text
docs/zodiac-weekly-live-readiness-audit.md
```

Result: weekly dry-runs for `2026-W25` and `2026-W26` are ready, assets are `91/91`, weekly ledger protection is present, and weekly live remains OFF.

Recommendation: do not enable weekly live yet. Weekly publishing should stay dry-run only until daily publishing is stable for several consecutive post-cron days, the real-phone Telegram WebView pass is complete, duplicate-block behavior is confirmed, and the user gives explicit live approval.

## Soft Launch Status

Runbook:

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

Feedback intake and triage:

```text
docs/zodiac-soft-launch-feedback.md
docs/zodiac-bug-triage.md
```

Controlled launch freeze:

```text
docs/zodiac-controlled-launch-freeze.md
```

Result:

- Controlled first-user test: READY for `5-20` trusted testers.
- Public/mass launch: NOT READY.
- Real phone Telegram WebView pass: still manual-required.
- Redis analytics: still `noop` until env is configured, or explicitly waived for the first feedback round.
- Batch 1: `5` Telegram-only testers.
- Expansion to `20`: only if P0 = `0`, P1 = `0` or fixed, share/save work, average rating is `>= 7`, and no privacy leaks are reported.
- Daily stability: continue watching several runs after the cron timing shift.
- P0/P1 gate: must remain `0` before expanding the audience.
- Weekly live: OFF.
- Payments/Stars: OFF.

## Analytics Status

Commands:

```bash
npm run zodiac:analytics:check
npm run zodiac:analytics:storage:check
```

Result:

- Current analytics storage mode: `noop`.
- Redis env configured: `0/2`.
- Dashboard route: `200 OK`.
- Compatibility route: `200 OK`.
- Allowed sample events: accepted.
- Disallowed sample event: rejected with `400 event_not_allowed`.
- Sensitive fields stripped: YES.
- Forbidden payload fields present: `0`.
- VIP events covered: `22/22`.
- Mystic events covered: `27/27`.
- Tarot/Rune events covered: `11/11`.
- Lunar/Ritual events covered: `7/7`.
- Birth Matrix events covered: `6/6`.
- Premium Natal events covered: `9/9`.
- Telegram events covered: `3/3`.
- Retention events covered: `6/6`.
- Compatibility events covered: `8/8`.
- Interaction hardening events covered: `7/7`.
- Tracked events checked: `124`.
- Dashboard route: `/dashboard/networks/zodiac/analytics`, empty/noop state visible and privacy-safe.
- Ledger writes: `0`.
- Live publish calls: `0`.

Redis env gap:

Production metrics will remain empty until both env vars are configured in hosting:

```text
ZODIAC_ANALYTICS_REDIS_URL
ZODIAC_ANALYTICS_REDIS_TOKEN
```

Use a Redis REST URL/token pair, not a raw `redis://` TCP URL. Store both values only as hosting/deployment env vars, redeploy, run `npm run zodiac:analytics:storage:check`, then verify counters on `/dashboard/networks/zodiac/analytics`.

Production verification checklist:

1. Add `ZODIAC_ANALYTICS_REDIS_URL` and `ZODIAC_ANALYTICS_REDIS_TOKEN` in hosting env without committing values.
2. Redeploy the app.
3. Run `npm run zodiac:analytics:storage:check` and confirm mode `redis`.
4. Open `/dashboard/networks/zodiac/analytics`.
5. Trigger a safe Mini App action such as opening a category or selecting a sign.
6. Refresh the dashboard and confirm aggregate counters move.
7. Confirm logs/dashboard/storage do not show names, birth dates, birth times, cities, raw questions, raw intentions, raw result text, Telegram initData, tokens, or raw generated messages.

## Production Safety Status

Commands:

```bash
npm run lint
npm run build
npm run zodiac:ledger:check
npm run production:safety:check
git diff --check
```

Result:

- `npm run lint`: PASS.
- `npm run build`: PASS.
- `npm run zodiac:ledger:check`: PASS, `91` total daily ledger entries, `91 sent`, `0 pending`, `0 failed`, problems `0`.
- `production:safety:check`: OK after Package 19 backup refresh.
- `safeForScheduledPublishing`: `true`.
- `safeForManualPublish`: `true` at the safety-check level; manual daily live is still product-gated by date-specific dry-run and ledger checks.
- Production store mode: `json`.
- Source of truth: `json`.
- JSON/Supabase compare: OK.
- Bot token configured: YES.
- Real publish enabled: `false`.
- Latest backup before refresh: `2026-06-13-19-48-50`, about `125` hours old.
- Fresh backup created: `data/backups/2026-06-19-01-06-53`.
- Fresh backup manifest: `data/backups/2026-06-19-01-06-53/backup-manifest.json`.
- Fresh backup copied runtime files: `35`.
- Assets manifest entries: `165`.
- Secret policy: `.env.local`, database URL, and Telegram token were not copied.
- Restore dry-run: PASS, counts match and no files/database records were changed.
- Backup freshness warning: cleared.
- `git diff --check`: PASS.

Backup freshness is no longer an active warning after Package 19. Keep running backup checks as part of release readiness.

## Live Publish Safety

- Daily live publish: NOT RUN.
- Weekly live publish: NOT RUN.
- Channel live publish: NOT RUN during this audit.
- Ledger manual edits: NOT DONE.
- Telegram API calls from dry-runs/checks: `0`.
- Payments/Stars: OFF.
- Weekly live schedule: OFF.

## Remaining TODO

1. Watch the next daily runs after the cron-minute shift and confirm they arrive closer to the intended Kyiv morning window.
2. Configure Redis REST env for Mini App analytics and verify dashboard counters.
3. Repeat a real phone Telegram WebView pass after the latest select/share/CTA/chart fixes using `docs/zodiac-real-phone-webview-checklist.md`.
4. Run the controlled `5-20` first-user feedback loop from `docs/zodiac-soft-launch-runbook.md`.
5. Keep weekly live OFF until the Package 28 gates are satisfied: several stable daily runs, real-phone Telegram WebView pass, two consecutive weekly dry-run passes, duplicate-block confirmation, and explicit approval.
6. Keep backups fresh or automate backup creation before release checkpoints.
7. Add GitHub API token support for local workflow monitor runs if local Actions visibility is needed.
8. Keep payments/Telegram Stars behind a future monetization implementation package; use `docs/zodiac-monetization-readiness.md` as the plan and do not enable during free VIP period without a product decision.

## Recommended Next 5 Packages

1. Daily scheduler post-window verification after 11:05 Kyiv, then alerting automation.
2. Redis analytics activation and dashboard verification in production.
3. Real phone Telegram WebView pass after the latest interaction fixes using `docs/zodiac-real-phone-webview-checklist.md`.
4. First-user feedback triage package: collect tester notes, classify P0/P1/P2, fix P0/P1 only.
5. Weekly controlled-live package: first manual approved weekly publish, post-live ledger duplicate-block verification, then a later schedule decision.

## Package 37 Refresh: Telegram initData Auth

Current status:

- Telegram WebApp `initData` validation foundation: READY.
- Safe validation utility: `lib/zodiac-telegram-auth.ts`.
- Safe check route: `POST /api/zodiac/telegram-auth/check`.
- Self-check command: `npm run zodiac:telegram-auth:check`.
- Raw `initData` storage: NO.
- Raw `initData` analytics: NO.
- Bot token logging: NO.
- Client Telegram user id trusted without server validation: NO.
- Profile sync implemented: NO.
- Profile sync enabled: NO.
- Remote profile storage: NO.
- Payments/Stars: OFF.
- Weekly live: OFF.

Next readiness step: run the real phone Telegram WebView checklist and confirm
that any future identity-dependent feature uses server-validated `initData`.

## Package 38 Refresh: Profile Sync API Foundation

Current status:

- Profile Sync API route: READY but disabled.
- Route: `GET|POST|DELETE /api/zodiac/profile/sync`.
- Config helper: `lib/zodiac-profile-sync-config.ts`.
- Sanitizer: `lib/zodiac-profile-sync-sanitize.ts`.
- Storage adapter placeholder: `lib/zodiac-profile-sync-storage.ts`.
- Check command: `npm run zodiac:profile-sync:check`.
- Backend storage: `none`.
- Backend writes: NO.
- Frontend sync provider: NO.
- Existing localStorage retention: unchanged.
- Raw birth date/time/city/question/intention/feedback/result text sync: NO.
- Raw initData sync/storage/analytics: NO.
- Payments/Stars: OFF.
- Weekly live: OFF.

## Package 39 Refresh: Frontend Profile Sync Scaffold

Current status:

- Frontend sync client: READY but disabled.
- Hook scaffold: READY but disabled.
- Files: `components/zodiac-mini-app/profile-sync-client.ts` and
  `components/zodiac-mini-app/useProfileSync.ts`.
- Provider mounted in Mini App: NO.
- Visible sync UI status: NO.
- Auto-sync loop: NO.
- GET while disabled: NO.
- POST while disabled: NO.
- DELETE while disabled: NO.
- Outside Telegram or missing `window.Telegram.WebApp.initData`: no network
  calls.
- `initDataUnsafe` usage: NO.
- Raw `initData` stored/logged/analytics: NO.
- Remote merge implemented: NO.
- Existing localStorage retention: unchanged.
- Backend writes: NO.
- Profile sync enabled: NO.
- Payments/Stars: OFF.
- Weekly live: OFF.

Next readiness step: a separate controlled read-only sync/merge package after
real-phone Telegram WebView validation and storage backend review.

## Package 40 Refresh: Profile Sync Read-Only Merge Logic

Current status:

- Pure merge utility: READY but disabled.
- Retention mapper utility: READY but disabled.
- Files: `lib/zodiac-profile-sync-merge.ts` and
  `lib/zodiac-profile-sync-retention-map.ts`.
- Provider mounted in Mini App: NO.
- Remote GET from UI: NO.
- Remote POST/DELETE from UI: NO.
- Backend writes: NO.
- Merge behavior: sanitize-first, history append-only, favorites set-like,
  duplicate-safe, newest timestamp wins, newest-first sorting, max clamps, and
  malformed input fail-safe.
- Raw birth date/time/city/question/intention/feedback/result text sync: NO.
- Raw initData sync/storage/analytics: NO.
- Existing localStorage retention: unchanged.
- Profile sync enabled: NO.
- Payments/Stars: OFF.
- Weekly live: OFF.

## Package 41 Refresh: Profile Sync Storage Adapter Readiness

Current status:

- Storage adapter contract: READY but disabled.
- Backend default: `none`.
- Storage status default: `disabled`.
- Test-memory adapter: check-only and unavailable to runtime unless explicitly
  allowed by a test/check caller.
- Production Redis REST / Vercel KV adapter: not wired.
- Production Supabase adapter: not wired.
- Env validation: presence-only for future Redis/Supabase env names; no secret
  values printed.
- Provider mounted in Mini App: NO.
- Remote GET from UI: NO.
- Remote POST/DELETE from UI: NO.
- Backend writes: NO.
- Existing localStorage retention: unchanged.
- Sanitizer before storage save: YES in check-only memory adapter.
- Raw birth date/time/city/question/intention/feedback/result text sync: NO.
- Raw initData sync/storage/analytics: NO.
- Profile sync enabled: NO.
- Payments/Stars: OFF.
- Weekly live: OFF.

Next readiness steps:

1. Package 42: read-only remote fetch in test mode for an internal test user.
2. Package 43: controlled cohort write with explicit storage backend.
3. Package 44: conflict UX/status after two-device Telegram testing.
