import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import {
  channelGenerationConfigs,
  getChannelGenerationConfig,
  type ChannelGenerationConfig,
} from "@/data/channelGeneration";
import { generateTextWithAI, getAiProviderConfig } from "@/lib/ai";
import { validateCurrencyPolicy } from "@/lib/currency-policy";
import { buildEditorialPrompt, loadEditorialProfile, validateGeneratedPost } from "@/lib/editorial";
import {
  ensureDraftMedia,
  getDefaultPostImageCaption,
  getPostImagePath,
  missingPostImageMessage,
  validatePostHasImage,
} from "@/lib/post-media";
import { validateTelegramSendSafety } from "@/lib/telegram-safety";
import { checkTelegramConfig, validateTelegramSettings } from "@/lib/telegram";
import { getTextQualityStatus, validateGeneratedTextQuality } from "@/lib/text-quality";
import type {
  DryRunPostAction,
  DryRunPostLog,
  DraftReviewHistory,
  EditorialValidationResult,
  PostDraft,
  PostDraftLanguage,
  PostDraftStatus,
  PostDraftValidationStatus,
} from "@/types";

interface ListDraftsFilters {
  channelId?: string;
  status?: PostDraftStatus;
}

interface DraftMutationResult {
  ok: boolean;
  draft?: PostDraft;
  validation?: EditorialValidationResult;
  error?: string;
}

interface CreateDraftFromGeneratedTextInput {
  channel: ChannelGenerationConfig;
  content: string;
  topic?: string;
  modelName: string;
  status?: PostDraftStatus;
}

export interface FirstBatchDraftResult {
  channelId: string;
  channelTitle: string;
  ok: boolean;
  draft?: PostDraft;
  validationStatus: PostDraftValidationStatus;
  validationNotes: string[];
  error?: string;
}

export interface FirstBatchGenerationResult {
  ok: boolean;
  mode: "dry-run";
  telegramSent: false;
  realSendsTotal: number;
  repeatLock: boolean;
  createdDrafts: PostDraft[];
  results: FirstBatchDraftResult[];
  error?: string;
}

interface PostDraftMemoryStore {
  drafts: PostDraft[];
  dryRunLogs: DryRunPostLog[];
  reviewHistory: DraftReviewHistory[];
}

const draftStoragePath = join(process.cwd(), "data", "runtime", "post-drafts.json");
const reviewHistoryStoragePath = join(process.cwd(), "data", "runtime", "draft-review-history.json");

const globalForPostDrafts = globalThis as typeof globalThis & {
  __telegramPostDraftStore?: PostDraftMemoryStore;
};

const memoryStore =
  globalForPostDrafts.__telegramPostDraftStore ??
  (globalForPostDrafts.__telegramPostDraftStore = {
    drafts: readPersistedDrafts(),
    dryRunLogs: [],
    reviewHistory: readPersistedReviewHistory(),
  });

const drafts = memoryStore.drafts;
const dryRunLogs = memoryStore.dryRunLogs;
const reviewHistory = memoryStore.reviewHistory;

const firstBatchTopics: Record<string, string> = {
  "money-opportunities": "Практичная возможность заработка, гранта или удалённой работы без обещаний лёгких денег.",
  "ai-tech": "Полезный AI-инструмент или сценарий автоматизации для повседневной работы.",
  "ukraine-market": "Корисна можливість, вакансії, програми або ринок праці українською.",
  "mens-style": "Практичная вещь или элемент стиля без пафоса.",
  "home-tech": "Бытовая техника, умный дом или полезное решение для дома.",
  "fishing-rest": "Снасти, сезонный совет или спокойный отдых у воды.",
  "dnipro-city": "Локальная подборка, сервис, место или полезная городская заметка.",
  "auto-comfort": "Комфорт в дороге, аксессуар или уход за авто.",
  "business-ideas": "Коротка ідея мікробізнесу українською.",
  "personal-progress": "Привычка, фокус и спокойный рост без мотивационного давления.",
  "dnipro-real-estate-ru": "Практичный совет покупателю, арендатору или собственнику в Днепре.",
  "dnipro-real-estate-ua": "Практична порада щодо оренди, купівлі або районів українською.",
  "commercial-real-estate": "Аренда помещения, офис, склад или бизнес-локация.",
  "land-houses": "Участки, дома, пригород и документы без юридических гарантий.",
  "real-estate-investments": "Осторожный аналитический пост без обещаний доходности.",
};

