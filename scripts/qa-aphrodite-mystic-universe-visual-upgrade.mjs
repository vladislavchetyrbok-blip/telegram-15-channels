#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

import {
  APHRODITE_MYSTIC_UNIVERSE_VISUAL_UPGRADE_CLASSIFICATION,
  APHRODITE_MYSTIC_UNIVERSE_VISUAL_UPGRADE_SAFETY_LABELS,
  APHRODITE_MYSTIC_UNIVERSE_VISUAL_UPGRADE_TITLE,
  getAphroditeMysticUniverseVisualUpgrade,
} from "../lib/zodiac/aphrodite-mystic-universe-visual-upgrade.ts";

let passed = 0;
let failed = 0;

function check(name, condition) {
  if (condition) {
    passed += 1;
    console.log("УСПЕХ: " + name);
  } else {
    failed += 1;
    console.log("ОШИБКА: " + name);
  }
}

function read(rel) {
  return readFileSync(new URL(rel, import.meta.url), "utf8");
}

function exists(rel) {
  return existsSync(new URL(rel, import.meta.url));
}

function gitDiffNames(paths) {
  try {
    const output = execFileSync("git", ["diff", "--name-only", "HEAD", "--", ...paths], { encoding: "utf8" });
    return output.split(/\r?\n/).filter(Boolean);
  } catch {
    return ["__git_diff_failed__"];
  }
}

console.log("Старт QA: Aphrodite Mystic / Universe Visual Upgrade...\n");

const modelPath = "../lib/zodiac/aphrodite-mystic-universe-visual-upgrade.ts";
const panelPath = "../components/zodiac-mini-app/AphroditeMysticUniversePanel.tsx";
const mysticPath = "../components/ZodiacMysticSections.tsx";
const contentPath = "../lib/zodiac-mystic-content.ts";
const compatibilityPath = "../components/ZodiacCompatibilityMiniApp.tsx";
const dateInputPath = "../components/zodiac-mini-app/ZodiacDateInput.tsx";
const docsPath = "../docs/aphrodite-mystic-universe-visual-upgrade.md";
const reportPath = "../docs/aphrodite-package-reports/package-204.md";

for (const [label, path] of [
  ["model", modelPath],
  ["universe panel", panelPath],
  ["Mystic UI file", mysticPath],
  ["Mystic content file", contentPath],
  ["Compatibility file", compatibilityPath],
  ["date input", dateInputPath],
  ["docs", docsPath],
  ["package report", reportPath],
]) {
  check(`${label} exists`, exists(path));
}

