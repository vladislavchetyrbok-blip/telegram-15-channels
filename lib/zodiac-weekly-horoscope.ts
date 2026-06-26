export type ZodiacHoroscopeChannelType = "general" | "sign";

export type ZodiacHoroscopeChannel = {
  slug: string;
  ledgerSlug: string;
  channelType: ZodiacHoroscopeChannelType;
  emoji: string;
  name: string;
  element: "fire" | "earth" | "air" | "water" | "general";
  tone: string;
};

export type ZodiacWeeklyHoroscopePeriod = {
  weekKey: string;
  weekStart: string;
  weekEnd: string;
  label: string;
};

export type ZodiacHoroscopeSection = {
  title: string;
  body: string;
};

export type ZodiacWeeklyHoroscopePost = {
  periodType: "weekly";
  periodKey: string;
  weekKey: string;
  weekStart: string;
  weekEnd: string;
  weekLabel: string;
  channelType: ZodiacHoroscopeChannelType;
  slug: string;
  ledgerSlug: string;
  ledgerKey: string;
  title: string;
  text: string;
  sections: ZodiacHoroscopeSection[];
};

export type ZodiacWeeklyHoroscopeRun =
  | {
      ok: true;
      mode: "auto" | "manual-preview";
      reason: string;
      generationDate: string;
      period: ZodiacWeeklyHoroscopePeriod;
      posts: ZodiacWeeklyHoroscopePost[];
    }
  | {
      ok: false;
      mode: "auto";
      reason: string;
      generationDate: string;
      period: ZodiacWeeklyHoroscopePeriod;
      posts: [];
    };

export const ZODIAC_WEEKLY_SECTION_TITLES = [
  "Главная тема недели",
  "Любовь",
  "Работа/дела",
  "Энергия",
  "Дни силы",
  "Зона внимания",
  "Совет недели",
  "CTA в Mini App",
];

export const ZODIAC_HOROSCOPE_SIGN_CHANNELS: ZodiacHoroscopeChannel[] = [
  { slug: "aries", ledgerSlug: "aries", channelType: "sign", emoji: "♈", name: "Овен", element: "fire", tone: "смелость, быстрый старт и честная инициатива" },
  { slug: "taurus", ledgerSlug: "taurus", channelType: "sign", emoji: "♉", name: "Телец", element: "earth", tone: "устойчивость, практичность и спокойный темп" },
  { slug: "gemini", ledgerSlug: "gemini", channelType: "sign", emoji: "♊", name: "Близнецы", element: "air", tone: "общение, гибкость и точные формулировки" },
  { slug: "cancer", ledgerSlug: "cancer", channelType: "sign", emoji: "♋", name: "Рак", element: "water", tone: "дом, близость и эмоциональная ясность" },
  { slug: "leo", ledgerSlug: "leo", channelType: "sign", emoji: "♌", name: "Лев", element: "fire", tone: "самовыражение, признание и тёплая щедрость" },
  { slug: "virgo", ledgerSlug: "virgo", channelType: "sign", emoji: "♍", name: "Дева", element: "earth", tone: "порядок, польза и точные улучшения" },
  { slug: "libra", ledgerSlug: "libra", channelType: "sign", emoji: "♎", name: "Весы", element: "air", tone: "баланс, красота и честные договорённости" },
  { slug: "scorpio", ledgerSlug: "scorpio", channelType: "sign", emoji: "♏", name: "Скорпион", element: "water", tone: "глубина, доверие и внутренний выбор" },
  { slug: "sagittarius", ledgerSlug: "sagittarius", channelType: "sign", emoji: "♐", name: "Стрелец", element: "fire", tone: "горизонт, знания и движение вперёд" },
  { slug: "capricorn", ledgerSlug: "capricorn", channelType: "sign", emoji: "♑", name: "Козерог", element: "earth", tone: "дисциплина, результат и долгий горизонт" },
  { slug: "aquarius", ledgerSlug: "aquarius", channelType: "sign", emoji: "♒", name: "Водолей", element: "air", tone: "новые связи, свобода и свежий взгляд" },
  { slug: "pisces", ledgerSlug: "pisces", channelType: "sign", emoji: "♓", name: "Рыбы", element: "water", tone: "интуиция, мягкость и творческое течение" },
];

export const ZODIAC_HOROSCOPE_CHANNELS: ZodiacHoroscopeChannel[] = [
  { slug: "zodiac-general", ledgerSlug: "general", channelType: "general", emoji: "✨", name: "Общий гороскоп", element: "general", tone: "общий ритм недели для всех знаков" },
  ...ZODIAC_HOROSCOPE_SIGN_CHANNELS,
];

const weeklyThemes = [
  "выбрать один главный фокус и не распыляться на чужую срочность",
  "собрать энергию в понятный план без резких обещаний",
  "сверить желания с реальными ресурсами и оставить место для отдыха",
  "действовать мягче, но последовательнее, чем в прошлые дни",
  "закрыть старый вопрос и освободить место для нового шага",
];

