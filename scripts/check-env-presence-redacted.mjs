#!/usr/bin/env node

function presence(name) {
  return process.env[name] ? "present" : "missing";
}

console.log(`DATABASE_URL: ${presence("DATABASE_URL")}`);
console.log(`TELEGRAM_BOT_TOKEN: ${presence("TELEGRAM_BOT_TOKEN")}`);
