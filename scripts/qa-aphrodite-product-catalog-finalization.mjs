#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  APHRODITE_PRODUCT_CATALOG_CLASSIFICATION,
  APHRODITE_PRODUCT_CATALOG_FREE_FALLBACK_ROUTE,
  APHRODITE_PRODUCT_CATALOG_MAIN_MINIAPP_ROUTE,
  APHRODITE_PRODUCT_CATALOG_SAFETY_LABELS,
  getAphroditeFreeProducts,
  getAphroditeFutureVipProducts,
  getAphroditeProductById,
  getAphroditeProductCatalog,
  getAphroditeProductCatalogBoundaries,
  getAphroditeProductCatalogNextSteps,
  getAphroditeProductCatalogRules,
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

console.log("Старт QA: финальный каталог продуктов Aphrodite...\n");

const modelPath = "../lib/zodiac/aphrodite-product-catalog.ts";
const dashboardPath = "../app/dashboard/networks/zodiac/product-catalog-finalization/page.tsx";
const docsPath = "../docs/aphrodite-product-catalog-finalization.md";
const reportPath = "../docs/aphrodite-package-reports/package-162.md";
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

const catalog = getAphroditeProductCatalog();
const freeProducts = getAphroditeFreeProducts();
const futureVipProducts = getAphroditeFutureVipProducts();
const rules = getAphroditeProductCatalogRules();
const boundaries = getAphroditeProductCatalogBoundaries();
const nextSteps = getAphroditeProductCatalogNextSteps();

check("catalog exists", Array.isArray(catalog) && catalog.length > 0);
check("catalog has at least 12 products", catalog.length >= 12);
check("catalog classification is catalog-only", APHRODITE_PRODUCT_CATALOG_CLASSIFICATION.includes("Только каталог продуктов"));
check("main Mini App route is declared", APHRODITE_PRODUCT_CATALOG_MAIN_MINIAPP_ROUTE === "/miniapp");
check("free preview fallback route is /miniapp/love-reading-preview", APHRODITE_PRODUCT_CATALOG_FREE_FALLBACK_ROUTE === "/miniapp/love-reading-preview");

const ids = catalog.map((product) => product.id);
check("all product IDs are unique", new Set(ids).size === ids.length);

const requiredProducts = [
  ["free-love-reading-preview", "Free Love Reading Preview"],
  ["full-love-report", "Full Love Report"],
  ["vip-love-access", "VIP Love Access"],
  ["ai-future-timeline-vip", "AI Future Timeline VIP"],
  ["soulmate-scanner-vip", "Soulmate Scanner VIP"],
  ["red-flags-scanner-vip", "Red Flags Scanner VIP"],
  ["birth-matrix-free-preview", "Birth Matrix Free Preview"],
  ["birth-matrix-vip", "Birth Matrix VIP"],
  ["natal-chart-vip", "Natal Chart VIP"],
  ["vip-couple-calendar", "VIP Couple Calendar"],
  ["vip-numerology", "VIP Numerology"],
  ["daily-message-from-universe", "Daily Message From Universe"],
];

for (const [id, label] of requiredProducts) {
  const product = getAphroditeProductById(id);
  check(`${label} exists`, Boolean(product));
}

check("compatibility free preview from current UI is included", Boolean(getAphroditeProductById("compatibility-free-preview")));
check("free products are marked free/free-preview", freeProducts.length >= 4 && freeProducts.every((product) => product.accessLevel === "free" || product.accessLevel === "free-preview"));
check("future VIP products are present", futureVipProducts.length >= 9);
check("future VIP products have guardRequired=true", futureVipProducts.every((product) => product.guardRequired === true));
check("future VIP products have entitlementRequired=true", futureVipProducts.every((product) => product.entitlementRequired === true));
check("future VIP products have fallback route", futureVipProducts.every((product) => product.fallbackRoute === APHRODITE_PRODUCT_CATALOG_FREE_FALLBACK_ROUTE));
check("paymentEnabledNow=false for every product", catalog.every((product) => product.paymentEnabledNow === false));
check("vipUnlockEnabledNow=false for every product", catalog.every((product) => product.vipUnlockEnabledNow === false));
check("future paid/VIP products have ownerReviewRequired=true", futureVipProducts.every((product) => product.ownerReviewRequired === true));
check("future paid/VIP products require payment later", futureVipProducts.every((product) => product.paymentRequired === true));
check("free products do not require payment now", freeProducts.every((product) => product.paymentRequired === false));
check("what remains free is documented for every product", catalog.every((product) => product.whatRemainsFree.length > 0));
check("locked requirements are documented for every future VIP product", futureVipProducts.every((product) => product.mustStayLockedUntil.length > 0));

