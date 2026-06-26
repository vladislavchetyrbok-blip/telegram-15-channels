# Support & Refund Policy readiness Aphrodite/Zodiac

## Статус

Package 179 создаёт только Support & Refund Policy readiness для будущего платного MVP Aphrodite/Zodiac.

Это policy readiness only. Пакет не является реализацией оплаты, возвратов, Telegram Stars invoice, VIP unlock, entitlement, DB persistence, Telegram API или production launch.

Support/refund readiness не включает оплату.

Возвраты не автоматизированы.

## Что добавлено

- Read-only модель `lib/zodiac/aphrodite-support-refund-policy-readiness.ts`.
- Dashboard-страница `/dashboard/networks/zodiac/support-refund-policy-readiness`.
- Локальная QA `scripts/qa-aphrodite-support-refund-policy-readiness.mjs`.
- Отчёт `docs/aphrodite-package-reports/package-179.md`.
- Консервативные ссылки `Support & Refund` из смежных readiness/review страниц.

## Области readiness

Описаны:

- будущая команда `/paysupport`;
- support contact readiness;
- refund policy draft;
- failed payment support;
- duplicate payment support;
- wrong product/payment dispute;
- successful payment but report not opened;
- entitlement revocation after refund;
- manual owner review;
- privacy/terms dependency;
- Telegram Stars policy dependency;
- user expectation disclaimer.

## Refund scenarios

Описаны будущие сценарии:

- duplicate payment;
- payment succeeded but access not delivered;
- wrong product selected;
- technical error after payment;
- user asks refund after reading report;
- Telegram Stars platform limitation;
- abuse/fraud/manual review;
- refund approved then entitlement revoked;
- refund denied with explanation.

Все сценарии требуют ручной проверки. Automatic refund запрещён.

## Manual owner review

Ручной owner review обязателен для:

- duplicate payment;
- failed payment;
- wrong product;
- successful payment but report not opened;
- abuse/fraud;
- спорных refund/entitlement cases;
- refund approved and entitlement revoked;
- refund denied with explanation.

Package 179 не принимает решений по реальным возвратам. Он только описывает будущую policy.

## Terms/privacy и Telegram Stars

Перед будущей оплатой нужны:

- support contact;
- terms;
- privacy wording;
- refund policy;
- Telegram Stars policy review;
- понятное объяснение, что покупает пользователь;
- правила delivery/access/revoke;
- owner approval.

## Entitlement и ledger dependency

Future refund policy зависит от будущих verified компонентов:

- payment ledger;
- successful_payment event handling;
- entitlement storage;
- entitlement revocation;
- support audit trail;
- owner decision note.

Package 179 не пишет ledger, не создаёт entitlement и не отзывает доступ.

## Safety

Package 179 не реализует оплату.

Package 179 не реализует Telegram Stars invoice.

Package 179 не вызывает sendInvoice.

Package 179 не вызывает createInvoiceLink.

Package 179 не реализует pre_checkout_query handler.

Package 179 не реализует successful_payment handler.

Package 179 не пишет payment ledger.

Package 179 не реализует реальную VIP-разблокировку.

Package 179 не создаёт entitlements.

Package 179 не автоматизирует возвраты.

Package 179 не вызывает Telegram API.

Package 179 не пишет в database.

Package 179 не изменяет database schema.

Package 179 не добавляет migrations.

Package 179 не меняет active Telegram CTA logic.

Package 179 не изменяет cron/workflow/publish scripts.

Daily/weekly/monthly content pipeline remains unblocked.

Package 179 does not implement payment.

Package 179 does not implement Telegram Stars invoice.

Package 179 does not call sendInvoice.

Package 179 does not call createInvoiceLink.

Package 179 does not implement pre_checkout_query handler.

Package 179 does not implement successful_payment handler.

Package 179 does not write payment ledger.

Package 179 does not implement real VIP unlock.

Package 179 does not create entitlements.

Package 179 does not automate refunds.

Package 179 does not call Telegram API.

Package 179 does not write to database.

Package 179 does not modify database schema.

Package 179 does not add migrations.

Package 179 does not change active Telegram CTA logic.

Package 179 does not modify cron/workflow/publish scripts.

## Visible safety labels

- Нет реальной оплаты
- Нет Telegram Stars invoice
- Нет sendInvoice
- Нет createInvoiceLink
- Нет pre_checkout_query handler
- Нет successful_payment handler
- Нет payment ledger write
- Нет entitlement creation
- Нет реальной VIP-разблокировки
- Нет автоматического возврата
- Нет записи в базу данных
- Нет миграции схемы базы данных
- Нет вызова Telegram API
- Нет production-запуска
- Support/refund readiness не включает оплату

## QA

Основная QA:

```powershell
node --experimental-strip-types scripts/qa-aphrodite-support-refund-policy-readiness.mjs
```

Dashboard QA проверяет:

```text
/dashboard/networks/zodiac/support-refund-policy-readiness
```

## Следующий пакет

Next package should be Package 180 — Analytics/Funnel Tracking Readiness.

Package 180 не начинается автоматически.
