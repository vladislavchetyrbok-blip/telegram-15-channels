export const systemLimits = [
  { label: "Каналы", value: 15, max: 15 },
  { label: "Посты сегодня", value: 4, max: 30 },
  { label: "AI-генерации", value: 18, max: 100 },
  { label: "Запланировано", value: 5, max: 150 },
  { label: "Ошибки", value: 1, max: 10 },
];

export const localAi = {
  provider: "LM Studio",
  apiUrl: "http://localhost:1234/v1",
  model: "deepseek-r1-0528-qwen3-8b",
  status: "local mode",
  resource: 68,
  description: "Генерация выполняется на этом компьютере через локальную модель.",
};

export const telegramBot = {
  mode: "single bot",
  name: "R2D2 Telegram Manager",
  status: "not connected",
  token: "not stored",
  description: "Один главный бот подготовлен для ручных dry-run проверок и будущих подтверждённых публикаций.",
};

export const channelRuntime = {
  "money-opportunities": { username: "@money_opportunities_ru", autoposting: "on" },
  "ai-tech": { username: "@ai_tech_ru", autoposting: "on" },
  "ukraine-market": { username: "@ukraine_market_ua", autoposting: "on" },
  "mens-style": { username: "@mens_style_things", autoposting: "paused" },
  "home-tech": { username: "@home_tech_ru", autoposting: "on" },
  "fishing-rest": { username: "@fishing_rest_ru", autoposting: "on" },
  "dnipro-city": { username: "@dnipro_city_live", autoposting: "on" },
  "auto-comfort": { username: "@auto_comfort_ru", autoposting: "on" },
  "business-ideas": { username: "@business_ideas_ua", autoposting: "on" },
  "personal-progress": { username: "@personal_progress_ru", autoposting: "on" },
  "dnipro-real-estate-ru": { username: "@dnipro_real_estate_ru", autoposting: "on" },
  "dnipro-real-estate-ua": { username: "@dnipro_real_estate_ua", autoposting: "on" },
  "commercial-real-estate": { username: "@commercial_realty_ru", autoposting: "on" },
  "land-houses": { username: "@land_houses_dnipro", autoposting: "on" },
  "real-estate-investments": { username: "@realty_investments_ru", autoposting: "on" },
} as const;

export type ChannelRuntimeId = keyof typeof channelRuntime;
