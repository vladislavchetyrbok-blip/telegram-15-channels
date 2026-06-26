# Package 208 — Real Device Visual QA Checklist

Package 208 создаёт ручной real-device visual QA checklist для Aphrodite Mini App.

Это только manual QA. Пакет ничего не запускает, не вызывает Telegram API, не отправляет сообщения, не меняет BotFather, active CTA, оплату, VIP, базу данных, workflows, cron или publish scripts.

## Устройства и окружения

- iPhone Telegram WebView
- Android Telegram WebView
- Telegram Desktop
- iPhone Safari
- Android Chrome
- desktop browser
- narrow screens
- slow network mode if possible
- Telegram safe area
- keyboard open state
- back button behavior

## Экраны и маршруты

- `/miniapp`
- `/miniapp/love-reading-preview`
- `/birth-matrix`
- `/compatibility`
- compatibility result
- Birth Matrix result
- Mystic / Universe
- daily horoscope card
- weekly horoscope card
- monthly horoscope card
- fallback `/miniapp/love-reading-preview`
- guard denied/future VIP locked state

## Safety labels

- Нет production-запуска
- Нет Telegram API
- Нет отправки сообщений
- Нет изменения BotFather
- Нет изменения active CTA
- Нет оплаты
- Нет VIP-разблокировки
- Нет записи в базу данных
- Real device checklist ничего не запускает

## Обязательная ручная проверка

Перед public launch review владелец должен открыть реальные устройства и проверить:

- корректный первый экран Mini App;
- читаемость AI Love Reading preview;
- ввод даты рождения на iPhone и Android;
- результат Birth Matrix;
- Compatibility result и 30 days couple calendar;
- Mystic / Universe panel;
- daily/weekly/monthly horoscope cards;
- fallback route;
- keyboard open state;
- Telegram back button behavior;
- отсутствие старого cached UI.

## Следующий рекомендуемый пакет

Package 209 — Telegram WebView / StartApp Route Diagnostics.

Package 209 не начат.
