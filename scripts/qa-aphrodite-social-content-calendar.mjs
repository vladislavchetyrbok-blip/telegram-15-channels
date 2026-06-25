import {
  getAphroditeSocialContentCalendarWeeks,
  getAphroditeSocialContentCalendarItems,
  getAphroditeSocialContentCalendarBoundaries,
  getAphroditeSocialContentCalendarNextSteps,
  getAphroditeSocialContentCalendarCoverageSummary,
} from "../lib/zodiac/aphrodite-social-content-calendar.ts";
import { readFileSync } from "node:fs";

let passed = 0, failed = 0;
function check(name, cond) {
  if (cond) { passed++; console.log("✅ PASS: " + name); }
  else { failed++; console.log("❌ FAIL: " + name); }
}

console.log("Starting Aphrodite Social Content Calendar QA...\n");

const weeks = getAphroditeSocialContentCalendarWeeks();
check("calendar weeks exist", Array.isArray(weeks) && weeks.length >= 1);
const items = getAphroditeSocialContentCalendarItems();
check("calendar items exist", Array.isArray(items) && items.length > 0);
check("at least 14 items exist", items.length >= 14);

const platforms = new Set(items.map((i) => i.platform));
for (const pf of ["instagram","tiktok","telegram","youtube-shorts"]) check("platform represented: " + pf, platforms.has(pf));
const pillars = new Set(items.map((i) => i.pillar));
for (const p of ["ai-love-reading","soulmate-scanner","red-flags-scanner","future-timeline","daily-message","zodiac-compatibility","angel-numbers","birth-matrix"]) check("pillar represented: " + p, pillars.has(p));

const summary = getAphroditeSocialContentCalendarCoverageSummary();
check("coverage summary exists", !!summary && typeof summary === "object");
check("ready-for-manual-export count >= 2", summary.readyForManualExport >= 2);
check("needs-review count >= 2", summary.needsReview >= 2);
check("blocked-by-safety count >= 1", summary.blockedBySafety >= 1);
check("summary totalItems matches items length", summary.totalItems === items.length);

check("each item has safe CTA", items.every((i) => typeof i.safeCta === "string" && i.safeCta.length > 0));
check("each item has blocked actions", items.every((i) => Array.isArray(i.blockedActions) && i.blockedActions.length > 0));
check("each item has manual export notes", items.every((i) => Array.isArray(i.manualExportNotes) && i.manualExportNotes.length > 0));
check("each item has day + format + review requirement", items.every((i) => i.day && i.format && Array.isArray(i.reviewRequirement) && i.reviewRequirement.length > 0));

const boundaries = getAphroditeSocialContentCalendarBoundaries();
check("boundaries exist", Array.isArray(boundaries) && boundaries.length >= 3);
const nextSteps = getAphroditeSocialContentCalendarNextSteps();
check("next steps exist", Array.isArray(nextSteps) && nextSteps.length >= 1);

// CTA safety
check("no payment CTA in any item", items.every((i) => !/\b(buy|subscribe|unlock|purchase|pay now|checkout|upgrade now)\b/i.test(i.safeCta + " " + i.hook + " " + i.title)));

// Content scan
const contentText = items.map((i) => `${i.title} ${i.hook}`).join("\n");
check("no deterministic / guaranteed claims in content", !/\b(guaranteed|100% (sure|true)|he will return|definitely will|cast a (love )?spell|loyalty magic)\b/i.test(contentText));
check("no copied-competitor markers in content", !/\b(co-star|the pattern app|copied from|stolen from)\b/i.test(contentText));

// Source scan
const src = readFileSync(new URL("../lib/zodiac/aphrodite-social-content-calendar.ts", import.meta.url), "utf8");
const scanSrc = src.split("\n").filter((l) => {
  const t = l.trim();
  return !(t.startsWith("*") || t.startsWith("/*") || t.startsWith("//") || t.startsWith("*/"));
}).join("\n");
check("no platform API calls", !/graph\.facebook\.com|graph\.instagram\.com|api\.instagram\.com|open\.tiktokapis\.com|googleapis\.com\/youtube|api\.telegram\.org|sendMessage\(|publishPost\(/i.test(scanSrc));
check("no scraping code", !/puppeteer|playwright|cheerio|\bscrape\w*\(|headless|webdriver|selenium/i.test(scanSrc));
check("no credentials required", !/access_token\s*[:=]|client_secret|api_key\s*[:=]|password\s*[:=]|process\.env\.(IG|TIKTOK|YOUTUBE|INSTAGRAM)_/i.test(scanSrc));
check("no external fetch", !/\bfetch\(|axios|node-fetch|https?:\/\//i.test(scanSrc));
check("no database connection", !/DATABASE_URL|createClient\(|supabase|new Pool\(|prisma\./i.test(scanSrc));
check("no cron/workflow change", !/node-cron|cron\.schedule\(|setInterval\(|\.github\/workflows|crontab/i.test(scanSrc));
check("no payment API", !/from ['"]stripe|new Stripe\b|sendInvoice\(|createInvoiceLink\(|successful_payment/i.test(scanSrc));

console.log("\nQA Finished: " + passed + " passed, " + failed + " failed.");
if (failed > 0) process.exit(1);
