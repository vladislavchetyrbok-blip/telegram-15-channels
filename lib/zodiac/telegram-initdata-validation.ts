import crypto from "crypto";

export type TelegramInitDataValidationStatus =
  | "valid"
  | "missing-hash"
  | "invalid-hash"
  | "missing-auth-date"
  | "expired"
  | "parse-error"
  | "missing-bot-token";

export type TelegramInitDataUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
};

export type TelegramInitDataValidationResult = {
  ok: boolean;
  status: TelegramInitDataValidationStatus;
  user?: TelegramInitDataUser;
  authDate?: number;
  ageSeconds?: number;
  reason?: string;
};

export type TelegramInitDataValidationOptions = {
  botToken?: string;
  maxAgeSeconds?: number;
  nowUnixSeconds?: number;
};

export function parseTelegramInitData(initData: string): URLSearchParams {
  return new URLSearchParams(initData);
}

export function buildTelegramDataCheckString(params: URLSearchParams): string {
  const keys = Array.from(params.keys())
    .filter((k) => k !== "hash")
    .sort();
  return keys.map((k) => `${k}=${params.get(k)}`).join("\n");
}

export function validateTelegramInitData(
  initData: string,
  options: TelegramInitDataValidationOptions
): TelegramInitDataValidationResult {
  if (!options.botToken) {
    return {
      ok: false,
      status: "missing-bot-token",
      reason: "Bot token is required for validation",
    };
  }

  let params: URLSearchParams;
  try {
    params = parseTelegramInitData(initData);
  } catch (e) {
    return {
      ok: false,
      status: "parse-error",
      reason: "Failed to parse initData",
    };
  }

  const hash = params.get("hash");
  if (!hash) {
    return {
      ok: false,
      status: "missing-hash",
      reason: "Missing hash parameter",
    };
  }

  const dataCheckString = buildTelegramDataCheckString(params);

  try {
    const secretKey = crypto.createHmac("sha256", "WebAppData").update(options.botToken).digest();
    const calculatedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

    if (calculatedHash !== hash) {
      return {
        ok: false,
        status: "invalid-hash",
        reason: "Hash mismatch",
      };
    }
  } catch (e) {
    return {
      ok: false,
      status: "invalid-hash",
      reason: "Validation exception",
    };
  }

  const authDateStr = params.get("auth_date");
  if (!authDateStr) {
    return {
      ok: false,
      status: "missing-auth-date",
      reason: "Missing auth_date",
    };
  }

  const authDate = parseInt(authDateStr, 10);
  if (isNaN(authDate)) {
    return {
      ok: false,
      status: "parse-error",
      reason: "Invalid auth_date",
    };
  }

  const now = options.nowUnixSeconds ?? Math.floor(Date.now() / 1000);
  const ageSeconds = now - authDate;

  if (options.maxAgeSeconds !== undefined && ageSeconds > options.maxAgeSeconds) {
    return {
      ok: false,
      status: "expired",
      authDate,
      ageSeconds,
      reason: `Data is expired (${ageSeconds}s old, max ${options.maxAgeSeconds}s)`,
    };
  }

  let user: TelegramInitDataUser | undefined;
  const userStr = params.get("user");
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      return {
        ok: false,
        status: "parse-error",
        reason: "Failed to parse user JSON",
      };
    }
  }

  return {
    ok: true,
    status: "valid",
    user,
    authDate,
    ageSeconds,
  };
}
