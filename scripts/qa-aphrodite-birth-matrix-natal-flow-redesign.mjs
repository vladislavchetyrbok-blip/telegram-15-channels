#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

import { gitChangedNames } from "./lib/qa-git-scope.mjs";
import {
  APHRODITE_BIRTH_MATRIX_NATAL_FLOW_REDESIGN_ROUTE,
  APHRODITE_BIRTH_MATRIX_NATAL_FLOW_REDESIGN_TITLE,
  getAphroditeBirthMatrixNatalFlowRedesign,
} from "../lib/zodiac/aphrodite-birth-matrix-natal-flow-redesign.ts";

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

console.log("Starting QA: Aphrodite Birth Matrix / Natal Flow Redesign...\n");

const modelPath = "../lib/zodiac/aphrodite-birth-matrix-natal-flow-redesign.ts";
const dashboardPagePath = "../app/dashboard/networks/zodiac/birth-matrix-natal-flow-redesign/page.tsx";
const birthMatrixRoutePath = "../app/birth-matrix/BirthMatrixClient.tsx";
const mysticSectionsPath = "../components/ZodiacMysticSections.tsx";
const vipSectionsPath = "../components/ZodiacVipSections.tsx";
const zodiacDateInputPath = "../components/zodiac-mini-app/ZodiacDateInput.tsx";
const dateRangePath = "../lib/zodiac-birth-date-range.ts";
const dateInputHelperPath = "../lib/zodiac-date-input.ts";
const docsPath = "../docs/aphrodite-birth-matrix-natal-flow-redesign.md";
const reportPath = "../docs/aphrodite-package-reports/package-240.md";
const dashboardPath = "../app/dashboard/networks/zodiac/page.tsx";
const dashboardQaPath = "./qa-zodiac-dashboard.mjs";

