# Пакет 157 - план внедрения границы VIP-доступа Aphrodite

Дата: 2026-06-26

Package 157 создаёт только план внедрения границы VIP-доступа.

Этот пакет превращает предыдущий дизайн entitlement в конкретную дорожную карту будущей server-side границы VIP-доступа. Он описывает, какие routes, components, будущие API, QA и safety boundaries должны существовать до реального запуска.

Главный принцип:

```text
VIP не может быть разблокирован клиентом.
Будущий VIP-доступ должен проверяться server-side через entitlement, связанный с пользователем, продуктом, payment ledger, status, expiration и revocation.
```

## Что создано

- Статическая модель `lib/zodiac/aphrodite-vip-access-boundary-implementation-plan.ts`.
- Dashboard-страница `/dashboard/networks/zodiac/vip-access-boundary-implementation-plan`.
- QA-скрипт `scripts/qa-aphrodite-vip-access-boundary-implementation-plan.mjs`.
- Навигационная ссылка `План VIP-границы` в связанных dashboard-разделах.
- Отчёт `docs/aphrodite-package-reports/package-157.md`.

## Цели внедрения

План включает будущую защиту для:

- Full Love Report.
- VIP Love Access.
- AI Future Timeline VIP.
- Soulmate Scanner VIP.
- Red Flags Scanner VIP.
- Birth Matrix VIP.
- Natal Chart VIP.
- VIP Couple Calendar / 30 дней пары.
- VIP Numerology.

Также отдельно описан будущий API access check как точка, которая должна стать единственным источником server-side решения allow/deny.

## Типы будущих guard-проверок

- `server-side entitlement check`
- `product-specific entitlement check`
- `expiration check`
- `revocation check`
- `payment ledger check`
- `owner review gate`
- `safe fallback to free preview`
- `audit log requirement`

## Заблокированные клиентские обходы

- `localStorage VIP flag`
- `query param VIP flag`
- `client-only button unlock`
- `hidden CSS section reveal`
- `mock payment success`
- `manual route guessing`
- `front-end-only role check`

Клиентские параметры могут вести к экрану или сохранять draft формы, но не могут быть доказательством доступа.

## QA до реального VIP

- `No VIP without entitlement`
- `No VIP from localStorage`
- `No VIP from query param`
- `No VIP from fake successful_payment`
- `No entitlement without payment ledger`
- `No expired entitlement access`
- `No revoked entitlement access`
- `Free preview remains accessible`
- `Fallback works without crashing`

## Границы Package 157

Package 157 does not implement payment.

Package 157 does not implement Telegram Stars invoice.

Package 157 does not implement `successful_payment` handler.

Package 157 does not implement real VIP unlock.

Package 157 does not create entitlements.

Package 157 does not call Telegram API.

Package 157 does not write to database.

Package 157 does not modify database schema.

Package 157 does not add migrations.

Package 157 does not change active Telegram CTA logic.

Package 157 does not modify cron/workflow/publish scripts.

Manual Review remains UI/read-only.

Daily/weekly automation остаётся не заблокированной.

## Следующий рекомендуемый пакет

Следующий пакет должен быть Package 158 — VIP Access Boundary Guard Skeleton.

Package 158 не начинается автоматически.
