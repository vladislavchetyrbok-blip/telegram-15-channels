#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  APHRODITE_PRECHECKOUT_SKELETON_CLASSIFICATION,
  APHRODITE_PRECHECKOUT_SKELETON_SAFETY_LABELS,
  APHRODITE_PRECHECKOUT_SKELETON_TITLE,
  getAphroditePreCheckoutSkeletonBoundaries,
  getAphroditePreCheckoutSkeletonNextSteps,
  getAphroditePreCheckoutSkeletonProductIds,
  getAphroditePreCheckoutSkeletonRules,
  validateAphroditePreCheckoutSkeleton,
} from "../lib/zodiac/aphrodite-telegram-stars-precheckout-skeleton.ts";

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

console.log("Старт QA: pre-checkout skeleton Telegram Stars Aphrodite...\n");

const modelPath = "../lib/zodiac/aphrodite-telegram-stars-precheckout-skeleton.ts";
const pagePath = "../app/dashboard/networks/zodiac/telegram-stars-precheckout-skeleton/page.tsx";
const docsPath = "../docs/aphrodite-telegram-stars-precheckout-skeleton.md";
const reportPath = "../docs/aphrodite-package-reports/package-171.md";
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

const rules = getAphroditePreCheckoutSkeletonRules();
const boundaries = getAphroditePreCheckoutSkeletonBoundaries();
const nextSteps = getAphroditePreCheckoutSkeletonNextSteps();
const productIds = getAphroditePreCheckoutSkeletonProductIds();

check("validation function exists", typeof validateAphroditePreCheckoutSkeleton === "function");
check("rules exist", rules.length >= 11);
check("boundaries exist", boundaries.length >= 6);
check("next steps exist", nextSteps.some((step) => step.package === "Package 172"));
check("product ids come from invoice catalog", productIds.includes("full_love_report") && productIds.includes("vip_numerology"));

const defaultResult = validateAphroditePreCheckoutSkeleton({
  productId: "full_love_report",
  amount: 299,
  currency: "XTR",
});

const allTrueResult = validateAphroditePreCheckoutSkeleton({
  productId: "full_love_report",
  amount: 299,
  currency: "XTR",
  telegramUserId: "12345",
  invoicePayload: "aphrodite:full_love_report:12345",
  ownerApproved: true,
  paymentsEnabled: true,
  starsLiveEnabled: true,
  securityQaApproved: true,
  paymentLedgerReady: true,
  entitlementStorageReady: true,
  supportPolicyReady: true,
  backupFresh: true,
});

check("default result blocked", defaultResult.answerAllowedNow === false && defaultResult.preCheckoutApprovedNow === false);
check("all-true mock input still blocked", allTrueResult.answerAllowedNow === false && allTrueResult.continuesPaymentNow === false);
check("answerAllowedNow=false", defaultResult.answerAllowedNow === false && allTrueResult.answerAllowedNow === false);
check("canCallTelegramApiNow=false", defaultResult.canCallTelegramApiNow === false && allTrueResult.canCallTelegramApiNow === false);
check("preCheckoutApprovedNow=false", defaultResult.preCheckoutApprovedNow === false && allTrueResult.preCheckoutApprovedNow === false);
check("continuesPaymentNow=false", defaultResult.continuesPaymentNow === false && allTrueResult.continuesPaymentNow === false);
check("createsPaymentLedgerNow=false", defaultResult.createsPaymentLedgerNow === false && allTrueResult.createsPaymentLedgerNow === false);
check("createsEntitlementNow=false", defaultResult.createsEntitlementNow === false && allTrueResult.createsEntitlementNow === false);
check("unlocksVipNow=false", defaultResult.unlocksVipNow === false && allTrueResult.unlocksVipNow === false);