for (const [label, path] of [
  ["model", modelPath],
  ["dashboard page", dashboardPagePath],
  ["birth matrix route", birthMatrixRoutePath],
  ["mystic sections", mysticSectionsPath],
  ["VIP sections", vipSectionsPath],
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
const birthMatrixRouteSource = exists(birthMatrixRoutePath) ? read(birthMatrixRoutePath) : "";
const mysticSectionsSource = exists(mysticSectionsPath) ? read(mysticSectionsPath) : "";
const vipSectionsSource = exists(vipSectionsPath) ? read(vipSectionsPath) : "";
const zodiacDateInputSource = exists(zodiacDateInputPath) ? read(zodiacDateInputPath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const dashboardSource = exists(dashboardPath) ? read(dashboardPath) : "";
const dashboardQaSource = exists(dashboardQaPath) ? read(dashboardQaPath) : "";

const model = getAphroditeBirthMatrixNatalFlowRedesign();
const liveBundle = [birthMatrixRouteSource, mysticSectionsSource, vipSectionsSource].join("\n");
const implementationBundle = [
  modelSource,
  dashboardPageSource,
  liveBundle,
  docsSource,
  reportSource,
  dashboardSource,
  dashboardQaSource,
].join("\n");
const safetyBundle = [modelSource, dashboardPageSource, liveBundle, docsSource, reportSource].join("\n");
const modelText = textFor(model);

check("title exported", model.title === APHRODITE_BIRTH_MATRIX_NATAL_FLOW_REDESIGN_TITLE);
check("route exported", model.route === APHRODITE_BIRTH_MATRIX_NATAL_FLOW_REDESIGN_ROUTE);
check("package number is 240", model.packageNumber === 240);
check("dashboard route uses readiness page", dashboardPageSource.includes("AphroditeReadinessPage"));
check("dashboard route linked from overview", dashboardSource.includes(APHRODITE_BIRTH_MATRIX_NATAL_FLOW_REDESIGN_ROUTE));
check("dashboard QA route exists", dashboardQaSource.includes("birthMatrixNatalFlowRedesign"));
check("docs/report exist", docsSource.includes("Package 240") && reportSource.includes("Package 240"));
check("publicLaunchApproved=false", model.publicLaunchApproved === false && implementationBundle.includes("publicLaunchApproved=false"));
check("ownerManualReviewRequired=true", model.ownerManualReviewRequired === true && implementationBundle.includes("ownerManualReviewRequired=true"));

for (const field of [
  "redesignedSections",
  "birthMatrixInputPrinciples",
  "natalResultPresentationPrinciples",
  "energyCardPrinciples",
  "personalReportPrinciples",
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

for (const route of ["/birth-matrix", "/miniapp"]) {
  check(`live route documented: ${route}`, model.liveRoutes.some((item) => item.includes(route)) && implementationBundle.includes(route));
}

for (const marker of [
  'data-aphrodite-birth-matrix-natal-flow-redesign="package-240"',
  'data-aphrodite-birth-matrix-flow-redesign="package-240"',
  'data-aphrodite-birth-matrix-input="package-240"',
  'data-aphrodite-birth-matrix-report="package-240"',
  'data-aphrodite-birth-matrix-energy-card="package-240"',
  'data-aphrodite-birth-matrix-personal-report="package-240"',
  'data-aphrodite-birth-matrix-vip-preview="package-240"',
  'data-aphrodite-natal-flow-redesign="package-240"',
  'data-aphrodite-natal-input="package-240"',
  'data-aphrodite-natal-report="package-240"',
  'data-aphrodite-natal-vip-preview="package-240"',
]) {
  check(`live marker exists: ${marker}`, liveBundle.includes(marker));
}

check("Aphrodite design primitives used", liveBundle.includes("AphroditeCard") && liveBundle.includes("AphroditeBadge") && liveBundle.includes("AphroditeMetricCard"));
check("existing Birth Matrix date input still used", birthMatrixRouteSource.includes("<ZodiacDateInput") && birthMatrixRouteSource.includes('birthDateScope="birth-matrix"'));
check("existing Mini App matrix date input still used", mysticSectionsSource.includes("<ZodiacDateInput") && mysticSectionsSource.includes('birthDateScope="miniapp-matrix"'));
check("existing VIP natal date input still used", vipSectionsSource.includes("<ZodiacDateInput") && vipSectionsSource.includes('birthDateScope="vip-natal"'));
check("Package 224 date input helper still present", zodiacDateInputSource.includes("formatBirthDateInputDraft") && zodiacDateInputSource.includes("normalizeBirthDateInput"));
check("birth date UI marker still present", zodiacDateInputSource.includes("BIRTH_DATE_UI_MARKER"));
check("date helpers not changed", gitChangedNames(["lib/zodiac-birth-date-range.ts", "lib/zodiac-date-input.ts", "components/zodiac-mini-app/ZodiacDateInput.tsx"]).length === 0);

for (const phrase of [
  "Birth Matrix / Natal input",
  "personal energy report",
  "birth-date / birth data input",
  "what user gets",
  "result visual structure",
  "personal energy / matrix / natal sections",
  "strengths",
  "risks",
  "purpose",
  "relationships",
  "money",
  "VIP/Pro locked preview",
  "preview only",
  "no active payment",
  "no entitlement",
  "no real VIP unlock",
  "Birth Matrix/Natal calculation logic unchanged",
  "birth-date parsing/validation unchanged",
  "Package 224 date formatting",
  "01012000 -> 01.01.2000",
  "active CTA logic unchanged",
  "Compatibility flow not redesigned again",
  "Mystic Cards flow not redesigned",
]) {
  check(`birth matrix natal redesign phrase exists: ${phrase}`, implementationBundle.toLowerCase().includes(phrase.toLowerCase()));
}

for (const width of ["360px", "390px", "430px"]) {
  check(`mobile breakpoint exists: ${width}`, model.mobileBreakpoints.includes(width) && implementationBundle.includes(width));
}

for (const section of [
  "birth-date / birth data input",
  "what user gets",
  "result visual structure",
  "personal energy / matrix / natal sections",
  "VIP/Pro locked preview",
]) {
  check(`redesigned section documented: ${section}`, modelText.includes(section.toLowerCase()) && implementationBundle.includes(section));
}

for (const unchanged of [
  "Birth Matrix/Natal calculation logic unchanged",
  "birth-date parsing/validation unchanged",
  "zodiac sign logic unchanged",
  "active CTA logic unchanged",
  "Compatibility flow not redesigned again",
  "Mystic Cards flow not redesigned",
]) {
  check(`unchanged scope documented: ${unchanged}`, model.whatWasNotChanged.some((item) => item.area === unchanged) && implementationBundle.includes(unchanged));
}

check("next package recommendation documented", model.nextPackageRecommendation === "Package 241 - Mystic Cards Redesign" && implementationBundle.includes("Package 241 - Mystic Cards Redesign"));

const birthMatrixRouteDiff = gitDiff("app/birth-matrix/BirthMatrixClient.tsx");
const mysticSectionsDiff = gitDiff("components/ZodiacMysticSections.tsx");
const vipSectionsDiff = gitDiff("components/ZodiacVipSections.tsx");

check("birth matrix route diff readable", !birthMatrixRouteDiff.includes("__git_diff_failed__"));
check("mystic sections diff readable", !mysticSectionsDiff.includes("__git_diff_failed__"));
check("VIP sections diff readable", !vipSectionsDiff.includes("__git_diff_failed__"));
check("calculateMockBirthMatrix not changed", !/^[+-].*calculateMockBirthMatrix/m.test(birthMatrixRouteDiff));
check("parseBirthDateInput usage not changed", !/^[+-].*parseBirthDateInput/m.test(birthMatrixRouteDiff));
check("generateBirthMatrix import/function not changed", !/^[+-].*(generateBirthMatrix,|function generateBirthMatrix|export function generateBirthMatrix)/m.test(mysticSectionsDiff));
check("buildBirthMatrixRetentionAction not changed", !/^[+-].*buildBirthMatrixRetentionAction/m.test(mysticSectionsDiff));
check("birthMatrixAnalyticsPayload not changed", !/^[+-].*birthMatrixAnalyticsPayload/m.test(mysticSectionsDiff));
check("buildNatalBlocks not changed", !/^[+-].*function buildNatalBlocks/m.test(vipSectionsDiff));
check("buildNatalResultSections not changed", !/^[+-].*function buildNatalResultSections/m.test(vipSectionsDiff));
check("signFromBirthDate not changed", !/^[+-].*signFromBirthDate/m.test(vipSectionsDiff));
check("sanitizeBirthDateInputDraft not changed", !/^[+-].*sanitizeBirthDateInputDraft/m.test(vipSectionsDiff));
check("birth matrix/natal helper files not changed", gitChangedNames([
  "lib/zodiac/zodiac-birth-matrix-mock.ts",
  "lib/zodiac-mystic-content.ts",
  "lib/zodiac-date-input.ts",
  "lib/zodiac-birth-date-range.ts",
]).length === 0);

check("no production launch flag", model.safetyFlags.productionLaunchDone === false);
check("no Telegram API flag", model.safetyFlags.telegramApiUsed === false);
check("no messages flag", model.safetyFlags.messagesSent === false);
check("no BotFather change flag", model.safetyFlags.botFatherChanged === false);
check("no active CTA logic change flag", model.safetyFlags.activeCtaLogicChanged === false);
check("no app flow change flag", model.safetyFlags.appFlowsChanged === false);
check("no birth matrix/natal calculation change flag", model.safetyFlags.birthMatrixNatalCalculationChanged === false);
check("no zodiac sign logic change flag", model.safetyFlags.zodiacSignLogicChanged === false);
check("no birth-date parsing validation change flag", model.safetyFlags.birthDateParsingValidationChanged === false);
check("Package 224 date formatting not broken flag", model.safetyFlags.package224DateFormattingBroken === false);
check("compatibility flow not redesigned again flag", model.safetyFlags.compatibilityFlowRedesignedAgain === false);
check("mystic cards flow not redesigned flag", model.safetyFlags.mysticCardsFlowRedesigned === false);
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
]);
const allowedChanges = new Set([
  "app/birth-matrix/BirthMatrixClient.tsx",
  "app/dashboard/networks/zodiac/page.tsx",
  "app/dashboard/networks/zodiac/birth-matrix-natal-flow-redesign/page.tsx",
  "app/dashboard/networks/zodiac/mystic-cards-redesign/page.tsx",
  "app/dashboard/networks/zodiac/result-share-cards/page.tsx",
  "app/dashboard/networks/zodiac/vip-locked-preview-redesign/page.tsx",
  "app/miniapp/page.tsx",
  "app/vip-compatibility-report/VipCompatibilityReportClient.tsx",
  "app/vip-preview/page.tsx",
  "components/ZodiacMysticSections.tsx",
  "components/ZodiacVipSections.tsx",
  "components/zodiac-mini-app/AphroditeHomeScreen.tsx",
  "components/zodiac-mini-app/ResultCards.tsx",
  "components/zodiac-mini-app/aphrodite-design-system/AphroditeLockedPreviewCard.tsx",
  "components/zodiac-mini-app/aphrodite-design-system/AphroditeResultCardPreview.tsx",
  "components/zodiac-mini-app/aphrodite-design-system/AphroditeShareCard.tsx",
  "components/zodiac-mini-app/aphrodite-design-system/index.ts",
  "lib/zodiac/aphrodite-birth-matrix-natal-flow-redesign.ts",
  "lib/zodiac/aphrodite-mystic-cards-redesign.ts",
  "lib/zodiac/aphrodite-result-share-cards.ts",
  "lib/zodiac/aphrodite-vip-locked-preview-redesign.ts",
  "scripts/qa-aphrodite-birth-matrix-natal-flow-redesign.mjs",
  "scripts/qa-aphrodite-mystic-cards-redesign.mjs",
  "scripts/qa-aphrodite-result-share-cards.mjs",
  "scripts/qa-aphrodite-vip-locked-preview-redesign.mjs",
  "scripts/qa-zodiac-dashboard.mjs",
  "scripts/qa-aphrodite-dashboard-auth-system-decision.mjs",
  "scripts/qa-aphrodite-public-api-exposure-hardening.mjs",
  "scripts/qa-aphrodite-real-device-qa-execution-pack.mjs",
  "docs/aphrodite-birth-matrix-natal-flow-redesign.md",
  "docs/aphrodite-mystic-cards-redesign.md",
  "docs/aphrodite-result-share-cards.md",
  "docs/aphrodite-vip-locked-preview-redesign.md",
  "docs/aphrodite-package-reports/package-240.md",
  "docs/aphrodite-package-reports/package-241.md",
  "docs/aphrodite-package-reports/package-242.md",
  "docs/aphrodite-package-reports/package-243.md",
]);
check("git scope helper returned real change data", !changedFiles.includes("__git_diff_failed__"));
check("changed files limited to Package 240 visual/readiness scope", changedFiles.every((file) => allowedChanges.has(file)));
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

console.log(`\nAphrodite Birth Matrix / Natal Flow Redesign QA complete: ${passed} passed, ${failed} failed.`);

if (failed > 0) {
  process.exit(1);
}