export function listPostDrafts(filters: ListDraftsFilters = {}) {
  return drafts
    .map((draft) => ensureDraftTextQuality(ensureDraftMedia(draft)))
    .filter((draft) => !filters.channelId || draft.channelId === filters.channelId)
    .filter((draft) => !filters.status || draft.status === filters.status)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export function repairBadDraftTexts() {
  let fixed = 0;

  for (const draft of drafts) {
    const quality = getTextQualityStatus({ title: draft.title, text: draft.content, status: draft.status });
    if (quality === "TEXT OK") continue;

    const channel = getChannelGenerationConfig(draft.channelId);
    const topic = firstBatchTopics[draft.channelId] ?? channel?.topic ?? "Полезная тема для канала.";
    draft.title = createCleanDraftTitle(channel?.name ?? draft.channelTitle);
    draft.content = createCleanDraftContent(channel?.name ?? draft.channelTitle, topic, draft.language);
    draft.status = "pending_review";
    draft.validationStatus = "passed";
    draft.validationNotes = ["Текст восстановлен после проверки кодировки."];
    draft.validationReasons = [];
    draft.updatedAt = new Date().toISOString();
    fixed += 1;
  }

  if (fixed > 0) {
    persistDrafts();
  }

  return {
    fixed,
    remainingBroken: listPostDrafts().filter((draft) => getTextQualityStatus({ title: draft.title, text: draft.content, status: draft.status }) !== "TEXT OK").length,
    drafts: listPostDrafts(),
  };
}

export function repairDraftPostImages() {
  let fixed = 0;

  for (const draft of drafts) {
    const previousImageUrl = draft.imageUrl;
    const previousStatus = draft.imageStatus;
    ensureDraftMedia(draft);

    if (draft.imageUrl !== previousImageUrl || draft.imageStatus !== previousStatus) {
      fixed += 1;
      draft.updatedAt = new Date().toISOString();
    }
  }

  if (fixed > 0) {
    persistDrafts();
  }

  return { fixed, drafts: listPostDrafts() };
}

export function listDryRunPostLogs() {
  return [...dryRunLogs].sort((left, right) => right.timestamp.localeCompare(left.timestamp));
}

export function listDraftReviewHistory(draftId?: string) {
  return reviewHistory
    .filter((item) => !draftId || item.draftId === draftId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export function listDraftsForReview(filters: ListDraftsFilters & { language?: PostDraftLanguage } = {}) {
  return listPostDrafts(filters)
    .filter((draft) => !filters.language || draft.language === filters.language)
    .map((draft) => ({
      draft,
      checks: getDraftReviewChecks(draft),
      history: listDraftReviewHistory(draft.id),
    }));
}

export function getDraftReviewCounters() {
  const allDrafts = listPostDrafts();

  return {
    total: allDrafts.length,
    firstBatchDrafts: allDrafts.filter((draft) => draft.source === "first_batch_generation").length,
    pendingReview: allDrafts.filter((draft) => draft.status === "pending_review").length,
    approved: allDrafts.filter((draft) => draft.status === "approved").length,
    rejected: allDrafts.filter((draft) => draft.status === "rejected").length,
    needsRevision: allDrafts.filter((draft) => draft.status === "needs_revision").length,
    regenerated: reviewHistory.filter((item) => item.action === "regenerated").length,
    telegramSent: allDrafts.filter((draft) => draft.telegramSent).length,
    realSendsTotal: checkTelegramConfig().realSendsTotal,
  };
}

export function getPostDraftById(id: string) {
  return findDraft(id);
}

export async function createPostDraftFromChannel(channelId: string): Promise<DraftMutationResult> {
  const channel = getChannelGenerationConfig(channelId);

  if (!channel) {
    return { ok: false, error: "Channel config was not found." };
  }

  const telegram = validateTelegramSettings();

  if (!telegram.config.dryRun) {
    return { ok: false, error: "Telegram dry-run is disabled. Draft generation is blocked for safety." };
  }

  const now = new Date().toISOString();
  const aiConfig = getAiProviderConfig();
  const prompt = buildDraftPrompt(channel);
  const aiResult = await generateTextWithAI({ prompt });
  const profile = loadEditorialProfile(channel.id);
  const validation = aiResult.ok && profile ? validateGeneratedPost(aiResult.text, profile) : undefined;
  const currencyValidation = aiResult.ok ? validateCurrencyPolicy(aiResult.text) : undefined;
  const validationReasons = mergeValidationReasons(validation?.reasons, currencyValidation);
  const textQuality = aiResult.ok ? validateGeneratedTextQuality(aiResult.text) : { ok: false, status: "failed_generation" as const };
  const status: PostDraftStatus = aiResult.ok
    ? !textQuality.ok
      ? textQuality.status === "invalid_text_encoding"
        ? "invalid_text_encoding"
        : "failed_generation"
      : validationReasons.length
        ? "needs_revision"
        : "pending_review"
    : "failed_generation";
  const draftId = createId("draft");
  const draft: PostDraft = {
    id: draftId,
    channelId: channel.id,
    channelTitle: channel.name,
    telegramChatId: channel.telegramChatId,
    title: aiResult.ok ? extractTitle(aiResult.text, channel.name) : `Черновик требует перегенерации: ${channel.name}`,
    content: aiResult.ok ? aiResult.text : "AI вернул некорректный текст. Нужна перегенерация.",
    imageUrl: getPostImagePath(channel.id, draftId),
    imageCaption: getDefaultPostImageCaption(channel.id),
    readinessStatus: "ready_for_test",
    language: normalizeDraftLanguage(channel.language),
    topic: channel.topic,
    status,
    createdAt: now,
    updatedAt: now,
    scheduledFor: null,
    dryRun: true,
    telegramSent: false,
    aiProvider: "lmstudio",
    modelName: aiResult.model || aiConfig.model,
    source: "manual_generation",
    validationStatus: validationReasons.length ? "needs_revision" : "passed",
    validationNotes: validationReasons,
    validationReasons,
  };

  ensureDraftMedia(draft);
  drafts.unshift(draft);
  addDryRunLog(draft, "draftCreated");

  return {
    ok: aiResult.ok,
    draft,
    validation,
    error: aiResult.ok ? undefined : aiResult.error ?? "AI вернул некорректный текст",
  };
}

export async function generateFirstDraftsForAllChannels(): Promise<FirstBatchGenerationResult> {
  const telegram = checkTelegramConfig();

  if (!telegram.dryRun || telegram.realSendingEnabled || telegram.realSendsTotal !== 1 || !telegram.repeatLock) {
    return {
      ok: false,
      mode: "dry-run",
      telegramSent: false,
      realSendsTotal: telegram.realSendsTotal,
      repeatLock: telegram.repeatLock,
      createdDrafts: [],
      results: [],
      error: "Safety state is not locked for first batch generation.",
    };
  }

  if (telegram.channelsTotal !== 15 || telegram.channelsWithChatId !== 15) {
    return {
      ok: false,
      mode: "dry-run",
      telegramSent: false,
      realSendsTotal: telegram.realSendsTotal,
      repeatLock: telegram.repeatLock,
      createdDrafts: [],
      results: [],
      error: "All 15 channels must have chat_id before first batch generation.",
    };
  }

  const aiConfig = getAiProviderConfig();
  const results: FirstBatchDraftResult[] = [];
  const createdDrafts: PostDraft[] = [];

  addBatchLog("firstBatchGenerationStarted");

  for (const channel of channelGenerationConfigs.slice(0, 15)) {
    const topic = firstBatchTopics[channel.id] ?? channel.topic;
    const existingDraft = drafts.find((draft) => draft.source === "first_batch_generation" && draft.channelId === channel.id);

    if (existingDraft) {
      const validationNotes = existingDraft.validationNotes ?? existingDraft.validationReasons ?? [];
      createdDrafts.push(existingDraft);
      results.push({
        channelId: channel.id,
        channelTitle: channel.name,
        ok: existingDraft.validationStatus === "passed",
        draft: existingDraft,
        validationStatus: existingDraft.validationStatus ?? (validationNotes.length ? "needs_revision" : "passed"),
        validationNotes,
      });
      continue;
    }

    const profile = loadEditorialProfile(channel.id);
    const aiResult = await generateTextWithAI({
      prompt: buildFirstBatchPrompt(channel, topic),
      maxTokens: 420,
      timeoutMs: 25000,
    });
    const now = new Date().toISOString();

    if (!aiResult.ok) {
      const validationNotes = [aiResult.error ?? "AI вернул некорректный текст"];
      const draft = buildFirstBatchDraft({
        channel,
        content: validationNotes[0],
        topic,
        modelName: aiResult.model || aiConfig.model,
        now,
        status: "pending_review",
        validationStatus: "failed",
        validationNotes,
      });

      ensureDraftMedia(draft);
      drafts.unshift(draft);
      addDryRunLog(draft, "draftValidationFailed");
      createdDrafts.push(draft);
      results.push({
        channelId: channel.id,
        channelTitle: channel.name,
        ok: false,
        draft,
        validationStatus: "failed",
        validationNotes,
        error: validationNotes[0],
      });
      continue;
    }

    const textQuality = validateGeneratedTextQuality(aiResult.text);
    const validation = textQuality.ok && profile ? validateGeneratedPost(aiResult.text, profile) : undefined;
    const currencyValidation = validateCurrencyPolicy(aiResult.text);
    const validationNotes = textQuality.ok
      ? mergeValidationReasons(validation?.reasons, currencyValidation)
      : [textQuality.reason ?? "AI вернул некорректный текст"];
    const validationStatus: PostDraftValidationStatus = validationNotes.length ? "needs_revision" : "passed";
    const draft = buildFirstBatchDraft({
      channel,
      content: aiResult.text,
      topic,
      modelName: aiResult.model || aiConfig.model,
      now,
      status: textQuality.ok ? "pending_review" : textQuality.status === "invalid_text_encoding" ? "invalid_text_encoding" : "failed_generation",
      validationStatus,
      validationNotes,
    });

    ensureDraftMedia(draft);
    drafts.unshift(draft);
    addDryRunLog(draft, "draftGenerated");

    if (validationNotes.length) {
      addDryRunLog(draft, "draftValidationFailed");
    }

    createdDrafts.push(draft);
    results.push({
      channelId: channel.id,
      channelTitle: channel.name,
      ok: validationStatus === "passed",
      draft,
      validationStatus,
      validationNotes,
    });
  }

  addBatchLog("firstBatchGenerationCompleted");

  return {
    ok: createdDrafts.length === 15,
    mode: "dry-run",
    telegramSent: false,
    realSendsTotal: telegram.realSendsTotal,
    repeatLock: telegram.repeatLock,
    createdDrafts,
    results,
  };
}

export function createPostDraftFromGeneratedText({
  channel,
  content,
  topic,
  modelName,
  status = "pending_review",
}: CreateDraftFromGeneratedTextInput): PostDraft {
  const now = new Date().toISOString();
  const profile = loadEditorialProfile(channel.id);
  const validation = profile ? validateGeneratedPost(content, profile) : undefined;
  const currencyValidation = validateCurrencyPolicy(content);
  const validationReasons = mergeValidationReasons(validation?.reasons, currencyValidation);
  const finalStatus: PostDraftStatus = validationReasons.length ? "needs_revision" : status;
  const draftId = createId("draft");
  const draft: PostDraft = {
    id: draftId,
    channelId: channel.id,
    channelTitle: channel.name,
    telegramChatId: channel.telegramChatId,
    title: extractTitle(content, channel.name),
    content,
    imageUrl: getPostImagePath(channel.id, draftId),
    imageCaption: getDefaultPostImageCaption(channel.id),
    readinessStatus: "ready_for_test",
    language: normalizeDraftLanguage(channel.language),
    topic: topic || channel.topic,
    status: finalStatus,
    createdAt: now,
    updatedAt: now,
    scheduledFor: null,
    dryRun: true,
    telegramSent: false,
    aiProvider: "lmstudio",
    modelName,
    source: "manual_generation",
    validationStatus: validationReasons.length ? "needs_revision" : "passed",
    validationNotes: validationReasons,
    validationReasons,
  };

  ensureDraftMedia(draft);
  drafts.unshift(draft);
  addDryRunLog(draft, "draftCreated");

  return draft;
}

export function approvePostDraft(id: string): DraftMutationResult {
  const draft = findDraft(id);

  if (!draft) {
    return { ok: false, error: "Post draft was not found." };
  }

  const previousStatus = draft.status;
  draft.status = "approved";
  draft.draftApprovedAt = new Date().toISOString();
  draft.updatedAt = draft.draftApprovedAt;
  draft.telegramSent = false;
  addReviewHistory(draft, "approved", previousStatus, "approved", "Approved manually. Telegram was not sent.");
  addDryRunLog(draft, "draftApproved");

  return { ok: true, draft };
}

export function rejectPostDraft(id: string): DraftMutationResult {
  const draft = findDraft(id);

  if (!draft) {
    return { ok: false, error: "Post draft was not found." };
  }

  const previousStatus = draft.status;
  draft.status = "rejected";
  draft.rejectedAt = new Date().toISOString();
  draft.updatedAt = draft.rejectedAt;
  draft.telegramSent = false;
  addReviewHistory(draft, "rejected", previousStatus, "rejected", "Rejected manually. Telegram was not sent.");
  addDryRunLog(draft, "draftRejected");

  return { ok: true, draft };
}

export function markPostDraftNeedsRevision(id: string, notes = "Manual review requested changes."): DraftMutationResult {
  const draft = findDraft(id);

  if (!draft) {
    return { ok: false, error: "Post draft was not found." };
  }

  const previousStatus = draft.status;
  draft.status = "needs_revision";
  draft.validationStatus = "needs_revision";
  draft.validationNotes = Array.from(new Set([...(draft.validationNotes ?? []), notes]));
  draft.validationReasons = draft.validationNotes;
  draft.revisionRequestedAt = new Date().toISOString();
  draft.updatedAt = draft.revisionRequestedAt;
  draft.telegramSent = false;
  addReviewHistory(draft, "needs_revision", previousStatus, "needs_revision", notes);
  addDryRunLog(draft, "draftNeedsRevision");

  return { ok: true, draft };
}

export async function regeneratePostDraft(id: string): Promise<DraftMutationResult> {
  const existing = findDraft(id);

  if (!existing) {
    return { ok: false, error: "Post draft was not found." };
  }

  const channel = getChannelGenerationConfig(existing.channelId);

  if (!channel) {
    return { ok: false, error: "Channel config was not found." };
  }

  const telegram = validateTelegramSettings();

  if (!telegram.config.dryRun) {
    return { ok: false, error: "Telegram dry-run is disabled. Regeneration is blocked for safety." };
  }

  const profile = loadEditorialProfile(channel.id);
  const aiResult = await generateTextWithAI({ prompt: buildDraftPrompt(channel, existing.topic) });
  const validation = aiResult.ok && profile ? validateGeneratedPost(aiResult.text, profile) : undefined;
  const currencyValidation = aiResult.ok ? validateCurrencyPolicy(aiResult.text) : undefined;
  const validationReasons = mergeValidationReasons(validation?.reasons, currencyValidation);
  const now = new Date().toISOString();
  const previousStatus = existing.status;
  const previousContent = existing.content;
  existing.content = aiResult.ok ? aiResult.text : "AI вернул некорректный текст. Нужна перегенерация.";
  existing.title = aiResult.ok ? extractTitle(aiResult.text, existing.channelTitle) : existing.title;
  existing.status = aiResult.ok ? "pending_review" : "needs_revision";
  existing.updatedAt = now;
  existing.scheduledFor = null;
  existing.modelName = aiResult.model || existing.modelName;
  existing.source = "regeneration";
  existing.validationStatus = validationReasons.length ? "needs_revision" : "passed";
  existing.validationNotes = validationReasons;
  existing.validationReasons = validationReasons;
  existing.regeneratedFromContent = previousContent;
  existing.telegramSent = false;
  addReviewHistory(
    existing,
    "regenerated",
    previousStatus,
    existing.status,
    aiResult.ok ? "Regenerated through LM Studio. Telegram was not sent." : aiResult.error ?? "Regeneration failed.",
  );
  addDryRunLog(existing, "regenerated");

  return {
    ok: aiResult.ok,
    draft: existing,
    validation,
    error: aiResult.ok ? undefined : aiResult.error ?? "AI вернул некорректный текст",
  };
}

export async function createPostDraftVariant(id: string): Promise<DraftMutationResult> {
  const existing = findDraft(id);

  if (!existing) {
    return { ok: false, error: "Post draft was not found." };
  }

  const channel = getChannelGenerationConfig(existing.channelId);

  if (!channel) {
    return { ok: false, error: "Channel config was not found." };
  }

  const telegram = validateTelegramSettings();

  if (!telegram.config.dryRun) {
    return { ok: false, error: "Telegram dry-run is disabled. Variant generation is blocked for safety." };
  }

  const aiConfig = getAiProviderConfig();
  const prompt = [
    buildDraftPrompt(channel, existing.topic),
    "",
    "Create variant 2. Keep the same channel rules and topic, but use a different opening and structure.",
    "Do not publish, do not schedule, and do not mention that the message was sent.",
  ].join("\n");
  const aiResult = await generateTextWithAI({ prompt, timeoutMs: 60000, maxTokens: 520 });
  const profile = loadEditorialProfile(channel.id);
  const validation = aiResult.ok && profile ? validateGeneratedPost(aiResult.text, profile) : undefined;
  const currencyValidation = aiResult.ok ? validateCurrencyPolicy(aiResult.text) : undefined;
  const validationReasons = mergeValidationReasons(validation?.reasons, currencyValidation);
  const now = new Date().toISOString();
  const variantId = createId("draft");
  const variant: PostDraft = {
    id: variantId,
    channelId: channel.id,
    channelTitle: channel.name,
    telegramChatId: channel.telegramChatId,
    title: aiResult.ok ? `Variant 2: ${extractTitle(aiResult.text, channel.name)}` : `Variant 2 failed for ${channel.name}`,
    content: aiResult.ok ? aiResult.text : "AI вернул некорректный текст. Нужна перегенерация.",
    imageUrl: getPostImagePath(channel.id, variantId),
    imageCaption: getDefaultPostImageCaption(channel.id),
    readinessStatus: "ready_for_test",
    language: normalizeDraftLanguage(channel.language),
    topic: existing.topic,
    status: "pending_review",
    createdAt: now,
    updatedAt: now,
    scheduledFor: null,
    dryRun: true,
    telegramSent: false,
    aiProvider: "lmstudio",
    modelName: aiResult.model || aiConfig.model,
    source: "manual_generation",
    validationStatus: aiResult.ok ? (validationReasons.length ? "needs_revision" : "passed") : "failed",
    validationNotes: aiResult.ok ? validationReasons : [aiResult.error ?? "AI вернул некорректный текст"],
    validationReasons: aiResult.ok ? validationReasons : [aiResult.error ?? "AI вернул некорректный текст"],
    variantOfDraftId: existing.id,
  };

  ensureDraftMedia(variant);
  drafts.unshift(variant);
  addReviewHistory(variant, "variant_created", existing.status, variant.status, `Variant created from ${existing.id}. Telegram was not sent.`);
  addDryRunLog(variant, "draftVariantCreated");

  return {
    ok: aiResult.ok,
    draft: variant,
    validation,
    error: aiResult.ok ? undefined : aiResult.error ?? "AI вернул некорректный текст",
  };
}

export function schedulePostDraft(id: string, scheduledFor?: string): DraftMutationResult {
  const draft = findDraft(id);

  if (!draft) {
    return { ok: false, error: "Post draft was not found." };
  }

  const telegram = validateTelegramSettings();

  if (!telegram.config.dryRun) {
    return { ok: false, error: "Telegram dry-run is disabled. Scheduling is blocked for safety." };
  }

  draft.status = "scheduled";
  draft.scheduledFor = scheduledFor || getDefaultScheduleTime();
  draft.updatedAt = new Date().toISOString();
  draft.telegramSent = false;
  draft.validationStatus = draft.validationReasons?.length ? "needs_revision" : "passed";
  draft.validationNotes = draft.validationReasons ?? [];
  addDryRunLog(draft, "scheduled");

  return { ok: true, draft };
}

export function dryRunSendPostDraft(id: string): DraftMutationResult {
  const draft = findDraft(id);

  if (!draft) {
    return { ok: false, error: "Post draft was not found." };
  }

  const telegram = validateTelegramSettings();

  if (!telegram.config.dryRun) {
    return { ok: false, error: "Telegram dry-run is disabled. Real sending is blocked by this endpoint." };
  }

  const safety = validateTelegramSendSafety({
    channelId: draft.channelId,
    telegramChatId: draft.telegramChatId,
    draftId: draft.id,
    draftStatus: draft.status,
  });

  if (!safety.dryRun && !safety.canSendReal) {
    return { ok: false, draft, error: safety.reasons.join(" ") || "Telegram safety check failed." };
  }

  const currencyValidation = validateCurrencyPolicy(draft.content);

  if (!currencyValidation.ok) {
    draft.validationReasons = mergeValidationReasons(draft.validationReasons, currencyValidation);
    draft.status = "needs_revision";
    draft.updatedAt = new Date().toISOString();
    persistDrafts();

    return { ok: false, draft, error: "Forbidden currency detected" };
  }

  if (!validatePostHasImage(draft)) {
    draft.readinessStatus = "not_ready";
    draft.updatedAt = new Date().toISOString();
    persistDrafts();

    return { ok: false, draft, error: missingPostImageMessage };
  }

  draft.status = "dry_run_sent";
  draft.readinessStatus = "ready_for_real_publish";
  draft.updatedAt = new Date().toISOString();
  draft.telegramSent = false;
  addDryRunLog(draft, "dryRunSent");

  return { ok: true, draft };
}

export function validatePostDraft(id: string): DraftMutationResult {
  const draft = findDraft(id);

  if (!draft) {
    return { ok: false, error: "Post draft was not found." };
  }

  const profile = loadEditorialProfile(draft.channelId);

  if (!profile) {
    return { ok: false, draft, error: "Editorial profile was not found." };
  }

  const validation = validateGeneratedPost(draft.content, profile);
  const currencyValidation = validateCurrencyPolicy(draft.content);
  const validationReasons = mergeValidationReasons(validation.reasons, currencyValidation);
  draft.validationReasons = validationReasons;
  draft.status = validationReasons.length ? "needs_revision" : "pending_review";
  draft.updatedAt = new Date().toISOString();
  draft.validationStatus = validationReasons.length ? "needs_revision" : "passed";
  draft.validationNotes = validationReasons;
  persistDrafts();

  return { ok: validation.ok, draft, validation };
}

export function getEditableDraftStatuses(): PostDraftStatus[] {
  return ["draft", "pending_review", "approved", "rejected", "scheduled", "needs_revision", "failed_generation", "invalid_text_encoding", "generated_failed", "dry_run_sent", "not_ready"];
}

function updateDraftStatus(id: string, status: PostDraftStatus, action: DryRunPostAction): DraftMutationResult {
  const draft = findDraft(id);

  if (!draft) {
    return { ok: false, error: "Post draft was not found." };
  }

  draft.status = status;
  draft.updatedAt = new Date().toISOString();
  draft.telegramSent = false;
  addDryRunLog(draft, action);

  return { ok: true, draft };
}

function findDraft(id: string) {
  const draft = drafts.find((item) => item.id === id);

  return draft ? ensureDraftMedia(draft) : undefined;
}

function addDryRunLog(draft: PostDraft, action: DryRunPostAction) {
  dryRunLogs.unshift({
    postId: draft.id,
    channelId: draft.channelId,
    action,
    status: draft.status,
    telegramSent: false,
    timestamp: new Date().toISOString(),
  });
  persistDrafts();
}

function addBatchLog(action: Extract<DryRunPostAction, "firstBatchGenerationStarted" | "firstBatchGenerationCompleted">) {
  dryRunLogs.unshift({
    postId: `first-batch-${Date.now()}`,
    channelId: "all",
    action,
    status: "pending_review",
    telegramSent: false,
    timestamp: new Date().toISOString(),
  });
}

function addReviewHistory(
  draft: PostDraft,
  action: DraftReviewHistory["action"],
  previousStatus: PostDraftStatus,
  nextStatus: PostDraftStatus,
  notes: string,
) {
  reviewHistory.unshift({
    id: createId("review"),
    draftId: draft.id,
    action,
    previousStatus,
    nextStatus,
    notes,
    createdAt: new Date().toISOString(),
    telegramSent: false,
  });
  persistReviewHistory();
}

function getDraftReviewChecks(draft: PostDraft) {
  const profile = loadEditorialProfile(draft.channelId);
  const currencyValidation = validateCurrencyPolicy(draft.content);
  const editorialValidation = profile ? validateGeneratedPost(draft.content, profile) : undefined;
  const reasons = new Set([...(draft.validationNotes ?? []), ...(draft.validationReasons ?? []), ...(editorialValidation?.reasons ?? [])]);

  return [
    {
      key: "image",
      label: "Image attached",
      ok: validatePostHasImage(draft),
      detail: validatePostHasImage(draft) ? draft.imageUrl : missingPostImageMessage,
    },
    {
      key: "currency_policy",
      label: "CurrencyPolicy",
      ok: currencyValidation.ok,
      detail: currencyValidation.ok ? "ok" : "forbidden currency detected",
    },
    {
      key: "forbidden_currency_terms",
      label: "No forbidden currency terms",
      ok: currencyValidation.ok,
      detail: currencyValidation.ok ? "ok" : "blocked by CurrencyPolicy",
    },
    {
      key: "editorial_policy",
      label: "EditorialPolicy",
      ok: editorialValidation?.ok ?? false,
      detail: editorialValidation?.ok ? "ok" : Array.from(reasons).join("; ") || "profile check failed",
    },
    {
      key: "language",
      label: "Language matches channel",
      ok: !hasReason(reasons, "language_mismatch"),
      detail: hasReason(reasons, "language_mismatch") ? "language mismatch" : "ok",
    },
    {
      key: "not_generic",
      label: "Not too generic",
      ok: !hasReason(reasons, "too_generic"),
      detail: hasReason(reasons, "too_generic") ? "too generic" : "ok",
    },
    {
      key: "no_income_promises",
      label: "No income promises",
      ok: !hasReason(reasons, "income_or_guarantee_promise"),
      detail: hasReason(reasons, "income_or_guarantee_promise") ? "promise-like wording" : "ok",
    },
    {
      key: "no_legal_guarantees",
      label: "No legal guarantees",
      ok: !hasRiskPhrase(draft.content, ["legal guarantee", "guaranteed legal", "без юридических гарантий запрещено"]),
      detail: "ok",
    },
    {
      key: "no_dangerous_advice",
      label: "No dangerous advice",
      ok: !hasRiskPhrase(draft.content, ["illegal", "dangerous", "unsafe", "нарушение", "незакон"]),
      detail: "ok",
    },
    {
      key: "length",
      label: "Length is within profile limit",
      ok: !hasReason(reasons, "too_long"),
      detail: hasReason(reasons, "too_long") ? "too long" : `${draft.content.length} chars`,
    },
    {
      key: "telegram_sent",
      label: "telegramSent=false",
      ok: draft.telegramSent === false,
      detail: String(draft.telegramSent),
    },
  ];
}

function hasReason(reasons: Set<string>, needle: string) {
  return Array.from(reasons).some((reason) => reason.includes(needle));
}

function hasRiskPhrase(text: string, phrases: string[]) {
  const lowerText = text.toLowerCase();

  return phrases.some((phrase) => lowerText.includes(phrase.toLowerCase()));
}

function readPersistedDrafts(): PostDraft[] {
  try {
    if (!existsSync(draftStoragePath)) {
      return [];
    }

    const raw = readFileSync(draftStoragePath, "utf8").replace(/^\uFEFF/, "");
    const parsed = JSON.parse(raw) as unknown;

    return Array.isArray(parsed) ? (parsed as PostDraft[]).map((draft) => ensureDraftMedia(draft)) : [];
  } catch {
    return [];
  }
}

function readPersistedReviewHistory(): DraftReviewHistory[] {
  try {
    if (!existsSync(reviewHistoryStoragePath)) {
      return [];
    }

    const raw = readFileSync(reviewHistoryStoragePath, "utf8").replace(/^\uFEFF/, "");
    const parsed = JSON.parse(raw) as unknown;

    return Array.isArray(parsed) ? (parsed as DraftReviewHistory[]) : [];
  } catch {
    return [];
  }
}

function persistDrafts() {
  try {
    mkdirSync(dirname(draftStoragePath), { recursive: true });
    writeFileSync(draftStoragePath, JSON.stringify(drafts, null, 2), "utf8");
  } catch {
    // Local mock persistence should never break the UI or safety flow.
  }
}

function persistReviewHistory() {
  try {
    mkdirSync(dirname(reviewHistoryStoragePath), { recursive: true });
    writeFileSync(reviewHistoryStoragePath, JSON.stringify(reviewHistory, null, 2), "utf8");
  } catch {
    // Local mock persistence should never break the UI or safety flow.
  }
}

function buildFirstBatchDraft({
  channel,
  content,
  topic,
  modelName,
  now,
  status,
  validationStatus,
  validationNotes,
}: {
  channel: ChannelGenerationConfig;
  content: string;
  topic: string;
  modelName: string;
  now: string;
  status: PostDraftStatus;
  validationStatus: PostDraftValidationStatus;
  validationNotes: string[];
}): PostDraft {
  const draftId = createId("draft");

  return {
    id: draftId,
    channelId: channel.id,
    channelTitle: channel.name,
    telegramChatId: channel.telegramChatId,
    title: validationStatus === "failed" ? `Черновик требует перегенерации: ${channel.name}` : extractTitle(content, channel.name),
    content,
    imageUrl: getPostImagePath(channel.id, draftId),
    imageCaption: getDefaultPostImageCaption(channel.id),
    readinessStatus: "ready_for_test",
    language: normalizeDraftLanguage(channel.language),
    topic,
    status,
    createdAt: now,
    updatedAt: now,
    scheduledFor: null,
    dryRun: true,
    telegramSent: false,
    aiProvider: "lmstudio",
    modelName,
    source: "first_batch_generation",
    validationStatus,
    validationNotes,
    validationReasons: validationNotes,
  };
}

function buildFirstBatchPrompt(channel: ChannelGenerationConfig, topic: string) {
  const editorialPrompt = buildEditorialPrompt({
    channel,
    topic,
    profile: loadEditorialProfile(channel.id),
  });

  return [
    editorialPrompt,
    "",
    "Batch context: this is the first safe draft generation for all 15 channels after a locked single-channel test.",
    "Create exactly one Telegram draft for this channel.",
    "Do not publish, do not schedule, do not mention that publication happened.",
    "The draft must wait for manual review.",
    "Use a practical structure: short title, useful body, concrete checklist or steps, calm CTA.",
    "Do not use forbidden currency terms. For Ukraine use UAH, грн or ₴. For international examples use USD/EUR.",
  ].join("\n");
}

function buildDraftPrompt(
  channel: (typeof channelGenerationConfigs)[number],
  topicOverride?: string,
) {
  const editorialPrompt = buildEditorialPrompt({
    channel,
    topic: topicOverride || channel.topic,
    profile: loadEditorialProfile(channel.id),
  });

  if (editorialPrompt) {
    return editorialPrompt;
  }

  return [
    "Сгенерируй черновик Telegram-поста для редакционной очереди.",
    `Канал: ${channel.name}`,
    `Тематика: ${topicOverride || channel.topic}`,
    `Язык: ${channel.language}`,
    `Стиль: ${channel.postStyle}`,
    `Частота публикаций: ${channel.postingFrequency}`,
    "Формат: короткий заголовок, затем основной текст 700-1200 знаков.",
    "Не добавляй обещаний реальной публикации. Это dry-run черновик для проверки редактором.",
  ].join("\n");
}

function extractTitle(text: string, channelName: string) {
  const firstLine = text
    .split("\n")
    .map((line) => line.trim().replace(/^#+\s*/, ""))
    .find(Boolean);

  if (!firstLine) {
    return `Draft for ${channelName}`;
  }

  return firstLine.length > 90 ? `${firstLine.slice(0, 87)}...` : firstLine;
}

function ensureDraftTextQuality(draft: PostDraft) {
  const quality = getTextQualityStatus({ title: draft.title, text: draft.content, status: draft.status });

  if (quality === "BROKEN TEXT") {
    draft.status = "invalid_text_encoding";
    draft.validationStatus = "failed";
    draft.validationNotes = Array.from(new Set([...(draft.validationNotes ?? []), "mojibake_detected"]));
  }

  if (quality === "FAILED GENERATION") {
    draft.status = "failed_generation";
    draft.validationStatus = "failed";
    draft.validationNotes = Array.from(new Set([...(draft.validationNotes ?? []), "AI вернул некорректный текст"]));
  }

  return draft;
}

function createCleanDraftTitle(channelName: string) {
  return `Черновик для проверки: ${channelName}`;
}

function createCleanDraftContent(channelName: string, topic: string, language: PostDraftLanguage) {
  if (language === "uk") {
    return [
      `**${channelName}: корисна замітка**`,
      "",
      `Тема: ${topic}`,
      "",
      "Коротко: перевірте умови, дедлайни, джерело інформації та реальну користь для читача. Збережіть посилання, порівняйте кілька варіантів і не приймайте рішення без перевірки деталей.",
      "",
      "Цей текст створений як безпечний чернетковий варіант для ручної редакційної перевірки.",
    ].join("\n");
  }

  return [
    `**${channelName}: полезная заметка**`,
    "",
    `Тема: ${topic}`,
    "",
    "Коротко: проверьте условия, сроки, источник информации и практическую пользу для читателя. Сравните несколько вариантов, сохраните важные детали и не принимайте решение без дополнительной проверки.",
    "",
    "Этот текст создан как безопасный черновик для ручной редакционной проверки.",
  ].join("\n");
}

function normalizeDraftLanguage(language: string): PostDraftLanguage {
  return language === "uk" ? "uk" : "ru";
}

function getDefaultScheduleTime() {
  return new Date(Date.now() + 60 * 60 * 1000).toISOString();
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function mergeValidationReasons(
  reasons: string[] | undefined,
  currencyValidation: ReturnType<typeof validateCurrencyPolicy> | undefined,
) {
  const merged = [...(reasons ?? [])];

  if (currencyValidation?.forbiddenCurrencyFound && !merged.includes("Forbidden currency detected")) {
    merged.push("Forbidden currency detected");
  }

  return merged;
}
