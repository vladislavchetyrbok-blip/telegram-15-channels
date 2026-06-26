#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  buildZodiacCompatibilityPersonalizedCopy,
  normalizeZodiacCompatibilityCopyPhrase,
} from "../lib/zodiac-compatibility-copy-personalization.ts";
import { buildPersonalizedCoupleCalendar } from "../lib/zodiac-couple-calendar-personalization.ts";

let passed = 0;
let failed = 0;

function check(name, condition) {
  if (condition) {
    passed += 1;
    console.log("УСПЕХ: " + name);
  } else {
    failed += 1;
    console.log("ОШИБКА: " + name);
  }
}

function read(rel) {
  return readFileSync(new URL(rel, import.meta.url), "utf8");
}

function gitDiffNames(paths) {
  try {
    const output = execFileSync("git", ["diff", "--name-only", "HEAD", "--", ...paths], { encoding: "utf8" });
    return output.split(/\r?\n/).filter(Boolean);
  } catch {
    return ["__git_diff_failed__"];
  }
}

function gitDiffAddedLines(paths) {
  try {
    const output = execFileSync("git", ["diff", "--unified=0", "HEAD", "--", ...paths], { encoding: "utf8" });
    return output
      .split(/\r?\n/)
      .filter((line) => line.startsWith("+") && !line.startsWith("+++"))
      .map((line) => line.slice(1))
      .join("\n");
  } catch {
    return "__git_diff_failed__";
  }
}

function stable(value) {
  return JSON.stringify(value);
}

function copyFor(input) {
  return buildZodiacCompatibilityPersonalizedCopy({
    firstName: "Алиса",
    secondName: "Марк",
    firstBirthDate: "15.06.1998",
    secondBirthDate: "01.01.1990",
    firstSign: "aries",
    secondSign: "libra",
    relationshipMode: "love",
    scoreProfile: {
      total: 72,
      attraction: 76,
      communication: 61,
      love: 74,
      household: 58,
    },
    ...input,
  });
}

function flattenCopy(copy) {
  return [
    copy.riskIntro,
    ...copy.riskLines,
    copy.communicationTitle,
    copy.communicationInsight,
    ...copy.communicationAdvice,
    ...copy.boundaries,
    copy.emotionalFocus,
    copy.nextStep,
  ].filter(Boolean);
}

function duplicateNormalizedLines(lines) {
  const seen = new Map();
  const duplicates = [];
  for (const line of lines) {
    const normalized = normalizeZodiacCompatibilityCopyPhrase(line);
    if (!normalized) continue;
    const count = seen.get(normalized) ?? 0;
    if (count > 0) duplicates.push(line);
    seen.set(normalized, count + 1);
  }
  return duplicates;
}

function signature(copy, key) {
  return Array.isArray(copy[key]) ? copy[key].join("\n") : String(copy[key] ?? "");
}

function jaccardSimilarity(leftText, rightText) {
  const left = new Set(normalizeZodiacCompatibilityCopyPhrase(leftText).split(" ").filter((token) => token.length > 2));
  const right = new Set(normalizeZodiacCompatibilityCopyPhrase(rightText).split(" ").filter((token) => token.length > 2));
  if (!left.size || !right.size) return 0;
  const intersection = [...left].filter((token) => right.has(token)).length;
  const union = new Set([...left, ...right]).size;
  return intersection / union;
}

function oldPhraseCount(copy) {
  const normalized = flattenCopy(copy).map(normalizeZodiacCompatibilityCopyPhrase).join("\n");
  const phrase = normalizeZodiacCompatibilityCopyPhrase("не стоит спорить за лидерство там где помогает партнёрство");
  return normalized.split(phrase).length - 1;
}

function calendarSignature(days) {
  return days.map((day) => [day.title, day.coupleInsight, day.riskZone, day.recommendedAction, day.advice].join("|")).join("\n");
}

console.log("Старт QA: персонализация текста совместимости Zodiac Mini App...\n");

const base = copyFor();
const same = copyFor();
const otherSigns = copyFor({ firstSign: "taurus", secondSign: "scorpio" });
const otherDates = copyFor({ firstBirthDate: "31.12.1985", secondBirthDate: "01.01.2000" });
const otherNames = copyFor({ firstName: "Ирина", secondName: "Даниил" });
const otherMode = copyFor({ relationshipMode: "reconciliation" });
const scoreShift = copyFor({ scoreProfile: { total: 52, attraction: 49, communication: 44, love: 57, household: 60 } });

