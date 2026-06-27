#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

import { gitChangedNames } from "./lib/qa-git-scope.mjs";
import {
  APHRODITE_COMPATIBILITY_FLOW_REDESIGN_ROUTE,
  APHRODITE_COMPATIBILITY_FLOW_REDESIGN_TITLE,
  getAphroditeCompatibilityFlowRedesign,
} from "../lib/zodiac/aphrodite-compatibility-flow-redesign.ts";

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

console.log("Starting QA: Aphrodite Compatibility Flow Redesign...\n");

const modelPath = "../lib/zodiac/aphrodite-compatibility-flow-redesign.ts";
const dashboardPagePath = "../app/dashboard/networks/zodiac/compatibility-flow-redesign/page.tsx";
const liveCompatibilityPath = "../components/ZodiacCompatibilityMiniApp.tsx";
const wizardControlsPath = "../components/zodiac-mini-app/WizardControls.tsx";
const resultCardsPath = "../components/zodiac-mini-app/ResultCards.tsx";
const zodiacDateInputPath = "../components/zodiac-mini-app/ZodiacDateInput.tsx";
const dateRangePath = "../lib/zodiac-birth-date-range.ts";
const dateInputHelperPath = "../lib/zodiac-date-input.ts";
const docsPath = "../docs/aphrodite-compatibility-flow-redesign.md";
const reportPath = "../docs/aphrodite-package-reports/package-239.md";
const dashboardPath = "../app/dashboard/networks/zodiac/page.tsx";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";

for (const [label, path] of [
  ["model", modelPath],
  ["dashboard page", dashboardPagePath],
  ["live compatibility component", liveCompatibilityPath],
  ["wizard controls", wizardControlsPath],
  ["result cards", resultCardsPath],
  ["zodiac date input", zodiacDateInputPath],
  ["date range helper", dateRangePath],
  ["date input helper", dateInputHelperPath],
  ["docs", docsPath],
  ["package report", reportPath],
  ["dashboard navigation", dashboardPath],
  ["dashboard QA", dashboardQaPath],
]) {
  check(`${label} exists`, exists(path));
}

