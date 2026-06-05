# Final Publish Preview

Final Publish Preview is a read-only publish readiness center for the JSON production store.
It shows the final Telegram text, image path, image availability, content quality issues,
channel readiness, and the safest candidate for a future one-post manual test.

## Run

```bash
npm run publish:preview:check
```

The command prints JSON and does not publish posts, trigger GitHub Actions, apply drafts,
run retries, switch stores, or write to Supabase.

## Open

```text
/admin/final-preview
```

The admin page uses the same read-only report as the CLI through
`GET /api/admin/final-preview/status`.

## Safety

- `safeForBulkPublishing` is always `false` at this stage.
- `safeToSwitchToSupabase` is always `false`.
- `productionStoreMode` remains `json`.
- `sourceOfTruth` remains `json`.
- The page does not include publish, retry, apply, mirror sync, migrate, or GitHub Actions controls.
- The next possible stage can be Manual One-Post Test Send, but that is not part of this center.

## Choosing The First Test Post

Use `recommendedFirstTestPost` when it is present. It is selected from ready or scheduled JSON posts
that have an OK render status, an existing image file, and a high readiness score.

If no recommendation is present, resolve blocked status, missing image, and weak text warnings first,
then run `npm run publish:preview:check` again.
