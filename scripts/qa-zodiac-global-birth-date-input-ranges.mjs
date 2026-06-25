import {
  MIN_BIRTH_DATE_ISO,
  getTodayIsoDate,
  getCurrentYear,
  parseBirthDateInput,
  isBirthDateInAllowedRange,
} from "../lib/zodiac-birth-date-range.ts";
import { readFileSync } from "node:fs";

let passed = 0, failed = 0;
function check(name, cond) {
  if (cond) { passed++; console.log("✅ PASS: " + name); }
  else { failed++; console.log("❌ FAIL: " + name); }
}
function read(rel) { return readFileSync(new URL(rel, import.meta.url), "utf8"); }

console.log("Starting Global Birth Date Input Ranges QA...\n");

// 1. Shared helper exists / range logic
check("shared helper range logic exists", typeof isBirthDateInAllowedRange === "function" && typeof parseBirthDateInput === "function" && MIN_BIRTH_DATE_ISO === "1900-01-01" && typeof getTodayIsoDate() === "string" && typeof getCurrentYear() === "number");

// 2-7. Accepted dates
for (const d of ["1900-01-01", "1985-12-31", "1990-01-01", "1998-06-15", "2000-01-01", getTodayIsoDate()]) {
  check(`${d} accepted`, isBirthDateInAllowedRange(d) === true);
  check(`${d} parsed by birth-date text helper`, parseBirthDateInput(d).ok === true);
}
// 8-9. Future and pre-1900 rejected
check("tomorrow / future rejected", isBirthDateInAllowedRange(`${getCurrentYear() + 1}-01-01`) === false);
check("pre-1900 (1899-12-31) rejected", isBirthDateInAllowedRange("1899-12-31") === false);
check("far future (2999-01-01) rejected", isBirthDateInAllowedRange("2999-01-01") === false);
check("malformed rejected", isBirthDateInAllowedRange("not-a-date") === false);

// 10. Every audited birth-date input has min/max or shared-helper range.
const auditedBirthInputs = [
  { file: "../app/birth-matrix/BirthMatrixClient.tsx", kind: "text date input (BirthMatrix / Matrix of Destiny page)" },
  { file: "../lib/zodiac-mystic-content.ts", kind: "Matrix of Destiny parser (parseBirthMatrixDate)" },
  { file: "../components/ZodiacCompatibilityMiniApp.tsx", kind: "Mini App natal + compatibility parser (parseBirthDate)" },
  { file: "../components/ZodiacVipSections.tsx", kind: "VIP natal + numerology birth-date parser" },
];
for (const { file, kind } of auditedBirthInputs) {
  const src = read(file);
  const hasRange =
    /min=\{MIN_BIRTH_DATE_ISO\}|min="1900-01-01"/.test(src) && /max=\{todayIso\}|max=\{getTodayIsoDate/.test(src) ||
    /isBirthDateInAllowedRange|parseBirthDateInput|parseBirthIsoDate/.test(src);
  check(`birth input has min/max or shared range: ${kind}`, hasRange);
}

check("BirthMatrix route uses text DOB input instead of native picker", /ZodiacDateInput/.test(read("../app/birth-matrix/BirthMatrixClient.tsx")) && !/type="date"/.test(read("../app/birth-matrix/BirthMatrixClient.tsx")));

// 11. No hardcoded 2020 year restriction in birth-date picker code.
const birthPickerSources = [
  read("../app/birth-matrix/BirthMatrixClient.tsx"),
  read("../lib/zodiac-birth-date-range.ts"),
  read("../lib/zodiac-mystic-content.ts"),
  read("../components/ZodiacCompatibilityMiniApp.tsx"),
  read("../components/ZodiacVipSections.tsx"),
];
check("no hardcoded 2020 year restriction in birth date code", !birthPickerSources.some((s) =>
  /min="2020|fromYear:\s*2020|startYear:\s*2020|new Date\(2020|year\s*[<>]=?\s*2020|defaultYear:\s*2020/.test(s)));

// 12-15. No payment / telegram token / database / VIP-unlock introduced by the hotfix files.
const hotfixFiles = [
  read("../lib/zodiac-birth-date-range.ts"),
  read("../lib/zodiac-mystic-content.ts"),
].join("\n");
check("no payment code introduced", !/from ['"]stripe|new Stripe\b|sendInvoice\(|successful_payment/i.test(read("../lib/zodiac-birth-date-range.ts")));
check("no Telegram token required (helper)", !/TELEGRAM_BOT_TOKEN|api\.telegram\.org/i.test(read("../lib/zodiac-birth-date-range.ts")));
check("no database connection (helper)", !/DATABASE_URL|createClient\(|supabase|new Pool\(/i.test(read("../lib/zodiac-birth-date-range.ts")));
check("no real VIP unlock introduced (helper)", !/grantVip|unlockVip|setVipActive|vipUnlocked\s*=\s*true/i.test(read("../lib/zodiac-birth-date-range.ts")));

console.log("\nQA Finished: " + passed + " passed, " + failed + " failed.");
if (failed > 0) process.exit(1);
