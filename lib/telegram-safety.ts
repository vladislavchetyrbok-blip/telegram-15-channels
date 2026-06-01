import { channelGenerationConfigs } from "@/data/channelGeneration";
import type {
  PostDraftStatus,
  TelegramSafetyConfig,
  TelegramSafetyLog,
  TelegramSafetyLogAction,
  TelegramSendSafetyPayload,
  TelegramSendSafetyResult,
} from "@/types";

interface TelegramSafetyStore {
  lastSafetyCheckAt: string | null;
  logs: TelegramSafetyLog[];
}

const globalForTelegramSafety = globalThis as typeof globalThis & {
  __telegramSafetyStore?: TelegramSafetyStore;
};

const store =
  globalForTelegramSafety.__telegramSafetyStore ??
  (globalForTelegramSafety.__telegramSafetyStore = {
    lastSafetyCheckAt: null,
    logs: [],
  });

const productionConfirmationToken = "CONFIRM_TELEGRAM_PRODUCTION_SEND";
const singleChannelConfirmationPhrase = "Я подтверждаю тестовую отправку в один канал";

export function getTelegramSafetyConfig(): TelegramSafetyConfig {
  const telegram = getEnvTelegramConfig();
  const dryRun = telegram.dryRun;
  const realSendingEnabled = (process.env.TELEGRAM_REAL_SENDING_ENABLED ?? "false") === "true";
  const emergencyStop = false;
  const allowedChannelIds = channelGenerationConfigs.map((channel) => channel.id);

  return {
    dryRun,
    realSendingEnabled,
    requireManualConfirm: true,
    allowedChannelIds,
    blockedChannelIds: [],
    maxMessagesPerRun: 1,
    maxMessagesPerChannelPerDay: 3,
    requireApprovedDraftOnly: true,
    requireScheduledOnly: true,
    requireTelegramChatId: true,
    requireBotToken: true,
    emergencyStop,
    lastSafetyCheckAt: store.lastSafetyCheckAt,
    mode: dryRun ? "dry-run" : realSendingEnabled ? "production_ready" : "production_locked",
  };
}

export function validateTelegramSendSafety(payload: TelegramSendSafetyPayload = {}): TelegramSendSafetyResult {
  const config = getTelegramSafetyConfig();
  const telegram = getEnvTelegramConfig();
  const channel = resolveChannel(payload);
  const draftStatus = payload.draftStatus;
  const messagesInRun = payload.messagesInRun ?? 1;
  const messagesForChannelToday = payload.messagesForChannelToday ?? 0;
  const manualSingleChannelTest = payload.manualSingleChannelTest === true;
  const checks: TelegramSendSafetyResult["checks"] = [];

  addCheck(checks, "dryRun", !config.dryRun, "Blocked by dry-run mode");
  addCheck(checks, "realSendingEnabled", config.realSendingEnabled, "Real Telegram sending is disabled");
  addCheck(checks, "emergencyStop", !config.emergencyStop, "Emergency stop is active");
  addCheck(checks, "botToken", !config.requireBotToken || telegram.tokenStatus === "configured", "TELEGRAM_BOT_TOKEN is missing");
  addCheck(checks, "telegramChatId", !config.requireTelegramChatId || Boolean(channel?.telegramChatId || payload.telegramChatId), "telegramChatId is missing");
  addCheck(
    checks,
    "approvedDraftOnly",
    manualSingleChannelTest || !config.requireApprovedDraftOnly || isApprovedForSending(draftStatus),
    "Draft must be approved or scheduled",
  );
  addCheck(
    checks,
    "scheduledOnly",
    manualSingleChannelTest || !config.requireScheduledOnly || draftStatus === "scheduled",
    "Draft must be scheduled before real sending",
  );
  addCheck(checks, "maxMessagesPerRun", messagesInRun <= config.maxMessagesPerRun, "Max messages per run exceeded");
  addCheck(
    checks,
    "maxMessagesPerChannelPerDay",
    messagesForChannelToday < config.maxMessagesPerChannelPerDay,
    "Max messages per channel per day exceeded",
  );
  addCheck(checks, "allowedChannelIds", !channel || config.allowedChannelIds.includes(channel.id), "Channel is not in allowedChannelIds");
  addCheck(checks, "blockedChannelIds", !channel || !config.blockedChannelIds.includes(channel.id), "Channel is blocked");
  addCheck(
    checks,
    "manualConfirmation",
    config.dryRun ||
      !config.requireManualConfirm ||
      payload.manualConfirmationToken === productionConfirmationToken ||
      (manualSingleChannelTest && payload.manualConfirmationToken === singleChannelConfirmationPhrase),
    "Manual confirmation token is required for production",
  );

  const reasons = checks.filter((check) => !check.ok).map((check) => check.message);
  const canSendReal = reasons.length === 0;
  const primaryReason = config.dryRun ? "Blocked by dry-run mode" : reasons[0] ?? "Safety check passed";

  store.lastSafetyCheckAt = new Date().toISOString();
  addTelegramSafetyLog({
    action: config.dryRun ? "sendAttemptBlockedByDryRun" : canSendReal ? "telegramSafetyChecked" : "telegramRealSendBlocked",
    channelId: channel?.id ?? payload.channelId,
    draftId: payload.draftId,
    reason: primaryReason,
  });

  return {
    ok: canSendReal,
    canSendReal,
    mode: config.mode,
    dryRun: config.dryRun,
    realSendingEnabled: config.realSendingEnabled,
    telegramSent: false,
    reason: primaryReason,
    reasons: config.dryRun ? ["Blocked by dry-run mode", ...reasons.filter((reason) => reason !== "Blocked by dry-run mode")] : reasons,
    checks,
    config: {
      ...config,
      lastSafetyCheckAt: store.lastSafetyCheckAt,
    },
  };
}

export function mockEmergencyStop() {
  addTelegramSafetyLog({
    action: "emergencyStopMocked",
    reason: "Emergency stop button pressed in dry-run UI. No production state changed.",
  });

  return {
    ok: true,
    mode: "dry-run" as const,
    telegramSent: false as const,
    message: "Emergency stop mocked. Real Telegram sending is still disabled.",
    config: getTelegramSafetyConfig(),
  };
}

export function listTelegramSafetyLogs() {
  return [...store.logs].sort((left, right) => right.timestamp.localeCompare(left.timestamp));
}

function resolveChannel(payload: TelegramSendSafetyPayload) {
  return channelGenerationConfigs.find((channel) =>
    payload.channelId ? channel.id === payload.channelId : channel.telegramChatId === payload.telegramChatId,
  );
}

function getEnvTelegramConfig() {
  return {
    tokenStatus: process.env.TELEGRAM_BOT_TOKEN ? "configured" : "not stored",
    dryRun: (process.env.TELEGRAM_DRY_RUN ?? "true") === "true",
  };
}

function isApprovedForSending(status?: PostDraftStatus) {
  return status === "approved" || status === "scheduled";
}

function addCheck(
  checks: TelegramSendSafetyResult["checks"],
  key: string,
  ok: boolean,
  message: string,
) {
  checks.push({
    key,
    ok,
    message: ok ? "ok" : message,
  });
}

function addTelegramSafetyLog({
  action,
  channelId,
  draftId,
  reason,
}: {
  action: TelegramSafetyLogAction;
  channelId?: string;
  draftId?: string;
  reason: string;
}) {
  store.logs.unshift({
    action,
    channelId,
    draftId,
    reason,
    telegramSent: false,
    mode: "dry-run",
    timestamp: new Date().toISOString(),
  });
}
