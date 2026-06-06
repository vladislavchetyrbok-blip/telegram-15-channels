import { createVisualRegenerationDrafts, previewVisualRegenerationDraftCreation } from "./lib/visual-regeneration-drafts.mjs";

const args = parseArgs(process.argv.slice(2));
const wantsCreate = args.create;

if (wantsCreate && !args.confirmVisualDraftCreate) {
  console.error("Refusing to create visual regeneration drafts without --confirm-visual-draft-create.");
  process.exit(1);
}

const report = wantsCreate
  ? await createVisualRegenerationDrafts({ limit: args.limit })
  : await previewVisualRegenerationDraftCreation({ limit: args.limit });

console.log(JSON.stringify(report, null, 2));

if (report.status === "error") {
  process.exitCode = 1;
}

function parseArgs(argv) {
  const parsed = {
    create: false,
    confirmVisualDraftCreate: false,
    limit: 2,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--create") parsed.create = true;
    else if (arg === "--dry-run") parsed.create = false;
    else if (arg === "--confirm-visual-draft-create") parsed.confirmVisualDraftCreate = true;
    else if (arg === "--limit") {
      parsed.limit = Number(argv[index + 1] ?? 2);
      index += 1;
    } else if (arg.startsWith("--limit=")) {
      parsed.limit = Number(arg.slice("--limit=".length));
    }
  }

  if (!Number.isFinite(parsed.limit) || parsed.limit < 1) parsed.limit = 2;
  parsed.limit = Math.min(2, Math.max(1, Math.round(parsed.limit)));
  return parsed;
}
