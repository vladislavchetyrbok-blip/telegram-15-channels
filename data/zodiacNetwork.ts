export type NetworkMode = "legacy" | "zodiac";
export type NetworkStatus = "paused_legacy" | "planned_experiment";
export type ZodiacChannelType = "general" | "sign";
export type ZodiacChannelStatus = "planned";

export interface ZodiacChannelConfig {
  id: string;
  ruName: string;
  emoji: string;
  type: ZodiacChannelType;
  element: string;
  tone: string;
  visualSymbols: string[];
  visualPromptSeed: string;
  shortDescription: string;
  status: ZodiacChannelStatus;
  telegramUsername: null;
  telegramChannelId: null;
}

export const networkMode = {
  active: "zodiac" as NetworkMode,
  available: ["legacy", "zodiac"] as NetworkMode[],
  note: "Legacy mixed-topic channels are paused; Zodiac Network is the planned active experiment.",
};

export const legacyNetwork = {
  id: "legacy-15-mixed-topic-network",
  mode: "legacy" as NetworkMode,
  status: "paused_legacy" as NetworkStatus,
  channelCount: 15,
  publishingPaused: true,
  generationPaused: true,
  preserved: true,
  note: "Old 15-channel mixed-topic network remains recoverable but should not receive new active generation or publishing.",
};

export const zodiacVisualStyle = {
  id: "luxury-mystic-zodiac",
  stylePreset: "luxury mystic, dark zodiac, cosmic gold",
  palette: ["black", "gold", "deep blue", "violet"],
  light: "cinematic light",
  format: "premium Telegram magazine",
  avoid: ["cheap cartoon horoscope look", "generic stock style"],
};

export const zodiacTextStyle = {
  tone: "premium, short, atmospheric, personal",
  avoid: [
    "fake medical claims",
    "guaranteed money or love promises",
    "fear-based predictions",
    "manipulative language",
    "boring generic horoscope cliches",
  ],
};

export const zodiacContentTemplates = {
  general: {
    id: "zodiac-general-daily",
    channelType: "general" as const,
    titlePattern: "Гороскоп на [date]",
    sections: [
      "Общая энергия дня",
      "Любовь",
      "Деньги",
      "Работа",
      "Совет дня",
      "Кратко по всем 12 знакам",
    ],
    cta: "выбери свой знак",
  },
  sign: {
    id: "zodiac-sign-daily",
    channelType: "sign" as const,
    titlePattern: "[Sign] [emoji] | Гороскоп на сегодня",
    sections: ["Главное", "Любовь", "Деньги", "Работа", "Предупреждение", "Совет"],
    closingLine: true,
  },
};

