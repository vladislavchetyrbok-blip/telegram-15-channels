import {
  createVipCompatibilityReportMock,
  getVipCompatibilityReportSections,
  getVipCompatibilityProductBoundaries
} from "../lib/zodiac/zodiac-vip-compatibility-report-foundation.ts";

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
  console.log("Starting VIP Compatibility Report Foundation QA...\n");

  const mockReport = createVipCompatibilityReportMock({
    firstSign: "Aries",
    secondSign: "Libra",
  });

  assert(mockReport.headline.includes("Aries") && mockReport.headline.includes("Libra"), "mock report can be generated for two signs");
  assert(mockReport.headline.length > 0, "report contains headline");
  assert(mockReport.sections.length > 0, "report contains sections");
  
  const hasFreePreview = mockReport.sections.some(s => s.previewLevel === "free-preview");
  assert(hasFreePreview, "report contains free-preview sections");

  const hasFutureVip = mockReport.sections.some(s => s.previewLevel === "future-vip");
  assert(hasFutureVip, "report contains future-vip sections");

  assert(mockReport.vipBoundaryNote.length > 0, "report includes VIP boundary note");

  const sourceCode = await import("fs").then(fs => fs.promises.readFile("./lib/zodiac/zodiac-vip-compatibility-report-foundation.ts", "utf-8"));
  assert(!sourceCode.includes("PrismaClient") && !sourceCode.includes("createClient"), "no database connection is required");
  assert(!sourceCode.includes("fetch(") && !sourceCode.includes("TELEGRAM_BOT_TOKEN"), "no Telegram token is required");
  assert(!sourceCode.includes("stripe.charges.create") && !sourceCode.includes("processPayment"), "no payment API is required");

  // Soft check for hard claims
  const hardClaims = ["will fail", "destined forever", "will break up"];
  const hasHardClaims = hardClaims.some(claim => sourceCode.toLowerCase().includes(claim));
  assert(!hasHardClaims, "content avoids banned hard-claim phrases");

  console.log(`\nQA Finished: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
