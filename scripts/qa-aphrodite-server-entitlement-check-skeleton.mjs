#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  APHRODITE_SERVER_ENTITLEMENT_CHECK_FALLBACK_ROUTE,
  APHRODITE_SERVER_ENTITLEMENT_CHECK_RULE,
  APHRODITE_SERVER_ENTITLEMENT_CHECK_SKELETON_CLASSIFICATION,
  APHRODITE_SERVER_ENTITLEMENT_SAFETY_LABELS,
  checkAphroditeServerEntitlementSkeleton,
  getAphroditeServerEntitlementCheckBoundaries,
  getAphroditeServerEntitlementCheckNextSteps,
} from "../lib/zodiac/aphrodite-server-entitlement-check-skeleton.ts";
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

console.log("Старт QA: server-side entitlement check skeleton Aphrodite...\n");

const modelPath = "../lib/zodiac/aphrodite-server-entitlement-check-skeleton.ts";
const dashboardPath = "../app/dashboard/networks/zodiac/server-entitlement-check-skeleton/page.tsx";
const docsPath = "../docs/aphrodite-server-entitlement-check-skeleton.md";
const reportPath = "../docs/aphrodite-package-reports/package-166.md";
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

const boundaries = getAphroditeServerEntitlementCheckBoundaries();
const nextSteps = getAphroditeServerEntitlementCheckNextSteps();

const defaultResult = checkAphroditeServerEntitlementSkeleton({ productId: "full-love-report", source: "mini-app" });
const clientFlagResult = checkAphroditeServerEntitlementSkeleton({ productId: "vip-love-access", mockClientVipFlag: true });
const queryFlagResult = checkAphroditeServerEntitlementSkeleton({ productId: "natal-chart-vip", mockQueryVipFlag: true });
const paymentSuccessResult = checkAphroditeServerEntitlementSkeleton({ productId: "vip-numerology", mockPaymentSuccess: true });
const fakeRecordResult = checkAphroditeServerEntitlementSkeleton({
  productId: "vip-couple-calendar",
  mockEntitlementRecord: { status: "active", productId: "vip-couple-calendar" },
});
const guardResult = checkAphroditeVipAccessSkeleton({ product: "vip-love-access", mockClientVipFlag: true, mockPaymentSuccess: true });

check("classification is server skeleton only", APHRODITE_SERVER_ENTITLEMENT_CHECK_SKELETON_CLASSIFICATION.includes("Server-side skeleton"));
check("main rule says fail closed", APHRODITE_SERVER_ENTITLEMENT_CHECK_RULE.includes("fail closed"));
check("fallback route is free preview", APHRODITE_SERVER_ENTITLEMENT_CHECK_FALLBACK_ROUTE === "/miniapp/love-reading-preview");
check("check function exists", typeof checkAphroditeServerEntitlementSkeleton === "function");
check("boundaries exist", boundaries.length >= 10);
check("next step points to Package 167", nextSteps.some((step) => step.package === "Package 167" && step.title === "VIP Access Security QA Suite"));

for (const [label, result] of [
  ["default result", defaultResult],
  ["fake localStorage/client flag", clientFlagResult],
  ["fake query VIP flag", queryFlagResult],
  ["fake payment success", paymentSuccessResult],
  ["fake entitlement record", fakeRecordResult],
]) {
  check(`${label} denied`, result.allowed === false);
  check(`${label} returns fallback route`, result.fallbackRoute === "/miniapp/love-reading-preview");
  check(`${label} has future checks`, result.requiredFutureChecks.length >= 6);
}

check("fake localStorage/client flag is ignored", clientFlagResult.ignoredClientSignals.some((signal) => signal.includes("mockClientVipFlag")));
check("fake query VIP flag is ignored", queryFlagResult.ignoredClientSignals.some((signal) => signal.includes("mockQueryVipFlag")));
check("fake payment success is ignored", paymentSuccessResult.ignoredClientSignals.some((signal) => signal.includes("mockPaymentSuccess")));
check("fake entitlement record is ignored", fakeRecordResult.ignoredClientSignals.some((signal) => signal.includes("mockEntitlementRecord")));
check("existing VIP guard skeleton still denies", guardResult.allowed === false && guardResult.fallbackRoute === "/miniapp/love-reading-preview");

