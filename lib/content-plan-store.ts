import { channelGenerationConfigs, getChannelGenerationConfig } from "@/data/channelGeneration";
import { generateTextWithAI } from "@/lib/ai";
import { getCurrencyPromptRule, validateCurrencyPolicy } from "@/lib/currency-policy";
import { buildEditorialPrompt, loadEditorialProfile } from "@/lib/editorial";
import { createPostDraftFromGeneratedText } from "@/lib/post-draft-store";
import { validateTelegramSettings } from "@/lib/telegram";
import type {
  ContentPlanItem,
  ContentPlanLog,
  ContentPlanPostType,
  ContentPlanPriority,
  ContentPlanStatus,
  PostDraftLanguage,
} from "@/types";

interface ContentPlanStore {
  items: ContentPlanItem[];
  logs: ContentPlanLog[];
}

interface ListContentPlanFilters {
  channelId?: string;
  status?: ContentPlanStatus;
  date?: string;
}

interface ContentPlanMutationResult {
  ok: boolean;
  item?: ContentPlanItem;
  items?: ContentPlanItem[];
  draftId?: string;
  error?: string;
}

interface AiIdea {
  topic?: string;
  angle?: string;
  postType?: ContentPlanPostType;
  priority?: ContentPlanPriority;
}

const postTypes: ContentPlanPostType[] = [
  "useful_tip",
  "list",
  "news_style",
  "product_pick",
  "story",
  "analysis",
  "short_note",
];
const priorities: ContentPlanPriority[] = ["low", "medium", "high"];

const globalForContentPlan = globalThis as typeof globalThis & {
  __telegramContentPlanStore?: ContentPlanStore;
};

const store =
  globalForContentPlan.__telegramContentPlanStore ??
  (globalForContentPlan.__telegramContentPlanStore = {
    items: [],
    logs: [],
  });

export function getContentPlanState(filters: ListContentPlanFilters = {}) {
  const items = listContentPlanItems(filters);
  const today = formatDate(new Date());
  const weekEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return {
    ok: true,
    mode: "dry-run" as const,
    dryRun: true,
    telegramSent: false,
    items,
    counters: {
      channelsTotal: channelGenerationConfigs.length,
      ideasToday: store.items.filter((item) => item.plannedFor.startsWith(today)).length,
      ideasWeek: store.items.filter((item) => new Date(item.plannedFor) <= weekEnd).length,
      approvedIdeas: store.items.filter((item) => item.status === "approved").length,
      draftsCreated: store.items.filter((item) => item.status === "converted_to_draft").length,
      realSent: 0,
    },
    logs: listContentPlanLogs(),
  };
}

export function listContentPlanItems(filters: ListContentPlanFilters = {}) {
  return store.items
    .filter((item) => !filters.channelId || item.channelId === filters.channelId)
    .filter((item) => !filters.status || item.status === filters.status)
    .filter((item) => !filters.date || item.plannedFor.startsWith(filters.date))
    .sort((left, right) => left.plannedFor.localeCompare(right.plannedFor));
}

export function listContentPlanLogs() {
  return [...store.logs].sort((left, right) => right.timestamp.localeCompare(left.timestamp));
}

