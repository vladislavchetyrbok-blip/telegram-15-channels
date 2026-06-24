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
  return dateIso >= MIN_BIRTH_DATE_ISO && dateIso <= getTodayIsoDate();
}
