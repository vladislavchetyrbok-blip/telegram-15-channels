# Backup And Restore Center

Backup and restore tooling is for safe preparation before future store changes. Production publishing remains:

```text
GitHub Actions -> JSON store -> Telegram
```

`.env.local`, `DATABASE_URL`, Telegram tokens, and other secrets are not copied into backups or exports.

## Create A Backup

```bash
npm run backup:create
```

The command creates:

```text
data/backups/YYYY-MM-DD-HH-mm-ss/
```

It copies root-level JSON files from `data/runtime/`, writes `backup-manifest.json`, and writes a file manifest for `public/assets/telegram-posts` without copying all image files.

## Export Supabase Mirror

```bash
npm run db:mirror:export
```

The command performs read-only `select` queries and writes:

```text
data/backups/latest-supabase-export/
```

with `channels.json`, `posts.json`, `publication_logs.json`, `scheduler_runs.json`, and `export-manifest.json`.

## Restore Dry-Run

```bash
npm run backup:restore:dry
```

Restore is currently dry-run only. It lists backup folders, checks the latest manifest, compares backup JSON counts with current JSON counts, and does not restore files, write Supabase, or modify JSON.

## Admin Page

Open:

```text
/admin/backups
```

The page is read-only. It has `Refresh` and `View latest backup info` controls only. There is no restore button and no create-backup button in the browser.

## Before Any Future Switch

Before switching any production store path, run:

```bash
npm run backup:create
npm run db:store:compare
npm run db:store:dual-read
npm run db:mirror:sync:dry
npm run migrate:json-to-supabase:dry
```

Also create a git tag and prepare a separate rollback plan.
