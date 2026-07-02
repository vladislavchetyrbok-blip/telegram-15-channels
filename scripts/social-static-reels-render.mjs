import process from "process";
import {
  createStaticReelsPlan,
  writeStaticReelsBundle,
} from "./lib/social-static-reels-generator.mjs";

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    startDate: "2026-07-02",
    days: 7,
    pilotOnly: false,
    audioPath: null,
    dryRun: false,
  };
  const errors = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--start") {
      options.startDate = args[++index] ?? "";
    } else if (arg === "--days") {
      options.days = Number(args[++index] ?? "");
    } else if (arg === "--pilot") {
      options.pilotOnly = true;
    } else if (arg === "--queue") {
      options.pilotOnly = false;
    } else if (arg === "--reference") {
      options.reference = true;
    } else if (arg === "--audio") {
      options.audioPath = args[++index] ?? "";
    } else if (arg === "--dry-run") {
      options.dryRun = true;
    } else {
      errors.push(`Unknown argument: ${arg}`);
    }
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(options.startDate)) errors.push("Missing or invalid --start YYYY-MM-DD.");
  if (![7, 14].includes(options.days)) errors.push("Missing or invalid --days 7|14.");
  return { options, errors };
}

function printPlan({ plan, mode, result = null }) {
  console.log("=== Social Phase 1 Package H Static Reels ===");
  console.log(`Mode                  : ${mode}`);
  console.log(`Start Date            : ${plan.startDate}`);
  console.log(`End Date              : ${plan.endDate}`);
  console.log(`Days                  : ${plan.days}`);
  console.log(`Scope                 : ${plan.pilotOnly ? "pilot" : "queue"}`);
  if (plan.selectedItem) console.log(`Selected Item         : ${plan.selectedItem}`);
  if (plan.selectedItemId) console.log(`Selected Item ID      : ${plan.selectedItemId}`);
  if (plan.selectedOutputFolder) console.log(`Selected Output       : ${plan.selectedOutputFolder}`);
  if (plan.referenceImagePath) console.log(`Reference Image       : ${plan.referenceImagePath}`);
  if (plan.referenceImagePath) console.log(`Reference Found       : ${plan.referenceImageFound ? "Yes" : "No"}`);
  console.log(`Output Root           : ${result?.outputRoot ?? plan.outputRoot}`);
  console.log(`Planned Videos        : ${plan.plannedVideos}`);
  console.log(`Resolution            : ${plan.targetResolution}`);
  console.log(`Duration              : ${plan.targetDurationSeconds}s`);
  console.log("Motion                : subtle slow Ken Burns zoom");
  console.log(`Extra Overlay Text    : ${plan.extraOverlayText ?? "none"}`);
  console.log("Music                 : manual suggestion only by default");
  console.log("External AI APIs      : none");
  console.log("Instagram API         : not connected");
  console.log("TikTok API            : not connected");
  console.log("Posting               : none");
  console.log("Telegram Live         : not touched");
  console.log(`Videos Written        : ${result ? result.videosGenerated : 0}`);
  console.log("==============================================");
}

async function main() {
  const { options, errors } = parseArgs();
  if (errors.length > 0) {
    for (const error of errors) console.error(error);
    process.exit(1);
  }

  const plan = createStaticReelsPlan(options);
  if (options.dryRun) {
    printPlan({ plan, mode: "DRY-RUN" });
    return;
  }

  const result = await writeStaticReelsBundle(options);
  printPlan({ plan, mode: "WRITE", result });
}

main().catch((error) => {
  console.error("Social Static Reels Renderer: FAIL");
  console.error(error.message);
  process.exit(1);
});
