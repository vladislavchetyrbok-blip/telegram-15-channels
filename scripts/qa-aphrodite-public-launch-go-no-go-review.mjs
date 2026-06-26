#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

import {
  APHRODITE_OWNER_DECISION_STATES,
  APHRODITE_PRODUCTION_PREFLIGHT_NEXT_ACTIONS,
  APHRODITE_PRODUCTION_PREFLIGHT_PACKAGE_NUMBER,
  APHRODITE_PUBLIC_LAUNCH_FREEZE_PACKAGE_NUMBER,
  APHRODITE_PUBLIC_LAUNCH_GO_NO_GO_REVIEW_CLASSIFICATION,
  APHRODITE_PUBLIC_LAUNCH_GO_NO_GO_REVIEW_SAFETY_LABELS,
  APHRODITE_PUBLIC_LAUNCH_GO_NO_GO_REVIEW_TITLE,
  getAphroditePublicLaunchGoNoGoReview,
} from "../lib/zodiac/aphrodite-public-launch-go-no-go-review.ts";

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

console.log("Старт QA: Public Launch Go/No-Go Review...\n");

const modelPath = "../lib/zodiac/aphrodite-public-launch-go-no-go-review.ts";
const pagePath = "../app/dashboard/networks/zodiac/public-launch-go-no-go-review/page.tsx";
const docsPath = "../docs/aphrodite-public-launch-go-no-go-review.md";
const reportPath = "../docs/aphrodite-package-reports/package-212.md";
const preflightDocsPath = "../docs/aphrodite-production-env-backup-preflight-readiness.md";
const preflightReportPath = "../docs/aphrodite-package-reports/package-216.md";
const freezeDocsPath = "../docs/aphrodite-public-launch-freeze-owner-go-no-go-pack.md";
const freezeReportPath = "../docs/aphrodite-package-reports/package-217.md";
const dashboardPath = "../app/dashboard/networks/zodiac/page.tsx";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";

for (const [label, path] of [
  ["model", modelPath],
  ["dashboard", pagePath],
  ["docs", docsPath],
  ["package report", reportPath],
  ["production preflight docs", preflightDocsPath],
  ["package 216 report", preflightReportPath],
  ["launch freeze docs", freezeDocsPath],
  ["package 217 report", freezeReportPath],
  ["dashboard navigation", dashboardPath],
  ["dashboard QA", dashboardQaPath],
]) {
  check(`${label} существует`, exists(path));
}

