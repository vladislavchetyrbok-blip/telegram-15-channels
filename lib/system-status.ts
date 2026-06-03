import { getAdminAuthStatus } from "@/lib/admin-auth";
import { getPhoneDashboardStatus } from "@/lib/phone-dashboard";
import { getProductionSafetyStatus } from "@/lib/production-safety";
import { getVercelSetupStatus } from "@/lib/vercel-setup";

export interface SystemStatus {
  ok: boolean;
  checkedAt: string;
  app: {
    environment: string;
    isVercel: boolean;
    isProduction: boolean;
  };
  adminAuth: ReturnType<typeof getAdminAuthStatus>;
  productionSafety: ReturnType<typeof getProductionSafetyStatus>;
  githubActions: ReturnType<typeof getPhoneDashboardStatus>["githubActions"];
  jsonStore: {
    storeMode: string;
    warning: boolean;
  };
  postReserve: ReturnType<typeof getPhoneDashboardStatus>["reserve"];
  queue: ReturnType<typeof getPhoneDashboardStatus>["queue"];
  telegram: ReturnType<typeof getPhoneDashboardStatus>["telegram"];
  contentQuality: ReturnType<typeof getPhoneDashboardStatus>["contentQuality"];
  lastRun: ReturnType<typeof getPhoneDashboardStatus>["lastRun"];
  lastPublished: ReturnType<typeof getPhoneDashboardStatus>["lastPublished"];
  lastError: ReturnType<typeof getPhoneDashboardStatus>["lastError"];
  warnings: string[];
  nextSteps: string[];
}

export function getSystemStatus(): SystemStatus {
  const auth = getAdminAuthStatus();
  const safety = getProductionSafetyStatus();
  const phone = getPhoneDashboardStatus();
  const vercel = getVercelSetupStatus();
  const warnings = [
    ...safety.warnings,
    ...phone.warnings,
    ...vercel.warnings,
  ];

  return {
    ok: true,
    checkedAt: new Date().toISOString(),
    app: {
      environment: safety.environment,
      isVercel: safety.isVercel,
      isProduction: safety.isProduction,
    },
    adminAuth: auth,
    productionSafety: safety,
    githubActions: phone.githubActions,
    jsonStore: {
      storeMode: safety.storeMode,
      warning: safety.storeMode === "json",
    },
    postReserve: phone.reserve,
    queue: phone.queue,
    telegram: phone.telegram,
    contentQuality: phone.contentQuality,
    lastRun: phone.lastRun,
    lastPublished: phone.lastPublished,
    lastError: phone.lastError,
    warnings: Array.from(new Set(warnings)),
    nextSteps: Array.from(new Set([
      "Use GitHub Actions as the only real Telegram publisher.",
      "Keep Vercel admin monitoring/read-only while storeMode=json.",
      "Configure ADMIN_AUTH_ENABLED=true, ADMIN_PASSWORD and ADMIN_SESSION_SECRET before public access.",
      "Move posts and logs to Supabase/PostgreSQL before full phone write control.",
      ...vercel.nextSteps,
    ])),
  };
}
