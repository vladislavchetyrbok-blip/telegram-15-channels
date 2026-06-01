import { channelGenerationConfigs, type ChannelGenerationConfig } from "@/data/channelGeneration";
import { validateCurrencyPolicy } from "@/lib/currency-policy";
import { getTelegramRealTestState } from "@/lib/telegram-real-test-state";
import { validateProductionRequestForSend } from "@/lib/telegram-production-flow";
import { validateTelegramSendSafety } from "@/lib/telegram-safety";
import { listTelegramTargetBindings } from "@/lib/telegram-target-store";
import type { TelegramSendSafetyResult } from "@/types";

export interface TelegramConfig {
  botMode: string;
  tokenStatus: "not stored" | "configured";
  tokenMasked: string;
  dryRun: boolean;
  testChannelIdStatus: "missing" | "configured";
  realPublishEnabled: boolean;
}

export interface TelegramValidationResult {
  ok: boolean;
  mode: "mock";
  message: string;
  config: TelegramConfig;
}

export interface TelegramBotStatus {
  ok: boolean;
  mode: "mock";
  status: "not connected";
  botMode: string;
  tokenStatus: "not stored" | "configured";
  dryRun: boolean;
}

export interface TelegramConnectionResult {
  ok: boolean;
  mode: "mock";
  message: string;
  status: TelegramBotStatus;
}

export interface PublishPostToTelegramInput {
  chatId: string;
  text: string;
  parseMode?: "HTML" | "MarkdownV2";
  channelId?: string;
  draftId?: string;
  draftStatus?: "approved" | "scheduled";
  productionRequestId?: string;
  manualConfirmationToken?: string;
}

export interface PublishPostToTelegramResult {
  ok: boolean;
  mode: "mock";
  dryRun: boolean;
  telegramSent: false;
  message: string;
  safety: TelegramSendSafetyResult;
  requestPreview: {
    method: "POST";
    endpoint: "/sendMessage";
    chatId: string;
  };
}

export type TelegramChannelConnectionStatus = "connected_mock" | "missing_token" | "missing_chat_id";

export interface TelegramChannelConnectionCheck {
  channelId: string;
  channelName: string;
  telegramChatId: string;
  botAdded: boolean;
  dryRun: true;
  telegramSent: false;
  status: TelegramChannelConnectionStatus;
  tokenStatus: TelegramConfig["tokenStatus"];
  message: string;
}

export interface TelegramConfigCheckResult {
  ok: boolean;
  tokenPresent: boolean;
  dryRun: boolean;
  realSendingEnabled: boolean;
  realSendsTotal: number;
  repeatLock: boolean;
  lastRealTestSentAt: string | null;
  lastRealSendChannelTitle: string | null;
  channelsTotal: number;
  channelsWithChatId: number;
  missingChannels: Array<{
    channelId: string;
    channelName: string;
    reason: "missing_chat_id" | "bot_not_added";
  }>;
  mode: "dry-run" | "production_ready" | "production_locked";
}

type TelegramConfigMissingChannel = TelegramConfigCheckResult["missingChannels"][number];

export function getTelegramConfig(): TelegramConfig {
  return {
    botMode: process.env.TELEGRAM_BOT_MODE ?? "single_bot",
    tokenStatus: process.env.TELEGRAM_BOT_TOKEN ? "configured" : "not stored",
    tokenMasked: maskTelegramToken(process.env.TELEGRAM_BOT_TOKEN),
    dryRun: (process.env.TELEGRAM_DRY_RUN ?? "true") === "true",
    testChannelIdStatus: getTelegramTestChannelId() ? "configured" : "missing",
    realPublishEnabled: isTelegramRealPublishEnabled(),
  };
}

export function validateTelegramSettings(): TelegramValidationResult {
  const config = getTelegramConfig();

  return {
    ok: config.dryRun || config.tokenStatus === "configured",
    mode: "mock",
    message: config.dryRun
      ? "Telegram dry-run is enabled. Real publishing is disabled."
      : "Telegram settings are prepared for validation.",
    config,
  };
}

export function getTelegramBotStatus(): TelegramBotStatus {
  const config = getTelegramConfig();

  return {
    ok: false,
    mode: "mock",
    status: "not connected",
    botMode: config.botMode,
    tokenStatus: config.tokenStatus,
    dryRun: config.dryRun,
  };
}

export async function checkTelegramBotConnection(): Promise<TelegramConnectionResult> {
  return {
    ok: false,
    mode: "mock",
    message: "Telegram Bot connection check is not connected yet",
    status: getTelegramBotStatus(),
  };
}

