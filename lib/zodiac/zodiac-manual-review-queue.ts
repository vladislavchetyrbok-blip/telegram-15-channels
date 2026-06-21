export interface ZodiacManualReviewItem {
  id: string;
  channelName: string;
  channelSlug: string;
  queueStatus: "OK" | "REVIEW" | "BLOCKED";
  qualityTarget: number;
  dryRunStatus: string;
  ledgerStatus: string;
  previewReviewStatus: string;
  riskFlags: string[];
  manualChecklist: string[];
  nextAction: string;
  liveStatus: string;
  safetyNote: string;
}

const defaultStatus = {
  queueStatus: "REVIEW" as const,
  qualityTarget: 95,
  dryRunStatus: "OK (последний запуск)",
  ledgerStatus: "Clean (без дублей)",
  previewReviewStatus: "Требует ручного просмотра",
  riskFlags: ["Не проверено ревьюером"],
  manualChecklist: [
    "dry-run прошёл",
    "ledger без ошибок",
    "нет дублей",
    "нет пропусков каналов",
    "качество текста не ниже целевого уровня",
    "CTA мягкий и безопасный",
    "Mini App-связка работает",
    "нет гарантированных предсказаний",
    "нет давления страхом",
    "владелец дал отдельное разрешение"
  ],
  nextAction: "Пройти чеклист в preview review",
  liveStatus: "Заблокировано",
  safetyNote: "Live-публикация отключена. Нужен ручной просмотр и отдельное разрешение."
};

export const ZodiacManualReviewQueue: ZodiacManualReviewItem[] = [
  {
    id: "general",
    channelName: "Общий гороскоп",
    channelSlug: "zodiac-general",
    ...defaultStatus
  },
  {
    id: "aries",
    channelName: "Овен",
    channelSlug: "aries",
    ...defaultStatus
  },
  {
    id: "taurus",
    channelName: "Телец",
    channelSlug: "taurus",
    ...defaultStatus
  },
  {
    id: "gemini",
    channelName: "Близнецы",
    channelSlug: "gemini",
    ...defaultStatus
  },
  {
    id: "cancer",
    channelName: "Рак",
    channelSlug: "cancer",
    ...defaultStatus
  },
  {
    id: "leo",
    channelName: "Лев",
    channelSlug: "leo",
    ...defaultStatus
  },
  {
    id: "virgo",
    channelName: "Дева",
    channelSlug: "virgo",
    ...defaultStatus
  },
  {
    id: "libra",
    channelName: "Весы",
    channelSlug: "libra",
    ...defaultStatus
  },
  {
    id: "scorpio",
    channelName: "Скорпион",
    channelSlug: "scorpio",
    ...defaultStatus
  },
  {
    id: "sagittarius",
    channelName: "Стрелец",
    channelSlug: "sagittarius",
    ...defaultStatus
  },
  {
    id: "capricorn",
    channelName: "Козерог",
    channelSlug: "capricorn",
    ...defaultStatus
  },
  {
    id: "aquarius",
    channelName: "Водолей",
    channelSlug: "aquarius",
    ...defaultStatus
  },
  {
    id: "pisces",
    channelName: "Рыбы",
    channelSlug: "pisces",
    ...defaultStatus
  }
];
