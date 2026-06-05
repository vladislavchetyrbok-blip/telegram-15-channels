import { getPostSendVerificationReport } from "./lib/post-send-verification.mjs";

const args = parseArgs(process.argv.slice(2));
const postId = args["post-id"] ?? null;
const report = await getPostSendVerificationReport({ postId });

console.log(JSON.stringify(report, null, 2));

if (report.status === "error") {
  process.exitCode = 1;
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
