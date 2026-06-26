#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  APHRODITE_TELEGRAM_STARS_ARCHITECTURE_REVIEW_CLASSIFICATION,
  APHRODITE_TELEGRAM_STARS_ARCHITECTURE_REVIEW_TITLE,
  APHRODITE_TELEGRAM_STARS_REQUIRED_FUTURE_ENV_FLAGS,
  APHRODITE_TELEGRAM_STARS_SAFETY_LABELS,
  getAphroditeTelegramStarsArchitectureBoundaries,
  getAphroditeTelegramStarsArchitectureNextSteps,
  getAphroditeTelegramStarsArchitectureRisks,
  getAphroditeTelegramStarsArchitectureRules,
  getAphroditeTelegramStarsArchitectureSurfaces,
} from "../lib/zodiac/aphrodite-telegram-stars-payment-architecture-review.ts";

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

console.log("Старт QA: Telegram Stars architecture review Aphrodite...\n");

const modelPath = "../lib/zodiac/aphrodite-telegram-stars-payment-architecture-review.ts";
const pagePath = "../app/dashboard/networks/zodiac/telegram-stars-payment-architecture-review/page.tsx";
const docsPath = "../docs/aphrodite-telegram-stars-payment-architecture-review.md";
const reportPath = "../docs/aphrodite-package-reports/package-169.md";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";
const ownerReviewQaPath = "./qa-aphrodite-owner-review-gate.mjs";
const securitySuiteQaPath = "./qa-aphrodite-vip-access-security-suite.mjs";

check("model file exists", exists(modelPath));
check("dashboard page exists", exists(pagePath));
check("documentation exists", exists(docsPath));
check("package report exists", exists(reportPath));
check("dashboard QA exists", exists(dashboardQaPath));
check("owner review QA exists", exists(ownerReviewQaPath));
check("security suite QA exists", exists(securitySuiteQaPath));

