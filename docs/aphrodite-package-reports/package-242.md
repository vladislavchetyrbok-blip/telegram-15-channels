# Package 242: VIP Locked Preview Redesign

## Summary

Package 242 creates a unified preview-only VIP locked layer for Aphrodite/Zodiac. It expands the shared `AphroditeLockedPreviewCard` and applies it across Mini App home, compatibility, Birth Matrix, Mystic Cards, VIP Natal, and safe VIP preview pages.

## Files Changed

- `components/zodiac-mini-app/aphrodite-design-system/AphroditeLockedPreviewCard.tsx`
- `components/zodiac-mini-app/aphrodite-design-system/index.ts`
- `components/zodiac-mini-app/AphroditeHomeScreen.tsx`
- `components/zodiac-mini-app/ResultCards.tsx`
- `components/ZodiacMysticSections.tsx`
- `components/ZodiacVipSections.tsx`
- `app/miniapp/page.tsx`
- `app/birth-matrix/BirthMatrixClient.tsx`
- `app/vip-compatibility-report/VipCompatibilityReportClient.tsx`
- `app/vip-preview/page.tsx`
- `lib/zodiac/aphrodite-vip-locked-preview-redesign.ts`
- `app/dashboard/networks/zodiac/vip-locked-preview-redesign/page.tsx`
- `app/dashboard/networks/zodiac/page.tsx`
- `scripts/qa-zodiac-dashboard.mjs`
- `scripts/qa-aphrodite-vip-locked-preview-redesign.mjs`
- Previous design QA scripts updated for Package 242 cross-flow locked-preview scope.
- `docs/aphrodite-vip-locked-preview-redesign.md`
- `docs/aphrodite-package-reports/package-242.md`

## Live Surfaces Updated

- `/miniapp` home locked preview
- `/miniapp` static entry locked preview
- `/compatibility` and Mini App compatibility result locked preview
- Mini App Birth Matrix locked preview
- `/birth-matrix` locked preview
- Mystic Cards deeper reading locked preview
- VIP Natal locked preview
- `/vip-compatibility-report` future VIP sections
- `/vip-preview` index

## Value Ladder

- Deep compatibility report
- Relationship calendar
- Birth Matrix Pro
- Mystic deep reading
- Natal profile
- Personal advice
- Shareable premium card

## Markers

- `data-aphrodite-vip-locked-preview-redesign="package-242"`
- `data-aphrodite-vip-locked-scope="home"`
- `data-aphrodite-vip-locked-scope="miniapp-entry"`
- `data-aphrodite-vip-locked-scope="compatibility"`
- `data-aphrodite-vip-locked-scope="miniapp-matrix"`
- `data-aphrodite-vip-locked-scope="birth-matrix"`
- `data-aphrodite-vip-locked-scope="mystic"`
- `data-aphrodite-vip-locked-scope="vip-natal"`
- `data-aphrodite-vip-locked-scope="vip-compatibility-report"`
- `data-aphrodite-vip-locked-scope="vip-preview-index"`

## What Was Not Changed

- active CTA logic changed: No.
- app flows changed: No.
- payment added: No.
- VIP unlock added: No.
- entitlement bypass added: No.
- Telegram API used: No.
- messages sent: No.
- BotFather changed: No.
- DB write added: No.
- external analytics added: No.
- cron/workflows/publish scripts changed: No.
- secrets added: No.
- production DB connected: No.

## Safety Flags

- `publicLaunchApproved=false`
- `ownerManualReviewRequired=true`
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

## Checks

Required checks for Package 242:

```powershell
npm run typecheck
npm run lint
npm run build
npm run zodiac:miniapp:smoke
npm run zodiac:dashboard:qa
node scripts/qa-aphrodite-vip-locked-preview-redesign.mjs
```

Key previous design and safety QA scripts are also required after this package.

## Remaining Blockers

- DATABASE_URL manual configuration
- TELEGRAM_BOT_TOKEN manual configuration
- backup freshness <24h
- restore rehearsal
- real-device QA manual execution
- Telegram WebView/startapp manual QA
- content/CTA owner review
- owner explicit approval

## Next Package Recommendation

Package 243 - Result / Share Cards.
