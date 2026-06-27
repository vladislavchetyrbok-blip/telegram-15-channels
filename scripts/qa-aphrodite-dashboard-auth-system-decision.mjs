#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

import {
  APHRODITE_DASHBOARD_AUTH_SYSTEM_DECISION_ROUTE,
  APHRODITE_DASHBOARD_AUTH_SYSTEM_DECISION_TITLE,
  getAphroditeDashboardAuthSystemDecision,
} from "../lib/zodiac/aphrodite-dashboard-auth-system-decision.ts";

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

console.log("Starting QA: Dashboard Auth System Decision...\n");

const modelPath = "../lib/zodiac/aphrodite-dashboard-auth-system-decision.ts";
const pagePath = "../app/dashboard/networks/zodiac/dashboard-auth-system-decision/page.tsx";
const docsPath = "../docs/aphrodite-dashboard-auth-system-decision.md";
const reportPath = "../docs/aphrodite-package-reports/package-225.md";
const dashboardPath = "../app/dashboard/networks/zodiac/page.tsx";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";
const middlewarePath = "../middleware.ts";
const legacyLoginRoutePath = "../app/api/dashboard/auth/login/route.ts";
const legacyLogoutRoutePath = "../app/api/dashboard/auth/logout/route.ts";
const legacyStatusRoutePath = "../app/api/dashboard/auth/status/route.ts";

for (const [label, path] of [
  ["model", modelPath],
  ["dashboard page", pagePath],
  ["docs", docsPath],
  ["package report", reportPath],
  ["dashboard navigation", dashboardPath],
  ["dashboard QA", dashboardQaPath],
  ["middleware", middlewarePath],
  ["legacy login route", legacyLoginRoutePath],
  ["legacy logout route", legacyLogoutRoutePath],
  ["legacy status route", legacyStatusRoutePath],
]) {
  check(`${label} exists`, exists(path));
}

