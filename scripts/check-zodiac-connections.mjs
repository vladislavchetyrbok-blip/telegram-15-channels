import process from "process";
import fs from "fs";

try {
  process.loadEnvFile(".env.local");
} catch (e) {
  // Ignored if missing
}

const EXPECTED_CHANNELS = [
  { id: "zodiac-general", env: "ZODIAC_GENERAL_CHANNEL_ID" },
  { id: "aries", env: "ZODIAC_ARIES_CHANNEL_ID" },
  { id: "taurus", env: "ZODIAC_TAURUS_CHANNEL_ID" },
  { id: "gemini", env: "ZODIAC_GEMINI_CHANNEL_ID" },
  { id: "cancer", env: "ZODIAC_CANCER_CHANNEL_ID" },
  { id: "leo", env: "ZODIAC_LEO_CHANNEL_ID" },
  { id: "virgo", env: "ZODIAC_VIRGO_CHANNEL_ID" },
  { id: "libra", env: "ZODIAC_LIBRA_CHANNEL_ID" },
  { id: "scorpio", env: "ZODIAC_SCORPIO_CHANNEL_ID" },
  { id: "sagittarius", env: "ZODIAC_SAGITTARIUS_CHANNEL_ID" },
  { id: "capricorn", env: "ZODIAC_CAPRICORN_CHANNEL_ID" },
  { id: "aquarius", env: "ZODIAC_AQUARIUS_CHANNEL_ID" },
  { id: "pisces", env: "ZODIAC_PISCES_CHANNEL_ID" }
];

async function run() {
  console.log("=== Zodiac Telegram Connections Check ===\n");

  let ok = true;
  let botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    console.error("❌ TELEGRAM_BOT_TOKEN is missing in environment.");
    ok = false;
  } else {
    console.log("✅ TELEGRAM_BOT_TOKEN is present (hidden for security).");
    // Optionally call getMe
    try {
      const resp = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
      const data = await resp.json();
      if (data.ok) {
        console.log(`✅ Bot Token authenticated successfully. Bot Name: @${data.result.username}`);
      } else {
        console.error("❌ Bot Token is invalid or Telegram API error.");
        ok = false;
      }
    } catch (err) {
      console.error(`❌ Failed to verify Bot Token: ${err.message}`);
      ok = false;
    }
  }

  console.log("\n--- Channel Mappings ---");
  let missingChannels = [];
  
  for (const channel of EXPECTED_CHANNELS) {
    const val = process.env[channel.env];
    if (!val) {
      console.error(`❌ Missing ${channel.env} for ${channel.id}`);
      missingChannels.push(channel.env);
      ok = false;
    } else {
      console.log(`✅ ${channel.env} is configured.`);
    }
  }

  console.log("");
  if (!ok) {
    console.error("Zodiac connections are NOT fully ready.");
    if (missingChannels.length > 0) {
      console.error(`Missing channel IDs: ${missingChannels.length}`);
    }
    process.exit(1);
  } else {
    console.log("All required Zodiac Telegram connections are properly configured!");
    process.exit(0);
  }
}

run();
