#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  APHRODITE_OWNER_REVIEW_GATE_CLASSIFICATION,
  APHRODITE_OWNER_REVIEW_GATE_TITLE,
  APHRODITE_OWNER_REVIEW_REQUIRED_FUTURE_ENV_FLAGS,
  APHRODITE_OWNER_REVIEW_SAFETY_LABELS,
  evaluateAphroditeOwnerReviewGate,
  getAphroditeOwnerReviewBoundaries,
  getAphroditeOwnerReviewChecklist,
  getAphroditeOwnerReviewNextSteps,
} from "../lib/zodiac/aphrodite-owner-review-gate.ts";

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

console.log("Старт QA: owner review gate Aphrodite...\n");

const modelPath = "../lib/zodiac/aphrodite-owner-review-gate.ts";
const pagePath = "../app/dashboard/networks/zodiac/owner-review-gate/page.tsx";
const docsPath = "../docs/aphrodite-owner-review-gate.md";
const reportPath = "../docs/aphrodite-package-reports/package-168.md";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";
const securitySuitePath = "./qa-aphrodite-vip-access-security-suite.mjs";

check("model file exists", exists(modelPath));
check("dashboard page exists", exists(pagePath));
check("documentation exists", exists(docsPath));
check("package report exists", exists(reportPath));
check("dashboard QA exists", exists(dashboardQaPath));
check("security suite QA exists", exists(securitySuitePath));

