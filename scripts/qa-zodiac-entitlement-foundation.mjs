import {
  createPreviewEntitlementDraft,
  createPendingPaymentEntitlementDraft,
  isEntitlementActive,
} from "../lib/zodiac/zodiac-entitlement-foundation.ts";

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
  console.log("Starting Entitlement Foundation QA...\n");

  const userRef = "test-user-123";
  const productCode = "test-product-daily";

  const previewDraft = createPreviewEntitlementDraft({ userRef, productCode });
  assert(previewDraft.status === "active", "preview entitlement draft is created safely");
  assert(!isEntitlementActive(previewDraft), "preview-only should not be treated as paid VIP access");

  const pendingDraft = createPendingPaymentEntitlementDraft({
    userRef,
    productCode,
    accessType: "one-time-report",
  });
  assert(pendingDraft.status === "pending-payment", "pending-payment entitlement draft is created safely");
  assert(!isEntitlementActive(pendingDraft), "pending-payment entitlement is not active");

  const activeNoExpiry = { ...pendingDraft, status: "active" };
  assert(isEntitlementActive(activeNoExpiry), "active entitlement with no expiry is active");

  const futureIso = new Date(Date.now() + 86400000).toISOString();
  const activeFutureExpiry = { ...activeNoExpiry, expiresAt: futureIso };
  assert(isEntitlementActive(activeFutureExpiry), "active entitlement with future expiry is active");

  const pastIso = new Date(Date.now() - 86400000).toISOString();
  const activePastExpiry = { ...activeNoExpiry, expiresAt: pastIso };
  assert(!isEntitlementActive(activePastExpiry), "active entitlement with past expiry is not active");

  const refunded = { ...activeNoExpiry, status: "refunded" };
  assert(!isEntitlementActive(refunded), "refunded entitlement is not active");

  const revoked = { ...activeNoExpiry, status: "revoked" };
  assert(!isEntitlementActive(revoked), "revoked entitlement is not active");

  // Check strict boundary assertions
  const sourceCode = await import("fs").then(fs => fs.promises.readFile("./lib/zodiac/zodiac-entitlement-foundation.ts", "utf-8"));
  assert(!sourceCode.includes("PrismaClient") && !sourceCode.includes("createClient"), "no DB connection required");
  assert(!sourceCode.includes("fetch(") && !sourceCode.includes("TELEGRAM_BOT_TOKEN"), "no Telegram token is required");
  assert(!sourceCode.includes("stripe.charges.create") && !sourceCode.includes("processPayment"), "no payment API call is required");

  console.log(`\nQA Finished: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
