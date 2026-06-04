# Supabase Mirror Sync

JSON remains the source of truth for production publishing. Supabase is only a mirror.

Production stays on:

```text
GitHub Actions -> JSON store -> Telegram
```

Mirror sync is an insert-only maintenance command. It can add records that exist in JSON but are missing in Supabase. It does not delete extra Supabase rows and does not update existing Supabase rows.

## Commands

Dry-run:

```bash
npm run db:mirror:sync:dry
```

Apply:

```bash
npm run db:mirror:sync:apply
```

Apply is protected by `--confirm-mirror-sync` in the npm script. Direct script usage must include either:

```bash
node scripts/sync-json-to-supabase-mirror.mjs --apply --confirm-mirror-sync
```

or:

```bash
CONFIRM_MIRROR_SYNC=true node scripts/sync-json-to-supabase-mirror.mjs --apply
```

## Safety Rules

Mirror sync:

- reads `.env.local` through the local env loader;
- reads JSON store files;
- reads Supabase IDs and counts;
- inserts only missing Supabase records in apply mode;
- never deletes Supabase records;
- never updates existing Supabase records;
- never writes JSON files;
- never publishes Telegram posts;
- never switches `PUBLISH_DUE_STORE` away from `json`;
- never prints `DATABASE_URL`, passwords, or tokens.

The admin page at `/admin/mirror-sync` is read-only. It has no apply button.

## After Sync

After any future apply, verify:

```bash
npm run db:store:compare
npm run db:store:dual-read
npm run migrate:json-to-supabase:dry
```

Expected steady state is `inserts: 0`, no missing IDs, and `sourceOfTruth: json`.

Production must not switch to Supabase in this step. A future switch needs a separate feature flag, review, backup/tag, and rollback plan.
