# Package 138 — Red Flags Scanner Foundation

## Summary

Package 138 creates the **local, deterministic Red Flags Scanner foundation**: a care-first
preview generator plus a read-only dashboard page. It gently surfaces zones of attention, with no
live behaviour and no accusations.

## Scope and boundaries

This package:

- creates the local Red Flags Scanner foundation;
- does **not** implement AI generation;
- does **not** call external AI APIs;
- does **not** implement payments;
- does **not** implement real VIP access;
- does **not** call the Telegram API;
- does **not** write to the database;
- does **not** change active Telegram CTA logic;
- does **not** modify cron / workflow / publish scripts or bot-sending logic;
- does **not** diagnose people or make abuse accusations;
- does **not** provide emergency / safety / legal / medical advice;
- does **not** perform a production launch.

Daily / weekly automation remains **unblocked**. Manual Review remains **UI / read-only**.

## Deliverables

- `lib/zodiac/aphrodite-red-flags-scanner-foundation.ts` — types and four exported functions
  (`createAphroditeRedFlagsScannerPreview`, `getAphroditeRedFlagsScannerSections`,
  `getAphroditeRedFlagsScannerBoundaries`, `getAphroditeRedFlagsScannerTrafficHooks`);
  deterministic, local, no external calls, soft wording only.
- `app/dashboard/networks/zodiac/red-flags-scanner-foundation/page.tsx` — read-only dashboard page
  with product promise, sample preview, free preview, future VIP teaser, sections, traffic hooks,
  safety boundaries, and next package. Classification:
  **Local foundation only / No AI API / No payment / No real VIP unlock**.
- `scripts/qa-aphrodite-red-flags-scanner-foundation.mjs` — local QA (29 checks, incl. no-abuse /
  no-diagnosis / no-deterministic scans).
- `scripts/qa-zodiac-dashboard.mjs` — route + assertions.
- Conservative dashboard navigation links from eight existing pages.
- `docs/aphrodite-red-flags-scanner-foundation.md`.

## Verified boundaries

- Real AI API implemented: No
- Real payment implemented: No
- Real VIP access implemented: No
- Database schema changed: No
- Telegram API used: No
- Active Telegram CTA logic changed: No
- Production launch performed: No

## Next package

**Package 139 — AI Future Timeline Foundation.**