const loveLines = [
  "в отношениях лучше работают прямые просьбы, а не проверки молчанием",
  "тепло возвращается через маленькие повторяемые жесты и честный тон",
  "личные разговоры стоит вести без спешки и без попытки выиграть спор",
  "важно отделять усталость от настоящего отношения друг к другу",
  "если нужен ответ, назовите вопрос прямо и оставьте партнёру время",
];

const workLines = [
  "в делах полезно фиксировать сроки, роли и один измеримый результат",
  "деньги требуют спокойного расчёта и отказа от покупок ради настроения",
  "рабочий прогресс появится там, где меньше суеты и больше структуры",
  "переговоры лучше вести через факты, цифры и ясную договорённость",
  "не берите новую задачу, пока не закрыт хотя бы один старый хвост",
];

const energyLines = [
  "энергия растёт через режим, воду, движение и короткие паузы без экрана",
  "телу нужен запас тишины, иначе неделя быстро станет перегруженной",
  "лучше чередовать активность и восстановление, чем идти одним рывком",
  "настроение станет ровнее, если заранее убрать лишние обязательства",
  "силы возвращаются, когда день не забит чужими ожиданиями до краёв",
];

const attentionLines = [
  "не спорьте на усталости и не принимайте настроение за окончательный факт",
  "не обещайте больше, чем сможете удержать в реальном расписании",
  "не смешивайте личные эмоции с рабочими решениями",
  "не ускоряйте людей, которым нужно время на спокойный ответ",
  "не возвращайтесь к старому спору, если обсуждаете новую тему",
];

const adviceLines = [
  "сначала ясность, потом скорость",
  "один спокойный шаг убедительнее трёх громких обещаний",
  "держите темп и выбирайте слова, после которых становится легче дышать",
  "проверяйте планы делом, а чувства - бережным разговором",
  "лучший результат недели рождается из повторяемых маленьких действий",
];

export function getUpcomingWeeklyHoroscopePeriod(date: Date): ZodiacWeeklyHoroscopePeriod {
  const base = startOfUtcDate(date);
  const utcDay = base.getUTCDay();
  const daysUntilFollowingMonday = ((8 - utcDay) % 7) || 7;
  const weekStartDate = addUtcDays(base, daysUntilFollowingMonday);
  const weekEndDate = addUtcDays(weekStartDate, 6);
  const weekStart = formatDateKey(weekStartDate);
  const weekEnd = formatDateKey(weekEndDate);

  return {
    weekKey: getIsoWeekKey(weekStartDate),
    weekStart,
    weekEnd,
    label: `${formatDisplayDate(weekStart)} - ${formatDisplayDate(weekEnd)}`,
  };
}

export function canAutoPublishWeeklyHoroscope(date: Date): boolean {
  return startOfUtcDate(date).getUTCDay() === 0;
}

export function buildZodiacWeeklyLedgerKey(weekKey: string, slug: string): string {
  return `zodiac:weekly:${weekKey}:${normalizeLedgerSlug(slug)}`;
}

export function buildZodiacDailyLedgerKey(dateKey: string, slug: string): string {
  return `${dateKey}:${slug}`;
}

export function buildZodiacWeeklyHoroscopeRun(input: { date: Date; manualPreview?: boolean }): ZodiacWeeklyHoroscopeRun {
  const generationDate = formatDateKey(startOfUtcDate(input.date));
  const period = getUpcomingWeeklyHoroscopePeriod(input.date);
  const manualPreview = input.manualPreview === true;

  if (!manualPreview && !canAutoPublishWeeklyHoroscope(input.date)) {
    return {
      ok: false,
      mode: "auto",
      reason: "Еженедельные гороскопы публикуются только в воскресенье на новую неделю.",
      generationDate,
      period,
      posts: [],
    };
  }

  return {
    ok: true,
    mode: manualPreview ? "manual-preview" : "auto",
    reason: manualPreview ? "Ручной preview без публикации и без записи в ledger." : "Воскресная публикация на новую неделю.",
    generationDate,
    period,
    posts: generateZodiacWeeklyHoroscopePosts(period),
  };
}

export function generateZodiacWeeklyHoroscopePosts(period: ZodiacWeeklyHoroscopePeriod): ZodiacWeeklyHoroscopePost[] {
  return ZODIAC_HOROSCOPE_CHANNELS.map((channel, index) => buildWeeklyPost(channel, period, index));
}

function buildWeeklyPost(channel: ZodiacHoroscopeChannel, period: ZodiacWeeklyHoroscopePeriod, index: number): ZodiacWeeklyHoroscopePost {
  const seed = hashString(`${period.weekKey}:${channel.slug}:weekly`);
  const strengthDays = buildStrengthDays(period.weekStart, seed + index);
  const signPrefix = channel.channelType === "general" ? "Для всех знаков" : `${channel.name}`;
  const sections = buildWeeklySections(channel, period, strengthDays, seed);
  const title =
    channel.channelType === "general"
      ? `${channel.emoji} Общий прогноз на новую неделю ${period.label}`
      : `${channel.emoji} ${channel.name}: прогноз на новую неделю ${period.label}`;
  const text = [
    `<b>${title}</b>`,
    "",
    `${signPrefix}: это прогноз на неделю ${period.label}. Период начинается в понедельник ${formatDisplayDate(period.weekStart)} и завершается в воскресенье ${formatDisplayDate(period.weekEnd)}.`,
    "",
    ...sections.flatMap((section) => [`<b>${section.title}</b>`, section.body, ""]),
  ]
    .join("\n")
    .trim();

  return {
    periodType: "weekly",
    periodKey: period.weekKey,
    weekKey: period.weekKey,
    weekStart: period.weekStart,
    weekEnd: period.weekEnd,
    weekLabel: period.label,
    channelType: channel.channelType,
    slug: channel.slug,
    ledgerSlug: channel.ledgerSlug,
    ledgerKey: buildZodiacWeeklyLedgerKey(period.weekKey, channel.slug),
    title,
    text,
    sections,
  };
}

