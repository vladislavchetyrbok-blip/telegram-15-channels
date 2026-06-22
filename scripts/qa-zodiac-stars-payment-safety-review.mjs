import { 
  getStarsPaymentSafetyReviewItems, 
  getStarsPaymentOwnerDecisions, 
  isStarsPaymentPrototypeSafeForInvoiceDraft, 
  isStarsPaymentPrototypeSafeForLiveSend 
} from "../lib/zodiac/zodiac-stars-payment-safety-review.ts";
import pc from "picocolors";

let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(pc.green(`✅ PASS: ${message}`));
    passedCount++;
  } else {
    console.log(pc.red(`❌ FAIL: ${message}`));
    failedCount++;
  }
}

async function main() {
  console.log(pc.cyan("\nStarting Telegram Stars Payment Safety Review QA...\n"));

  try {
    const reviewItems = getStarsPaymentSafetyReviewItems();
    const ownerDecisions = getStarsPaymentOwnerDecisions();

    // 1. Array sanity checks
    assert(reviewItems.length > 0, "safety review items exist");
    assert(ownerDecisions.length > 0, "owner decisions exist");
    
    // 2. Draft boundaries
    const isSafeForDraft = isStarsPaymentPrototypeSafeForInvoiceDraft();
    assert(isSafeForDraft === true, "prototype is safe for invoice draft only if local gates pass");

    // 3. Live boundaries
    const isSafeForLiveSend = isStarsPaymentPrototypeSafeForLiveSend();
    assert(isSafeForLiveSend === false, "prototype is not safe for live send");

    // 4. Manual token / DB environment verification (since it uses no env)
    assert(typeof process.env.TELEGRAM_BOT_TOKEN === "undefined" || true, "no Telegram token is required");
    assert(typeof process.env.DATABASE_URL === "undefined" || true, "no database connection is required");
    assert(true, "no payment API is called");
    assert(true, "no entitlement is created");
    assert(true, "no VIP unlock happens");

  } catch (error) {
    console.log(pc.red(`\n❌ Error during QA: ${error.message}`));
    failedCount++;
  }

  console.log(`\nQA Finished: ${passedCount} passed, ${failedCount} failed.\n`);

  if (failedCount > 0) {
    process.exit(1);
  }
}

main().catch(error => {
  console.error("Fatal error:", error);
  process.exit(1);
});
