# Zodiac Autopilot Reliability

## Scheduled Cron Triggers
* **Primary Window**: `0 6 * * *`, `30 6 * * *` (06:00/06:30 UTC)
* **Backup Window**: `0 7 * * *`, `30 7 * * *`, `0 8 * * *` (07:00/07:30/08:00 UTC)

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

This checks `.github/workflows/zodiac-scheduler.yml`, the five cron attempts, scheduled live mode, `Europe/Kyiv` target date calculation, the ledger-protected live command, manual `dry-run` default, report artifact upload, and local ledger/report counts for the requested date.

If `GITHUB_TOKEN` or `GH_TOKEN` is not configured, the monitor still completes static and local checks and reports: `GitHub API token not configured; static workflow checks completed`.

## Manual Recovery Procedure
If both crons fail or the pipeline stalls:
1. Verify the current ledger state using `npm run zodiac:status` or checking `data/state/zodiac-publish-ledger.json`.
2. Perform a dry-run check: `npm run zodiac:publish-date:dry -- --date YYYY-MM-DD`.
3. Continue only if dry-run shows 13 publishable posts, `Already Sent 0`, `Duplicate Blocked 0`, and the ledger has no `sent` entries for the date.
4. If dry-run shows `Already Sent 13` or `Duplicate Blocked 13`, manual live is forbidden because the date is already protected.
5. Once verified, you may trigger the workflow manually using GitHub Actions `workflow_dispatch` (Live mode, with the correct explicit date).

## 🚨 RULE: Never Run Live Twice
**NEVER** run the live publish pipeline twice for the same date unless a `dry-run` and a full ledger audit have confirmed it is 100% safe to do so. The system is designed to autonomously protect itself from duplicates using the durable ledger.
