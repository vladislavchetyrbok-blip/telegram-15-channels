export type ZodiacCoupleCalendarInput = {
  firstName?: string;
  secondName?: string;
  firstBirthDate?: string;
  secondBirthDate?: string;
  firstSign?: string;
  secondSign?: string;
  relationshipMode?: string;
  startDate?: string;
  count?: number;
  scoreTotal?: number;
  scoreLove?: number;
  scoreCommunication?: number;
  scoreAttraction?: number;
};

export type PersonalizedCoupleCalendarDay = {
  dayNumber: number;
  dateKey: string;
  date: string;
  weekday: string;
  title: string;
  status: string;
  emotionalTheme: string;
  theme: string;
  coupleInsight: string;
  energy: string;
  recommendedAction: string;
  action: string;
  riskZone: string;
  risk: string;
  advice: string;
  softDisclaimer: string;
};

const DEFAULT_COUNT = 30;
const DEFAULT_ZODIAC_TIME_ZONE = "Europe/Kyiv";

const dayTitles = [
  "Мягкое сближение",
  "Честный короткий разговор",
  "Пауза без холодности",
  "Тёплый жест вместо проверки",
  "Общий маленький план",
  "Бережное уточнение ожиданий",
  "Спокойная настройка границ",
  "Возврат к доверию",
  "День без давления",
  "Один шаг навстречу",
];

const statusLines = [
  "день для любви",
  "день для разговора",
  "день для примирения",
  "осторожный день",
  "спокойный день",
  "день настройки ритма",
  "день маленького общего шага",
];

const themeByMode: Record<string, string[]> = {
  love: ["тепло без спешки", "личная близость", "мягкое внимание", "признание чувств простыми словами", "бережная романтика"],
  friendship: ["доверие", "честная поддержка", "лёгкий контакт", "уважение личного пространства", "общая радость"],
  work: ["общий план", "ясные роли", "деловой ритм", "уважение договорённостей", "спокойная координация"],
  family: ["бытовые договорённости", "поддержка дома", "мягкие границы", "уважение усталости", "семейный ритм"],
  passion: ["искра без давления", "лёгкая игра", "живое притяжение", "тепло без ревности", "смелый, но бережный контакт"],
  reconciliation: ["мягкое примирение", "пауза перед ответом", "признание своей части напряжения", "возврат к спокойному тону", "разговор без доказательства правоты"],
};

const energyByScore = {
  strong: ["тёплая и собранная", "живая, но не резкая", "мягко притягательная", "спокойно уверенная"],
  medium: ["чувствительная", "переменная", "требующая ясности", "бережно настраиваемая"],
  tense: ["осторожная", "хрупкая", "требующая паузы", "напряжённая, но управляемая"],
};

const insightLines = [
  "паре полезно говорить о конкретном шаге, а не проверять чувства намёками",
  "сегодня лучше отделять усталость от отношения друг к другу",
  "один спокойный вопрос даст больше, чем длинное выяснение",
  "тепло сильнее работает через действие, а не через ожидание догадки",
  "разный темп не означает отсутствие интереса, если есть уважение к паузе",
  "лучше назвать потребность прямо и оставить место для ответа",
  "доверие укрепляется, когда оба видят маленький вклад другого",
  "контакт становится мягче, если не превращать молчание в экзамен",
];

const riskLines = [
  "молчание может восприниматься как холодность",
  "спешка может усилить защитную реакцию",
  "намёки могут быть поняты слишком резко",
  "усталость может звучать как равнодушие",
  "сравнение с прошлым может сбить спокойный тон",
  "ожидание быстрого ответа может создать лишнее напряжение",
  "попытка решить всё сразу может перегрузить разговор",
  "шутка на чувствительную тему может прозвучать жёстче, чем задумано",
];

const actionLines = [
  "задать один короткий честный вопрос",
  "сделать маленький жест заботы без ожидания ответа",
  "предложить конкретное время для спокойного разговора",
  "поблагодарить за один реальный поступок",
  "оставить пространство и вернуться к теме позже",
  "согласовать один бытовой или эмоциональный шаг",
  "назвать своё состояние без обвинения",
  "выбрать формат разговора короче и теплее обычного",
];

const adviceLines = [
  "говорите прямо и мягко",
  "не перегружайте день ожиданиями",
  "держите фокус на одном вопросе",
  "сначала уточните настроение, потом тему",
  "не спорьте на усталости",
  "оставьте место для паузы",
  "поддержите контакт маленьким действием",
  "проверяйте смысл слов, а не тон по догадке",
];

const signToneLines = [
  "темпераменты пары лучше соединять через спокойный общий ритм",
  "разница знаков может стать ресурсом, если не спорить за лидерство",
  "сильнее всего работает уважение к разному способу проявлять чувства",
  "общий тон держится на честности и маленьких повторяемых действиях",
];

const birthRhythmLines = [
  "личные даты добавляют разный эмоциональный темп, поэтому важна настройка без давления",
  "ритм рождения пары просит бережно сверять ожидания и не делать быстрых выводов",
  "личные даты усиливают тему доверия к паузе и ясным словам",
  "разный внутренний ритм лучше поддерживать короткими договорённостями",
];

