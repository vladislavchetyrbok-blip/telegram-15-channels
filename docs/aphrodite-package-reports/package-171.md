# Package 171 — Telegram Stars PreCheckout Handler Skeleton

## Статус

Package 171 добавляет безопасный локальный pre-checkout skeleton.

Это не active Telegram handler и не live ответ в Telegram.

## Добавлено

- `lib/zodiac/aphrodite-telegram-stars-precheckout-skeleton.ts`
- `app/dashboard/networks/zodiac/telegram-stars-precheckout-skeleton/page.tsx`
- `scripts/qa-aphrodite-telegram-stars-precheckout-skeleton.mjs`
- `docs/aphrodite-telegram-stars-precheckout-skeleton.md`

## Поведение

`validateAphroditePreCheckoutSkeleton()` всегда возвращает:

- `answerAllowedNow: false`
- `canCallTelegramApiNow: false`
- `preCheckoutApprovedNow: false`
- `continuesPaymentNow: false`
- `createsPaymentLedgerNow: false`
- `createsEntitlementNow: false`
- `unlocksVipNow: false`

Это верно даже для полностью валидного mock input.

## Будущие проверки

- productId exists in product catalog
- amount matches product catalog future price
- currency is XTR
- user identity exists
- invoice payload is valid
- owner review gate passed
- security QA passed
- payment ledger ready
- entitlement storage ready
- support/refund policy ready
- backup fresh

## Границы

Package 171 не реализует оплату.

Package 171 не вызывает answerPreCheckoutQuery.

Package 171 не добавляет active pre_checkout_query handler.

Package 171 не добавляет active successful_payment handler.

Package 171 не пишет payment ledger.

Package 171 не создаёт entitlement.

Package 171 не открывает VIP.

Package 171 не вызывает Telegram API.

Package 171 не пишет в базу данных.

Package 171 не меняет схему базы данных.

Package 171 не добавляет миграции.

Package 171 не меняет active Telegram CTA logic.

Package 171 не меняет cron/workflow/publish scripts.

Daily/weekly automation remains unblocked.

## QA

```powershell
node --experimental-strip-types scripts/qa-aphrodite-telegram-stars-precheckout-skeleton.mjs
```

QA проверяет:

- model exists
- dashboard exists
- validation function exists
- default result blocked
- all-true mock input still blocked
- `answerAllowedNow: false`
- `canCallTelegramApiNow: false`
- no answerPreCheckoutQuery
- no active pre_checkout route/handler
- no payment/ledger/entitlement/VIP/DB/Telegram action

## Следующий пакет

Package 172 — Telegram Stars successful_payment Skeleton.