export async function generateContentPlanForChannel(
  channelId: string,
  daysCount: number,
): Promise<ContentPlanMutationResult> {
  const channel = getChannelGenerationConfig(channelId);

  if (!channel) {
    return { ok: false, error: "Channel config was not found." };
  }

  const telegram = validateTelegramSettings();

  if (!telegram.config.dryRun) {
    return { ok: false, error: "Telegram dry-run is disabled. Content plan generation is blocked." };
  }

  const aiResult = await generateTextWithAI({
    prompt: buildPlanPrompt({
      channelTitle: channel.name,
      language: channel.language,
      topic: channel.topic,
      style: channel.postStyle,
      daysCount,
    }),
  });

  if (!aiResult.ok) {
    return { ok: false, error: aiResult.error ?? "LM Studio content plan generation failed." };
  }

  if (!validateCurrencyPolicy(aiResult.text).ok) {
    return { ok: false, error: "Forbidden currency detected" };
  }

  const ideas = parseIdeas(aiResult.text).slice(0, 7);
  const safeIdeas = ideas.length ? ideas : createFallbackIdeas(channel.topic, daysCount);
  const now = new Date().toISOString();
  const items = safeIdeas.map((idea, index) => {
    const item: ContentPlanItem = {
      id: createId("idea"),
      channelId: channel.id,
      channelTitle: channel.name,
      language: normalizeLanguage(channel.language),
      topic: idea.topic || channel.topic,
      angle: idea.angle || "Практичный короткий пост для проверки реакции аудитории.",
      postType: normalizePostType(idea.postType, index),
      priority: normalizePriority(idea.priority),
      plannedFor: getPlannedDate(index, daysCount),
      status: "idea",
      dryRun: true,
      createdAt: now,
      updatedAt: now,
    };

    addContentPlanLog(item, "contentPlanGenerated");
    return item;
  });

  store.items.unshift(...items);

  return { ok: true, items };
}

export async function generateWeeklyContentPlan(): Promise<ContentPlanMutationResult> {
  const allItems: ContentPlanItem[] = [];

  for (const channel of channelGenerationConfigs) {
    const result = await generateContentPlanForChannel(channel.id, 7);

    if (result.items?.length) {
      allItems.push(...result.items);
    }
  }

  return { ok: true, items: allItems };
}

export function approveContentPlanItem(id: string): ContentPlanMutationResult {
  return updateContentPlanStatus(id, "approved", "ideaApproved");
}

export function rejectContentPlanItem(id: string): ContentPlanMutationResult {
  return updateContentPlanStatus(id, "rejected", "ideaRejected");
}

export async function createDraftFromContentPlanItem(id: string): Promise<ContentPlanMutationResult> {
  const item = findContentPlanItem(id);

  if (!item) {
    return { ok: false, error: "Content plan idea was not found." };
  }

  if (item.status !== "approved") {
    return { ok: false, error: "Only approved ideas can be converted to draft." };
  }

  const channel = getChannelGenerationConfig(item.channelId);

  if (!channel) {
    return { ok: false, error: "Channel config was not found." };
  }

  const telegram = validateTelegramSettings();

  if (!telegram.config.dryRun) {
    return { ok: false, error: "Telegram dry-run is disabled. Draft creation is blocked." };
  }

  const aiResult = await generateTextWithAI({
    prompt: [
      buildEditorialPrompt({
        channel,
        topic: item.topic,
        profile: loadEditorialProfile(item.channelId),
      }),
      `Угол подачи идеи: ${item.angle}`,
      `Тип поста: ${item.postType}`,
    ].join("\n"),
  });

  if (!aiResult.ok) {
    return { ok: false, error: aiResult.error ?? "LM Studio draft generation failed." };
  }

  if (!validateCurrencyPolicy(aiResult.text).ok) {
    return { ok: false, error: "Forbidden currency detected" };
  }

  const draft = createPostDraftFromGeneratedText({
    channel,
    content: aiResult.text,
    topic: item.topic,
    modelName: aiResult.model,
    status: "pending_review",
  });

  item.status = "converted_to_draft";
  item.updatedAt = new Date().toISOString();
  addContentPlanLog(item, "draftCreatedFromIdea");

  return { ok: true, item, draftId: draft.id };
}

function updateContentPlanStatus(
  id: string,
  status: ContentPlanStatus,
  action: ContentPlanLog["action"],
): ContentPlanMutationResult {
  const item = findContentPlanItem(id);

  if (!item) {
    return { ok: false, error: "Content plan idea was not found." };
  }

  item.status = status;
  item.updatedAt = new Date().toISOString();
  addContentPlanLog(item, action);

  return { ok: true, item };
}