export function buildPersonalizedCoupleCalendar(input: ZodiacCoupleCalendarInput): PersonalizedCoupleCalendarDay[] {
  const startDate = normalizeCalendarDate(input.startDate) ?? getCurrentZodiacDateKey();
  const count = Math.max(1, Math.min(30, input.count ?? DEFAULT_COUNT));

  return Array.from({ length: count }, (_, index) => {
    const dayNumber = index + 1;
    const dateKey = addDaysToDateKey(startDate, index);
    return buildPersonalizedCoupleCalendarDay(input, startDate, dateKey, dayNumber);
  });
}

export function buildPersonalizedCoupleCalendarDay(
  input: ZodiacCoupleCalendarInput,
  startDate: string,
  dateKey: string,
  dayNumber: number,
): PersonalizedCoupleCalendarDay {
  const seed = buildCoupleCalendarSeed(input, startDate, dateKey, dayNumber);
  const scoreBand = resolveScoreBand(input.scoreTotal);
  const mode = normalizeMode(input.relationshipMode);
  const status = pickLine(statusLines, seed, 1);
  const title = pickLine(dayTitles, seed, 2);
  const emotionalTheme = pickLine(themeByMode[mode] ?? themeByMode.love, seed, 3);
  const energy = pickLine(energyByScore[scoreBand], seed, 4);
  const signTone = pickLine(signToneLines, seed, 5);
  const birthRhythm = pickLine(birthRhythmLines, seed, 6);
  const coupleInsight = `${pickLine(insightLines, seed, 7)}: ${signTone}. ${birthRhythm}.`;
  const riskZone = pickLine(riskLines, seed, 8);
  const recommendedAction = pickLine(actionLines, seed, 9);
  const advice = pickLine(adviceLines, seed, 10);

  return {
    dayNumber,
    dateKey,
    date: formatShortDate(dateKey),
    weekday: formatWeekday(dateKey),
    title,
    status,
    emotionalTheme,
    theme: emotionalTheme,
    coupleInsight,
    energy,
    recommendedAction,
    action: recommendedAction,
    riskZone,
    risk: riskZone,
    advice,
    softDisclaimer: "Это мягкая навигация для разговора, а не жёсткое предсказание.",
  };
}

export function buildCoupleCalendarSeed(input: ZodiacCoupleCalendarInput, startDate: string, dateKey: string, dayNumber: number) {
  return hashString(
    [
      normalizeSeedPart(input.firstName),
      normalizeSeedPart(input.secondName),
      normalizeDateSeedPart(input.firstBirthDate),
      normalizeDateSeedPart(input.secondBirthDate),
      normalizeSeedPart(input.firstSign),
      normalizeSeedPart(input.secondSign),
      normalizeMode(input.relationshipMode),
      startDate,
      dateKey,
      String(dayNumber),
      String(input.scoreTotal ?? ""),
      String(input.scoreLove ?? ""),
      String(input.scoreCommunication ?? ""),
      String(input.scoreAttraction ?? ""),
    ].join("|"),
  );
}

export function normalizeCalendarDate(value?: string) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;

  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (iso) return isValidIsoDate(raw) ? raw : null;

  const dotted = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(raw);
  if (dotted) {
    const next = `${dotted[3]}-${dotted[2]}-${dotted[1]}`;
    return isValidIsoDate(next) ? next : null;
  }

  const compact = /^(\d{2})(\d{2})(\d{4})$/.exec(raw);
  if (compact) {
    const next = `${compact[3]}-${compact[2]}-${compact[1]}`;
    return isValidIsoDate(next) ? next : null;
  }

  return null;
}

function normalizeDateSeedPart(value?: string) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";

  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (iso) return isValidIsoDate(raw) ? raw : "";

  const dotted = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(raw);
  if (dotted) {
    const next = `${dotted[3]}-${dotted[2]}-${dotted[1]}`;
    return isValidIsoDate(next) ? next : "";
  }

  const compact = /^(\d{2})(\d{2})(\d{4})$/.exec(raw);
  if (compact) {
    const next = `${compact[3]}-${compact[2]}-${compact[1]}`;
    return isValidIsoDate(next) ? next : "";
  }

  return raw.toLocaleLowerCase("ru-RU");
}

function normalizeSeedPart(value?: string) {
  return String(value ?? "").trim().toLocaleLowerCase("ru-RU");
}

function normalizeMode(value?: string) {
  const mode = normalizeSeedPart(value);
  return mode || "love";
}

function resolveScoreBand(score?: number): "strong" | "medium" | "tense" {
  if (typeof score !== "number") return "medium";
  if (score >= 70) return "strong";
  if (score >= 55) return "medium";
  return "tense";
}

function isValidIsoDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function getCurrentZodiacDateKey(timeZone = DEFAULT_ZODIAC_TIME_ZONE, now: Date | string | number = new Date()) {
  const date = now instanceof Date ? now : new Date(now);
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values: Record<string, string> = {};

  for (const part of parts) {
    if (part.type !== "literal") values[part.type] = part.value;
  }

  return `${values.year}-${values.month}-${values.day}`;
}

function addDaysToDateKey(dateKey: string, days: number) {
  const date = parseIsoDate(dateKey);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function formatShortDate(dateIso: string) {
  return parseIsoDate(dateIso).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
}

function formatWeekday(dateIso: string) {
  return parseIsoDate(dateIso).toLocaleDateString("ru-RU", { weekday: "long" });
}

function parseIsoDate(dateIso: string) {
  const [year, month, day] = dateIso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function pickLine(items: string[], seed: number, offset: number) {
  return items[variance(seed, offset, items.length)];
}

function variance(seed: number, offset: number, spread: number) {
  return hashString(`${seed}:${offset}`) % spread;
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
