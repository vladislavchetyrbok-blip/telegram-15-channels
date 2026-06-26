#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  APHRODITE_PRODUCT_CATALOG_FREE_FALLBACK_ROUTE,
  getAphroditeFutureVipProducts,
  getAphroditeProductCatalog,
} from "../lib/zodiac/aphrodite-product-catalog.ts";
import {
  APHRODITE_VIP_FREE_PREVIEW_FALLBACK_ROUTE,
  getAphroditeVipFallbackSurfaces,
} from "../lib/zodiac/aphrodite-vip-free-preview-fallback-map.ts";
import {
  APHRODITE_VIP_GUARD_FALLBACK_ROUTE,
  checkAphroditeVipAccessSkeleton,
} from "../lib/zodiac/aphrodite-vip-access-guard-skeleton.ts";
import { getAphroditeVipGuardIntegrationSurfaces } from "../lib/zodiac/aphrodite-vip-guard-integration-review.ts";
import { getAphroditePaymentLedgerDesignItems } from "../lib/zodiac/aphrodite-payment-ledger-design.ts";
import { getAphroditeEntitlementStorageFields } from "../lib/zodiac/aphrodite-entitlement-storage-design.ts";
import { validateAphroditeEntitlementSchemaSkeleton } from "../lib/zodiac/aphrodite-entitlement-schema-skeleton.ts";
import {
  APHRODITE_SERVER_ENTITLEMENT_CHECK_FALLBACK_ROUTE,
  checkAphroditeServerEntitlementSkeleton,
} from "../lib/zodiac/aphrodite-server-entitlement-check-skeleton.ts";
import {
  APHRODITE_VIP_ACCESS_SECURITY_SUITE_CLASSIFICATION,
  APHRODITE_VIP_ACCESS_SECURITY_SUITE_FALLBACK_ROUTE,
  APHRODITE_VIP_ACCESS_SECURITY_SUITE_SAFETY_LABELS,
  getAphroditeVipAccessSecurityBoundaries,
  getAphroditeVipAccessSecurityGates,
  getAphroditeVipAccessSecurityLayers,
  getAphroditeVipAccessSecurityNextSteps,
} from "../lib/zodiac/aphrodite-vip-access-security-suite.ts";

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

console.log("Старт QA: VIP access security suite Aphrodite...\n");

const requiredModelFiles = [
  "../lib/zodiac/aphrodite-product-catalog.ts",
  "../lib/zodiac/aphrodite-vip-free-preview-fallback-map.ts",
  "../lib/zodiac/aphrodite-vip-access-guard-skeleton.ts",
  "../lib/zodiac/aphrodite-vip-guard-integration-review.ts",
  "../lib/zodiac/aphrodite-payment-ledger-design.ts",
  "../lib/zodiac/aphrodite-entitlement-storage-design.ts",
  "../lib/zodiac/aphrodite-entitlement-schema-skeleton.ts",
  "../lib/zodiac/aphrodite-server-entitlement-check-skeleton.ts",
  "../lib/zodiac/aphrodite-vip-access-security-suite.ts",
];

const requiredDashboardFiles = [
  "../app/dashboard/networks/zodiac/product-catalog-finalization/page.tsx",
  "../app/dashboard/networks/zodiac/vip-free-preview-fallback-map/page.tsx",
  "../app/dashboard/networks/zodiac/vip-access-guard-skeleton/page.tsx",
  "../app/dashboard/networks/zodiac/vip-guard-integration-review/page.tsx",
  "../app/dashboard/networks/zodiac/payment-ledger-design/page.tsx",
  "../app/dashboard/networks/zodiac/entitlement-storage-design/page.tsx",
  "../app/dashboard/networks/zodiac/entitlement-schema-skeleton/page.tsx",
  "../app/dashboard/networks/zodiac/server-entitlement-check-skeleton/page.tsx",
  "../app/dashboard/networks/zodiac/vip-access-security-suite/page.tsx",
];

const requiredQaFiles = [
  "./qa-aphrodite-vip-access-guard-skeleton.mjs",
  "./qa-aphrodite-vip-guard-integration-review.mjs",
  "./qa-aphrodite-vip-free-preview-fallback-map.mjs",
  "./qa-aphrodite-product-catalog-finalization.mjs",
  "./qa-aphrodite-payment-ledger-design.mjs",
  "./qa-aphrodite-entitlement-storage-design.mjs",
  "./qa-aphrodite-entitlement-schema-skeleton.mjs",
  "./qa-aphrodite-server-entitlement-check-skeleton.mjs",
  "./qa-aphrodite-vip-access-security-suite.mjs",
];

for (const file of requiredModelFiles) check(`model file exists: ${file}`, exists(file));
for (const file of requiredDashboardFiles) check(`dashboard page exists: ${file}`, exists(file));
for (const file of requiredQaFiles) check(`QA script exists: ${file}`, exists(file));

