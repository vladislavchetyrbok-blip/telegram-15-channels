# Package 236 - Aphrodite Mini App Visual Design Audit

## Scope

Added the design-audit/readiness route:

`/dashboard/networks/zodiac/aphrodite-miniapp-visual-design-audit`

This package documents the current user-facing Mini App visual state and the
redesign direction for Packages 237-245. It does not redesign core Mini App
screens.

## Audited areas

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

## Biggest visual weaknesses

- Functional but not yet premium enough first impression.
- Many repeated dark cards with similar visual weight.
- Dense text in narrow mobile flows.
- Result/share cards need stronger screenshot-friendly composition.
- VIP preview needs more desire while keeping payment inactive.
- Empty/loading/error states need branded polish.

## Strongest opportunities

- Premium, mystical, romantic, modern design system.
- Clear first viewport and primary CTA.
- Glass-like cards with restrained gold/violet/rose accents.
- Strong compatibility and Birth Matrix result cards.
- Mystic reveal feeling without external assets.
- Telegram WebView mobile polish at 360px, 390px, and 430px.

## Recommended visual direction

The future Aphrodite Mini App should feel like a polished relationship/astrology
product: premium, mystical, romantic, modern, mobile-first, and safe for
Telegram WebView. It should not feel childish, casino-like, or like cheap
horoscope spam.

## Roadmap

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

- Production launch done: No.
- Telegram API used: No.
- Messages sent: No.
- BotFather changed: No.
- Active CTA logic changed: No.
- DB write added: No.
- External analytics added: No.
- Payment added: No.
- VIP unlock added: No.
- Cron/workflows/publish scripts changed: No.
- Secrets added: No.
- Production DB connected: No.
- Dashboard made public: No.
- Mini App screens redesigned: No.
- `publicLaunchApproved=false`.
- `ownerManualReviewRequired=true`.

## QA coverage

Added:

- `scripts/qa-aphrodite-miniapp-visual-design-audit.mjs`.
- Dashboard navigation link.
- Dashboard QA route/content assertions.

## Next package

Package 237 - Aphrodite Design System.
