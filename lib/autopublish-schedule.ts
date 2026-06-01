export const twiceWeeklyAutopublishDefaults = {
  enabled: true,
  daysOfWeek: [2, 5],
  dayLabels: ["Tuesday", "Friday"],
  time: "11:00",
  timezone: "Europe/Kyiv",
};

const weekdayToNumber: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export interface TwiceWeeklyAutopublishSchedule {
  enabled: boolean;
  daysOfWeek: number[];
  dayLabels: string[];
  time: string;
  timezone: string;
}

export function getTwiceWeeklyAutopublishSchedule(): TwiceWeeklyAutopublishSchedule {
  const days = parseDays(process.env.AUTOPUBLISH_DAYS) ?? twiceWeeklyAutopublishDefaults.daysOfWeek;
  const time = isValidTime(process.env.AUTOPUBLISH_TIME) ? process.env.AUTOPUBLISH_TIME : twiceWeeklyAutopublishDefaults.time;

  return {
    enabled: process.env.AUTOPUBLISH_WEEKLY_ENABLED !== "false",
    daysOfWeek: days,
    dayLabels: days.map(dayLabel),
    time,
    timezone: process.env.AUTOPUBLISH_TIMEZONE || twiceWeeklyAutopublishDefaults.timezone,
  };
}

export function getZonedNow(date: Date, timezone: string) {
  const parts = getZonedParts(date, timezone);

  return {
    ...parts,
    dayOfWeek: weekdayToNumber[parts.weekday] ?? date.getUTCDay(),
    dateKey: `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`,
    minutesSinceMidnight: parts.hour * 60 + parts.minute,
  };
}

export function isScheduledAutopublishDue(date: Date, schedule = getTwiceWeeklyAutopublishSchedule()) {
  const zoned = getZonedNow(date, schedule.timezone);
  const scheduledMinutes = timeToMinutes(schedule.time);
  const scheduledDay = schedule.daysOfWeek.includes(zoned.dayOfWeek);

  return {
    due: schedule.enabled && scheduledDay && zoned.minutesSinceMidnight >= scheduledMinutes,
    enabled: schedule.enabled,
    scheduledDay,
    beforeScheduledTime: scheduledDay && zoned.minutesSinceMidnight < scheduledMinutes,
    dateKey: zoned.dateKey,
    dayOfWeek: zoned.dayOfWeek,
    scheduledAt: zonedDateTimeToUtcIso(zoned.dateKey, schedule.time, schedule.timezone),
  };
}

export function dayLabel(day: number) {
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][day] ?? `Day ${day}`;
}

function parseDays(value: string | undefined) {
  if (!value?.trim()) return null;
  const days = value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isInteger(item) && item >= 0 && item <= 6);

  return days.length ? Array.from(new Set(days)) : null;
}

function isValidTime(value: string | undefined): value is string {
  return Boolean(value && /^([01]\d|2[0-3]):[0-5]\d$/.test(value));
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

function getZonedParts(date: Date, timezone: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).map((part) => [part.type, part.value]));

  return {
    weekday: parts.weekday ?? "Sun",
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

export function zonedDateTimeToUtcIso(dateKey: string, time: string, timezone: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const guessParts = getZonedParts(utcGuess, timezone);
  const guessAsUtc = Date.UTC(guessParts.year, guessParts.month - 1, guessParts.day, guessParts.hour, guessParts.minute, 0);
  const targetAsUtc = Date.UTC(year, month - 1, day, hour, minute, 0);
  const offsetMs = guessAsUtc - utcGuess.getTime();

  return new Date(targetAsUtc - offsetMs).toISOString();
}
