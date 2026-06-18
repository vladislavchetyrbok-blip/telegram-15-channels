import fs from "fs";
import path from "path";
import process from "process";

export const COMPATIBILITY_BOT_CONFIG_PATH = path.resolve(process.cwd(), "data/config/zodiac-compatibility-bot.json");
export const DEFAULT_COMPATIBILITY_BOT_USERNAME_ENV = "COMPATIBILITY_BOT_USERNAME";
export const DEFAULT_COMPATIBILITY_MINI_APP_URL_ENV = "COMPATIBILITY_MINI_APP_URL";
export const DEFAULT_COMPATIBILITY_MINI_APP_NAME_ENV = "COMPATIBILITY_MINI_APP_NAME";
export const DEFAULT_COMPATIBILITY_BUTTON_TEXT = "💞 Совместимость знаков";
export const MINI_APP_START_PARAMETERS = Object.freeze({
  compat: "compat",
  mystic: "mystic",
  vip: "vip",
  birthMatrix: "birth_matrix",
  angelNumbers: "angel_numbers",
  week: "week",
});

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
      compatibilityBotUsername: null,
      compatibilityMiniAppUrl: null,
      compatibilityMiniAppName: null,
      namedDirectLinkMiniAppEnabled: false,
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
    compatibilityBotUsername: parsed.compatibilityBotUsername ?? parsed.username ?? null,
    compatibilityMiniAppUrl: parsed.compatibilityMiniAppUrl ?? parsed.miniAppUrl ?? null,
    compatibilityMiniAppName: parsed.compatibilityMiniAppName ?? parsed.miniAppName ?? null,
    namedDirectLinkMiniAppEnabled: parsed.namedDirectLinkMiniAppEnabled === true,
    username: parsed.username ?? parsed.compatibilityBotUsername ?? null,
    miniAppUrl: parsed.miniAppUrl ?? parsed.compatibilityMiniAppUrl ?? null,
    miniAppName: parsed.miniAppName ?? parsed.compatibilityMiniAppName ?? null,
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

  const configUsername = normalizeCompatibilityBotUsername(config.compatibilityBotUsername) || normalizeCompatibilityBotUsername(config.username);
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

export function normalizeMiniAppStartParameter(value) {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized) return null;
  if (Object.values(MINI_APP_START_PARAMETERS).includes(normalized)) return normalized;
  const compatMatch = normalized.match(/^compat_([a-z-]+)$/);
  if (compatMatch && ZODIAC_SIGN_SLUGS.has(compatMatch[1])) return normalized;
  return null;
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
  const liveButtonEnabled = config.liveChannelPostsEnabled === true;
  const miniAppUrl = normalizeCompatibilityMiniAppUrl(env[miniAppUrlEnv]) || normalizeCompatibilityMiniAppUrl(config.compatibilityMiniAppUrl) || normalizeCompatibilityMiniAppUrl(config.miniAppUrl);
  const miniAppName = normalizeCompatibilityMiniAppName(env[miniAppNameEnv]) || normalizeCompatibilityMiniAppName(config.compatibilityMiniAppName) || normalizeCompatibilityMiniAppName(config.miniAppName);
  const namedDirectLinkEnabled = config.namedDirectLinkMiniAppEnabled === true;
  const publicPreviewUrl = miniAppUrl ? appendQuery(miniAppUrl, "startapp", start) : null;
  const disabledWarning = "Compatibility launch target is configured, but liveChannelPostsEnabled=false; daily live buttons remain omitted until explicit approval.";

  if (usernameResult.ok && namedDirectLinkEnabled && miniAppName) {
    const url = `https://t.me/${usernameResult.username}/${miniAppName}?startapp=${encodeURIComponent(start)}`;
    return {
      ok: liveButtonEnabled,
      url: liveButtonEnabled ? url : null,
      previewUrl: url,
      start,
      text: config.buttonText,
      targetType: liveButtonEnabled ? "named_mini_app" : "named_mini_app_disabled",
      warning: liveButtonEnabled ? null : disabledWarning,
      envName: `${usernameResult.envName}+${miniAppNameEnv}`,
    };
  }

  if (usernameResult.ok && miniAppUrl) {
    const url = `https://t.me/${usernameResult.username}?startapp=${encodeURIComponent(start)}`;
    return {
      ok: liveButtonEnabled,
      url: liveButtonEnabled ? url : null,
      previewUrl: url,
      start,
      text: config.buttonText,
      targetType: liveButtonEnabled ? "main_mini_app" : "main_mini_app_disabled",
      warning: liveButtonEnabled ? null : disabledWarning,
      envName: `${usernameResult.envName}+${miniAppUrlEnv}`,
    };
  }

  if (usernameResult.ok) {
    const url = `https://t.me/${usernameResult.username}?start=${encodeURIComponent(start)}`;
    return {
      ok: liveButtonEnabled,
      url: liveButtonEnabled ? url : null,
      previewUrl: url,
      start,
      text: config.buttonText,
      targetType: liveButtonEnabled ? "bot_deep_link" : "bot_deep_link_disabled",
      warning: liveButtonEnabled ? null : disabledWarning,
      envName: usernameResult.envName,
    };
  }

  const previewUrl = publicPreviewUrl || `https://t.me/${usernameResult.envName}?start=${encodeURIComponent(start)}`;
  return {
    ok: false,
    url: null,
    previewUrl,
    start,
    text: config.buttonText,
    targetType: "missing_configuration",
    warning: `${usernameResult.envName} must be configured before live compatibility buttons appear. ${miniAppNameEnv} enables the Telegram Mini App path; ${miniAppUrlEnv} is the public /compatibility URL for Mini App setup.`,
    envName: usernameResult.envName,
  };
}

