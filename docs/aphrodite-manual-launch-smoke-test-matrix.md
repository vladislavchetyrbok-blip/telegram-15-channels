# Aphrodite Manual Launch Smoke Test Matrix

Package 195 добавляет manual smoke test matrix для будущего публичного запуска.

## Назначение

Пакет фиксирует ручные проверки:

- iPhone Telegram Mini App
- Android Telegram Mini App
- desktop Telegram
- browser fallback
- `/miniapp`
- `/miniapp/love-reading-preview`
- compatibility
- birth matrix
- 30 days couple
- daily horoscope CTA
- weekly horoscope CTA
- monthly horoscope CTA
- support/refund page/readiness
- analytics noop
- fallback routes
- guard denied flow
- owner review blocked flow
- production safety blocked state

## Классификация

`Только manual QA / Запуск не выполняется / Нет Telegram API`

## Safety labels

- Нет production-запуска
- Нет Telegram API
- Нет отправки сообщений
- Нет изменения active CTA
- Нет оплаты
- Нет VIP-разблокировки
- Manual smoke matrix ничего не запускает

## Что не выполняется

- Нет production launch.
- Нет Telegram API.
- Нет отправки сообщений.
- Нет active CTA change.
- Нет оплаты.
- Нет VIP unlock.
- Нет database write.
- Нет workflow/cron changes.
- Нет publish script changes.

## Dashboard

Route:

`/dashboard/networks/zodiac/manual-launch-smoke-test-matrix`

## QA

Run:

`node --experimental-strip-types scripts/qa-aphrodite-manual-launch-smoke-test-matrix.mjs`

QA проверяет manual smoke coverage, safety labels, dashboard route, launch flags false и отсутствие изменений production delivery/payment/VIP/workflows.

## Следующий пакет

Package 196 — Mini App Simplified Visual Redesign Implementation Plan.
