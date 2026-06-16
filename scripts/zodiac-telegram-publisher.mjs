import fs from "fs";
import path from "path";
import process from "process";
import { buildCompatibilityInlineButton } from "./lib/zodiac-compatibility-bot.mjs";

const ZODIAC_EMOJIS = {
  aries: "♈", taurus: "♉", gemini: "♊", cancer: "♋",
  leo: "♌", virgo: "♍", libra: "♎", scorpio: "♏",
  sagittarius: "♐", capricorn: "♑", aquarius: "♒", pisces: "♓"
};

const ZODIAC_NAMES = {
  aries: "Овен", taurus: "Телец", gemini: "Близнецы", cancer: "Рак",
  leo: "Лев", virgo: "Дева", libra: "Весы", scorpio: "Скорпион",
  sagittarius: "Стрелец", capricorn: "Козерог", aquarius: "Водолей", pisces: "Рыбы"
};

const ZODIAC_ORDER = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
];

function loadChannelLinks() {
  try {
    const configPath = path.join(process.cwd(), "data", "config", "zodiac-channel-links.json");
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, "utf-8"));
    }
  } catch (e) {}
  return {};
}

export function buildZodiacNavigationKeyboard(channelId, options = {}) {
  const links = loadChannelLinks();
  const compatibilityButtonOptions = options.previewCompatibilityButton ? { preview: true } : {};
  
  if (channelId === "zodiac-general") {
    const keyboard = [];
    for (let i = 0; i < ZODIAC_ORDER.length; i += 2) {
      const row = [];
      for (let j = 0; j < 2; j++) {
        const slug = ZODIAC_ORDER[i + j];
        if (slug && links[slug]) {
          row.push({ text: `${ZODIAC_EMOJIS[slug]} ${ZODIAC_NAMES[slug]}`, url: links[slug] });
        }
      }
      if (row.length > 0) keyboard.push(row);
    }
    const compatibilityButton = buildCompatibilityInlineButton("zodiac-general", compatibilityButtonOptions);
    if (compatibilityButton) keyboard.push([compatibilityButton]);
    return { inline_keyboard: keyboard };
  } else {
    const keyboard = [];
    if (links["general"]) {
      keyboard.push([{ text: "🔮 Общий гороскоп", url: links["general"] }]);
    }
    const compatibilityButton = buildCompatibilityInlineButton(channelId, compatibilityButtonOptions);
    if (compatibilityButton) keyboard.push([compatibilityButton]);
    const otherSigns = ZODIAC_ORDER.filter(s => s !== channelId);
    for (let i = 0; i < otherSigns.length; i += 2) {
      const row = [];
      for (let j = 0; j < 2; j++) {
        const slug = otherSigns[i + j];
        if (slug && links[slug]) {
          row.push({ text: `${ZODIAC_EMOJIS[slug]} ${ZODIAC_NAMES[slug]}`, url: links[slug] });
        }
      }
      if (row.length > 0) keyboard.push(row);
    }
    return { inline_keyboard: keyboard };
  }
}


try {
  process.loadEnvFile(".env.local");
} catch {
  // Environment files are optional in CI/dry-run contexts.
}

const ZODIAC_CHANNEL_ENV = {
  "zodiac-general": "ZODIAC_GENERAL_CHANNEL_ID",
  aries: "ZODIAC_ARIES_CHANNEL_ID",
  taurus: "ZODIAC_TAURUS_CHANNEL_ID",
  gemini: "ZODIAC_GEMINI_CHANNEL_ID",
  cancer: "ZODIAC_CANCER_CHANNEL_ID",
  leo: "ZODIAC_LEO_CHANNEL_ID",
  virgo: "ZODIAC_VIRGO_CHANNEL_ID",
  libra: "ZODIAC_LIBRA_CHANNEL_ID",
  scorpio: "ZODIAC_SCORPIO_CHANNEL_ID",
  sagittarius: "ZODIAC_SAGITTARIUS_CHANNEL_ID",
  capricorn: "ZODIAC_CAPRICORN_CHANNEL_ID",
  aquarius: "ZODIAC_AQUARIUS_CHANNEL_ID",
  pisces: "ZODIAC_PISCES_CHANNEL_ID",
};

