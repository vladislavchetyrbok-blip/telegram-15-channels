import fs from "fs";
import path from "path";
import { resolveZodiacWeeklyVisualAsset } from "../zodiac-weekly-asset-resolver.mjs";

export const ZODIAC_SLUGS = [
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

export const CHANNEL_TARGET_ENV_BY_SLUG = {
  "zodiac-general": "ZODIAC_GENERAL_CHANNEL_ID",
  aries: "ZODIAC_ARIES_CHANNEL_ID",
  taurus: "ZODIAC_TAURUS_CHANNEL_ID",
  gemini: "ZODIAC_GEMINI_CHANNEL_ID",
  cancer: "ZODIAC_CANCER_CHANNEL_ID",
  leo: "ZODIAC_LEO_CHANNEL_ID",
  virgo: "ZODIAC_VIRGO_CHANNEL_ID",
  libra: "ZODIAC_LIBRA_CHANNEL_ID",
  scorpio: "ZODIAC_SCORPIO_CHANNEL_ID",
  sagittarius: "ZODIAC_SAGITTARIUS_CHANNEL_ID",
  capricorn: "ZODIAC_CAPRICORN_CHANNEL_ID",
  aquarius: "ZODIAC_AQUARIUS_CHANNEL_ID",
  pisces: "ZODIAC_PISCES_CHANNEL_ID",
};

export const RUNTIME_DIR = path.resolve(process.cwd(), "data", "runtime");
export const STATE_DIR = path.resolve(process.cwd(), "data", "state");
export const LEDGER_PATH = path.join(STATE_DIR, "zodiac-publish-ledger.json");
export const LEGACY_LEDGER_PATH = path.join(RUNTIME_DIR, "zodiac-publish-ledger.json");
export const KYIV_TIME_ZONE = "Europe/Kyiv";
const ACTIVE_LOCK_STATUSES = new Set(["pending", "locked", "in_progress", "publishing"]);
const SENT_STATUSES = new Set(["sent", "published"]);
const DUPLICATE_PROTECTED_STATUSES = new Set(["sent", "published", "pending", "locked", "in_progress", "publishing"]);

export function getPublishKey(date, slug) {
  return `${date}:${slug}`;
}

export function validateIsoDate(value, label = "--date") {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) {
    return { ok: false, error: `Missing ${label} YYYY-MM-DD` };
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  const valid =
    !Number.isNaN(parsed.getTime()) &&
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day;

  return valid ? { ok: true, error: null } : { ok: false, error: `Invalid ${label} value: ${value}` };
}

export function addDays(dateString, offset) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + offset));
  return date.toISOString().slice(0, 10);
}

export function getKyivDate(offsetDays = 0) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: KYIV_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return addDays(`${values.year}-${values.month}-${values.day}`, offsetDays);
}

export function readLedgerReadOnly() {
  const ledgerPath = fs.existsSync(LEDGER_PATH) ? LEDGER_PATH : LEGACY_LEDGER_PATH;
  if (!fs.existsSync(ledgerPath)) {
    return { entries: {}, warning: "Ledger file not found; treating ledger as empty." };
  }

  const parsed = JSON.parse(fs.readFileSync(ledgerPath, "utf8"));
  return {
    entries: parsed && typeof parsed.entries === "object" && parsed.entries !== null ? parsed.entries : {},
    warning: ledgerPath === LEGACY_LEDGER_PATH ? "Using legacy runtime ledger; tracked durable ledger is missing." : null,
  };
}

export function readLedgerForWrite() {
  if (!fs.existsSync(STATE_DIR)) {
    fs.mkdirSync(STATE_DIR, { recursive: true });
  }
  if (!fs.existsSync(LEDGER_PATH)) {
    return { entries: {} };
  }

  const parsed = JSON.parse(fs.readFileSync(LEDGER_PATH, "utf8"));
  return parsed && typeof parsed.entries === "object" && parsed.entries !== null ? parsed : { entries: {} };
}

