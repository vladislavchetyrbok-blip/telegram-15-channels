#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  APHRODITE_VIP_BOUNDARY_BLOCKED_CLIENT_SHORTCUTS,
  APHRODITE_VIP_BOUNDARY_GUARD_TYPES,
  getAphroditeVipBoundaryImplementationPhases,
  getAphroditeVipBoundaryImplementationTargets,
  getAphroditeVipBoundaryNextSteps,
  getAphroditeVipBoundaryQaRequirements,
  getAphroditeVipBoundarySafetyBoundaries,
} from "../lib/zodiac/aphrodite-vip-access-boundary-implementation-plan.ts";

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

console.log("Старт QA: план внедрения границы VIP-доступа Aphrodite...\n");

const modelPath = "../lib/zodiac/aphrodite-vip-access-boundary-implementation-plan.ts";
const dashboardPath = "../app/dashboard/networks/zodiac/vip-access-boundary-implementation-plan/page.tsx";
const docsPath = "../docs/aphrodite-vip-access-boundary-implementation-plan.md";
const reportPath = "../docs/aphrodite-package-reports/package-157.md";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";

check("model file exists", exists(modelPath));
check("dashboard page exists", exists(dashboardPath));
check("documentation exists", exists(docsPath));
check("package report exists", exists(reportPath));

