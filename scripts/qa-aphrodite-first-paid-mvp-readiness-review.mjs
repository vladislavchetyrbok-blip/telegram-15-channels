#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  APHRODITE_FIRST_PAID_MVP_NOT_APPROVED,
  APHRODITE_FIRST_PAID_MVP_NOT_APPROVED_RU,
  APHRODITE_FIRST_PAID_MVP_READINESS_CLASSIFICATION,
  APHRODITE_FIRST_PAID_MVP_READINESS_TITLE,
  APHRODITE_FIRST_PAID_MVP_SAFETY_LABELS,
  getAphroditeFirstPaidMvpBlockers,
  getAphroditeFirstPaidMvpGoNoGoChecklist,
  getAphroditeFirstPaidMvpNextSteps,
  getAphroditeFirstPaidMvpReadinessAreas,
  getAphroditeFirstPaidMvpSafetyBoundaries,
} from "../lib/zodiac/aphrodite-first-paid-mvp-readiness-review.ts";

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

console.log("Старт QA: First Paid MVP readiness review Aphrodite...\n");

const modelPath = "../lib/zodiac/aphrodite-first-paid-mvp-readiness-review.ts";
const pagePath = "../app/dashboard/networks/zodiac/first-paid-mvp-readiness-review/page.tsx";
const docsPath = "../docs/aphrodite-first-paid-mvp-readiness-review.md";
const reportPath = "../docs/aphrodite-package-reports/package-178.md";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";

check("model file exists", exists(modelPath));
check("dashboard page exists", exists(pagePath));
check("docs exist", exists(docsPath));
check("package report exists", exists(reportPath));

