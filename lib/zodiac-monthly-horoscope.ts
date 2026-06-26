export type ZodiacMonthlyHoroscopeChannelType = "general" | "sign";

export type ZodiacMonthlyHoroscopeChannel = {
  slug: string;
  ledgerSlug: string;
  channelType: ZodiacMonthlyHoroscopeChannelType;
  emoji: string;
  name: string;
  element: "fire" | "earth" | "air" | "water" | "general";
  tone: string;
};

export type ZodiacMonthlyHoroscopePeriod = {
  monthKey: string;
  monthLabel: string;
  year: number;
  month: number;
};

export type ZodiacMonthlyHoroscopeSection = {
  title: string;
  body: string;
};

export type ZodiacMonthlyHoroscopePost = {
  periodType: "monthly";
  periodKey: string;
  monthKey: string;
  monthLabel: string;
  channelType: ZodiacMonthlyHoroscopeChannelType;
  slug: string;
  ledgerSlug: string;
  ledgerKey: string;
  title: string;
  text: string;
  sections: ZodiacMonthlyHoroscopeSection[];
};

export type ZodiacMonthlyHoroscopeRun =
  | {
      ok: true;
      mode: "auto" | "manual-preview";
      reason: string;
      generationDate: string;
      period: ZodiacMonthlyHoroscopePeriod;
      posts: ZodiacMonthlyHoroscopePost[];
    }
  | {
      ok: false;
      mode: "auto";
      reason: string;
      generationDate: string;
      period: ZodiacMonthlyHoroscopePeriod;
      posts: [];
    };

export const ZODIAC_MONTHLY_SECTION_TITLES = [
  "Главная энергия месяца",
  "Любовь и отношения",
  "Работа и деньги",
  "Личная сила",
  "Зона внимания",
  "Лучшие дни месяца",
  "Совет месяца",
  "CTA в Mini App",
];

export const ZODIAC_MONTHLY_SIGN_CHANNELS: ZodiacMonthlyHoroscopeChannel[] = [
  { slug: "aries", ledgerSlug: "aries", channelType: "sign", emoji: "♈", name: "Овен", element: "fire", tone: "смелость и быстрые решения" },
  { slug: "taurus", ledgerSlug: "taurus", channelType: "sign", emoji: "♉", name: "Телец", element: "earth", tone: "устойчивость и практичная забота" },
  { slug: "gemini", ledgerSlug: "gemini", channelType: "sign", emoji: "♊", name: "Близнецы", element: "air", tone: "общение и гибкое мышление" },
  { slug: "cancer", ledgerSlug: "cancer", channelType: "sign", emoji: "♋", name: "Рак", element: "water", tone: "эмоциональная безопасность и дом" },
  { slug: "leo", ledgerSlug: "leo", channelType: "sign", emoji: "♌", name: "Лев", element: "fire", tone: "самовыражение и признание" },
  { slug: "virgo", ledgerSlug: "virgo", channelType: "sign", emoji: "♍", name: "Дева", element: "earth", tone: "порядок и точные улучшения" },
  { slug: "libra", ledgerSlug: "libra", channelType: "sign", emoji: "♎", name: "Весы", element: "air", tone: "баланс и честные договорённости" },
  { slug: "scorpio", ledgerSlug: "scorpio", channelType: "sign", emoji: "♏", name: "Скорпион", element: "water", tone: "глубина и обновление доверия" },
  { slug: "sagittarius", ledgerSlug: "sagittarius", channelType: "sign", emoji: "♐", name: "Стрелец", element: "fire", tone: "горизонт и движение вперёд" },
  { slug: "capricorn", ledgerSlug: "capricorn", channelType: "sign", emoji: "♑", name: "Козерог", element: "earth", tone: "дисциплина и долгий результат" },
  { slug: "aquarius", ledgerSlug: "aquarius", channelType: "sign", emoji: "♒", name: "Водолей", element: "air", tone: "новые связи и свежие идеи" },
  { slug: "pisces", ledgerSlug: "pisces", channelType: "sign", emoji: "♓", name: "Рыбы", element: "water", tone: "интуиция и мягкое творчество" },
];

