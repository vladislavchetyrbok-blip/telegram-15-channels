# GitHub Actions Publish Scheduler

The workflow `.github/workflows/publish-scheduler.yml` runs `npm run publish:due` at minute 17 of every hour and can also be started manually with `workflow_dispatch`.

## Required GitHub Secrets

- `TELEGRAM_BOT_TOKEN`: bot token used for real Telegram `sendPhoto` calls.
- `DATABASE_URL`: PostgreSQL connection string for the remote scheduler data store.
- `OPENAI_API_KEY`: available to the job for future AI generation steps. The current `publish:due` command does not call OpenAI directly.

Tokens are read only from environment variables and are not stored in code.

## Runtime Safety

The workflow sets:

- `PUBLISH_DUE_STORE=postgres`
- `PUBLISH_DUE_DRY_RUN=false`
- `PUBLISH_DUE_MAX_PER_RUN=1`

`PUBLISH_DUE_MAX_PER_RUN=1` prevents a first GitHub Actions run from publishing a large overdue backlog at once. Increase it only after checking the queue.

Local runs default to JSON storage and dry-run mode:

```powershell
npm run publish:due
```

Real local send requires an explicit opt-in:

```powershell
$env:PUBLISH_DUE_DRY_RUN="false"
$env:TELEGRAM_BOT_TOKEN="..."
npm run publish:due
```

## PostgreSQL Schema

The command creates `publication_logs` and `scheduler_runs` if they do not exist. The `posts` table is expected to exist with these columns:

```sql
create table if not exists posts (
  id text primary key,
  post_id text,
  channel_id text not null,
  channel_name text,
  telegram_target text not null,
  title text not null,
  body text not null,
  telegram_caption text not null,
  image_path text,
  telegram_image_path text,
  image_url text,
  status text not null,
  publish_at timestamptz not null,
  text_quality text,
  image_quality text,
  telegram_caption_status text,
  telegram_image_status text,
  quality_issues jsonb default '[]'::jsonb,
  telegram_message_id integer,
  telegram_published_at timestamptz,
  publish_result text,
  publish_error text,
  updated_at timestamptz default now()
);

create table if not exists publication_logs (
  id text primary key,
  channel_id text,
  post_id text,
  status text not null,
  message text,
  telegram_message_id integer,
  telegram_message_link text,
  created_at timestamptz not null default now()
);

create table if not exists scheduler_runs (
  id text primary key,
  started_at timestamptz not null,
  finished_at timestamptz,
  checked integer not null default 0,
  published integer not null default 0,
  skipped integer not null default 0,
  errors integer not null default 0,
  message text
);
```

The command selects posts with `status in ('scheduled', 'draft', 'approved')` and `publish_at <= now()`. It skips rows that already have `telegram_message_id`, `publish_result='success'`, or a successful `publication_logs` entry for the same `post_id`.
