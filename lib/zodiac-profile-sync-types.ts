export type ZodiacProfileSyncStatus =
  | "disabled"
  | "auth_required"
  | "valid"
  | "invalid_auth"
  | "backend_unavailable"
  | "validation_failed";

export type ZodiacProfileSyncBackend = "none" | "vercel_kv" | "supabase";

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
  enabled: boolean;
  readEnabled: boolean;
  writeEnabled: boolean;
  backend: ZodiacProfileSyncBackend;
};

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
  enabled: false,
  readEnabled: false,
  writeEnabled: false,
  backend: "none",
};
