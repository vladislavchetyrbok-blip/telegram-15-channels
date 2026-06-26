#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

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

function exists(rel) {
  return existsSync(new URL(rel, import.meta.url));
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

console.log("Старт QA: визуальный апгрейд результата совместимости...\n");

const resultCardsPath = "../components/zodiac-mini-app/ResultCards.tsx";
const miniAppPath = "../components/ZodiacCompatibilityMiniApp.tsx";
const dateInputPath = "../components/zodiac-mini-app/ZodiacDateInput.tsx";
const docsPath = "../docs/aphrodite-compatibility-result-visual-upgrade.md";
const reportPath = "../docs/aphrodite-package-reports/package-200.md";

check("ResultCards существует", exists(resultCardsPath));
check("ZodiacCompatibilityMiniApp существует", exists(miniAppPath));
check("общий ZodiacDateInput существует", exists(dateInputPath));
check("документация Package 200 существует", exists(docsPath));
check("отчёт Package 200 существует", exists(reportPath));

const resultCardsSource = exists(resultCardsPath) ? read(resultCardsPath) : "";
const miniAppSource = exists(miniAppPath) ? read(miniAppPath) : "";
const dateInputSource = exists(dateInputPath) ? read(dateInputPath) : "";
const birthDateRangeSource = read("../lib/zodiac-birth-date-range.ts");
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const addedRuntimeLines = gitDiffAddedLines([
  "components/zodiac-mini-app/ResultCards.tsx",
  "components/ZodiacCompatibilityMiniApp.tsx",
  "components/zodiac-mini-app/ZodiacDateInput.tsx",
]);
const runtimeSafetyBundle = [resultCardsSource, addedRuntimeLines].join("\n");

check("визуальный result panel сохранён", resultCardsSource.includes("export function ResultPanel"));
check("score ring сохранён", resultCardsSource.includes("RelationshipScoreRing"));
check("score tiles улучшены и видимы", resultCardsSource.includes("scoreHighlights") && resultCardsSource.includes("QuickMetric") && resultCardsSource.includes("value={item.value}"));
check("ScoreBar сохранён для подробных оценок", resultCardsSource.includes("export function ScoreBar"));
check("новая компактная сетка инсайтов добавлена", resultCardsSource.includes("ResultInsightGrid") && resultCardsSource.includes("strengthInsights"));
check("раздел рисков существует", resultCardsSource.includes('id="relationship-risks"') && resultCardsSource.includes("Риски"));
check("раздел как общаться существует", resultCardsSource.includes('id="relationship-talk"') && resultCardsSource.includes("Как общаться"));
check("раздел действие сегодня существует", resultCardsSource.includes('id="relationship-action"') && resultCardsSource.includes("Действие сегодня"));
check("30 дней пары сохранены", resultCardsSource.includes('id="relationship-calendar"') && resultCardsSource.includes("30 дней"));
check("персонализированные riskLines используются", resultCardsSource.includes("result.personalizedCopy.riskLines"));
check("персонализированные communicationAdvice используются", resultCardsSource.includes("result.personalizedCopy.communicationAdvice"));
check("персонализированные boundaries используются", resultCardsSource.includes("result.personalizedCopy.boundaries"));
check("персонализированный nextStep используется", resultCardsSource.includes("result.personalizedCopy.nextStep"));
check("Mini App result builder использует personalized copy helper", miniAppSource.includes("buildZodiacCompatibilityPersonalizedCopy({"));
check("date input marker сохранён", dateInputSource.includes("data-birth-date-ui={isBirthDate ? BIRTH_DATE_UI_MARKER") && birthDateRangeSource.includes("v2-global-1900-today"));
check("date input остаётся type text", dateInputSource.includes('type="text"') && !dateInputSource.includes('type="date"'));
check("дата 15.06.1998 остаётся в date QA/source", dateInputSource.includes("15.06.1998") || birthDateRangeSource.includes("15.06.1998"));
check("старые hardcoded repeated risk cards не возвращены", !/Не спорить на усталости: сначала пауза, потом одна конкретная тема\.|Не проверять чувства молчанием: лучше назвать ожидание прямо и коротко\.|Не превращать \$\{result\.relationshipModeLabel\.toLowerCase\(\)\} в экзамен/.test(resultCardsSource));
check("emoji-текст в заголовках score/overview убран", !/✨ Обзор|🔥 Притяжение|💬 Общение/.test(resultCardsSource));
check("документация описывает визуальный апгрейд", docsSource.includes("визуальный апгрейд") && docsSource.includes("результата совместимости"));
check("отчёт указывает Package 200", reportSource.includes("Package 200"));
check("отчёт не запускает Package 201", reportSource.includes("Package 201 не начат"));

check("нет активного CTA оплаты", !/Купить|Оплатить|Перейти к оплате|Разблокировать отч[её]т|Подписаться|Активировать VIP|checkout|pay now|buy vip now/i.test(runtimeSafetyBundle));
check("нет payment API", !/from ['"]stripe|new Stripe\b|sendInvoice\s*\(|createInvoiceLink|successful_payment|pre_checkout_query|answerPreCheckoutQuery/i.test(runtimeSafetyBundle));
check("нет Telegram API", !/TELEGRAM_BOT_TOKEN|api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendInvoice\s*\(/i.test(runtimeSafetyBundle));
check("нет database write", !/DATABASE_URL|createClient\s*\(|new Pool\s*\(|\.(insert|update|delete|upsert)\s*\(/i.test(runtimeSafetyBundle));
check("нет real VIP unlock", !/createEntitlement\s*\(|grantVip|unlockVip|setVipActive|vipUnlocked\s*=\s*true|realVipAccess\s*=\s*true|createsEntitlementNow\s*:\s*true|grantsAccessNow\s*:\s*true|unlocksVipNow\s*:\s*true/i.test(runtimeSafetyBundle));
check("нет внешней аналитики", !/analytics\.track|posthog|amplitude|gtag|GoogleAnalytics|sendEvent|trackEvent|navigator\.sendBeacon/i.test(runtimeSafetyBundle));
check("workflows/package/db schema не изменены", gitDiffNames([".github/workflows", "package.json", "prisma", "supabase"]).length === 0);

const scriptChanges = gitDiffNames(["scripts"]);
const allowedScriptChanges = new Set([
  "scripts/qa-aphrodite-compatibility-result-visual-upgrade.mjs",
  "scripts/qa-aphrodite-miniapp-simplified-redesign-implementation-plan.mjs",
  "scripts/qa-zodiac-compatibility-copy-personalization.mjs",
  "scripts/qa-zodiac-vip-couple-calendar-personalization.mjs",
]);
check("cron/publish scripts не изменены", scriptChanges.every((file) => allowedScriptChanges.has(file)) && !scriptChanges.some((file) => /publish|cron|workflow/i.test(file)));

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