const modelSource = exists(modelPath) ? read(modelPath) : "";
const pageSource = exists(pagePath) ? read(pagePath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const preflightDocsSource = exists(preflightDocsPath) ? read(preflightDocsPath) : "";
const preflightReportSource = exists(preflightReportPath) ? read(preflightReportPath) : "";
const freezeDocsSource = exists(freezeDocsPath) ? read(freezeDocsPath) : "";
const freezeReportSource = exists(freezeReportPath) ? read(freezeReportPath) : "";
const dashboardSource = exists(dashboardPath) ? read(dashboardPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";
const model = getAphroditePublicLaunchGoNoGoReview();
const implementationBundle = [
  modelSource,
  pageSource,
  docsSource,
  reportSource,
  preflightDocsSource,
  preflightReportSource,
  freezeDocsSource,
  freezeReportSource,
  dashboardSource,
  dashboardQaSource,
].join("\n");
const safetyBundle = [
  modelSource,
  pageSource,
  docsSource,
  reportSource,
  preflightDocsSource,
  preflightReportSource,
  freezeDocsSource,
  freezeReportSource,
].join("\n");

check("title exported", model.title === APHRODITE_PUBLIC_LAUNCH_GO_NO_GO_REVIEW_TITLE);
check("classification exported", model.classification === APHRODITE_PUBLIC_LAUNCH_GO_NO_GO_REVIEW_CLASSIFICATION);
check("package number is 212", model.packageNumber === 212);
check("preflight package number is 216", model.preflightReadinessPackageNumber === APHRODITE_PRODUCTION_PREFLIGHT_PACKAGE_NUMBER);
check("freeze package number is 217", model.freezePackPackageNumber === APHRODITE_PUBLIC_LAUNCH_FREEZE_PACKAGE_NUMBER);
check("Package 216 documented", implementationBundle.includes("Package 216"));
check("Package 217 documented", implementationBundle.includes("Package 217"));
check("dashboard route linked from overview", dashboardSource.includes("/dashboard/networks/zodiac/public-launch-go-no-go-review"));
check("dashboard QA route exists", dashboardQaSource.includes("publicLaunchGoNoGoReview"));
check("dashboard QA asserts title", dashboardQaSource.includes("Public Launch Go/No-Go Review"));
check("publicLaunchApproved=false", model.publicLaunchApproved === false && implementationBundle.includes("publicLaunchApproved=false"));
check("owner manual review required", model.ownerManualReviewRequired === true && implementationBundle.includes("ownerManualReviewRequired=true"));
check("owner launch decision state is NOT READY", model.ownerLaunchDecisionState === "NOT READY" && implementationBundle.includes("ownerLaunchDecisionState"));
check("unresolved blocker count exists", model.unresolvedBlockerCount >= 3 && implementationBundle.includes("unresolvedBlockerCount"));

for (const label of APHRODITE_PUBLIC_LAUNCH_GO_NO_GO_REVIEW_SAFETY_LABELS) {
  check(`safety label exists: ${label}`, implementationBundle.includes(label));
}

for (const dependency of [
  "visual readiness",
  "real device checklist",
  "WebView/startapp diagnostics",
  "live version/cache marker",
  "issue triage board",
  "launch checklist",
  "manual smoke matrix",
  "support/refund readiness",
  "analytics/privacy readiness",
  "production safety blockers",
  "env blockers",
  "backup blocker",
  "owner approval",
]) {
  check(`dependency exists: ${dependency}`, model.dependencies.some((item) => item.title === dependency));
  check(`dependency rendered/documented: ${dependency}`, implementationBundle.includes(dependency));
}

for (const blocker of [
  "DATABASE_URL is not configured",
  "TELEGRAM_BOT_TOKEN is not configured",
  "Latest backup is older than 24 hours",
]) {
  check(`production safety blocker exists: ${blocker}`, model.productionSafetyBlockers.includes(blocker));
  check(`production safety blocker rendered/documented: ${blocker}`, implementationBundle.includes(blocker));
}

check("real device checklist dependency exists", implementationBundle.includes("/dashboard/networks/zodiac/real-device-visual-qa-checklist"));
check("startapp diagnostics dependency exists", implementationBundle.includes("/dashboard/networks/zodiac/telegram-webview-startapp-diagnostics"));
check("cache marker dependency exists", implementationBundle.includes("/dashboard/networks/zodiac/live-version-cache-marker-readiness"));
check("issue triage dependency exists", implementationBundle.includes("/dashboard/networks/zodiac/visual-issue-triage-board"));
check("support/refund dependency exists", implementationBundle.includes("/dashboard/networks/zodiac/support-refund-policy-readiness"));
check("analytics/privacy dependency exists", implementationBundle.includes("/dashboard/networks/zodiac/analytics-privacy-safety-suite"));
check("production safety blockers exist", model.productionSafetyBlockers.length >= 3);

for (const state of APHRODITE_OWNER_DECISION_STATES) {
  check(`owner decision state exists: ${state}`, model.ownerDecisionStates.includes(state));
  check(`owner decision state rendered/documented: ${state}`, implementationBundle.includes(state));
}

const freezeRules = [
  "publicLaunchApproved=false",
  "ownerManualReviewRequired=true",
  "launch is frozen until owner approval",
  "no Telegram API usage",
  "no messages sent",
  "no BotFather changes",
  "no payments",
  "no VIP unlock",
  "no DB writes",
  "no cron/publish workflow changes",
];

check("launch freeze status is frozen", model.launchFreezePack.status === "FROZEN" && implementationBundle.includes("FROZEN"));
check("launch freeze keeps publicLaunchApproved false", model.launchFreezePack.publicLaunchApproved === false);
check("launch freeze keeps ownerManualReviewRequired true", model.launchFreezePack.ownerManualReviewRequired === true);
for (const rule of freezeRules) {
  check(`launch freeze rule exists: ${rule}`, model.launchFreezePack.freezeRules.includes(rule));
  check(`launch freeze rule rendered/documented: ${rule}`, implementationBundle.includes(rule));
}

for (const forbidden of [
  "Do not enable production launch automatically",
  "Do not set publicLaunchApproved=true",
  "Do not set ownerManualReviewRequired=false",
  "Do not call Telegram API",
  "Do not send messages",
  "Do not change BotFather",
  "Do not change active CTA logic",
  "Do not add DB writes",
  "Do not add external analytics",
  "Do not add payments",
  "Do not unlock VIP",
  "Do not change cron/workflows/publish scripts",
]) {
  check(`cannot automate rule exists: ${forbidden}`, model.launchFreezePack.cannotAutomate.includes(forbidden));
  check(`cannot automate rule rendered/documented: ${forbidden}`, implementationBundle.includes(forbidden));
}

const readinessSectionRequirements = [
  {
    title: "Real Device Visual QA",
    routeOrSource: "/dashboard/networks/zodiac/real-device-visual-qa-checklist",
    ownerDecisionState: "BLOCKED BY VISUAL QA",
  },
  {
    title: "Telegram WebView/startapp Diagnostics",
    routeOrSource: "/dashboard/networks/zodiac/telegram-webview-startapp-diagnostics",
    ownerDecisionState: "BLOCKED BY TELEGRAM WEBVIEW QA",
  },
  {
    title: "Live Version/Cache Marker",
    routeOrSource: "/dashboard/networks/zodiac/live-version-cache-marker-readiness",
    ownerDecisionState: "READY FOR OWNER REVIEW",
  },
  {
    title: "Visual Issue Triage Board",
    routeOrSource: "/dashboard/networks/zodiac/visual-issue-triage-board",
    ownerDecisionState: "BLOCKED BY VISUAL QA",
  },
  {
    title: "Production Env/Backup blockers",
    routeOrSource: "DATABASE_URL / TELEGRAM_BOT_TOKEN / npm run production:safety:check",
    ownerDecisionState: "BLOCKED BY ENV",
  },
  {
    title: "Backup Freshness",
    routeOrSource: "latest backup age / npm run production:safety:check",
    ownerDecisionState: "BLOCKED BY BACKUP",
  },
  {
    title: "Owner Manual Review",
    routeOrSource: "manual owner decision",
    ownerDecisionState: "APPROVAL NOT GRANTED",
  },
  {
    title: "Safety confirmation",
    routeOrSource: "static dashboard safety flags",
    ownerDecisionState: "READY FOR OWNER REVIEW",
  },
];

check("all launch readiness sections exist", model.launchReadinessSections.length === readinessSectionRequirements.length);
for (const requirement of readinessSectionRequirements) {
  const section = model.launchReadinessSections.find((item) => item.title === requirement.title);
  check(`readiness section exists: ${requirement.title}`, Boolean(section));
  check(`readiness section route/source: ${requirement.title}`, section?.routeOrSource === requirement.routeOrSource);
  check(`readiness section state: ${requirement.title}`, section?.ownerDecisionState === requirement.ownerDecisionState);
  check(`readiness section rendered/documented: ${requirement.title}`, implementationBundle.includes(requirement.title));
  check(`readiness section route rendered/documented: ${requirement.routeOrSource}`, implementationBundle.includes(requirement.routeOrSource));
}

for (const blocker of [
  "DATABASE_URL",
  "TELEGRAM_BOT_TOKEN",
  "backup freshness",
  "manual real-device QA",
  "owner approval",
]) {
  check(`remaining launch blocker exists: ${blocker}`, model.remainingLaunchBlockers.includes(blocker));
  check(`remaining launch blocker rendered/documented: ${blocker}`, implementationBundle.includes(blocker));
}

const preflightBlockerRequirements = [
  {
    id: "database-url",
    title: "DATABASE_URL missing",
    sourceBlocker: "DATABASE_URL is not configured",
    classification: "Manual production env blocker",
    explanation: "DATABASE_URL missing = Manual production env blocker",
  },
  {
    id: "telegram-bot-token",
    title: "TELEGRAM_BOT_TOKEN missing",
    sourceBlocker: "TELEGRAM_BOT_TOKEN is not configured",
    classification: "Manual production env blocker",
    explanation: "TELEGRAM_BOT_TOKEN missing = Manual production env blocker",
  },
  {
    id: "backup-freshness",
    title: "backup older than 24h",
    sourceBlocker: "Latest backup is older than 24 hours",
    classification: "Manual backup freshness blocker",
    explanation: "backup older than 24h = Manual backup freshness blocker",
  },
];

check("three production preflight blockers exist", model.productionPreflightBlockers.length === 3);
for (const requirement of preflightBlockerRequirements) {
  const blocker = model.productionPreflightBlockers.find((item) => item.id === requirement.id);
  check(`preflight blocker exists: ${requirement.id}`, Boolean(blocker));
  check(`preflight blocker title: ${requirement.title}`, blocker?.title === requirement.title);
  check(`preflight blocker source: ${requirement.sourceBlocker}`, blocker?.sourceBlocker === requirement.sourceBlocker);
  check(`preflight blocker classification: ${requirement.classification}`, blocker?.classification === requirement.classification);
  check(`preflight blocker status blocked: ${requirement.id}`, blocker?.status === "BLOCKED");
  check(`preflight blocker explanation rendered: ${requirement.explanation}`, implementationBundle.includes(requirement.explanation));
  check(`preflight blocker not code failure reason: ${requirement.id}`, Boolean(blocker?.notCodeFailureReason.includes("not code failure")));
}

for (const action of APHRODITE_PRODUCTION_PREFLIGHT_NEXT_ACTIONS) {
  check(`preflight next action exists: ${action}`, model.productionPreflightNextActions.includes(action));
  check(`preflight next action rendered/documented: ${action}`, implementationBundle.includes(action));
}

check("manual production env blockers rendered", implementationBundle.includes("Manual production env blocker"));
check("manual backup freshness blocker rendered", implementationBundle.includes("Manual backup freshness blocker"));
check("manual production blockers not code failure rendered", implementationBundle.includes("manual production blockers, not code failure") || implementationBundle.includes("Manual production blockers"));
check("owner manual review required rendered", implementationBundle.includes("owner manual review required"));
check("no automatic launch summary", model.productionPreflightSafetySummary.automaticLaunch === false && implementationBundle.includes("No automatic launch"));
check("no automatic secret creation summary", model.productionPreflightSafetySummary.automaticSecretCreation === false && implementationBundle.includes("No automatic secret creation"));
check("no production DB connection summary", model.productionPreflightSafetySummary.productionDbConnection === false && implementationBundle.includes("No production DB connection"));
check("no Telegram API call summary", model.productionPreflightSafetySummary.telegramApiCall === false && implementationBundle.includes("No Telegram API call"));
check("no DB write summary", model.productionPreflightSafetySummary.databaseWrite === false && implementationBundle.includes("No DB write"));
check("no production launch", model.safetyFlags.productionLaunchDone === false);
check("no Telegram API", model.safetyFlags.telegramApiUsed === false);
check("no BotFather changes", model.safetyFlags.botFatherChanged === false);
check("no active CTA change", model.safetyFlags.activeCtaChanged === false);
check("no messages", model.safetyFlags.messagesSent === false);
check("no DB write", model.safetyFlags.databaseWriteAdded === false);
check("no external analytics", model.safetyFlags.externalAnalyticsAdded === false);
check("no payment", model.safetyFlags.paymentAdded === false);
check("no VIP", model.safetyFlags.vipUnlockAdded === false);
check("next step is owner decision", model.nextRecommendedPackage.includes("Owner manual Go/No-Go decision") && model.nextRecommendedPackage.includes("no automatic launch"));
check("docs say Package 212", docsSource.includes("Package 212"));
check("report says Package 212", reportSource.includes("Package 212"));
check("report keeps Package 213 not started", reportSource.includes("Package 213 не начат"));
check("preflight docs say Package 216", preflightDocsSource.includes("Package 216"));
check("preflight report says Package 216", preflightReportSource.includes("Package 216"));
check("freeze docs say Package 217", freezeDocsSource.includes("Package 217"));
check("freeze report says Package 217", freezeReportSource.includes("Package 217"));
check("freeze report says launch not executed", freezeReportSource.includes("Production launch done: No"));
check("production safety script remains blocker-aware", implementationBundle.includes("run production safety script again"));

check("live Mini App source files not changed", gitDiffNames([
  "app/miniapp",
  "app/birth-matrix",
  "app/compatibility",
  "components/ZodiacCompatibilityMiniApp.tsx",
  "components/ZodiacMysticSections.tsx",
  "components/zodiac-mini-app/ZodiacDateInput.tsx",
]).length === 0);
check("no workflow/cron changes", gitDiffNames([".github/workflows", "vercel.json"]).length === 0);
check("publish scripts not changed", gitDiffNames([
  "scripts/publish-zodiac-by-date.mjs",
  "scripts/publish-zodiac-weekly-by-week.mjs",
  "scripts/zodiac-telegram-publisher.mjs",
  "scripts/publish-due.mjs",
  "scripts/publish-due-json.mjs",
]).length === 0);
check("package.json not changed", gitDiffNames(["package.json"]).length === 0);
check("no DB schema/migration change", gitDiffNames(["prisma", "supabase", "migrations", "schema.prisma"]).filter((file) => /(^|\/)(prisma|supabase|migrations)(\/|$)|schema\.prisma$/i.test(file)).length === 0);
check("no secret files changed", gitDiffNames([
  ".env",
  ".env.local",
  ".env.production",
  ".env.production.local",
  ".env.development.local",
]).length === 0);

const scriptChanges = gitDiffNames(["scripts"]);
const allowedScriptChanges = new Set([
  "scripts/qa-aphrodite-public-launch-go-no-go-review.mjs",
  "scripts/qa-zodiac-dashboard.mjs",
]);
check("script changes limited to Package 217 QA/dashboard QA", scriptChanges.every((file) => allowedScriptChanges.has(file)));

check("no secret literal added", !/(postgres(?:ql)?:\/\/|[0-9]{6,}:[A-Za-z0-9_-]{20,})/i.test(safetyBundle));
check("no Telegram API implementation", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(safetyBundle));
check("no BotFather API modification", !/setChatMenuButton|setMyCommands|setWebhook|deleteWebhook/i.test(safetyBundle));
check("no active CTA implementation change", !/activeCtaChanged:\s*true|sendAllowedNow=true|canCallTelegramApiNow=true/i.test(safetyBundle));
check("no DB write implementation", !/from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(|events\.insert|insert.*event/i.test(safetyBundle));
check("no payment or VIP implementation", !/from ['"]stripe|new Stripe\b|sendInvoice\s*\(|createInvoiceLink\s*\(|successful_payment|pre_checkout_query|answerPreCheckoutQuery|createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|allowed=true|productionPaymentAllowedNow=true|publicLaunchApproved:\s*true|ownerManualReviewRequired:\s*false/i.test(safetyBundle));
check("no external analytics implementation", !/analytics\.track|posthog|amplitude|gtag|GoogleAnalytics|sendEvent|trackEvent|navigator\.sendBeacon/i.test(safetyBundle));

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
