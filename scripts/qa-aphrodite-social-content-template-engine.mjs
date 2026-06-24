import {
  getAphroditeSocialContentTemplates,
  createAphroditeSocialContentDraft,
  getAphroditeSocialContentReviewChecklist,
  getAphroditeSocialContentEngineBoundaries,
} from "../lib/zodiac/aphrodite-social-content-template-engine.ts";
import { readFileSync } from "node:fs";

let passed = 0, failed = 0;
function check(name, cond) {
  if (cond) { passed++; console.log("✅ PASS: " + name); }
  else { failed++; console.log("❌ FAIL: " + name); }
}

console.log("Starting Aphrodite Social Content Template Engine QA...\n");

const templates = getAphroditeSocialContentTemplates();
check("templates exist", Array.isArray(templates) && templates.length >= 8);

const draft = createAphroditeSocialContentDraft({
  platform: "instagram", pillar: "ai-love-reading", format: "reel", tone: "soft", sign: "leo", theme: "distance",
});
check("draft can be generated", !!draft && typeof draft === "object");
check("generated draft has title", typeof draft.title === "string" && draft.title.length > 0);
check("generated draft has hook", typeof draft.hook === "string" && draft.hook.length > 0);
check("generated draft has body lines", Array.isArray(draft.bodyLines) && draft.bodyLines.length >= 3 && draft.bodyLines.length <= 5);
check("generated draft has caption", typeof draft.caption === "string" && draft.caption.length > 0);
check("generated draft has hashtags", Array.isArray(draft.hashtags) && draft.hashtags.length >= 3);
check("generated draft has safe CTA", typeof draft.safeCta === "string" && draft.safeCta.length > 0);
check("generated draft has blocked claims", Array.isArray(draft.blockedClaims) && draft.blockedClaims.length > 0);
check("generated draft has review checklist", Array.isArray(draft.reviewChecklist) && draft.reviewChecklist.length > 0);
check("generated draft has safety boundary", Array.isArray(draft.safetyBoundary) && draft.safetyBoundary.length > 0);

const checklist = getAphroditeSocialContentReviewChecklist();
check("review checklist exists", Array.isArray(checklist) && checklist.length >= 3);
const boundaries = getAphroditeSocialContentEngineBoundaries();
check("boundaries exist", Array.isArray(boundaries) && boundaries.length >= 3);

// All 4 platforms supported
for (const platform of ["instagram", "tiktok", "telegram", "youtube-shorts"]) {
  const d = createAphroditeSocialContentDraft({ platform, pillar: "ai-love-reading", format: "reel" });
  check("platform supported: " + platform, d.platform === platform && d.bodyLines.length >= 3);
}
// All 8 pillars supported
for (const pillar of ["ai-love-reading","soulmate-scanner","red-flags-scanner","future-timeline","daily-message","zodiac-compatibility","angel-numbers","birth-matrix"]) {
  const d = createAphroditeSocialContentDraft({ platform: "instagram", pillar, format: "reel" });
  check("pillar supported: " + pillar, d.pillar === pillar && d.title.length > 0);
}

// Determinism
const d1 = createAphroditeSocialContentDraft({ platform: "tiktok", pillar: "soulmate-scanner", format: "short-video", sign: "leo" });
const d2 = createAphroditeSocialContentDraft({ platform: "tiktok", pillar: "soulmate-scanner", format: "short-video", sign: "leo" });
check("draft is deterministic", JSON.stringify(d1) === JSON.stringify(d2));

// CTA is non-payment
const allDrafts = ["instagram","tiktok","telegram","youtube-shorts"].flatMap((pf) =>
  templates.map((t) => createAphroditeSocialContentDraft({ platform: pf, pillar: t.pillar, format: t.format })));
check("no payment CTA in any generated draft", allDrafts.every((d) =>
  !/\b(buy|subscribe|unlock|purchase|pay now|checkout|upgrade now)\b/i.test(d.safeCta) &&
  !/\b(buy|subscribe|unlock|purchase|pay now)\b/i.test(d.caption)));

const src = readFileSync(new URL("../lib/zodiac/aphrodite-social-content-template-engine.ts", import.meta.url), "utf8");
check("no platform API calls", !/graph\.facebook\.com|graph\.instagram\.com|api\.instagram\.com|open\.tiktokapis\.com|googleapis\.com\/youtube|api\.telegram\.org|sendMessage\(|publishPost\(/i.test(src));
check("no scraping code", !/puppeteer|playwright|cheerio|\bscrape\w*\(|headless|webdriver|selenium/i.test(src));
check("no credentials required", !/access_token\s*[:=]|client_secret|api_key\s*[:=]|password\s*[:=]|process\.env\.(IG|TIKTOK|YOUTUBE|INSTAGRAM)_/i.test(src));
check("no external fetch", !/\bfetch\(|axios|node-fetch|https?:\/\//i.test(src));
check("no payment API", !/from ['"]stripe|new Stripe\b|sendInvoice\(|createInvoiceLink\(|successful_payment/i.test(src));

const scanSrc = src.split("\n").filter((l) => {
  const t = l.trim();
  return !(t.startsWith("*") || t.startsWith("/*") || t.startsWith("//") || t.startsWith("*/"));
}).join("\n").replace(/APHRODITE_CONTENT_BLOCKED_CLAIMS|blockedClaims|Buy VIP now|Unlock full report now|Subscribe now|Pay now|Guaranteed prediction|He will return|100% true|Spell \/ loyalty magic/g, "");
check("no deterministic / guaranteed claims in content", !/\b(guaranteed love|100% (sure|true|prediction)|will definitely (happen|return)|cast a (love )?spell|make him love you)\b/i.test(scanSrc));
check("no copied-competitor markers", !/\b(copy paste from|competitor script|stolen from|ripped from|@?co_star|@?thepattern)\b/i.test(scanSrc));

console.log("\nQA Finished: " + passed + " passed, " + failed + " failed.");
if (failed > 0) process.exit(1);
