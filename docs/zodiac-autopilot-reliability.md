# Zodiac Autopilot Reliability

## Scheduled Cron Triggers
* **Staggered Window**: `7 6 * * *`, `19 6 * * *`, `37 6 * * *`, `52 6 * * *`, `11 7 * * *` (06:07/06:19/06:37/06:52/07:11 UTC)
* The schedule intentionally avoids common `:00` / `:30` congestion minutes after the 2026-06-19 run arrived late around 13:36 Kyiv.

## Why a Backup Exists
GitHub Actions schedule events can be delayed, missed, or dropped during high load periods on GitHub's infrastructure. Multiple attempts give the daily Zodiac publish more chances to run without requiring manual recovery.

## Duplicate Safety Model
Duplicate posts are strictly prevented by the **Durable Ledger** (`data/state/zodiac-publish-ledger.json`).
* If an earlier run succeeds, it locks the entries or marks them as `sent`. Later attempts parse the ledger, recognize the date has already been processed, and skip publishing before Telegram calls.
* If the first run never fires, a later backup run acts as the primary and publishes the target date.
* If a run is still in progress, the workflow concurrency group and durable ledger prevent duplicate sends.

## Workflow Monitor
Use the dedicated monitor for the `Zodiac Daily Publisher` workflow:

```bash
npm run zodiac:workflow:check -- --date YYYY-MM-DD
```

This checks `.github/workflows/zodiac-scheduler.yml`, the five staggered cron attempts, scheduled live mode, `Europe/Kyiv` target date calculation, the ledger-protected live command, manual `dry-run` default, report artifact upload, and local ledger/report counts for the requested date.

If `GITHUB_TOKEN` or `GH_TOKEN` is not configured, the monitor still completes static and local checks and reports: `GitHub API token not configured; static workflow checks completed`.

## Weekly Lane

Weekly Zodiac publishing is currently dry-run/prepared only. No weekly live schedule is enabled.

Use:

```bash
npm run zodiac:weekly:dry -- --week YYYY-Www
```

Weekly dry-run must show `Weekly Range Lines 13/13`, `Telegram API Calls 0`, `Live Publish Calls 0`, and `Ledger Writes 0`. The first line of every weekly post includes the explicit week range, for example `15.06–21.06.2026`, calculated from `--week` rather than system time.

Package 28 weekly live readiness audit is documented in:

```text
docs/zodiac-weekly-live-readiness-audit.md
```

Current decision: weekly live remains OFF. Weekly live publishing can be enabled only by a separate decision after daily scheduler stability is confirmed, the real-phone Telegram WebView pass is complete, two consecutive weekly dry-runs pass, duplicate-block behavior is confirmed, and explicit approval is given.

## Retention CTA Checks

Daily and weekly dry-runs validate the Telegram inline keyboard retention CTA row without making Telegram API calls.

- Daily CTA: `💞 Проверить совместимость` and `🔮 Открыть Mini App`.
- Weekly CTA: `📅 Прогноз недели` and `💞 Совместимость`.
- Supported Mini App start params: `compat`, `compat_{slug}`, `mystic`, `vip`, `birth_matrix`, `angel_numbers`, `week`.
- VIP remains free until `2026-09-17`; payments and Telegram Stars remain off.

Expected dry-run safety counters remain:

- `Telegram API Calls 0`;
- `Ledger Writes 0`;
- `CTA Rows Checked 13/13`;
- `CTA Rows OK 13/13`.

## Manual Recovery Procedure
If both crons fail or the pipeline stalls:
1. Verify the current ledger state using `npm run zodiac:status` or checking `data/state/zodiac-publish-ledger.json`.
2. Perform a dry-run check: `npm run zodiac:publish-date:dry -- --date YYYY-MM-DD`.
3. Continue only if dry-run shows 13 publishable posts, `Already Sent 0`, `Duplicate Blocked 0`, and the ledger has no `sent` entries for the date.
4. If dry-run shows `Already Sent 13` or `Duplicate Blocked 13`, manual live is forbidden because the date is already protected.
5. Once verified, you may trigger the workflow manually using GitHub Actions `workflow_dispatch` (Live mode, with the correct explicit date).

## 🚨 RULE: Never Run Live Twice
**NEVER** run the live publish pipeline twice for the same date unless a `dry-run` and a full ledger audit have confirmed it is 100% safe to do so. The system is designed to autonomously protect itself from duplicates using the durable ledger.
