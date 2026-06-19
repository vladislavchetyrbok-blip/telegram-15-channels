export type ZodiacProfileSyncStatus =
  | "disabled"
  | "auth_required"
  | "valid"
  | "invalid_auth"
  | "backend_unavailable"
  | "validation_failed";

export type ZodiacProfileSyncBackend =
  | "none"
  | "vercel_kv"
  | "redis_rest"
  | "supabase"
  | "test_memory";

export type ZodiacProfileSyncStorageStatus =
  | "disabled"
  | "backend_none"
  | "env_missing"
  | "test_ready"
  | "production_not_enabled"
  | "ready";

export type ZodiacSyncedRetentionItem = {
  id: string;
  featureKey: string;
  section?: string;
  sign?: string;
  firstSign?: string;
  secondSign?: string;
  mode?: string;
  tier?: string;
  scoreTier?: string;
  label: string;
  timestamp: string;
};

export type ZodiacProfileSyncPayload = {
  syncVersion: 1;
  history: ZodiacSyncedRetentionItem[];
  favorites: ZodiacSyncedRetentionItem[];
  updatedAt: string;
};

export type ZodiacProfileSyncConfig = {
  backend: ZodiacProfileSyncBackend;
  enabled: boolean;
  readEnabled: boolean;
  writeEnabled: boolean;
  hasRequiredEnv: boolean;
  status: ZodiacProfileSyncStorageStatus;
};

export type ZodiacProfileSyncStorageConfig = ZodiacProfileSyncConfig;

export type ZodiacProfileSyncValidationResult =
  | {
      ok: true;
      payload: ZodiacProfileSyncPayload;
      strippedFields: string[];
      warnings: string[];
    }
  | {
      ok: false;
      status: "validation_failed";
      reason: string;
      strippedFields: string[];
      warnings: string[];
    };

export const ZODIAC_PROFILE_SYNC_DEFAULT_CONFIG: ZodiacProfileSyncConfig = {
  backend: "none",
  enabled: false,
  readEnabled: false,
  writeEnabled: false,
  hasRequiredEnv: false,
  status: "disabled",
};
