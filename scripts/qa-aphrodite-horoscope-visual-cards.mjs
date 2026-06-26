#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

import {
  APHRODITE_HOROSCOPE_VISUAL_CARDS_CLASSIFICATION,
  APHRODITE_HOROSCOPE_VISUAL_CARDS_SAFETY_LABELS,
  APHRODITE_HOROSCOPE_VISUAL_CARDS_TITLE,
  getAphroditeHoroscopeVisualCards,
} from "../lib/zodiac/aphrodite-horoscope-visual-cards.ts";
import {
  buildZodiacDailyLedgerKey,
  buildZodiacWeeklyLedgerKey,
  getUpcomingWeeklyHoroscopePeriod,
} from "../lib/zodiac-weekly-horoscope.ts";
import {
  buildZodiacMonthlyLedgerKey,
  getNextMonthlyHoroscopePeriodAfter20,
} from "../lib/zodiac-monthly-horoscope.ts";

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

console.log("Старт QA: Aphrodite Horoscope Visual Cards...\n");

const modelPath = "../lib/zodiac/aphrodite-horoscope-visual-cards.ts";
const cardPath = "../components/zodiac-mini-app/AphroditeHoroscopeCard.tsx";
const badgePath = "../components/zodiac-mini-app/AphroditeHoroscopePeriodBadge.tsx";
const pagePath = "../app/dashboard/networks/zodiac/horoscope-visual-cards/page.tsx";
const docsPath = "../docs/aphrodite-horoscope-visual-cards.md";
const reportPath = "../docs/aphrodite-package-reports/package-203.md";
const dashboardPath = "../app/dashboard/networks/zodiac/page.tsx";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";

for (const [label, path] of [
  ["visual card model", modelPath],
  ["horoscope card component", cardPath],
  ["period badge component", badgePath],
  ["dashboard page", pagePath],
  ["docs", docsPath],
  ["package report", reportPath],
  ["dashboard navigation", dashboardPath],
  ["dashboard QA", dashboardQaPath],
]) {
  check(`${label} exists`, exists(path));
}

