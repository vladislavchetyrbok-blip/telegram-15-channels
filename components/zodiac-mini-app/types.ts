export type Mode = "fast" | "personal" | "precise";
export type RelationshipMode = "love" | "friendship" | "work" | "family" | "passion" | "reconciliation";
export type Gender = "male" | "female" | "unspecified";
export type Variant = "dashboard" | "public";
export type WizardStep = 1 | 2 | 3;
export type HubTab = "today" | "love" | "profile" | "forecasts" | "mystic" | "vip";
export type TelegramHapticKind = "selection" | "impact";
export type ZodiacElement = "fire" | "earth" | "air" | "water";

export type MoreFeatureId =
  | "todayForecast"
  | "weekForecast"
  | "luckyDays"
  | "compatibilityTool"
  | "coupleHoroscope"
  | "mentalMap"
  | "coupleCalendar"
  | "reconciliation"
  | "messageHelper"
  | "nameCompatibility"
  | "natalChart"
  | "chineseHoroscope"
  | "zodiacStones"
  | "nameProfile"
  | "numerology"
  | "angelNumbers"
  | "lunarCalendar"
  | "dailyTalisman"
  | "dreamDictionary"
  | "giftBySign"
  | "archetype"
  | "dailyCard"
  | "tarotCard"
  | "runeDay"
  | "intuitiveSign"
  | "talismans"
  | "auraColor"
  | "lunarRitual"
  | "karmicLessons"
  | "birthMatrix"
  | "vip"
  | "giveaways"
  | "vipNatalChart"
  | "vipCompatibility"
  | "vipMentalMap"
  | "vipCoupleCalendar"
  | "vipMonthForecast"
  | "vipMessageHelper"
  | "vipNameProfile"
  | "vipNumerology"
  | "vipAngelNumbers"
  | "vipTalismans"
  | "vipMysticDay";

export type MenuFeatureGroup = "love" | "profile" | "forecasts" | "mystic" | "vip";

export interface City {
  cityId: string;
  nameRu: string;
  nameEn: string;
  countryRu: string;
  countryCode: string;
  timezone: string;
  latitude: number;
  longitude: number;
  aliases?: string[];
}

export interface PersonState {
  name: string;
  sign: string;
  gender: Gender;
  birthDate: string;
  knowsTime: boolean;
  birthTime: string;
  cityQuery: string;
  selectedCityId: string;
}

export interface ZodiacCompatibilityMiniAppProps {
  variant?: Variant;
  initialSign?: string | null;
  initialMode?: string | null;
  source?: string | null;
  startParam?: string | null;
}

export interface ZodiacVipConfig {
  vipFreeAccessEnabled: boolean;
  vipFreeAccessUntil: string;
  vipPaymentsEnabled: boolean;
  telegramStarsEnabled: boolean;
}

export interface VipFeature {
  id: string;
  title: string;
  text: string;
}

export interface ZodiacSign {
  slug: string;
  emoji: string;
  name: string;
  range: string;
  element: ZodiacElement;
}

export interface NameResonance {
  text: string;
  adviceText: string;
  communicationShift: number;
  loveShift: number;
}

export interface RelationshipMapScore {
  id: string;
  label: string;
  shortLabel: string;
  value: number;
  text: string;
}

export interface MentalMapSummary {
  strengths: string;
  risks: string;
  advice: string;
  helps: string[];
  avoid: string[];
}

export interface MentalMapDynamic {
  label: string;
  text: string;
}

export interface CompatibilityResult {
  title: string;
  pairLabel: string;
  modeLabel: string;
  relationshipModeLabel: string;
  relationshipMode: RelationshipMode;
  dataUseLabel: string;
  scoreTierLabel: string;
  connectionLevel: string;
  overviewText: string;
  emotionalDynamicsText: string;
  communicationPlanText: string;
  conflictPointsText: string;
  bestContactFormat: string;
  coupleAdvice: string;
  note: string | null;
  validationMessages: string[];
  scores: {
    total: number;
    attraction: number;
    communication: number;
    love: number;
    household: number;
  };
  attractionText: string;
  communicationText: string;
  loveText: string;
  householdText: string;
  weakSpotText: string;
  adviceText: string;
  conclusionText: string;
  nameResonance: NameResonance | null;
  mapScores: RelationshipMapScore[];
  mapSummary: string;
  mentalMapSummary: MentalMapSummary;
  mentalMapDynamics: MentalMapDynamic[];
  strengthText: string;
  riskText: string;
}

export interface DayEnergy {
  type: string;
  bestFor: string;
  avoid: string;
  mood: string;
  relationshipTone: string;
}

export interface CoupleHoroscope {
  summary: string;
  relationship: string;
  talk: string;
  date: string;
  reconciliation: string;
  action: string;
  avoid: string;
  energy: DayEnergy;
}

