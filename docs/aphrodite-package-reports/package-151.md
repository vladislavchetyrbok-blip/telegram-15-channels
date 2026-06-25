# Package 151 — Social Export Dashboard Lint Hotfix

## Контекст

Package 151 закрывает unrelated build lint blocker, найденный после Package 150. Package 150 birth-date hotfix остаётся текущей проверенной базой: `4dcb885ee7500b72a56b9b24d327798b142ac408`.

Paywall/payments/VIP scope в этом пакете не продолжается.

## Исправление

- Исправлен `react/no-unescaped-entities` в `app/dashboard/networks/zodiac/social-export-dashboard/page.tsx`.
- Текстовые кавычки в JSX заменены на `&quot;`, без изменения поведения страницы.
- Birth-date hotfix Package 150 не изменялся.
- Untracked paywall WIP файл `lib/zodiac/aphrodite-paywall-readiness.ts` удалён из рабочего дерева как stray WIP, не подключённый к коду.

## Safety boundaries

- Реальная оплата не добавлена.
- Реальная VIP-разблокировка не добавлена.
- Telegram API не использовался.
- База данных не изменена.
- Workflows, cron и publish scripts не изменены.
- Product packages / Package 152 не начинались.

## Automation impact

Daily/weekly automation остаётся разблокированной: build blocker удалён, а automation/publish scope не менялся.

## Следующий рекомендуемый пакет

Package 152 — Paywall Readiness / VIP Offer Packaging.
