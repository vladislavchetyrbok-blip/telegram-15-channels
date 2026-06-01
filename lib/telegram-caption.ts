import { validateCurrencyPolicy } from "@/lib/currency-policy";
import { hasBrokenText, isFailedGenerationText } from "@/lib/text-quality";

export const telegramCaptionSafeLimit = 900;

const badFragments = [
  "test post",
  "draft",
  "failed first draft",
  "local-model",
  "local model",
  "Instruction: local-model",
];

export interface TelegramCaptionResult {
  caption: string;
  plainText: string;
  length: number;
  status: "OK" | "missing" | "too_long" | "invalid_text";
  truncated: boolean;
}

export function buildTelegramCaption({
  title,
  body,
  maxLength = telegramCaptionSafeLimit,
}: {
  title: string;
  body: string;
  maxLength?: number;
}): TelegramCaptionResult {
  const cleanTitle = normalizeText(title);
  const cleanBody = normalizeText(body);
  const combined = `${cleanTitle}\n${cleanBody}`;

  if (!cleanTitle || !cleanBody) {
    return { caption: "", plainText: "", length: 0, status: "missing", truncated: false };
  }

  if (hasBrokenText(combined) || isFailedGenerationText(combined) || validateCurrencyPolicy(combined).matches.length > 0) {
    return { caption: "", plainText: "", length: 0, status: "invalid_text", truncated: false };
  }

  const titlePart = truncatePlain(cleanTitle, 120);
  const sentences = splitSentences(cleanBody);
  const essence = sentences[0] ?? cleanBody;
  const bulletSource = sentences.slice(1, 5);
  const conclusion = sentences.length > 5 ? sentences[sentences.length - 1] : sentences[4] ?? sentences[3] ?? "";

  const variants = [
    [essence, ...bulletSource.map((item) => `- ${item}`), conclusion ? `Итог: ${conclusion}` : ""],
    [essence, ...bulletSource.slice(0, 3).map((item) => `- ${item}`)],
    [essence, ...bulletSource.slice(0, 2).map((item) => `- ${item}`)],
    [essence],
  ];

  for (const lines of variants) {
    const plain = buildPlainCaption(titlePart, lines.filter(Boolean));
    const caption = toHtmlCaption(plain);

    if (caption.length <= maxLength) {
      return { caption, plainText: plain, length: caption.length, status: "OK", truncated: plain.length < `${cleanTitle}\n\n${cleanBody}`.length };
    }
  }

  let bodyLimit = Math.max(80, maxLength - toHtmlCaption(`${titlePart}\n\n`).length - 1);
  let plain = buildPlainCaption(titlePart, [truncatePlain(essence, bodyLimit)]);
  let caption = toHtmlCaption(plain);

  while (caption.length > maxLength && bodyLimit > 80) {
    bodyLimit -= 20;
    plain = buildPlainCaption(titlePart, [truncatePlain(essence, bodyLimit)]);
    caption = toHtmlCaption(plain);
  }

  return {
    caption,
    plainText: plain,
    length: caption.length,
    status: caption.length <= maxLength ? "OK" : "too_long",
    truncated: true,
  };
}

export function getTelegramCaptionStatus(title: string, body: string) {
  const result = buildTelegramCaption({ title, body });

  return {
    telegramCaption: result.caption,
    telegramCaptionLength: result.length,
    telegramCaptionStatus: result.status,
  };
}

function normalizeText(value: string) {
  let next = value.replace(/\r\n/g, "\n").replace(/\s+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();

  for (const fragment of badFragments) {
    next = next.replace(new RegExp(escapeRegExp(fragment), "gi"), "").trim();
  }

  return next.replace(/[ \t]{2,}/g, " ");
}

function splitSentences(value: string) {
  return value
    .split(/(?<=[.!?。！？])\s+|\n+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 20)
    .slice(0, 8);
}

function buildPlainCaption(title: string, lines: string[]) {
  return [title, ...lines].filter(Boolean).join("\n\n");
}

function toHtmlCaption(plain: string) {
  const [title, ...rest] = plain.split("\n\n");
  return [`<b>${escapeTelegramHtml(title)}</b>`, ...rest.map(escapeTelegramHtml)].join("\n\n");
}

function truncatePlain(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;

  const sliced = value.slice(0, Math.max(0, maxLength - 3));
  const lastSpace = sliced.lastIndexOf(" ");
  return `${sliced.slice(0, lastSpace > 40 ? lastSpace : sliced.length).trim()}...`;
}

function escapeTelegramHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