export const ZODIAC_MONTHLY_CHANNELS: ZodiacMonthlyHoroscopeChannel[] = [
  { slug: "zodiac-general", ledgerSlug: "general", channelType: "general", emoji: "✨", name: "Общий гороскоп", element: "general", tone: "общая энергия месяца для всех знаков" },
  ...ZODIAC_MONTHLY_SIGN_CHANNELS,
];

const monthNames = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const monthAccusative = [
  "январь",
  "февраль",
  "март",
  "апрель",
  "май",
  "июнь",
  "июль",
  "август",
  "сентябрь",
  "октябрь",
  "ноябрь",
  "декабрь",
];

const energyLines = [
  "месяц помогает собрать силу в один понятный курс и перестать тратить ресурс на второстепенное",
  "главная энергия периода - спокойное взросление решений, которые раньше откладывались",
  "месяц просит меньше резких разворотов и больше действий, которые можно повторять",
  "это время для ясности: что укрепляет жизнь, а что только создаёт шум вокруг",
  "период раскрывается через дисциплину, честные желания и бережное отношение к телу",
];

const loveLines = [
  "в отношениях важнее не громкие обещания, а регулярное подтверждение внимания",
  "личная жизнь выигрывает от прямых слов, мягких границ и отказа от скрытых проверок",
  "любовь становится теплее, когда каждый говорит о потребности до того, как накопится обида",
  "месяц подходит для спокойного сближения, примирения и честного разговора о будущем",
  "не сравнивайте текущие чувства с прошлым сценарием: связь просит нового языка",
];

const workMoneyLines = [
  "в работе и деньгах сильнее всего сработают план, сроки и отказ от импульсивных трат",
  "финансовый фокус месяца - считать ресурсы до обещаний и не распыляться на случайные идеи",
  "дела пойдут ровнее, если закрыть старые хвосты и выбрать один главный результат",
  "месяц поддерживает переговоры, документы, бюджет и практичные улучшения в расписании",
  "не берите ответственность за чужой хаос: сначала свой план, затем помощь другим",
];

const personalPowerLines = [
  "личная сила растёт через спокойствие, режим и умение не доказывать очевидное",
  "ваш ресурс - в честной самооценке и маленьких действиях, которые возвращают контроль",
  "сильнее всего поможет навык говорить короче, точнее и без лишней защиты",
  "месяц усиливает тех, кто выбирает устойчивый темп вместо эмоционального рывка",
  "опора появится, когда вы перестанете путать заботу о себе с отложенной жизнью",
];

const attentionLines = [
  "не принимайте усталость за знак судьбы и не делайте выводы в момент перегруза",
  "не обещайте больше, чем выдержит ваш реальный календарь",
  "не возвращайтесь к старому спору, если сейчас нужно решить новый вопрос",
  "не превращайте заботу в контроль и не ждите, что другой человек угадает всё сам",
  "не тратьте лучшие дни месяца на чужую срочность без понятной пользы",
];

const adviceLines = [
  "держите один главный фокус и проверяйте его действиями каждую неделю",
  "сначала восстановите порядок, потом принимайте большие решения",
  "говорите прямо, но мягко: это сохранит больше сил, чем длинные объяснения",
  "выбирайте шаги, после которых становится свободнее, а не тревожнее",
  "соберите месяц вокруг того, что укрепляет тело, деньги и близкие связи",
];

export function getNextMonthlyHoroscopePeriodAfter20(date: Date): ZodiacMonthlyHoroscopePeriod {
  const base = startOfUtcDate(date);
  let year = base.getUTCFullYear();
  let month = base.getUTCMonth() + 1;

  if (base.getUTCDate() >= 20) {
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }

  return buildMonthlyPeriod(year, month);
}

export function canPrepareMonthlyHoroscopeAfter20(date: Date): boolean {
  return startOfUtcDate(date).getUTCDate() >= 20;
}