export const TELEGRAM_PHOTO_CAPTION_LIMIT = 1024;
export const SAFE_PHOTO_CAPTION_LIMIT = 900;
export const TELEGRAM_MESSAGE_LIMIT = 4096;
const SAFE_MESSAGE_CHUNK_LIMIT = 4000;

export function getZodiacTelegramTarget(channelId) {
  const envName = ZODIAC_CHANNEL_ENV[channelId];
  if (!envName) {
    return { ok: false, envName: null, telegramTarget: null, error: `Unknown zodiac channel: ${channelId}` };
  }

  const telegramTarget = process.env[envName]?.trim();
  if (!telegramTarget) {
    return { ok: false, envName, telegramTarget: null, error: `Missing ${envName} for ${channelId}` };
  }

  return { ok: true, envName, telegramTarget, error: null };
}

export function createShortPhotoCaption({ channelId, text }) {
  const header = getFirstTextLine(text) || "Гороскоп на сегодня";
  const suffix = channelId === "zodiac-general"
    ? "Полный прогноз для всех 12 знаков — ниже."
    : "Полный прогноз — ниже.";

  const caption = `${header}\n\n${suffix}`;
  if (caption.length <= SAFE_PHOTO_CAPTION_LIMIT) {
    return caption;
  }

  return `${header.slice(0, SAFE_PHOTO_CAPTION_LIMIT - suffix.length - 5).trim()}\n\n${suffix}`;
}

export function splitTelegramMessage(text, maxLength = SAFE_MESSAGE_CHUNK_LIMIT) {
  const normalizedText = String(text || "").trim();
  if (!normalizedText) return [];
  if (maxLength <= 0 || maxLength > TELEGRAM_MESSAGE_LIMIT) {
    throw new Error(`Invalid Telegram message chunk limit: ${maxLength}`);
  }
  if (normalizedText.length <= maxLength) return [normalizedText];

  const chunks = [];
  let remaining = normalizedText;

  while (remaining.length > maxLength) {
    const window = remaining.slice(0, maxLength + 1);
    let splitAt = Math.max(
      window.lastIndexOf("\n\n", maxLength),
      window.lastIndexOf("\n", maxLength),
      window.lastIndexOf(" ", maxLength)
    );

    if (splitAt < Math.floor(maxLength * 0.6)) {
      splitAt = maxLength;
    }

    chunks.push(remaining.slice(0, splitAt).trim());
    remaining = remaining.slice(splitAt).trim();
  }

  if (remaining) chunks.push(remaining);
  return chunks;
}

export function planZodiacTelegramPublish({ channelId, text, imagePath }) {
  const cleanText = String(text || "").trim();
  const hasImage = Boolean(imagePath);
  if (!cleanText) {
    return { ok: false, error: "Telegram text/caption missing", strategy: "none", calls: [] };
  }

  const replyMarkup = buildZodiacNavigationKeyboard(channelId);
  const addMarkupToLastCall = (callsArray) => {
    if (callsArray.length > 0) {
      callsArray[callsArray.length - 1].replyMarkup = replyMarkup;
    }
    return callsArray;
  };

  if (hasImage && cleanText.length <= SAFE_PHOTO_CAPTION_LIMIT) {
    return {
      ok: true,
      error: null,
      strategy: "photo_full_caption",
      calls: addMarkupToLastCall([{ type: "sendPhoto", caption: cleanText, captionMode: "full" }]),
    };
  }

  const messageChunks = splitTelegramMessage(cleanText);
  if (messageChunks.some((chunk) => chunk.length > TELEGRAM_MESSAGE_LIMIT)) {
    return { ok: false, error: "Telegram message chunk is too long", strategy: "none", calls: [] };
  }

  if (hasImage) {
    const shortCaption = createShortPhotoCaption({ channelId, text: cleanText });
    if (shortCaption.length > TELEGRAM_PHOTO_CAPTION_LIMIT) {
      return {
        ok: false,
        error: `Telegram short photo caption is too long: ${shortCaption.length}/${TELEGRAM_PHOTO_CAPTION_LIMIT}`,
        strategy: "none",
        calls: [],
      };
    }

    return {
      ok: true,
      error: null,
      strategy: "photo_short_caption_plus_text",
      calls: addMarkupToLastCall([
        { type: "sendPhoto", caption: shortCaption, captionMode: "short" },
        ...messageChunks.map((chunk) => ({ type: "sendMessage", text: chunk })),
      ]),
    };
  }

  return {
    ok: true,
    error: null,
    strategy: "text_messages",
    calls: addMarkupToLastCall(messageChunks.map((chunk) => ({ type: "sendMessage", text: chunk }))),
  };
}

