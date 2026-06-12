import {
  zodiacChannels,
  zodiacContentTemplates,
  zodiacTextStyle,
  zodiacVisualStyle,
  type ZodiacChannelConfig,
} from "@/data/zodiacNetwork";
import {
  zodiacStylePresets,
  defaultZodiacStylePresetId,
  type ZodiacStylePreset,
} from "@/data/zodiacStyles";
import { evaluateZodiacPostQuality } from "./zodiac-content-quality";

export type ZodiacPreviewPostStatus = "preview";

export interface ZodiacPreviewSection {
  title: string;
  body: string;
}

export interface ZodiacPreviewPost {
  id: string;
  channelId: string;
  channelName: string;
  emoji: string;
  type: "general" | "sign";
  date: string;
  title: string;
  sections: ZodiacPreviewSection[];
  text: string;
  visualPrompt: string;
  status: ZodiacPreviewPostStatus;
  publishReady: false;
  telegramChannelId: null;
  telegramUsername: null;
  stylePresetId?: string;
  styleName?: string;
  qualityScore?: number;
  editorialStatus?: "draft" | "needs_review" | "good_preview";
  warnings?: string[];
  suggestions?: string[];
}

export interface BuildZodiacDailyPreviewInput {
  date?: string;
  channels?: ZodiacChannelConfig[];
  stylePresetId?: string;
}

export interface ZodiacPromptInput {
  date: string;
  channel: ZodiacChannelConfig;
}

const generalEnergy = [
  "День просит меньше шума и больше точности. Не нужно резко менять курс: достаточно убрать лишнее и выбрать один главный шаг.",
  "Сегодня выигрывает тот, кто не спешит доказывать. Спокойствие звучит убедительнее, чем длинные объяснения.",
  "День собирает внимание в одну точку. Если не распыляться, появится ощущение контроля и тихой силы.",
  "Сегодня лучше не подгонять события. Дайте им форму, но не ломайте то, что еще дозревает.",
];

const loveLines = [
  "Мягкость важнее правоты. Один спокойный разговор может снять больше напряжения, чем попытка все объяснить сразу.",
  "Не проверяйте чувства резкостью. Сегодня лучше слышать паузу, чем требовать быстрый ответ.",
  "Тепло проявляется в деталях. Простое внимание сработает сильнее, чем громкий жест.",
  "Если хочется сказать колко, сделайте шаг назад. День ценит бережный тон.",
];

const moneyLines = [
  "Деньги любят холодную голову. Не покупайте настроение, лучше проверьте мелкие расходы и старые обязательства.",
  "Не время рисковать ради впечатления. Хороший ход сегодня выглядит скромно, но сохраняет ресурс.",
  "Финансовая ясность начинается с отказа от лишнего. Одно ненужное действие можно спокойно отменить.",
  "План важнее импульса. День подходит для учета, сравнения и аккуратного выбора.",
];

const workLines = [
  "Закройте один вопрос до конца. Это даст больше результата, чем десять начатых задач без финала.",
  "Сегодня рабочая сила в порядке. Сначала структура, потом скорость.",
  "Не берите на себя чужой хаос. Ваша задача — сделать свое чисто и без лишней драматизации.",
  "День подходит для точной правки, коротких решений и спокойного разговора по делу.",
];

const adviceLines = [
  "Сначала порядок. Потом рывок.",
  "Не отвечайте из раздражения. Ответьте из позиции.",
  "Сократите лишнее, и главный ход станет виден.",
  "Держите темп, но не отдавайте день суете.",
];

const warningLines = [
  "Не спорьте там, где можно просто промолчать и сохранить силу.",
  "Не принимайте настроение за факт. Проверьте, потом решайте.",
  "Не обещайте больше, чем готовы сделать спокойно.",
  "Не ускоряйте чужие процессы. У каждого решения есть свой вес.",
];

const closingLines = [
  "Сегодня выигрывает тот, кто держит себя в руках и не разменивает силу на шум.",
  "Ваш лучший ход сегодня — спокойствие, которое невозможно сбить.",
  "Сделайте меньше, но точнее. День это заметит.",
  "Там, где вы выбираете паузу, появляется контроль.",
];

