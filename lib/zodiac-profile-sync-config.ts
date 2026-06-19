import type { ZodiacProfileSyncBackend, ZodiacProfileSyncConfig } from "./zodiac-profile-sync-types";
import { ZODIAC_PROFILE_SYNC_DEFAULT_CONFIG } from "./zodiac-profile-sync-types";

type EnvLike = Record<string, string | undefined>;

export function getZodiacProfileSyncConfig(
  env: EnvLike = process.env,
): ZodiacProfileSyncConfig {
  const enabled = parseBooleanFlag(env.ZODIAC_PROFILE_SYNC_ENABLED);
  const backend = enabled
    ? normalizeBackend(env.ZODIAC_PROFILE_SYNC_BACKEND)
    : ZODIAC_PROFILE_SYNC_DEFAULT_CONFIG.backend;

  return {
    enabled,
    backend,
    readEnabled: enabled && parseBooleanFlag(env.ZODIAC_PROFILE_SYNC_READ_ENABLED),
    writeEnabled: enabled && parseBooleanFlag(env.ZODIAC_PROFILE_SYNC_WRITE_ENABLED),
  };
}

function parseBooleanFlag(value: string | undefined): boolean {
  return value === "true" || value === "1";
}

function normalizeBackend(value: string | undefined): ZodiacProfileSyncBackend {
  if (value === "vercel_kv" || value === "supabase") {
    return value;
  }

  return "none";
}
