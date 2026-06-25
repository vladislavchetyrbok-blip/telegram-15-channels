import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import {
  MIN_BIRTH_DATE_ISO,
  getTodayIsoDate,
  parseBirthDateInput,
  isBirthDateInAllowedRange,
} from "../lib/zodiac-birth-date-range.ts";

let passed = 0;
let failed = 0;

function check(name, condition) {
  if (condition) {
    passed += 1;
    console.log("PASS: " + name);
  } else {
    failed += 1;
    console.log("FAIL: " + name);
  }
}

function read(rel) {
  return readFileSync(new URL(rel, import.meta.url), "utf8");
}

function toDisplayDate(iso) {
  const [year, month, day] = iso.split("-");
  return `${day}.${month}.${year}`;
}

function addDaysIso(iso, days) {
  const date = new Date(`${iso}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function changedFiles() {
  try {
    return execFileSync("git", ["diff", "--name-only", "HEAD"], { encoding: "utf8" })
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

console.log("Starting Zodiac Birth Date UI Runtime Fix QA...\n");

const sources = {
  helper: read("../lib/zodiac-birth-date-range.ts"),
  dateInput: read("../components/zodiac-mini-app/ZodiacDateInput.tsx"),
  birthMatrixRoute: read("../app/birth-matrix/BirthMatrixClient.tsx"),
  mysticSections: read("../components/ZodiacMysticSections.tsx"),
  mysticParser: read("../lib/zodiac-mystic-content.ts"),
  compatibilityMiniApp: read("../components/ZodiacCompatibilityMiniApp.tsx"),
  vipSections: read("../components/ZodiacVipSections.tsx"),
};

const birthInputs = [
  {
    label: "Birth Matrix route /birth-matrix",
    source: sources.birthMatrixRoute,
    checks: [/ZodiacDateInput/, /parseBirthDateInput/, /parsedBirthDate\.iso/, /1900/],
  },
  {
    label: "Mini App Матрица судьбы",
    source: sources.mysticSections,
    checks: [/BirthMatrixFeature/, /ZodiacDateInput/, /generateBirthMatrix/],
  },
  {
    label: "Matrix of Destiny parser",
    source: sources.mysticParser,
    checks: [/parseBirthMatrixDate/, /parseBirthDateInput/],
  },
  {
    label: "Mini App compatibility birth data",
    source: sources.compatibilityMiniApp,
    checks: [/parseBirthDateInput/, /ZodiacDateInput/, /Дата рождения/],
  },
  {
    label: "VIP natal chart birth date",
    source: sources.vipSections,
    checks: [/vipNatalChart/, /parseBirthIsoDate/, /birthDateError/, /Дата рождения/],
  },
  {
    label: "Shared DD.MM.YYYY text control",
    source: sources.dateInput,
    checks: [/type="text"/, /inputMode="numeric"/, /data-zodiac-date-input="true"/, /ДД\.ММ\.ГГГГ/],
  },
];

for (const item of birthInputs) {
  check(
    `classified and wired birth-date input: ${item.label}`,
    item.checks.every((pattern) => pattern.test(item.source)),
  );
}

const nonBirthDateInputs = [
  {
    label: "VIP couple calendar start date",
    source: sources.vipSections,
    checks: [/VipCoupleCalendarFeature/, /\[startDate, setStartDate\]/, /autoComplete="off"/],
  },
  {
    label: "VIP mystic day forecast date",
    source: sources.vipSections,
    checks: [/\[date, setDate\]/, /selectedDateKey/, /dateInputToIsoDate/],
  },
  {
    label: "Lunar ritual custom date",
    source: sources.mysticSections,
    checks: [/customDate/, /normalizeLunarDateKey/, /autoComplete="off"/],
  },
];

for (const item of nonBirthDateInputs) {
  check(
    `classified non-birth date input: ${item.label}`,
    item.checks.every((pattern) => pattern.test(item.source)),
  );
}

check("minimum birth date constant is 1900-01-01", MIN_BIRTH_DATE_ISO === "1900-01-01");

const today = getTodayIsoDate();
const acceptedDates = ["1900-01-01", "1985-12-31", "1990-01-01", "1998-06-15", "2000-01-01", today];
for (const iso of acceptedDates) {
  const parsedIso = parseBirthDateInput(iso);
  const parsedDisplay = parseBirthDateInput(toDisplayDate(iso));
  check(`${iso} accepted by range helper`, isBirthDateInAllowedRange(iso) === true);
  check(`${iso} accepted by birth-date text parser`, parsedIso.ok && parsedIso.iso === iso);
  check(`${toDisplayDate(iso)} accepted by birth-date text parser`, parsedDisplay.ok && parsedDisplay.iso === iso);
}

const tomorrow = addDaysIso(today, 1);
check("today accepted", parseBirthDateInput(today).ok === true);
check("tomorrow / future rejected", parseBirthDateInput(tomorrow).ok === false);
check("pre-1900 rejected", parseBirthDateInput("1899-12-31").ok === false);
check("invalid calendar date rejected", parseBirthDateInput("31.02.1998").ok === false);
check("malformed date rejected", parseBirthDateInput("not-a-date").ok === false);

const birthDateSourceBundle = [
  sources.helper,
  sources.birthMatrixRoute,
  sources.mysticSections,
  sources.mysticParser,
  sources.compatibilityMiniApp,
  sources.vipSections,
].join("\n");

check("BirthMatrix route no longer uses native date picker", !/type="date"/.test(sources.birthMatrixRoute));
check("birth-date code has no native date picker left", !/type="date"/.test(birthDateSourceBundle));
check("text DOB control exposes DD.MM.YYYY placeholder", /placeholder="ДД\.ММ\.ГГГГ"/.test(sources.dateInput));
check("text DOB control remains autocomplete bday by default", /autoComplete = "bday"/.test(sources.dateInput));

check(
  "no hardcoded 2020 birth-date restriction",
  !/min="2020|fromYear:\s*2020|startYear:\s*2020|new Date\(2020|year\s*[<>]=?\s*2020|defaultYear:\s*2020/.test(birthDateSourceBundle),
);

check("Matrix of Destiny / Birth Matrix covered by QA", /Birth Matrix route/.test(birthInputs[0].label) && /BirthMatrixFeature/.test(sources.mysticSections));
check("natal chart / VIP birth date covered by QA", /vipNatalChart/.test(sources.vipSections) && /parseBirthIsoDate/.test(sources.vipSections));
check("compatibility birth date covered by QA", /parseBirthDateInput/.test(sources.compatibilityMiniApp) && /isReadyToCalculate/.test(sources.compatibilityMiniApp));

const hotfixSourceBundle = birthDateSourceBundle + "\n" + sources.dateInput;
check("no payment API introduced", !/from ['"]stripe|new Stripe\b|successful_payment|sendInvoice\(|createInvoiceLink\(/i.test(hotfixSourceBundle));
check("no Telegram API introduced", !/TELEGRAM_BOT_TOKEN|api\.telegram\.org|answerPreCheckoutQuery\(/i.test(hotfixSourceBundle));
check("no database write introduced", !/DATABASE_URL|createClient\(|from\([^)]*\)\.(insert|update|delete|upsert)\(/i.test(hotfixSourceBundle));
check("no real VIP unlock introduced", !/grantVip|unlockVip|setVipActive|vipUnlocked\s*=\s*true|realVipAccess\s*=\s*true/i.test(hotfixSourceBundle));

const diffFiles = changedFiles();
check("workflows not changed", diffFiles.every((file) => !file.startsWith(".github/workflows/")));
check("cron/publish scripts not changed", diffFiles.every((file) => !/^scripts\/(?:publish|autopublish|cron|workflow)/.test(file)));
check("package.json not changed", !diffFiles.includes("package.json"));

console.log(`\nQA Finished: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