function findContentPlanItem(id: string) {
  return store.items.find((item) => item.id === id);
}

function addContentPlanLog(item: ContentPlanItem, action: ContentPlanLog["action"]) {
  store.logs.unshift({
    itemId: item.id,
    channelId: item.channelId,
    action,
    status: item.status,
    telegramSent: false,
    mode: "dry-run",
    timestamp: new Date().toISOString(),
  });
}

function buildPlanPrompt({
  channelTitle,
  language,
  topic,
  style,
  daysCount,
}: {
  channelTitle: string;
  language: string;
  topic: string;
  style: string;
  daysCount: number;
}) {
  return [
    "Создай контент-план Telegram-постов. Верни только JSON массив без markdown.",
    "В массиве должно быть от 3 до 7 объектов.",
    "Поля объекта: topic, angle, postType, priority.",
    `postType только один из: ${postTypes.join(", ")}.`,
    "priority только low, medium или high.",
    `Канал: ${channelTitle}`,
    `Язык канала: ${language}`,
    `Тематика канала: ${topic}`,
    `Стиль: ${style}`,
    `Период планирования: ${daysCount} дней.`,
    "Не создавай публикации и не упоминай отправку в Telegram.",
    getCurrencyPromptRule(),
  ].join("\n");
}

function buildDraftFromIdeaPrompt(item: ContentPlanItem) {
  return [
    "Сгенерируй черновик Telegram-поста из утвержденной идеи контент-плана.",
    `Канал: ${item.channelTitle}`,
    `Язык: ${item.language}`,
    `Тема: ${item.topic}`,
    `Угол подачи: ${item.angle}`,
    `Тип поста: ${item.postType}`,
    "Формат: короткий заголовок и основной текст 700-1200 знаков.",
    "Это dry-run черновик, не пиши, что сообщение опубликовано.",
    getCurrencyPromptRule(),
  ].join("\n");
}

function parseIdeas(text: string): AiIdea[] {
  const cleanText = text.replace(/```json|```/g, "").trim();
  const match = cleanText.match(/\[[\s\S]*\]/);

  if (match) {
    try {
      const parsed = JSON.parse(match[0]) as AiIdea[];

      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // Fall through to line parser.
    }
  }

  return cleanText
    .split("\n")
    .map((line) => line.replace(/^[-*\d.\s]+/, "").trim())
    .filter(Boolean)
    .slice(0, 7)
    .map((line) => ({
      topic: line.slice(0, 120),
      angle: line,
    }));
}

function createFallbackIdeas(topic: string, daysCount: number): AiIdea[] {
  const count = Math.min(7, Math.max(3, daysCount));

  return Array.from({ length: count }, (_, index) => ({
    topic: `${topic}: идея ${index + 1}`,
    angle: "Практичный пост с коротким выводом и понятной пользой для аудитории.",
    postType: postTypes[index % postTypes.length],
    priority: "medium",
  }));
}

function normalizePostType(value: unknown, index: number): ContentPlanPostType {
  return typeof value === "string" && postTypes.includes(value as ContentPlanPostType)
    ? (value as ContentPlanPostType)
    : postTypes[index % postTypes.length];
}

function normalizePriority(value: unknown): ContentPlanPriority {
  return typeof value === "string" && priorities.includes(value as ContentPlanPriority)
    ? (value as ContentPlanPriority)
    : "medium";
}

function normalizeLanguage(language: string): PostDraftLanguage {
  return language === "uk" ? "uk" : "ru";
}

function getPlannedDate(index: number, daysCount: number) {
  const dayOffset = daysCount <= 1 ? index % 2 : index % daysCount;
  const date = new Date(Date.now() + dayOffset * 24 * 60 * 60 * 1000);
  const hour = 9 + ((index * 2) % 10);

  return `${formatDate(date)}T${String(hour).padStart(2, "0")}:00:00+03:00`;
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
