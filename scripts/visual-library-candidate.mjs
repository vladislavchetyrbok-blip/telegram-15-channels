import { createPremiumLibraryCandidate, getPremiumLibraryStatus, previewPremiumLibraryCandidate } from "./lib/visual-provider-system.mjs";

const args = parseArgs(process.argv.slice(2));
const mode = getMode(args);

if (!mode) {
  console.error("Choose exactly one mode: --status, --dry-run, or --create. No files were changed.");
  process.exit(1);
}

const result = mode === "status"
  ? await getPremiumLibraryStatus()
  : mode === "dry-run"
    ? await previewPremiumLibraryCandidate({ draftId: args.draftId })
    : await createPremiumLibraryCandidate({ draftId: args.draftId });

console.log(JSON.stringify(result, null, 2));

if (result.ok === false) process.exitCode = 1;

function parseArgs(argv) {
  const parsed = { status: false, dryRun: false, create: false, draftId: "" };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--status") parsed.status = true;
    else if (arg === "--dry-run") parsed.dryRun = true;
    else if (arg === "--create") parsed.create = true;
    else if (arg === "--draft-id") {
      parsed.draftId = argv[index + 1] ?? "";
      index += 1;
    } else if (arg.startsWith("--draft-id=")) {
      parsed.draftId = arg.slice("--draft-id=".length);
    }
  }
  return parsed;
}

function getMode(args) {
  const modes = [args.status ? "status" : null, args.dryRun ? "dry-run" : null, args.create ? "create" : null].filter(Boolean);
  return modes.length === 1 ? modes[0] : null;
}