const signMainLines: Record<string, string[]> = {
  aries: [
    "Овен, сегодня не день для суеты. День проверяет не скорость, а выдержку. Скажешь лишнее — потом будешь чинить. Сделаешь паузу — выиграешь.",
    "Овен, импульс сильный, но победит тот, кто направит его в одно точное действие.",
  ],
  taurus: [
    "Телец, сегодня твоя сила — в спокойствии. Не доказывай то, что и так видно. Закрепи результат и не распыляйся.",
    "Телец, спокойная сила сегодня заметнее любых резких движений.",
  ],
  gemini: [
    "Близнецы, разговор сегодня может решить больше, чем длинный план. Но выбирай слова точнее: лишняя фраза потянет за собой лишние объяснения.",
    "Близнецы, сегодня важен фильтр: не каждая мысль требует немедленного слова.",
  ],
  cancer: [
    "Рак, день мягкий, но не слабый. Берегите границы и не объясняйте их слишком долго.",
    "Рак, сегодня дом внутри важнее внешнего шума. Возвращайтесь к тому, что вас собирает.",
  ],
  leo: [
    "Лев, сегодня свет работает лучше без нажима. Вам не нужно доказывать присутствие.",
    "Лев, сила дня в достоинстве. Не снижайте тон ради чужой нервности.",
  ],
  virgo: [
    "Дева, день создан для чистки деталей. Уберите лишнее, и система снова задышит.",
    "Дева, порядок сегодня не скука, а способ вернуть себе управление.",
  ],
  libra: [
    "Весы, не выбирайте из страха кого-то обидеть. Баланс начинается с честной позиции.",
    "Весы, день просит красоты без уступки себе. Мягко, но ясно.",
  ],
  scorpio: [
    "Скорпион, не раскрывайте все карты. Сегодня глубина сильнее прямого давления.",
    "Скорпион, день магнитный, но требует тишины. Не отдавайте энергию лишним людям.",
  ],
  sagittarius: [
    "Стрелец, дорога открыта, если не стрелять во все стороны сразу.",
    "Стрелец, сегодня важно выбрать направление, а не доказывать свободу каждому встречному.",
  ],
  capricorn: [
    "Козерог, день уважает дисциплину. Один строгий шаг укрепит позицию.",
    "Козерог, не спешите показывать результат. Сначала фундамент, потом статус.",
  ],
  aquarius: [
    "Водолей, идея сильная, но ей нужна форма. Запишите, соберите, проверьте.",
    "Водолей, сегодня будущее приходит через ясную мысль, а не через хаотичный скачок.",
  ],
  pisces: [
    "Рыбы, интуиция точна, если не смешивать ее с тревогой.",
    "Рыбы, день тонкий. Слушайте внутренний сигнал, но держите ноги на земле.",
  ],
};

const signBriefLines: Record<string, string[]> = {
  aries: ["не спеши", "держи импульс", "выбери один ход"],
  taurus: ["закрепи результат", "не трать лишнее", "держи темп"],
  gemini: ["фильтруй слова", "собери фокус", "не спорь ради игры"],
  cancer: ["береги границы", "выбирай тишину", "сохрани тепло"],
  leo: ["не дави", "сияй спокойнее", "оставь пафос за дверью"],
  virgo: ["наведи порядок", "проверь детали", "убери лишнее"],
  libra: ["выбери честно", "сохрани баланс", "не соглашайся из вежливости"],
  scorpio: ["меньше раскрывай", "держи глубину", "не трать магнетизм"],
  sagittarius: ["выбери направление", "не распыляйся", "держи горизонт"],
  capricorn: ["укрепи позицию", "сделай строго", "не торопи статус"],
  aquarius: ["оформи идею", "собери мысли", "не уходи в хаос"],
  pisces: ["слушай тише", "не путай сон и страх", "держи берег"],
};

const generalIntroLines = [
  "День подходит для спокойной настройки: меньше резких решений, больше внимания к тому, что давно просит ясности.",
  "Сегодня важны точные слова, бережный ритм и умение не тратить силы на шум вокруг.",
  "Энергия дня мягкая, но собранная: она поддержит тех, кто действует без суеты и лишних обещаний.",
  "День просит честно посмотреть на свои планы и выбрать один главный фокус вместо десятка мелких тревог.",
];

const generalClosingLines = [
  "Не пытайтесь ускорить все сразу: один спокойный шаг сегодня ценнее трех импульсивных.",
  "Держите внимание на том, что можно улучшить без давления на себя и других.",
  "Сохраняйте внутреннюю опору: день лучше раскрывается через ясность, а не через спешку.",
  "Выбирайте действия, после которых останется больше порядка, тепла и свободного дыхания.",
];

