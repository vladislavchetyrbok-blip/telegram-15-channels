#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  APHRODITE_SUCCESSFUL_PAYMENT_SKELETON_CLASSIFICATION,
  APHRODITE_SUCCESSFUL_PAYMENT_SKELETON_SAFETY_LABELS,
  APHRODITE_SUCCESSFUL_PAYMENT_SKELETON_TITLE,
  getAphroditeSuccessfulPaymentSkeletonBoundaries,
  getAphroditeSuccessfulPaymentSkeletonNextSteps,
  getAphroditeSuccessfulPaymentSkeletonRules,
  inspectAphroditeSuccessfulPaymentSkeleton,
} from "../lib/zodiac/aphrodite-telegram-stars-successful-payment-skeleton.ts";

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

console.log("Старт QA: successful_payment skeleton Telegram Stars Aphrodite...\n");

const modelPath = "../lib/zodiac/aphrodite-telegram-stars-successful-payment-skeleton.ts";
const pagePath = "../app/dashboard/networks/zodiac/telegram-stars-successful-payment-skeleton/page.tsx";
const docsPath = "../docs/aphrodite-telegram-stars-successful-payment-skeleton.md";
const reportPath = "../docs/aphrodite-package-reports/package-172.md";
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

const rules = getAphroditeSuccessfulPaymentSkeletonRules();
const boundaries = getAphroditeSuccessfulPaymentSkeletonBoundaries();
const nextSteps = getAphroditeSuccessfulPaymentSkeletonNextSteps();

check("inspect function exists", typeof inspectAphroditeSuccessfulPaymentSkeleton === "function");
check("rules exist", rules.length >= 13);
check("boundaries exist", boundaries.length >= 6);
check("next steps exist", nextSteps.some((step) => step.package === "Package 173"));

const mockValidPayment = inspectAphroditeSuccessfulPaymentSkeleton({
  productId: "full_love_report",
  amount: 299,
  currency: "XTR",
  telegramPaymentChargeId: "tg-charge",
  providerPaymentChargeId: "provider-charge",
  invoicePayload: "aphrodite:full_love_report:12345",
  telegramUserId: "12345",
});

check("mock valid payment still does not create ledger", mockValidPayment.recordsPaymentLedgerNow === false);
check("mock valid payment still does not create entitlement", mockValidPayment.createsEntitlementNow === false);
check("mock valid payment still does not unlock VIP", mockValidPayment.unlocksVipNow === false);
check("handlerActiveNow=false", mockValidPayment.handlerActiveNow === false);
check("canCallTelegramApiNow=false", mockValidPayment.canCallTelegramApiNow === false);
check("recordsPaymentLedgerNow=false", mockValidPayment.recordsPaymentLedgerNow === false);
check("createsEntitlementNow=false", mockValidPayment.createsEntitlementNow === false);
check("unlocksVipNow=false", mockValidPayment.unlocksVipNow === false);
check("grantsAccessNow=false", mockValidPayment.grantsAccessNow === false);

for (const futureCheck of [
  "Для каждого payment event нужен стабильный idempotency key.",
  "Повторный payment event не должен создавать второй ledger или entitlement.",
  "telegram payment charge id должен попадать в verified ledger.",
  "provider payment charge id сохраняется только если он доступен.",
  "invoice payload должен связывать payment с productId и пользователем.",
  "productId должен существовать в product catalog.",
  "amount и currency должны совпадать с будущим invoice draft.",
  "user identity должен быть подтверждён до ledger write.",
  "payment ledger write возможен только после полной verification.",
  "entitlement creation возможен только после verified ledger.",
  "refund и revocation должны закрывать будущий доступ.",
  "owner review gate должен оставаться стоппером перед live payment.",
  "security QA должен падать при любом client-side access bypass.",
]) {
  check(`future check documented: ${futureCheck}`, rules.some((rule) => rule.futureCheck === futureCheck) && userFacingBundle.includes(futureCheck));
}

check("idempotency risk documented", userFacingBundle.includes("idempotency key"));
check("duplicate risk documented", userFacingBundle.includes("Повторный payment event"));
check("dashboard QA route exists", dashboardQaSource.includes("telegramStarsSuccessfulPaymentSkeleton"));
check("dashboard QA checks title", dashboardQaSource.includes(APHRODITE_SUCCESSFUL_PAYMENT_SKELETON_TITLE));
check("dashboard QA checks classification", dashboardQaSource.includes("Только successful_payment skeleton"));
check("overview route link exists", dashboardQaSource.includes("/dashboard/networks/zodiac/telegram-stars-successful-payment-skeleton"));
check("page shows classification", pageSource.includes("APHRODITE_SUCCESSFUL_PAYMENT_SKELETON_CLASSIFICATION") && userFacingBundle.includes(APHRODITE_SUCCESSFUL_PAYMENT_SKELETON_CLASSIFICATION));

for (const label of APHRODITE_SUCCESSFUL_PAYMENT_SKELETON_SAFETY_LABELS) {
  check(`visible safety label exists: ${label}`, userFacingBundle.includes(label));
}

check("docs say package parses only", docsSource.includes("Package 172 разбирает только будущую форму successful_payment"));
check("docs say no ledger write", docsSource.includes("не пишет payment ledger"));
check("report says no active handler", reportSource.includes("не добавляет active successful_payment handler"));
check("report says next package Package 173", reportSource.includes("Package 173 — Payment Ledger Mock Integration"));

const implementationWithoutExpectedText = implementationBundle
  .replaceAll("inspectAphroditeSuccessfulPaymentSkeleton", "inspectSkeleton")
  .replaceAll("AphroditeSuccessfulPaymentSkeleton", "AphroditePaymentInspectionSkeleton")
  .replaceAll("Нет active successful_payment handler", "Нет active successful payment handler")
  .replaceAll("Нет successful_payment handler", "Нет successful payment handler")
  .replaceAll("successful_payment skeleton", "successful payment skeleton")
  .replaceAll("successful_payment handler", "successful payment handler");

check("no active handler route", !/route\.ts|webhook|case\s+["']successful_payment["']|update\.message\.successful_payment|successful_payment\s*[:=]/i.test(implementationWithoutExpectedText));
check("no DB write", !/process\.env\.DATABASE_URL|createClient\(|new Pool\(|drizzle\(|from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\(|\.update\(|\.delete\(|\.upsert\(/i.test(implementationBundle));
check("no Telegram API", !/fetch\([^)]*api\.telegram\.org|sendMessage\(|sendPhoto\(|sendDocument\(|sendInvoice\(|answerPreCheckoutQuery\(/i.test(implementationBundle));
check("no ledger or access action", !/recordsPaymentLedgerNow\s*:\s*true|createsEntitlementNow\s*:\s*true|unlocksVipNow\s*:\s*true|grantsAccessNow\s*:\s*true|grantVip\(|unlockVip\(|allowed\s*:\s*true/i.test(implementationBundle));
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
