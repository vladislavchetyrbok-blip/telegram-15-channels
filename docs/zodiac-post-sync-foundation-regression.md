# Zodiac Post Sync Foundation Regression

Date: 2026-06-19
Branch: `main`
Base HEAD before this documentation update: `9da235e docs: add real astro engine provider fixture plan`

This report closes Package 45 after Packages 41-44. It is a safety regression
checkpoint only. It does not authorize live publishing, profile sync rollout,
weekly live scheduling, payments, Telegram Stars, or exact astrology claims.

Package 52 follow-up note: Sonnik/Dream Dictionary is now hidden backlog for the
current soft launch, date inputs use a mobile-friendly `ДД.ММ.ГГГГ` field, and
personal smoke/docs fixture values have been replaced with neutral examples.

## Scope

Packages covered:

- Package 41: disabled Profile Sync storage adapter readiness.
- Package 42: disabled Profile Sync status UI in Profile.
- Package 43: Profile Sync privacy stress tests and route hardening.
- Package 44: Real Astro Engine fixture harness and provider decision docs.
- Package 45: full safety regression after the sync/astro foundations.

## Regression Result

Overall result: PASS.

Product readiness for a controlled soft-launch group: `92%`.

Interpretation:

- Controlled invite of `5-20` trusted users: YES, after or during a real-phone Telegram WebView sanity pass.
- Mass launch: NO.
- Weekly live: NO.
- Payments / Telegram Stars: NO.
- Profile sync for users: NO.
- Exact astrology engine: NO.

## Profile Sync State

- Profile sync enabled: NO.
- Frontend sync provider mounted: NO.
- Profile status UI: visible and disabled.
- Remote profile API calls while disabled: `0` in Mini App smoke.
- Backend reads: OFF.
- Backend writes: OFF.
- Default backend: `none`.
- Test-memory backend: check-only.
- localStorage fallback: preserved.

Privacy checks confirm that sanitizer, merge, route, and check-only storage do
not retain raw birth date, birth time, city, raw question, raw intention, raw
feedback, raw result text, raw name, raw phone, or raw Telegram initData.

## Astro Engine State

- Current Premium Natal mode: symbolic.
- Exact provider status: `exact_unavailable`.
- Fake planet degrees: NO.
- Fake houses: NO.
- Fake ascendant: NO.
- External astro API calls: `0`.
- Fixture harness: PASS with non-personal placeholder fixtures.

The fixture harness prepares future exact-provider validation without enabling
exact mode or sending birth data anywhere.

## Mini App Regression

`npm run zodiac:miniapp:smoke`: PASS.

Confirmed from smoke output:

- Main menu categories: `10/10`.
- Profile sync status visible: YES.
- Profile sync network calls: `0`.
- VIP tools: `11/11`.
- VIP save/share: `11/11 saved`, `11/11 shared`.
- Premium Natal autosign/chart: YES.
- Final Astro Maps checked: `6`.
- Couple Core: PASS.
- Mystic: PASS.
- Tarot/Rune: PASS.
- Lunar/Ritual: PASS.
- Birth Matrix: PASS.
- Angel Numbers: PASS.
- Profile/History/Favorites: PASS.
- Feedback: PASS.
- Safe Share: PASS.
- Giveaways locked: YES.
- Console/runtime/network errors: `0`.

`npm run zodiac:desktop:qa`: PASS.

Viewports checked:

- `390x844`
- `412x915`
- `1440x900`

Result: no horizontal overflow, no console/runtime/network errors, no detected
native white select regression.

## Daily Publishing Safety

Daily live publish was not run during this package.

`npm run zodiac:workflow:check -- --date 2026-06-20`: static PASS with warnings
only:

- GitHub API token not configured.
- Local daily report for `2026-06-20` not present yet.

The workflow static checks confirm:

- Workflow file exists.
- Workflow name is `Zodiac Daily Publisher`.
- Cron attempts are `7 6`, `19 6`, `37 6`, `52 6`, `11 7` UTC.
- Scheduled mode remains live.
- Target date uses Europe/Kyiv.
- Live command is ledger-protected.
- Manual dispatch default remains dry-run.
- Daily report artifact upload remains configured.

`npm run zodiac:publish-date:dry -- --date 2026-06-20`: PASS.

Dry-run result:

- Expected: `13`.
- Would publish: `13/13`.
- Already sent: `0`.
- Duplicate blocked: `0`.
- CTA rows checked: `13/13`.
- CTA rows OK: `13/13`.
- Telegram API calls: `0`.
- Ledger writes: `0`.
- Live publish calls: `0`.

## Analytics And Storage

- `npm run zodiac:analytics:check`: PASS.
- `npm run zodiac:analytics:storage:check`: PASS.
- Current analytics storage mode: `noop`.
- Redis env configured: NO.
- Storage warning: expected readiness gap, not fatal.
- Sensitive payload fields present: `0`.
- Live publish calls: `0`.
- Ledger writes: `0`.

Real metrics require:

- `ZODIAC_ANALYTICS_REDIS_URL`
- `ZODIAC_ANALYTICS_REDIS_TOKEN`

Secret values must stay in deployment env only and must not be committed.

## Full Check Matrix

| Check | Result |
| --- | --- |
| `npm run lint` | PASS |
| `npm run build` | PASS |
| `npm run zodiac:miniapp:smoke` | PASS |
| `npm run zodiac:desktop:qa` | PASS |
| `npm run zodiac:astro:check` | PASS |
| `npm run zodiac:astro:fixtures:check` | PASS |
| `npm run zodiac:ledger:safety:check` | PASS, fail-closed corruption tests |
| `npm run zodiac:telegram-auth:check` | PASS |
| `npm run zodiac:profile-sync:check` | PASS, `65/65` |
| `npm run zodiac:analytics:check` | PASS |
| `npm run zodiac:analytics:storage:check` | PASS, `noop` warning |
| `npm run zodiac:workflow:check -- --date 2026-06-20` | PASS with expected warnings |
| `npm run zodiac:publish-date:dry -- --date 2026-06-20` | PASS |
| `npm run production:safety:check` | PASS before docs update |
| `git diff --check` | To run after docs update |

## Safety Boundaries

- Live publish: NO.
- Ledger changed manually: NO.
- Weekly live: NO.
- Payments/Stars: OFF.
- Profile sync for users: OFF.
- Backend profile writes: NO.
- Raw Telegram initData stored: NO.
- Raw personal inputs stored in sync path: NO.
- Exact astrology enabled: NO.

## Remaining Work

1. Real phone Telegram WebView pass remains mandatory before broad launch.
2. Redis analytics env setup remains optional but recommended before wider launch.
3. Observe the next daily scheduled runs after cron timing hardening.
4. Keep weekly live OFF until a separate weekly-live readiness decision.
5. Keep payments/Stars OFF until a separate implementation and approval package.
6. Profile sync can only move to read-only rollout in a future package with explicit approval.
7. Exact astrology provider can only be implemented later with a real provider and fixture validation.

## Recommendation

Controlled soft launch to `5-20` trusted users: YES, with the real-phone pass as
the next practical gate.

Mass launch: NO.

Weekly live: NO.

Payments/Stars: NO.
