# Package 214 - Real Device Evidence Pack

Package 214 adds a safe owner-facing evidence layer for Aphrodite/Zodiac public launch readiness.

This is not production launch. It does not call Telegram API, send messages, change BotFather,
change active CTA logic, add payments, unlock VIP, write to DB, or change cron/workflows/publish scripts.

## Required Evidence

- desktop check
- mobile browser check
- Telegram WebView check
- startapp/deep link check
- Mini App main screen check
- compatibility flow check
- Birth Matrix flow check
- Mystic cards flow check
- VIP locked state check
- CTA visibility check
- cache/version marker check
- owner manual review status

## Statuses

- PASS
- NEEDS FIX
- BLOCKED
- NOT CHECKED
- OWNER REVIEW REQUIRED

## Evidence Fields

Every required check includes:

- required screenshot
- PASS criteria
- FAIL criteria
- cannot automate rules

## Owner Review

`publicLaunchApproved=false`.

`ownerManualReviewRequired=true`.

Launch remains not approved until the owner manually confirms all required screenshots and resolves
all NEEDS FIX / BLOCKED items.

## Manual Blockers

DATABASE_URL, TELEGRAM_BOT_TOKEN, and backup age remain manual production blockers in the
Go/No-Go review. They are not treated as Package 214 code failures.

## Safety

- Production launch done: No
- Telegram API used: No
- Messages sent: No
- BotFather changed: No
- Active CTA logic changed: No
- DB write added: No
- External analytics added: No
- Payment added: No
- VIP unlock added: No
- Cron/workflows/publish scripts changed: No
