#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

import { gitChangedNames } from "./lib/qa-git-scope.mjs";
import {
  APHRODITE_MYSTIC_CARDS_REDESIGN_ROUTE,
  APHRODITE_MYSTIC_CARDS_REDESIGN_TITLE,
  getAphroditeMysticCardsRedesign,
} from "../lib/zodiac/aphrodite-mystic-cards-redesign.ts";

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

function textFor(value) {
  return JSON.stringify(value).toLowerCase();
}

function gitDiff(rel) {
  try {
    return execFileSync("git", ["diff", "--unified=0", "HEAD", "--", rel], { encoding: "utf8" });
  } catch {
    return "__git_diff_failed__";
  }
}

console.log("Starting QA: Aphrodite Mystic Cards Redesign...\n");

const modelPath = "../lib/zodiac/aphrodite-mystic-cards-redesign.ts";
const dashboardPagePath = "../app/dashboard/networks/zodiac/mystic-cards-redesign/page.tsx";
const mysticSectionsPath = "../components/ZodiacMysticSections.tsx";
const mysticContentPath = "../lib/zodiac-mystic-content.ts";
const tarotSpreadVisualPath = "../components/zodiac-mini-app/TarotSpreadVisual.tsx";
const runeSpreadVisualPath = "../components/zodiac-mini-app/RuneSpreadVisual.tsx";
const docsPath = "../docs/aphrodite-mystic-cards-redesign.md";
const reportPath = "../docs/aphrodite-package-reports/package-241.md";
const dashboardPath = "../app/dashboard/networks/zodiac/page.tsx";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";

for (const [label, path] of [
  ["model", modelPath],
  ["dashboard page", dashboardPagePath],
  ["Mystic Cards flow file", mysticSectionsPath],
  ["Mystic Cards content/generation helper", mysticContentPath],
  ["Tarot spread visual", tarotSpreadVisualPath],
  ["Rune spread visual", runeSpreadVisualPath],
  ["docs", docsPath],
  ["package report", reportPath],
  ["dashboard navigation", dashboardPath],
  ["dashboard QA", dashboardQaPath],
]) {
  check(`${label} exists`, exists(path));
}

