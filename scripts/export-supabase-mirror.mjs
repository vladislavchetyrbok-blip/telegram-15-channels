import { exportSupabaseMirror } from "./lib/backup-center.mjs";

const report = await exportSupabaseMirror();
console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exitCode = 1;
