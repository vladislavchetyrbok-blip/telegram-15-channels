# Supabase Store Compare

Supabase is currently a read-only mirror for auditing the JSON publishing store. Production publishing stays on:

```text
GitHub Actions -> JSON store -> Telegram
```

Do not switch production to PostgreSQL as part of this audit. The compare tooling only reads local JSON files and Supabase IDs.

## CLI

Run:

```bash
npm run db:store:compare
```

The command loads `.env.local`, connects to Supabase through `DATABASE_URL`, and compares:

- `channels`
- `posts`
- `publication_logs`
- `scheduler_runs`

The report includes local counts, Supabase counts, missing IDs, extra IDs, duplicates, warnings, problems, and a status of `ok`, `warning`, or `error`. It never prints `DATABASE_URL`, passwords, or tokens.

## Admin Page

Open:

```text
/admin/store-compare
```

The page is read-only and uses the admin API endpoint:

```text
/api/admin/store-compare
```

Use `Refresh compare` to rerun the audit. The page shows JSON and Supabase counts, mismatch tables, duplicate tables, warnings, and problems.

## Before Any Future Switch

Keep `PUBLISH_DUE_STORE=json` until a separate production switch stage is planned and reviewed. Before switching production to PostgreSQL, verify:

- `npm run db:connection:check` succeeds.
- `npm run db:store:compare` reports matching counts and IDs.
- `npm run migrate:json-to-supabase:dry` reports `inserts: 0`.
- GitHub Actions workflow settings and secrets are reviewed in a separate change.
- Real Telegram publishing is tested only through the approved production path.

Switching production to PostgreSQL changes the source of truth for scheduled posts and publication logs, so it must not be bundled with read-only auditing.
