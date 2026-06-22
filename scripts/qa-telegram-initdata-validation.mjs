import crypto from "crypto";
import { validateTelegramInitData } from "../lib/zodiac/telegram-initdata-validation.ts";

const FAKE_BOT_TOKEN = "123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11";

function buildFakeInitData(overrides = {}) {
  const params = new URLSearchParams();
  params.set("query_id", "AAF_..._FAKE");
  const user = {
    id: 123456789,
    first_name: "Test",
    last_name: "User",
    username: "testuser",
    language_code: "en"
  };
  params.set("user", JSON.stringify(user));
  params.set("auth_date", overrides.auth_date !== undefined ? overrides.auth_date.toString() : Math.floor(Date.now() / 1000).toString());
  
  // Custom properties
  for (const [k, v] of Object.entries(overrides)) {
    if (k !== "hash" && k !== "auth_date") {
      params.set(k, v);
    }
  }

  // Generate hash unless explicitly skipping
  if (overrides.hash !== false) {
    const keys = Array.from(params.keys()).sort();
    const dataCheckString = keys.map(k => `${k}=${params.get(k)}`).join("\n");
    const secretKey = crypto.createHmac("sha256", "WebAppData").update(FAKE_BOT_TOKEN).digest();
    const hash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
    if (typeof overrides.hash === "string") {
      params.set("hash", overrides.hash); // override with invalid hash
    } else {
      params.set("hash", hash);
    }
  }

  return params.toString();
}

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

  console.log("Starting Telegram initData Validation QA...\n");
  
  const now = Math.floor(Date.now() / 1000);
  
  // Test 1: Valid initData
  const validInitData = buildFakeInitData({ auth_date: now - 10 });
  const result1 = validateTelegramInitData(validInitData, { botToken: FAKE_BOT_TOKEN, maxAgeSeconds: 300, nowUnixSeconds: now });
  assert(result1.ok === true && result1.status === "valid", "Valid initData passes validation");

  // Test 2: Tampered initData (invalid hash)
  const invalidHashData = buildFakeInitData({ hash: "deadbeef" });
  const result2 = validateTelegramInitData(invalidHashData, { botToken: FAKE_BOT_TOKEN });
  assert(result2.ok === false && result2.status === "invalid-hash", "Tampered initData returns invalid-hash");

  // Test 3: Missing hash
  const missingHashData = buildFakeInitData({ hash: false });
  const result3 = validateTelegramInitData(missingHashData, { botToken: FAKE_BOT_TOKEN });
  assert(result3.ok === false && result3.status === "missing-hash", "Missing hash returns missing-hash");

  // Test 4: Expired auth_date
  const expiredData = buildFakeInitData({ auth_date: now - 1000 });
  const result4 = validateTelegramInitData(expiredData, { botToken: FAKE_BOT_TOKEN, maxAgeSeconds: 300, nowUnixSeconds: now });
  assert(result4.ok === false && result4.status === "expired", "Expired auth_date returns expired");

  // Test 5: Missing bot token
  const result5 = validateTelegramInitData(validInitData, { });
  assert(result5.ok === false && result5.status === "missing-bot-token", "Missing bot token returns missing-bot-token");

  console.log("");
  if (failed) {
    console.error("InitData Validation QA: FAIL");
    process.exit(1);
  } else {
    console.log("InitData Validation QA: PASS");
    process.exit(0);
  }
}

runQa().catch(err => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
