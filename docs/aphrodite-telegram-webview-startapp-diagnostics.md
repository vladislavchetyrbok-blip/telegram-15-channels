# Package 209 — Telegram WebView / StartApp Route Diagnostics

Package 209 создаёт диагностику Telegram WebView и startapp routes для Aphrodite Mini App.

Это только диагностика. Пакет не вызывает Telegram API, не меняет BotFather, не меняет active CTA, не меняет live startapp config, не пишет в базу данных, не включает оплату и не открывает VIP.

## Startapp routes

- default Mini App open → `/miniapp`
- `love_reading` → `/miniapp/love-reading-preview`
- `compatibility` → `/compatibility`
- `birth_matrix` → `/birth-matrix`
- `daily` → `/miniapp`
- `weekly` → `/miniapp`
- `monthly` → `/miniapp`
- fallback route → `/miniapp/love-reading-preview`

## Диагностика cache и wrong route

- stale Telegram WebView cache
- wrong route symptoms
- version marker check
- cache-buster query check
- screenshot + фактический route path
- сравнение browser fallback и Telegram WebView

## Platform behavior

- iOS Telegram WebView behavior
- Android Telegram WebView behavior
- Telegram Desktop behavior
- browser fallback behavior

## Safety labels

- Нет production-запуска
- Нет Telegram API
- Нет изменения BotFather
- Нет изменения active CTA
- Нет отправки сообщений
- Нет записи в базу данных
- Нет оплаты
- Нет VIP-разблокировки
- StartApp diagnostics ничего не меняет

## Что делать при проблеме

1. Спросить у пользователя screenshot и путь входа.
2. Определить startapp parameter.
3. Сравнить ожидаемый route с фактическим screen title.
4. Проверить cache-buster query.
5. Проверить browser fallback.
6. Если browser fallback новый, а Telegram старый — вероятен stale Telegram WebView cache.

## Следующий рекомендуемый пакет

Package 210 — Live Version & Cache Marker Readiness.

Package 210 не начат.
