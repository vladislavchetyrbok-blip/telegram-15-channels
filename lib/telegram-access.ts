import {
  getTelegramChannelTargetByChannelId,
  getTelegramChannelTargets,
  maskTelegramTarget,
  type TelegramChannelTarget,
} from "@/lib/telegram-channel-targets";
import { isValidTelegramTarget } from "@/lib/telegram-target-store";
import { maskTelegramToken } from "@/lib/telegram";

export interface TelegramAccessCheck {
  channelId: string;
  channelName: string;
  envKey: string;
  telegramTarget: string;
  targetMasked: string;
  accessStatus: "ok" | "missing_target" | "chat_not_found" | "bot_not_admin" | "not_enough_rights" | "wrong_target" | "token_invalid" | "api_error";
  botAdmin: boolean;
  canPost: boolean;
  error: string | null;
}

export interface TelegramAccessResult {
  ok: boolean;
  tokenConfigured: boolean;
  botToken: "configured" | "missing";
  channelsTotal: number;
  checked: number;
  accessible: number;
  botAdmin: number;
  canPost: number;
  realMassPublishEnabled: false;
  allowRealPublish: false;
  checks: TelegramAccessCheck[];
  checkedAt: string;
}

export interface TelegramSingleAccessInput {
  channelId?: string;
  telegramTarget?: string;
}

export async function checkTelegramChannelsAccess(): Promise<TelegramAccessResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim() ?? "";
  const targets = getTelegramChannelTargets();
  const checkedAt = new Date().toISOString();

  if (!token) {
    const checks = targets.map((target) => buildMissingTokenCheck(target));

    return buildResult({ checks, checkedAt, tokenConfigured: false });
  }

  const bot = await telegramApi<{ id: number }>(token, "getMe", {});

  if (!bot.ok || !bot.result?.id) {
    const status = classifyAccessError(bot.description);
    const checks = targets.map((target) => ({
      ...baseCheck(target),
      accessStatus: status,
      error: friendlyTelegramAccessError(bot.description || "token invalid"),
    }));

    return buildResult({ checks, checkedAt, tokenConfigured: true });
  }

  const botId = bot.result.id;
  const checks = await Promise.all(targets.map((target) => checkOneTarget(token, botId, target)));

  return buildResult({ checks, checkedAt, tokenConfigured: true });
}

export async function checkTelegramChannelAccess(input: TelegramSingleAccessInput): Promise<TelegramAccessCheck> {
  const target = resolveSingleTarget(input);
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim() ?? "";

  if (!token) {
    return buildMissingTokenCheck(target);
  }

  if (!target.target) {
    return {
      ...baseCheck(target),
      accessStatus: "missing_target",
      error: "target missing",
    };
  }

  if (!isValidTelegramTarget(target.target)) {
    return {
      ...baseCheck(target),
      accessStatus: "wrong_target",
      error: "wrong channel username/chat_id",
    };
  }

  const bot = await telegramApi<{ id: number }>(token, "getMe", {});

  if (!bot.ok || !bot.result?.id) {
    return {
      ...baseCheck(target),
      accessStatus: classifyAccessError(bot.description),
      error: friendlyTelegramAccessError(bot.description || "token invalid"),
    };
  }

  return checkOneTarget(token, bot.result.id, target);
}

async function checkOneTarget(token: string, botId: number, target: TelegramChannelTarget): Promise<TelegramAccessCheck> {
  if (!target.target) {
    return {
      ...baseCheck(target),
      accessStatus: "missing_target",
      error: `${target.envKey} is missing.`,
    };
  }

  if (!isValidTelegramTarget(target.target)) {
    return {
      ...baseCheck(target),
      accessStatus: "wrong_target",
      error: "wrong channel username/chat_id",
    };
  }

  const chat = await telegramApi<unknown>(token, "getChat", { chat_id: target.target });

  if (!chat.ok) {
    const status = classifyAccessError(chat.description);

    return {
      ...baseCheck(target),
      accessStatus: status,
      error: friendlyTelegramAccessError(chat.description || "Telegram API error"),
    };
  }

  const member = await telegramApi<TelegramChatMember>(token, "getChatMember", {
    chat_id: target.target,
    user_id: botId,
  });

  if (!member.ok || !member.result) {
    const status = classifyAccessError(member.description);

    return {
      ...baseCheck(target),
      accessStatus: status,
      error: friendlyTelegramAccessError(member.description || "Telegram API error"),
    };
  }

  const status = member.result.status;
  const botAdmin = status === "administrator" || status === "creator";
  const canPost = status === "creator" || Boolean(member.result.can_post_messages);

  return {
    ...baseCheck(target),
    accessStatus: botAdmin && canPost ? "ok" : botAdmin ? "not_enough_rights" : "bot_not_admin",
    botAdmin,
    canPost,
    error: botAdmin && canPost ? null : botAdmin ? "bot is admin but cannot post messages." : "bot is not admin.",
  };
}