export async function publishZodiacTelegramPost({
  channelId,
  text,
  imagePath,
  dryRun = true,
  live = false,
}) {
  const target = getZodiacTelegramTarget(channelId);
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();

  const base = {
    ok: false,
    sent: false,
    dryRun: Boolean(dryRun),
    live: Boolean(live),
    channelId,
    strategy: null,
    telegramCalls: 0,
    actions: [],
    method: imagePath ? "sendPhoto" : "sendMessage",
    messageId: null,
    messageIds: [],
    error: null,
  };

  if (!target.ok) return { ...base, error: target.error };
  if (!token) return { ...base, error: "TELEGRAM_BOT_TOKEN missing" };
  if (imagePath && (!fs.existsSync(imagePath) || !fs.statSync(imagePath).isFile())) {
    return { ...base, error: "image file missing" };
  }

  const publishPlan = planZodiacTelegramPublish({ channelId, text, imagePath });
  if (!publishPlan.ok) {
    return { ...base, strategy: publishPlan.strategy, error: publishPlan.error };
  }

  if (!live || dryRun) {
    return {
      ...base,
      ok: true,
      sent: false,
      strategy: publishPlan.strategy,
      telegramCalls: publishPlan.calls.length,
      actions: publishPlan.calls.map((call) => call.type),
      error: null,
    };
  }

  try {
    const results = [];

    for (const call of publishPlan.calls) {
      const result = call.type === "sendPhoto"
        ? await sendPhoto({ token, telegramTarget: target.telegramTarget, caption: call.caption, imagePath, replyMarkup: call.replyMarkup })
        : await sendMessage({ token, telegramTarget: target.telegramTarget, text: call.text, replyMarkup: call.replyMarkup });

      results.push({ ...result, type: call.type });
      if (!result.ok) {
        return {
          ...base,
          strategy: publishPlan.strategy,
          telegramCalls: results.length,
          actions: results.map((item) => item.type),
          error: result.error,
        };
      }
    }

    const messageIds = results.map((result) => result.messageId).filter((messageId) => messageId !== null);

    return {
      ...base,
      ok: true,
      sent: true,
      strategy: publishPlan.strategy,
      telegramCalls: publishPlan.calls.length,
      actions: results.map((item) => item.type),
      messageId: messageIds[0] ?? null,
      messageIds,
      error: null,
    };
  } catch (err) {
    return { ...base, error: err instanceof Error ? err.message : "Telegram publish failed" };
  }
}

async function sendPhoto({ token, telegramTarget, caption, imagePath, replyMarkup }) {
  const imageBuffer = fs.readFileSync(imagePath);
  const form = new FormData();
  form.set("chat_id", telegramTarget);
  form.set("photo", new Blob([new Uint8Array(imageBuffer)], { type: getImageMime(imagePath) }), path.basename(imagePath));
  form.set("caption", caption);
  form.set("parse_mode", "HTML");
  if (replyMarkup) {
    form.set("reply_markup", JSON.stringify(replyMarkup));
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
    method: "POST",
    body: form,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.ok) {
    return { ok: false, messageId: null, error: body?.description || `Telegram API returned ${response.status}` };
  }

  return { ok: true, messageId: body.result?.message_id ?? null, error: null };
}

async function sendMessage({ token, telegramTarget, text, replyMarkup }) {
  const bodyObj = { chat_id: telegramTarget, text, parse_mode: "HTML" };
  if (replyMarkup) {
    bodyObj.reply_markup = replyMarkup;
  }
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(bodyObj),
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.ok) {
    return { ok: false, messageId: null, error: body?.description || `Telegram API returned ${response.status}` };
  }

  return { ok: true, messageId: body.result?.message_id ?? null, error: null };
}

function getImageMime(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".webp") return "image/webp";
  return "image/png";
}

function getFirstTextLine(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean);
}
