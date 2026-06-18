# Zodiac Year Autopilot Runbook

## Mission

The Zodiac Engine publishes 13 posts per publishing date:

- 1 general horoscope post.
- 12 zodiac sign posts.
- 13 posts per day.
- 4,745 expected posts per 365-day year.

The live path must stay ledger-protected, retry-safe, reportable, and able to fall back to `text_only` when an exact weekly image is missing.

## What Runs Daily

The GitHub Actions workflow `.github/workflows/zodiac-scheduler.yml` is the daily scheduler.

Daily sequence:

1. Restore the JSON ledger cache.
2. Calculate the target date in `Europe/Kyiv`.
3. Run `npm run zodiac:scheduler:preflight -- --date YYYY-MM-DD --year-days 365`.
4. Run the ledger-backed publish-by-date command.
5. Generate `data/runtime/zodiac-daily-report-YYYY-MM-DD.json`.
6. Upload the daily report and scheduler preflight report as workflow artifacts.
7. Save the updated ledger cache.

Manual `workflow_dispatch` defaults to `dry-run`. Scheduled runs use `live` mode after preflight passes.

## Cron Time

Current cron attempts:

```text
0 6 * * *
30 6 * * *
0 7 * * *
30 7 * * *
0 8 * * *
```

GitHub Actions cron is UTC-only and can start late under platform load.

- During Kyiv summer time, 06:00 UTC is 09:00 Kyiv.
- During Kyiv winter time, 06:00 UTC is 08:00 Kyiv.
- Primary publish window: 06:00 and 06:30 UTC.
- Backup publish window: 07:00, 07:30, and 08:00 UTC.

All scheduled attempts run in `live` mode after preflight, but repeated attempts are safe because the durable ledger and publish-date dedupe guard block already sent date/slug pairs before Telegram publish calls.

If a stable 09:00 Kyiv wall-clock time is mandatory year-round, update the cron seasonally or move the scheduler to a runtime with timezone-aware cron, such as VPS/Coolify.

## Workflow Monitor

Use the dedicated Zodiac Daily workflow monitor for `.github/workflows/zodiac-scheduler.yml`:

```bash
npm run zodiac:workflow:check -- --date YYYY-MM-DD
```

The monitor validates the `Zodiac Daily Publisher` workflow name, all five cron attempts, scheduled `live` mode, `Europe/Kyiv` target date calculation, the ledger-protected live command, manual `dry-run` default, and daily report artifact upload.

If `GITHUB_TOKEN` or `GH_TOKEN` is configured, it also reads recent workflow runs from GitHub Actions. Without a token, static workflow checks and local ledger/report checks still run, and the command reports a warning instead of failing.

## Weekly Lane Status

Weekly Zodiac posts are prepared and dry-run validated only. Weekly live schedule is not enabled, and weekly live publish must not be started until a separate production decision after daily stability review.

Weekly posts use a Telegram preview-friendly first line with a date range derived from the explicit ISO week id:

```html
<b>✨ Общий гороскоп на неделю 15.06–21.06.2026</b>
<b>♈ Овен | Гороскоп на неделю 15.06–21.06.2026</b>
```

Dry-run check:

```bash
npm run zodiac:weekly:dry -- --week YYYY-Www
```

Expected while weekly is still prepared-only:

- `Would Publish 13`.
- `Weekly Range Lines 13/13`.
- `Telegram API Calls 0`.
- `Live Publish Calls 0`.
- `Ledger Writes 0`.

Do not enable weekly live schedule from this runbook. Enabling weekly publishing requires a separate plan that confirms daily stability, weekly ledger safety, channel targets, and duplicate-block behavior.

## Telegram CTA And Mini App Start Params

Daily and weekly posts keep the existing channel navigation buttons and add a small retention CTA row at the top of the inline keyboard.

Daily CTA row:

- `💞 Проверить совместимость` opens the Mini App with `startapp=compat` or `startapp=compat_{slug}`.
- `🔮 Открыть Mini App` opens the Mini App with `startapp=mystic`.

