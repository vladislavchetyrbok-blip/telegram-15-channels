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

console.log("Старт QA: визуальный апгрейд Love Reading preview...\n");

const pagePath = "../app/miniapp/love-reading-preview/page.tsx";
const docsPath = "../docs/aphrodite-love-reading-preview-visual-upgrade.md";
const reportPath = "../docs/aphrodite-package-reports/package-199.md";

check("страница /miniapp/love-reading-preview существует", exists(pagePath));
check("документация Package 199 существует", exists(docsPath));
check("отчёт Package 199 существует", exists(reportPath));

const pageSource = exists(pagePath) ? read(pagePath) : "";
const docsSource = exists(docsPath) ? read(docsPath) : "";
const reportSource = exists(reportPath) ? read(reportPath) : "";
const combined = [pageSource, docsSource, reportSource].join("\n");

check("используется shell из Package 197", pageSource.includes("AphroditeMiniAppShell"));
check("используется section card из Package 197", pageSource.includes("AphroditeSectionCard"));
check("используется primary CTA из Package 197", pageSource.includes("AphroditePrimaryCta"));
check("используется status pill из Package 197", pageSource.includes("AphroditeStatusPill"));
check("бесплатный preview виден", pageSource.includes("Бесплатный preview") && pageSource.includes("Четыре коротких блока без оплаты"));
check("Full Love Report остаётся будущим и закрытым", pageSource.includes("Full Love Report пока закрыт") && pageSource.includes("Preview будущего Full Love Report без доступа"));
check("раздел Главная энергия связи существует", pageSource.includes("Главная энергия связи"));
check("раздел Сильная сторона существует", pageSource.includes("Сильная сторона"));
check("раздел Зона риска существует", pageSource.includes("Зона риска"));
check("раздел Следующий шаг существует", pageSource.includes("Следующий шаг"));
check("визуальная группировка результата стала карточной", pageSource.includes("<article") && pageSource.includes("Ваш preview") && pageSource.includes("4 блока"));
check("главное действие ведёт к совместимости, а не к оплате", pageSource.includes("Проверить совместимость") && pageSource.includes('href="/compatibility"'));
check("возврат в Mini App сохранён", pageSource.includes("Вернуться к модулям") && pageSource.includes('href="/miniapp"'));
check("границы безопасности видны", pageSource.includes("Нет оплаты") && pageSource.includes("Нет реальной VIP-разблокировки") && pageSource.includes("Нет вызова Telegram API") && pageSource.includes("Нет записи в базу данных"));
check("текст не содержит жёсткого пророчества", !/точно|гарантированно|навсегда|судьба решена|он точно|она точно/i.test(pageSource));
check("документация описывает визуальный апгрейд", docsSource.includes("визуальный апгрейд") && docsSource.includes("бесплатный preview"));
check("отчёт указывает Package 199", reportSource.includes("Package 199"));
check("отчёт указывает Package 200", reportSource.includes("Package 200"));

check("нет активного CTA оплаты", !/Купить|Оплатить|Перейти к оплате|Разблокировать отч[её]т|Подписаться|Активировать VIP|checkout|pay now|buy vip now/i.test(pageSource));
check("нет sendInvoice", !/sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(|successful_payment|pre_checkout_query/i.test(pageSource));
check("нет Telegram API", !/fetch\([^)]*api\.telegram\.org|TELEGRAM_BOT_TOKEN|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(/i.test(pageSource));
check("нет записи в базу данных", !/DATABASE_URL|createClient\s*\(|new Pool\s*\(|from\([^)]*\)\.(insert|update|delete|upsert)\(|\.insert\s*\(|\.update\s*\(|\.delete\s*\(|\.upsert\s*\(|events\.insert|insert.*event/i.test(pageSource));
check("нет реализации VIP-разблокировки", !/createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|createsEntitlementNow=true|unlocksVipNow=true|grantsAccessNow=true|vipUnlocked\s*=\s*true/i.test(pageSource));
check("нет внешней аналитики", !/analytics\.track|posthog|amplitude|gtag|GoogleAnalytics|sendEvent|trackEvent|navigator\.sendBeacon/i.test(pageSource));
check("noop-only integration points сохранены", pageSource.includes("recordAphroditeMiniAppNoopIntegrationPoint") && !pageSource.includes("emitAphroditeMiniAppAnalyticsNoopEvent"));
check("нет изменений workflow/cron", gitDiffNames([".github/workflows", "vercel.json"]).length === 0);
check("publish scripts не изменены", gitDiffNames(["scripts/publish-zodiac-by-date.mjs", "scripts/publish-zodiac-weekly-by-week.mjs", "scripts/zodiac-telegram-publisher.mjs", "scripts/publish-due.mjs", "scripts/publish-due-json.mjs"]).length === 0);
check("package.json не изменён", gitDiffNames(["package.json"]).length === 0);
check("нет изменений схемы БД/миграций", gitDiffNames(["prisma", "supabase", "migrations", "schema.prisma"]).filter((file) => /(^|\/)(prisma|supabase|migrations)(\/|$)|schema\.prisma$/i.test(file)).length === 0);
check("общий пакетный текст на русском", combined.includes("Бесплатный preview") && combined.includes("Нет оплаты") && combined.includes("Нет вызова Telegram API"));

console.log(`\nQA завершён: ${passed} успешно, ${failed} ошибок.`);
if (failed > 0) process.exit(1);
