#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

import {
  APHRODITE_PUBLIC_API_EXPOSURE_HARDENING_ROUTE,
  APHRODITE_PUBLIC_API_EXPOSURE_HARDENING_TITLE,
  getAphroditePublicApiExposureHardening,
} from "../lib/zodiac/aphrodite-public-api-exposure-hardening.ts";

let passed = 0;
let failed = 0;

function check(name, condition) {
  if (condition) {
    passed += 1;
    console.log("SUCCESS: " + name);
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

function gitChangedNames(paths) {
  try {
    const diffOutput = execFileSync("git", ["diff", "--name-only", "HEAD", "--", ...paths], { encoding: "utf8" });
    const otherOutput = execFileSync("git", ["ls-files", "--others", "--exclude-standard", "--", ...paths], { encoding: "utf8" });
    return [...diffOutput.split(/\r?\n/), ...otherOutput.split(/\r?\n/)].filter(Boolean);
  } catch {
    return ["__git_diff_failed__"];
  }
}

console.log("Starting QA: Public API Exposure Hardening...\n");

const modelPath = "../lib/zodiac/aphrodite-public-api-exposure-hardening.ts";
const pagePath = "../app/dashboard/networks/zodiac/public-api-exposure-hardening/page.tsx";
const docsPath = "../docs/aphrodite-public-api-exposure-hardening.md";
const reportPath = "../docs/aphrodite-package-reports/package-226.md";
const dashboardPath = "../app/dashboard/networks/zodiac/page.tsx";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";
const unifiedRoutePath = "../app/api/system/unified-status/route.ts";
const unifiedStatusPath = "../lib/unified-system-status.ts";
const analyticsRoutePath = "../app/api/zodiac/analytics/event/route.ts";

for (const [label, path] of [
  ["model", modelPath],
  ["dashboard page", pagePath],
  ["docs", docsPath],
  ["package report", reportPath],
  ["dashboard navigation", dashboardPath],
  ["dashboard QA", dashboardQaPath],
  ["unified status route", unifiedRoutePath],
  ["unified status library", unifiedStatusPath],
  ["analytics route", analyticsRoutePath],
]) {
  check(`${label} exists`, exists(path));
}

const modelSource = exists(modelPath) ? read(modelPath) : "";
const pageSource = exists(pagePath) ? read(pagePath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const dashboardSource = exists(dashboardPath) ? read(dashboardPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";
const unifiedRouteSource = exists(unifiedRoutePath) ? read(unifiedRoutePath) : "";
const unifiedStatusSource = exists(unifiedStatusPath) ? read(unifiedStatusPath) : "";
const analyticsRouteSource = exists(analyticsRoutePath) ? read(analyticsRoutePath) : "";
const model = getAphroditePublicApiExposureHardening();
const implementationBundle = [
  modelSource,
  pageSource,
  docsSource,
  reportSource,
  dashboardSource,
  dashboardQaSource,
  unifiedRouteSource,
  unifiedStatusSource,
  analyticsRouteSource,
].join("\n");
const safetyBundle = [modelSource, pageSource, docsSource, reportSource, unifiedRouteSource, unifiedStatusSource, analyticsRouteSource].join("\n");

check("title exported", model.title === APHRODITE_PUBLIC_API_EXPOSURE_HARDENING_TITLE);
check("route exported", model.route === APHRODITE_PUBLIC_API_EXPOSURE_HARDENING_ROUTE);
check("package number is 226", model.packageNumber === 226);
check("dashboard route exists", pageSource.includes("getAphroditePublicApiExposureHardening") && pageSource.includes("model.title"));
check("dashboard route linked from overview", dashboardSource.includes(APHRODITE_PUBLIC_API_EXPOSURE_HARDENING_ROUTE));
check("dashboard QA route exists", dashboardQaSource.includes("publicApiExposureHardening"));
check("dashboard QA asserts title", dashboardQaSource.includes("Public API Exposure Hardening"));
check("docs/report exists", docsSource.includes("Package 226") && reportSource.includes("Package 226"));
check("publicLaunchApproved=false", model.publicLaunchApproved === false && implementationBundle.includes("publicLaunchApproved"));
check("ownerManualReviewRequired=true", model.ownerManualReviewRequired === true && implementationBundle.includes("ownerManualReviewRequired"));

for (const route of ["/api/system/unified-status", "/api/zodiac/analytics/event"]) {
  check(`route hardening documented: ${route}`, implementationBundle.includes(route));
}

check("unified-status uses redacted getter", unifiedRouteSource.includes("getRedactedUnifiedSystemStatus"));
check("unified-status redaction helper exists", unifiedStatusSource.includes("getRedactedUnifiedSystemStatus"));
check("bot username redacted", /botUsername:\s*null/.test(unifiedStatusSource));
check("raw lastError redacted", /lastError:\s*null/.test(unifiedStatusSource) && unifiedStatusSource.includes("lastErrorRedacted"));
check("scheduler internals redacted", unifiedStatusSource.includes("nextCheck: null") && unifiedStatusSource.includes("nextPublicationTime: null"));
check("target/admin/post counts redacted", unifiedStatusSource.includes("targetsLinked: null") && unifiedStatusSource.includes("botAdmin: null") && unifiedStatusSource.includes("countsRedacted: true"));
check("public redaction marker exists", unifiedStatusSource.includes("publicRedacted: true"));

check("analytics keeps body size cap", analyticsRouteSource.includes("contentLength > 4096"));
check("analytics keeps allow-list validation", analyticsRouteSource.includes("isAllowedZodiacAnalyticsEvent"));
check("analytics requires JSON", analyticsRouteSource.includes("isJsonRequest") && analyticsRouteSource.includes("json_required"));
check("analytics same-origin guard exists", analyticsRouteSource.includes("getOriginTrust") && analyticsRouteSource.includes("origin_not_allowed"));
check("analytics local loopback guard exists", analyticsRouteSource.includes("loopbackOriginsMatch") && analyticsRouteSource.includes("isLoopbackHost"));
check("analytics rate limit exists", analyticsRouteSource.includes("analyticsRateLimitBuckets") && analyticsRouteSource.includes("rate_limited"));
check("analytics browser smoke limit exists", analyticsRouteSource.includes("browserRateLimitMaxEventsPerWindow"));
check("analytics payload shape guard exists", analyticsRouteSource.includes("isSafeAnalyticsBody") && analyticsRouteSource.includes("payload_not_trusted"));
check("analytics no-trust response exists", analyticsRouteSource.includes("preview_no_trust"));
check("analytics spam token guard exists", analyticsRouteSource.includes("blockedTextPattern"));
check("docs say no-trust analytics", /no-trust|preview_no_trust/i.test(implementationBundle));

for (const status of ["HARDENED", "REDACTED", "NO TRUST", "MANUAL REQUIRED", "BLOCKED"]) {
  check(`status documented: ${status}`, implementationBundle.includes(status));
}

check("no production launch flag", model.safetyFlags.productionLaunchDone === false);
check("no Telegram API flag", model.safetyFlags.telegramApiUsed === false);
check("no messages flag", model.safetyFlags.messagesSent === false);
check("no BotFather change flag", model.safetyFlags.botFatherChanged === false);
check("no active CTA logic change flag", model.safetyFlags.activeCtaLogicChanged === false);
check("no DB write flag", model.safetyFlags.databaseWriteAdded === false);
check("no external analytics flag", model.safetyFlags.externalAnalyticsAdded === false);
check("no payment flag", model.safetyFlags.paymentAdded === false);
check("no VIP unlock flag", model.safetyFlags.vipUnlockAdded === false);
check("no cron/workflow/publish flag", model.safetyFlags.cronWorkflowPublishChanged === false);
check("no secrets added flag", model.safetyFlags.secretsAdded === false);
check("no production DB connected flag", model.safetyFlags.productionDbConnected === false);

check("live Mini App source files not changed", gitChangedNames([
  "app/miniapp",
  "app/birth-matrix",
  "app/compatibility",
  "components/ZodiacCompatibilityMiniApp.tsx",
  "components/ZodiacMysticSections.tsx",
  "components/zodiac-mini-app/ZodiacDateInput.tsx",
]).length === 0);
check("no workflow/cron changes", gitChangedNames([".github/workflows", "vercel.json"]).length === 0);
check("publish scripts not changed", gitChangedNames([
  "scripts/publish-zodiac-by-date.mjs",
  "scripts/publish-zodiac-weekly-by-week.mjs",
  "scripts/zodiac-telegram-publisher.mjs",
  "scripts/publish-due.mjs",
  "scripts/publish-due-json.mjs",
]).length === 0);
check("package.json not changed", gitChangedNames(["package.json"]).length === 0);
check("no DB schema/migration change", gitChangedNames(["prisma", "supabase", "migrations", "schema.prisma"]).filter((file) => /(^|\/)(prisma|supabase|migrations)(\/|$)|schema\.prisma$/i.test(file)).length === 0);
check("no secret files changed", gitChangedNames([".env", ".env.local", ".env.production", ".env.production.local", ".env.development.local"]).length === 0);

const changedFiles = gitChangedNames([
  "app",
  "components",
  "lib",
  "scripts",
  "docs",
  "package.json",
  ".github",
  "vercel.json",
  "prisma",
  "supabase",
  "migrations",
  "schema.prisma",
  ".env",
  ".env.local",
  ".env.production",
]);
const allowedChanges = new Set([
  "app/api/system/unified-status/route.ts",
  "app/api/zodiac/analytics/event/route.ts",
  "app/dashboard/networks/zodiac/page.tsx",
  "app/dashboard/networks/zodiac/public-api-exposure-hardening/page.tsx",
  "lib/unified-system-status.ts",
  "lib/zodiac/aphrodite-public-api-exposure-hardening.ts",
  "scripts/qa-aphrodite-public-api-exposure-hardening.mjs",
  "scripts/qa-zodiac-dashboard.mjs",
  "docs/aphrodite-public-api-exposure-hardening.md",
  "docs/aphrodite-package-reports/package-226.md",
]);
check("changed files limited to Package 226 public API layer", changedFiles.every((file) => allowedChanges.has(file)));

check("no hardcoded secret-looking values", !/(postgres(?:ql)?:\/\/|mysql:\/\/|mongodb(?:\+srv)?:\/\/|redis:\/\/|amqp:\/\/|https:\/\/api\.telegram\.org\/bot\d+:[A-Za-z0-9_-]+|\b\d{6,12}:[A-Za-z0-9_-]{30,}\b|(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{16,}|gh[pousr]_[A-Za-z0-9]{30,}|xox[baprs]-[A-Za-z0-9-]{20,}|AIza[0-9A-Za-z_-]{20,}|ya29\.[0-9A-Za-z_-]{20,}|SG\.[0-9A-Za-z_-]{16,})/i.test(safetyBundle));
check("no Telegram API implementation", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(safetyBundle));
check("no Telegram payment handler implementation", !/pre_checkout|successful_payment|answerPreCheckoutQuery|createInvoiceLink/i.test(safetyBundle));
check("no BotFather action implementation", !/setChatMenuButton|setMyCommands|setWebhook|deleteWebhook/i.test(safetyBundle));
check("no active CTA implementation change", !/activeCtaLogicChanged:\s*true|activeCtaChanged:\s*true|sendAllowedNow=true|canCallTelegramApiNow=true/i.test(safetyBundle));
check("no production DB client implementation", !/new\s+PrismaClient\b|from ['"]@prisma\/client|postgres\s*\(|neon\s*\(|new\s+Pool\s*\(|new\s+Client\s*\(/i.test(safetyBundle));
check("no DB write implementation", !/prisma\.[a-zA-Z0-9_]+\.(create|update|delete|upsert)|from\([^)]*\)\.(insert|update|delete|upsert)\(|supabase\.[a-zA-Z0-9_]+\.(insert|update|delete|upsert)|events\.insert/i.test(safetyBundle));
check("no payment or VIP implementation", !/from ['"]stripe|new Stripe\b|sendInvoice\s*\(|createInvoiceLink\s*\(|createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|allowed=true|productionPaymentAllowedNow=true|publicLaunchApproved:\s*true|ownerManualReviewRequired:\s*false/i.test(safetyBundle));
check("no external analytics implementation", !/posthog|amplitude|gtag|GoogleAnalytics|navigator\.sendBeacon/i.test(safetyBundle));

console.log(`\nQA complete: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
