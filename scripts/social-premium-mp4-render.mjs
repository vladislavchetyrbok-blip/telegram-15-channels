import process from "process";
import { getMp4RendererAvailability } from "./lib/social-auto-mp4-generator.mjs";
import {
  createPremiumMp4RenderPlan,
  writeSocialPremiumMp4Bundle,
} from "./lib/social-premium-mp4-generator.mjs";

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

function printPlan({ plan, renderer, mode, result = null }) {
  console.log("=== Social Phase 1 Premium MP4 Renderer ===");
  console.log(`Mode               : ${mode}`);
  console.log(`Scope              : ${plan.scope}`);
  if (plan.scope === "date") console.log(`Date               : ${plan.date}`);
  if (plan.scope === "queue") {
    console.log(`Start Date         : ${plan.startDate}`);
    console.log(`End Date           : ${plan.endDate}`);
  }
  console.log(`Days               : ${plan.days}`);
  console.log(`Output Root        : ${plan.outputRoot}`);
  console.log(`Planned Videos     : ${plan.videoPacks}`);
  console.log(`Resolution         : ${plan.targetResolution}`);
  console.log(`Duration           : ${plan.targetDurationSeconds}s`);
  console.log(`Design FPS         : ${plan.designFps}`);
  console.log(`Output FPS         : ${plan.outputFps}`);
  console.log(`Style Presets      : ${plan.stylePresets.join(", ")}`);
  console.log(`Content Templates  : ${plan.contentTypeTemplates.join(", ")}`);
  console.log(`ffmpeg             : ${renderer.ffmpegAvailable ? "available" : "missing"}`);
  console.log(`ffprobe            : ${renderer.ffprobeAvailable ? "available" : "missing"}`);
  console.log("Technology         : sharp animated SVG/PNG frames + ffmpeg");
  console.log("External APIs      : none");
  console.log("TTS                : none");
  console.log("Audio              : silent/subtitled");
  console.log(`Videos Written     : ${result ? result.videosGenerated : 0}`);
  console.log("============================================");
}

async function main() {
  const { options, errors } = parseArgs();
  if (errors.length > 0) {
    for (const error of errors) console.error(error);
    process.exit(1);
  }

  const plan = createPremiumMp4RenderPlan(options);
  const renderer = await getMp4RendererAvailability();
  if (options.dryRun) {
    printPlan({ plan, renderer, mode: "DRY-RUN" });
    if (!renderer.ffmpegAvailable) {
      console.error(`ffmpeg missing. Install with: ${renderer.installHint}`);
      process.exit(1);
    }
    return;
  }

  const result = await writeSocialPremiumMp4Bundle(options);
  printPlan({ plan, renderer: result.renderer, mode: "WRITE", result });
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
