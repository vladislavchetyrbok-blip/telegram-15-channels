#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  APHRODITE_ENTITLEMENT_STORAGE_CATALOG_REFERENCE,
  APHRODITE_ENTITLEMENT_STORAGE_DESIGN_CLASSIFICATION,
  APHRODITE_ENTITLEMENT_STORAGE_DESIGN_RULE,
  APHRODITE_ENTITLEMENT_STORAGE_LEDGER_REFERENCE,
  APHRODITE_ENTITLEMENT_STORAGE_SAFETY_LABELS,
  getAphroditeEntitlementStorageBoundaries,
  getAphroditeEntitlementStorageDependencies,
  getAphroditeEntitlementStorageFields,
  getAphroditeEntitlementStorageNextSteps,
  getAphroditeEntitlementStorageRules,
} from "../lib/zodiac/aphrodite-entitlement-storage-design.ts";
import {
  APHRODITE_PAYMENT_LEDGER_DESIGN_RULE,
  getAphroditePaymentLedgerCatalogAlignment,
} from "../lib/zodiac/aphrodite-payment-ledger-design.ts";
import { getAphroditeFutureVipProducts } from "../lib/zodiac/aphrodite-product-catalog.ts";

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

console.log("Старт QA: дизайн хранения VIP-доступа Aphrodite...\n");

const modelPath = "../lib/zodiac/aphrodite-entitlement-storage-design.ts";
const dashboardPath = "../app/dashboard/networks/zodiac/entitlement-storage-design/page.tsx";
const docsPath = "../docs/aphrodite-entitlement-storage-design.md";
const reportPath = "../docs/aphrodite-package-reports/package-164.md";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";

check("model file exists", exists(modelPath));
check("dashboard page exists", exists(dashboardPath));
check("documentation exists", exists(docsPath));
check("package report exists", exists(reportPath));
check("dashboard QA exists", exists(dashboardQaPath));

