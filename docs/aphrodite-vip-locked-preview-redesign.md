# Aphrodite VIP Locked Preview Redesign

Package 242 unifies the VIP locked preview layer across the Aphrodite/Zodiac Mini App. This is visual/UX work only: it makes locked previews feel premium, romantic, mystical, modern, and honest without activating payments, entitlement, VIP access, Telegram API, DB writes, or launch approval.

## Surfaces Updated

- `/miniapp` home screen: `components/zodiac-mini-app/AphroditeHomeScreen.tsx`
- `/miniapp` static entry page: `app/miniapp/page.tsx`
- Compatibility result preview: `components/zodiac-mini-app/ResultCards.tsx`
- Mini App Birth Matrix preview: `components/ZodiacMysticSections.tsx`
- Direct `/birth-matrix` preview: `app/birth-matrix/BirthMatrixClient.tsx`
- Mystic Cards deeper reading preview: `components/ZodiacMysticSections.tsx`
- VIP Natal preview: `components/ZodiacVipSections.tsx`
- `/vip-compatibility-report` future VIP sections: `app/vip-compatibility-report/VipCompatibilityReportClient.tsx`
- `/vip-preview` index: `app/vip-preview/page.tsx`

## Shared Component

The package expands `AphroditeLockedPreviewCard` into the shared presentational locked state for:

- `home`
- `compatibility`
- `birthMatrix`
- `mystic`
- `natal`
- `general`

It supports title, subtitle, preview copy, feature list, preview items, lock label, safety label, scope marker, and responsive mobile spacing.

Every shared card emits:

- `data-aphrodite-vip-locked-preview-redesign="package-242"`
- `data-aphrodite-vip-locked-scope="<scope>"`

Historical flow markers from Packages 239, 240, and 241 were preserved.

## Value Ladder Preview

The locked previews now show a consistent future value ladder:

- Deep compatibility report
- Relationship calendar
- Birth Matrix Pro
- Mystic deep reading
- Natal profile
- Personal advice
- Shareable premium card

All of this remains preview only. No real product access was added.

## Locked State Rules

- No active payment-looking CTA.
- No buy/unlock button.
- No invoice.
- No entitlement bypass.
- No real VIP unlock.
- No route gate.
- No DB write.
- No external analytics.

## Mobile / Telegram WebView

- Target widths: 360px, 390px, 430px.
- Cards use short blocks, wrapping grids, and `break-words`.
- No fixed payment CTA or keyboard-sensitive control was added.
- Telegram iOS and Android WebView screenshot checks remain manual.

## What Was Not Changed

- active CTA logic unchanged.
- app flows unchanged.
- compatibility calculation unchanged.
- Birth Matrix/Natal calculation unchanged.
- Mystic Cards selection/randomness/storage unchanged.
- payment not added.
- VIP unlock not added.
- entitlement bypass not added.
- Telegram API not used.
- messages not sent.
- BotFather not changed.
- DB write not added.
- external analytics not added.
- cron/workflows/publish scripts not changed.
- secrets not added.
- production DB not connected.
- `publicLaunchApproved=false`.
- `ownerManualReviewRequired=true`.

## QA

Package QA:

```powershell
node scripts/qa-aphrodite-vip-locked-preview-redesign.mjs
```

Full package checks also run typecheck, lint, build, Mini App smoke, dashboard QA, and key previous design/safety QA scripts.

## Next Package Recommendation

Package 243 - Result / Share Cards.