const signDailyForecasts: Record<string, string[]> = {
  aries: ["сила дня в спокойной инициативе: начните важное, но не превращайте разговор в спор.", "энергии много, но результат даст не напор, а точный выбор одного главного действия.", "держите импульс под контролем: пауза перед ответом сегодня сохранит вам преимущество."],
  taurus: ["день просит устойчивости: не меняйте план из-за чужой нервозности и берегите свой темп.", "хорошо навести порядок в делах и деньгах, без резких покупок и обещаний на эмоциях.", "ваша сила в простоте: закрепите то, что уже работает, и не распыляйтесь."],
  gemini: ["слова сегодня особенно важны: говорите точнее и не берите на себя лишние объяснения.", "день принесет идеи, но выберите одну и доведите ее до понятной формы.", "не каждая мысль требует немедленного сообщения; фильтр сохранит энергию."],
  cancer: ["берегите личные границы мягко, но ясно; день не любит внутреннего перенапряжения.", "дом, близкие и чувство безопасности сегодня важнее внешней гонки за впечатлением.", "не закрывайтесь полностью: достаточно выбрать спокойный тон и честно назвать потребности."],
  leo: ["вас заметят без лишнего нажима; достоинство сегодня сильнее демонстрации.", "день подходит для красивого, но спокойного жеста: меньше драматизма, больше уверенности.", "не спорьте за внимание; оно придет туда, где есть тепло и внутренняя собранность."],
  virgo: ["детали сегодня говорят громче общего настроения: проверьте план и уберите лишнее.", "не берите на себя чужой хаос; ваша задача - сделать свое чисто и вовремя.", "день хорош для правок, аккуратных решений и спокойного восстановления порядка."],
  libra: ["баланс начнется с честности: не соглашайтесь только ради красивой тишины.", "день просит мягкой ясности в отношениях и выборе; не откладывайте очевидное.", "ваша дипломатия сильна, если в ней есть место собственным интересам."],
  scorpio: ["не раскрывайте все сразу: глубина сегодня сильнее прямого давления.", "магнетизм работает тихо; не тратьте его на борьбу там, где можно отойти в сторону.", "день подходит для внутренней настройки и точного разговора без лишней резкости."],
  sagittarius: ["направление важнее скорости: выберите цель и не стреляйте во все стороны сразу.", "день может открыть новый маршрут, если не спорить с каждой мелкой задержкой.", "свобода сегодня начинается с понятного плана, а не с бегства от обязательств."],
  capricorn: ["сильный день для дисциплины: маленький строгий шаг укрепит позицию лучше громких заявлений.", "не торопите признание результата; сначала фундамент, потом статус.", "дела пойдут ровнее, если убрать лишнее и оставить только проверенные решения."],
  aquarius: ["идея просит формы: запишите, соберите, проверьте и только потом показывайте миру.", "день поддержит нестандартный взгляд, если он не превращается в хаос.", "разговоры о будущем будут полезнее, если привязать их к одному конкретному шагу."],
  pisces: ["интуиция точна, когда вы не смешиваете ее с тревогой; дайте себе тишину.", "день мягкий, но требует границ: не растворяйтесь в чужом настроении.", "сохраняйте связь с реальностью через простые дела и бережный режим."],
};

const loveDeepLines = [
  "В личном общении лучше не проверять чувства резкостью. Спокойный вопрос, честная пауза и готовность услышать ответ сегодня ценнее, чем попытка сразу все объяснить. Тепло проявится в деталях, а не в громких обещаниях.",
  "Отношениям сегодня полезна мягкая ясность. Если тема напряженная, начните с того, что действительно важно, и не добавляйте прошлые обиды в новый разговор. Один бережный жест может заметно изменить тон дня.",
  "День просит меньше угадывать и больше говорить простыми словами. Не требуйте мгновенной реакции: человеку рядом тоже нужно пространство, чтобы собраться. Там, где есть уважение к паузе, появляется доверие.",
];

const workMoneyDeepLines = [
  "В работе и деньгах выигрывает спокойная структура. Проверьте договоренности, сроки и мелкие расходы, но не принимайте решений только из-за настроения. Хороший результат сегодня складывается из аккуратных шагов.",
  "День подходит для точной правки, пересмотра планов и закрытия одного зависшего вопроса. Не стоит рисковать ради впечатления или обещать больше, чем можно сделать без надрыва. Практичность сейчас сильнее скорости.",
  "Финансовые и рабочие темы лучше вести без драматизации. Сравните варианты, уберите лишнее и оставьте то, что выдержит проверку временем. Маленькая ясность сегодня может снять большое внутреннее напряжение.",
];

