import { applyRegenerationDraft, previewRegenerationDraftApply } from "./lib/regeneration-drafts.mjs";

const args = parseArgs(process.argv.slice(2));
const mode = getMode(args);

if (!mode) {
  console.error("Choose exactly one mode: --dry-run or --apply. No posts or drafts were changed.");
  process.exit(1);
}

if (!args.draftId) {
  console.error("Missing required --draft-id=draft_... value. No posts or drafts were changed.");
  process.exit(1);
}

if (mode === "apply" && !args.confirmDraftApply) {
  console.error("Confirmed apply requires --confirm-draft-apply. No posts or drafts were changed.");
  process.exit(1);
}

const result =
  mode === "apply"
    ? await applyRegenerationDraft({ draftId: args.draftId, confirm: args.confirmDraftApply })
    : await previewRegenerationDraftApply({ draftId: args.draftId });

console.log(JSON.stringify(result, null, 2));

if (!result.ok) {
  process.exitCode = 1;
}

function parseArgs(argv) {
  const parsed = {
    dryRun: false,
    apply: false,
    confirmDraftApply: false,
    draftId: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--dry-run") parsed.dryRun = true;
    else if (arg === "--apply") parsed.apply = true;
    else if (arg === "--confirm-draft-apply") parsed.confirmDraftApply = true;
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
  const modes = [args.dryRun ? "dry-run" : null, args.apply ? "apply" : null].filter(Boolean);
  return modes.length === 1 ? modes[0] : null;
}