const modelSource = exists(modelPath) ? read(modelPath) : "";
const dashboardPageSource = exists(dashboardPagePath) ? read(dashboardPagePath) : "";
const liveCompatibilitySource = exists(liveCompatibilityPath) ? read(liveCompatibilityPath) : "";
const wizardControlsSource = exists(wizardControlsPath) ? read(wizardControlsPath) : "";
const resultCardsSource = exists(resultCardsPath) ? read(resultCardsPath) : "";
const zodiacDateInputSource = exists(zodiacDateInputPath) ? read(zodiacDateInputPath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const dashboardSource = exists(dashboardPath) ? read(dashboardPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";

const model = getAphroditeCompatibilityFlowRedesign();
const implementationBundle = [
  modelSource,
  dashboardPageSource,
  liveCompatibilitySource,
  wizardControlsSource,
  resultCardsSource,
  docsSource,
  reportSource,
  dashboardSource,
  dashboardQaSource,
].join("\n");
const liveBundle = [liveCompatibilitySource, wizardControlsSource, resultCardsSource].join("\n");
const safetyBundle = [modelSource, dashboardPageSource, liveBundle, docsSource, reportSource].join("\n");
const modelText = textFor(model);

check("title exported", model.title === APHRODITE_COMPATIBILITY_FLOW_REDESIGN_TITLE);
check("route exported", model.route === APHRODITE_COMPATIBILITY_FLOW_REDESIGN_ROUTE);
check("package number is 239", model.packageNumber === 239);
check("dashboard route uses readiness page", dashboardPageSource.includes("AphroditeReadinessPage"));
check("dashboard route linked from overview", dashboardSource.includes(APHRODITE_COMPATIBILITY_FLOW_REDESIGN_ROUTE));
check("dashboard QA route exists", dashboardQaSource.includes("compatibilityFlowRedesign"));
check("docs/report exist", docsSource.includes("Package 239") && reportSource.includes("Package 239"));
check("publicLaunchApproved=false", model.publicLaunchApproved === false && implementationBundle.includes("publicLaunchApproved=false"));
check("ownerManualReviewRequired=true", model.ownerManualReviewRequired === true && implementationBundle.includes("ownerManualReviewRequired=true"));

for (const field of [
  "redesignedSections",
  "compatibilityInputPrinciples",
  "resultPresentationPrinciples",
  "scoreCardPrinciples",
  "shareableResultPrinciples",
  "vipLockedPreviewPrinciples",
  "mobileBreakpoints",
  "telegramWebViewRules",
  "safetyBoundaries",
  "whatWasNotChanged",
  "nextPackageRecommendation",
]) {
  const value = model[field];
  check(`model field exists: ${field}`, (Array.isArray(value) ? value.length > 0 : Boolean(value)) && implementationBundle.includes(field));
}

for (const route of ["/compatibility", "/miniapp"]) {
  check(`live route documented: ${route}`, model.liveRoutes.some((item) => item.includes(route)) && implementationBundle.includes(route));
}

for (const marker of [
  'data-aphrodite-compatibility-flow-redesign="package-239"',
  'data-aphrodite-compatibility-input="package-239"',
  'data-aphrodite-compatibility-progress="package-239"',
  'data-aphrodite-compatibility-person-panel="package-239"',
  'data-aphrodite-compatibility-result="package-239"',
  'data-aphrodite-compatibility-score-card="package-239"',
  'data-aphrodite-compatibility-shareable-result="package-239"',
  'data-aphrodite-compatibility-vip-preview="package-239"',
]) {
  check(`live marker exists: ${marker}`, liveBundle.includes(marker));
}

check("Aphrodite design primitives used", resultCardsSource.includes("AphroditeCard") && resultCardsSource.includes("AphroditeBadge"));
check("existing date input still used", liveCompatibilitySource.includes("<ZodiacDateInput") && liveCompatibilitySource.includes('birthDateScope="compatibility"'));
check("Package 224 date input helper still present", zodiacDateInputSource.includes("formatBirthDateInputDraft") && zodiacDateInputSource.includes("normalizeBirthDateInput"));
check("birth date UI marker still present", zodiacDateInputSource.includes("BIRTH_DATE_UI_MARKER"));
check("date helpers not changed", gitChangedNames(["lib/zodiac-birth-date-range.ts", "lib/zodiac-date-input.ts", "components/zodiac-mini-app/ZodiacDateInput.tsx"]).length === 0);

for (const phrase of [
  "two-person input flow",
  "premium",
  "romantic",
  "mystical",
  "modern",
  "mobile-first",
  "Telegram WebView",
  "score/result card",
  "shareable result feeling",
  "Full compatibility report",
  "Emotional dynamics",
  "Conflict risks",
  "Love calendar",
  "Birth Matrix connection",
  "preview only",
  "no active payment",
  "no real VIP unlock",
  "entitlement unchanged",
  "compatibility calculation logic unchanged",
  "birth-date parsing/validation unchanged",
  "Package 224 date formatting",
  "01012000 -> 01.01.2000",
  "active CTA logic unchanged",
  "Birth Matrix flow not redesigned",
  "Mystic Cards flow not redesigned",
]) {
  check(`compatibility redesign phrase exists: ${phrase}`, implementationBundle.toLowerCase().includes(phrase.toLowerCase()));
}

for (const width of ["360px", "390px", "430px"]) {
  check(`mobile breakpoint exists: ${width}`, model.mobileBreakpoints.includes(width) && implementationBundle.includes(width));
}

for (const section of [
  "two-person input flow",
  "mode and relationship selectors",
  "result hero and score card",
  "strengths risks advice next action",
  "VIP locked preview",
]) {
  check(`redesigned section documented: ${section}`, modelText.includes(section.toLowerCase()) && implementationBundle.includes(section));
}

for (const unchanged of [
  "compatibility calculation logic unchanged",
  "birth-date parsing/validation unchanged",
  "zodiac sign logic unchanged",
  "active CTA logic unchanged",
  "Birth Matrix flow",
  "Mystic Cards flow",
]) {
  check(`unchanged scope documented: ${unchanged}`, model.whatWasNotChanged.some((item) => item.area === unchanged) && implementationBundle.includes(unchanged));
}

check("next package recommendation documented", model.nextPackageRecommendation === "Package 240 - Birth Matrix / Natal Flow Redesign" && implementationBundle.includes("Package 240 - Birth Matrix / Natal Flow Redesign"));

const compatibilityDiff = gitDiff("components/ZodiacCompatibilityMiniApp.tsx");
check("compatibility component diff readable", !compatibilityDiff.includes("__git_diff_failed__"));
check("buildCompatibilityResult not changed", !/^[+-].*buildCompatibilityResult/m.test(compatibilityDiff));
check("parseBirthDate function not changed", !/^[+-].*function parseBirthDate/m.test(compatibilityDiff));
check("signFromDate function not changed", !/^[+-].*function signFromDate/m.test(compatibilityDiff));
check("calculation helper files not changed", gitChangedNames([
  "lib/zodiac-compatibility-copy-personalization.ts",
  "lib/zodiac-couple-calendar-personalization.ts",
]).length === 0);

check("no production launch flag", model.safetyFlags.productionLaunchDone === false);
check("no Telegram API flag", model.safetyFlags.telegramApiUsed === false);
check("no messages flag", model.safetyFlags.messagesSent === false);
check("no BotFather change flag", model.safetyFlags.botFatherChanged === false);
check("no active CTA logic change flag", model.safetyFlags.activeCtaLogicChanged === false);
check("no app flow change flag", model.safetyFlags.appFlowsChanged === false);
check("no compatibility calculation change flag", model.safetyFlags.compatibilityCalculationChanged === false);
check("no zodiac sign logic change flag", model.safetyFlags.zodiacSignLogicChanged === false);
check("no birth-date parsing validation change flag", model.safetyFlags.birthDateParsingValidationChanged === false);
check("Package 224 date formatting not broken flag", model.safetyFlags.package224DateFormattingBroken === false);
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
  ".env.example",
]);
check("git scope helper returned real change data", !changedFiles.includes("__git_diff_failed__"));
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

console.log(`\nAphrodite Compatibility Flow Redesign QA complete: ${passed} passed, ${failed} failed.`);

if (failed > 0) {
  process.exit(1);
}
