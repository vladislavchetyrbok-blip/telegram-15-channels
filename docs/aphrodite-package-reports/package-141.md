# Package 141 — Social Traffic Layer Architecture

## Summary

Package 141 creates a **read-only social traffic architecture** for Aphrodite across Instagram,
TikTok, Telegram, and YouTube Shorts: strategy, platform matrix, content pillars, viral hooks,
content templates, manual review flow, safe CTA rules, blocked claims, and safety boundaries. It
is planning only.

## Scope and boundaries

This package:

- creates social traffic architecture only;
- does **not** implement auto-posting;
- does **not** call Instagram / TikTok / YouTube / Telegram APIs;
- does **not** store platform credentials;
- does **not** scrape competitors;
- does **not** copy competitor designs or texts;
- does **not** implement payments;
- does **not** implement real VIP access;
- does **not** modify cron / workflow / publish scripts or bot-sending logic;
- does **not** perform a production launch.

Daily / weekly automation remains **unblocked**. Manual Review remains **UI / read-only**.

## Deliverables

- `lib/zodiac/aphrodite-social-traffic-layer.ts` — types and four exported functions
  (`getAphroditeSocialTrafficHooks`, `getAphroditeSocialContentTemplates`,
  `getAphroditeSocialTrafficBoundaries`, `getAphroditeSocialTrafficNextSteps`), plus platform
  matrix, content pillars, safe CTAs, and blocked claims. Static, local, no external calls.
- `app/dashboard/networks/zodiac/social-traffic-layer/page.tsx` — read-only dashboard page with
  strategy summary, platform matrix, content pillars, traffic hooks, content templates, manual
  review flow, safe CTA rules, blocked claims, safety boundaries, and next packages.
  Classification: **Architecture only / No auto-posting / No platform credentials**.
- `scripts/qa-aphrodite-social-traffic-layer.mjs` — local QA (17 checks).
- `scripts/qa-zodiac-dashboard.mjs` — route + assertions.
- Conservative dashboard navigation links from ten existing pages.
- `docs/aphrodite-social-traffic-layer.md`.

## Verified boundaries

- Real auto-posting implemented: No
- Platform API calls implemented: No
- Scraping implemented: No
- Account credentials stored: No
- Real payment implemented: No
- Real VIP access implemented: No
- Telegram API used: No
- Active Telegram CTA logic changed: No
- Production launch performed: No

## Next package

**Package 142 — Social Content Template Engine.**
