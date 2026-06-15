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
const MEDIA_SUPPRESSION_CONFIG_PATH = path.resolve(process.cwd(), "data", "config", "zodiac-media-suppression.json");
const DEFAULT_SUPPRESSION_REASON = "visual_quality_no_go_pending_replacement";

let cachedMediaSuppressionConfig = null;

function normalizeSuppressionPath(value) {
  return String(value || "").trim().replace(/\\/g, "/").replace(/^\/+/, "");
}

function readMediaSuppressionConfig() {
  if (cachedMediaSuppressionConfig !== null) {
    return cachedMediaSuppressionConfig;
  }

  if (!fs.existsSync(MEDIA_SUPPRESSION_CONFIG_PATH)) {
    cachedMediaSuppressionConfig = { enabled: false, weeklySuppressedSlugs: [], weeklySuppressedPaths: [] };
    return cachedMediaSuppressionConfig;
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(MEDIA_SUPPRESSION_CONFIG_PATH, "utf8"));
    cachedMediaSuppressionConfig = {
      enabled: parsed.enabled !== false,
      reason: String(parsed.reason || DEFAULT_SUPPRESSION_REASON).trim() || DEFAULT_SUPPRESSION_REASON,
      weeklySuppressedSlugs: Array.isArray(parsed.weeklySuppressedSlugs)
        ? parsed.weeklySuppressedSlugs.map((slug) => String(slug).trim()).filter(Boolean)
        : [],
      weeklySuppressedPaths: Array.isArray(parsed.weeklySuppressedPaths)
        ? parsed.weeklySuppressedPaths.map(normalizeSuppressionPath).filter(Boolean)
        : [],
    };
  } catch {
    cachedMediaSuppressionConfig = { enabled: false, weeklySuppressedSlugs: [], weeklySuppressedPaths: [] };
  }

  return cachedMediaSuppressionConfig;
}

export function getZodiacWeeklyMediaSuppression(channelId, expectedRelativePath) {
  const config = readMediaSuppressionConfig();
  if (!config.enabled) {
    return { suppressed: false, reason: null };
  }

  const normalizedRelative = normalizeSuppressionPath(expectedRelativePath);
  const suppressed =
    config.weeklySuppressedSlugs.includes(channelId) ||
    config.weeklySuppressedPaths.includes(normalizedRelative);

  return {
    suppressed,
    reason: suppressed ? config.reason : null,
  };
}

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

  const suppression = getZodiacWeeklyMediaSuppression(channelId, expected.relative);
  if (suppression.suppressed) {
    return {
      ok: true,
      path: null,
      relative: null,
      weekday: expected.weekday,
      source: "suppressed",
      fallback: true,
      suppressed: true,
      suppressionReason: suppression.reason,
      expectedWeeklyPath: expected.path,
      warning: `Weekly zodiac asset suppressed (${suppression.reason}). Using text-only mode. Expected: ${expected.path}`,
      error: null,
    };
  }

  if (fs.existsSync(expected.path) && fs.statSync(expected.path).isFile()) {
    return {
      ok: true,
      path: expected.path,
      relative: expected.relative,
      weekday: expected.weekday,
      source: "weekly",
      fallback: false,
      suppressed: false,
      suppressionReason: null,
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
    suppressed: false,
    suppressionReason: null,
    expectedWeeklyPath: expected.path,
    warning: `Weekly zodiac asset missing. Falling back to text-only mode. Expected: ${expected.path}`,
    error: null,
  };
}
