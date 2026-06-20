export type ZodiacContentLanguage = "RU" | "UA" | "EN";
export type ZodiacContentTemplateStatus = "draft" | "ready" | "backlog";
export type ZodiacContentRisk = "safe" | "review" | "blocked";

export interface ZodiacContentTemplateCatalogItem {
  id: string;
  name: string;
  languages: ZodiacContentLanguage[];
  recommendedChannel: string;
  topic: string;
  ctaTarget: string;
  startapp: string;
  status: ZodiacContentTemplateStatus;
  risk: ZodiacContentRisk;
  note: string;
}

export interface ZodiacContentRubric {
  id: string;
  name: string;
  cadence: string;
  targetChannel: string;
  cta: string;
  status: ZodiacContentTemplateStatus;
}

export const zodiacContentTemplateStorageKey = "zodiac-platform-content-template-studio-v1";
export const zodiacContentQualityStorageKey = "zodiac-platform-content-quality-checklist-v1";

export const zodiacContentOverviewCards = [
  { label: "Шаблоны", value: "local preview", tone: "violet" },
  { label: "Рубрики", value: "planner only", tone: "cyan" },
  { label: "RU/UA качество", value: "checklist", tone: "emerald" },
  { label: "CTA/startapp", value: "preview", tone: "amber" },
  { label: "Черновики", value: "localStorage", tone: "slate" },
  { label: "Готовность к публикациям", value: "dry-run first", tone: "rose" },
] as const;

export const zodiacContentTemplateCatalog: ZodiacContentTemplateCatalogItem[] = [
  {
    id: "daily-horoscope",
    name: "Ежедневный гороскоп",
    languages: ["RU", "UA", "EN"],
    recommendedChannel: "zodiac-general / signs",
    topic: "ежедневный прогноз",
    ctaTarget: "Mini App home",
    startapp: "compat",
    status: "ready",
    risk: "safe",
    note: "Symbolic only, exact_unavailable.",
  },
  {
    id: "weekly-forecast",
    name: "Прогноз недели",
    languages: ["RU", "UA", "EN"],
    recommendedChannel: "sign channels",
    topic: "недельный прогноз",
    ctaTarget: "Weekly forecast",
    startapp: "week",
    status: "draft",
    risk: "review",
    note: "Weekly live remains OFF; dry-run only.",
  },
  {
    id: "compatibility",
    name: "Совместимость",
    languages: ["RU", "UA", "EN"],
    recommendedChannel: "zodiac-general",
    topic: "relationship map",
    ctaTarget: "Compatibility",
    startapp: "compat_love",
    status: "ready",
    risk: "safe",
    note: "No personal dates in drafts.",
  },
  {
    id: "mini-app-invite",
    name: "Mini App invite",
    languages: ["RU", "UA", "EN"],
    recommendedChannel: "all channels",
    topic: "invite",
    ctaTarget: "Mini App home",
    startapp: "compat",
    status: "ready",
    risk: "safe",
    note: "Default opens main/home, not Mystic.",
  },
  {
    id: "vip-teaser",
    name: "VIP teaser",
    languages: ["RU", "UA", "EN"],
    recommendedChannel: "zodiac-general",
    topic: "VIP free access",
    ctaTarget: "VIP",
    startapp: "vip",
    status: "draft",
    risk: "review",
    note: "Payments/Stars remain OFF.",
  },
  {
    id: "birth-matrix",
    name: "Матрица судьбы",
    languages: ["RU", "UA", "EN"],
    recommendedChannel: "mystic / general",
    topic: "symbolic matrix",
    ctaTarget: "Birth Matrix",
    startapp: "birth_matrix",
    status: "draft",
    risk: "review",
    note: "Do not store birth date/time.",
  },
  {
    id: "natal-chart",
    name: "Натальная карта",
    languages: ["RU", "UA", "EN"],
    recommendedChannel: "VIP / general",
    topic: "symbolic natal preview",
    ctaTarget: "VIP natal",
    startapp: "vip",
    status: "draft",
    risk: "review",
    note: "Symbolic only / exact_unavailable.",
  },
  {
    id: "tarot-runes",
    name: "Таро/Руны",
    languages: ["RU", "UA", "EN"],
    recommendedChannel: "mystic",
    topic: "symbolic spread",
    ctaTarget: "Mystic",
    startapp: "mystic",
    status: "draft",
    risk: "safe",
    note: "No raw question/intention in draft storage.",
  },
  {
    id: "lunar-ritual",
    name: "Лунный ритуал",
    languages: ["RU", "UA", "EN"],
    recommendedChannel: "mystic",
    topic: "lunar ritual",
    ctaTarget: "Mystic",
    startapp: "mystic",
    status: "draft",
    risk: "safe",
    note: "Keep ritual copy generic.",
  },
  {
    id: "angel-numbers",
    name: "Ангельские числа",
    languages: ["RU", "UA", "EN"],
    recommendedChannel: "zodiac-general",
    topic: "angel numbers",
    ctaTarget: "Angel Numbers",
    startapp: "angel_numbers",
    status: "ready",
    risk: "safe",
    note: "Routes directly, not through Mystic.",
  },
  {
    id: "navigation-post",
    name: "Навигационный пост",
    languages: ["RU", "UA", "EN"],
    recommendedChannel: "all channels",
    topic: "channel navigation",
    ctaTarget: "Mini App / channel links",
    startapp: "compat",
    status: "ready",
    risk: "safe",
    note: "Dry-run navigation first.",
  },
  {
    id: "soft-launch-invite",
    name: "Soft Launch invite",
    languages: ["RU", "UA", "EN"],
    recommendedChannel: "trusted audience",
    topic: "first 5 users",
    ctaTarget: "Mini App home",
    startapp: "compat",
    status: "ready",
    risk: "safe",
    note: "First 5 users GO; mass launch STOP.",
  },
  {
    id: "custom-manual",
    name: "Custom/manual",
    languages: ["RU", "UA", "EN"],
    recommendedChannel: "manual",
    topic: "operator draft",
    ctaTarget: "manual",
    startapp: "compat",
    status: "draft",
    risk: "review",
    note: "Manual approval required.",
  },
];

