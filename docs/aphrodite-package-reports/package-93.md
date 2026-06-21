# Package 93 Report: Zodiac Soft Launch Preview & Calendar

## Summary
In Package 93, we continued the development of the Zodiac module by introducing a comprehensive "Soft Launch Preview" UI within the Aphrodite Dashboard. This serves as a read-only testing and control room before initiating any live publications.

## Changes Implemented
- **New Route:** Created `/dashboard/networks/zodiac/soft-launch` to host the Soft Launch Preview.
- **Preview Calendar:** Implemented a 7-day lookahead calendar grid validating expected content for all 13 channels.
- **Coverage Map:** Displayed the current status of all 13 Zodiac channels (e.g., Общий гороскоп, Овен, etc.).
- **Safe Commands Dashboard:** Displayed discovered, locally executable safe commands such as `npm run zodiac:publish:date:dry`, `npm run production:safety:check`, and `npm run zodiac:dashboard:qa` for use in local verification.
- **Navigation Updates:** 
  - Added "Soft Launch" to the global Sidebar under the Zodiac menu.
  - Linked to the Soft Launch page from the Daily System page.
  - Linked to the Soft Launch page from the Priority page.
- **QA Automation:** Adapted `qa-zodiac-dashboard.mjs` to accurately crawl the new `/dashboard/networks/zodiac/soft-launch` page under authenticated conditions.
- **Documentation:** Created `docs/zodiac-soft-launch-preview.md`.

## Safety Confirmations
- **No Live API Calls:** The preview dashboard strictly provides read-only overviews; no Telegram API hits occur.
- **Auth Integrity:** The QA script validates the page effectively respecting the `aphrodite_session` boundary.
- **No Destructive Action:** No configurations were overwritten. The existing daily system structure (validated in Package 91) was preserved and linked to.

## Next Recommended Package
We recommend proceeding to the QA testing of the generated visual posts, or to manual authorization logic (Phase 6 of Soft Launch) depending on operational readiness.
