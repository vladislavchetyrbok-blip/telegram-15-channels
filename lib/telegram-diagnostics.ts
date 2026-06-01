import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { listTelegramTargetBindings } from "@/lib/telegram-target-store";
import { maskTelegramToken } from "@/lib/telegram";
import { isValidTelegramTarget } from "@/lib/telegram-target-store";
import { getCanonicalChannelTitle } from "@/lib/channel-canonical";

const accessStatePath = path.join(process.cwd(), "data", "runtime", "telegram-access-diagnostics.json");

export type TelegramDiagnosticError =
  | "token missing"
  | "token invalid"
  | "Telegram API unreachable"
  | "network error"
  | "DNS error"
  | "firewall/proxy error"
  | "Telegram API returned 400"
  | "Telegram API returned 401"
  | "Telegram API returned 403"
  | "Telegram API returned 429"
  | "Telegram API returned 500"
  | "Telegram API error";

export interface TelegramBotDiagnostics {
  ok: boolean;
  tokenConfigured: boolean;
  tokenMasked: string;
  tokenValid: boolean;
  botId: number | null;
  botUsername: string | null;
  exactError: TelegramDiagnosticError | string | null;
  checkedAt: string;
}

export interface TelegramChannelAccessDiagnostic {
  channelId: string;
  channelName: string;
  telegramTarget: string;
  targetFormatValid: boolean;
  chatFound: boolean;
  chatTitle: string | null;
  botAdmin: boolean;
  canPost: boolean;
  accessStatus: "OK" | "ERROR";
  exactError: string | null;
}

export interface TelegramAllAccessDiagnostics {
  ok: boolean;
  tokenConfigured: boolean;
  getMeOk: boolean;
  botId: number | null;
  botUsername: string | null;
  linked: number;
  channelsTotal: number;
  chatFound: number;
  botAdmin: number;
  canPost: number;
  accessOk: number;
  checks: TelegramChannelAccessDiagnostic[];
  checkedAt: string;
  exactError: string | null;
}

export async function getTelegramBotDiagnostics(): Promise<TelegramBotDiagnostics> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim() ?? "";
  const checkedAt = new Date().toISOString();

  if (!token) {
    return {
      ok: false,
      tokenConfigured: false,
      tokenMasked: "missing",
      tokenValid: false,
      botId: null,
      botUsername: null,
      exactError: "token missing",
      checkedAt,
    };
  }

  const result = await telegramApi<{ id: number; username?: string }>(token, "getMe", {});

  return {
    ok: result.ok && Boolean(result.result?.id),
    tokenConfigured: true,
    tokenMasked: maskTelegramToken(token),
    tokenValid: result.ok && Boolean(result.result?.id),
    botId: result.result?.id ?? null,
    botUsername: result.result?.username ?? null,
    exactError: result.ok ? null : result.error,
    checkedAt,
  };
}

