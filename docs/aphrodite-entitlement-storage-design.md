# Дизайн хранения VIP-доступа Aphrodite

Package 164 описывает будущую запись VIP-доступа после verified payment ledger. Это только дизайн хранения: entitlement не создаётся, база данных не меняется, миграции не добавляются, VIP не открывается.

## Главное правило

Entitlement storage design описывает только будущие записи. Entitlement не создаётся в этом пакете.

## Что добавлено

- `lib/zodiac/aphrodite-entitlement-storage-design.ts` — статическая модель будущих полей хранения.
- `/dashboard/networks/zodiac/entitlement-storage-design` — dashboard-страница для ручной проверки.
- `scripts/qa-aphrodite-entitlement-storage-design.mjs` — локальная QA-проверка storage design.
- `docs/aphrodite-package-reports/package-164.md` — отчёт пакета.

## Будущие поля entitlement

- `userId`
- `telegramUserId`
- `productId`
- `sourcePaymentLedgerId`
- `sourcePaymentProvider`
- `status`
- `startsAt`
- `expiresAt`
- `revokedAt`
- `createdAt`
- `updatedAt`
- `auditReason`
- `ownerReviewStatus`

Эти поля пока являются только TypeScript design contract. В этом пакете нет таблицы, миграции, записи или server-side проверки доступа.

## Правила deny

- Нет entitlement без verified payment ledger.
- Нет entitlement без productId из каталога.
- Нет доступа, если future entitlement expired.
- Нет доступа, если future entitlement revoked.
- Нет доступа, если future entitlement refunded.
- Owner review требуется перед реальным запуском.
- Server-side check обязателен.
- Client-side flags игнорируются.

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
- Entitlement не создаётся

## Зависимости

- `lib/zodiac/aphrodite-payment-ledger-design.ts` — verified payment ledger должен быть раньше future entitlement.
- `lib/zodiac/aphrodite-product-catalog.ts` — future productId должен быть из каталога продуктов Aphrodite.

## Следующий безопасный пакет

Package 165 — Entitlement Schema Skeleton. Он должен создать TypeScript-only validation skeleton для будущих entitlement records без выдачи доступа и без DB.