const modelSource = exists(modelPath) ? read(modelPath) : "";
const pageSource = exists(pagePath) ? read(pagePath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";
const implementationBundle = [modelSource, pageSource].join("\n");
const userFacingBundle = [modelSource, pageSource, docsSource, reportSource].join("\n");

check("evaluateAphroditeOwnerReviewGate exists", typeof evaluateAphroditeOwnerReviewGate === "function");

const defaultResult = evaluateAphroditeOwnerReviewGate();
const allTrueResult = evaluateAphroditeOwnerReviewGate({
  ownerApproved: true,
  paymentsApproved: true,
  starsApproved: true,
  entitlementsApproved: true,
  databaseApproved: true,
  supportApproved: true,
  securityQaApproved: true,
  backupFresh: true,
});

check("default result approvedForLaunch=false", defaultResult.approvedForLaunch === false);
check("all-true mock input still returns approvedForLaunch=false", allTrueResult.approvedForLaunch === false);
check("paymentsCanBeEnabledNow=false", defaultResult.paymentsCanBeEnabledNow === false && allTrueResult.paymentsCanBeEnabledNow === false);
check("vipCanBeEnabledNow=false", defaultResult.vipCanBeEnabledNow === false && allTrueResult.vipCanBeEnabledNow === false);
check("entitlementCreationCanBeEnabledNow=false", defaultResult.entitlementCreationCanBeEnabledNow === false && allTrueResult.entitlementCreationCanBeEnabledNow === false);
check("telegramStarsCanBeEnabledNow=false", defaultResult.telegramStarsCanBeEnabledNow === false && allTrueResult.telegramStarsCanBeEnabledNow === false);
check("productionLaunchCanBeEnabledNow=false", defaultResult.productionLaunchCanBeEnabledNow === false && allTrueResult.productionLaunchCanBeEnabledNow === false);

const checklist = getAphroditeOwnerReviewChecklist();
const boundaries = getAphroditeOwnerReviewBoundaries();
const nextSteps = getAphroditeOwnerReviewNextSteps();

check("owner checklist exists", checklist.length >= 9);
check("payments checklist exists", checklist.some((item) => item.area === "payments"));
check("Telegram Stars checklist exists", checklist.some((item) => item.area === "telegram-stars"));
check("entitlement creation checklist exists", checklist.some((item) => item.area === "entitlement-creation"));
check("VIP unlock checklist exists", checklist.some((item) => item.area === "vip-unlock"));
check("support/refund readiness dependency exists", checklist.some((item) => item.area === "support-refund-policy" && item.label.includes("Support/refund")));
check("security QA dependency exists", defaultResult.requiredOwnerChecks.some((item) => item.includes("Security QA Package 167")));
check("backup freshness dependency exists", checklist.some((item) => item.requiredBeforeLaunch.some((requirement) => requirement.includes("backupFresh"))));
check("safety boundaries exist", boundaries.length >= 10);
check("next package is Package 169", nextSteps.some((step) => step.package === "Package 169" && step.title === "Telegram Stars Payment Architecture Final Review"));

for (const flag of APHRODITE_OWNER_REVIEW_REQUIRED_FUTURE_ENV_FLAGS) {
  check(`required future env flag documented: ${flag}`, defaultResult.requiredFutureEnvFlags.includes(flag) && userFacingBundle.includes(flag));
}

for (const label of APHRODITE_OWNER_REVIEW_SAFETY_LABELS) {
  check(`Russian visible safety label exists: ${label}`, userFacingBundle.includes(label));
}

for (const boundary of [
  "no-real-payment",
  "no-real-vip-unlock",
  "no-stars-invoice",
  "no-successful-payment-handler",
  "no-entitlement-creation",
  "no-database-write",
  "no-database-schema-migration",
  "no-telegram-api-call",
  "no-production-launch",
  "owner-review-does-not-enable-payment",
]) {
  check(`data boundary exists: ${boundary}`, boundaries.some((item) => item.dataBoundary === boundary) && pageSource.includes("data-boundary={boundary.dataBoundary}"));
}

for (const sourcePage of [
  "../app/dashboard/networks/zodiac/page.tsx",
  "../app/dashboard/networks/zodiac/product-catalog-finalization/page.tsx",
  "../app/dashboard/networks/zodiac/payment-ledger-design/page.tsx",
  "../app/dashboard/networks/zodiac/entitlement-storage-design/page.tsx",
  "../app/dashboard/networks/zodiac/entitlement-schema-skeleton/page.tsx",
  "../app/dashboard/networks/zodiac/server-entitlement-check-skeleton/page.tsx",
  "../app/dashboard/networks/zodiac/vip-access-security-suite/page.tsx",
  "../app/dashboard/networks/zodiac/vip-free-preview-fallback-map/page.tsx",
  "../app/dashboard/networks/zodiac/vip-guard-integration-review/page.tsx",
  "../app/dashboard/networks/zodiac/vip-access-guard-skeleton/page.tsx",
]) {
  check(`Owner Review Gate link exists in ${sourcePage}`, exists(sourcePage) && read(sourcePage).includes("/dashboard/networks/zodiac/owner-review-gate"));
}

check("dashboard QA checks owner review gate title", dashboardQaSource.includes(APHRODITE_OWNER_REVIEW_GATE_TITLE));
check("dashboard QA checks owner review gate classification", dashboardQaSource.includes("Только safety gate"));
check("dashboard QA checks launch denied boundary", dashboardQaSource.includes("Запуск не разрешён"));
check("dashboard QA checks payment boundary", dashboardQaSource.includes("Нет реальной оплаты"));
check("dashboard QA checks result false", dashboardQaSource.includes("approvedForLaunch=false"));
check("page shows classification", userFacingBundle.includes(APHRODITE_OWNER_REVIEW_GATE_CLASSIFICATION) && pageSource.includes("APHRODITE_OWNER_REVIEW_GATE_CLASSIFICATION"));
check("page shows approvedForLaunch=false", pageSource.includes("approvedForLaunch"));
check("page shows paymentsCanBeEnabledNow=false", pageSource.includes("paymentsCanBeEnabledNow"));
check("page shows vipCanBeEnabledNow=false", pageSource.includes("vipCanBeEnabledNow"));

check("docs say Package 168 creates owner review gate only", docsSource.includes("Package 168 создаёт только owner review gate"));
check("docs say no payment implementation", docsSource.includes("не реализует оплату"));
check("docs say daily/weekly automation remains unblocked", docsSource.includes("Daily/weekly automation remains unblocked"));
check("report says active Telegram CTA logic unchanged", reportSource.includes("не меняет active Telegram CTA logic"));

const implementationWithoutSafetyLabels = implementationBundle.replaceAll("successful_payment handler", "successful payment handler");
check("no real payment API is used", !/from ['"]stripe|require\(['"]stripe|new Stripe\b|checkout\.sessions|charges\.create|payment_intents|paypal|yookassa|liqpay/i.test(implementationBundle));
check("no sendInvoice", !/sendInvoice\(/i.test(implementationBundle));
check("no createInvoiceLink", !/createInvoiceLink\(/i.test(implementationBundle));
check("no successful_payment handler", !/successful_payment\s*[:=]|case\s+["']successful_payment["']|function\s+\w*successful|update\.message\.successful_payment/i.test(implementationWithoutSafetyLabels));
check("no entitlement creation function", !/function\s+create\w*Entitlement|const\s+create\w*Entitlement|export\s+function\s+create\w*Entitlement|grantVip\(|unlockVip\(|insert\w*Entitlement/i.test(implementationBundle));
check("no DB write", !/process\.env\.DATABASE_URL|createClient\(|new Pool\(|drizzle\(|from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\(|\.update\(|\.delete\(|\.upsert\(/i.test(implementationBundle));
check("no Telegram API call", !/process\.env\.[A-Z_]*TELEGRAM|fetch\([^)]*api\.telegram\.org|sendMessage\(|sendPhoto\(|sendDocument\(|answerPreCheckoutQuery\(/i.test(implementationBundle));
check("no production launch switch", !/productionLaunchCanBeEnabledNow:\s*true|approvedForLaunch:\s*true|paymentsCanBeEnabledNow:\s*true|vipCanBeEnabledNow:\s*true/i.test(implementationBundle));
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
