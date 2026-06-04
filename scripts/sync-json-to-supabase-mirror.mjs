import { runMirrorSync } from "./lib/mirror-sync.mjs";

const apply = process.argv.includes("--apply");
const dryRun = process.argv.includes("--dry-run") || !apply;
const confirm = process.argv.includes("--confirm-mirror-sync") || process.env.CONFIRM_MIRROR_SYNC === "true";

if (apply && dryRun && process.argv.includes("--dry-run")) {
  console.log(JSON.stringify({
    ok: false,
    status: "error",
    mode: "invalid",
    problem: "Use either --dry-run or --apply, not both.",
  }, null, 2));
  process.exitCode = 1;
} else {
  const report = await runMirrorSync({ apply, confirm, loadEnv: true });
  console.log(JSON.stringify(report, null, 2));
  if (report.status === "error") {
    process.exitCode = 1;
  }
}
