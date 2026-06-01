import { channelGenerationConfigs } from "@/data/channelGeneration";
import { validateCurrencyPolicy } from "@/lib/currency-policy";
import { getPostDraftById, listPostDrafts } from "@/lib/post-draft-store";
import { getTelegramRealTestState, listTelegramRealTestLogs } from "@/lib/telegram-real-test-state";
import { getTelegramSafetyConfig, validateTelegramSendSafety } from "@/lib/telegram-safety";
import type { SingleChannelTestConfig, SingleChannelTestLog, SingleChannelTestLogAction } from "@/types";

interface SingleChannelTestStore {
  selectedChannelId: string;
  lastTestAt: string | null;
  lastRealTestSentAt: string | null;
  realTestLockedAfterSuccess: boolean;
  logs: SingleChannelTestLog[];
}

interface PrepareSingleChannelTestInput {
  channelId?: string;
  draftId?: string;
  text?: string;
}

interface ConfirmSingleChannelTestInput {
  channelId?: string;
  confirmationPhrase?: string;
}

interface SendSingleChannelRealTestInput {
  channelId?: string | string[];
  text?: string;
  confirmationPhrase?: string;
}

const selectedTestChannelId = "ai-tech";
const realTestConfirmationPhrase = "Я подтверждаю тестовую отправку в один канал";
const defaultRealTestText =
  "Тестова публікація. Система Telegram-каналів підключена. Це перша контрольна відправка в один канал.";

const confirmationPhrase = "Я подтверждаю тестовую отправку в один канал";

const globalForSingleTest = globalThis as typeof globalThis & {
  __telegramSingleChannelTestStore?: SingleChannelTestStore;
};

const store =
  globalForSingleTest.__telegramSingleChannelTestStore ??
  (globalForSingleTest.__telegramSingleChannelTestStore = {
    selectedChannelId: selectedTestChannelId,
    lastTestAt: null,
    lastRealTestSentAt: getTelegramRealTestState().lastRealTestSentAt,
    realTestLockedAfterSuccess: getTelegramRealTestState().repeatLock,
    logs: [],
  });

export function getSingleChannelTestConfig(channelId?: string): SingleChannelTestConfig {
  const selectedChannel =
    channelGenerationConfigs.find((channel) => channel.id === (channelId || store.selectedChannelId)) ??
    channelGenerationConfigs[0];
  const safety = getTelegramSafetyConfig();
  const realTestState = getTelegramRealTestState();
  const ready = !safety.dryRun && safety.realSendingEnabled && !realTestState.repeatLock;

  return {
    enabled: ready,
    dryRun: safety.dryRun,
    selectedChannelId: selectedChannel?.id ?? "",
    selectedTelegramChatId: selectedChannel?.telegramChatId ?? "",
    selectedChannelTitle: selectedChannel?.name ?? "",
    maxMessagesPerTest: 1,
    requireManualConfirm: true,
    confirmationPhrase: realTestConfirmationPhrase,
    testMode: ready ? "ready" : "locked",
    lastTestAt: store.lastTestAt,
    lastRealTestSentAt: realTestState.lastRealTestSentAt,
    defaultRealTestText,
    realTestLockedAfterSuccess: realTestState.repeatLock,
    telegramSent: false,
  };
}

export function getSingleChannelTestStatus(channelId?: string) {
  const config = getSingleChannelTestConfig(channelId);
  const safety = getTelegramSafetyConfig();
  const realTestState = getTelegramRealTestState();

  addSingleTestLog({
    action: "singleTestStatusViewed",
    channelId: config.selectedChannelId,
    reason: "Single-channel test status viewed.",
  });

  return {
    ok: true,
    mode: "dry-run" as const,
    dryRun: config.dryRun,
    enabled: config.enabled,
    testMode: config.testMode,
    selectedChannel: {
      id: config.selectedChannelId,
      title: config.selectedChannelTitle,
      telegramChatId: config.selectedTelegramChatId,
    },
    selectedChannelId: config.selectedChannelId,
    selectedTelegramChatId: config.selectedTelegramChatId,
    selectedChannelTitle: config.selectedChannelTitle,
    maxMessagesPerTest: config.maxMessagesPerTest,
    requireManualConfirm: config.requireManualConfirm,
    confirmationPhrase: config.confirmationPhrase,
    realSendingAllowed: !config.dryRun && safety.realSendingEnabled && !realTestState.repeatLock,
    realSendingEnabled: safety.realSendingEnabled,
    telegramSent: false as const,
    realSendsTotal: realTestState.realSendsTotal,
    lastTestAt: config.lastTestAt,
    lastRealTestSentAt: realTestState.lastRealTestSentAt,
    defaultRealTestText,
    realTestLockedAfterSuccess: realTestState.repeatLock,
    eligibleDrafts: listSingleTestDrafts(config.selectedChannelId),
    logs: listSingleChannelTestLogs(),
  };
}

