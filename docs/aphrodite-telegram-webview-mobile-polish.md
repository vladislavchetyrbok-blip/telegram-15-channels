# Package 244 - Telegram WebView Mobile Polish

Package 244 is a visual/mobile polish pass for Aphrodite Mini App surfaces inside Telegram WebView.

This package is visual/UX only. It does not change app flows, active CTA logic, compatibility calculation, Birth Matrix/Natal calculation, birth-date parsing, Mystic selection/random/storage, payments, VIP unlock, entitlement, Telegram API usage, DB writes, external analytics, cron/workflows, publish scripts, secrets, production launch, or launch approval flags.

## Scope

- Home: `/miniapp`
- Compatibility: `/compatibility` and Mini App compatibility flow
- Birth Matrix / Natal: `/birth-matrix` and Mini App birth matrix/natal flow
- Mystic Cards: `/miniapp?startapp=mystic`
- VIP Preview: `/vip-preview` and `/vip-compatibility-report`
- Result Cards: compatibility, Birth Matrix, Mystic, Natal, and VIP preview result/share cards
- Shared components and CSS utilities

## Mobile Targets

- 360px
- 390px
- 430px
- Telegram iOS WebView
- Telegram Android WebView
- Browser fallback mode

## What Changed

- Added scoped utilities for mobile shell, safe scrolling, safe-area spacing, touch targets, text wrapping, and horizontal-scroll rails.
- Applied Package 244 marker to live Mini App shells where appropriate.
- Improved card min-width constraints and wrapping in Aphrodite design-system primitives.
- Improved CTA/link touch target sizing.
- Improved sticky result navigation horizontal scrolling.
- Tuned mobile padding so cards stay readable on 360px / 390px and expand at 430px.
- Kept input/select text at 16px where mobile keyboard zoom is a risk.

## QA Requirements

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `npm run zodiac:miniapp:smoke`
- `npm run zodiac:dashboard:qa`
- `node scripts/qa-aphrodite-telegram-webview-mobile-polish.mjs`
- Previous design/safety QA scripts for Packages 236-243 and key readiness gates.

Manual QA still required:

- 360px screenshot review
- 390px screenshot review
- 430px screenshot review
- Telegram iOS WebView real-device review
- Telegram Android WebView real-device review
- No horizontal overflow check
- Safe-area top/bottom check
- Long Russian text wrapping check
- CTA/button visibility and tap target check

## Safety

- Production launch done: No
- Telegram API used: No
- Messages sent: No
- BotFather changed: No
- Active CTA logic changed: No
- App flows changed: No
- DB write added: No
- External analytics added: No
- Payment added: No
- VIP unlock added: No
- Entitlement bypass added: No
- Cron/workflows/publish scripts changed: No
- Secrets added: No
- Production DB connected: No
- publicLaunchApproved=false
- ownerManualReviewRequired=true

## Remaining Blockers

- DATABASE_URL manual configuration
- TELEGRAM_BOT_TOKEN manual configuration
- backup freshness <24h
- restore rehearsal
- real-device QA manual execution
- Telegram WebView/startapp manual QA
- content/CTA owner review
- owner explicit approval

## Next

Recommended next package: Package 245 - Visual QA Screenshot Pack.
