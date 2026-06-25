# Package 144 — Social Export Dashboard

## Summary

Package 144 creates a **local, read-only manual export dashboard**: export items, per-platform
guides, manual export instructions, a per-item safety checklist, an export-readiness function, and
a dashboard view. It only helps a human copy approved drafts out by hand — no posting, no APIs, no
credentials, no database write.

## Scope and boundaries

This package:

- creates a local manual social export dashboard only;
- does **not** implement auto-posting;
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

- `lib/zodiac/aphrodite-social-export-dashboard.ts` — types and five exported functions
  (`getAphroditeSocialExportItems`, `getAphroditeSocialExportPlatformGuides`,
  `getAphroditeSocialExportBoundaries`, `getAphroditeSocialExportNextSteps`,
  `isAphroditeSocialExportReady`). Deterministic, local, no external calls.
- `app/dashboard/networks/zodiac/social-export-dashboard/page.tsx` — read-only dashboard page with
  export summary, export items + copy blocks, platform guides, manual export steps, hashtags, safe
  CTA, safety checklist, blocked actions, safety boundaries, and next package. Classification:
  **Manual export only / No auto-posting / No platform API**.
- `scripts/qa-aphrodite-social-export-dashboard.mjs` — local QA (32 checks).
- `scripts/qa-zodiac-dashboard.mjs` — route + assertions.
- Conservative dashboard navigation links from thirteen existing pages.
- `docs/aphrodite-social-export-dashboard.md`.

## Verified boundaries

- Real auto-posting implemented: No
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

**Package 145 — Social Content Calendar.**
