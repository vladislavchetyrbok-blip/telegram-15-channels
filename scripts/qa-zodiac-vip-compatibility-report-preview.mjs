import {
  createVipCompatibilityReportMock
} from "../lib/zodiac/zodiac-vip-compatibility-report-foundation.ts";
import fs from "fs";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failed++;
  }
}

async function main() {
  console.log("Starting VIP Compatibility Report Preview QA...\n");

  const mockReport = createVipCompatibilityReportMock({
    firstSign: "Aries",
    secondSign: "Libra",
  });

  const hasFreePreview = mockReport.sections.some(s => s.previewLevel === "free-preview");
  assert(hasFreePreview, "mock report contains free-preview sections");

  const hasFutureVip = mockReport.sections.some(s => s.previewLevel === "future-vip");
  assert(hasFutureVip, "mock report contains future-vip sections");

  assert(mockReport.vipBoundaryNote.length > 0, "mock report has safe boundary note");

  const sourceCode = await fs.promises.readFile("./app/vip-compatibility-report/VipCompatibilityReportClient.tsx", "utf-8");
  
  assert(!sourceCode.includes("PrismaClient") && !sourceCode.includes("createClient"), "no database connection is required in preview client");
  assert(!sourceCode.includes("fetch(") && !sourceCode.includes("TELEGRAM_BOT_TOKEN"), "no Telegram token is required in preview client");
  assert(!sourceCode.includes("stripe.charges.create") && !sourceCode.includes("processPayment"), "no payment API is required in preview client");

  const activeCTAs = ["Buy ", "Subscribe ", "Unlock ", "Pay ", "Purchase ", "Activate VIP"];
  const hasActiveCTA = activeCTAs.some(cta => sourceCode.includes(cta));
  assert(!hasActiveCTA, "forbidden active CTA words are not present in preview labels");

  console.log(`\nQA Finished: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
