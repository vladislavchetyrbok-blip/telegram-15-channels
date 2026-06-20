# Zodiac Zodiac OS Publishing Center

Package 60, updated Package 63 | 2026-06-20

This document describes the safe owner-facing publishing center for the Zodiac Zodiac OS. It is a preparation and dry-run console, not a live publishing surface.

## Route

```text
/dashboard/networks/zodiac/publishing
```

The page is linked from the platform sidebar, overview, channels, Content
Engine, operations, and Admin Safety Center pages.

## Daily / Weekly / Live Status

| Area | Status |
|---|---|
| Daily Zodiac publishing | ON / safe |
| Weekly live | OFF |
| Dry-run | Safe, should show Telegram API calls `0` |
| Ledger | Protected, duplicate-safe |
| Manual draft prep | LocalStorage only |
| Live publish from dashboard | NO |
| Mass launch | STOP |

## Content Calendar Preview

The page shows a read-only preview for:

- today;
- tomorrow;
- current week range and ISO week number;
- expected Zodiac channels count;
- expected posts count;
- ledger sent/missing summary where local ledger data is available;
- status such as `scheduled`, `dry-run available`, or `weekly live OFF`.

The preview reads local config/ledger data only. It does not call Telegram.

## Dry-Run Commands

Command cards are hints for terminal use:

```bash
npm run zodiac:workflow:check -- --date YYYY-MM-DD
npm run zodiac:publish-date:dry -- --date YYYY-MM-DD
npm run zodiac:navigation:all:dry
npm run zodiac:descriptions:dry
npm run zodiac:ledger:safety:check
npm run production:safety:check
```

Expected dry-run contract:

```text
Telegram API calls: 0
Ledger Writes: 0
Live Publish Calls: 0
```

## Manual Draft Builder

The `Ручной draft-пост` section is local-only:

- stores draft in browser `localStorage`;
- does not write server data;
- does not call Telegram APIs;
- generates Telegram-ready text;
- generates a manual checklist.

Fields:

- channel/topic;
- date;
- post type: daily horoscope, weekly preview, announcement, soft launch invite, custom/manual;
- language: `RU` / `UA` / `EN`;
- title;
- body;
- CTA text;
- Mini App `startapp`;
- notes.

Validation:

- channel required;
- date required;
- body required;
- `startapp` must be safe;
- no token/secret fields;
- long body warning above 3200 characters.

Checklist:

1. Review text.
2. Dry-run.
3. Confirm channel.
4. Manual approval.
5. Live publish only through approved process.

## Ledger Rules

- Ledger protects from duplicates.
- Dry-run must not write ledger.
- Manual ledger edits are not allowed.
- Corrupt ledger must fail closed.
- Live publish requires separate explicit approval and the approved process.

## Live Publish Rules

The publishing center intentionally does not render a live publish button.

Live commands, if documented elsewhere, are manual approval only and are not dashboard actions. Weekly live remains OFF. Payments/Stars, profile sync, exact astro claims, and mass launch remain OFF/STOP.

Package 62 adds the related Admin Safety Center at:

```text
/dashboard/networks/zodiac/security
```

Before any live publish process, check the Approval Matrix there. Daily live
publish remains blocked in UI and requires explicit owner approval outside the
dashboard.

Package 63 adds the related Content Engine at:

```text
/dashboard/networks/zodiac/content
```

Use it to prepare local-only template drafts, preview CTA/startapp text, and run
the RU/UA quality checklist before copying approved text into the manual post
draft flow. There is no automatic server-backed draft import yet.

## Zodiac OS Naming System (Package 66)

* **Full platform** = Zodiac OS
* **Dashboard/admin** = Zodiac Control
* **Mini App** = Zodiac Mini
