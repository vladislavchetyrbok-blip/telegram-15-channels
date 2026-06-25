import { readFileSync, existsSync } from "node:fs";

let passed = 0, failed = 0;
function check(name, cond) {
  if (cond) { passed++; console.log("✅ PASS: " + name); }
  else { failed++; console.log("❌ FAIL: " + name); }
}

const FIRST_SCREEN = new URL("../app/miniapp/page.tsx", import.meta.url);
console.log("Starting Aphrodite Mini App First Screen Real Integration QA...\n");

check("main first-screen file exists", existsSync(FIRST_SCREEN));
const src = readFileSync(FIRST_SCREEN, "utf8");

check("first screen includes 'AI Love Reading'", src.includes("AI Love Reading"));
check("first screen includes the promise (Узнай, что между вами происходит)", src.includes("Узнай, что между вами происходит"));
check("first screen includes safe free-preview language", /free Love Reading preview|Free preview|Example free preview/i.test(src));
check("free preview structure present (main energy / strength / risk / next step)",
  /Main energy/i.test(src) && /One strength/i.test(src) && /One risk zone/i.test(src) && /One next step/i.test(src));
check("first screen includes 'No payment'", src.includes("No payment"));
check("first screen includes 'No real VIP unlock'", src.includes("No real VIP unlock"));

// Secondary modules preserved
check("secondary module: compatibility preserved", /compatibility/i.test(src));
check("secondary module: Birth Matrix / Matrix of Destiny preserved", /Birth Matrix|Matrix of Destiny|birth-matrix/i.test(src));
check("secondary module: Mystic Cards / Mystic Numbers preserved", /Mystic Numbers|Mystic Cards|mystic-numbers/i.test(src));

// No active payment CTA (button/link text)
check("no active payment CTA", !/\b(buy vip now|unlock full report|pay now|subscribe now|activate vip|checkout)\b/i.test(src));
// CTA uses a free, non-payment verb
check("primary CTA is a free preview CTA", /free Love Reading preview|free preview/i.test(src));

// Boundaries on screen
check("first screen shows safety boundaries", /No Telegram API call/i.test(src) && /No database write/i.test(src) && /No production launch/i.test(src));

// No live integrations introduced
check("no Telegram API token required", !/TELEGRAM_BOT_TOKEN|api\.telegram\.org|sendMessage\(/i.test(src));
check("no database connection required", !/DATABASE_URL|createClient\(|supabase|new Pool\(/i.test(src));
check("no external AI API used", !/OPENAI_API_KEY|ANTHROPIC_API_KEY|api\.openai\.com|new OpenAI\(|new Anthropic\(/i.test(src));
check("no external fetch / scraping introduced", !/\bfetch\(|axios|puppeteer|playwright/i.test(src));
check("no payment API introduced", !/from ['"]stripe|new Stripe\b|sendInvoice\(|createInvoiceLink\(|successful_payment/i.test(src));
check("does not reference workflow/cron/publish files", !/\.github\/workflows|node-cron|cron\.schedule|publish-ledger/i.test(src));

console.log("\nQA Finished: " + passed + " passed, " + failed + " failed.");
if (failed > 0) process.exit(1);
