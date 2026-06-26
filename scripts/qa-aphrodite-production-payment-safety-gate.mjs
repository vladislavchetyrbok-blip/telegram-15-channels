#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  APHRODITE_PRODUCTION_PAYMENT_REQUIRED_FUTURE_ENV_FLAGS,
  APHRODITE_PRODUCTION_PAYMENT_SAFETY_GATE_CLASSIFICATION,
  APHRODITE_PRODUCTION_PAYMENT_SAFETY_GATE_TITLE,
  APHRODITE_PRODUCTION_PAYMENT_SAFETY_LABELS,
  evaluateAphroditeProductionPaymentSafetyGate,
  getAphroditeProductionPaymentSafetyBoundaries,
  getAphroditeProductionPaymentSafetyNextSteps,
  getAphroditeProductionPaymentSafetyRules,
} from "../lib/zodiac/aphrodite-production-payment-safety-gate.ts";

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

console.log("Старт QA: production payment safety gate Aphrodite...\n");

const modelPath = "../lib/zodiac/aphrodite-production-payment-safety-gate.ts";
const pagePath = "../app/dashboard/networks/zodiac/production-payment-safety-gate/page.tsx";
const docsPath = "../docs/aphrodite-production-payment-safety-gate.md";
const reportPath = "../docs/aphrodite-package-reports/package-175.md";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";

check("model file exists", exists(modelPath));
check("dashboard page exists", exists(pagePath));
check("docs exist", exists(docsPath));
check("package report exists", exists(reportPath));

