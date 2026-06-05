import { getFinalPublishPreviewReport } from "./lib/final-publish-preview.mjs";

const report = await getFinalPublishPreviewReport();

console.log(JSON.stringify(report, null, 2));

if (report.status === "error") {
  process.exitCode = 1;
}
