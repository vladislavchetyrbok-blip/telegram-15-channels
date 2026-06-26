#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  APHRODITE_PAYMENT_LEDGER_MOCK_CLASSIFICATION,
  APHRODITE_PAYMENT_LEDGER_MOCK_SAFETY_LABELS,
  APHRODITE_PAYMENT_LEDGER_MOCK_TITLE,
  getAphroditePaymentLedgerMockIntegrationBoundaries,
  getAphroditePaymentLedgerMockIntegrationNextSteps,
  getAphroditePaymentLedgerMockIntegrationSteps,
  simulateAphroditePaymentLedgerMockIntegration,
} from "../lib/zodiac/aphrodite-payment-ledger-mock-integration.ts";

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

console.log("Старт QA: payment ledger mock integration Aphrodite...\n");

const modelPath = "../lib/zodiac/aphrodite-payment-ledger-mock-integration.ts";
const pagePath = "../app/dashboard/networks/zodiac/payment-ledger-mock-integration/page.tsx";
const docsPath = "../docs/aphrodite-payment-ledger-mock-integration.md";
const reportPath = "../docs/aphrodite-package-reports/package-173.md";
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

const steps = getAphroditePaymentLedgerMockIntegrationSteps();
const boundaries = getAphroditePaymentLedgerMockIntegrationBoundaries();
const nextSteps = getAphroditePaymentLedgerMockIntegrationNextSteps();
const result = simulateAphroditePaymentLedgerMockIntegration({
  productId: "full_love_report",
  telegramUserId: "12345",
  amount: 299,
  currency: "XTR",
  invoicePayload: "aphrodite:full_love_report:12345",
  mockPaymentChargeId: "mock-charge",
});

check("mock simulation function exists", typeof simulateAphroditePaymentLedgerMockIntegration === "function");
check("steps exist", steps.length === 8);
check("boundaries exist", boundaries.length >= 6);
check("next steps exist", nextSteps.some((step) => step.package === "Package 174"));
check("uses or references invoice builder skeleton", result.referencedSkeletons.includes("buildAphroditeStarsInvoiceDraftSkeleton") && userFacingBundle.includes("buildAphroditeStarsInvoiceDraftSkeleton"));
check("uses or references pre-checkout skeleton", result.referencedSkeletons.includes("validateAphroditePreCheckoutSkeleton") && userFacingBundle.includes("validateAphroditePreCheckoutSkeleton"));
check("uses or references successful_payment skeleton", result.referencedSkeletons.includes("inspectAphroditeSuccessfulPaymentSkeleton") && userFacingBundle.includes("inspectAphroditeSuccessfulPaymentSkeleton"));

for (const label of [
  "1. product catalog lookup",
  "2. invoice draft skeleton",
  "3. pre-checkout skeleton",
  "4. successful_payment skeleton",
  "5. mock ledger preview",
  "6. no entitlement",
  "7. no VIP unlock",
  "8. fallback remains free preview",
]) {
  check(`mock flow step exists: ${label}`, steps.some((step) => step.label === label) && userFacingBundle.includes(label));
}

check("mock result does not write DB", result.writesToDatabaseNow === false);
check("mock result does not persist ledger", result.persistsLedgerNow === false);
check("mock result does not verify payment", result.verifiedPaymentNow === false);
check("mock result does not create entitlement", result.createsEntitlementNow === false);
check("mock result does not unlock VIP", result.unlocksVipNow === false);
check("mock result does not grant access", result.grantsAccessNow === false);
check("mockOnly true", result.mockOnly === true);
check("fallback route exists", result.fallbackRoute === "/miniapp/love-reading-preview" && userFacingBundle.includes("/miniapp/love-reading-preview"));

check("dashboard QA route exists", dashboardQaSource.includes("paymentLedgerMockIntegration"));
check("dashboard QA checks title", dashboardQaSource.includes(APHRODITE_PAYMENT_LEDGER_MOCK_TITLE));
check("dashboard QA checks classification", dashboardQaSource.includes("Только mock"));
check("overview route link exists", dashboardQaSource.includes("/dashboard/networks/zodiac/payment-ledger-mock-integration"));
check("page shows classification", pageSource.includes("APHRODITE_PAYMENT_LEDGER_MOCK_CLASSIFICATION") && userFacingBundle.includes(APHRODITE_PAYMENT_LEDGER_MOCK_CLASSIFICATION));

for (const label of APHRODITE_PAYMENT_LEDGER_MOCK_SAFETY_LABELS) {
  check(`visible safety label exists: ${label}`, userFacingBundle.includes(label));
}

check("docs say package is local preview only", docsSource.includes("Package 173 создаёт только локальную mock-интеграцию payment ledger"));
check("docs say no ledger persistence", docsSource.includes("не сохраняет ledger"));
check("report says no DB write", reportSource.includes("не пишет в базу данных"));
check("report says next package Package 174", reportSource.includes("Package 174 — Entitlement Creation Mock"));

check("no DB write", !/process\.env\.DATABASE_URL|createClient\(|new Pool\(|drizzle\(|from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\(|\.update\(|\.delete\(|\.upsert\(/i.test(implementationBundle));
check("no Telegram API", !/fetch\([^)]*api\.telegram\.org|sendMessage\(|sendPhoto\(|sendDocument\(|sendInvoice\(|answerPreCheckoutQuery\(/i.test(implementationBundle));
check("no active payment action", !/sendAllowedNow\s*:\s*true|canCallTelegramApiNow\s*:\s*true|verifiedPaymentNow\s*:\s*true|persistsLedgerNow\s*:\s*true|writesToDatabaseNow\s*:\s*true/i.test(implementationBundle));
check("no entitlement or VIP action", !/createsEntitlementNow\s*:\s*true|unlocksVipNow\s*:\s*true|grantsAccessNow\s*:\s*true|grantVip\(|unlockVip\(|allowed\s*:\s*true/i.test(implementationBundle));
check("no active payment CTA", !/Купить VIP|Оплатить|Разблокировать отч[её]т|Подписаться|Активировать VIP|Получить доступ после оплаты|Buy now|Subscribe now|Purchase now|Activate VIP|Payment successful|Premium unlocked/i.test(userFacingBundle));

const changedDbFiles = gitDiffNames(["prisma", "supabase", "migrations", "schema.prisma"]).filter((file) =>
  /(^|\/)(prisma|supabase|migrations)(\/|$)|schema\.prisma$/i.test(file),
);
check("no DB schema/migration change", changedDbFiles.length === 0);

const workflowChanges = gitDiffNames([".github/workflows", "package.json"]);
check("workflows and package.json are not changed", workflowChanges.length === 0);

const scriptChanges = gitDiffNames(["scripts"]);
check("only Aphrodite QA scripts and dashboard QA changed in scripts", scriptChanges.every((file) =>
  file === "scripts/qa-zodiac-dashboard.mjs" || /^scripts\/qa-aphrodite-.*\.mjs$/.test(file),
));

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
