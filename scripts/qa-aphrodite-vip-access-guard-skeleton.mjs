#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  APHRODITE_VIP_GUARD_FALLBACK_ROUTE,
  APHRODITE_VIP_GUARD_IGNORED_CLIENT_SIGNALS,
  APHRODITE_VIP_GUARD_REQUIRED_FUTURE_CHECKS,
  APHRODITE_VIP_GUARD_SKELETON_CLASSIFICATION,
  checkAphroditeVipAccessSkeleton,
  getAphroditeVipGuardBoundaries,
  getAphroditeVipGuardNextSteps,
  getAphroditeVipGuardProducts,
} from "../lib/zodiac/aphrodite-vip-access-guard-skeleton.ts";

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

console.log("Старт QA: skeleton проверки VIP-доступа Aphrodite...\n");

const modelPath = "../lib/zodiac/aphrodite-vip-access-guard-skeleton.ts";
const dashboardPath = "../app/dashboard/networks/zodiac/vip-access-guard-skeleton/page.tsx";
const docsPath = "../docs/aphrodite-vip-access-guard-skeleton.md";
const reportPath = "../docs/aphrodite-package-reports/package-158.md";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";

check("model-файл существует", exists(modelPath));
check("dashboard-страница существует", exists(dashboardPath));
check("документация существует", exists(docsPath));
check("отчёт пакета существует", exists(reportPath));
check("dashboard QA существует", exists(dashboardQaPath));

