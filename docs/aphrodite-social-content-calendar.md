# Aphrodite Social Content Calendar (Package 145)

## What this is

Package 145 creates a **local, read-only social content calendar**. It plans draft content by day,
week, platform, and pillar over the existing content / template / review / export layers.

It is **planning only**.

## What this package explicitly does NOT do

- It does **not** implement auto-posting.
- It does **not** implement auto-scheduling.
- It does **not** call Instagram / TikTok / YouTube / Telegram APIs.
- It does **not** store platform credentials.
- It does **not** scrape competitors.
- It does **not** copy competitor designs or texts.
- It does **not** implement payments.
- It does **not** implement real VIP access.
- It does **not** write to any database.
- It does **not** modify cron, workflows, publish scripts, or bot-sending logic.
- It does **not** perform a production launch.

Daily and weekly automation remain **unblocked**. Manual Review remains UI / read-only.

## Model

`lib/zodiac/aphrodite-social-content-calendar.ts` exports:

- `getAphroditeSocialContentCalendarWeeks()` — weekly plans with items + coverage / safety notes.
- `getAphroditeSocialContentCalendarItems()` — all calendar items (14 in the sample).
- `getAphroditeSocialContentCalendarBoundaries()` — safety boundaries.
- `getAphroditeSocialContentCalendarNextSteps()` — next steps.
- `getAphroditeSocialContentCalendarCoverageSummary()` — platforms, pillars, totals, and status counts.

Each item includes day, platform, pillar, format, title, hook, safe CTA, status, review
requirement, manual export notes, and blocked actions.

## Coverage

The 14-item sample covers all 4 platforms and all 8 pillars, with at least 2 items ready for manual
export, at least 2 needing review, and at least 1 blocked by safety.

## Statuses

Planned, Draft Needed, Needs Review, Ready for Manual Export, Blocked by Safety.

## Next package

**Package 146 — Public Bot Profile / Main Mini App Launch Packaging.**
