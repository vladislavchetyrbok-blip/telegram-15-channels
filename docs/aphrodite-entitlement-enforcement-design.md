# Пакет 155 - дизайн проверки VIP-доступа Aphrodite

Дата: 2026-06-25

Package 155 создаёт только обзор дизайна проверки VIP-доступа. Это обзор будущей защиты VIP-доступа перед любой реальной оплатой, платежным обработчиком или выдачей доступа.

Главный принцип:

```text
Клиентский UI не должен сам решать, есть ли у пользователя VIP.
VIP-доступ должен проверяться server-side через entitlement, связанный с пользователем, продуктом, сроком действия и источником оплаты.
```

## Что создано

- Статическая модель `lib/zodiac/aphrodite-entitlement-enforcement-design.ts`.
- Dashboard-страница `/dashboard/networks/zodiac/entitlement-enforcement-design`.
- QA-скрипт `scripts/qa-aphrodite-entitlement-enforcement-design.mjs`.
- Навигационная ссылка `Дизайн VIP-доступа` в связанных dashboard-разделах.
- Этот документ и отчёт `docs/aphrodite-package-reports/package-155.md`.

## VIP-поверхности

В дизайне описаны будущие зоны server-side entitlement:

- Full Love Report.
- VIP Love Access.
- AI Future Timeline VIP.
- Soulmate Scanner VIP.
- Red Flags Scanner VIP.
- Birth Matrix VIP.
- Natal Chart VIP.

Текущий `vipFreeAccess` зафиксирован как существующий технический риск клиентского бесплатного доступа. Package 155 не расширяет его и не делает его реальной проверкой доступа.

## Правила будущего доступа

- Нет клиентской VIP-разблокировки.
- Нет доверия к localStorage для VIP.
- Нет VIP по query param.
- Нет VIP по кнопке UI.
- Нет доступа без server-side entitlement.
- Нет entitlement без payment ledger.
- Нет entitlement без owner review.
- Нет Telegram Stars invoice в этом пакете.
- Нет successful_payment handler в этом пакете.

## Поля будущего entitlement

Это только дизайн полей. Схема базы данных и миграции не добавляются.

- `userId / telegramUserId`
- `productId`
- `sourcePaymentId`
- `status`
- `startsAt`
- `expiresAt`
- `revokedAt`
- `createdAt`
- `updatedAt`
- `auditReason`

## Границы безопасности

Package 155 не реализует оплату.

Package 155 не реализует Telegram Stars invoice.

Package 155 не реализует `successful_payment` handler.

Package 155 не реализует реальную VIP-разблокировку.

Package 155 не создаёт entitlements.

Package 155 не вызывает Telegram API.

Package 155 не пишет в базу данных.

Package 155 не меняет схему базы данных.

Package 155 не меняет активную Telegram CTA-логику.

Package 155 не меняет cron/workflow/publish scripts.

Package 155 не запускает production delivery.

Manual Review остаётся UI/read-only.

Daily/weekly automation остаётся рабочей.

## Зависимости будущей реализации

Будущая реальная boundary должна зависеть от server-side проверки пользователя, productId, срока действия, статуса, payment ledger и owner review. Клиентские источники состояния, включая localStorage, query param, startapp, UI-кнопку и client state, не должны считаться доказательством VIP.

## Следующий рекомендуемый пакет

Следующий рекомендуемый пакет: Package 156 - VIP Access Boundary Real Implementation Plan.

Package 156 не начинается автоматически.
