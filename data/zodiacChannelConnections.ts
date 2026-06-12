export type BotAdminStatus = "not_connected" | "admin_added" | "needs_check";
export type CreationStatus = "needs_creation" | "created" | "needs_review";
export type PublishStatus = "not_ready" | "dry_run_ready" | "publish_ready";

export interface ZodiacChannelConnection {
  id: string;
  displayName: string;
  emoji: string;
  plannedUsername: string;
  actualUsername: string | null;
  publicLink: string | null;
  telegramChannelId: string | null;
  botAdminStatus: BotAdminStatus;
  creationStatus: CreationStatus;
  publishStatus: PublishStatus;
  notes: string;
}

export const zodiacChannelConnections: ZodiacChannelConnection[] = [
  {
    id: "zodiac-general",
    displayName: "Гороскоп на сегодня ✨",
    emoji: "✨",
    plannedUsername: "zodiac_orbit",
    actualUsername: null,
    publicLink: null,
    telegramChannelId: null,
    botAdminStatus: "not_connected",
    creationStatus: "needs_creation",
    publishStatus: "not_ready",
    notes: ""
  },
  {
    id: "aries",
    displayName: "Овен ♈️ Гороскоп",
    emoji: "♈️",
    plannedUsername: "aries_orbit",
    actualUsername: null,
    publicLink: null,
    telegramChannelId: null,
    botAdminStatus: "not_connected",
    creationStatus: "needs_creation",
    publishStatus: "not_ready",
    notes: ""
  },
  {
    id: "taurus",
    displayName: "Телец ♉️ Гороскоп",
    emoji: "♉️",
    plannedUsername: "taurus_orbit",
    actualUsername: null,
    publicLink: null,
    telegramChannelId: null,
    botAdminStatus: "not_connected",
    creationStatus: "needs_creation",
    publishStatus: "not_ready",
    notes: ""
  },
  {
    id: "gemini",
    displayName: "Близнецы ♊️ Гороскоп",
    emoji: "♊️",
    plannedUsername: "gemini_orbit",
    actualUsername: null,
    publicLink: null,
    telegramChannelId: null,
    botAdminStatus: "not_connected",
    creationStatus: "needs_creation",
    publishStatus: "not_ready",
    notes: ""
  },
  {
    id: "cancer",
    displayName: "Рак ♋️ Гороскоп",
    emoji: "♋️",
    plannedUsername: "cancer_orbit",
    actualUsername: null,
    publicLink: null,
    telegramChannelId: null,
    botAdminStatus: "not_connected",
    creationStatus: "needs_creation",
    publishStatus: "not_ready",
    notes: ""
  },
  {
    id: "leo",
    displayName: "Лев ♌️ Гороскоп",
    emoji: "♌️",
    plannedUsername: "leo_orbit",
    actualUsername: null,
    publicLink: null,
    telegramChannelId: null,
    botAdminStatus: "not_connected",
    creationStatus: "needs_creation",
    publishStatus: "not_ready",
    notes: ""
  },
  {
    id: "virgo",
    displayName: "Дева ♍️ Гороскоп",
    emoji: "♍️",
    plannedUsername: "virgo_orbit",
    actualUsername: null,
    publicLink: null,
    telegramChannelId: null,
    botAdminStatus: "not_connected",
    creationStatus: "needs_creation",
    publishStatus: "not_ready",
    notes: ""
  },
  {
    id: "libra",
    displayName: "Весы ♎️ Гороскоп",
    emoji: "♎️",
    plannedUsername: "libra_orbit",
    actualUsername: null,
    publicLink: null,
    telegramChannelId: null,
    botAdminStatus: "not_connected",
    creationStatus: "needs_creation",
    publishStatus: "not_ready",
    notes: ""
  },
  {
    id: "scorpio",
    displayName: "Скорпион ♏️ Гороскоп",
    emoji: "♏️",
    plannedUsername: "scorpio_orbit",
    actualUsername: null,
    publicLink: null,
    telegramChannelId: null,
    botAdminStatus: "not_connected",
    creationStatus: "needs_creation",
    publishStatus: "not_ready",
    notes: ""
  },
  {
    id: "sagittarius",
    displayName: "Стрелец ♐️ Гороскоп",
    emoji: "♐️",
    plannedUsername: "sagittarius_orbit",
    actualUsername: null,
    publicLink: null,
    telegramChannelId: null,
    botAdminStatus: "not_connected",
    creationStatus: "needs_creation",
    publishStatus: "not_ready",
    notes: ""
  },
  {
    id: "capricorn",
    displayName: "Козерог ♑️ Гороскоп",
    emoji: "♑️",
    plannedUsername: "capricorn_orbit",
    actualUsername: null,
    publicLink: null,
    telegramChannelId: null,
    botAdminStatus: "not_connected",
    creationStatus: "needs_creation",
    publishStatus: "not_ready",
    notes: ""
  },
  {
    id: "aquarius",
    displayName: "Водолей ♒️ Гороскоп",
    emoji: "♒️",
    plannedUsername: "aquarius_orbit",
    actualUsername: null,
    publicLink: null,
    telegramChannelId: null,
    botAdminStatus: "not_connected",
    creationStatus: "needs_creation",
    publishStatus: "not_ready",
    notes: ""
  },
  {
    id: "pisces",
    displayName: "Рыбы ♓️ Гороскоп",
    emoji: "♓️",
    plannedUsername: "pisces_orbit",
    actualUsername: null,
    publicLink: null,
    telegramChannelId: null,
    botAdminStatus: "not_connected",
    creationStatus: "needs_creation",
    publishStatus: "not_ready",
    notes: ""
  }
];

export function getZodiacConnectionProgress() {
  const total = zodiacChannelConnections.length;
  const created = zodiacChannelConnections.filter(c => c.creationStatus === "created").length;
  const botAdminAdded = zodiacChannelConnections.filter(c => c.botAdminStatus === "admin_added").length;
  const channelIdConnected = zodiacChannelConnections.filter(c => c.telegramChannelId !== null).length;
  const publishReady = zodiacChannelConnections.filter(c => c.publishStatus === "publish_ready").length;

  return {
    total,
    created,
    botAdminAdded,
    channelIdConnected,
    publishReady
  };
}

export function getMissingZodiacConnections() {
  return zodiacChannelConnections.filter(c => c.publishStatus !== "publish_ready");
}

export function isZodiacNetworkPublishReady() {
  return zodiacChannelConnections.every(c => c.publishStatus === "publish_ready");
}

export function getZodiacChannelConnectionById(id: string) {
  return zodiacChannelConnections.find(c => c.id === id);
}
