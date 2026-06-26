# Package 164 — Entitlement Storage Design

## Статус

Package 164 добавляет design-only модель хранения будущего VIP-доступа Aphrodite.

## Предыдущий пакет

- Package 163 — Payment Ledger Design.
- Commit Package 163: `fa0b999 docs: add aphrodite payment ledger design`.

## Добавленные файлы

- `lib/zodiac/aphrodite-entitlement-storage-design.ts`
- `app/dashboard/networks/zodiac/entitlement-storage-design/page.tsx`
- `scripts/qa-aphrodite-entitlement-storage-design.mjs`
- `docs/aphrodite-entitlement-storage-design.md`
- `docs/aphrodite-package-reports/package-164.md`

## Обновлённые файлы

- `scripts/qa-zodiac-dashboard.mjs`
- `scripts/qa-aphrodite-payment-ledger-design.mjs`
- `app/dashboard/networks/zodiac/page.tsx`

## Главное правило

Entitlement storage design описывает только будущие записи. Entitlement не создаётся в этом пакете.

## Future fields

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

## Safety boundaries

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

## Подтверждение отсутствия production-логики

- Реальная оплата не добавлена.
- Telegram Stars invoice не добавлен.
- successful_payment handler не добавлен.
- Entitlement creation не добавлен.
- Реальная VIP-разблокировка не добавлена.
- Запись в базу данных не добавлена.
- Схема базы данных и миграции не изменены.
- Telegram API не используется.
- Workflow, cron, publish scripts и bot sending logic не изменяются.

## Новый dashboard route

- `/dashboard/networks/zodiac/entitlement-storage-design`

## QA

Пакетный QA проверяет:

- наличие модели, dashboard, docs и отчёта;
- наличие всех future fields;
- зависимость от payment ledger и product catalog;
- правила expired/revoked/refunded deny;
- owner review и server-side check requirements;
- отсутствие оплаты, DB write, DB schema changes, entitlement creation и VIP unlock.

## Следующий рекомендуемый пакет

Package 165 — Entitlement Schema Skeleton.
