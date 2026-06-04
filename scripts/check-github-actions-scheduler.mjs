import { getActionsSchedulerMonitorReport } from "./lib/actions-scheduler-monitor.mjs";

const report = await getActionsSchedulerMonitorReport({ loadEnv: true });

console.log(JSON.stringify(report, null, 2));

if (report.status === "error") {
  process.exitCode = 1;
}
