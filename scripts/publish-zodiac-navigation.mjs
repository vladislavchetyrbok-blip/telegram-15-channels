import fs from "fs";
import path from "path";
import process from "process";
import { fileURLToPath } from "url";
import { MINI_APP_START_PARAMETERS, buildMiniAppInlineButton } from "./lib/zodiac-compatibility-bot.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const configPath = path.join(rootDir, "data", "config", "zodiac-channel-links.json");

const MINI_APP_BUTTONS = [
  { text: "🔮 Открыть Астрологический центр", start: MINI_APP_START_PARAMETERS.compat },
  { text: "💞 Совместимость", start: MINI_APP_START_PARAMETERS.compat },
  { text: "👼 Ангельские числа", start: MINI_APP_START_PARAMETERS.angelNumbers },
  { text: "🧿 Матрица судьбы", start: MINI_APP_START_PARAMETERS.birthMatrix },
  { text: "👑 VIP бесплатно", start: MINI_APP_START_PARAMETERS.vip },
  { text: "🔮 Мистика", start: MINI_APP_START_PARAMETERS.mystic },
  { text: "📅 Прогноз недели", start: MINI_APP_START_PARAMETERS.week },
];

const MESSAGE_TEXT = `🌟 Общий гороскоп

Главный канал ежедневных гороскопов.

Выберите свой знак или откройте Астрологический центр:
✨ гороскопы
💞 совместимость
👼 ангельские числа
🧿 матрица судьбы
🔮 мистика
👑 VIP бесплатно до 17.09.2026`;

const SIGNS = [
  { slug: "aries", label: "♈ Овен" },
  { slug: "taurus", label: "♉ Телец" },
  { slug: "gemini", label: "♊ Близнецы" },
  { slug: "cancer", label: "♋ Рак" },
  { slug: "leo", label: "♌ Лев" },
  { slug: "virgo", label: "♍ Дева" },
  { slug: "libra", label: "♎ Весы" },
  { slug: "scorpio", label: "♏ Скорпион" },
  { slug: "sagittarius", label: "♐ Стрелец" },
  { slug: "capricorn", label: "♑ Козерог" },
  { slug: "aquarius", label: "♒ Водолей" },
  { slug: "pisces", label: "♓ Рыбы" },
];

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: false,
    live: false,
    approved: false,
    pin: false,
  };
  const errors = [];

  for (const arg of args) {
    if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--live") options.live = true;
    else if (arg === "--approved") options.approved = true;
    else if (arg === "--pin") options.pin = true;
    else errors.push(`Unknown argument: ${arg}`);
  }

  if (!options.dryRun && !options.live) options.dryRun = true;
  if (options.dryRun && options.live) errors.push("Use either --dry-run or --live, not both.");
  if (options.live && !options.approved) errors.push("Live mode requires --approved.");
  if (options.pin && !options.live) errors.push("--pin is only supported in live mode.");

  return { options, errors };
}

function loadChannelLinks() {
  const raw = fs.readFileSync(configPath, "utf8");
  return JSON.parse(raw);
}

function buildKeyboard(channelLinks) {
  const miniAppButtons = MINI_APP_BUTTONS.map((button) => buildMiniAppInlineButton(button.start, button.text, { allowPreview: true })).filter(Boolean);
  const miniAppRows = [
    miniAppButtons.slice(0, 1),
    miniAppButtons.slice(1, 3),
    miniAppButtons.slice(3, 5),
    miniAppButtons.slice(5, 7),
  ].filter((row) => row.length > 0);
  const signRows = SIGNS.reduce((rows, sign, index) => {
    if (index % 2 === 0) rows.push([]);
    rows[rows.length - 1].push({
      text: sign.label,
      url: channelLinks[sign.slug],
    });
    return rows;
  }, []);
  return [...miniAppRows, ...signRows];
}