export function buildCompatibilityDeepLink(channelId, options = {}) {
  return resolveCompatibilityLaunchTarget(channelId, options);
}

export function buildCompatibilityInlineButton(channelId, options = {}) {
  const link = buildCompatibilityDeepLink(channelId, options);
  const preview = options.preview === true || options.allowPreview === true;
  if (!link.ok && !preview) return null;

  const url = link.url || (preview ? link.previewUrl : null);
  if (!url) return null;
  return { text: options.text || link.text, url };
}

export function resolveMiniAppLaunchTarget(startParameter, text, { env = process.env } = {}) {
  const start = normalizeMiniAppStartParameter(startParameter);
  const config = loadCompatibilityBotConfig();
  const miniAppUrlEnv = config.miniAppUrlEnv || DEFAULT_COMPATIBILITY_MINI_APP_URL_ENV;
  const miniAppNameEnv = config.miniAppNameEnv || DEFAULT_COMPATIBILITY_MINI_APP_NAME_ENV;
  const usernameResult = resolveCompatibilityBotUsername({ env });
  const liveButtonEnabled = config.liveChannelPostsEnabled === true;
  const miniAppUrl = normalizeCompatibilityMiniAppUrl(env[miniAppUrlEnv]) || normalizeCompatibilityMiniAppUrl(config.compatibilityMiniAppUrl) || normalizeCompatibilityMiniAppUrl(config.miniAppUrl);
  const miniAppName = normalizeCompatibilityMiniAppName(env[miniAppNameEnv]) || normalizeCompatibilityMiniAppName(config.compatibilityMiniAppName) || normalizeCompatibilityMiniAppName(config.miniAppName);
  const namedDirectLinkEnabled = config.namedDirectLinkMiniAppEnabled === true;
  const publicPreviewUrl = start && miniAppUrl ? appendQuery(miniAppUrl, "startapp", start) : null;
  const disabledWarning = "Mini App launch target is configured, but liveChannelPostsEnabled=false; live channel buttons remain omitted until explicit approval.";

  if (!start) {
    return {
      ok: false,
      url: null,
      previewUrl: null,
      start: null,
      text,
      targetType: "invalid_start_parameter",
      warning: `Invalid Mini App start parameter: ${startParameter}`,
      envName: null,
    };
  }

  if (usernameResult.ok && namedDirectLinkEnabled && miniAppName) {
    const url = `https://t.me/${usernameResult.username}/${miniAppName}?startapp=${encodeURIComponent(start)}`;
    return {
      ok: liveButtonEnabled,
      url: liveButtonEnabled ? url : null,
      previewUrl: url,
      start,
      text,
      targetType: liveButtonEnabled ? "named_mini_app" : "named_mini_app_disabled",
      warning: liveButtonEnabled ? null : disabledWarning,
      envName: `${usernameResult.envName}+${miniAppNameEnv}`,
    };
  }

  if (usernameResult.ok && miniAppUrl) {
    const url = `https://t.me/${usernameResult.username}?startapp=${encodeURIComponent(start)}`;
    return {
      ok: liveButtonEnabled,
      url: liveButtonEnabled ? url : null,
      previewUrl: url,
      start,
      text,
      targetType: liveButtonEnabled ? "main_mini_app" : "main_mini_app_disabled",
      warning: liveButtonEnabled ? null : disabledWarning,
      envName: `${usernameResult.envName}+${miniAppUrlEnv}`,
    };
  }

  if (usernameResult.ok) {
    const url = `https://t.me/${usernameResult.username}?start=${encodeURIComponent(start)}`;
    return {
      ok: liveButtonEnabled,
      url: liveButtonEnabled ? url : null,
      previewUrl: url,
      start,
      text,
      targetType: liveButtonEnabled ? "bot_deep_link" : "bot_deep_link_disabled",
      warning: liveButtonEnabled ? null : disabledWarning,
      envName: usernameResult.envName,
    };
  }

  const previewUrl = publicPreviewUrl || `https://t.me/${usernameResult.envName}?start=${encodeURIComponent(start)}`;
  return {
    ok: false,
    url: null,
    previewUrl,
    start,
    text,
    targetType: "missing_configuration",
    warning: `${usernameResult.envName} must be configured before live Mini App buttons appear. ${miniAppNameEnv} enables the Telegram Mini App path; ${miniAppUrlEnv} is the public /compatibility URL for Mini App setup.`,
    envName: usernameResult.envName,
  };
}

export function buildMiniAppInlineButton(startParameter, text, options = {}) {
  const link = resolveMiniAppLaunchTarget(startParameter, text, options);
  const preview = options.preview === true || options.allowPreview === true;
  if (!link.ok && !preview) return null;

  const url = link.url || (preview ? link.previewUrl : null);
  if (!url) return null;
  return { text: link.text, url };
}

export function getCompatibilityButtonReport(channelId, options = {}) {
  return buildCompatibilityDeepLink(channelId, options);
}

export function getMiniAppButtonReport(startParameter, text, options = {}) {
  return resolveMiniAppLaunchTarget(startParameter, text, options);
}
