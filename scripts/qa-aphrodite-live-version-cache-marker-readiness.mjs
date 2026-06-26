#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

import {
  APHRODITE_LIVE_VERSION_CACHE_MARKER_READINESS_CLASSIFICATION,
  APHRODITE_LIVE_VERSION_CACHE_MARKER_READINESS_SAFETY_LABELS,
  APHRODITE_LIVE_VERSION_CACHE_MARKER_READINESS_TITLE,
  APHRODITE_VISUAL_VERSION_MARKER_ATTRIBUTE,
  APHRODITE_VISUAL_VERSION_MARKER_VALUE,
  getAphroditeLiveVersionCacheMarkerReadiness,
} from "../lib/zodiac/aphrodite-live-version-cache-marker-readiness.ts";

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

console.log("Старт QA: Live Version & Cache Marker Readiness...\n");

const modelPath = "../lib/zodiac/aphrodite-live-version-cache-marker-readiness.ts";
const pagePath = "../app/dashboard/networks/zodiac/live-version-cache-marker-readiness/page.tsx";
const docsPath = "../docs/aphrodite-live-version-cache-marker-readiness.md";
const reportPath = "../docs/aphrodite-package-reports/package-210.md";
const dashboardPath = "../app/dashboard/networks/zodiac/page.tsx";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";

for (const [label, path] of [
  ["model", modelPath],
  ["dashboard", pagePath],
  ["docs", docsPath],
  ["package report", reportPath],
  ["dashboard navigation", dashboardPath],
  ["dashboard QA", dashboardQaPath],
]) {
  check(`${label} существует`, exists(path));
}

const modelSource = exists(modelPath) ? read(modelPath) : "";
const pageSource = exists(pagePath) ? read(pagePath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const dashboardSource = exists(dashboardPath) ? read(dashboardPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";
const model = getAphroditeLiveVersionCacheMarkerReadiness();
const implementationBundle = [modelSource, pageSource, docsSource, reportSource, dashboardSource, dashboardQaSource].join("\n");
const safetyBundle = [modelSource, pageSource, docsSource, reportSource].join("\n");

check("title exported", model.title === APHRODITE_LIVE_VERSION_CACHE_MARKER_READINESS_TITLE);
check("classification exported", model.classification === APHRODITE_LIVE_VERSION_CACHE_MARKER_READINESS_CLASSIFICATION);
check("package number is 210", model.packageNumber === 210);
check("dashboard route linked from overview", dashboardSource.includes("/dashboard/networks/zodiac/live-version-cache-marker-readiness"));
check("dashboard QA route exists", dashboardQaSource.includes("liveVersionCacheMarkerReadiness"));
check("dashboard QA asserts title", dashboardQaSource.includes("Live Version"));
check("dashboard-only marker attribute", model.dashboardOnlyMarker.attribute === APHRODITE_VISUAL_VERSION_MARKER_ATTRIBUTE);
check("dashboard-only marker value", model.dashboardOnlyMarker.value === APHRODITE_VISUAL_VERSION_MARKER_VALUE);
check("dashboard page renders marker attribute", pageSource.includes("data-aphrodite-visual-version"));
check("marker scope is dashboard-only", model.dashboardOnlyMarker.scope === "dashboard-readiness-only");

for (const label of APHRODITE_LIVE_VERSION_CACHE_MARKER_READINESS_SAFETY_LABELS) {
  check(`safety label exists: ${label}`, implementationBundle.includes(label));
}

for (const required of [
  "source commit marker",
  "live HTML marker",
  "route-specific marker",
  "/miniapp marker/check documented",
  "/birth-matrix marker/check documented",
  "/compatibility marker/check documented",
  "Telegram WebView cache diagnosis",
  "browser cache-buster diagnosis",
  "Vercel deployment check notes",
  "stale build symptoms",
  "data-aphrodite-visual-version=\"v1-visual-polish\"",
]) {
  check(`readiness item exists: ${required}`, implementationBundle.includes(required));
}

check("/miniapp marker/check exists or documented", model.routeMarkers.some((route) => route.route === "/miniapp" && route.expectedMarkerStrategy.includes("/miniapp marker/check documented")));
check("/birth-matrix marker/check exists or documented", model.routeMarkers.some((route) => route.route === "/birth-matrix" && route.expectedMarkerStrategy.includes("/birth-matrix marker/check documented")));
check("/compatibility marker/check exists or documented", model.routeMarkers.some((route) => route.route === "/compatibility" && route.expectedMarkerStrategy.includes("/compatibility marker/check documented")));
check("cache-buster check exists", implementationBundle.includes("cache-buster query check") || implementationBundle.includes("browser cache-buster diagnosis"));
check("version marker plan exists", model.markerChecks.length >= 4);
check("live HTML marker documented", model.markerChecks.some((check) => check.title === "live HTML marker"));
check("next package is 211", model.nextRecommendedPackage.includes("Package 211"));
check("docs say Package 210", docsSource.includes("Package 210"));
check("report says Package 210", reportSource.includes("Package 210"));
check("report keeps Package 211 not started", reportSource.includes("Package 211 не начат"));

check("no live Mini App source files changed", gitDiffNames([
  "app/miniapp",
  "app/birth-matrix",
  "app/compatibility",
  "components/ZodiacCompatibilityMiniApp.tsx",
  "components/ZodiacMysticSections.tsx",
  "components/zodiac-mini-app/ZodiacDateInput.tsx",
]).length === 0);
check("no workflow/deploy setting change", gitDiffNames([".github/workflows", "vercel.json"]).length === 0);
check("publish scripts not changed", gitDiffNames([
  "scripts/publish-zodiac-by-date.mjs",
  "scripts/publish-zodiac-weekly-by-week.mjs",
  "scripts/zodiac-telegram-publisher.mjs",
  "scripts/publish-due.mjs",
  "scripts/publish-due-json.mjs",
]).length === 0);
check("package.json not changed", gitDiffNames(["package.json"]).length === 0);
check("no DB schema/migration change", gitDiffNames(["prisma", "supabase", "migrations", "schema.prisma"]).filter((file) => /(^|\/)(prisma|supabase|migrations)(\/|$)|schema\.prisma$/i.test(file)).length === 0);

const scriptChanges = gitDiffNames(["scripts"]);
const allowedScriptChanges = new Set([
  "scripts/qa-aphrodite-live-version-cache-marker-readiness.mjs",
  "scripts/qa-zodiac-dashboard.mjs",
]);
check("script changes limited to Package 210 QA/dashboard QA", scriptChanges.every((file) => allowedScriptChanges.has(file)));

check("no Telegram API implementation", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(safetyBundle));
check("no BotFather API modification", !/setChatMenuButton|setMyCommands|setWebhook|deleteWebhook/i.test(safetyBundle));
check("no DB write implementation", !/from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(|events\.insert|insert.*event/i.test(safetyBundle));
check("no payment or VIP implementation", !/from ['"]stripe|new Stripe\b|sendInvoice\s*\(|createInvoiceLink\s*\(|successful_payment|pre_checkout_query|answerPreCheckoutQuery|createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|allowed=true|productionPaymentAllowedNow=true|publicLaunchApproved=true/i.test(safetyBundle));
check("no external analytics implementation", !/analytics\.track|posthog|amplitude|gtag|GoogleAnalytics|sendEvent|trackEvent|navigator\.sendBeacon/i.test(safetyBundle));

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
