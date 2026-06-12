# Zodiac Network: Final Pre-Launch Runbook

## A. Current Status
- Legacy 15-channel network is paused.
- Zodiac Network is the active direction (13 channels).
- Real publish is **disabled**.
- Real Telegram channels must be created **manually**.
- Bot API cannot create channels.

## B. Pre-Launch Stages

### Stage 0 — Verify Repository
Before starting, ensure a clean and verified local environment:
```bash
git status --short
npm run build
npm run lint
npm run zodiac:healthcheck -- --quick
```

### Stage 1 — Create 13 Telegram Channels Manually
1. Open `docs/ZODIAC_MANUAL_CHANNEL_CREATION.md`.
2. Create 13 channels in Telegram.
3. Set usernames, avatars, descriptions.
4. Publish pinned welcome posts.
5. Add the application bot as an admin.

### Stage 2 — Collect Connection Data
Fill out the provided JSON template with the real data (actualUsername, publicLink, etc.). Leave `telegramChannelId` as `null` if unknown.

### Stage 3 — Preview Connection Patch
Run the prepare tool in preview mode to validate your JSON input.
```bash
npm run zodiac:prepare-connections -- ./exports/my-real-zodiac-connections.json
```
Review the patch preview generated in `exports/`. Do not proceed until validation passes.

### Stage 4 — Apply Connection Config
After successful review, apply the configuration safely:
```bash
npm run zodiac:prepare-connections -- ./exports/my-real-zodiac-connections.json --apply --confirm-apply
```
Verify `data/zodiacChannelConnections.ts` changed only expected fields. Do not set `publish_ready` manually.

### Stage 5 — Generate Content Plan
Generate a local Zodiac plan to test content generation.
```bash
npm run zodiac:generate-plan -- --start-date 2026-06-13 --days 7 --style luxury-mystic
```

### Stage 6 — Validate Content Plan
Ensure the generated JSON is structurally sound.
```bash
npm run zodiac:validate-plan -- ./exports/zodiac-weekly-plan-2026-06-13.json
```

### Stage 7 — Review Content
Perform an editorial review (and optionally rewrite weak posts via LM Studio).
```bash
npm run zodiac:review-plan -- ./exports/zodiac-weekly-plan-2026-06-13.json
```

### Stage 8 — Dry-Run
Run a dry-run publisher to simulate sending the posts to the connected channels.
```bash
npm run zodiac:dry-run -- ./exports/zodiac-weekly-plan-2026-06-13.json
```
Confirm no actual Telegram messages are sent and the pipeline succeeds.

### Stage 9 — Healthcheck
Run a full healthcheck of the entire toolchain.
```bash
npm run zodiac:healthcheck -- --full
```

### Stage 10 — Approval Gate
- User manually approves that everything is ready.
- **No real publish without explicit approval.**
- Real publish scripts may be built in a future phase.

---

## C. Hard Stop Rules

Stop the process immediately if:
- `.env` or `.env.local` changed unexpectedly.
- `data/runtime` files changed.
- Build or lint failed.
- Generated `exports/` files appear staged in git.
- Old legacy channels are selected or listed.
- Any post has `publishReady: true` before final approval.
- Any status is `due`/`published` before real publishing phase is authorized.
- Channel count is not exactly 13.
- Dry-run has blocking issues.
- Bot is not admin in the real channels.
- **Real publish command is about to run accidentally.**

---

## D. Safe Command Reference

**Safe Local Commands:**
- `npm run zodiac:generate-plan`
- `npm run zodiac:validate-plan`
- `npm run zodiac:review-plan`
- `npm run zodiac:dry-run`
- `npm run zodiac:pipeline`
- `npm run zodiac:healthcheck`
- `npm run zodiac:prepare-connections`

**NOT FOR ZODIAC (Legacy/Danger):**
- ❌ `npm run publish:due:json`

---

## E. Approval Checklist

| Step | Status |
|------|--------|
| 13 channels created manually | [ ] |
| Usernames checked | [ ] |
| Bot added as admin to all | [ ] |
| Connection file previewed | [ ] |
| Config applied safely | [ ] |
| Plan generated | [ ] |
| Plan validated | [ ] |
| Editorial review passed | [ ] |
| Dry-run passed | [ ] |
| Healthcheck passed | [ ] |
| **User approved real publish phase** | [ ] |

---

## F. Rollback Notes

If something goes wrong during the config update:
1. Check `git status --short`.
2. Run `git restore data/zodiacChannelConnections.ts` if the config patch was incorrect or corrupted.
3. Do not touch `data/runtime`.
4. Do not run any publish commands.
5. Ask for human review.
