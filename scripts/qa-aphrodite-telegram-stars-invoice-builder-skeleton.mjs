#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  APHRODITE_STARS_INVOICE_BUILDER_CLASSIFICATION,
  APHRODITE_STARS_INVOICE_BUILDER_SAFETY_LABELS,
  APHRODITE_STARS_INVOICE_BUILDER_TITLE,
  buildAphroditeStarsInvoiceDraftSkeleton,
  getAphroditeStarsInvoiceBuilderBoundaries,
  getAphroditeStarsInvoiceBuilderNextSteps,
  getAphroditeStarsInvoiceProductCatalog,
  getAphroditeStarsInvoiceProducts,
} from "../lib/zodiac/aphrodite-telegram-stars-invoice-builder-skeleton.ts";

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

console.log("Старт QA: invoice builder skeleton Telegram Stars Aphrodite...\n");

const modelPath = "../lib/zodiac/aphrodite-telegram-stars-invoice-builder-skeleton.ts";
const pagePath = "../app/dashboard/networks/zodiac/telegram-stars-invoice-builder-skeleton/page.tsx";
const docsPath = "../docs/aphrodite-telegram-stars-invoice-builder-skeleton.md";
const reportPath = "../docs/aphrodite-package-reports/package-170.md";
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

const productIds = getAphroditeStarsInvoiceProducts();
const products = getAphroditeStarsInvoiceProductCatalog();
const boundaries = getAphroditeStarsInvoiceBuilderBoundaries();
const nextSteps = getAphroditeStarsInvoiceBuilderNextSteps();

check("draft builder exists", typeof buildAphroditeStarsInvoiceDraftSkeleton === "function");
check("product ids exist", productIds.length === 9);
check("product catalog exists", products.length === 9);
check("boundaries exist", boundaries.length >= 7);
check("next steps exist", nextSteps.some((step) => step.package === "Package 171"));

for (const title of [
  "Full Love Report",
  "VIP Love Access",
  "AI Future Timeline VIP",
  "Soulmate Scanner VIP",
  "Red Flags Scanner VIP",
  "Birth Matrix VIP",
  "Natal Chart VIP",
  "VIP Couple Calendar",
  "VIP Numerology",
]) {
  check(`supported product exists: ${title}`, products.some((product) => product.title === title) && userFacingBundle.includes(title));
}

for (const dependency of ["product catalog", "owner review gate", "payment ledger", "entitlement storage", "security QA", "future env flags"]) {
  check(`dependency documented: ${dependency}`, userFacingBundle.includes(dependency));
}

const blockedDraft = buildAphroditeStarsInvoiceDraftSkeleton({
  productId: "full_love_report",
  telegramUserId: "12345",
});

const allTrueDraft = buildAphroditeStarsInvoiceDraftSkeleton({
  productId: "vip_love_access",
  telegramUserId: "12345",
  ownerApproved: true,
  paymentsEnabled: true,
  starsLiveEnabled: true,
});

check("sendAllowedNow=false", blockedDraft.sendAllowedNow === false && allTrueDraft.sendAllowedNow === false);
check("all-true input still blocked", allTrueDraft.validationState === "draft-only" && allTrueDraft.sendAllowedNow === false);
check("canCallTelegramApiNow=false", blockedDraft.canCallTelegramApiNow === false && allTrueDraft.canCallTelegramApiNow === false);
check("createsPaymentLedgerNow=false", blockedDraft.createsPaymentLedgerNow === false && allTrueDraft.createsPaymentLedgerNow === false);
check("createsEntitlementNow=false", blockedDraft.createsEntitlementNow === false && allTrueDraft.createsEntitlementNow === false);
check("unlocksVipNow=false", blockedDraft.unlocksVipNow === false && allTrueDraft.unlocksVipNow === false);
check("unknown product remains draft-only blocked", buildAphroditeStarsInvoiceDraftSkeleton({ productId: "unknown" }).validationState === "unknown-product");

