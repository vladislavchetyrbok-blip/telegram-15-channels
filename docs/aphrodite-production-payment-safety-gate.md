# Aphrodite: Production Payment Safety Gate

Package 175 создаёт только fail-closed production payment safety gate для будущих Aphrodite payments и VIP.

## Статус

Это safety/readiness слой. Он описывает будущие условия запуска и всегда закрывает runtime-разрешения:

- `productionPaymentAllowedNow=false`
- `telegramStarsLiveAllowedNow=false`
- `invoiceSendingAllowedNow=false`
- `preCheckoutAllowedNow=false`
- `successfulPaymentHandlingAllowedNow=false`
- `paymentLedgerWriteAllowedNow=false`
- `entitlementCreationAllowedNow=false`
- `vipUnlockAllowedNow=false`
- `databaseWriteAllowedNow=false`
- `productionLaunchAllowedNow=false`

Даже all-true mock input остаётся blocked.

## Что пакет не делает

Package 175 не реализует оплату.

Package 175 не реализует Telegram Stars invoice.

Package 175 не вызывает `sendInvoice`.

Package 175 не вызывает `createInvoiceLink`.

Package 175 не реализует `pre_checkout_query` handler.

Package 175 не реализует `successful_payment` handler.

Package 175 не пишет payment ledger.

Package 175 не реализует реальную VIP-разблокировку.

Package 175 не создаёт entitlements.

Package 175 не вызывает Telegram API.

Package 175 не пишет в базу данных.

Package 175 не меняет схему базы данных.

Package 175 не добавляет migrations.

Package 175 не меняет активную Telegram CTA-логику.

Package 175 не меняет cron/workflow/publish scripts.

Daily/weekly automation остаётся не заблокированной.

## Будущие env flags

Флаги ниже только документируются. Package 175 не читает их и не включает production behavior:

- `APHRODITE_OWNER_APPROVED`
- `APHRODITE_PAYMENTS_ENABLED`
- `APHRODITE_STARS_LIVE_ENABLED`
- `APHRODITE_ENTITLEMENTS_ENABLED`
- `APHRODITE_PRODUCTION_LAUNCH_APPROVED`
- `DATABASE_URL`
- `TELEGRAM_BOT_TOKEN`

## Зависимости перед будущим запуском

- Owner review dependency: будущий запуск требует отдельного ручного owner review.
- Database/backup dependency: любые DB writes требуют `DATABASE_URL`, review схемы и backup младше 24 часов.
- Support/refund dependency: до оплаты нужен support/refund policy, revoke flow и обработка спорных платежей.
- Security QA dependency: QA должен блокировать client-side VIP bypass, fake entitlement и mock payment success.
- Payment ledger dependency: доступ нельзя выдавать без verified, idempotent payment ledger.
- Entitlement dependency: entitlement creation нельзя делать без verified ledger и server-side entitlement check.

## Dashboard

Новый dashboard route:

```text
/dashboard/networks/zodiac/production-payment-safety-gate
```

Страница показывает summary, sample safety result, blocked production areas, required future env flags, зависимости, safety boundaries и следующий рекомендуемый пакет.

## Следующий пакет

Next package should be Package 176 — First Paid MVP Readiness Review.

Package 176 не начинается автоматически.
