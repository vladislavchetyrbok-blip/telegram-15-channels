import {
  createAphroditeRedFlagsScannerPreview,
  getAphroditeRedFlagsScannerSections,
  getAphroditeRedFlagsScannerBoundaries,
  getAphroditeRedFlagsScannerTrafficHooks,
} from "../lib/zodiac/aphrodite-red-flags-scanner-foundation.ts";
import { readFileSync } from "node:fs";

let passed = 0, failed = 0;
function check(name, cond) {
  if (cond) { passed++; console.log("✅ PASS: " + name); }
  else { failed++; console.log("❌ FAIL: " + name); }
}

console.log("Starting Aphrodite Red Flags Scanner Foundation QA...\n");

const preview = createAphroditeRedFlagsScannerPreview({
  firstName: "Anna", partnerName: "Mark",
  firstSign: "leo", partnerSign: "scorpio",
  relationshipStatus: "complicated", focus: "distance", tone: "gentle",
});
check("preview can be generated", !!preview && typeof preview === "object");
check("preview has headline", typeof preview.headline === "string" && preview.headline.length > 0);
check("preview has emotional summary", typeof preview.emotionalSummary === "string" && preview.emotionalSummary.length > 0);
check("preview has main red flag zone", typeof preview.mainRedFlagZone === "string" && preview.mainRedFlagZone.length > 0);
check("preview has soft warning", typeof preview.softWarning === "string" && preview.softWarning.length > 0);
check("preview has distance pattern", typeof preview.distancePattern === "string" && preview.distancePattern.length > 0);
check("preview has conflict pattern", typeof preview.conflictPattern === "string" && preview.conflictPattern.length > 0);
check("preview has self-protection step", typeof preview.selfProtectionStep === "string" && preview.selfProtectionStep.length > 0);
check("preview has next step", typeof preview.nextStep === "string" && preview.nextStep.length > 0);

const sections = getAphroditeRedFlagsScannerSections();
check("sections exist", Array.isArray(sections) && sections.length >= 6);
const titles = sections.map((s) => s.title);
for (const t of [
  "Main red flag zone",
  "Soft warning",
  "Distance / silence pattern",
  "Jealousy or control risk zone",
  "Conflict pattern",
  "Self-protection next step",
  "Future VIP teaser",
]) check("section present: " + t, titles.includes(t));

check("future VIP teaser exists", Array.isArray(preview.futureVipTeaser) &&
  ["emotional avoidance","jealousy/control risk","silence/conflict pattern","attachment style hint","what to do next","30-day relationship risk timeline","personal reflection prompts"]
    .every((v) => preview.futureVipTeaser.includes(v)));

const hooks = getAphroditeRedFlagsScannerTrafficHooks();
check("traffic hooks exist", Array.isArray(hooks) && hooks.length >= 3);

const boundaries = getAphroditeRedFlagsScannerBoundaries();
check("boundaries exist", Array.isArray(boundaries) && boundaries.length >= 3);

const p2 = createAphroditeRedFlagsScannerPreview({ firstName: "Anna", firstSign: "leo", partnerSign: "scorpio" });
check("preview is deterministic", JSON.stringify(preview.sections.map(s=>s.freeText)) === JSON.stringify(p2.sections.map(s=>s.freeText)));

const src = readFileSync(new URL("../lib/zodiac/aphrodite-red-flags-scanner-foundation.ts", import.meta.url), "utf8");
check("no AI API key is required", !/OPENAI_API_KEY|ANTHROPIC_API_KEY|GEMINI_API_KEY|api\.openai\.com|generativelanguage\.googleapis|new OpenAI\(|new Anthropic\(|anthropic\.messages|openai\.chat/i.test(src));
check("no Telegram token is required", !/TELEGRAM_BOT_TOKEN|api\.telegram\.org|bot<token>/i.test(src));
check("no database connection is required", !/DATABASE_URL|createClient\(|supabase|new Pool\(/i.test(src));
check("no external fetch is used", !/\bfetch\(|axios|node-fetch|https?:\/\//i.test(src.replace(/zone of attention/gi, "")));
check("no payment API is used", !/from ['"]stripe|new Stripe\b|\.charges\.create|sendInvoice\(|answerPreCheckoutQuery\(|createInvoiceLink\(/i.test(src));
// Scoped checks below target ASSERTIONS, not the boundary declarations that name what is forbidden.
// Strip comment lines so safety declarations (e.g. "never claims someone is dangerous") are not scanned as content.
const scanSrc = src.split("\n").filter((l) => {
  const t = l.trim();
  return !(t.startsWith("*") || t.startsWith("/*") || t.startsWith("//") || t.startsWith("*/"));
}).join("\n");
check("no hard deterministic red-flag wording", !/\b(definitely a red flag|guaranteed red flag|certainly dangerous|100% toxic|proves (he|she|they) (is|are))\b/i.test(scanSrc));
check("no abuse accusation wording", !/\b(is|he is|she is|they are)\s+(abusive|an abuser|a narcissist|toxic|dangerous)\b|\bproves?\s+(abuse|cheating|betrayal|narcissism)\b/i.test(scanSrc));
check("no diagnosis wording", !/\b(you|he|she|they)\s+(have|has)\s+(depression|anxiety disorder|bpd|npd|ptsd|bipolar)\b|\bclinically\b|\bdiagnos(e|ed|ing)\s+\w+\s+with\b/i.test(scanSrc));

console.log("\nQA Finished: " + passed + " passed, " + failed + " failed.");
if (failed > 0) process.exit(1);
