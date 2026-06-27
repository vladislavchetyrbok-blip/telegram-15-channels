# Package 237: Aphrodite Design System

## Summary

Package 237 added the Aphrodite Mini App design-system foundation. The package documents the premium mystical romantic modern direction and adds reusable presentational primitives for later redesign packages.

## Added

- Static design-system model: `lib/zodiac/aphrodite-design-system.ts`
- Dashboard route: `/dashboard/networks/zodiac/aphrodite-design-system`
- Reusable preview primitives: `components/zodiac-mini-app/aphrodite-design-system/`
- Package QA: `scripts/qa-aphrodite-design-system.mjs`
- Documentation: `docs/aphrodite-design-system.md`

## Design System Scope

- Brand mood and visual principles.
- Color tokens for dark cosmic, violet, rose, and gold accents.
- Gradient tokens for hero, CTA, mystic, glass, and score surfaces.
- Card, button, typography, spacing, mobile breakpoint, and Telegram WebView safe-area rules.
- Result card, VIP locked preview, and mystic card visual language.
- Accessibility and readability constraints for long Russian text and mobile widths.
- Roadmap usage for Packages 238-245.

## Safety Confirmation

- publicLaunchApproved=false
- ownerManualReviewRequired=true
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
- Secrets added: No
- Production DB connected: No

## Remaining Blockers

- DATABASE_URL manual configuration.
- TELEGRAM_BOT_TOKEN manual configuration.
- Backup freshness <24h.
- Restore rehearsal.
- Real-device QA manual execution.
- Telegram WebView/startapp manual QA.
- Content/CTA owner review.
- Owner explicit approval.
