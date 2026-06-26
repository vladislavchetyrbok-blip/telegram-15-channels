# Aphrodite Mini App UX Simplification Review

Package 192 добавляет review будущего упрощения Mini App UX.

## Назначение

Пакет описывает UX-зоны, которые нужно упростить перед публичным запуском:

- Mini App home screen
- Love Reading entry
- Compatibility entry
- Birth Matrix entry
- Daily/weekly/monthly content entry
- too many cards/modules
- unclear VIP teasers
- CTA hierarchy
- button labels
- mobile readability
- loading states
- empty/error states
- back button behavior
- Telegram WebApp feel
- reduce cognitive load

## Рекомендации

- reduce top-level modules
- one primary CTA
- short labels
- group daily/weekly/monthly
- move VIP teasers below free actions
- explicit fallback
- consistent back behavior
- skeleton/loading copy
- friendly empty/error states
- Telegram safe area

## Классификация

`Только UX review / Live UI не изменён / Нет запуска`

## Safety labels

- Нет production-запуска
- Нет изменения оплаты
- Нет VIP-разблокировки
- Нет Telegram API
- Нет записи в базу данных
- UX review не меняет live flow

## Что не выполняется

- Нет live UI change.
- Нет изменения routes.
- Нет изменения оплаты.
- Нет VIP unlock.
- Нет Telegram API.
- Нет database write.
- Нет production launch.

## Dashboard

Route:

`/dashboard/networks/zodiac/miniapp-ux-simplification-review`

## QA

Run:

`node --experimental-strip-types scripts/qa-aphrodite-miniapp-ux-simplification-review.mjs`

QA проверяет UX areas, recommendations, dashboard route, safety labels, live flags false и отсутствие изменений live Mini App flow.

## Следующий пакет

Package 193 — Aphrodite Visual UI Polish Plan.
