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
  let botId = null;

  if (!botToken) {
    console.error("❌ Token missing (TELEGRAM_BOT_TOKEN is not set).");
    ok = false;
  } else {
    console.log("✅ Token configured (hidden for security).");
    try {
      const resp = await fetch(`https://api.telegram.org/bot${botToken}/getMe`);
      const data = await resp.json();
      if (data.ok) {
        botId = data.result.id;
        console.log(`✅ Bot Token authenticated. Bot: @${data.result.username}`);
      } else {
        console.error("❌ Token invalid or Telegram API error.");
        ok = false;
      }
    } catch (err) {
      console.error(`❌ Failed to verify Bot Token: ${err.message}`);
      ok = false;
    }
  }

  console.log("\n--- Channel Health & Diagnostics ---");
  
  for (const channel of EXPECTED_CHANNELS) {
    const val = process.env[channel.env];
    if (!val) {
      console.error(`❌ Channel missing: ${channel.env} is not set for ${channel.id}.`);
      ok = false;
      continue;
    }
    
    if (!botToken || !botId) {
      console.log(`⚠️ ${channel.id}: configured as ${val}, skipping API checks (no bot token).`);
      continue;
    }

    try {
      const resp = await fetch(`https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${val}&user_id=${botId}`);
      const data = await resp.json();

      if (data.ok) {
        const status = data.result.status;
        if (status === "administrator" || status === "creator") {
          console.log(`✅ ${channel.id} is healthy (bot is admin).`);
        } else {
          console.error(`❌ Bot is not admin in ${channel.id} (status: ${status}).`);
          ok = false;
        }
      } else {
        if (data.description.includes("chat not found")) {
          console.error(`❌ Invalid channel id: ${val} for ${channel.id}.`);
        } else if (data.description.includes("member list is inaccessible")) {
          console.error(`❌ Bot cannot access chat: ${channel.id}. Add bot as admin first.`);
        } else {
          console.error(`❌ Bot cannot access chat: ${channel.id} (${data.description}).`);
        }
        ok = false;
      }
    } catch (err) {
      console.error(`❌ API Error for ${channel.id}: ${err.message}`);
      ok = false;
    }
  }

  console.log("");
  if (!ok) {
    console.error("Zodiac connections are NOT fully ready.");
    process.exit(1);
  } else {
    console.log("All required Zodiac Telegram connections are healthy and verified!");
    process.exit(0);
  }
}

run();