const modelSource = exists(modelPath) ? read(modelPath) : "";
const dashboardSource = exists(dashboardPath) ? read(dashboardPath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const dashboardQaSource = read(dashboardQaPath);
const implementationBundle = [modelSource, dashboardSource].join("\n");
const userFacingBundle = [modelSource, dashboardSource, docsSource, reportSource].join("\n");

const targets = getAphroditeVipBoundaryImplementationTargets();
const phases = getAphroditeVipBoundaryImplementationPhases();
const qaRequirements = getAphroditeVipBoundaryQaRequirements();
const boundaries = getAphroditeVipBoundarySafetyBoundaries();
const nextSteps = getAphroditeVipBoundaryNextSteps();

check("implementation targets exist", targets.length >= 9);
check("implementation phases exist", phases.length >= 3);
check("QA requirements exist", qaRequirements.length >= 9);
check("safety boundaries exist", boundaries.length >= 10);
check("next steps exist", nextSteps.length >= 1);
check("Full Love Report target exists", targets.some((target) => target.product === "full-love-report"));
check("Birth Matrix VIP target exists", targets.some((target) => target.product === "birth-matrix-vip"));
check("Natal Chart VIP target exists", targets.some((target) => target.product === "natal-chart-vip"));
check("VIP Couple Calendar target exists", targets.some((target) => target.product === "vip-couple-calendar"));
check("VIP Numerology target exists", targets.some((target) => target.product === "vip-numerology"));

for (const shortcut of [
  "localStorage VIP flag",
  "query param VIP flag",
  "client-only button unlock",
  "hidden CSS section reveal",
  "mock payment success",
  "manual route guessing",
  "front-end-only role check",
]) {
  check(`blocked client shortcut documented: ${shortcut}`, APHRODITE_VIP_BOUNDARY_BLOCKED_CLIENT_SHORTCUTS.includes(shortcut));
}

for (const guardType of [
  "server-side entitlement check",
  "product-specific entitlement check",
  "expiration check",
  "revocation check",
  "payment ledger check",
  "owner review gate",
  "safe fallback to free preview",
  "audit log requirement",
]) {
  check(`future guard type documented: ${guardType}`, APHRODITE_VIP_BOUNDARY_GUARD_TYPES.includes(guardType));
}

for (const control of [
  "No VIP without entitlement",
  "No VIP from localStorage",
  "No VIP from query param",
  "No VIP from fake successful_payment",
  "No entitlement without payment ledger",
  "No expired entitlement access",
  "No revoked entitlement access",
  "Free preview remains accessible",
  "Fallback works without crashing",
]) {
  check(`QA control documented: ${control}`, qaRequirements.some((qa) => qa.englishControl === control));
}

const requiredRussianBoundaries = [
  "Нет реальной VIP-разблокировки",
  "Нет оплаты",
  "Нет Telegram Stars invoice",
  "Нет successful_payment handler",
  "Нет entitlement creation",
  "Нет записи в базу данных",
  "Нет миграции схемы базы данных",
  "Нет вызова Telegram API",
  "Нет production-запуска",
  "Только план внедрения",
];

for (const label of requiredRussianBoundaries) {
  check(`Russian visible boundary exists: ${label}`, userFacingBundle.includes(label));
}

check("dashboard route registered in dashboard QA", dashboardQaSource.includes("vipAccessBoundaryImplementationPlan"));
check("dashboard QA asserts page title", dashboardQaSource.includes("План внедрения границы VIP-доступа"));
check("server-side entitlement check is documented", userFacingBundle.includes("server-side entitlement check"));
check("payment ledger dependency is documented", userFacingBundle.includes("payment ledger"));
check("owner review gate is documented", userFacingBundle.includes("owner review gate"));
check("implementation plan keeps implementNow false", targets.every((target) => target.implementNow === false));

check("no real payment API is used", !/from ['"]stripe|require\(['"]stripe|new Stripe\b|\.charges\.create|checkout\.sessions|sendInvoice\(|createInvoiceLink\(|answerPreCheckoutQuery\(/i.test(implementationBundle));
check("no Telegram token required", !/TELEGRAM_BOT_TOKEN|COMPATIBILITY_BOT_TOKEN|api\.telegram\.org/i.test(implementationBundle));
check("no database connection required", !/DATABASE_URL|createClient\(|new Pool\(|from\([^)]*\)\.(insert|update|delete|upsert)\(/i.test(implementationBundle));
check("no Stars invoice created", !/sendInvoice\(|createInvoiceLink\(|answerPreCheckoutQuery\(/i.test(implementationBundle));
check("no successful_payment handler added", !/successful_payment\s*[:=]|case\s+["']successful_payment["']|function\s+\w*successful|update\.message\.successful_payment/i.test(implementationBundle));
check("no entitlement creation function implemented", !/function\s+create\w*Entitlement|const\s+create\w*Entitlement|export\s+function\s+create\w*Entitlement|grantVip|unlockVip|insert\w*Entitlement/i.test(implementationBundle));
check("no real VIP unlock introduced", !/vipUnlocked\s*=\s*true|realVipAccess\s*=\s*true|setVipActive\(|grantVip\(|unlockVip\(/i.test(implementationBundle));
check("no client-side VIP unlock introduced", !/localStorage\.setItem\([^)]*vip|sessionStorage\.setItem\([^)]*vip|query\.(vip|premium)|searchParams\.get\(["']vip["']\)/i.test(implementationBundle));
check("no active payment CTA is present", !/Купить VIP|Оплатить|Разблокировать отч[её]т|Подписаться|Активировать VIP|Получить доступ после оплаты|Buy now|Subscribe now|Purchase now|Activate VIP|Payment successful|Premium unlocked/i.test(userFacingBundle));

const changedDbFiles = gitDiffNames(["prisma", "supabase", "migrations", "schema.prisma"]).filter((file) =>
  /(^|\/)(prisma|supabase|migrations)(\/|$)|schema\.prisma$/i.test(file),
);
check("no DB migration/schema file changed", changedDbFiles.length === 0);

const workflowChanges = gitDiffNames([".github/workflows", "package.json"]);
check("workflows and package.json not changed", workflowChanges.length === 0);

const scriptChanges = gitDiffNames(["scripts"]);
check("only Package 157 QA script and dashboard QA changed in scripts", scriptChanges.every((file) =>
  file === "scripts/qa-aphrodite-vip-access-boundary-implementation-plan.mjs" || file === "scripts/qa-zodiac-dashboard.mjs",
));

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