const docsPath = "../docs/aphrodite-vip-access-security-suite.md";
const reportPath = "../docs/aphrodite-package-reports/package-167.md";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";
check("documentation exists", exists(docsPath));
check("package report exists", exists(reportPath));
check("dashboard QA exists", exists(dashboardQaPath));

const modelSources = requiredModelFiles.map((file) => (exists(file) ? read(file) : "")).join("\n");
const dashboardSources = requiredDashboardFiles.map((file) => (exists(file) ? read(file) : "")).join("\n");
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";
const implementationBundle = [modelSources, dashboardSources].join("\n");
const userFacingBundle = [modelSources, dashboardSources, docsSource, reportSource].join("\n");

const catalog = getAphroditeProductCatalog();
const futureVipProducts = getAphroditeFutureVipProducts();
const fallbackSurfaces = getAphroditeVipFallbackSurfaces();
const integrationSurfaces = getAphroditeVipGuardIntegrationSurfaces();
const ledgerItems = getAphroditePaymentLedgerDesignItems();
const storageFields = getAphroditeEntitlementStorageFields();
const schemaResult = validateAphroditeEntitlementSchemaSkeleton({
  id: "future-entitlement-valid",
  telegramUserId: "123456789",
  productId: "full-love-report",
  sourcePaymentLedgerId: "future-ledger-valid",
  status: "active",
  startsAt: "2026-01-01T00:00:00.000Z",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  auditReason: "future security suite check",
});
const guardResult = checkAphroditeVipAccessSkeleton({
  product: "vip-love-access",
  mockClientVipFlag: true,
  mockQueryVipFlag: true,
  mockPaymentSuccess: true,
});
const serverDefaultResult = checkAphroditeServerEntitlementSkeleton({ productId: "vip-love-access" });
const serverClientFlagResult = checkAphroditeServerEntitlementSkeleton({ productId: "vip-love-access", mockClientVipFlag: true });
const serverQueryFlagResult = checkAphroditeServerEntitlementSkeleton({ productId: "vip-love-access", mockQueryVipFlag: true });
const serverPaymentResult = checkAphroditeServerEntitlementSkeleton({ productId: "vip-love-access", mockPaymentSuccess: true });
const serverFakeRecordResult = checkAphroditeServerEntitlementSkeleton({
  productId: "vip-love-access",
  mockEntitlementRecord: { status: "active", productId: "vip-love-access" },
});

const layers = getAphroditeVipAccessSecurityLayers();
const gates = getAphroditeVipAccessSecurityGates();
const boundaries = getAphroditeVipAccessSecurityBoundaries();
const nextSteps = getAphroditeVipAccessSecurityNextSteps();

check("suite classification is QA only", APHRODITE_VIP_ACCESS_SECURITY_SUITE_CLASSIFICATION.includes("Только QA безопасности"));
check("suite fallback route is free preview", APHRODITE_VIP_ACCESS_SECURITY_SUITE_FALLBACK_ROUTE === "/miniapp/love-reading-preview");
check("security layers cover all relevant components", layers.length >= 8);
check("security gates cover required checks", gates.length >= 18);
check("security boundaries exist", boundaries.length >= 10);
check("next step is Package 168 but not started", nextSteps.some((step) => step.package === "Package 168" && step.title === "Owner Review Gate For VIP Launch"));

check("product catalog has products", catalog.length > 0);
check("all product IDs are unique", new Set(catalog.map((product) => product.id)).size === catalog.length);
check("paymentEnabledNow=false for all products", catalog.every((product) => product.paymentEnabledNow === false));
check("vipUnlockEnabledNow=false for all products", catalog.every((product) => product.vipUnlockEnabledNow === false));
check("future VIP products exist", futureVipProducts.length >= 9);
check("future VIP products require guard", futureVipProducts.every((product) => product.guardRequired === true));
check("future VIP products require entitlement", futureVipProducts.every((product) => product.entitlementRequired === true));
check("future VIP fallback route is free preview", futureVipProducts.every((product) => product.fallbackRoute === "/miniapp/love-reading-preview"));
check("product catalog fallback route is free preview", APHRODITE_PRODUCT_CATALOG_FREE_FALLBACK_ROUTE === "/miniapp/love-reading-preview");

check("fallback map route is free preview", APHRODITE_VIP_FREE_PREVIEW_FALLBACK_ROUTE === "/miniapp/love-reading-preview");
check("fallback surfaces exist", fallbackSurfaces.length > 0);
check("guard integration surfaces exist", integrationSurfaces.length > 0);
check("guard fallback route is free preview", APHRODITE_VIP_GUARD_FALLBACK_ROUTE === "/miniapp/love-reading-preview");
check("server fallback route is free preview", APHRODITE_SERVER_ENTITLEMENT_CHECK_FALLBACK_ROUTE === "/miniapp/love-reading-preview");

