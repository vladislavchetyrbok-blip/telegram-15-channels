import { validateCurrencyPolicy } from "@/lib/currency-policy";
import { getPostDraftById, listPostDrafts } from "@/lib/post-draft-store";
import { getTelegramSafetyConfig, validateTelegramSendSafety } from "@/lib/telegram-safety";
import type {
  PostDraft,
  ProductionSendLog,
  ProductionSendLogAction,
  ProductionSendRequest,
  ProductionSendRequestStatus,
} from "@/types";

interface ProductionFlowStore {
  requests: ProductionSendRequest[];
  logs: ProductionSendLog[];
}

interface PrepareRealSendInput {
  draftId?: string;
}

interface ConfirmRealSendInput {
  requestId?: string;
  confirmationPhrase?: string;
}

const globalForProductionFlow = globalThis as typeof globalThis & {
  __telegramProductionFlowStore?: ProductionFlowStore;
};

const store =
  globalForProductionFlow.__telegramProductionFlowStore ??
  (globalForProductionFlow.__telegramProductionFlowStore = {
    requests: [],
    logs: [],
  });

export const productionConfirmationPhrase = "Я подтверждаю реальную отправку в Telegram";

export function getProductionStatus() {
  addProductionLog({
    action: "productionStatusViewed",
    reason: "Production status viewed. Real sending remains locked.",
  });

  const safetyConfig = getTelegramSafetyConfig();
  const eligibleDrafts = listProductionEligibleDrafts();

  return {
    ok: true,
    mode: "dry-run" as const,
    dryRun: safetyConfig.dryRun,
    realSendingEnabled: safetyConfig.realSendingEnabled,
    productionLocked: safetyConfig.dryRun || !safetyConfig.realSendingEnabled,
    canSendReal: false,
    telegramSent: false as const,
    confirmationPhrase: productionConfirmationPhrase,
    realTelegramSends: 0,
    eligibleDrafts,
    requests: listProductionSendRequests(),
    logs: listProductionSendLogs(),
    safetyConfig,
    reason: safetyConfig.dryRun
      ? "Real sending is blocked while TELEGRAM_DRY_RUN=true"
      : "Real sending is disabled by production lock.",
  };
}

export function prepareRealSend(input: PrepareRealSendInput) {
  const draft = input.draftId ? getPostDraftById(input.draftId) : undefined;

  if (!draft) {
    addProductionLog({
      action: "realSendConfirmationRejected",
      draftId: input.draftId,
      reason: "Draft was not found.",
    });

    return {
      ok: false,
      mode: "dry-run" as const,
      canSendReal: false,
      telegramSent: false as const,
      reason: "Draft was not found.",
      request: undefined,
    };
  }

  const safety = validateTelegramSendSafety({
    channelId: draft.channelId,
    telegramChatId: draft.telegramChatId,
    draftId: draft.id,
    draftStatus: draft.status,
    messagesInRun: 1,
  });
  const currencyValidation = validateCurrencyPolicy(draft.content);
  const currencyBlocked = !currencyValidation.ok;
  const status: ProductionSendRequestStatus = safety.dryRun
    ? "blocked_by_dry_run"
    : safety.canSendReal
      ? currencyBlocked
        ? "rejected"
        : "waiting_confirmation"
      : "rejected";
  const now = new Date().toISOString();
  const request: ProductionSendRequest = {
    id: createId("prod-send"),
    draftId: draft.id,
    channelId: draft.channelId,
    channelTitle: draft.channelTitle,
    telegramChatId: draft.telegramChatId,
    contentPreview: createPreview(draft.content),
    requestedAt: now,
    requestedBy: "local-user",
    confirmationPhrase: productionConfirmationPhrase,
    status,
    dryRun: true,
    telegramSent: false,
    safetyChecks: safety.checks,
    createdAt: now,
    updatedAt: now,
  };

  store.requests.unshift(request);
  addProductionLog({
    action: "realSendPrepared",
    requestId: request.id,
    draftId: draft.id,
    channelId: draft.channelId,
    reason: "Production send request prepared.",
  });

  if (safety.dryRun) {
    addProductionLog({
      action: "realSendBlockedByDryRun",
      requestId: request.id,
      draftId: draft.id,
      channelId: draft.channelId,
      reason: "Production sending is locked by TELEGRAM_DRY_RUN=true",
    });
  }

  if (currencyBlocked) {
    addProductionLog({
      action: "realSendConfirmationRejected",
      requestId: request.id,
      draftId: draft.id,
      channelId: draft.channelId,
      reason: "Forbidden currency detected",
    });
  }

  return {
    ok: !safety.dryRun && safety.canSendReal && !currencyBlocked,
    mode: "dry-run" as const,
    canSendReal: false,
    telegramSent: false as const,
    reason: currencyBlocked
      ? "Forbidden currency detected"
      : safety.dryRun
        ? "Production sending is locked by TELEGRAM_DRY_RUN=true"
        : safety.reasons[0] ?? "Waiting for manual confirmation.",
    request,
    safety,
    currency: currencyValidation,
  };
}

