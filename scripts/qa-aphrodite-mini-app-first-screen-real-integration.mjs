import { readFileSync, existsSync } from "node:fs";

let passed = 0, failed = 0;
function check(name, cond) {
  if (cond) {
    passed++;
    console.log("УСПЕХ: " + name);
  } else {
    failed++;
    console.log("ОШИБКА: " + name);
  }
}

const FIRST_SCREEN = new URL("../app/miniapp/page.tsx", import.meta.url);
console.log("Старт QA: первый экран Aphrodite Mini App...\n");

check("файл первого экрана существует", existsSync(FIRST_SCREEN));
const src = readFileSync(FIRST_SCREEN, "utf8");

check("первый экран содержит AI Love Reading", src.includes("AI Love Reading"));
check("первый экран содержит обещание: Узнай, что между вами происходит", src.includes("Узнай, что между вами происходит"));
check("первый экран содержит безопасную копию бесплатного preview", /бесплатн(?:ый|ого).*preview|Только бесплатный preview/i.test(src));
check("структура бесплатного preview сохранена: энергия / сила / риск / шаг",
  /Главная энергия/i.test(src) && /Сильная сторона/i.test(src) && /Зона риска/i.test(src) && /Следующий шаг/i.test(src));
check("первый экран содержит запрет оплаты", src.includes("Без оплаты"));
check("первый экран содержит запрет VIP-разблокировки", src.includes("Без VIP-разблокировки"));

// Secondary modules preserved
check("вторичный модуль совместимости сохранён", /Совместимость|compatibility/i.test(src));
check("вторичный модуль матрицы судьбы сохранён", /Матрица судьбы|birth-matrix/i.test(src));
check("нижняя ссылка на мистические числа сохранена", /Мистические числа|mystic-numbers/i.test(src));

// No active payment CTA (button/link text)
check("нет активного CTA оплаты", !/\b(buy vip now|unlock full report|pay now|subscribe now|activate vip|checkout)\b/i.test(src));
// CTA uses a free, non-payment verb
check("главный CTA остаётся бесплатным preview", /Открыть бесплатный Love Reading preview|Только бесплатный preview/i.test(src));

// Boundaries on screen
check("первый экран показывает границы безопасности", /Без Telegram API/i.test(src) && /Без записи в базу данных/i.test(src) && /Без production-запуска/i.test(src));

// No live integrations introduced
check("не требуется Telegram API token", !/TELEGRAM_BOT_TOKEN|api\.telegram\.org|sendMessage\(/i.test(src));
check("не требуется подключение к базе данных", !/DATABASE_URL|createClient\(|supabase|new Pool\(/i.test(src));
check("не используется внешний AI API", !/OPENAI_API_KEY|ANTHROPIC_API_KEY|api\.openai\.com|new OpenAI\(|new Anthropic\(/i.test(src));
check("не добавлен внешний fetch/scraping", !/\bfetch\(|axios|puppeteer|playwright/i.test(src));
check("не добавлен payment API", !/from ['"]stripe|new Stripe\b|sendInvoice\(|createInvoiceLink\(|successful_payment/i.test(src));
check("не затронуты workflow/cron/publish файлы", !/\.github\/workflows|node-cron|cron\.schedule|publish-ledger/i.test(src));

console.log("\nQA завершён: " + passed + " успешно, " + failed + " ошибок.");
if (failed > 0) process.exit(1);
