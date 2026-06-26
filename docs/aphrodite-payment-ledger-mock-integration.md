# Aphrodite Payment Ledger Mock Integration

Package 173 создаёт только локальную mock-интеграцию payment ledger.

Это preview/readiness flow. Он не сохраняет ledger, не verifies payment, не создаёт entitlement и не открывает VIP.

## Главное правило

Payment ledger mock integration is local preview only.
It must not persist payment and must not create access.

## Mock flow

1. product catalog lookup
2. invoice draft skeleton
3. pre-checkout skeleton
4. successful_payment skeleton
5. mock ledger preview
6. no entitlement
7. no VIP unlock
8. fallback remains free preview

Fallback route остаётся `/miniapp/love-reading-preview`.

## Связанные skeleton dependencies

- `buildAphroditeStarsInvoiceDraftSkeleton`
- `validateAphroditePreCheckoutSkeleton`
- `inspectAphroditeSuccessfulPaymentSkeleton`

## Что не реализовано

Package 173 не реализует оплату.

Package 173 не создаёт Telegram Stars invoice.

Package 173 не вызывает sendInvoice.

Package 173 не вызывает createInvoiceLink.

Package 173 не добавляет pre_checkout_query handler.

Package 173 не добавляет active successful_payment handler.

Package 173 не пишет payment ledger.

Package 173 не сохраняет ledger.

Package 173 не verifies payment.

Package 173 не создаёт entitlement.

Package 173 не открывает VIP.

Package 173 не выдаёт доступ.

Package 173 не вызывает Telegram API.

Package 173 не пишет в базу данных.

Package 173 не меняет схему базы данных.

Package 173 не добавляет миграции.

Package 173 не меняет active Telegram CTA logic.

Package 173 не меняет cron/workflow/publish scripts.

Daily/weekly automation remains unblocked.

## Следующий пакет

Package 174 — Entitlement Creation Mock.
