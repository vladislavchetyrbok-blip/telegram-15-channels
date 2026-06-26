#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  APHRODITE_ENTITLEMENT_SCHEMA_SAFETY_LABELS,
  APHRODITE_ENTITLEMENT_SCHEMA_SKELETON_CLASSIFICATION,
  APHRODITE_ENTITLEMENT_SCHEMA_SKELETON_RULE,
  APHRODITE_ENTITLEMENT_SCHEMA_STORAGE_REFERENCE,
  getAphroditeEntitlementSchemaBoundaries,
  getAphroditeEntitlementSchemaNextSteps,
  getAphroditeEntitlementSchemaRequiredFields,
  validateAphroditeEntitlementSchemaSkeleton,
} from "../lib/zodiac/aphrodite-entitlement-schema-skeleton.ts";
import {
  APHRODITE_ENTITLEMENT_STORAGE_DESIGN_RULE,
  getAphroditeEntitlementStorageFields,
} from "../lib/zodiac/aphrodite-entitlement-storage-design.ts";

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

console.log("Старт QA: skeleton схемы entitlement Aphrodite...\n");

const modelPath = "../lib/zodiac/aphrodite-entitlement-schema-skeleton.ts";
const dashboardPath = "../app/dashboard/networks/zodiac/entitlement-schema-skeleton/page.tsx";
const docsPath = "../docs/aphrodite-entitlement-schema-skeleton.md";
const reportPath = "../docs/aphrodite-package-reports/package-165.md";
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

const requiredFields = getAphroditeEntitlementSchemaRequiredFields();
const boundaries = getAphroditeEntitlementSchemaBoundaries();
const nextSteps = getAphroditeEntitlementSchemaNextSteps();
const storageFields = getAphroditeEntitlementStorageFields();

const validLookingRecord = {
  id: "future-entitlement-valid",
  userId: "future-user-001",
  telegramUserId: "123456789",
  productId: "full-love-report",
  sourcePaymentLedgerId: "future-ledger-valid",
  status: "active",
  startsAt: "2026-01-01T00:00:00.000Z",
  expiresAt: "2099-01-01T00:00:00.000Z",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  auditReason: "future verified ledger",
};

const validResult = validateAphroditeEntitlementSchemaSkeleton(validLookingRecord);
const expiredResult = validateAphroditeEntitlementSchemaSkeleton({ ...validLookingRecord, id: "expired", status: "expired", expiresAt: "2020-01-01T00:00:00.000Z" });
const revokedResult = validateAphroditeEntitlementSchemaSkeleton({ ...validLookingRecord, id: "revoked", status: "revoked", revokedAt: "2026-01-02T00:00:00.000Z" });
const refundedResult = validateAphroditeEntitlementSchemaSkeleton({ ...validLookingRecord, id: "refunded", status: "refunded" });
const missingResult = validateAphroditeEntitlementSchemaSkeleton({ productId: "full-love-report" });

check("classification is TypeScript skeleton only", APHRODITE_ENTITLEMENT_SCHEMA_SKELETON_CLASSIFICATION.includes("Только TypeScript skeleton"));
check("schema rule says no access is granted", APHRODITE_ENTITLEMENT_SCHEMA_SKELETON_RULE.includes("не выдаёт доступ"));
check("storage reference is declared", APHRODITE_ENTITLEMENT_SCHEMA_STORAGE_REFERENCE === "lib/zodiac/aphrodite-entitlement-storage-design.ts");
check("storage design dependency rule is available", APHRODITE_ENTITLEMENT_STORAGE_DESIGN_RULE.includes("Entitlement не создаётся"));
check("storage fields exist for dependency", storageFields.length >= 13);

check("validation function exists", typeof validateAphroditeEntitlementSchemaSkeleton === "function");
check("required fields exist", requiredFields.length >= 9);
check("boundaries exist", boundaries.length >= 10);
check("next step points to Package 166", nextSteps.some((step) => step.package === "Package 166" && step.title === "Server-side Entitlement Check Skeleton"));

for (const fieldName of [
  "id",
  "productId",
  "sourcePaymentLedgerId",
  "status",
  "startsAt",
  "createdAt",
  "updatedAt",
  "auditReason",
  "userId or telegramUserId",
]) {
  check(`required schema field exists: ${fieldName}`, requiredFields.includes(fieldName));
}

check("valid-looking record has valid shape", validResult.validShape === true);
check("valid-looking record still grants no access", validResult.grantsAccessNow === false);
check("expired record grants no access", expiredResult.grantsAccessNow === false && expiredResult.blockedReasons.some((reason) => reason.includes("expired")));
check("revoked record grants no access", revokedResult.grantsAccessNow === false && revokedResult.blockedReasons.some((reason) => reason.includes("revoked")));
check("refunded record grants no access", refundedResult.grantsAccessNow === false && refundedResult.blockedReasons.some((reason) => reason.includes("refunded")));
check("missing record is invalid shape", missingResult.validShape === false && missingResult.missingFields.length > 0);
check("every validation result keeps grantsAccessNow=false", [validResult, expiredResult, revokedResult, refundedResult, missingResult].every((result) => result.grantsAccessNow === false));

for (const label of APHRODITE_ENTITLEMENT_SCHEMA_SAFETY_LABELS) {
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
  "schema-skeleton-grants-no-access",
]) {
  check(`data boundary exists: ${boundary}`, boundaries.some((item) => item.dataBoundary === boundary) && dashboardSource.includes("data-boundary={boundary.dataBoundary}"));
}

check("dashboard route is registered in dashboard QA", dashboardQaSource.includes("entitlementSchemaSkeleton"));
check("dashboard QA checks schema title", dashboardQaSource.includes("Skeleton схемы entitlement"));
check("dashboard QA checks schema classification", dashboardQaSource.includes("Только TypeScript skeleton"));
check("dashboard QA checks no access label", dashboardQaSource.includes("Schema skeleton не выдаёт доступ"));

check("no literal active allow flag exists", !implementationBundle.includes("allowed" + "=true"));
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
