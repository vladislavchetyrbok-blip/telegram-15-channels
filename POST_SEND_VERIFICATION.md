# Post-Send Verification

Post-Send Verification is a read-only publication audit center for checking the result after a future manual one-post test send.

It does not publish posts, does not send Telegram messages, does not run GitHub Actions, does not write to Supabase, and does not change the production store mode.

## CLI

Check the latest publication audit:

```bash
npm run publish:verify:last
```

Check a specific post after a future one-post test send:

```bash
node scripts/check-post-send-verification.mjs --post-id=weekly-2026-06-05-01-money-opportunities-01
```

The CLI returns JSON with:

- `lastPublication`
- `selectedPostVerification`
- `bulkSafety`
- `storeConsistency`
- `githubActions`
- `warnings`
- `errors`

## Admin Page

Open:

```text
/admin/post-send-verification
```

The page shows the overall audit status, latest publication log, selected post verification, bulk safety, JSON/Supabase store consistency, and warning/error lists.

## What It Checks

- Latest publication log fields: `postId`, `channelId`, `status`, `createdAt`, `telegramMessageId`, and error/message text.
- Whether a selected `postId` exists in the JSON content plan.
- Whether publication logs exist for the selected `postId`.
- Whether more than one actual publication was detected in the last 10 minutes.
- Whether more than one post or channel was touched in the last 10 minutes.
- Whether duplicate JSON posts or duplicate actual publication logs exist for the selected `postId`.
- Whether JSON and Supabase mirror counts/IDs are synced when store compare is available.
- Whether this check triggered GitHub Actions. It always reports `workflowNotTriggeredByThisCheck: true`.

## Production Policy

Production publishing remains:

```text
GitHub Actions -> JSON store -> Telegram
```

`productionStoreMode` remains `json`, `sourceOfTruth` remains `json`, and `safeToSwitchToSupabase` remains `false`.

The next operational step after this center is ready is a user-controlled manual send of exactly one test post, followed by running this audit to verify the result.
