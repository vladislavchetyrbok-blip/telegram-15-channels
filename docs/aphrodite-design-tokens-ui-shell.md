# Aphrodite Design Tokens & UI Shell Skeleton

Package 197 добавляет безопасную визуальную основу для будущего упрощённого Mini App UI.

## Что добавлено

- `lib/zodiac/aphrodite-design-tokens.ts`
- `components/zodiac-mini-app/AphroditeMiniAppShell.tsx`
- `components/zodiac-mini-app/AphroditeSectionCard.tsx`
- `components/zodiac-mini-app/AphroditePrimaryCta.tsx`
- `components/zodiac-mini-app/AphroditeStatusPill.tsx`
- dashboard route `/dashboard/networks/zodiac/design-tokens-ui-shell`

## Design tokens

Tokens покрывают:

- spacing scale
- radius scale
- card style
- text hierarchy
- section rhythm
- CTA hierarchy
- safe dark theme palette references
- gradient usage rules
- mobile max width
- Telegram safe area notes

## Safety labels

- Нет production-запуска
- Нет изменения оплаты
- Нет VIP-разблокировки
- Нет Telegram API
- Нет записи в базу данных
- UI shell ничего не отправляет

## Что не выполняется

- Компоненты не отправляют аналитику.
- Компоненты не вызывают Telegram API.
- Компоненты не пишут в базу данных.
- Компоненты не создают оплату.
- Компоненты не открывают VIP.
- Компоненты не меняют workflow/cron/publish scripts.

## QA

Run:

`node --experimental-strip-types scripts/qa-aphrodite-design-tokens-ui-shell.mjs`

QA проверяет tokens, shell, section card, primary CTA, status pill, dashboard route, safety labels и отсутствие unsafe implementation.

## Следующий пакет

Package 198 — Mini App Home Simplified UI Implementation.
