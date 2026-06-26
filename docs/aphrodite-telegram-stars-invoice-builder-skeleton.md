# Aphrodite Telegram Stars Invoice Builder Skeleton

Package 170 создаёт только безопасный invoice draft skeleton для будущих Telegram Stars платежей.

Это не платёжная реализация. Skeleton собирает TypeScript-структуру будущего invoice draft и всегда оставляет отправку заблокированной.

## Что добавлено

- Локальная функция `buildAphroditeStarsInvoiceDraftSkeleton`.
- Список будущих продуктов: Full Love Report, VIP Love Access, AI Future Timeline VIP, Soulmate Scanner VIP, Red Flags Scanner VIP, Birth Matrix VIP, Natal Chart VIP, VIP Couple Calendar, VIP Numerology.
- Dashboard-страница `/dashboard/networks/zodiac/telegram-stars-invoice-builder-skeleton`.
- QA, который проверяет, что все runtime-действия остаются закрытыми.

## Жёсткое правило

Invoice builder skeleton prepares future invoice drafts only.
Он всегда возвращает `sendAllowedNow: false` и `canCallTelegramApiNow: false`.

Даже если mock input содержит owner approval, payments enabled и Stars live enabled, draft остаётся локальным и заблокированным.

## Зависимости будущей реализации

- product catalog
- owner review gate
- payment ledger
- entitlement storage
- security QA
- future env flags

## Что не реализовано

Package 170 не реализует оплату.

Package 170 не создаёт live Telegram Stars invoice.

Package 170 не вызывает sendInvoice.

Package 170 не вызывает createInvoiceLink.

Package 170 не реализует pre_checkout_query handler.

Package 170 не реализует successful_payment handler.

Package 170 не пишет payment ledger.

Package 170 не создаёт entitlement.

Package 170 не открывает VIP.

Package 170 не вызывает Telegram API.

Package 170 не пишет в базу данных.

Package 170 не меняет схему базы данных.

Package 170 не добавляет миграции.

Package 170 не меняет active Telegram CTA logic.

Package 170 не меняет cron/workflow/publish scripts.

Daily/weekly automation remains unblocked.

## Следующий пакет

Package 171 — Telegram Stars PreCheckout Handler Skeleton.
