# Package 159 - hotfix dashboard QA для /miniapp

## Статус

Package 159 исправляет только устаревший dashboard QA assertion для route `/miniapp`.

Старый assertion ожидал текст:

```text
Zodiac Universe
```

Это ожидание устарело: первый экран Mini App уже переведён на позиционирование Aphrodite / AI Love Reading.

## Что изменено

- В `scripts/qa-zodiac-dashboard.mjs` старый assert `Zodiac Universe` заменён на текущие стабильные строки `/miniapp`.
- Проверяются `Aphrodite`, `AI Love Reading` и русское обещание `Узнай, что между вами происходит`.

## Что не изменено

- Product behavior не изменён.
- Mini App UI не изменён.
- Package 158 VIP guard skeleton остаётся intact.
- Оплата не реализована.
- Реальная VIP-разблокировка не реализована.
- Entitlement creation не добавлен.
- Telegram API не использовался.
- Схема базы данных не изменена.
- Workflows, cron и publish scripts не изменены.
- Bot sending logic не изменён.
- Active Telegram CTA generation не изменена.

## QA

`qa-zodiac-dashboard` снова проходит после обновления stale assertion.

Package 158 VIP guard skeleton QA остаётся актуальным и проверяет deny-by-default поведение.

## Риск-аудит

Новые изменения являются QA maintenance и документацией. Активная оплата, live Telegram Stars invoice, `successful_payment` handler, реальная VIP-разблокировка, entitlement creation, запись в базу данных или Telegram API call не добавлены.

## Следующий рекомендуемый пакет

Package 160 - VIP Access Boundary Guard Integration Review.

Package 160 не начинается автоматически.
