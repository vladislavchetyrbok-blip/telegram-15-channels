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

Check a controlled one-channel test window:

```bash
npm run publish:verify:controlled-channel
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

It also includes a read-only Controlled Channel Test Audit block for the ai-tech controlled test window.

## Controlled Channel Test Audit

The default one-post mode is intentionally strict: more than one actual publication inside the audit window is treated as `bulkDetected: true`.

`controlled-channel-test` mode is for a bounded one-channel test where 2-3 known `postId` values may be published to one expected channel. This is not bulk publishing when every actual publication in the window matches the allowlist.

Controlled mode returns:

- `controlledBatchDetected`
- `controlledBatchOk`
- `bulkDetected`
- `expectedPostsPublished`
- `expectedPostsPending`
- `unexpectedPosts`
- `unexpectedChannels`
- `duplicatePublishedPosts`

In controlled mode, `bulkDetected` stays `false` when the only actual publications are expected post IDs in the expected channel and the count is at or below `maxExpectedPosts`.

It becomes `true` for unexpected channels, unexpected post IDs, duplicate actual publication logs for the same post ID, more than `maxExpectedPosts` unique published posts, or critical publication errors.

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
