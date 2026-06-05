# One-Channel Test Queue

Controlled One-Channel Test Queue is a read-only queue for preparing 2-3 next test candidates for one Telegram channel. The default channel is `ai-tech`.

The queue does not publish posts, does not trigger GitHub Actions, does not switch store mode, and does not write to Supabase. Production stays on the JSON store, with Supabase kept as a mirror.

## Run

```bash
npm run publish:one-channel-queue
```

```bash
node scripts/check-one-channel-test-queue.mjs --channel-id=ai-tech
```

The CLI returns JSON with candidate counts, queue rows, readiness scores, image status, warnings, and errors. `safeForBulkPublishing` is always `false`.

## Admin

Open:

```text
/admin/one-channel-test-queue
```

The admin page is read-only and shows the channel, candidate counts, readiness, blocked/already-published counts, and the queue table.

## Next Step

The next stage is a controlled one-channel send for a selected candidate, but that is not part of this queue. This queue only prepares and verifies candidates.
