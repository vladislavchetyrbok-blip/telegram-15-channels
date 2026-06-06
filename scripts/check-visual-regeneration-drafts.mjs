import { getVisualRegenerationDraftStatus } from "./lib/visual-regeneration-drafts.mjs";

const report = await getVisualRegenerationDraftStatus();

console.log(JSON.stringify(report, null, 2));

if (report.status === "error") {
  process.exitCode = 1;
}
