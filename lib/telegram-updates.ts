import { maskTelegramToken } from "@/lib/telegram";

export interface TelegramUpdateChat {
  chatId: string;
  chatTitle: string;
  chatType: string;
  messageId: number;
  preview: string;
  date: string;
}

export interface TelegramUpdatesResult {
  ok: boolean;
  tokenConfigured: boolean;
  updates: TelegramUpdateChat[];
  error: string | null;
  checkedAt: string;
}

export async function getTelegramUpdates(): Promise<TelegramUpdatesResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim() ?? "";
  const checkedAt = new Date().toISOString();

  if (!token) {
    return {
      ok: false,
      tokenConfigured: false,
      updates: [],
      error: "token missing",
      checkedAt,
    };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/getUpdates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allowed_updates: ["message", "channel_post"] }),
    });
    const body = await response.json().catch(() => null) as TelegramGetUpdatesResponse | null;

    if (!response.ok || !body?.ok) {
      return {
        ok: false,
        tokenConfigured: true,
        updates: [],
        error: friendlyUpdatesError(body?.description || `Telegram API returned ${response.status}`),
        checkedAt,
      };
    }

    return {
      ok: true,
      tokenConfigured: true,
      updates: normalizeUpdates(body.result ?? []),
      error: null,
      checkedAt,
    };
  } catch (error) {
    return {
      ok: false,
      tokenConfigured: true,
      updates: [],
      error: error instanceof Error ? friendlyUpdatesError(error.message) : "Telegram API error",
      checkedAt,
    };
  }
}

function normalizeUpdates(updates: TelegramUpdate[]) {
  const items = updates
    .map((update) => update.channel_post ?? update.message)
    .filter((message): message is TelegramMessage => Boolean(message?.chat?.id))
    .map((message) => ({
      chatId: String(message.chat.id),
      chatTitle: message.chat.title ?? message.chat.username ?? String(message.chat.id),
      chatType: message.chat.type,
      messageId: message.message_id,
      preview: (message.text ?? message.caption ?? "").slice(0, 120),
      date: new Date(message.date * 1000).toISOString(),
    }));
  const byChat = new Map<string, TelegramUpdateChat>();

  for (const item of items) {
    byChat.set(item.chatId, item);
  }

  return Array.from(byChat.values()).sort((a, b) => b.date.localeCompare(a.date));
}

function friendlyUpdatesError(value: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const sanitized = token ? value.replaceAll(token, maskTelegramToken(token)) : value;
  const lower = sanitized.toLowerCase();

  if (lower.includes("unauthorized") || lower.includes("token")) return "token invalid";
  if (lower.includes("conflict")) return "Telegram API conflict: another getUpdates consumer may be active.";

  return sanitized || "Telegram API error";
}

interface TelegramGetUpdatesResponse {
  ok: boolean;
  description?: string;
  result?: TelegramUpdate[];
}

interface TelegramUpdate {
  message?: TelegramMessage;
  channel_post?: TelegramMessage;
}

interface TelegramMessage {
  message_id: number;
  date: number;
  text?: string;
  caption?: string;
  chat: {
    id: number;
    title?: string;
    username?: string;
    type: string;
  };
}
