# Deployment Phone Control Plan

## A. What Already Works

- GitHub Actions publishes to Telegram.
- Telegram secrets are configured in GitHub Secrets.
- `dryRun=false` works in the GitHub Actions production path.
- JSON store works.
- Publication logs work.
- Duplicate guard works.
- Mobile-control page is prepared.
- Publish scheduler dashboard is prepared.

## B. Current Architecture Limits

- JSON store lives in the repository/runtime files.
- New posts created from the local admin panel do not reach GitHub Actions until they are committed and pushed.
- GitHub Actions cannot see local-only changes on the computer.
- GitHub Actions runtime is ephemeral, so durable remote control needs a shared store.
- Full phone control needs a remote database.

## C. Target Architecture

```text
phone -> hosted admin panel -> Supabase/PostgreSQL -> GitHub Actions/server worker -> Telegram
```

This lets the phone, hosted admin panel, scheduler, and worker read one shared source of truth.

## D. What To Do Later

- Create a Supabase project.
- Create tables: `posts`, `channels`, `publication_logs`, `scheduler_runs`.
- Add `DATABASE_URL`.
- Move JSON store access into a DB adapter.
- Deploy the admin panel to Vercel.
- Add simple admin authentication.
- Add real schedule-control buttons after the remote DB is active.

## E. Safety Mode

- Real publication remains controlled by GitHub Actions.
- Manual buttons in the admin panel are dry-run for now.
- `TELEGRAM_REAL_PUBLISH_ENABLED=false` pauses real publish mode.
- `TELEGRAM_DRY_RUN=true` enables safe mode.
- Do not paste Telegram tokens, Supabase service-role keys, or database passwords into chat.

## Future Env And Secrets

Current safe defaults:

- `TELEGRAM_DRY_RUN=true`
- `TELEGRAM_REAL_PUBLISH_ENABLED=false`
- `PUBLISH_DUE_STORE=json`
- `PUBLISH_DUE_DRY_RUN=true`

Future hosted-control values:

- `DATABASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD` or another admin-auth secret

Only server-side code should use service-role and database credentials.

## Duplicate Protection

Already implemented checks:

- skip if post status is `published`
- skip if `telegramMessageId` exists
- skip if `publishResult=success`
- skip if a success log exists for the same `postId`
- JSON lock prevents concurrent `publish:due` runs
- GitHub Actions workflow concurrency prevents overlapping scheduled runs

Remote DB will make those guarantees stronger because publication status and logs become durable across every runtime.
