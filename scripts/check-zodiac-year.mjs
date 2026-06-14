import fs from "fs";
import path from "path";
import process from "process";
import { resolveZodiacWeeklyVisualAsset } from "./zodiac-weekly-asset-resolver.mjs";

try {
  process.loadEnvFile(".env.local");
} catch {
  // Environment files are optional. Missing channel targets are reported below.
}

const DEFAULT_DAYS = 365;
const KYIV_TIME_ZONE = "Europe/Kyiv";

const ZODIAC_SLUGS = [
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

const WEEKDAY_ORDER = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const CHANNEL_TARGET_ENV_BY_SLUG = {
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

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    from: null,
    days: DEFAULT_DAYS,
  };
  const errors = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--from") {
      options.from = args[++i] ?? null;
    } else if (arg === "--days") {
      options.days = args[++i] ?? null;
    } else {
      errors.push(`Unknown argument: ${arg}`);
    }
  }

  if (!options.from) {
    options.from = getTomorrowInKyiv();
  }

  return { options, errors };
}

function validateIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) {
    return { ok: false, error: "Expected --from in YYYY-MM-DD format." };
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return { ok: false, error: `Invalid calendar date: ${value}` };
  }

  return { ok: true, error: null };
}

function validateDays(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    return { ok: false, days: null, error: "--days must be a positive integer." };
  }

  return { ok: true, days: parsed, error: null };
}

function addDays(dateString, offset) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + offset));
  return date.toISOString().slice(0, 10);
}

function getTomorrowInKyiv() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: KYIV_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const today = `${values.year}-${values.month}-${values.day}`;
  return addDays(today, 1);
}

function createContentProbe(date, slug) {
  const signLabel = slug === "zodiac-general" ? "all zodiac signs" : slug;
  return {
    key: `${date}:${slug}`,
    title: `Zodiac preflight ${signLabel} ${date}`,
    text: `Read-only Zodiac preflight content probe for ${signLabel} on ${date}. This validates that autonomous planning can create non-empty text without publishing.`,
    visualPrompt: `Read-only Zodiac preflight visual prompt for ${signLabel} on ${date}.`,
  };
}

function validateContentProbe(probe, fatalErrors) {
  for (const field of ["key", "title", "text", "visualPrompt"]) {
    if (!String(probe[field] || "").trim()) {
      fatalErrors.push(`Empty content field ${field} for ${probe.key || "unknown key"}`);
    }
  }
}

function validatePlannerSource(fatalErrors, warnings) {
  const plannerPath = path.join(process.cwd(), "scripts", "generate-zodiac-plan.mjs");
  if (!fs.existsSync(plannerPath)) {
    fatalErrors.push("Content planner script is missing: scripts/generate-zodiac-plan.mjs");
    return { ok: false, mode: "missing" };
  }

  const source = fs.readFileSync(plannerPath, "utf8");
  if (!source.includes("function buildPost")) {
    fatalErrors.push("Content planner source does not expose expected buildPost implementation.");
  }
  if (!source.includes("text") || !source.includes("visualPrompt")) {
    fatalErrors.push("Content planner source does not contain required text/visualPrompt fields.");
  }

  const missingSlugs = ZODIAC_SLUGS.filter((slug) => !source.includes(`id: "${slug}"`));
  if (missingSlugs.length > 0) {
    fatalErrors.push(`Content planner source is missing slug definitions: ${missingSlugs.join(", ")}`);
  }

  return { ok: missingSlugs.length === 0, mode: "source_checked" };
}

function addMissingImage(grouped, slug, weekday) {
  if (!grouped[slug]) grouped[slug] = {};
  grouped[slug][weekday] = (grouped[slug][weekday] || 0) + 1;
}

function summarizeDay(date, rows) {
  return {
    date,
    total: rows.length,
    image: rows.filter((row) => row.mediaMode === "image").length,
    text_only: rows.filter((row) => row.mediaMode === "text_only").length,
    missingImageSlugs: rows.filter((row) => row.mediaMode === "text_only").map((row) => row.slug),
  };
}

function printGroupedMissingImages(grouped) {
  const slugs = Object.keys(grouped).sort((a, b) => ZODIAC_SLUGS.indexOf(a) - ZODIAC_SLUGS.indexOf(b));
  if (slugs.length === 0) {
    console.log("Missing Images By Slug : none");
    return;
  }

  console.log("Missing Images By Slug :");
  for (const slug of slugs) {
    const weekdays = Object.entries(grouped[slug])
      .sort(([a], [b]) => WEEKDAY_ORDER.indexOf(a) - WEEKDAY_ORDER.indexOf(b))
      .map(([weekday, count]) => `${weekday}=${count}`)
      .join(", ");
    console.log(`  - ${slug}: ${weekdays}`);
  }
}

