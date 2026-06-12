# ZODIAC ROLLOUT PLAN

## Phased Rollout Steps
To ensure maximum safety and prevent accidental mass publishing or errors, the rollout to live channels must proceed through the following 10 steps exactly:

1. **Validate**: Run `npm run zodiac:assets:validate` and `npm run zodiac:weekly-assets:validate` to ensure all 52 general and 91 weekly (or fallbacks) are present.
2. **Preview**: Run `npm run zodiac:preview:weekly` to inspect text length, emojis, dates, and placeholders.
3. **Dry-Run**: Run the pipeline with `--dry-run` to simulate the full telegram delivery and ensure payload parsing passes.
4. **One-channel test**: Execute a dry-run targeted to a single channel (`--channel <id>`).
5. **One-post approved test**: Run `npm run zodiac:pipeline -- --live --channel <id> --limit 1 --approved` to send exactly 1 post. Verify on the channel.
6. **Gemini-only week**: Turn on automation for Gemini channel only (7 days) as the pilot program.
7. **13-channel dry-run**: Generate a full 13-channel week and run dry-run to ensure no rate-limiting or validation errors across the entire grid.
8. **13-channel manual publish**: Publish the entire grid for one day manually using `--approved`. Monitor Telegram limits.
9. **Scheduler dry-run**: Configure the daily cron scheduler but with `--live` flag OFF. Let it run for 3 days and audit `data/runtime/` reports.
10. **Controlled automation**: Turn on the scheduler with live publishing flags. Check reports daily.

## Rollback Plan
If any step fails or an emergency arises (e.g., incorrect dates or broken images being sent):
1. **Stop Scheduler**: Immediately disable the GitHub Action or local cron job.
2. **Remove Flags**: Ensure no script is running with `--approved` or `--live`.
3. **Disable Bot Permissions**: Remove "post messages" admin rights from the Telegram bot for all channels.
4. **Check Reports**: Run `npm run zodiac:report:latest` to see exactly what was published and when.
5. **Revert Changes**: Revert any problematic code or content commit.
