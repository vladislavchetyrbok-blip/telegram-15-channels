import { getContentPresentationReport } from "./lib/content-presentation.mjs";

const report = await getContentPresentationReport();

console.log(JSON.stringify({
  status: report.status,
  checkedPosts: report.checkedPosts,
  issues: report.issues,
  recommendations: report.recommendations,
  sampleImprovedPosts: report.sampleImprovedPosts,
  summary: report.summary,
  richText: report.richText,
  lastCheckedAt: report.lastCheckedAt,
}, null, 2));

if (report.status === "error") {
  process.exitCode = 1;
}
