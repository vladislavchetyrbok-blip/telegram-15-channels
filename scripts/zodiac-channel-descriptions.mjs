import fs from "fs";
import path from "path";
import process from "process";
import { fileURLToPath } from "url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const configPath = path.join(rootDir, "data", "config", "zodiac-channel-descriptions.json");
const linkConfigPath = path.join(rootDir, "data", "config", "zodiac-channel-links.json");
const TELEGRAM_DESCRIPTION_LIMIT = 255;
const FORBIDDEN_PUBLIC_TEXT = [
  "TODO",
  "FIXME",
  "placeholder",
  "test",
  "mock",
  "dry-run",
  "dry run",
  "debug",
  "MVP",
  "internal",
];

const CHANNELS = [
  { slug: "general", env: "ZODIAC_GENERAL_CHANNEL_ID" },
  { slug: "aries", env: "ZODIAC_ARIES_CHANNEL_ID" },
  { slug: "taurus", env: "ZODIAC_TAURUS_CHANNEL_ID" },
  { slug: "gemini", env: "ZODIAC_GEMINI_CHANNEL_ID" },
  { slug: "cancer", env: "ZODIAC_CANCER_CHANNEL_ID" },
  { slug: "leo", env: "ZODIAC_LEO_CHANNEL_ID" },
  { slug: "virgo", env: "ZODIAC_VIRGO_CHANNEL_ID" },
  { slug: "libra", env: "ZODIAC_LIBRA_CHANNEL_ID" },
  { slug: "scorpio", env: "ZODIAC_SCORPIO_CHANNEL_ID" },
  { slug: "sagittarius", env: "ZODIAC_SAGITTARIUS_CHANNEL_ID" },
  { slug: "capricorn", env: "ZODIAC_CAPRICORN_CHANNEL_ID" },
  { slug: "aquarius", env: "ZODIAC_AQUARIUS_CHANNEL_ID" },
  { slug: "pisces", env: "ZODIAC_PISCES_CHANNEL_ID" },
];

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: false,
    live: false,
    approved: false,
    channel: null,
  };
  const errors = [];

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--live") options.live = true;
    else if (arg === "--approved") options.approved = true;
    else if (arg === "--channel") options.channel = args[++index] ?? null;
    else errors.push(`Unknown argument: ${arg}`);
  }

  if (!options.dryRun && !options.live) options.dryRun = true;
  if (options.dryRun && options.live) errors.push("Use either --dry-run or --live, not both.");
  if (options.live && !options.approved) errors.push("Live mode requires --approved.");
  if (options.channel && !CHANNELS.some((channel) => channel.slug === options.channel)) {
    errors.push(`Unknown channel: ${options.channel}`);
  }

  return { options, errors };
}

function loadDescriptions() {
  return JSON.parse(fs.readFileSync(configPath, "utf8"));
}

function loadChannelLinks() {
  return JSON.parse(fs.readFileSync(linkConfigPath, "utf8"));
}

function countCharacters(value) {
  return Array.from(value).length;
}

function normalizeTargetSlug(slug) {
  return slug === "zodiac-general" ? "general" : slug;
}

function selectChannels(channelFilter) {
  if (!channelFilter) return CHANNELS;
  return CHANNELS.filter((channel) => channel.slug === channelFilter);
}

