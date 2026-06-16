export const DEFAULT_ZODIAC_TIME_ZONE = "Europe/Kyiv";

type DateInput = Date | string | number;

export function getCurrentZodiacDateKey(timeZone = DEFAULT_ZODIAC_TIME_ZONE, now: DateInput = new Date()) {
  const date = coerceDate(now);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values: Record<string, string> = {};

  for (const part of parts) {
    if (part.type !== "literal") values[part.type] = part.value;
  }

  return `${values.year}-${values.month}-${values.day}`;
}

export function formatZodiacDisplayDate(dateKey: string, locale = "ru") {
  return parseDateKeyToUtcDate(dateKey).toLocaleDateString(normalizeLocale(locale), {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
  });
}

export function getWeekRangeForDate(dateKey: string, timeZone = DEFAULT_ZODIAC_TIME_ZONE) {
  assertValidTimeZone(timeZone);
  const date = parseDateKeyToUtcDate(dateKey);
  const dayOfWeek = date.getUTCDay() || 7;
  const startDateKey = addDaysToDateKey(dateKey, 1 - dayOfWeek);
  const endDateKey = addDaysToDateKey(startDateKey, 6);

  return { startDateKey, endDateKey };
}

export function getLuckyDaysStartDate(dateKey: string) {
  parseDateKeyToUtcDate(dateKey);
  return dateKey;
}

export function addDaysToDateKey(dateKey: string, days: number) {
  const date = parseDateKeyToUtcDate(dateKey);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function coerceDate(value: DateInput) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid date: ${String(value)}`);
  return date;
}

function parseDateKeyToUtcDate(dateKey: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) throw new Error(`Invalid date key: ${dateKey}`);

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new Error(`Invalid date key: ${dateKey}`);
  }

  return date;
}

function assertValidTimeZone(timeZone: string) {
  new Intl.DateTimeFormat("en-US", { timeZone }).format(new Date(0));
}

function normalizeLocale(locale: string) {
  return locale === "ru" ? "ru-RU" : locale;
}
