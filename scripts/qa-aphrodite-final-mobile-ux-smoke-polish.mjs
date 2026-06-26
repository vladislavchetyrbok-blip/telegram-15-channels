#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

import {
  APHRODITE_FINAL_MOBILE_UX_SMOKE_CLASSIFICATION,
  APHRODITE_FINAL_MOBILE_UX_SMOKE_RULE,
  APHRODITE_FINAL_MOBILE_UX_SMOKE_SAFETY_LABELS,
  APHRODITE_FINAL_MOBILE_UX_SMOKE_TITLE,
  getAphroditeFinalMobileUxSmokePolish,
} from "../lib/zodiac/aphrodite-final-mobile-ux-smoke-polish.ts";

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

console.log("Старт QA: финальный mobile UX smoke & polish Aphrodite Mini App...\n");

const modelPath = "../lib/zodiac/aphrodite-final-mobile-ux-smoke-polish.ts";
const docsPath = "../docs/aphrodite-final-mobile-ux-smoke-polish.md";
const reportPath = "../docs/aphrodite-package-reports/package-205.md";
const miniappPath = "../app/miniapp/page.tsx";
const lovePreviewPath = "../app/miniapp/love-reading-preview/page.tsx";
const birthMatrixPath = "../app/birth-matrix/BirthMatrixClient.tsx";
const compatibilityPath = "../components/ZodiacCompatibilityMiniApp.tsx";
const mysticPath = "../components/ZodiacMysticSections.tsx";
const mysticPanelPath = "../components/zodiac-mini-app/AphroditeMysticUniversePanel.tsx";
const horoscopeCardPath = "../components/zodiac-mini-app/AphroditeHoroscopeCard.tsx";
const horoscopeBadgePath = "../components/zodiac-mini-app/AphroditeHoroscopePeriodBadge.tsx";
const dateInputPath = "../components/zodiac-mini-app/ZodiacDateInput.tsx";
const dateRangePath = "../lib/zodiac-birth-date-range.ts";
const resultCardsPath = "../components/zodiac-mini-app/ResultCards.tsx";
const qaScriptPath = "./qa-aphrodite-final-mobile-ux-smoke-polish.mjs";

for (const [label, path] of [
  ["model", modelPath],
  ["docs", docsPath],
  ["package report", reportPath],
  ["/miniapp page", miniappPath],
  ["Love Reading preview page", lovePreviewPath],
  ["Birth Matrix client", birthMatrixPath],
  ["Compatibility component", compatibilityPath],
  ["Mystic sections", mysticPath],
  ["Mystic universe panel", mysticPanelPath],
  ["Horoscope card component", horoscopeCardPath],
  ["Horoscope badge component", horoscopeBadgePath],
  ["ZodiacDateInput", dateInputPath],
  ["birth-date helper", dateRangePath],
  ["Result cards", resultCardsPath],
  ["QA script", qaScriptPath],
]) {
  check(`${label} существует`, exists(path));
}

