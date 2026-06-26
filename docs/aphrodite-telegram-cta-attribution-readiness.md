# Aphrodite Telegram CTA Attribution Readiness

Package 184 adds a static readiness layer for future Telegram CTA attribution.

## Scope

- Route: `/dashboard/networks/zodiac/telegram-cta-attribution-readiness`
- Classification: `Только attribution readiness / Активные CTA не изменены / Нет tracking`
- This package documents future attribution dimensions and source keys only.
- Active Telegram CTA generation is unchanged.

## Required attribution dimensions

- source channel
- sign
- language
- content type daily/weekly/monthly
- CTA type
- product target
- startapp param draft
- campaign key
- period key
- fallback route

## Source examples

- `tg_daily_aries`
- `tg_weekly_leo`
- `tg_monthly_2026_07_general`
- `tg_love_reading`
- `tg_compatibility`
- `tg_birth_matrix`

## Safety

- Нет внешней аналитики
- Нет отправки событий
- Нет записи в базу данных
- Нет Telegram API
- Нет изменения active CTA
- Нет payment tracking
- Нет production tracking
- CTA attribution readiness ничего не отправляет

## Explicit non-goals

- No active CTA builder changes.
- No startapp publication changes.
- No Telegram API calls.
- No analytics event sending.
- No external analytics API.
- No database read/write.
- No payment tracking.
- No VIP unlock.
