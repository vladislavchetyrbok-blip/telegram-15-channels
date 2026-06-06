import { getVisualProviderStatus } from "./lib/visual-provider-system.mjs";

const result = await getVisualProviderStatus();
console.log(JSON.stringify(result, null, 2));

if (result.status === "error") process.exitCode = 1;

