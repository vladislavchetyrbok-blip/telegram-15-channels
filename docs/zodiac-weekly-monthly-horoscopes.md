# Еженедельные и месячные гороскопы Zodiac

## Назначение

Package 177 добавляет отдельный pipeline/readiness слой для еженедельных и месячных гороскопов.

Дневные гороскопы остаются без изменений. Еженедельные и месячные тексты не заменяют daily pipeline и не используют daily ledger keys.

## Расписание

Еженедельные гороскопы публикуются в воскресенье на новую неделю.

- publish day: воскресенье
- target period: следующая неделя
- если публикация идёт в воскресенье, `weekStart` - следующий понедельник
- `weekEnd` - следующее воскресенье
- текст говорит `прогноз на неделю` / `прогноз на новую неделю`

Пример:

```text
Дата запуска: 2026-06-28
Целевой период: 2026-06-29 - 2026-07-05
weekKey: 2026-W27
```

Месячные гороскопы после 20 числа готовятся/публикуются на следующий месяц.

- после 20 числа текущего месяца target period - следующий календарный месяц
- текст говорит `прогноз на июль`, `прогноз на август` и так далее
- monthly не описывает текущий месяц, если день месяца >= 20

Примеры:

```text
2026-06-20 -> 2026-07
2026-06-21 -> 2026-07
2026-06-30 -> 2026-07
2026-07-20 -> 2026-08
```

Первый месячный период: июль 2026.

July monthly forecasts can be generated now.

## Helper functions

Weekly:

```ts
getUpcomingWeeklyHoroscopePeriod(date: Date): {
  weekKey: string;
  weekStart: string;
  weekEnd: string;
  label: string;
};
```

Monthly:

```ts
getNextMonthlyHoroscopePeriodAfter20(date: Date): {
  monthKey: string;
  monthLabel: string;
  year: number;
  month: number;
};
```

## Ledger keys

Daily ledger keys remain unchanged:

```text
2026-06-26:aries
2026-06-26:zodiac-general
```

Weekly ledger keys include target week, not generation date:

```text
zodiac:weekly:2026-W27:aries
zodiac:weekly:2026-W27:general
```

Monthly ledger keys include target month, not generation date:

```text
zodiac:monthly:2026-07:aries
zodiac:monthly:2026-07:general
```

## Weekly sections

Еженедельный пост содержит:

- Главная тема недели
- Любовь
- Работа/дела
- Энергия
- Дни силы
- Зона внимания
- Совет недели
- CTA в Mini App

General channel weekly post summarises all signs and leads to Mini App.

## Monthly sections

Месячный пост содержит:

- Главная энергия месяца
- Любовь и отношения
- Работа и деньги
- Личная сила
- Зона внимания
- Лучшие дни месяца
- Совет месяца
- CTA в Mini App

General channel monthly post summarises all signs and leads to Mini App.

## Preview

Июльский preview:

```powershell
node --experimental-strip-types scripts/generate-zodiac-monthly-preview.mjs --date 2026-06-26 --month 2026-07 --json
```

Preview безопасен:

- dry-run by default
- Telegram API calls: 0
- ledger writes: 0
- expected posts: 13
- no payment/VIP/entitlement changes
- no DB schema/migration changes

## Live scheduling

Daily workflow remains unchanged.

Weekly live scripts already existed before Package 177. Package 177 only aligns weekly ledger key format with target-period keys.

Monthly live scheduler/workflow is not enabled in Package 177. Monthly readiness is implemented as deterministic generator + dry-run preview + QA.

No `.github/workflows` changes were made.

## QA

```powershell
node --experimental-strip-types scripts/qa-zodiac-weekly-monthly-horoscopes.mjs
```

QA проверяет:

- daily pipeline exists
- daily ledger key remains unchanged
- Sunday weekly generation targets following Monday-Sunday period
- non-Sunday auto weekly run is blocked unless manual preview
- July 2026 monthly generation works now
- 2026-06-20 / 2026-06-21 / 2026-06-30 target July 2026
- 2026-07-20 targets August 2026
- 13 weekly posts are generated
- 13 monthly posts are generated
- weekly/monthly sections are present
- weekly/monthly copy differs from daily
- signs have different weekly/monthly copy
- ledger keys are separated daily/weekly/monthly
- no duplicate post keys
- no Telegram API direct call added
- no payment/VIP/entitlement changes
- no DB schema/migration changes
- no workflow changes

## Boundaries

Package 177 does not change:

- real payments
- Telegram Stars
- invoice sending
- pre_checkout
- successful_payment
- payment ledger write
- entitlement creation
- VIP unlock
- DB schema
- migrations
- direct Telegram API calls
- active payment CTA
- unrelated Mini App VIP logic

Daily automation remains unblocked.

## Next

Следующий рекомендуемый пакет: Package 178 - First Paid MVP Readiness Review.

Package 178 не начинается автоматически.
