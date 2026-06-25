# Package 147 — Global Birth Date Inputs Audit & Hotfix

> Numbering note: the Public Bot Profile / Main Mini App Launch Packaging already shipped as
> Package 146 (commit c123819, on origin/main). Per owner decision, this birth-date audit/hotfix is
> numbered **Package 147** and the launch packaging is left untouched as 146.

## Summary

Package 147 audits **every birth-date input across the project** and guarantees the same rule
everywhere: minimum `1900-01-01`, maximum today, no future birth dates, and real birth years
(1990, 1998, 1985, 2000, 1900) selectable.

## Audit findings

Birth-date inputs found and classified:

- **Native date picker — `app/birth-matrix/BirthMatrixClient.tsx`** (the "Birth Matrix / Matrix of
  Destiny" page at `/birth-matrix`): already has `min={MIN_BIRTH_DATE_ISO}` and `max={todayIso}`
  from the earlier fix. Old years selectable, future blocked. **Already safe — no change.**
- **Matrix of Destiny feature parser — `lib/zodiac-mystic-content.ts` (`parseBirthMatrixDate`)**:
  the in-app "Матрица судьбы" uses the `ZodiacDateInput` text field; the parser accepted
  1900–2099 (old years already fine) but did not block future dates. **Fixed:** now also rejects
  future dates via `isBirthDateInAllowedRange`.
- **Mini App natal + compatibility parser — `components/ZodiacCompatibilityMiniApp.tsx`
  (`parseBirthDate`)**: covers the VIP natal chart and compatibility birth dates (text field,
  1900–2100, old years already fine). **Fixed:** now also rejects future birth dates.

Non-birth date inputs (excluded, with reason):

- `components/ContentPlanPanel.tsx`, `components/PublicationSchedulePanel.tsx`,
  `components/ZodiacDailyPreviewPanel.tsx`, `components/ZodiacWeeklyPreviewPanel.tsx`,
  `components/zodiac-platform/ManualPostDraftBuilder.tsx` — content/publication/preview/post
  scheduling dates, not birth dates.
- `app/affirmations/AffirmationsClient.tsx`, `app/mystic-numbers/MysticNumbersClient.tsx`,
  `app/vip-compatibility-report/VipCompatibilityReportClient.tsx` — `<select>` dropdowns are zodiac
  sign / mood pickers, plus name/number text fields; no birth-date field.
- `lib/zodiac-date-input.ts` (shared `parseDateInput`) — intentionally left generic (1900–2100)
  because it is also used for a non-birth **daily** date in `ZodiacVipSections`. Future blocking is
  applied only in the birth-specific parsers, so the daily date navigation is unaffected.

No hardcoded `2020` year restriction was found in any birth-date picker code.

## Shared helper

`lib/zodiac-birth-date-range.ts` already exposes `MIN_BIRTH_DATE_ISO`, `getTodayIsoDate()`
(local-timezone), `getCurrentYear()`, and `isBirthDateInAllowedRange()`. Reused as-is — no new
date library added.

## Boundaries

- Minimum birth date: 1900-01-01.
- Maximum birth date: today / current date.
- Dates 1990-01-01, 1998-06-15, 1985-12-31, 2000-01-01, 1900-01-01 are supported.
- Future birth dates are blocked.
- No payment implemented.
- No real VIP access implemented.
- No Telegram API used.
- No database schema changed.
- No active Telegram CTA logic changed.
- No cron / workflow / publish scripts changed.

Daily / weekly automation remains **unblocked**. Manual Review remains UI / read-only.

## Next package

**Package 148 — Mini App First Screen Real Integration** (the public bot launch packaging already
shipped as Package 146).