for (const label of APHRODITE_SERVER_ENTITLEMENT_SAFETY_LABELS) {
  check(`required safety label exists: ${label}`, userFacingBundle.includes(label));
}

for (const boundary of [
  "no-real-vip-unlock",
  "no-payment",
  "no-stars-invoice",
  "no-successful-payment-handler",
  "no-entitlement-creation",
  "no-database-write",
  "no-database-schema-migration",
  "no-telegram-api-call",
  "no-production-launch",
  "server-check-always-denies",
]) {
  check(`data boundary exists: ${boundary}`, boundaries.some((item) => item.dataBoundary === boundary) && dashboardSource.includes("data-boundary={boundary.dataBoundary}"));
}

check("dashboard route is registered in dashboard QA", dashboardQaSource.includes("serverEntitlementCheckSkeleton"));
check("dashboard QA checks server title", dashboardQaSource.includes("Skeleton server-side проверки entitlement"));
check("dashboard QA checks server classification", dashboardQaSource.includes("Server-side skeleton"));
check("dashboard QA checks allowed=false", dashboardQaSource.includes("allowed=false"));

check("no literal active allow flag exists", !implementationBundle.includes("allowed" + "=true"));
check("no real payment API is used", !/from ['"]stripe|require\(['"]stripe|new Stripe\b|checkout\.sessions|charges\.create|payment_intents|paypal|yookassa|liqpay/i.test(implementationBundle));
check("no Stars invoice is created", !/sendInvoice\(|createInvoiceLink\(|answerPreCheckoutQuery\(/i.test(implementationBundle));
check("no successful_payment handler code is added", !/successful_payment\s*[:=]|case\s+["']successful_payment["']|function\s+\w*successful|update\.message\.successful_payment/i.test(implementationBundle));
check("no Telegram token is required", !/TELEGRAM_BOT_TOKEN|COMPATIBILITY_BOT_TOKEN|process\.env\.[A-Z_]*TELEGRAM/i.test(implementationBundle));
check("no database connection or write is used", !/DATABASE_URL|createClient\(|new Pool\(|drizzle\(|from\([^)]*\)\.(insert|update|delete|upsert)\(/i.test(implementationBundle));
check("no entitlement creation function is implemented", !/function\s+create\w*Entitlement|const\s+create\w*Entitlement|export\s+function\s+create\w*Entitlement|grantVip\(|unlockVip\(|insert\w*Entitlement/i.test(implementationBundle));
check("no real VIP unlock is introduced", !/vipUnlockEnabledNow\s*:\s*true|vipUnlocked\s*=\s*true|realVipAccess\s*=\s*true|allowed\s*:\s*true|setVipActive\(|grantVip\(|unlockVip\(/i.test(implementationBundle));
check("no production guard connection is introduced", !/middleware|route\.ts|api\/zodiac|requireDashboardPageAccess|redirect\(|NextResponse/i.test(modelSource));
check("no active payment CTA is present", !/Купить VIP|Оплатить|Разблокировать отч[её]т|Подписаться|Активировать VIP|Получить доступ после оплаты|Buy now|Subscribe now|Purchase now|Activate VIP|Payment successful|Premium unlocked/i.test(userFacingBundle));

const changedDbFiles = gitDiffNames(["prisma", "supabase", "migrations", "schema.prisma"]).filter((file) =>
  /(^|\/)(prisma|supabase|migrations)(\/|$)|schema\.prisma$/i.test(file),
);
check("no DB migration/schema file changed", changedDbFiles.length === 0);

const workflowChanges = gitDiffNames([".github/workflows", "package.json"]);
check("workflows and package.json are not changed", workflowChanges.length === 0);

const scriptChanges = gitDiffNames(["scripts"]);
check("only Aphrodite QA scripts and dashboard QA changed in scripts", scriptChanges.every((file) =>
  file === "scripts/qa-zodiac-dashboard.mjs" || /^scripts\/qa-aphrodite-.*\.mjs$/.test(file),
));

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
