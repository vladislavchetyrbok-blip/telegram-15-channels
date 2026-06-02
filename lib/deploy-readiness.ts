import { existsSync } from "node:fs";
import path from "node:path";

export interface DeployReadinessStatus {
  ok: boolean;
  repositoryMode: "git" | "local" | "unknown";
  storeMode: "json" | "postgres" | string;
  hasGitHubWorkflow: boolean;
  hasJsonStore: boolean;
  hasPublicationLogs: boolean;
  hasMobileControl: boolean;
  hasSchedulerDashboard: boolean;
  hasSupabaseConfig: boolean;
  hasVercelConfig: boolean;
  hasSupabaseSchema: boolean;
  hasPostgresAdapter: boolean;
  databaseUrlConfigured: boolean;
  warnings: string[];
  nextSteps: string[];
}

const root = process.cwd();

export function getDeployReadinessStatus(): DeployReadinessStatus {
  const hasGitHubWorkflow = fileExists(".github/workflows/publish-scheduler.yml");
  const hasJsonStore = fileExists("data/runtime/weekly-content-plan.json");
  const hasPublicationLogs = fileExists("data/runtime/publication_logs.json");
  const hasMobileControl = fileExists("app/admin/mobile-control/page.tsx");
  const hasSchedulerDashboard = fileExists("app/admin/publish-scheduler/page.tsx");
  const databaseUrlConfigured = Boolean(process.env.DATABASE_URL);
  const hasSupabaseConfig = Boolean(process.env.DATABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_SERVICE_ROLE_KEY);
  const hasVercelConfig = Boolean(process.env.VERCEL || fileExists("vercel.json"));
  const hasSupabaseSchema = fileExists("supabase/schema.sql");
  const hasPostgresAdapter = fileExists("lib/storage/postgres-publish-store.ts");
  const storeMode = process.env.PUBLISH_DUE_STORE || (process.env.DATABASE_URL ? "postgres" : "json");
  const warnings: string[] = [];
  const nextSteps: string[] = [];

  if (!hasGitHubWorkflow) warnings.push("GitHub Actions workflow file is missing.");
  if (!hasJsonStore) warnings.push("JSON weekly content plan is missing.");
  if (!hasPublicationLogs) warnings.push("Publication logs file is missing; API should still return an empty list.");
  if (!hasSupabaseConfig) {
    warnings.push("Supabase/PostgreSQL is not connected yet.");
    nextSteps.push("Create Supabase/PostgreSQL project and add DATABASE_URL when ready.");
  }
  if (hasPostgresAdapter && storeMode === "json") {
    warnings.push("PostgreSQL adapter prepared, but JSON store is still active.");
  }
  if (!hasSupabaseSchema) {
    warnings.push("Supabase schema file is missing.");
    nextSteps.push("Create Supabase SQL schema before database migration.");
  }
  if (!hasVercelConfig) {
    warnings.push("Vercel hosting is not connected yet.");
    nextSteps.push("Deploy the admin panel to Vercel or another hosted runtime.");
  }
  if (storeMode === "json") {
    warnings.push("JSON store is active; local changes require git commit/push before GitHub Actions can see them.");
    nextSteps.push("Keep JSON mode as fallback, then add DB adapter for remote phone control.");
  }

  nextSteps.push("Add real admin authentication before public hosting.");
  nextSteps.push("Keep real Telegram publishing controlled through GitHub Secrets until remote DB control is ready.");

  return {
    ok: hasGitHubWorkflow && hasJsonStore && hasMobileControl && hasSchedulerDashboard,
    repositoryMode: fileExists(".git") ? "git" : "local",
    storeMode,
    hasGitHubWorkflow,
    hasJsonStore,
    hasPublicationLogs,
    hasMobileControl,
    hasSchedulerDashboard,
    hasSupabaseConfig,
    hasVercelConfig,
    hasSupabaseSchema,
    hasPostgresAdapter,
    databaseUrlConfigured,
    warnings,
    nextSteps: Array.from(new Set(nextSteps)),
  };
}

function fileExists(relativePath: string) {
  return existsSync(path.join(root, relativePath));
}
