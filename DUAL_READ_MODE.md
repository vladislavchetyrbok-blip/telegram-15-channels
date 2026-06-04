# Dual-Read Mode

JSON remains the source of truth for production publishing.

Supabase is currently a read-only mirror used for audits, validation, and preparation for a future switch. Production still runs:

```text
GitHub Actions -> JSON store -> Telegram
```

## Why Dual-Read Exists

Dual-read lets the project compare the active JSON store with the Supabase mirror without changing the production publishing path. It gives a safe signal that the mirror contains the same core records before any later migration stage.

The dual-read layer never writes to JSON or Supabase. It reads counts and IDs for:

- `channels`
- `posts`
- `publication_logs`
- `scheduler_runs`

## CLI

Run:

```bash
npm run db:store:dual-read
```

The report includes:

- `sourceOfTruth: "json"`
- `jsonCounts`
- `supabaseCounts`
- `synced`
- `mismatches`
- `warnings`
- `safeToSwitchToSupabase: false`

Secrets such as `DATABASE_URL`, passwords, and tokens are not printed.

## Admin Page

Open:

```text
/admin/dual-read
```

The page is read-only. It has a `Refresh` button, but no apply, migrate, publish, or switch-store controls.

## Why Production Must Not Switch Yet

Switching production to Supabase changes the source of truth for scheduled posts and publication logs. That is a separate stage and needs its own feature flag, rollback plan, and operational review.

Before any future switch, verify:

- Store compare is `ok`.
- Dual-read is `ok`.
- Migration dry-run reports `inserts: 0`.
- Backup/tag exists.
- A separate feature flag exists.
- A separate rollback plan exists.

Until that separate stage is complete, keep `PUBLISH_DUE_STORE=json`.
