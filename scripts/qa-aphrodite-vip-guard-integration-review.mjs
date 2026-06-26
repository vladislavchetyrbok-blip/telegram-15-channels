#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  APHRODITE_VIP_GUARD_INTEGRATION_CLASSIFICATION,
  APHRODITE_VIP_GUARD_INTEGRATION_FREE_FALLBACK,
  getAphroditeVipGuardIntegrationBoundaries,
  getAphroditeVipGuardIntegrationNextSteps,
  getAphroditeVipGuardIntegrationQaItems,
  getAphroditeVipGuardIntegrationRules,
  getAphroditeVipGuardIntegrationSurfaces,
} from "../lib/zodiac/aphrodite-vip-guard-integration-review.ts";
import { checkAphroditeVipAccessSkeleton } from "../lib/zodiac/aphrodite-vip-access-guard-skeleton.ts";

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

console.log("Старт QA: review интеграции VIP-guard Aphrodite...\n");

const modelPath = "../lib/zodiac/aphrodite-vip-guard-integration-review.ts";
const dashboardPath = "../app/dashboard/networks/zodiac/vip-guard-integration-review/page.tsx";
const docsPath = "../docs/aphrodite-vip-guard-integration-review.md";
const reportPath = "../docs/aphrodite-package-reports/package-160.md";
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

const surfaces = getAphroditeVipGuardIntegrationSurfaces();
const rules = getAphroditeVipGuardIntegrationRules();
const qaItems = getAphroditeVipGuardIntegrationQaItems();
const boundaries = getAphroditeVipGuardIntegrationBoundaries();
const nextSteps = getAphroditeVipGuardIntegrationNextSteps();

check("классификация описывает review-only интеграцию", APHRODITE_VIP_GUARD_INTEGRATION_CLASSIFICATION.includes("Только review интеграции"));
check("классификация явно говорит, что guard не подключён к production", APHRODITE_VIP_GUARD_INTEGRATION_CLASSIFICATION.includes("Guard не подключён к production"));
check("fallback route ведёт к free preview", APHRODITE_VIP_GUARD_INTEGRATION_FREE_FALLBACK === "/miniapp/love-reading-preview");
check("описано не меньше 13 поверхностей", surfaces.length >= 13);
check("описаны правила обходов", rules.length >= 3);
check("описаны QA-пункты", qaItems.length >= 4);
check("описаны границы безопасности", boundaries.length >= 10);

const surfaceById = new Map(surfaces.map((surface) => [surface.id, surface]));
for (const [id, expectedRoute] of [
  ["free-miniapp-funnel", "/miniapp"],
  ["free-love-reading-preview", "/miniapp/love-reading-preview"],
]) {
  const surface = surfaceById.get(id);
  check(`${id}: поверхность существует`, Boolean(surface));
  check(`${id}: остаётся открытой`, Boolean(surface?.mustRemainOpen));
  check(`${id}: route указан`, surface?.fileOrRoute === expectedRoute);
}

for (const id of [
  "full-love-report",
  "vip-love-access",
  "ai-future-timeline-vip",
  "soulmate-scanner-vip",
  "red-flags-scanner-vip",
  "birth-matrix-vip",
  "natal-chart-vip",
  "vip-couple-calendar",
  "vip-numerology",
  "future-api-access-check",
]) {
  const surface = surfaceById.get(id);
  check(`будущая guard-поверхность описана: ${id}`, Boolean(surface));
  check(`${id}: есть future guard placement`, Boolean(surface?.futureGuardPlacement.length));
  check(`${id}: есть free fallback`, Boolean(surface?.freeFallback));
}

const blockedShortcuts = new Set(rules.flatMap((rule) => rule.blockedShortcut));
for (const shortcut of [
  "localStorage VIP flag",
  "query param VIP flag",
  "client button unlock",
  "CSS hidden section reveal",
  "mock successful_payment",
  "manual route guessing",
  "front-end-only role check",
  "hardcoded allowed=true",
]) {
  check(`клиентский обход заблокирован в review: ${shortcut}`, blockedShortcuts.has(shortcut));
}

const requiredPlacements = new Set(surfaces.flatMap((surface) => surface.futureGuardPlacement));
for (const placement of [
  "route-level server guard",
  "component-level locked section guard",
  "API/server action guard",
  "product-specific entitlement guard",
  "expiration/revocation guard",
  "payment ledger guard",
  "owner review gate",
  "free preview fallback",
]) {
  check(`будущее место guard описано: ${placement}`, requiredPlacements.has(placement));
}

