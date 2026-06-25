#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { buildPersonalizedCoupleCalendar } from "../lib/zodiac-couple-calendar-personalization.ts";

let passed = 0;
let failed = 0;

function check(name, condition) {
  if (condition) {
    passed += 1;
    console.log("УСПЕХ: " + name);
  } else {
    failed += 1;
    console.log("ОШИБКА: " + name);
  }
}

function read(rel) {
  return readFileSync(new URL(rel, import.meta.url), "utf8");
}

function gitDiffNames(paths) {
  try {
    const output = execFileSync("git", ["diff", "--name-only", "HEAD", "--", ...paths], { encoding: "utf8" });
    return output.split(/\r?\n/).filter(Boolean);
  } catch {
    return ["__git_diff_failed__"];
  }
}

function gitDiffAddedLines(paths) {
  try {
    const output = execFileSync("git", ["diff", "--unified=0", "HEAD", "--", ...paths], { encoding: "utf8" });
    return output
      .split(/\r?\n/)
      .filter((line) => line.startsWith("+") && !line.startsWith("+++"))
      .map((line) => line.slice(1))
      .join("\n");
  } catch {
    return "__git_diff_failed__";
  }
}

function stable(value) {
  return JSON.stringify(value);
}

function different(left, right) {
  return stable(left) !== stable(right);
}

function contentSignature(days) {
  return days.map((day) => [
    day.dateKey,
    day.title,
    day.status,
    day.emotionalTheme,
    day.coupleInsight,
    day.energy,
    day.recommendedAction,
    day.riskZone,
    day.advice,
  ].join("|")).join("\n");
}

function hasRequiredDayFields(day) {
  return Boolean(
    day.dayNumber &&
    day.dateKey &&
    day.date &&
    day.weekday &&
    day.title &&
    day.emotionalTheme &&
    day.theme &&
    day.coupleInsight &&
    day.riskZone &&
    day.risk &&
    day.recommendedAction &&
    day.action &&
    day.softDisclaimer,
  );
}

console.log("Старт QA: персонализация VIP-календаря пары на 30 дней...\n");

const baseInput = {
  firstName: "Анна",
  secondName: "Иван",
  firstBirthDate: "15.06.1998",
  secondBirthDate: "01.01.1990",
  firstSign: "gemini",
  secondSign: "capricorn",
  relationshipMode: "love",
  startDate: "20.06.2026",
  count: 30,
  scoreTotal: 74,
  scoreLove: 78,
  scoreCommunication: 69,
  scoreAttraction: 81,
};

const base = buildPersonalizedCoupleCalendar(baseInput);
const same = buildPersonalizedCoupleCalendar({ ...baseInput });
const otherNames = buildPersonalizedCoupleCalendar({ ...baseInput, firstName: "Мария", secondName: "Павел" });
const otherBirthDates = buildPersonalizedCoupleCalendar({ ...baseInput, firstBirthDate: "31.12.1985", secondBirthDate: "01.01.2000" });
const otherSigns = buildPersonalizedCoupleCalendar({ ...baseInput, firstSign: "aries", secondSign: "scorpio" });
const otherStartDate = buildPersonalizedCoupleCalendar({ ...baseInput, startDate: "21.06.2026" });
const compactBirthDate = buildPersonalizedCoupleCalendar({ ...baseInput, firstBirthDate: "15061998" });
const isoBirthDate = buildPersonalizedCoupleCalendar({ ...baseInput, firstBirthDate: "1998-06-15" });

