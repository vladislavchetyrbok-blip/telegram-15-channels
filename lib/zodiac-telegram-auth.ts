import { createHmac, timingSafeEqual } from "node:crypto";

export type TelegramWebAppAuthStatus =
  | "valid"
  | "missing"
  | "invalid_hash"
  | "expired"
  | "malformed"
  | "bot_token_missing";

export type TelegramWebAppIdentity = {
  telegramUserId: string;
  username?: string;
  firstName?: string;
  languageCode?: string;
  authDate: number;
};

export type TelegramWebAppValidationResult =
  | { ok: true; status: "valid"; identity: TelegramWebAppIdentity }
  | {
      ok: false;
      status: Exclude<TelegramWebAppAuthStatus, "valid">;
      reason: string;
    };

export const TELEGRAM_WEBAPP_INIT_DATA_MAX_AGE_SECONDS = 24 * 60 * 60;

type ParsedInitData =
  | { ok: true; fields: Map<string, string>; hash: string }
  | { ok: false; status: "missing" | "malformed"; reason: string };

type ParsedTelegramUser =
  | {
      ok: true;
      user: {
        id: string;
        username?: string;
        firstName?: string;
        languageCode?: string;
      };
    }
  | { ok: false; reason: string };

export function validateTelegramWebAppInitData(input: {
  initData: string | null | undefined;
  botToken: string | null | undefined;
  maxAgeSeconds?: number;
  nowUnixSeconds?: number;
}): TelegramWebAppValidationResult {
  try {
    const initData =
      typeof input.initData === "string" ? input.initData.trim() : "";
    if (!initData) {
      return fail("missing", "Telegram WebApp initData is missing.");
    }

    const botToken =
      typeof input.botToken === "string" ? input.botToken.trim() : "";
    if (!botToken) {
      return fail(
        "bot_token_missing",
        "Telegram bot token is not configured.",
      );
    }

    const parsed = parseTelegramInitData(initData);
    if (!parsed.ok) {
      return fail(parsed.status, parsed.reason);
    }

    const authDateRaw = parsed.fields.get("auth_date");
    if (!authDateRaw || !/^\d+$/.test(authDateRaw)) {
      return fail(
        "malformed",
        "Telegram WebApp initData auth_date is missing or invalid.",
      );
    }

    const authDate = Number(authDateRaw);
    if (!Number.isSafeInteger(authDate) || authDate <= 0) {
      return fail(
        "malformed",
        "Telegram WebApp initData auth_date is not a safe timestamp.",
      );
    }

    const nowUnixSeconds = normalizeUnixSeconds(input.nowUnixSeconds);
    const maxAgeSeconds = normalizeMaxAgeSeconds(input.maxAgeSeconds);
    if (nowUnixSeconds - authDate > maxAgeSeconds) {
      return fail("expired", "Telegram WebApp initData is expired.");
    }

    const dataCheckString = buildDataCheckString(parsed.fields);
    const expectedHash = buildTelegramWebAppHash(dataCheckString, botToken);
    if (!timingSafeHexEqual(expectedHash, parsed.hash)) {
      return fail("invalid_hash", "Telegram WebApp initData hash is invalid.");
    }

    const userRaw = parsed.fields.get("user");
    if (!userRaw) {
      return fail("malformed", "Telegram WebApp initData user is missing.");
    }

    const userResult = parseTelegramUser(userRaw);
    if (!userResult.ok) {
      return fail("malformed", userResult.reason);
    }

    return {
      ok: true,
      status: "valid",
      identity: {
        telegramUserId: userResult.user.id,
        username: userResult.user.username,
        firstName: userResult.user.firstName,
        languageCode: userResult.user.languageCode,
        authDate,
      },
    };
  } catch {
    return fail("malformed", "Telegram WebApp initData could not be parsed.");
  }
}

function parseTelegramInitData(initData: string): ParsedInitData {
  let params: URLSearchParams;

  try {
    params = new URLSearchParams(
      initData.startsWith("?") ? initData.slice(1) : initData,
    );
  } catch {
    return {
      ok: false,
      status: "malformed",
      reason: "Telegram WebApp initData is not a valid query string.",
    };
  }

  const fields = new Map<string, string>();
  const seen = new Set<string>();
  let hash: string | null = null;
  let malformedReason: string | null = null;

  params.forEach((value, key) => {
    if (malformedReason) {
      return;
    }

    if (!key || seen.has(key)) {
      malformedReason =
        "Telegram WebApp initData contains invalid or duplicate keys.";
      return;
    }

    seen.add(key);
    if (key === "hash") {
      hash = value;
      return;
    }

    fields.set(key, value);
  });

  if (malformedReason) {
    return {
      ok: false,
      status: "malformed",
      reason: malformedReason,
    };
  }

  if (!hash) {
    return {
      ok: false,
      status: "malformed",
      reason: "Telegram WebApp initData hash is missing.",
    };
  }

  if (!/^[a-f0-9]{64}$/i.test(hash)) {
    return {
      ok: false,
      status: "malformed",
      reason: "Telegram WebApp initData hash format is invalid.",
    };
  }

  if (fields.size === 0) {
    return {
      ok: false,
      status: "missing",
      reason: "Telegram WebApp initData fields are missing.",
    };
  }

  return { ok: true, fields, hash };
}

function buildDataCheckString(fields: Map<string, string>): string {
  return Array.from(fields.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
}

function buildTelegramWebAppHash(
  dataCheckString: string,
  botToken: string,
): string {
  const secret = createHmac("sha256", "WebAppData").update(botToken).digest();
  return createHmac("sha256", secret).update(dataCheckString).digest("hex");
}

function timingSafeHexEqual(expectedHex: string, actualHex: string): boolean {
  try {
    if (!/^[a-f0-9]{64}$/i.test(expectedHex) || !/^[a-f0-9]{64}$/i.test(actualHex)) {
      return false;
    }

    const expected = Buffer.from(expectedHex, "hex");
    const actual = Buffer.from(actualHex, "hex");
    if (expected.length !== actual.length) {
      return false;
    }

    return timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

function parseTelegramUser(userRaw: string): ParsedTelegramUser {
  try {
    const parsed = JSON.parse(userRaw) as {
      id?: unknown;
      username?: unknown;
      first_name?: unknown;
      language_code?: unknown;
    };

    const id = normalizeTelegramUserId(parsed.id);
    if (!id) {
      return {
        ok: false,
        reason: "Telegram WebApp initData user id is missing or invalid.",
      };
    }

    return {
      ok: true,
      user: {
        id,
        username: normalizeOptionalString(parsed.username),
        firstName: normalizeOptionalString(parsed.first_name),
        languageCode: normalizeOptionalString(parsed.language_code),
      },
    };
  } catch {
    return {
      ok: false,
      reason: "Telegram WebApp initData user JSON is malformed.",
    };
  }
}

function normalizeTelegramUserId(value: unknown): string | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return /^\d+$/.test(trimmed) ? trimmed : undefined;
  }

  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return String(Math.trunc(value));
  }

  return undefined;
}

function normalizeOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, 128) : undefined;
}

function normalizeMaxAgeSeconds(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.floor(value);
  }

  return TELEGRAM_WEBAPP_INIT_DATA_MAX_AGE_SECONDS;
}

function normalizeUnixSeconds(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return Math.floor(value);
  }

  return Math.floor(Date.now() / 1000);
}

function fail<TStatus extends Exclude<TelegramWebAppAuthStatus, "valid">>(
  status: TStatus,
  reason: string,
): Extract<TelegramWebAppValidationResult, { ok: false }> {
  return { ok: false, status, reason };
}