const requiredServerChecks = new Set(surfaces.flatMap((surface) => surface.requiredServerChecks));
for (const serverCheck of [
  "server-side entitlement check по userRef и productId",
  "payment ledger guard",
  "owner review gate",
  "free preview fallback при deny",
]) {
  check(`server-side требование описано: ${serverCheck}`, requiredServerChecks.has(serverCheck));
}

for (const product of ["full-love-report", "vip-couple-calendar", "vip-numerology"]) {
  const decision = checkAphroditeVipAccessSkeleton({
    product,
    source: "dashboard",
    requestedRoute: "/dashboard/networks/zodiac/vip-guard-integration-review",
    telegramUserId: "mock-telegram-user",
    userId: "mock-user",
    mockClientVipFlag: true,
    mockQueryVipFlag: true,
    mockPaymentSuccess: true,
  });

  check(`${product}: skeleton возвращает allowed=false`, decision.allowed === false);
  check(`${product}: fallback ведёт к free preview`, decision.fallbackRoute === APHRODITE_VIP_GUARD_INTEGRATION_FREE_FALLBACK);
  check(`${product}: mock client VIP flag игнорируется`, decision.ignoredClientSignals.some((signal) => signal.includes("mockClientVipFlag")));
  check(`${product}: mock query VIP flag игнорируется`, decision.ignoredClientSignals.some((signal) => signal.includes("mockQueryVipFlag")));
  check(`${product}: mock payment success игнорируется`, decision.ignoredClientSignals.some((signal) => signal.includes("mockPaymentSuccess")));
}

for (const [label, dataBoundary] of [
  ["Нет реальной VIP-разблокировки", "no-real-vip-unlock"],
  ["Нет оплаты", "no-payment"],
  ["Нет Telegram Stars invoice", "no-stars-invoice"],
  ["Нет successful_payment handler", "no-successful-payment-handler"],
  ["Нет entitlement creation", "no-entitlement-creation"],
  ["Нет записи в базу данных", "no-database-write"],
  ["Нет миграции схемы базы данных", "no-database-schema-migration"],
  ["Нет вызова Telegram API", "no-telegram-api-call"],
  ["Нет production-запуска", "no-production-launch"],
  ["Guard не подключён к production", "guard-not-connected-to-production"],
]) {
  check(`видимая граница существует: ${label}`, userFacingBundle.includes(label));
  check(`data-boundary существует: ${dataBoundary}`, boundaries.some((boundary) => boundary.dataBoundary === dataBoundary) && dashboardSource.includes(`data-boundary={boundary.dataBoundary}`));
}

check("dashboard route зарегистрирован в dashboard QA", dashboardQaSource.includes("vipGuardIntegrationReview"));
check("dashboard QA проверяет заголовок review", dashboardQaSource.includes("Review интеграции VIP-guard"));
check("dashboard QA проверяет guard-not-production boundary", dashboardQaSource.includes("Guard не подключён к production"));
check("dashboard-страница содержит fallback route", dashboardSource.includes("/miniapp/love-reading-preview"));
check("следующий пакет указан как Package 161", nextSteps.some((step) => step.package === "Package 161"));
check("Package 161 не запускается автоматически", userFacingBundle.includes("Package 161 не начинается автоматически"));

check("реальный payment SDK не используется", !/from ['"]stripe|require\(['"]stripe|new Stripe\b|checkout\.sessions|charges\.create|payment_intents/i.test(implementationBundle));
check("Telegram invoice не создаётся", !/sendInvoice\(|createInvoiceLink\(|answerPreCheckoutQuery\(/i.test(implementationBundle));
check("successful_payment handler не добавлен", !/successful_payment\s*[:=]|case\s+["']successful_payment["']|function\s+\w*successful|update\.message\.successful_payment/i.test(implementationBundle));
check("entitlement creation не реализован", !/function\s+create\w*Entitlement|const\s+create\w*Entitlement|export\s+function\s+create\w*Entitlement|grantVip\(|unlockVip\(|insert\w*Entitlement/i.test(implementationBundle));
check("реальная VIP-разблокировка не добавлена", !/vipUnlocked\s*=\s*true|realVipAccess\s*=\s*true|allowed\s*:\s*true|setVipActive\(|grantVip\(|unlockVip\(/i.test(implementationBundle));
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
