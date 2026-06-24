import {
  getAphroditeFirstResultSteps,
  getAphroditeLoadingStages,
  createAphroditeLoveReadingPreview,
  getAphroditeFirstResultBoundaries,
  APHRODITE_PRIMARY_EMOTIONAL_PROMISE,
} from "../lib/zodiac/aphrodite-first-result-experience.ts";
import { readFileSync } from "node:fs";

let passed = 0;
let failed = 0;
function check(name, cond) {
  if (cond) {
    passed++;
    console.log("✅ PASS: " + name);
  } else {
    failed++;
    console.log("❌ FAIL: " + name);
  }
}

console.log("Starting Aphrodite First Result Experience QA...\n");

const steps = getAphroditeFirstResultSteps();
check("first-result steps exist", Array.isArray(steps) && steps.length >= 3);

const stages = getAphroditeLoadingStages();
check("loading stages exist", Array.isArray(stages) && stages.length >= 4);
const stageLabels = stages.map((s) => s.label);
for (const required of [
  "Reading your connection energy",
  "Comparing emotional patterns",
  "Finding your strongest attraction point",
  "Preparing your personal guidance",
]) {
  check("loading stage present: " + required, stageLabels.includes(required));
}

const preview = createAphroditeLoveReadingPreview({
  firstName: "Anna",
  partnerName: "Mark",
  firstSign: "leo",
  partnerSign: "scorpio",
  relationshipStatus: "complicated",
});
check("mock Love Reading preview can be generated", !!preview && typeof preview === "object");
check("preview includes headline", typeof preview.headline === "string" && preview.headline.length > 0);
check("preview includes emotional summary", typeof preview.emotionalSummary === "string" && preview.emotionalSummary.length > 0);
check("preview includes free insight", Array.isArray(preview.freeInsight) && preview.freeInsight.length === 3);
check(
  "preview includes future VIP teaser",
  Array.isArray(preview.futureVipTeaser) &&
    ["what he feels", "why he pulls away", "30-day forecast", "red flags", "personal advice"].every((v) =>
      preview.futureVipTeaser.includes(v)
    )
);
check("safety note exists", typeof preview.safetyNote === "string" && preview.safetyNote.length > 0);

// Determinism: same input -> same output
const preview2 = createAphroditeLoveReadingPreview({ firstName: "Anna", partnerName: "Mark", firstSign: "leo", partnerSign: "scorpio" });
check("preview is deterministic", JSON.stringify(preview.freeInsight) === JSON.stringify(preview2.freeInsight));

const boundaries = getAphroditeFirstResultBoundaries();
check("boundaries exist", Array.isArray(boundaries) && boundaries.length >= 3);
check("payments are blocked", boundaries.some((b) => b.area.toLowerCase().includes("payment") && b.status === "blocked"));

check("primary emotional promise is present", typeof APHRODITE_PRIMARY_EMOTIONAL_PROMISE === "string" && APHRODITE_PRIMARY_EMOTIONAL_PROMISE.length > 0);

// Static source safety scan: no live integrations required
const src = readFileSync(new URL("../lib/zodiac/aphrodite-first-result-experience.ts", import.meta.url), "utf8");
check("no payment API is required", !/from ["']stripe|require\(["']stripe|new Stripe\b|\.charges\.create|sendInvoice\(|answerPreCheckoutQuery\(|createInvoiceLink\(/i.test(src));
check("no Telegram token is required", !/TELEGRAM_BOT_TOKEN|api\.telegram\.org|bot<token>/i.test(src));
check("no database connection is required", !/DATABASE_URL|createClient\(|pg\.|supabase/i.test(src));
check("no external fetch is used", !/\bfetch\(|axios|node-fetch|https?:\/\//i.test(src.replace(/zone of attention/gi, "")));
check("no hard deterministic fate wording", !/\b(will definitely|guaranteed|certainly will|destined to|fate decides)\b/i.test(src));

console.log("\nQA Finished: " + passed + " passed, " + failed + " failed.");
if (failed > 0) process.exit(1);
