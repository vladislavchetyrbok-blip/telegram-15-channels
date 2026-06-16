import fs from "fs";
import path from "path";
import process from "process";
import { fileURLToPath } from "url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const configPath = path.join(rootDir, "data", "config", "zodiac-channel-links.json");

const SIGNS = [
  { slug: "aries", label: "♈ Овен", name: "Овен", env: "ZODIAC_ARIES_CHANNEL_ID" },
  { slug: "taurus", label: "♉ Телец", name: "Телец", env: "ZODIAC_TAURUS_CHANNEL_ID" },
  { slug: "gemini", label: "♊ Близнецы", name: "Близнецы", env: "ZODIAC_GEMINI_CHANNEL_ID" },
  { slug: "cancer", label: "♋ Рак", name: "Рак", env: "ZODIAC_CANCER_CHANNEL_ID" },
  { slug: "leo", label: "♌ Лев", name: "Лев", env: "ZODIAC_LEO_CHANNEL_ID" },
  { slug: "virgo", label: "♍ Дева", name: "Дева", env: "ZODIAC_VIRGO_CHANNEL_ID" },
  { slug: "libra", label: "♎ Весы", name: "Весы", env: "ZODIAC_LIBRA_CHANNEL_ID" },
  { slug: "scorpio", label: "♏ Скорпион", name: "Скорпион", env: "ZODIAC_SCORPIO_CHANNEL_ID" },
  { slug: "sagittarius", label: "♐ Стрелец", name: "Стрелец", env: "ZODIAC_SAGITTARIUS_CHANNEL_ID" },
  { slug: "capricorn", label: "♑ Козерог", name: "Козерог", env: "ZODIAC_CAPRICORN_CHANNEL_ID" },
  { slug: "aquarius", label: "♒ Водолей", name: "Водолей", env: "ZODIAC_AQUARIUS_CHANNEL_ID" },
  { slug: "pisces", label: "♓ Рыбы", name: "Рыбы", env: "ZODIAC_PISCES_CHANNEL_ID" },
];

const TARGETS = [
  { slug: "general", env: "ZODIAC_GENERAL_CHANNEL_ID" },
  ...SIGNS.map((sign) => ({ slug: sign.slug, env: sign.env })),
];

const GENERAL_MESSAGE = `🔮 Выберите свой знак зодиака

Ежедневные гороскопы выходят в отдельных каналах.
Подпишитесь на свой знак и получайте прогноз каждый день.

👇 Нажмите на нужный знак ниже:`;

function signMessage(sign) {
  return `${sign.label} | Гороскоп

Вы сейчас в канале: ${sign.name}.
Ниже можно перейти в общий гороскоп или выбрать другой знак.

👇 Навигация по гороскопам:`;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: false,
    live: false,
    approved: false,
    pin: false,
    channel: null,
  };
  const errors = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--live") options.live = true;
    else if (arg === "--approved") options.approved = true;
    else if (arg === "--pin") options.pin = true;
    else if (arg === "--channel") options.channel = args[++i] ?? null;
    else errors.push(`Unknown argument: ${arg}`);
  }

  if (!options.dryRun && !options.live) options.dryRun = true;
  if (options.dryRun && options.live) errors.push("Use either --dry-run or --live, not both.");
  if (options.live && !options.approved) errors.push("Live mode requires --approved.");
  if (options.pin && !options.live) errors.push("--pin is only supported in live mode.");
  if (options.channel && !TARGETS.some((target) => target.slug === options.channel)) {
    errors.push(`Unknown channel: ${options.channel}`);
  }

  return { options, errors };
}

function loadChannelLinks() {
  return JSON.parse(fs.readFileSync(configPath, "utf8"));
}

function chunkButtons(buttons, size = 2) {
  const rows = [];
  for (let index = 0; index < buttons.length; index += size) {
    rows.push(buttons.slice(index, index + size));
  }
  return rows;
}

function buildGeneralKeyboard(channelLinks) {
  const buttons = SIGNS.map((sign) => ({
    text: sign.label,
    url: channelLinks[sign.slug],
  }));
  return chunkButtons(buttons);
}

function buildSignKeyboard(channelLinks, currentSlug) {
  const otherSignButtons = SIGNS.filter((sign) => sign.slug !== currentSlug).map((sign) => ({
    text: sign.label,
    url: channelLinks[sign.slug],
  }));

  return [
    [{ text: "🔮 Общий гороскоп", url: channelLinks.general }],
    ...chunkButtons(otherSignButtons),
  ];
}

function buildNavigationPosts(channelLinks) {
  const generalPost = {
    target: "general",
    message: GENERAL_MESSAGE,
    keyboard: buildGeneralKeyboard(channelLinks),
  };

  const signPosts = SIGNS.map((sign) => ({
    target: sign.slug,
    message: signMessage(sign),
    keyboard: buildSignKeyboard(channelLinks, sign.slug),
  }));

  return [generalPost, ...signPosts];
}

