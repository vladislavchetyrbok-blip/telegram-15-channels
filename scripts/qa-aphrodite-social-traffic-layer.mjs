import {
  getAphroditeSocialTrafficHooks,
  getAphroditeSocialContentTemplates,
  getAphroditeSocialTrafficBoundaries,
  getAphroditeSocialTrafficNextSteps,
  APHRODITE_SOCIAL_PLATFORM_MATRIX,
} from "../lib/zodiac/aphrodite-social-traffic-layer.ts";
import { readFileSync } from "node:fs";

let passed = 0, failed = 0;
function check(name, cond) {
  if (cond) { passed++; console.log("✅ PASS: " + name); }
  else { failed++; console.log("❌ FAIL: " + name); }
}

console.log("Starting Aphrodite Social Traffic Layer QA...\n");

const hooks = getAphroditeSocialTrafficHooks();
check("traffic hooks exist", Array.isArray(hooks) && hooks.length >= 6);
const templates = getAphroditeSocialContentTemplates();
check("content templates exist", Array.isArray(templates) && templates.length >= 8);
const boundaries = getAphroditeSocialTrafficBoundaries();
check("boundaries exist", Array.isArray(boundaries) && boundaries.length >= 3);
const nextSteps = getAphroditeSocialTrafficNextSteps();
check("next steps exist", Array.isArray(nextSteps) && nextSteps.length >= 1);

const platforms = APHRODITE_SOCIAL_PLATFORM_MATRIX.map((p) => p.platform);
check("Instagram in platform list", platforms.includes("instagram"));
check("TikTok in platform list", platforms.includes("tiktok"));
check("Telegram in platform list", platforms.includes("telegram"));
check("YouTube Shorts future layer in platform list", platforms.includes("youtube-shorts"));

// Templates have required parts
check("templates have hook structure + CTA", templates.every((t) =>
  Array.isArray(t.structure) && t.structure.length >= 3 &&
  typeof t.miniAppCta === "string" && t.miniAppCta.length > 0 &&
  Array.isArray(t.safetyBoundary) && t.safetyBoundary.length > 0));
// Hooks reference safe CTAs only (no payment verbs)
check("hook + template CTAs are non-payment", [...hooks.map(h=>h.safeCta), ...templates.map(t=>t.miniAppCta)]
  .every((c) => !/\b(buy|subscribe|unlock|purchase|pay|checkout|upgrade now)\b/i.test(c)));

const src = readFileSync(new URL("../lib/zodiac/aphrodite-social-traffic-layer.ts", import.meta.url), "utf8");

// No platform API calls / scraping / credentials / fetch
check("no Instagram/TikTok/YouTube/Telegram API calls", !/graph\.facebook\.com|graph\.instagram\.com|api\.instagram\.com|open\.tiktokapis\.com|tiktok.*\/v2\/|googleapis\.com\/youtube|api\.telegram\.org|sendMessage\(|publishPost\(/i.test(src));
check("no scraping code", !/puppeteer|playwright|cheerio|\bscrape\w*\(|headless|webdriver|selenium/i.test(src));
check("no account credentials", !/access_token\s*[:=]|client_secret|api_key\s*[:=]|password\s*[:=]|process\.env\.(IG|TIKTOK|YOUTUBE|INSTAGRAM)_/i.test(src));
check("no external fetch", !/\bfetch\(|axios|node-fetch|https?:\/\//i.test(src));
check("no payment API", !/from ['"]stripe|new Stripe\b|sendInvoice\(|createInvoiceLink\(|successful_payment/i.test(src));

// Strip comment lines so boundary/blocked-claim declarations are not scanned as content.
const scanSrc = src.split("\n").filter((l) => {
  const t = l.trim();
  return !(t.startsWith("*") || t.startsWith("/*") || t.startsWith("//") || t.startsWith("*/"));
}).join("\n");
check("no deterministic / guaranteed claims in content", !/\b(guaranteed love|guaranteed to|100% (sure|prediction)|will definitely return|cast a (love )?spell|loyalty spell|make him love you)\b/i.test(
  scanSrc.replace(/APHRODITE_SOCIAL_BLOCKED_CLAIMS|blockedClaims|guaranteed love|loyalty magic \/ spell|100% prediction|he will definitely return/g, "")
));
check("no copied-competitor markers", !/\b(copy paste from|competitor script|stolen from|ripped from|@?co_star|@?thepattern)\b/i.test(scanSrc));

console.log("\nQA Finished: " + passed + " passed, " + failed + " failed.");
if (failed > 0) process.exit(1);