Weekly CTA row:

- `📅 Прогноз недели` opens the Mini App with `startapp=week`.
- `💞 Совместимость` opens the Mini App with `startapp=compat` or `startapp=compat_{slug}`.

Supported Mini App start params:

- `compat`
- `compat_{slug}`
- `mystic`
- `vip`
- `birth_matrix`
- `angel_numbers`
- `week`
- `profile`
- `history`
- `favorites`

`vip` is supported for deep links and internal navigation, but Telegram posts avoid adding an extra VIP button by default to keep the keyboard compact. VIP free access remains enabled until `2026-09-17`; payments and Telegram Stars remain off.

Pinned channel navigation uses a wider storefront keyboard than daily/weekly posts:

- `🔮 Открыть Астрологический центр` -> `startapp=compat`;
- `💞 Проверить совместимость` / `💞 Совместимость` -> `startapp=compat`;
- `👼 Ангельские числа` -> `startapp=angel_numbers`;
- `🧿 Матрица судьбы` -> `startapp=birth_matrix`;
- `👑 VIP бесплатно` -> `startapp=vip`;
- `🔮 Мистика` -> `startapp=mystic`;
- `📅 Прогноз недели` -> `startapp=week`.

Sign channel pins include the general channel and the other 11 signs; the current sign is intentionally excluded from its own grid.

Dry-run commands print CTA summaries and must still show `Telegram API Calls 0` and `Ledger Writes 0`:

```bash
npm run zodiac:publish-date:dry -- --date YYYY-MM-DD
npm run zodiac:weekly:dry -- --week YYYY-Www
```

## How Ledger Prevents Duplicates

The key is always:

```text
YYYY-MM-DD:slug
```

Live publish by date checks the ledger before each slug:

- `sent`: skip, never republish.
- `pending`: skip, protected until stale recovery.
- `failed`: retryable through explicit retry flow.
- missing entry: publishable for the target date.

The low-level zodiac pipeline blocks direct live use unless it is called as an approved child of the publish-by-date orchestrator and the ledger entry is already `pending`.

## Delayed Schedule Recovery

GitHub Actions schedule runs can be delayed. Do not start manual live recovery just because the 06:00 or 06:30 UTC attempt has not appeared yet; first check the backup window and the ledger.

Manual live recovery is allowed only when all are true:

- `npm run zodiac:publish-date:dry -- --date YYYY-MM-DD` shows 13 publishable posts for the target date.
- The dry-run shows `Already Sent 0` and `Duplicate Blocked 0`.
- The ledger has no `sent` entries for the target date.
- The target date is explicit and was checked with the `Europe/Kyiv` calendar policy.

Manual live recovery is forbidden when the dry-run or report shows the date is already protected, including `Already Sent 13` or `Duplicate Blocked 13`. In that case, the scheduled or backup run already did its job and another live attempt must not be started.

## Daily Status

Check current autonomy state:

```bash
npm run zodiac:status -- --date YYYY-MM-DD
```

Check a specific publish date:

```bash
npm run zodiac:publish-date:check -- --date YYYY-MM-DD
```

Generate a daily report:

```bash
npm run zodiac:report:daily -- --date YYYY-MM-DD
```

Generate an artifact-ready JSON report:

```bash
npm run zodiac:report:daily -- --date YYYY-MM-DD --out data/runtime/zodiac-daily-report-YYYY-MM-DD.json
```

## Retry Failed Posts

Dry-run first:

```bash
npm run zodiac:retry:failed -- --date YYYY-MM-DD --dry-run
```

Live retry requires explicit approval:

```bash
npm run zodiac:retry:failed -- --date YYYY-MM-DD --live --approved
```

Rules:

- Only `failed` ledger entries are retried.
- `sent` entries are never retried.
- `pending` entries require stale pending recovery first.
- Missing images still publish as `text_only`.

## Recover Stale Pending

Inspect stale pending entries:

