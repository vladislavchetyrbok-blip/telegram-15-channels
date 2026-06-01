import type { PostDraftStatus, PostStatus } from "@/types";

export type TextQualityStatus = "TEXT OK" | "BROKEN TEXT" | "FAILED GENERATION";

const badFragments = [
  "Рџ",
  "РЅ",
  "Рё",
  "Рµ",
  "Р°",
  "Р‘",
  "Рќ",
  "РЎ",
  "Р”",
  "Рљ",
  "Р›",
  "Р ",
  "Р",
  "Р€",
  "РЋ",
  "Ð",
  "Ñ",
  "Гђ",
  "Г‘",
  "пїЅ",
  "�",
  "PSP",
  "PР",
  "PВ",
  "PТ",
  "PÐ",
];

const failedDraftPhrase = ["Failed", " first", " draft"].join("");
const localInstructionPhrase = ["Instruction:", " local", "-", "model"].join("");
const localModelPhrase = ["local", " model"].join("");
const testPostPhrase = ["test", " post"].join("");

export function hasBrokenText(value: string) {
  if (!value) return false;

  return badFragments.some((fragment) => value.includes(fragment));
}

export function isFailedGenerationText(value: string) {
  const normalized = value.trim();

  return (
    !normalized ||
    normalized.includes(failedDraftPhrase) ||
    normalized.includes(localInstructionPhrase) ||
    normalized.toLowerCase().includes(localModelPhrase) ||
    normalized.toLowerCase().includes(testPostPhrase)
  );
}

export function getTextQualityStatus({
  title,
  text,
  status,
}: {
  title?: string;
  text?: string;
  status?: PostStatus | PostDraftStatus;
}): TextQualityStatus {
  const combined = [title, text].filter(Boolean).join("\n");

  if (status === "failed_generation" || status === "generated_failed" || isFailedGenerationText(combined)) {
    return "FAILED GENERATION";
  }

  if (status === "invalid_text_encoding" || hasBrokenText(combined)) {
    return "BROKEN TEXT";
  }

  return "TEXT OK";
}

export function validateGeneratedTextQuality(text: string) {
  if (isFailedGenerationText(text)) {
    return {
      ok: false,
      status: "failed_generation" as const,
      reason: "LM Studio вернул некорректный текст",
    };
  }

  if (hasBrokenText(text)) {
    return {
      ok: false,
      status: "invalid_text_encoding" as const,
      reason: "mojibake_detected",
    };
  }

  return {
    ok: true,
    status: "ok" as const,
    reason: null,
  };
}