function validateLinks(channelLinks) {
  const required = ["general", ...SIGNS.map((sign) => sign.slug)];
  const missing = [];
  const invalid = [];

  for (const slug of required) {
    const link = channelLinks[slug];
    if (!link) {
      missing.push(slug);
      continue;
    }
    if (!/^https:\/\/t\.me\/[A-Za-z0-9_]+$/.test(link)) {
      invalid.push({ slug, link });
    }
  }

  return { missing, invalid };
}

function validateNavigationPosts(posts, channelLinks) {
  const errors = [];
  const general = posts.find((post) => post.target === "general");

  if (general) {
    const generalUrls = new Set(general.keyboard.flat().map((button) => button.url));
    for (const sign of SIGNS) {
      if (!generalUrls.has(channelLinks[sign.slug])) {
        errors.push(`general is missing ${sign.slug}`);
      }
    }
  }

  for (const post of posts) {
    for (const button of post.keyboard.flat()) {
      if (!/^https:\/\/t\.me\/[A-Za-z0-9_]+$/.test(button.url)) {
        errors.push(`${post.target} has invalid button URL: ${button.url}`);
      }
    }

    if (post.target !== "general") {
      const ownLink = channelLinks[post.target];
      if (post.keyboard.flat().some((button) => button.url === ownLink)) {
        errors.push(`${post.target} includes a self-link`);
      }
    }
  }

  return errors;
}

function printPostPreview(post) {
  console.log(`--- Target: ${post.target} ---`);
  console.log(post.message);
  console.log("");
  post.keyboard.forEach((row, index) => {
    const display = row.map((button) => `${button.text} -> ${button.url}`).join(" | ");
    console.log(`Row ${index + 1}: ${display}`);
  });
  console.log("");
}

function printDryRun({ posts, missing, invalid, navErrors, channel, pin }) {
  console.log("=== Zodiac Cross-Navigation Posts ===");
  console.log("Mode              : DRY-RUN");
  console.log(`Config            : ${path.relative(rootDir, configPath).replaceAll("\\", "/")}`);
  console.log(`Targets           : ${posts.length}`);
  console.log(`Channel Filter    : ${channel ?? "all"}`);
  console.log(`Links Found       : ${13 - missing.length}/13`);
  console.log(`Missing Links     : ${missing.length}`);
  console.log(`Invalid Links     : ${invalid.length}`);
  console.log(`Navigation Errors : ${navErrors.length}`);
  console.log(`Pin After Send    : ${pin ? "yes" : "no"}`);
  console.log("");

  for (const post of posts) {
    printPostPreview(post);
  }

  if (missing.length > 0) console.log(`Missing: ${missing.join(", ")}`);
  if (invalid.length > 0) {
    console.log("Invalid:");
    invalid.forEach((item) => console.log(`- ${item.slug}: ${item.link}`));
  }
  if (navErrors.length > 0) {
    console.log("Navigation validation errors:");
    navErrors.forEach((error) => console.log(`- ${error}`));
  }
  console.log("Telegram API Calls: 0");
  console.log("======================================");
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

async function publishLive({ posts, pin }) {
  loadLocalEnvForLive();
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is missing.");

  let sendCalls = 0;
  let pinCalls = 0;

  for (const post of posts) {
    const target = TARGETS.find((item) => item.slug === post.target);
    const chatId = process.env[target.env]?.trim();
    if (!chatId) throw new Error(`${target.env} is missing.`);

    const message = await postJson({
      token,
      method: "sendMessage",
      body: {
        chat_id: chatId,
        text: post.message,
        reply_markup: { inline_keyboard: post.keyboard },
      },
    });
    sendCalls += 1;
    console.log(`[sent] ${post.target} | message_id=${message.message_id}`);

    if (pin) {
      try {
        await postJson({
          token,
          method: "pinChatMessage",
          body: {
            chat_id: chatId,
            message_id: message.message_id,
            disable_notification: true,
          },
        });
        pinCalls += 1;
        console.log(`[pinned] ${post.target} | message_id=${message.message_id}`);
      } catch (error) {
        console.error(`[pin_failed] ${post.target}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  console.log("=== Zodiac Cross-Navigation Publish Summary ===");
  console.log(`Navigation Posts Sent : ${sendCalls}`);
  console.log(`Pin Calls Succeeded   : ${pinCalls}`);
  console.log(`Telegram API Calls    : ${sendCalls + pinCalls}`);
  console.log("==============================================");
}

async function main() {
  const { options, errors } = parseArgs();
  if (errors.length > 0) {
    errors.forEach((error) => console.error(error));
    process.exit(1);
  }

  const channelLinks = loadChannelLinks();
  const { missing, invalid } = validateLinks(channelLinks);
  let posts = buildNavigationPosts(channelLinks);
  if (options.channel) posts = posts.filter((post) => post.target === options.channel);
  const navErrors = validateNavigationPosts(posts, channelLinks);

  if (options.dryRun) {
    printDryRun({ posts, missing, invalid, navErrors, channel: options.channel, pin: options.pin });
  }

  if (missing.length > 0 || invalid.length > 0 || navErrors.length > 0) {
    throw new Error("Zodiac cross-navigation config is incomplete or invalid.");
  }

  if (options.dryRun) return;

  await publishLive({ posts, pin: options.pin });
}

main().catch((error) => {
  console.error(`Unable to process zodiac cross-navigation posts: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