const modelSource = exists(modelPath) ? read(modelPath) : "";
const pageSource = exists(pagePath) ? read(pagePath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const dashboardSource = exists(dashboardPath) ? read(dashboardPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";
const middlewareSource = exists(middlewarePath) ? read(middlewarePath) : "";
const legacyLoginRouteSource = exists(legacyLoginRoutePath) ? read(legacyLoginRoutePath) : "";
const legacyLogoutRouteSource = exists(legacyLogoutRoutePath) ? read(legacyLogoutRoutePath) : "";
const legacyStatusRouteSource = exists(legacyStatusRoutePath) ? read(legacyStatusRoutePath) : "";

const model = getAphroditeDashboardAuthSystemDecision();
const implementationBundle = [
  modelSource,
  pageSource,
  docsSource,
  reportSource,
  dashboardSource,
  dashboardQaSource,
  middlewareSource,
  legacyLoginRouteSource,
  legacyLogoutRouteSource,
  legacyStatusRouteSource,
].join("\n");
const safetyBundle = [
  modelSource,
  pageSource,
  docsSource,
  reportSource,
  legacyLoginRouteSource,
  legacyLogoutRouteSource,
  legacyStatusRouteSource,
].join("\n");

check("title exported", model.title === APHRODITE_DASHBOARD_AUTH_SYSTEM_DECISION_TITLE);
check("route exported", model.route === APHRODITE_DASHBOARD_AUTH_SYSTEM_DECISION_ROUTE);
check("package number is 225", model.packageNumber === 225);
check("dashboard route exists", pageSource.includes("getAphroditeDashboardAuthSystemDecision") && pageSource.includes("model.title"));
check("dashboard route linked from overview", dashboardSource.includes(APHRODITE_DASHBOARD_AUTH_SYSTEM_DECISION_ROUTE));
check("dashboard QA route exists", dashboardQaSource.includes("dashboardAuthSystemDecision"));
check("dashboard QA asserts title", dashboardQaSource.includes("Dashboard Auth System Decision"));
check("docs/report exists", docsSource.includes("Package 225") && reportSource.includes("Package 225"));

check("publicLaunchApproved=false", model.publicLaunchApproved === false && implementationBundle.includes("publicLaunchApproved"));
check("ownerManualReviewRequired=true", model.ownerManualReviewRequired === true && implementationBundle.includes("ownerManualReviewRequired"));
check("canonical auth documented", model.canonical.dashboardAuth === "aphrodite_session via middleware.ts" && implementationBundle.includes("canonical dashboard auth"));
check("canonical cookie documented", model.canonical.sessionCookie === "aphrodite_session" && implementationBundle.includes("aphrodite_session"));
check("canonical login path documented", model.canonical.loginPath === "/login" && implementationBundle.includes("/login"));
check("middleware protection documented", model.canonical.middlewareProtection === "middleware.ts" && implementationBundle.includes("middleware.ts"));
check("protected route pattern documented", model.canonical.protectedRoutePattern === "/dashboard/*" && implementationBundle.includes("/dashboard/*"));
check("legacy zodiac_dashboard_session documented", model.legacy.dashboardAuth === "zodiac_dashboard_session" && implementationBundle.includes("zodiac_dashboard_session"));
check("legacy secret name documented without value", model.legacy.envSecretName === "ZODIAC_DASHBOARD_SESSION_SECRET" && implementationBundle.includes("ZODIAC_DASHBOARD_SESSION_SECRET"));
check("legacy/orphan status documented", model.legacy.status === "legacy/orphan/non-authoritative" && implementationBundle.includes("legacy/orphan/non-authoritative"));
check("legacy API disabled handling documented", model.legacy.handling.includes("410 Disabled") && implementationBundle.includes("410 Disabled"));

for (const surface of [
  "app/api/dashboard/auth/login",
  "app/api/dashboard/auth/logout",
  "app/api/dashboard/auth/status",
  "app/dashboard/login",
  "components/DashboardLoginForm",
]) {
  check(`legacy surface documented: ${surface}`, model.legacySurfaces.some((item) => item.surface === surface));
  check(`legacy surface rendered/documented: ${surface}`, implementationBundle.includes(surface));
}

check("middleware still protects /dashboard", /pathname\.startsWith\(["']\/dashboard["']\)/.test(middlewareSource));
check("middleware reads aphrodite_session", middlewareSource.includes('request.cookies.get("aphrodite_session")'));
check("middleware uses APHRODITE_SESSION_SECRET", middlewareSource.includes("APHRODITE_SESSION_SECRET"));
check("middleware verifies Aphrodite session", middlewareSource.includes("verifySessionCookieValue"));
check("middleware redirects to /login", middlewareSource.includes('new URL("/login"'));
check("middleware does not trust zodiac_dashboard_session", !middlewareSource.includes("zodiac_dashboard_session"));

for (const [label, source] of [
  ["legacy login", legacyLoginRouteSource],
  ["legacy logout", legacyLogoutRouteSource],
  ["legacy status", legacyStatusRouteSource],
]) {
  check(`${label} route returns disabled marker`, source.includes("legacy_dashboard_auth_disabled"));
  check(`${label} route returns 410`, source.includes("status: 410"));
  check(`${label} route documents canonical auth`, source.includes("aphrodite_session"));
  check(`${label} route does not set cookies`, !/cookies\.set|response\.cookies\.set/.test(source));
}

check("legacy login route does not create zodiac session", !/createDashboardSessionCookie|verifyDashboardPassword/.test(legacyLoginRouteSource));
check("legacy logout route does not clear zodiac session", !/clearDashboardSessionCookie/.test(legacyLogoutRouteSource));
check("legacy status route does not read zodiac status", !/getDashboardAuthStatus/.test(legacyStatusRouteSource));
check("dashboard QA verifies fake zodiac cookie redirect", dashboardQaSource.includes("checkRedirectWithCookie") && dashboardQaSource.includes("zodiac_dashboard_session=legacy-test-cookie"));
check("dashboard QA verifies legacy auth endpoints disabled", dashboardQaSource.includes("checkLegacyDashboardAuthDisabled"));

check("dashboard remains protected flag", model.safetyFlags.dashboardRemainsProtected === true);
check("no dashboard bypass flag", model.safetyFlags.dashboardPublicBypassAdded === false);
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
check("report says dashboard made public no", reportSource.includes("Dashboard made public: No"));
check("report says next package", reportSource.includes("Package 226 - Public API Exposure Hardening"));

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
check("no secret files changed", gitChangedNames([
  ".env",
  ".env.local",
  ".env.production",
  ".env.production.local",
  ".env.development.local",
]).length === 0);

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
  "app/api/dashboard/auth/login/route.ts",
  "app/api/dashboard/auth/logout/route.ts",
  "app/api/dashboard/auth/status/route.ts",
  "app/dashboard/networks/zodiac/page.tsx",
  "app/dashboard/networks/zodiac/dashboard-auth-system-decision/page.tsx",
  "lib/zodiac/aphrodite-dashboard-auth-system-decision.ts",
  "scripts/qa-aphrodite-dashboard-auth-system-decision.mjs",
  "scripts/qa-zodiac-dashboard.mjs",
  "docs/aphrodite-dashboard-auth-system-decision.md",
  "docs/aphrodite-package-reports/package-225.md",
]);
check("changed files limited to Package 225 auth decision layer", changedFiles.every((file) => allowedChanges.has(file)));

check("no hardcoded secret-looking values", !/(postgres(?:ql)?:\/\/|mysql:\/\/|mongodb(?:\+srv)?:\/\/|redis:\/\/|amqp:\/\/|https:\/\/api\.telegram\.org\/bot\d+:[A-Za-z0-9_-]+|\b\d{6,12}:[A-Za-z0-9_-]{30,}\b|(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{16,}|gh[pousr]_[A-Za-z0-9]{30,}|xox[baprs]-[A-Za-z0-9-]{20,}|AIza[0-9A-Za-z_-]{20,}|ya29\.[0-9A-Za-z_-]{20,}|SG\.[0-9A-Za-z_-]{16,}\.[0-9A-Za-z_-]{16,})/i.test(safetyBundle));
check("no Telegram API implementation", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(safetyBundle));
check("no Telegram payment handler implementation", !/pre_checkout|successful_payment|answerPreCheckoutQuery|createInvoiceLink/i.test(safetyBundle));
check("no BotFather action implementation", !/setChatMenuButton|setMyCommands|setWebhook|deleteWebhook/i.test(safetyBundle));
check("no active CTA implementation change", !/activeCtaLogicChanged:\s*true|activeCtaChanged:\s*true|sendAllowedNow=true|canCallTelegramApiNow=true/i.test(safetyBundle));
check("no production DB client implementation", !/new\s+PrismaClient\b|from ['"]@prisma\/client|prisma\.[a-zA-Z0-9_]+|postgres\s*\(|neon\s*\(|new\s+Pool\s*\(|new\s+Client\s*\(|createClient\s*\(/i.test(safetyBundle));
check("no DB write implementation", !/prisma\.[a-zA-Z0-9_]+\.(create|update|delete|upsert)|from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(|events\.insert|insert.*event/i.test(safetyBundle));
check("no payment or VIP implementation", !/from ['"]stripe|new Stripe\b|sendInvoice\s*\(|createInvoiceLink\s*\(|createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|allowed=true|productionPaymentAllowedNow=true|publicLaunchApproved:\s*true|ownerManualReviewRequired:\s*false/i.test(safetyBundle));
check("no external analytics implementation", !/analytics\.track|posthog|amplitude|gtag|GoogleAnalytics|sendEvent|trackEvent|navigator\.sendBeacon/i.test(safetyBundle));

console.log(`\nQA complete: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
