#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { parseBirthDateInput } from "../lib/zodiac-birth-date-range.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

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

function read(relPath) {
  return readFileSync(join(root, relPath), "utf8");
}

function exists(relPath) {
  return existsSync(join(root, relPath));
}

function gitDiffNames(paths) {
  try {
    const output = execFileSync("git", ["diff", "--name-only", "HEAD", "--", ...paths], {
      cwd: root,
      encoding: "utf8",
    });
    return output.split(/\r?\n/).filter(Boolean);
  } catch {
    return ["__git_diff_failed__"];
  }
}

function gitDiffAddedLines(paths) {
  try {
    const output = execFileSync("git", ["diff", "--unified=0", "HEAD", "--", ...paths], {
      cwd: root,
      encoding: "utf8",
    });
    return output
      .split(/\r?\n/)
      .filter((line) => line.startsWith("+") && !line.startsWith("+++"))
      .map((line) => line.slice(1))
      .join("\n");
  } catch {
    return "__git_diff_failed__";
  }
}

function runQaScript(scriptName) {
  const scriptPath = join(__dirname, scriptName);
  if (!existsSync(scriptPath)) return false;

  try {
    execFileSync(process.execPath, ["--experimental-strip-types", scriptPath], {
      cwd: root,
      encoding: "utf8",
      stdio: "pipe",
    });
    return true;
  } catch {
    return false;
  }
}

function parsesAsIso(value, iso) {
  const parsed = parseBirthDateInput(value, {
    emptyError: "Введите дату в формате ДД.ММ.ГГГГ.",
    rangeError: "Дата должна быть в диапазоне 1900 — сегодня.",
  });
  return parsed.ok && parsed.iso === iso;
}

function rejects(value) {
  const parsed = parseBirthDateInput(value, {
    emptyError: "Введите дату в формате ДД.ММ.ГГГГ.",
    rangeError: "Дата должна быть в диапазоне 1900 — сегодня.",
  });
  return !parsed.ok;
}

console.log("Старт QA: визуальный апгрейд Матрицы судьбы Package 201...\n");

const birthMatrixPath = "app/birth-matrix/BirthMatrixClient.tsx";
const pagePath = "app/birth-matrix/page.tsx";
const miniAppPath = "app/miniapp/page.tsx";
const dateInputPath = "components/zodiac-mini-app/ZodiacDateInput.tsx";
const dateRangePath = "lib/zodiac-birth-date-range.ts";
const docsPath = "docs/aphrodite-birth-matrix-visual-upgrade.md";
const reportPath = "docs/aphrodite-package-reports/package-201.md";

check("/birth-matrix client существует", exists(birthMatrixPath));
check("/birth-matrix route существует", exists(pagePath));
check("Mini App hub существует", exists(miniAppPath));
check("общий ZodiacDateInput существует", exists(dateInputPath));
check("общий birth-date helper существует", exists(dateRangePath));

