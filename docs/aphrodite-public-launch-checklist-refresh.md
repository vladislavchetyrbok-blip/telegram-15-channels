# Aphrodite Public Launch Checklist Refresh

Package 191 обновляет checklist будущего публичного запуска Aphrodite.

## Назначение

Пакет собирает ручные зоны проверки перед запуском:

- BotFather profile
- Main Mini App button
- Mini App routes
- daily/weekly/monthly content
- Love Reading preview
- compatibility
- birth matrix
- 30 days couple calendar
- fallback route
- support/refund
- privacy/terms
- analytics readiness
- retention readiness
- production safety
- env blockers
- backup freshness
- owner review

## Классификация

`Только checklist / Запуск не выполняется / Нет Telegram API`

## Safety labels

- Нет production-запуска
- Нет Telegram API
- Нет отправки сообщений
- Нет изменения BotFather
- Нет изменения active CTA
- Нет оплаты
- Нет VIP-разблокировки
- Launch checklist ничего не запускает

## Что не выполняется

- Нет production launch.
- Нет Telegram API.
- Нет отправки сообщений.
- Нет изменения BotFather.
- Нет изменения active CTA.
- Нет оплаты.
- Нет VIP unlock.
- Нет database write.
- Нет workflow/cron изменений.
- Нет publish script изменений.

## Dashboard

Route:

`/dashboard/networks/zodiac/public-launch-checklist-refresh`

## QA

Run:

`node --experimental-strip-types scripts/qa-aphrodite-public-launch-checklist-refresh.mjs`

QA проверяет coverage checklist, safety labels, dashboard route, launch approval false, отсутствие Telegram API, отсутствие payment/VIP changes, отсутствие workflow/cron/publish script changes и то, что checklist остаётся checklist-only.

## Следующий пакет

Package 192 — Mini App UX Simplification Review.
