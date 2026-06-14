# Zodiac Autonomous Engine 365-Day Spec

## 1. Mission

Zodiac Engine must autonomously publish daily horoscope content for every zodiac channel without requiring a manual launch.

- Publish 13 zodiac posts per calendar day.
- Operate autonomously for at least 365 consecutive days.
- Produce 4,745 posts per year: 13 posts/day * 365 days.
- Prevent duplicate publishes for the same date and slug.
- Avoid silent failures: every run must produce a visible report or alert.
- Use `text_only` mode whenever the exact weekly image is missing.
- Never use placeholders as publishable images.

## 2. Definition Of Autonomy

The system is autonomous only when all of these conditions are true:

- Automatic daily run exists and does not require a human to start it.
- Publishing date is calculated in Kyiv timezone, not from an ambiguous server-local date.
- Durable ledger is the source of truth for every date/slug publish state.
- Failed posts can be retried through an explicit retry command.
- Stale `pending` entries are detected and repaired through an explicit recovery flow.
- Daily reports summarize sent, skipped, failed, image, and `text_only` counts.
- Admin alerts are sent for failures, missed days, stale pending records, unsafe config, or partial runs.
- Year preflight can verify 365 days of upcoming publishing before scheduler live mode is enabled.
- Dashboard shows automation health without exposing channel targets or secrets.
- Operator runbook documents normal operation, emergency stop, retry, backfill, and recovery.

## 3. Current State

The current MVP already has the core safety primitives:

- Ledger V1 exists and has been pushed.
- Publish-by-date orchestrator exists and has been pushed.
- Publish-date health check exists and has been pushed.
- Local ledger contains sent records for 2026-06-13 and 2026-06-14.
- Text-only fallback exists for missing exact weekly images.
- Missing images do not block publishing when text exists.
- Current asset state is intentionally tracked outside this spec: assets are being completed separately.

Short-term priority remains safety: all live zodiac publishing paths must go through the ledger-backed publish-by-date orchestrator.

## 4. Target Architecture

Production autonomy should run as a small scheduled worker with durable state and explicit operator visibility.

Recommended components:

- VPS/Coolify/cron worker as the primary autonomous runtime.
- Supabase/Postgres ledger as the durable publish source of truth.
- Publish-by-date orchestrator as the only live zodiac publish entry point.
- Telegram bot for channel posting.
- Daily report generated after every run.
- Admin alert channel for failures and operational warnings.
- Dashboard status panel for recent run state, next run, ledger health, and readiness.

The worker should run once per Kyiv calendar day. It should compute the target date explicitly, run preflight checks, publish by date through the ledger, run a health check, write a report, and alert if anything is incomplete.

## 5. Required Phases

### Phase 1: Close Old Live Bypass Paths

Goal: no zodiac live publish can happen outside the ledger-backed publish-by-date orchestrator.

Requirements:

- Block direct `zodiac:pipeline --live` use unless invoked as an approved child of the publish-by-date orchestrator.
- Require a matching ledger `pending` entry before any low-level Telegram send.
- Keep dry-run and review tools available.
- Redact all connection-check output.

### Phase 2: Year-Check / 365-Day Preflight

Goal: verify that the next 365 Kyiv dates are publishable before scheduler live mode is enabled.

Requirements:

- Validate 4,745 expected date/slug publish keys.
- Confirm no duplicate ledger keys.
- Confirm no empty generated text.
- Confirm missing images resolve to `text_only`.
- Confirm every zodiac slug has a configured publish target without printing target values.
- Fail on fatal errors and return non-zero status.

### Phase 3: Daily Report

Goal: every run leaves a concise operational report.

Report fields:

- target date
- total expected posts
- sent count
- skipped duplicate count
- failed count
- pending count
- image count
- `text_only` count
- missing image slug list
- retryable failures
- started and finished timestamps

### Phase 4: Retry Failed And Stale Pending Recovery

Goal: operators can recover safely without duplicate publishing.

Requirements:

- `sent` records never republish.
- `failed` records can retry only through an explicit retry-failed command.
- `pending` records must not retry automatically until stale-pending repair runs.
- Stale pending repair must preserve the original attempt history.
- Retries must increment `attempt_count`.

### Phase 5: Supabase/Postgres Ledger Migration

Goal: move production autonomy from local JSON to durable shared storage.

Requirements:

- Postgres table with unique date/slug constraint.
- Atomic status transitions.
- Locking or advisory lock around a daily run.
- Migration/backfill from local JSON ledger.
- Read-only parity check between JSON and Postgres during migration.

### Phase 6: Scheduler Dry-Run

Goal: prove unattended operation without sending Telegram messages.

Requirements:

- Run automatically on schedule in dry-run mode.
- Produce daily reports.
- Produce admin alerts for simulated failures.
- Validate Kyiv date handling.
- Run for several days before live scheduler is enabled.

### Phase 7: Scheduler Live

Goal: enable autonomous live publishing with duplicate protection.

Requirements:

- Scheduler calls only the publish-by-date live command.
- Live mode requires explicit production environment flags.
- Daily health check runs after publishing.
- Non-13/13 results trigger alerts.

### Phase 8: Admin Alerts

Goal: failures cannot remain silent.

Alert triggers:

- Telegram API timeout.
- Bot token invalid.
- Missing channel target.
- Duplicate attempt blocked.
- Stale pending detected.
- Partial daily publish.
- Scheduler missed day.
- Ledger unavailable.
- Year preflight fatal error.

### Phase 9: Dashboard Status

Goal: operators can see automation health without touching the terminal.

Dashboard should show:

- today and tomorrow readiness
- latest scheduler run
- latest publish report
- ledger summary
- failed/pending/stale counts
- image vs `text_only` counts
- next expected run
- safety mode

