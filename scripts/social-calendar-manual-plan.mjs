import process from "process";
import { createCalendarPlan, writeSocialCalendar } from "./lib/social-manual-calendar-generator.mjs";

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    startDate: new Date().toISOString().slice(0, 10),
    days: 7,
    dryRun: false,
  };
  const errors = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--start") options.startDate = args[++index] ?? "";
    else if (arg === "--days") options.days = Number(args[++index] ?? "");
    else if (arg === "--dry-run") options.dryRun = true;
    else errors.push(`Unknown argument: ${arg}`);
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(options.startDate)) errors.push("Missing or invalid --start YYYY-MM-DD.");
  if (![7, 14].includes(options.days)) errors.push("Missing or invalid --days 7|14.");
  return { options, errors };
}

function printPlan(plan, mode, result = null) {
  console.log("=== Social Phase 1 Manual Calendar Generator ===");
  console.log(`Mode               : ${mode}`);
  console.log(`Start Date         : ${plan.startDate}`);
  console.log(`End Date           : ${plan.endDate}`);
  console.log(`Days               : ${plan.days}`);
  console.log(`Output Root        : ${plan.outputRoot}`);
  console.log(`JSON               : ${plan.jsonPath}`);
  console.log(`Markdown           : ${plan.markdownPath}`);
  console.log(`Instagram Items    : ${result?.instagramItems ?? plan.instagramItems}`);
  console.log(`TikTok Items       : ${result?.tiktokItems ?? plan.tiktokItems}`);
  console.log(`Content Types      : ${plan.contentTypes.join(", ")}`);
  console.log("Instagram API      : not connected");
  console.log("TikTok API         : not connected");
  console.log("Posting            : manual calendar only");
  console.log("Telegram Live      : not touched");
  console.log(`Files Written      : ${result ? result.written.length : 0}`);
  console.log("===============================================");
}

function main() {
  const { options, errors } = parseArgs();
  if (errors.length > 0) {
    for (const error of errors) console.error(error);
    process.exit(1);
  }

  const plan = createCalendarPlan({ startDate: options.startDate, days: options.days });
  if (options.dryRun) {
    printPlan(plan, "DRY-RUN");
    return;
  }

  const result = writeSocialCalendar({ startDate: options.startDate, days: options.days });
  printPlan(plan, "WRITE", result);
}

main();