function findForbiddenPublicText(value) {
  const text = String(value || "");
  return FORBIDDEN_PUBLIC_TEXT.filter((word) => new RegExp(`\\b${escapeRegExp(word)}\\b`, "i").test(text));
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function validateDescriptions(descriptions, channelLinks, channels) {
  const missing = [];
  const invalid = [];
  const warnings = [];
  const seenDescriptions = new Map();

  for (const channel of channels) {
    const item = descriptions[channel.slug];
    if (!item) {
      missing.push(channel.slug);
      continue;
    }

    if (typeof item.title !== "string" || item.title.trim().length === 0) {
      invalid.push(`${channel.slug}: missing title`);
    }

    if (typeof item.description !== "string" || item.description.trim().length === 0) {
      invalid.push(`${channel.slug}: missing description`);
      continue;
    }

    const length = countCharacters(item.description);
    if (length > TELEGRAM_DESCRIPTION_LIMIT) {
      invalid.push(`${channel.slug}: description is ${length}/${TELEGRAM_DESCRIPTION_LIMIT} characters`);
    }

    const forbidden = findForbiddenPublicText(`${item.title}\n${item.description}`);
    if (forbidden.length > 0) {
      invalid.push(`${channel.slug}: contains public placeholder/debug text (${forbidden.join(", ")})`);
    }

    const targetSlug = normalizeTargetSlug(channel.slug);
    const publicTarget = channelLinks[targetSlug];
    if (typeof publicTarget !== "string" || !publicTarget.startsWith("https://t.me/")) {
      invalid.push(`${channel.slug}: missing Telegram public target in ${path.relative(rootDir, linkConfigPath).replaceAll("\\", "/")}`);
    }

    const normalizedDescription = item.description.trim().replace(/\s+/g, " ");
    const duplicateOf = seenDescriptions.get(normalizedDescription);
    if (duplicateOf) {
      warnings.push(`${channel.slug}: exact duplicate description of ${duplicateOf}`);
    } else {
      seenDescriptions.set(normalizedDescription, channel.slug);
    }
  }

  return { missing, invalid, warnings };
}

function printPreview({ descriptions, channelLinks, channels, missing, invalid, warnings, mode, channelFilter }) {
  const validCount = channels.length - missing.length - invalid.length;
  console.log("=== Zodiac Channel Descriptions ===");
  console.log(`Mode              : ${mode}`);
  console.log(`Config            : ${path.relative(rootDir, configPath).replaceAll("\\", "/")}`);
  console.log(`Targets Config    : ${path.relative(rootDir, linkConfigPath).replaceAll("\\", "/")}`);
  console.log(`Channel Filter    : ${channelFilter ?? "all"}`);
  console.log(`Channels          : ${channels.length}`);
  console.log(`Missing           : ${missing.length}`);
  console.log(`Invalid           : ${invalid.length}`);
  console.log(`Warnings          : ${warnings.length}`);
  console.log(`Valid Channels    : ${validCount}/${channels.length}`);
  console.log("");

  for (const channel of channels) {
    const item = descriptions[channel.slug];
    if (!item) continue;
    const length = countCharacters(item.description);
    const targetSlug = normalizeTargetSlug(channel.slug);
    const target = channelLinks[targetSlug] ?? null;
    const forbidden = findForbiddenPublicText(`${item.title}\n${item.description}`);
    const isValid = length <= TELEGRAM_DESCRIPTION_LIMIT
      && item.title.trim().length > 0
      && item.description.trim().length > 0
      && forbidden.length === 0
      && typeof target === "string"
      && target.startsWith("https://t.me/");
    console.log(`--- ${channel.slug} ---`);
    console.log(`Title           : ${item.title}`);
    console.log(`Target Exists   : ${target ? "YES" : "NO"}`);
    console.log(`Target          : ${target ?? "missing"}`);
    console.log(`Length          : ${length}/${TELEGRAM_DESCRIPTION_LIMIT}`);
    console.log(`Valid           : ${isValid ? "YES" : "NO"}`);
    console.log(`Forbidden Text  : ${forbidden.length > 0 ? forbidden.join(", ") : "none"}`);
    console.log("Description :");
    console.log(item.description);
    console.log("");
  }

  if (missing.length > 0) console.log(`Missing: ${missing.join(", ")}`);
  if (invalid.length > 0) {
      console.log("Invalid:");
    invalid.forEach((error) => console.log(`- ${error}`));
  }
  if (warnings.length > 0) {
    console.log("Warnings:");
    warnings.forEach((warning) => console.log(`- ${warning}`));
  }
  console.log(`Telegram API Calls     : ${mode === "DRY-RUN" ? 0 : "pending live execution"}`);
  console.log(`Live Description Updates: ${mode === "DRY-RUN" ? 0 : "pending live execution"}`);
  console.log("Live Publish Calls     : 0");
  console.log("Ledger Writes          : 0");
  console.log("====================================");
}

function loadLocalEnvForLive() {
  for (const fileName of [".env.local", ".env"]) {
    try {
      process.loadEnvFile(path.join(rootDir, fileName));
    } catch {
      // Optional local env files may be absent in CI or operator environments.
    }
  }
}

async function postJson({ token, method, body }) {
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

async function applyLive({ descriptions, channels }) {
  loadLocalEnvForLive();
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is missing.");

  let telegramApiCalls = 0;

  for (const channel of channels) {
    const chatId = process.env[channel.env]?.trim();
    if (!chatId) throw new Error(`${channel.env} is missing.`);

    await postJson({
      token,
      method: "setChatDescription",
      body: {
        chat_id: chatId,
        description: descriptions[channel.slug].description,
      },
    });
    telegramApiCalls += 1;
    console.log(`[description_updated] ${channel.slug}`);
  }

  console.log("=== Zodiac Channel Descriptions Apply Summary ===");
  console.log(`Descriptions Updated : ${telegramApiCalls}`);
  console.log(`Telegram API Calls   : ${telegramApiCalls}`);
  console.log("Ledger Writes        : 0");
  console.log("=================================================");
}

async function main() {
  const { options, errors } = parseArgs();
  if (errors.length > 0) {
    errors.forEach((error) => console.error(error));
    process.exit(1);
  }

  const descriptions = loadDescriptions();
  const channelLinks = loadChannelLinks();
  const channels = selectChannels(options.channel);
  const { missing, invalid, warnings } = validateDescriptions(descriptions, channelLinks, channels);
  const mode = options.live ? "LIVE" : "DRY-RUN";

  printPreview({
    descriptions,
    channelLinks,
    channels,
    missing,
    invalid,
    warnings,
    mode,
    channelFilter: options.channel,
  });

  if (missing.length > 0 || invalid.length > 0) {
    throw new Error("Zodiac channel descriptions config is incomplete or invalid.");
  }

  if (options.dryRun) return;

  await applyLive({ descriptions, channels });
}

main().catch((error) => {
  console.error(`Unable to process zodiac channel descriptions: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