const modelSource = exists(modelPath) ? read(modelPath) : "";
const pageSource = exists(pagePath) ? read(pagePath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";
const implementationBundle = [modelSource, pageSource].join("\n");
const userFacingBundle = [modelSource, pageSource, docsSource, reportSource].join("\n");

const rules = getAphroditeProductionPaymentSafetyRules();
const boundaries = getAphroditeProductionPaymentSafetyBoundaries();
const nextSteps = getAphroditeProductionPaymentSafetyNextSteps();

check("evaluateAphroditeProductionPaymentSafetyGate exists", typeof evaluateAphroditeProductionPaymentSafetyGate === "function");
check("rules exist", rules.length >= 13);
check("boundaries exist", boundaries.length >= 14);
check("next step is Package 176 but not started", nextSteps.some((step) => step.package === "Package 176"));

const defaultResult = evaluateAphroditeProductionPaymentSafetyGate();
const allTrueResult = evaluateAphroditeProductionPaymentSafetyGate({
  ownerApproved: true,
  paymentsEnabled: true,
  starsLiveEnabled: true,
  entitlementsEnabled: true,
  productionLaunchApproved: true,
  databaseConfigured: true,
  telegramBotTokenConfigured: true,
  backupFresh: true,
  supportReady: true,
  refundPolicyReady: true,
  securityQaPassed: true,
  paymentLedgerReady: true,
  entitlementStorageReady: true,
});

check("default result returns productionPaymentAllowedNow=false", defaultResult.productionPaymentAllowedNow === false);
check("all-true mock input still returns productionPaymentAllowedNow=false", allTrueResult.productionPaymentAllowedNow === false);
check("telegramStarsLiveAllowedNow=false", allTrueResult.telegramStarsLiveAllowedNow === false);
check("invoiceSendingAllowedNow=false", allTrueResult.invoiceSendingAllowedNow === false);
check("preCheckoutAllowedNow=false", allTrueResult.preCheckoutAllowedNow === false);
check("successfulPaymentHandlingAllowedNow=false", allTrueResult.successfulPaymentHandlingAllowedNow === false);
check("paymentLedgerWriteAllowedNow=false", allTrueResult.paymentLedgerWriteAllowedNow === false);
check("entitlementCreationAllowedNow=false", allTrueResult.entitlementCreationAllowedNow === false);
check("vipUnlockAllowedNow=false", allTrueResult.vipUnlockAllowedNow === false);
check("databaseWriteAllowedNow=false", allTrueResult.databaseWriteAllowedNow === false);
check("productionLaunchAllowedNow=false", allTrueResult.productionLaunchAllowedNow === false);
check("visible message is fail-closed", allTrueResult.visibleMessage.includes("всегда закрыт"));
check("all runtime permissions are false", [
  allTrueResult.productionPaymentAllowedNow,
  allTrueResult.telegramStarsLiveAllowedNow,
  allTrueResult.invoiceSendingAllowedNow,
  allTrueResult.preCheckoutAllowedNow,
  allTrueResult.successfulPaymentHandlingAllowedNow,
  allTrueResult.paymentLedgerWriteAllowedNow,
  allTrueResult.entitlementCreationAllowedNow,
  allTrueResult.vipUnlockAllowedNow,
  allTrueResult.databaseWriteAllowedNow,
  allTrueResult.productionLaunchAllowedNow,
].every((value) => value === false));

for (const flag of APHRODITE_PRODUCTION_PAYMENT_REQUIRED_FUTURE_ENV_FLAGS) {
  check(`future env flag documented: ${flag}`, userFacingBundle.includes(flag));
}

check("owner review dependency exists", rules.some((rule) => rule.area === "owner-review") && userFacingBundle.includes("Owner review dependency"));
check("database/backup dependency exists", userFacingBundle.includes("Database/backup dependency") && userFacingBundle.includes("backup"));
check("support/refund dependency exists", rules.some((rule) => rule.area === "support-refund") && userFacingBundle.includes("Support/refund dependency"));
check("security QA dependency exists", rules.some((rule) => rule.area === "security-qa") && userFacingBundle.includes("Security QA dependency"));
check("payment ledger dependency exists", rules.some((rule) => rule.area === "payment-ledger") && userFacingBundle.includes("Payment ledger dependency"));
check("entitlement dependency exists", rules.some((rule) => rule.area === "entitlement-creation") && userFacingBundle.includes("Entitlement dependency"));

check("dashboard QA route exists", dashboardQaSource.includes("productionPaymentSafetyGate"));
check("dashboard QA checks title", dashboardQaSource.includes(APHRODITE_PRODUCTION_PAYMENT_SAFETY_GATE_TITLE));
check("dashboard QA checks classification", dashboardQaSource.includes("Fail-closed safety gate"));
check("overview route link exists", dashboardQaSource.includes("/dashboard/networks/zodiac/production-payment-safety-gate"));
check("page shows classification", pageSource.includes("APHRODITE_PRODUCTION_PAYMENT_SAFETY_GATE_CLASSIFICATION") && userFacingBundle.includes(APHRODITE_PRODUCTION_PAYMENT_SAFETY_GATE_CLASSIFICATION));
check("page shows payment denied result", pageSource.includes("productionPaymentAllowedNow") && userFacingBundle.includes("productionPaymentAllowedNow=false"));
check("page shows VIP denied result", pageSource.includes("vipUnlockAllowedNow") && userFacingBundle.includes("vipUnlockAllowedNow=false"));

for (const label of APHRODITE_PRODUCTION_PAYMENT_SAFETY_LABELS) {
  check(`Russian visible safety label exists: ${label}`, userFacingBundle.includes(label));
}

for (const file of [
  "../app/dashboard/networks/zodiac/page.tsx",
  "../app/dashboard/networks/zodiac/owner-review-gate/page.tsx",
  "../app/dashboard/networks/zodiac/telegram-stars-payment-architecture-review/page.tsx",
  "../app/dashboard/networks/zodiac/telegram-stars-invoice-builder-skeleton/page.tsx",
  "../app/dashboard/networks/zodiac/telegram-stars-precheckout-skeleton/page.tsx",
  "../app/dashboard/networks/zodiac/telegram-stars-successful-payment-skeleton/page.tsx",
  "../app/dashboard/networks/zodiac/payment-ledger-mock-integration/page.tsx",
  "../app/dashboard/networks/zodiac/entitlement-creation-mock/page.tsx",
  "../app/dashboard/networks/zodiac/vip-access-security-suite/page.tsx",
  "../app/dashboard/networks/zodiac/product-catalog-finalization/page.tsx",
]) {
  check(`Production Safety Gate link exists in ${file}`, read(file).includes("/dashboard/networks/zodiac/production-payment-safety-gate"));
}

check("docs say fail-closed gate only", docsSource.includes("Package 175 создаёт только fail-closed production payment safety gate"));
check("docs say no payment implementation", docsSource.includes("не реализует оплату"));
check("docs say no Telegram Stars invoice", docsSource.includes("не реализует Telegram Stars invoice"));
check("docs say no active Telegram CTA change", docsSource.includes("не меняет активную Telegram CTA-логику"));
check("docs say daily/weekly automation remains unblocked", docsSource.includes("Daily/weekly automation остаётся не заблокированной"));
check("report says next package Package 176", reportSource.includes("Package 176 — First Paid MVP Readiness Review"));

check("no real payment API is used", !/stripe\.|checkout\.sessions|paymentIntent|createPayment|payments\.create|sendInvoice\(|createInvoiceLink\(/i.test(implementationBundle));
check("no sendInvoice", !/sendInvoice\s*\(/.test(implementationBundle));
check("no createInvoiceLink", !/createInvoiceLink\s*\(/.test(implementationBundle));
check("no pre_checkout_query handler", !/pre_checkout_query["']?\s*[:=]|answerPreCheckoutQuery\s*\(|case\s+["']pre_checkout_query["']/.test(implementationBundle));
check("no successful_payment handler", !/successful_payment["']?\s*[:=]|case\s+["']successful_payment["']|onSuccessfulPayment|handleSuccessfulPayment\s*\(/.test(implementationBundle));
check("no payment ledger write", !/paymentLedgerWriteAllowedNow\s*:\s*true|recordsPaymentLedgerNow\s*:\s*true|persistsLedgerNow\s*:\s*true|\.insert\(|\.upsert\(/i.test(implementationBundle));
check("no entitlement creation function", !/entitlementCreationAllowedNow\s*:\s*true|createsEntitlementNow\s*:\s*true|export\s+function\s+create\w*Entitlement|function\s+create\w*Entitlement|grantVip\s*\(|unlockVip\s*\(/i.test(implementationBundle));
check("no DB write", !/process\.env\.DATABASE_URL|createClient\(|new Pool\(|drizzle\(|from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\(|\.update\(|\.delete\(|\.upsert\(/i.test(implementationBundle));
check("no DB schema/migration change", gitDiffNames(["prisma", "supabase", "migrations", "schema.prisma"]).filter((file) => /(^|\/)(prisma|supabase|migrations)(\/|$)|schema\.prisma$/i.test(file)).length === 0);
check("no Telegram API call", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|answerPreCheckoutQuery\s*\(/i.test(implementationBundle));
check("no production launch switch", !/productionPaymentAllowedNow\s*:\s*true|productionLaunchAllowedNow\s*:\s*true|productionLaunchApproved\s*&&\s*true|approvedForLaunch\s*:\s*true/i.test(implementationBundle));
check("no active payment CTA", !/Купить VIP|Оплатить|Разблокировать отч[её]т|Подписаться|Активировать VIP|Получить доступ после оплаты|Buy now|Subscribe now|Purchase now|Activate VIP|Payment successful|Premium unlocked/i.test(userFacingBundle));

const workflowChanges = gitDiffNames([".github/workflows", "package.json"]);
check("workflows and package.json are not changed", workflowChanges.length === 0);

const scriptChanges = gitDiffNames(["scripts"]);
check("only Aphrodite QA scripts and dashboard QA changed in scripts", scriptChanges.every((file) =>
  file === "scripts/qa-zodiac-dashboard.mjs" || /^scripts\/qa-aphrodite-.*\.mjs$/.test(file),
));

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
