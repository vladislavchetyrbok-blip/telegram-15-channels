# Package 177 - Weekly & Monthly Horoscope Pipeline

## Status

Package 177 adds deterministic readiness for weekly and monthly Zodiac horoscope generation.

This package is not a paywall package and not a payments package.

## Schedule clarification

Еженедельные гороскопы публикуются в воскресенье на новую неделю.

Месячные гороскопы после 20 числа готовятся/публикуются на следующий месяц.

Первый месячный период: июль 2026.

## Weekly behavior

Weekly generation targets the upcoming Monday-Sunday week.

Example:

```text
Run date: 2026-06-28
Target week: 2026-06-29 - 2026-07-05
weekKey: 2026-W27
```

Automatic weekly publishing is allowed only on Sunday. A non-Sunday date is blocked unless the caller explicitly uses manual preview mode.

Weekly content says `прогноз на неделю` / `на новую неделю` and includes:

- `weekKey`
- `weekStart`
- `weekEnd`
- a stable label for the target period

## Monthly behavior

Monthly generation after day 20 targets the next calendar month, not the current month.

Confirmed targets:

```text
2026-06-20 -> 2026-07
2026-06-21 -> 2026-07
2026-06-30 -> 2026-07
2026-07-20 -> 2026-08
```

July 2026 monthly forecasts are available now through the preview generator.

Monthly content says `прогноз на июль`, `прогноз на август`, and so on. It does not describe the current month when the run date is day 20 or later.

## Helpers

Added weekly helper:

```ts
getUpcomingWeeklyHoroscopePeriod(date: Date): {
  weekKey: string;
  weekStart: string;
  weekEnd: string;
  label: string;
};
```

Added monthly helper:

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

Weekly ledger keys include the target week, not the generation date:

```text
zodiac:weekly:2026-W27:aries
zodiac:weekly:2026-W27:general
```

Monthly ledger keys include the target month, not the generation date:

```text
zodiac:monthly:2026-07:aries
zodiac:monthly:2026-07:general
```

## Generated coverage

Weekly generation creates 13 posts:

- 12 zodiac signs
- general Zodiac channel

Monthly generation creates 13 posts:

- 12 zodiac signs
- general Zodiac channel

General-channel weekly/monthly posts summarize all signs and lead users back to Mini App.

## Files changed

- `lib/zodiac-weekly-horoscope.ts`
- `lib/zodiac-monthly-horoscope.ts`
- `scripts/generate-zodiac-monthly-preview.mjs`
- `scripts/qa-zodiac-weekly-monthly-horoscopes.mjs`
- `scripts/lib/zodiac-weekly-pipeline.mjs`
- `docs/zodiac-weekly-monthly-horoscopes.md`
- `docs/aphrodite-package-reports/package-177.md`

## QA

Required QA command:

```powershell
node --experimental-strip-types scripts/qa-zodiac-weekly-monthly-horoscopes.mjs
```

QA covers:

- Sunday weekly generation targets the following Monday-Sunday week.
- Non-Sunday automatic weekly generation is blocked unless manual preview mode is used.
- `2026-06-20`, `2026-06-21`, and `2026-06-30` target July 2026 monthly forecast.
- `2026-07-20` targets August 2026 monthly forecast.
- Monthly target is next month after the 20th.
- Weekly and monthly ledger keys include target period, not generation date.
- Daily ledger keys remain unchanged.
- Weekly/monthly content differs from daily content.
- Sign-specific weekly/monthly posts are not identical to each other.
- Monthly July 2026 preview generates all 13 posts now.

## Safety boundaries

Real payment added: No.

Telegram Stars invoice added: No.

`sendInvoice` call added: No.

`createInvoiceLink` call added: No.

`pre_checkout_query` handler added: No.

`successful_payment` handler added: No.

Payment ledger write added: No.

Entitlement creation added: No.

Real VIP unlock added: No.

Database schema changed: No.

Migration added: No.

Telegram API changed: No.

Workflow or cron changed: No.

Bot sending logic changed: No.

Active Telegram CTA changed: No.

Daily pipeline remains unchanged and unblocked.

## Next

Recommended next package: Package 178 - First Paid MVP Readiness Review.

Package 178 is not started automatically.
