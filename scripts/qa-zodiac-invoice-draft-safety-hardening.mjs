import { createStarsInvoiceDraft } from "../lib/zodiac/zodiac-telegram-stars-invoice-draft.ts";
import { simulateSendInvoiceBoundary, simulateAnswerPreCheckoutQueryBoundary } from "../lib/zodiac/zodiac-invoice-draft-safety-hardening.ts";

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failCount++;
  }
}

async function run() {
  console.log("Starting Invoice Draft Safety Hardening QA...\n");

  const draft = createStarsInvoiceDraft({
    productCode: "vip_compatibility_deep_report",
    userRef: "test_safety_user_001"
  });

  // Test sendInvoice boundary
  const sendInvoiceResult = await simulateSendInvoiceBoundary(draft);
  
  assert(
    sendInvoiceResult.intercepted === true,
    "mock sendInvoice intercepts execution"
  );
  
  assert(
    sendInvoiceResult.success === false,
    "mock sendInvoice blocks success"
  );

  assert(
    sendInvoiceResult.rejectionReason === "LIVE_SEND_NOT_ALLOWED",
    "mock sendInvoice correctly rejects due to LIVE_SEND_NOT_ALLOWED"
  );

  // Test pre-checkout boundary
  const preCheckoutResult = await simulateAnswerPreCheckoutQueryBoundary("test_query_999");

  assert(
    preCheckoutResult.intercepted === true,
    "mock answerPreCheckoutQuery intercepts execution"
  );
  
  assert(
    preCheckoutResult.success === false,
    "mock answerPreCheckoutQuery blocks success"
  );

  assert(
    preCheckoutResult.rejectionReason === "LIVE_SEND_NOT_ALLOWED",
    "mock answerPreCheckoutQuery rejects live queries"
  );

  // General assertions
  assert(
    !process.env.TELEGRAM_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN.length === 0,
    "no Telegram token is required"
  );

  assert(
    !process.env.DATABASE_URL || process.env.DATABASE_URL.length === 0,
    "no database connection is required"
  );

  console.log(`\nQA Finished: ${passCount} passed, ${failCount} failed.\n`);
  if (failCount > 0) {
    process.exit(1);
  }
}

run().catch(err => {
  console.error("Unhandled error in QA script:", err);
  process.exit(1);
});
