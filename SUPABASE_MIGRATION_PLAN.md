# Supabase Migration Plan

## Why Supabase/PostgreSQL Is Needed

Phone control needs a shared remote source of truth. JSON store works locally, but a phone, hosted admin panel, GitHub Actions, and a server worker cannot reliably coordinate through local files.

Supabase/PostgreSQL gives the system durable remote state for:

- posts
- channels
- publication logs
- scheduler runs
- future admin settings

## Current JSON Scheme

Current flow:

```text
local/admin panel -> data/runtime/*.json -> git commit/push -> GitHub Actions -> Telegram
```

Main files:

- `data/runtime/weekly-content-plan.json`
- `data/runtime/publication_logs.json`
- `data/runtime/publish-scheduler.json`

Limits:

- local changes are invisible to GitHub Actions until pushed
- remote phone edits cannot safely update local JSON
- GitHub Actions runtime is ephemeral
- concurrency is harder with plain files

## Future Supabase Scheme

Target flow:

```text
phone -> hosted admin -> Supabase/PostgreSQL -> GitHub Actions/server worker -> Telegram
```

Prepared files:

- `lib/storage/types.ts`
- `lib/storage/publish-store.ts`
- `lib/storage/json-publish-store.ts`
- `lib/storage/postgres-publish-store.ts`
- `supabase/schema.sql`

JSON remains the default store mode until the migration is explicitly enabled.

## Tables

`channels`

- channel metadata
- Telegram chat id
- active/inactive state

`posts`

- post text and image references
- schedule time
- current status
- Telegram message id/link after publish
- error message after failure

`publication_logs`

- append-only event log for success/skipped/failed sends
- dry-run marker
- source of the run
- links back to channel/post/run

`scheduler_runs`

- one row per scheduler execution
- checked/published/skipped/errors counters
- dry-run and real-publish flags
- started/finished timestamps

## Migration Order

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Add `DATABASE_URL` to local `.env.local` and GitHub Secrets only when ready.
4. Keep `PUBLISH_DUE_STORE=json` while testing.
5. Export current JSON posts and logs into PostgreSQL using a separate migration script.
6. Compare JSON counts with database counts.
7. Run the publish scheduler in dry-run with `PUBLISH_DUE_STORE=postgres`.
8. Confirm due-post selection, logs, and duplicate guard.
9. Only then consider switching GitHub Actions to postgres mode.

## Required Env/Secrets

Future values:

- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD` or other admin-auth secret

Existing Telegram values stay in GitHub Secrets:

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_DRY_RUN`
- `TELEGRAM_REAL_PUBLISH_ENABLED`

Never expose token or database values in client code, logs, screenshots, or chat.

## Avoiding Duplicates During Migration

Before importing posts:

- preserve `status=published`
- preserve `telegramMessageId`
- preserve `telegramMessageLink`
- preserve success publication logs

Before real postgres publish:

- dry-run first
- confirm no due rows already published
- check success logs by `postId`
- keep workflow concurrency enabled
- keep daily/channel limits enabled

The current duplicate guard checks:

- post status
- Telegram message id
- publish result
- success log for the same post

PostgreSQL should keep the same behavior and make it more durable.

## Keeping The Current GitHub Actions Workflow

Do not remove the existing workflow. The safe migration path is:

1. Keep `PUBLISH_DUE_STORE=json`.
2. Add database adapter and schema.
3. Test postgres mode locally in dry-run.
4. Test postgres mode in GitHub Actions dry-run.
5. Switch real publishing only after logs and duplicate checks are confirmed.

## Dry-Run Verification

Local dry-run:

```powershell
$env:PUBLISH_DUE_STORE="postgres"
$env:PUBLISH_DUE_DRY_RUN="true"
$env:TELEGRAM_DRY_RUN="true"
npm run publish:due
```

Do not set real-publish flags until the database counts, logs, and due-post selection are verified.
