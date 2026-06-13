# PRODUCTION QUEUE SAFETY AUDIT

## 1. Current Safety Status
- **Manual publish safe:** `false`
- **Scheduled publish safe:** `false`
- **Why:** The system is reporting multiple critical warnings and errors:
  - The working tree is dirty (`publish-scheduler.yml` has local changes, which was expected for the safety patch).
  - Data mismatch between local JSON store and Supabase mirror.
  - Orphaned publication logs pointing to a non-existent local post ID.
  - The latest backup is significantly older than 24 hours.

## 2. Queue Summary
- **Scheduled:** 90 posts
- **Due/Past Due:** The next due post is scheduled for `2026-06-02T08:00:00.000Z`, which means the queue is deeply backlogged and past due.
- **Published Today:** 0
- **Failed/Skipped Today:** 0
- **Total Published (historical JSON logs):** 17 publication logs

## 3. Old Content Risk
- **Old posts present:** Yes. The next post in the queue is from `2026-06-02`, which is 11 days ago.
- **Risk of auto-publishing:** High. If the scheduler were to be activated, it would likely attempt to aggressively publish dozens of outdated posts to catch up with the backlog, completely spamming the channels.

## 4. Supabase/JSON Mismatch
- **Missing in Supabase:** 8 items
- **Extra in Supabase:** 1 item
- **Conflicting IDs:** Supabase mirror contains extra IDs. The sync status warns that an insert-only sync will not delete them.

## 5. Publication Log Mismatch
- **Orphaned Logs:** Yes. There are 6 separate publication logs that reference post ID `weekly-2026-05-31-02-ai-technologies-02`.
- **Issue:** This post is not present in local posts, which means syncing to Supabase will attempt to insert logs with `post_id=null`, potentially violating foreign key constraints.

## 6. Backup Status
- **Latest backup:** `2026-06-06-01-47-52` (Created `2026-06-05T22:47:52.742Z`).
- **Age:** ~179.7 hours old (over 7 days).
- **Secret sprawl risk:** Found `.env.local` accidentally included in an old runtime backup folder at:
  `data/runtime/backups/before-full-send-2026-06-01-18-26/.env.local`

## 7. Recommended Cleanup Plan
- **Phase A:** Create a fresh system backup (ensuring `.env` files are excluded from the backup payload).
- **Phase B:** Freeze scheduler (already completed via `publish-scheduler.yml` safety patch).
- **Phase C:** Inventory the old queue to identify what should be kept vs discarded.
- **Phase D:** Cancel/archive old scheduled posts to clear the backlog and prevent spam.
- **Phase E:** Execute Supabase reconciliation (resolve the missing `weekly-2026-05-31-02-ai-technologies-02` post and sync differences).
- **Phase F:** Re-run `production:safety:check` until it is completely green.

## 8. Explicit Disclaimers
- **No publish was run.**
- **No queue deletion was performed.**
- **No Supabase writes were performed.**
- **No secrets were printed.**
- **No env files were committed.**