export async function publishPostToTelegram(
  input: PublishPostToTelegramInput,
): Promise<PublishPostToTelegramResult> {
  const safety = validateTelegramSendSafety({
    channelId: input.channelId,
    telegramChatId: input.chatId,
    draftId: input.draftId,
    draftStatus: input.draftStatus,
    manualConfirmationToken: input.manualConfirmationToken,
  });
  const production = validateProductionRequestForSend(input.productionRequestId);
  const currencyValidation = validateCurrencyPolicy(input.text);

  if (!safety.canSendReal || !production.ok || !currencyValidation.ok) {
    return {
      ok: safety.dryRun,
      mode: "mock",
      dryRun: safety.dryRun,
      telegramSent: false,
      message: !currencyValidation.ok ? "Forbidden currency detected" : safety.canSendReal ? production.reason : safety.reason,
      safety,
      requestPreview: {
        method: "POST",
        endpoint: "/sendMessage",
        chatId: input.chatId,
      },
    };
  }

  return {
    ok: false,
    mode: "mock",
    dryRun: false,
    telegramSent: false,
    message: "Real Telegram sending is disabled in this build. No message was sent.",
    safety,
    requestPreview: {
      method: "POST",
      endpoint: "/sendMessage",
      chatId: input.chatId,
    },
  };
}

export function checkTelegramChannelConnection(
  channel: ChannelGenerationConfig,
): TelegramChannelConnectionCheck {
  const config = getTelegramConfig();

  if (!channel.telegramChatId) {
    return {
      channelId: channel.id,
      channelName: channel.name,
      telegramChatId: channel.telegramChatId,
      botAdded: channel.botAdded,
      dryRun: true,
      telegramSent: false,
      status: "missing_chat_id",
      tokenStatus: config.tokenStatus,
      message: "Telegram chat_id is missing. No request was sent.",
    };
  }

  if (config.tokenStatus === "not stored") {
    return {
      channelId: channel.id,
      channelName: channel.name,
      telegramChatId: channel.telegramChatId,
      botAdded: channel.botAdded,
      dryRun: true,
      telegramSent: false,
      status: "missing_token",
      tokenStatus: config.tokenStatus,
      message: "TELEGRAM_BOT_TOKEN is not configured. No request was sent.",
    };
  }

  return {
    channelId: channel.id,
    channelName: channel.name,
    telegramChatId: channel.telegramChatId,
    botAdded: channel.botAdded,
    dryRun: true,
    telegramSent: false,
    status: "connected_mock",
    tokenStatus: config.tokenStatus,
    message: "Channel is ready for mock validation. Real Telegram sending is still disabled.",
  };
}

export function checkTelegramChannelsConnection() {
  const checks = channelGenerationConfigs.map(checkTelegramChannelConnection);

  return {
    ok: checks.every((check) => check.status === "connected_mock"),
    mode: "mock" as const,
    dryRun: true,
    telegramSent: false,
    tokenStatus: getTelegramConfig().tokenStatus,
    total: checks.length,
    connectedMock: checks.filter((check) => check.status === "connected_mock").length,
    missingToken: checks.filter((check) => check.status === "missing_token").length,
    missingChatId: checks.filter((check) => check.status === "missing_chat_id").length,
    checks,
  };
}

export function checkTelegramConfig(): TelegramConfigCheckResult {
  const config = getTelegramConfig();
  const realTestState = getTelegramRealTestState();
  const targetBindings = listTelegramTargetBindings();
  const missingChannels = targetBindings.reduce<TelegramConfigMissingChannel[]>((items, channel) => {
    if (!channel.telegramTarget) {
      items.push({
        channelId: channel.channelId,
        channelName: channel.channelTitle,
        reason: "missing_chat_id",
      });

      return items;
    }

    return items;
  }, []);
  const channelsWithChatId = targetBindings.filter((channel) => channel.telegramTarget).length;
  const tokenPresent = config.tokenStatus === "configured";
  const realSendingEnabled = isTelegramRealSendingEnabled();

  return {
    ok: tokenPresent && channelsWithChatId === channelGenerationConfigs.length && missingChannels.length === 0,
    tokenPresent,
    dryRun: config.dryRun,
    realSendingEnabled,
    realSendsTotal: realTestState.realSendsTotal,
    repeatLock: realTestState.repeatLock,
    lastRealTestSentAt: realTestState.lastRealTestSentAt,
    lastRealSendChannelTitle: realTestState.channelTitle,
    channelsTotal: channelGenerationConfigs.length,
    channelsWithChatId,
    missingChannels,
    mode: config.dryRun ? "dry-run" : realSendingEnabled ? "production_ready" : "production_locked",
  };
}

export function getTelegramTestChannelId() {
  return "";
}

export function getTelegramTestChatId() {
  return getTelegramTestChannelId();
}

export function maskTelegramToken(token = process.env.TELEGRAM_BOT_TOKEN) {
  if (!token) {
    return "missing";
  }

  const suffix = token.slice(-4);

  return `configured ****${suffix}`;
}

export function isTelegramRealSendingEnabled() {
  return (process.env.TELEGRAM_REAL_SENDING_ENABLED ?? "false") === "true" || isTelegramRealPublishEnabled();
}

export function isTelegramRealPublishEnabled() {
  return (process.env.TELEGRAM_REAL_PUBLISH_ENABLED ?? "false") === "true";
}
