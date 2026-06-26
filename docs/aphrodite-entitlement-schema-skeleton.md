# Skeleton схемы entitlement Aphrodite

Package 165 добавляет TypeScript-only skeleton для будущих entitlement records. Он проверяет форму данных, missing fields и deny statuses, но не создаёт entitlement, не пишет в базу данных и не выдаёт доступ.

## Главное правило

Schema skeleton проверяет только будущие формы. Он не создаёт entitlement и не выдаёт доступ.

## Что добавлено

- `lib/zodiac/aphrodite-entitlement-schema-skeleton.ts` — TypeScript-only schema skeleton и validation helper.
- `/dashboard/networks/zodiac/entitlement-schema-skeleton` — dashboard-страница для ручной проверки.
- `scripts/qa-aphrodite-entitlement-schema-skeleton.mjs` — локальная QA-проверка validation helper.
- `docs/aphrodite-package-reports/package-165.md` — отчёт пакета.

## Required fields

- `id`
- `productId`
- `sourcePaymentLedgerId`
- `status`
- `startsAt`
- `createdAt`
- `updatedAt`
- `auditReason`
- `userId or telegramUserId`

## Поведение validation

- Valid-looking record может получить `validShape=true`.
- `grantsAccessNow` всегда `false`.
- Expired record не выдаёт доступ.
- Revoked record не выдаёт доступ.
- Refunded record не выдаёт доступ.
- Missing record получает `validShape=false` и список missing fields.

## Границы безопасности

- Нет реальной VIP-разблокировки
- Нет оплаты
- Нет Telegram Stars invoice
- Нет successful_payment handler
- Нет entitlement creation
- Нет записи в базу данных
- Нет миграции схемы базы данных
- Нет вызова Telegram API
- Нет production-запуска
- Schema skeleton не выдаёт доступ

## Что не сделано намеренно

- Не создан entitlement.
- Не добавлен DB adapter.
- Не изменена схема базы данных.
- Не добавлены миграции.
- Не подключён Telegram API.
- Не добавлен payment provider.
- Не подключён production guard.

## Следующий безопасный пакет

Package 166 — Server-side Entitlement Check Skeleton. Он должен подготовить fail-closed server-side check skeleton с fallback в `/miniapp/love-reading-preview`, но без DB/API/payment.
