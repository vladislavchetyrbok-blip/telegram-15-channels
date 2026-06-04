import { createSystemBackup } from "./lib/backup-center.mjs";

const report = await createSystemBackup();
console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exitCode = 1;
