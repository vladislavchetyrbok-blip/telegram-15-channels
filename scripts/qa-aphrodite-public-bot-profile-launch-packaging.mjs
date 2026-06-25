import {
  getAphroditePublicLaunchCopy,
  getAphroditePublicLaunchChecklist,
  getAphroditePublicLaunchDeepLinks,
  getAphroditePublicLaunchBoundaries,
  getAphroditePublicLaunchNextSteps,
} from "../lib/zodiac/aphrodite-public-bot-profile-launch-packaging.ts";
import { readFileSync } from "node:fs";

let passed = 0, failed = 0;
function check(name, cond) {
  if (cond) { passed++; console.log("✅ PASS: " + name); }
  else { failed++; console.log("❌ FAIL: " + name); }
}

console.log("Starting Aphrodite Public Bot Launch Packaging QA...\n");

const copy = getAphroditePublicLaunchCopy();
check("public launch copy exists", Array.isArray(copy) && copy.length > 0);
const checklist = getAphroditePublicLaunchChecklist();
check("checklist exists", Array.isArray(checklist) && checklist.length > 0);
const deepLinks = getAphroditePublicLaunchDeepLinks();
check("deep links exist", Array.isArray(deepLinks) && deepLinks.length >= 5);
const boundaries = getAphroditePublicLaunchBoundaries();
check("boundaries exist", Array.isArray(boundaries) && boundaries.length >= 3);
const nextSteps = getAphroditePublicLaunchNextSteps();
check("next steps exist", Array.isArray(nextSteps) && nextSteps.length >= 1);

const types = new Set(copy.map((c) => c.assetType));
check("bot name copy exists", copy.some((c) => c.assetType === "bot-name"));
check("bot description copy exists", copy.some((c) => c.assetType === "bot-description"));
check("main mini app title exists", copy.some((c) => c.assetType === "main-mini-app-title"));
check("support note exists", copy.some((c) => c.assetType === "support-link"));
check("terms note exists", copy.some((c) => c.assetType === "terms-link"));
check("privacy note exists", copy.some((c) => c.assetType === "privacy-note"));

check("manual owner review is required", checklist.some((c) => /owner review/i.test(c.area + " " + c.task) && c.status === "ready-for-owner-review"));

// deep link previews for the 5 pillars
const params = new Set(deepLinks.map((d) => d.startParam));
for (const sp of ["love_reading","soulmate_scanner","red_flags","future_timeline","daily_message"]) check("deep link preview: " + sp, params.has(sp));

// CTA safety
const allCtas = [...deepLinks.map((d) => d.safeCta), ...copy.map((c) => c.recommendedCopy)];
check("no payment CTA in copy/deep-links", allCtas.every((t) => !/\b(buy|subscribe|unlock|purchase|pay now|checkout|upgrade now)\b/i.test(t)));

const src = readFileSync(new URL("../lib/zodiac/aphrodite-public-bot-profile-launch-packaging.ts", import.meta.url), "utf8");
const scanSrc = src.split("\n").filter((l) => {
  const t = l.trim();
  if (t.startsWith("*") || t.startsWith("/*") || t.startsWith("//") || t.startsWith("*/")) return false;
  if (t.includes("blockedClaims:") || t.includes("BLOCKED_CLAIMS")) return false; // guardrail data
  return true;
}).join("\n");
check("no Telegram API calls", !/api\.telegram\.org|sendMessage\(|setMyCommands\(|setChatMenuButton\(|bot<token>|TELEGRAM_BOT_TOKEN/i.test(scanSrc));
check("no BotFather mutation code", !/botfather.*\.(set|update|create)\(|setMyName\(|setMyDescription\(|setMyShortDescription\(/i.test(scanSrc));
check("no account credentials", !/access_token\s*[:=]|client_secret|api_key\s*[:=]|password\s*[:=]|process\.env\./i.test(scanSrc));
check("no database connection", !/DATABASE_URL|createClient\(|supabase|new Pool\(|prisma\./i.test(scanSrc));
check("no external fetch", !/\bfetch\(|axios|node-fetch|https?:\/\//i.test(scanSrc));
check("no production launch code", !/deploy\(|publishProduction\(|goLive\(|launchProduction\(/i.test(scanSrc));
check("no payment API", !/from ['"]stripe|new Stripe\b|sendInvoice\(|createInvoiceLink\(|successful_payment/i.test(scanSrc));

// content scans
const contentText = copy.map((c) => c.recommendedCopy).join("\n");
check("no deterministic / guaranteed claims in copy", !/\b(guaranteed|100% (sure|true)|he will return|definitely will|cast a (love )?spell|loyalty magic)\b/i.test(contentText));
check("no copied-competitor markers in copy", !/\b(co-star|the pattern app|copied from|stolen from)\b/i.test(contentText));

console.log("\nQA Finished: " + passed + " passed, " + failed + " failed.");
if (failed > 0) process.exit(1);
