# Zodiac Autopilot Reliability

## Scheduled Cron Triggers
* **Primary Cron**: `0 6 * * *` (06:00 UTC)
* **Backup Cron**: `30 6 * * *` (06:30 UTC)

## Why a Backup Exists
GitHub Actions schedule events are occasionally missed, delayed, or dropped during high load periods on GitHub's infrastructure. To ensure the Zodiac daily publish fires reliably, a secondary backup cron is configured to run 30 minutes after the primary.

## Duplicate Safety Model
Duplicate posts are strictly prevented by the **Durable Ledger** (`data/state/zodiac-publish-ledger.json`).
* If the primary run succeeds, it locks the entries or marks them as `sent`. When the backup run fires 30 minutes later, it parses the ledger, recognizes the date has already been processed, and skips publishing (publishing 0 items).
* If the primary run never fires, the backup run acts as the primary and successfully publishes the target date.
* If the primary run is still running or hung, concurrency groups and the atomic nature of the durable ledger ensure duplicates are not created.

## Manual Recovery Procedure
If both crons fail or the pipeline stalls:
1. Verify the current ledger state using `npm run zodiac:status` or checking `data/state/zodiac-publish-ledger.json`.
2. Perform a dry-run check: `npm run zodiac:publish:date:dry -- --date YYYY-MM-DD` to ensure safety constraints are working correctly.
3. Once verified, you may trigger the workflow manually using GitHub Actions `workflow_dispatch` (Live mode, with the correct explicit date).

## 🚨 RULE: Never Run Live Twice
**NEVER** run the live publish pipeline twice for the same date unless a `dry-run` and a full ledger audit have confirmed it is 100% safe to do so. The system is designed to autonomously protect itself from duplicates using the durable ledger.
