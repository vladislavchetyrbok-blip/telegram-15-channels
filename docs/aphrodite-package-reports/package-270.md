# Package 270 - Zodiac Brand Cleanup + Unified Input Controls

## Summary

Package 270 cleaned up live Zodiac Mini App UI copy and input consistency after owner Telegram WebView screenshots.

## Brand cleanup

- Live user-facing Mini App copy uses `Зодиак`, `Зодиакальный центр`, `Матрица судьбы`, `Мистическая карта`, `VIP раздел`, and `Preview`.
- Internal Aphrodite component/model/dashboard names were not renamed.
- Visible English technical labels in Mystic/Birth Matrix/Natal result areas were replaced with short Russian labels.
- Bottom nav now uses `Прогноз`.

## Unified inputs

- Date: `ZodiacUnifiedDateInput`, preserving Package 224 date behavior.
- Time: `ZodiacUnifiedTimeInput`, compact `HH:MM` entry and optional unknown-time mode.
- City: `ZodiacCityAutocompleteInput`, local static suggestions only with manual fallback.

## Screens improved

- Home: shorter Zodiac-facing brand copy, compact quick rows, compact sign selector.
- Compatibility: shared date/time/city controls.
- Birth Matrix: shared date/time controls and Zodiac-facing shell copy.
- Natal/VIP: shared date/time/city controls and Russian result labels.
- Mystic: Russian result badges and shared date controls.
- Profile: shared person state remains unchanged; profile/birth data flows use the same input layer where present.

## Not changed

- Full codebase rename: No
- Calculations changed: No
- Active CTA logic changed: No
- Routes broken: No
- External city API added: No
- Telegram API used: No
- Messages sent: No
- Payment added: No
- VIP unlock added: No
- DB writes added: No
- Cron/workflow changed: No
- Secrets added: No
- Owner approval granted: No

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
- Entitlement bypass added: No
- Cron/workflows/publish scripts changed: No
- Secrets added: No
- Production DB connected: No

## Remaining blockers

- DATABASE_URL manual configuration
- TELEGRAM_BOT_TOKEN manual configuration
- backup freshness <24h
- restore rehearsal
- real-device QA manual execution
- Telegram WebView/startapp manual QA
- content/CTA owner review
- owner explicit approval
- owner screenshot recheck after Package 270
