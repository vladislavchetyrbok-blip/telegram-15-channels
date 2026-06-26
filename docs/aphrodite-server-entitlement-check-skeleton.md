# Skeleton server-side проверки entitlement Aphrodite

Package 166 добавляет локальный fail-closed skeleton будущей server-side проверки VIP-доступа. Он не читает реальную базу данных, не создаёт entitlement, не открывает VIP, не вызывает Telegram API и не подключается к production routes.

## Главное правило

Server-side entitlement check skeleton должен fail closed. Без будущего verified server entitlement доступ закрыт и возвращается fallback.

## Что добавлено

- `lib/zodiac/aphrodite-server-entitlement-check-skeleton.ts` — локальный check skeleton.
- `/dashboard/networks/zodiac/server-entitlement-check-skeleton` — dashboard-страница для ручной проверки.
- `scripts/qa-aphrodite-server-entitlement-check-skeleton.mjs` — локальная QA-проверка deny-сценариев.
- `docs/aphrodite-package-reports/package-166.md` — отчёт пакета.

## Проверяемые deny-сценарии

- Default request возвращает `allowed=false`.
- Fake localStorage/client flag возвращает `allowed=false`.
- Fake query VIP flag возвращает `allowed=false`.
- Fake payment success возвращает `allowed=false`.
- Fake entitlement record возвращает `allowed=false`.
- Fallback route всегда `/miniapp/love-reading-preview`.

## Будущие обязательные проверки

- Real server user identity
- Verified payment ledger
- Future entitlement record from DB
- Status is active
- expiresAt is absent or in future
- revokedAt is absent
- refund state is absent
- owner review approved

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
- Server check skeleton всегда возвращает allowed=false

## Что не сделано намеренно

- Не подключён DB adapter.
- Не читается реальная таблица entitlement.
- Не создаётся entitlement.
- Не добавлен payment provider.
- Не добавлен Telegram Stars invoice.
- Не добавлен successful_payment handler.
- Не подключён production guard.
- Не изменены user-facing flows.

## Следующий безопасный пакет

Package 167 — VIP Access Security QA Suite. Он должен собрать consolidated QA по catalog, fallback, guard, ledger, storage, schema и server skeleton.
