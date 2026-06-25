import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import {
  BIRTH_DATE_UI_MARKER,
  MIN_BIRTH_DATE_ISO,
  formatBirthDateInput,
  formatBirthDateIsoToDisplay,
  getCurrentYear,
  getTodayIsoDate,
  isBirthDateInAllowedRange,
  normalizeBirthDateInput,
  normalizeBirthDateInputDisplay,
  parseBirthDateInput,
  parseBirthDateInputToIso,
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

console.log("Starting Zodiac Birth Date Runtime UI Fix QA...\n");

const sources = {
  helper: read("../lib/zodiac-birth-date-range.ts"),
  dateInput: read("../components/zodiac-mini-app/ZodiacDateInput.tsx"),
  birthMatrixRoute: read("../app/birth-matrix/BirthMatrixClient.tsx"),
  mysticSections: read("../components/ZodiacMysticSections.tsx"),
  mysticParser: read("../lib/zodiac-mystic-content.ts"),
  compatibilityMiniApp: read("../components/ZodiacCompatibilityMiniApp.tsx"),
  vipSections: read("../components/ZodiacVipSections.tsx"),
};

const birthDateSourceBundle = [
  sources.helper,
  sources.dateInput,
  sources.birthMatrixRoute,
  sources.mysticSections,
  sources.mysticParser,
  sources.compatibilityMiniApp,
  sources.vipSections,
].join("\n");

const birthInputs = [
  {
    label: "Birth Matrix route /birth-matrix",
    source: sources.birthMatrixRoute,
    checks: [/ZodiacDateInput/, /parseBirthDateInput/, /parsedBirthDate\.iso/, /birthDateScope="birth-matrix"/],
  },
  {
    label: "Mini App Matrix of Destiny",
    source: sources.mysticSections,
    checks: [/BirthMatrixFeature/, /ZodiacDateInput/, /generateBirthMatrix/, /birthDateScope="miniapp-matrix"/],
  },
  {
    label: "Matrix of Destiny parser",
    source: sources.mysticParser,
    checks: [/parseBirthMatrixDate/, /parseBirthDateInput/],
  },
  {
    label: "Compatibility birth data",
    source: sources.compatibilityMiniApp,
    checks: [/parseBirthDateInput/, /formatSharedBirthDateInput/, /ZodiacDateInput/, /isReadyToCalculate/, /birthDateScope="compatibility"/],
  },
  {
    label: "VIP natal chart / birth chart",
    source: `${sources.vipSections}\n${sources.compatibilityMiniApp}`,
    checks: [/vipNatalChart|NatalChartV1Card/, /parseBirthIsoDate|parseBirthDateInput/, /ZodiacDateInput/, /birthDateScope="vip-natal"/],
  },
  {
    label: "VIP numerology birth date",
    source: sources.vipSections,
    checks: [/vipNumerology/, /parseBirthIsoDate/, /birthDateError/, /ZodiacDateInput/, /birthDateScope="vip-numerology"/],
  },
  {
    label: "Mystic/numerology birth date",
    source: sources.compatibilityMiniApp,
    checks: [/NumerologyCard/, /ZodiacDateInput/, /birthDateScope="mystic"/],
  },
  {
    label: "Shared ZodiacDateInput birth-date mode",
    source: sources.dateInput,
    checks: [/dateKind = "birth"/, /data-birth-date-ui/, /data-birth-date-scope/, /BIRTH_DATE_UI_MARKER/, /normalizeBirthDateInputDisplay/],
  },
];

for (const item of birthInputs) {
  check(
    `birth-date input covered: ${item.label}`,
    item.checks.every((pattern) => pattern.test(item.source)),
  );
}

const nonBirthDateInputs = [
  {
    label: "VIP couple calendar start date",
    source: sources.vipSections,
    checks: [/VipCoupleCalendarFeature/, /\[startDate, setStartDate\]/, /dateKind="calendar" publicMode=\{publicMode\} value=\{startDate\}/],
  },
  {
    label: "VIP mystic day forecast date",
    source: sources.vipSections,
    checks: [/VipMysticDayFeature/, /\[date, setDate\]/, /dateKind="calendar" publicMode=\{publicMode\} value=\{date\}/],
  },
  {
    label: "Lunar ritual custom date",
    source: sources.mysticSections,
    checks: [/customDate/, /normalizeLunarDateKey/, /dateKind="calendar" publicMode=\{publicMode\} value=\{customDate\}/],
  },
];

for (const item of nonBirthDateInputs) {
  check(
    `non-birth date input explicitly excluded: ${item.label}`,
    item.checks.every((pattern) => pattern.test(item.source)),
  );
}

check("runtime marker value exists", BIRTH_DATE_UI_MARKER === "v2-global-1900-today");
check("shared input renders runtime marker for birth-date mode", sources.dateInput.includes("data-birth-date-ui={isBirthDate ? BIRTH_DATE_UI_MARKER : undefined}"));
check("shared input renders scope marker for birth-date mode", sources.dateInput.includes("data-birth-date-scope={isBirthDate ? resolvedBirthDateScope : undefined}"));
check("shared input marks calendar opt-out mode", sources.dateInput.includes("data-date-kind={dateKind}"));
check("minimum birth date is 1900-01-01", MIN_BIRTH_DATE_ISO === "1900-01-01");
check("current year helper is available", Number.isInteger(getCurrentYear()) && getCurrentYear() >= 2026);

const today = getTodayIsoDate();
const acceptedDates = ["1900-01-01", "1985-12-31", "1990-01-01", "1998-06-15", "2000-01-01", today];
for (const iso of acceptedDates) {
  const display = toDisplayDate(iso);
  check(`${iso} accepted by range helper`, isBirthDateInAllowedRange(iso) === true);
  check(`${iso} parsed from ISO`, parseBirthDateInput(iso).ok === true);
  check(`${display} parsed from display format`, parseBirthDateInput(display).ok === true);
  check(`${display} converts back to ISO`, parseBirthDateInputToIso(display) === iso);
}

check("15.06.1998 accepted", parseBirthDateInput("15.06.1998").ok === true);
check("15061998 accepted", parseBirthDateInput("15061998").ok === true);
check("1998-06-15 accepted", parseBirthDateInput("1998-06-15").ok === true);
check("1998-06-15 formats to display", formatBirthDateInput("1998-06-15") === "15.06.1998");
check("15061998 formats to display", formatBirthDateInput("15061998") === "15.06.1998");
check("1998-06-15 normalizes to display", normalizeBirthDateInput("1998-06-15") === "15.06.1998");
check("formatBirthDateIsoToDisplay works", formatBirthDateIsoToDisplay("1990-01-01") === "01.01.1990");
check("partial ISO draft is not remapped into invalid DD.MM text", formatBirthDateInput("1998-") === "1998-");
check("typing 15.06.1998 keeps partial dots", normalizeBirthDateInputDisplay("15.06.") === "15.06.");
check("typing 15.06.19 is not auto-expanded", normalizeBirthDateInputDisplay("15.06.19") === "15.06.19");

const tomorrow = addDaysIso(today, 1);
check("today accepted", parseBirthDateInput(today).ok === true);
check("tomorrow / future rejected", parseBirthDateInput(tomorrow).ok === false);
check("pre-1900 rejected", parseBirthDateInput("1899-12-31").ok === false);
check("invalid calendar date rejected", parseBirthDateInput("31.02.1998").ok === false);
check("malformed date rejected", parseBirthDateInput("not-a-date").ok === false);

check("Birth Matrix route does not use native date picker", !/type\s*=\s*[{]?\s*["']date["']/.test(sources.birthMatrixRoute));
check("birth-date source bundle does not use native date picker", !/type\s*=\s*[{]?\s*["']date["']/.test(birthDateSourceBundle));
check("shared input uses text field", /type="text"/.test(sources.dateInput));
check("shared input exposes concrete birth-date placeholder", /placeholder=\{isBirthDate \? "15\.06\.1998" :/.test(sources.dateInput));
check("shared input allows dot-friendly birth date typing", /inputMode=\{isBirthDate \? "decimal" : "numeric"\}/.test(sources.dateInput));
check("birth-date autocomplete defaults to bday", /isBirthDate \? "bday" : "off"/.test(sources.dateInput));
check(
  "no hardcoded 2020 birth-date restriction",
  !/min="2020|fromYear:\s*2020|startYear:\s*2020|new Date\(2020|year\s*[<>]=?\s*2020|defaultYear:\s*2020/.test(birthDateSourceBundle),
);

check("Matrix of Destiny / Birth Matrix covered", /BirthMatrixFeature/.test(sources.mysticSections) && /BirthMatrixClient/.test(sources.birthMatrixRoute));
check("VIP natal chart / birth chart covered", /ExtendedNatalFeature/.test(sources.vipSections) && /parseBirthIsoDate/.test(sources.vipSections));
check("compatibility birth date covered", /function PersonPanel/.test(sources.compatibilityMiniApp) && /parseBirthDateInput/.test(sources.compatibilityMiniApp));

check("no payment API introduced", !/from ['"]stripe|new Stripe\b|successful_payment|sendInvoice\(|createInvoiceLink\(/i.test(birthDateSourceBundle));
check("no Telegram API introduced", !/TELEGRAM_BOT_TOKEN|api\.telegram\.org|answerPreCheckoutQuery\(/i.test(birthDateSourceBundle));
check("no database write introduced", !/DATABASE_URL|createClient\(|from\([^)]*\)\.(insert|update|delete|upsert)\(/i.test(birthDateSourceBundle));
check("no real VIP unlock introduced", !/grantVip|unlockVip|setVipActive|vipUnlocked\s*=\s*true|realVipAccess\s*=\s*true/i.test(birthDateSourceBundle));

const diffFiles = changedFiles();
check("workflows not changed", diffFiles.every((file) => !file.startsWith(".github/workflows/")));
check("cron/publish scripts not changed", diffFiles.every((file) => !/^scripts\/(?:publish|autopublish|cron|workflow)/.test(file)));
check("package.json not changed", !diffFiles.includes("package.json"));

console.log(`\nQA Finished: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
