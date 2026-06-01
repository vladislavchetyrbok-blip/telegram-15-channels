export type PremiumVisualPreset =
  | "premium_finance_dashboard"
  | "ai_tech_command_center"
  | "real_estate_premium"
  | "men_style_lifestyle"
  | "home_tech_comfort"
  | "fishing_rest_city"
  | "premium_business_editorial";

export interface ChannelVisualProfile {
  stylePreset: PremiumVisualPreset;
  palette: "dark_teal_gold" | "dark_cyan_violet" | "dark_real_estate_gold" | "dark_graphite_leather" | "dark_clean_comfort" | "dark_lifestyle_city";
  imageTone: string;
  forbiddenVisuals: string[];
  preferredElements: string[];
  headlineStyle: "large editorial title";
  layout: "4:5 telegram cover";
}

const forbiddenVisuals = ["RUB", "₽", "руб", "ruble", "rouble", "watermark", "random logo", "local-model", "test post"];

const profiles: Record<string, ChannelVisualProfile> = {
  "money-opportunities": profile("premium_finance_dashboard", "dark_teal_gold", ["dashboard", "checklist", "chart", "calendar", "card"]),
  "ai-tech": profile("ai_tech_command_center", "dark_cyan_violet", ["neural grid", "command center", "3D chip", "code panels", "glow lines"]),
  "ukraine-market": profile("premium_business_editorial", "dark_teal_gold", ["business map", "documents", "market panel", "city lights", "checklist"]),
  "mens-style": profile("men_style_lifestyle", "dark_graphite_leather", ["watch", "leather", "fabric", "accessories", "metal detail"]),
  "home-tech": profile("home_tech_comfort", "dark_clean_comfort", ["smart home", "device panel", "interior", "clean tech", "comfort icons"]),
  "fishing-rest": profile("fishing_rest_city", "dark_lifestyle_city", ["water", "outdoor gear", "route", "morning light", "checklist"]),
  "dnipro-city": profile("fishing_rest_city", "dark_lifestyle_city", ["city map", "river line", "route", "infrastructure", "local checklist"]),
  "auto-comfort": profile("home_tech_comfort", "dark_clean_comfort", ["car interior", "road", "comfort controls", "detail lights", "dashboard"]),
  "business-ideas": profile("premium_finance_dashboard", "dark_teal_gold", ["business board", "notebook", "chart", "sales funnel", "calendar"]),
  "personal-progress": profile("fishing_rest_city", "dark_lifestyle_city", ["focus desk", "planner", "habit tracker", "progress line", "calm light"]),
  "dnipro-real-estate-ru": profile("real_estate_premium", "dark_real_estate_gold", ["building", "map pin", "floor plan", "keys", "documents"]),
  "dnipro-real-estate-ua": profile("real_estate_premium", "dark_real_estate_gold", ["building", "map pin", "floor plan", "keys", "documents"]),
  "commercial-real-estate": profile("real_estate_premium", "dark_real_estate_gold", ["facade", "office", "warehouse", "floor plan", "traffic line"]),
  "land-houses": profile("real_estate_premium", "dark_real_estate_gold", ["land plot", "house", "road", "utilities", "map plan"]),
  "real-estate-investments": profile("premium_finance_dashboard", "dark_teal_gold", ["buildings", "yield chart", "documents", "calculator", "risk panel"]),
};

export function getPremiumVisualProfile(channelId: string) {
  return profiles[channelId] ?? profile("premium_business_editorial", "dark_teal_gold", ["editorial panel", "checklist", "chart"]);
}

export function getAllPremiumVisualProfiles() {
  return profiles;
}

function profile(stylePreset: PremiumVisualPreset, palette: ChannelVisualProfile["palette"], preferredElements: string[]): ChannelVisualProfile {
  return {
    stylePreset,
    palette,
    imageTone: "premium, calm, useful, expensive, cinematic, high-end editorial",
    forbiddenVisuals,
    preferredElements,
    headlineStyle: "large editorial title",
    layout: "4:5 telegram cover",
  };
}
