import { getProductionSafetyReport } from "./lib/production-safety-center.mjs";

const report = await getProductionSafetyReport({ loadEnv: true });

console.log(JSON.stringify(report, null, 2));

if (report.status === "error") {
  process.exitCode = 1;
}
