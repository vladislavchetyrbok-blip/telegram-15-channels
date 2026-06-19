import { sanitizeZodiacProfileSyncPayload } from "@/lib/zodiac-profile-sync-sanitize";
import type { ZodiacProfileSyncPayload } from "@/lib/zodiac-profile-sync-types";

export type ProfileSyncClientStatus =
  | "disabled"
  | "outside_telegram"
  | "auth_missing"
  | "ready_readonly"
  | "ready_write"
  | "error";

export type ProfileSyncClientConfig = {
  enabled: boolean;
  readEnabled: boolean;
  writeEnabled: boolean;
  endpoint: string;
};

export type ProfileSyncClientStatusResult = {
  status: ProfileSyncClientStatus;
  enabled: boolean;
  readEnabled: boolean;
  writeEnabled: boolean;
};

export type ProfileSyncClientResult =
  | {
      ok: true;
      status: "ready_readonly" | "ready_write";
      networkCalled: true;
      payload?: ZodiacProfileSyncPayload | null;
    }
  | {
      ok: false;
      status: ProfileSyncClientStatus;
      networkCalled: boolean;
      reason?: string;
    };

type FetchLike = (input: string, init?: RequestInit) => Promise<{
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}>;

type TelegramWebAppWindow = Window & {
  Telegram?: {
    WebApp?: {
      initData?: string;
    };
  };
};

type ProfileSyncClientOptions = {
  config?: Partial<ProfileSyncClientConfig>;
  windowRef?: Window;
  fetcher?: FetchLike;
};

export const PROFILE_SYNC_DEFAULT_ENDPOINT = "/api/zodiac/profile/sync";

export async function getProfileSyncClientStatus(
  options: ProfileSyncClientOptions = {},
): Promise<ProfileSyncClientStatusResult> {
  const config = resolveProfileSyncClientConfig(options.config);
  if (!config.enabled || (!config.readEnabled && !config.writeEnabled)) {
    return {
      status: "disabled",
      enabled: false,
      readEnabled: false,
      writeEnabled: false,
    };
  }

  const initData = getTelegramWebAppInitData(options.windowRef);
  if (initData.status !== "ok") {
    return {
      status: initData.status,
      enabled: true,
      readEnabled: config.readEnabled,
      writeEnabled: config.writeEnabled,
    };
  }

  return {
    status: config.writeEnabled ? "ready_write" : "ready_readonly",
    enabled: true,
    readEnabled: config.readEnabled,
    writeEnabled: config.writeEnabled,
  };
}

export async function fetchRemoteProfileIfEnabled(
  options: ProfileSyncClientOptions = {},
): Promise<ProfileSyncClientResult> {
  const config = resolveProfileSyncClientConfig(options.config);
  if (!config.enabled || !config.readEnabled) {
    return noNetwork("disabled");
  }

  const initData = getTelegramWebAppInitData(options.windowRef);
  if (initData.status !== "ok") {
    return noNetwork(initData.status);
  }

  return requestRemoteProfile({
    method: "GET",
    endpoint: config.endpoint,
    initData: initData.value,
    fetcher: options.fetcher,
    readyStatus: config.writeEnabled ? "ready_write" : "ready_readonly",
  });
}

export async function pushRemoteProfileIfEnabled(
  payload: unknown,
  options: ProfileSyncClientOptions = {},
): Promise<ProfileSyncClientResult> {
  const config = resolveProfileSyncClientConfig(options.config);
  if (!config.enabled || !config.writeEnabled) {
    return noNetwork("disabled");
  }

  const initData = getTelegramWebAppInitData(options.windowRef);
  if (initData.status !== "ok") {
    return noNetwork(initData.status);
  }

  const sanitized = sanitizeZodiacProfileSyncPayload(payload);
  if (!sanitized.ok) {
    return {
      ok: false,
      status: "error",
      networkCalled: false,
      reason: sanitized.reason,
    };
  }

  return requestRemoteProfile({
    method: "POST",
    endpoint: config.endpoint,
    initData: initData.value,
    fetcher: options.fetcher,
    body: sanitized.payload,
    readyStatus: "ready_write",
  });
}