const birthMatrixSource = exists(birthMatrixPath) ? read(birthMatrixPath) : "";
const pageSource = exists(pagePath) ? read(pagePath) : "";
const miniAppSource = exists(miniAppPath) ? read(miniAppPath) : "";
const dateInputSource = exists(dateInputPath) ? read(dateInputPath) : "";
const dateRangeSource = exists(dateRangePath) ? read(dateRangePath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";

check("экран содержит заголовок Матрица судьбы", birthMatrixSource.includes("Матрица судьбы"));
check("экран содержит обещание результата", birthMatrixSource.includes("Узнай главные энергии даты рождения и то, что стоит развивать."));
check("карточка даты содержит Дата рождения", birthMatrixSource.includes("Дата рождения"));
check("helper показывает формат ДД.ММ.ГГГГ", birthMatrixSource.includes("Формат: ДД.ММ.ГГГГ"));
check("helper показывает пример 15.06.1998", birthMatrixSource.includes("Например: 15.06.1998"));
check("ошибка формата закреплена", birthMatrixSource.includes("Введите дату в формате ДД.ММ.ГГГГ."));
check("ошибка диапазона закреплена", birthMatrixSource.includes("Дата должна быть в диапазоне 1900 — сегодня."));
check("scope birth-matrix сохранён", birthMatrixSource.includes('birthDateScope="birth-matrix"'));
check("runtime-маркер сохранён в общем input", dateInputSource.includes("data-birth-date-ui={isBirthDate ? BIRTH_DATE_UI_MARKER : undefined}") && dateRangeSource.includes('BIRTH_DATE_UI_MARKER = "v2-global-1900-today"'));
check("birth-date input остаётся type=text", dateInputSource.includes('type="text"') && !/type\s*=\s*["']date["']/.test(dateInputSource));
check("/birth-matrix не содержит native type=date", !/type\s*=\s*["']date["']/.test(birthMatrixSource));
check("результат содержит Главная энергия", birthMatrixSource.includes("Главная энергия"));
check("результат содержит Сильная сторона", birthMatrixSource.includes("Сильная сторона"));
check("результат содержит Зона роста", birthMatrixSource.includes("Зона роста"));
check("результат содержит Следующий шаг", birthMatrixSource.includes("Следующий шаг"));
check("результат содержит подробный блок без стены текста", birthMatrixSource.includes("Энергии даты") && birthMatrixSource.includes("без длинного полотна текста"));
check("будущий teaser безопасный и без CTA оплаты", birthMatrixSource.includes("Будущая полная версия") && birthMatrixSource.includes("без оплаты") && !/href=["'][^"']*(pay|checkout|stars|invoice)/i.test(birthMatrixSource));
check("ссылка Mini App → Birth Matrix сохранена", miniAppSource.includes("/birth-matrix"));
check("metadata /birth-matrix русская", pageSource.includes('title: "Матрица судьбы"') && pageSource.includes("Короткий разбор главных энергий даты рождения"));
check("route сохраняет noop integration point", pageSource.includes('recordAphroditeMiniAppNoopIntegrationPoint("route-birth-matrix-opened")'));

check("дата 15.06.1998 поддерживается", parsesAsIso("15.06.1998", "1998-06-15"));
check("дата 15061998 поддерживается", parsesAsIso("15061998", "1998-06-15"));
check("дата 1998-06-15 поддерживается", parsesAsIso("1998-06-15", "1998-06-15"));
check("дата 01.01.1990 поддерживается", parsesAsIso("01.01.1990", "1990-01-01"));
check("дата 31.12.1985 поддерживается", parsesAsIso("31.12.1985", "1985-12-31"));
check("дата 1900-01-01 поддерживается", parsesAsIso("1900-01-01", "1900-01-01"));
check("дата раньше 1900 отклоняется", rejects("1899-12-31"));
check("будущая дата отклоняется", rejects("2099-01-01"));

const runtimeAddedLines = gitDiffAddedLines([
  "app/birth-matrix",
  "components/zodiac-mini-app",
  "lib/zodiac-birth-date-range.ts",
]);
check("в добавленном runtime нет платёжных API", !/from ['"]stripe|new Stripe\b|sendInvoice\s*\(|createInvoiceLink|successful_payment|pre_checkout_query|answerPreCheckoutQuery/i.test(runtimeAddedLines));
check("в добавленном runtime нет Telegram API вызовов", !/TELEGRAM_BOT_TOKEN|api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendInvoice\s*\(/i.test(runtimeAddedLines));
check("в добавленном runtime нет записи в БД", !/DATABASE_URL|createClient\s*\(|new Pool\s*\(|\.(insert|update|delete|upsert)\s*\(/i.test(runtimeAddedLines));
check("в добавленном runtime нет реальной VIP-разблокировки", !/createEntitlement\s*\(|grantVip|unlockVip|setVipActive|vipUnlocked\s*=\s*true|realVipAccess\s*=\s*true|createsEntitlementNow\s*:\s*true|grantsAccessNow\s*:\s*true|unlocksVipNow\s*:\s*true/i.test(runtimeAddedLines));
check("в добавленном runtime нет активных payment CTA", !/Купить|Оплатить|Подписаться|Разблокировать|Buy\s|Subscribe\s|Unlock\s|Pay\s|Purchase\s|Activate VIP|checkout|pay now/i.test(runtimeAddedLines));

const protectedChanges = gitDiffNames([".github/workflows", "package.json", "prisma", "supabase"]);
check("workflows/package/db schema не изменены", protectedChanges.length === 0);

const scriptChanges = gitDiffNames(["scripts"]);
const allowedScriptChanges = new Set([
  relative(root, join(__dirname, "qa-aphrodite-birth-matrix-visual-upgrade.mjs")).replace(/\\/g, "/"),
  "scripts/qa-zodiac-birth-date-no-jump-input.mjs",
]);
check("cron/publish scripts не изменены", scriptChanges.every((file) => allowedScriptChanges.has(file)) && !scriptChanges.some((file) => /publish|cron|workflow/i.test(file)));

check("документация Package 201 существует", exists(docsPath));
check("отчёт Package 201 существует", exists(reportPath));
check("документация описывает визуальный апгрейд", /визуальный апгрейд/i.test(docsSource) && docsSource.includes("Матрица судьбы"));
check("документация фиксирует сохранение date input", docsSource.includes("data-birth-date-ui") && docsSource.includes("ДД.ММ.ГГГГ"));
check("документация фиксирует запрет платежей и DB/Telegram изменений", /без оплаты/i.test(docsSource) && /без Telegram API/i.test(docsSource) && /без записи в базу/i.test(docsSource));
check("отчёт указывает Package 201", reportSource.includes("Package 201"));
check("отчёт не начинает Package 202", reportSource.includes("Package 202 не начат"));

check("старый no-jump birth-date QA проходит", runQaScript("qa-zodiac-birth-date-no-jump-input.mjs"));
check("старый runtime birth-date QA проходит", runQaScript("qa-zodiac-birth-date-runtime-ui-fix.mjs"));
check("старый global range birth-date QA проходит", runQaScript("qa-zodiac-global-birth-date-input-ranges.mjs"));

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
