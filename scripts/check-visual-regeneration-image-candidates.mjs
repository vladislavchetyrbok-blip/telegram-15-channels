import { getVisualRegenerationImageCandidateStatus } from "./lib/visual-regeneration-images.mjs";

const report = await getVisualRegenerationImageCandidateStatus();
console.log(JSON.stringify(report, null, 2));
process.exit(report.status === "error" ? 1 : 0);
