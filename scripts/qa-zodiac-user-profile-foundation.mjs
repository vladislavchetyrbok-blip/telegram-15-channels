import { mapTelegramUserToIdentity, createEmptyProfileDraft } from "../lib/zodiac/zodiac-user-profile-foundation.ts";

async function runQa() {
  let failed = false;
  function assert(condition, message) {
    if (!condition) {
      console.error(`❌ FAIL: ${message}`);
      failed = true;
    } else {
      console.log(`✅ PASS: ${message}`);
    }
  }

  console.log("Starting User Profile Foundation QA...\n");
  
  // Test 1: Map Telegram User
  const mockTelegramUser = {
    id: 987654321,
    first_name: "MockFirst",
    last_name: "MockLast",
    username: "mockuser",
    language_code: "ru",
    is_premium: true
  };
  
  const mapped = mapTelegramUserToIdentity(mockTelegramUser);
  assert(mapped.telegramUserId === "987654321", "Mapped telegramUserId correctly as string");
  assert(mapped.firstName === "MockFirst", "Mapped firstName correctly");
  assert(mapped.lastName === "MockLast", "Mapped lastName correctly");
  assert(mapped.username === "mockuser", "Mapped username correctly");
  assert(mapped.languageCode === "ru", "Mapped languageCode correctly");
  assert(mapped.isPremium === true, "Mapped isPremium correctly");

  // Test 2: Ensure no sensitive production DB fields generated
  assert(!mapped.hasOwnProperty("id"), "Mapped identity does not leak internal UUID/id");
  assert(!mapped.hasOwnProperty("accessToken"), "Mapped identity does not generate access tokens");
  assert(!mapped.hasOwnProperty("paymentId"), "Mapped identity does not generate payment ids");

  // Test 3: Create empty profile draft
  const draft = createEmptyProfileDraft();
  assert(draft.zodiacSign === undefined, "Empty draft zodiacSign is undefined");
  assert(draft.displayName === undefined, "Empty draft displayName is undefined");
  assert(draft.birthDate === undefined, "Empty draft birthDate is undefined");
  assert(draft.birthTime === undefined, "Empty draft birthTime is undefined");
  
  // Test 4: Ensure no payment/vip fields in draft
  assert(!draft.hasOwnProperty("isVip"), "Draft does not contain VIP status");
  assert(!draft.hasOwnProperty("subscriptionEndsAt"), "Draft does not contain subscription logic");
  assert(!draft.hasOwnProperty("starsBalance"), "Draft does not contain payments/stars balance");

  console.log("");
  if (failed) {
    console.error("User Profile Foundation QA: FAIL");
    process.exit(1);
  } else {
    console.log("User Profile Foundation QA: PASS");
    process.exit(0);
  }
}

runQa().catch(err => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
