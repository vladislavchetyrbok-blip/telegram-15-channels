# Zodiac Final Production Audit

Audit date: 2026-06-19 01:07 Europe/Kyiv
Audit refresh base HEAD: `bd68e02aa58468ee30b0ac2f991b6e32d548f7b6`
Branch: `main`

This audit is read-only for product/runtime behavior. No live publishing was run, no ledger was edited manually, weekly live schedule stays off, and payments/Telegram Stars stay off.

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

Main remaining production gaps:

- Redis analytics storage is still `noop`.
- 2026-06-19 daily posts were later published by automation (`13/13 sent`), but the run arrived late around `13:36 Kyiv`; scheduler minutes have been shifted away from `:00` / `:30` to reduce GitHub Actions congestion risk.
- Weekly lane is dry-run ready, but weekly live schedule remains intentionally off.
- Real phone Telegram WebView pass remains manual-required after the latest Mini App visual/interactions fixes; browser smoke and Telegram mock do not count as a real phone pass.

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

Weekly live schedule is still off. Weekly publishing should stay dry-run only until a separate live-readiness and explicit approval package.

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
4. Prepare a separate weekly live-readiness package before enabling weekly publishing.
5. Keep backups fresh or automate backup creation before release checkpoints.
6. Add GitHub API token support for local workflow monitor runs if local Actions visibility is needed.
7. Keep payments/Telegram Stars behind a future monetization package; do not enable during free VIP period without a product decision.

## Recommended Next 5 Packages

1. Daily scheduler post-window verification after 11:05 Kyiv, then alerting automation.
2. Redis analytics activation and dashboard verification in production.
3. Real phone Telegram WebView pass after the latest interaction fixes using `docs/zodiac-real-phone-webview-checklist.md`.
4. Weekly live readiness package: dedupe, runbook, explicit approval gates, then schedule decision.
5. Monetization planning package for post-free VIP access: product rules, legal copy, feature flags, and only then Stars/payments implementation.
