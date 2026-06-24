import {
  MIN_BIRTH_DATE_ISO,
  getTodayIsoDate,
  isBirthDateInAllowedRange,
} from "../lib/zodiac-birth-date-range.ts";
import { readFileSync } from "node:fs";

let passed = 0, failed = 0;
function check(name, cond) {
  if (cond) { passed++; console.log("✅ PASS: " + name); }
  else { failed++; console.log("❌ FAIL: " + name); }
}

console.log("Starting Natal Chart Date Picker Range QA...\n");

// Accepted real birth dates
for (const d of ["1990-01-01", "1998-06-15", "1985-12-31", "2000-01-01", "1900-01-01"]) {
  check(`${d} accepted`, isBirthDateInAllowedRange(d) === true);
}

// Minimum boundary
check("minimum is 1900-01-01", MIN_BIRTH_DATE_ISO === "1900-01-01");
check("date before minimum (1899-12-31) rejected", isBirthDateInAllowedRange("1899-12-31") === false);

// Today accepted, future rejected
const today = getTodayIsoDate();
check("today is a valid ISO date", /^\d{4}-\d{2}-\d{2}$/.test(today));
check("today accepted", isBirthDateInAllowedRange(today) === true);
const future = `${new Date().getFullYear() + 1}-01-01`;
check("future date rejected", isBirthDateInAllowedRange(future) === false);
check("far future (2999-01-01) rejected", isBirthDateInAllowedRange("2999-01-01") === false);
check("malformed input rejected", isBirthDateInAllowedRange("not-a-date") === false);

// Birth date input source wiring
const inputSrc = readFileSync(new URL("../app/birth-matrix/BirthMatrixClient.tsx", import.meta.url), "utf8");
check("source contains minimum 1900-01-01 config", /MIN_BIRTH_DATE_ISO|min="1900-01-01"/.test(inputSrc));
check("source contains today/current maximum logic", /max=\{todayIso\}|max="\$\{todayIso\}"|getTodayIsoDate|max=\{getTodayIsoDate/.test(inputSrc));
check("source uses native date input", /type="date"/.test(inputSrc));

// Safety: no payment / telegram / database / VIP-unlock introduced by the helper or input
const helperSrc = readFileSync(new URL("../lib/zodiac-birth-date-range.ts", import.meta.url), "utf8");
const combined = inputSrc + "\n" + helperSrc;
check("no payment API introduced", !/from ['"]stripe|new Stripe\b|sendInvoice\(|answerPreCheckoutQuery\(|createInvoiceLink\(|successful_payment/i.test(helperSrc));
check("no Telegram token required", !/TELEGRAM_BOT_TOKEN|api\.telegram\.org|bot<token>/i.test(combined));
check("no database connection required", !/DATABASE_URL|createClient\(|supabase|new Pool\(/i.test(combined));
check("no real VIP unlock introduced", !/grantVip|unlockVip|setVipActive|realVipAccess|vipUnlocked\s*=\s*true/i.test(combined));

console.log("\nQA Finished: " + passed + " passed, " + failed + " failed.");
if (failed > 0) process.exit(1);