function run() {
  const { options, errors: argErrors } = parseArgs();
  const fatalErrors = [...argErrors];
  const warnings = [];

  const dateValidation = validateIsoDate(options.from);
  if (!dateValidation.ok) fatalErrors.push(dateValidation.error);

  const daysValidation = validateDays(options.days);
  if (!daysValidation.ok) fatalErrors.push(daysValidation.error);

  const days = daysValidation.days ?? DEFAULT_DAYS;
  const from = options.from;
  const expectedPosts = days * ZODIAC_SLUGS.length;

  const plannerStatus = validatePlannerSource(fatalErrors, warnings);

  const missingTargetSlugs = ZODIAC_SLUGS.filter((slug) => {
    const envName = CHANNEL_TARGET_ENV_BY_SLUG[slug];
    return !envName || !String(process.env[envName] || "").trim();
  });
  if (missingTargetSlugs.length > 0) {
    fatalErrors.push(`Missing channel target for slugs: ${missingTargetSlugs.join(", ")}`);
  }

  const seenKeys = new Set();
  let duplicateKeysCount = 0;
  let imageCount = 0;
  let textOnlyCount = 0;
  let missingImageCount = 0;
  const missingImagesBySlug = {};
  let firstDayRows = [];
  let lastDayRows = [];

  if (dateValidation.ok && daysValidation.ok) {
    for (let dayIndex = 0; dayIndex < days; dayIndex++) {
      const date = addDays(from, dayIndex);
      const dayRows = [];

      for (const slug of ZODIAC_SLUGS) {
        const key = `${date}:${slug}`;
        if (seenKeys.has(key)) {
          duplicateKeysCount++;
        }
        seenKeys.add(key);

        const probe = createContentProbe(date, slug);
        validateContentProbe(probe, fatalErrors);

        const asset = resolveZodiacWeeklyVisualAsset(slug, date, "weekly");
        if (!asset.ok) {
          fatalErrors.push(asset.error || `Unable to resolve weekly asset for ${slug} on ${date}`);
          continue;
        }

        let mediaMode = "text_only";
        if (asset.path) {
          mediaMode = "image";
          imageCount++;
          if (asset.source !== "weekly" || asset.fallback) {
            fatalErrors.push(`Invalid non-weekly image source for ${slug} on ${date}`);
          }
          if (/placeholder|fallback|daily/i.test(asset.path)) {
            fatalErrors.push(`Forbidden placeholder/fallback/daily image path for ${slug} on ${date}`);
          }
        } else {
          textOnlyCount++;
          missingImageCount++;
          addMissingImage(missingImagesBySlug, slug, asset.weekday || "unknown");
          if (asset.source !== "none" || !asset.fallback) {
            fatalErrors.push(`Missing image did not resolve to text_only for ${slug} on ${date}`);
          }
        }

        dayRows.push({ date, slug, mediaMode });
      }

      if (dayIndex === 0) firstDayRows = dayRows;
      if (dayIndex === days - 1) lastDayRows = dayRows;
    }
  }

  if (duplicateKeysCount > 0) {
    fatalErrors.push(`Duplicate date+slug keys found: ${duplicateKeysCount}`);
  }

  const firstDay = summarizeDay(from, firstDayRows);
  const lastDay = summarizeDay(addDays(from, Math.max(days - 1, 0)), lastDayRows);

  console.log("=== Zodiac Year Preflight Check ===");
  console.log(`From Date            : ${from}`);
  console.log(`Days Checked         : ${days}`);
  console.log(`Slugs Per Day        : ${ZODIAC_SLUGS.length}`);
  console.log(`Total Expected Posts : ${expectedPosts}`);
  console.log(`Image Count          : ${imageCount}`);
  console.log(`Text Only Count      : ${textOnlyCount}`);
  console.log(`Missing Image Count  : ${missingImageCount}`);
  console.log(`Duplicate Keys Count : ${duplicateKeysCount}`);
  console.log(`Fatal Errors Count   : ${fatalErrors.length}`);
  console.log(`Warning Count        : ${warnings.length}`);
  console.log(`Planner Check        : ${plannerStatus.mode}`);
  console.log(`Channel Targets      : ${ZODIAC_SLUGS.length - missingTargetSlugs.length}/${ZODIAC_SLUGS.length} configured (values hidden)`);
  console.log("Telegram API Calls   : 0");
  console.log("Live Publish Calls   : 0");
  console.log("Scheduler Calls      : 0");
  console.log("Ledger Writes        : 0");
  console.log("");
  printGroupedMissingImages(missingImagesBySlug);
  console.log("");
  console.log("--- Sample First Day ---");
  console.log(JSON.stringify(firstDay, null, 2));
  console.log("--- Sample Last Day ---");
  console.log(JSON.stringify(lastDay, null, 2));

  if (warnings.length > 0) {
    console.log("");
    console.log("--- Warnings ---");
    warnings.forEach((warning) => console.log(`- ${warning}`));
  }

  if (fatalErrors.length > 0) {
    console.log("");
    console.log("--- Fatal Errors ---");
    fatalErrors.forEach((error) => console.log(`- ${error}`));
    process.exit(1);
  }

  console.log("");
  console.log("[OK] Zodiac year preflight passed without fatal errors.");
}

run();
