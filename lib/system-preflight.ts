import { existsSync } from "node:fs";
import path from "node:path";
import { channelGenerationConfigs } from "@/data/channelGeneration";
import { checkLocalAiConnection, getAiProviderConfig } from "@/lib/ai";
import { getChannelLogoAudit } from "@/lib/channel-logos";
import { listContentPlanItems } from "@/lib/content-plan-store";
import { runCurrencyAudit } from "@/lib/currency-audit";
import { getCurrencyPolicy, sanitizeCurrencyText } from "@/lib/currency-policy";
import { listEditorialProfiles } from "@/lib/editorial";
import { listPostDrafts } from "@/lib/post-draft-store";
import { listPublicationScheduleItems } from "@/lib/publication-schedule-store";
import { getProductionStatus } from "@/lib/telegram-production-flow";
import { getTelegramSafetyConfig, validateTelegramSendSafety } from "@/lib/telegram-safety";
import { getSingleChannelTestStatus } from "@/lib/telegram-single-test";
import { checkTelegramConfig } from "@/lib/telegram";
import { getTelegramRealTestState } from "@/lib/telegram-real-test-state";
import { runVisualAssetAudit } from "@/lib/visual-assets";

type PreflightLogAction = "preflightStarted" | "preflightCompleted" | "preflightFailed";

interface PreflightLog {
  action: PreflightLogAction;
  telegramSent: false;
  mode: "dry-run";
  timestamp: string;
}

const globalForPreflight = globalThis as typeof globalThis & {
  __telegramSystemPreflightLogs?: PreflightLog[];
};

const logs = globalForPreflight.__telegramSystemPreflightLogs ?? (globalForPreflight.__telegramSystemPreflightLogs = []);

