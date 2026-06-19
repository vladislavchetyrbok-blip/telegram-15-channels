import { validateTelegramWebAppInitData } from "./zodiac-telegram-auth";
import { getZodiacProfileSyncConfig } from "./zodiac-profile-sync-config";
import { sanitizeZodiacProfileSyncPayload } from "./zodiac-profile-sync-sanitize";
import { getZodiacProfileSyncStorage } from "./zodiac-profile-sync-storage";
import type {
  ZodiacProfileSyncConfig,
  ZodiacProfileSyncPayload,
  ZodiacProfileSyncStatus,
} from "./zodiac-profile-sync-types";

export type ZodiacProfileSyncMethod = "GET" | "POST" | "DELETE";

export type ZodiacProfileSyncRouteBody =
  | { ok: false; status: "disabled" }
  | { ok: false; status: "disabled"; stored: false }
  | { ok: false; status: "disabled"; deleted: false }
  | { ok: false; status: "auth_required" | "invalid_auth" | "backend_unavailable" | "validation_failed"; stored?: false; deleted?: false; reason?: string }
  | { ok: true; status: "valid"; payload?: ZodiacProfileSyncPayload; stored?: true; deleted?: true };

export type ZodiacProfileSyncRouteResult = {
  httpStatus: number;
  body: ZodiacProfileSyncRouteBody;
};

export async function resolveZodiacProfileSyncRequest(input: {
  method: ZodiacProfileSyncMethod;
  authorizationHeader: string | null | undefined;
  botToken: string | null | undefined;
  config?: ZodiacProfileSyncConfig;
  readBody?: () => Promise<unknown>;
  nowIso?: string;
}): Promise<ZodiacProfileSyncRouteResult> {
  const initData = parseTelegramAuthorization(input.authorizationHeader);
  if (!initData) {
    return profileSyncResponse(401, { ok: false, status: "auth_required" });
  }

  const auth = validateTelegramWebAppInitData({
    initData,
    botToken: input.botToken,
  });
  if (!auth.ok) {
    return profileSyncResponse(401, { ok: false, status: "invalid_auth" });
  }

  const config = input.config ?? getZodiacProfileSyncConfig();
  if (!config.enabled) {
    return disabledResponse(input.method);
  }

  if (input.method === "GET") {
    if (!config.readEnabled) {
      return disabledResponse(input.method);
    }

    const storage = getZodiacProfileSyncStorage(config);
    if (!storage) {
      return backendUnavailableResponse(input.method);
    }

    const payload = await storage.getProfile(auth.identity.telegramUserId);
    return profileSyncResponse(200, { ok: true, status: "valid", payload: payload ?? undefined });
  }

  if (input.method === "DELETE") {
    if (!config.writeEnabled) {
      return disabledResponse(input.method);
    }

    const storage = getZodiacProfileSyncStorage(config);
    if (!storage) {
      return backendUnavailableResponse(input.method);
    }

    await storage.deleteProfile(auth.identity.telegramUserId);
    return profileSyncResponse(200, { ok: true, status: "valid", deleted: true });
  }

  if (!config.writeEnabled) {
    return disabledResponse(input.method);
  }

  const storage = getZodiacProfileSyncStorage(config);
  if (!storage) {
    return backendUnavailableResponse(input.method);
  }

  const body = input.readBody ? await input.readBody() : undefined;
  const sanitized = sanitizeZodiacProfileSyncPayload(body, { nowIso: input.nowIso });
  if (!sanitized.ok) {
    return profileSyncResponse(400, {
      ok: false,
      status: sanitized.status,
      stored: false,
      reason: sanitized.reason,
    });
  }

  await storage.saveProfile(auth.identity.telegramUserId, sanitized.payload);
  return profileSyncResponse(200, { ok: true, status: "valid", stored: true });
}

function parseTelegramAuthorization(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const match = value.match(/^tma\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

function disabledResponse(method: ZodiacProfileSyncMethod): ZodiacProfileSyncRouteResult {
  if (method === "POST") {
    return profileSyncResponse(200, { ok: false, status: "disabled", stored: false });
  }

  if (method === "DELETE") {
    return profileSyncResponse(200, { ok: false, status: "disabled", deleted: false });
  }

  return profileSyncResponse(200, { ok: false, status: "disabled" });
}

function backendUnavailableResponse(method: ZodiacProfileSyncMethod): ZodiacProfileSyncRouteResult {
  if (method === "POST") {
    return profileSyncResponse(503, { ok: false, status: "backend_unavailable", stored: false });
  }

  if (method === "DELETE") {
    return profileSyncResponse(503, { ok: false, status: "backend_unavailable", deleted: false });
  }

  return profileSyncResponse(503, { ok: false, status: "backend_unavailable" });
}

function profileSyncResponse(
  httpStatus: number,
  body: ZodiacProfileSyncRouteBody,
): ZodiacProfileSyncRouteResult {
  return { httpStatus, body };
}

export type { ZodiacProfileSyncStatus };
export { getZodiacProfileSyncConfig, sanitizeZodiacProfileSyncPayload };
