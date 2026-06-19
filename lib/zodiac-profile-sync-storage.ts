import type {
  ZodiacProfileSyncConfig,
  ZodiacProfileSyncPayload,
} from "./zodiac-profile-sync-types";
import { sanitizeZodiacProfileSyncPayload } from "./zodiac-profile-sync-sanitize";

export type {
  ZodiacProfileSyncBackend,
  ZodiacProfileSyncStorageConfig,
  ZodiacProfileSyncStorageStatus,
} from "./zodiac-profile-sync-types";

export interface ZodiacProfileSyncStorage {
  getProfile(userId: string): Promise<ZodiacProfileSyncPayload | null>;
  saveProfile(userId: string, payload: ZodiacProfileSyncPayload): Promise<void>;
  deleteProfile(userId: string): Promise<void>;
}

export type ZodiacProfileSyncStorageOptions = {
  allowTestMemory?: boolean;
  nowIso?: string;
};

export function getZodiacProfileSyncStorage(
  config: ZodiacProfileSyncConfig,
  options: ZodiacProfileSyncStorageOptions = {},
): ZodiacProfileSyncStorage | null {
  if (!config.enabled || config.backend === "none" || !config.hasRequiredEnv) {
    return null;
  }

  if (config.backend === "test_memory") {
    return options.allowTestMemory
      ? createZodiacProfileSyncTestMemoryStorage({ nowIso: options.nowIso })
      : null;
  }

  // Production backends are deliberately not wired in Package 41.
  // This keeps future Redis/Vercel KV/Supabase configuration fail-closed until
  // a separate package adds and verifies real storage writes.
  return null;
}

export function isZodiacProfileSyncBackendAvailable(
  config: ZodiacProfileSyncConfig,
  options: ZodiacProfileSyncStorageOptions = {},
): boolean {
  return Boolean(getZodiacProfileSyncStorage(config, options));
}

export function createZodiacProfileSyncTestMemoryStorage(
  options: { nowIso?: string } = {},
): ZodiacProfileSyncStorage {
  const profiles = new Map<string, ZodiacProfileSyncPayload>();

  return {
    async getProfile(userId: string) {
      const key = safeUserKey(userId);
      if (!key) return null;
      const payload = profiles.get(key);
      return payload ? clonePayload(payload) : null;
    },
    async saveProfile(userId: string, payload: ZodiacProfileSyncPayload) {
      const key = safeUserKey(userId);
      if (!key) {
        throw new Error("Invalid test-memory profile sync user id.");
      }

      const sanitized = sanitizeZodiacProfileSyncPayload(payload, { nowIso: options.nowIso });
      if (!sanitized.ok) {
        throw new Error("Invalid test-memory profile sync payload.");
      }

      profiles.set(key, clonePayload(sanitized.payload));
    },
    async deleteProfile(userId: string) {
      const key = safeUserKey(userId);
      if (!key) return;
      profiles.delete(key);
    },
  };
}

function safeUserKey(value: string): string | null {
  const normalized = value.trim();
  return /^[0-9A-Za-z_-]{1,64}$/.test(normalized) ? normalized : null;
}

function clonePayload(payload: ZodiacProfileSyncPayload): ZodiacProfileSyncPayload {
  return JSON.parse(JSON.stringify(payload)) as ZodiacProfileSyncPayload;
}
