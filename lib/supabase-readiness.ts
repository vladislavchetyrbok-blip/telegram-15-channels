import { existsSync } from "node:fs";
import path from "node:path";
import { getConfiguredPublishStoreMode } from "@/lib/storage/publish-store-factory";

export interface SupabaseReadinessStatus {
  ok: boolean;
  currentStoreMode: string;
  hasDatabaseUrl: boolean;
  hasSupabaseSchema: boolean;
  hasPostgresAdapter: boolean;
  hasMigrationScript: boolean;
  jsonStoreStillActive: boolean;
  safeToMigrateDryRun: boolean;
  productionPublishUnaffected: boolean;
  warnings: string[];
  nextSteps: string[];
}

const root = process.cwd();

export function getSupabaseReadinessStatus(): SupabaseReadinessStatus {
  const currentStoreMode = getConfiguredPublishStoreMode();
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
  const hasSupabaseSchema = existsSync(path.join(root, "supabase", "schema.sql"));
  const hasPostgresAdapter = existsSync(path.join(root, "lib", "storage", "postgres-publish-store.ts"));
  const hasMigrationScript = existsSync(path.join(root, "scripts", "migrate-json-to-supabase.mjs"));
  const jsonStoreStillActive = currentStoreMode === "json";
  const warnings: string[] = [];
  const nextSteps: string[] = [];

  if (!jsonStoreStillActive) {
    warnings.push("PUBLISH_DUE_STORE is not json. Production should stay on JSON until a separate dry-run migration is approved.");
  }

  if (!hasDatabaseUrl) {
    warnings.push("DATABASE_URL is not configured. Supabase migration can be planned, but database duplicate checks/apply cannot run yet.");
    nextSteps.push("Create a Supabase/PostgreSQL project and add DATABASE_URL only when ready for migration dry-run.");
  }

  if (!hasSupabaseSchema) {
    warnings.push("supabase/schema.sql is missing.");
    nextSteps.push("Create the database schema before any migration dry-run.");
  }

  if (!hasPostgresAdapter) {
    warnings.push("Postgres publish store adapter is missing.");
  }

  if (!hasMigrationScript) {
    warnings.push("JSON to Supabase migration script is missing.");
  }

  nextSteps.push("Run npm run db:schema:check locally.");
  nextSteps.push("Run npm run migrate:json-to-supabase:dry before any apply.");
  nextSteps.push("Keep PUBLISH_DUE_STORE=json for production until a dry-run with DATABASE_URL is reviewed.");
  nextSteps.push("After apply, test a separate postgres workflow in dry-run before any live switch.");

  return {
    ok: hasSupabaseSchema && hasPostgresAdapter && hasMigrationScript,
    currentStoreMode,
    hasDatabaseUrl,
    hasSupabaseSchema,
    hasPostgresAdapter,
    hasMigrationScript,
    jsonStoreStillActive,
    safeToMigrateDryRun: hasSupabaseSchema && hasPostgresAdapter && hasMigrationScript,
    productionPublishUnaffected: jsonStoreStillActive,
    warnings: Array.from(new Set(warnings)),
    nextSteps: Array.from(new Set(nextSteps)),
  };
}
