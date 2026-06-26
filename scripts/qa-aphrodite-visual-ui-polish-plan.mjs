#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  APHRODITE_VISUAL_UI_POLISH_PLAN_CLASSIFICATION,
  APHRODITE_VISUAL_UI_POLISH_PLAN_SAFETY_LABELS,
  APHRODITE_VISUAL_UI_POLISH_PLAN_TITLE,
  getAphroditeVisualUiPolishPlan,
} from "../lib/zodiac/aphrodite-visual-ui-polish-plan.ts";

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

console.log("Старт QA: Aphrodite Visual UI Polish Plan...\n");

const modelPath = "../lib/zodiac/aphrodite-visual-ui-polish-plan.ts";
const pagePath = "../app/dashboard/networks/zodiac/visual-ui-polish-plan/page.tsx";
const docsPath = "../docs/aphrodite-visual-ui-polish-plan.md";
const reportPath = "../docs/aphrodite-package-reports/package-193.md";
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
const polishPlan = getAphroditeVisualUiPolishPlan();

check("model returns title", polishPlan.title === APHRODITE_VISUAL_UI_POLISH_PLAN_TITLE);
check("model returns classification", polishPlan.classification === APHRODITE_VISUAL_UI_POLISH_PLAN_CLASSIFICATION);
check("polish areas exist", polishPlan.polishAreas.length >= 15);
check("all polish areas are plan-only", polishPlan.polishAreas.every((area) => area.source === "visual-plan-only"));
check("principles exist", polishPlan.principles.length >= 6);
check("all principles not started", polishPlan.principles.every((item) => item.implementationState === "not-started"));
check("boundaries exist", polishPlan.boundaries.length >= 7);
check("summary live design false", polishPlan.summary.liveDesignChangedNow === false);
check("live design flag false", polishPlan.liveDesignChangedNow === false);
check("live ui flag false", polishPlan.liveUiChangedNow === false);
check("payment changed false", polishPlan.paymentChangedNow === false);
check("vip unlock false", polishPlan.vipUnlockNow === false);
check("telegram api false", polishPlan.telegramApiNow === false);
check("database write false", polishPlan.databaseWriteNow === false);
check("production launch false", polishPlan.productionLaunchNow === false);

for (const area of [
  "simplified visual style",
  "premium mystical but not overloaded",
  "readable cards",
  "fewer gradients",
  "better spacing",
  "clearer typography",
  "main CTA hierarchy",
  "result cards style",
  "compatibility result style",
  "Love Reading result style",
  "weekly/monthly horoscope cards",
  "loading/empty states",
  "mobile first",
  "Telegram WebApp safe area",
  "dark theme consistency",
]) {
  check(`required polish area exists: ${area}`, polishPlan.polishAreas.some((item) => item.label === area) && userFacingBundle.includes(area));
}

for (const principle of [
  "calm premium",
  "mystical with control",
  "result first",
  "mobile scan",
  "single action focus",
  "consistent surfaces",
]) {
  check(`required principle exists: ${principle}`, polishPlan.principles.some((item) => item.label === principle) && userFacingBundle.includes(principle));
}

for (const label of APHRODITE_VISUAL_UI_POLISH_PLAN_SAFETY_LABELS) {
  check(`safety label exists: ${label}`, userFacingBundle.includes(label));
}

check("dashboard QA route key exists", dashboardQaSource.includes("visualUiPolishPlan"));
check("dashboard QA overview link exists", dashboardQaSource.includes("/dashboard/networks/zodiac/visual-ui-polish-plan"));
check("page renders title from model", pageSource.includes("polishPlan.title") && userFacingBundle.includes(APHRODITE_VISUAL_UI_POLISH_PLAN_TITLE));
check("page renders classification from model", pageSource.includes("polishPlan.classification") && userFacingBundle.includes(APHRODITE_VISUAL_UI_POLISH_PLAN_CLASSIFICATION));
check("docs say live design unchanged", docsSource.includes("Live дизайн не изменён") && docsSource.includes("Нет Telegram API"));
check("report says Package 193", reportSource.includes("Package 193"));
check("report points to Package 194", reportSource.includes("Package 194"));

const liveDesignChanges = gitDiffNames([
  "app/miniapp",
  "app/compatibility",
  "app/birth-matrix",
  "components/zodiac-mini-app",
  "components/ZodiacCompatibilityMiniApp.tsx",
  "components/ZodiacMysticSections.tsx",
  "components/ZodiacVipSections.tsx",
  "app/globals.css",
  "tailwind.config.ts",
]);
check("live Mini App design paths not changed", liveDesignChanges.length === 0);
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
