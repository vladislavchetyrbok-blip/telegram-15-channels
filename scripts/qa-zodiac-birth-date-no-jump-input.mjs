import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import {
  BIRTH_DATE_UI_MARKER,
  MIN_BIRTH_DATE_ISO,
  getTodayIsoDate,
  normalizeBirthDateInput,
  normalizeBirthDateInputDisplay,
  parseBirthDateInput,
  sanitizeBirthDateInputDraft,
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
    next = sanitizeBirthDateInputDraft(next + char);
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

console.log("Starting Zodiac Birth Date No-Jump Input QA...\n");

const sources = {
  helper: read("../lib/zodiac-birth-date-range.ts"),
  dateInput: read("../components/zodiac-mini-app/ZodiacDateInput.tsx"),
  birthMatrix: read("../app/birth-matrix/BirthMatrixClient.tsx"),
  compatibility: read("../components/ZodiacCompatibilityMiniApp.tsx"),
  mystic: read("../components/ZodiacMysticSections.tsx"),
  vip: read("../components/ZodiacVipSections.tsx"),
  mysticParser: read("../lib/zodiac-mystic-content.ts"),
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

const partials = ["1", "15", "15.", "15.0", "15.06", "15.06.", "15.06.1", "15.06.19", "15.06.199"];
for (const partial of partials) {
  check(`partial ${partial} keeps ${partial}`, sanitizeBirthDateInputDraft(partial) === partial && normalizeBirthDateInputDisplay(partial) === partial);
  check(`blur keeps incomplete ${partial}`, normalizeBirthDateInput(partial) === partial);
}

const typed = typeThrough("15.06.1998");
check("typing 15.06.1998 keeps every intermediate value", JSON.stringify(typed.steps) === JSON.stringify([...partials, "15.06.1998"]));
check("typing 15.06.1998 final value stays exact", typed.value === "15.06.1998");
check("manual 1990 stays raw draft", sanitizeBirthDateInputDraft("1990") === "1990" && normalizeBirthDateInputDisplay("1990") === "1990" && normalizeBirthDateInput("1990") === "1990");
check("15.06.19 is not expanded into 2019", normalizeBirthDateInput("15.06.19") === "15.06.19" && parseBirthDateInput("15.06.19").ok === false);

const accepted = ["15.06.1998", "01.01.1990", "31.12.1985", "01.01.2000", "1900-01-01", getTodayIsoDate()];
for (const value of accepted) {
  check(`${value} accepted`, parseBirthDateInput(value).ok === true);
}

check("raw digits 15061998 normalized to 15.06.1998", normalizeBirthDateInputDisplay("15061998") === "15.06.1998" && normalizeBirthDateInput("15061998") === "15.06.1998");
check("iso 1998-06-15 normalized to 15.06.1998", normalizeBirthDateInputDisplay("1998-06-15") === "15.06.1998" && normalizeBirthDateInput("1998-06-15") === "15.06.1998");
check("minimum birth date unchanged", MIN_BIRTH_DATE_ISO === "1900-01-01");
check("runtime marker unchanged", BIRTH_DATE_UI_MARKER === "v2-global-1900-today");

const tomorrow = addDaysIso(getTodayIsoDate(), 1);
check("today accepted", parseBirthDateInput(getTodayIsoDate()).ok === true);
check("tomorrow rejected", parseBirthDateInput(tomorrow).ok === false);
check("1899-12-31 rejected", parseBirthDateInput("1899-12-31").ok === false);
check("26.06.2026 rejected when future relative to 2026-06-25", parseBirthDateInput("26.06.2026").ok === false);

check("shared input uses raw draft sanitizer on change", /sanitizeBirthDateInputDraft/.test(sources.dateInput) && /const formatValue = isBirthDate \? sanitizeBirthDateInputDraft : formatDateInput/.test(sources.dateInput));
check("shared input normalizes only on blur", /onBlur=\{\(event\) => onChange\(normalizeValue\(event\.currentTarget\.value\)\)\}/.test(sources.dateInput));
check("compatibility handler uses raw draft sanitizer", /sanitizeBirthDateInputDraft/.test(sources.compatibility) && !/formatSharedBirthDateInput/.test(sources.compatibility));
check("VIP natal handler uses raw draft sanitizer", /sanitizeBirthDateInputDraft/.test(sources.vip) && !/normalizeBirthDateInputDisplay\(value\)/.test(sources.vip));
check("two-digit birth years are not parsed as complete dates", !/\\d\{2\}\\\|\\d\{4\}/.test(sources.helper) && !/digits\.length === 6/.test(sources.helper));

const scopes = [
  ["birth-matrix", sources.birthMatrix],
  ["miniapp-matrix", sources.mystic],
  ["compatibility", sources.compatibility],
  ["vip-natal", `${sources.vip}\n${sources.compatibility}`],
  ["vip-numerology", sources.vip],
  ["mystic", sources.compatibility],
];
for (const [scope, source] of scopes) {
  check(`${scope} scope covered`, source.includes(`birthDateScope="${scope}"`));
}

check("BirthMatrix covered", /BirthMatrixClient/.test(sources.birthMatrix) && /ZodiacDateInput/.test(sources.birthMatrix));
check("Mini App Matrix covered", /BirthMatrixFeature/.test(sources.mystic) && /birthDateScope="miniapp-matrix"/.test(sources.mystic));
check("Compatibility covered", /function updateBirthDate/.test(sources.compatibility) && /birthDateScope="compatibility"/.test(sources.compatibility));
check("VIP natal covered", /ExtendedNatalFeature|NatalChartV1Card/.test(`${sources.vip}\n${sources.compatibility}`) && /birthDateScope="vip-natal"/.test(`${sources.vip}\n${sources.compatibility}`));
check("VIP numerology covered", /ExtendedNumerologyFeature/.test(sources.vip) && /birthDateScope="vip-numerology"/.test(sources.vip));
check("Mystic covered", /NumerologyCard/.test(sources.compatibility) && /birthDateScope="mystic"/.test(sources.compatibility));

check("birth-date UI has marker", /data-birth-date-ui=\{isBirthDate \? BIRTH_DATE_UI_MARKER : undefined\}/.test(sources.dateInput));
check("birth-date source bundle does not use native type=date", !/type\s*=\s*[{]?\s*["']date["']/.test(birthDateBundle));
check("birth-date source bundle has no DatePicker or birthYear picker", !/\bDatePicker\b|\bCalendarPicker\b|\bbirthYear\b/i.test(birthDateBundle));
check("Birth Matrix parser uses shared helper", /parseBirthMatrixDate/.test(sources.mysticParser) && /parseBirthDateInput/.test(sources.mysticParser));

check("no payment API introduced", !/from ['"]stripe|new Stripe\b|successful_payment|sendInvoice\(|createInvoiceLink\(/i.test(birthDateBundle));
check("no Telegram API introduced", !/TELEGRAM_BOT_TOKEN|api\.telegram\.org|answerPreCheckoutQuery\(/i.test(birthDateBundle));
check("no database write introduced", !/DATABASE_URL|createClient\(|from\([^)]*\)\.(insert|update|delete|upsert)\(/i.test(birthDateBundle));
check("no real VIP unlock introduced", !/grantVip|unlockVip|setVipActive|vipUnlocked\s*=\s*true|realVipAccess\s*=\s*true/i.test(birthDateBundle));

const diffFiles = changedFiles();
check("workflows not changed", diffFiles.every((file) => !file.startsWith(".github/workflows/")));
check("cron/publish scripts not changed", diffFiles.every((file) => !/^scripts\/(?:publish|autopublish|cron|workflow)/.test(file)));
check("package.json not changed", !diffFiles.includes("package.json"));

console.log(`\nQA Finished: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);