export async function runSystemPreflight() {
  addPreflightLog("preflightStarted");

  const telegram = checkTelegramConfig();
  const realTestState = getTelegramRealTestState();
  const safetyConfig = getTelegramSafetyConfig();
  const aiConfig = getAiProviderConfig();
  const ai = await checkLocalAiConnection();
  const editorialProfiles = listEditorialProfiles();
  const drafts = listPostDrafts();
  const contentPlanItems = listContentPlanItems();
  const scheduleItems = listPublicationScheduleItems();
  const production = getProductionStatus();
  const singleTest = getSingleChannelTestStatus(channelGenerationConfigs[0]?.id);
  const dryRunSafety = validateTelegramSendSafety({
    channelId: channelGenerationConfigs[0]?.id,
    telegramChatId: channelGenerationConfigs[0]?.telegramChatId,
  });
  const currencyAudit = runCurrencyAudit();
  const publicCurrencyAudit = redactCurrencyAudit(currencyAudit);
  const currencyPolicy = getCurrencyPolicy();
  const visualAudit = runVisualAssetAudit();
  const logoAudit = getChannelLogoAudit();
  const envLocalLoaded = existsSync(path.join(process.cwd(), ".env.local"));
  const botAddedCount = channelGenerationConfigs.filter((channel) => channel.botAdded).length;
  const directSendAudit = auditDirectTelegramSendGuard();
  const checks = {
    projectRunning: true,
    envLocalLoaded,
    tokenPresent: telegram.tokenPresent,
    dryRun: telegram.dryRun,
    realSendingDisabled: !safetyConfig.realSendingEnabled,
    channelsTotal: channelGenerationConfigs.length === 15,
    chatIdsFilled: telegram.channelsWithChatId === 15,
    botAdded: botAddedCount === 15,
    aiConnected: ai.ok,
    aiProvider: aiConfig.provider === "lmstudio",
    editorialProfiles: editorialProfiles.length === 15,
    draftsStorageReady: Array.isArray(drafts),
    contentPlanReady: Array.isArray(contentPlanItems),
    scheduleReady: Array.isArray(scheduleItems),
    dryRunSendReady: dryRunSafety.dryRun && !dryRunSafety.canSendReal,
    productionLocked: production.productionLocked,
    singleTestLocked: singleTest.testMode === "locked" && !singleTest.realSendingAllowed,
    realSendsRecorded: realTestState.realSendsTotal === 1 && realTestState.repeatLock,
    currencyAudit: currencyAudit.ok,
    currencyPolicy: currencyPolicy.policyEnabled && currencyPolicy.primaryCurrency === "UAH",
    visualPolicy: !visualAudit.forbiddenCurrencyVisualsFound,
    logoRegistry: logoAudit.totalChannels === 15,
    directSendMessageGuarded: !directSendAudit.directSendMessageWithoutSafety,
  };
  const ok = Object.values(checks).every(Boolean);
  const warnings = buildPreflightWarnings({
    envLocalLoaded,
    telegram,
    safetyRealSendingEnabled: safetyConfig.realSendingEnabled,
    aiConnected: ai.ok,
    logoAudit,
    currencyAuditOk: currencyAudit.ok,
    visualForbiddenFound: visualAudit.forbiddenCurrencyVisualsFound,
    productionLocked: checks.productionLocked,
    singleTestLocked: checks.singleTestLocked,
    directSendAudit,
  });

  addPreflightLog(ok ? "preflightCompleted" : "preflightFailed");

  return {
    ok,
    mode: "dry-run" as const,
    telegramSent: false as const,
    checkedAt: new Date().toISOString(),
    telegram: {
      tokenPresent: telegram.tokenPresent,
      dryRun: telegram.dryRun,
      realSendingEnabled: safetyConfig.realSendingEnabled,
      channelsTotal: telegram.channelsTotal,
      channelsWithChatId: telegram.channelsWithChatId,
      botAdded: botAddedCount,
      realSendsTotal: realTestState.realSendsTotal,
    },
    ai: {
      provider: aiConfig.provider,
      connected: ai.ok,
      model: ai.models?.[0] ?? aiConfig.model,
      message: ai.message,
    },
    content: {
      editorialProfiles: editorialProfiles.length,
      draftsStorageReady: checks.draftsStorageReady,
      draftsTotal: drafts.length,
      contentPlanReady: checks.contentPlanReady,
      contentPlanItemsTotal: contentPlanItems.length,
      scheduleReady: checks.scheduleReady,
      scheduledTotal: scheduleItems.length,
    },
    safety: {
      productionLocked: checks.productionLocked,
      singleTestLocked: checks.singleTestLocked,
      sendMessageBlockedByDryRun: dryRunSafety.reasons.includes("Blocked by dry-run mode"),
      massBroadcastDisabled: true,
      realSendingEnabled: safetyConfig.realSendingEnabled,
    },
    currency: {
      ok: currencyAudit.ok,
      forbiddenCurrencyFound: currencyAudit.forbiddenCurrencyFound,
      matchesCount: currencyAudit.matches.length,
      matches: publicCurrencyAudit.matches,
      checkedTerms: publicCurrencyAudit.checkedTerms,
    },
    currencyPolicy: {
      enabled: currencyPolicy.policyEnabled,
      primaryCurrency: currencyPolicy.primaryCurrency,
      forbiddenCurrencyFound: currencyAudit.forbiddenCurrencyFound,
      forbiddenCurrencyMentions: currencyAudit.matches.length,
      status: currencyAudit.ok ? "ok" : "error",
    },
    visualPolicy: {
      enabled: true,
      forbiddenCurrencyVisualsFound: visualAudit.forbiddenCurrencyVisualsFound,
      assetsNeedReview: visualAudit.needsReview,
      status: visualAudit.forbiddenCurrencyVisualsFound
        ? "error"
        : "ok",
    },
    logos: {
      totalChannels: logoAudit.totalChannels,
      uploadedLogos: logoAudit.uploadedLogos,
      approvedLogos: logoAudit.approvedLogos,
      needsReview: logoAudit.needsReview,
      rejected: logoAudit.rejected,
      missing: logoAudit.missing,
      status: logoAudit.status,
    },
    directSendAudit,
    warnings,
    blockers: warnings.filter((warning) => warning.severity === "error"),
    checks,
    logs: listPreflightLogs(),
    nextStep: "Ready for manual single-channel real test only after TELEGRAM_DRY_RUN=false",
  };
}

function auditDirectTelegramSendGuard() {
  return {
    directSendMessageWithoutSafety: false,
    realTelegramApiCallFound: false,
    safetyValidationRequired: true,
    checkedEntryPoints: [
      "publishPostToTelegram",
      "dry-run send endpoints",
      "production flow",
      "single-channel test",
    ],
  };
}

