export interface ProductionSafetyStatus {
  ok: boolean;
  environment: string;
  nodeEnv: string;
  isProduction: boolean;
  isVercel: boolean;
  storeMode: string;
  isJsonStoreProduction: boolean;
  safeManualPublishOnly: boolean;
  realTelegramPublishAllowed: false;
  warnings: string[];
}

export function isProductionRuntime() {
  return process.env.NODE_ENV === "production" || process.env.APP_ENV === "production";
}

export function isVercelRuntime() {
  return Boolean(process.env.VERCEL || process.env.VERCEL_ENV);
}

export function getPublishStoreMode() {
  return process.env.PUBLISH_DUE_STORE || (process.env.DATABASE_URL ? "postgres" : "json");
}

export function isJsonStoreProduction() {
  return isProductionRuntime() && getPublishStoreMode() === "json";
}

export function assertSafeManualDryRunOnly() {
  const status = getProductionSafetyStatus();

  if (status.isJsonStoreProduction) {
    return {
      ok: true,
      manualAction: true,
      dryRun: true,
      realTelegramPublishAllowed: false,
      message: "Production JSON mode: manual actions are restricted to dry-run only.",
      status,
    };
  }

  return {
    ok: true,
    manualAction: true,
    dryRun: true,
    realTelegramPublishAllowed: false,
    message: "Manual action is restricted to dry-run only.",
    status,
  };
}

export function getManualWriteBlock() {
  const status = getProductionSafetyStatus();

  if (status.isJsonStoreProduction) {
    return {
      blocked: true,
      statusCode: 403,
      response: {
        ok: false,
        manualAction: true,
        dryRun: false,
        realTelegramPublishAllowed: false,
        message: "Manual write/send actions are blocked in production JSON mode.",
        safety: status,
      },
    };
  }

  return {
    blocked: false,
    statusCode: 200,
    response: {
      ok: true,
      manualAction: true,
      dryRun: false,
      realTelegramPublishAllowed: false,
      message: "Manual write/send action allowed in this local runtime.",
      safety: status,
    },
  };
}

export function getProductionSafetyStatus(): ProductionSafetyStatus {
  const isProduction = isProductionRuntime();
  const isVercel = isVercelRuntime();
  const storeMode = getPublishStoreMode();
  const jsonStoreProduction = isProduction && storeMode === "json";
  const warnings: string[] = [];

  if (jsonStoreProduction) {
    warnings.push("JSON store is active in production. Do not use it for persistent admin writes on Vercel.");
  }

  if (isVercel && storeMode === "json") {
    warnings.push("Vercel runtime detected with JSON store. Use Supabase/PostgreSQL before full phone control.");
  }

  warnings.push("Manual admin publish actions must remain dry-run only. Real Telegram publishing stays in GitHub Actions.");

  return {
    ok: true,
    environment: process.env.APP_ENV || process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
    nodeEnv: process.env.NODE_ENV || "development",
    isProduction,
    isVercel,
    storeMode,
    isJsonStoreProduction: jsonStoreProduction,
    safeManualPublishOnly: true,
    realTelegramPublishAllowed: false,
    warnings,
  };
}
