import { restoreBackupDryRun } from "./lib/backup-center.mjs";

const report = await restoreBackupDryRun();
console.log(JSON.stringify(report, null, 2));
if (report.status === "error") process.exitCode = 1;