const modelSource = exists(modelPath) ? read(modelPath) : "";
const dashboardPageSource = exists(dashboardPagePath) ? read(dashboardPagePath) : "";
const mysticSectionsSource = exists(mysticSectionsPath) ? read(mysticSectionsPath) : "";
const mysticContentSource = exists(mysticContentPath) ? read(mysticContentPath) : "";
const tarotSpreadVisualSource = exists(tarotSpreadVisualPath) ? read(tarotSpreadVisualPath) : "";
const runeSpreadVisualSource = exists(runeSpreadVisualPath) ? read(runeSpreadVisualPath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const dashboardSource = exists(dashboardPath) ? read(dashboardPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";

const model = getAphroditeMysticCardsRedesign();
const liveBundle = [mysticSectionsSource, mysticContentSource, tarotSpreadVisualSource, runeSpreadVisualSource].join("\n");
const implementationBundle = [
  modelSource,
  dashboardPageSource,
  liveBundle,
  docsSource,
  reportSource,
  dashboardSource,
  dashboardQaSource,
].join("\n");
const safetyBundle = [modelSource, dashboardPageSource, mysticSectionsSource, docsSource, reportSource].join("\n");
const modelText = textFor(model);

check("title exported", model.title === APHRODITE_MYSTIC_CARDS_REDESIGN_TITLE);
check("route exported", model.route === APHRODITE_MYSTIC_CARDS_REDESIGN_ROUTE);
check("package number is 241", model.packageNumber === 241);
check("dashboard route uses readiness page", dashboardPageSource.includes("AphroditeReadinessPage"));
check("dashboard route linked from overview", dashboardSource.includes(APHRODITE_MYSTIC_CARDS_REDESIGN_ROUTE));
check("dashboard QA route exists", dashboardQaSource.includes("mysticCardsRedesign"));
check("docs/report exist", docsSource.includes("Package 241") && reportSource.includes("Package 241"));
check("publicLaunchApproved=false", model.publicLaunchApproved === false && implementationBundle.includes("publicLaunchApproved=false"));
check("ownerManualReviewRequired=true", model.ownerManualReviewRequired === true && implementationBundle.includes("ownerManualReviewRequired=true"));

for (const field of [
  "redesignedSections",
  "mysticCardSelectionPrinciples",
  "mysticRevealPrinciples",
  "cardStatePrinciples",
  "resultInterpretationPrinciples",
  "vipLockedPreviewPrinciples",
  "mobileBreakpoints",
  "telegramWebViewRules",
  "safetyBoundaries",
  "whatWasNotChanged",
  "nextPackageRecommendation",
]) {
  check(`model field exists: ${field}`, Object.prototype.hasOwnProperty.call(model, field));
}

for (const route of ["/miniapp", "/miniapp?startapp=mystic"]) {
  check(`live route documented: ${route}`, model.liveRoutes.includes(route) && implementationBundle.includes(route));
}

for (const marker of [
  'data-aphrodite-mystic-cards-redesign="package-241"',
  'data-aphrodite-mystic-card-daily="package-241"',
  'data-aphrodite-mystic-card-tarot="package-241"',
  'data-aphrodite-mystic-card-rune="package-241"',
  'data-aphrodite-mystic-card-selection="package-241"',
  'data-aphrodite-mystic-card-input="package-241"',
  'data-aphrodite-mystic-card-closed-state="package-241"',
  "data-aphrodite-mystic-card-selected-state",
  'data-aphrodite-mystic-card-empty-state="package-241"',
  'data-aphrodite-mystic-card-reveal="package-241"',
  'data-aphrodite-mystic-card-spread="package-241"',
  'data-aphrodite-mystic-card-result="package-241"',
  'data-aphrodite-mystic-card-state="package-241"',
  'data-aphrodite-mystic-card-vip-preview="package-241"',
  'data-aphrodite-mystic-card-preview-only="package-241"',
]) {
  check(`Mystic Cards visual marker exists: ${marker}`, liveBundle.includes(marker));
}

for (const preserved of [
  "TarotSpreadVisual",
  "RuneSpreadVisual",
  'data-tarot-spread-visual="true"',
  "data-tarot-card",
  'data-rune-spread-visual="true"',
  "data-rune-card",
]) {
  check(`existing smoke visual marker preserved: ${preserved}`, liveBundle.includes(preserved));
}

for (const primitive of [
  "AphroditeBadge",
  "AphroditeCard",
  "AphroditeMetricCard",
  "AphroditeMysticCardPreview",
  "AphroditeSectionHeader",
]) {
  check(`Aphrodite design primitive used: ${primitive}`, liveBundle.includes(primitive) || implementationBundle.includes(primitive));
}

for (const phrase of [
  "Mystic Cards flow",
  "closed-card",
  "selected-card",
  "revealed-card",
  "empty/not selected",
  "card meaning / interpretation",
  "daily / love / money / warning card types",
  "preview-only",
  "no active payment",
  "no real VIP unlock",
  "entitlement bypass",
  "Mystic Cards selection logic unchanged",
  "random/deterministic logic unchanged",
  "storage logic unchanged",
  "active CTA logic unchanged",
  "Compatibility flow not redesigned again",
  "Birth Matrix / Natal flow not redesigned again",
]) {
  check(`Mystic redesign phrase exists: ${phrase}`, implementationBundle.toLowerCase().includes(phrase.toLowerCase()) || modelText.includes(phrase.toLowerCase()));
}

for (const breakpoint of ["360px", "390px", "430px"]) {
  check(`mobile breakpoint exists: ${breakpoint}`, model.mobileBreakpoints.includes(breakpoint) && implementationBundle.includes(breakpoint));
}

for (const section of [
  "Mystic Cards flow in Mini App",
  "card selection",
  "reveal and result",
  "preview-only VIP / deeper reading locked state",
]) {
  check(`redesigned section documented: ${section}`, model.redesignedSections.some((item) => item.area === section) && implementationBundle.includes(section));
}

for (const unchanged of [
  "Mystic Cards selection logic unchanged",
  "random/deterministic logic unchanged",
  "storage logic unchanged",
  "Compatibility flow not redesigned again",
  "Birth Matrix / Natal flow not redesigned again",
  "active CTA logic unchanged",
]) {
  check(`unchanged scope documented: ${unchanged}`, model.whatWasNotChanged.some((item) => item.area === unchanged) && implementationBundle.includes(unchanged));
}

check("next package recommendation documented", model.nextPackageRecommendation === "Package 242 - VIP Locked Preview Redesign" && implementationBundle.includes("Package 242 - VIP Locked Preview Redesign"));

const mysticSectionsDiff = gitDiff("components/ZodiacMysticSections.tsx");
check("mystic sections diff readable", !mysticSectionsDiff.includes("__git_diff_failed__"));
check("generateDailyCard call/import not changed", !/^[+-].*(generateDailyCard,|function generateDailyCard|export function generateDailyCard)/m.test(mysticSectionsDiff));
check("generateTarotSpread call/import not changed", !/^[+-].*(generateTarotSpread,|function generateTarotSpread|export function generateTarotSpread)/m.test(mysticSectionsDiff));
check("generateRuneSpread call/import not changed", !/^[+-].*(generateRuneSpread,|function generateRuneSpread|export function generateRuneSpread)/m.test(mysticSectionsDiff));
check("buildTarotRetentionAction not changed", !/^[+-].*buildTarotRetentionAction/m.test(mysticSectionsDiff));
check("buildRuneRetentionAction not changed", !/^[+-].*buildRuneRetentionAction/m.test(mysticSectionsDiff));
check("tarotAnalyticsPayload not changed", !/^[+-].*tarotAnalyticsPayload/m.test(mysticSectionsDiff));
check("runeAnalyticsPayload not changed", !/^[+-].*runeAnalyticsPayload/m.test(mysticSectionsDiff));
check("Mystic Cards content/generation helper not changed", gitChangedNames(["lib/zodiac-mystic-content.ts"]).length === 0);
check("compatibility component not changed", gitChangedNames(["components/ZodiacCompatibilityMiniApp.tsx"]).length === 0);
check("birth matrix route changes limited to Package 242 locked preview scope", gitChangedNames(["app/birth-matrix/BirthMatrixClient.tsx"]).every((file) => file === "app/birth-matrix/BirthMatrixClient.tsx"));
check("VIP sections changes limited to Package 242 locked preview scope", gitChangedNames(["components/ZodiacVipSections.tsx"]).every((file) => file === "components/ZodiacVipSections.tsx"));

check("no production launch flag", model.safetyFlags.productionLaunchDone === false);
check("no Telegram API flag", model.safetyFlags.telegramApiUsed === false);
check("no messages flag", model.safetyFlags.messagesSent === false);
check("no BotFather change flag", model.safetyFlags.botFatherChanged === false);
check("no active CTA logic change flag", model.safetyFlags.activeCtaLogicChanged === false);
check("no app flow change flag", model.safetyFlags.appFlowsChanged === false);
check("Mystic Cards selection logic unchanged flag", model.safetyFlags.mysticCardsSelectionLogicChanged === false);
check("random/deterministic logic unchanged flag", model.safetyFlags.randomDeterministicLogicChanged === false);
check("storage logic unchanged flag", model.safetyFlags.storageLogicChanged === false);
check("compatibility flow not redesigned again flag", model.safetyFlags.compatibilityFlowRedesignedAgain === false);
check("Birth Matrix / Natal flow not redesigned again flag", model.safetyFlags.birthMatrixNatalFlowRedesignedAgain === false);
check("no DB write flag", model.safetyFlags.databaseWriteAdded === false);
check("no external analytics flag", model.safetyFlags.externalAnalyticsAdded === false);
check("no payment flag", model.safetyFlags.paymentAdded === false);
check("no VIP unlock flag", model.safetyFlags.vipUnlockAdded === false);
check("no cron/workflow/publish flag", model.safetyFlags.cronWorkflowPublishChanged === false);
check("no secrets flag", model.safetyFlags.secretsAdded === false);
check("no production DB connected flag", model.safetyFlags.productionDbConnected === false);

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
  ".env.example",
]);
const allowedChanges = new Set([
  "app/birth-matrix/BirthMatrixClient.tsx",
  "app/dashboard/networks/zodiac/page.tsx",
  "app/dashboard/networks/zodiac/mystic-cards-redesign/page.tsx",
  "app/dashboard/networks/zodiac/vip-locked-preview-redesign/page.tsx",
  "app/miniapp/page.tsx",
  "app/vip-compatibility-report/VipCompatibilityReportClient.tsx",
  "app/vip-preview/page.tsx",
  "components/ZodiacMysticSections.tsx",
  "components/ZodiacVipSections.tsx",
  "components/zodiac-mini-app/AphroditeHomeScreen.tsx",
  "components/zodiac-mini-app/ResultCards.tsx",
  "components/zodiac-mini-app/aphrodite-design-system/AphroditeLockedPreviewCard.tsx",
  "components/zodiac-mini-app/aphrodite-design-system/index.ts",
  "lib/zodiac/aphrodite-mystic-cards-redesign.ts",
  "lib/zodiac/aphrodite-vip-locked-preview-redesign.ts",
  "scripts/qa-aphrodite-mystic-cards-redesign.mjs",
  "scripts/qa-aphrodite-birth-matrix-natal-flow-redesign.mjs",
  "scripts/qa-aphrodite-vip-locked-preview-redesign.mjs",
  "scripts/qa-zodiac-dashboard.mjs",
  "docs/aphrodite-mystic-cards-redesign.md",
  "docs/aphrodite-vip-locked-preview-redesign.md",
  "docs/aphrodite-package-reports/package-241.md",
  "docs/aphrodite-package-reports/package-242.md",
]);
check("git scope helper returned real change data", !changedFiles.includes("__git_diff_failed__"));
check("changed files limited to Package 241 visual/readiness scope", changedFiles.every((file) => allowedChanges.has(file)));
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
check("no env or secret files changed", gitChangedNames([".env", ".env.local", ".env.production", ".env.example"]).length === 0);

