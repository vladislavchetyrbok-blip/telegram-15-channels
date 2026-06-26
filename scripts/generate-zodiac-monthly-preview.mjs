#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { buildZodiacMonthlyHoroscopeRun } from "../lib/zodiac-monthly-horoscope.ts";

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { date: null, month: null, out: null, json: false };
  const errors = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--date") options.date = args[++index] ?? null;
    else if (arg === "--month") options.month = args[++index] ?? null;
    else if (arg === "--out") options.out = args[++index] ?? null;
    else if (arg === "--json") options.json = true;
    else errors.push(`Unknown argument: ${arg}`);
  }

  if (options.date && Number.isNaN(new Date(`${options.date}T00:00:00Z`).getTime())) {
    errors.push("--date must be YYYY-MM-DD.");
  }
  if (options.month && !/^\d{4}-\d{2}$/.test(options.month)) {
    errors.push("--month must be YYYY-MM.");
  }

  return { options, errors };
}

function resolveDate(dateKey) {
  if (!dateKey) return new Date();
  return new Date(`${dateKey}T00:00:00Z`);
}

function buildReport(run) {
  return {
    ok: run.ok,
    mode: run.mode,
    reason: run.reason,
    generationDate: run.generationDate,
    monthKey: run.period.monthKey,
    monthLabel: run.period.monthLabel,
    expectedPosts: 13,
    actualPosts: run.posts.length,
    ledgerWrites: 0,
    telegramApiCalls: 0,
    dryRun: true,
    perPost: run.posts.map((post) => ({
      slug: post.slug,
      ledgerKey: post.ledgerKey,
      title: post.title,
      sectionCount: post.sections.length,
      textLength: post.text.length,
    })),
  };
}

function writeReport(outPath, report) {
  const absolutePath = path.resolve(process.cwd(), outPath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return absolutePath;
}

function printReport(report) {
  console.log("=== Zodiac Monthly Horoscope Preview ===");
  console.log(`Generation Date : ${report.generationDate}`);
  console.log(`Target Month    : ${report.monthLabel} (${report.monthKey})`);
  console.log(`Mode            : ${report.mode}`);
  console.log(`Reason          : ${report.reason}`);
  console.log(`Expected Posts  : ${report.expectedPosts}`);
  console.log(`Actual Posts    : ${report.actualPosts}`);
  console.log(`Ledger Writes   : ${report.ledgerWrites}`);
  console.log(`Telegram Calls  : ${report.telegramApiCalls}`);
  console.log("Dry Run         : true");
  console.log("--- Posts ---");
  for (const post of report.perPost) {
    console.log(`- ${post.slug}: ${post.ledgerKey} | sections=${post.sectionCount} | chars=${post.textLength}`);
  }
  console.log("========================================");
}

function main() {
  const { options, errors } = parseArgs();
  if (errors.length > 0) {
    errors.forEach((error) => console.error(error));
    process.exit(1);
  }

  const run = buildZodiacMonthlyHoroscopeRun({
    date: resolveDate(options.date),
    monthKey: options.month ?? undefined,
    manualPreview: true,
  });
  const report = buildReport(run);
  const outPath = options.out ? writeReport(options.out, report) : null;

  if (options.json) {
    console.log(JSON.stringify({ ...report, reportFile: outPath }, null, 2));
  } else {
    printReport(report);
    if (outPath) console.log(`Report File     : ${outPath}`);
  }

  if (!run.ok || report.actualPosts !== report.expectedPosts) process.exit(1);
}

main();
