#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  APHRODITE_VIP_FALLBACK_CLASSIFICATION,
  APHRODITE_VIP_FREE_PREVIEW_FALLBACK_ROUTE,
  getAphroditeVipFallbackBoundaries,
  getAphroditeVipFallbackNextSteps,
  getAphroditeVipFallbackQaItems,
  getAphroditeVipFallbackRules,
  getAphroditeVipFallbackSurfaces,
} from "../lib/zodiac/aphrodite-vip-free-preview-fallback-map.ts";
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

console.log("Старт QA: карта free preview fallback для VIP-разделов Aphrodite...\n");

const modelPath = "../lib/zodiac/aphrodite-vip-free-preview-fallback-map.ts";
const dashboardPath = "../app/dashboard/networks/zodiac/vip-free-preview-fallback-map/page.tsx";
const docsPath = "../docs/aphrodite-vip-free-preview-fallback-map.md";
const reportPath = "../docs/aphrodite-package-reports/package-161.md";
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

const surfaces = getAphroditeVipFallbackSurfaces();
const rules = getAphroditeVipFallbackRules();
const qaItems = getAphroditeVipFallbackQaItems();
const boundaries = getAphroditeVipFallbackBoundaries();
const nextSteps = getAphroditeVipFallbackNextSteps();
const surfaceById = new Map(surfaces.map((surface) => [surface.id, surface]));

check("классификация описывает fallback-only пакет", APHRODITE_VIP_FALLBACK_CLASSIFICATION.includes("Только карта fallback"));
check("классификация явно говорит, что VIP не открывается", APHRODITE_VIP_FALLBACK_CLASSIFICATION.includes("VIP не открывается"));
check("fallback route ведёт к free preview", APHRODITE_VIP_FREE_PREVIEW_FALLBACK_ROUTE === "/miniapp/love-reading-preview");
check("fallback surfaces существуют", surfaces.length >= 17);
check("fallback rules существуют", rules.length >= 3);
check("QA items существуют", qaItems.length >= 4);
check("safety boundaries существуют", boundaries.length >= 10);
check("next steps существуют", nextSteps.length >= 1);

for (const [id, route] of [
  ["miniapp-free-funnel", "/miniapp"],
  ["free-love-reading-preview", "/miniapp/love-reading-preview"],
]) {
  const surface = surfaceById.get(id);
  check(`${id}: поверхность существует`, Boolean(surface));
  check(`${id}: marked mustRemainOpen`, Boolean(surface?.mustRemainOpen));
  check(`${id}: route указан`, surface?.fileOrRoute === route);
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
]) {
  const surface = surfaceById.get(id);
  check(`VIP fallback существует: ${id}`, Boolean(surface));
  check(`${id}: fallback route is free preview`, surface?.fallbackRoute === APHRODITE_VIP_FREE_PREVIEW_FALLBACK_ROUTE);
  check(`${id}: free preview available`, Boolean(surface?.freePreviewAvailable));
  check(`${id}: future guard required`, Boolean(surface?.futureGuardRequired));
  check(`${id}: visible fallback message exists`, Boolean(surface?.visibleFallbackMessage));
}

check("Full Love Report fallback описан", Boolean(surfaceById.get("full-love-report")));
check("VIP Couple Calendar fallback описан", Boolean(surfaceById.get("vip-couple-calendar")));
check("VIP Numerology fallback описан", Boolean(surfaceById.get("vip-numerology")));
check("free preview remains accessible in map", surfaces.some((surface) => surface.id === "free-love-reading-preview" && surface.mustRemainOpen && surface.freePreviewAvailable));

const blockedFailureModes = new Set(rules.flatMap((rule) => rule.blockedFailureModes));
for (const mode of [
  "blank screen",
  "unhandled exception",
  "client-only unlock",
  "localStorage VIP bypass",
  "query param VIP bypass",
  "mock payment success bypass",
  "manual route guessing",
  "hardcoded allowed=true",
  "lost user after denied access",
]) {
  check(`blocked failure mode documented: ${mode}`, blockedFailureModes.has(mode));
}

check("no blank-screen fallback is allowed", rules.some((rule) => rule.blockedFailureModes.includes("blank screen")) && surfaces.every((surface) => surface.visibleFallbackMessage.trim().length > 0));

