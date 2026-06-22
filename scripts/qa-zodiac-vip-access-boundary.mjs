import {
  evaluateVipAccess,
  createPreviewAccessResult
} from "../lib/zodiac/zodiac-vip-access-boundary.ts";
import { createPreviewEntitlementDraft, createPendingPaymentEntitlementDraft } from "../lib/zodiac/zodiac-entitlement-foundation.ts";

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
  console.log("Starting VIP Access Boundary QA...\n");

  const productCode = "test-product-daily";
  const userRef = "test-user-123";

  const previewResult = createPreviewAccessResult(productCode);
  assert(previewResult.allowed === true && previewResult.decision === "allow-preview", "preview result allows preview but not paid VIP");

  const missingResult = evaluateVipAccess({ productCode });
  assert(missingResult.allowed === false && missingResult.decision === "deny-missing-entitlement", "missing entitlement denies access");

  const pendingDraft = createPendingPaymentEntitlementDraft({ userRef, productCode, accessType: "one-time-report" });
  const pendingResult = evaluateVipAccess({ productCode, entitlement: pendingDraft });
  assert(pendingResult.allowed === false && pendingResult.decision === "deny-pending-payment", "pending-payment denies access");

  const activeNoExpiry = { ...pendingDraft, status: "active" };
  const activeNoExpiryResult = evaluateVipAccess({ productCode, entitlement: activeNoExpiry });
  assert(activeNoExpiryResult.allowed === true && activeNoExpiryResult.decision === "allow-vip", "active entitlement with no expiry allows VIP");

  const futureIso = new Date(Date.now() + 86400000).toISOString();
  const activeFutureExpiry = { ...activeNoExpiry, expiresAt: futureIso };
  const activeFutureExpiryResult = evaluateVipAccess({ productCode, entitlement: activeFutureExpiry, nowIso: new Date().toISOString() });
  assert(activeFutureExpiryResult.allowed === true && activeFutureExpiryResult.decision === "allow-vip", "active entitlement with future expiry allows VIP");

  const pastIso = new Date(Date.now() - 86400000).toISOString();
  const activePastExpiry = { ...activeNoExpiry, expiresAt: pastIso };
  const activePastExpiryResult = evaluateVipAccess({ productCode, entitlement: activePastExpiry, nowIso: new Date().toISOString() });
  assert(activePastExpiryResult.allowed === false && activePastExpiryResult.decision === "deny-expired", "active entitlement with past expiry denies VIP");

  const refunded = { ...activeNoExpiry, status: "refunded" };
  const refundedResult = evaluateVipAccess({ productCode, entitlement: refunded });
  assert(refundedResult.allowed === false && refundedResult.decision === "deny-refunded", "refunded entitlement denies VIP");

  const revoked = { ...activeNoExpiry, status: "revoked" };
  const revokedResult = evaluateVipAccess({ productCode, entitlement: revoked });
  assert(revokedResult.allowed === false && revokedResult.decision === "deny-revoked", "revoked entitlement denies VIP");

  const unsupportedResult = evaluateVipAccess({ productCode: "wrong-product", entitlement: activeNoExpiry });
  assert(unsupportedResult.allowed === false && unsupportedResult.decision === "deny-unsupported-product", "unsupported product denies VIP");

  // Check strict boundary assertions
  const sourceCode = await import("fs").then(fs => fs.promises.readFile("./lib/zodiac/zodiac-vip-access-boundary.ts", "utf-8"));
  assert(!sourceCode.includes("PrismaClient") && !sourceCode.includes("createClient"), "no database connection is required");
  assert(!sourceCode.includes("fetch(") && !sourceCode.includes("TELEGRAM_BOT_TOKEN"), "no Telegram token is required");
  assert(!sourceCode.includes("stripe.charges.create") && !sourceCode.includes("processPayment"), "no payment API is required");

  console.log(`\nQA Finished: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