export function buildZodiacMonthlyLedgerKey(monthKey: string, slug: string): string {
  return `zodiac:monthly:${monthKey}:${normalizeLedgerSlug(slug)}`;
}

export function buildZodiacMonthlyHoroscopeRun(input: { date: Date; monthKey?: string; manualPreview?: boolean }): ZodiacMonthlyHoroscopeRun {
  const generationDate = formatDateKey(startOfUtcDate(input.date));
  const period = input.monthKey ? parseMonthKey(input.monthKey) : getNextMonthlyHoroscopePeriodAfter20(input.date);
  const manualPreview = input.manualPreview === true || Boolean(input.monthKey);

  if (!manualPreview && !canPrepareMonthlyHoroscopeAfter20(input.date)) {
    return {
      ok: false,
      mode: "auto",
      reason: "Месячные гороскопы готовятся после 20 числа на следующий месяц.",
      generationDate,
      period,
      posts: [],
    };
  }

  return {
    ok: true,
    mode: manualPreview ? "manual-preview" : "auto",
    reason: manualPreview ? "Ручной preview без публикации и без записи в ledger." : "После 20 числа готовится прогноз на следующий месяц.",
    generationDate,
    period,
    posts: generateZodiacMonthlyHoroscopePosts(period),
  };
}

export function generateZodiacMonthlyHoroscopePosts(period: ZodiacMonthlyHoroscopePeriod): ZodiacMonthlyHoroscopePost[] {
  return ZODIAC_MONTHLY_CHANNELS.map((channel, index) => buildMonthlyPost(channel, period, index));
}

export function parseMonthKey(monthKey: string): ZodiacMonthlyHoroscopePeriod {
  const match = /^(\d{4})-(\d{2})$/.exec(String(monthKey || "").trim());
  if (!match) throw new Error(`Invalid month key: ${monthKey}`);
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error(`Invalid month key: ${monthKey}`);
  }
  return buildMonthlyPeriod(year, month);
}

function buildMonthlyPeriod(year: number, month: number): ZodiacMonthlyHoroscopePeriod {
  return {
    year,
    month,
    monthKey: `${year}-${String(month).padStart(2, "0")}`,
    monthLabel: `${monthNames[month - 1]} ${year}`,
  };
}

function buildMonthlyPost(channel: ZodiacMonthlyHoroscopeChannel, period: ZodiacMonthlyHoroscopePeriod, index: number): ZodiacMonthlyHoroscopePost {
  const seed = hashString(`${period.monthKey}:${channel.slug}:monthly`);
  const sections = buildMonthlySections(channel, period, seed);
  const monthTarget = monthAccusative[period.month - 1];
  const title =
    channel.channelType === "general"
      ? `${channel.emoji} Общий прогноз на ${monthTarget} ${period.year}`
      : `${channel.emoji} ${channel.name}: прогноз на ${monthTarget} ${period.year}`;
  const intro =
    channel.channelType === "general"
      ? `Это месячный прогноз на ${monthTarget} ${period.year} для всех знаков. Он готовится заранее и не описывает текущий день.`
      : `${channel.name}, это месячный прогноз на ${monthTarget} ${period.year}. Он отдельно стоит от дневного и недельного гороскопа.`;
  const text = [
    `<b>${title}</b>`,
    "",
    intro,
    "",
    ...sections.flatMap((section) => [`<b>${section.title}</b>`, section.body, ""]),
  ]
    .join("\n")
    .trim();

  return {
    periodType: "monthly",
    periodKey: period.monthKey,
    monthKey: period.monthKey,
    monthLabel: period.monthLabel,
    channelType: channel.channelType,
    slug: channel.slug,
    ledgerSlug: channel.ledgerSlug,
    ledgerKey: buildZodiacMonthlyLedgerKey(period.monthKey, channel.slug),
    title,
    text,
    sections,
  };
}

