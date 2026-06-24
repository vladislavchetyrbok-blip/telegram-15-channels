import {
  createAphroditeFutureTimelinePreview,
  getAphroditeFutureTimelinePeriods,
  getAphroditeFutureTimelineBoundaries,
  getAphroditeFutureTimelineTrafficHooks,
} from "../lib/zodiac/aphrodite-ai-future-timeline-foundation.ts";
import { readFileSync } from "node:fs";

let passed = 0, failed = 0;
function check(name, cond) {
  if (cond) { passed++; console.log("✅ PASS: " + name); }
  else { failed++; console.log("❌ FAIL: " + name); }
}

console.log("Starting Aphrodite AI Future Timeline Foundation QA...\n");

const preview = createAphroditeFutureTimelinePreview({
  firstName: "Anna", sign: "leo", focus: "love", horizon: "30-days", tone: "gentle",
});
check("preview can be generated", !!preview && typeof preview === "object");
check("preview has headline", typeof preview.headline === "string" && preview.headline.length > 0);
check("preview has emotional summary", typeof preview.emotionalSummary === "string" && preview.emotionalSummary.length > 0);
check("preview has visible horizon", typeof preview.visibleHorizon === "string" && preview.visibleHorizon.length > 0);
check("preview has main theme", typeof preview.mainTheme === "string" && preview.mainTheme.length > 0);
check("preview has love signal", typeof preview.loveSignal === "string" && preview.loveSignal.length > 0);
check("preview has opportunity signal", typeof preview.opportunitySignal === "string" && preview.opportunitySignal.length > 0);
check("preview has warning period", typeof preview.warningPeriod === "string" && preview.warningPeriod.length > 0);
check("preview has best action window", typeof preview.bestActionWindow === "string" && preview.bestActionWindow.length > 0);
check("preview has next step", typeof preview.nextStep === "string" && preview.nextStep.length > 0);

const periods = getAphroditeFutureTimelinePeriods({ sign: "leo" });
check("periods exist", Array.isArray(periods) && periods.length >= 6);
const labels = periods.map((p) => p.label);
for (const t of [
  "Current emotional phase",
  "Next 30-day love signal",
  "Opportunity window",
  "Zone of attention",
  "Best action window",
  "Reflection prompt",
  "Future VIP teaser",
]) check("period present: " + t, labels.includes(t));

check("future VIP teaser exists", Array.isArray(preview.futureVipTeaser) &&
  ["6-12 month timeline","love windows","money/energy windows","opportunity periods","warning periods","best action windows","personal reflection prompts"]
    .every((v) => preview.futureVipTeaser.includes(v)));

const hooks = getAphroditeFutureTimelineTrafficHooks();
check("traffic hooks exist", Array.isArray(hooks) && hooks.length >= 3);

const boundaries = getAphroditeFutureTimelineBoundaries();
check("boundaries exist", Array.isArray(boundaries) && boundaries.length >= 3);

const p2 = createAphroditeFutureTimelinePreview({ firstName: "Anna", sign: "leo" });
check("preview is deterministic", JSON.stringify(preview.periods.map(p=>p.theme)) === JSON.stringify(p2.periods.map(p=>p.theme)));

const src = readFileSync(new URL("../lib/zodiac/aphrodite-ai-future-timeline-foundation.ts", import.meta.url), "utf8");
check("no AI API key is required", !/OPENAI_API_KEY|ANTHROPIC_API_KEY|GEMINI_API_KEY|api\.openai\.com|generativelanguage\.googleapis|new OpenAI\(|new Anthropic\(|anthropic\.messages|openai\.chat/i.test(src));
check("no Telegram token is required", !/TELEGRAM_BOT_TOKEN|api\.telegram\.org|bot<token>/i.test(src));
check("no database connection is required", !/DATABASE_URL|createClient\(|supabase|new Pool\(/i.test(src));
check("no external fetch is used", !/\bfetch\(|axios|node-fetch|https?:\/\//i.test(src.replace(/zone of attention/gi, "")));
check("no payment API is used", !/from ['"]stripe|new Stripe\b|\.charges\.create|sendInvoice\(|answerPreCheckoutQuery\(|createInvoiceLink\(/i.test(src));

// Strip comment lines so safety declarations (which name forbidden things) are not scanned as content.
const scanSrc = src.split("\n").filter((l) => {
  const t = l.trim();
  return !(t.startsWith("*") || t.startsWith("/*") || t.startsWith("//") || t.startsWith("*/"));
}).join("\n");
check("no hard deterministic future wording", !/\b(will definitely (happen|occur)|guaranteed to happen|certainly will|destined to|it is certain that|100% sure)\b/i.test(scanSrc));
check("no exact date prediction", !/\b\d{4}-\d{2}-\d{2}\b|\bon (january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}\b|\bon the \d{1,2}(st|nd|rd|th)\b/i.test(scanSrc));
check("no financial advice wording", !/\b(invest in|buy (stocks|crypto|shares)|sell your|guaranteed returns|put your money|financial advice:)\b/i.test(scanSrc));
check("no medical/legal advice wording", !/\b(diagnos(e|is)|take (this )?medication|sue (him|her|them)|legal advice:|see a lawyer to)\b/i.test(scanSrc));

console.log("\nQA Finished: " + passed + " passed, " + failed + " failed.");
if (failed > 0) process.exit(1);
