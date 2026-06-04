import { compareJsonSupabaseStore } from "./lib/store-compare.mjs";

const report = await compareJsonSupabaseStore({ loadEnv: true });

console.log(JSON.stringify(report, null, 2));

if (report.status === "error") {
  process.exitCode = 1;
}
