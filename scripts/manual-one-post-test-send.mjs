import { getManualOnePostTestSendStatus, sendManualOnePostTest } from "./lib/manual-one-post-test-send.mjs";

const args = parseArgs(process.argv.slice(2));
const postId = args["post-id"] ?? null;
const dryRun = Boolean(args["dry-run"]);
const send = Boolean(args.send);
const confirm = Boolean(args["confirm-one-post-send"]);

if (send && dryRun) {
  console.error(JSON.stringify({ ok: false, sent: false, errors: ["Choose either --dry-run or --send, not both."] }, null, 2));
  process.exit(1);
}

if (send) {
  const result = await sendManualOnePostTest({ postId, confirm });
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
} else {
  const report = await getManualOnePostTestSendStatus({ postId });
  console.log(JSON.stringify(report, null, 2));
  if (report.status === "error") process.exitCode = 1;
}

function parseArgs(rawArgs) {
  const parsed = {};
  for (const arg of rawArgs) {
    if (!arg.startsWith("--")) continue;
    const [key, ...valueParts] = arg.slice(2).split("=");
    parsed[key] = valueParts.length ? valueParts.join("=") : true;
  }
  return parsed;
}
