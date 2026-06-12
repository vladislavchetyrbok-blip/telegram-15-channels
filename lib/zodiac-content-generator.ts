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
  const signSummary = signChannels
    .map((sign, signIndex) => `${sign.ruName} — ${pick(signBriefLines[sign.id] ?? adviceLines, seed + signIndex)}.`)
    .join("\n");
  const sections = [
    { title: "Общая энергия дня", body: pick(generalEnergy, seed) },
    { title: "Любовь", body: pick(loveLines, seed + 1) },
    { title: "Деньги", body: pick(moneyLines, seed + 2) },
    { title: "Работа", body: pick(workLines, seed + 3) },
    { title: "Совет дня", body: pick(adviceLines, seed + 4) },
    { title: "Кратко по знакам", body: signSummary },
  ];
  const title = `Гороскоп на ${formatRuDate(date)}`;

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
    { title: "Главное", body: pick(mainPool, seed) },
    { title: "Любовь", body: pick(loveLines, seed + 1) },
    { title: "Деньги", body: pick(moneyLines, seed + 2) },
    { title: "Работа", body: pick(workLines, seed + 3) },
    { title: "Предупреждение", body: pick(warningLines, seed + 4) },
    { title: "Совет", body: pick(adviceLines, seed + 5) },
    { title: "Финальная строка", body: `${pick(closingLines, seed + 6)} ${channel.ruName} сегодня сильнее, когда выбирает точность.` },
  ];
  const title = `${channel.ruName} ${channel.emoji} | Гороскоп на сегодня`;

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
  return {
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
    status: "preview",
    publishReady: false,
    telegramChannelId: channel.telegramChannelId,
    telegramUsername: channel.telegramUsername,
    stylePresetId: stylePreset.id,
    styleName: stylePreset.ruName,
  };
}

function composeText(title: string, sections: ZodiacPreviewSection[], channel: ZodiacChannelConfig) {
  const body = sections.map((section) => `${section.title}:\n${section.body}`).join("\n\n");
  const cta = channel.type === "general" ? "\n\nВыбери свой знак и сохрани прогноз на день." : "";
  return `${title}\n\n${body}${cta}`;
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
    timeZone: "UTC",
  }).format(date);
}
