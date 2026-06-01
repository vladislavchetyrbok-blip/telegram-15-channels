import { editorialProfiles, getEditorialProfile } from "@/data/editorialProfiles";
import type { ChannelGenerationConfig } from "@/data/channelGeneration";
import { getCurrencyPromptRule, validateCurrencyPolicy } from "@/lib/currency-policy";
import type {
  ChannelEditorialProfile,
  EditorialLog,
  EditorialLogAction,
  EditorialValidationResult,
  PostDraft,
} from "@/types";

interface EditorialLogStore {
  logs: EditorialLog[];
}

const globalForEditorial = globalThis as typeof globalThis & {
  __telegramEditorialLogStore?: EditorialLogStore;
};

const store =
  globalForEditorial.__telegramEditorialLogStore ??
  (globalForEditorial.__telegramEditorialLogStore = {
    logs: [],
  });

const genericPhrases = [
  "важно понимать",
  "в современном мире",
  "каждый человек",
  "это очень важно",
  "многие люди",
  "на сегодняшний день",
];

const incomePromiseWords = [
  "гарантированная доходность",
  "гарантированный доход",
  "точно заработаете",
  "без риска",
  "100%",
  "быстро разбогатеть",
];

const forbiddenCurrencyTerms = [
  "\u20bd",
  ["R", "U", "B"].join(""),
  ["р", "у", "б", "л", "ь"].join(""),
  ["р", "у", "б", "л", "и"].join(""),
  ["р", "у", "б", "л", "е", "й"].join(""),
  ["р", "о", "с", "с", "и", "й", "с", "к", "и", "й", " ", "р", "у", "б", "л", "ь"].join(""),
  ["р", "о", "с", "і", "й", "с", "ь", "к", "и", "й", " ", "р", "у", "б", "л", "ь"].join(""),
];

export function listEditorialProfiles() {
  return editorialProfiles;
}

export function loadEditorialProfile(channelId: string) {
  const profile = getEditorialProfile(channelId);

  if (profile) {
    addEditorialLog(profile.channelId, "editorialProfileLoaded");
  }

  return profile;
}

export function getEditorialLogs() {
  return [...store.logs].sort((left, right) => right.timestamp.localeCompare(left.timestamp));
}

export function getEditorialCounters(drafts: PostDraft[]) {
  return {
    channelsTotal: 15,
    profilesTotal: editorialProfiles.length,
    passed: drafts.filter((draft) => !draft.validationReasons?.length && draft.status !== "needs_revision" && draft.status !== "generated_failed").length,
    needsRevision: drafts.filter((draft) => draft.status === "needs_revision" || draft.status === "generated_failed").length,
    realSent: 0,
  };
}

export function buildEditorialPrompt({
  channel,
  topic,
  profile,
}: {
  channel: ChannelGenerationConfig;
  topic?: string;
  profile?: ChannelEditorialProfile;
}) {
  const activeProfile = profile ?? getEditorialProfile(channel.id);

  if (!activeProfile) {
    return [
      "Сгенерируй Telegram-пост.",
      `Канал: ${channel.name}`,
      `Язык: ${channel.language}`,
      `Тема: ${topic || channel.topic}`,
      "Формат: заголовок и полезный текст.",
      buildCurrencySafetyInstruction(),
    ].join("\n");
  }

  return [
    "Сгенерируй Telegram-пост строго по редакционному профилю.",
    `Канал: ${activeProfile.channelTitle}`,
    `Язык: ${activeProfile.language}`,
    `Тема: ${topic || channel.topic}`,
    `Аудитория: ${activeProfile.audience}`,
    `Tone: ${activeProfile.tone}`,
    `Content pillars: ${activeProfile.contentPillars.join(", ")}`,
    `Allowed post types: ${activeProfile.allowedPostTypes.join(", ")}`,
    `Forbidden topics: ${activeProfile.forbiddenTopics.join(", ")}`,
    `Forbidden words: ${activeProfile.forbiddenWords.join(", ")}`,
    `Formatting rules: ${activeProfile.formattingRules.join(" ")}`,
    `Style rules: ${activeProfile.styleRules.join(" ")}`,
    `CTA rules: ${activeProfile.callToActionRules.join(" ")}`,
    `Emoji policy: ${activeProfile.emojiPolicy}`,
    `Max length: ${activeProfile.maxLength} characters.`,
    "Не обещай доходность, гарантии или результат.",
    "Добавь практическую пользу: шаг, критерий, проверку, список или вывод.",
    buildCurrencySafetyInstruction(),
    "Не пиши, что сообщение опубликовано. Это dry-run черновик.",
  ].join("\n");
}

export function validateGeneratedPost(
  post: string,
  profile: ChannelEditorialProfile,
): EditorialValidationResult {
  const reasons: string[] = [];
  const lowerPost = post.toLowerCase();

  if (profile.language === "uk" && !hasUkrainianSignals(lowerPost)) {
    reasons.push("language_mismatch: expected Ukrainian language signals");
  }

  if (profile.language === "ru" && hasTooManyUkrainianSignals(lowerPost)) {
    reasons.push("language_mismatch: Russian channel text looks too Ukrainian");
  }

  for (const topic of profile.forbiddenTopics) {
    if (topic && lowerPost.includes(topic.toLowerCase())) {
      reasons.push(`forbidden_topic: ${topic}`);
    }
  }

  for (const word of profile.forbiddenWords) {
    if (word && lowerPost.includes(word.toLowerCase())) {
      reasons.push(`forbidden_word: ${word}`);
    }
  }

  for (const word of incomePromiseWords) {
    if (lowerPost.includes(word)) {
      reasons.push(`income_or_guarantee_promise: ${word}`);
    }
  }

  if (!validateCurrencyPolicy(post).ok) {
    reasons.push("Forbidden currency detected");
  }

  if (post.length > profile.maxLength) {
    reasons.push(`too_long: ${post.length}/${profile.maxLength}`);
  }

  if (genericPhrases.filter((phrase) => lowerPost.includes(phrase)).length >= 2) {
    reasons.push("too_generic: text contains generic filler phrases");
  }

  if (!hasPracticalUse(lowerPost)) {
    reasons.push("no_practical_value: add a step, checklist, criterion, example or action");
  }

  const result: EditorialValidationResult = {
    ok: reasons.length === 0,
    reasons,
    profile,
    telegramSent: false,
    mode: "dry-run",
  };

  addEditorialLog(profile.channelId, result.ok ? "postValidated" : "validationFailed");

  return result;
}

function buildCurrencySafetyInstruction() {
  return getCurrencyPromptRule();
}

export function addEditorialLog(channelId: string, action: EditorialLogAction) {
  store.logs.unshift({
    channelId,
    action,
    telegramSent: false,
    mode: "dry-run",
    timestamp: new Date().toISOString(),
  });
}

function hasUkrainianSignals(text: string) {
  return /[іїєґ]/i.test(text) || /\b(що|для|можна|перевірте|ринок|можливості)\b/i.test(text);
}

function hasTooManyUkrainianSignals(text: string) {
  const matches = text.match(/[іїєґ]/gi);
  return (matches?.length ?? 0) > 12;
}

function hasPracticalUse(text: string) {
  return [
    "проверь",
    "перевір",
    "сравн",
    "критер",
    "шаг",
    "крок",
    "список",
    "чек",
    "пример",
    "перед тем",
    "начните",
    "почніть",
  ].some((signal) => text.includes(signal));
}
