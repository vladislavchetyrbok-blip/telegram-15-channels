import {
  getAphroditeSocialDraftReviewQueue,
  getAphroditeSocialDraftReviewRules,
  getAphroditeSocialDraftReviewBoundaries,
  getAphroditeSocialDraftReviewNextSteps,
  reviewAphroditeSocialDraft,
} from "../lib/zodiac/aphrodite-social-draft-review-queue.ts";
import { readFileSync } from "node:fs";

let passed = 0, failed = 0;
function check(name, cond) {
  if (cond) { passed++; console.log("✅ PASS: " + name); }
  else { failed++; console.log("❌ FAIL: " + name); }
}

console.log("Starting Aphrodite Social Draft Review Queue QA...\n");

const queue = getAphroditeSocialDraftReviewQueue();
check("review queue exists", Array.isArray(queue) && queue.length > 0);
check("at least 8 queue items exist", queue.length >= 8);

const pillars = new Set(queue.map((q) => q.pillar));
for (const p of ["ai-love-reading","soulmate-scanner","red-flags-scanner","future-timeline","daily-message","zodiac-compatibility","angel-numbers","birth-matrix"]) {
  check("pillar represented: " + p, pillars.has(p));
}

check("all items have status", queue.every((q) => typeof q.status === "string" && q.status.length > 0));
check("all items have safe CTA", queue.every((q) => typeof q.safeCta === "string" && q.safeCta.length > 0));
check("all items have manual export checklist", queue.every((q) => Array.isArray(q.manualExportChecklist) && q.manualExportChecklist.length >= 5));
check("all items have reviewer notes + safety flags arrays", queue.every((q) => Array.isArray(q.reviewerNotes) && Array.isArray(q.safetyFlags)));

const rules = getAphroditeSocialDraftReviewRules();
check("rules exist", Array.isArray(rules) && rules.length >= 3);
const boundaries = getAphroditeSocialDraftReviewBoundaries();
check("boundaries exist", Array.isArray(boundaries) && boundaries.length >= 3);
const nextSteps = getAphroditeSocialDraftReviewNextSteps();
check("next steps exist", Array.isArray(nextSteps) && nextSteps.length >= 1);

// Review decision function — pure, no mutation
const item = queue[0];
const before = JSON.stringify(item);
const approved = reviewAphroditeSocialDraft(item, "approve-for-manual-export", "looks good");
check("review can approve for manual export", approved.status === "approved-for-manual-export" && approved.reviewerNotes.length === item.reviewerNotes.length + 1);
check("review can request edit", reviewAphroditeSocialDraft(item, "request-edit").status === "needs-review");
check("review can reject", reviewAphroditeSocialDraft(item, "reject").status === "rejected");
const blocked = reviewAphroditeSocialDraft(item, "block-by-safety", "deterministic wording");
check("review can block by safety", blocked.status === "blocked-by-safety" && blocked.safetyFlags.length === item.safetyFlags.length + 1);
check("review function does not mutate input", JSON.stringify(item) === before);

// CTA safety on every item
check("no payment CTA in any queue item", queue.every((q) => !/\b(buy|subscribe|unlock|purchase|pay now|checkout|upgrade now)\b/i.test(q.safeCta + " " + q.caption + " " + q.hook)));

// Content scan: queue items' visible text must be safe
const contentText = queue.map((q) => `${q.title} ${q.hook} ${q.caption}`).join("\n");
check("no deterministic / guaranteed claims in queue content", !/\b(guaranteed|100% (sure|true)|he will return|definitely will|cast a (love )?spell|loyalty magic)\b/i.test(contentText));
check("no copied-competitor markers in queue content", !/\b(co-star|the pattern app|copied from|stolen from)\b/i.test(contentText));

// Source scan: strip comments AND rule blockedPhrases lines (which legitimately name forbidden terms).
const src = readFileSync(new URL("../lib/zodiac/aphrodite-social-draft-review-queue.ts", import.meta.url), "utf8");
const scanSrc = src.split("\n").filter((l) => {
  const t = l.trim();
  if (t.startsWith("*") || t.startsWith("/*") || t.startsWith("//") || t.startsWith("*/")) return false;
  if (t.includes("blockedPhrases:")) return false; // rule guardrail data
  return true;
}).join("\n");
check("no platform API calls", !/graph\.facebook\.com|graph\.instagram\.com|api\.instagram\.com|open\.tiktokapis\.com|googleapis\.com\/youtube|api\.telegram\.org|sendMessage\(|publishPost\(/i.test(scanSrc));
check("no scraping code", !/puppeteer|playwright|cheerio|\bscrape\w*\(|headless|webdriver|selenium/i.test(scanSrc));
check("no credentials required", !/access_token\s*[:=]|client_secret|api_key\s*[:=]|password\s*[:=]|process\.env\.(IG|TIKTOK|YOUTUBE|INSTAGRAM)_/i.test(scanSrc));
check("no external fetch", !/\bfetch\(|axios|node-fetch|https?:\/\//i.test(scanSrc));
check("no database connection", !/DATABASE_URL|createClient\(|supabase|new Pool\(|prisma\./i.test(scanSrc));
check("no payment API", !/from ['"]stripe|new Stripe\b|sendInvoice\(|createInvoiceLink\(|successful_payment/i.test(scanSrc));

console.log("\nQA Finished: " + passed + " passed, " + failed + " failed.");
if (failed > 0) process.exit(1);