const modelSource = exists(modelPath) ? read(modelPath) : "";
const pageSource = exists(pagePath) ? read(pagePath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";
const implementationBundle = [modelSource, pageSource].join("\n");
const userFacingBundle = [modelSource, pageSource, docsSource, reportSource].join("\n");

const areas = getAphroditeFirstPaidMvpReadinessAreas();
const blockers = getAphroditeFirstPaidMvpBlockers();
const checklist = getAphroditeFirstPaidMvpGoNoGoChecklist();
const boundaries = getAphroditeFirstPaidMvpSafetyBoundaries();
const nextSteps = getAphroditeFirstPaidMvpNextSteps();

check("readiness areas exist", areas.length >= 22);
check("blockers exist", blockers.length >= 10);
check("go/no-go checklist exists", checklist.length >= 8);
check("safety boundaries exist", boundaries.length >= 14);
check("next steps exist", nextSteps.length >= 1);

for (const status of ["Ready for review", "Partially ready", "Blocked", "Not started", "Owner review required", "Production env required"]) {
  check(`readiness status exists: ${status}`, areas.some((area) => area.status === status));
}

check("product catalog area exists", areas.some((area) => area.title === "Product catalog"));
check("free preview area exists", areas.some((area) => area.title === "Free preview funnel"));
check("full love report area exists", areas.some((area) => area.title === "Full Love Report product shape"));
check("paywall readiness area exists", areas.some((area) => area.title === "Paywall copy/readiness"));
check("payment readiness area exists", areas.some((area) => area.category === "payment"));
check("entitlement readiness area exists", areas.some((area) => area.category === "entitlement"));
check("content readiness area exists", areas.some((area) => area.category === "content"));
check("support/refund readiness area exists", areas.some((area) => area.category === "support"));
check("analytics readiness area exists", areas.some((area) => area.category === "analytics"));
check("production env/backup readiness area exists", areas.some((area) => area.id === "backup-env-readiness"));
check("compatibility copy personalization area exists", areas.some((area) => area.id === "compatibility-copy-personalization"));
check("30 days couple calendar personalization area exists", areas.some((area) => area.id === "vip-couple-calendar-personalization"));

for (const title of [
  "DATABASE_URL not configured",
  "TELEGRAM_BOT_TOKEN not configured",
  "backup older than 24h",
  "no live payment approval",
  "no live Telegram Stars invoice",
  "no active entitlement storage",
  "no real DB persistence",
  "no support/refund policy finalized",
  "no analytics event pipeline finalized",
  "owner review not approved",
]) {
  check(`blocker exists: ${title}`, blockers.some((blocker) => blocker.title === title));
}

check("support/refund blocker exists", blockers.some((blocker) => blocker.id === "no-support-refund-policy-finalized"));
check("analytics blocker exists", blockers.some((blocker) => blocker.id === "no-analytics-event-pipeline-finalized"));
check("DATABASE_URL blocker exists", blockers.some((blocker) => blocker.id === "database-url-not-configured"));
check("TELEGRAM_BOT_TOKEN blocker exists", blockers.some((blocker) => blocker.id === "telegram-bot-token-not-configured"));
check("backup freshness blocker exists", blockers.some((blocker) => blocker.id === "backup-older-than-24h"));
check("Paid MVP is not approved for launch", userFacingBundle.includes(APHRODITE_FIRST_PAID_MVP_NOT_APPROVED) && userFacingBundle.includes(APHRODITE_FIRST_PAID_MVP_NOT_APPROVED_RU));

check("dashboard QA route exists", dashboardQaSource.includes("firstPaidMvpReadinessReview"));
check("dashboard QA checks title", dashboardQaSource.includes(APHRODITE_FIRST_PAID_MVP_READINESS_TITLE));
check("dashboard QA checks classification", dashboardQaSource.includes("Только review готовности"));
check("overview route link exists", dashboardQaSource.includes("/dashboard/networks/zodiac/first-paid-mvp-readiness-review"));
check("page shows classification", pageSource.includes("APHRODITE_FIRST_PAID_MVP_READINESS_CLASSIFICATION") && userFacingBundle.includes(APHRODITE_FIRST_PAID_MVP_READINESS_CLASSIFICATION));
check("page shows product readiness", pageSource.includes("product readiness"));
check("page shows payment readiness", pageSource.includes("payment readiness"));
check("page shows entitlement readiness", pageSource.includes("entitlement readiness"));
check("page shows content readiness", pageSource.includes("content readiness"));
check("page shows support/refund readiness", pageSource.includes("support/refund readiness"));
check("page shows analytics readiness", pageSource.includes("analytics readiness"));
check("page shows production env/backup blockers", pageSource.includes("production env/backup blockers"));

for (const label of APHRODITE_FIRST_PAID_MVP_SAFETY_LABELS) {
  check(`Russian visible safety label exists: ${label}`, userFacingBundle.includes(label));
}

for (const file of [
  "../app/dashboard/networks/zodiac/page.tsx",
  "../app/dashboard/networks/zodiac/product-catalog-finalization/page.tsx",
  "../app/dashboard/networks/zodiac/production-payment-safety-gate/page.tsx",
  "../app/dashboard/networks/zodiac/owner-review-gate/page.tsx",
  "../app/dashboard/networks/zodiac/telegram-stars-payment-architecture-review/page.tsx",
  "../app/dashboard/networks/zodiac/telegram-stars-invoice-builder-skeleton/page.tsx",
  "../app/dashboard/networks/zodiac/payment-ledger-mock-integration/page.tsx",
  "../app/dashboard/networks/zodiac/entitlement-creation-mock/page.tsx",
  "../app/dashboard/networks/zodiac/vip-access-security-suite/page.tsx",
]) {
  check(`Paid MVP Readiness link exists in ${file}`, read(file).includes("/dashboard/networks/zodiac/first-paid-mvp-readiness-review"));
}

check("docs say Package 178 review only", docsSource.includes("Package 178 создаёт только First Paid MVP readiness review"));
check("docs say no payment implementation", docsSource.includes("не реализует оплату"));
check("docs say no Telegram Stars invoice", docsSource.includes("не реализует Telegram Stars invoice"));
check("docs say no sendInvoice", docsSource.includes("не вызывает sendInvoice"));
check("docs say no createInvoiceLink", docsSource.includes("не вызывает createInvoiceLink"));
check("docs say no pre_checkout_query handler", docsSource.includes("не реализует pre_checkout_query handler"));
check("docs say no successful_payment handler", docsSource.includes("не реализует successful_payment handler"));
check("docs say no payment ledger write", docsSource.includes("не пишет payment ledger"));
check("docs say no real VIP unlock", docsSource.includes("не реализует реальную VIP-разблокировку"));
check("docs say no entitlement creation", docsSource.includes("не создаёт entitlements"));
check("docs say no Telegram API call", docsSource.includes("не вызывает Telegram API"));
check("docs say no database write", docsSource.includes("не пишет в database"));
check("docs say no database schema change", docsSource.includes("не изменяет database schema"));
check("docs say no migrations", docsSource.includes("не добавляет migrations"));
check("docs say no active Telegram CTA change", docsSource.includes("не меняет active Telegram CTA logic"));
check("docs say no workflow changes", docsSource.includes("не изменяет cron/workflow/publish scripts"));
check("docs say daily/weekly/monthly pipeline remains unblocked", docsSource.includes("Daily/weekly/monthly content pipeline remains unblocked"));
check("docs say paid MVP not approved", docsSource.includes(APHRODITE_FIRST_PAID_MVP_NOT_APPROVED));
check("docs say next package Package 179", docsSource.includes("Package 179 — Support & Refund Policy Readiness"));

check("report says Package 178", reportSource.includes("Package 178"));
check("report says review only", reportSource.includes("readiness review only"));
check("report says next package Package 179", reportSource.includes("Package 179 — Support & Refund Policy Readiness"));

check("no real payment API is used", !/stripe\.|checkout\.sessions|paymentIntent|createPayment|payments\.create|sendInvoice\s*\(|createInvoiceLink\s*\(/i.test(implementationBundle));
check("no sendInvoice", !/sendInvoice\s*\(/.test(implementationBundle));
check("no createInvoiceLink", !/createInvoiceLink\s*\(/.test(implementationBundle));
check("no pre_checkout_query handler", !/pre_checkout_query["']?\s*[:=]|answerPreCheckoutQuery\s*\(|case\s+["']pre_checkout_query["']/.test(implementationBundle));
check("no successful_payment handler", !/successful_payment["']?\s*[:=]|case\s+["']successful_payment["']|onSuccessfulPayment|handleSuccessfulPayment\s*\(/.test(implementationBundle));
check("no payment ledger write", !/recordsPaymentLedgerNow\s*:\s*true|persistsLedgerNow\s*:\s*true|paymentLedgerWriteAllowedNow\s*:\s*true|\.insert\s*\(|\.upsert\s*\(/i.test(implementationBundle));
check("no entitlement creation", !/createsEntitlementNow\s*:\s*true|entitlementCreationAllowedNow\s*:\s*true|export\s+function\s+create\w*Entitlement|function\s+create\w*Entitlement|grantVip\s*\(|unlockVip\s*\(/i.test(implementationBundle));
check("no DB write", !/process\.env\.DATABASE_URL|createClient\(|new Pool\(|drizzle\(|from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(/i.test(implementationBundle));
check("no DB schema/migration change", gitDiffNames(["prisma", "supabase", "migrations", "schema.prisma"]).filter((file) => /(^|\/)(prisma|supabase|migrations)(\/|$)|schema\.prisma$/i.test(file)).length === 0);
check("no Telegram API call", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|answerPreCheckoutQuery\s*\(/i.test(implementationBundle));
check("no production launch switch", !/approvedForLaunch\s*:\s*true|sendAllowedNow\s*:\s*true|canCallTelegramApiNow\s*:\s*true|productionPaymentAllowedNow\s*:\s*true|productionLaunchAllowedNow\s*:\s*true/i.test(implementationBundle));
check("no active payment CTA", !/Купить VIP|Оплатить|Разблокировать отч[её]т|Подписаться|Активировать VIP|Получить доступ после оплаты|Buy now|Subscribe now|Purchase now|Activate VIP|Payment successful|Premium unlocked/i.test(userFacingBundle));

check("no workflows changed", gitDiffNames([".github/workflows"]).length === 0);
check("package.json not changed", gitDiffNames(["package.json"]).length === 0);
check("publish scripts not changed", gitDiffNames(["scripts/publish-zodiac-by-date.mjs", "scripts/publish-zodiac-weekly-by-week.mjs", "scripts/zodiac-telegram-publisher.mjs"]).length === 0);

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
