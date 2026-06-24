# Package 140 — Natal Chart Date Picker Range Hotfix

## Summary

Package 140 fixes the **VIP natal chart / birth chart birth date picker range**. The birth date
picker previously did not reliably allow real birth years (e.g. 1990, 1998, 1985) and allowed
future dates. It now accepts a full human birth range and blocks future dates.

## Fix

- Minimum birth date is **`1900-01-01`**.
- Maximum birth date is **today / the current date** (computed in local time to avoid timezone
  off-by-one).
- The native birth date input (`app/birth-matrix/BirthMatrixClient.tsx`) now sets
  `min={MIN_BIRTH_DATE_ISO}` and `max={todayIso}`.
- Selected year / month / day are preserved correctly (the input value is unchanged; only the
  allowed range is constrained).

Dates verified as supported: `1990-01-01`, `1998-06-15`, `1985-12-31`, `2000-01-01`, `1900-01-01`.
Future birth dates are blocked.

## Files

- `lib/zodiac-birth-date-range.ts` — small local helper: `MIN_BIRTH_DATE_ISO`, `getTodayIsoDate()`,
  `getCurrentYear()`, `isBirthDateInAllowedRange()`. Local-only, deterministic, no I/O.
- `app/birth-matrix/BirthMatrixClient.tsx` — birth date input now uses `min` / `max`.
- `scripts/qa-zodiac-natal-chart-date-picker-range.mjs` — QA (19 checks).
- `docs/aphrodite-package-reports/package-140.md` — this report.

## Boundaries

- No payment implemented.
- No real VIP access implemented.
- No Telegram API used.
- No database schema changed.
- No active Telegram CTA logic changed.
- No cron / workflow / publish scripts changed.

Daily / weekly automation remains **unblocked**. Manual Review remains **UI / read-only**.

## Next package

**Package 141 — Social Traffic Layer Architecture.**
