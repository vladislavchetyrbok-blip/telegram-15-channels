# Aphrodite Social Export Dashboard (Package 144)

## What this is

Package 144 creates a **local, read-only manual export dashboard** on top of the Package 143 review
queue. It helps a human copy approved drafts out by hand for Instagram, TikTok, Telegram, and
future YouTube Shorts.

It is **manual copy/export only**.

## What this package explicitly does NOT do

- It does **not** implement auto-posting (no "Post now", no "Connect account", no scheduling).
- It does **not** call Instagram / TikTok / YouTube / Telegram APIs.
- It does **not** store platform credentials or tokens.
- It does **not** scrape competitors.
- It does **not** copy competitor designs or texts.
- It does **not** implement payments.
- It does **not** implement real VIP access.
- It does **not** write to any database.
- It does **not** modify cron, workflows, publish scripts, or bot-sending logic.
- It does **not** perform a production launch.

Daily and weekly automation remain **unblocked**. Manual Review remains UI / read-only.

## Model

`lib/zodiac/aphrodite-social-export-dashboard.ts` exports:

- `getAphroditeSocialExportItems()` — 8 sample export items (one per pillar).
- `getAphroditeSocialExportPlatformGuides()` — per-platform formatting and manual export steps.
- `getAphroditeSocialExportBoundaries()` — safety boundaries.
- `getAphroditeSocialExportNextSteps()` — next steps.
- `isAphroditeSocialExportReady(item)` — true only when the item is "ready-for-manual-export".

Each item includes source draft id, platform, title, hook, body lines, caption, hashtags, safe
CTA, export status, manual export instructions, safety checklist, and blocked actions.

## Export statuses

Not Ready, Ready for Manual Export, Blocked by Safety, Needs Copy Review.

## Blocked actions

No auto-posting; No platform API call; No account connection; No credentials; No scraping;
No payment CTA; No production scheduling.

## Next package

**Package 145 — Social Content Calendar.**