export interface CoupleCalendarDay {
  dateKey: string;
  date: string;
  weekday: string;
  status: string;
  theme: string;
  energy: string;
  action: string;
  risk: string;
  advice: string;
}

export interface CoupleAction {
  mainAction: string;
  avoid: string;
  bestTone: string;
  smallStep: string;
}

export interface CoupleMessageTemplate {
  id: string;
  label: string;
  text: string;
}

export interface ReconciliationDay {
  status: string;
  approach: string;
  avoid: string;
  energy: DayEnergy;
}

export interface NatalChart {
  sign: ZodiacSign;
  element: string;
  modality: string;
  polarity: string;
  archetype: string;
  strengths: string;
  growth: string;
  loveStyle: string;
  communicationStyle: string;
  precisionNote: string;
  calculationLabel: string;
  accuracyNote: string;
  profileLabel: string;
  summary: NatalSummaryItem[];
  sections: NatalInsightSection[];
  compass: NatalCompass;
  vipBlocks: NatalVipBlock[];
  hasBirthDate: boolean;
  hasBirthTime: boolean;
  hasBirthCity: boolean;
  timeKnown: boolean;
}

export interface NatalSummaryItem {
  label: string;
  value: string;
}

export interface NatalInsightItem {
  label: string;
  text: string;
}

export interface NatalInsightSection {
  id: string;
  title: string;
  items: NatalInsightItem[];
}

export interface NatalCompass {
  strengths: string[];
  risks: string[];
  actions: string[];
}

export interface NatalVipBlock {
  title: string;
  text: string;
}

export interface ChineseHoroscope {
  animal: string;
  emoji: string;
  element: string;
  yinYang: string;
  profileLabel: string;
  summary: string;
  strengths: string;
  risks: string;
  relationshipStyle: string;
  workMoneyStyle: string;
  monthAdvice: string;
  compatibilityHints: string[];
  boundaryNote: string;
}

export interface ZodiacStoneProfile {
  sign: ZodiacSign;
  mainStone: string;
  additionalStones: string[];
  loveStone: string;
  calmStone: string;
  workStone: string;
  symbol: string;
  whenToUse: string;
  avoid: string;
}

export interface NameProfile {
  summary: NatalSummaryItem[];
  sections: NatalInsightSection[];
  portrait: string;
  vipBlocks: NatalVipBlock[];
}

export interface MonthForecast {
  title: string;
  theme: string;
  love: string;
  money: string;
  energy: string;
  risk: string;
  bestPeriod: string;
  advice: string;
}

export interface NumerologyProfile {
  lifePath: number | null;
  nameNumber: number | null;
  dayNumber: number;
  personalMonth: number | null;
  strengths: string;
  risks: string;
  advice: string;
  summary: string;
}

export interface AngelNumberProfile {
  label: string;
  safeKey: string;
  isValid: boolean;
  prompt?: string;
  patternType: AngelNumberPatternType;
  meaning: string;
  highlights: string;
  love: string;
  workMoney: string;
  intuition: string;
  actions: string[];
  avoid: string[];
  phrase: string;
  next24Hours: string;
  vipBlocks: NatalVipBlock[];
}

export type AngelNumberPatternType = "repeated" | "mirror" | "amplified" | "custom" | "fallback";

export interface LunarCalendarProfile {
  title: string;
  rhythm: string;
  love: string;
  workMoney: string;
  talks: string;
  reconciliation: string;
  action: string;
  avoid: string;
}

export interface DailyTalismanProfile {
  stone: string;
  color: string;
  number: number;
  phrase: string;
  action: string;
  avoid: string;
}

export interface DreamProfile {
  safeKey: string;
  symbol: string;
  general: string;
  emotional: string;
  highlight: string;
  advice: string;
  signConnection: string;
}

export type GiftRecipientType = "partner" | "friend" | "man" | "woman" | "colleague";

export interface GiftBySignProfile {
  sign: ZodiacSign;
  recipientLabel: string;
  ideas: string[];
  appreciates: string;
  avoid: string;
  symbolic: string;
  premium: string;
}

export interface NameCompatibilityProfile {
  title: string;
  emotional: string;
  communication: string;
  attraction: string;
  conflictRisk: string;
  reconciliation: string;
  helps: string;
  avoid: string;
}

export interface PersonalityArchetypeProfile {
  title: string;
  coreStrength: string;
  shadowRisk: string;
  relationship: string;
  workMoney: string;
  talisman: string;
  monthAdvice: string;
  completeness: string;
}

export type MessageTone = "soft" | "romantic" | "afterFight" | "longSilence" | "invite" | "reconciliation" | "short" | "honest";

export type ParsedDate =
  | { ok: true; iso: string; day: number; month: number; year: number; signSlug: string }
  | { ok: false; error: string; iso?: undefined; signSlug?: undefined };

export type NatalTimeTone = "morning" | "day" | "evening" | "night" | "unknown";
export type NatalCityTone = "north" | "south" | "east" | "west" | "open";
