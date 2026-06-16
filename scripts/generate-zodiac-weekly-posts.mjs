import process from "process";
import { generateWeeklyPosts } from "./lib/zodiac-weekly-pipeline.mjs";

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { week: null };
  const errors = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--week") options.week = args[++index] ?? null;
    else errors.push(`Unknown argument: ${arg}`);
  }

  if (!options.week) errors.push("Missing --week YYYY-Www.");
  return { options, errors };
}

function main() {
  const { options, errors } = parseArgs();
  if (errors.length > 0) {
    errors.forEach((error) => console.error(error));
    process.exit(1);
  }

  const plan = generateWeeklyPosts(options.week);

  console.log("=== Zodiac Weekly Post Generator ===");
  console.log(`Week              : ${plan.week}`);
  console.log(`Period            : ${plan.startDate} -> ${plan.endDate}`);
  console.log(`Posts             : ${plan.posts.length}`);
  console.log("External AI Calls : 0");
  console.log("Telegram API Calls: 0");
  console.log("Ledger Writes     : 0");
  console.log("====================================");

  for (const post of plan.posts) {
    console.log("");
    console.log(`--- ${post.slug} ---`);
    console.log(`Media             : ${post.mediaMode}`);
    console.log(`Buttons           : ${post.buttonStatus.buttonCount} (${post.buttonStatus.ok ? "OK" : "PROBLEMS"})`);
    console.log(post.text);
  }
}

main();
