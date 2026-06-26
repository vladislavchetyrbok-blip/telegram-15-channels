# Aphrodite Telegram Stars PreCheckout Skeleton

Package 171 моделирует только будущую pre-checkout validation для Telegram Stars.

Это не Telegram webhook, не API route и не активный handler. Skeleton возвращает локальный результат проверки и всегда оставляет ответ в Telegram заблокированным.

## Главное правило

PreCheckout skeleton validates future checks only.
Он всегда возвращает `answerAllowedNow: false` и `canCallTelegramApiNow: false`.

Даже если productId валиден, amount совпадает, ownerApproved включён, paymentsEnabled включён и starsLiveEnabled включён, результат остаётся заблокированным.

## Будущие проверки

- productId существует в product catalog
- amount совпадает с будущей ценой product catalog
- currency равна XTR
- user identity существует
- invoice payload валиден
- owner review gate пройден
- security QA пройден
- payment ledger готов
- entitlement storage готов
- support/refund policy готов
- backup свежий

## Что не реализовано

Package 171 не реализует оплату.

Package 171 не создаёт Telegram Stars invoice.

Package 171 не вызывает sendInvoice.

Package 171 не вызывает createInvoiceLink.

Package 171 не вызывает answerPreCheckoutQuery.

Package 171 не добавляет active pre_checkout_query handler.

Package 171 не добавляет successful_payment handler.

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

## Следующий пакет

Package 172 — Telegram Stars successful_payment Skeleton.