function buildMonthlySections(channel: ZodiacMonthlyHoroscopeChannel, period: ZodiacMonthlyHoroscopePeriod, seed: number): ZodiacMonthlyHoroscopeSection[] {
  const monthTarget = monthAccusative[period.month - 1];
  const energy = pick(energyLines, seed, 1);
  const love = pick(loveLines, seed, 2);
  const work = pick(workMoneyLines, seed, 3);
  const power = pick(personalPowerLines, seed, 4);
  const attention = pick(attentionLines, seed, 5);
  const advice = pick(adviceLines, seed, 6);
  const bestDays = buildBestMonthDays(period, seed);

  if (channel.channelType === "general") {
    return [
      { title: "Главная энергия месяца", body: `Прогноз на ${monthTarget}: ${energy}. Общий фон: ${channel.tone}.` },
      { title: "Любовь и отношения", body: `Для всех знаков в отношениях: ${love}.` },
      { title: "Работа и деньги", body: `В делах и финансах: ${work}.` },
      { title: "Личная сила", body: `Личная сила месяца: ${power}.` },
      { title: "Зона внимания", body: `Зона внимания: ${attention}.` },
      { title: "Лучшие дни месяца", body: `Лучшие дни месяца: ${bestDays}. ${pickMonthlySignSummary(seed)}` },
      { title: "Совет месяца", body: `Совет месяца: ${advice}.` },
      { title: "CTA в Mini App", body: "Открой Mini App, выбери свой знак и смотри личный прогноз на месяц, неделю и совместимость." },
    ];
  }

  return [
    { title: "Главная энергия месяца", body: `${channel.name}, прогноз на ${monthTarget}: ${energy}. Для вас это раскрывается через ${channel.tone}.` },
    { title: "Любовь и отношения", body: `${love}. ${channel.name}, не проверяйте чувства резкостью: лучше назвать ожидание прямо.` },
    { title: "Работа и деньги", body: `${work}. Вашему знаку особенно важно держать один финансовый фокус.` },
    { title: "Личная сила", body: `${power}. Это поможет не терять темп в середине месяца.` },
    { title: "Зона внимания", body: `${attention}. Если появляется спешка, возвращайтесь к плану и телу.` },
    { title: "Лучшие дни месяца", body: `Лучшие дни месяца: ${bestDays}. Используйте их для решения, разговора или старта.` },
    { title: "Совет месяца", body: `Совет месяца: ${advice}.` },
    { title: "CTA в Mini App", body: "Открой Mini App, чтобы посмотреть месячный прогноз, недельный прогноз и совместимость для своего знака." },
  ];
}

function pickMonthlySignSummary(seed: number): string {
  const first = ZODIAC_MONTHLY_SIGN_CHANNELS[seed % ZODIAC_MONTHLY_SIGN_CHANNELS.length]!;
  const second = ZODIAC_MONTHLY_SIGN_CHANNELS[(seed + 4) % ZODIAC_MONTHLY_SIGN_CHANNELS.length]!;
  const third = ZODIAC_MONTHLY_SIGN_CHANNELS[(seed + 8) % ZODIAC_MONTHLY_SIGN_CHANNELS.length]!;
  return `${first.name} усиливают личный старт, ${second.name} - финансовую ясность, ${third.name} - восстановление и интуицию.`;
}

function buildBestMonthDays(period: ZodiacMonthlyHoroscopePeriod, seed: number): string {
  const daysInMonth = new Date(Date.UTC(period.year, period.month, 0)).getUTCDate();
  const first = (seed % Math.min(daysInMonth, 9)) + 1;
  const second = Math.min(daysInMonth, first + 10);
  const third = Math.min(daysInMonth, second + 8);
  return [first, second, third].map((day) => `${String(day).padStart(2, "0")}.${String(period.month).padStart(2, "0")}`).join(", ");
}

function normalizeLedgerSlug(slug: string): string {
  return slug === "zodiac-general" ? "general" : slug;
}

function startOfUtcDate(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function formatDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
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
