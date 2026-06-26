# Aphrodite Mini App Simplified Redesign Implementation Plan

Package 196 добавляет implementation plan будущего упрощённого дизайна Mini App.

## Назначение

Пакет фиксирует будущий порядок внедрения:

- simplified home screen
- fewer primary modules on first screen
- clear first CTA: AI Love Reading
- secondary modules below: Compatibility, Birth Matrix, Daily/Weekly/Monthly
- cleaner card style
- less visual noise
- improved spacing
- improved typography
- premium mystical style
- mobile-first layout
- Telegram safe area
- loading states
- empty states
- error states
- dark theme consistency
- fallback route styling
- guard denied styling
- future paywall styling

## Первый экран

Главное правило:

`AI Love Reading` должен быть primary CTA на первом экране. Compatibility, Birth Matrix, Daily/Weekly/Monthly остаются доступными, но идут ниже как secondary modules.

## Классификация

`Только implementation plan / Live UI не изменён / Нет запуска`

## Safety labels

- Нет production-запуска
- Нет изменения оплаты
- Нет VIP-разблокировки
- Нет Telegram API
- Нет записи в базу данных
- Live UI не изменён в этом пакете

## Что не выполняется

- Нет live UI change.
- Нет live design change.
- Нет изменения routes.
- Нет изменения оплаты.
- Нет VIP unlock.
- Нет Telegram API.
- Нет database write.
- Нет production launch.
- Нет workflow/cron/publish scripts изменений.

## Dashboard

Route:

`/dashboard/networks/zodiac/miniapp-simplified-redesign-implementation-plan`

## QA

Run:

`node --experimental-strip-types scripts/qa-aphrodite-miniapp-simplified-redesign-implementation-plan.mjs`

QA проверяет model, dashboard route, redesign areas, phases, loading/empty/error/fallback/guard/future paywall states, safety labels, false-флаги и отсутствие изменений live Mini App UI paths.

## Следующий пакет

Package 197 — Design Tokens & UI Shell Skeleton.
