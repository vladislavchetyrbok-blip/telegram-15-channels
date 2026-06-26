# Analytics/Funnel Tracking readiness Aphrodite/Zodiac

## Статус

Package 180 creates Analytics/Funnel Tracking readiness only.

Package 180 создаёт только readiness/design слой для будущей аналитики, воронки и KPI Aphrodite/Zodiac.

It defines event taxonomy, funnel stages, KPIs, attribution and privacy boundaries.

Пакет описывает будущие события, этапы воронки, KPI, attribution sources и privacy boundaries до paid MVP launch.

Это не реализация tracking.

## Главное правило

Analytics readiness defines future event taxonomy and funnel measurement only. It must not send analytics events, write database records, call external services, or enable production tracking.

Сейчас Package 180 ничего не отправляет и ничего не сохраняет.

## Что добавлено

- `lib/zodiac/aphrodite-analytics-funnel-readiness.ts`
- `/dashboard/networks/zodiac/analytics-funnel-readiness`
- `scripts/qa-aphrodite-analytics-funnel-readiness.mjs`
- `docs/aphrodite-package-reports/package-180.md`

## Event taxonomy

Описаны future events:

- Telegram channel CTA view/click
- Mini App opened
- AI Love Reading opened
- Love Reading form started
- Love Reading form submitted
- Free preview viewed
- Full Love Report teaser viewed
- Paywall viewed
- Future payment intent clicked
- VIP guard denied
- Free preview fallback shown
- Birth Matrix opened
- Compatibility opened
- VIP Couple Calendar opened
- Daily horoscope viewed
- Weekly horoscope viewed
- Monthly horoscope viewed
- Return visit

## Funnel stages

Описаны stages:

- traffic-source
- mini-app-open
- product-entry
- form-start
- form-submit
- free-preview-view
- locked-teaser-view
- paywall-view
- future-payment-intent
- guard-denied
- fallback-view
- return-user
- content-retention

## KPIs

Описаны future KPIs:

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

## Attribution

Telegram CTA attribution описана как будущая safe attribution model:

- channelId
- postType
- ctaType
- campaignKey
- startappType
- source
- anonymousSessionId

Active Telegram CTA generation не меняется.

## Privacy boundaries

Do not collect raw names in analytics.

Do not collect raw birth dates in analytics.

Do not collect full report text in analytics.

Do not collect payment payloads in analytics.

Do not collect Telegram private message contents.

Use anonymous/session/user-safe identifiers only in future implementation.

Analytics requires privacy/owner review before production.

## Safety

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

Package 180 не отправляет analytics events.

Package 180 не вызывает external analytics APIs.

Package 180 не пишет в database.

Package 180 не изменяет database schema.

Package 180 не добавляет migrations.

Package 180 не вызывает Telegram API.

Package 180 не реализует payment tracking.

Package 180 не реализует real payment.

Package 180 не реализует VIP unlock.

Package 180 не меняет active Telegram CTA logic.

Package 180 не изменяет cron/workflow/publish scripts.

## Visible safety labels

- Нет внешней аналитики
- Нет отправки событий
- Нет записи в базу данных
- Нет Telegram API
- Нет payment tracking
- Нет реальной оплаты
- Нет VIP-разблокировки
- Нет production tracking
- Analytics readiness ничего не отправляет

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
