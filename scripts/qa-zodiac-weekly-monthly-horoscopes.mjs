#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  ZODIAC_WEEKLY_SECTION_TITLES,
  buildZodiacDailyLedgerKey,
  buildZodiacWeeklyHoroscopeRun,
  buildZodiacWeeklyLedgerKey,
  canAutoPublishWeeklyHoroscope,
  generateZodiacWeeklyHoroscopePosts,
  getUpcomingWeeklyHoroscopePeriod,
} from "../lib/zodiac-weekly-horoscope.ts";
import {
  ZODIAC_MONTHLY_SECTION_TITLES,
  buildZodiacMonthlyHoroscopeRun,
  buildZodiacMonthlyLedgerKey,
  getNextMonthlyHoroscopePeriodAfter20,
} from "../lib/zodiac-monthly-horoscope.ts";
import { getPublishKey } from "./lib/zodiac-publish-ledger.mjs";
import { getWeeklyPublishKey } from "./lib/zodiac-weekly-pipeline.mjs";

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

function utcDate(dateKey) {
  return new Date(`${dateKey}T12:00:00Z`);
}

function read(rel) {
  return readFileSync(new URL(rel, import.meta.url), "utf8");
}

function gitDiffNames(paths) {
  try {
    const output = execFileSync("git", ["diff", "--name-only", "HEAD", "--", ...paths], { encoding: "utf8" });
    return output.split(/\r?\n/).filter(Boolean);
  } catch {
    return ["__git_diff_failed__"];
  }
}

function textSignature(post) {
  return post.sections.map((section) => `${section.title}:${section.body}`).join("\n");
}

function allSectionTitlesPresent(post, requiredTitles) {
  const titles = new Set(post.sections.map((section) => section.title));
  return requiredTitles.every((title) => titles.has(title));
}

function hasNoDuplicate(values) {
  return new Set(values).size === values.length;
}

function hasDifferentCopy(posts) {
  return new Set(posts.map(textSignature)).size === posts.length;
}

