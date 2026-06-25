#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import {
  getAphroditePaywallBoundaries,
  getAphroditePaywallNextSteps,
  getAphroditePaywallReadinessItems,
  getAphroditePaywallTrustBlocks,
  getAphroditeVipOfferSections,
} from "../lib/zodiac/aphrodite-paywall-readiness.ts";

let passed = 0;
let failed = 0;

function check(name, condition) {
  if (condition) {
    passed += 1;
    console.log("PASS: " + name);
  } else {
    failed += 1;
    console.log("FAIL: " + name);
  }
}

function read(rel) {
  return readFileSync(new URL(rel, import.meta.url), "utf8");
}

function exists(rel) {
  return existsSync(new URL(rel, import.meta.url));
}

console.log("Старт QA: подготовка paywall и VIP-оффера Aphrodite...\n");

const modelPath = "../lib/zodiac/aphrodite-paywall-readiness.ts";
const dashboardPath = "../app/dashboard/networks/zodiac/paywall-readiness/page.tsx";
const previewPath = "../app/miniapp/love-reading-preview/page.tsx";
const docsPath = "../docs/aphrodite-paywall-readiness.md";
const reportPath = "../docs/aphrodite-package-reports/package-154.md";

check("model file exists", exists(modelPath));
check("dashboard page exists", exists(dashboardPath));
check("Love Reading preview page exists", exists(previewPath));
check("readiness docs exist", exists(docsPath));
check("package report exists", exists(reportPath));

const modelSource = read(modelPath);
const dashboardSource = read(dashboardPath);
const previewSource = read(previewPath);
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const implementationBundle = [modelSource, dashboardSource, previewSource].join("\n");
const userFacingBundle = [dashboardSource, previewSource, docsSource, reportSource].join("\n");

const readinessItems = getAphroditePaywallReadinessItems();
const offerSections = getAphroditeVipOfferSections();
const trustBlocks = getAphroditePaywallTrustBlocks();
const boundaries = getAphroditePaywallBoundaries();
const nextSteps = getAphroditePaywallNextSteps();

check("readiness items exist", readinessItems.length >= 4);
check("Free Love Reading Preview exists", readinessItems.some((item) => item.id === "free-love-reading-preview"));
check("Future Full Love Report exists", readinessItems.some((item) => item.id === "future-full-love-report"));
check("future short VIP access exists", readinessItems.some((item) => item.id === "future-short-vip-access"));
check("future regular format placeholder exists", readinessItems.some((item) => item.id === "future-regular-format-readiness"));
check("VIP offer sections exist", offerSections.length >= 4);
check("Full Love Report section added", offerSections.some((section) => section.id === "full-love-report" && section.includes.includes("30-дневный прогноз")));
check("trust blocks exist", trustBlocks.length >= 7);
check("boundaries exist", boundaries.length >= 9);
check("next package points to Package 155", nextSteps.some((step) => step.package === "Package 155"));

const requiredRussianBoundaries = [
  "Нет оплаты",
  "Нет реальной VIP-разблокировки",
  "Нет вызова Telegram API",
  "Нет записи в базу данных",
  "Нет Telegram Stars invoice",
  "Нет successful_payment handler",
  "Нет entitlement creation",
  "Нет production-запуска",
  "Нет активной платёжной CTA",
];

for (const label of requiredRussianBoundaries) {
  check(`boundary exists: ${label}`, boundaries.some((boundary) => boundary.label === label) || userFacingBundle.includes(label));
}

check("dashboard title is Russian", dashboardSource.includes("Подготовка paywall и VIP-оффера"));
check("classification is visible", modelSource.includes("Только подготовка оффера") && dashboardSource.includes("APHRODITE_PAYWALL_READINESS_CLASSIFICATION"));
check("free preview vs full report described", dashboardSource.includes("Бесплатный preview") && dashboardSource.includes("будущий Full Love Report"));
check("trust blocks are shown", dashboardSource.includes("Блоки доверия") && dashboardSource.includes("getAphroditePaywallTrustBlocks"));
check("data-boundary tokens are present", dashboardSource.includes('data-boundary={boundary.token}') && dashboardSource.includes('data-boundary={boundary.token}'));
check("Love Reading preview imports readiness model", previewSource.includes("getAphroditeVipOfferSections"));
check("Love Reading preview explains future Full Love Report", previewSource.includes("Что будет в полном Love Report позже"));
check("Love Reading preview still avoids active payment CTA", !/Купить VIP|Оплатить|Разблокировать отч[её]т|Подписаться|Активировать VIP|Получить доступ после оплаты/.test(previewSource));

check("no payment API is used", !/from ['"]stripe|require\(['"]stripe|new Stripe\b|\.charges\.create|checkout\.sessions|sendInvoice\(|createInvoiceLink\(/i.test(implementationBundle));
check("no Telegram token required", !/TELEGRAM_BOT_TOKEN|COMPATIBILITY_BOT_TOKEN|api\.telegram\.org/i.test(implementationBundle));
check("no database connection required", !/DATABASE_URL|createClient\(|from\([^)]*\)\.(insert|update|delete|upsert)\(/i.test(implementationBundle));
check("no Stars invoice created", !/sendInvoice\(|createInvoiceLink\(|answerPreCheckoutQuery\(/i.test(implementationBundle));
check("no successful payment handler implementation", !/successful_payment\s*[:=]|case\s+["']successful_payment["']|function\s+\w*successful/i.test(implementationBundle));
check("no Entitlement creation implementation", !/create[A-Za-z]*Entitlement|grant[A-Za-z]*Access|insert[A-Za-z]*Entitlement/i.test(implementationBundle));
check("no real VIP unlock implementation", !/grantVip|unlockVip|setVipActive|vipUnlocked\s*=\s*true|realVipAccess\s*=\s*true/i.test(implementationBundle));
check("no active payment CTA is present", !/Купить VIP|Оплатить|Разблокировать отч[её]т|Подписаться|Активировать VIP|Получить доступ после оплаты/.test(userFacingBundle));
check("visible docs/report text is Russian", docsSource.includes("Пакет 154") && reportSource.includes("Пакет 154") && docsSource.includes("не реализует оплату"));
check("docs state no Telegram CTA changes", docsSource.includes("не меняет активную Telegram CTA-логику"));
check("docs state daily automation remains unblocked", docsSource.includes("Daily/weekly automation остаётся рабочей"));

console.log(`\nQA завершён: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
