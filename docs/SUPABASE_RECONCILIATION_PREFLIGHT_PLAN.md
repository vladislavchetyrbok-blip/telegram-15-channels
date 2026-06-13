# SUPABASE RECONCILIATION PREFLIGHT PLAN

## 1. Current State
- **Queue status:** Clean (`scheduledPostsCount: 0`, `readyPostsCount: 0`, `nextDuePost: null`).
- **Production Status:** Blocked (`safeForScheduledPublishing=false`).
- **Remaining Warnings:**
  - `JSON and Supabase IDs do not match.`
  - `Supabase mirror contains extra IDs. Insert-only sync will not delete them.`
  - Orphaned publication logs on `weekly-2026-05-31-02-ai-technologies-02` detected in local JSON.

## 2. Source of Truth Recommendation
**Recommendation:** `local-json`
**Reasoning:** 
1. The local JSON represents the actual state of the local publishing script (the client of Supabase).
2. Supabase acts as a read-replica/mirror (`db:mirror:sync` pushes local to Supabase).
3. The latest local queue cleanup successfully cancelled 90 posts in JSON, making the local JSON the most current definition of the content plan.
4. Therefore, Supabase should be reconciled to match the local JSON.

## 3. Missing in Supabase (8 Records)
These records exist in local JSON but are missing from the Supabase database.

| ID | Record Type | Recommendation | Risk Level |
|----|-------------|----------------|------------|
| `02bb3c89-6d31-4c1c-b808-970c3c2386ed` | `publication_log` | Insert to Supabase | Low |
| `086a20fd-5335-4f0d-80bd-490a86d93978` | `publication_log` | Insert to Supabase | Low |
| `6b96d345-2b1d-49f9-8e6a-ccb776655c29` | `publication_log` | Insert to Supabase | Low |
| `74d10fa0-3a87-4ec9-b91d-dc95c6678a48` | `publication_log` | Insert to Supabase | Low |
| `a1dc9664-f7de-429c-93b0-91d7e8dfbe73` | `publication_log` | Insert to Supabase | Low |
| `a6018a29-dc5b-4fb7-8ee7-f9092f3f5cb4` | `publication_log` | Insert to Supabase | Low |
| `befc8e3d-11ce-45e4-8c7f-34543cd7be79` | `publication_log` | Insert to Supabase | Low |
| `cca3f826-292a-4d5b-8b82-1ed15ddd4b80` | `scheduler_run` | Insert to Supabase | Low |

*Reasoning: Since local JSON is the source of truth, missing logs must be inserted via `db:mirror:sync:apply`.*

## 4. Extra in Supabase (1 Record)
- **ID:** `f4bebafb-418a-4669-905b-4f1657508ee3`
- **Record Type:** `scheduler_run`
- **Local Equivalent:** None.
- **Recommendation:** Delete from Supabase.
- **Reasoning:** Since `db:mirror:sync` is an *insert-only* operation, it will not delete extra records. To resolve the safety check block, this extra record must be manually deleted from Supabase.

## 5. Orphan Publication Logs
- **Count:** 6 references.
- **Location:** `data/runtime/publication_logs.json` (Lines 5, 15, 25, 37, 50, 63) and `data/runtime/autopublish.json` (Lines 313, 315, 316).
- **Target Post ID:** `weekly-2026-05-31-02-ai-technologies-02`
- **Present in Local JSON:** No.
- **Present in Supabase Export:** No (missing from `posts.json` export).
- **Recommendation:** Delete the orphan logs from the local `publication_logs.json` and `autopublish.json`.
- **Reasoning:** A log referencing a non-existent post violates foreign key constraints and blocks synchronization. Deleting the orphan local log is safer than trying to recreate a ghost post.

## 6. Exact Future Apply Strategy
- **Phase A:** Create a fresh backup of the entire `data/runtime` directory.
- **Phase B:** Execute a dry-run compare to confirm exact baseline (`npm run db:mirror:sync:dry`).
- **Phase C:** Apply safe local fixes: Remove orphan logs from local JSON manually.
- **Phase D:** Apply safe Supabase fixes: Remove extra `scheduler_run` from Supabase. Apply missing records via `npm run db:mirror:sync:apply`.
- **Phase E:** Run `npm run production:safety:check` to ensure no warnings remain.
- **Phase F:** Await Codex audit review to verify complete safety before ever turning on production.

## 7. Rollback Plan
- **Supabase Restore:** If `db:mirror:sync:apply` introduces corruption, restore the remote database from `data/backups/latest-supabase-export`.
- **Local JSON Restore:** If local fixes to orphan logs fail, use `git restore data/runtime/publication_logs.json`.
- **Scheduler:** Do **not** enable the scheduler until the status is completely green and tested.

## 8. Explicit Confirmations
- [x] No Supabase writes were performed.
- [x] Local data was not modified.
- [x] Live publish was not started.
- [x] Environment variables and secrets were not printed or modified.
- [x] Leo prompts were not touched.
