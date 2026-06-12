import fs from "fs";
import path from "path";
import process from "process";

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
    method: imagePath ? "sendPhoto" : "sendMessage",
    messageId: null,
    error: null,
  };

  if (!target.ok) return { ...base, error: target.error };
  if (!token) return { ...base, error: "TELEGRAM_BOT_TOKEN missing" };
  if (!text || !text.trim()) return { ...base, error: "Telegram text/caption missing" };
  if (text.length > 1024) return { ...base, error: `Telegram photo caption is too long: ${text.length}/1024` };
  if (imagePath && (!fs.existsSync(imagePath) || !fs.statSync(imagePath).isFile())) {
    return { ...base, error: "image file missing" };
  }

  if (!live || dryRun) {
    return { ...base, ok: true, sent: false, error: null };
  }

  try {
    const result = imagePath
      ? await sendPhoto({ token, telegramTarget: target.telegramTarget, caption: text, imagePath })
      : await sendMessage({ token, telegramTarget: target.telegramTarget, text });

    return {
      ...base,
      ok: result.ok,
      sent: result.ok,
      messageId: result.messageId,
      error: result.error,
    };
  } catch (err) {
    return { ...base, error: err instanceof Error ? err.message : "Telegram publish failed" };
  }
}

async function sendPhoto({ token, telegramTarget, caption, imagePath }) {
  const imageBuffer = fs.readFileSync(imagePath);
  const form = new FormData();
  form.set("chat_id", telegramTarget);
  form.set("photo", new Blob([new Uint8Array(imageBuffer)], { type: getImageMime(imagePath) }), path.basename(imagePath));
  form.set("caption", caption);

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

async function sendMessage({ token, telegramTarget, text }) {
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: telegramTarget, text }),
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
