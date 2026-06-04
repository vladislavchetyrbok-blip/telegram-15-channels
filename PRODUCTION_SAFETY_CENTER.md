# Production Safety Center

Production Safety Center is a read-only safety report for the Telegram 15 Channels project. It is intended to be checked before manual publishing decisions or scheduler changes.

## What It Checks

- Git branch, commit, dirty working tree state, and local changes to `.github/workflows/publish-scheduler.yml`.
- `.env.local` git tracking state without printing environment values.
- Production store mode and source of truth.
- Telegram configuration flags without printing tokens.
- Scheduler and queue counts from local JSON runtime files.
- JSON and Supabase mirror sync status through the existing store compare, dual-read, and mirror dry-run logic.
- Backup status, latest backup age, and latest Supabase export presence.

## Read-Only Policy

The safety center does not publish Telegram posts, does not trigger GitHub Actions, does not run migrations in apply mode, does not run mirror sync apply, and does not switch production storage. It only reads local JSON files, git metadata, environment configuration flags, and Supabase mirror state.

Supabase remains a read-only mirror at this stage. Production publishing remains:

```text
GitHub Actions -> JSON store -> Telegram
```

`safeToSwitchToSupabase` is always `false` until a separate production cutover stage is planned and tested.

## CLI

Run:

```bash
npm run production:safety:check
```

The command returns a JSON report:

- `status`: `ok`, `warning`, or `error`
- `safeForManualPublish`
- `safeForScheduledPublishing`
- `productionStoreMode: "json"`
- `sourceOfTruth: "json"`
- `safeToSwitchToSupabase: false`
- `checks`
- `warnings`
- `errors`

## Admin Page

Open:

```text
/admin/production-safety
```

The page is read-only and has only a refresh action. It does not expose publish, GitHub Actions, migration apply, mirror apply, or Supabase switching controls.

## Suggested Pre-Publish Checks

Before any manual publishing decision, check:

```bash
npm run production:safety:check
npm run db:store:compare
npm run db:store:dual-read
npm run db:mirror:sync:dry
npm run backup:create
```

Do not switch production to PostgreSQL/Supabase without a separate stage that includes backup validation, dry-run parity, rollback planning, and an explicit production cutover decision.
