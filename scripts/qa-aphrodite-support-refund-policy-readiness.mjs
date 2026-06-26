#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  APHRODITE_SUPPORT_REFUND_READINESS_CLASSIFICATION,
  APHRODITE_SUPPORT_REFUND_READINESS_TITLE,
  APHRODITE_SUPPORT_REFUND_SAFETY_LABELS,
  getAphroditeRefundScenarios,
  getAphroditeSupportRefundBoundaries,
  getAphroditeSupportRefundNextSteps,
  getAphroditeSupportRefundReadinessItems,
} from "../lib/zodiac/aphrodite-support-refund-policy-readiness.ts";

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

console.log("Старт QA: Support & Refund Policy Readiness Aphrodite...\n");

const modelPath = "../lib/zodiac/aphrodite-support-refund-policy-readiness.ts";
const pagePath = "../app/dashboard/networks/zodiac/support-refund-policy-readiness/page.tsx";
const docsPath = "../docs/aphrodite-support-refund-policy-readiness.md";
const reportPath = "../docs/aphrodite-package-reports/package-179.md";
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

const readinessItems = getAphroditeSupportRefundReadinessItems();
const refundScenarios = getAphroditeRefundScenarios();
const boundaries = getAphroditeSupportRefundBoundaries();
const nextSteps = getAphroditeSupportRefundNextSteps();

check("readiness items exist", readinessItems.length >= 12);
check("refund scenarios exist", refundScenarios.length >= 9);
check("safety boundaries exist", boundaries.length >= 15);
check("next steps exist", nextSteps.length >= 1);

for (const id of [
  "telegram-paysupport-readiness",
  "support-contact-readiness",
  "refund-policy-draft",
  "failed-payment-support",
  "duplicate-payment-support",
  "wrong-product-dispute",
  "successful-payment-report-not-opened",
  "entitlement-revocation-after-refund",
  "manual-owner-review",
  "terms-privacy-dependency",
  "telegram-stars-policy-dependency",
  "user-expectation-disclaimer",
]) {
  check(`readiness item exists: ${id}`, readinessItems.some((item) => item.id === id));
}

for (const id of [
  "duplicate-payment",
  "payment-succeeded-access-not-delivered",
  "wrong-product-selected",
  "technical-error-after-payment",
  "refund-after-reading-report",
  "telegram-stars-platform-limitation",
  "abuse-fraud-manual-review",
  "refund-approved-entitlement-revoked",
  "refund-denied-with-explanation",
]) {
  check(`refund scenario exists: ${id}`, refundScenarios.some((scenario) => scenario.id === id));
}

check("/paysupport readiness exists", userFacingBundle.includes("/paysupport"));
check("support contact readiness exists", userFacingBundle.includes("support contact"));
check("refund policy exists", userFacingBundle.includes("refund policy"));
check("manual owner review exists", userFacingBundle.includes("manual owner review") || userFacingBundle.includes("owner review"));
check("duplicate payment scenario exists", refundScenarios.some((scenario) => scenario.id === "duplicate-payment"));
check("payment succeeded access not delivered scenario exists", refundScenarios.some((scenario) => scenario.id === "payment-succeeded-access-not-delivered"));
check("wrong product scenario exists", refundScenarios.some((scenario) => scenario.id === "wrong-product-selected"));
check("refund approved entitlement revoked scenario exists", refundScenarios.some((scenario) => scenario.id === "refund-approved-entitlement-revoked"));
check("Telegram Stars policy dependency exists", readinessItems.some((item) => item.id === "telegram-stars-policy-dependency"));
check("terms/privacy dependency exists", readinessItems.some((item) => item.id === "terms-privacy-dependency"));
check("all scenarios require manual review", refundScenarios.every((scenario) => scenario.manualReviewRequired === true));

