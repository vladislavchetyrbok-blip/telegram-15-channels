#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  APHRODITE_ENTITLEMENT_CREATION_MOCK_CLASSIFICATION,
  APHRODITE_ENTITLEMENT_CREATION_MOCK_SAFETY_LABELS,
  APHRODITE_ENTITLEMENT_CREATION_MOCK_TITLE,
  draftAphroditeEntitlementGrantMock,
  getAphroditeEntitlementCreationMockBoundaries,
  getAphroditeEntitlementCreationMockNextSteps,
  getAphroditeEntitlementCreationMockRules,
} from "../lib/zodiac/aphrodite-entitlement-creation-mock.ts";

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

console.log("Старт QA: entitlement creation mock Aphrodite...\n");

const modelPath = "../lib/zodiac/aphrodite-entitlement-creation-mock.ts";
const pagePath = "../app/dashboard/networks/zodiac/entitlement-creation-mock/page.tsx";
const docsPath = "../docs/aphrodite-entitlement-creation-mock.md";
const reportPath = "../docs/aphrodite-package-reports/package-174.md";
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

const rules = getAphroditeEntitlementCreationMockRules();
const boundaries = getAphroditeEntitlementCreationMockBoundaries();
const nextSteps = getAphroditeEntitlementCreationMockNextSteps();

check("mock function exists", typeof draftAphroditeEntitlementGrantMock === "function");
check("rules exist", rules.length >= 9);
check("boundaries exist", boundaries.length >= 6);
check("next steps exist", nextSteps.some((step) => step.package === "Package 175"));

const allTrueResult = draftAphroditeEntitlementGrantMock({
  productId: "full_love_report",
  telegramUserId: "12345",
  mockVerifiedLedger: true,
  ownerApproved: true,
  entitlementsEnabled: true,
  securityQaApproved: true,
  supportPolicyReady: true,
  backupFresh: true,
});

check("all-true mock input still blocked", allTrueResult.mockOnly === true && allTrueResult.allowed === false);
check("createsEntitlementNow=false", allTrueResult.createsEntitlementNow === false);
check("writesToDatabaseNow=false", allTrueResult.writesToDatabaseNow === false);
check("grantsAccessNow=false", allTrueResult.grantsAccessNow === false);
check("unlocksVipNow=false", allTrueResult.unlocksVipNow === false);
check("allowed=false", allTrueResult.allowed === false);
check("fallback route exists", allTrueResult.fallbackRoute === "/miniapp/love-reading-preview" && userFacingBundle.includes("/miniapp/love-reading-preview"));

for (const dependency of [
  "product catalog",
  "verified payment ledger",
  "entitlement storage",
  "entitlement schema",
  "server-side entitlement check",
  "owner review gate",
  "security QA suite",
  "support/refund policy",
  "backup freshness",
]) {
  check(`future dependency documented: ${dependency}`, userFacingBundle.includes(dependency));
}

check("verified ledger dependency documented", rules.some((rule) => rule.id === "verified-payment-ledger"));
check("product catalog dependency documented", rules.some((rule) => rule.id === "product-catalog"));
check("server-side entitlement check dependency documented", rules.some((rule) => rule.id === "server-side-entitlement-check"));

check("dashboard QA route exists", dashboardQaSource.includes("entitlementCreationMock"));
check("dashboard QA checks title", dashboardQaSource.includes(APHRODITE_ENTITLEMENT_CREATION_MOCK_TITLE));
check("dashboard QA checks classification", dashboardQaSource.includes("Только mock / Entitlement не создаётся"));
check("overview route link exists", dashboardQaSource.includes("/dashboard/networks/zodiac/entitlement-creation-mock"));
check("page shows classification", pageSource.includes("APHRODITE_ENTITLEMENT_CREATION_MOCK_CLASSIFICATION") && userFacingBundle.includes(APHRODITE_ENTITLEMENT_CREATION_MOCK_CLASSIFICATION));

for (const label of APHRODITE_ENTITLEMENT_CREATION_MOCK_SAFETY_LABELS) {
  check(`visible safety label exists: ${label}`, userFacingBundle.includes(label));
}

check("docs say package is local preview only", docsSource.includes("Package 174 создаёт только local preview entitlement creation mock"));
check("docs say no entitlement creation", docsSource.includes("не создаёт entitlement"));
check("report says no DB write", reportSource.includes("не пишет в базу данных"));
check("report says next package Package 175", reportSource.includes("Package 175 — Production Payment Safety Gate"));

check("no DB write", !/process\.env\.DATABASE_URL|createClient\(|new Pool\(|drizzle\(|from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\(|\.update\(|\.delete\(|\.upsert\(/i.test(implementationBundle));
check("no DB schema/migration", gitDiffNames(["prisma", "supabase", "migrations", "schema.prisma"]).filter((file) => /(^|\/)(prisma|supabase|migrations)(\/|$)|schema\.prisma$/i.test(file)).length === 0);
check("no Telegram API", !/fetch\([^)]*api\.telegram\.org|sendMessage\(|sendPhoto\(|sendDocument\(|sendInvoice\(|answerPreCheckoutQuery\(/i.test(implementationBundle));
check("no active VIP unlock", !/unlocksVipNow\s*:\s*true|grantVip\(|unlockVip\(|allowed\s*:\s*true/i.test(implementationBundle));
check("no active entitlement creation", !/createsEntitlementNow\s*:\s*true|function\s+create\w*Entitlement|const\s+create\w*Entitlement|export\s+function\s+create\w*Entitlement|insert\w*Entitlement/i.test(implementationBundle));
check("no active payment CTA", !/Купить VIP|Оплатить|Разблокировать отч[её]т|Подписаться|Активировать VIP|Получить доступ после оплаты|Buy now|Subscribe now|Purchase now|Activate VIP|Payment successful|Premium unlocked/i.test(userFacingBundle));

const workflowChanges = gitDiffNames([".github/workflows", "package.json"]);
check("workflows and package.json are not changed", workflowChanges.length === 0);

const scriptChanges = gitDiffNames(["scripts"]);
check("only Aphrodite QA scripts and dashboard QA changed in scripts", scriptChanges.every((file) =>
  file === "scripts/qa-zodiac-dashboard.mjs" || /^scripts\/qa-aphrodite-.*\.mjs$/.test(file),
));

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
