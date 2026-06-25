import { readFileSync, existsSync } from "node:fs";

let passed = 0, failed = 0;
function check(name, cond) {
  if (cond) { passed++; console.log("✅ PASS: " + name); }
  else { failed++; console.log("❌ FAIL: " + name); }
}
const previewUrl = new URL("../app/miniapp/love-reading-preview/page.tsx", import.meta.url);
const hubUrl = new URL("../app/miniapp/page.tsx", import.meta.url);

console.log("Starting Aphrodite Love Reading Preview Real UI QA...\n");

check("preview route/page exists", existsSync(previewUrl));
const preview = readFileSync(previewUrl, "utf8");
const hub = readFileSync(hubUrl, "utf8");

check("first screen links to preview route", /href="\/miniapp\/love-reading-preview"/.test(hub));
check("visible title includes 'AI Love Reading'", preview.includes("AI Love Reading"));
check("visible promise includes 'Узнай, что между вами происходит'", preview.includes("Узнай, что между вами происходит"));
check("preview includes 'Главная энергия'", preview.includes("Главная энергия"));
check("preview includes 'Сильная сторона'", preview.includes("Сильная сторона"));
check("preview includes 'Зона риска'", preview.includes("Зона риска"));
check("preview includes 'Следующий шаг'", preview.includes("Следующий шаг"));
check("preview includes 'Нет оплаты'", preview.includes("Нет оплаты"));
check("preview includes 'Нет реальной VIP-разблокировки'", preview.includes("Нет реальной VIP-разблокировки"));
check("preview includes 'Нет вязова Telegram API' (RU label)", preview.includes("Нет вызова Telegram API"));
check("uses existing local model (createAphroditeLoveReadingFoundationPreview)", /createAphroditeLoveReadingFoundationPreview/.test(preview));

// No active payment CTA (RU + EN)
check("no active payment CTA (RU)", !/Купить VIP|Разблокировать отчёт|Оплатить|Подписаться|Активировать VIP/.test(preview));
check("no active payment CTA (EN)", !/\b(buy vip|unlock full report|pay now|subscribe now|activate vip|checkout)\b/i.test(preview));

// No live integrations
check("no Telegram token required", !/TELEGRAM_BOT_TOKEN|api\.telegram\.org|sendMessage\(/i.test(preview));
check("no database connection required", !/DATABASE_URL|createClient\(|supabase|new Pool\(/i.test(preview));
check("no external AI API used", !/OPENAI_API_KEY|ANTHROPIC_API_KEY|api\.openai\.com|new OpenAI\(|new Anthropic\(/i.test(preview));
check("no external fetch / scraping", !/\bfetch\(|axios|puppeteer|playwright/i.test(preview));
check("no payment API introduced", !/from ['"]stripe|new Stripe\b|sendInvoice\(|createInvoiceLink\(|successful_payment/i.test(preview));
check("does not reference workflow/cron/publish files", !/\.github\/workflows|node-cron|cron\.schedule|publish-ledger/i.test(preview));

// Secondary modules still present on hub
check("hub keeps Compatibility", /Compatibility/i.test(hub));
check("hub keeps Birth Matrix / Матрица судьбы", /Birth Matrix|Матрица судьбы|birth-matrix/i.test(hub));
check("hub keeps Mystic Numbers / Mystic Cards", /Mystic Numbers|Mystic Cards|mystic-numbers/i.test(hub));

console.log("\nQA Finished: " + passed + " passed, " + failed + " failed.");
if (failed > 0) process.exit(1);
