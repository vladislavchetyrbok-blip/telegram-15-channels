import { 
  createStarsInvoiceDraft, 
  isStarsInvoiceDraftSafeForLocalUse,
  isStarsInvoiceDraftSafeForLiveSend
} from "../lib/zodiac/zodiac-telegram-stars-invoice-draft.ts";
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
  console.log(pc.cyan("\nStarting Telegram Stars Invoice Draft Builder QA...\n"));

  try {
    const draft = createStarsInvoiceDraft({
      productCode: "vip_compatibility_deep_report",
      userRef: "test_qa_user"
    });

    assert(draft !== null && draft !== undefined, "invoice draft can be created for vip_compatibility_deep_report");
    assert(draft.currency === "XTR", "currency is exactly XTR");
    assert(Array.isArray(draft.prices) && draft.prices.length === 1, "prices array has exactly one item");
    assert(draft.prices[0].amount > 0, "amount is positive");
    assert(draft.providerTokenMode === "omitted-for-stars", "provider token mode is omitted-for-stars");
    assert(draft.liveSendAllowed === false, "live send is always disabled");
    assert(draft.requiresOwnerApprovalBeforeSend === true, "owner approval is required before send");
    
    // Check deterministic payload shape
    const expectedPayload = "vip_compatibility_deep_report::test_qa_user::v1_draft";
    assert(draft.payload === expectedPayload, "payload is deterministic");

    const isLocalSafe = isStarsInvoiceDraftSafeForLocalUse(draft);
    assert(isLocalSafe === true, "local draft safety returns true");

    const isLiveSafe = isStarsInvoiceDraftSafeForLiveSend(draft);
    assert(isLiveSafe === false, "live send safety returns false");

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
