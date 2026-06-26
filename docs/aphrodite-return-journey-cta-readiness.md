# Aphrodite Return Journey CTA Readiness

Package 188 создаёт только readiness-карту будущих возвратных CTA для Zodiac/Aphrodite.

## Назначение

Пакет описывает, куда пользователь должен безопасно возвращаться из daily/weekly/monthly контента, Telegram CTA, Mini App home, locked teaser, guard denied и будущей истории отчётов.

Это не production routing и не tracking. Активная генерация CTA, bot sending logic, Telegram delivery и startapp-публикация не меняются.

## Классификация

`Только CTA readiness / Active CTA не изменены / Нет tracking`

## Обязательные пути

- daily horoscope → Mini App
- weekly horoscope → weekly module / Mini App
- monthly horoscope → monthly module / Mini App
- Telegram channel → Love Reading preview
- Telegram channel → Compatibility
- Telegram channel → Birth Matrix
- Mini App home → Love Reading
- Mini App home → Compatibility
- locked teaser → free preview fallback
- guard denied → free preview fallback
- saved report future → report detail future

## Поля будущего CTA

- source
- targetRoute
- productTarget
- fallbackRoute
- safeCopy
- futureStartAppParam
- attributionKey
- mustRemainFree
- activeNow
- activeNowClassification
- ownerReviewRequired

## Safety labels

- Нет изменения active CTA
- Нет Telegram API
- Нет отправки сообщений
- Нет внешней аналитики
- Нет записи в базу данных
- Нет payment tracking
- Нет реальной оплаты
- Нет VIP-разблокировки
- Return CTA readiness ничего не отправляет

## Что не добавлено

- No active CTA generation change.
- No Telegram API.
- No message sending.
- No external analytics provider.
- No database event writes.
- No production tracking.
- No payment tracking.
- No real payment.
- No VIP unlock.

## Dashboard

Route:

`/dashboard/networks/zodiac/return-journey-cta-readiness`

## QA

Run:

`node --experimental-strip-types scripts/qa-aphrodite-return-journey-cta-readiness.mjs`

QA проверяет наличие модели, dashboard route, всех обязательных return paths, fallback paths, отсутствие active CTA изменений, Telegram API, DB writes, external analytics, payment/VIP изменений и workflow/cron/publish изменений.

## Следующий пакет

Package 189 — Streak & Reminder Noop Skeleton.