export function confirmRealSend(input: ConfirmRealSendInput) {
  const safetyConfig = getTelegramSafetyConfig();
  const request = input.requestId ? findProductionRequest(input.requestId) : undefined;

  if (safetyConfig.dryRun) {
    addProductionLog({
      action: "realSendBlockedByDryRun",
      requestId: input.requestId,
      draftId: request?.draftId,
      channelId: request?.channelId,
      reason: "Real sending is blocked while TELEGRAM_DRY_RUN=true",
    });

    return {
      ok: false,
      mode: "dry-run" as const,
      canSendReal: false,
      telegramSent: false as const,
      reason: "Real sending is blocked while TELEGRAM_DRY_RUN=true",
      request,
    };
  }

  if (!request) {
    addProductionLog({
      action: "realSendConfirmationRejected",
      requestId: input.requestId,
      reason: "Production send request was not found.",
    });

    return {
      ok: false,
      mode: "dry-run" as const,
      canSendReal: false,
      telegramSent: false as const,
      reason: "Production send request was not found.",
    };
  }

  if (input.confirmationPhrase !== productionConfirmationPhrase) {
    request.status = "rejected";
    request.updatedAt = new Date().toISOString();
    addProductionLog({
      action: "realSendConfirmationRejected",
      requestId: request.id,
      draftId: request.draftId,
      channelId: request.channelId,
      reason: "Manual confirmation phrase is invalid.",
    });

    return {
      ok: false,
      mode: "dry-run" as const,
      canSendReal: false,
      telegramSent: false as const,
      reason: "Manual confirmation phrase is invalid.",
      request,
    };
  }

  request.status = "sent_mock";
  request.updatedAt = new Date().toISOString();

  return {
    ok: false,
    mode: "dry-run" as const,
    canSendReal: false,
    telegramSent: false as const,
    reason: "Real Telegram send is still disabled in this build.",
    request,
  };
}

export function validateProductionRequestForSend(requestId?: string) {
  const request = requestId ? findProductionRequest(requestId) : undefined;

  if (!request) {
    return {
      ok: false,
      reason: "Production send request is required before real Telegram sending.",
      request,
    };
  }

  if (request.status !== "approved_for_real_send") {
    return {
      ok: false,
      reason: "Production send request is not approved for real send.",
      request,
    };
  }

  return {
    ok: true,
    reason: "Production request is approved.",
    request,
  };
}

export function listProductionSendRequests() {
  return [...store.requests].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export function listProductionSendLogs() {
  return [...store.logs].sort((left, right) => right.timestamp.localeCompare(left.timestamp));
}

function listProductionEligibleDrafts() {
  return listPostDrafts()
    .filter((draft) => draft.status === "approved" || draft.status === "scheduled")
    .map((draft) => ({
      id: draft.id,
      channelId: draft.channelId,
      channelTitle: draft.channelTitle,
      telegramChatId: draft.telegramChatId,
      title: draft.title,
      status: draft.status,
      scheduledFor: draft.scheduledFor,
      contentPreview: createPreview(draft.content),
    }));
}

function findProductionRequest(id: string) {
  return store.requests.find((request) => request.id === id);
}

function createPreview(content: PostDraft["content"]) {
  return content.length > 220 ? `${content.slice(0, 217)}...` : content;
}

function addProductionLog({
  action,
  requestId,
  draftId,
  channelId,
  reason,
}: {
  action: ProductionSendLogAction;
  requestId?: string;
  draftId?: string;
  channelId?: string;
  reason: string;
}) {
  store.logs.unshift({
    action,
    requestId,
    draftId,
    channelId,
    reason,
    telegramSent: false,
    mode: "dry-run",
    timestamp: new Date().toISOString(),
  });
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
