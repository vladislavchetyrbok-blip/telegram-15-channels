#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";

import { gitChangedNames } from "./lib/qa-git-scope.mjs";

let passed = 0;
let failed = 0;

function check(name, condition) {
  if (condition) {
    passed += 1;
    console.log("SUCCESS: " + name);
  } else {
    failed += 1;
    console.log("FAIL: " + name);
  }
}

function read(rel) {
  return readFileSync(new URL(rel, import.meta.url), "utf8");
}

function exists(rel) {
  return existsSync(new URL(rel, import.meta.url));
}

console.log("Starting QA: Aphrodite Compact Mobile UX / Short Copy Pass...\n");

const livePaths = [
  "../app/miniapp/page.tsx",
  "../app/birth-matrix/BirthMatrixClient.tsx",
  "../app/vip-preview/page.tsx",
  "../app/vip-compatibility-report/VipCompatibilityReportClient.tsx",
  "../components/ZodiacCompatibilityMiniApp.tsx",
  "../components/ZodiacMysticSections.tsx",
  "../components/ZodiacVipSections.tsx",
  "../components/zodiac-mini-app/AphroditeHomeScreen.tsx",
  "../components/zodiac-mini-app/MainMenuSections.tsx",
  "../components/zodiac-mini-app/MiniAppHeader.tsx",
  "../components/zodiac-mini-app/ProfileRetentionPanel.tsx",
  "../components/zodiac-mini-app/ResultCards.tsx",
  "../components/zodiac-mini-app/SoftLaunchFeedbackPanel.tsx",
  "../components/zodiac-mini-app/feature-tabs.ts",
  "../components/zodiac-mini-app/aphrodite-design-system/AphroditeLockedPreviewCard.tsx",
  "../components/zodiac-mini-app/aphrodite-design-system/AphroditeMysticCardPreview.tsx",
  "../components/zodiac-mini-app/aphrodite-design-system/AphroditeShareCard.tsx",
];

for (const path of livePaths) {
  check(`${path} exists`, exists(path));
}

const liveBundle = livePaths.map((path) => (exists(path) ? read(path) : "")).join("\n");

check("bottom nav uses short Прогноз label", liveBundle.includes('label: "Прогноз"') && liveBundle.includes('shortLabel: "Прогноз"'));
check("bottom nav avoids Прогнозы shortLabel", !liveBundle.includes('shortLabel: "Прогнозы"'));
check("Russian short safety copy is present", /Без оплаты|VIP закрыт|Preview/.test(liveBundle));
check("Mystic Cards label replaced for live preview", liveBundle.includes("Мистическая карта"));
check("short card copy avoids old dominant English safety text", !/Full relationship report|Full compatibility report|VIP locked preview|No active payment\. No VIP unlock|Owner review required/i.test(liveBundle));
check("technical English card labels are not visible", !/CARD MEANING|INTERPRETATION|>WARNING<|Mystic Cards/.test(liveBundle));
check("home keeps main compatibility action", liveBundle.includes("Проверить совместимость"));
check("compact sign selector uses shorter min-height", /min-h-\[58px\]/.test(read("../components/zodiac-mini-app/MiniAppHeader.tsx")));
check("compact home rows use shorter min-height", /min-h-\[58px\]/.test(read("../components/zodiac-mini-app/AphroditeHomeScreen.tsx")) || /min-h-\[58px\]/.test(read("../components/zodiac-mini-app/MiniAppHeader.tsx")));
check("publicLaunchApproved remains false in project models", !/publicLaunchApproved:\s*true|publicLaunchApproved=true/.test(liveBundle));
check("ownerManualReviewRequired is not disabled", !/ownerManualReviewRequired:\s*false|ownerManualReviewRequired=false/.test(liveBundle));

const riskyChanges = gitChangedNames([
  ".github",
  "vercel.json",
  "scripts/publish-zodiac-by-date.mjs",
  "scripts/publish-zodiac-weekly-by-week.mjs",
  "scripts/zodiac-telegram-publisher.mjs",
  "scripts/publish-due.mjs",
  "scripts/publish-due-json.mjs",
  "package.json",
  "prisma",
  "supabase",
  "migrations",
  "schema.prisma",
  ".env",
  ".env.local",
  ".env.production",
]);
check("no workflow/cron/publish/package/db/env files changed", riskyChanges.length === 0);
if (riskyChanges.length) {
  console.log("Unexpected risky changed files:", riskyChanges.join(", "));
}

check("no hardcoded secret-looking values", !/(postgres(?:ql)?:\/\/|mysql:\/\/|mongodb(?:\+srv)?:\/\/|redis:\/\/|amqp:\/\/|https:\/\/api\.telegram\.org\/bot\d+:[A-Za-z0-9_-]+|\b\d{6,12}:[A-Za-z0-9_-]{30,}\b|(?:sk|pk|rk)_(?:live|test)_[A-Za-z0-9]{16,}|gh[pousr]_[A-Za-z0-9]{30,}|xox[baprs]-[A-Za-z0-9-]{20,}|AIza[0-9A-Za-z_-]{20,}|ya29\.[0-9A-Za-z_-]{20,}|SG\.[0-9A-Za-z_-]{16,})/i.test(liveBundle));
check("no Telegram API implementation", !/fetch\([^)]*api\.telegram\.org|sendMessage\s*\(|sendPhoto\s*\(|sendDocument\s*\(|sendInvoice\s*\(|createInvoiceLink\s*\(|answerPreCheckoutQuery\s*\(/i.test(liveBundle));
check("no DB/storage write implementation", !/prisma\.[a-zA-Z0-9_]+\.(create|update|delete|upsert)|from\([^)]*\)\.(insert|update|delete|upsert)\(|supabase\.[a-zA-Z0-9_]+\.(insert|update|delete|upsert)|events\.insert|localStorage\.setItem|sessionStorage\.setItem/i.test(liveBundle));
check("no payment or VIP implementation", !/from ['"]stripe|new Stripe\b|sendInvoice\s*\(|createInvoiceLink\s*\(|createEntitlement\s*\(|grantVip\s*\(|unlockVip\s*\(|allowed=true|productionPaymentAllowedNow=true/i.test(liveBundle));
check("no external analytics implementation", !/posthog|amplitude|gtag|GoogleAnalytics|navigator\.sendBeacon/i.test(liveBundle));

console.log(`\nAphrodite Compact Mobile UX / Short Copy Pass QA complete: ${passed} passed, ${failed} failed.`);

if (failed > 0) {
  process.exit(1);
}
