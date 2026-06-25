# Package 146 — Public Bot Profile / Main Mini App Launch Packaging

## Summary

Package 146 creates **public bot profile and Main Mini App launch packaging only**: recommended
copy, a manual setup checklist, deep-link concepts, safety boundaries, and a dashboard view. A
human uses it to set things up by hand. Nothing touches BotFather, the Telegram API, or production.

## Scope and boundaries

This package:

- creates public bot profile / Main Mini App launch packaging only;
- does **not** configure BotFather;
- does **not** call the Telegram API;
- does **not** launch production;
- does **not** implement payments;
- does **not** implement real VIP access;
- does **not** write to the database;
- does **not** modify cron / workflow / publish scripts or bot-sending logic;
- does **not** change active Telegram CTA generation.

Daily / weekly automation remains **unblocked**. Manual Review remains **UI / read-only**.

## Deliverables

- `lib/zodiac/aphrodite-public-bot-profile-launch-packaging.ts` — types and five exported functions
  (`getAphroditePublicLaunchCopy`, `getAphroditePublicLaunchChecklist`,
  `getAphroditePublicLaunchDeepLinks`, `getAphroditePublicLaunchBoundaries`,
  `getAphroditePublicLaunchNextSteps`). Deterministic, local, no external calls.
- `app/dashboard/networks/zodiac/public-bot-profile-launch-packaging/page.tsx` — read-only dashboard
  page with packaging summary, recommended bot copy, Main Mini App checklist, deep-link concepts,
  safe CTAs / blocked claims, safety boundaries, and next package. Classification:
  **Launch packaging only / Manual setup / No Telegram API**.
- `scripts/qa-aphrodite-public-bot-profile-launch-packaging.mjs` — local QA (27 checks).
- `scripts/qa-zodiac-dashboard.mjs` — route + assertions.
- Conservative dashboard navigation links from fifteen existing pages.
- `docs/aphrodite-public-bot-profile-launch-packaging.md`.

## Verified boundaries

- BotFather configured: No
- Telegram API used: No
- Production launch performed: No
- Database write implemented: No
- Account credentials stored: No
- Real payment implemented: No
- Real VIP access implemented: No
- Active Telegram CTA logic changed: No

## Next package

**Package 147 — Mini App First Screen Real Integration.**