check("dashboard QA route exists", dashboardQaSource.includes("telegramStarsInvoiceBuilderSkeleton"));
check("dashboard QA checks title", dashboardQaSource.includes(APHRODITE_STARS_INVOICE_BUILDER_TITLE));
check("dashboard QA checks classification", dashboardQaSource.includes("Только invoice draft"));
check("overview route link exists", dashboardQaSource.includes("/dashboard/networks/zodiac/telegram-stars-invoice-builder-skeleton"));
check("page shows classification", pageSource.includes("APHRODITE_STARS_INVOICE_BUILDER_CLASSIFICATION") && userFacingBundle.includes(APHRODITE_STARS_INVOICE_BUILDER_CLASSIFICATION));

for (const label of APHRODITE_STARS_INVOICE_BUILDER_SAFETY_LABELS) {
  check(`visible safety label exists: ${label}`, userFacingBundle.includes(label));
}

for (const boundary of [
  "no-real-payment",
  "no-stars-invoice",
  "no-send-invoice",
  "no-create-invoice-link",
  "no-ledger-access",
  "no-entitlement-access",
  "no-telegram-api",
]) {
  check(`data boundary exists: ${boundary}`, boundaries.some((item) => item.id === boundary) && pageSource.includes("data-boundary={boundary.id}"));
}

check("docs say package creates drafts only", docsSource.includes("Package 170 создаёт только безопасный invoice draft skeleton"));
check("docs say no sendInvoice call", docsSource.includes("не вызывает sendInvoice"));
check("docs say no createInvoiceLink call", docsSource.includes("не вызывает createInvoiceLink"));
check("report says no Telegram API", reportSource.includes("не вызывает Telegram API"));
check("report says next package Package 171", reportSource.includes("Package 171 — Telegram Stars PreCheckout Handler Skeleton"));

const implementationWithoutSafetyText = implementationBundle
  .replaceAll("Нет sendInvoice", "Нет live invoice")
  .replaceAll("Нет createInvoiceLink", "Нет invoice link")
  .replaceAll("Нет pre_checkout_query handler", "Нет pre checkout handler")
  .replaceAll("Нет successful_payment handler", "Нет successful payment handler")
  .replaceAll("pre_checkout_query handler", "pre checkout handler")
  .replaceAll("successful_payment handler", "successful payment handler");

check("no real payment API is used", !/from ['"]stripe|require\(['"]stripe|new Stripe\b|checkout\.sessions|charges\.create|payment_intents|paypal|yookassa|liqpay/i.test(implementationBundle));
check("no sendInvoice", !/sendInvoice\(/i.test(implementationBundle));
check("no createInvoiceLink", !/createInvoiceLink\(/i.test(implementationBundle));
check("no pre-checkout handler", !/pre_checkout_query\s*[:=]|case\s+["']pre_checkout_query["']|function\s+\w*preCheckout|answerPreCheckoutQuery\(/i.test(implementationWithoutSafetyText));
check("no successful_payment handler", !/successful_payment\s*[:=]|case\s+["']successful_payment["']|function\s+\w*successful|update\.message\.successful_payment/i.test(implementationWithoutSafetyText));
check("no entitlement creation function", !/function\s+create\w*Entitlement|const\s+create\w*Entitlement|export\s+function\s+create\w*Entitlement|grantVip\(|unlockVip\(|insert\w*Entitlement/i.test(implementationBundle));
check("no DB write", !/process\.env\.DATABASE_URL|createClient\(|new Pool\(|drizzle\(|from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\(|\.update\(|\.delete\(|\.upsert\(/i.test(implementationBundle));
check("no Telegram API", !/fetch\([^)]*api\.telegram\.org|sendMessage\(|sendPhoto\(|sendDocument\(|sendInvoice\(|answerPreCheckoutQuery\(/i.test(implementationBundle));
check("no active payment CTA", !/Купить VIP|Оплатить|Разблокировать отч[её]т|Подписаться|Активировать VIP|Получить доступ после оплаты|Buy now|Subscribe now|Purchase now|Activate VIP|Payment successful|Premium unlocked/i.test(userFacingBundle));
check("no active allow flags", !/sendAllowedNow\s*:\s*true|canCallTelegramApiNow\s*:\s*true|createsEntitlementNow\s*:\s*true|unlocksVipNow\s*:\s*true|approvedForLaunch\s*:\s*true/i.test(implementationBundle));
check("no external AI API call", !/openai|anthropic|gemini|process\.env\.[A-Z_]*(OPENAI|ANTHROPIC|GEMINI)/i.test(implementationBundle));

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
