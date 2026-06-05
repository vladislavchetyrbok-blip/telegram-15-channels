# Manual One-Post Test Send

Manual One-Post Test Send is a controlled center for preparing and, after explicit confirmation, sending exactly one Telegram test post.

The dry-run path is safe. It reads the Final Preview recommendation, validates one selected ready or scheduled post, renders the exact Telegram payload, checks that the bot token is configured without printing the token, and reports readiness. Dry-run does not send to Telegram and does not write files.

The send path is intentionally fenced. It requires an explicit confirmation flag or UI confirmation, requires a post id, creates a backup before sending, sends only the selected post, writes the normal JSON publication log, and marks only that post as published/testPublished in the JSON store.

Bulk publishing is forbidden in this center. It does not run GitHub Actions, does not modify `publish-scheduler.yml`, does not switch production publishing to Supabase, does not run mirror sync apply, and does not run migrations.

## CLI

```bash
npm run publish:test-one:dry
node scripts/manual-one-post-test-send.mjs --dry-run --post-id=weekly-...
node scripts/manual-one-post-test-send.mjs --send --confirm-one-post-send --post-id=weekly-...
```

Codex must not run send mode during development checks. Real send is run only by the user manually after reviewing dry-run output.

## Admin Page

Open:

```text
/admin/manual-test-send
```

The page shows the recommended first test post, safety flags, token configured true/false, dry-run preview, post text, image path and existence, readiness score, warnings, errors, and the exact Telegram payload. The send button is available only when the selected post is safe and the UI confirmation checkbox is checked.

## Production Policy

Production publishing remains:

```text
GitHub Actions -> JSON store -> Telegram
```

Supabase remains a mirror. Secrets, `.env.local`, token values, and database passwords are never printed or committed.
