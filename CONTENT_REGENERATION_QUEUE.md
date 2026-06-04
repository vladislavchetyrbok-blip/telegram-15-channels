# Content Regeneration Queue

Content Regeneration Queue is a read-only queue derived from Content Quality Control. It identifies posts that should be repaired before publishing decisions, but it does not regenerate text, regenerate images, publish Telegram posts, mutate JSON data, trigger GitHub Actions, run migrations, or apply mirror sync.

Production publishing remains:

```text
GitHub Actions -> JSON store -> Telegram
```

Supabase remains a mirror. The queue reports `productionStoreMode: "json"`, `sourceOfTruth: "json"`, and `safeToSwitchToSupabase: false`.

## CLI

Run:

```bash
npm run content:regen:queue
```

The command reads the local JSON store and prints a JSON report with:

- `summary`
- `queue`
- `channelBreakdown`
- `warnings`
- `errors`
- `lastCheckedAt`

## Admin Page

Open:

```text
/admin/regeneration-queue
```

The page shows summary cards, the regeneration queue table, channel breakdown, warnings, and errors. It has only a refresh button.

## Regeneration Types

- `text`: text-specific problems such as empty, short, generic, repeated, or artifact-heavy copy.
- `image`: image-specific problems such as missing image paths, missing files, small images, placeholders, repeated visuals, or generic visual metadata.
- `both`: both text and image problems are present.
- `manual_review`: the post needs human judgment before any regeneration path is chosen, such as forbidden phrases, language mismatch, or channel/topic mismatch.

## Priorities

- `high`: blocked posts, very low scores, manual review items, or severe blocked issues.
- `medium`: bad posts or posts with bad-severity issues.
- `low`: queued items that are weaker than normal but do not meet the higher priority thresholds.

## Why Production Stays JSON

The queue is an inspection layer only. It does not change the production store mode, does not switch reads or writes to Supabase, and does not alter the scheduler. The current production path stays JSON-first so GitHub Actions continue publishing from the JSON store while Supabase remains a synchronized mirror.
