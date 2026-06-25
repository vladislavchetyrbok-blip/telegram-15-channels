# Package 151 — Global Birth Date Runtime UI Fix + Build Unblock

## Контекст

Пользователь вручную проверил приложение после предыдущего исправления и подтвердил, что дата рождения всё ещё не вводилась нормально. Поэтому Package 151 не продолжает paywall/product work: это срочный production/UI hotfix для реального ввода даты рождения.

Текущая база перед правкой: `34ee5cf08c68c1e5adea7e2fa992305cc55866dd`.

## Найденные birth-date inputs

- `/birth-matrix`: `app/birth-matrix/BirthMatrixClient.tsx`.
- Mini App / compatibility: `components/ZodiacCompatibilityMiniApp.tsx`, `PersonPanel` и связанные personal/natal карточки.
- Mini App / Matrix of Destiny: `components/ZodiacMysticSections.tsx`, `BirthMatrixFeature`.
- VIP natal chart / birth chart: `components/ZodiacVipSections.tsx`, `ExtendedNatalFeature`.
- VIP numerology birth date: `components/ZodiacVipSections.tsx`, `ExtendedNumerologyFeature`.
- Shared UI: `components/zodiac-mini-app/ZodiacDateInput.tsx`.
- Shared parsing/range: `lib/zodiac-birth-date-range.ts`, `lib/zodiac-mystic-content.ts`.

## Что изменено

- `ZodiacDateInput` получил явный birth-date режим по умолчанию и runtime marker `data-birth-date-ui="v2-global-1900-today"`.
- Birth-date ввод больше не зависит от native `<input type="date">`; используется текстовый ввод `ДД.ММ.ГГГГ`.
- Поддержаны оба формата: `ДД.ММ.ГГГГ` и `YYYY-MM-DD`.
- Paste/ввод `1998-06-15` нормализуется в `15.06.1998`.
- Частичный ISO draft вроде `1998-` больше не превращается в невалидный `19.98`.
- Compatibility birth-date formatter переведён на общий birth-date helper.
- Добавлены helpers `formatBirthDateInput`, `normalizeBirthDateInput`, `parseBirthDateInputToIso`, `formatBirthDateIsoToDisplay`.

## Исключённые non-birth date inputs

- `VipCoupleCalendarFeature` / `startDate`: дата старта 30-дневного календаря пары, не дата рождения.
- `VipMysticDayFeature` / `date`: дата прогноза, не дата рождения.
- `LunarRitualFeature` / `customDate`: дата лунного сценария, не дата рождения.
- Контентные и publishing calendar inputs с `type="date"`: даты планирования/публикации, не birth-date UI.

Эти поля явно переведены или оставлены в calendar mode и не получают birth-date marker/range.

## Диапазон и проверенные даты

Минимальная дата: `1900-01-01`.

Максимальная дата: today / текущая дата.

Проверены:

- `1900-01-01`
- `1985-12-31`
- `1990-01-01`
- `1998-06-15`
- `15.06.1998`
- `2000-01-01`
- today

Future dates blocked: да.

Pre-1900 dates blocked: да.

Hardcoded 2020 restriction: не найден.

## Build unblock

`app/dashboard/networks/zodiac/social-export-dashboard/page.tsx` `react/no-unescaped-entities` уже был исправлен на текущей базе, и `npm run build` перед этим пакетом проходил.

## Safety boundaries

- Реальная оплата не добавлена.
- Реальная VIP-разблокировка не добавлена.
- Telegram API не использовался.
- База данных не изменена.
- Workflows, cron и publish scripts не изменены.
- Package 152 / Paywall Readiness не начинался.

## QA

Добавлен и запущен:

- `node --experimental-strip-types scripts/qa-zodiac-birth-date-runtime-ui-fix.mjs`

Результат: PASS, 67 passed, 0 failed.

Также запущены и прошли старые birth-date QA:

- `node --experimental-strip-types scripts/qa-zodiac-natal-chart-date-picker-range.mjs`
- `node --experimental-strip-types scripts/qa-zodiac-global-birth-date-input-ranges.mjs`
- `node --experimental-strip-types scripts/qa-zodiac-birth-date-ui-runtime-fix.mjs`

Runtime-smoke dev server:

- `/birth-matrix`: HTTP 200, контент отдан.
- `/miniapp`: HTTP 200, контент отдан.

## Следующий рекомендуемый пакет

Package 152 — Paywall Readiness / VIP Offer Packaging.
