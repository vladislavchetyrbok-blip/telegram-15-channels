import fs from "fs";
import path from "path";
import process from "process";

export const COMPATIBILITY_BOT_CONFIG_PATH = path.resolve(process.cwd(), "data/config/zodiac-compatibility-bot.json");
export const DEFAULT_COMPATIBILITY_BOT_USERNAME_ENV = "COMPATIBILITY_BOT_USERNAME";
export const DEFAULT_COMPATIBILITY_MINI_APP_URL_ENV = "COMPATIBILITY_MINI_APP_URL";
export const DEFAULT_COMPATIBILITY_MINI_APP_NAME_ENV = "COMPATIBILITY_MINI_APP_NAME";
export const DEFAULT_COMPATIBILITY_BUTTON_TEXT = "💞 Совместимость знаков";

const ZODIAC_SIGN_SLUGS = new Set([
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
]);

export function loadCompatibilityBotConfig() {
  if (!fs.existsSync(COMPATIBILITY_BOT_CONFIG_PATH)) {
    return {
      version: 1,
      usernameEnv: DEFAULT_COMPATIBILITY_BOT_USERNAME_ENV,
      miniAppUrlEnv: DEFAULT_COMPATIBILITY_MINI_APP_URL_ENV,
      miniAppNameEnv: DEFAULT_COMPATIBILITY_MINI_APP_NAME_ENV,
      username: null,
      miniAppUrl: null,
      miniAppName: null,
      buttonText: DEFAULT_COMPATIBILITY_BUTTON_TEXT,
      startParameters: { general: "compat", signTemplate: "compat_{slug}" },
      liveChannelPostsEnabled: false,
      scheduledChannelPostsEnabled: false,
      personalDataPersistence: "disabled",
    };
  }
  const parsed = JSON.parse(fs.readFileSync(COMPATIBILITY_BOT_CONFIG_PATH, "utf8"));
  return {
    ...parsed,
    usernameEnv: parsed.usernameEnv || DEFAULT_COMPATIBILITY_BOT_USERNAME_ENV,
    miniAppUrlEnv: parsed.miniAppUrlEnv || DEFAULT_COMPATIBILITY_MINI_APP_URL_ENV,
    miniAppNameEnv: parsed.miniAppNameEnv || DEFAULT_COMPATIBILITY_MINI_APP_NAME_ENV,
    buttonText: parsed.buttonText || DEFAULT_COMPATIBILITY_BUTTON_TEXT,
    startParameters: {
      general: parsed.startParameters?.general || "compat",
      signTemplate: parsed.startParameters?.signTemplate || "compat_{slug}",
    },
  };
}

export function normalizeCompatibilityBotUsername(value) {
  const normalized = String(value || "").trim().replace(/^@/, "");
  if (!normalized || normalized === DEFAULT_COMPATIBILITY_BOT_USERNAME_ENV) return null;
  if (!/^[A-Za-z0-9_]{5,32}$/.test(normalized)) return null;
  return normalized;
}

export function normalizeCompatibilityMiniAppUrl(value) {
  const normalized = String(value || "").trim();
  if (!normalized) return null;
  if (!/^https:\/\/[^\s]+$/i.test(normalized)) return null;
  return normalized;
}

export function normalizeCompatibilityMiniAppName(value) {
  const normalized = String(value || "").trim().replace(/^\/+/, "");
  if (!normalized) return null;
  if (!/^[A-Za-z0-9_/-]{1,64}$/.test(normalized)) return null;
  return normalized;
}

export function resolveCompatibilityBotUsername({ env = process.env } = {}) {
  const config = loadCompatibilityBotConfig();
  const envName = config.usernameEnv || DEFAULT_COMPATIBILITY_BOT_USERNAME_ENV;
  const envUsername = normalizeCompatibilityBotUsername(env[envName]);
  if (envUsername) {
    return { ok: true, username: envUsername, source: envName, envName, config };
  }

  const configUsername = normalizeCompatibilityBotUsername(config.username);
  if (configUsername) {
    return { ok: true, username: configUsername, source: COMPATIBILITY_BOT_CONFIG_PATH, envName, config };
  }

  return {
    ok: false,
    username: null,
    source: null,
    envName,
    config,
    warning: `${envName} is not configured; compatibility button is planned but omitted from live keyboards.`,
  };
}

