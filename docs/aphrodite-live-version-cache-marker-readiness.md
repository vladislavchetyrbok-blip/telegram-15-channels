# Package 210 — Live Version & Cache Marker Readiness

Package 210 создаёт readiness слой для сверки live version, cache marker и stale deploy/cache симптомов.

Это только readiness. Пакет не меняет deploy settings, workflows, production launch settings, активную публикацию, Telegram API, BotFather, базу данных, оплату или VIP.

## Marker plan

- source commit marker
- live HTML marker
- route-specific marker
- `data-aphrodite-visual-version="v1-visual-polish"` только на dashboard readiness странице
- /miniapp marker/check documented
- /birth-matrix marker/check documented
- /compatibility marker/check documented

## Route checks

- `/miniapp`: hub shell, Love Reading entry, horoscope cards, browser cache-buster diagnosis
- `/birth-matrix`: `data-birth-date-ui="v2-global-1900-today"`, формат ДД.ММ.ГГГГ, ввод 15.06.1998
- `/compatibility`: compatibility flow, дата рождения, результат, 30 days couple calendar

## Cache/deploy diagnosis

- Telegram WebView cache diagnosis
- browser cache-buster diagnosis
- Vercel deployment check notes
- stale build symptoms
- wrong route symptoms
- live HTML marker check

## Safety labels

- Нет production-запуска
- Нет изменения deploy settings
- Нет Telegram API
- Нет изменения BotFather
- Нет отправки сообщений
- Нет записи в базу данных
- Нет оплаты
- Нет VIP-разблокировки
- Version marker readiness ничего не деплоит

## Если marker отсутствует

1. Проверить source commit marker.
2. Проверить live HTML marker с cache-buster query.
3. Сравнить browser fallback и Telegram WebView.
4. Если browser новый, а Telegram старый, вероятен Telegram WebView cache.
5. Если source новый, а live HTML старый, вероятен stale deployment.
6. Если route отличается, использовать Package 209 StartApp diagnostics.

## Следующий рекомендуемый пакет

Package 211 — Visual Issue Triage Board.

Package 211 не начат.
