import { runBackupRestoreRehearsal } from "./lib/backup-restore-rehearsal.mjs";

const report = await runBackupRestoreRehearsal({ loadEnv: true });
console.log(JSON.stringify(report, null, 2));

if (!report.ok) process.exitCode = 1;
