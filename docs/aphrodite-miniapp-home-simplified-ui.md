# Package 198 — упрощённый главный экран Aphrodite Mini App

Package 198 обновляет `/miniapp` и делает первый экран проще.

## Что изменено

- AI Love Reading стал главным первым CTA.
- Первый экран стал короче и спокойнее.
- Совместимость, Матрица судьбы, гороскоп на день, неделю и месяц остались видимыми как вторичные модули.
- Mystic Numbers и Affirmations сохранены в нижнем блоке.
- Future VIP teaser перенесён ниже и явно закрыт.
- Используется Package 197 UI shell: `AphroditeMiniAppShell`, `AphroditeSectionCard`, `AphroditePrimaryCta`, `AphroditeStatusPill`.
- Сохранены границы безопасности: без оплаты, без VIP-разблокировки, без Telegram API, без записи в базу данных, без production-запуска.

## Что не изменено

- Нет оплаты.
- Нет VIP-разблокировки.
- Нет Telegram API.
- Нет записи в базу данных.
- Нет внешней аналитики.
- Нет workflow/cron/publish script изменений.
- Нет active Telegram CTA generation изменений.

## QA

Run:

`node --experimental-strip-types scripts/qa-aphrodite-miniapp-home-simplified-ui.mjs`

Также сохраняется совместимость с:

`node --experimental-strip-types scripts/qa-aphrodite-mini-app-first-screen-real-integration.mjs`

## Следующий пакет

Package 199 — Love Reading Preview Visual Upgrade.