export const zodiacChannels = [
  {
    id: "zodiac-general",
    ruName: "Гороскоп на сегодня",
    emoji: "✨",
    type: "general",
    element: "cosmic",
    tone: "premium daily overview, calm mystic editorial voice",
    visualSymbols: ["zodiac wheel", "stars", "gold dust", "midnight sky"],
    visualPromptSeed:
      "Luxury mystic daily horoscope cover, dark zodiac wheel, cosmic gold details, black deep-blue violet palette, cinematic light, premium Telegram magazine aesthetic.",
    shortDescription: "Ежедневный общий гороскоп и короткий навигатор по всем 12 знакам.",
    status: "planned",
    telegramUsername: null,
    telegramChannelId: null,
  },
  {
    id: "aries",
    ruName: "Овен",
    emoji: "♈️",
    type: "sign",
    element: "fire",
    tone: "direct, bold, controlled impulse",
    visualSymbols: ["fire", "armor", "red-gold energy", "spark"],
    visualPromptSeed:
      "Aries luxury mystic portrait, fire and armor, red-gold energy, controlled impulse, dark zodiac background, cinematic gold light.",
    shortDescription: "Смелый знак действия, скорости и внутреннего огня.",
    status: "planned",
    telegramUsername: null,
    telegramChannelId: null,
  },
  {
    id: "taurus",
    ruName: "Телец",
    emoji: "♉️",
    type: "sign",
    element: "earth",
    tone: "calm, grounded, tactile luxury",
    visualSymbols: ["earth", "stone", "gold", "calm power", "luxury"],
    visualPromptSeed:
      "Taurus premium zodiac visual, earth and stone textures, gold accents, calm power, luxury stillness, black-gold cinematic scene.",
    shortDescription: "Спокойная сила, устойчивость и материальная красота.",
    status: "planned",
    telegramUsername: null,
    telegramChannelId: null,
  },
  {
    id: "gemini",
    ruName: "Близнецы",
    emoji: "♊️",
    type: "sign",
    element: "air",
    tone: "quick, curious, elegant duality",
    visualSymbols: ["mirrors", "twin portrait", "air", "duality"],
    visualPromptSeed:
      "Gemini dark zodiac editorial image, mirror reflections, twin portrait, air movement, elegant duality, violet-blue shadows and gold lines.",
    shortDescription: "Двойственность, контакт, идеи и быстрая смена фокуса.",
    status: "planned",
    telegramUsername: null,
    telegramChannelId: null,
  },
  {
    id: "cancer",
    ruName: "Рак",
    emoji: "♋️",
    type: "sign",
    element: "water",
    tone: "soft, protective, intimate",
    visualSymbols: ["moon", "water", "home", "silver-blue light"],
    visualPromptSeed:
      "Cancer premium mystic scene, moon over water, home symbolism, silver-blue cinematic light, dark zodiac mood, soft protective atmosphere.",
    shortDescription: "Эмоции, дом, память и тонкая внутренняя защита.",
    status: "planned",
    telegramUsername: null,
    telegramChannelId: null,
  },
  {
    id: "leo",
    ruName: "Лев",
    emoji: "♌️",
    type: "sign",
    element: "fire",
    tone: "royal, warm, confident",
    visualSymbols: ["sun", "crown", "stage", "royal gold"],
    visualPromptSeed:
      "Leo luxury horoscope cover, sun and crown, theatrical stage light, royal gold, black zodiac backdrop, premium cinematic drama.",
    shortDescription: "Свет, достоинство, сцена и личная сила.",
    status: "planned",
    telegramUsername: null,
    telegramChannelId: null,
  },
  {
    id: "virgo",
    ruName: "Дева",
    emoji: "♍️",
    type: "sign",
    element: "earth",
    tone: "precise, clean, thoughtful",
    visualSymbols: ["marble", "order", "details", "clean structure"],
    visualPromptSeed:
      "Virgo premium zodiac composition, marble, order, refined details, clean structure, black-gold editorial design, cinematic precision.",
    shortDescription: "Порядок, точность, забота о деталях и ясная структура.",
    status: "planned",
    telegramUsername: null,
    telegramChannelId: null,
  },
  {
    id: "libra",
    ruName: "Весы",
    emoji: "♎️",
    type: "sign",
    element: "air",
    tone: "balanced, aesthetic, diplomatic",
    visualSymbols: ["balance", "symmetry", "aesthetics", "soft luxury light"],
    visualPromptSeed:
      "Libra dark luxury zodiac visual, balance scales, symmetry, aesthetic composition, soft gold and violet light, premium magazine look.",
    shortDescription: "Баланс, красота, выбор и мягкая дипломатия.",
    status: "planned",
    telegramUsername: null,
    telegramChannelId: null,
  },
  {
    id: "scorpio",
    ruName: "Скорпион",
    emoji: "♏️",
    type: "sign",
    element: "water",
    tone: "deep, magnetic, restrained intensity",
    visualSymbols: ["shadow", "dark red", "depth", "mystery", "magnetism"],
    visualPromptSeed:
      "Scorpio luxury mystic portrait, shadow and dark red depth, magnetic mystery, black-gold zodiac atmosphere, cinematic low light.",
    shortDescription: "Глубина, магнетизм, тайна и внутренняя трансформация.",
    status: "planned",
    telegramUsername: null,
    telegramChannelId: null,
  },
  {
    id: "sagittarius",
    ruName: "Стрелец",
    emoji: "♐️",
    type: "sign",
    element: "fire",
    tone: "free, sharp, forward-moving",
    visualSymbols: ["road", "arrow", "horizon", "movement"],
    visualPromptSeed:
      "Sagittarius cinematic zodiac scene, road and arrow toward horizon, movement and fire, dark blue sky, gold trail, premium mystic style.",
    shortDescription: "Дорога, смысл, движение и честный импульс вперед.",
    status: "planned",
    telegramUsername: null,
    telegramChannelId: null,
  },
  {
    id: "capricorn",
    ruName: "Козерог",
    emoji: "♑️",
    type: "sign",
    element: "earth",
    tone: "disciplined, status-minded, quiet power",
    visualSymbols: ["mountain", "discipline", "status", "black-gold architecture"],
    visualPromptSeed:
      "Capricorn black-gold zodiac architecture, mountain silhouette, discipline and status, premium cinematic lighting, luxury mystic editorial.",
    shortDescription: "Цель, статус, дисциплина и спокойная вертикаль роста.",
    status: "planned",
    telegramUsername: null,
    telegramChannelId: null,
  },
  {
    id: "aquarius",
    ruName: "Водолей",
    emoji: "♒️",
    type: "sign",
    element: "air",
    tone: "future-facing, original, electric",
    visualSymbols: ["future", "neon", "electric blue", "ideas"],
    visualPromptSeed:
      "Aquarius futuristic zodiac visual, electric blue neon ideas, dark cosmic background, gold accents, premium magazine futurism.",
    shortDescription: "Будущее, идеи, свобода мышления и электрическая свежесть.",
    status: "planned",
    telegramUsername: null,
    telegramChannelId: null,
  },
  {
    id: "pisces",
    ruName: "Рыбы",
    emoji: "♓️",
    type: "sign",
    element: "water",
    tone: "dreamy, intuitive, tender",
    visualSymbols: ["water", "dream", "fog", "violet-blue intuition"],
    visualPromptSeed:
      "Pisces premium mystic water scene, dream fog, violet-blue intuition, dark zodiac shimmer, cinematic soft light and gold details.",
    shortDescription: "Интуиция, сон, вода и мягкое ощущение невидимого.",
    status: "planned",
    telegramUsername: null,
    telegramChannelId: null,
  },
] satisfies ZodiacChannelConfig[];

export const zodiacNetwork = {
  id: "zodiac-network",
  mode: "zodiac" as NetworkMode,
  status: "planned_experiment" as NetworkStatus,
  channelCount: zodiacChannels.length,
  plannedGeneralChannels: zodiacChannels.filter((channel) => channel.type === "general").length,
  plannedSignChannels: zodiacChannels.filter((channel) => channel.type === "sign").length,
  telegramBindingsReady: zodiacChannels.filter((channel) => channel.telegramUsername || channel.telegramChannelId).length,
  channels: zodiacChannels,
  visualStyle: zodiacVisualStyle,
  textStyle: zodiacTextStyle,
  templates: zodiacContentTemplates,
};

export const zodiacChannelIds = zodiacChannels.map((channel) => channel.id);
