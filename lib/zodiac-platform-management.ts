import channelLinks from "@/data/config/zodiac-channel-links.json";

export type ZodiacPlatformLanguage = "RU" | "UA" | "EN";
export type ZodiacPlatformRisk = "ok" | "watch" | "blocked";

export interface ZodiacPlatformChannel {
  title: string;
  slug: string;
  language: ZodiacPlatformLanguage;
  topic: string;
  icon: string;
  telegramUrl: string | null;
  telegramHandle: string | null;
  miniAppStartapp: string;
  miniAppUrl: string;
  navigationStatus: string;
  descriptionStatus: string;
  dailyPublishingStatus: string;
  analyticsStatus: string;
  risk: ZodiacPlatformRisk;
  riskLabel: string;
}

export interface ZodiacPlatformNavItem {
  id: string;
  label: string;
  href: string;
}

const botUsername = "zodiac_love_check_bot";
const links = channelLinks as Record<string, string | undefined>;

const baseChannels = [
  { slug: "zodiac-general", linkKey: "general", title: "Общий гороскоп", icon: "✨", topic: "ежедневный обзор" },
  { slug: "aries", linkKey: "aries", title: "Овен", icon: "♈", topic: "знак зодиака" },
  { slug: "taurus", linkKey: "taurus", title: "Телец", icon: "♉", topic: "знак зодиака" },
  { slug: "gemini", linkKey: "gemini", title: "Близнецы", icon: "♊", topic: "знак зодиака" },
  { slug: "cancer", linkKey: "cancer", title: "Рак", icon: "♋", topic: "знак зодиака" },
  { slug: "leo", linkKey: "leo", title: "Лев", icon: "♌", topic: "знак зодиака" },
  { slug: "virgo", linkKey: "virgo", title: "Дева", icon: "♍", topic: "знак зодиака" },
  { slug: "libra", linkKey: "libra", title: "Весы", icon: "♎", topic: "знак зодиака" },
  { slug: "scorpio", linkKey: "scorpio", title: "Скорпион", icon: "♏", topic: "знак зодиака" },
  { slug: "sagittarius", linkKey: "sagittarius", title: "Стрелец", icon: "♐", topic: "знак зодиака" },
  { slug: "capricorn", linkKey: "capricorn", title: "Козерог", icon: "♑", topic: "знак зодиака" },
  { slug: "aquarius", linkKey: "aquarius", title: "Водолей", icon: "♒", topic: "знак зодиака" },
  { slug: "pisces", linkKey: "pisces", title: "Рыбы", icon: "♓", topic: "знак зодиака" },
] as const;

export const zodiacPlatformNavItems: ZodiacPlatformNavItem[] = [
  { id: "overview", label: "Обзор", href: "/dashboard/networks/zodiac" },
  { id: "channels", label: "Каналы", href: "/dashboard/networks/zodiac/channels" },
  { id: "mini-app", label: "Mini App", href: "/compatibility" },
  { id: "content", label: "Контент", href: "/dashboard/networks/zodiac/content" },
  { id: "publishing", label: "Публикации", href: "/dashboard/networks/zodiac/publishing" },
  { id: "analytics", label: "Аналитика", href: "/dashboard/networks/zodiac/analytics" },
  { id: "feedback", label: "Отзывы", href: "/dashboard/networks/zodiac/feedback" },
  { id: "soft-launch", label: "Soft Launch", href: "/dashboard/networks/zodiac/operations" },
  { id: "security", label: "Безопасность", href: "/dashboard/networks/zodiac/security" },
  { id: "docs", label: "Документы", href: "/dashboard/networks/zodiac/docs" },
];

export const zodiacPlatformChannels: ZodiacPlatformChannel[] = baseChannels.map((channel) => {
  const telegramUrl = links[channel.linkKey] ?? null;
  const miniAppStartapp = channel.slug === "zodiac-general" ? "compat" : `compat_${channel.slug}`;

  return {
    title: channel.title,
    slug: channel.slug,
    language: "RU",
    topic: channel.topic,
    icon: channel.icon,
    telegramUrl,
    telegramHandle: telegramUrl ? `@${telegramUrl.replace("https://t.me/", "")}` : null,
    miniAppStartapp,
    miniAppUrl: `https://t.me/${botUsername}?startapp=${miniAppStartapp}`,
    navigationStatus: "Готово, проверка через dry-run",
    descriptionStatus: "Готово, live только вручную",
    dailyPublishingStatus: "ON, ledger protected",
    analyticsStatus: "Mini App events, Redis production",
    risk: "ok",
    riskLabel: "OK",
  };
});

export const zodiacPlatformSummary = {
  totalChannels: zodiacPlatformChannels.length,
  navigationReady: zodiacPlatformChannels.filter((channel) => channel.navigationStatus.includes("Готово")).length,
  descriptionsReady: zodiacPlatformChannels.filter((channel) => channel.descriptionStatus.includes("Готово")).length,
  publishingReady: zodiacPlatformChannels.filter((channel) => channel.dailyPublishingStatus.includes("ON")).length,
  problems: zodiacPlatformChannels.filter((channel) => channel.risk !== "ok").length,
};

export const zodiacPlatformDocPaths = [
  "docs/zodiac-telegram-platform-admin-safety.md",
  "docs/zodiac-telegram-platform-dashboard-auth.md",
  "docs/zodiac-telegram-platform-content-engine.md",
  "docs/zodiac-telegram-platform-management-console.md",
  "docs/zodiac-telegram-platform-publishing-center.md",
  "docs/zodiac-telegram-platform-feedback-center.md",
  "docs/zodiac-telegram-platform-map.md",
  "docs/zodiac-telegram-platform-ux-audit.md",
  "docs/zodiac-production-readiness.md",
  "docs/zodiac-new-chat-handoff.md",
  "docs/zodiac-full-project-audit-and-roadmap.md",
  "docs/zodiac-channel-descriptions.md",
  "docs/zodiac-controlled-soft-launch-execution.md",
  "docs/zodiac-first-users-analytics-baseline.md",
];
