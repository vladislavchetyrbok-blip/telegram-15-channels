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
  visualIdentity: string;
  preferredComposition: string;
  preferredSubjects: string[];
  preferredColorMood: string;
  forbiddenPatterns: string[];
  promptKeywords: string[];
  negativePromptPatterns: string[];
  allowedVisualModes: string[];
  goodDirectionExamples: string[];
  badDirectionExamples: string[];
  headlineStyle: "large editorial title";
  layout: "4:5 telegram cover";
}

const forbiddenVisuals = ["RUB", "ruble", "rouble", "watermark", "random logo", "local-model", "test post", "service label", "template label"];

const profiles: Record<string, ChannelVisualProfile> = {
  "money-opportunities": profile("premium_finance_dashboard", "dark_teal_gold", ["dashboard", "checklist", "chart", "calendar", "card"], {
    visualIdentity: "restrained finance and opportunity editorial with risk-aware premium signals",
    preferredComposition: "desk-level finance scene with dashboard, document, or calculator as the focal point",
    preferredSubjects: ["budget dashboard", "banking app", "documents", "calculator", "calendar"],
    preferredColorMood: "dark teal, graphite, muted gold, clean white highlights",
    forbiddenPatterns: ["cash pile cliche", "get rich quick", "guaranteed income", "casino mood", "crypto hype background", "service labels"],
    promptKeywords: ["premium finance editorial", "real dashboard", "documents and calculator", "risk-aware", "clean focal point", "no text"],
    negativePromptPatterns: ["cash rain", "luxury flex", "guaranteed profit", "watermark", "template label"],
    goodDirectionExamples: ["A tidy finance desk with calculator, banking app dashboard, and muted gold analytics accents."],
    badDirectionExamples: ["Stacks of cash and sports car."],
  }),
  "ai-tech": profile("ai_tech_command_center", "dark_cyan_violet", ["realistic devices", "AI workflow dashboard", "laptop", "phone interface", "workspace"], {
    visualIdentity: "premium clean tech editorial for a practical AI and software media channel",
    preferredComposition: "dark realistic workspace or product scene with one strong focal device/interface and layered depth",
    preferredSubjects: ["laptop with AI workflow dashboard", "phone interface", "developer workspace", "automation control room", "human using technology"],
    preferredColorMood: "deep charcoal, graphite, cyan accents, subtle violet only as secondary glow",
    forbiddenPatterns: ["generic blue/purple abstract network", "empty background", "random neon lines", "meaningless AI logo", "cheap stock-like background", "unreadable text overlays", "service labels"],
    promptKeywords: ["premium clean tech editorial", "realistic devices", "dashboard interface", "strong focal point", "high-end media style", "no text", "no logos"],
    negativePromptPatterns: ["abstract neural network", "random circuit lines", "AI logo", "floating text", "watermark", "service label", "template cover"],
    goodDirectionExamples: ["Realistic dark workspace with laptop showing a clean AI workflow dashboard and subtle glass UI panels."],
    badDirectionExamples: ["Blue abstract network background with no object."],
  }),
  "ukraine-market": profile("premium_business_editorial", "dark_teal_gold", ["business map", "documents", "market panel", "city lights", "checklist"]),
  "mens-style": profile("men_style_lifestyle", "dark_graphite_leather", ["watch", "leather", "fabric", "accessories", "metal detail"], {
    visualIdentity: "quiet premium menswear and grooming editorial with texture and practical taste",
    preferredComposition: "real outfit/accessory texture with one refined focal object and editorial lifestyle context",
    preferredSubjects: ["fabric texture", "shoes", "watch as detail", "grooming tools", "layered outfit"],
    preferredColorMood: "graphite, off-white, leather brown accents, steel, muted olive",
    forbiddenPatterns: ["luxury flex", "random watch macro", "alpha advice", "black-gold cliche", "service labels"],
    promptKeywords: ["editorial menswear", "quiet premium", "real outfit texture", "accessory detail", "restrained", "no text"],
    negativePromptPatterns: ["luxury flex", "gold chains", "alpha male poster", "watermark", "text overlay", "template label"],
    goodDirectionExamples: ["Quiet premium outfit detail with fabric texture, shoes, and clean editorial lighting."],
    badDirectionExamples: ["Aggressive black-gold luxury poster."],
  }),
  "home-tech": profile("home_tech_comfort", "dark_clean_comfort", ["smart home", "device panel", "interior", "clean tech", "comfort icons"]),
  "fishing-rest": profile("fishing_rest_city", "dark_lifestyle_city", ["water", "outdoor gear", "route", "morning light", "checklist"], {
    visualIdentity: "calm outdoor fishing and rest editorial with real gear and weather context",
    preferredComposition: "natural foreground subject with real water/weather context and calm practical mood",
    preferredSubjects: ["fishing tackle", "water surface", "weather detail", "camp setup", "hands preparing gear"],
    preferredColorMood: "natural greens, deep water blue, graphite, early morning warm light",
    forbiddenPatterns: ["cartoon fish", "generic sunset only", "survivalist exaggeration", "empty gear collage", "service labels"],
    promptKeywords: ["natural outdoor editorial", "real fishing gear", "weather and water detail", "calm composition", "practical", "no text"],
    negativePromptPatterns: ["cartoon", "clipart fish", "empty sunset", "AI fantasy lake", "watermark", "text overlay"],
    goodDirectionExamples: ["Close realistic tackle setup near water with weather cues and a calm editorial mood."],
    badDirectionExamples: ["Cartoon fish jumping over generic lake."],
  }),
  "dnipro-city": profile("fishing_rest_city", "dark_lifestyle_city", ["city map", "river line", "route", "infrastructure", "local checklist"], {
    visualIdentity: "local Dnipro city editorial with street-level detail and useful civic context",
    preferredComposition: "realistic city scene with recognizable urban texture and human-scale foreground detail",
    preferredSubjects: ["street detail", "river embankment", "public transport", "local map", "city service detail"],
    preferredColorMood: "natural city light, graphite overlays, restrained blue/amber accents",
    forbiddenPatterns: ["generic skyline", "tourist brochure", "empty gradient", "non-local city", "random map pins", "service labels"],
    promptKeywords: ["local editorial city photo", "street-level detail", "Dnipro urban context", "useful city guide", "realistic", "no text"],
    negativePromptPatterns: ["generic skyline", "fake city", "empty city gradient", "tourism poster", "watermark", "text overlay"],
    goodDirectionExamples: ["Street-level Dnipro editorial image with transport stop, river/city context, and a clear foreground detail."],
    badDirectionExamples: ["Anonymous skyline from any city."],
  }),
  "auto-comfort": profile("home_tech_comfort", "dark_clean_comfort", ["car interior", "road", "comfort controls", "detail lights", "dashboard"], {
    visualIdentity: "premium practical car comfort and ownership editorial",
    preferredComposition: "real vehicle interior/detail with clean focal part and useful comparison context",
    preferredSubjects: ["car interior controls", "dashboard", "garage detail", "tire detail", "road trip comfort gear"],
    preferredColorMood: "graphite, warm garage light, metallic highlights, muted blue technical accents",
    forbiddenPatterns: ["generic sports car wallpaper", "over-shiny showroom", "random road at night", "fake speed lines", "service labels"],
    promptKeywords: ["premium automotive editorial", "real car interior", "comfort controls", "detail shot", "practical buyer context", "no text"],
    negativePromptPatterns: ["supercar wallpaper", "flames", "racing poster", "text overlay", "watermark", "template label"],
    goodDirectionExamples: ["Detailed car interior with climate controls and a clean comfort-focused focal point."],
    badDirectionExamples: ["Random glossy sports car in neon rain."],
  }),
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

function profile(
  stylePreset: PremiumVisualPreset,
  palette: ChannelVisualProfile["palette"],
  preferredElements: string[],
  details: Partial<Pick<ChannelVisualProfile, "visualIdentity" | "preferredComposition" | "preferredSubjects" | "preferredColorMood" | "forbiddenPatterns" | "promptKeywords" | "negativePromptPatterns" | "allowedVisualModes" | "goodDirectionExamples" | "badDirectionExamples">> = {},
): ChannelVisualProfile {
  return {
    stylePreset,
    palette,
    imageTone: "premium, calm, useful, expensive, cinematic, high-end editorial",
    forbiddenVisuals,
    preferredElements,
    visualIdentity: details.visualIdentity ?? "premium editorial Telegram media visual with channel-specific subject",
    preferredComposition: details.preferredComposition ?? "realistic subject, strong focal point, layered editorial depth, no empty background",
    preferredSubjects: details.preferredSubjects ?? preferredElements,
    preferredColorMood: details.preferredColorMood ?? "graphite, neutral editorial palette, restrained accent color",
    forbiddenPatterns: details.forbiddenPatterns ?? ["generic stock visual", "empty abstract background", "service labels", "watermark", "random logo"],
    promptKeywords: details.promptKeywords ?? ["premium editorial", "realistic subject", "strong focal point", "high-end media style", "no text", "no logos"],
    negativePromptPatterns: details.negativePromptPatterns ?? ["generic abstract", "empty background", "watermark", "text overlay", "template label"],
    allowedVisualModes: details.allowedVisualModes ?? ["single_image", "double_image", "triple_image", "cover_card", "editorial_visual", "carousel_ready"],
    goodDirectionExamples: details.goodDirectionExamples ?? ["Realistic editorial scene with one clear subject tied to the post topic."],
    badDirectionExamples: details.badDirectionExamples ?? ["Empty abstract wallpaper with no channel identity."],
    headlineStyle: "large editorial title",
    layout: "4:5 telegram cover",
  };
}
