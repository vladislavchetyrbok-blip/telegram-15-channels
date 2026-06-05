# Regeneration Draft Center

Regeneration Draft Center is a safe draft-only layer for improved post candidates. It reads the existing Content Regeneration Queue and creates separate draft records for manual review.

It does not change posts, publication logs, scheduled posts, production JSON store data, Supabase, Telegram settings, or GitHub Actions workflows.

## Safety boundaries

- Existing posts are not overwritten.
- Published posts are not changed.
- No Telegram publishing is performed.
- GitHub Actions are not triggered.
- Supabase mirror sync and migration apply modes are not used.
- Production publishing remains GitHub Actions -> JSON store -> Telegram.
- The current production store mode remains JSON.

## Storage

Drafts are stored only in:

```text
data/regeneration-drafts/regeneration-drafts.json
```

Each draft keeps the source post id, channel id, original text/image/topic snapshot, draft text, draft image prompt, issues, recommendation, status, and approval/apply flags.

## Commands

Preview candidate creation without writing files:

```bash
npm run content:regen:drafts:dry
```

Create draft records in the draft store:

```bash
npm run content:regen:drafts:create
```

Check draft center status:

```bash
npm run content:regen:drafts:status
```

The create command requires the internal confirmation flag configured in `package.json`:

```bash
node scripts/create-regeneration-drafts.mjs --create --confirm-draft-create
```

## Idempotency

Repeated create runs skip active drafts with the same `sourcePostId + regenerationType`. The CLI reports:

- `candidates`
- `skippedExistingDrafts`
- `createdDrafts`

Active drafts are draft or approved records that have not been applied.

## Admin view

The admin page is available at:

```text
/admin/regeneration-drafts
```

It is read-only and shows totals, active drafts, draft type breakdowns, high-priority drafts, warnings, errors, and the first 20 drafts.

There are no approve, apply, publish, regenerate, delete, Supabase switch, mirror sync apply, or migration apply controls in this stage.

## Next stage

The next stage can add Manual Approve / Apply workflows. That is intentionally not part of this draft-only release.
