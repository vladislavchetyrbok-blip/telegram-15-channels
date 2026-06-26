#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

import {
  APHRODITE_CTA_INVENTORY_AUDIT_MESSAGES,
  APHRODITE_CTA_INVENTORY_RISK_LEVELS,
  APHRODITE_CTA_INVENTORY_STATUSES,
  APHRODITE_FINAL_CONTENT_CTA_INVENTORY_AUDIT_ROUTE,
  APHRODITE_FINAL_CONTENT_CTA_INVENTORY_AUDIT_TITLE,
  getAphroditeFinalContentCtaInventoryAudit,
} from "../lib/zodiac/aphrodite-final-content-cta-inventory-audit.ts";

let passed = 0;
let failed = 0;

function check(name, condition) {
  if (condition) {
    passed += 1;
    console.log("SUCCESS: " + name);
  } else {
    failed += 1;
    console.log("FAIL: " + name);
  }
}

function read(rel) {
  return readFileSync(new URL(rel, import.meta.url), "utf8");
}

function exists(rel) {
  return existsSync(new URL(rel, import.meta.url));
}

function gitChangedNames(paths) {
  try {
    const diffOutput = execFileSync("git", ["diff", "--name-only", "HEAD", "--", ...paths], { encoding: "utf8" });
    const otherOutput = execFileSync("git", ["ls-files", "--others", "--exclude-standard", "--", ...paths], { encoding: "utf8" });
    return [...diffOutput.split(/\r?\n/), ...otherOutput.split(/\r?\n/)].filter(Boolean);
  } catch {
    return ["__git_diff_failed__"];
  }
}

console.log("Starting QA: Final Content & CTA Inventory Audit...\n");

const modelPath = "../lib/zodiac/aphrodite-final-content-cta-inventory-audit.ts";
const pagePath = "../app/dashboard/networks/zodiac/final-content-cta-inventory-audit/page.tsx";
const docsPath = "../docs/aphrodite-final-content-cta-inventory-audit.md";
const reportPath = "../docs/aphrodite-package-reports/package-219.md";
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
  check(`${label} exists`, exists(path));
}