function buildWeeklySections(channel: ZodiacHoroscopeChannel, period: ZodiacWeeklyHoroscopePeriod, strengthDays: string, seed: number): ZodiacHoroscopeSection[] {
  const theme = pick(weeklyThemes, seed, 1);
  const love = pick(loveLines, seed, 2);
  const work = pick(workLines, seed, 3);
  const energy = pick(energyLines, seed, 4);
  const attention = pick(attentionLines, seed, 5);
  const advice = pick(adviceLines, seed, 6);

  if (channel.channelType === "general") {
    const signs = pickGeneralSignSummary(seed);
    return [
      { title: "Главная тема недели", body: `Новая неделя ${period.label} помогает ${theme}. Общий фон недели: ${channel.tone}.` },
      { title: "Любовь", body: `Для личных отношений сейчас важно: ${love}.` },
      { title: "Работа/дела", body: `В рабочих и финансовых вопросах: ${work}.` },
      { title: "Энергия", body: `Ресурс недели держится так: ${energy}.` },
      { title: "Дни силы", body: `Лучшие дни для действий: ${strengthDays}. ${signs}` },
      { title: "Зона внимания", body: `Главный риск: ${attention}.` },
      { title: "Совет недели", body: `Совет недели: ${advice}.` },
      { title: "CTA в Mini App", body: "Открой Mini App, выбери свой знак и проверь прогноз на новую неделю вместе с совместимостью." },
    ];
  }

  return [
    { title: "Главная тема недели", body: `${channel.name}, ваша тема на новую неделю: ${theme}. Особенно заметны ${channel.tone}.` },
    { title: "Любовь", body: `${channel.name}: ${love}. Не превращайте диалог в проверку, лучше выбрать один честный вопрос.` },
    { title: "Работа/дела", body: `Для вашего знака в делах: ${work}. Хорошо сработает спокойная фиксация результата.` },
    { title: "Энергия", body: `${energy}. Для ${channel.name} это особенно важно, чтобы не тратить силы на лишний шум.` },
    { title: "Дни силы", body: `Дни силы: ${strengthDays}. Используйте их для старта, разговора или решения, которое давно просит ясности.` },
    { title: "Зона внимания", body: `Зона внимания: ${attention}. Берегите темп и не подменяйте действие тревогой.` },
    { title: "Совет недели", body: `Совет недели: ${advice}.` },
    { title: "CTA в Mini App", body: "Открой Mini App, чтобы проверить свой прогноз на неделю, знак партнёра и совместимость." },
  ];
}

function pickGeneralSignSummary(seed: number): string {
  const first = ZODIAC_HOROSCOPE_SIGN_CHANNELS[seed % ZODIAC_HOROSCOPE_SIGN_CHANNELS.length]!;
  const second = ZODIAC_HOROSCOPE_SIGN_CHANNELS[(seed + 5) % ZODIAC_HOROSCOPE_SIGN_CHANNELS.length]!;
  const third = ZODIAC_HOROSCOPE_SIGN_CHANNELS[(seed + 9) % ZODIAC_HOROSCOPE_SIGN_CHANNELS.length]!;
  return `${first.name} получают импульс к старту, ${second.name} - к переговорам, ${third.name} - к восстановлению.`;
}

function buildStrengthDays(weekStart: string, seed: number): string {
  const start = parseDateKey(weekStart);
  const firstOffset = seed % 7;
  const secondOffset = (firstOffset + 3) % 7;
  const first = formatDisplayDate(formatDateKey(addUtcDays(start, firstOffset)));
  const second = formatDisplayDate(formatDateKey(addUtcDays(start, secondOffset)));
  return `${first} и ${second}`;
}

function normalizeLedgerSlug(slug: string): string {
  return slug === "zodiac-general" ? "general" : slug;
}

function startOfUtcDate(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addUtcDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function parseDateKey(dateKey: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) throw new Error(`Invalid date key: ${dateKey}`);
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
}

function formatDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function formatDisplayDate(dateKey: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  if (!match) return dateKey;
  return `${match[3]}.${match[2]}.${match[1]}`;
}

function getIsoWeekKey(date: Date): string {
  const target = startOfUtcDate(date);
  const day = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function pick(items: string[], seed: number, offset: number): string {
  return items[hashString(`${seed}:${offset}`) % items.length]!;
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}
