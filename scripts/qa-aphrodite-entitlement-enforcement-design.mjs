#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import {
  APHRODITE_ENTITLEMENT_FIELDS,
  getAphroditeEntitlementBoundaries,
  getAphroditeEntitlementNextSteps,
  getAphroditeEntitlementRules,
  getAphroditeEntitlementSurfaces,
} from "../lib/zodiac/aphrodite-entitlement-enforcement-design.ts";

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

console.log("Старт QA: дизайн проверки VIP-доступа Aphrodite...\n");

const modelPath = "../lib/zodiac/aphrodite-entitlement-enforcement-design.ts";
const dashboardPath = "../app/dashboard/networks/zodiac/entitlement-enforcement-design/page.tsx";
const docsPath = "../docs/aphrodite-entitlement-enforcement-design.md";
const reportPath = "../docs/aphrodite-package-reports/package-155.md";

check("файл модели существует", exists(modelPath));
check("dashboard-страница существует", exists(dashboardPath));
check("документация существует", exists(docsPath));
check("отчёт пакета существует", exists(reportPath));

const modelSource = exists(modelPath) ? read(modelPath) : "";
const dashboardSource = exists(dashboardPath) ? read(dashboardPath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const implementationBundle = [modelSource, dashboardSource].join("\n");
const userFacingBundle = [modelSource, dashboardSource, docsSource, reportSource].join("\n");

const surfaces = getAphroditeEntitlementSurfaces();
const rules = getAphroditeEntitlementRules();
const boundaries = getAphroditeEntitlementBoundaries();
const nextSteps = getAphroditeEntitlementNextSteps();

check("поверхности entitlement описаны", surfaces.length >= 7);
check("правила entitlement описаны", rules.length >= 9);
check("границы безопасности описаны", boundaries.length >= 9);
check("следующие шаги описаны", nextSteps.length >= 1);
check("поверхность Full Love Report существует", surfaces.some((surface) => surface.title === "Full Love Report"));
check("поверхность Birth Matrix VIP существует", surfaces.some((surface) => surface.title === "Birth Matrix VIP"));
check("поверхность Natal Chart VIP существует", surfaces.some((surface) => surface.title === "Natal Chart VIP"));
check("VIP Love Access фиксирует клиентский риск", surfaces.some((surface) => surface.id === "vip-love-access" && surface.currentClassification === "client-side-risk"));
check("будущие поля entitlement только задокументированы", APHRODITE_ENTITLEMENT_FIELDS.includes("sourcePaymentId") && APHRODITE_ENTITLEMENT_FIELDS.includes("auditReason"));
check("следующий пакет указывает на Package 156", nextSteps.some((step) => step.package === "Package 156"));

const requiredRussianBoundaries = [
  "Нет реальной VIP-разблокировки",
  "Нет оплаты",
  "Нет Telegram Stars invoice",
  "Нет successful_payment handler",
  "Нет записи в базу данных",
  "Нет миграции схемы базы данных",
  "Нет вызова Telegram API",
  "Нет production-запуска",
  "Нет клиентской VIP-разблокировки",
];

for (const label of requiredRussianBoundaries) {
  check(`русская видимая граница существует: ${label}`, boundaries.some((boundary) => boundary.label === label) && userFacingBundle.includes(label));
}

const requiredRules = [
  "Нет клиентской VIP-разблокировки",
  "Нет доверия к localStorage для VIP",
  "Нет VIP по query param",
  "Нет VIP по кнопке UI",
  "Нет доступа без server-side entitlement",
  "Нет entitlement без payment ledger",
  "Нет entitlement без owner review",
  "Нет Telegram Stars invoice в этом пакете",
  "Нет successful_payment handler в этом пакете",
];

for (const label of requiredRules) {
  check(`правило entitlement существует: ${label}`, rules.some((rule) => rule.label === label));
}

check("заголовок dashboard-страницы на русском", dashboardSource.includes("Дизайн проверки VIP-доступа"));
check("классификация dashboard-страницы видима", dashboardSource.includes("APHRODITE_ENTITLEMENT_CLASSIFICATION"));
check("dashboard показывает текущие VIP-поверхности", dashboardSource.includes("Текущие VIP-поверхности") && dashboardSource.includes("surfaces.map"));
check("dashboard показывает обязательные server-side проверки", dashboardSource.includes("Обязательные server-side проверки"));
check("dashboard показывает заблокированные клиентские обходы", dashboardSource.includes("Заблокированные клиентские обходы"));
check("dashboard показывает зависимость от payment ledger", dashboardSource.includes("Зависимость от payment ledger"));
check("dashboard показывает зависимость от owner review", dashboardSource.includes("Зависимость от owner review"));
check("dashboard использует data-boundary токены", dashboardSource.includes("data-boundary={boundary.token}"));
check("документация фиксирует отсутствие изменений активной Telegram CTA", docsSource.includes("не меняет активную Telegram CTA-логику"));
check("документация фиксирует отсутствие изменений cron/workflow/publish scripts", docsSource.includes("не меняет cron/workflow/publish scripts"));
check("документация фиксирует рабочую daily/weekly automation", docsSource.includes("Daily/weekly automation остаётся рабочей"));

check("реальный payment API не используется", !/from ['"]stripe|require\(['"]stripe|new Stripe\b|\.charges\.create|checkout\.sessions|sendInvoice\(|createInvoiceLink\(|answerPreCheckoutQuery\(/i.test(implementationBundle));
check("Telegram token не требуется", !/TELEGRAM_BOT_TOKEN|COMPATIBILITY_BOT_TOKEN|api\.telegram\.org/i.test(implementationBundle));
check("соединение с базой данных не требуется", !/DATABASE_URL|createClient\(|from\([^)]*\)\.(insert|update|delete|upsert)\(/i.test(implementationBundle));
check("Stars invoice не создаётся", !/sendInvoice\(|createInvoiceLink\(|answerPreCheckoutQuery\(/i.test(implementationBundle));
check("successful_payment handler не добавлен", !/successful_payment\s*[:=]|case\s+["']successful_payment["']|function\s+\w*successful|update\.message\.successful_payment/i.test(implementationBundle));
check("функция создания entitlement не реализована", !/function\s+create\w*Entitlement|const\s+create\w*Entitlement|export\s+function\s+create\w*Entitlement|grantVip|unlockVip|insert\w*Entitlement/i.test(implementationBundle));
check("клиентская VIP-разблокировка не добавлена", !/vipUnlocked\s*=\s*true|realVipAccess\s*=\s*true|setVipActive\(|grantVip\(|unlockVip\(|const\s+vipFreeAccess\s*=|let\s+vipFreeAccess\s*=/i.test(implementationBundle));
check("активная платёжная CTA отсутствует", !/Купить VIP|Оплатить|Разблокировать отч[её]т|Подписаться|Активировать VIP|Получить доступ после оплаты|Buy|Subscribe|Purchase|Activate VIP|Payment successful|Premium unlocked/i.test(userFacingBundle));

const changedDbFiles = gitDiffNames(["prisma", "supabase", "migrations", "schema.prisma"]).filter((file) =>
  /(^|\/)(prisma|supabase|migrations)(\/|$)|schema\.prisma$/i.test(file),
);
check("DB migration/schema файлы не изменены", changedDbFiles.length === 0);

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