for (const product of ["full-love-report", "vip-couple-calendar", "vip-numerology"]) {
  const decision = checkAphroditeVipAccessSkeleton({
    product,
    source: "dashboard",
    requestedRoute: "/dashboard/networks/zodiac/vip-free-preview-fallback-map",
    telegramUserId: "mock-telegram-user",
    userId: "mock-user",
    mockClientVipFlag: true,
    mockQueryVipFlag: true,
    mockPaymentSuccess: true,
  });

  check(`${product}: guard skeleton remains deny-by-default`, decision.allowed === false);
  check(`${product}: fallback route совпадает с картой`, decision.fallbackRoute === APHRODITE_VIP_FREE_PREVIEW_FALLBACK_ROUTE);
}

check("sample decisions show allowed=false", dashboardSource.includes("allowed=false"));
check("sample decisions show fallback route", dashboardSource.includes("fallback={decision.fallbackRoute}") && dashboardSource.includes("/miniapp/love-reading-preview"));

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
  ["VIP не открывается в этом пакете", "vip-not-unlocked-in-this-package"],
]) {
  check(`видимая граница существует: ${label}`, userFacingBundle.includes(label));
  check(`data-boundary существует: ${dataBoundary}`, boundaries.some((boundary) => boundary.dataBoundary === dataBoundary) && dashboardSource.includes(`data-boundary={boundary.dataBoundary}`));
}

check("dashboard route зарегистрирован в dashboard QA", dashboardQaSource.includes("vipFreePreviewFallbackMap"));
check("dashboard QA проверяет заголовок fallback map", dashboardQaSource.includes("Карта fallback для VIP-разделов"));
check("dashboard QA проверяет VIP not unlocked boundary", dashboardQaSource.includes("VIP не открывается"));
check("следующий пакет указан как Package 162", nextSteps.some((step) => step.package === "Package 162"));
check("Package 162 не запускается автоматически", userFacingBundle.includes("Package 162 не начинается автоматически"));

check("реальный payment SDK не используется", !/from ['"]stripe|require\(['"]stripe|new Stripe\b|checkout\.sessions|charges\.create|payment_intents/i.test(implementationBundle));
check("Telegram token не требуется", !/TELEGRAM_BOT_TOKEN|COMPATIBILITY_BOT_TOKEN/i.test(implementationBundle));
check("подключение к базе данных не требуется", !/DATABASE_URL|createClient\(|new Pool\(|from\([^)]*\)\.(insert|update|delete|upsert)\(/i.test(implementationBundle));
check("Stars invoice не создаётся", !/sendInvoice\(|createInvoiceLink\(|answerPreCheckoutQuery\(/i.test(implementationBundle));
check("successful_payment handler не добавлен", !/successful_payment\s*[:=]|case\s+["']successful_payment["']|function\s+\w*successful|update\.message\.successful_payment/i.test(implementationBundle));
check("entitlement creation function не реализована", !/function\s+create\w*Entitlement|const\s+create\w*Entitlement|export\s+function\s+create\w*Entitlement|grantVip\(|unlockVip\(|insert\w*Entitlement/i.test(implementationBundle));
check("реальный VIP unlock не добавлен", !/vipUnlocked\s*=\s*true|realVipAccess\s*=\s*true|allowed\s*:\s*true|setVipActive\(|grantVip\(|unlockVip\(/i.test(implementationBundle));
check("активная платёжная CTA отсутствует", !/Купить VIP|Оплатить|Разблокировать отч[её]т|Подписаться|Активировать VIP|Получить доступ после оплаты|Buy now|Subscribe now|Purchase now|Activate VIP|Payment successful|Premium unlocked/i.test(userFacingBundle));

const changedDbFiles = gitDiffNames(["prisma", "supabase", "migrations", "schema.prisma"]).filter((file) =>
  /(^|\/)(prisma|supabase|migrations)(\/|$)|schema\.prisma$/i.test(file),
);
check("DB migration/schema files не изменены", changedDbFiles.length === 0);

const workflowChanges = gitDiffNames([".github/workflows", "package.json"]);
check("workflows и package.json не изменены", workflowChanges.length === 0);

const scriptChanges = gitDiffNames(["scripts"]);
check("в scripts изменены только Package 161 QA и dashboard QA", scriptChanges.every((file) =>
  file === "scripts/qa-aphrodite-vip-free-preview-fallback-map.mjs" || file === "scripts/qa-zodiac-dashboard.mjs",
));

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
