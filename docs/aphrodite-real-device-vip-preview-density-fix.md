# Package 303 - Real Device VIP Preview Density Fix

## Summary

Package 303 is a visual/UX compression package based on owner real iPhone Telegram Mini App screenshots after Packages 293-302. The public UI was clean, with no admin shell and no Aphrodite leak, but the VIP/30-day compatibility preview felt too long and too close to an unlocked full report.

## What Changed

- VIP preview copy: user-facing hot paths now use `VIP превью`, `Превью до`, and `сейчас: превью` where appropriate.
- 30-day result density: first 5 days are compact preview cards; days 6-30 are compact rows.
- Repeated text: the soft disclaimer is shown once near the result instead of inside every day card.
- Affected screens: `/vip-preview`, `/vip-compatibility-report`, `/compatibility` result, `/miniapp?startapp=vip`, the 30-day compatibility section, bottom nav context, save, and share surfaces.

## Owner Screenshot Issues

- VIP/30-day compatibility preview was too long and text-heavy.
- Long relationship guidance repeated across many day cards.
- Preview could be mistaken for a full report or unlocked VIP.
- Required owner recheck remains real-device iPhone Telegram Mini App.

## VIP Preview Density Rules

- Show a compact preview, not 30 huge full-text cards.
- Keep first 3-5 days visible; Package 303 uses first 5.
- Render remaining days as compact rows.
- Keep copy short: `Показана короткая версия. Полный отчёт закрыт. Оплата не активна.`
- Keep `Без оплаты` and `VIP закрыт`.

## Compact Day Card Rules

Each expanded day card should contain only:

- day/date
- mood tag
- one short sentence
- one short action

The compact rows for days 6-30 contain day number, date, mood, and a short action only.

## Repeated Copy Removed

The line `Это мягкая навигация для разговора, а не жёсткое предсказание.` is no longer required in every day card. It appears once near the 30-day result.

## Safety

- publicLaunchApproved=false
- ownerManualReviewRequired=true
- Production launch done: No
- Telegram API used: No
- Messages sent: No
- BotFather changed: No
- Payment added: No
- VIP unlock added: No
- Entitlement bypass added: No
- DB write added: No
- External analytics added: No
- Cron/workflows changed: No
- Secrets added: No
- .env.local committed: No

## What Was Not Changed

- No calculations changed.
- No routes changed.
- No payment added.
- No VIP unlock added.
- No entitlement bypass added.
- No DB writes added.
- No Telegram API calls added.
- No BotFather changes added.
- No cron/workflow changes added.
- No secrets added.

## Next Package

Package 304 - Antigravity Real Device Screenshot Recheck
