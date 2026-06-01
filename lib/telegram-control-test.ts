import { channelGenerationConfigs } from "@/data/channelGeneration";
import { loadEditorialProfile } from "@/lib/editorial";
import { validateCurrencyPolicy } from "@/lib/currency-policy";
import { checkTelegramConfig, getTelegramConfig } from "@/lib/telegram";
import { validateTelegramSendSafety } from "@/lib/telegram-safety";
import type { TelegramControlTestLog, TelegramControlTestLogAction } from "@/types";

interface ControlTestInput {
  channelId?: string;
  text?: string;
}

const defaultChannelId = "ukraine-market";
const defaultText =
  "Тестова публікація. Перевірка системи. Реальна відправка зараз вимкнена.";

const globalForControlTest = globalThis as typeof globalThis & {
  __telegramControlTestLogs?: TelegramControlTestLog[];
};

const logs = globalForControlTest.__telegramControlTestLogs ?? (globalForControlTest.__telegramControlTestLogs = []);

export function getTelegramControlTestDefaults() {
  const channel =
    channelGenerationConfigs.find((item) => item.id === defaultChannelId) ?? channelGenerationConfigs[0];

  return {
    channelId: channel?.id ?? "",
    text: defaultText,
  };
}

export function getTelegramControlTestStatus() {
  const telegram = checkTelegramConfig();
  const safety = validateTelegramSendSafety({
    channelId: defaultChannelId,
    telegramChatId: channelGenerationConfigs.find((item) => item.id === defaultChannelId)?.telegramChatId,
  });
  const blockers = buildStatusBlockers({
    tokenPresent: telegram.tokenPresent,
    dryRun: telegram.dryRun,
    channelsReady: telegram.channelsTotal === 15 && telegram.channelsWithChatId === 15 && telegram.missingChannels.length === 0,
    realSendingEnabled: safety.realSendingEnabled,
  });

  addLog("controlTestViewed", defaultChannelId, "Control test status viewed.");

  return {
    ok: blockers.length === 0,
    mode: "dry-run" as const,
    telegramSent: false as const,
    readyForDryRunTest: blockers.length === 0,
    readyForRealSingleTest: false,
    dryRun: telegram.dryRun,
    realSendingEnabled: safety.realSendingEnabled,
    realSendsTotal: 0,
    blockers,
    warnings: ["Real Telegram sending remains locked by dry-run."],
    defaults: getTelegramControlTestDefaults(),
    logs: listTelegramControlTestLogs(),
  };
}

export function validateTelegramControlTest(input: ControlTestInput) {
  const result = runControlTestValidation(input);

  addLog(
    "controlTestValidated",
    result.channelId,
    result.ok ? "Control test validation passed." : result.reasons.join("; "),
  );

  if (result.safety.dryRun) {
    addLog("realSendBlockedByDryRun", result.channelId, "Real send blocked by dry-run mode.");
  }

  return result;
}

export function dryRunSendTelegramControlTest(input: ControlTestInput) {
  const validation = runControlTestValidation(input);

  if (!validation.ok) {
    addLog("controlTestValidated", validation.channelId, validation.reasons.join("; "));
    return {
      ...validation,
      ok: false,
      message: validation.reasons[0] ?? "Control test validation failed.",
    };
  }

  addLog("controlTestDryRunSent", validation.channelId, "Control test dry-run completed.");
  addLog("realSendBlockedByDryRun", validation.channelId, "Real send blocked by dry-run mode.");

  return {
    ok: true,
    mode: "dry-run" as const,
    telegramSent: false as const,
    channelId: validation.channelId,
    channelTitle: validation.channelTitle,
    telegramChatId: validation.telegramChatId,
    textPreview: createTextPreview(validation.text),
    message: "Dry-run successful. Реальная отправка не выполнялась.",
    validation,
  };
}

export function listTelegramControlTestLogs() {
  return [...logs].sort((left, right) => right.timestamp.localeCompare(left.timestamp));
}

