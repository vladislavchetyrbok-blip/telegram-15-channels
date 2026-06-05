import { reviewRegenerationDraft } from "./lib/regeneration-drafts.mjs";

const args = parseArgs(process.argv.slice(2));
const action = getAction(args);

if (!action) {
  console.error("Choose exactly one action: --approve, --reject, or --needs-changes. No regeneration drafts were changed.");
  process.exit(1);
}

if (!args.draftId) {
  console.error("Missing required --draft-id=draft_... value. No regeneration drafts were changed.");
  process.exit(1);
}

const result = await reviewRegenerationDraft({
  draftId: args.draftId,
  action,
  note: args.note,
});

console.log(JSON.stringify(result, null, 2));

if (!result.ok) {
  process.exitCode = 1;
}

function parseArgs(argv) {
  const parsed = {
    approve: false,
    reject: false,
    needsChanges: false,
    draftId: "",
    note: undefined,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--approve") parsed.approve = true;
    else if (arg === "--reject") parsed.reject = true;
    else if (arg === "--needs-changes") parsed.needsChanges = true;
    else if (arg === "--draft-id") parsed.draftId = argv[index + 1] ?? "";
    else if (arg.startsWith("--draft-id=")) parsed.draftId = arg.slice("--draft-id=".length);
    else if (arg === "--note") {
      parsed.note = argv[index + 1] ?? "";
      index += 1;
    } else if (arg.startsWith("--note=")) {
      parsed.note = arg.slice("--note=".length);
    }
  }

  return parsed;
}

function getAction(args) {
  const actions = [
    args.approve ? "approve" : null,
    args.reject ? "reject" : null,
    args.needsChanges ? "needs_changes" : null,
  ].filter(Boolean);

  return actions.length === 1 ? actions[0] : null;
}