export const zodiacContentRubrics: ZodiacContentRubric[] = [
  { id: "daily-forecast", name: "ежедневный прогноз", cadence: "daily", targetChannel: "all sign channels", cta: "compat", status: "ready" },
  { id: "compatibility", name: "совместимость", cadence: "2-3/week", targetChannel: "zodiac-general", cta: "compat_love", status: "draft" },
  { id: "weekly-forecast", name: "прогноз недели", cadence: "weekly dry-run", targetChannel: "sign channels", cta: "week", status: "draft" },
  { id: "daily-mystic", name: "мистика дня", cadence: "2/week", targetChannel: "mystic/general", cta: "mystic", status: "draft" },
  { id: "number-of-day", name: "число дня", cadence: "2/week", targetChannel: "zodiac-general", cta: "angel_numbers", status: "ready" },
  { id: "card-of-day", name: "карта дня", cadence: "2/week", targetChannel: "mystic", cta: "mystic", status: "draft" },
  { id: "lunar-ritual", name: "лунный ритуал", cadence: "weekly", targetChannel: "mystic", cta: "mystic", status: "draft" },
  { id: "vip-teaser", name: "VIP teaser", cadence: "1/week", targetChannel: "zodiac-general", cta: "vip", status: "draft" },
  { id: "question-of-day", name: "вопрос дня", cadence: "2/week", targetChannel: "all channels", cta: "compat", status: "draft" },
  { id: "soft-launch-feedback", name: "soft launch feedback", cadence: "as needed", targetChannel: "trusted audience", cta: "profile", status: "ready" },
  { id: "announcement", name: "announcement", cadence: "manual", targetChannel: "zodiac-general", cta: "compat", status: "draft" },
];

export const zodiacContentQualityItems = [
  { id: "clear-title", label: "понятный заголовок" },
  { id: "no-bureaucracy", label: "нет канцелярита" },
  { id: "no-bad-machine-ru", label: "нет кривого машинного русского" },
  { id: "no-ru-ua-mix", label: "нет смешения RU/UA" },
  { id: "clear-cta", label: "CTA понятен" },
  { id: "emoji-not-heavy", label: "emoji не перегружены" },
  { id: "not-too-long", label: "текст не слишком длинный" },
  { id: "no-false-exact-claims", label: "нет ложных точных астрологических claims" },
  { id: "no-personal-data", label: "нет персональных данных" },
  { id: "mini-app-transition", label: "есть переход в Mini App" },
];
