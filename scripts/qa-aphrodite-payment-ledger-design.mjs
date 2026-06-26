#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  APHRODITE_PAYMENT_LEDGER_DESIGN_CLASSIFICATION,
  APHRODITE_PAYMENT_LEDGER_DESIGN_RULE,
  APHRODITE_PAYMENT_LEDGER_CATALOG_REFERENCE,
  APHRODITE_PAYMENT_LEDGER_FALLBACK_ROUTE,
  APHRODITE_PAYMENT_LEDGER_SAFETY_LABELS,
  getAphroditePaymentLedgerCatalogAlignment,
  getAphroditePaymentLedgerDesignBoundaries,
  getAphroditePaymentLedgerDesignItems,
  getAphroditePaymentLedgerDesignNextSteps,
  getAphroditePaymentLedgerDesignRules,
} from "../lib/zodiac/aphrodite-payment-ledger-design.ts";
import {
  APHRODITE_PRODUCT_CATALOG_FREE_FALLBACK_ROUTE,
  getAphroditeFutureVipProducts,
} from "../lib/zodiac/aphrodite-product-catalog.ts";

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

console.log("Старт QA: дизайн payment ledger Aphrodite...\n");

const modelPath = "../lib/zodiac/aphrodite-payment-ledger-design.ts";
const dashboardPath = "../app/dashboard/networks/zodiac/payment-ledger-design/page.tsx";
const docsPath = "../docs/aphrodite-payment-ledger-design.md";
const reportPath = "../docs/aphrodite-package-reports/package-163.md";
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

const ledgerItems = getAphroditePaymentLedgerDesignItems();
const rules = getAphroditePaymentLedgerDesignRules();
const boundaries = getAphroditePaymentLedgerDesignBoundaries();
const nextSteps = getAphroditePaymentLedgerDesignNextSteps();
const catalogAlignment = getAphroditePaymentLedgerCatalogAlignment();
const futureVipProducts = getAphroditeFutureVipProducts();

check("classification is ledger design only", APHRODITE_PAYMENT_LEDGER_DESIGN_CLASSIFICATION.includes("Только дизайн ledger"));
check("main ledger rule is visible", APHRODITE_PAYMENT_LEDGER_DESIGN_RULE.includes("Payment ledger требуется перед entitlement"));
check("product catalog reference is declared", APHRODITE_PAYMENT_LEDGER_CATALOG_REFERENCE === "lib/zodiac/aphrodite-product-catalog.ts");
check("fallback route matches product catalog", APHRODITE_PAYMENT_LEDGER_FALLBACK_ROUTE === APHRODITE_PRODUCT_CATALOG_FREE_FALLBACK_ROUTE);
check("payment ledger items exist", ledgerItems.length >= 3);
check("ledger rules exist", rules.length >= 5);
check("ledger boundaries exist", boundaries.length >= 9);
check("ledger next steps exist", nextSteps.some((step) => step.package === "Package 164" && step.title === "Entitlement Storage Design"));
check("product catalog has future VIP products", futureVipProducts.length > 0);
check("catalog alignment references future products", catalogAlignment.futureProductIds.length === futureVipProducts.length);
check("catalog alignment requires ledger before entitlement", catalogAlignment.requiredBeforeEntitlement === true);
check("catalog alignment requires owner review", catalogAlignment.ownerReviewRequired === true);

check("all ledger items are designOnly=true", ledgerItems.every((item) => item.designOnly === true));
check("all ledger items avoid entitlement creation now", ledgerItems.every((item) => item.createsEntitlementNow === false));
check("all ledger items avoid database writes now", ledgerItems.every((item) => item.writesToDatabaseNow === false));
check("all required field aliases exist", ledgerItems.every((item) =>
  [
    item.userIdField,
    item.telegramUserIdField,
    item.sourcePaymentIdField,
    item.amountField,
    item.currencyField,
    item.createdAtField,
    item.verifiedAtField,
    item.refundedAtField,
    item.auditReasonField,
  ].every((value) => typeof value === "string" && value.length > 0),
));

for (const label of APHRODITE_PAYMENT_LEDGER_SAFETY_LABELS) {
  check(`required safety label exists: ${label}`, userFacingBundle.includes(label));
}

for (const boundary of [
  "no-real-payment",
  "no-stars-invoice",
  "no-successful-payment-handler",
  "no-entitlement-creation",
  "no-database-write",
  "no-database-schema-migration",
  "no-telegram-api-call",
  "no-production-launch",
  "ledger-writes-nothing",
]) {
  check(`data boundary exists: ${boundary}`, boundaries.some((item) => item.dataBoundary === boundary) && dashboardSource.includes("data-boundary={boundary.dataBoundary}"));
}

check("dashboard route is registered in dashboard QA", dashboardQaSource.includes("paymentLedgerDesign"));
check("dashboard QA checks ledger title", dashboardQaSource.includes("Дизайн payment ledger"));
check("dashboard QA checks ledger classification", dashboardQaSource.includes("Только дизайн ledger"));
check("dashboard QA checks ledger no write label", dashboardQaSource.includes("Ledger ничего не записывает"));

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
check("only Package 163 QA and dashboard QA changed in scripts", scriptChanges.every((file) =>
  file === "scripts/qa-aphrodite-payment-ledger-design.mjs" || file === "scripts/qa-zodiac-dashboard.mjs",
));

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
