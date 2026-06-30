import process from "process";
import {
  createVideoPackPlan,
  writeSocialVideoPackBundle,
} from "./lib/social-video-production-pack-generator.mjs";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    scope: "date",
    date: today(),
    startDate: today(),
    days: 7,
    dryRun: false,
  };
  const errors = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--date") {
      options.date = args[++index] ?? "";
      options.scope = "date";
    } else if (arg === "--queue") {
      options.scope = "queue";
    } else if (arg === "--start") {
      options.startDate = args[++index] ?? "";
    } else if (arg === "--days") {
      options.days = Number(args[++index] ?? "");
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else {
      errors.push(`Unknown argument: ${arg}`);
    }
  }

  if (options.scope === "date" && !/^\d{4}-\d{2}-\d{2}$/.test(options.date)) {
    errors.push("Missing or invalid --date YYYY-MM-DD.");
  }
  if (options.scope === "queue" && !/^\d{4}-\d{2}-\d{2}$/.test(options.startDate)) {
    errors.push("Missing or invalid --start YYYY-MM-DD.");
  }
  if (options.scope === "queue" && ![7, 14].includes(options.days)) {
    errors.push("Missing or invalid --days 7|14.");
  }

  return { options, errors };
}

function printPlan(plan, mode, result = null) {
  console.log("=== Social Phase 1 Video Production Packs ===");
  console.log(`Mode               : ${mode}`);
  console.log(`Scope              : ${plan.scope}`);
  if (plan.scope === "date") console.log(`Date               : ${plan.date}`);
  if (plan.scope === "queue") {
    console.log(`Start Date         : ${plan.startDate}`);
    console.log(`End Date           : ${plan.endDate}`);
  }
  console.log(`Days               : ${plan.days}`);
  console.log(`Output Root        : ${plan.outputRoot}`);
  console.log(`Video Packs        : ${result?.videoPacks ?? plan.videoPacks}`);
  console.log(`CTA Safety         : ${result?.ctaSafe ?? plan.ctaSafe}`);
  console.log(`VIP/Payment Safety : ${result?.vipPaymentSafe ?? plan.vipPaymentSafe}`);
  console.log("Instagram API      : not connected");
  console.log("TikTok API         : not connected");
  console.log("Posting            : manual video production only");
  console.log("Telegram Live      : not touched");
  console.log(`Files Written      : ${result ? result.written.length : 0}`);
  console.log("=============================================");
}

function main() {
  const { options, errors } = parseArgs();
  if (errors.length > 0) {
    for (const error of errors) console.error(error);
    process.exit(1);
  }

  const plan = createVideoPackPlan(options);
  if (options.dryRun) {
    printPlan(plan, "DRY-RUN");
    return;
  }

  const result = writeSocialVideoPackBundle(options);
  printPlan(plan, "WRITE", result);
}

main();
