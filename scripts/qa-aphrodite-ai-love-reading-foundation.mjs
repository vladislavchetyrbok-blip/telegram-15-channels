import {
  createAphroditeLoveReadingFoundationPreview,
  getAphroditeLoveReadingSections,
  getAphroditeLoveReadingBoundaries,
  getAphroditeLoveReadingTrafficHooks,
} from "../lib/zodiac/aphrodite-ai-love-reading-foundation.ts";
import { readFileSync } from "node:fs";

let passed = 0, failed = 0;
function check(name, cond) {
  if (cond) { passed++; console.log("✅ PASS: " + name); }
  else { failed++; console.log("❌ FAIL: " + name); }
}

console.log("Starting Aphrodite AI Love Reading Foundation QA...\n");

const preview = createAphroditeLoveReadingFoundationPreview({
  firstName: "Anna", partnerName: "Mark",
  firstSign: "leo", partnerSign: "scorpio",
  relationshipStatus: "complicated", focus: "feelings", tone: "gentle",
});
check("preview can be generated", !!preview && typeof preview === "object");
check("preview has headline", typeof preview.headline === "string" && preview.headline.length > 0);
check("preview has emotional summary", typeof preview.emotionalSummary === "string" && preview.emotionalSummary.length > 0);
check("preview has connection energy", typeof preview.connectionEnergy === "string" && preview.connectionEnergy.length > 0);
check("preview has strength", typeof preview.strength === "string" && preview.strength.length > 0);
check("preview has risk zone", typeof preview.riskZone === "string" && preview.riskZone.length > 0);
check("preview has next step", typeof preview.nextStep === "string" && preview.nextStep.length > 0);

const sections = getAphroditeLoveReadingSections();
check("sections exist", Array.isArray(sections) && sections.length >= 6);
const titles = sections.map((s) => s.title);
for (const t of [
  "Main energy of the connection",
  "What he/she may feel",
  "Why he/she may pull away",
  "Strongest attraction point",
  "Main risk zone",
  "What to do next",
  "Future VIP teaser",
]) check("section present: " + t, titles.includes(t));

check("future VIP teaser exists", Array.isArray(preview.futureVipTeaser) &&
  ["what he/she feels","why he/she pulls away","30-day forecast","red flags","personal advice","relationship pattern"]
    .every((v) => preview.futureVipTeaser.includes(v)));

const hooks = getAphroditeLoveReadingTrafficHooks();
check("traffic hooks exist", Array.isArray(hooks) && hooks.length >= 3);

const boundaries = getAphroditeLoveReadingBoundaries();
check("boundaries exist", Array.isArray(boundaries) && boundaries.length >= 3);

// determinism
const p2 = createAphroditeLoveReadingFoundationPreview({ firstName: "Anna", partnerName: "Mark", firstSign: "leo", partnerSign: "scorpio" });
check("preview is deterministic", JSON.stringify(preview.sections.map(s=>s.freeText)) === JSON.stringify(p2.sections.map(s=>s.freeText)));

const src = readFileSync(new URL("../lib/zodiac/aphrodite-ai-love-reading-foundation.ts", import.meta.url), "utf8");
check("no AI API key is required", !/OPENAI_API_KEY|ANTHROPIC_API_KEY|GEMINI_API_KEY|api\.openai\.com|generativelanguage\.googleapis|new OpenAI\(|new Anthropic\(|anthropic\.messages|openai\.chat/i.test(src));
check("no Telegram token is required", !/TELEGRAM_BOT_TOKEN|api\.telegram\.org|bot<token>/i.test(src));
check("no database connection is required", !/DATABASE_URL|createClient\(|supabase|new Pool\(/i.test(src));
check("no external fetch is used", !/\bfetch\(|axios|node-fetch|https?:\/\//i.test(src.replace(/zone of attention/gi, "")));
check("no payment API is used", !/from ['"]stripe|new Stripe\b|\.charges\.create|sendInvoice\(|answerPreCheckoutQuery\(|createInvoiceLink\(/i.test(src));
check("no hard deterministic fate wording", !/\b(will definitely|guaranteed|certainly will|destined to|fate decides|100% sure)\b/i.test(src));

console.log("\nQA Finished: " + passed + " passed, " + failed + " failed.");
if (failed > 0) process.exit(1);