function runControlTestValidation(input: ControlTestInput) {
  const channelId = input.channelId || defaultChannelId;
  const channel = channelGenerationConfigs.find((item) => item.id === channelId);
  const text = input.text?.trim() || "";
  const telegram = getTelegramConfig();
  const currency = validateCurrencyPolicy(text);
  const profile = channel ? loadEditorialProfile(channel.id) : undefined;
  const editorial = validateControlTextByEditorialRules(text, profile);
  const safety = validateTelegramSendSafety({
    channelId: channel?.id,
    telegramChatId: channel?.telegramChatId,
    messagesInRun: 1,
  });
  const reasons: string[] = [];

  if (!channel) {
    reasons.push("Channel was not found.");
  }

  if (channel && !channel.telegramChatId) {
    reasons.push("telegramChatId is missing.");
  }

  if (telegram.tokenStatus !== "configured") {
    reasons.push("TELEGRAM_BOT_TOKEN is missing.");
  }

  if (!telegram.dryRun) {
    reasons.push("TELEGRAM_DRY_RUN must stay true for this control test.");
  }

  if (!text) {
    reasons.push("Text is required.");
  }

  if (!currency.ok) {
    reasons.push("Forbidden currency detected.");
  }

  if (!editorial.ok) {
    reasons.push(...editorial.reasons);
  }

  if (!safety.dryRun || safety.canSendReal) {
    reasons.push("Safety gate did not block real sending.");
  }

  const ok = reasons.length === 0;

  return {
    ok,
    mode: "dry-run" as const,
    telegramSent: false as const,
    channelId: channel?.id ?? channelId,
    channelTitle: channel?.name ?? "",
    telegramChatId: channel?.telegramChatId ?? "",
    text,
    textPreview: createTextPreview(text),
    textValid: Boolean(text),
    currencyPolicyOk: currency.ok,
    editorialPolicyOk: editorial.ok,
    safetyOk: safety.dryRun && !safety.canSendReal,
    canSendReal: false as const,
    tokenPresent: telegram.tokenStatus === "configured",
    dryRun: telegram.dryRun,
    realSendingEnabled: safety.realSendingEnabled,
    realSendsTotal: 0,
    currency,
    editorial,
    safety,
    reasons,
  };
}

function validateControlTextByEditorialRules(
  text: string,
  profile: ReturnType<typeof loadEditorialProfile>,
) {
  const reasons: string[] = [];
  const lowerText = text.toLowerCase();

  if (!profile) {
    return {
      ok: false,
      reasons: ["Editorial profile was not found."],
    };
  }

  if (!text.trim()) {
    reasons.push("Text is required.");
  }

  if (text.length > profile.maxLength) {
    reasons.push(`Text is too long: ${text.length}/${profile.maxLength}.`);
  }

  for (const topic of profile.forbiddenTopics) {
    if (topic && lowerText.includes(topic.toLowerCase())) {
      reasons.push(`Forbidden editorial topic detected: ${topic}.`);
    }
  }

  for (const word of profile.forbiddenWords) {
    if (word && lowerText.includes(word.toLowerCase())) {
      reasons.push("Forbidden editorial word detected.");
    }
  }

  if (!hasControlTestUsefulness(text)) {
    reasons.push("Text should include a clear check or practical purpose.");
  }

  return {
    ok: reasons.length === 0,
    reasons,
    profile: {
      channelId: profile.channelId,
      channelTitle: profile.channelTitle,
      language: profile.language,
      maxLength: profile.maxLength,
    },
  };
}

function hasControlTestUsefulness(text: string) {
  const lowerText = text.toLowerCase();

  return ["перевір", "провер", "check", "test", "тест"].some((signal) => lowerText.includes(signal));
}

function buildStatusBlockers({
  tokenPresent,
  dryRun,
  channelsReady,
  realSendingEnabled,
}: {
  tokenPresent: boolean;
  dryRun: boolean;
  channelsReady: boolean;
  realSendingEnabled: boolean;
}) {
  const blockers: string[] = [];

  if (!tokenPresent) {
    blockers.push("missing token");
  }

  if (!dryRun) {
    blockers.push("dry-run is not active");
  }

  if (!channelsReady) {
    blockers.push("channels are not ready");
  }

  if (realSendingEnabled) {
    blockers.push("real sending must be disabled");
  }

  return blockers;
}

function createTextPreview(text: string) {
  return text.length > 240 ? `${text.slice(0, 237)}...` : text;
}

function addLog(action: TelegramControlTestLogAction, channelId: string | undefined, reason: string) {
  logs.unshift({
    action,
    channelId,
    reason,
    telegramSent: false,
    mode: "dry-run",
    timestamp: new Date().toISOString(),
  });
}