check("одинаковые inputs дают стабильный результат", stable(base) === stable(same));
check("разные знаки меняют risk cards", signature(base, "riskLines") !== signature(otherSigns, "riskLines"));
check("разные знаки меняют communication cards", signature(base, "communicationAdvice") !== signature(otherSigns, "communicationAdvice"));
check("разные даты рождения меняют copy", stable(base) !== stable(otherDates));
check("разные имена меняют copy", stable(base) !== stable(otherNames));
check("разный relationshipMode меняет copy", stable(base) !== stable(otherMode));
check("разный scoreProfile меняет copy", stable(base) !== stable(scoreShift));
check("внутри одного результата нет дублей фраз", duplicateNormalizedLines(flattenCopy(base)).length === 0);
check("riskLines не дублируются", duplicateNormalizedLines(base.riskLines).length === 0);
check("communicationAdvice не дублируется", duplicateNormalizedLines(base.communicationAdvice).length === 0);
check("boundaries не дублируются", duplicateNormalizedLines(base.boundaries).length === 0);
check("старая фраза про лидерство не повторяется в новом copy", oldPhraseCount(base) <= 1);

const pairInputs = [
  ["aries", "libra"],
  ["taurus", "scorpio"],
  ["gemini", "sagittarius"],
  ["cancer", "capricorn"],
  ["leo", "aquarius"],
  ["virgo", "pisces"],
];
const pairCopies = pairInputs.map(([firstSign, secondSign], index) =>
  copyFor({
    firstSign,
    secondSign,
    firstName: `Пара${index + 1}A`,
    secondName: `Пара${index + 1}B`,
  }),
);
const riskSignatures = new Set(pairCopies.map((copy) => signature(copy, "riskLines")));
const adviceSignatures = new Set(pairCopies.map((copy) => signature(copy, "communicationAdvice")));
const wholeSignatures = new Set(pairCopies.map((copy) => flattenCopy(copy).join("\n")));
check("одни и те же 3 risk cards не используются для всех пар", riskSignatures.size >= 5);
check("одни и те же 3 advice cards не используются для всех пар", adviceSignatures.size >= 5);
check("каждая тестовая пара получает отличающийся результат", wholeSignatures.size === pairCopies.length);
check("сходство разных sign-pair результатов ниже порога", jaccardSimilarity(flattenCopy(pairCopies[0]).join(" "), flattenCopy(pairCopies[1]).join(" ")) < 0.72);

const helperSource = read("../lib/zodiac-compatibility-copy-personalization.ts");
const compatibilitySource = read("../components/ZodiacCompatibilityMiniApp.tsx");
const resultCardsSource = read("../components/zodiac-mini-app/ResultCards.tsx");
const typesSource = read("../components/zodiac-mini-app/types.ts");

check("helper файл существует", existsSync(new URL("../lib/zodiac-compatibility-copy-personalization.ts", import.meta.url)));
check("helper экспортирует buildZodiacCompatibilityPersonalizedCopy", helperSource.includes("buildZodiacCompatibilityPersonalizedCopy"));
check("helper экспортирует normalizeZodiacCompatibilityCopyPhrase", helperSource.includes("normalizeZodiacCompatibilityCopyPhrase"));
check("seed учитывает firstName", helperSource.includes("input.firstName"));
check("seed учитывает secondName", helperSource.includes("input.secondName"));
check("seed учитывает firstBirthDate", helperSource.includes("input.firstBirthDate"));
check("seed учитывает secondBirthDate", helperSource.includes("input.secondBirthDate"));
check("seed учитывает firstSign", helperSource.includes("input.firstSign"));
check("seed учитывает secondSign", helperSource.includes("input.secondSign"));
check("seed учитывает relationshipMode", helperSource.includes("input.relationshipMode"));
check("seed учитывает scoreProfile", helperSource.includes("scoreProfileSeed"));
check("helper использует section-specific выбор", helperSource.includes(":${section}:"));
check("helper не использует Math.random", !helperSource.includes("Math.random"));
check("Mini App result builder использует новый helper", compatibilitySource.includes("buildZodiacCompatibilityPersonalizedCopy({"));
check("CompatibilityResult содержит personalizedCopy", typesSource.includes("personalizedCopy: ZodiacCompatibilityPersonalizedCopy"));
check("ResultCards используют personalized riskLines", resultCardsSource.includes("result.personalizedCopy.riskLines"));
check("ResultCards используют personalized communicationAdvice", resultCardsSource.includes("result.personalizedCopy.communicationAdvice"));
check("ResultCards используют personalized boundaries", resultCardsSource.includes("result.personalizedCopy.boundaries"));
check("старые hardcoded risk cards убраны из ResultCards", !/Не спорить на усталости: сначала пауза, потом одна конкретная тема\.|Не проверять чувства молчанием: лучше назвать ожидание прямо и коротко\.|Не превращать \$\{result\.relationshipModeLabel\.toLowerCase\(\)\} в экзамен/.test(resultCardsSource));