check("dashboard route key exists", dashboardQaSource.includes("supportRefundPolicyReadiness"));
check("dashboard QA checks title", dashboardQaSource.includes(APHRODITE_SUPPORT_REFUND_READINESS_TITLE) || dashboardQaSource.includes("Support &amp; Refund Readiness"));
check("dashboard QA checks classification", dashboardQaSource.includes("Только policy readiness"));
check("overview route link exists", dashboardQaSource.includes("/dashboard/networks/zodiac/support-refund-policy-readiness"));
check("page shows title", userFacingBundle.includes(APHRODITE_SUPPORT_REFUND_READINESS_TITLE));
check("page shows classification", userFacingBundle.includes(APHRODITE_SUPPORT_REFUND_READINESS_CLASSIFICATION));
check("page shows /paysupport requirements", pageSource.includes("future /paysupport requirements"));
check("page shows refund scenarios", pageSource.includes("refund scenarios"));
check("page shows manual owner review rules", pageSource.includes("manual owner review rules"));
check("page shows terms/privacy dependencies", pageSource.includes("terms/privacy dependencies"));
check("page shows Telegram Stars support notes", pageSource.includes("Telegram Stars support notes"));
check("page shows entitlement revocation dependency", pageSource.includes("entitlement revocation dependency"));
check("page shows ledger dependency", pageSource.includes("ledger dependency"));

for (const label of APHRODITE_SUPPORT_REFUND_SAFETY_LABELS) {
  check(`Russian visible safety label exists: ${label}`, userFacingBundle.includes(label));
}

for (const boundary of [
  "no-real-payment",
  "no-stars-invoice",
  "no-send-invoice",
  "no-create-invoice-link",
  "no-pre-checkout-handler",
  "no-successful-payment-handler",
  "no-payment-ledger-write",
  "no-entitlement-creation",
  "no-real-vip-unlock",
  "no-automatic-refund",
  "no-database-write",
  "no-database-schema-migration",
  "no-telegram-api-call",
  "no-production-launch",
  "support-readiness-no-payment",
]) {
  check(
    `safety boundary exists: ${boundary}`,
    boundaries.some((item) => item.dataBoundary === boundary) && userFacingBundle.includes(boundary) && pageSource.includes("data-boundary={boundary.dataBoundary}"),
  );
}

for (const file of [
  "../app/dashboard/networks/zodiac/page.tsx",
  "../app/dashboard/networks/zodiac/first-paid-mvp-readiness-review/page.tsx",
  "../app/dashboard/networks/zodiac/product-catalog-finalization/page.tsx",
  "../app/dashboard/networks/zodiac/production-payment-safety-gate/page.tsx",
  "../app/dashboard/networks/zodiac/owner-review-gate/page.tsx",
  "../app/dashboard/networks/zodiac/telegram-stars-payment-architecture-review/page.tsx",
  "../app/dashboard/networks/zodiac/payment-ledger-mock-integration/page.tsx",
  "../app/dashboard/networks/zodiac/entitlement-creation-mock/page.tsx",
  "../app/dashboard/networks/zodiac/vip-access-security-suite/page.tsx",
]) {
  check(`Support & Refund link exists in ${file}`, read(file).includes("/dashboard/networks/zodiac/support-refund-policy-readiness"));
}

check("docs say Package 179 policy readiness only", docsSource.includes("Package 179 создаёт только Support & Refund Policy readiness"));
check("docs say future /paysupport", docsSource.includes("/paysupport"));
check("docs say manual review", docsSource.includes("manual owner review") || docsSource.includes("ручной owner review"));
check("docs say no payment implementation", docsSource.includes("не реализует оплату"));
check("docs say no Telegram Stars invoice", docsSource.includes("не реализует Telegram Stars invoice"));
check("docs say no sendInvoice", docsSource.includes("не вызывает sendInvoice"));
check("docs say no createInvoiceLink", docsSource.includes("не вызывает createInvoiceLink"));
check("docs say no pre_checkout_query handler", docsSource.includes("не реализует pre_checkout_query handler"));
check("docs say no successful_payment handler", docsSource.includes("не реализует successful_payment handler"));
check("docs say no payment ledger write", docsSource.includes("не пишет payment ledger"));
check("docs say no real VIP unlock", docsSource.includes("не реализует реальную VIP-разблокировку"));
check("docs say no entitlement creation", docsSource.includes("не создаёт entitlements"));
check("docs say no automatic refunds", docsSource.includes("не автоматизирует возвраты"));
check("docs say no Telegram API call", docsSource.includes("не вызывает Telegram API"));
check("docs say no database write", docsSource.includes("не пишет в database"));
check("docs say no database schema change", docsSource.includes("не изменяет database schema"));
check("docs say no migrations", docsSource.includes("не добавляет migrations"));
check("docs say no active Telegram CTA change", docsSource.includes("не меняет active Telegram CTA logic"));
check("docs say no workflow changes", docsSource.includes("не изменяет cron/workflow/publish scripts"));
check("docs say daily/weekly/monthly pipeline remains unblocked", docsSource.includes("Daily/weekly/monthly content pipeline remains unblocked"));
check("docs say next package Package 180", docsSource.includes("Package 180 — Analytics/Funnel Tracking Readiness"));

