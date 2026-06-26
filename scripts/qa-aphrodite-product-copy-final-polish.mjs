#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  APHRODITE_PRODUCT_COPY_FINAL_POLISH_CLASSIFICATION,
  APHRODITE_PRODUCT_COPY_FINAL_POLISH_SAFETY_LABELS,
  APHRODITE_PRODUCT_COPY_FINAL_POLISH_TITLE,
  getAphroditeProductCopyFinalPolish,
} from "../lib/zodiac/aphrodite-product-copy-final-polish.ts";

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

console.log("Старт QA: Product Copy Final Polish...\n");

const modelPath = "../lib/zodiac/aphrodite-product-copy-final-polish.ts";
const pagePath = "../app/dashboard/networks/zodiac/product-copy-final-polish/page.tsx";
const docsPath = "../docs/aphrodite-product-copy-final-polish.md";
const reportPath = "../docs/aphrodite-package-reports/package-194.md";
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
const copyPolish = getAphroditeProductCopyFinalPolish();

check("model returns title", copyPolish.title === APHRODITE_PRODUCT_COPY_FINAL_POLISH_TITLE);
check("model returns classification", copyPolish.classification === APHRODITE_PRODUCT_COPY_FINAL_POLISH_CLASSIFICATION);
check("copy standards exist", copyPolish.standards.length >= 14);
check("all standards are copy-only", copyPolish.standards.every((standard) => standard.source === "copy-polish-only"));
check("guardrails exist", copyPolish.guardrails.length >= 6);
check("all guardrails required", copyPolish.guardrails.every((item) => item.required === true));
check("boundaries exist", copyPolish.boundaries.length >= 6);
check("summary docs/dashboard only true", copyPolish.summary.onlyDocsDashboardCopyNow === true);
check("live copy flag false", copyPolish.liveCopyChangedNow === false);
check("docs/dashboard only true", copyPolish.onlyDocsDashboardCopyNow === true);
check("payment enabled false", copyPolish.paymentEnabledNow === false);
check("vip unlock false", copyPolish.vipUnlockNow === false);
check("telegram api false", copyPolish.telegramApiNow === false);
check("database write false", copyPolish.databaseWriteNow === false);
check("production launch false", copyPolish.productionLaunchNow === false);

for (const standard of [
  "first screen promise",
  "AI Love Reading",
  "compatibility",
  "birth matrix",
  "30 days couple",
  "daily/weekly/monthly horoscopes",
  "Full Love Report teaser",
  "paywall copy future",
  "support/refund wording",
  "privacy disclaimers",
  "no hard prophecy",
  "no manipulative fear copy",
  "no medical/legal/financial advice",
  "short mobile-readable text",
]) {
  check(`required copy standard exists: ${standard}`, copyPolish.standards.some((item) => item.label === standard) && userFacingBundle.includes(standard));
}

for (const guardrail of [
  "warm, not fatalistic",
  "preview, not payment",
  "clear period labels",
  "no pressure",
  "privacy plain language",
  "mobile short",
]) {
  check(`required guardrail exists: ${guardrail}`, copyPolish.guardrails.some((item) => item.label === guardrail) && userFacingBundle.includes(guardrail));
}

for (const label of APHRODITE_PRODUCT_COPY_FINAL_POLISH_SAFETY_LABELS) {
  check(`safety label exists: ${label}`, userFacingBundle.includes(label));
}

check("dashboard QA route key exists", dashboardQaSource.includes("productCopyFinalPolish"));
check("dashboard QA overview link exists", dashboardQaSource.includes("/dashboard/networks/zodiac/product-copy-final-polish"));
check("page renders title from model", pageSource.includes("copyPolish.title") && userFacingBundle.includes(APHRODITE_PRODUCT_COPY_FINAL_POLISH_TITLE));
check("page renders classification from model", pageSource.includes("copyPolish.classification") && userFacingBundle.includes(APHRODITE_PRODUCT_COPY_FINAL_POLISH_CLASSIFICATION));
check("docs say copy polish no payment", docsSource.includes("Copy polish не включает оплату") && docsSource.includes("Нет Telegram API"));
check("report says Package 194", reportSource.includes("Package 194"));
check("report points to Package 195", reportSource.includes("Package 195"));

const liveCopyChanges = gitDiffNames([
  "app/miniapp",
  "app/compatibility",
  "app/birth-matrix",
  "components/zodiac-mini-app",
  "components/ZodiacCompatibilityMiniApp.tsx",
  "components/ZodiacMysticSections.tsx",
  "components/ZodiacVipSections.tsx",
  "lib/zodiac-mystic-content.ts",
  "lib/zodiac-ai-love-reading",
]);
check("live copy surfaces not changed", liveCopyChanges.length === 0);
check("no production launch implementation", !/startProductionLaunch\s*\(|runLaunch\s*\(|productionLaunchNow:\s*true|sendAllowedNow=true|canCallTelegramApiNow=true/i.test(implementationBundle));
check("no Telegram API", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(implementationBundle));
check("no DB write", !/from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(|events\.insert|insert.*event/i.test(implementationBundle));
check("no payment or VIP changes", !/sendInvoice\s*\(|createInvoiceLink\s*\(|paymentEnabledNow:\s*true|createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|createsEntitlementNow=true|unlocksVipNow=true|grantsAccessNow=true|productionPaymentAllowedNow=true/i.test(implementationBundle));
check("no cron/workflow changes", gitDiffNames([".github/workflows", "vercel.json"]).length === 0);
check("publish scripts not changed", gitDiffNames(["scripts/publish-zodiac-by-date.mjs", "scripts/publish-zodiac-weekly-by-week.mjs", "scripts/zodiac-telegram-publisher.mjs", "scripts/publish-due.mjs", "scripts/publish-due-json.mjs"]).length === 0);
check("package.json not changed", gitDiffNames(["package.json"]).length === 0);
check("no DB schema/migration change", gitDiffNames(["prisma", "supabase", "migrations", "schema.prisma"]).filter((file) => /(^|\/)(prisma|supabase|migrations)(\/|$)|schema\.prisma$/i.test(file)).length === 0);

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