const modelSource = exists(modelPath) ? read(modelPath) : "";
const panelSource = exists(panelPath) ? read(panelPath) : "";
const mysticSource = exists(mysticPath) ? read(mysticPath) : "";
const contentSource = exists(contentPath) ? read(contentPath) : "";
const compatibilitySource = exists(compatibilityPath) ? read(compatibilityPath) : "";
const dateInputSource = exists(dateInputPath) ? read(dateInputPath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const implementationBundle = [modelSource, panelSource, mysticSource].join("\n");
const userFacingBundle = [modelSource, panelSource, mysticSource, docsSource, reportSource].join("\n");
const upgrade = getAphroditeMysticUniverseVisualUpgrade();

check("model returns title", upgrade.title === APHRODITE_MYSTIC_UNIVERSE_VISUAL_UPGRADE_TITLE);
check("model returns classification", upgrade.classification === APHRODITE_MYSTIC_UNIVERSE_VISUAL_UPGRADE_CLASSIFICATION);
check("package number is 204", upgrade.packageNumber === 204);
check("visual areas exist", upgrade.visualAreas.length >= 4);
check("Universe Message visual area exists", upgrade.visualAreas.some((area) => area.id === "universe-message-panel"));
check("daily card visual area exists", upgrade.visualAreas.some((area) => area.id === "daily-card-layout"));
check("tarot visual area exists", upgrade.visualAreas.some((area) => area.id === "tarot-layout"));
check("rune visual area exists", upgrade.visualAreas.some((area) => area.id === "rune-layout"));

for (const label of APHRODITE_MYSTIC_UNIVERSE_VISUAL_UPGRADE_SAFETY_LABELS) {
  check(`safety label exists: ${label}`, userFacingBundle.includes(label));
}

check("panel renders Послание Вселенной", panelSource.includes("Послание Вселенной"));
check("panel has runtime marker", panelSource.includes('data-aphrodite-mystic-universe-panel="package-204"'));
check("Mystic UI imports panel", mysticSource.includes("AphroditeMysticUniversePanel"));
check("Mystic UI uses panel at least three times", (mysticSource.match(/<AphroditeMysticUniversePanel/g) || []).length >= 3);
check("Daily Card feature remains available", mysticSource.includes("export function DailyCardFeature") && mysticSource.includes("generateDailyCard"));
check("Tarot feature remains available", mysticSource.includes("export function TarotCardFeature") && mysticSource.includes("generateTarotSpread"));
check("Rune feature remains available", mysticSource.includes("export function RuneDayFeature") && mysticSource.includes("generateRuneSpread"));
check("numerology/profile sections remain available", compatibilitySource.includes("ExtendedNumerologyFeature") && compatibilitySource.includes("Нумерология"));
check("mystic content generators remain available", contentSource.includes("generateDailyCard") && contentSource.includes("generateTarotSpread") && contentSource.includes("generateRuneSpread"));
check("date input marker remains", dateInputSource.includes("data-birth-date-ui"));
check("birth-date input remains text", dateInputSource.includes('type="text"') && !/type\s*=\s*["']date["']/.test(dateInputSource));
check("compatibility source not changed", gitDiffNames(["components/ZodiacCompatibilityMiniApp.tsx"]).length === 0);

check("no hard prophecy phrases", !/точно случится|неизбежно произойдёт|обреч[её]н|гарантированно изменит|единственный исход/i.test(implementationBundle));
check("no fear manipulation phrases", !/бойтесь|страшная опасность|немедленно иначе|катастрофа неизбежна/i.test(implementationBundle));
check("no medical/legal/financial advice", !/медицинск(?:ий|ая|ое)|юридическ(?:ий|ая|ое)|инвестиционн(?:ый|ая|ое) совет|диагноз|лечение/i.test(implementationBundle));
check("no Telegram API implementation", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(/i.test(implementationBundle));
check("no DB write implementation", !/from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(|events\.insert|insert.*event|DATABASE_URL|createClient\s*\(|new Pool\s*\(/i.test(implementationBundle));
check("no payment or VIP implementation", !/from ['"]stripe|new Stripe\b|sendInvoice\s*\(|createInvoiceLink\s*\(|successful_payment|pre_checkout_query|answerPreCheckoutQuery|createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|allowed=true|productionPaymentAllowedNow=true/i.test(implementationBundle));
check("no external analytics implementation", !/analytics\.track|posthog|amplitude|gtag|GoogleAnalytics|sendEvent|trackEvent|navigator\.sendBeacon/i.test(implementationBundle));
check("no workflow/cron changes", gitDiffNames([".github/workflows", "vercel.json"]).length === 0);
check("publish scripts not changed", gitDiffNames([
  "scripts/publish-zodiac-by-date.mjs",
  "scripts/publish-zodiac-weekly-by-week.mjs",
  "scripts/zodiac-telegram-publisher.mjs",
  "scripts/publish-due.mjs",
  "scripts/publish-due-json.mjs",
]).length === 0);
check("package.json not changed", gitDiffNames(["package.json"]).length === 0);
check("no DB schema/migration change", gitDiffNames(["prisma", "supabase", "migrations", "schema.prisma"]).filter((file) => /(^|\/)(prisma|supabase|migrations)(\/|$)|schema\.prisma$/i.test(file)).length === 0);
check("docs say Package 204", docsSource.includes("Package 204"));
check("report says Package 204", reportSource.includes("Package 204"));
check("report points to Package 205", reportSource.includes("Package 205"));

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
