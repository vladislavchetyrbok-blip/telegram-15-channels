import child_process from "child_process";
import process from "process";
import { loadLedger, acquireLock, releaseLock, markPending, markSent, markFailed, getPublishKey } from "./lib/zodiac-publish-ledger.mjs";
import { resolveZodiacWeeklyVisualAsset } from "./zodiac-weekly-asset-resolver.mjs";

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    date: null,
    dryRun: false,
    live: false,
    approved: false
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--date") options.date = args[++i];
    else if (args[i] === "--dry-run") options.dryRun = true;
    else if (args[i] === "--live") options.live = true;
    else if (args[i] === "--approved") options.approved = true;
  }
  return options;
}

const ZODIAC_SLUGS = [
  "zodiac-general", "aries", "taurus", "gemini", "cancer", "leo", 
  "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
];

function main() {
  const options = parseArgs();
  
  if (!options.date) {
    console.error("Error: --date YYYY-MM-DD is required.");
    process.exit(1);
  }
  if (!options.dryRun && !options.live) {
    console.error("Error: Must specify either --dry-run or --live");
    process.exit(1);
  }
  if (options.live && !options.approved) {
    console.error("Error: --live requires --approved");
    process.exit(1);
  }

  console.log(`=== Zodiac Publish By Date Orchestrator ===`);
  console.log(`Target Date : ${options.date}`);
  console.log(`Mode        : ${options.dryRun ? "DRY-RUN" : "LIVE"}`);
  console.log(`=========================================`);

  if (options.live) {
    try {
      acquireLock();
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
  }

  try {
    const ledger = loadLedger();
    
    for (const slug of ZODIAC_SLUGS) {
      const key = getPublishKey(options.date, slug);
      const entry = ledger.entries[key];
      const status = entry ? entry.status : null;
      
      const asset = resolveZodiacWeeklyVisualAsset(slug, options.date, "weekly");
      const mediaMode = asset.path ? "image" : "text_only";

      if (status === "sent") {
        console.log(`[skip_sent] ${slug} | ${options.date} | Mode: ${mediaMode}`);
        continue;
      }
      if (status === "pending") {
        console.log(`[skip_pending] ${slug} | ${options.date} | Mode: ${mediaMode} (protected)`);
        continue;
      }

      if (options.dryRun) {
        console.log(`[dry_run_would_publish] ${slug} | ${options.date} | Mode: ${mediaMode}`);
        continue;
      }

      // Live publish logic
      console.log(`[pending] ${slug} | ${options.date} | Mode: ${mediaMode}`);
      markPending(options.date, slug, { mediaMode, source: "pipeline" });

      try {
        const cmd = `npm run zodiac:pipeline -- --start-date ${options.date} --days 1 --style luxury-mystic --channel ${slug} --limit 1 --live --approved`;
        // Use stdio inherit so we can see the pipeline output if it fails
        child_process.execSync(cmd, { stdio: 'inherit' });
        
        console.log(`[sent] ${slug} | ${options.date}`);
        markSent(options.date, slug, { mediaMode, source: "pipeline" });
      } catch (err) {
        console.error(`[failed] ${slug} | ${options.date} - Error executing pipeline`);
        markFailed(options.date, slug, { mediaMode, source: "pipeline", error: err.message });
      }
    }
  } finally {
    if (options.live) {
      releaseLock();
    }
  }
}

main();
