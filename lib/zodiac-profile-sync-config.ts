import type { ZodiacProfileSyncBackend, ZodiacProfileSyncConfig } from "./zodiac-profile-sync-types";
import { ZODIAC_PROFILE_SYNC_DEFAULT_CONFIG } from "./zodiac-profile-sync-types";

type EnvLike = Record<string, string | undefined>;

export function getZodiacProfileSyncConfig(
  env: EnvLike = process.env,
): ZodiacProfileSyncConfig {
  const enabled = parseBooleanFlag(env.ZODIAC_PROFILE_SYNC_ENABLED);
  const backend = enabled
    ? normalizeBackend(env.ZODIAC_PROFILE_SYNC_BACKEND, env)
    : ZODIAC_PROFILE_SYNC_DEFAULT_CONFIG.backend;
  const readEnabled = enabled && parseBooleanFlag(env.ZODIAC_PROFILE_SYNC_READ_ENABLED);
  const writeEnabled = enabled && parseBooleanFlag(env.ZODIAC_PROFILE_SYNC_WRITE_ENABLED);
  const hasRequiredEnv = backendHasRequiredEnv(backend, env);

  return {
    enabled,
    backend,
    readEnabled,
    writeEnabled,
    hasRequiredEnv,
    status: resolveStorageStatus({
      backend,
      enabled,
      hasRequiredEnv,
      readEnabled,
      writeEnabled,
    }),
  };
}

export function getZodiacProfileSyncRequiredEnvNames(
  backend: ZodiacProfileSyncBackend,
): string[] {
  if (backend === "vercel_kv" || backend === "redis_rest") {
    return [
      "ZODIAC_PROFILE_SYNC_REDIS_URL",
      "ZODIAC_PROFILE_SYNC_REDIS_TOKEN",
    ];
  }

  if (backend === "supabase") {
    return [
      "ZODIAC_PROFILE_SYNC_SUPABASE_URL",
      "ZODIAC_PROFILE_SYNC_SUPABASE_SERVICE_ROLE_KEY",
    ];
  }

  return [];
}

export function getZodiacProfileSyncEnvPresence(
  backend: ZodiacProfileSyncBackend,
  env: EnvLike = process.env,
): Array<{ name: string; configured: boolean }> {
  return getZodiacProfileSyncRequiredEnvNames(backend).map((name) => ({
    name,
    configured: Boolean(env[name]?.trim()),
  }));
}

function parseBooleanFlag(value: string | undefined): boolean {
  return value === "true" || value === "1";
}

function normalizeBackend(value: string | undefined, env: EnvLike): ZodiacProfileSyncBackend {
  if (value === "vercel_kv" || value === "redis_rest" || value === "supabase") {
    return value;
  }

  if (value === "test_memory" && parseBooleanFlag(env.ZODIAC_PROFILE_SYNC_TEST_MEMORY_ENABLED)) {
    return "test_memory";
  }

  return "none";
}

function backendHasRequiredEnv(
  backend: ZodiacProfileSyncBackend,
  env: EnvLike,
): boolean {
  if (backend === "none") {
    return false;
  }

  if (backend === "test_memory") {
    return true;
  }

  const required = getZodiacProfileSyncRequiredEnvNames(backend);
  return required.length > 0 && required.every((name) => Boolean(env[name]?.trim()));
}

function resolveStorageStatus({
  backend,
  enabled,
  hasRequiredEnv,
  readEnabled,
  writeEnabled,
}: Pick<ZodiacProfileSyncConfig, "backend" | "enabled" | "hasRequiredEnv" | "readEnabled" | "writeEnabled">): ZodiacProfileSyncConfig["status"] {
  if (!enabled) {
    return "disabled";
  }

  if (backend === "none") {
    return "backend_none";
  }

  if (backend === "test_memory") {
    return "test_ready";
  }

  if (!hasRequiredEnv) {
    return "env_missing";
  }

  if (!readEnabled && !writeEnabled) {
    return "production_not_enabled";
  }

  return "ready";
}
