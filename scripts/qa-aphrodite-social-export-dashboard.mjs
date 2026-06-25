import {
  getAphroditeSocialExportItems,
  getAphroditeSocialExportPlatformGuides,
  getAphroditeSocialExportBoundaries,
  getAphroditeSocialExportNextSteps,
  isAphroditeSocialExportReady,
} from "../lib/zodiac/aphrodite-social-export-dashboard.ts";
import { readFileSync } from "node:fs";

let passed = 0, failed = 0;
function check(name, cond) {
  if (cond) { passed++; console.log("✅ PASS: " + name); }
  else { failed++; console.log("❌ FAIL: " + name); }
}

console.log("Starting Aphrodite Social Export Dashboard QA...\n");

const items = getAphroditeSocialExportItems();
check("export items exist", Array.isArray(items) && items.length > 0);
check("at least 8 export items exist", items.length >= 8);

const pillars = new Set(items.map((i) => i.id.replace(/^export-\d+-/, "")));
for (const p of ["ai-love-reading","soulmate-scanner","red-flags-scanner","future-timeline","daily-message","zodiac-compatibility","angel-numbers","birth-matrix"]) {
  check("pillar represented: " + p, pillars.has(p));
}

const guides = getAphroditeSocialExportPlatformGuides();
check("platform guides exist", Array.isArray(guides) && guides.length >= 4);
const guidePlatforms = new Set(guides.map((g) => g.platform));
for (const pf of ["instagram","tiktok","telegram","youtube-shorts"]) {
  check("platform represented: " + pf, guidePlatforms.has(pf));
}

check("each item has manual export instructions", items.every((i) => Array.isArray(i.manualExportInstructions) && i.manualExportInstructions.length > 0));
check("each item has safety checklist", items.every((i) => Array.isArray(i.safetyChecklist) && i.safetyChecklist.length > 0));
check("each item has blocked actions", items.every((i) => Array.isArray(i.blockedActions) && i.blockedActions.length > 0));
check("each item has hook/body/caption/hashtags/CTA", items.every((i) =>
  i.hook && Array.isArray(i.bodyLines) && i.bodyLines.length > 0 && i.caption && Array.isArray(i.hashtags) && i.hashtags.length > 0 && i.safeCta));

// Readiness function: true only for ready-for-manual-export
check("readiness true only for ready-for-manual-export items", items.every((i) =>
  isAphroditeSocialExportReady(i) === (i.exportStatus === "ready-for-manual-export")));
check("at least one ready and at least one not-ready item", items.some((i)=>isAphroditeSocialExportReady(i)) && items.some((i)=>!isAphroditeSocialExportReady(i)));

const boundaries = getAphroditeSocialExportBoundaries();
check("boundaries exist", Array.isArray(boundaries) && boundaries.length >= 3);
const nextSteps = getAphroditeSocialExportNextSteps();
check("next steps exist", Array.isArray(nextSteps) && nextSteps.length >= 1);

// CTA safety
check("no payment CTA in any item", items.every((i) =>
  !/\b(buy|subscribe|unlock|purchase|pay now|checkout|upgrade now)\b/i.test(i.safeCta + " " + i.caption + " " + i.hook + " " + i.bodyLines.join(" "))));

// Content scan
const contentText = items.map((i) => `${i.title} ${i.hook} ${i.caption} ${i.bodyLines.join(" ")}`).join("\n");
check("no deterministic / guaranteed claims in content", !/\b(guaranteed|100% (sure|true)|he will return|definitely will|cast a (love )?spell|loyalty magic)\b/i.test(contentText));
check("no copied-competitor markers in content", !/\b(co-star|the pattern app|copied from|stolen from)\b/i.test(contentText));

// Source scan
const src = readFileSync(new URL("../lib/zodiac/aphrodite-social-export-dashboard.ts", import.meta.url), "utf8");
const scanSrc = src.split("\n").filter((l) => {
  const t = l.trim();
  return !(t.startsWith("*") || t.startsWith("/*") || t.startsWith("//") || t.startsWith("*/"));
}).join("\n");
check("no platform API calls", !/graph\.facebook\.com|graph\.instagram\.com|api\.instagram\.com|open\.tiktokapis\.com|googleapis\.com\/youtube|api\.telegram\.org|sendMessage\(|publishPost\(/i.test(scanSrc));
check("no scraping code", !/puppeteer|playwright|cheerio|\bscrape\w*\(|headless|webdriver|selenium/i.test(scanSrc));
check("no credentials required", !/access_token\s*[:=]|client_secret|api_key\s*[:=]|password\s*[:=]|process\.env\.(IG|TIKTOK|YOUTUBE|INSTAGRAM)_/i.test(scanSrc));
check("no external fetch", !/\bfetch\(|axios|node-fetch|https?:\/\//i.test(scanSrc));
check("no database connection", !/DATABASE_URL|createClient\(|supabase|new Pool\(|prisma\./i.test(scanSrc));
check("no payment API", !/from ['"]stripe|new Stripe\b|sendInvoice\(|createInvoiceLink\(|successful_payment/i.test(scanSrc));

console.log("\nQA Finished: " + passed + " passed, " + failed + " failed.");
if (failed > 0) process.exit(1);
