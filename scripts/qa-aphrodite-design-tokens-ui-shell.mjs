#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  APHRODITE_DESIGN_TOKENS_CLASSIFICATION,
  APHRODITE_DESIGN_TOKENS_SAFETY_LABELS,
  APHRODITE_DESIGN_TOKENS_TITLE,
  getAphroditeMiniAppDesignTokens,
} from "../lib/zodiac/aphrodite-design-tokens.ts";

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

console.log("Старт QA: Aphrodite Design Tokens & UI Shell Skeleton...\n");

const tokenPath = "../lib/zodiac/aphrodite-design-tokens.ts";
const shellPath = "../components/zodiac-mini-app/AphroditeMiniAppShell.tsx";
const cardPath = "../components/zodiac-mini-app/AphroditeSectionCard.tsx";
const ctaPath = "../components/zodiac-mini-app/AphroditePrimaryCta.tsx";
const pillPath = "../components/zodiac-mini-app/AphroditeStatusPill.tsx";
const pagePath = "../app/dashboard/networks/zodiac/design-tokens-ui-shell/page.tsx";
const docsPath = "../docs/aphrodite-design-tokens-ui-shell.md";
const reportPath = "../docs/aphrodite-package-reports/package-197.md";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";

for (const [label, path] of [
  ["tokens", tokenPath],
  ["shell", shellPath],
  ["section card", cardPath],
  ["primary cta", ctaPath],
  ["status pill", pillPath],
  ["dashboard page", pagePath],
  ["docs", docsPath],
  ["package report", reportPath],
]) {
  check(`${label} exists`, exists(path));
}

const tokenSource = exists(tokenPath) ? read(tokenPath) : "";
const shellSource = exists(shellPath) ? read(shellPath) : "";
const cardSource = exists(cardPath) ? read(cardPath) : "";
const ctaSource = exists(ctaPath) ? read(ctaPath) : "";
const pillSource = exists(pillPath) ? read(pillPath) : "";
const pageSource = exists(pagePath) ? read(pagePath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";
const implementationBundle = [tokenSource, shellSource, cardSource, ctaSource, pillSource, pageSource].join("\n");
const userFacingBundle = [tokenSource, pageSource, docsSource, reportSource].join("\n");
const tokens = getAphroditeMiniAppDesignTokens();

check("title exported", APHRODITE_DESIGN_TOKENS_TITLE === "Design Tokens & UI Shell Skeleton");
check("classification exported", tokens.classification === APHRODITE_DESIGN_TOKENS_CLASSIFICATION);
check("spacing scale exists", tokens.spacingScale.length >= 7);
check("radius scale exists", tokens.radiusScale.length >= 3);
check("card style exists", tokens.cardStyle.length >= 3);
check("text hierarchy exists", tokens.textHierarchy.length >= 5);
check("section rhythm exists", tokens.sectionRhythm.length >= 4);
check("CTA hierarchy exists", tokens.ctaHierarchy.length >= 3);
check("dark theme palette exists", Boolean(tokens.darkThemePalette.appBackground && tokens.darkThemePalette.roseAccent));
check("gradient usage rules exist", tokens.gradientUsageRules.length >= 4);
check("mobile max width exists", tokens.mobileMaxWidth === "28rem");
check("Telegram safe area notes exist", tokens.telegramSafeAreaNotes.length >= 4);

for (const label of APHRODITE_DESIGN_TOKENS_SAFETY_LABELS) {
  check(`safety label exists: ${label}`, userFacingBundle.includes(label));
}

for (const requiredText of [
  "spacing scale",
  "radius scale",
  "card style",
  "text hierarchy",
  "section rhythm",
  "CTA hierarchy",
  "safe dark theme palette references",
  "gradient usage rules",
  "mobile max width",
  "Telegram safe area notes",
]) {
  check(`required token docs exist: ${requiredText}`, docsSource.includes(requiredText) || userFacingBundle.includes(requiredText));
}

check("shell component export exists", /export function AphroditeMiniAppShell/.test(shellSource));
check("shell marker exists", shellSource.includes('data-aphrodite-ui-shell="package-197"'));
check("section card component export exists", /export function AphroditeSectionCard/.test(cardSource));
check("primary CTA component export exists", /export function AphroditePrimaryCta/.test(ctaSource));
check("primary CTA uses Next Link", ctaSource.includes("next/link") && ctaSource.includes("<Link"));
check("status pill component export exists", /export function AphroditeStatusPill/.test(pillSource));
check("dashboard page uses shell", pageSource.includes("AphroditeMiniAppShell"));
check("dashboard page uses section card", pageSource.includes("AphroditeSectionCard"));
check("dashboard page uses primary cta", pageSource.includes("AphroditePrimaryCta"));
check("dashboard page uses status pill", pageSource.includes("AphroditeStatusPill"));
check("dashboard QA route key exists", dashboardQaSource.includes("designTokensUiShell"));
check("dashboard QA overview link exists", dashboardQaSource.includes("/dashboard/networks/zodiac/design-tokens-ui-shell"));
check("report says Package 197", reportSource.includes("Package 197"));
check("report points to Package 198", reportSource.includes("Package 198"));

check("production launch flag false", tokens.safetyFlags.productionLaunchNow === false);
check("payment changed flag false", tokens.safetyFlags.paymentChangedNow === false);
check("vip unlock flag false", tokens.safetyFlags.vipUnlockNow === false);
check("telegram api flag false", tokens.safetyFlags.telegramApiNow === false);
check("database write flag false", tokens.safetyFlags.databaseWriteNow === false);
check("sends anything flag false", tokens.safetyFlags.sendsAnythingNow === false);

const liveRuntimeChanges = gitDiffNames([
  "app/miniapp",
  "app/compatibility",
  "app/birth-matrix",
  "components/ZodiacCompatibilityMiniApp.tsx",
  "components/ZodiacMysticSections.tsx",
  "components/ZodiacVipSections.tsx",
  "app/globals.css",
  "tailwind.config.ts",
]);
check("existing live Mini App runtime paths not changed", liveRuntimeChanges.length === 0);
check("no production launch implementation", !/startProductionLaunch\s*\(|runLaunch\s*\(|productionLaunchNow:\s*true|sendAllowedNow=true|canCallTelegramApiNow=true/i.test(implementationBundle));
check("no external analytics", !/analytics\.track|posthog|amplitude|gtag|GoogleAnalytics|sendEvent|trackEvent|navigator\.sendBeacon/i.test(implementationBundle));
check("no Telegram API", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(implementationBundle));
check("no DB write", !/from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(|events\.insert|insert.*event/i.test(implementationBundle));
check("no payment or VIP changes", !/sendInvoice\s*\(|createInvoiceLink\s*\(|paymentChangedNow:\s*true|createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|createsEntitlementNow=true|unlocksVipNow=true|grantsAccessNow=true|productionPaymentAllowedNow=true/i.test(implementationBundle));
check("no cron/workflow changes", gitDiffNames([".github/workflows", "vercel.json"]).length === 0);
check("publish scripts not changed", gitDiffNames(["scripts/publish-zodiac-by-date.mjs", "scripts/publish-zodiac-weekly-by-week.mjs", "scripts/zodiac-telegram-publisher.mjs", "scripts/publish-due.mjs", "scripts/publish-due-json.mjs"]).length === 0);
check("package.json not changed", gitDiffNames(["package.json"]).length === 0);
check("no DB schema/migration change", gitDiffNames(["prisma", "supabase", "migrations", "schema.prisma"]).filter((file) => /(^|\/)(prisma|supabase|migrations)(\/|$)|schema\.prisma$/i.test(file)).length === 0);

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
