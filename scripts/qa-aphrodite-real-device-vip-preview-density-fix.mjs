#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

import { getAphroditeRealDeviceVipPreviewDensityFix } from "../lib/zodiac/aphrodite-real-device-vip-preview-density-fix.ts";
import { gitChangedNames } from "./lib/qa-git-scope.mjs";

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

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function gitDiff(paths) {
  try {
    return execFileSync("git", ["diff", "--unified=0", "HEAD", "--", ...paths], { encoding: "utf8" });
  } catch {
    return "__git_diff_failed__";
  }
}

function countMatches(source, pattern) {
  return (source.match(pattern) ?? []).length;
}

console.log("Starting QA: Real Device VIP Preview Density Fix...\n");

const model = getAphroditeRealDeviceVipPreviewDensityFix();
const modelPath = "../lib/zodiac/aphrodite-real-device-vip-preview-density-fix.ts";
const pagePath = "../app/dashboard/networks/zodiac/real-device-vip-preview-density-fix/page.tsx";
const docsPath = "../docs/aphrodite-real-device-vip-preview-density-fix.md";
const reportPath = "../docs/aphrodite-package-reports/package-303.md";
const dashboardPath = "../app/dashboard/networks/zodiac/page.tsx";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";
const miniappSmokePath = "./smoke-zodiac-mini-app.mjs";

for (const [label, path] of [
  ["model", modelPath],
  ["dashboard page", pagePath],
  ["docs", docsPath],
  ["package report", reportPath],
  ["dashboard navigation", dashboardPath],
  ["dashboard QA", dashboardQaPath],
  ["miniapp smoke QA", miniappSmokePath],
]) {
  check(`${label} exists`, exists(path));
}

const modelSource = read(modelPath);
const pageSource = read(pagePath);
const docsSource = read(docsPath);
const reportSource = read(reportPath);
const dashboardSource = read(dashboardPath);
const dashboardQaSource = read(dashboardQaPath);
const miniappSmokeSource = read(miniappSmokePath);
const vipSectionsSource = read("../components/ZodiacVipSections.tsx");
const compatibilitySource = read("../components/ZodiacCompatibilityMiniApp.tsx");
const vipPreviewPageSource = read("../app/vip-preview/page.tsx");
const vipCompatibilityPageSource = read("../app/vip-compatibility-report/VipCompatibilityReportClient.tsx") + "\n" + read("../app/vip-compatibility-report/page.tsx");
const miniappPageSource = read("../app/miniapp/page.tsx");
const homeScreenSource = read("../components/zodiac-mini-app/AphroditeHomeScreen.tsx");
const headerSource = read("../components/zodiac-mini-app/MiniAppHeader.tsx");
const featureTabsSource = read("../components/zodiac-mini-app/feature-tabs.ts");
const lockedCardSource = read("../components/zodiac-mini-app/aphrodite-design-system/AphroditeLockedPreviewCard.tsx");
const resultCardsSource = read("../components/zodiac-mini-app/ResultCards.tsx");
const primitivesSource = read("../components/zodiac-mini-app/ui-primitives.tsx");

const packageBundle = [modelSource, pageSource, docsSource, reportSource].join("\n");
const liveUiBundle = [
  vipSectionsSource,
  compatibilitySource,
  vipPreviewPageSource,
  vipCompatibilityPageSource,
  miniappPageSource,
  homeScreenSource,
  headerSource,
  featureTabsSource,
  lockedCardSource,
  resultCardsSource,
  primitivesSource,
  miniappSmokeSource,
].join("\n");
const diffBundle = gitDiff([
  "app",
  "components",
  "lib/zodiac/aphrodite-real-device-vip-preview-density-fix.ts",
  "docs/aphrodite-real-device-vip-preview-density-fix.md",
  "docs/aphrodite-package-reports/package-303.md",
  "scripts/qa-aphrodite-real-device-vip-preview-density-fix.mjs",
  "scripts/qa-zodiac-dashboard.mjs",
  "scripts/smoke-zodiac-mini-app.mjs",
]);

