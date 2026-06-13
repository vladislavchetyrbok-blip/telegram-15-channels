import fs from "fs";
import path from "path";
import process from "process";
import { getZodiacVisualAsset } from "./zodiac-asset-resolver.mjs";

export const ZODIAC_WEEKLY_CHANNELS = [
  "zodiac-general",
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
];

export const ZODIAC_WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const WEEKDAY_BY_UTC_INDEX = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export function getWeekdayFromDate(dateString) {
  const date = new Date(`${dateString}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return { ok: false, weekday: null, error: `Invalid date for zodiac weekly asset: ${dateString}` };
  }

  return { ok: true, weekday: WEEKDAY_BY_UTC_INDEX[date.getUTCDay()], error: null };
}

export function getZodiacWeeklyAssetExpectedPath(channelId, dateString) {
  if (!ZODIAC_WEEKLY_CHANNELS.includes(channelId)) {
    return { ok: false, path: null, relative: null, weekday: null, error: `Unknown zodiac channel: ${channelId}` };
  }

  const weekdayResult = getWeekdayFromDate(dateString);
  if (!weekdayResult.ok) {
    return { ok: false, path: null, relative: null, weekday: null, error: weekdayResult.error };
  }

  const relative = `/assets/zodiac-weekly/${channelId}/${weekdayResult.weekday}.jpg`;
  return {
    ok: true,
    path: path.join(process.cwd(), "public", "assets", "zodiac-weekly", channelId, `${weekdayResult.weekday}.jpg`),
    relative,
    weekday: weekdayResult.weekday,
    error: null,
  };
}

export function resolveZodiacWeeklyVisualAsset(channelId, dateString, fallbackAssetType = "daily") {
  const expected = getZodiacWeeklyAssetExpectedPath(channelId, dateString);
  if (!expected.ok) {
    return expected;
  }

  if (fs.existsSync(expected.path) && fs.statSync(expected.path).isFile()) {
    return {
      ok: true,
      path: expected.path,
      relative: expected.relative,
      weekday: expected.weekday,
      source: "weekly",
      fallback: false,
      warning: null,
      error: null,
    };
  }

  // Safety patch: disable fallback images and enforce text-only mode
  return {
    ok: true,
    path: null,
    relative: null,
    weekday: expected.weekday,
    source: "none",
    fallback: true,
    expectedWeeklyPath: expected.path,
    warning: `Weekly zodiac asset missing. Falling back to text-only mode. Expected: ${expected.path}`,
    error: null,
  };
}