check("catalog rules exist", rules.length >= 9);
check("safety boundaries exist", boundaries.length >= 10);
check("next step exists", nextSteps.some((step) => step.package === "Package 163" && step.title === "Payment Ledger Design"));

for (const rule of [
  "Free preview remains open",
  "Future VIP products remain locked",
  "Payment is disabled now",
  "VIP unlock is disabled now",
  "Entitlement creation is disabled now",
  "Every future VIP product must have fallback route",
  "Every future paid product must require future guard",
  "Every future paid product must require future entitlement",
  "No product can be production-paid without owner review",
]) {
  check(`required rule exists: ${rule}`, rules.some((item) => item.label === rule));
}

for (const label of APHRODITE_PRODUCT_CATALOG_SAFETY_LABELS) {
  check(`Russian visible boundary string exists: ${label}`, userFacingBundle.includes(label));
}

for (const dataBoundary of [
  "no-real-vip-unlock",
  "no-payment",
  "no-stars-invoice",
  "no-successful-payment-handler",
  "no-entitlement-creation",
  "no-database-write",
  "no-database-schema-migration",
  "no-telegram-api-call",
  "no-production-launch",
  "catalog-does-not-open-vip",
]) {
  check(`data boundary exists: ${dataBoundary}`, boundaries.some((boundary) => boundary.dataBoundary === dataBoundary) && dashboardSource.includes("data-boundary={boundary.dataBoundary}"));
}

check("dashboard route is registered in dashboard QA", dashboardQaSource.includes("productCatalogFinalization"));
check("dashboard QA checks product catalog title", dashboardQaSource.includes("Финальный каталог продуктов Aphrodite"));
check("dashboard QA checks catalog classification", dashboardQaSource.includes("Только каталог продуктов"));
check("dashboard QA checks catalog no unlock boundary", dashboardQaSource.includes("Каталог не открывает VIP"));

check("no real payment API is used", !/from ['"]stripe|require\(['"]stripe|new Stripe\b|checkout\.sessions|charges\.create|payment_intents|paypal|yookassa|liqpay/i.test(implementationBundle));
check("no Telegram token required", !/TELEGRAM_BOT_TOKEN|COMPATIBILITY_BOT_TOKEN|process\.env\.[A-Z_]*TELEGRAM/i.test(implementationBundle));
check("no database connection required", !/DATABASE_URL|createClient\(|new Pool\(|drizzle\(|from\([^)]*\)\.(insert|update|delete|upsert)\(/i.test(implementationBundle));
check("no Stars invoice created", !/sendInvoice\(|createInvoiceLink\(|answerPreCheckoutQuery\(/i.test(implementationBundle));
check("no successful_payment handler added", !/successful_payment\s*[:=]|case\s+["']successful_payment["']|function\s+\w*successful|update\.message\.successful_payment/i.test(implementationBundle));
check("no entitlement creation function implemented", !/function\s+create\w*Entitlement|const\s+create\w*Entitlement|export\s+function\s+create\w*Entitlement|grantVip\(|unlockVip\(|insert\w*Entitlement/i.test(implementationBundle));
check("no real VIP unlock introduced", !/vipUnlockEnabledNow\s*:\s*true|vipUnlocked\s*=\s*true|realVipAccess\s*=\s*true|allowed\s*:\s*true|setVipActive\(|grantVip\(|unlockVip\(/i.test(implementationBundle));
check("no active payment CTA is present", !/Купить VIP|Оплатить|Разблокировать отч[её]т|Подписаться|Активировать VIP|Получить доступ после оплаты|Buy now|Subscribe now|Purchase now|Activate VIP|Payment successful|Premium unlocked/i.test(userFacingBundle));

const changedDbFiles = gitDiffNames(["prisma", "supabase", "migrations", "schema.prisma"]).filter((file) =>
  /(^|\/)(prisma|supabase|migrations)(\/|$)|schema\.prisma$/i.test(file),
);
check("no DB migration/schema file changed", changedDbFiles.length === 0);

const workflowChanges = gitDiffNames([".github/workflows", "package.json"]);
check("workflows and package.json are not changed", workflowChanges.length === 0);

const scriptChanges = gitDiffNames(["scripts"]);
check("only Package 162 QA and dashboard QA changed in scripts", scriptChanges.every((file) =>
  file === "scripts/qa-aphrodite-product-catalog-finalization.mjs" || file === "scripts/qa-zodiac-dashboard.mjs",
));

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
