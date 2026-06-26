#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

import {
  APHRODITE_VIP_NATAL_NUMEROLOGY_VISUAL_REVIEW_CLASSIFICATION,
  APHRODITE_VIP_NATAL_NUMEROLOGY_VISUAL_REVIEW_SAFETY_LABELS,
  APHRODITE_VIP_NATAL_NUMEROLOGY_VISUAL_REVIEW_TITLE,
  getAphroditeVipNatalNumerologyVisualReview,
} from "../lib/zodiac/aphrodite-vip-natal-numerology-visual-review.ts";

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

console.log("Старт QA: Aphrodite VIP / Natal / Numerology Visual Review...\n");

const modelPath = "../lib/zodiac/aphrodite-vip-natal-numerology-visual-review.ts";
const pagePath = "../app/dashboard/networks/zodiac/vip-natal-numerology-visual-review/page.tsx";
const docsPath = "../docs/aphrodite-vip-natal-numerology-visual-review.md";
const reportPath = "../docs/aphrodite-package-reports/package-202.md";
const dashboardPath = "../app/dashboard/networks/zodiac/page.tsx";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";

for (const [label, path] of [
  ["model", modelPath],
  ["dashboard route", pagePath],
  ["docs", docsPath],
  ["package report", reportPath],
  ["dashboard navigation", dashboardPath],
  ["dashboard QA", dashboardQaPath],
]) {
  check(`${label} exists`, exists(path));
}

