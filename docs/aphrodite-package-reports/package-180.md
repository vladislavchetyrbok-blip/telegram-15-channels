# Package 180 — Analytics/Funnel Tracking Readiness

## Статус

Package 180 завершает analytics/funnel readiness only слой для будущего paid MVP Aphrodite/Zodiac.

Package 180 creates Analytics/Funnel Tracking readiness only.

Это readiness only. События не отправляются, внешняя аналитика не подключается, production tracking не включается.

## Что добавлено

- `lib/zodiac/aphrodite-analytics-funnel-readiness.ts`
- `app/dashboard/networks/zodiac/analytics-funnel-readiness/page.tsx`
- `scripts/qa-aphrodite-analytics-funnel-readiness.mjs`
- `docs/aphrodite-analytics-funnel-readiness.md`
- `docs/aphrodite-package-reports/package-180.md`

## Что обновлено

- `scripts/qa-zodiac-dashboard.mjs`
- `/dashboard/networks/zodiac`
- `/dashboard/networks/zodiac/first-paid-mvp-readiness-review`
- `/dashboard/networks/zodiac/support-refund-policy-readiness`
- `/dashboard/networks/zodiac/product-catalog-finalization`
- `/dashboard/networks/zodiac/vip-access-security-suite`
- `/dashboard/networks/zodiac/production-payment-safety-gate`
- `/dashboard/networks/zodiac/owner-review-gate`

Все navigation changes являются только ссылками `Analytics/Funnel`.

## Event taxonomy

Описаны future events:

- `telegram_channel_cta_view`
- `telegram_channel_cta_click`
- `miniapp_opened`
- `love_reading_opened`
- `love_reading_form_started`
- `love_reading_form_submitted`
- `love_reading_preview_viewed`
- `full_love_report_teaser_viewed`
- `paywall_viewed`
- `future_payment_intent_clicked`
- `vip_guard_denied`
- `free_preview_fallback_shown`
- `birth_matrix_opened`
- `compatibility_opened`
- `couple_calendar_opened`
- `daily_horoscope_viewed`
- `weekly_horoscope_viewed`
- `monthly_horoscope_viewed`
- `return_visit`

## Funnel stages

Описаны traffic-source, mini-app-open, product-entry, form-start, form-submit, free-preview-view, locked-teaser-view, paywall-view, future-payment-intent, guard-denied, fallback-view, return-user, content-retention.

## KPIs

Описаны:

- Mini App open rate
- Love Reading start rate
- Form completion rate
- Preview view rate
- Paywall view rate
- Future payment intent rate
- Guard denial rate
- Fallback recovery rate
- Return visit rate
- Daily/weekly/monthly content CTA performance
- Channel-to-Mini-App conversion

## Privacy

Raw names forbidden: да.

Raw birth dates forbidden: да.

Payment payload analytics forbidden: да.

Telegram private message contents forbidden: да.

Anonymous/session/user-safe identifiers only: да.

Analytics requires privacy/owner review before production: да.

## Safety

It defines event taxonomy, funnel stages, KPIs, attribution and privacy boundaries.

It does not send analytics events.

It does not call external analytics APIs.

It does not write to database.

It does not modify database schema.

It does not call Telegram API.

It does not implement payment tracking.

It does not implement real payment.

It does not implement VIP unlock.

It does not change active Telegram CTA logic.

It does not modify cron/workflow/publish scripts.

Daily/weekly/monthly content pipeline remains unblocked.

External analytics подключена: нет.

Events sending добавлен: нет.

DB write добавлен: нет.

Telegram API использовался: нет.

Payment tracking implementation добавлен: нет.

Реальная оплата добавлена: нет.

VIP unlock добавлен: нет.

Активная Telegram CTA-логика изменена: нет.

Cron/workflows/publish scripts изменены: нет.

## QA

Основная QA:

```powershell
node --experimental-strip-types scripts/qa-aphrodite-analytics-funnel-readiness.mjs
```

Dashboard QA проверяет:

```text
/dashboard/networks/zodiac/analytics-funnel-readiness
```

## Следующий пакет

Next package should be Package 181 — Mini App Analytics Noop Event Bus Skeleton.

Package 181 не начинается автоматически.