const calendarBase = buildPersonalizedCoupleCalendar({
  firstName: "Алиса",
  secondName: "Марк",
  firstBirthDate: "15.06.1998",
  secondBirthDate: "01.01.1990",
  firstSign: "aries",
  secondSign: "libra",
  relationshipMode: "love",
  startDate: "2026-06-20",
  count: 5,
  scoreTotal: 72,
  scoreLove: 74,
  scoreCommunication: 61,
  scoreAttraction: 76,
});
const calendarOther = buildPersonalizedCoupleCalendar({
  firstName: "Ирина",
  secondName: "Даниил",
  firstBirthDate: "31.12.1985",
  secondBirthDate: "01.01.2000",
  firstSign: "taurus",
  secondSign: "scorpio",
  relationshipMode: "love",
  startDate: "2026-06-20",
  count: 5,
  scoreTotal: 72,
  scoreLove: 74,
  scoreCommunication: 61,
  scoreAttraction: 76,
});
check("existing couple calendar personalization не сломан: создаёт дни", calendarBase.length === 5 && calendarBase.every((day) => day.dayNumber && day.coupleInsight && day.riskZone));
check("existing couple calendar personalization не сломан: разные пары отличаются", calendarSignature(calendarBase) !== calendarSignature(calendarOther));

const runtimeAddedLines = gitDiffAddedLines([
  "components/ZodiacCompatibilityMiniApp.tsx",
  "components/zodiac-mini-app/ResultCards.tsx",
  "components/zodiac-mini-app/types.ts",
  "lib/zodiac-compatibility-copy-personalization.ts",
]);
const runtimeSafetyBundle = [runtimeAddedLines, helperSource].join("\n");
check("нет payment API", !/from ['"]stripe|new Stripe\b|sendInvoice\(|createInvoiceLink|successful_payment|pre_checkout_query|answerPreCheckoutQuery/i.test(runtimeSafetyBundle));
check("нет Telegram API", !/TELEGRAM_BOT_TOKEN|api\.telegram\.org|sendMessage\(|sendPhoto\(|sendInvoice\(/i.test(runtimeSafetyBundle));
check("нет database write", !/DATABASE_URL|createClient\(|new Pool\(|\.(insert|update|delete|upsert)\s*\(/i.test(runtimeSafetyBundle));
check("нет real VIP unlock", !/grantVip|unlockVip|setVipActive|vipUnlocked\s*=\s*true|realVipAccess\s*=\s*true|createsEntitlementNow\s*:\s*true|grantsAccessNow\s*:\s*true|unlocksVipNow\s*:\s*true/i.test(runtimeSafetyBundle));

const restrictedChangedFiles = gitDiffNames([".github/workflows", "package.json", "prisma", "supabase"]);
check("workflows/package/db schema не изменены", restrictedChangedFiles.length === 0);

const scriptChanges = gitDiffNames(["scripts"]);
const allowedScriptChanges = new Set(["scripts/qa-zodiac-compatibility-copy-personalization.mjs"]);
check("cron/publish scripts не изменены", scriptChanges.every((file) => allowedScriptChanges.has(file)) && !scriptChanges.some((file) => /publish|cron|workflow/i.test(file)));

console.log("\nQA завершён: " + passed + " успехов, " + failed + " ошибок.");
if (failed > 0) process.exit(1);
