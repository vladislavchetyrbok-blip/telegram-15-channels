import {
  createAphroditeSoulmateScannerPreview,
  getAphroditeSoulmateScannerSections,
  getAphroditeSoulmateScannerBoundaries,
  getAphroditeSoulmateScannerTrafficHooks,
} from "../lib/zodiac/aphrodite-soulmate-scanner-foundation.ts";
import { readFileSync } from "node:fs";

let passed = 0, failed = 0;
function check(name, cond) {
  if (cond) { passed++; console.log("✅ PASS: " + name); }
  else { failed++; console.log("❌ FAIL: " + name); }
}

console.log("Starting Aphrodite Soulmate Scanner Foundation QA...\n");

const preview = createAphroditeSoulmateScannerPreview({
  firstName: "Anna", sign: "leo", relationshipStatus: "single", focus: "partner-type", tone: "gentle",
});
check("preview can be generated", !!preview && typeof preview === "object");
check("preview has headline", typeof preview.headline === "string" && preview.headline.length > 0);
check("preview has emotional summary", typeof preview.emotionalSummary === "string" && preview.emotionalSummary.length > 0);
check("preview has partner type", typeof preview.partnerType === "string" && preview.partnerType.length > 0);
check("preview has emotional pattern", typeof preview.emotionalPattern === "string" && preview.emotionalPattern.length > 0);
check("preview has strongest sign energy", typeof preview.strongestSignEnergy === "string" && preview.strongestSignEnergy.length > 0);
check("preview has possible meeting context", typeof preview.possibleMeetingContext === "string" && preview.possibleMeetingContext.length > 0);
check("preview has relationship block", typeof preview.relationshipBlock === "string" && preview.relationshipBlock.length > 0);
check("preview has next step", typeof preview.nextStep === "string" && preview.nextStep.length > 0);

const sections = getAphroditeSoulmateScannerSections();
check("sections exist", Array.isArray(sections) && sections.length >= 6);
const titles = sections.map((s) => s.title);
for (const t of [
  "Partner type",
  "Emotional pattern",
  "Strongest sign energy",
  "Possible meeting context",
  "Relationship block",
  "What to notice before choosing someone",
  "Future VIP teaser",
]) check("section present: " + t, titles.includes(t));

check("future VIP teaser exists", Array.isArray(preview.futureVipTeaser) &&
  ["where the meeting may happen","age / maturity pattern","signs that may fit best","blocks preventing relationships","3-month relationship timeline","personal relationship advice"]
    .every((v) => preview.futureVipTeaser.includes(v)));

const hooks = getAphroditeSoulmateScannerTrafficHooks();
check("traffic hooks exist", Array.isArray(hooks) && hooks.length >= 3);

const boundaries = getAphroditeSoulmateScannerBoundaries();
check("boundaries exist", Array.isArray(boundaries) && boundaries.length >= 3);

const p2 = createAphroditeSoulmateScannerPreview({ firstName: "Anna", sign: "leo" });
check("preview is deterministic", JSON.stringify(preview.sections.map(s=>s.freeText)) === JSON.stringify(p2.sections.map(s=>s.freeText)));

const src = readFileSync(new URL("../lib/zodiac/aphrodite-soulmate-scanner-foundation.ts", import.meta.url), "utf8");
check("no AI API key is required", !/OPENAI_API_KEY|ANTHROPIC_API_KEY|GEMINI_API_KEY|api\.openai\.com|generativelanguage\.googleapis|new OpenAI\(|new Anthropic\(|anthropic\.messages|openai\.chat/i.test(src));
check("no Telegram token is required", !/TELEGRAM_BOT_TOKEN|api\.telegram\.org|bot<token>/i.test(src));
check("no database connection is required", !/DATABASE_URL|createClient\(|supabase|new Pool\(/i.test(src));
check("no external fetch is used", !/\bfetch\(|axios|node-fetch|https?:\/\//i.test(src.replace(/zone of attention/gi, "")));
check("no payment API is used", !/from ['"]stripe|new Stripe\b|\.charges\.create|sendInvoice\(|answerPreCheckoutQuery\(|createInvoiceLink\(/i.test(src));
check("no hard deterministic soulmate wording", !/\b(guaranteed soulmate|will definitely meet|certainly your soulmate|destined to marry|100% your soulmate|fate decides)\b/i.test(src));

console.log("\nQA Finished: " + passed + " passed, " + failed + " failed.");
if (failed > 0) process.exit(1);
