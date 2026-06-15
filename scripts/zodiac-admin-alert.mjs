import process from "process";
import { loadLocalEnvFiles } from "./lib/zodiac-autonomy.mjs";

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    message: null,
    dryRun: false,
    send: false,
    approved: false,
  };
  const errors = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--message") options.message = args[++i] ?? null;
    else if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--send") options.send = true;
    else if (arg === "--approved") options.approved = true;
    else errors.push(`Unknown argument: ${arg}`);
  }

  if (!options.dryRun && !options.send) options.dryRun = true;
  if (options.dryRun && options.send) errors.push("Use either --dry-run or --send, not both.");
  if (options.send && !options.approved) errors.push("--send requires --approved.");
  if (!String(options.message || "").trim()) errors.push("--message is required.");

  return { options, errors };
}

async function main() {
  loadLocalEnvFiles();
  const { options, errors } = parseArgs();
  if (errors.length > 0) {
    errors.forEach((error) => console.error(error));
    process.exit(1);
  }

  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.ZODIAC_ADMIN_ALERT_CHAT_ID?.trim();
  console.log("=== Zodiac Admin Alert ===");
  console.log(`Mode             : ${options.dryRun ? "DRY-RUN" : "SEND"}`);
  console.log(`Token Configured : ${Boolean(token)}`);
  console.log(`Chat Configured  : ${Boolean(chatId)}`);

  if (options.dryRun) {
    console.log("Telegram API Calls: 0");
    console.log("==========================");
    return;
  }

  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is missing.");
  if (!chatId) throw new Error("ZODIAC_ADMIN_ALERT_CHAT_ID is missing.");

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: options.message }),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.ok) {
    throw new Error(body?.description || `Telegram API returned ${response.status}`);
  }

  console.log("Alert Sent       : yes");
  console.log("Telegram API Calls: 1");
  console.log("==========================");
}

main().catch((error) => {
  console.error(`Unable to send zodiac admin alert: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
