# Package 158 - skeleton проверки VIP-доступа Aphrodite

Дата: 2026-06-26

Package 158 создаёт только локальный skeleton проверки VIP-доступа.

Главный принцип:

```text
Guard всегда возвращает allowed=false.
Клиентские признаки VIP, query-параметры и mock payment success игнорируются.
Пользователь должен безопасно вернуться к бесплатному preview.
```

## Что создано

- Статическая модель `lib/zodiac/aphrodite-vip-access-guard-skeleton.ts`.
- Dashboard-страница `/dashboard/networks/zodiac/vip-access-guard-skeleton`.
- QA-скрипт `scripts/qa-aphrodite-vip-access-guard-skeleton.mjs`.
- Проверки новой страницы в `scripts/qa-zodiac-dashboard.mjs`.
- Навигационные ссылки `Skeleton VIP-guard` из связанных dashboard-разделов.
- Отчёт `docs/aphrodite-package-reports/package-158.md`.

## Защищаемые продукты

Skeleton описывает будущую проверку для:

- Full Love Report.
- VIP Love Access.
- AI Future Timeline VIP.
- Soulmate Scanner VIP.
- Red Flags Scanner VIP.
- Birth Matrix VIP.
- Natal Chart VIP.
- VIP Couple Calendar / 30 дней пары.
- VIP Numerology.

## Поведение skeleton

Каждый вызов `checkAphroditeVipAccessSkeleton` возвращает:

- `allowed=false`.
- `fallbackRoute="/miniapp/love-reading-preview"`.
- видимое сообщение о закрытом доступе.
- список будущих server-side проверок.
- список проигнорированных клиентских сигналов.
- границы безопасности Package 158.

Даже если вход содержит `mockClientVipFlag`, `mockQueryVipFlag` или `mockPaymentSuccess`, результат остаётся deny-by-default.

## Игнорируемые клиентские сигналы

- `localStorage VIP flag`
- `query param VIP flag`
- `client-only button unlock`
- `mock successful_payment`
- `front-end-only role check`

Эти сигналы могут использоваться только как негативные QA-кейсы. Они не являются доказательством доступа.

## Будущие server-side требования

Перед реальной интеграцией VIP-доступа отдельно должны появиться:

- server-side entitlement по `userRef` и `productId`.
- проверка Telegram `initData` на сервере.
- проверка payment ledger перед созданием доступа.
- проверка `status`, `expiresAt` и `revokedAt`.
- owner review gate перед реальным запуском.
- safe fallback to free preview при deny.

## Границы Package 158

Package 158 не реализует оплату.

Package 158 не создаёт Telegram Stars invoice.

Package 158 не добавляет `successful_payment` handler.

Package 158 не открывает реальный VIP-доступ.

Package 158 не создаёт entitlement.

Package 158 не пишет в базу данных.

Package 158 не меняет схему базы данных.

Package 158 не добавляет миграции.

Package 158 не вызывает Telegram API.

Package 158 не запускает production delivery.

Package 158 не меняет active Telegram CTA.

Package 158 не меняет cron, workflows или publish scripts.

Manual Review остаётся UI/read-only.

Daily/weekly automation остаётся незаблокированной.

## QA

QA должен подтверждать:

- все девять guarded products описаны.
- `allowed=false` для каждого продукта.
- `15.06.1998` и другие date-flow фиксы не затрагиваются этим пакетом.
- mock localStorage/client VIP flag игнорируется.
- mock query VIP flag игнорируется.
- mock payment success игнорируется.
- fallback ведёт на `/miniapp/love-reading-preview`.
- отсутствуют real payment, Stars invoice, `successful_payment` handler, entitlement creation, DB write, DB schema migration и Telegram API calls.
- dashboard route `/dashboard/networks/zodiac/vip-access-guard-skeleton` открывается в общем dashboard QA.

## Следующий рекомендуемый пакет

Следующий рекомендуемый пакет: Package 159 - VIP Access Boundary Guard Integration Review.

Package 159 не начинается автоматически.