function validateLinks(channelLinks) {
  const missing = [];
  const invalid = [];

  for (const sign of SIGNS) {
    const link = channelLinks[sign.slug];
    if (!link) {
      missing.push(sign.slug);
      continue;
    }
    if (!/^https:\/\/t\.me\/[A-Za-z0-9_]+$/.test(link)) {
      invalid.push({ slug: sign.slug, link });
    }
  }

  return { missing, invalid };
}

function printPreview({ channelLinks, keyboard, missing, invalid, mode, pin }) {
  console.log("=== Zodiac Navigation Post ===");
  console.log(`Mode              : ${mode}`);
  console.log(`Config            : ${path.relative(rootDir, configPath).replaceAll("\\", "/")}`);
  console.log(`Links Found       : ${SIGNS.length - missing.length}/${SIGNS.length}`);
  console.log(`Missing Links     : ${missing.length}`);
  console.log(`Invalid Links     : ${invalid.length}`);
  console.log(`Pin After Send    : ${pin ? "yes" : "no"}`);
  const startappLinks = new Set(keyboard.flat().map((button) => button.url.match(/[?&]startapp=([^&]+)/)?.[1]).filter(Boolean));
  console.log(`Startapp Links    : ${startappLinks.size}`);
  console.log("");
  console.log("--- Message Preview ---");
  console.log(MESSAGE_TEXT);
  console.log("");
  console.log("--- Inline Keyboard Preview ---");
  keyboard.forEach((row, index) => {
    const display = row.map((button) => `${button.text} -> ${button.url}`).join(" | ");
    console.log(`Row ${index + 1}: ${display}`);
  });
  console.log("");
  console.log(`Buttons Summary: ${keyboard.flat().map((button) => button.text).join(" | ")}`);
  console.log("");
  if (missing.length > 0) console.log(`Missing: ${missing.join(", ")}`);
  if (invalid.length > 0) {
    console.log("Invalid:");
    invalid.forEach((item) => console.log(`- ${item.slug}: ${item.link}`));
  }
  console.log(`Telegram API Calls: ${mode === "DRY-RUN" ? 0 : "pending live execution"}`);
  console.log(`Live Publish Calls: ${mode === "DRY-RUN" ? 0 : "pending live execution"}`);
  console.log("Ledger Writes     : 0");
  console.log("===============================");
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

async function publishLive({ keyboard, pin }) {
  loadLocalEnvForLive();
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.ZODIAC_GENERAL_CHANNEL_ID?.trim();
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is missing.");
  if (!chatId) throw new Error("ZODIAC_GENERAL_CHANNEL_ID is missing.");

  let telegramApiCalls = 0;
  const message = await postJson({
    token,
    method: "sendMessage",
    body: {
      chat_id: chatId,
      text: MESSAGE_TEXT,
      reply_markup: { inline_keyboard: keyboard },
    },
  });
  telegramApiCalls += 1;

  console.log("Navigation message sent.");
  console.log(`Message ID        : ${message.message_id}`);

  if (pin) {
    await postJson({
      token,
      method: "pinChatMessage",
      body: {
        chat_id: chatId,
        message_id: message.message_id,
        disable_notification: true,
      },
    });
    telegramApiCalls += 1;
    console.log("Navigation message pinned.");
  }

  console.log(`Telegram API Calls: ${telegramApiCalls}`);
}

async function main() {
  const { options, errors } = parseArgs();
  if (errors.length > 0) {
    errors.forEach((error) => console.error(error));
    process.exit(1);
  }

  const channelLinks = loadChannelLinks();
  const { missing, invalid } = validateLinks(channelLinks);
  const keyboard = buildKeyboard(channelLinks);
  const mode = options.live ? "LIVE" : "DRY-RUN";

  printPreview({ channelLinks, keyboard, missing, invalid, mode, pin: options.pin });

  if (missing.length > 0 || invalid.length > 0) {
    throw new Error("Zodiac navigation links are incomplete or invalid.");
  }

  if (options.dryRun) return;

  await publishLive({ keyboard, pin: options.pin });
}

main().catch((error) => {
  console.error(`Unable to process zodiac navigation post: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