check("title matches", model.title === "Real Device VIP Preview Density Fix");
check("route matches", model.route === "/dashboard/networks/zodiac/real-device-vip-preview-density-fix");
check("package number is 303", model.packageNumber === 303);
check("current main head recorded", model.currentMainHead === "d15b0c85fe90e8bfea2e18d9c5dfb872c2570fe0");
check("dashboard page uses readiness page", pageSource.includes("AphroditeReadinessPage"));
check("dashboard nav link exists", dashboardSource.includes(model.route));
check("dashboard QA route exists", dashboardQaSource.includes("realDeviceVipPreviewDensityFix"));
check("docs/report mention Package 303", docsSource.includes("Package 303") && reportSource.includes("Package 303"));

check("owner screenshot issues documented", Array.isArray(model.ownerScreenshotIssues) && model.ownerScreenshotIssues.length >= 2 && packageBundle.includes("ownerScreenshotIssues"));
check("VIP preview density rules documented", Array.isArray(model.vipPreviewDensityRules) && model.vipPreviewDensityRules.length >= 2 && packageBundle.includes("vipPreviewDensityRules"));
check("compact day card rules documented", Array.isArray(model.compactDayCardRules) && model.compactDayCardRules.length >= 2 && packageBundle.includes("compactDayCardRules"));
check("Russian preview copy documented", Array.isArray(model.russianPreviewCopyRules) && model.russianPreviewCopyRules.length >= 2 && packageBundle.includes("russianPreviewCopyRules"));
check("affected screens documented", Array.isArray(model.affectedScreens) && model.affectedScreens.some((item) => item.area.includes("/miniapp?startapp=vip")));
check("repeated copy removal documented", model.repeatedCopyRemoved.removedFromEveryDayCard === true && model.repeatedCopyRemoved.shownOnceNearResult === true);

check("VIP preview copy is Russian in live UI", liveUiBundle.includes("VIP превью") && liveUiBundle.includes("Превью до") && liveUiBundle.includes('value="превью"'));
check("old VIP preview hot-path copy removed", !liveUiBundle.includes("VIP preview") && !liveUiBundle.includes("Preview до") && !liveUiBundle.includes("Показать preview"));
check("locked scope copy exists", liveUiBundle.includes("Показана короткая версия. Полный отчёт закрыт. Оплата не активна."));
check("first five day preview exists", vipSectionsSource.includes("days.slice(0, 5)") && compatibilitySource.includes("days.slice(0, 5)"));
check("remaining days compact rows exist", vipSectionsSource.includes("days.slice(5, 30)") && compatibilitySource.includes("days.slice(5, 30)") && liveUiBundle.includes("Остальные дни · компактно"));
check("compact day card text excludes full fields", !vipSectionsSource.includes("Инсайт пары: {day.coupleInsight}") && !compatibilitySource.includes('label="Инсайт пары" text={day.coupleInsight}'));
check("repeated disclaimer not rendered in every day card", countMatches(liveUiBundle, /\{day\.softDisclaimer\}/g) === 0 && countMatches(liveUiBundle, /sharedDisclaimer/g) >= 2);
check("VIP preview panels are clamped", primitivesSource.includes("line-clamp-3"));

check("publicLaunchApproved=false", model.publicLaunchApproved === false && packageBundle.includes("publicLaunchApproved=false"));
check("ownerManualReviewRequired=true", model.ownerManualReviewRequired === true && packageBundle.includes("ownerManualReviewRequired=true"));
check("blockers remain open", model.blockersRemainOpen === true && packageBundle.includes("blockersRemainOpen"));
check("next package documented", packageBundle.includes(model.nextPackageRecommendation));