export async function deleteRemoteProfileIfEnabled(
  options: ProfileSyncClientOptions = {},
): Promise<ProfileSyncClientResult> {
  const config = resolveProfileSyncClientConfig(options.config);
  if (!config.enabled || !config.writeEnabled) {
    return noNetwork("disabled");
  }

  const initData = getTelegramWebAppInitData(options.windowRef);
  if (initData.status !== "ok") {
    return noNetwork(initData.status);
  }

  return requestRemoteProfile({
    method: "DELETE",
    endpoint: config.endpoint,
    initData: initData.value,
    fetcher: options.fetcher,
    readyStatus: "ready_write",
  });
}

export function resolveProfileSyncClientConfig(
  overrides: Partial<ProfileSyncClientConfig> = {},
): ProfileSyncClientConfig {
  const enabled = overrides.enabled ?? publicFlag("NEXT_PUBLIC_ZODIAC_PROFILE_SYNC_ENABLED");
  const readEnabled = enabled && (overrides.readEnabled ?? publicFlag("NEXT_PUBLIC_ZODIAC_PROFILE_SYNC_READ_ENABLED"));
  const writeEnabled = enabled && (overrides.writeEnabled ?? publicFlag("NEXT_PUBLIC_ZODIAC_PROFILE_SYNC_WRITE_ENABLED"));

  return {
    enabled,
    readEnabled,
    writeEnabled,
    endpoint: overrides.endpoint ?? PROFILE_SYNC_DEFAULT_ENDPOINT,
  };
}

async function requestRemoteProfile({
  method,
  endpoint,
  initData,
  fetcher,
  body,
  readyStatus,
}: {
  method: "GET" | "POST" | "DELETE";
  endpoint: string;
  initData: string;
  fetcher?: FetchLike;
  body?: ZodiacProfileSyncPayload;
  readyStatus: "ready_readonly" | "ready_write";
}): Promise<ProfileSyncClientResult> {
  try {
    const request = fetcher ?? globalThis.fetch?.bind(globalThis);
    if (!request) {
      return { ok: false, status: "error", networkCalled: false, reason: "fetch_unavailable" };
    }

    const response = await request(endpoint, {
      method,
      headers: {
        Authorization: `tma ${initData}`,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const json = await response.json().catch(() => null);
    if (!response.ok || !isRecord(json)) {
      return { ok: false, status: "error", networkCalled: true };
    }

    if (json.ok === true) {
      return {
        ok: true,
        status: readyStatus,
        networkCalled: true,
        payload: isProfileSyncPayload(json.payload) ? json.payload : null,
      };
    }

    return {
      ok: false,
      status: normalizeServerStatus(json.status),
      networkCalled: true,
    };
  } catch {
    return { ok: false, status: "error", networkCalled: true };
  }
}

function noNetwork(status: ProfileSyncClientStatus): ProfileSyncClientResult {
  return { ok: false, status, networkCalled: false };
}

function getTelegramWebAppInitData(windowRef?: Window):
  | { status: "ok"; value: string }
  | { status: "outside_telegram" | "auth_missing" } {
  const source = (windowRef ?? (typeof window !== "undefined" ? window : undefined)) as TelegramWebAppWindow | undefined;
  const initData = source?.Telegram?.WebApp?.initData;

  if (!source?.Telegram?.WebApp) {
    return { status: "outside_telegram" };
  }

  if (typeof initData !== "string" || !initData.trim()) {
    return { status: "auth_missing" };
  }

  return { status: "ok", value: initData };
}

function normalizeServerStatus(value: unknown): ProfileSyncClientStatus {
  if (value === "disabled") {
    return "disabled";
  }

  if (value === "auth_required") {
    return "auth_missing";
  }

  if (value === "invalid_auth" || value === "backend_unavailable" || value === "validation_failed") {
    return "error";
  }

  return "error";
}

function isProfileSyncPayload(value: unknown): value is ZodiacProfileSyncPayload {
  return isRecord(value) && value.syncVersion === 1;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function publicFlag(name: string): boolean {
  const env = typeof process !== "undefined" ? process.env : undefined;
  return env?.[name] === "true" || env?.[name] === "1";
}