check("no hardcoded secret-looking values", !/(postgres(?:ql)?:\/\/|mysql:\/\/|mongodb(?:\+srv)?:\/\/|redis:\/\/|amqp:\/\/|https:\/\/api\.telegram\.org\/bot\d+:[A-Za-z0-9_-]+|\b\d{6,12}:[A-Za-z0-9_-]{30,}\b|(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{16,}|gh[pousr]_[A-Za-z0-9]{30,}|xox[baprs]-[A-Za-z0-9-]{20,}|AIza[0-9A-Za-z_-]{20,}|ya29\.[0-9A-Za-z_-]{20,}|SG\.[0-9A-Za-z_-]{16,})/i.test(safetyBundle));
check("no Telegram API implementation", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(safetyBundle));
check("no Telegram payment handler implementation", !/pre_checkout|successful_payment|answerPreCheckoutQuery|createInvoiceLink/i.test(safetyBundle));
check("no BotFather action implementation", !/setChatMenuButton|setMyCommands|setWebhook|deleteWebhook/i.test(safetyBundle));
check("no active CTA implementation change", !/activeCtaLogicChanged:\s*true|activeCtaChanged:\s*true|sendAllowedNow=true|canCallTelegramApiNow=true/i.test(safetyBundle));
check("no production DB client implementation", !/new\s+PrismaClient\b|from ['"]@prisma\/client|postgres\s*\(|neon\s*\(|new\s+Pool\s*\(|new\s+Client\s*\(/i.test(safetyBundle));
check("no DB write implementation", !/prisma\.[a-zA-Z0-9_]+\.(create|update|delete|upsert)|from\([^)]*\)\.(insert|update|delete|upsert)\(|supabase\.[a-zA-Z0-9_]+\.(insert|update|delete|upsert)|events\.insert/i.test(safetyBundle));
check("no payment or VIP implementation", !/from ['"]stripe|new Stripe\b|sendInvoice\s*\(|createInvoiceLink\s*\(|createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|allowed=true|productionPaymentAllowedNow=true|publicLaunchApproved:\s*true|ownerManualReviewRequired:\s*false/i.test(safetyBundle));
check("no external analytics implementation", !/posthog|amplitude|gtag|GoogleAnalytics|navigator\.sendBeacon/i.test(safetyBundle));

console.log(`\nAphrodite Mystic Cards Redesign QA complete: ${passed} passed, ${failed} failed.`);

if (failed > 0) {
  process.exit(1);
}
