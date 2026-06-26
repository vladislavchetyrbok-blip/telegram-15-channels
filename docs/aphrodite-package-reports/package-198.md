# Package 198 — упрощённый главный экран Mini App

## Статус

PASS — пакет визуального упрощения `/miniapp`.

## Что изменено

- `/miniapp` переведён на Package 197 UI shell.
- AI Love Reading стал главным CTA первого экрана.
- Совместимость, Матрица судьбы, гороскоп на день, неделю и месяц сохранены как вторичные модули.
- Mystic Numbers и Affirmations сохранены ниже.
- Future VIP teaser отображается ниже и явно закрыт.
- Границы безопасности видны на экране.

## Безопасность

- Оплата: не добавлена.
- VIP-разблокировка: не добавлена.
- Telegram API: не вызывается.
- Запись в базу данных: не добавлена.
- Внешняя аналитика: не добавлена.
- Active Telegram CTA logic: не изменена.
- Workflows/cron/publish scripts: не изменены.

## QA

Package QA:

`node --experimental-strip-types scripts/qa-aphrodite-miniapp-home-simplified-ui.mjs`

Compatibility QA:

`node --experimental-strip-types scripts/qa-aphrodite-mini-app-first-screen-real-integration.mjs`

Ожидаемые общие проверки:

- TypeScript
- проверка синтаксиса dashboard QA
- build
- zodiac dashboard QA
- production safety check

Production safety может падать только из-за `DATABASE_URL`, `TELEGRAM_BOT_TOKEN` и возраста backup.

## Следующий пакет

Package 199 — Love Reading Preview Visual Upgrade.

Package 199 was not started in Package 198.
