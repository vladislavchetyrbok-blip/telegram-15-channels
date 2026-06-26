#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  APHRODITE_MINIAPP_SIMPLIFIED_REDESIGN_PLAN_CLASSIFICATION,
  APHRODITE_MINIAPP_SIMPLIFIED_REDESIGN_PLAN_SAFETY_LABELS,
  APHRODITE_MINIAPP_SIMPLIFIED_REDESIGN_PLAN_TITLE,
  getAphroditeMiniappSimplifiedRedesignImplementationPlan,
} from "../lib/zodiac/aphrodite-miniapp-simplified-redesign-implementation-plan.ts";

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

console.log("Старт QA: Aphrodite Mini App Simplified Redesign Implementation Plan...\n");

const modelPath = "../lib/zodiac/aphrodite-miniapp-simplified-redesign-implementation-plan.ts";
const pagePath = "../app/dashboard/networks/zodiac/miniapp-simplified-redesign-implementation-plan/page.tsx";
const docsPath = "../docs/aphrodite-miniapp-simplified-redesign-implementation-plan.md";
const reportPath = "../docs/aphrodite-package-reports/package-196.md";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";

check("model exists", exists(modelPath));
check("dashboard exists", exists(pagePath));
check("docs exist", exists(docsPath));
check("package report exists", exists(reportPath));

const modelSource = exists(modelPath) ? read(modelPath) : "";
const pageSource = exists(pagePath) ? read(pagePath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";
const implementationBundle = [modelSource, pageSource].join("\n");
const userFacingBundle = [modelSource, pageSource, docsSource, reportSource].join("\n");
const plan = getAphroditeMiniappSimplifiedRedesignImplementationPlan();

check("model returns title", plan.title === APHRODITE_MINIAPP_SIMPLIFIED_REDESIGN_PLAN_TITLE);
check("model returns classification", plan.classification === APHRODITE_MINIAPP_SIMPLIFIED_REDESIGN_PLAN_CLASSIFICATION);
check("redesign areas exist", plan.redesignAreas.length >= 18);
check("all redesign areas are plan-only", plan.redesignAreas.every((area) => area.source === "implementation-plan-only"));
check("phases exist", plan.phases.length >= 5);
check("runtime states exist", plan.runtimeStates.length >= 6);
check("boundaries exist", plan.boundaries.length >= 7);
check("summary live ui false", plan.summary.liveUiChangedNow === false);
check("live ui flag false", plan.liveUiChangedNow === false);
check("live design flag false", plan.liveDesignChangedNow === false);
check("payment changed false", plan.paymentChangedNow === false);
check("vip unlock false", plan.vipUnlockNow === false);
check("telegram api false", plan.telegramApiNow === false);
check("database write false", plan.databaseWriteNow === false);
check("production launch false", plan.productionLaunchNow === false);

for (const area of [
  "simplified home screen",
  "fewer primary modules on first screen",
  "clear first CTA: AI Love Reading",
  "secondary modules below: Compatibility, Birth Matrix, Daily/Weekly/Monthly",
  "cleaner card style",
  "less visual noise",
  "improved spacing",
  "improved typography",
  "premium mystical style",
  "mobile-first layout",
  "Telegram safe area",
  "loading states",
  "empty states",
  "error states",
  "dark theme consistency",
  "fallback route styling",
  "guard denied styling",
  "future paywall styling",
]) {
  check(`required redesign area exists: ${area}`, plan.redesignAreas.some((item) => item.label === area) && userFacingBundle.includes(area));
}

for (const state of ["loading states", "empty states", "error states", "fallback route styling", "guard denied styling", "future paywall styling"]) {
  check(`runtime state covered: ${state}`, plan.runtimeStates.some((item) => item.label === state) && userFacingBundle.includes(state));
}

for (const label of APHRODITE_MINIAPP_SIMPLIFIED_REDESIGN_PLAN_SAFETY_LABELS) {
  check(`safety label exists: ${label}`, userFacingBundle.includes(label));
}

check("AI Love Reading primary CTA is documented", userFacingBundle.includes("AI Love Reading") && userFacingBundle.includes("primary CTA"));
check("mobile-first is documented", userFacingBundle.includes("mobile-first layout") && userFacingBundle.includes("Telegram safe area"));
check("dark theme is documented", userFacingBundle.includes("dark theme consistency"));
check("live UI not modified text exists", userFacingBundle.includes("Live UI не изменён"));
check("dashboard QA route key exists", dashboardQaSource.includes("miniappSimplifiedRedesignImplementationPlan"));
check("dashboard QA overview link exists", dashboardQaSource.includes("/dashboard/networks/zodiac/miniapp-simplified-redesign-implementation-plan"));
check("page renders title from model", pageSource.includes("plan.title") && userFacingBundle.includes(APHRODITE_MINIAPP_SIMPLIFIED_REDESIGN_PLAN_TITLE));
check("page renders classification from model", pageSource.includes("plan.classification") && userFacingBundle.includes(APHRODITE_MINIAPP_SIMPLIFIED_REDESIGN_PLAN_CLASSIFICATION));
check("docs say Package 196", docsSource.includes("Package 196"));
check("report says Package 196", reportSource.includes("Package 196"));
check("report points to Package 197", reportSource.includes("Package 197"));

check("Package 196 remains plan-only, without live UI imports", !/app\/miniapp\/page|app\/compatibility\/page|app\/birth-matrix\/page|ZodiacCompatibilityMiniApp|ResultPanel|ResultCards|AphroditeMiniAppShell/.test(implementationBundle));
check("no production launch implementation", !/startProductionLaunch\s*\(|runLaunch\s*\(|productionLaunchNow:\s*true|sendAllowedNow=true|canCallTelegramApiNow=true/i.test(implementationBundle));
check("no Telegram API", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(implementationBundle));
check("no DB write", !/from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(|events\.insert|insert.*event/i.test(implementationBundle));
check("no payment or VIP changes", !/sendInvoice\s*\(|createInvoiceLink\s*\(|paymentChangedNow:\s*true|createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|createsEntitlementNow=true|unlocksVipNow=true|grantsAccessNow=true|productionPaymentAllowedNow=true/i.test(implementationBundle));
check("no cron/workflow changes", gitDiffNames([".github/workflows", "vercel.json"]).length === 0);
check("publish scripts not changed", gitDiffNames(["scripts/publish-zodiac-by-date.mjs", "scripts/publish-zodiac-weekly-by-week.mjs", "scripts/zodiac-telegram-publisher.mjs", "scripts/publish-due.mjs", "scripts/publish-due-json.mjs"]).length === 0);
check("package.json not changed", gitDiffNames(["package.json"]).length === 0);
check("no DB schema/migration change", gitDiffNames(["prisma", "supabase", "migrations", "schema.prisma"]).filter((file) => /(^|\/)(prisma|supabase|migrations)(\/|$)|schema\.prisma$/i.test(file)).length === 0);

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
