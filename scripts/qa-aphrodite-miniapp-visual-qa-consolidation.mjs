#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

import {
  APHRODITE_MINIAPP_VISUAL_QA_CONSOLIDATION_CLASSIFICATION,
  APHRODITE_MINIAPP_VISUAL_QA_CONSOLIDATION_SAFETY_LABELS,
  APHRODITE_MINIAPP_VISUAL_QA_CONSOLIDATION_TITLE,
  getAphroditeMiniAppVisualQaConsolidation,
} from "../lib/zodiac/aphrodite-miniapp-visual-qa-consolidation.ts";

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

console.log("Старт QA: консолидация visual QA Mini App...\n");

const modelPath = "../lib/zodiac/aphrodite-miniapp-visual-qa-consolidation.ts";
const pagePath = "../app/dashboard/networks/zodiac/miniapp-visual-qa-consolidation/page.tsx";
const docsPath = "../docs/aphrodite-miniapp-visual-qa-consolidation.md";
const reportPath = "../docs/aphrodite-package-reports/package-206.md";
const dashboardPath = "../app/dashboard/networks/zodiac/page.tsx";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";

for (const [label, path] of [
  ["model", modelPath],
  ["dashboard page", pagePath],
  ["docs", docsPath],
  ["package report", reportPath],
  ["dashboard navigation", dashboardPath],
  ["dashboard QA", dashboardQaPath],
]) {
  check(`${label} существует`, exists(path));
}

const modelSource = exists(modelPath) ? read(modelPath) : "";
const pageSource = exists(pagePath) ? read(pagePath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const dashboardSource = exists(dashboardPath) ? read(dashboardPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";
const model = getAphroditeMiniAppVisualQaConsolidation();

const coverageSources = new Map();
for (const area of model.areas) {
  for (const file of area.sourceFiles) {
    if (!coverageSources.has(file)) {
      coverageSources.set(file, read(`../${file}`));
    }
  }
}

const implementationBundle = [
  modelSource,
  pageSource,
  docsSource,
  reportSource,
  dashboardSource,
  dashboardQaSource,
  ...coverageSources.values(),
].join("\n");
const safetyBundle = [
  modelSource,
  pageSource,
  docsSource,
  reportSource,
  ...coverageSources.values(),
].join("\n");

check("model returns title", model.title === APHRODITE_MINIAPP_VISUAL_QA_CONSOLIDATION_TITLE);
check("model returns classification", model.classification === APHRODITE_MINIAPP_VISUAL_QA_CONSOLIDATION_CLASSIFICATION);
check("package number is 206", model.packageNumber === 206);
check("dashboard title bound to model", pageSource.includes("{model.title}") && model.title === "Консолидация visual QA Mini App");
check("dashboard classification bound to model", pageSource.includes("{model.classification}") && model.classification.includes("Только visual QA"));
check("dashboard route linked from overview", dashboardSource.includes("/dashboard/networks/zodiac/miniapp-visual-qa-consolidation"));
check("dashboard QA route exists", dashboardQaSource.includes("miniappVisualQaConsolidation"));
check("dashboard QA asserts title", dashboardQaSource.includes("Консолидация visual QA Mini App"));

for (const label of APHRODITE_MINIAPP_VISUAL_QA_CONSOLIDATION_SAFETY_LABELS) {
  check(`safety label exists: ${label}`, implementationBundle.includes(label));
}

for (const requiredArea of [
  "/miniapp",
  "/miniapp/love-reading-preview",
  "/birth-matrix",
  "/compatibility",
  "compatibility result",
  "Birth Matrix result",
  "Mystic sections",
  "horoscope visual cards",
  "date input",
  "mobile CTA hierarchy",
]) {
  check(`coverage exists: ${requiredArea}`, implementationBundle.includes(requiredArea));
}

for (const area of model.areas) {
  check(`${area.id}: source files exist`, area.sourceFiles.every((file) => exists(`../${file}`)));
  const areaSource = area.sourceFiles.map((file) => coverageSources.get(file)).join("\n");
  check(`${area.id}: required signals exist`, area.requiredSignals.every((signal) => areaSource.includes(signal)));
  check(`${area.id}: QA focus documented`, area.qaFocus.length >= 4);
}

for (const script of model.dependentQaScripts) {
  check(`dependent QA script exists: ${script}`, exists(`../${script}`));
  check(`dependent QA command listed: ${script}`, model.requiredFullQaCommands.includes(`node --experimental-strip-types ${script}`));
}

check("full QA includes TypeScript", model.requiredFullQaCommands.includes("npx tsc --noEmit -p tsconfig.json"));
check("full QA includes dashboard syntax check", model.requiredFullQaCommands.includes("node --check scripts/qa-zodiac-dashboard.mjs"));
check("full QA includes build", model.requiredFullQaCommands.includes("npm run build"));
check("full QA includes dashboard runtime QA", model.requiredFullQaCommands.includes("npm run zodiac:dashboard:qa"));
check("full QA includes production safety", model.requiredFullQaCommands.includes("npm run production:safety:check"));
check("next package is 207", model.nextRecommendedPackage.includes("Package 207"));

check("production launch flag false", model.safetyFlags.productionLaunchDone === false);
check("Telegram API flag false", model.safetyFlags.telegramApiUsed === false);
check("messages sent flag false", model.safetyFlags.messagesSent === false);
check("DB write flag false", model.safetyFlags.databaseWriteAdded === false);
check("external analytics flag false", model.safetyFlags.externalAnalyticsAdded === false);
check("payment flag false", model.safetyFlags.paymentAdded === false);
check("VIP unlock flag false", model.safetyFlags.vipUnlockAdded === false);
check("workflow/cron/publish flag false", model.safetyFlags.workflowCronPublishChanged === false);
check("active CTA flag false", model.safetyFlags.activeCtaLogicChanged === false);

check("live Mini App source files not changed", gitDiffNames([
  "app/miniapp",
  "app/birth-matrix",
  "app/compatibility",
  "components/ZodiacCompatibilityMiniApp.tsx",
  "components/ZodiacMysticSections.tsx",
  "components/zodiac-mini-app/ZodiacDateInput.tsx",
  "components/zodiac-mini-app/ResultCards.tsx",
  "components/zodiac-mini-app/AphroditeHoroscopeCard.tsx",
  "components/zodiac-mini-app/AphroditeHoroscopePeriodBadge.tsx",
]).length === 0);
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

const scriptChanges = gitDiffNames(["scripts"]);
const allowedScriptChanges = new Set([
  "scripts/qa-aphrodite-miniapp-visual-qa-consolidation.mjs",
  "scripts/qa-zodiac-dashboard.mjs",
]);
check("script changes limited to Package 206 QA/dashboard QA", scriptChanges.every((file) => allowedScriptChanges.has(file)));

check("no Telegram API implementation", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(safetyBundle));
check("no DB write implementation", !/from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(|events\.insert|insert.*event/i.test(safetyBundle));
check("no payment or VIP implementation", !/from ['"]stripe|new Stripe\b|sendInvoice\s*\(|createInvoiceLink\s*\(|successful_payment|pre_checkout_query|answerPreCheckoutQuery|createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|allowed=true|productionPaymentAllowedNow=true/i.test(safetyBundle));
check("no external analytics implementation", !/analytics\.track|posthog|amplitude|gtag|GoogleAnalytics|sendEvent|trackEvent|navigator\.sendBeacon/i.test(safetyBundle));
check("docs say Package 206", docsSource.includes("Package 206"));
check("report says Package 206", reportSource.includes("Package 206"));
check("report does not start Package 207", reportSource.includes("Package 207 не начат"));

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
