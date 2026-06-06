import { getPremiumVisualRegenerationPreview } from "./lib/premium-visual-quality.mjs";

const preview = await getPremiumVisualRegenerationPreview({ sampleLimit: 12 });

console.log(JSON.stringify(preview, null, 2));

if (preview.status === "error") {
  process.exitCode = 1;
}
