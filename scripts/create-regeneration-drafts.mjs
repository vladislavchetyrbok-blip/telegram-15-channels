import { createRegenerationDrafts, previewRegenerationDraftCreation } from "./lib/regeneration-drafts.mjs";

const args = new Set(process.argv.slice(2));
const wantsCreate = args.has("--create");
const wantsDryRun = args.has("--dry-run") || !wantsCreate;
const confirmed = args.has("--confirm-draft-create");

if (wantsCreate && !confirmed) {
  console.error("Refusing to create regeneration drafts without --confirm-draft-create.");
  process.exit(1);
}

const report = wantsCreate ? await createRegenerationDrafts() : await previewRegenerationDraftCreation();

console.log(JSON.stringify(report, null, 2));

if (wantsDryRun && report.status === "error") {
  process.exitCode = 1;
}

if (wantsCreate && report.status === "error") {
  process.exitCode = 1;
}
