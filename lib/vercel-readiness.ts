import { getAdminAuthStatus } from "@/lib/admin-auth";
import { getProductionSafetyStatus } from "@/lib/production-safety";

export interface VercelReadinessStatus {
  ok: boolean;
  environment: string;
  isVercel: boolean;
  isProduction: boolean;
  storeMode: string;
  adminAuthEnabled: boolean;
  adminPasswordConfigured: boolean;
  adminSessionSecretConfigured: boolean;
  hasSupabaseConfig: boolean;
  hasDatabaseUrl: boolean;
  jsonStoreProductionWarning: boolean;
  safeManualPublishOnly: boolean;
  warnings: string[];
  nextSteps: string[];
}

export function getVercelReadinessStatus(): VercelReadinessStatus {
  const adminAuth = getAdminAuthStatus();
  const safety = getProductionSafetyStatus();
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
  const hasSupabaseConfig = Boolean(
    process.env.DATABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
  const warnings: string[] = [...safety.warnings];
  const nextSteps: string[] = [];

  if (!adminAuth.authEnabled) {
    warnings.push("ADMIN_AUTH_ENABLED is false. Enable it before exposing /admin on the public internet.");
    nextSteps.push("Set ADMIN_AUTH_ENABLED=true in Vercel env.");
  }

  if (!adminAuth.adminPasswordConfigured) {
    warnings.push("ADMIN_PASSWORD is not configured.");
    nextSteps.push("Set a strong ADMIN_PASSWORD in Vercel env.");
  }

  if (!adminAuth.adminSessionSecretConfigured) {
    warnings.push("ADMIN_SESSION_SECRET is not configured.");
    nextSteps.push("Set a long random ADMIN_SESSION_SECRET in Vercel env.");
  }

  if (safety.storeMode === "json") {
    warnings.push("JSON store is active. This is fine locally, but not final for persistent Vercel writes.");
    nextSteps.push("Keep JSON mode for now; connect Supabase/PostgreSQL before full phone write control.");
  }

  if (!hasSupabaseConfig) {
    nextSteps.push("Create Supabase/PostgreSQL when ready and add DATABASE_URL only after testing.");
  }

  nextSteps.push("Deploy Vercel admin only after ADMIN_* env is configured.");
  nextSteps.push("Keep real publishing controlled by GitHub Actions secrets.");
  nextSteps.push("Run dry-run before switching any store mode away from json.");

  return {
    ok: true,
    environment: safety.environment,
    isVercel: safety.isVercel,
    isProduction: safety.isProduction,
    storeMode: safety.storeMode,
    adminAuthEnabled: adminAuth.authEnabled,
    adminPasswordConfigured: adminAuth.adminPasswordConfigured,
    adminSessionSecretConfigured: adminAuth.adminSessionSecretConfigured,
    hasSupabaseConfig,
    hasDatabaseUrl,
    jsonStoreProductionWarning: safety.storeMode === "json" && (safety.isProduction || safety.isVercel),
    safeManualPublishOnly: safety.safeManualPublishOnly,
    warnings: Array.from(new Set(warnings)),
    nextSteps: Array.from(new Set(nextSteps)),
  };
}