check("report says Package 179", reportSource.includes("Package 179"));
check("report says policy readiness only", reportSource.includes("policy readiness only"));
check("report says next package Package 180", reportSource.includes("Package 180 — Analytics/Funnel Tracking Readiness"));

check("no real payment API is used", !/stripe\.|checkout\.sessions|paymentIntent|createPayment|payments\.create|sendInvoice\s*\(|createInvoiceLink\s*\(/i.test(implementationBundle));
check("no sendInvoice", !/sendInvoice\s*\(/.test(implementationBundle));
check("no createInvoiceLink", !/createInvoiceLink\s*\(/.test(implementationBundle));
check("no pre_checkout_query handler", !/pre_checkout_query["']?\s*[:=]|answerPreCheckoutQuery\s*\(|case\s+["']pre_checkout_query["']/.test(implementationBundle));
check("no successful_payment handler", !/successful_payment["']?\s*[:=]|case\s+["']successful_payment["']|onSuccessfulPayment|handleSuccessfulPayment\s*\(/.test(implementationBundle));
check("no payment ledger write", !/recordsPaymentLedgerNow\s*:\s*true|persistsLedgerNow\s*:\s*true|paymentLedgerWriteAllowedNow\s*:\s*true|\.insert\s*\(|\.upsert\s*\(/i.test(implementationBundle));
check("no entitlement creation", !/createsEntitlementNow\s*:\s*true|entitlementCreationAllowedNow\s*:\s*true|export\s+function\s+create\w*Entitlement|function\s+create\w*Entitlement|grantVip\s*\(|unlockVip\s*\(/i.test(implementationBundle));
check("no DB write", !/process\.env\.DATABASE_URL|createClient\(|new Pool\(|drizzle\(|from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(/i.test(implementationBundle));
check("no DB schema/migration change", gitDiffNames(["prisma", "supabase", "migrations", "schema.prisma"]).filter((file) => /(^|\/)(prisma|supabase|migrations)(\/|$)|schema\.prisma$/i.test(file)).length === 0);
check("no Telegram API call", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|answerPreCheckoutQuery\s*\(/i.test(implementationBundle));
check("no automatic refund implementation", !/automaticRefund\s*\(|refundAllowedNow\s*:\s*true|refundAutomationEnabled\s*:\s*true|automatedRefundNow\s*:\s*true/i.test(implementationBundle));
check("no production launch switch", !/approvedForLaunch\s*:\s*true|sendAllowedNow\s*:\s*true|canCallTelegramApiNow\s*:\s*true|productionPaymentAllowedNow\s*:\s*true|productionLaunchAllowedNow\s*:\s*true/i.test(implementationBundle));
check("no active payment CTA", !/Купить VIP|Оплатить|Разблокировать отч[её]т|Подписаться|Активировать VIP|Получить доступ после оплаты|Buy now|Subscribe now|Purchase now|Activate VIP|Payment successful|Premium unlocked/i.test(userFacingBundle));

check("no workflows changed", gitDiffNames([".github/workflows"]).length === 0);
check("package.json not changed", gitDiffNames(["package.json"]).length === 0);
check("publish scripts not changed", gitDiffNames(["scripts/publish-zodiac-by-date.mjs", "scripts/publish-zodiac-weekly-by-week.mjs", "scripts/zodiac-telegram-publisher.mjs"]).length === 0);

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
