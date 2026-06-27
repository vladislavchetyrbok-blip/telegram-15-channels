# Aphrodite Design System

Package 237 adds the Aphrodite Mini App design-system foundation for future visual redesign work. It is a readiness/design layer only.

## Visual Direction

- Premium, mystical, romantic, modern.
- Dark cosmic base with violet, rose, and gold accents.
- Glass-like cards with readable contrast.
- Clean CTA hierarchy: one primary action, secondary glass actions, share/result actions, locked preview states.
- Telegram WebView mobile-first spacing for 360px, 390px, and 430px widths.
- Not childish, not casino-like, and not cheap horoscope spam.

## Added Foundation

- Static model: `lib/zodiac/aphrodite-design-system.ts`
- Dashboard showcase: `/dashboard/networks/zodiac/aphrodite-design-system`
- Reusable presentational primitives under `components/zodiac-mini-app/aphrodite-design-system/`
- QA script: `scripts/qa-aphrodite-design-system.mjs`

## Reusable Primitives

- `AphroditeSurface`
- `AphroditeCard`
- `AphroditeHeroCard`
- `AphroditeButton`
- `AphroditeBadge`
- `AphroditeSectionHeader`
- `AphroditeMetricCard`
- `AphroditeResultCardPreview`
- `AphroditeLockedPreviewCard`
- `AphroditeMysticCardPreview`

These components are presentational only. They do not call Telegram APIs, send messages, write to a database, activate payments, unlock VIP, or change active CTA logic.

## Future Package Usage

- Package 238: Mini App home screen redesign.
- Package 239: Compatibility flow redesign.
- Package 240: Birth Matrix / Natal flow redesign.
- Package 241: Mystic Cards redesign.
- Package 242: VIP locked preview redesign without payment or unlock behavior.
- Package 243: Result / share cards.
- Package 244: Telegram WebView mobile polish.
- Package 245: Visual QA screenshot pack.

Package 237 does not start any of those packages.

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
