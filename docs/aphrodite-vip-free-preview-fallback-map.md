# Aphrodite VIP Free Preview Fallback Map

Package 161 создаёт только карту free preview fallback для будущих VIP-разделов. Это readiness-слой, а не подключение платного доступа.

## Классификация

Только карта fallback / VIP не открывается / Нет оплаты.

## Главный принцип

Если VIP-доступа нет, пользователь не должен попасть в пустоту или ошибку. Он должен видеть безопасный fallback: бесплатный preview, понятное объяснение и мягкий путь назад.

## Что добавлено

- Статическая модель fallback surfaces в `lib/zodiac/aphrodite-vip-free-preview-fallback-map.ts`.
- Dashboard-страница `/dashboard/networks/zodiac/vip-free-preview-fallback-map`.
- QA-скрипт `scripts/qa-aphrodite-vip-free-preview-fallback-map.mjs`.
- Dashboard-ссылки `Карта fallback VIP` из соседних review/spec разделов.
- Отчёт Package 161.

## Что не подключено

- Guard не подключён к production user-facing flows.
- Оплата не реализована.
- Telegram Stars invoice не реализован.
- `successful_payment` handler не реализован.
- Реальная VIP-разблокировка не реализована.
- Entitlement creation не реализован.
- Telegram API не вызывается.
- Запись в базу данных не выполняется.
- Схема базы данных не меняется.
- Миграции не добавляются.
- Active Telegram CTA logic не меняется.
- Cron, workflows и publish scripts не меняются.
- Daily/weekly automation остаётся незаблокированной.

## Покрытие fallback

- Free Love Reading Preview.
- Full Love Report.
- VIP Love Access.
- AI Future Timeline VIP.
- Soulmate Scanner VIP.
- Red Flags Scanner VIP.
- Birth Matrix VIP.
- Natal Chart VIP.
- VIP Couple Calendar / 30 дней пары.
- VIP Numerology.

## Free surfaces, которые должны оставаться открытыми

- `/miniapp`.
- `/miniapp/love-reading-preview`.
- Free preview cards.
- Basic Birth Matrix preview.
- Basic compatibility preview.
- Dashboard review/spec pages.
- Manual QA dashboards.

## Единый fallback route

Для будущих VIP-разделов базовый fallback route:

```text
/miniapp/love-reading-preview
```

## Видимые fallback-сообщения

```text
Полная версия пока закрыта. Сейчас доступен бесплатный preview без оплаты.
```

```text
Этот раздел будет открываться только после server-side проверки доступа. Сейчас он показан как preview.
```

```text
Перед запуском этого раздела нужен owner review и отдельная проверка оплаты.
```

## Заблокированные failure modes

- `blank screen`
- `unhandled exception`
- `client-only unlock`
- `localStorage VIP bypass`
- `query param VIP bypass`
- `mock payment success bypass`
- `manual route guessing`
- `hardcoded allowed=true`
- `lost user after denied access`

## QA

Package 161 QA проверяет:

- наличие model/dashboard/docs/report;
- наличие fallback surfaces, rules, QA items, boundaries и next steps;
- `/miniapp` и `/miniapp/love-reading-preview` marked `mustRemainOpen`;
- fallback для Full Love Report, VIP Couple Calendar и VIP Numerology;
- единый fallback route `/miniapp/love-reading-preview`;
- наличие blocked failure modes;
- отсутствие blank-screen fallback;
- deny-by-default поведение guard skeleton;
- видимые русские safety boundaries;
- отсутствие real payment API, Telegram token, DB connection, Stars invoice, `successful_payment` handler, entitlement creation, real VIP unlock и active payment CTA;
- отсутствие изменений DB schema/migrations, workflows и package.json.

## Следующий пакет

Следующий рекомендуемый пакет: Package 162 — Product Catalog Finalization.

Package 162 не начинается автоматически.
