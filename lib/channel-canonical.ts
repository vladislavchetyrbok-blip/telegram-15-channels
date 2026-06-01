export const canonicalChannelTitles: Record<string, string> = {
  "money-opportunities": "Деньги и возможности",
  "ai-tech": "AI и технологии",
  "ukraine-market": "Україна: можливості та ринок",
  "mens-style": "Мужской стиль и вещи",
  "home-tech": "Техника для дома",
  "fishing-rest": "Рыбалка и отдых",
  "dnipro-city": "Дніпро / Город Днепр",
  "auto-comfort": "Авто и комфорт",
  "business-ideas": "Ідеї для бізнесу",
  "personal-progress": "Личный прогресс",
  "dnipro-real-estate-ru": "Недвижимость Днепра",
  "dnipro-real-estate-ua": "Нерухомість Дніпра",
  "commercial-real-estate": "Коммерческая недвижимость",
  "land-houses": "Земля и дома / Земля та будинки",
  "real-estate-investments": "Инвестиции в недвижимость",
};

export function getCanonicalChannelTitle(channelId: string, fallback = "") {
  return canonicalChannelTitles[channelId] ?? fallback ?? channelId;
}
