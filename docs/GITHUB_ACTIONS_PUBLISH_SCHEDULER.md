# GitHub Actions Publish Scheduler

Workflow: `.github/workflows/publish-scheduler.yml`

It runs `npm run publish:due` once per hour at minute 17:

```yaml
cron: "17 * * * *"
```

The workflow also supports manual launch through `workflow_dispatch`.

## Current Mode

The production scheduler currently uses JSON storage:

- `PUBLISH_DUE_STORE=json`
- runtime plan: `data/runtime/weekly-content-plan.json`
- runtime logs: `data/runtime/publication_logs.json`
- latest run status: `data/runtime/publish-scheduler.json`

`DATABASE_URL` is not required for the current JSON mode.

GitHub Actions restores and saves a small scheduler runtime cache for:

- `data/runtime/publication_logs.json`
- `data/runtime/publish-scheduler.json`

This lets duplicate protection see successful publication logs from previous hourly GitHub runs without requiring a database.

## Required GitHub Secrets

Add these in GitHub repository settings:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_DRY_RUN`
- `TELEGRAM_REAL_PUBLISH_ENABLED`
- `AUTOPUBLISH_ENABLED`
- `AUTOPUBLISH_DAILY_LIMIT_PER_CHANNEL`
- `AUTOPUBLISH_MAX_POSTS_PER_DAY`
- `AUTOPUBLISH_TIME`
- `AUTOPUBLISH_TIMEZONE`
- `AUTOPUBLISH_TIME_START`
- `AUTOPUBLISH_TIME_END`
- `AUTOPUBLISH_DAYS`
- `AUTOPUBLISH_WORKER_INTERVAL_MS`

Optional/future secrets:

- `DATABASE_URL`: only needed after moving from JSON store to PostgreSQL/Supabase.
- `OPENAI_API_KEY`: only needed if future due-publish steps call AI generation remotely.

Tokens are read from environment variables only. They are not stored in code.

## Real Publish And Pause

Real Telegram publishing is enabled only when all safety flags allow it:

- `PUBLISH_DUE_DRY_RUN=false`
- `TELEGRAM_DRY_RUN=false`
- `TELEGRAM_REAL_PUBLISH_ENABLED=true`

To pause real publishing from GitHub Actions, set:

```text
TELEGRAM_REAL_PUBLISH_ENABLED=false
```

The admin page dry-run button always forces:

```text
PUBLISH_DUE_DRY_RUN=true
PUBLISH_DUE_SOURCE=api
```

So it checks due posts without sending Telegram messages.

## Manual Workflow Launch

1. Open GitHub repository.
2. Go to `Actions`.
3. Select `Publish due Telegram posts`.
4. Click `Run workflow`.
5. Confirm the run.

The workflow uses concurrency control and `PUBLISH_DUE_MAX_PER_RUN=1`, so a single run should not publish a large overdue backlog.

The workflow also restores the latest scheduler runtime cache before publishing and saves it after the run, including failed runs.

## Local Commands

Safe local check:

```powershell
npm run publish:due
```

Local runs default to dry-run unless explicitly configured otherwise.

Admin status:

```powershell
Invoke-RestMethod http://127.0.0.1:3000/api/admin/publish-scheduler/status
Invoke-RestMethod http://127.0.0.1:3000/api/admin/publication-logs
```

Admin page:

```text
http://127.0.0.1:3000/admin/publish-scheduler
```

## Logs And Status

`publication_logs.json` stores event-level logs:

- `success`: Telegram send completed.
- `skipped`: post was not sent intentionally, for example `dry_run` or `already_published`.
- `failed`: send or validation failed.

Each new log entry includes:

- `id`
- `runId`
- `source`: `local`, `github`, `manual`, or `api`
- `channelId`
- `postId`
- `status`
- `message`
- `telegramMessageId`
- `telegramMessageLink`
- `dryRun`
- `createdAt`

`publish-scheduler.json` stores the latest scheduler run summary:

- checked due posts
- published
- skipped
- errors
- source
- store mode
- dry-run state
- run timestamps

## Duplicate Protection

Before sending, `npm run publish:due` checks:

- the post already has `status=published`
- the post already has `telegramMessageId`
- the post has `publishResult=success`
- there is a successful publication log for the same `postId`

If any condition is true, the post is skipped with:

```text
already_published
```

JSON mode also uses a lock file:

```text
data/runtime/tmp/publish-due.lock
```

If another run is active, the next run exits cleanly with:

```text
publish already running
```

## Why JSON Store For Now

JSON mode is enough for the current working setup:

- the weekly plan already lives in runtime JSON
- GitHub Actions can run the existing project command
- no database migration is required
- local dashboard and GitHub scheduler can share the same file format

The tradeoff is that JSON is not ideal for multi-device interactive control.
GitHub Actions cache helps with scheduler duplicate protection, but it is not a full remote admin database.

## Future Phone/Internet Control

For full control from a phone or any remote browser, move the control plane to a remote database and hosted admin app:

- Supabase/PostgreSQL for posts, scheduler runs, and publication logs
- hosted Next.js admin panel with authentication
- persistent storage for images/runtime metadata
- GitHub Actions or PM2 worker reading from the same remote database
- backups for `autopublish.json`, `weekly-content-plan.json`, and publication logs before migration

Until then, the local dashboard shows the state available on the current machine, and GitHub Actions logs show the remote workflow execution.
