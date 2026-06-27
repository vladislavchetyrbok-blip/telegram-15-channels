# Aphrodite Mini App Home Screen Redesign

Package 238 applies the Package 237 Aphrodite design system to the Mini App home/entry layer.

## Scope

- `/miniapp` static entry screen.
- `/compatibility` live Mini App home panel rendered before the user enters a specific flow.
- Dashboard readiness route: `/dashboard/networks/zodiac/miniapp-home-screen-redesign`.
- Static model: `lib/zodiac/aphrodite-miniapp-home-screen-redesign.ts`.
- QA script: `scripts/qa-aphrodite-miniapp-home-screen-redesign.mjs`.

## What Changed

- Premium hero with Aphrodite, premium mystical romantic mood, dark cosmic base, and rose/violet/gold accents.
- Short emotional headline/subheadline.
- Primary CTA: `Проверить совместимость`.
- Secondary CTAs: `Матрица судьбы` and `Мистическая карта`.
- Daily/love teaser and Mystic Cards preview.
- VIP locked preview with explicit no active payment and no VIP unlock wording.
- Trust/safety microcopy.
- Telegram WebView safe-area bottom spacing.

## What Did Not Change

- Compatibility calculation flow.
- Birth Matrix calculation/date input flow.
- Mystic Cards flow internals.
- Active CTA logic.
- Telegram API usage.
- Telegram message sending.
- Payments.
- VIP unlock/entitlement.
- Database writes.
- External analytics.
- Cron/workflows/publish scripts.
- Secrets.
- Public launch flags.

## Safety

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

## Remaining Manual Checks

- 360px, 390px, and 430px mobile screenshots.
- Telegram iOS WebView.
- Telegram Android WebView.
- Desktop browser.
- Owner review of final Russian copy and visual tone.

## Next Recommended Package

Package 239 - Compatibility Flow Redesign.
