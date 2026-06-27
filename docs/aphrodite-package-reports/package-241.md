# Package 241: Mystic Cards Redesign

## Summary

Package 241 redesigns the live Mini App Mystic Cards flow as a premium mystical reveal experience. It improves Daily Card, Tarot, and Rune presentation while keeping the existing card selection, deterministic generation, storage, save/share, analytics payload shape, and CTA destinations unchanged.

## Files Changed

- `components/ZodiacMysticSections.tsx`
- `lib/zodiac/aphrodite-mystic-cards-redesign.ts`
- `app/dashboard/networks/zodiac/mystic-cards-redesign/page.tsx`
- `app/dashboard/networks/zodiac/page.tsx`
- `scripts/qa-zodiac-dashboard.mjs`
- `scripts/qa-aphrodite-mystic-cards-redesign.mjs`
- `scripts/qa-aphrodite-birth-matrix-natal-flow-redesign.mjs`
- `docs/aphrodite-mystic-cards-redesign.md`
- `docs/aphrodite-package-reports/package-241.md`

## Live Mystic Cards Flow Changed

- Route/component: `/miniapp` with `startapp=mystic`, implemented in `components/ZodiacMysticSections.tsx`.
- Daily Card now has a closed-card ritual frame, revealed card preview, daily/love/money/warning lanes, and action block.
- Tarot now has a premium selection frame, closed-card state, reveal hero, preserved visual spread, result interpretation hierarchy, and preview-only deeper reading.
- Rune now has a premium selection frame, closed-rune state, reveal hero, preserved visual spread, result interpretation hierarchy, and preview-only deeper reading.

## Design System Components Used

- `AphroditeBadge`
- `AphroditeCard`
- `AphroditeMetricCard`
- `AphroditeMysticCardPreview`
- `AphroditeSectionHeader`

## Markers Added

- `data-aphrodite-mystic-cards-redesign="package-241"`
- `data-aphrodite-mystic-card-daily="package-241"`
- `data-aphrodite-mystic-card-tarot="package-241"`
- `data-aphrodite-mystic-card-rune="package-241"`
- `data-aphrodite-mystic-card-selection="package-241"`
- `data-aphrodite-mystic-card-input="package-241"`
- `data-aphrodite-mystic-card-closed-state="package-241"`
- `data-aphrodite-mystic-card-selected-state="package-241"`
- `data-aphrodite-mystic-card-empty-state="package-241"`
- `data-aphrodite-mystic-card-reveal="package-241"`
- `data-aphrodite-mystic-card-spread="package-241"`
- `data-aphrodite-mystic-card-result="package-241"`
- `data-aphrodite-mystic-card-state="package-241"`
- `data-aphrodite-mystic-card-vip-preview="package-241"`
- `data-aphrodite-mystic-card-preview-only="package-241"`

## What Was Not Changed

- Mystic Cards selection logic changed: No.
- random/deterministic logic changed: No.
- storage logic changed: No.
- compatibility flow redesigned again: No.
- Birth Matrix / Natal flow redesigned again: No.
- active CTA logic changed: No.
- payment added: No.
- VIP unlock added: No.
- Telegram API used: No.
- messages sent: No.
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

Required checks for Package 241:

```powershell
npm run typecheck
npm run lint
npm run build
npm run zodiac:miniapp:smoke
npm run zodiac:dashboard:qa
node scripts/qa-aphrodite-mystic-cards-redesign.mjs
```

Key QA scripts from Packages 236-240 and launch safety packages were also run after the redesign.

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

Package 242 - VIP Locked Preview Redesign.
