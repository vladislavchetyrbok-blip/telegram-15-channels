import { getPremiumVisualQualityReport } from "./lib/premium-visual-quality.mjs";

const report = await getPremiumVisualQualityReport({ sampleLimit: 8 });

console.log(JSON.stringify({
  status: report.status,
  productionStoreMode: report.productionStoreMode,
  sourceOfTruth: report.sourceOfTruth,
  summary: report.summary,
  issues: report.issues,
  recommendations: report.recommendations,
  samples: report.samples,
  weakVisuals: report.weakVisuals.slice(0, 20),
  regenerationQueuePreview: report.regenerationQueuePreview,
  lastCheckedAt: report.lastCheckedAt,
}, null, 2));

if (report.status === "error") {
  process.exitCode = 1;
}
