import { existsSync } from "node:fs";
import path from "node:path";
import { getAdminAuthStatus } from "@/lib/admin-auth";
import { getProductionSafetyStatus } from "@/lib/production-safety";

export interface VercelSetupStatus {
  ok: boolean;
  isVercel: boolean;
  isProduction: boolean;
  adminAuthEnabled: boolean;
  adminPasswordConfigured: boolean;
  adminSessionSecretConfigured: boolean;
  storeMode: string;
  jsonStoreWarning: boolean;
  githubActionsPublisherExpected: boolean;
  manualPublishBlockedInProduction: boolean;
  hasPhoneDashboard: boolean;
  hasPublishMonitor: boolean;
  hasPublishScheduler: boolean;
  appUrlConfigured: boolean;
  githubActionsUrlConfigured: boolean;
  warnings: string[];
  nextSteps: string[];
}

const root = process.cwd();

export function getVercelSetupStatus(): VercelSetupStatus {
  const auth = getAdminAuthStatus();
  const safety = getProductionSafetyStatus();
  const hasPhoneDashboard = existsSync(path.join(root, "app", "admin", "phone-dashboard", "page.tsx"));
  const hasPublishMonitor = existsSync(path.join(root, "app", "admin", "publish-monitor", "page.tsx"));
  const hasPublishScheduler = existsSync(path.join(root, "app", "admin", "publish-scheduler", "page.tsx"));
  const appUrlConfigured = Boolean(process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL);
  const githubActionsUrlConfigured = Boolean(process.env.NEXT_PUBLIC_GITHUB_ACTIONS_URL);
  const jsonStoreWarning = safety.storeMode === "json";
  const manualPublishBlockedInProduction = safety.isProduction && safety.storeMode === "json";
  const warnings: string[] = [...safety.warnings];
  const nextSteps: string[] = [];

  if (!auth.authEnabled) {
    warnings.push("ADMIN_AUTH_ENABLED is false. Enable it before exposing the admin panel on the internet.");
    nextSteps.push("Set ADMIN_AUTH_ENABLED=true in Vercel environment variables.");
  }

  if (!auth.adminPasswordConfigured) {
    warnings.push("ADMIN_PASSWORD is not configured.");
    nextSteps.push("Set a strong ADMIN_PASSWORD in Vercel environment variables.");
  }

  if (!auth.adminSessionSecretConfigured) {
    warnings.push("ADMIN_SESSION_SECRET is not configured.");
    nextSteps.push("Generate and set a long random ADMIN_SESSION_SECRET in Vercel environment variables.");
  }

  if (jsonStoreWarning) {
    warnings.push("JSON store is active. Vercel admin should stay monitoring/read-only until a remote database is connected.");
    nextSteps.push("Keep real Telegram publishing in GitHub Actions while storeMode=json.");
  }

  if (!appUrlConfigured) {
    nextSteps.push("Set NEXT_PUBLIC_APP_URL after Vercel creates the production URL.");
  }

  if (!githubActionsUrlConfigured) {
    nextSteps.push("Set NEXT_PUBLIC_GITHUB_ACTIONS_URL to show a direct Actions link in phone views.");
  }

  nextSteps.push("Deploy the admin panel, open /admin/login, then inspect /admin/phone-dashboard and /admin/publish-monitor.");
  nextSteps.push("Connect Supabase/PostgreSQL before enabling full phone write control.");

  return {
    ok: true,
    isVercel: safety.isVercel,
    isProduction: safety.isProduction,
    adminAuthEnabled: auth.authEnabled,
    adminPasswordConfigured: auth.adminPasswordConfigured,
    adminSessionSecretConfigured: auth.adminSessionSecretConfigured,
    storeMode: safety.storeMode,
    jsonStoreWarning,
    githubActionsPublisherExpected: true,
    manualPublishBlockedInProduction,
    hasPhoneDashboard,
    hasPublishMonitor,
    hasPublishScheduler,
    appUrlConfigured,
    githubActionsUrlConfigured,
    warnings: Array.from(new Set(warnings)),
    nextSteps: Array.from(new Set(nextSteps)),
  };
}
