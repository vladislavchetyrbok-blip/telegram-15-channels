# Aphrodite Owner Review Gate

Package 168 создаёт только owner review gate для будущего VIP/payment launch.

Это safety/readiness пакет. Он нужен, чтобы перед любым будущим включением оплаты, Telegram Stars, entitlement creation, VIP-разблокировки, production DB write или live launch существовал обязательный ручной слой подтверждения владельца.

Главное правило:

```text
Без owner review нельзя включать оплату, VIP, entitlement creation, live Telegram Stars или production launch.
```

## Что создано

- Read-only модель `lib/zodiac/aphrodite-owner-review-gate.ts`.
- Dashboard-страница `/dashboard/networks/zodiac/owner-review-gate`.
- QA `scripts/qa-aphrodite-owner-review-gate.mjs`.
- Навигация `Owner Review Gate` из релевантных review/spec страниц.

## Fail-closed результат

`evaluateAphroditeOwnerReviewGate()` всегда возвращает:

```text
approvedForLaunch=false
paymentsCanBeEnabledNow=false
vipCanBeEnabledNow=false
entitlementCreationCanBeEnabledNow=false
telegramStarsCanBeEnabledNow=false
productionLaunchCanBeEnabledNow=false
```

Даже если mock input содержит все approval-поля как true, Package 168 не становится real launch switch.

## Будущие env flags только задокументированы

Эти flags перечислены только как будущие требования review. Package 168 их не читает и не применяет:

- `APHRODITE_OWNER_APPROVED`
- `APHRODITE_PAYMENTS_ENABLED`
- `APHRODITE_STARS_LIVE_ENABLED`
- `APHRODITE_ENTITLEMENTS_ENABLED`
- `APHRODITE_PRODUCTION_LAUNCH_APPROVED`
- `DATABASE_URL`
- `TELEGRAM_BOT_TOKEN`

## Явные запреты

Package 168 не реализует оплату.

Package 168 не реализует Telegram Stars invoice.

Package 168 не реализует successful_payment handler.

Package 168 не реализует реальную VIP-разблокировку.

Package 168 не создаёт entitlements.

Package 168 не вызывает Telegram API.

Package 168 не пишет в базу данных.

Package 168 не меняет схему базы данных.

Package 168 не добавляет migrations.

Package 168 не меняет active Telegram CTA logic.

Package 168 не меняет cron/workflow/publish scripts.

Daily/weekly automation remains unblocked — пакет не трогает workflows, cron, publish scripts или bot sending logic.

## Обязательные зависимости перед будущим launch

- Owner approval вручную.
- Security QA Package 167 остаётся PASS.
- Support/refund policy описана и подтверждена.
- Fresh production backup подтверждён перед любым production DB write.
- Production safety должен пройти без missing env и stale backup.
- Telegram Stars architecture review должен быть отдельным пакетом.

## Следующий рекомендуемый пакет

Package 169 — Telegram Stars Payment Architecture Final Review.

Package 169 не начинается автоматически.
