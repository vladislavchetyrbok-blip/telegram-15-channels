# Дизайн payment ledger Aphrodite

Package 163 описывает будущий payment ledger для Aphrodite/Zodiac. Это только дизайн и readiness-слой: он не создаёт invoice, не принимает оплату, не пишет в базу данных, не создаёт entitlement и не открывает VIP.

## Главное правило

Payment ledger требуется перед entitlement. Entitlement не может существовать без verified payment ledger и owner review.

## Что добавлено

- `lib/zodiac/aphrodite-payment-ledger-design.ts` — статическая TypeScript-модель будущих ledger-записей.
- `/dashboard/networks/zodiac/payment-ledger-design` — dashboard-страница для ручной проверки.
- `scripts/qa-aphrodite-payment-ledger-design.mjs` — локальная QA-проверка модели, dashboard и safety boundaries.
- `docs/aphrodite-package-reports/package-163.md` — отчёт пакета.

## Будущие поля ledger

- `userId`
- `telegramUserId`
- `sourcePaymentId`
- `amount`
- `currency`
- `createdAt`
- `verifiedAt`
- `refundedAt`
- `auditReason`

Эти поля пока являются только именами будущих полей. Package 163 не создаёт таблицу, миграцию или запись.

## Границы безопасности

- Нет реальной оплаты
- Нет Telegram Stars invoice
- Нет successful_payment handler
- Нет entitlement creation
- Нет записи в базу данных
- Нет миграции схемы базы данных
- Нет вызова Telegram API
- Нет production-запуска
- Ledger ничего не записывает

## Связь с каталогом продуктов

Ledger-дизайн сверяется с финальным каталогом продуктов Aphrodite: будущие paid/VIP продукты должны иметь productId из каталога и fallback route `/miniapp/love-reading-preview`.

## Что не сделано намеренно

- Не реализована оплата.
- Не создан Telegram Stars invoice.
- Не добавлен обработчик успешной оплаты.
- Не создан entitlement.
- Не изменена схема базы данных.
- Не добавлены миграции.
- Не подключён Telegram API.
- Не изменена production-доставка.

## Следующий безопасный пакет

Package 164 — Entitlement Storage Design. Он должен описать будущие поля хранения VIP-доступа после verified payment ledger, но также без записи в базу данных и без реального доступа.
