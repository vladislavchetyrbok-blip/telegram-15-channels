# Package 150 — Global Birth Date UI Runtime Fix

## Контекст

Пользователь вручную подтвердил, что выбор даты рождения всё ещё не работал: старые годы вроде 1990/1998 было неудобно или невозможно выбрать через нативный date picker, который открывался около текущих годов. Поэтому Package 150 paywall не продолжался; текущий пакет — срочный hotfix даты рождения.

## Проверенные экраны и файлы

- `/birth-matrix` — отдельная страница Birth Matrix / Matrix of Destiny.
- Mini App: Compatibility wizard, поля `Вы` / `Партнёр`.
- Mini App: `Матрица судьбы` внутри mystic-раздела.
- Mini App / VIP: premium natal chart / birth chart.
- Mini App / VIP: нумерология, где дата является датой рождения.
- Shared text input `components/zodiac-mini-app/ZodiacDateInput.tsx`.
- Shared range helper `lib/zodiac-birth-date-range.ts`.

## Исправленные birth-date inputs

- `app/birth-matrix/BirthMatrixClient.tsx`: нативный `<input type="date">` заменён на явный текстовый ввод `ДД.ММ.ГГГГ`; расчёт получает нормализованный ISO `YYYY-MM-DD`.
- `components/ZodiacCompatibilityMiniApp.tsx`: compatibility/natal parser переведён на общий birth-date helper.
- `components/ZodiacVipSections.tsx`: VIP natal chart и VIP numerology используют birth-date parser 1900…сегодня; будущие даты не считаются валидной датой рождения.
- `lib/zodiac-mystic-content.ts`: parser `parseBirthMatrixDate` использует общий birth-date helper.
- `lib/zodiac-birth-date-range.ts`: добавлен самодостаточный parser для `YYYY-MM-DD`, `ДД.ММ.ГГГГ` и слитого цифрового ввода.

## Исключённые non-birth date inputs

- `VipCoupleCalendarFeature` / `startDate`: дата начала 30-дневного календаря пары, не дата рождения.
- `VipMysticDayFeature` / `date`: дата прогноза, не дата рождения.
- `LunarRitualFeature` / `customDate`: дата лунного/ритуального сценария, не дата рождения.
- Social/content/publishing calendar occurrences: планирование контента и публикаций, не birth-date UI.

## Выбранный UI-подход

Выбран текстовый ввод `ДД.ММ.ГГГГ`, а не native date picker. Это убирает зависимость от системного picker-а, который на мобильном/браузере мог открываться около текущего года и ломать выбор 1990/1998.

Минимальная дата: `1900-01-01`.

Максимальная дата: today / current date.

Подтверждённые даты:

- `1900-01-01`
- `1985-12-31`
- `1990-01-01`
- `1998-06-15`
- `2000-01-01`
- today

Future dates blocked: да.

Pre-1900 dates blocked: да.

Hardcoded 2020 restriction: не найден в birth-date коде; нативный birth-date picker с проблемным UX удалён из `/birth-matrix`.

## Safety boundaries

- Реальная оплата не добавлена.
- Реальная VIP-разблокировка не добавлена.
- Telegram API не использовался.
- База данных не изменена.
- Cron/workflows/publish scripts не изменены.
- Package 150 paywall readiness файл в рабочем дереве не включался в hotfix.

## QA

Запущены:

- `npx tsc --noEmit -p tsconfig.json`
- `node --experimental-strip-types scripts/qa-zodiac-birth-date-ui-runtime-fix.mjs`
- `node --experimental-strip-types scripts/qa-zodiac-natal-chart-date-picker-range.mjs`
- `node --experimental-strip-types scripts/qa-zodiac-global-birth-date-input-ranges.mjs`

Результат: PASS.

`node --experimental-strip-types` печатает предупреждение Node `MODULE_TYPELESS_PACKAGE_JSON` для прямого импорта `.ts`; это предупреждение не меняет результат QA и не требует изменения `package.json`.

## Следующий рекомендуемый пакет

Package 150 — Paywall Readiness / VIP Offer Packaging.
