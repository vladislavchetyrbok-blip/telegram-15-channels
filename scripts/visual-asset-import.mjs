import { getManualAssetImportStatus, importManualAsset, previewManualAssetImport } from "./lib/visual-provider-system.mjs";

const args = parseArgs(process.argv.slice(2));
const mode = getMode(args);

if (!mode) {
  console.error("Choose exactly one mode: --dry-run, --import, or --status. No files were changed.");
  process.exit(1);
}

const result = mode === "dry-run"
  ? await previewManualAssetImport({ draftId: args.draftId })
  : mode === "import"
    ? await importManualAsset({ draftId: args.draftId })
    : await getManualAssetImportStatus();

console.log(JSON.stringify(result, null, 2));

if (result.ok === false) process.exitCode = 1;

function parseArgs(argv) {
  const parsed = { dryRun: false, import: false, status: false, draftId: "" };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--dry-run") parsed.dryRun = true;
    else if (arg === "--import") parsed.import = true;
    else if (arg === "--status") parsed.status = true;
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
  const modes = [args.dryRun ? "dry-run" : null, args.import ? "import" : null, args.status ? "status" : null].filter(Boolean);
  return modes.length === 1 ? modes[0] : null;
}