export function buildCompatibilityStartParameter(channelId) {
  const config = loadCompatibilityBotConfig();
  const slug = String(channelId || "").trim();
  if (slug === "zodiac-general" || slug === "general") return config.startParameters.general;
  if (!ZODIAC_SIGN_SLUGS.has(slug)) throw new Error(`Unknown zodiac channel for compatibility deep link: ${channelId}`);
  return config.startParameters.signTemplate.replace("{slug}", slug);
}

function appendQuery(url, key, value) {
  const parsed = new URL(url);
  parsed.searchParams.set(key, value);
  return parsed.toString();
}

export function resolveCompatibilityLaunchTarget(channelId, { env = process.env } = {}) {
  const config = loadCompatibilityBotConfig();
  const start = buildCompatibilityStartParameter(channelId);
  const miniAppUrlEnv = config.miniAppUrlEnv || DEFAULT_COMPATIBILITY_MINI_APP_URL_ENV;
  const miniAppNameEnv = config.miniAppNameEnv || DEFAULT_COMPATIBILITY_MINI_APP_NAME_ENV;
  const usernameResult = resolveCompatibilityBotUsername({ env });
  const miniAppUrl = normalizeCompatibilityMiniAppUrl(env[miniAppUrlEnv]) || normalizeCompatibilityMiniAppUrl(config.miniAppUrl);
  const miniAppName = normalizeCompatibilityMiniAppName(env[miniAppNameEnv]) || normalizeCompatibilityMiniAppName(config.miniAppName);

  if (miniAppUrl) {
    return {
      ok: true,
      url: appendQuery(miniAppUrl, "startapp", start),
      previewUrl: appendQuery(miniAppUrl, "startapp", start),
      start,
      text: config.buttonText,
      targetType: "mini_app_url",
      warning: null,
      envName: miniAppUrlEnv,
    };
  }

  if (usernameResult.ok && miniAppName) {
    const url = `https://t.me/${usernameResult.username}/${miniAppName}?startapp=${encodeURIComponent(start)}`;
    return {
      ok: true,
      url,
      previewUrl: url,
      start,
      text: config.buttonText,
      targetType: "mini_app_name",
      warning: null,
      envName: `${usernameResult.envName}+${miniAppNameEnv}`,
    };
  }

  if (usernameResult.ok) {
    const url = `https://t.me/${usernameResult.username}?start=${encodeURIComponent(start)}`;
    return {
      ok: true,
      url,
      previewUrl: url,
      start,
      text: config.buttonText,
      targetType: "bot_deep_link",
      warning: null,
      envName: usernameResult.envName,
    };
  }

  const previewUrl = `https://t.me/${usernameResult.envName}?start=${encodeURIComponent(start)}`;
  return {
    ok: false,
    url: null,
    previewUrl,
    start,
    text: config.buttonText,
    targetType: "missing_configuration",
    warning: `${miniAppUrlEnv}, ${miniAppNameEnv}, or ${usernameResult.envName} must be configured before live compatibility buttons appear.`,
    envName: usernameResult.envName,
  };
}

export function buildCompatibilityDeepLink(channelId, options = {}) {
  return resolveCompatibilityLaunchTarget(channelId, options);
}

export function buildCompatibilityInlineButton(channelId, options = {}) {
  const link = buildCompatibilityDeepLink(channelId, options);
  if (!link.ok) return null;
  return { text: link.text, url: link.url };
}

export function getCompatibilityButtonReport(channelId, options = {}) {
  return buildCompatibilityDeepLink(channelId, options);
}