const modelSource = exists(modelPath) ? read(modelPath) : "";
const pageSource = exists(pagePath) ? read(pagePath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const dashboardSource = exists(dashboardPath) ? read(dashboardPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";
const model = getAphroditeFinalContentCtaInventoryAudit();
const implementationBundle = [modelSource, pageSource, docsSource, reportSource, dashboardSource, dashboardQaSource].join("\n");
const safetyBundle = [modelSource, pageSource, docsSource, reportSource].join("\n");

check("title exported", model.title === APHRODITE_FINAL_CONTENT_CTA_INVENTORY_AUDIT_TITLE);
check("route exported", model.route === APHRODITE_FINAL_CONTENT_CTA_INVENTORY_AUDIT_ROUTE);
check("package number is 219", model.packageNumber === 219);
check("dashboard route exists", pageSource.includes("getAphroditeFinalContentCtaInventoryAudit") && pageSource.includes("model.title"));
check("dashboard route linked from overview", dashboardSource.includes(APHRODITE_FINAL_CONTENT_CTA_INVENTORY_AUDIT_ROUTE));
check("dashboard QA route exists", dashboardQaSource.includes("finalContentCtaInventoryAudit"));
check("dashboard QA asserts title", dashboardQaSource.includes("Final Content &amp; CTA Inventory Audit"));
check("publicLaunchApproved=false", model.publicLaunchApproved === false && implementationBundle.includes("publicLaunchApproved"));
check("ownerManualReviewRequired=true", model.ownerManualReviewRequired === true && implementationBundle.includes("ownerManualReviewRequired"));

for (const message of APHRODITE_CTA_INVENTORY_AUDIT_MESSAGES) {
  check(`inventory wording exists: ${message}`, model.auditOnlyMessages.includes(message));
  check(`inventory wording rendered/documented: ${message}`, implementationBundle.includes(message));
}

for (const risk of APHRODITE_CTA_INVENTORY_RISK_LEVELS) {
  check(`risk exists: ${risk}`, model.riskLevels.includes(risk));
  check(`risk rendered/documented: ${risk}`, implementationBundle.includes(risk));
}

for (const status of APHRODITE_CTA_INVENTORY_STATUSES) {
  check(`status exists: ${status}`, model.statuses.includes(status));
  check(`status rendered/documented: ${status}`, implementationBundle.includes(status));
}

const requiredInventorySections = [
  "Daily Zodiac posts",
  "Weekly Zodiac posts",
  "General channel CTA",
  "Sign channels CTA",
  "Mini App entry CTA",
  "Compatibility CTA",
  "Birth Matrix CTA",
  "Mystic Cards CTA",
  "VIP locked state CTA",
  "Public launch dashboard links",
  "Telegram WebView/startapp links",
  "Owner manual review CTA/status",
];

check("all required inventory sections exist", model.inventory.length === requiredInventorySections.length);
for (const sectionName of requiredInventorySections) {
  const item = model.inventory.find((entry) => entry.areaFlow === sectionName);
  check(`inventory section exists: ${sectionName}`, Boolean(item));
  check(`inventory section rendered/documented: ${sectionName}`, implementationBundle.includes(sectionName));
  check(`inventory section has label: ${sectionName}`, Boolean(item?.userVisibleCtaLabel));
  check(`inventory section has destination: ${sectionName}`, Boolean(item?.expectedDestination));
  check(`inventory section has notes: ${sectionName}`, Boolean(item?.notes));
  check(`inventory section active logic unchanged: ${sectionName}`, item?.activeLogicChanged === false);
}

check("owner manual review list includes owner item", model.manualReviewItems.includes("Owner manual review CTA/status"));
check("owner manual review rendered", implementationBundle.includes("owner manual review items"));

check("no production launch flag", model.safetyFlags.productionLaunchDone === false);
check("no Telegram API flag", model.safetyFlags.telegramApiUsed === false);
check("no messages flag", model.safetyFlags.messagesSent === false);
check("no BotFather change flag", model.safetyFlags.botFatherChanged === false);
check("no active CTA logic change flag", model.safetyFlags.activeCtaLogicChanged === false);
check("no DB write flag", model.safetyFlags.databaseWriteAdded === false);
check("no external analytics flag", model.safetyFlags.externalAnalyticsAdded === false);
check("no payment flag", model.safetyFlags.paymentAdded === false);
check("no VIP unlock flag", model.safetyFlags.vipUnlockAdded === false);
check("no workflow change flag", model.safetyFlags.workflowChanged === false);
check("no publish scripts change flag", model.safetyFlags.publishScriptsChanged === false);
check("docs say Package 219", docsSource.includes("Package 219"));
check("report says Package 219", reportSource.includes("Package 219"));
check("report says active CTA logic unchanged", reportSource.includes("Active CTA logic changed: No"));
check("report says launch not performed", reportSource.includes("Production launch done: No"));

check("live Mini App source files not changed", gitChangedNames([
  "app/miniapp",
  "app/birth-matrix",
  "app/compatibility",
  "components/ZodiacCompatibilityMiniApp.tsx",
  "components/ZodiacMysticSections.tsx",
  "components/zodiac-mini-app/ZodiacDateInput.tsx",
]).length === 0);
check("no workflow/cron changes", gitChangedNames([".github/workflows", "vercel.json"]).length === 0);
check("publish scripts not changed", gitChangedNames([
  "scripts/publish-zodiac-by-date.mjs",
  "scripts/publish-zodiac-weekly-by-week.mjs",
  "scripts/zodiac-telegram-publisher.mjs",
  "scripts/publish-due.mjs",
  "scripts/publish-due-json.mjs",
]).length === 0);
check("package.json not changed", gitChangedNames(["package.json"]).length === 0);
check("no DB schema/migration change", gitChangedNames(["prisma", "supabase", "migrations", "schema.prisma"]).filter((file) => /(^|\/)(prisma|supabase|migrations)(\/|$)|schema\.prisma$/i.test(file)).length === 0);
check("no secret files changed", gitChangedNames([
  ".env",
  ".env.local",
  ".env.production",
  ".env.production.local",
  ".env.development.local",
]).length === 0);

const changedFiles = gitChangedNames(["app", "lib", "scripts", "docs", "package.json", ".github", "vercel.json", "prisma", "supabase", "migrations", "schema.prisma"]);
const allowedChanges = new Set([
  "app/dashboard/networks/zodiac/page.tsx",
  "app/dashboard/networks/zodiac/final-content-cta-inventory-audit/page.tsx",
  "lib/zodiac/aphrodite-final-content-cta-inventory-audit.ts",
  "scripts/qa-aphrodite-final-content-cta-inventory-audit.mjs",
  "scripts/qa-zodiac-dashboard.mjs",
  "docs/aphrodite-final-content-cta-inventory-audit.md",
  "docs/aphrodite-package-reports/package-219.md",
]);
check("changed files limited to Package 219 readiness layer", changedFiles.every((file) => allowedChanges.has(file)));

check("no Telegram API implementation", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(safetyBundle));
check("no Telegram payment handler implementation", !/pre_checkout|successful_payment|answerPreCheckoutQuery|createInvoiceLink/i.test(safetyBundle));
check("no BotFather action implementation", !/setChatMenuButton|setMyCommands|setWebhook|deleteWebhook/i.test(safetyBundle));
check("no active CTA implementation change", !/activeCtaLogicChanged:\s*true|activeCtaChanged:\s*true|sendAllowedNow=true|canCallTelegramApiNow=true/i.test(safetyBundle));
check("no prisma write implementation", !/prisma\.[a-zA-Z0-9_]+\.(create|update|delete|upsert)|prisma\.(create|update|delete|upsert)/i.test(safetyBundle));
check("no DB write implementation", !/from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(|events\.insert|insert.*event/i.test(safetyBundle));
check("no payment or VIP implementation", !/from ['"]stripe|new Stripe\b|sendInvoice\s*\(|createInvoiceLink\s*\(|createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|allowed=true|productionPaymentAllowedNow=true|publicLaunchApproved:\s*true|ownerManualReviewRequired:\s*false/i.test(safetyBundle));
check("no external analytics implementation", !/analytics\.track|posthog|amplitude|gtag|GoogleAnalytics|sendEvent|trackEvent|navigator\.sendBeacon/i.test(safetyBundle));

console.log(`\nQA complete: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
