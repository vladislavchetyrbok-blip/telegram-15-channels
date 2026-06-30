import process from "process";
import { createGenerationPlan, writeSocialExportBundle } from "./lib/social-manual-export-generator.mjs";

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    date: new Date().toISOString().slice(0, 10),
    dryRun: false,
  };
  const errors = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--date") options.date = args[++index] ?? "";
    else if (arg === "--dry-run") options.dryRun = true;
    else errors.push(`Unknown argument: ${arg}`);
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(options.date)) errors.push("Missing or invalid --date YYYY-MM-DD.");
  return { options, errors };
}

function printPlan(plan, mode, result = null) {
  console.log("=== Social Phase 1 Manual Export Generator ===");
  console.log(`Mode               : ${mode}`);
  console.log(`Date               : ${plan.date}`);
  console.log(`Output Root        : ${plan.outputRoot}`);
  console.log(`Platforms          : ${plan.platforms.length}`);
  for (const platform of plan.platforms) {
    console.log(`- ${platform.platform}: ${platform.itemCount} items`);
    console.log(`  JSON             : ${platform.jsonPath}`);
    console.log(`  Markdown         : ${platform.markdownPath}`);
    console.log(`  Content Types    : ${platform.contentTypes.join(", ")}`);
  }
  console.log("Instagram API      : not connected");
  console.log("TikTok API         : not connected");
  console.log("Posting            : manual export only");
  console.log("Telegram Live      : not touched");
  if (result) {
    console.log(`Files Written      : ${result.written.length}`);
    console.log(`Total Items        : ${result.itemCount}`);
  } else {
    console.log("Files Written      : 0");
  }
  console.log("==============================================");
}

function main() {
  const { options, errors } = parseArgs();
  if (errors.length > 0) {
    for (const error of errors) console.error(error);
    process.exit(1);
  }

  const plan = createGenerationPlan({ date: options.date });
  if (options.dryRun) {
    printPlan(plan, "DRY-RUN");
    return;
  }

  const result = writeSocialExportBundle({ date: options.date });
  printPlan(plan, "WRITE", result);
}

main();
