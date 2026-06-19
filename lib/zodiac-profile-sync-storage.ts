import type {
  ZodiacProfileSyncConfig,
  ZodiacProfileSyncPayload,
} from "./zodiac-profile-sync-types";

export interface ZodiacProfileSyncStorage {
  getProfile(userId: string): Promise<ZodiacProfileSyncPayload | null>;
  saveProfile(userId: string, payload: ZodiacProfileSyncPayload): Promise<void>;
  deleteProfile(userId: string): Promise<void>;
}

export function getZodiacProfileSyncStorage(
  _config: ZodiacProfileSyncConfig,
): ZodiacProfileSyncStorage | null {
  return null;
}

export function isZodiacProfileSyncBackendAvailable(
  config: ZodiacProfileSyncConfig,
): boolean {
  return config.enabled && config.backend !== "none" && Boolean(getZodiacProfileSyncStorage(config));
}
