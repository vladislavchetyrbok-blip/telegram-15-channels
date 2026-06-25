# Package 145 — Social Content Calendar

## Summary

Package 145 creates a **local, read-only social content calendar**: weekly plans, calendar items,
a coverage summary, safety boundaries, and a dashboard view. It plans draft content by day,
platform, and pillar. It is planning only — nothing is scheduled, auto-posted, or stored.

## Scope and boundaries

This package:

- creates a local social content calendar only;
- does **not** implement auto-posting;
- does **not** implement auto-scheduling;
- does **not** call Instagram / TikTok / YouTube / Telegram APIs;
- does **not** store platform credentials;
- does **not** scrape competitors;
- does **not** copy competitor designs or texts;
- does **not** implement payments;
- does **not** implement real VIP access;
- does **not** write to the database;
- does **not** modify cron / workflow / publish scripts or bot-sending logic;
- does **not** perform a production launch.

Daily / weekly automation remains **unblocked**. Manual Review remains **UI / read-only**.

## Deliverables

- `lib/zodiac/aphrodite-social-content-calendar.ts` — types and five exported functions
  (`getAphroditeSocialContentCalendarWeeks`, `getAphroditeSocialContentCalendarItems`,
  `getAphroditeSocialContentCalendarBoundaries`, `getAphroditeSocialContentCalendarNextSteps`,
  `getAphroditeSocialContentCalendarCoverageSummary`). Deterministic, local, no external calls.
- `app/dashboard/networks/zodiac/social-content-calendar/page.tsx` — read-only dashboard page with
  calendar summary, weekly calendar, platform & pillar coverage, statuses, ready / needs-review /
  blocked lists, manual export notes, safety boundaries, and next package. Classification:
  **Planning only / Manual review / No auto-scheduling**.
- `scripts/qa-aphrodite-social-content-calendar.mjs` — local QA (36 checks).
- `scripts/qa-zodiac-dashboard.mjs` — route + assertions.
- Conservative dashboard navigation links from fourteen existing pages.
- `docs/aphrodite-social-content-calendar.md`.

## Coverage (sample)

14 items across all 4 platforms and all 8 pillars; 3 ready for manual export, 3 needs-review,
1 blocked by safety.

## Verified boundaries

- Real auto-posting implemented: No
- Auto-scheduling implemented: No
- Platform API calls implemented: No
- Scraping implemented: No
- Account credentials stored: No
- Database write implemented: No
- External AI API used: No
- Real payment implemented: No
- Real VIP access implemented: No
- Telegram API used: No
- Active Telegram CTA logic changed: No
- Production launch performed: No

## Next package

**Package 146 — Public Bot Profile / Main Mini App Launch Packaging.**
