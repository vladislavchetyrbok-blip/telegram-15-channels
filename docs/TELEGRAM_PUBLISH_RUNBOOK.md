# Telegram Publish Runbook

This guide outlines the safe procedure for manually executing Telegram due post publication. 

## 1. Dry Run (Safe Preview)

Before running the real publish, you **must** execute a dry run to safely preview the posts that are due to be sent. The dry run will verify quality gates and check the content plan without sending actual requests to the Telegram API.

Run the following command:
```bash
npm run publish:due:json:dry
```

**What to look for in the output:**
- `channelId` and `postId` of the candidates.
- `status`: Look for `skipped` and verify the `message` is `dry_run: due post was not sent`.
- Top-level variables should explicitly state:
  - `"dryRun": true`
  - `"realPublishEnabled": false`
  - `"storeMode": "json"`

*Note: Running the dry run may temporarily modify `data/runtime/` logs. You can simply `git restore` them if you do not plan to proceed.*

## 2. Real Publish

**WARNING:** Do not run the real publish command twice for the same queue. Wait for the initial command to complete.

Once the dry run output looks correct, execute the real publication:
```bash
npm run publish:due:json
```

## 3. Post-Publish Verification

1. Immediately check your Telegram targets to confirm the posts were successfully delivered.
2. The real publish command will update the runtime state. Check the modified files:
   ```bash
   git status --short
   ```
3. You should commit the runtime files (`data/runtime/publication_logs.json`, `data/runtime/publish-scheduler.json`, `data/runtime/weekly-content-plan.json`) to persist the state in version control.
   ```bash
   git add data/runtime/
   git commit -m "chore: record successful Telegram publish state"
   ```

## 4. Important Safety Rules

- **NEVER** commit `.env` or `.env.local` to version control.
- **NEVER** log tokens or `chat_id` secrets.
- **Postgres Store Status:** The Postgres store mode is currently disabled due to technical debt (specifically, a schema issue: `column "post_id" does not exist`). All manual publication must rely on the JSON store mode via the `publish:due:json` wrappers.
