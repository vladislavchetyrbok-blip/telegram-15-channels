#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  APHRODITE_RETURN_JOURNEY_CTA_READINESS_CLASSIFICATION,
  APHRODITE_RETURN_JOURNEY_CTA_READINESS_SAFETY_LABELS,
  APHRODITE_RETURN_JOURNEY_CTA_READINESS_TITLE,
  getAphroditeReturnJourneyCtaReadiness,
} from "../lib/zodiac/aphrodite-return-journey-cta-readiness.ts";

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

console.log("Старт QA: Return Journey CTA Readiness...\n");

const modelPath = "../lib/zodiac/aphrodite-return-journey-cta-readiness.ts";
const pagePath = "../app/dashboard/networks/zodiac/return-journey-cta-readiness/page.tsx";
const docsPath = "../docs/aphrodite-return-journey-cta-readiness.md";
const reportPath = "../docs/aphrodite-package-reports/package-188.md";
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
const readiness = getAphroditeReturnJourneyCtaReadiness();

check("model returns title", readiness.title === APHRODITE_RETURN_JOURNEY_CTA_READINESS_TITLE);
check("model returns classification", readiness.classification === APHRODITE_RETURN_JOURNEY_CTA_READINESS_CLASSIFICATION);
check("return paths exist", readiness.returnPaths.length >= 11);
check("safety boundaries exist", readiness.boundaries.length >= 9);
check("active CTA flag false", readiness.activeCtaLogicChangedNow === false);
check("tracking flag false", readiness.trackingEnabledNow === false);
check("telegram api flag false", readiness.telegramApiNow === false);
check("message sending flag false", readiness.messageSendingNow === false);
check("database write flag false", readiness.databaseWriteNow === false);
check("external analytics flag false", readiness.externalAnalyticsNow === false);
check("payment tracking flag false", readiness.paymentTrackingNow === false);
check("vip unlock flag false", readiness.vipUnlockNow === false);
check("all paths readiness-only inactive", readiness.returnPaths.every((path) => path.activeNow === false && path.activeNowClassification === "readiness-only"));
check("all paths remain free", readiness.returnPaths.every((path) => path.mustRemainFree === true));

for (const source of [
  "daily horoscope → Mini App",
  "weekly horoscope → weekly module / Mini App",
  "monthly horoscope → monthly module / Mini App",
  "Telegram channel → Love Reading preview",
  "Telegram channel → Compatibility",
  "Telegram channel → Birth Matrix",
  "Mini App home → Love Reading",
  "Mini App home → Compatibility",
  "locked teaser → free preview fallback",
  "guard denied → free preview fallback",
  "saved report future → report detail future",
]) {
  check(`required return path exists: ${source}`, readiness.returnPaths.some((path) => path.source === source) && userFacingBundle.includes(source));
}

check("daily return path exists", readiness.returnPaths.some((path) => path.id === "daily-horoscope-to-miniapp"));
check("weekly return path exists", readiness.returnPaths.some((path) => path.id === "weekly-horoscope-to-weekly-module"));
check("monthly return path exists", readiness.returnPaths.some((path) => path.id === "monthly-horoscope-to-monthly-module"));
check("Telegram-to-Mini-App paths exist", readiness.returnPaths.filter((path) => path.source.startsWith("Telegram channel")).length >= 3);
check("fallback path exists", readiness.returnPaths.some((path) => path.source === "locked teaser → free preview fallback" && path.fallbackRoute === "/miniapp/love-reading-preview"));
check("guard denied fallback path exists", readiness.returnPaths.some((path) => path.source === "guard denied → free preview fallback" && path.fallbackRoute === "/miniapp/love-reading-preview"));

for (const field of [
  "source",
  "targetRoute",
  "productTarget",
  "fallbackRoute",
  "safeCopy",
  "futureStartAppParam",
  "attributionKey",
  "mustRemainFree",
  "activeNow",
  "activeNowClassification",
  "ownerReviewRequired",
]) {
  check(`CTA readiness field exists: ${field}`, userFacingBundle.includes(field));
}

for (const label of APHRODITE_RETURN_JOURNEY_CTA_READINESS_SAFETY_LABELS) {
  check(`safety label exists: ${label}`, userFacingBundle.includes(label));
}

check("dashboard QA route key exists", dashboardQaSource.includes("returnJourneyCtaReadiness"));
check("dashboard QA overview link exists", dashboardQaSource.includes("/dashboard/networks/zodiac/return-journey-cta-readiness"));
check("page renders title from model", pageSource.includes("readiness.title") && userFacingBundle.includes(APHRODITE_RETURN_JOURNEY_CTA_READINESS_TITLE));
check("page renders classification from model", pageSource.includes("readiness.classification") && userFacingBundle.includes(APHRODITE_RETURN_JOURNEY_CTA_READINESS_CLASSIFICATION));
check("docs say active CTA unchanged", docsSource.includes("Active CTA не изменены") || docsSource.includes("No active CTA generation change"));
check("report says Package 188", reportSource.includes("Package 188"));
check("report says next package 189", reportSource.includes("Package 189"));

check("no active CTA generation files changed", gitDiffNames([
  "scripts/zodiac-telegram-publisher.mjs",
  "scripts/publish-zodiac-by-date.mjs",
  "scripts/publish-zodiac-weekly-by-week.mjs",
  "scripts/publish-zodiac-navigation.mjs",
  "scripts/publish-zodiac-navigation-all.mjs",
  "scripts/publish-zodiac-compatibility.mjs",
  "app/miniapp",
  "app/compatibility",
  "app/birth-matrix",
  "components/ZodiacCompatibilityMiniApp.tsx",
  "components/ZodiacMysticSections.tsx",
  "components/ZodiacVipSections.tsx",
  "components/zodiac-mini-app",
]).length === 0);
check("no Telegram API", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(implementationBundle));
check("no external analytics", !/analytics\.track\s*\(|posthog\s*\.|amplitude\s*\.|gtag\s*\(|GoogleAnalytics\s*\(|plausible\s*\(|mixpanel\s*\.|segment\.track\s*\(|navigator\.sendBeacon\s*\(/i.test(implementationBundle));
check("no DB write", !/from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(|events\.insert|insert.*event/i.test(implementationBundle));
check("no payment or VIP changes", !/paymentTrackingEnabled\s*:\s*true|trackPayment\s*\(|recordPaymentIntent\s*\(|createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|createsEntitlementNow=true|unlocksVipNow=true|grantsAccessNow=true|productionPaymentAllowedNow=true/i.test(implementationBundle));
check("no cron/workflow changes", gitDiffNames([".github/workflows"]).length === 0);
check("publish scripts not changed", gitDiffNames(["scripts/publish-zodiac-by-date.mjs", "scripts/publish-zodiac-weekly-by-week.mjs", "scripts/zodiac-telegram-publisher.mjs", "scripts/publish-due.mjs", "scripts/publish-due-json.mjs"]).length === 0);
check("package.json not changed", gitDiffNames(["package.json"]).length === 0);
check("no DB schema/migration change", gitDiffNames(["prisma", "supabase", "migrations", "schema.prisma"]).filter((file) => /(^|\/)(prisma|supabase|migrations)(\/|$)|schema\.prisma$/i.test(file)).length === 0);

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