const modelSource = exists(modelPath) ? read(modelPath) : "";
const dashboardSource = exists(dashboardPath) ? read(dashboardPath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";
const implementationBundle = [modelSource, dashboardSource].join("\n");
const userFacingBundle = [modelSource, dashboardSource, docsSource, reportSource].join("\n");

const requiredProducts = [
  "full-love-report",
  "vip-love-access",
  "ai-future-timeline-vip",
  "soulmate-scanner-vip",
  "red-flags-scanner-vip",
  "birth-matrix-vip",
  "natal-chart-vip",
  "vip-couple-calendar",
  "vip-numerology",
];

const products = getAphroditeVipGuardProducts();
const boundaries = getAphroditeVipGuardBoundaries();
const nextSteps = getAphroditeVipGuardNextSteps();

check("классификация описывает deny-by-default skeleton", APHRODITE_VIP_GUARD_SKELETON_CLASSIFICATION.includes("Доступ всегда закрыт"));
check("fallback route ведёт к free preview", APHRODITE_VIP_GUARD_FALLBACK_ROUTE === "/miniapp/love-reading-preview");
check("количество защищаемых продуктов равно 9", products.length === requiredProducts.length);

for (const product of requiredProducts) {
  check(`защищаемый продукт существует: ${product}`, products.includes(product));
}

for (const product of requiredProducts) {
  const decision = checkAphroditeVipAccessSkeleton({
    product,
    source: "dashboard",
    requestedRoute: "/dashboard/networks/zodiac/vip-access-guard-skeleton",
    telegramUserId: "mock-telegram-user",
    userId: "mock-user",
    mockClientVipFlag: true,
    mockQueryVipFlag: true,
    mockPaymentSuccess: true,
  });

  check(`${product}: allowed равен false`, decision.allowed === false);
  check(`${product}: fallback route ведёт к free preview`, decision.fallbackRoute === APHRODITE_VIP_GUARD_FALLBACK_ROUTE);
  check(`${product}: видимое deny-сообщение существует`, decision.visibleMessage.includes("allowed=false"));
  check(`${product}: mock client VIP flag игнорируется`, decision.ignoredClientSignals.some((signal) => signal.includes("mockClientVipFlag")));
  check(`${product}: mock query VIP flag игнорируется`, decision.ignoredClientSignals.some((signal) => signal.includes("mockQueryVipFlag")));
  check(`${product}: mock payment success игнорируется`, decision.ignoredClientSignals.some((signal) => signal.includes("mockPaymentSuccess")));
}

for (const signal of [
  "localStorage VIP flag",
  "query param VIP flag",
  "client-only button unlock",
  "mock successful_payment",
  "front-end-only role check",
]) {
  check(`игнорируемый клиентский сигнал описан: ${signal}`, APHRODITE_VIP_GUARD_IGNORED_CLIENT_SIGNALS.includes(signal));
}

for (const futureCheck of [
  "server-side entitlement по userRef и productId",
  "проверка Telegram initData на сервере",
  "проверка payment ledger перед созданием доступа",
  "проверка status, expiresAt и revokedAt",
  "owner review gate перед реальным запуском",
  "safe fallback to free preview при deny",
]) {
  check(`будущая server-side проверка описана: ${futureCheck}`, APHRODITE_VIP_GUARD_REQUIRED_FUTURE_CHECKS.includes(futureCheck));
}

const requiredBoundaries = [
  ["Нет реальной VIP-разблокировки", "no-real-vip-unlock"],
  ["Нет оплаты", "no-payment"],
  ["Нет Telegram Stars invoice", "no-stars-invoice"],
  ["Нет successful_payment handler", "no-successful-payment-handler"],
  ["Нет entitlement creation", "no-entitlement-creation"],
  ["Нет записи в базу данных", "no-database-write"],
  ["Нет миграции схемы базы данных", "no-database-schema-migration"],
  ["Нет вызова Telegram API", "no-telegram-api-call"],
  ["Нет production-запуска", "no-production-launch"],
  ["Guard всегда возвращает allowed=false", "guard-always-denies"],
];

for (const [label, dataBoundary] of requiredBoundaries) {
  check(`видимая граница существует: ${label}`, userFacingBundle.includes(label));
  check(`data-boundary существует: ${dataBoundary}`, boundaries.some((boundary) => boundary.dataBoundary === dataBoundary) && dashboardSource.includes(`data-boundary={boundary.dataBoundary}`));
}

check("dashboard route зарегистрирован в dashboard QA", dashboardQaSource.includes("vipAccessGuardSkeleton"));
check("dashboard QA проверяет заголовок skeleton", dashboardQaSource.includes("Skeleton проверки VIP-доступа"));
check("dashboard QA проверяет allowed=false", dashboardQaSource.includes("allowed=false"));
check("dashboard-страница содержит fallback route", dashboardSource.includes("/miniapp/love-reading-preview"));
check("следующий пакет указан как Package 159", nextSteps.some((step) => step.package === "Package 159"));
check("Package 159 не запускается автоматически", userFacingBundle.includes("Package 159 не начинается автоматически") || userFacingBundle.includes("Package 159 не запускается автоматически"));

check("реальный payment SDK не используется", !/from ['"]stripe|require\(['"]stripe|new Stripe\b|checkout\.sessions|charges\.create|payment_intents/i.test(implementationBundle));
check("Telegram invoice не создаётся", !/sendInvoice\(|createInvoiceLink\(|answerPreCheckoutQuery\(/i.test(implementationBundle));
check("successful_payment handler не добавлен", !/successful_payment\s*[:=]|case\s+["']successful_payment["']|function\s+\w*successful|update\.message\.successful_payment/i.test(implementationBundle));
check("entitlement creation не реализован", !/function\s+create\w*Entitlement|const\s+create\w*Entitlement|export\s+function\s+create\w*Entitlement|grantVip\(|unlockVip\(|insert\w*Entitlement/i.test(implementationBundle));
check("реальная VIP-разблокировка не добавлена", !/vipUnlocked\s*=\s*true|realVipAccess\s*=\s*true|setVipActive\(|grantVip\(|unlockVip\(/i.test(implementationBundle));
check("вызов Telegram API не добавлен", !/api\.telegram\.org|fetch\([^)]*telegram|TELEGRAM_BOT_TOKEN|COMPATIBILITY_BOT_TOKEN/i.test(implementationBundle));
check("подключение к базе данных не добавлено", !/DATABASE_URL|createClient\(|new Pool\(|from\([^)]*\)\.(insert|update|delete|upsert)\(/i.test(implementationBundle));
check("активная платёжная CTA отсутствует", !/Купить VIP|Оплатить|Разблокировать отч[её]т|Подписаться|Активировать VIP|Получить доступ после оплаты|Buy now|Subscribe now|Purchase now|Activate VIP|Payment successful|Premium unlocked/i.test(userFacingBundle));

const changedDbFiles = gitDiffNames(["prisma", "supabase", "migrations", "schema.prisma"]).filter((file) =>
  /(^|\/)(prisma|supabase|migrations)(\/|$)|schema\.prisma$/i.test(file),
);
check("DB migration/schema files не изменены", changedDbFiles.length === 0);

const workflowChanges = gitDiffNames([".github/workflows", "package.json"]);
check("workflows и package.json не изменены", workflowChanges.length === 0);

const scriptChanges = gitDiffNames(["scripts"]);
check("в scripts изменены только Aphrodite QA и dashboard QA", scriptChanges.every((file) =>
  file === "scripts/qa-zodiac-dashboard.mjs" || /^scripts\/qa-aphrodite-.*\.mjs$/.test(file),
));

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