const modelSource = exists(modelPath) ? read(modelPath) : "";
const pageSource = exists(pagePath) ? read(pagePath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";
const implementationBundle = [modelSource, pageSource].join("\n");
const userFacingBundle = [modelSource, pageSource, docsSource, reportSource].join("\n");

const surfaces = getAphroditeTelegramStarsArchitectureSurfaces();
const rules = getAphroditeTelegramStarsArchitectureRules();
const risks = getAphroditeTelegramStarsArchitectureRisks();
const boundaries = getAphroditeTelegramStarsArchitectureBoundaries();
const nextSteps = getAphroditeTelegramStarsArchitectureNextSteps();

check("architecture surfaces exist", surfaces.length >= 13);
check("architecture rules exist", rules.length >= 10);
check("architecture risks exist", risks.length >= 6);
check("safety boundaries exist", boundaries.length >= 13);
check("next steps exist", nextSteps.some((step) => step.package === "Package 170" && step.title === "Telegram Stars Invoice Builder Skeleton"));

for (const area of [
  "invoice-creation",
  "pre-checkout-validation",
  "successful-payment-handling",
  "payment-ledger",
  "entitlement-creation",
  "product-catalog",
  "owner-review-gate",
  "environment-flags",
  "idempotency",
  "refunds-and-revocation",
  "support-policy",
  "security-qa",
  "analytics",
]) {
  check(`required architecture area exists: ${area}`, surfaces.some((surface) => surface.area === area));
}

const invoiceSurface = surfaces.find((surface) => surface.area === "invoice-creation");
const preCheckoutSurface = surfaces.find((surface) => surface.area === "pre-checkout-validation");
const successfulPaymentSurface = surfaces.find((surface) => surface.area === "successful-payment-handling");
const ledgerSurface = surfaces.find((surface) => surface.area === "payment-ledger");
const entitlementSurface = surfaces.find((surface) => surface.area === "entitlement-creation");
const ownerReviewSurface = surfaces.find((surface) => surface.area === "owner-review-gate");
const catalogSurface = surfaces.find((surface) => surface.area === "product-catalog");
const idempotencySurface = surfaces.find((surface) => surface.area === "idempotency");
const supportSurface = surfaces.find((surface) => surface.area === "support-policy");
const securitySurface = surfaces.find((surface) => surface.area === "security-qa");

check("invoice creation is review-only", invoiceSurface?.currentState.includes("review-only") && invoiceSurface.blockedInThisPackage.includes("sendInvoice"));
check("pre-checkout validation is review-only", preCheckoutSurface?.currentState.includes("review-only") && preCheckoutSurface.blockedInThisPackage.includes("pre_checkout_query handler"));
check("successful_payment handling is review-only", successfulPaymentSurface?.currentState.includes("review-only") && successfulPaymentSurface.blockedInThisPackage.includes("successful_payment handler"));
check("payment ledger dependency exists", ledgerSurface?.requiredBeforeImplementation.some((item) => item.includes("database review")));
check("entitlement dependency exists", entitlementSurface?.requiredBeforeImplementation.some((item) => item.includes("entitlement storage review")));
check("owner review dependency exists", ownerReviewSurface?.requiredBeforeImplementation.some((item) => item.includes("Package 168")));
check("product catalog dependency exists", catalogSurface?.requiredBeforeImplementation.some((item) => item.includes("catalog")));
check("idempotency risk is documented", Boolean(idempotencySurface) && risks.some((risk) => risk.id === "duplicate-payment-event"));
check("duplicate payment risk is documented", risks.some((risk) => risk.risk.includes("двойной ledger") || risk.risk.includes("двойной entitlement")));
check("refund/support readiness is documented", Boolean(supportSurface) && risks.some((risk) => risk.id === "refund-without-revocation"));
check("security QA dependency exists", securitySurface?.requiredBeforeImplementation.some((item) => item.includes("Package 167")));

for (const rule of [
  "Нельзя создать invoice без owner review.",
  "Нельзя создать invoice без productId из каталога.",
  "Нельзя обработать pre-checkout без проверки productId, цены, пользователя и owner gate.",
  "Нельзя обработать successful_payment без idempotency и payment ledger.",
  "Нельзя создать entitlement напрямую из клиента.",
  "Нельзя создать entitlement без verified payment ledger.",
  "Нельзя открыть VIP без server-side entitlement check.",
  "Нельзя включить live Stars без env-флагов и owner review.",
  "Нельзя запускать оплату без support/refund policy.",
  "Нельзя запускать оплату без свежего backup.",
]) {
  check(`required future rule exists: ${rule}`, rules.some((item) => item.visibleRule === rule) && userFacingBundle.includes(rule));
}

for (const flag of APHRODITE_TELEGRAM_STARS_REQUIRED_FUTURE_ENV_FLAGS) {
  check(`env flag documented: ${flag}`, userFacingBundle.includes(flag));
}

for (const label of APHRODITE_TELEGRAM_STARS_SAFETY_LABELS) {
  check(`visible safety label exists: ${label}`, userFacingBundle.includes(label));
}

for (const boundary of [
  "no-real-payment",
  "no-stars-invoice",
  "no-send-invoice",
  "no-create-invoice-link",
  "no-pre-checkout-handler",
  "no-successful-payment-handler",
  "no-entitlement-creation",
  "no-real-vip-unlock",
  "no-database-write",
  "no-database-schema-migration",
  "no-telegram-api-call",
  "no-production-launch",
  "architecture-review-does-not-enable-payment",
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
  "../app/dashboard/networks/zodiac/owner-review-gate/page.tsx",
  "../app/dashboard/networks/zodiac/vip-free-preview-fallback-map/page.tsx",
  "../app/dashboard/networks/zodiac/vip-guard-integration-review/page.tsx",
  "../app/dashboard/networks/zodiac/vip-access-guard-skeleton/page.tsx",
]) {
  check(`Review Telegram Stars link exists in ${sourcePage}`, exists(sourcePage) && read(sourcePage).includes("/dashboard/networks/zodiac/telegram-stars-payment-architecture-review"));
}

check("dashboard QA route exists", dashboardQaSource.includes("telegramStarsPaymentArchitectureReview"));
check("dashboard QA checks title", dashboardQaSource.includes(APHRODITE_TELEGRAM_STARS_ARCHITECTURE_REVIEW_TITLE));
check("dashboard QA checks classification", dashboardQaSource.includes("Только architecture review"));
check("dashboard QA checks invoice boundary", dashboardQaSource.includes("Invoice не создаётся"));
check("dashboard QA checks sendInvoice boundary", dashboardQaSource.includes("Нет sendInvoice"));
check("page shows classification", pageSource.includes("APHRODITE_TELEGRAM_STARS_ARCHITECTURE_REVIEW_CLASSIFICATION") && userFacingBundle.includes(APHRODITE_TELEGRAM_STARS_ARCHITECTURE_REVIEW_CLASSIFICATION));
check("sample flow clearly marked future-only", pageSource.includes("Будущий flow / не реализовано"));

check("docs say Package 169 creates review only", docsSource.includes("Package 169 создаёт только architecture review Telegram Stars"));
check("docs say no sendInvoice call", docsSource.includes("не вызывает sendInvoice"));
check("docs say no createInvoiceLink call", docsSource.includes("не вызывает createInvoiceLink"));
check("docs say daily/weekly automation remains unblocked", docsSource.includes("Daily/weekly automation remains unblocked"));
check("report says active Telegram CTA logic unchanged", reportSource.includes("не меняет active Telegram CTA logic"));
check("report says next package Package 170", reportSource.includes("Package 170 — Telegram Stars Invoice Builder Skeleton"));

const implementationWithoutSafetyText = implementationBundle
  .replaceAll("Нет sendInvoice", "Нет live invoice")
  .replaceAll("Нет createInvoiceLink", "Нет invoice link")
  .replaceAll("Нет pre_checkout_query handler", "Нет pre checkout handler")
  .replaceAll("Нет successful_payment handler", "Нет successful payment handler")
  .replaceAll("pre_checkout_query handler", "pre checkout handler")
  .replaceAll("successful_payment handler", "successful payment handler")
  .replaceAll("successful_payment event", "successful payment event");

check("no real payment API is used", !/from ['"]stripe|require\(['"]stripe|new Stripe\b|checkout\.sessions|charges\.create|payment_intents|paypal|yookassa|liqpay/i.test(implementationBundle));
check("no sendInvoice", !/sendInvoice\(/i.test(implementationBundle));
check("no createInvoiceLink", !/createInvoiceLink\(/i.test(implementationBundle));
check("no pre_checkout_query handler", !/pre_checkout_query\s*[:=]|case\s+["']pre_checkout_query["']|function\s+\w*preCheckout|answerPreCheckoutQuery\(/i.test(implementationWithoutSafetyText));
check("no successful_payment handler", !/successful_payment\s*[:=]|case\s+["']successful_payment["']|function\s+\w*successful|update\.message\.successful_payment/i.test(implementationWithoutSafetyText));
check("no entitlement creation function", !/function\s+create\w*Entitlement|const\s+create\w*Entitlement|export\s+function\s+create\w*Entitlement|grantVip\(|unlockVip\(|insert\w*Entitlement/i.test(implementationBundle));
check("no DB write", !/process\.env\.DATABASE_URL|createClient\(|new Pool\(|drizzle\(|from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\(|\.update\(|\.delete\(|\.upsert\(/i.test(implementationBundle));
check("no Telegram API call", !/fetch\([^)]*api\.telegram\.org|sendMessage\(|sendPhoto\(|sendDocument\(|sendInvoice\(|answerPreCheckoutQuery\(/i.test(implementationBundle));
check("no production launch switch", !/approvedForLaunch\s*:\s*true|paymentEnabledNow\s*:\s*true|vipUnlockEnabledNow\s*:\s*true|productionLaunchCanBeEnabledNow\s*:\s*true/i.test(implementationBundle));
check("no active payment CTA", !/Купить VIP|Оплатить|Разблокировать отч[её]т|Подписаться|Активировать VIP|Получить доступ после оплаты|Buy now|Subscribe now|Purchase now|Activate VIP|Payment successful|Premium unlocked/i.test(userFacingBundle));
check("no external AI API call", !/openai|anthropic|gemini|process\.env\.[A-Z_]*(OPENAI|ANTHROPIC|GEMINI)/i.test(implementationBundle));
check("no auto-posting or scheduling", !/cron|schedule|auto-post|autopost|publishDue|sendTelegram/i.test(implementationBundle));

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
