import type { TelegramAvatarStatus } from "@/types";

export type GenerationLanguage = "ru" | "uk" | "ru-uk";
export type GenerationChannelStatus = "draft" | "connected_mock" | "paused_legacy";

export interface ChannelGenerationConfig {
  id: string;
  name: string;
  topic: string;
  language: GenerationLanguage;
  postStyle: string;
  postingFrequency: string;
  status: GenerationChannelStatus;
  telegramChatId: string;
  botAdded: boolean;
  telegramAvatarStatus: TelegramAvatarStatus;
  logoId: string;
  logoPath: string;
  logoStatus: "missing" | "uploaded" | "needs_review" | "approved" | "rejected";
  dryRun: true;
  telegramSent: false;
}

type ChannelGenerationConfigSeed = Omit<ChannelGenerationConfig, "logoId" | "logoPath" | "logoStatus">;

export const channelLogoFileNameHints = [
  "01-money-opportunities.svg",
  "02-ai-technologies.svg",
  "03-ukraine-opportunities-market.svg",
  "04-men-style-things.svg",
  "05-home-tech.svg",
  "06-fishing-rest.svg",
  "07-dnipro-city.svg",
  "08-auto-comfort.svg",
  "09-business-ideas.svg",
  "10-personal-progress.svg",
  "11-dnipro-real-estate-ru.svg",
  "12-dnipro-real-estate-ua.svg",
  "13-commercial-real-estate.svg",
  "14-land-houses.svg",
  "15-real-estate-investments.svg",
];

