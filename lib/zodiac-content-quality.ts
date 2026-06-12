import { type ZodiacPreviewPost } from "./zodiac-content-generator";

export interface ZodiacQualityReport {
  qualityScore: number;
  toneScore: number;
  structureScore: number;
  clicheRisk: number;
  safetyRisk: number;
  lengthStatus: "too_short" | "good" | "too_long";
  missingSections: string[];
  warnings: string[];
  suggestions: string[];
  editorialStatus: "draft" | "needs_review" | "good_preview";
}

const forbiddenGenericPhrases = [
  "Возможны перемены",
  "Будьте внимательны",
  "Сегодня вас ждёт успех",
  "Звёзды говорят",
  "Всё получится",
  "Вас ждёт любовь",
  "День будет удачным",
  "Не упустите шанс",
  "Вселенная подсказывает",
  "Судьба готовит"
];

const forbiddenSafetyPhrases = [
  "гарантирован",
  "болезнь",
  "диагноз",
  "врач",
  "катастрофа",
  "смерть",
  "угроза",
  "выздоровление",
  "инвестируйте",
  "100%"
];

export function evaluateZodiacPostQuality(post: Omit<ZodiacPreviewPost, 'qualityScore' | 'editorialStatus' | 'warnings'>): ZodiacQualityReport {
  let score = 100;
  let toneScore = 100;
  let structureScore = 100;
  let clicheRisk = 0;
  let safetyRisk = 0;
  const warnings: string[] = [];
  const suggestions: string[] = [];
  const missingSections: string[] = [];

  const textLower = post.text.toLowerCase();

  // 1. Structure Checks
  if (!post.visualPrompt || post.visualPrompt.trim().length === 0) {
    structureScore -= 20;
    warnings.push("Missing visual prompt.");
  }

  if (post.type === "sign") {
    const requiredSignSections = ["Главное", "Любовь", "Деньги", "Работа", "Предупреждение", "Совет"];
    for (const req of requiredSignSections) {
      if (!post.sections.some(s => s.title === req)) {
        missingSections.push(req);
        structureScore -= 10;
        warnings.push(`Missing required section: ${req}`);
      }
    }
  } else if (post.type === "general") {
    // general CTA check (e.g. menu instruction)
    if (!textLower.includes("знак")) {
      warnings.push("General post should contain a CTA/navigation instruction referring to signs.");
      structureScore -= 10;
    }
  }

  // 2. Length Checks
  let lengthStatus: "too_short" | "good" | "too_long" = "good";
  if (post.text.length < 150) {
    lengthStatus = "too_short";
    warnings.push("Text is unusually short.");
    structureScore -= 10;
  } else if (post.text.length > 2000) {
    lengthStatus = "too_long";
    warnings.push("Text is too long for a Telegram post.");
    structureScore -= 10;
  }

  // 3. Cliche Checks
  for (const phrase of forbiddenGenericPhrases) {
    if (textLower.includes(phrase.toLowerCase())) {
      clicheRisk += 20;
      toneScore -= 10;
      warnings.push(`Cliche detected: "${phrase}"`);
    }
  }

  // 4. Safety Checks
  for (const phrase of forbiddenSafetyPhrases) {
    if (textLower.includes(phrase.toLowerCase())) {
      safetyRisk += 50;
      toneScore -= 30;
      warnings.push(`Safety/Medical/Guarantee risk detected: "${phrase}"`);
    }
  }

  // Final Score Calculation
  score = Math.floor((toneScore * 0.6) + (structureScore * 0.4)) - clicheRisk - safetyRisk;
  score = Math.max(0, Math.min(100, score));

  let editorialStatus: "draft" | "needs_review" | "good_preview" = "good_preview";
  if (score < 70 || safetyRisk > 0 || warnings.length > 0) {
    editorialStatus = "needs_review";
  }
  if (score < 40 || missingSections.length > 2) {
    editorialStatus = "draft";
  }

  if (clicheRisk > 0) {
    suggestions.push("Rewrite generic phrases using more specific and premium language.");
  }
  if (lengthStatus === "too_long") {
    suggestions.push("Edit down for better readability in Telegram.");
  }

  return {
    qualityScore: score,
    toneScore,
    structureScore,
    clicheRisk,
    safetyRisk,
    lengthStatus,
    missingSections,
    warnings,
    suggestions,
    editorialStatus
  };
}
