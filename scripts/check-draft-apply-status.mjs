import { getDraftApplyStatus } from "./lib/regeneration-drafts.mjs";

const report = await getDraftApplyStatus();

console.log(JSON.stringify(report, null, 2));

if (report.status === "error") {
  process.exitCode = 1;
}