for (const futureCheck of [
  "productId должен существовать в product catalog.",
  "amount должен совпадать с будущей ценой product catalog.",
  "currency должна быть XTR.",
  "Telegram user identity должен быть связан с profile foundation.",
  "invoice payload должен быть распознан и связан с productId.",
  "owner review gate должен быть пройден перед любым ответом.",
  "security QA должен подтверждать отсутствие client-side bypass.",
  "payment ledger должен быть готов до продолжения оплаты.",
  "entitlement storage должен быть готов до будущего доступа.",
  "support/refund policy должен быть готов до оплаты.",
  "backup должен быть свежим перед любым payment ledger write.",
]) {
  check(`future check documented: ${futureCheck}`, rules.some((rule) => rule.futureCheck === futureCheck) && userFacingBundle.includes(futureCheck));
}

check("dashboard QA route exists", dashboardQaSource.includes("telegramStarsPreCheckoutSkeleton"));
check("dashboard QA checks title", dashboardQaSource.includes(APHRODITE_PRECHECKOUT_SKELETON_TITLE));
check("dashboard QA checks classification", dashboardQaSource.includes("Только pre-checkout skeleton"));
check("overview route link exists", dashboardQaSource.includes("/dashboard/networks/zodiac/telegram-stars-precheckout-skeleton"));
check("page shows classification", pageSource.includes("APHRODITE_PRECHECKOUT_SKELETON_CLASSIFICATION") && userFacingBundle.includes(APHRODITE_PRECHECKOUT_SKELETON_CLASSIFICATION));

for (const label of APHRODITE_PRECHECKOUT_SKELETON_SAFETY_LABELS) {
  check(`visible safety label exists: ${label}`, userFacingBundle.includes(label));
}

check("docs say package models validation only", docsSource.includes("Package 171 моделирует только будущую pre-checkout validation"));
check("docs say no answerPreCheckoutQuery", docsSource.includes("не вызывает answerPreCheckoutQuery"));
check("report says no active handler", reportSource.includes("не добавляет active pre_checkout_query handler"));
check("report says next package Package 172", reportSource.includes("Package 172 — Telegram Stars successful_payment Skeleton"));

const implementationWithoutExpectedNames = implementationBundle
  .replaceAll("validateAphroditePreCheckoutSkeleton", "validateSkeleton")
  .replaceAll("AphroditePreCheckoutSkeleton", "AphroditeValidationSkeleton")
  .replaceAll("Нет answerPreCheckoutQuery", "Нет answer query")
  .replaceAll("Нет pre_checkout_query handler", "Нет pre checkout handler")
  .replaceAll("pre_checkout_query handler", "pre checkout handler")
  .replaceAll("Нет successful_payment handler", "Нет successful payment handler")
  .replaceAll("successful_payment handler", "successful payment handler");

check("no answerPreCheckoutQuery", !/answerPreCheckoutQuery\(/i.test(implementationBundle));
check("no active pre_checkout route or handler", !/pre_checkout_query\s*[:=]|case\s+["']pre_checkout_query["']|route\.ts|webhook|answerPreCheckoutQuery\(/i.test(implementationWithoutExpectedNames));
check("no payment or ledger action", !/continuesPaymentNow\s*:\s*true|createsPaymentLedgerNow\s*:\s*true|\.insert\(|ledgerWrite|recordPayment/i.test(implementationBundle));
check("no entitlement or VIP action", !/createsEntitlementNow\s*:\s*true|unlocksVipNow\s*:\s*true|grantVip\(|unlockVip\(|allowed\s*:\s*true/i.test(implementationBundle));
check("no DB write", !/process\.env\.DATABASE_URL|createClient\(|new Pool\(|drizzle\(|from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\(|\.update\(|\.delete\(|\.upsert\(/i.test(implementationBundle));
check("no Telegram API", !/fetch\([^)]*api\.telegram\.org|sendMessage\(|sendPhoto\(|sendDocument\(|sendInvoice\(|answerPreCheckoutQuery\(/i.test(implementationBundle));
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
