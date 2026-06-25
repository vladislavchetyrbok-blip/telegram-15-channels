/**
 * Shared birth-date range helper (Package 140 — Natal Chart Date Picker Range Hotfix).
 *
 * Birth-date pickers must allow a real human birth range and block future dates:
 *   minimum: 1900-01-01
 *   maximum: today (local date)
 *
 * Local-only, deterministic, no I/O. Uses local date components (not UTC) so the
 * "today" maximum does not jump a day across timezones.
 */

export const MIN_BIRTH_DATE_ISO = "1900-01-01";

export interface ParsedBirthDateInput {
  ok: true;
  iso: string;
  display: string;
  day: number;
  month: number;
  year: number;
}

export interface InvalidBirthDateInput {
  ok: false;
  error: string;
}

export type BirthDateInputParseResult = ParsedBirthDateInput | InvalidBirthDateInput;

/** Today's date as a local-timezone ISO date string (YYYY-MM-DD). */
export function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Current year, useful for custom date pickers configured with fromYear/toYear. */
export function getCurrentYear(): number {
  return new Date().getFullYear();
}

/**
 * True when an ISO date (YYYY-MM-DD) is a valid birth date in the allowed range:
 * 1900-01-01 .. today inclusive. Future dates are rejected. ISO string ordering
 * is lexicographic and correct for the zero-padded YYYY-MM-DD format.
 */
export function isBirthDateInAllowedRange(dateIso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateIso || "")) return false;

  const [year, month, day] = dateIso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return false;
  }

  return dateIso >= MIN_BIRTH_DATE_ISO && dateIso <= getTodayIsoDate();
}

export function parseBirthDateInput(
  value: string,
  options: { emptyError?: string; rangeError?: string } = {},
): BirthDateInputParseResult {
  const raw = String(value || "").trim();
  if (!raw) return { ok: false, error: options.emptyError ?? "Введите дату рождения." };

  const parts = parseBirthDateParts(raw);
  if (!parts) return { ok: false, error: "Введите дату в формате ДД.ММ.ГГГГ." };

  const parsed = validateBirthDateParts(parts.day, parts.month, parts.year);
  if (!parsed.ok) return parsed;

  if (!isBirthDateInAllowedRange(parsed.iso)) {
    return {
      ok: false,
      error: options.rangeError ?? "Дата рождения должна быть в диапазоне 1900 — сегодня.",
    };
  }

  return parsed;
}

export function birthDateInputToIsoDate(value: string): string | null {
  const parsed = parseBirthDateInput(value, { emptyError: "" });
  return parsed.ok ? parsed.iso : null;
}

function parseBirthDateParts(value: string): { day: number; month: number; year: number } | null {
  const iso = value.match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})$/);
  if (iso) return { year: Number(iso[1]), month: Number(iso[2]), day: Number(iso[3]) };

  const display = value.match(/^(\d{1,2})[-./](\d{1,2})[-./](\d{2}|\d{4})$/);
  if (display) {
    const yearRaw = Number(display[3]);
    return {
      day: Number(display[1]),
      month: Number(display[2]),
      year: display[3].length === 2 ? expandTwoDigitBirthYear(yearRaw) : yearRaw,
    };
  }

  const digits = value.replace(/\D/g, "");
  if (digits.length === 6) {
    return {
      day: Number(digits.slice(0, 2)),
      month: Number(digits.slice(2, 4)),
      year: expandTwoDigitBirthYear(Number(digits.slice(4, 6))),
    };
  }

  if (digits.length === 8) {
    const dayFirst = validateBirthDateParts(
      Number(digits.slice(0, 2)),
      Number(digits.slice(2, 4)),
      Number(digits.slice(4, 8)),
      false,
    );
    if (dayFirst.ok) return { day: dayFirst.day, month: dayFirst.month, year: dayFirst.year };

    return {
      day: Number(digits.slice(6, 8)),
      month: Number(digits.slice(4, 6)),
      year: Number(digits.slice(0, 4)),
    };
  }

  return null;
}

function expandTwoDigitBirthYear(year: number) {
  return year <= 29 ? 2000 + year : 1900 + year;
}

function validateBirthDateParts(
  day: number,
  month: number,
  year: number,
  includeSpecificError = true,
): BirthDateInputParseResult {
  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
    return { ok: false, error: "Введите дату в формате ДД.ММ.ГГГГ." };
  }
  if (year < 1) return { ok: false, error: "Проверьте год." };
  if (month < 1 || month > 12) return { ok: false, error: includeSpecificError ? "Проверьте месяц." : "Введите дату в формате ДД.ММ.ГГГГ." };
  if (day < 1 || day > 31) return { ok: false, error: includeSpecificError ? "Проверьте день." : "Введите дату в формате ДД.ММ.ГГГГ." };

  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return { ok: false, error: "Такой даты не существует." };
  }

  const display = `${String(day).padStart(2, "0")}.${String(month).padStart(2, "0")}.${year}`;
  const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  return { ok: true, iso, display, day, month, year };
}