function sourceHasNoDangerousRuntimeCalls(source) {
  return !/api\.telegram\.org|sendMessage\(|sendPhoto\(|sendInvoice\(|createInvoiceLink|answerPreCheckoutQuery|successful_payment|pre_checkout_query|new Stripe\b|from ['"]stripe|DATABASE_URL|createClient\(|new Pool\(|\.(insert|update|delete|upsert)\s*\(|grantVip|unlockVip|createsEntitlementNow\s*:\s*true|grantsAccessNow\s*:\s*true|unlocksVipNow\s*:\s*true/i.test(source);
}

console.log("Старт QA: weekly/monthly zodiac horoscopes...\n");

const packageJson = read("../package.json");
const dailyGuidanceExists = existsSync(new URL("./lib/zodiac-daily-guidance.mjs", import.meta.url));
const dailyGeneratorExists = existsSync(new URL("./generate-zodiac-plan.mjs", import.meta.url));
const dailyLedgerSource = read("./lib/zodiac-publish-ledger.mjs");

check("daily pipeline still exists: guidance file", dailyGuidanceExists);
check("daily pipeline still exists: generator file", dailyGeneratorExists);
check("daily pipeline still exists: package scripts", packageJson.includes("zodiac:publish-date:dry") && packageJson.includes("zodiac:publish-date:live"));
check("daily ledger key format remains unchanged", getPublishKey("2026-06-26", "aries") === "2026-06-26:aries");
check("new daily helper mirrors existing daily key", buildZodiacDailyLedgerKey("2026-06-26", "aries") === getPublishKey("2026-06-26", "aries"));
check("daily ledger source still uses date:slug key", dailyLedgerSource.includes("return `${date}:${slug}`;"));

const sundayPeriod = getUpcomingWeeklyHoroscopePeriod(utcDate("2026-06-28"));
const fridayAutoRun = buildZodiacWeeklyHoroscopeRun({ date: utcDate("2026-06-26") });
const fridayManualRun = buildZodiacWeeklyHoroscopeRun({ date: utcDate("2026-06-26"), manualPreview: true });
const sundayRun = buildZodiacWeeklyHoroscopeRun({ date: utcDate("2026-06-28") });
const weeklyPosts = generateZodiacWeeklyHoroscopePosts(sundayPeriod);
const weeklySignPosts = weeklyPosts.filter((post) => post.channelType === "sign");

check("weekly generator exists", existsSync(new URL("../lib/zodiac-weekly-horoscope.ts", import.meta.url)));
check("Sunday weekly generation targets following Monday", sundayPeriod.weekStart === "2026-06-29");
check("Sunday weekly generation targets following Sunday", sundayPeriod.weekEnd === "2026-07-05");
check("Sunday weekly generation uses new week ISO key", sundayPeriod.weekKey === "2026-W27");
check("Sunday auto weekly run is allowed", canAutoPublishWeeklyHoroscope(utcDate("2026-06-28")) && sundayRun.ok);
check("non-Sunday auto weekly run is blocked", !fridayAutoRun.ok && fridayAutoRun.posts.length === 0);
check("non-Sunday manual preview can still generate upcoming week", fridayManualRun.ok && fridayManualRun.posts.length === 13 && fridayManualRun.period.weekStart === "2026-06-29");
check("weekly generates 12 signs + general", weeklyPosts.length === 13 && weeklySignPosts.length === 12);
check("weekly content says forecast for new week", weeklyPosts.every((post) => /прогноз на неделю|прогноз на новую неделю|на новую неделю/i.test(post.text)));
check("weekly period has weekStart/weekEnd in each post", weeklyPosts.every((post) => post.weekStart === "2026-06-29" && post.weekEnd === "2026-07-05"));
check("weekly sections are present", weeklyPosts.every((post) => allSectionTitlesPresent(post, ZODIAC_WEEKLY_SECTION_TITLES)));
check("different signs have different weekly copy", hasDifferentCopy(weeklySignPosts));

const monthly0620 = getNextMonthlyHoroscopePeriodAfter20(utcDate("2026-06-20"));
const monthly0621 = getNextMonthlyHoroscopePeriodAfter20(utcDate("2026-06-21"));
const monthly0630 = getNextMonthlyHoroscopePeriodAfter20(utcDate("2026-06-30"));
const monthly0720 = getNextMonthlyHoroscopePeriodAfter20(utcDate("2026-07-20"));
const julyRun = buildZodiacMonthlyHoroscopeRun({ date: utcDate("2026-06-26") });
const julyPosts = julyRun.posts;
const julySignPosts = julyPosts.filter((post) => post.channelType === "sign");

check("monthly generator exists", existsSync(new URL("../lib/zodiac-monthly-horoscope.ts", import.meta.url)));
check("2026-06-20 targets July 2026 monthly forecast", monthly0620.monthKey === "2026-07" && monthly0620.monthLabel === "Июль 2026");
check("2026-06-21 targets July 2026 monthly forecast", monthly0621.monthKey === "2026-07" && monthly0621.monthLabel === "Июль 2026");
check("2026-06-30 targets July 2026 monthly forecast", monthly0630.monthKey === "2026-07" && monthly0630.monthLabel === "Июль 2026");
check("2026-07-20 targets August 2026 monthly forecast", monthly0720.monthKey === "2026-08" && monthly0720.monthLabel === "Август 2026");
check("monthly target is next month after the 20th", [monthly0620, monthly0621, monthly0630, monthly0720].every((period) => period.monthKey !== "2026-06"));
check("July 2026 monthly generation works now", julyRun.ok && julyRun.period.monthKey === "2026-07");
check("monthly generates 12 signs + general", julyPosts.length === 13 && julySignPosts.length === 12);
check("monthly sections are present", julyPosts.every((post) => allSectionTitlesPresent(post, ZODIAC_MONTHLY_SECTION_TITLES)));
check("monthly content says forecast for July", julyPosts.every((post) => /прогноз на июль/i.test(post.text)));
check("monthly does not describe today/current day", julyPosts.every((post) => !/сегодня|сегодняш/i.test(post.text)));
check("different signs have different monthly copy", hasDifferentCopy(julySignPosts));

const dailyKeys = weeklyPosts.map((post) => buildZodiacDailyLedgerKey("2026-06-28", post.slug));
const weeklyKeys = weeklyPosts.map((post) => post.ledgerKey);
const monthlyKeys = julyPosts.map((post) => post.ledgerKey);
const allKeys = [...dailyKeys, ...weeklyKeys, ...monthlyKeys];

check("weekly ledger key example matches required format", buildZodiacWeeklyLedgerKey("2026-W27", "aries") === "zodiac:weekly:2026-W27:aries");
check("weekly general ledger key matches required format", buildZodiacWeeklyLedgerKey("2026-W27", "zodiac-general") === "zodiac:weekly:2026-W27:general");
check("existing weekly pipeline ledger key matches required format", getWeeklyPublishKey("2026-W27", "zodiac-general") === "zodiac:weekly:2026-W27:general");
check("monthly ledger key example matches required format", buildZodiacMonthlyLedgerKey("2026-07", "aries") === "zodiac:monthly:2026-07:aries");
check("monthly general ledger key matches required format", buildZodiacMonthlyLedgerKey("2026-07", "zodiac-general") === "zodiac:monthly:2026-07:general");
check("weekly ledger keys include target week, not generation date", weeklyKeys.every((key) => key.includes("2026-W27") && !key.includes("2026-06-28")));
check("monthly ledger keys include target month, not generation date", monthlyKeys.every((key) => key.includes("2026-07") && !key.includes("2026-06-26")));
check("ledger keys are separated daily/weekly/monthly", dailyKeys.every((key) => !key.startsWith("zodiac:")) && weeklyKeys.every((key) => key.startsWith("zodiac:weekly:")) && monthlyKeys.every((key) => key.startsWith("zodiac:monthly:")));
check("no duplicate post keys", hasNoDuplicate(allKeys));

const dailyReference = JSON.stringify(read("./lib/zodiac-daily-guidance.mjs").slice(0, 2000));
check("monthly is not identical to daily content", julySignPosts.every((post) => post.text !== dailyReference && !post.text.includes("Главное на день")));
check("weekly is not identical to daily content", weeklySignPosts.every((post) => post.text !== dailyReference && !post.text.includes("Главное на день")));

const implementationSource = [
  read("../lib/zodiac-weekly-horoscope.ts"),
  read("../lib/zodiac-monthly-horoscope.ts"),
  read("./generate-zodiac-monthly-preview.mjs"),
  read("./lib/zodiac-weekly-pipeline.mjs"),
].join("\n");
check("no new Telegram/payment/VIP/DB active runtime calls in touched implementation", sourceHasNoDangerousRuntimeCalls(implementationSource));

const workflowDiff = gitDiffNames([".github/workflows"]);
const dbDiff = gitDiffNames(["prisma", "supabase"]);
const packageDiff = gitDiffNames(["package.json"]);
check("workflows not changed", workflowDiff.length === 0);
check("DB schema/migrations not changed", dbDiff.length === 0);
check("package.json not changed", packageDiff.length === 0);

const scriptDiff = gitDiffNames(["scripts"]);
const allowedScripts = new Set([
  "scripts/generate-zodiac-monthly-preview.mjs",
  "scripts/lib/zodiac-weekly-pipeline.mjs",
  "scripts/qa-zodiac-weekly-monthly-horoscopes.mjs",
]);
check("script changes are limited and intentional", scriptDiff.every((file) => allowedScripts.has(file)));

console.log("\nQA завершён: " + passed + " успехов, " + failed + " ошибок.");
if (failed > 0) process.exit(1);
