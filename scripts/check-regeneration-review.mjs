import { getRegenerationReviewStatus } from "./lib/regeneration-drafts.mjs";

const report = await getRegenerationReviewStatus();

console.log(JSON.stringify(report, null, 2));

if (report.status === "error") {
  process.exitCode = 1;
}
