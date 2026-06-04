# Operational Health Center

Operational Health Center is a read-only diagnostics view for the Telegram 15 Channels runtime.

## What It Checks

- Local JSON runtime counts for channels, posts, publication logs, and scheduler runs.
- Queue status: ready, scheduled, published, failed, skipped, blocked, and next due post.
- Publication logs: recent logs, failed and skipped logs, last success, last failure, and grouped reasons.
- Scheduler state: last scheduler run, status, errors, and next expected workflow run when the cron is simple enough to calculate.
- Content quality: weak text, weak images, missing images, generic phrase flags, service label flags, and blocked/problem posts.
- Telegram and autopublish flags without printing tokens.
- JSON and Supabase mirror sync through existing compare, dual-read, and mirror dry-run logic.
- Backup freshness and latest Supabase export presence.

## Read-Only Policy

The center does not publish Telegram posts, does not send Telegram messages, does not trigger GitHub Actions, does not retry failed work, does not run migrations, does not run mirror sync apply, and does not switch storage.

Production publishing remains:

```text
GitHub Actions -> JSON store -> Telegram
```

`productionStoreMode` remains `json`, `sourceOfTruth` remains `json`, and `safeToSwitchToSupabase` remains `false`.

## CLI

Run:

```bash
npm run ops:health:check
```

The command returns a JSON report with:

- `status`
- `whyNotPublishing`
- `queue`
- `logs`
- `scheduler`
- `contentQuality`
- `telegram`
- `store`
- `backups`
- `warnings`
- `errors`

## Admin Page

Open:

```text
/admin/operational-health
```

The page has only a refresh button. It has no publish, retry, GitHub Actions, migration, mirror apply, Supabase switch, or emergency-stop controls.

## Understanding Why Publishing Is Not Happening

Read `whyNotPublishing` first. Common read-only explanations include:

- `TELEGRAM_REAL_PUBLISH_ENABLED` is not true in the local environment.
- `TELEGRAM_DRY_RUN` is true.
- No ready post exists.
- The next scheduled post is not due yet.
- JSON and Supabase mirror are not synced.

Warnings are used for stale backups, missing optional state, skipped/failed logs, or visible content quality concerns. Errors are reserved for broken runtime JSON, unavailable store compare, scheduler errors, or unsafe production-store signals.