check("guard skeleton returns allowed=false", guardResult.allowed === false);
check("guard skeleton returns fallback", guardResult.fallbackRoute === "/miniapp/love-reading-preview");
check("server skeleton default returns allowed=false", serverDefaultResult.allowed === false);
check("server skeleton fake localStorage/client flag denied", serverClientFlagResult.allowed === false && serverClientFlagResult.ignoredClientSignals.some((signal) => signal.includes("mockClientVipFlag")));
check("server skeleton fake query flag denied", serverQueryFlagResult.allowed === false && serverQueryFlagResult.ignoredClientSignals.some((signal) => signal.includes("mockQueryVipFlag")));
check("server skeleton fake payment success denied", serverPaymentResult.allowed === false && serverPaymentResult.ignoredClientSignals.some((signal) => signal.includes("mockPaymentSuccess")));
check("server skeleton fake entitlement record denied", serverFakeRecordResult.allowed === false && serverFakeRecordResult.ignoredClientSignals.some((signal) => signal.includes("mockEntitlementRecord")));
check("schema skeleton grantsAccessNow=false", schemaResult.validShape === true && schemaResult.grantsAccessNow === false);
check("ledger design writes nothing", ledgerItems.length > 0 && ledgerItems.every((item) => item.designOnly === true && item.createsEntitlementNow === false && item.writesToDatabaseNow === false));
check("entitlement storage writes nothing", storageFields.length > 0 && storageFields.every((field) => field.designOnly === true && field.writesToDatabaseNow === false));

for (const requiredGate of [
  "No VIP without entitlement",
  "No VIP from localStorage",
  "No VIP from query param",
  "No VIP from mock payment success",
  "No VIP from fake entitlement record",
  "No active payment API",
  "No successful_payment handler",
  "No Stars invoice",
  "No entitlement creation",
  "No DB write",
  "No DB migration",
  "No Telegram API call",
  "Free preview remains open",
  "Fallback route exists",
  "Product catalog has paymentEnabledNow=false",
  "Product catalog has vipUnlockEnabledNow=false",
  "Guard skeleton allowed=false",
  "Server entitlement skeleton allowed=false",
]) {
  check(`required security gate exists: ${requiredGate}`, gates.some((gate) => gate.visibleRule === requiredGate && gate.expectedResult === "PASS" && gate.safetyOnly === true));
}

for (const label of APHRODITE_VIP_ACCESS_SECURITY_SUITE_SAFETY_LABELS) {
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
  "qa-suite-opens-nothing",
]) {
  check(`data boundary exists: ${boundary}`, boundaries.some((item) => item.dataBoundary === boundary) && dashboardSources.includes(`data-boundary={boundary.dataBoundary}`));
}

check("dashboard route is registered in dashboard QA", dashboardQaSource.includes("vipAccessSecuritySuite"));
check("dashboard QA checks suite title", dashboardQaSource.includes("Security QA для VIP-доступа"));
check("dashboard QA checks suite classification", dashboardQaSource.includes("Только QA безопасности"));
check("dashboard QA checks opens nothing label", dashboardQaSource.includes("QA suite ничего не открывает"));

const implementationWithoutBypassLabels = implementationBundle
  .replaceAll("hardcoded allowed" + "=true", "")
  .replaceAll("allowed" + "=true без server-side entitlement", "");
check("no literal active allow flag exists", !implementationWithoutBypassLabels.includes("allowed" + "=true"));
check("no active payment API is used", !/from ['"]stripe|require\(['"]stripe|new Stripe\b|checkout\.sessions|charges\.create|payment_intents|paypal|yookassa|liqpay/i.test(implementationBundle));
check("no Stars invoice is created", !/sendInvoice\(|createInvoiceLink\(|answerPreCheckoutQuery\(/i.test(implementationBundle));
check("no successful_payment handler code is added", !/successful_payment\s*[:=]|case\s+["']successful_payment["']|function\s+\w*successful|update\.message\.successful_payment/i.test(implementationBundle));
check("no Telegram token is required", !/TELEGRAM_BOT_TOKEN|COMPATIBILITY_BOT_TOKEN|process\.env\.[A-Z_]*TELEGRAM/i.test(implementationBundle));
check("no database connection or write is used", !/DATABASE_URL|createClient\(|new Pool\(|drizzle\(|from\([^)]*\)\.(insert|update|delete|upsert)\(/i.test(implementationBundle));
check("no entitlement creation function is implemented", !/function\s+create\w*Entitlement|const\s+create\w*Entitlement|export\s+function\s+create\w*Entitlement|grantVip\(|unlockVip\(|insert\w*Entitlement/i.test(implementationBundle));
check("no real VIP unlock is introduced", !/vipUnlockEnabledNow\s*:\s*true|vipUnlocked\s*=\s*true|realVipAccess\s*=\s*true|allowed\s*:\s*true|setVipActive\(|grantVip\(|unlockVip\(/i.test(implementationBundle));
check("no production guard connection is introduced", !/NextResponse|middleware\(|export\s+async\s+function\s+(GET|POST)|requireDashboardPageAccess|redirect\(/i.test(modelSources));
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