const modelSource = exists(modelPath) ? read(modelPath) : "";
const pageSource = exists(pagePath) ? read(pagePath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const dashboardSource = exists(dashboardPath) ? read(dashboardPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";
const vipSource = exists("../components/ZodiacVipSections.tsx") ? read("../components/ZodiacVipSections.tsx") : "";
const compatibilitySource = exists("../components/ZodiacCompatibilityMiniApp.tsx") ? read("../components/ZodiacCompatibilityMiniApp.tsx") : "";
const dateInputSource = exists("../components/zodiac-mini-app/ZodiacDateInput.tsx") ? read("../components/zodiac-mini-app/ZodiacDateInput.tsx") : "";
const dateRangeSource = exists("../lib/zodiac-birth-date-range.ts") ? read("../lib/zodiac-birth-date-range.ts") : "";
const implementationBundle = [modelSource, pageSource].join("\n");
const userFacingBundle = [modelSource, pageSource, docsSource, reportSource].join("\n");
const review = getAphroditeVipNatalNumerologyVisualReview();

check("model returns title", review.title === APHRODITE_VIP_NATAL_NUMEROLOGY_VISUAL_REVIEW_TITLE);
check("model returns classification", review.classification === APHRODITE_VIP_NATAL_NUMEROLOGY_VISUAL_REVIEW_CLASSIFICATION);
check("package number is 202", review.packageNumber === 202);
check("review areas exist", review.reviewAreas.length >= 6);
check("natal chart review exists", review.summary.hasNatalChartReview);
check("numerology review exists", review.summary.hasNumerologyReview);
check("VIP couple calendar review exists", review.summary.hasVipCoupleCalendarReview);
check("locked recommendations exist", review.summary.hasLockedSectionReview);
check("free preview fallback recommendations exist", review.summary.hasFreePreviewFallbackReview);
check("date input preservation true", review.safetyFlags.dateInputPreservedNow === true);
check("live VIP flag false", review.safetyFlags.liveVipChangedNow === false);
check("payment flag false", review.safetyFlags.paymentChangedNow === false);
check("VIP unlock flag false", review.safetyFlags.vipUnlockNow === false);
check("entitlement flag false", review.safetyFlags.entitlementChangedNow === false);
check("Telegram API flag false", review.safetyFlags.telegramApiNow === false);
check("database write flag false", review.safetyFlags.databaseWriteNow === false);
check("production launch flag false", review.safetyFlags.productionLaunchNow === false);

for (const title of [
  "VIP natal chart visual structure",
  "Birth chart visual structure",
  "VIP numerology visual structure",
  "VIP couple calendar visual structure",
  "Future locked sections",
  "Free preview fallback",
]) {
  check(`required review area exists: ${title}`, review.reviewAreas.some((area) => area.title === title) && userFacingBundle.includes(title));
}

for (const requiredText of [
  "readability",
  "card hierarchy",
  "mobile layout",
  "date input preservation",
  "no payment CTA",
  "no VIP unlock",
  "no hard prophecy",
  "no medical/legal/financial advice",
]) {
  check(`coverage exists: ${requiredText}`, review.requiredCoverage.includes(requiredText) && userFacingBundle.includes(requiredText));
}

for (const label of APHRODITE_VIP_NATAL_NUMEROLOGY_VISUAL_REVIEW_SAFETY_LABELS) {
  check(`safety label exists: ${label}`, userFacingBundle.includes(label));
}

check("dashboard page renders title from model", pageSource.includes("review.title") && userFacingBundle.includes(APHRODITE_VIP_NATAL_NUMEROLOGY_VISUAL_REVIEW_TITLE));
check("dashboard page renders classification from model", pageSource.includes("review.classification") && userFacingBundle.includes(APHRODITE_VIP_NATAL_NUMEROLOGY_VISUAL_REVIEW_CLASSIFICATION));
check("dashboard navigation link exists", dashboardSource.includes("/dashboard/networks/zodiac/vip-natal-numerology-visual-review"));
check("dashboard QA route key exists", dashboardQaSource.includes("vipNatalNumerologyVisualReview"));
check("dashboard QA overview link exists", dashboardQaSource.includes("/dashboard/networks/zodiac/vip-natal-numerology-visual-review"));
check("docs say Package 202", docsSource.includes("Package 202"));
check("report says Package 202", reportSource.includes("Package 202"));
check("report points to Package 203", reportSource.includes("Package 203"));

check("VIP source contains natal chart flow", /natal|Натальн/i.test(vipSource + compatibilitySource));
check("compatibility source contains numerology flow", /numerology|Нумеролог/i.test(compatibilitySource));
check("compatibility source contains couple calendar flow", /coupleCalendar|30 дней пары|Календар/i.test(compatibilitySource));
check("common birth-date input marker preserved", dateInputSource.includes("data-birth-date-ui") && dateRangeSource.includes('BIRTH_DATE_UI_MARKER = "v2-global-1900-today"'));
check("common birth-date input remains text", dateInputSource.includes('type="text"') && !/type\s*=\s*["']date["']/.test(dateInputSource));

const liveVipChanges = gitDiffNames([
  "components/ZodiacVipSections.tsx",
  "components/ZodiacCompatibilityMiniApp.tsx",
  "components/ZodiacMysticSections.tsx",
  "components/zodiac-mini-app",
  "app/miniapp",
  "app/compatibility",
  "app/birth-matrix",
]);
check("live VIP/Mini App runtime paths not changed", liveVipChanges.length === 0);
check("no payment implementation", !/from ['"]stripe|new Stripe\b|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(|successful_payment/i.test(implementationBundle));
check("no VIP unlock implementation", !/createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|vipUnlocked\s*=\s*true|allowed=true|createsEntitlementNow=true|unlocksVipNow=true|grantsAccessNow=true/i.test(implementationBundle));
check("no Telegram API implementation", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(/i.test(implementationBundle));
check("no DB write implementation", !/from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(|events\.insert|insert.*event/i.test(implementationBundle));
check("no external analytics implementation", !/analytics\.track|posthog|amplitude|gtag|GoogleAnalytics|sendEvent|trackEvent|navigator\.sendBeacon/i.test(implementationBundle));
check("no cron/workflow changes", gitDiffNames([".github/workflows", "vercel.json"]).length === 0);
check("publish scripts not changed", gitDiffNames(["scripts/publish-zodiac-by-date.mjs", "scripts/publish-zodiac-weekly-by-week.mjs", "scripts/zodiac-telegram-publisher.mjs", "scripts/publish-due.mjs", "scripts/publish-due-json.mjs"]).length === 0);
check("package.json not changed", gitDiffNames(["package.json"]).length === 0);
check("no DB schema/migration change", gitDiffNames(["prisma", "supabase", "migrations", "schema.prisma"]).filter((file) => /(^|\/)(prisma|supabase|migrations)(\/|$)|schema\.prisma$/i.test(file)).length === 0);

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
