# Aphrodite Mini App Visual Design Audit

Package 236 starts the visual design phase for the Aphrodite/Zodiac Mini App.
This is a design audit and design-direction package only.

## What was audited

- Mini App entry / home screen.
- Compatibility input flow.
- Compatibility result flow.
- Birth Matrix / Natal flow.
- Mystic Cards flow.
- VIP locked / preview state.
- Profile / History / Favorites.
- Loading, empty, and error states.
- Mobile Telegram WebView layout.
- CTA visibility.
- Share/result card opportunities.

Primary files inspected:

- `app/miniapp/page.tsx`
- `app/compatibility/page.tsx`
- `components/ZodiacCompatibilityMiniApp.tsx`
- `components/zodiac-mini-app/*`
- `app/birth-matrix/BirthMatrixClient.tsx`
- `components/ZodiacMysticSections.tsx`
- `components/ZodiacVipSections.tsx`
- `app/vip-compatibility-report/page.tsx`

## Biggest current UI weaknesses

- The first impression is functional but not yet premium enough for a polished relationship/astrology Mini App.
- Many cards have similar dark surfaces, borders, and text sizes, so hierarchy can feel flat.
- Some flows contain dense explanatory copy that may feel heavy at 360-430px widths.
- Result pages are useful but not yet anchored by a strong shareable visual card.
- VIP preview needs to feel desirable without implying active payment or unlocked entitlement.
- Empty, loading, and error states need warmer branded guidance.

## Strongest design opportunities

- Build a premium, mystical, romantic, modern Aphrodite design system.
- Make the home first viewport more focused: one promise, one primary CTA, one trust note.
- Turn compatibility results into screenshot-friendly share cards.
- Give Mystic Cards a reveal feeling without external assets.
- Make Birth Matrix / Natal results feel more personal and ritual-like.
- Polish Telegram WebView spacing, bottom navigation, keyboard states, and safe-area behavior.

## Proposed visual direction

- Mood: premium, mystical, romantic, modern.
- Avoid: childish style, casino energy, cheap horoscope spam, visual clutter.
- Mobile first: 360px, 390px, and 430px.
- Telegram WebView safe-area friendly.
- Visual language: dark cosmic depth, glass-like cards, restrained gold/violet/rose accents, clear CTA buttons, clean typography hierarchy, strong result/share cards.

## Package plan

- Package 237 - Aphrodite Design System.
- Package 238 - Mini App Home Screen Redesign.
- Package 239 - Compatibility Flow Redesign.
- Package 240 - Birth Matrix / Natal Flow Redesign.
- Package 241 - Mystic Cards Redesign.
- Package 242 - VIP Locked Preview Redesign.
- Package 243 - Result / Share Cards.
- Package 244 - Telegram WebView Mobile Polish.
- Package 245 - Visual QA Screenshot Pack.

## Safety confirmation

- No production launch.
- No Mini App screen redesign in Package 236.
- No active CTA logic change.
- No Telegram API call.
- No messages sent.
- No BotFather change.
- No payment added.
- No VIP unlock added.
- No DB write added.
- No external analytics added.
- No cron/workflow/publish script change.
- No secrets added.
- No production DB connection.
- `publicLaunchApproved=false`.
- `ownerManualReviewRequired=true`.

## Next recommendation

Package 237 - Aphrodite Design System.
