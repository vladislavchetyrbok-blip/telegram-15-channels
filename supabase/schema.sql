create table if not exists channels (
  id text primary key,
  title text,
  telegram_chat_id text,
  slug text unique,
  language text,
  category text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists posts (
  id text primary key,
  channel_id text not null references channels(id) on delete cascade,
  title text,
  text text,
  image_url text,
  image_path text,
  status text not null default 'draft' check (status in ('draft', 'scheduled', 'approved', 'ready_to_publish', 'published', 'failed', 'skipped', 'blocked')),
  publish_at timestamptz,
  telegram_message_id integer,
  telegram_message_link text,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table posts drop constraint if exists posts_status_check;
alter table posts add constraint posts_status_check
  check (status in ('draft', 'scheduled', 'approved', 'ready_to_publish', 'published', 'failed', 'skipped', 'blocked'));

create table if not exists publication_logs (
  id text primary key,
  run_id text,
  source text,
  channel_id text references channels(id) on delete set null,
  post_id text references posts(id) on delete set null,
  status text not null check (status in ('success', 'skipped', 'failed')),
  message text,
  telegram_message_id integer,
  telegram_message_link text,
  dry_run boolean,
  created_at timestamptz not null default now()
);

create table if not exists scheduler_runs (
  id text primary key,
  source text,
  store_mode text not null default 'json',
  dry_run boolean not null default true,
  real_publish_enabled boolean not null default false,
  checked integer not null default 0,
  published integer not null default 0,
  skipped integer not null default 0,
  errors integer not null default 0,
  message text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create index if not exists idx_posts_channel_id on posts(channel_id);
create index if not exists idx_posts_status on posts(status);
create index if not exists idx_posts_publish_at on posts(publish_at);
create index if not exists idx_publication_logs_post_id on publication_logs(post_id);
create index if not exists idx_publication_logs_channel_id on publication_logs(channel_id);
create index if not exists idx_publication_logs_created_at on publication_logs(created_at);
create index if not exists idx_scheduler_runs_started_at on scheduler_runs(started_at);