const modelSource = exists(modelPath) ? read(modelPath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const miniappSource = exists(miniappPath) ? read(miniappPath) : "";
const lovePreviewSource = exists(lovePreviewPath) ? read(lovePreviewPath) : "";
const birthMatrixSource = exists(birthMatrixPath) ? read(birthMatrixPath) : "";
const compatibilitySource = exists(compatibilityPath) ? read(compatibilityPath) : "";
const mysticSource = exists(mysticPath) ? read(mysticPath) : "";
const mysticPanelSource = exists(mysticPanelPath) ? read(mysticPanelPath) : "";
const horoscopeCardSource = exists(horoscopeCardPath) ? read(horoscopeCardPath) : "";
const horoscopeBadgeSource = exists(horoscopeBadgePath) ? read(horoscopeBadgePath) : "";
const dateInputSource = exists(dateInputPath) ? read(dateInputPath) : "";
const dateRangeSource = exists(dateRangePath) ? read(dateRangePath) : "";
const resultCardsSource = exists(resultCardsPath) ? read(resultCardsPath) : "";
const qaSource = exists(qaScriptPath) ? read(qaScriptPath) : "";

const model = getAphroditeFinalMobileUxSmokePolish();
const implementationBundle = [
  modelSource,
  docsSource,
  reportSource,
  miniappSource,
  lovePreviewSource,
  birthMatrixSource,
  compatibilitySource,
  mysticSource,
  mysticPanelSource,
  horoscopeCardSource,
  horoscopeBadgeSource,
  dateInputSource,
  dateRangeSource,
  resultCardsSource,
].join("\n");
const birthDateBundle = [birthMatrixSource, compatibilitySource, mysticSource, dateInputSource, dateRangeSource].join("\n");

check("model returns title", model.title === APHRODITE_FINAL_MOBILE_UX_SMOKE_TITLE);
check("model returns classification", model.classification === APHRODITE_FINAL_MOBILE_UX_SMOKE_CLASSIFICATION);
check("package number is 205", model.packageNumber === 205);
check("rule text exists", modelSource.includes(APHRODITE_FINAL_MOBILE_UX_SMOKE_RULE) && docsSource.includes("Package 205"));
check("six target flows are covered", model.targets.length === 6);

for (const label of APHRODITE_FINAL_MOBILE_UX_SMOKE_SAFETY_LABELS) {
  check(`safety label exists: ${label}`, implementationBundle.includes(label));
}

for (const target of model.targets) {
  const source = read(`../${target.sourceFile}`);
  check(`${target.route}: source file exists`, exists(`../${target.sourceFile}`));
  check(`${target.route}: required signals exist`, target.requiredSignals.every((signal) => source.includes(signal)));
  check(`${target.route}: mobile checks documented`, target.mobileChecks.length >= 4);
  check(`${target.route}: status is explicit`, target.status === "checked" || target.status === "excluded");
  if (!target.hasBirthDateInput) {
    check(`${target.route}: non-birth-date exclusion reason exists`, Boolean(target.exclusionReason));
  }
}

for (const requiredCheck of [
  "mobile readability",
  "button sizes",
  "spacing",
  "text length",
  "safe area",
  "no horizontal overflow",
  "no tiny text",
  "no broken links",
  "no old date picker",
  "no payment CTA",
  "no VIP unlock",
]) {
  check(`required check exists: ${requiredCheck}`, model.requiredChecks.includes(requiredCheck));
}

check("/miniapp primary CTA exists", miniappSource.includes('href="/miniapp/love-reading-preview"') && miniappSource.includes("AphroditePrimaryCta"));
check("/miniapp links to Birth Matrix", miniappSource.includes('href: "/birth-matrix"') || miniappSource.includes('href="/birth-matrix"'));
check("/miniapp links to compatibility", miniappSource.includes("/compatibility?startapp=compat_love"));
check("/miniapp keeps safety boundaries", miniappSource.includes("Без оплаты") && miniappSource.includes("Без VIP-разблокировки") && miniappSource.includes("Без Telegram API"));
check("Love Reading preview route exists and keeps preview blocks", lovePreviewSource.includes("PREVIEW_BLOCKS") && lovePreviewSource.includes("Бесплатный preview"));
check("Love Reading preview has safe back and compatibility CTAs", lovePreviewSource.includes('href="/compatibility"') && lovePreviewSource.includes('href="/miniapp"'));
check("Birth Matrix keeps text date input", birthMatrixSource.includes("ZodiacDateInput") && birthMatrixSource.includes('birthDateScope="birth-matrix"'));
check("Birth Matrix visual result marker exists", birthMatrixSource.includes('data-birth-matrix-result="visual-upgrade-package-201"'));
check("Compatibility personalized copy remains", compatibilitySource.includes("buildZodiacCompatibilityPersonalizedCopy"));
check("30 days couple calendar remains personalized", compatibilitySource.includes("buildPersonalizedCoupleCalendar") && resultCardsSource.includes("#relationship-calendar"));
check("Compatibility keeps mobile overflow guards", compatibilitySource.includes("overflow-x-hidden") && compatibilitySource.includes("[overflow-wrap:anywhere]"));
check("Mystic universe panel remains connected", mysticSource.includes("AphroditeMysticUniversePanel") && mysticPanelSource.includes("Послание Вселенной"));
check("Mystic Birth Matrix scope remains", mysticSource.includes('birthDateScope="miniapp-matrix"'));
check("Horoscope visual cards remain connected", horoscopeCardSource.includes("data-aphrodite-horoscope-card") && horoscopeBadgeSource.includes("data-aphrodite-horoscope-period"));
check("shared date input marker remains", dateRangeSource.includes('BIRTH_DATE_UI_MARKER = "v2-global-1900-today"') && dateInputSource.includes("data-birth-date-ui"));
check("birth-date inputs do not use native type=date", !/type\s*=\s*["']date["']/.test(birthDateBundle));
check("birth-date flows have visible text helper", birthDateBundle.includes("Формат: ДД.ММ.ГГГГ") && birthDateBundle.includes("Например: 15.06.1998"));
check("QA command list includes build", model.requiredQaCommands.includes("npm run build"));
check("QA command list includes final mobile script", model.requiredQaCommands.includes("node --experimental-strip-types scripts/qa-aphrodite-final-mobile-ux-smoke-polish.mjs"));
check("docs mention final mobile smoke", docsSource.includes("финальный mobile UX smoke") && docsSource.includes("/miniapp"));
check("report points to Package 206", reportSource.includes("Package 206"));
check("QA script checks no native date picker", qaSource.includes("birth-date inputs do not use native type=date"));

check("production launch flag false", model.safetyFlags.productionLaunchDone === false);
check("Telegram API flag false", model.safetyFlags.telegramApiUsed === false);
check("messages sent flag false", model.safetyFlags.messagesSent === false);
check("active CTA flag false", model.safetyFlags.activeCtaLogicChanged === false);
check("DB write flag false", model.safetyFlags.databaseWriteAdded === false);
check("external analytics flag false", model.safetyFlags.externalAnalyticsAdded === false);
check("payment flag false", model.safetyFlags.paymentAdded === false);
check("VIP unlock flag false", model.safetyFlags.vipUnlockAdded === false);
check("cron/workflow/publish flag false", model.safetyFlags.cronWorkflowPublishChanged === false);

check("no Telegram API implementation", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(implementationBundle));
check("no DB write implementation", !/from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(|events\.insert|insert.*event/i.test(implementationBundle));
check("no payment or VIP implementation", !/from ['"]stripe|new Stripe\b|sendInvoice\s*\(|createInvoiceLink\s*\(|successful_payment|pre_checkout_query|answerPreCheckoutQuery|createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|allowed=true|productionPaymentAllowedNow=true/i.test(implementationBundle));
check("no external analytics implementation", !/analytics\.track|posthog|amplitude|gtag|GoogleAnalytics|sendEvent|trackEvent|navigator\.sendBeacon/i.test(implementationBundle));
check("no workflow/cron changes", gitDiffNames([".github/workflows", "vercel.json"]).length === 0);
check("package.json not changed", gitDiffNames(["package.json"]).length === 0);
check("no DB schema/migration change", gitDiffNames(["prisma", "supabase", "migrations", "schema.prisma"]).filter((file) => /(^|\/)(prisma|supabase|migrations)(\/|$)|schema\.prisma$/i.test(file)).length === 0);
check("publish scripts not changed", gitDiffNames([
  "scripts/publish-zodiac-by-date.mjs",
  "scripts/publish-zodiac-weekly-by-week.mjs",
  "scripts/zodiac-telegram-publisher.mjs",
  "scripts/publish-due.mjs",
  "scripts/publish-due-json.mjs",
]).length === 0);

const scriptChanges = gitDiffNames(["scripts"]);
const allowedScriptChanges = new Set(["scripts/qa-aphrodite-final-mobile-ux-smoke-polish.mjs"]);
check("script changes limited to Package 205 QA", scriptChanges.every((file) => allowedScriptChanges.has(file)));

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