function resolveSingleTarget(input: TelegramSingleAccessInput): TelegramChannelTarget {
  const linked = getTelegramChannelTargetByChannelId(input.channelId);

  if (linked) {
    return {
      ...linked,
      target: input.telegramTarget?.trim() || linked.target,
      configured: Boolean(input.telegramTarget?.trim() || linked.target),
    };
  }

  return {
    index: 0,
    envKey: "manual",
    channelId: input.channelId ?? "manual",
    channelTitle: input.channelId ?? "Manual target",
    fallbackChatId: "",
    target: input.telegramTarget?.trim() ?? "",
    configured: Boolean(input.telegramTarget?.trim()),
    targetTitle: "",
    targetType: "",
    linkSource: "manual",
  };
}

function buildResult({
  checks,
  checkedAt,
  tokenConfigured,
}: {
  checks: TelegramAccessCheck[];
  checkedAt: string;
  tokenConfigured: boolean;
}): TelegramAccessResult {
  return {
    ok: checks.every((check) => check.accessStatus === "ok"),
    tokenConfigured,
    botToken: tokenConfigured ? "configured" : "missing",
    channelsTotal: checks.length,
    checked: checks.length,
    accessible: checks.filter((check) => check.accessStatus === "ok").length,
    botAdmin: checks.filter((check) => check.botAdmin).length,
    canPost: checks.filter((check) => check.canPost).length,
    realMassPublishEnabled: false,
    allowRealPublish: false,
    checks,
    checkedAt,
  };
}

function baseCheck(target: TelegramChannelTarget): TelegramAccessCheck {
  return {
    channelId: target.channelId,
    channelName: target.channelTitle,
    envKey: target.envKey,
    telegramTarget: target.target,
    targetMasked: maskTelegramTarget(target.target),
    accessStatus: "api_error",
    botAdmin: false,
    canPost: false,
    error: null,
  };
}

function buildMissingTokenCheck(target: TelegramChannelTarget): TelegramAccessCheck {
  return {
    ...baseCheck(target),
    accessStatus: "token_invalid",
    error: "Telegram Bot token is missing.",
  };
}

async function telegramApi<T>(token: string, method: string, params: Record<string, string | number>) {
  let response: Response;

  try {
    response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
  } catch (error) {
    return {
      ok: false,
      description: error instanceof Error ? sanitizeTelegramError(error.message) : "Telegram API network error",
      result: null,
    };
  }

  const body = await response.json().catch(() => null) as TelegramApiResponse<T> | null;

  if (!response.ok || !body?.ok) {
    return {
      ok: false,
      description: sanitizeTelegramError(body?.description || `Telegram API returned ${response.status}`),
      result: null,
    };
  }

  return {
    ok: true,
    description: null,
    result: body.result,
  };
}

function classifyAccessError(description?: string | null): TelegramAccessCheck["accessStatus"] {
  const value = (description ?? "").toLowerCase();

  if (value.includes("unauthorized") || value.includes("token")) return "token_invalid";
  if (value.includes("chat not found")) return "chat_not_found";
  if (value.includes("not enough rights") || value.includes("administrator")) return "not_enough_rights";
  if (value.includes("username") || value.includes("chat_id") || value.includes("bad request")) return "wrong_target";

  return "api_error";
}

function friendlyTelegramAccessError(value: string) {
  const sanitized = sanitizeTelegramError(value);
  const lower = sanitized.toLowerCase();

  if (lower.includes("chat not found")) return "chat not found";
  if (lower.includes("not enough rights")) return "not enough rights";
  if (lower.includes("administrator")) return "bot is not admin";
  if (lower.includes("unauthorized") || lower.includes("token")) return "token invalid";
  if (lower.includes("chat_id") || lower.includes("username") || lower.includes("bad request")) return "wrong channel username/chat_id";

  return sanitized || "Telegram API error";
}

function sanitizeTelegramError(value: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    return value;
  }

  return value.replaceAll(token, maskTelegramToken(token));
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
