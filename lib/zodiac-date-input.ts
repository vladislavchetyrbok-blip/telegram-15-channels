export interface ParsedDateInput {
  ok: true;
  iso: string;
  display: string;
  day: number;
  month: number;
  year: number;
}

export interface InvalidDateInput {
  ok: false;
  error: string;
}

export type DateInputParseResult = ParsedDateInput | InvalidDateInput;

const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

export function formatDateInput(value: string) {
  const raw = String(value || "").trim();
  const parsed = parseDateInput(raw, { emptyError: "" });
  if (parsed.ok) return parsed.display;

  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
}

export function normalizeDateInput(value: string) {
  const parsed = parseDateInput(value, { emptyError: "" });
  return parsed.ok ? parsed.display : formatDateInput(value);
}

export function parseDateInput(value: string, options: { emptyError?: string } = {}): DateInputParseResult {
  const raw = String(value || "").trim();
  if (!raw) return { ok: false, error: options.emptyError ?? "Введите дату в формате ДД.ММ.ГГГГ." };

  const separated = parseSeparatedDate(raw);
  if (separated) return validateDateParts(separated.day, separated.month, separated.year);

  const digits = raw.replace(/\D/g, "");
  if (digits.length === 6) {
    const day = Number(digits.slice(0, 2));
    const month = Number(digits.slice(2, 4));
    const year = expandTwoDigitYear(Number(digits.slice(4, 6)));
    return validateDateParts(day, month, year);
  }

  if (digits.length === 8) {
    const displayFirst = validateDateParts(
      Number(digits.slice(0, 2)),
      Number(digits.slice(2, 4)),
      Number(digits.slice(4, 8)),
      false,
    );
    if (displayFirst.ok) return displayFirst;

    return validateDateParts(
      Number(digits.slice(6, 8)),
      Number(digits.slice(4, 6)),
      Number(digits.slice(0, 4)),
    );
  }

  return { ok: false, error: "Введите дату в формате ДД.ММ.ГГГГ." };
}

export function dateInputToIsoDate(value: string) {
  const parsed = parseDateInput(value, { emptyError: "" });
  return parsed.ok ? parsed.iso : null;
}

export function isoDateToDateInput(value: string) {
  const parsed = parseDateInput(value, { emptyError: "" });
  return parsed.ok ? parsed.display : "";
}

function parseSeparatedDate(value: string): { day: number; month: number; year: number } | null {
  const iso = value.match(/^(\d{4})[-./](\d{1,2})[-./](\d{1,2})$/);
  if (iso) {
    return { year: Number(iso[1]), month: Number(iso[2]), day: Number(iso[3]) };
  }

  const display = value.match(/^(\d{1,2})[-./](\d{1,2})[-./](\d{2}|\d{4})$/);
  if (!display) return null;
  const yearRaw = Number(display[3]);
  return {
    day: Number(display[1]),
    month: Number(display[2]),
    year: display[3].length === 2 ? expandTwoDigitYear(yearRaw) : yearRaw,
  };
}

function expandTwoDigitYear(year: number) {
  // 00-29 reads as 2000-2029, 30-99 reads as 1930-1999.
  return year <= 29 ? 2000 + year : 1900 + year;
}

function validateDateParts(day: number, month: number, year: number, includeSpecificError = true): DateInputParseResult {
  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
    return { ok: false, error: "Введите дату в формате ДД.ММ.ГГГГ." };
  }
  if (year < MIN_YEAR || year > MAX_YEAR) return { ok: false, error: "Проверьте год." };
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
