# Mobile Control Plan

## Current Control Model

Current architecture:

```text
local/admin panel -> JSON files -> git push -> GitHub Actions -> Telegram
```

The mobile-friendly admin pages are:

- `/admin/mobile-control`
- `/admin/publish-scheduler`

They can show scheduler status, publication logs, last run data, skipped posts, failed posts, and safe dry-run checks.

## What Already Works

- GitHub Actions can publish due Telegram posts.
- The project currently uses JSON store mode.
- `GET /api/admin/publish-scheduler/status` returns scheduler state.
- `GET /api/admin/publication-logs` returns publication logs.
- `POST /api/admin/publish-scheduler/dry-run` forces safe dry-run mode.
- Real publishing is controlled through GitHub Secrets.
- Duplicate protection checks published status, Telegram message id, publish result, and success logs.
- JSON mode uses a lock file while `publish:due` is running.
- GitHub Actions caches scheduler logs/status between runs to help duplicate protection in JSON mode.

## How To Manage The System Now

Use the local admin panel:

```text
http://127.0.0.1:3000/admin/mobile-control
http://127.0.0.1:3000/admin/publish-scheduler
```

Safe actions available now:

- refresh scheduler status
- check ready posts with dry-run
- inspect recent publication logs
- inspect skipped and failed events
- confirm current store mode, timezone, daily limit, and max daily posts

Real publishing remains controlled by GitHub Actions and GitHub Secrets.

## How To Pause Publishing Now

Set this GitHub Secret:

```text
TELEGRAM_REAL_PUBLISH_ENABLED=false
```

To allow real publishing again:

```text
TELEGRAM_REAL_PUBLISH_ENABLED=true
TELEGRAM_DRY_RUN=false
```

Do not put Telegram tokens or secret values into code.

## JSON Store Limits

JSON mode is useful for the current local workflow, but it is limited:

- local admin state is tied to the current machine
- GitHub Actions runs in an ephemeral environment
- logs need cache or commits to persist remotely
- phone-based editing is not reliable without a shared remote data store
- concurrent control from multiple devices is hard to make robust with plain files

## Why A Remote Database Is Needed For Phone Control

For real phone control, the phone, hosted admin panel, GitHub Actions, and any server worker must read and write the same durable state.

Recommended future architecture:

```text
phone -> hosted admin -> Supabase/PostgreSQL -> GitHub Actions/server worker -> Telegram
```

This makes it possible to:

- pause/resume without editing GitHub Secrets manually
- edit post status and schedule from a phone
- inspect the same logs from any device
- avoid JSON cache edge cases
- add authentication and audit history

## Recommended Next Step

Move scheduler state and publication logs to Supabase/PostgreSQL, then host the admin panel on Vercel or another always-on server.

Suggested order:

1. Add Supabase/PostgreSQL tables for posts, scheduler runs, publication logs, and system settings.
2. Keep JSON mode as local fallback.
3. Add authenticated hosted admin routes.
4. Move pause/resume and queue edits into remote DB settings.
5. Point GitHub Actions or a server worker at the remote DB.

## Future Env And Secrets

Likely required:

- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_AUTH_SECRET`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_REAL_PUBLISH_ENABLED`
- `TELEGRAM_DRY_RUN`
- `AUTOPUBLISH_ENABLED`
- `AUTOPUBLISH_TIMEZONE`
- `AUTOPUBLISH_DAILY_LIMIT_PER_CHANNEL`
- `AUTOPUBLISH_MAX_POSTS_PER_DAY`

Only server-side code should read service-role secrets.

## Duplicate Risks And Current Protection

Already covered:

- published posts are skipped
- posts with `telegramMessageId` are skipped
- posts with `publishResult=success` are skipped
- posts with a success log for the same `postId` are skipped
- active runs are protected by a JSON lock file
- GitHub Actions uses workflow concurrency
- manual admin dry-run never sends Telegram messages

Remaining JSON-mode risk:

- if remote runtime cache is lost and the weekly plan does not contain published markers, duplicate protection has less history

Remote DB reduces that risk by making publication status and logs durable across all runs.
