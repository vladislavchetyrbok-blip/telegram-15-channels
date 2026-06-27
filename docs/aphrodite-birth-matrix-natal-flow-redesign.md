# Aphrodite Birth Matrix / Natal Flow Redesign

Package 240 redesigns the live Birth Matrix / Natal / birth profile visual layer only. The goal is to make the flow feel premium, mystical, personal, introspective, modern, and safe inside Telegram WebView while preserving existing calculations and date behavior.

## Flow areas identified

- `/birth-matrix`: standalone Birth Matrix route with `ZodiacDateInput`, mock matrix calculation, result cards, energy matrix, relationship hint, and safe preview copy.
- `/miniapp -> Birth Matrix / Матрица судьбы`: Mini App mystic section rendered by `BirthMatrixFeature`.
- `/miniapp -> VIP Natal Chart`: VIP natal/birth profile screen rendered by `ExtendedNatalFeature`.

## Redesign goals

- Explain what the user gets before asking for birth data.
- Keep the birth date input as text input with `ДД.ММ.ГГГГ`.
- Preserve Package 224 formatting, including `01012000 -> 01.01.2000`.
- Present the result as a personal energy report instead of a raw technical output.
- Highlight number/energy cards, strengths, risks, purpose, relationships, money, growth, and next action where existing data already exists.
- Add preview-only Pro/VIP locked cards without activating payment or entitlement.
- Keep the flow mobile-first for 360px, 390px, 430px, Telegram WebView, and desktop.

## Live UI markers

- `data-aphrodite-birth-matrix-natal-flow-redesign="package-240"`
- `data-aphrodite-birth-matrix-flow-redesign="package-240"`
- `data-aphrodite-birth-matrix-input="package-240"`
- `data-aphrodite-birth-matrix-report="package-240"`
- `data-aphrodite-birth-matrix-energy-card="package-240"`
- `data-aphrodite-birth-matrix-personal-report="package-240"`
- `data-aphrodite-birth-matrix-vip-preview="package-240"`
- `data-aphrodite-natal-flow-redesign="package-240"`
- `data-aphrodite-natal-input="package-240"`
- `data-aphrodite-natal-report="package-240"`
- `data-aphrodite-natal-vip-preview="package-240"`

## Design system primitives used

- `AphroditeCard`
- `AphroditeBadge`
- `AphroditeMetricCard`
- `AphroditeSectionHeader`
- Existing `AphroditeMiniAppShell`, `AphroditeSectionCard`, and `AphroditeStatusPill`

## What changed visually

- The Birth Matrix input now has a clearer personal profile introduction.
- The Mini App matrix result now has a premium hero, Aphrodite metric cards, personal report cards, and a preview-only Pro card.
- The standalone `/birth-matrix` route now has Package 240 route/input/report/energy/preview markers and a clearer “what user gets” block.
- The VIP Natal screen now has a clear “what the card gives” setup card, report marker, and preview-only Pro Natal card.

## What was not changed

- Birth Matrix/Natal calculation logic unchanged.
- `calculateMockBirthMatrix` unchanged.
- `generateBirthMatrix` unchanged.
- `buildNatalBlocks` unchanged.
- `buildNatalResultSections` unchanged.
- Zodiac sign logic unchanged.
- Birth-date parsing/validation unchanged.
- `ZodiacDateInput` unchanged.
- Package 224 date formatting unchanged.
- Compatibility flow not redesigned again.
- Mystic Cards flow not redesigned.
- Active CTA logic unchanged.
- No active payment.
- No VIP unlock.
- No Telegram API.
- No DB writes.
- No external analytics.
- No cron/workflow/publish script changes.
- No secrets.
- No production launch.

## VIP/Pro locked preview

The flow now includes preview-only locked cards for deeper:

- cycles
- money
- relationships
- mission
- practices
- natal-to-matrix connection

The cards state that payment is not active, entitlement is not granted, and real VIP unlock is not implemented.

## Safety confirmation

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

## Next package recommendation

Package 241 - Mystic Cards Redesign.
