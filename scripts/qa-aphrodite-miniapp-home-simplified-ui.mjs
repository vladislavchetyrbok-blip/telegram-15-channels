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

console.log("Старт QA: упрощённый главный экран Aphrodite Mini App...\n");

const pagePath = "../app/miniapp/page.tsx";
const docsPath = "../docs/aphrodite-miniapp-home-simplified-ui.md";
const reportPath = "../docs/aphrodite-package-reports/package-198.md";

check("страница /miniapp существует", exists(pagePath));
check("документация существует", exists(docsPath));
check("отчёт пакета существует", exists(reportPath));

const pageSource = exists(pagePath) ? read(pagePath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const combined = [pageSource, docsSource, reportSource].join("\n");

check("используется shell из Package 197", pageSource.includes("AphroditeMiniAppShell"));
check("используется section card из Package 197", pageSource.includes("AphroditeSectionCard"));
check("используется primary CTA из Package 197", pageSource.includes("AphroditePrimaryCta"));
check("используется status pill из Package 197", pageSource.includes("AphroditeStatusPill"));
check("AI Love Reading виден", pageSource.includes("AI Love Reading"));
check("главный CTA AI Love Reading существует", pageSource.includes("/miniapp/love-reading-preview") && pageSource.includes("Открыть бесплатный Love Reading preview"));
check("первый CTA расположен выше вторичных модулей в JSX", pageSource.indexOf("<AphroditePrimaryCta href=\"/miniapp/love-reading-preview\"") > -1 && pageSource.indexOf("<AphroditePrimaryCta href=\"/miniapp/love-reading-preview\"") < pageSource.indexOf("<section className=\"space-y-3\""));
check("ссылка на совместимость сохранена", pageSource.includes("/compatibility?startapp=compat_love") && pageSource.includes("Совместимость"));
check("ссылка на матрицу судьбы сохранена", pageSource.includes("/birth-matrix") && pageSource.includes("Матрица судьбы"));
check("гороскоп на день виден", pageSource.includes("Гороскоп на день") && pageSource.includes("/compatibility"));
check("гороскоп на неделю виден", pageSource.includes("Гороскоп на неделю") && pageSource.includes("/compatibility?startapp=week"));
check("гороскоп на месяц виден", pageSource.includes("Гороскоп на месяц") && pageSource.includes("/compatibility?startapp=vip"));
check("ссылка на мистические числа сохранена", pageSource.includes("/mystic-numbers") && pageSource.includes("Мистические числа"));
check("ссылка на аффирмации сохранена", pageSource.includes("/affirmations") && pageSource.includes("Аффирмации"));
check("будущий VIP teaser существует", /Будущий VIP teaser|Full Love Report пока закрыт/i.test(pageSource));
check("будущий VIP teaser не является активной разблокировкой", pageSource.includes("без оплаты") && pageSource.includes("без VIP-разблокировки"));
check("границы безопасности видны", pageSource.includes("Без оплаты") && pageSource.includes("Без VIP-разблокировки") && pageSource.includes("Без Telegram API") && pageSource.includes("Без записи в базу данных") && pageSource.includes("Без production-запуска"));
check("Telegram safe area/fallback сохранены в копии", pageSource.includes("безопасные отступы Telegram") && pageSource.includes("fallback в браузере"));
check("документация указывает Package 198", docsSource.includes("Package 198"));
check("отчёт указывает Package 198", reportSource.includes("Package 198"));
check("отчёт указывает Package 199", reportSource.includes("Package 199"));

check("нет активного CTA оплаты", !/\b(buy vip now|unlock full report|pay now|subscribe now|activate vip|checkout)\b/i.test(pageSource));
check("нет внешней аналитики", !/analytics\.track|posthog|amplitude|gtag|GoogleAnalytics|sendEvent|trackEvent|navigator\.sendBeacon/i.test(pageSource));
check("нет Telegram API", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(pageSource));
check("нет записи в базу данных", !/from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(|events\.insert|insert.*event/i.test(pageSource));
check("нет реализации оплаты или VIP", !/sendInvoice\s*\(|createInvoiceLink\s*\(|paymentChangedNow:\s*true|createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|createsEntitlementNow=true|unlocksVipNow=true|grantsAccessNow=true|productionPaymentAllowedNow=true/i.test(pageSource));
check("нет изменений cron/workflow", gitDiffNames([".github/workflows", "vercel.json"]).length === 0);
check("publish scripts не изменены", gitDiffNames(["scripts/publish-zodiac-by-date.mjs", "scripts/publish-zodiac-weekly-by-week.mjs", "scripts/zodiac-telegram-publisher.mjs", "scripts/publish-due.mjs", "scripts/publish-due-json.mjs"]).length === 0);
check("package.json не изменён", gitDiffNames(["package.json"]).length === 0);
check("нет изменений схемы БД/миграций", gitDiffNames(["prisma", "supabase", "migrations", "schema.prisma"]).filter((file) => /(^|\/)(prisma|supabase|migrations)(\/|$)|schema\.prisma$/i.test(file)).length === 0);
check("документация описывает визуальное упрощение", combined.includes("AI Love Reading") && combined.includes("вторичные модули"));

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
