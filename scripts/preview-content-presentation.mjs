import { getContentPresentationPreview } from "./lib/content-presentation.mjs";

const preview = await getContentPresentationPreview({ sampleLimit: 5 });

console.log(JSON.stringify(preview, null, 2));

if (preview.status === "error") {
  process.exitCode = 1;
}