export async function checkAllTelegramAccess(): Promise<TelegramAllAccessDiagnostics> {
  const bot = await getTelegramBotDiagnostics();
  const bindings = listTelegramTargetBindings();
  const checkedAt = new Date().toISOString();

  if (!bot.ok || !bot.botId) {
    const checks = bindings.map((binding) => ({
      channelId: binding.channelId,
      channelName: getCanonicalChannelTitle(binding.channelId, binding.channelTitle),
      telegramTarget: binding.telegramTarget,
      targetFormatValid: Boolean(binding.telegramTarget && isValidTelegramTarget(binding.telegramTarget)),
      chatFound: false,
      chatTitle: null,
      botAdmin: false,
      canPost: false,
      accessStatus: "ERROR" as const,
      exactError: bot.exactError ?? "getMe failed",
    }));
    const result = buildAccessResult({ bot, checks, checkedAt, exactError: bot.exactError ?? "getMe failed" });
    writeAccessDiagnostics(result);
    return result;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN?.trim() ?? "";
  const checks: TelegramChannelAccessDiagnostic[] = [];

  for (const binding of bindings) {
    checks.push(await checkOneChannelAccess({ token, botId: bot.botId, binding }));
  }

  const result = buildAccessResult({ bot, checks, checkedAt, exactError: null });
  writeAccessDiagnostics(result);
  return result;
}

export function getLastTelegramAccessDiagnostics(): TelegramAllAccessDiagnostics | null {
  if (!existsSync(accessStatePath)) return null;

  try {
    return JSON.parse(readFileSync(accessStatePath, "utf8")) as TelegramAllAccessDiagnostics;
  } catch {
    return null;
  }
}

async function checkOneChannelAccess({
  token,
  botId,
  binding,
}: {
  token: string;
  botId: number;
  binding: ReturnType<typeof listTelegramTargetBindings>[number];
}): Promise<TelegramChannelAccessDiagnostic> {
  const base = {
    channelId: binding.channelId,
    channelName: getCanonicalChannelTitle(binding.channelId, binding.channelTitle),
    telegramTarget: binding.telegramTarget,
    targetFormatValid: Boolean(binding.telegramTarget && isValidTelegramTarget(binding.telegramTarget)),
    chatFound: false,
    chatTitle: null,
    botAdmin: false,
    canPost: false,
  };

  if (!binding.telegramTarget) {
    return { ...base, accessStatus: "ERROR", exactError: "target missing" };
  }

  if (!isValidTelegramTarget(binding.telegramTarget)) {
    return { ...base, accessStatus: "ERROR", exactError: "wrong channel username/chat_id" };
  }

  const chat = await telegramApi<{ title?: string; username?: string }>(token, "getChat", { chat_id: binding.telegramTarget });

  if (!chat.ok) {
    return { ...base, accessStatus: "ERROR", exactError: chat.error };
  }

  const member = await telegramApi<TelegramChatMember>(token, "getChatMember", {
    chat_id: binding.telegramTarget,
    user_id: botId,
  });

  if (!member.ok || !member.result) {
    return { ...base, chatFound: true, chatTitle: chat.result?.title ?? chat.result?.username ?? null, accessStatus: "ERROR", exactError: member.error };
  }

  const botAdmin = member.result.status === "administrator" || member.result.status === "creator";
  const canPost = member.result.status === "creator" || Boolean(member.result.can_post_messages);

  return {
    ...base,
    chatFound: true,
    chatTitle: chat.result?.title ?? chat.result?.username ?? null,
    botAdmin,
    canPost,
    accessStatus: botAdmin && canPost ? "OK" : "ERROR",
    exactError: botAdmin && canPost ? null : botAdmin ? "not enough rights" : "bot is not admin",
  };
}

function buildAccessResult({
  bot,
  checks,
  checkedAt,
  exactError,
}: {
  bot: TelegramBotDiagnostics;
  checks: TelegramChannelAccessDiagnostic[];
  checkedAt: string;
  exactError: string | null;
}): TelegramAllAccessDiagnostics {
  return {
    ok: bot.ok && checks.some((check) => check.accessStatus === "OK"),
    tokenConfigured: bot.tokenConfigured,
    getMeOk: bot.ok,
    botId: bot.botId,
    botUsername: bot.botUsername,
    linked: checks.filter((check) => Boolean(check.telegramTarget)).length,
    channelsTotal: checks.length,
    chatFound: checks.filter((check) => check.chatFound).length,
    botAdmin: checks.filter((check) => check.botAdmin).length,
    canPost: checks.filter((check) => check.canPost).length,
    accessOk: checks.filter((check) => check.accessStatus === "OK").length,
    checks,
    checkedAt,
    exactError,
  };
}

function writeAccessDiagnostics(result: TelegramAllAccessDiagnostics) {
  mkdirSync(path.dirname(accessStatePath), { recursive: true });
  writeFileSync(accessStatePath, JSON.stringify(result, null, 2), "utf8");
}

async function telegramApi<T>(token: string, method: string, params: Record<string, string | number>) {
  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const body = await response.json().catch(() => null) as TelegramApiResponse<T> | null;

    if (!response.ok || !body?.ok) {
      return {
        ok: false,
        result: null,
        error: classifyTelegramError(response.status, body?.description),
      };
    }

    return {
      ok: true,
      result: body.result ?? null,
      error: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "network error";
    return {
      ok: false,
      result: null,
      error: classifyNetworkError(message),
    };
  }
}

function classifyTelegramError(status: number, description?: string | null) {
  const lower = (description ?? "").toLowerCase();
  const safeDescription = sanitizeTelegramError(description ?? `Telegram API returned ${status}`);

  if (status === 401 || lower.includes("unauthorized") || lower.includes("token")) return "token invalid";
  if (status === 400) return lower.includes("chat not found") ? "chat not found" : `Telegram API returned 400: ${safeDescription}`;
  if (status === 403) return `Telegram API returned 403: ${safeDescription}`;
  if (status === 429) return `Telegram API returned 429: ${safeDescription}`;
  if (status >= 500) return `Telegram API returned 500: ${safeDescription}`;

  return `Telegram API error: ${safeDescription}`;
}

function classifyNetworkError(message: string): TelegramDiagnosticError | string {
  const lower = message.toLowerCase();

  if (lower.includes("enotfound") || lower.includes("getaddrinfo") || lower.includes("dns")) return "DNS error";
  if (lower.includes("econnrefused") || lower.includes("econnreset") || lower.includes("network")) return "network error";
  if (lower.includes("fetch failed")) return "Telegram API unreachable";
  if (lower.includes("proxy") || lower.includes("firewall")) return "firewall/proxy error";

  return `network error: ${message}`;
}

function sanitizeTelegramError(value: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  return token ? value.replaceAll(token, maskTelegramToken(token)) : value;
}

interface TelegramApiResponse<T> {
  ok: boolean;
  description?: string;
  result?: T;
}

interface TelegramChatMember {
  status: "creator" | "administrator" | "member" | "restricted" | "left" | "kicked";
  can_post_messages?: boolean;
}
