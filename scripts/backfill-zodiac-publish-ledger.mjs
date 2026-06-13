import { markSent, acquireLock, releaseLock } from "./lib/zodiac-publish-ledger.mjs";

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    apply: false,
    date: null
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--apply") {
      options.apply = true;
    } else if (args[i] === "--date") {
      options.date = args[++i];
    }
  }

  return options;
}

const ZODIAC_SLUGS = [
  "zodiac-general", "aries", "taurus", "gemini", "cancer", 
  "leo", "virgo", "libra", "scorpio", "sagittarius", 
  "capricorn", "aquarius", "pisces"
];

const IMAGE_SLUGS = new Set([
  "zodiac-general", "aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra"
]);

function getMediaMode(slug) {
  return IMAGE_SLUGS.has(slug) ? "image" : "text_only";
}

function main() {
  const options = parseArgs();

  if (!options.date) {
    console.error("Error: --date is required. Example: --date 2026-06-13");
    process.exit(1);
  }

  console.log(`=== Backfill Zodiac Publish Ledger ===`);
  console.log(`Target Date : ${options.date}`);
  console.log(`Mode        : ${options.apply ? "APPLY" : "DRY-RUN (use --apply to execute)"}`);
  console.log(`======================================`);

  if (options.apply) {
    try {
      acquireLock();
    } catch (err) {
      console.error(err.message);
      process.exit(1);
    }
  }

  let backfilled = 0;

  for (const slug of ZODIAC_SLUGS) {
    const mediaMode = getMediaMode(slug);
    const metadata = {
      mediaMode,
      source: "manual_backfill"
    };

    if (options.apply) {
      markSent(options.date, slug, metadata);
    }
    
    console.log(`[${options.apply ? "APPLIED" : "DRY-RUN"}] Backfilled ${slug} for ${options.date} (Mode: ${mediaMode})`);
    backfilled++;
  }

  if (options.apply) {
    releaseLock();
  }

  console.log(`======================================`);
  console.log(`Total slugs processed: ${backfilled}`);
  if (!options.apply) {
    console.log(`NOTE: This was a dry-run. No changes were made to the ledger.`);
  } else {
    console.log(`Ledger successfully updated.`);
  }
}

main();