check("no production launch flag", model.safetyFlags.productionLaunchDone === false);
check("no Telegram API flag", model.safetyFlags.telegramApiUsed === false);
check("no messages flag", model.safetyFlags.messagesSent === false);
check("no BotFather flag", model.safetyFlags.botFatherChanged === false);
check("no payment flag", model.safetyFlags.paymentAdded === false);
check("no VIP unlock flag", model.safetyFlags.vipUnlockAdded === false);
check("no entitlement bypass flag", model.safetyFlags.entitlementBypassAdded === false);
check("no DB write flag", model.safetyFlags.databaseWriteAdded === false);
check("no external analytics flag", model.safetyFlags.externalAnalyticsAdded === false);
check("no cron/workflow flag", model.safetyFlags.cronWorkflowChanged === false);
check("no secrets flag", model.safetyFlags.secretsAdded === false);
check("no .env.local committed flag", model.safetyFlags.envLocalCommitted === false);

const riskyChangedFiles = gitChangedNames([
  ".github",
  "vercel.json",
  "scripts/publish-zodiac-by-date.mjs",
  "scripts/publish-zodiac-weekly-by-week.mjs",
  "scripts/zodiac-telegram-publisher.mjs",
  "scripts/publish-due.mjs",
  "scripts/publish-due-json.mjs",
  "package.json",
  "prisma",
  "supabase",
  "migrations",
  "schema.prisma",
  ".env",
  ".env.local",
  ".env.production",
]);
check("no workflow/cron/package/db/env files changed", riskyChangedFiles.length === 0);
if (riskyChangedFiles.length) {
  console.log("Unexpected risky changed files:", riskyChangedFiles.join(", "));
}

check("no .env.local committed", git(["ls-files", ".env.local"]) === "");
check("no Telegram API/send code added", !/^\+.*(api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\()/im.test(diffBundle));
check("no BotFather automation added", !/^\+.*(setChatMenuButton|setMyCommands|setWebhook|deleteWebhook|answerWebAppQuery)/im.test(diffBundle));
check("no payment added", !/^\+.*(from ['"]stripe|new Stripe\b|sendInvoice\s*\(|createInvoiceLink\s*\(|paymentAdded:\s*true)/im.test(diffBundle));
check("no VIP unlock added", !/^\+.*(createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|vipUnlockAdded:\s*true|productionPaymentAllowedNow=true)/im.test(diffBundle));
check("no entitlement bypass added", !/^\+.*(entitlementBypassAdded:\s*true|allowed=true|bypassEntitlement|skipEntitlement)/im.test(diffBundle));
check("no DB write added", !/^\+.*(prisma\.[a-zA-Z0-9_]+\.(create|update|delete|upsert)|from\([^)]*\)\.(insert|update|delete|upsert)\(|supabase\.[a-zA-Z0-9_]+\.(insert|update|delete|upsert)|events\.insert)/im.test(diffBundle));
check("no real secrets added", !/^\+.*(postgres(?:ql)?:\/\/|mysql:\/\/|mongodb(?:\+srv)?:\/\/|redis:\/\/|amqp:\/\/|https:\/\/api\.telegram\.org\/bot\d+:[A-Za-z0-9_-]+|\b\d{6,12}:[A-Za-z0-9_-]{30,}\b|(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{16,}|gh[pousr]_[A-Za-z0-9]{30,}|xox[baprs]-[A-Za-z0-9-]{20,}|AIza[0-9A-Za-z_-]{20,}|ya29\.[0-9A-Za-z_-]{20,}|SG\.[0-9A-Za-z_-]{16,})/im.test(diffBundle));
check("launch flags not approved", !/^\+.*(publicLaunchApproved:\s*true|ownerManualReviewRequired:\s*false|readyForProductionLaunch:\s*true|readyForLaunch:\s*true)/im.test(diffBundle));
check("no external analytics added", !/^\+.*(posthog|amplitude|gtag|GoogleAnalytics|navigator\.sendBeacon)/im.test(diffBundle));

console.log(`\nReal Device VIP Preview Density Fix QA complete: ${passed} passed, ${failed} failed.`);

if (failed > 0) {
  process.exit(1);
}
