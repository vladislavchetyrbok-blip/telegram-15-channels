import fs from "fs";
import path from "path";
import process from "process";
import { ZODIAC_WEEKDAYS, ZODIAC_WEEKLY_CHANNELS } from "./zodiac-weekly-asset-resolver.mjs";

const TRACKER_PATH = path.resolve(process.cwd(), "data", "zodiac-weekly-visual-assets.json");

function readTracker() {
  if (!fs.existsSync(TRACKER_PATH)) {
    return { ok: false, entries: [], error: `Missing tracker file: ${TRACKER_PATH}` };
  }

  try {
    const raw = fs.readFileSync(TRACKER_PATH, "utf8");
    const parsed = JSON.parse(raw);
    const entries = Array.isArray(parsed) ? parsed : parsed.assets;
    if (!Array.isArray(entries)) {
      return { ok: false, entries: [], error: "Tracker must be an array or contain an assets array." };
    }
    return { ok: true, entries, error: null };
  } catch (err) {
    return { ok: false, entries: [], error: `Tracker JSON is invalid: ${err.message}` };
  }
}

function run() {
  console.log("=========================================");
  console.log(" Zodiac Weekly Visual Assets Validator");
  console.log("=========================================\n");

  const tracker = readTracker();
  if (!tracker.ok) {
    console.log(`[ERROR] ${tracker.error}`);
    process.exit(1);
  }

  const expectedTotal = ZODIAC_WEEKLY_CHANNELS.length * ZODIAC_WEEKDAYS.length;
  const expectedKeys = new Set();
  const trackerKeys = new Set();
  const report = {};
  const missingFiles = [];
  const missingTrackerEntries = [];
  const duplicateTrackerEntries = [];
  let foundFiles = 0;

  for (const channel of ZODIAC_WEEKLY_CHANNELS) {
    report[channel] = { found: 0, total: ZODIAC_WEEKDAYS.length, missing: [] };

    for (const weekday of ZODIAC_WEEKDAYS) {
      const key = `${channel}:${weekday}`;
      expectedKeys.add(key);
      const expectedPath = path.join(process.cwd(), "public", "assets", "zodiac-weekly", channel, `${weekday}.jpg`);

      if (fs.existsSync(expectedPath) && fs.statSync(expectedPath).isFile()) {
        report[channel].found++;
        foundFiles++;
      } else {
        report[channel].missing.push(`${weekday}.jpg`);
        missingFiles.push(`public/assets/zodiac-weekly/${channel}/${weekday}.jpg`);
      }
    }
  }

  for (const entry of tracker.entries) {
    const channel = entry.channel || entry.sign;
    const key = `${channel}:${entry.weekday}`;
    if (trackerKeys.has(key)) {
      duplicateTrackerEntries.push(key);
    }
    trackerKeys.add(key);
  }

  for (const key of expectedKeys) {
    if (!trackerKeys.has(key)) {
      missingTrackerEntries.push(key);
    }
  }

  console.log("--- PER-CHANNEL WEEKLY COMPLETENESS ---");
  for (const channel of ZODIAC_WEEKLY_CHANNELS) {
    const item = report[channel];
    const status = item.found === item.total ? "COMPLETE" : "WAITING FOR IMAGES";
    console.log(`${channel.padEnd(16)} | ${item.found}/${item.total} | ${status}`);
    if (item.missing.length > 0) {
      console.log(`  missing: ${item.missing.join(", ")}`);
    }
  }

  console.log("\n--- TRACKER ---");
  console.log(`Tracker entries     : ${tracker.entries.length}/${expectedTotal}`);
  console.log(`Missing tracker keys: ${missingTrackerEntries.length}`);
  console.log(`Duplicate keys      : ${duplicateTrackerEntries.length}`);

  console.log("\n--- SUMMARY ---");
  console.log(`Expected images: ${expectedTotal}`);
  console.log(`Found images   : ${foundFiles}`);
  console.log(`Missing images : ${missingFiles.length}`);

  if (missingFiles.length > 0) {
    console.log("\nMissing files:");
    for (const file of missingFiles) {
      console.log(`- ${file}`);
    }
  }

  if (missingTrackerEntries.length > 0 || duplicateTrackerEntries.length > 0) {
    console.log("\n[ERROR] Tracker does not match the 91 expected channel/weekday entries.");
    process.exit(1);
  }

  if (foundFiles === expectedTotal) {
    console.log("\n[SUCCESS] All weekly zodiac visual assets are present.");
  } else {
    console.log("\n[READY] Weekly asset system is configured. Generate the missing images when ready.");
  }

  // Missing images are not fatal while the weekly pack is being generated.
  process.exit(0);
}

run();
