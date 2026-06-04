import { getOperationalHealthReport } from "./lib/operational-health.mjs";

const report = await getOperationalHealthReport({ loadEnv: true });

console.log(JSON.stringify(report, null, 2));

if (report.status === "error") {
  process.exitCode = 1;
}
