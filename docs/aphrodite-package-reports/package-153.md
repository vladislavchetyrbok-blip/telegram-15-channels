# Package 153 - Birth Date Input No-Jump Fix

Дата: 2026-06-25

Статус: hotfix по стабильности ручного ввода даты рождения. Paywall, реальные платежи, VIP unlock, Telegram API, database, workflows, cron, publish scripts, bot sending logic и active Telegram CTA не менялись.

## Баг

Пользователь сообщил, что в live-приложении дата рождения всё ещё не вводится нормально: при ручном вводе `15.06.1998` или промежуточного года `1990` поле перепрыгивает, переформатируется, ломает год или сбрасывает значение.

Это не проблема отсутствия marker в source. Причина была в interaction logic: birth-date `onChange` продолжал агрессивно нормализовать controlled value на каждом символе.

## Причина

- `components/zodiac-mini-app/ZodiacDateInput.tsx` использовал display-normalizer в `onChange`, поэтому частичный ввод мог переписываться до завершения даты.
- `components/ZodiacCompatibilityMiniApp.tsx` дополнительно форматировал дату в `updateBirthDate`.
- `components/ZodiacVipSections.tsx` в VIP natal handler также нормализовал partial value на каждом изменении.
- `lib/zodiac-birth-date-range.ts` поддерживал двухзначный год и шестизначный ввод, из-за чего `15.06.19` мог стать валидной датой 2019 года, а промежуточный `1990` мог выглядеть как сломанная дата.

## Исправление

Выбран подход stable raw text input `ДД.ММ.ГГГГ`:

- `onChange` мягко фильтрует только допустимые символы для draft value: цифры, точки и дефисы.
- `onChange` не валидирует полную дату, не подставляет 2000-е, не расширяет двухзначный год и не переписывает неполный ввод.
- `blur`/submit нормализует только завершённые валидные даты в `ДД.ММ.ГГГГ`.
- Неполная дата остаётся как есть и проверяется мягкой ошибкой в существующем flow.
- `data-birth-date-ui="v2-global-1900-today"` и scope markers сохранены.

## Проверенные birth-date scopes

- `/birth-matrix` - scope `birth-matrix`.
- Mini App Matrix of Destiny - scope `miniapp-matrix`.
- Compatibility birth data - scope `compatibility`.
- VIP natal chart / birth chart - scope `vip-natal`.
- VIP numerology - scope `vip-numerology`.
- Mystic/numerology birth date - scope `mystic`.
- Shared `ZodiacDateInput` - единый режим `dateKind="birth"`.

## Поддерживаемый ввод

Вводится и принимается:

- `15.06.1998`
- `15061998`
- `1998-06-15`
- `01.01.1990`
- `31.12.1985`
- `01.01.2000`
- `1900-01-01`
- today

Отклоняется:

- `1899-12-31`
- tomorrow
- future dates, включая `26.06.2026`
- `15.06.19` как неполная дата, а не 2019 год

Partial input не сбрасывается:

- `1`
- `15`
- `15.`
- `15.0`
- `15.06`
- `15.06.`
- `15.06.1`
- `15.06.19`
- `15.06.199`
- `1990`

## Изменённые файлы

- `lib/zodiac-birth-date-range.ts`
- `components/zodiac-mini-app/ZodiacDateInput.tsx`
- `components/ZodiacCompatibilityMiniApp.tsx`
- `components/ZodiacVipSections.tsx`
- `scripts/qa-zodiac-birth-date-runtime-ui-fix.mjs`
- `scripts/qa-zodiac-birth-date-no-jump-input.mjs`
- `docs/aphrodite-package-reports/package-153.md`

## QA

- `node --experimental-strip-types scripts/qa-zodiac-birth-date-no-jump-input.mjs`
- `node --experimental-strip-types scripts/qa-zodiac-birth-date-runtime-ui-fix.mjs`
- `node --experimental-strip-types scripts/qa-zodiac-global-birth-date-input-ranges.mjs`
- `node --experimental-strip-types scripts/qa-zodiac-natal-chart-date-picker-range.mjs`
- `npx tsc --noEmit -p tsconfig.json`
- `npm run build`
- `node --check scripts/qa-zodiac-dashboard.mjs`
- `npm run production:safety:check`

## Итог

Все birth-date inputs проверены поэкранно.
Все birth-date inputs используют общий ввод `ДД.ММ.ГГГГ` или общий helper.
`15.06.1998` вводится во всех birth-date сценариях.
`01.01.1990` вводится во всех birth-date сценариях.
`31.12.1985` вводится во всех birth-date сценариях.
Future dates blocked во всех birth-date сценариях.
Pre-1900 dates blocked во всех birth-date сценариях.
Native `type=date` не используется для birth-date сценариев.

Следующий рекомендуемый пакет: Package 154 - Paywall Readiness / VIP Offer Packaging. Не начинать автоматически.