const modelSource = exists(modelPath) ? read(modelPath) : "";
const dashboardSource = exists(dashboardPath) ? read(dashboardPath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";
const implementationBundle = [modelSource, dashboardSource].join("\n");
const userFacingBundle = [modelSource, dashboardSource, docsSource, reportSource].join("\n");

const fields = getAphroditeEntitlementStorageFields();
const rules = getAphroditeEntitlementStorageRules();
const boundaries = getAphroditeEntitlementStorageBoundaries();
const nextSteps = getAphroditeEntitlementStorageNextSteps();
const dependencies = getAphroditeEntitlementStorageDependencies();
const ledgerAlignment = getAphroditePaymentLedgerCatalogAlignment();
const futureVipProducts = getAphroditeFutureVipProducts();

check("classification is storage design only", APHRODITE_ENTITLEMENT_STORAGE_DESIGN_CLASSIFICATION.includes("Только дизайн хранения"));
check("design rule says entitlement is not created", APHRODITE_ENTITLEMENT_STORAGE_DESIGN_RULE.includes("Entitlement не создаётся"));
check("ledger reference is declared", APHRODITE_ENTITLEMENT_STORAGE_LEDGER_REFERENCE === "lib/zodiac/aphrodite-payment-ledger-design.ts");
check("catalog reference is declared", APHRODITE_ENTITLEMENT_STORAGE_CATALOG_REFERENCE === "lib/zodiac/aphrodite-product-catalog.ts");
check("payment ledger dependency rule is available", APHRODITE_PAYMENT_LEDGER_DESIGN_RULE.includes("Payment ledger требуется перед entitlement"));
check("ledger alignment still references future products", ledgerAlignment.futureProductIds.length === futureVipProducts.length);

check("storage fields exist", fields.length >= 13);
check("storage rules exist", rules.length >= 8);
check("storage boundaries exist", boundaries.length >= 10);
check("storage next step points to Package 165", nextSteps.some((step) => step.package === "Package 165" && step.title === "Entitlement Schema Skeleton"));
check("dependencies include ledger and product catalog", dependencies.some((item) => item.source === APHRODITE_ENTITLEMENT_STORAGE_LEDGER_REFERENCE) && dependencies.some((item) => item.source === APHRODITE_ENTITLEMENT_STORAGE_CATALOG_REFERENCE));

for (const fieldName of [
  "userId",
  "telegramUserId",
  "productId",
  "sourcePaymentLedgerId",
  "sourcePaymentProvider",
  "status",
  "startsAt",
  "expiresAt",
  "revokedAt",
  "createdAt",
  "updatedAt",
  "auditReason",
  "ownerReviewStatus",
]) {
  check(`required future field exists: ${fieldName}`, fields.some((field) => field.fieldName === fieldName));
}

check("all fields are designOnly=true", fields.every((field) => field.designOnly === true));
check("all fields avoid database writes now", fields.every((field) => field.writesToDatabaseNow === false));
check("required fields have visible purpose", fields.every((field) => field.visiblePurpose.length > 0));

for (const requiredRule of [
  "No entitlement without verified payment ledger",
  "No entitlement without catalog productId",
  "No access if expired",
  "No access if revoked",
  "No access if refunded",
  "Owner review required before real launch",
  "Server-side check required",
  "Client-side flags ignored",
]) {
  check(`required rule exists: ${requiredRule}`, rules.some((rule) => rule.label === requiredRule && rule.blocksAccessNow === true));
}

for (const label of APHRODITE_ENTITLEMENT_STORAGE_SAFETY_LABELS) {
  check(`required safety label exists: ${label}`, userFacingBundle.includes(label));
}

for (const boundary of [
  "no-real-vip-unlock",
  "no-payment",
  "no-stars-invoice",
  "no-successful-payment-handler",
  "no-entitlement-creation",
  "no-database-write",
  "no-database-schema-migration",
  "no-telegram-api-call",
  "no-production-launch",
  "entitlement-not-created",
]) {
  check(`data boundary exists: ${boundary}`, boundaries.some((item) => item.dataBoundary === boundary) && dashboardSource.includes("data-boundary={boundary.dataBoundary}"));
}

check("dashboard route is registered in dashboard QA", dashboardQaSource.includes("entitlementStorageDesign"));
check("dashboard QA checks storage title", dashboardQaSource.includes("Дизайн хранения VIP-доступа"));
check("dashboard QA checks storage classification", dashboardQaSource.includes("Только дизайн хранения"));
check("dashboard QA checks entitlement-not-created label", dashboardQaSource.includes("Entitlement не создаётся"));

check("no real payment API is used", !/from ['"]stripe|require\(['"]stripe|new Stripe\b|checkout\.sessions|charges\.create|payment_intents|paypal|yookassa|liqpay/i.test(implementationBundle));
check("no Stars invoice is created", !/sendInvoice\(|createInvoiceLink\(|answerPreCheckoutQuery\(/i.test(implementationBundle));
check("no successful_payment handler code is added", !/successful_payment\s*[:=]|case\s+["']successful_payment["']|function\s+\w*successful|update\.message\.successful_payment/i.test(implementationBundle));
check("no Telegram token is required", !/TELEGRAM_BOT_TOKEN|COMPATIBILITY_BOT_TOKEN|process\.env\.[A-Z_]*TELEGRAM/i.test(implementationBundle));
check("no database connection or write is used", !/DATABASE_URL|createClient\(|new Pool\(|drizzle\(|from\([^)]*\)\.(insert|update|delete|upsert)\(/i.test(implementationBundle));
check("no entitlement creation function is implemented", !/function\s+create\w*Entitlement|const\s+create\w*Entitlement|export\s+function\s+create\w*Entitlement|grantVip\(|unlockVip\(|insert\w*Entitlement/i.test(implementationBundle));
check("no real VIP unlock is introduced", !/vipUnlockEnabledNow\s*:\s*true|vipUnlocked\s*=\s*true|realVipAccess\s*=\s*true|allowed\s*:\s*true|setVipActive\(|grantVip\(|unlockVip\(/i.test(implementationBundle));
check("no active payment CTA is present", !/Купить VIP|Оплатить|Разблокировать отч[её]т|Подписаться|Активировать VIP|Получить доступ после оплаты|Buy now|Subscribe now|Purchase now|Activate VIP|Payment successful|Premium unlocked/i.test(userFacingBundle));

const changedDbFiles = gitDiffNames(["prisma", "supabase", "migrations", "schema.prisma"]).filter((file) =>
  /(^|\/)(prisma|supabase|migrations)(\/|$)|schema\.prisma$/i.test(file),
);
check("no DB migration/schema file changed", changedDbFiles.length === 0);

const workflowChanges = gitDiffNames([".github/workflows", "package.json"]);
check("workflows and package.json are not changed", workflowChanges.length === 0);

const scriptChanges = gitDiffNames(["scripts"]);
check("only Aphrodite QA scripts and dashboard QA changed in scripts", scriptChanges.every((file) =>
  file === "scripts/qa-zodiac-dashboard.mjs" || /^scripts\/qa-aphrodite-.*\.mjs$/.test(file),
));

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