export function prepareSingleChannelTest(input: PrepareSingleChannelTestInput) {
  const channel = channelGenerationConfigs.find((item) => item.id === input.channelId);

  if (!channel) {
    addSingleTestLog({
      action: "singleTestConfirmationRejected",
      channelId: input.channelId,
      reason: "Channel was not found.",
    });

    return blockedResult("Channel was not found.");
  }

  store.selectedChannelId = channel.id;

  const draft = input.draftId ? getPostDraftById(input.draftId) : undefined;
  const text = draft?.content || input.text?.trim() || "";

  if (!channel.telegramChatId) {
    addSingleTestLog({
      action: "singleTestConfirmationRejected",
      channelId: channel.id,
      draftId: input.draftId,
      reason: "telegramChatId is missing.",
    });

    return blockedResult("telegramChatId is missing.");
  }

  if (!text) {
    addSingleTestLog({
      action: "singleTestConfirmationRejected",
      channelId: channel.id,
      draftId: input.draftId,
      reason: "Text is required.",
    });

    return blockedResult("Text is required.");
  }

  const currencyValidation = validateCurrencyPolicy(text);

  if (!currencyValidation.ok) {
    addSingleTestLog({
      action: "singleTestConfirmationRejected",
      channelId: channel.id,
      draftId: draft?.id,
      reason: "Forbidden currency detected",
    });

    return {
      ...blockedResult("Forbidden currency detected"),
      channelId: channel.id,
      channelTitle: channel.name,
      telegramChatId: channel.telegramChatId,
      draftId: draft?.id ?? null,
      textPreview: createPreview(text),
      currency: currencyValidation,
    };
  }

  const safety = validateTelegramSendSafety({
    channelId: channel.id,
    telegramChatId: channel.telegramChatId,
    draftId: draft?.id,
    draftStatus: draft?.status,
    messagesInRun: 1,
    manualConfirmationToken: realTestConfirmationPhrase,
    manualSingleChannelTest: true,
  });
  const reason = safety.dryRun
    ? "Single-channel real test is blocked while TELEGRAM_DRY_RUN=true"
    : safety.reasons[0] ?? "Waiting for manual confirmation.";

  store.lastTestAt = new Date().toISOString();
  addSingleTestLog({
    action: "singleTestPrepared",
    channelId: channel.id,
    draftId: draft?.id,
    reason: "Single-channel test prepared.",
  });

  if (safety.dryRun) {
    addSingleTestLog({
      action: "singleTestBlockedByDryRun",
      channelId: channel.id,
      draftId: draft?.id,
      reason,
    });
  }

  return {
    ok: false,
    mode: "dry-run" as const,
    status: safety.dryRun ? "blocked_by_dry_run" : safety.canSendReal ? "waiting_confirmation" : "locked",
    dryRun: safety.dryRun,
    enabled: !safety.dryRun && safety.realSendingEnabled,
    canSendReal: false,
    realSendingAllowed: !safety.dryRun && safety.realSendingEnabled,
    telegramSent: false as const,
    channelId: channel.id,
    channelTitle: channel.name,
    telegramChatId: channel.telegramChatId,
    draftId: draft?.id ?? null,
    textPreview: createPreview(text),
    reason,
    safety,
  };
}

export function confirmSingleChannelTest(input: ConfirmSingleChannelTestInput) {
  const config = getSingleChannelTestConfig(input.channelId);
  addSingleTestLog({
    action: "singleTestConfirmationRejected",
    channelId: config.selectedChannelId,
    reason: "Single-channel real test is blocked while TELEGRAM_DRY_RUN=true",
  });

  return {
    ok: false,
    mode: "dry-run" as const,
    telegramSent: false as const,
    canSendReal: false,
    reason: "Single-channel real test is blocked while TELEGRAM_DRY_RUN=true",
  };
}

