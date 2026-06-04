# Content Quality Control Center

Content Quality Control Center is a read-only report for checking Telegram post quality before operational decisions. Production publishing remains:

```text
GitHub Actions -> JSON store -> Telegram
```

Supabase remains a mirror, `productionStoreMode` remains `json`, `sourceOfTruth` remains `json`, and `safeToSwitchToSupabase` is always `false`.

## What It Checks

- Empty, too short, and too long text.
- Generic/template phrases, service labels, markdown artifacts, weak CTA, repeated templates, and very similar posts.
- Title/body mismatch, channel/topic mismatch where it can be inferred, forbidden phrases, and language mismatch when metadata is present.
- Missing image paths, missing image files, small images, placeholder images, repeated visuals, generic visual metadata, and visual/channel mismatch where it can be inferred.
- Per-channel totals, ready posts, weak posts, missing images, duplicate topics, and average quality score.
- Publication readiness counters: ready to publish, blocked by quality, needs regeneration, safe to publish, and risky to publish.

## Read-Only Policy

The checker does not write JSON files, regenerate text, regenerate images, publish Telegram posts, trigger GitHub Actions, run migrations in apply mode, run mirror sync apply, or switch production storage. It only reads local JSON runtime files and image metadata from the filesystem.

The admin page intentionally has no buttons for publish, regenerate, delete, migration apply, mirror sync apply, or Supabase switching.

## CLI

Run:

```bash
npm run content:quality:check
```

The command prints a JSON report with:

- `status`: `ok`, `warning`, or `error`
- `productionStoreMode: "json"`
- `sourceOfTruth: "json"`
- `safeToSwitchToSupabase: false`
- `summary`
- `channelQuality`
- `problemPosts`
- `repeatedProblems`
- `recommendations`
- `warnings`
- `errors`

## Admin Page

Open:

```text
/admin/content-quality
```

The page shows overall quality cards, channel quality ranking, problem posts, missing image problems, generic/template text, channel/topic mismatch, repeated topics, repeated visuals, repeated/generic issue groups, and recommendations.

## Quality Statuses

- `excellent`: high score with no meaningful detected issues.
- `good`: publishable quality with only minor risk.
- `warning`: usable only after review; one or more quality risks were detected.
- `bad`: weak content or image readiness; regeneration or manual repair is recommended.
- `blocked`: severe issue such as empty text, forbidden phrase, or very low score.

## qualityScore

`qualityScore` is a 0-100 heuristic score. Each detected issue subtracts a weighted penalty. Text and image blockers have larger penalties than review-only warnings. The score is not a replacement for editorial judgment; it is a triage tool for finding the weakest posts first.

## Warning, Bad, And Blocked

Typical `warning` issues include generic phrases, repeated templates, weak CTA, repeated topics, small images, and inferred mismatch risks.

Typical `bad` issues include missing images, missing files, service labels, and very short text.

Typical `blocked` issues include empty text, forbidden phrases, and posts whose accumulated score falls below the blocking threshold.

## Why There Are No Regenerate Or Publish Buttons

This center is the inspection stage only. Publishing and regeneration mutate production-adjacent state, so they remain outside this page until a separate workflow is designed, tested, and guarded. Keeping this page read-only prevents accidental Telegram sends, GitHub Actions runs, JSON mutations, migration apply runs, or Supabase cutover changes.
