# Package 181 — Mini App Analytics Noop Event Bus Skeleton

Package 181 creates a safe local noop event bus skeleton for future Mini App analytics.

Main rule:

```text
Analytics noop event bus accepts future event objects, sanitizes/validates them, and returns noop result only.
It must not call external analytics APIs, Telegram API, or database.
```

## Что добавлено

- TypeScript model: `lib/zodiac/aphrodite-miniapp-analytics-noop-event-bus.ts`
- Dashboard route: `/dashboard/networks/zodiac/miniapp-analytics-noop-event-bus`
- QA script: `scripts/qa-aphrodite-miniapp-analytics-noop-event-bus.mjs`
- Package report: `docs/aphrodite-package-reports/package-181.md`

## Покрытие событий

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

## Privacy behavior

- raw names removed/forbidden
- raw birth dates removed/forbidden
- payment payloads removed/forbidden
- Telegram private message contents removed/forbidden
- full report text removed/forbidden

Разрешены только safe scalar поля из allowlist: `route`, `source`, `surface`, `productCode`, `relationshipMode`, `contentType`, `periodKey`, `weekKey`, `monthKey`, `hasBirthDate`, `hasPartnerBirthDate` и похожие безопасные enum/flag поля.

## Noop result

Шина всегда возвращает:

```ts
sentNow: false;
externalAnalyticsCalledNow: false;
databaseWriteNow: false;
telegramApiCalledNow: false;
paymentTrackingNow: false;
productionTrackingNow: false;
```

## Safety

- Нет внешней аналитики
- Нет отправки событий
- Нет записи в базу данных
- Нет Telegram API
- Нет payment tracking
- Нет реальной оплаты
- Нет VIP-разблокировки
- Нет production tracking
- Noop event bus ничего не отправляет

## Не добавлено

- external analytics API calls
- event sending to external services
- database event writes
- Telegram API calls
- payment tracking implementation
- real payments
- entitlement creation
- real VIP unlock
- production launch settings
- workflow/cron/publish/bot sending changes

Следующий рекомендуемый пакет: Package 182 — Mini App Analytics Noop Integration Points.
