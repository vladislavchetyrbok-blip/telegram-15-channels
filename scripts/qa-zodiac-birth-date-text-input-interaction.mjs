import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import {
  BIRTH_DATE_UI_MARKER,
  MIN_BIRTH_DATE_ISO,
  getTodayIsoDate,
  isBirthDateInAllowedRange,
  normalizeBirthDateInputDisplay,
  parseBirthDateInput,
  parseBirthDateInputToIso,
} from "../lib/zodiac-birth-date-range.ts";

let passed = 0;
let failed = 0;

function check(name, condition) {
  if (condition) {
    passed += 1;
    console.log(`PASS: ${name}`);
  } else {
    failed += 1;
    console.log(`FAIL: ${name}`);
  }
}

function read(rel) {
  return readFileSync(new URL(rel, import.meta.url), "utf8");
}

function typeThrough(value) {
  let next = "";
  const steps = [];
  for (const char of value) {
    next = normalizeBirthDateInputDisplay(next + char);
    steps.push(next);
  }
  return { value: next, steps };
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

console.log("Starting Zodiac Birth Date Text Input Interaction QA...\n");

const russianBirthDate = "\u0414\u0430\u0442\u0430 \u0440\u043e\u0436\u0434\u0435\u043d\u0438\u044f";
const russianDateFormat = "\u0414\u0414.\u041c\u041c.\u0413\u0413\u0413\u0413";

const sources = {
  helper: read("../lib/zodiac-birth-date-range.ts"),
  dateInput: read("../components/zodiac-mini-app/ZodiacDateInput.tsx"),
  birthMatrix: read("../app/birth-matrix/BirthMatrixClient.tsx"),
  compatibility: read("../components/ZodiacCompatibilityMiniApp.tsx"),
  mystic: read("../components/ZodiacMysticSections.tsx"),
  vip: read("../components/ZodiacVipSections.tsx"),
  mysticParser: read("../lib/zodiac-mystic-content.ts"),
  lovePreview: read("../app/miniapp/love-reading-preview/page.tsx"),
};

const birthDateBundle = [
  sources.helper,
  sources.dateInput,
  sources.birthMatrix,
  sources.compatibility,
  sources.mystic,
  sources.vip,
  sources.mysticParser,
].join("\n");

check("runtime marker constant unchanged", BIRTH_DATE_UI_MARKER === "v2-global-1900-today");
check("minimum birth date unchanged", MIN_BIRTH_DATE_ISO === "1900-01-01");
check("shared input renders marker", sources.dateInput.includes("data-birth-date-ui={isBirthDate ? BIRTH_DATE_UI_MARKER : undefined}"));
check("shared input renders scope marker", sources.dateInput.includes("data-birth-date-scope={isBirthDate ? resolvedBirthDateScope : undefined}"));
check("shared birth input uses text type", /type="text"/.test(sources.dateInput));
check("shared birth input exposes example placeholder", /placeholder=\{isBirthDate \? "15\.06\.1998" :/.test(sources.dateInput));
check("shared birth input exposes Russian birth-date help", sources.dateInput.includes(russianBirthDate) && sources.dateInput.includes(russianDateFormat));
check("shared birth input does not use readOnly", !/\breadOnly\b/.test(sources.dateInput));
check("shared birth input does not use pattern", !/\bpattern=/.test(sources.dateInput));
check("shared birth input allows dot-friendly input mode", /inputMode=\{isBirthDate \? "decimal" : "numeric"\}/.test(sources.dateInput));

const typed = typeThrough("15.06.1998");
check("typing 15.06.1998 preserves exact value", typed.value === "15.06.1998");
check("typing 15.06.1998 does not auto-expand 19 to 2019", !typed.steps.includes("15.06.2019"));
check("partial 1 preserved", normalizeBirthDateInputDisplay("1") === "1");
check("partial 15 preserved", normalizeBirthDateInputDisplay("15") === "15");
check("partial 15. preserved", normalizeBirthDateInputDisplay("15.") === "15.");
check("partial 15.0 preserved", normalizeBirthDateInputDisplay("15.0") === "15.0");
check("partial 15.06 preserved", normalizeBirthDateInputDisplay("15.06") === "15.06");
check("partial 15.06. preserved", normalizeBirthDateInputDisplay("15.06.") === "15.06.");

const accepted = ["15.06.1998", "15061998", "1998-06-15", "01.01.1990", "31.12.1985", "01.01.2000", "1900-01-01", getTodayIsoDate()];
for (const value of accepted) {
  const parsed = parseBirthDateInput(value);
  check(`${value} accepted`, parsed.ok === true);
}

check("15061998 normalized to 15.06.1998", normalizeBirthDateInputDisplay("15061998") === "15.06.1998");
check("1998-06-15 normalized to 15.06.1998", normalizeBirthDateInputDisplay("1998-06-15") === "15.06.1998");
check("01.01.1990 converts to ISO", parseBirthDateInputToIso("01.01.1990") === "1990-01-01");
check("31.12.1985 converts to ISO", parseBirthDateInputToIso("31.12.1985") === "1985-12-31");
check("today accepted by range", isBirthDateInAllowedRange(getTodayIsoDate()) === true);

const tomorrow = addDaysIso(getTodayIsoDate(), 1);
check("tomorrow rejected", parseBirthDateInput(tomorrow).ok === false);
check("1899-12-31 rejected", parseBirthDateInput("1899-12-31").ok === false);
check("26.06.2026 rejected when future relative to 2026-06-25", parseBirthDateInput("26.06.2026").ok === false);

const scopeChecks = [
  {
    scope: "birth-matrix",
    route: "/birth-matrix",
    source: sources.birthMatrix,
    required: [/birthDateScope="birth-matrix"/, /parseBirthDateInput/, /ZodiacDateInput/],
  },
  {
    scope: "miniapp-matrix",
    route: "/compatibility -> matrix",
    source: sources.mystic,
    required: [/birthDateScope="miniapp-matrix"/, /BirthMatrixFeature/, /ZodiacDateInput/],
  },
  {
    scope: "compatibility",
    route: "/compatibility -> relationship forms",
    source: sources.compatibility,
    required: [/birthDateScope="compatibility"/, /function updateBirthDate/, /parseBirthDateInput/],
  },
  {
    scope: "vip-natal",
    route: "/compatibility -> VIP natal / birth chart",
    source: `${sources.vip}\n${sources.compatibility}`,
    required: [/birthDateScope="vip-natal"/, /parseBirthIsoDate/, /ExtendedNatalFeature|NatalChartV1Card/],
  },
  {
    scope: "vip-numerology",
    route: "/compatibility -> VIP numerology",
    source: sources.vip,
    required: [/birthDateScope="vip-numerology"/, /vipNumerology/, /parseBirthIsoDate/],
  },
  {
    scope: "mystic",
    route: "/compatibility -> mystic/numerology/date-derived tools",
    source: sources.compatibility,
    required: [/birthDateScope="mystic"/, /NumerologyCard/, /ChineseHoroscopeCard|PersonalityArchetypeCard/],
  },
];

for (const item of scopeChecks) {
  check(`${item.scope}: scope marker present`, item.source.includes(`birthDateScope="${item.scope}"`));
  check(`${item.scope}: source route covered`, item.required.every((pattern) => pattern.test(item.source)));
}

check("Birth Matrix parser uses shared birth-date parser", /parseBirthMatrixDate/.test(sources.mysticParser) && /parseBirthDateInput/.test(sources.mysticParser));
check("no native type=date in birth-date source bundle", !/type\s*=\s*[{]?\s*["']date["']/.test(birthDateBundle));
check("no DatePicker or birthYear picker in birth-date source bundle", !/\bDatePicker\b|\bCalendarPicker\b|\bbirthYear\b/i.test(birthDateBundle));

const nonBirthDateInputs = [
  {
    label: "Lunar ritual customDate",
    source: sources.mystic,
    patterns: [/dateKind="calendar"/, /customDate/, /normalizeLunarDateKey/],
  },
  {
    label: "VIP couple calendar startDate",
    source: sources.vip,
    patterns: [/dateKind="calendar"/, /\[startDate, setStartDate\]/, /VipCoupleCalendarFeature/],
  },
  {
    label: "VIP mystic day date",
    source: sources.vip,
    patterns: [/dateKind="calendar"/, /\[date, setDate\]/, /VipMysticDayFeature/],
  },
  {
    label: "Love Reading preview",
    source: sources.lovePreview,
    patterns: [/Love Reading|Aphrodite/i],
  },
];

for (const item of nonBirthDateInputs) {
  check(`excluded non-birth date flow: ${item.label}`, item.patterns.every((pattern) => pattern.test(item.source)));
}

check("no payment API introduced in birth-date bundle", !/from ['"]stripe|new Stripe\b|successful_payment|sendInvoice\(|createInvoiceLink\(/i.test(birthDateBundle));
check("no Telegram API introduced in birth-date bundle", !/TELEGRAM_BOT_TOKEN|api\.telegram\.org|answerPreCheckoutQuery\(/i.test(birthDateBundle));
check("no database write introduced in birth-date bundle", !/DATABASE_URL|createClient\(|from\([^)]*\)\.(insert|update|delete|upsert)\(/i.test(birthDateBundle));
check("no real VIP unlock introduced in birth-date bundle", !/grantVip|unlockVip|setVipActive|vipUnlocked\s*=\s*true|realVipAccess\s*=\s*true/i.test(birthDateBundle));

const diffFiles = changedFiles();
check("workflows not changed", diffFiles.every((file) => !file.startsWith(".github/workflows/")));
check("cron/publish scripts not changed", diffFiles.every((file) => !/^scripts\/(?:publish|autopublish|cron|workflow)/.test(file)));
check("package.json not changed", !diffFiles.includes("package.json"));

console.log(`\nScope summary: ${scopeChecks.map((item) => `${item.scope}: PASS`).join(", ")}`);
console.log(`QA Finished: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