const modelSource = exists(modelPath) ? read(modelPath) : "";
const cardSource = exists(cardPath) ? read(cardPath) : "";
const badgeSource = exists(badgePath) ? read(badgePath) : "";
const pageSource = exists(pagePath) ? read(pagePath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const dashboardSource = exists(dashboardPath) ? read(dashboardPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";
const implementationBundle = [modelSource, cardSource, badgeSource, pageSource].join("\n");
const userFacingBundle = [modelSource, cardSource, badgeSource, pageSource, docsSource, reportSource].join("\n");
const cardsModel = getAphroditeHoroscopeVisualCards();

check("model returns title", cardsModel.title === APHRODITE_HOROSCOPE_VISUAL_CARDS_TITLE);
check("model returns classification", cardsModel.classification === APHRODITE_HOROSCOPE_VISUAL_CARDS_CLASSIFICATION);
check("package number is 203", cardsModel.packageNumber === 203);
check("three card definitions exist", cardsModel.cards.length === 3);
check("daily card definition exists", cardsModel.cards.some((card) => card.periodType === "daily"));
check("weekly card definition exists", cardsModel.cards.some((card) => card.periodType === "weekly"));
check("monthly card definition exists", cardsModel.cards.some((card) => card.periodType === "monthly"));
check("all cards have sign label", cardsModel.cards.every((card) => card.signLabel.length > 0));
check("all cards have period label", cardsModel.cards.every((card) => card.periodLabel.length > 0));
check("all cards have main theme", cardsModel.cards.every((card) => card.mainTheme.length > 0));
check("all cards have love/relationship section", cardsModel.cards.every((card) => card.loveRelationship.length > 0));
check("all cards have energy section", cardsModel.cards.every((card) => card.energy.length > 0));
check("all cards have zone of attention", cardsModel.cards.every((card) => card.attentionZone.length > 0));
check("all cards have CTA/fallback area", cardsModel.cards.every((card) => card.ctaFallback.length > 0));
check("all cards have compact mobile notes", cardsModel.cards.every((card) => card.layoutNotes.length >= 5));

for (const requiredText of [
  "daily card",
  "weekly card",
  "monthly card",
  "sign label",
  "period label",
  "main theme",
  "love/relationship section",
  "energy section",
  "zone of attention",
  "CTA/fallback area",
  "compact mobile readable layout",
  "no wall of text",
  "no payment CTA",
  "no VIP unlock",
]) {
  check(`required structure exists: ${requiredText}`, cardsModel.requiredStructure.includes(requiredText) && userFacingBundle.includes(requiredText));
}

for (const label of APHRODITE_HOROSCOPE_VISUAL_CARDS_SAFETY_LABELS) {
  check(`safety label exists: ${label}`, userFacingBundle.includes(label));
}

check("component marker exists", cardSource.includes("data-aphrodite-horoscope-card"));
check("period badge marker exists", badgeSource.includes("data-aphrodite-horoscope-period"));
check("card uses period badge", cardSource.includes("AphroditeHoroscopePeriodBadge"));
check("page renders card component", pageSource.includes("AphroditeHoroscopeCard"));
check("dashboard navigation link exists", dashboardSource.includes("/dashboard/networks/zodiac/horoscope-visual-cards"));
check("dashboard QA route key exists", dashboardQaSource.includes("horoscopeVisualCards"));
check("dashboard QA overview link exists", dashboardQaSource.includes("/dashboard/networks/zodiac/horoscope-visual-cards"));
check("docs say Package 203", docsSource.includes("Package 203"));
check("report says Package 203", reportSource.includes("Package 203"));
check("report points to Package 204", reportSource.includes("Package 204"));

check("daily ledger key remains unchanged", buildZodiacDailyLedgerKey("2026-06-26", "aries") === "2026-06-26:aries");
check("weekly ledger key remains target-period based", buildZodiacWeeklyLedgerKey("2026-W27", "aries") === "zodiac:weekly:2026-W27:aries");
check("monthly ledger key remains target-period based", buildZodiacMonthlyLedgerKey("2026-07", "aries") === "zodiac:monthly:2026-07:aries");
check("Sunday weekly period remains following week", getUpcomingWeeklyHoroscopePeriod(new Date("2026-06-28T12:00:00Z")).weekStart === "2026-06-29");
check("monthly after day 20 remains next month", getNextMonthlyHoroscopePeriodAfter20(new Date("2026-06-20T12:00:00Z")).monthKey === "2026-07");

check("publishing flag false", cardsModel.safetyFlags.publishingChangedNow === false);
check("Telegram flag false", cardsModel.safetyFlags.telegramApiNow === false);
check("cron/workflow flag false", cardsModel.safetyFlags.cronWorkflowChangedNow === false);
check("ledger flag false", cardsModel.safetyFlags.ledgerChangedNow === false);
check("payment flag false", cardsModel.safetyFlags.paymentChangedNow === false);
check("VIP unlock flag false", cardsModel.safetyFlags.vipUnlockNow === false);
check("DB write flag false", cardsModel.safetyFlags.databaseWriteNow === false);
check("published posts flag false", cardsModel.safetyFlags.postsPublishedNow === false);

check("daily/weekly/monthly pipeline files not changed", gitDiffNames([
  "lib/zodiac-weekly-horoscope.ts",
  "lib/zodiac-monthly-horoscope.ts",
  "scripts/lib/zodiac-weekly-pipeline.mjs",
  "scripts/generate-zodiac-monthly-preview.mjs",
]).length === 0);
check("publishing scripts not changed", gitDiffNames([
  "scripts/publish-zodiac-by-date.mjs",
  "scripts/publish-zodiac-weekly-by-week.mjs",
  "scripts/zodiac-telegram-publisher.mjs",
  "scripts/publish-due.mjs",
  "scripts/publish-due-json.mjs",
]).length === 0);
check("no workflow/cron changes", gitDiffNames([".github/workflows", "vercel.json"]).length === 0);
check("package.json not changed", gitDiffNames(["package.json"]).length === 0);
check("no DB schema/migration change", gitDiffNames(["prisma", "supabase", "migrations", "schema.prisma"]).filter((file) => /(^|\/)(prisma|supabase|migrations)(\/|$)|schema\.prisma$/i.test(file)).length === 0);

const scriptDiff = gitDiffNames(["scripts"]);
const allowedScripts = new Set([
  "scripts/qa-aphrodite-horoscope-visual-cards.mjs",
  "scripts/qa-zodiac-dashboard.mjs",
]);
check("script changes limited to Package 203 QA/dashboard QA", scriptDiff.every((file) => allowedScripts.has(file)));
check("no Telegram API implementation", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(/i.test(implementationBundle));
check("no DB write implementation", !/from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(|events\.insert|insert.*event/i.test(implementationBundle));
check("no payment or VIP implementation", !/from ['"]stripe|new Stripe\b|sendInvoice\s*\(|createInvoiceLink\s*\(|successful_payment|pre_checkout_query|answerPreCheckoutQuery|createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|allowed=true|productionPaymentAllowedNow=true/i.test(implementationBundle));
check("no external analytics implementation", !/analytics\.track|posthog|amplitude|gtag|GoogleAnalytics|sendEvent|trackEvent|navigator\.sendBeacon/i.test(implementationBundle));

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