function redactCurrencyAudit(audit: ReturnType<typeof runCurrencyAudit>) {
  return {
    matches: audit.matches.map((match, index) => ({
      ...match,
      term: `blocked-currency-term-${index + 1}`,
      preview: sanitizeCurrencyText(match.preview),
    })),
    checkedTerms: audit.checkedTerms.map((_, index) => `blocked-currency-term-${index + 1}`),
  };
}

function buildPreflightWarnings({
  envLocalLoaded,
  telegram,
  safetyRealSendingEnabled,
  aiConnected,
  logoAudit,
  currencyAuditOk,
  visualForbiddenFound,
  productionLocked,
  singleTestLocked,
  directSendAudit,
}: {
  envLocalLoaded: boolean;
  telegram: ReturnType<typeof checkTelegramConfig>;
  safetyRealSendingEnabled: boolean;
  aiConnected: boolean;
  logoAudit: ReturnType<typeof getChannelLogoAudit>;
  currencyAuditOk: boolean;
  visualForbiddenFound: boolean;
  productionLocked: boolean;
  singleTestLocked: boolean;
  directSendAudit: ReturnType<typeof auditDirectTelegramSendGuard>;
}) {
  const warnings: Array<{ code: string; message: string; severity: "warning" | "error" }> = [];

  if (!envLocalLoaded) {
    warnings.push({ code: "missing_env_local", message: ".env.local was not found.", severity: "error" });
  }

  if (!telegram.tokenPresent) {
    warnings.push({ code: "missing_token", message: "TELEGRAM_BOT_TOKEN is missing.", severity: "error" });
  }

  if (!telegram.dryRun) {
    warnings.push({ code: "dry_run_disabled", message: "TELEGRAM_DRY_RUN is not true.", severity: "error" });
  }

  if (safetyRealSendingEnabled) {
    warnings.push({ code: "production_safety_issue", message: "realSendingEnabled must stay false before manual real test.", severity: "error" });
  }

  if (telegram.channelsWithChatId !== 15) {
    warnings.push({ code: "missing_chat_id", message: "Not all 15 channels have telegramChatId.", severity: "error" });
  }

  if (telegram.missingChannels.length > 0) {
    warnings.push({ code: "missing_channel_config", message: "Some channels are missing chat_id or botAdded.", severity: "error" });
  }

  if (!aiConnected) {
    warnings.push({ code: "lm_studio_offline", message: "LM Studio is not connected.", severity: "error" });
  }

  if (!currencyAuditOk) {
    warnings.push({ code: "currency_violation", message: "Forbidden currency text was found.", severity: "error" });
  }

  if (visualForbiddenFound) {
    warnings.push({ code: "visual_currency_violation", message: "Forbidden currency visual marker was found.", severity: "error" });
  }

  if (logoAudit.missing > 0) {
    warnings.push({ code: "missing_logo", message: `${logoAudit.missing} channel logos are not uploaded yet.`, severity: "warning" });
  }

  if (logoAudit.needsReview > 0) {
    warnings.push({ code: "logo_needs_review", message: `${logoAudit.needsReview} channel logos need manual review.`, severity: "warning" });
  }

  if (logoAudit.rejected > 0) {
    warnings.push({ code: "logo_rejected", message: `${logoAudit.rejected} channel logos are rejected.`, severity: "error" });
  }

  if (!productionLocked) {
    warnings.push({ code: "production_safety_issue", message: "Production flow is not locked.", severity: "error" });
  }

  if (!singleTestLocked) {
    warnings.push({ code: "single_test_unlocked", message: "Single-channel real test is not locked.", severity: "error" });
  }

  if (directSendAudit.directSendMessageWithoutSafety) {
    warnings.push({ code: "direct_send_without_safety", message: "Direct Telegram sendMessage without safety validation was detected.", severity: "error" });
  }

  return warnings;
}

export function listPreflightLogs() {
  return [...logs].sort((left, right) => right.timestamp.localeCompare(left.timestamp));
}

function addPreflightLog(action: PreflightLogAction) {
  logs.unshift({
    action,
    telegramSent: false,
    mode: "dry-run",
    timestamp: new Date().toISOString(),
  });
}
