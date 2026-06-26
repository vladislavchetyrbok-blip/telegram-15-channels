#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  APHRODITE_TELEGRAM_CTA_ATTRIBUTION_READINESS_CLASSIFICATION,
  APHRODITE_TELEGRAM_CTA_ATTRIBUTION_READINESS_SAFETY_LABELS,
  APHRODITE_TELEGRAM_CTA_ATTRIBUTION_READINESS_TITLE,
  getAphroditeTelegramCtaAttributionReadiness,
} from "../lib/zodiac/aphrodite-telegram-cta-attribution-readiness.ts";

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

console.log("Старт QA: Telegram CTA Attribution Readiness...\n");

const modelPath = "../lib/zodiac/aphrodite-telegram-cta-attribution-readiness.ts";
const pagePath = "../app/dashboard/networks/zodiac/telegram-cta-attribution-readiness/page.tsx";
const docsPath = "../docs/aphrodite-telegram-cta-attribution-readiness.md";
const reportPath = "../docs/aphrodite-package-reports/package-184.md";
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
const readiness = getAphroditeTelegramCtaAttributionReadiness();

check("readiness model returns title", readiness.title === APHRODITE_TELEGRAM_CTA_ATTRIBUTION_READINESS_TITLE);
check("readiness classification returns", readiness.classification === APHRODITE_TELEGRAM_CTA_ATTRIBUTION_READINESS_CLASSIFICATION);
check("dimensions exist", readiness.dimensions.length >= 10);
check("source examples exist", readiness.sourceExamples.length >= 6);
check("safety boundaries exist", readiness.boundaries.length >= 7);
check("active CTA logic unchanged flag is false", readiness.activeCtaLogicChanged === false);
check("tracking enabled flag is false", readiness.trackingEnabledNow === false);
check("all attribution data is readiness-only", readiness.dimensions.every((item) => item.source === "readiness-only") && readiness.sourceExamples.every((item) => item.source === "readiness-only"));

for (const dimension of [
  "source channel",
  "sign",
  "language",
  "content type daily/weekly/monthly",
  "CTA type",
  "product target",
  "startapp param draft",
  "campaign key",
  "period key",
  "fallback route",
]) {
  check(`required attribution dimension exists: ${dimension}`, userFacingBundle.includes(dimension));
}

for (const sourceKey of [
  "tg_daily_aries",
  "tg_weekly_leo",
  "tg_monthly_2026_07_general",
  "tg_love_reading",
  "tg_compatibility",
  "tg_birth_matrix",
]) {
  check(`required source example exists: ${sourceKey}`, userFacingBundle.includes(sourceKey));
}

for (const label of APHRODITE_TELEGRAM_CTA_ATTRIBUTION_READINESS_SAFETY_LABELS) {
  check(`safety label exists: ${label}`, userFacingBundle.includes(label));
}

check("dashboard QA route key exists", dashboardQaSource.includes("telegramCtaAttributionReadiness"));
check("dashboard QA overview link exists", dashboardQaSource.includes("/dashboard/networks/zodiac/telegram-cta-attribution-readiness"));
check("page renders title from model", pageSource.includes("readiness.title") && userFacingBundle.includes(APHRODITE_TELEGRAM_CTA_ATTRIBUTION_READINESS_TITLE));
check("page renders classification from model", pageSource.includes("readiness.classification") && userFacingBundle.includes(APHRODITE_TELEGRAM_CTA_ATTRIBUTION_READINESS_CLASSIFICATION));
check("docs say active CTA unchanged", docsSource.includes("Активные CTA не изменены") || docsSource.includes("active CTA generation"));
check("docs say no tracking", docsSource.includes("Нет tracking") || docsSource.includes("no tracking"));
check("report says Package 184", reportSource.includes("Package 184"));
check("report says next package 185", reportSource.includes("Package 185"));

check("no DB write", !/from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(|events\.insert/i.test(implementationBundle));
check("no DB read", !/process\.env\.DATABASE_URL|getDb\s*\(|createClient\(|new Pool\(|drizzle\(|redis|upstash|from\([^)]*\)\.select\s*\(|\.select\s*\(/i.test(implementationBundle));
check("no external analytics API", !/analytics\.track\s*\(|posthog\s*\.|amplitude\s*\.|gtag\s*\(|GoogleAnalytics\s*\(|plausible\s*\(|mixpanel\s*\.|segment\.track\s*\(/i.test(implementationBundle));
check("no event sending", !/navigator\.sendBeacon\s*\(|fetch\(\s*["'][^"']*analytics|sendEvent\s*\(|trackEvent\s*\(|record[A-Za-z]*Event\s*\(/i.test(implementationBundle));
check("no Telegram API", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|answerPreCheckoutQuery\s*\(/i.test(implementationBundle));
check("no payment tracking", !/paymentTrackingEnabled\s*:\s*true|trackPayment\s*\(|recordPaymentIntent\s*\(|paymentIntentTracked/i.test(implementationBundle));
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
check("no DB schema/migration change", gitDiffNames(["prisma", "supabase", "migrations", "schema.prisma"]).filter((file) => /(^|\/)(prisma|supabase|migrations)(\/|$)|schema\.prisma$/i.test(file)).length === 0);
check("no workflows changed", gitDiffNames([".github/workflows"]).length === 0);
check("package.json not changed", gitDiffNames(["package.json"]).length === 0);
check("publish scripts not changed", gitDiffNames(["scripts/publish-zodiac-by-date.mjs", "scripts/publish-zodiac-weekly-by-week.mjs", "scripts/zodiac-telegram-publisher.mjs"]).length === 0);

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
