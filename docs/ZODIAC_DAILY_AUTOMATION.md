# ZODIAC DAILY AUTOMATION

## Overview
This document outlines the approach for daily automation of the Zodiac publishing pipeline using GitHub Actions or a local cron scheduler.

## Current Policy
**All automated workflows are currently configured as MANUAL SETUP ONLY.**
- **Default Mode:** Dry-run. Any automated run will execute the pipeline in dry-run mode and generate a report, but will NOT publish to Telegram.
- **Live Publishing:** Strictly manual. Live publishing requires a human operator to explicitly pass the `--approved` flag.
- **Active Workflow:** There is no active workflow that automatically publishes to Telegram.

## Scheduler Setup (Manual/Dry-Run)
If you wish to set up a scheduler (e.g., cron or GitHub Actions) to generate plans and run validations automatically:
1. Configure your job to run: `npm run zodiac:pipeline`
2. The pipeline will generate the plan, validate it, and run a dry-run check.
3. The results will be saved to `data/runtime/` and can be audited.

## Activating Live Publishing
To perform a live publish, an operator must manually run the pipeline with the `--live` and `--approved` flags:
```bash
npm run zodiac:pipeline -- --live --approved
```
This ensures a human has reviewed the generated plan and visually confirmed readiness before any data reaches the public channels.
