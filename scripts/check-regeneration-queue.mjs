import { getRegenerationQueueReport } from "./lib/regeneration-queue.mjs";

const report = await getRegenerationQueueReport();

console.log(JSON.stringify(report, null, 2));

if (report.status === "error") {
  process.exitCode = 1;
}
