# Draft Review Center

Manual Draft Review / Approve Center is a safe review surface for regeneration drafts stored in:

```bash
data/regeneration-drafts/regeneration-drafts.json
```

It lets an admin inspect draft candidates, compare original text with draft text, review issues and recommendations, and set the draft status to `approved`, `rejected`, or `needs_changes`.

The center does not apply approved drafts to posts, does not publish anything, does not run GitHub Actions, does not change Supabase, and does not change production store mode.

## Status

```bash
npm run content:regen:review:status
```

The status command is read-only and reports total drafts, draft/approved/rejected/needs_changes counts, applied count, pending review count, channel/type breakdowns, high-priority pending drafts, and the first 20 drafts.

## CLI Review

Approve a draft:

```bash
node scripts/review-regeneration-draft.mjs --approve --draft-id=draft_...
```

Reject a draft:

```bash
node scripts/review-regeneration-draft.mjs --reject --draft-id=draft_...
```

Mark a draft as needing changes:

```bash
node scripts/review-regeneration-draft.mjs --needs-changes --draft-id=draft_...
```

Optional notes can be added with `--note="..."`.

The CLI requires `--draft-id`. Without it, the command exits with an error and does not change the draft store.

## Admin Page

Open:

```text
/admin/regeneration-review
```

The page shows summary cards, a drafts table, original-vs-draft comparison, issues, recommendation, review note, and status controls.

## Safety Rules

Approve only changes the draft record status to `approved`, sets `approved=true`, and records `approvedAt`.

Approve does not apply the draft to the source post.

`applied` remains `false` in this phase.

The next phase can be a Manual Apply Center, but that is intentionally not part of this center.

Production publishing remains:

```text
GitHub Actions -> JSON store -> Telegram
```