export function writeLedger(ledger) {
  if (!fs.existsSync(STATE_DIR)) {
    fs.mkdirSync(STATE_DIR, { recursive: true });
  }
  fs.writeFileSync(LEDGER_PATH, `${JSON.stringify(ledger, null, 2)}\n`, "utf8");
}

export function normalizeStatus(status) {
  return String(status || "").trim().toLowerCase();
}

export function normalizeMediaMode(mediaMode) {
  const normalized = String(mediaMode || "").trim().toLowerCase();
  if (normalized === "textonly" || normalized === "text-only") return "text_only";
  return normalized;
}

export function getLedgerEntry(entries, date, slug) {
  return entries[getPublishKey(date, slug)] ?? Object.values(entries).find((entry) => entry?.date === date && entry?.slug === slug) ?? null;
}

export function summarizeDate(entries, date) {
  const rows = ZODIAC_SLUGS.map((slug) => {
    const entry = getLedgerEntry(entries, date, slug);
    const asset = resolveZodiacWeeklyVisualAsset(slug, date, "weekly");
    const plannedMediaMode = asset.path ? "image" : "text_only";
    return {
      slug,
      key: getPublishKey(date, slug),
      status: normalizeStatus(entry?.status) || "missing",
      mediaMode: normalizeMediaMode(entry?.mediaMode) || plannedMediaMode,
      mediaSource: entry?.mediaMode ? "ledger" : asset.source,
      fallback: Boolean(asset.fallback),
      suppressed: Boolean(asset.suppressed),
      suppressionReason: asset.suppressionReason ?? null,
      hasLedgerEntry: Boolean(entry),
      updatedAt: entry?.updatedAt ?? null,
    };
  });

  return {
    date,
    expectedCount: ZODIAC_SLUGS.length,
    sentCount: rows.filter((row) => SENT_STATUSES.has(row.status)).length,
    failedCount: rows.filter((row) => row.status === "failed").length,
    pendingCount: rows.filter((row) => ACTIVE_LOCK_STATUSES.has(row.status)).length,
    lockedInProgressCount: rows.filter((row) => ACTIVE_LOCK_STATUSES.has(row.status)).length,
    skippedCount: rows.filter((row) => row.status === "missing" || row.status === "skipped").length,
    imageCount: rows.filter((row) => row.mediaMode === "image").length,
    textOnlyCount: rows.filter((row) => row.mediaMode === "text_only").length,
    fallbackCount: rows.filter((row) => row.mediaMode === "text_only").length,
    duplicateBlockedCount: rows.filter((row) => DUPLICATE_PROTECTED_STATUSES.has(row.status)).length,
    perChannel: rows,
  };
}

export function summarizeLedger(entries) {
  const rows = Object.entries(entries).map(([key, entry]) => ({ key, ...entry }));
  return {
    totalEntries: rows.length,
    sentCount: rows.filter((row) => SENT_STATUSES.has(normalizeStatus(row.status))).length,
    pendingCount: rows.filter((row) => ACTIVE_LOCK_STATUSES.has(normalizeStatus(row.status))).length,
    failedCount: rows.filter((row) => normalizeStatus(row.status) === "failed").length,
    datesCovered: Array.from(new Set(rows.map((row) => row.date).filter(Boolean))).sort(),
    slugsCovered: Array.from(new Set(rows.map((row) => row.slug).filter(Boolean))).sort(),
  };
}

export function findStalePending(entries, staleMinutes, now = new Date()) {
  const cutoffMs = now.getTime() - staleMinutes * 60 * 1000;
  return Object.entries(entries)
    .map(([key, entry]) => ({ key, ...entry }))
    .filter((entry) => ACTIVE_LOCK_STATUSES.has(normalizeStatus(entry.status)))
    .filter((entry) => {
      const time = Date.parse(entry.updatedAt ?? entry.createdAt ?? "");
      return Number.isNaN(time) || time <= cutoffMs;
    })
    .sort((left, right) => left.key.localeCompare(right.key));
}

export function loadLocalEnvFiles() {
  for (const file of [".env.local", ".env"]) {
    try {
      process.loadEnvFile(file);
    } catch {
      // Optional local files. Never print values.
    }
  }
}
