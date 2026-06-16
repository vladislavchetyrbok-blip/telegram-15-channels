import process from "process";
import path from "path";
import {
  generateCompatibilityPost,
  getCompatibilityLedgerEntry,
  getGeneralChannelEnv,
  isProtectedCompatibilityStatus,
  loadCompatibilityLedger,
  markCompatibilityEntry,
  normalizeCompatibilityStatus,
  selectCompatibilityPairs,
  todayKyivDate,
  validateCompatibilityKeyboard,
  validateDateString,
} from "./lib/zodiac-compatibility-pipeline.mjs";

function parseArgs() {
  const args = process.argv.slice(2);
  const options = { pair: null, date: todayKyivDate(), dryRun: false, live: false, approved: false };
  const errors = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--pair") options.pair = args[++index] ?? null;
    else if (arg === "--date") options.date = args[++index] ?? null;
    else if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--live") options.live = true;
    else if (arg === "--approved") options.approved = true;
    else errors.push(`Unknown argument: ${arg}`);
  }

  if (!options.pair) errors.push("Missing --pair pair-id.");
  if (!validateDateString(options.date)) errors.push("Invalid --date YYYY-MM-DD.");
  if (!options.dryRun && !options.live) options.dryRun = true;
  if (options.dryRun && options.live) errors.push("Use either --dry-run or --live, not both.");
  if (options.live && !options.approved) errors.push("Live mode requires --approved.");

  return { options, errors };
}

function printPreview({ post, date, action, ledgerStatus, mode, keyboardStatus }) {
  console.log("=== Zodiac Compatibility Publish ===");
  console.log(`Mode              : ${mode}`);
  console.log(`Target Channel    : general`);
  console.log(`Date              : ${date}`);
  console.log(`Pair              : ${post.pairId}`);
  console.log(`Score             : ${post.score}/100`);
  console.log(`Element Dynamic   : ${post.elementDynamic}`);
  console.log(`Action            : ${action}`);
  console.log(`Ledger Status     : ${ledgerStatus}`);
  console.log(`Button Status     : ${keyboardStatus.ok ? "OK" : "PROBLEMS"}`);
  console.log(`Button Count      : ${keyboardStatus.buttonCount}`);
  console.log("");
  console.log("--- Message Preview ---");
  console.log(post.text);
  console.log("");
  console.log("--- Inline Keyboard Preview ---");
  post.keyboard.inline_keyboard.forEach((row, index) => {
    const display = row.map((button) => `${button.text} -> ${button.url}`).join(" | ");
    console.log(`Row ${index + 1}: ${display}`);
  });
  if (keyboardStatus.errors.length > 0) {
    console.log("--- Button Errors ---");
    keyboardStatus.errors.forEach((error) => console.log(`- ${error}`));
  }
  console.log(`Telegram API Calls: ${mode === "DRY-RUN" ? 0 : "pending live execution"}`);
  console.log(`Ledger Writes     : ${mode === "DRY-RUN" ? 0 : "pending live execution"}`);
  console.log("====================================");
}

function loadLocalEnvForLive() {
  for (const fileName of [".env.local", ".env"]) {
    try {
      process.loadEnvFile(path.resolve(process.cwd(), fileName));
    } catch {
      // Optional local env files may be absent in CI or operator environments.
    }
  }
}

async function postTelegramJson({ token, method, body }) {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.ok) {
    throw new Error(result?.description || `Telegram ${method} returned HTTP ${response.status}`);
  }
  return result.result;
}

async function publishLive({ post, date }) {
  loadLocalEnvForLive();
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const envName = getGeneralChannelEnv();
  const chatId = process.env[envName]?.trim();
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is missing.");
  if (!chatId) throw new Error(`${envName} is missing.`);

  markCompatibilityEntry(date, post.pairId, "locked", { target: "general", score: post.score });
  try {
    const message = await postTelegramJson({
      token,
      method: "sendMessage",
      body: {
        chat_id: chatId,
        text: post.text,
        reply_markup: post.keyboard,
      },
    });
    markCompatibilityEntry(date, post.pairId, "sent", {
      target: "general",
      score: post.score,
      messageId: message.message_id ?? null,
      sentAt: new Date().toISOString(),
    });
    console.log(`[sent] ${post.pairId} | message_id=${message.message_id ?? "unknown"}`);
    console.log("Telegram API Calls: 1");
    console.log("Ledger Writes     : 2");
  } catch (error) {
    markCompatibilityEntry(date, post.pairId, "failed", {
      target: "general",
      score: post.score,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

async function main() {
  const { options, errors } = parseArgs();
  if (errors.length > 0) {
    errors.forEach((error) => console.error(error));
    process.exit(1);
  }

  const [pair] = selectCompatibilityPairs({ pairId: options.pair });
  const post = generateCompatibilityPost(pair);
  const keyboardStatus = validateCompatibilityKeyboard(post);
  const ledger = loadCompatibilityLedger();
  const entry = getCompatibilityLedgerEntry(ledger, options.date, post.pairId);
  const ledgerStatus = normalizeCompatibilityStatus(entry?.status) || "missing";
  const duplicateBlocked = isProtectedCompatibilityStatus(ledgerStatus);
  const action = duplicateBlocked ? "skip_duplicate" : ledgerStatus === "failed" ? "skip_failed_requires_review" : options.dryRun ? "dry_run_would_publish" : "publish_live";
  const mode = options.live ? "LIVE" : "DRY-RUN";

  printPreview({ post, date: options.date, action, ledgerStatus, mode, keyboardStatus });

  if (!keyboardStatus.ok) throw new Error("Compatibility keyboard validation failed.");
  if (duplicateBlocked || ledgerStatus === "failed") return;
  if (options.dryRun) return;

  await publishLive({ post, date: options.date });
}

main().catch((error) => {
  console.error(`Unable to process zodiac compatibility publish: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
