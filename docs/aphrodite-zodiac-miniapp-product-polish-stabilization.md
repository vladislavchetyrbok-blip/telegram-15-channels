# Package 315 - Zodiac Mini App Product Polish and Stabilization

## Scope

Package 315 returns focus to the existing Telegram/Zodiac Mini App as the primary product.

This package does not continue native mobile work. `apps/mobile` remains separate and is not modified by this package.

## Product Improvements

- Strengthened the first screen so users understand the Mini App as a daily astrology product, not only a menu.
- Added clearer next actions for compatibility, forecasts, mystic cards, and VIP preview.
- Added a daily return block with three safe loops: forecast, compatibility, and mystic card of the day.
- Added compact first-screen status signals for selected sign, next step, and VIP preview boundary.
- Added contextual "what to do next" guidance inside active Mini App sections.
- Added retention copy to daily and weekly forecast panels.

## Still Not Ready

- Production launch remains blocked.
- Payment logic is not added.
- VIP unlock and entitlement bypass are not added.
- Telegram API calls and message sending are not added.
- BotFather setup is not changed.
- Database writes are not added.
- Native iOS/Android work remains paused until the owner explicitly resumes the mobile track.

## Before Mobile Work Resumes

- Close the Telegram Mini App manual blockers first.
- Confirm real-device owner approval for the existing Mini App.
- Keep the mobile foundation branch separate until the Mini App launch path is stable.
- Recheck that root builds still exclude mobile-only files before merging any mobile-track work.

## Safety

- Production launch done: No
- Telegram API used: No
- Messages sent: No
- BotFather changed: No
- Payment added: No
- VIP unlock added: No
- Entitlement bypass added: No
- DB write added: No
- Secrets added: No
- Mobile app development continued: No