const baseSeeds = [
  {
    id: "money-opportunities",
    name: "Деньги и возможности",
    topic: "заработок, возможности, удалённая работа, гранты, новые рынки",
    language: "ru",
    postStyle: "практичный, спокойный, без обещаний лёгких денег",
    postingFrequency: "2-3 posts/day",
    telegramChatId: "-1003995852493",
  },
  {
    id: "ai-tech",
    name: "AI и технологии",
    topic: "AI, технологии, автоматизация, инструменты, гаджеты",
    language: "ru",
    postStyle: "простой, технологичный, без перегруза и лишнего хайпа",
    postingFrequency: "3 posts/day",
    telegramChatId: "-1003504277183",
  },
  {
    id: "ukraine-market",
    name: "Україна: можливості та ринок",
    topic: "український ринок, вакансії, бізнес-можливості, програми підтримки",
    language: "uk",
    postStyle: "корисний, діловий, українською, з чіткими кроками",
    postingFrequency: "1-2 posts/day",
    telegramChatId: "-1003980997461",
  },
  {
    id: "mens-style",
    name: "Мужской стиль и вещи",
    topic: "мужской стиль, вещи, аксессуары, уход, функциональная одежда",
    language: "ru",
    postStyle: "уверенный, спокойный, практичный, без дешёвого пафоса",
    postingFrequency: "1 post/day",
    telegramChatId: "-1003944130233",
  },
  {
    id: "home-tech",
    name: "Техника для дома",
    topic: "бытовая техника, умный дом, домашние решения, обзоры",
    language: "ru",
    postStyle: "практичный, бытовой, полезный, с критериями выбора",
    postingFrequency: "2 posts/day",
    telegramChatId: "-1003828463272",
  },
  {
    id: "fishing-rest",
    name: "Рыбалка и отдых",
    topic: "рыбалка, снасти, отдых на воде, выезды за город",
    language: "ru",
    postStyle: "спокойный, опытный, атмосферный, без незаконных советов",
    postingFrequency: "1 post/day",
    telegramChatId: "-1003819092877",
  },
  {
    id: "dnipro-city",
    name: "Дніпро / Город Днепр",
    topic: "город Днепр, события, места, сервисы, локальные новости",
    language: "ru-uk",
    postStyle: "локальный, живой, полезный, без паники и слухов",
    postingFrequency: "2-3 posts/day",
    telegramChatId: "-1003920058596",
  },
  {
    id: "auto-comfort",
    name: "Авто и комфорт",
    topic: "авто, комфорт в дороге, аксессуары, уход за машиной",
    language: "ru",
    postStyle: "практичный, рациональный, без опасных советов",
    postingFrequency: "1-2 posts/day",
    telegramChatId: "-1003801331980",
  },
  {
    id: "business-ideas",
    name: "Ідеї для бізнесу",
    topic: "ідеї для бізнесу, мікробізнес, продажі, ніші",
    language: "uk",
    postStyle: "короткий, прикладний, українською, без фінансових гарантій",
    postingFrequency: "2 posts/day",
    telegramChatId: "-1003995476841",
  },
  {
    id: "personal-progress",
    name: "Личный прогресс",
    topic: "личный прогресс, привычки, фокус, карьера, мышление",
    language: "ru",
    postStyle: "спокойный, взрослый, без мотивационной истерики",
    postingFrequency: "1-2 posts/day",
    telegramChatId: "-1003793101443",
  },
  {
    id: "dnipro-real-estate-ru",
    name: "Недвижимость Днепра",
    topic: "недвижимость Днепра, квартиры, аренда, районы, цены",
    language: "ru",
    postStyle: "практичный, рыночный, понятный, без юридических гарантий",
    postingFrequency: "1-2 posts/day",
    telegramChatId: "-1003703940196",
  },
  {
    id: "dnipro-real-estate-ua",
    name: "Нерухомість Дніпра",
    topic: "нерухомість Дніпра, квартири, оренда, райони, ціни",
    language: "uk",
    postStyle: "корисний, ринковий, українською, без неперевірених гарантій",
    postingFrequency: "1-2 posts/day",
    telegramChatId: "-1003973181492",
  },
  {
    id: "commercial-real-estate",
    name: "Коммерческая недвижимость",
    topic: "коммерческая недвижимость, офисы, склады, аренда, помещения",
    language: "ru",
    postStyle: "деловой, конкретный, для бизнеса, без обещаний доходности",
    postingFrequency: "1 post/day",
    telegramChatId: "-1003163500222",
  },
  {
    id: "land-houses",
    name: "Земля и дома / Земля та будинки",
    topic: "земля, дома, участки, коттеджи, пригород",
    language: "ru-uk",
    postStyle: "спокойный, практичный, загородный, с чек-листами",
    postingFrequency: "1-2 posts/day",
    telegramChatId: "-1003767929992",
  },
  {
    id: "real-estate-investments",
    name: "Инвестиции в недвижимость",
    topic: "инвестиции в недвижимость, риски, стратегии, анализ",
    language: "ru",
    postStyle: "аналитический, осторожный, без обещаний дохода",
    postingFrequency: "1-2 posts/day",
    telegramChatId: "-1003962737183",
  },
] satisfies Array<Omit<ChannelGenerationConfigSeed, "status" | "botAdded" | "telegramAvatarStatus" | "dryRun" | "telegramSent">>;

const channelGenerationConfigSeeds: ChannelGenerationConfigSeed[] = baseSeeds.map((channel) => ({
  ...channel,
  status: "paused_legacy",
  botAdded: true,
  telegramAvatarStatus: "manual_configured",
  dryRun: true,
  telegramSent: false,
}));

export const channelGenerationConfigs: ChannelGenerationConfig[] = channelGenerationConfigSeeds.map((channel, index) => {
  const fileName = channelLogoFileNameHints[index] ?? `${String(index + 1).padStart(2, "0")}-${channel.id}.svg`;

  return {
    ...channel,
    logoId: `logo-${channel.id}`,
    logoPath: `/assets/channel-logos/${fileName}`,
    logoStatus: "missing",
  };
});

export function getChannelGenerationConfig(channelId: string) {
  return channelGenerationConfigs.find((channel) => channel.id === channelId);
}