const moodDeepLines = [
  "Настроение может меняться волнами, поэтому не принимайте первый импульс за окончательный вывод. Дайте себе ритм, в котором можно дышать и думать.",
  "Энергия дня лучше раскрывается через порядок вокруг и честность внутри. Не перегружайте себя разговорами, которые ничего не меняют.",
  "Сегодня важно беречь внимание: оно быстро уходит туда, где много шума. Верните его к телу, простым делам и одному ясному решению.",
];

const practicalAdviceLines = [
  "Сделайте один шаг, после которого станет меньше хаоса, а не больше обязательств.",
  "Отвечайте не из раздражения, а из позиции, которую сможете спокойно удержать завтра.",
  "Сначала уберите лишнее, затем принимайте решение - так день станет заметно легче.",
  "Не ускоряйте события силой: точность сегодня важнее скорости.",
];

export function buildZodiacDailyPreview(input: BuildZodiacDailyPreviewInput = {}): ZodiacPreviewPost[] {
  const channels = input.channels ?? zodiacChannels;
  const date = normalizeDate(input.date);
  const stylePresetId = input.stylePresetId ?? defaultZodiacStylePresetId;
  const stylePreset = zodiacStylePresets.find(s => s.id === stylePresetId) ?? zodiacStylePresets[0];

  return channels.map((channel, index) =>
    channel.type === "general"
      ? buildGeneralPreviewPost({ channel, date, index, stylePreset })
      : buildSignPreviewPost({ channel, date, index, stylePreset }),
  );
}

export function buildGeneralHoroscopePrompt({ date, channel }: ZodiacPromptInput) {
  return [
    "Сгенерируй preview-only Telegram-пост для общего zodiac-канала.",
    `Дата: ${formatRuDate(date)}`,
    `Канал: ${channel.ruName} ${channel.emoji}`,
    `Тон: ${zodiacTextStyle.tone}. ${channel.tone}.`,
    `Визуальный стиль: ${zodiacVisualStyle.stylePreset}; ${zodiacVisualStyle.format}.`,
    "Структура:",
    zodiacContentTemplates.general.titlePattern,
    ...zodiacContentTemplates.general.sections,
    `CTA: ${zodiacContentTemplates.general.cta}`,
    "Правила: русский язык, коротко, атмосферно, без гарантий денег/любви, без медицинских обещаний, без страха и манипуляций.",
    "Telegram не отправлять. Это только preview.",
  ].join("\n");
}

export function buildSignHoroscopePrompt({ date, channel }: ZodiacPromptInput) {
  return [
    "Сгенерируй preview-only Telegram-пост для персонального zodiac-канала.",
    `Дата: ${formatRuDate(date)}`,
    `Знак: ${channel.ruName} ${channel.emoji}`,
    `Стихия: ${channel.element}`,
    `Тон: ${zodiacTextStyle.tone}. ${channel.tone}.`,
    `Визуальные символы: ${channel.visualSymbols.join(", ")}.`,
    "Структура:",
    zodiacContentTemplates.sign.titlePattern,
    ...zodiacContentTemplates.sign.sections,
    "Финальная строка",
    "Правила: русский язык, коротко, лично, эмоционально точно, без гарантий денег/любви, без медицинских обещаний, без страха.",
    "Telegram не отправлять. Это только preview.",
  ].join("\n");
}

function buildGeneralPreviewPost({
  channel,
  date,
  index,
  stylePreset,
}: {
  channel: ZodiacChannelConfig;
  date: string;
  index: number;
  stylePreset: ZodiacStylePreset;
}): ZodiacPreviewPost {
  const seed = createSeed(date, channel.id, index);
  const signChannels = zodiacChannels.filter((item) => item.type === "sign");
  const signSections = signChannels.map((sign, signIndex) => ({
    title: `${sign.emoji} ${sign.ruName}`,
    body: pick(signDailyForecasts[sign.id] ?? adviceLines, seed + signIndex),
  }));
  const sections = [
    { title: "Вступление", body: pick(generalIntroLines, seed) },
    ...signSections,
    { title: "Совет дня", body: pick(generalClosingLines, seed + 31) },
  ];
  const title = `${channel.emoji} Гороскоп на сегодня — ${formatRuDate(date)}`;

  return createPreviewPost({
    channel,
    date,
    title,
    sections,
    stylePreset,
    visualPrompt: [
      channel.visualPromptSeed,
      `Date mood: ${formatRuDate(date)}.`,
      `Style Preset: ${stylePreset.visualStyle}. Addons: ${stylePreset.promptAddons}.`,
      "General daily zodiac cover, 12-sign composition, premium dark magazine layout.",
    ].join(" "),
  });
}

