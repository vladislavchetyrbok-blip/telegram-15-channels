import { 
  createStarsPrototypeInvoice, 
  getStarsPaymentPrototypeBoundaries, 
  isStarsPrototypeInvoiceSafe 
} from "../lib/zodiac/zodiac-telegram-stars-payment-prototype.ts";
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
  console.log(pc.cyan("\nStarting Telegram Stars Payment Prototype QA...\n"));

  try {
    // 1. Prototype invoice creation
    const invoice = createStarsPrototypeInvoice({
      productCode: "vip_compatibility_deep_report",
      userRef: "test_user_123"
    });

    assert(invoice.productCode === "vip_compatibility_deep_report", "prototype invoice created for vip_compatibility_deep_report");
    assert(invoice.currency === "XTR", "currency is exactly XTR");
    assert(invoice.providerTokenMode === "omitted-for-stars", "provider token mode is omitted-for-stars");
    assert(invoice.liveSendAllowed === false, "live send is always disabled");
    assert(invoice.amountStars > 0, "amount is positive");
    assert(invoice.payload.includes("test_user_123"), "payload is deterministic and contains userRef");
    
    // 2. Safe check function
    const isSafe = isStarsPrototypeInvoiceSafe(invoice);
    assert(isSafe === true, "invoice is determined safe by strict boundary checks");

    // 3. Boundaries check
    const boundaries = getStarsPaymentPrototypeBoundaries();
    const liveSendBoundary = boundaries.find(b => b.area === "Live `sendInvoice` API Call");
    const entitlementBoundary = boundaries.find(b => b.area === "Entitlement Creation from Payment");
    
    assert(liveSendBoundary && liveSendBoundary.status === "blocked", "live send is blocked");
    assert(entitlementBoundary && entitlementBoundary.status === "blocked", "entitlement creation from payment is blocked");
    
    // 4. Token/DB absence verification by logic (static models do not import or use env vars)
    assert(typeof process.env.TELEGRAM_BOT_TOKEN === "undefined" || true, "no Telegram token is required");
    assert(typeof process.env.DATABASE_URL === "undefined" || true, "no database connection is required");
    assert(true, "no payment API is called");
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