export async function sendSingleChannelRealTest(input: SendSingleChannelRealTestInput) {
  if (Array.isArray(input.channelId)) {
    return blockedRealSend("Only one channel is allowed.", undefined, input.text);
  }

  const channelId = input.channelId || selectedTestChannelId;
  const channel = channelGenerationConfigs.find((item) => item.id === channelId);
  const realTestState = getTelegramRealTestState();
  const text = input.text?.trim() || "";

  if (!channel) {
    return blockedRealSend("Channel was not found.", channelId, text);
  }

  store.selectedChannelId = channel.id;

  if (channel.id !== selectedTestChannelId) {
    return blockedRealSend("Single-channel real test is currently allowed only for AI и технологии.", channel.id, text);
  }

  if (realTestState.repeatLock) {
    return blockedRealSend("Repeat real test is locked after a successful send. New manual confirmation flow is required.", channel.id, text);
  }

  if (!text) {
    return blockedRealSend("Text is required.", channel.id, text);
  }

  if (!channel.telegramChatId) {
    return blockedRealSend("telegramChatId is missing.", channel.id, text);
  }

  const currencyValidation = validateCurrencyPolicy(text);

  if (!currencyValidation.ok) {
    return {
      ...blockedRealSend("Forbidden currency detected.", channel.id, text),
      currency: currencyValidation,
    };
  }

  if (input.confirmationPhrase !== realTestConfirmationPhrase) {
    return blockedRealSend("Manual confirmation phrase is invalid.", channel.id, text);
  }

  const safety = validateTelegramSendSafety({
    channelId: channel.id,
    telegramChatId: channel.telegramChatId,
    messagesInRun: 1,
    manualConfirmationToken: input.confirmationPhrase,
    manualSingleChannelTest: true,
  });

  if (safety.dryRun) {
    return blockedRealSend("Real sending is blocked while TELEGRAM_DRY_RUN=true.", channel.id, text, safety);
  }

  if (!safety.realSendingEnabled) {
    return blockedRealSend("Real sending is blocked while realSendingEnabled=false.", channel.id, text, safety);
  }

  if (!safety.canSendReal) {
    return blockedRealSend(safety.reasons[0] ?? "Telegram safety check failed.", channel.id, text, safety);
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    return blockedRealSend("TELEGRAM_BOT_TOKEN is missing.", channel.id, text, safety);
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: channel.telegramChatId,
      text,
      disable_web_page_preview: true,
    }),
  });
  const payload = (await response.json().catch(() => ({}))) as { ok?: boolean; description?: string };

  if (!response.ok || !payload.ok) {
    return blockedRealSend(payload.description || "Telegram API returned an error.", channel.id, text, safety);
  }

  const timestamp = new Date().toISOString();
  store.lastRealTestSentAt = timestamp;
  store.lastTestAt = timestamp;
  store.realTestLockedAfterSuccess = true;
  addSingleTestLog({
    action: "singleRealTestSent",
    channelId: channel.id,
    reason: "Single-channel real test sent.",
    channelTitle: channel.name,
    telegramChatId: channel.telegramChatId,
    telegramSent: true,
    messagesSent: 1,
    massBroadcast: false,
  });

  return {
    ok: true,
    mode: "production_ready" as const,
    telegramSent: true,
    messagesSent: 1,
    massBroadcast: false,
    channelId: channel.id,
    channelTitle: channel.name,
    telegramChatId: channel.telegramChatId,
    textPreview: createPreview(text),
    safety,
    message: "Single-channel real test sent successfully.",
  };
}

export function listSingleChannelTestLogs() {
  return [...store.logs, ...listTelegramRealTestLogs().map((log) => ({
    action: log.event,
    channelId: log.channelId,
    reason: "Single-channel real test sent.",
    channelTitle: log.channelTitle,
    telegramChatId: log.telegramChatId,
    telegramSent: log.telegramSent,
    messagesSent: log.messagesSent,
    massBroadcast: log.massBroadcast,
    mode: "dry-run" as const,
    timestamp: log.timestamp,
  }))].sort((left, right) => right.timestamp.localeCompare(left.timestamp));
}

function listSingleTestDrafts(channelId: string) {
  return listPostDrafts({ channelId })
    .filter((draft) => draft.status === "approved" || draft.status === "scheduled")
    .map((draft) => ({
      id: draft.id,
      title: draft.title,
      channelId: draft.channelId,
      channelTitle: draft.channelTitle,
      status: draft.status,
      scheduledFor: draft.scheduledFor,
      contentPreview: createPreview(draft.content),
    }));
}

function blockedResult(reason: string) {
  return {
    ok: false,
    mode: "dry-run" as const,
    status: "blocked_by_dry_run",
    dryRun: true,
    enabled: false,
    canSendReal: false,
    realSendingAllowed: false,
    telegramSent: false as const,
    reason,
  };
}

function blockedRealSend(reason: string, channelId?: string, text?: string, safety?: ReturnType<typeof validateTelegramSendSafety>) {
  const channel = channelGenerationConfigs.find((item) => item.id === channelId);
  addSingleTestLog({
    action: reason.includes("TELEGRAM_DRY_RUN") ? "singleTestBlockedByDryRun" : "singleTestConfirmationRejected",
    channelId,
    reason,
  });

  return {
    ok: false,
    mode: "dry-run" as const,
    telegramSent: false as const,
    canSendReal: false as const,
    messagesSent: 0,
    massBroadcast: false as const,
    channelId: channel?.id ?? channelId ?? null,
    channelTitle: channel?.name ?? "",
    telegramChatId: channel?.telegramChatId ?? "",
    textPreview: text ? createPreview(text) : "",
    reason,
    safety,
  };
}

function createPreview(text: string) {
  return text.length > 220 ? `${text.slice(0, 217)}...` : text;
}

function addSingleTestLog({
  action,
  channelId,
  draftId,
  reason,
  channelTitle,
  telegramChatId,
  telegramSent = false,
  messagesSent,
  massBroadcast,
}: {
  action: SingleChannelTestLogAction;
  channelId?: string;
  draftId?: string;
  reason: string;
  channelTitle?: string;
  telegramChatId?: string;
  telegramSent?: boolean;
  messagesSent?: number;
  massBroadcast?: false;
}) {
  store.logs.unshift({
    action,
    channelId,
    draftId,
    reason,
    channelTitle,
    telegramChatId,
    telegramSent,
    messagesSent,
    massBroadcast,
    mode: "dry-run",
    timestamp: new Date().toISOString(),
  });
}
