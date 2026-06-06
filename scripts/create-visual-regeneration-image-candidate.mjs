import { createVisualRegenerationImageCandidate, previewVisualRegenerationImageCandidate } from "./lib/visual-regeneration-images.mjs";

const args = new Set(process.argv.slice(2));
const create = args.has("--create");
const dryRun = args.has("--dry-run") || !create;
const confirmed = args.has("--confirm-visual-image-create");

if (create && !confirmed) {
  console.log(JSON.stringify({
    ok: false,
    status: "blocked",
    mode: "create",
    message: "Creating a visual image candidate requires --confirm-visual-image-create. No files were created.",
    telegramRealSendWasNotRun: true,
    githubActionsWereNotTriggered: true,
    publishedPostsChanged: false,
  }, null, 2));
  process.exit(1);
}

const report = dryRun
  ? await previewVisualRegenerationImageCandidate()
  : await createVisualRegenerationImageCandidate();

console.log(JSON.stringify(report, null, 2));
process.exit(report.status === "error" || report.status === "blocked" ? 1 : 0);