function buildSignPreviewPost({
  channel,
  date,
  index,
  stylePreset,
}: {
  channel: ZodiacChannelConfig;
  date: string;
  index: number;
  stylePreset: ZodiacStylePreset;
}): ZodiacPreviewPost {
  const seed = createSeed(date, channel.id, index);
  const mainPool = signMainLines[channel.id] ?? generalEnergy;
  const sections = [
    { title: "Общая энергия дня", body: pick(mainPool, seed) },
    { title: "Любовь", body: pick(loveDeepLines, seed + 1) },
    { title: "Работа и деньги", body: pick(workMoneyDeepLines, seed + 2) },
    { title: "Настроение и энергия", body: pick(moodDeepLines, seed + 3) },
    { title: "Совет дня", body: pick(practicalAdviceLines, seed + 4) },
    { title: "Финальная строка", body: `${channel.ruName} сегодня сильнее, когда выбирает точность без лишнего напряжения.` },
  ];
  const title = `${channel.emoji} ${channel.ruName} — гороскоп на ${formatRuDate(date)}`;

  return createPreviewPost({
    channel,
    date,
    title,
    sections,
    stylePreset,
    visualPrompt: [
      channel.visualPromptSeed,
      `Sign identity: ${channel.ruName}, ${channel.element}, ${channel.visualSymbols.join(", ")}.`,
      `Style Preset: ${stylePreset.visualStyle}. Addons: ${stylePreset.promptAddons}.`,
      "Premium Telegram magazine cover, no cartoon style, no generic stock look.",
    ].join(" "),
  });
}

function createPreviewPost({
  channel,
  date,
  title,
  sections,
  visualPrompt,
  stylePreset,
}: {
  channel: ZodiacChannelConfig;
  date: string;
  title: string;
  sections: ZodiacPreviewSection[];
  visualPrompt: string;
  stylePreset: ZodiacStylePreset;
}): ZodiacPreviewPost {
  const basePost = {
    id: `zodiac-preview-${date}-${channel.id}`,
    channelId: channel.id,
    channelName: channel.ruName,
    emoji: channel.emoji,
    type: channel.type,
    date,
    title,
    sections,
    text: composeText(title, sections, channel),
    visualPrompt,
    status: "preview" as const,
    publishReady: false as const,
    telegramChannelId: channel.telegramChannelId,
    telegramUsername: channel.telegramUsername,
    stylePresetId: stylePreset.id,
    styleName: stylePreset.ruName,
  };

  const quality = evaluateZodiacPostQuality(basePost);

  return {
    ...basePost,
    qualityScore: quality.qualityScore,
    editorialStatus: quality.editorialStatus,
    warnings: quality.warnings,
    suggestions: quality.suggestions,
  };
}

function composeText(title: string, sections: ZodiacPreviewSection[], channel: ZodiacChannelConfig) {
  if (channel.type === "general") {
    const intro = sections.find((section) => section.title === "Вступление")?.body ?? "";
    const advice = sections.find((section) => section.title === "Совет дня")?.body ?? "";
    const signLines = sections
      .filter((section) => section.title !== "Вступление" && section.title !== "Совет дня")
      .map((section) => `${section.title} — ${section.body}`);

    return [
      title,
      "",
      intro,
      "",
      ...signLines,
      "",
      "Совет дня:",
      advice,
      "",
      "Хэштеги:",
      "#Гороскоп #Зодиак #ГороскопНаСегодня",
    ].join("\n");
  }

  const closing = sections.find((section) => section.title === "Финальная строка")?.body ?? "";
  const body = sections
    .filter((section) => section.title !== "Финальная строка")
    .map((section) => `${section.title}:\n${section.body}`)
    .join("\n\n");

  return [
    title,
    body,
    closing,
    `Хэштеги:\n#${channel.ruName.replace(/\s+/g, "")} #Гороскоп #Зодиак #ГороскопНаСегодня`,
  ].join("\n\n");
}

function pick(items: string[], seed: number) {
  return items[Math.abs(seed) % items.length];
}

function createSeed(date: string, channelId: string, index: number) {
  const source = `${date}:${channelId}:${index}`;
  let hash = 0;

  for (const char of source) {
    hash = (hash * 31 + char.charCodeAt(0)) | 0;
  }

  return Math.abs(hash);
}

function toIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function normalizeDate(value?: string) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : toIsoDate(new Date());
}

function formatRuDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date).replace(/\s*г\.$/, "");
}
