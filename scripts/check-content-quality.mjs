import { getContentQualityReport } from "./lib/content-quality.mjs";

const report = await getContentQualityReport();

console.log(JSON.stringify(report, null, 2));

if (report.status === "error") {
  process.exitCode = 1;
}
