import { vipFeatureAnalyticsEvents } from "./analytics";
import { signs } from "./constants";
import type { MoreFeatureId } from "./types";

export const vipDetailFeatureIds = new Set<MoreFeatureId>(Object.keys(vipFeatureAnalyticsEvents) as MoreFeatureId[]);

export function findSign(slug: string) {
  return signs.find((sign) => sign.slug === slug) ?? signs[0];
}

export function sectionForFeature(feature: MoreFeatureId) {
  const sections: Partial<Record<MoreFeatureId, string>> = {
    todayForecast: "today",
    weekForecast: "week",
    luckyDays: "lucky_days",
    compatibilityTool: "compatibility",
    coupleHoroscope: "couple_horoscope",
    mentalMap: "relationship_map",
    coupleCalendar: "couple_calendar",
    reconciliation: "reconciliation",
    messageHelper: "message_helper",
    nameCompatibility: "name_compatibility",
    natalChart: "natal_chart",
    chineseHoroscope: "chinese_horoscope",
    zodiacStones: "zodiac_stones",
    nameProfile: "name_profile",
    numerology: "numerology",
    angelNumbers: "angel_numbers",
    lunarCalendar: "lunar_calendar",
    dailyTalisman: "daily_talisman",
    giftBySign: "gift_by_sign",
    archetype: "archetype",
    dailyCard: "hub",
    tarotCard: "hub",
    runeDay: "hub",
    intuitiveSign: "hub",
    talismans: "mystic",
    auraColor: "mystic",
    lunarRitual: "mystic",
    karmicLessons: "mystic",
    birthMatrix: "mystic",
    vip: "vip",
    giveaways: "giveaways",
    vipNatalChart: "vip",
    vipCompatibility: "vip",
    vipMentalMap: "vip",
    vipCoupleCalendar: "vip",
    vipMonthForecast: "vip",
    vipMessageHelper: "vip",
    vipNameProfile: "vip",
    vipNumerology: "vip",
    vipAngelNumbers: "vip",
    vipTalismans: "vip",
    vipMysticDay: "vip",
  };
  return sections[feature] ?? "hub";
}