The dashboard must not expose tokens, chat IDs, channel IDs, or raw environment values.

### Phase 10: Operator Runbook

Goal: standard operation and recovery are documented.

Runbook sections:

- daily normal operation
- preflight before enabling live scheduler
- emergency stop
- retry failed posts
- stale pending repair
- missed day backfill
- ledger backup and restore
- dashboard interpretation
- when not to publish

### Phase 11: Annual Recharge Process

Goal: support five years of operation through yearly content recharge.

Requirements:

- Generate or prepare the next year of zodiac content before the current year ends.
- Run 365-day preflight for the next year.
- Validate text, date coverage, channel targets, and ledger keys.
- Carry forward the text-only image fallback rule.
- Keep recharge independent from the live scheduler.

## 6. Proposed Commands

Current commands:

```bash
npm run zodiac:publish-date:check -- --date YYYY-MM-DD
npm run zodiac:publish-date:dry -- --date YYYY-MM-DD
npm run zodiac:publish-date:live -- --date YYYY-MM-DD
npm run zodiac:ledger:check
```

Proposed commands:

```bash
npm run zodiac:year:check -- --start-date YYYY-MM-DD --days 365
npm run zodiac:retry-failed -- --date YYYY-MM-DD
npm run zodiac:repair-stale-pending -- --date YYYY-MM-DD --older-than-minutes 60
npm run zodiac:scheduler:dry
npm run zodiac:scheduler:live
npm run zodiac:report:daily -- --date YYYY-MM-DD
```

Command rules:

- `zodiac:publish-date:live` is the only live publish command.
- `zodiac:scheduler:live` must call `zodiac:publish-date:live`, not any low-level publisher.
- Retry and repair commands must use the ledger and must never bypass duplicate protection.
- Check/report commands must be read-only.

## 7. Data Model Proposal

Supabase/Postgres is preferred for production autonomy.

### `zodiac_publish_ledger`

Purpose: one row per date/slug publish state.

Suggested fields:

- `id`
- `date`
- `slug`
- `status`
- `media_mode`
- `attempt_count`
- `error_message`
- `created_at`
- `updated_at`
- `sent_at`
- `locked_at`

Constraints:

- unique `(date, slug)`
- status enum: `pending`, `sent`, `failed`, `skipped`
- media mode enum: `image`, `text_only`

### `zodiac_publish_reports`

Purpose: one row per publish-date run report.

Suggested fields:

- `id`
- `date`
- `status`
- `expected_count`
- `sent_count`
- `skipped_count`
- `failed_count`
- `pending_count`
- `image_count`
- `text_only_count`
- `error_message`
- `created_at`
- `updated_at`

### `zodiac_scheduler_runs`

Purpose: one row per scheduler attempt.

Suggested fields:

- `id`
- `date`
- `status`
- `attempt_count`
- `error_message`
- `created_at`
- `updated_at`
- `started_at`
- `finished_at`
- `locked_at`

## 8. Failure Scenarios

- Telegram API timeout: mark affected slug failed, keep report visible, alert admin.
- Bot token invalid: block the run before posting, mark scheduler run failed, alert admin.
- Channel target missing: block affected slug, do not print raw target values, alert admin.
- Duplicate attempt: skip if ledger status is `sent` or protected `pending`.
- Stale pending: block automatic retry until stale-pending repair runs.
- Server reboot: recover from durable ledger and scheduler run records.
- Scheduler missed day: operator can backfill by date through publish-by-date command.
- Image missing: publish text-only and record `media_mode = text_only`.
- Content generation fallback: block empty text; allow deterministic fallback text only if validated.

## 9. Recovery Rules

- `sent` never republishes.
- `failed` can retry only with the retry-failed command.
- `pending` requires stale-pending repair before retry.
- Missing image becomes `text_only`.
- Missed day can be manually backfilled safely with publish-by-date.
- Recovery commands must write reports and increment attempt counts.
- Recovery must never require editing `.env` files or exposing secret values.

## 10. 365-Day Preflight Requirements

The year preflight must check 365 days ahead from a supplied start date.

Required checks:

- Total expected posts: 4,745.
- Fatal errors: 0.
- Missing images allowed only as `text_only`.
- Empty text count: 0.
- Duplicate ledger keys: 0.
- Missing channel targets: 0.
- Invalid slugs: 0.
- Invalid dates: 0.
- Unsafe live bypass paths: 0.
- Scheduler configuration present for dry-run before live mode.

Preflight should produce a machine-readable report and a human-readable summary.

## 11. MVP Vs Production

Local MVP:

- Local JSON ledger is acceptable only for local controlled publishing.
- Manual publish-by-date runs are acceptable.
- Windows Task Scheduler can be used temporarily for dry-run experiments.

Production autonomy:

- Supabase/Postgres ledger is required for real autonomous deployment.
- VPS/Coolify/cron is preferred over a personal workstation scheduler.
- Admin alerts are required before live scheduler mode.
- Dashboard status is required before long-term unattended operation.
- Every live run must be recoverable from durable state.

## 12. Final Checklist Before Enabling Live Scheduler

- Old zodiac live bypass paths are closed.
- `zodiac:publish-date:dry` passes for today and tomorrow.
- `zodiac:publish-date:check` shows no unsafe duplicate state.
- `zodiac:year:check -- --days 365` passes with 4,745 expected posts.
- Ledger storage is Supabase/Postgres, not local JSON.
- Scheduler dry-run has operated successfully for several days.
- Admin alerts are verified.
- Dashboard status is accurate and redacted.
- Operator runbook is complete.
- Emergency stop procedure is tested.
- Missing images are confirmed to publish as `text_only`.
- No placeholder image can be published.