```bash
npm run zodiac:recover:stale -- --date YYYY-MM-DD --stale-minutes 60 --dry-run
```

Mark stale pending entries as failed so they can be retried:

```bash
npm run zodiac:recover:stale -- --date YYYY-MM-DD --stale-minutes 60 --mark-failed --approved
```

This does not publish anything and does not call Telegram.

## Pause Scheduler

Pause by editing `.github/workflows/zodiac-scheduler.yml` and commenting out the `schedule:` block, or by disabling the workflow in GitHub Actions.

For emergency local safety, do not run:

```bash
npm run zodiac:publish-date:live -- --date YYYY-MM-DD
```

## Resume Scheduler

Before resuming:

```bash
npm run zodiac:weekly-assets:validate
npm run zodiac:ledger:check
npm run zodiac:year:preflight -- --from YYYY-MM-DD --days 365
npm run zodiac:publish-date:dry -- --date YYYY-MM-DD
npm run zodiac:scheduler:preflight -- --date YYYY-MM-DD --year-days 365
```

Resume only if all commands pass and the scheduler workflow is configured as expected.

## Regenerate Reports

Daily report:

```bash
npm run zodiac:report:daily -- --date YYYY-MM-DD
```

History report:

```bash
npm run zodiac:report:history -- --days 30
```

Or an explicit period:

```bash
npm run zodiac:report:history -- --from YYYY-MM-DD --to YYYY-MM-DD
```

## 365-Day Preflight

Run:

```bash
npm run zodiac:year:preflight -- --from YYYY-MM-DD --days 365
```

Expected:

- Days checked: 365.
- Slugs per day: 13.
- Total expected posts: 4,745.
- Duplicate date/slug keys: 0.
- Fatal errors: 0.
- Missing images allowed only as `text_only`.
- Telegram API calls: 0.
- Live publish calls: 0.
- Ledger writes: 0.

## Required Secrets

Required for live publishing:

- `TELEGRAM_BOT_TOKEN`
- `ZODIAC_GENERAL_CHANNEL_ID`
- `ZODIAC_ARIES_CHANNEL_ID`
- `ZODIAC_TAURUS_CHANNEL_ID`
- `ZODIAC_GEMINI_CHANNEL_ID`
- `ZODIAC_CANCER_CHANNEL_ID`
- `ZODIAC_LEO_CHANNEL_ID`
- `ZODIAC_VIRGO_CHANNEL_ID`
- `ZODIAC_LIBRA_CHANNEL_ID`
- `ZODIAC_SCORPIO_CHANNEL_ID`
- `ZODIAC_SAGITTARIUS_CHANNEL_ID`
- `ZODIAC_CAPRICORN_CHANNEL_ID`
- `ZODIAC_AQUARIUS_CHANNEL_ID`
- `ZODIAC_PISCES_CHANNEL_ID`

Optional admin alert hook:

- `ZODIAC_ADMIN_ALERT_CHAT_ID`

Never print secret values in reports or logs.

## GO / NO-GO For Live Mode

GO only when all are true:

- `npm run build` passes.
- `npm run lint` passes.
- `npm run zodiac:weekly-assets:validate` reports 91/91.
- `npm run zodiac:ledger:check` reports 0 problems.
- `npm run zodiac:year:preflight -- --from YYYY-MM-DD --days 365` passes.
- `npm run zodiac:scheduler:preflight -- --date YYYY-MM-DD --year-days 365` passes.
- Required secret names are configured in the deployment runtime.
- Workflow runs preflight before live publish.
- Ledger has no stale `pending` entries unless intentionally recovered.
- Failed entries have been reviewed and retried through the retry command.

NO-GO when any are true:

- Build or lint fails.
- Year preflight has fatal errors.
- Ledger check reports malformed or duplicate entries.
- Required channel targets are missing.
- Workflow would call live publish without preflight.
- Any direct live helper bypasses the ledger.
- Operator is unsure whether the target date already published.
