#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const failures = [];
let passed = 0;

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`${relativePath}: file is missing`);
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function check(label, condition) {
  if (condition) {
    passed += 1;
    return;
  }
  failures.push(label);
}

const miniApp = read("components/ZodiacCompatibilityMiniApp.tsx");
const profileFields = read("components/zodiac-mini-app/AphroditePersonalProfileFields.tsx");
const profileStorage = read("components/zodiac-mini-app/personal-profile.ts");
const profilePanel = read("components/zodiac-mini-app/ProfileRetentionPanel.tsx");
const featureTabs = read("components/zodiac-mini-app/feature-tabs.ts");
const mysticFeatures = read("components/ZodiacMysticSections.tsx");

check("global selected-sign render gate is removed", !miniApp.includes("{!selectedSign ? ("));
check("unsigned category gate is removed from Mini App root", !miniApp.includes("renderUnsignedCategoryContent"));
check("home and category navigation render independently of selected sign", miniApp.includes("<HubNavigation") && miniApp.includes('renderMoreCategory("forecasts")'));
check("profile-first root marker exists", miniApp.includes('data-aphrodite-profile-first="true"'));
check("feature-level sign gate marker exists", miniApp.includes("data-aphrodite-feature-sign-gate"));
check("sign-only features use the focused profile prompt", miniApp.includes("featureNeedsSign") && miniApp.includes("<AphroditePersonalProfileFields"));

check("birth date auto-detects the personal sign", miniApp.includes("applyBirthDateSign") && miniApp.includes("parsed.signSlug"));
check("self compatibility input updates the shared personal profile", miniApp.includes('value={self} onChange={updatePersonalProfile}'));
check("personal tools reuse the shared self profile", miniApp.includes("const natalPerson = self"));
check("personal tool edits update the shared profile", miniApp.includes("onPersonChange={onPersonalProfileChange}"));
check("compat deep link opens compatibility directly", /normalized === "compat"\) return "love"/.test(miniApp));

check("local profile storage has a versioned Aphrodite key", profileStorage.includes('APHRODITE_PERSONAL_PROFILE_STORAGE_KEY = "aphrodite-personal-profile-v1"'));
check("local profile load is guarded", profileStorage.includes("loadAphroditePersonalProfile") && profileStorage.includes("try {"));
check("local profile save is guarded", profileStorage.includes("saveAphroditePersonalProfile") && profileStorage.includes("localStorage.setItem"));
check("local profile clear is implemented", profileStorage.includes("clearAphroditePersonalProfile") && profileStorage.includes("localStorage.removeItem"));
check("profile storage has no network or server write", !/fetch\(|axios|DATABASE_URL|SUPABASE|api\.telegram\.org/i.test(profileStorage));

check("profile editor exposes a birth-date input", profileFields.includes('birthDateScope="aphrodite-profile"'));
check("profile editor reports automatic sign detection", profileFields.includes("Знак определён:") && profileFields.includes("data-aphrodite-autosign"));
check("profile editor keeps manual sign fallback", profileFields.includes('label="Знак вручную"'));
check("profile panel embeds the shared profile editor", profilePanel.includes("<AphroditePersonalProfileFields"));
check("profile copy states local-only persistence", profilePanel.includes("хранятся только на этом устройстве"));

check("daily card no longer requires a zodiac sign", /\{ id: "dailyCard"[^}]*group: "mystic" \}/.test(featureTabs));
check("lunar ritual no longer receives a fake sign", mysticFeatures.includes('Omit<InteractiveMysticProps, "sign">'));
check("fake Aries fallbacks are removed from sign tools", !/\|\| "aries"/.test(miniApp));

const safetyBundle = [miniApp, profileFields, profileStorage, profilePanel, featureTabs, mysticFeatures].join("\n");
check("no payment or VIP unlock code introduced", !/new Stripe\b|sendInvoice\(|createInvoiceLink\(|grantVip|unlockVip|vipUnlocked\s*=\s*true/i.test(safetyBundle));
check("no Telegram Bot API or live publishing introduced", !/api\.telegram\.org|TELEGRAM_BOT_TOKEN|sendMessage\(|live publish/i.test(safetyBundle));

if (failures.length > 0) {
  console.error("APHRODITE Profile-First QA: FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("APHRODITE Profile-First QA: PASS");
console.log(`Checks passed        : ${passed}`);
console.log("Global sign gate     : removed");
console.log("Automatic sign       : birth date");
console.log("Personal profile     : local device only");
console.log("Compatibility link   : direct");
console.log("Telegram API calls   : 0");
console.log("Server/database writes: 0");