check("одинаковые inputs дают стабильные 30 дней", stable(base) === stable(same));
check("разные имена дают разные результаты", different(contentSignature(base), contentSignature(otherNames)));
check("разные даты рождения дают разные результаты", different(contentSignature(base), contentSignature(otherBirthDates)));
check("разные знаки дают разные результаты", different(contentSignature(base), contentSignature(otherSigns)));
check("разный startDate даёт разные даты", base[0]?.dateKey !== otherStartDate[0]?.dateKey);
check("разный startDate даёт разный контент", different(contentSignature(base), contentSignature(otherStartDate)));
check("день 1 и день 2 внутри календаря отличаются", different(base[0], base[1]));
check("создаются все 30 дней", base.length === 30 && base[29]?.dayNumber === 30);
check("каждый день имеет title/theme/insight/risk/action", base.every(hasRequiredDayFields));
check("формат 15061998 нормализуется как 15.06.1998", stable(base) === stable(compactBirthDate));
check("формат 1998-06-15 нормализуется как 15.06.1998", stable(base) === stable(isoBirthDate));

const hardProphecyPattern = /точно будет|гарантирован|100%|предсказано|неизбежно|медицинск|юридическ|финансов/i;
check("нет жёстких предсказаний и профессиональных советов", !hardProphecyPattern.test(stable(base)));

const generatorSource = read("../lib/zodiac-couple-calendar-personalization.ts");
const compatibilitySource = read("../components/ZodiacCompatibilityMiniApp.tsx");
const vipSource = read("../components/ZodiacVipSections.tsx");
const typeSource = read("../components/zodiac-mini-app/types.ts");
const runtimeAddedLines = gitDiffAddedLines(["components/ZodiacCompatibilityMiniApp.tsx", "components/ZodiacVipSections.tsx", "components/zodiac-mini-app/types.ts"]);
const runtimeSafetyBundle = [generatorSource, runtimeAddedLines, typeSource].join("\n");

check("seed учитывает firstName", generatorSource.includes("input.firstName"));
check("seed учитывает secondName", generatorSource.includes("input.secondName"));
check("seed учитывает firstBirthDate", generatorSource.includes("input.firstBirthDate"));
check("seed учитывает secondBirthDate", generatorSource.includes("input.secondBirthDate"));
check("seed учитывает firstSign", generatorSource.includes("input.firstSign"));
check("seed учитывает secondSign", generatorSource.includes("input.secondSign"));
check("seed учитывает startDate", generatorSource.includes("startDate"));
check("seed учитывает dayNumber", generatorSource.includes("dayNumber"));
check("основной экран использует общий генератор", compatibilitySource.includes("buildPersonalizedCoupleCalendar({"));
check("VIP fallback использует общий генератор", vipSource.includes("buildPersonalizedCoupleCalendar({"));
check("VIP fallback получает данные первой персоны", vipSource.includes("firstPerson?.birthDate") && compatibilitySource.includes("firstPerson={self}"));
check("VIP fallback получает данные второй персоны", vipSource.includes("secondPerson?.birthDate") && compatibilitySource.includes("secondPerson={partner}"));

check("нет payment API", !/from ['"]stripe|new Stripe\b|sendInvoice\(|createInvoiceLink|successful_payment/i.test(runtimeSafetyBundle));
check("нет Telegram API", !/TELEGRAM_BOT_TOKEN|api\.telegram\.org|sendMessage\(|sendInvoice\(/i.test(runtimeSafetyBundle));
check("нет database write", !/DATABASE_URL|createClient\(|new Pool\(|\.(insert|update|delete|upsert)\s*\(/i.test(runtimeSafetyBundle));
check("нет real VIP unlock", !/grantVip|unlockVip|setVipActive|vipUnlocked\s*=\s*true|realVipAccess\s*=\s*true/i.test(runtimeSafetyBundle));

const restrictedChangedFiles = gitDiffNames([".github/workflows", "package.json", "prisma", "supabase"]);
check("workflows/package/db schema не изменены", restrictedChangedFiles.length === 0);

const scriptChanges = gitDiffNames(["scripts"]);
const allowedScriptChanges = new Set(["scripts/qa-zodiac-vip-couple-calendar-personalization.mjs"]);
check("cron/publish scripts не изменены", scriptChanges.every((file) => allowedScriptChanges.has(file)) && !scriptChanges.some((file) => /publish|cron|workflow/i.test(file)));

console.log("\nQA завершён: " + passed + " успехов, " + failed + " ошибок.");
if (failed > 0) process.exit(1);
