/**
 * Package 202: Aphrodite VIP / Natal / Numerology Visual Review.
 *
 * Static review model only. It documents visual readiness and safety boundaries
 * without changing VIP access, payment, Telegram API, database writes, or live
 * Mini App runtime behavior.
 */

export type AphroditeVipVisualReviewAreaId =
  | "vip-natal-chart"
  | "birth-chart"
  | "vip-numerology"
  | "vip-couple-calendar"
  | "future-locked-sections"
  | "free-preview-fallback";

export type AphroditeVipVisualReviewArea = {
  id: AphroditeVipVisualReviewAreaId;
  title: string;
  routeOrFlow: string;
  sourceFiles: readonly string[];
  currentState: string;
  visualFocus: readonly string[];
  recommendations: readonly string[];
  safetyChecks: readonly string[];
};

export type AphroditeVipNatalNumerologyVisualReview = {
  packageNumber: 202;
  title: string;
  classification: string;
  safetyLabels: readonly string[];
  reviewAreas: AphroditeVipVisualReviewArea[];
  requiredCoverage: readonly string[];
  safetyFlags: {
    liveVipChangedNow: false;
    paymentChangedNow: false;
    vipUnlockNow: false;
    entitlementChangedNow: false;
    telegramApiNow: false;
    databaseWriteNow: false;
    productionLaunchNow: false;
    dateInputPreservedNow: true;
  };
  summary: {
    reviewedAreas: number;
    hasNatalChartReview: boolean;
    hasNumerologyReview: boolean;
    hasVipCoupleCalendarReview: boolean;
    hasLockedSectionReview: boolean;
    hasFreePreviewFallbackReview: boolean;
  };
  nextRecommendedPackage: string;
};

export const APHRODITE_VIP_NATAL_NUMEROLOGY_VISUAL_REVIEW_TITLE =
  "Review визуала VIP / Natal / Numerology";

export const APHRODITE_VIP_NATAL_NUMEROLOGY_VISUAL_REVIEW_CLASSIFICATION =
  "Только visual review / Live VIP не изменён / Нет оплаты";

export const APHRODITE_VIP_NATAL_NUMEROLOGY_VISUAL_REVIEW_SAFETY_LABELS = [
  "Нет реальной оплаты",
  "Нет VIP-разблокировки",
  "Нет Telegram API",
  "Нет записи в базу данных",
  "Нет production-запуска",
  "Visual review не открывает VIP",
] as const;

export const APHRODITE_VIP_NATAL_NUMEROLOGY_VISUAL_REVIEW_RULE =
  "Package 202 фиксирует visual review для VIP/Natal/Numerology flow и не меняет live VIP access, оплату, entitlement, Telegram API, БД или production delivery.";

const sharedSafetyChecks = [
  "нет payment CTA",
  "нет VIP unlock",
  "нет hard prophecy",
  "нет medical/legal/financial advice",
  "сохранён текстовый ввод даты рождения ДД.ММ.ГГГГ",
] as const;

const reviewAreas: AphroditeVipVisualReviewArea[] = [
  {
    id: "vip-natal-chart",
    title: "VIP natal chart visual structure",
    routeOrFlow: "/miniapp -> VIP раздел -> Натальная карта+",
    sourceFiles: ["components/ZodiacCompatibilityMiniApp.tsx", "components/ZodiacVipSections.tsx"],
    currentState: "Натальная карта уже использует общий birth-date helper и показывает VIP-depth как безопасный preview/fallback.",
    visualFocus: [
      "иерархия первого результата",
      "понятные блоки планет/домов без стены текста",
      "mobile layout для Telegram WebView",
      "аккуратный статус free preview",
      "preserve date input marker",
    ],
    recommendations: [
      "Оставить один главный insight над деталями карты.",
      "Разделять базовый результат и будущую глубину визуально, без активного CTA оплаты.",
      "Держать disclaimer рядом с VIP-depth блоками, чтобы не звучало как жёсткое предсказание.",
    ],
    safetyChecks: sharedSafetyChecks,
  },
  {
    id: "birth-chart",
    title: "Birth chart visual structure",
    routeOrFlow: "/birth-matrix и miniapp birth chart entry",
    sourceFiles: ["app/birth-matrix/BirthMatrixClient.tsx", "components/zodiac-mini-app/ZodiacDateInput.tsx"],
    currentState: "Birth chart entry уже переведён на текстовый ввод даты и отдельный визуальный result summary.",
    visualFocus: [
      "card hierarchy",
      "readability",
      "date input preservation",
      "result summary before details",
      "future locked section boundary",
    ],
    recommendations: [
      "Не возвращать native date picker в birth-date сценарии.",
      "Сохранять helper text: Дата рождения, Формат: ДД.ММ.ГГГГ, Например: 15.06.1998.",
      "Любой будущий paid teaser оставлять locked preview без доступа.",
    ],
    safetyChecks: sharedSafetyChecks,
  },
  {
    id: "vip-numerology",
    title: "VIP numerology visual structure",
    routeOrFlow: "/miniapp -> Мой профиль / Нумерология",
    sourceFiles: ["components/ZodiacCompatibilityMiniApp.tsx", "components/ZodiacVipSections.tsx"],
    currentState: "Нумерология строится от natalPerson и должна оставаться понятной как бесплатный preview без VIP unlock.",
    visualFocus: [
      "short number cards",
      "clear meaning labels",
      "mobile scan",
      "no medical/legal/financial advice",
      "free preview fallback",
    ],
    recommendations: [
      "Показывать число, короткий смысл и мягкий следующий шаг в одной компактной карточке.",
      "Не обещать точные события, деньги, здоровье или юридические исходы.",
      "Сохранять будущий VIP-depth как locked preview, пока нет entitlement.",
    ],
    safetyChecks: sharedSafetyChecks,
  },
  {
    id: "vip-couple-calendar",
    title: "VIP couple calendar visual structure",
    routeOrFlow: "/miniapp -> compatibility -> 30 дней пары",
    sourceFiles: ["components/ZodiacCompatibilityMiniApp.tsx", "lib/zodiac-couple-calendar-personalization.ts"],
    currentState: "Календарь пары должен различать дни и показывать период без повторения одинакового текста.",
    visualFocus: [
      "разные day cards",
      "period label",
      "relationship mode context",
      "readable 7/30 day layout",
      "safe romantic tone",
    ],
    recommendations: [
      "Группировать дни по теме недели или фазе пары, чтобы не перегружать mobile view.",
      "Каждый день должен иметь свой короткий insight и action.",
      "VIP 30-day depth не должен открываться через этот review.",
    ],
    safetyChecks: sharedSafetyChecks,
  },
  {
    id: "future-locked-sections",
    title: "Future locked sections",
    routeOrFlow: "/miniapp -> VIP teasers и locked future sections",
    sourceFiles: ["app/miniapp/page.tsx", "components/ZodiacCompatibilityMiniApp.tsx"],
    currentState: "Будущие VIP-блоки отображаются как locked preview и не создают реальный доступ.",
    visualFocus: [
      "locked status label",
      "no payment CTA",
      "no entitlement promise",
      "clear fallback route",
      "production launch boundary",
    ],
    recommendations: [
      "Каждый locked teaser должен прямо объяснять, что доступ не открыт.",
      "Не использовать кнопки с языком покупки, оплаты или активации VIP.",
      "Оставить только preview/navigation, пока пользователь не подтвердит запуск оплаты отдельно.",
    ],
    safetyChecks: sharedSafetyChecks,
  },
  {
    id: "free-preview-fallback",
    title: "Free preview fallback",
    routeOrFlow: "/miniapp/love-reading-preview и VIP fallback screens",
    sourceFiles: ["app/miniapp/love-reading-preview/page.tsx", "app/miniapp/page.tsx"],
    currentState: "Fallback должен давать ценность без оплаты, записи в БД и VIP unlock.",
    visualFocus: [
      "clear preview boundary",
      "readability",
      "safe CTA wording",
      "mobile card rhythm",
      "no real VIP access",
    ],
    recommendations: [
      "Закрепить безопасный текст: preview без оплаты и без VIP-доступа.",
      "Держать fallback отдельным от будущей full version.",
      "Не добавлять active payment CTA до отдельного подтверждённого пакета.",
    ],
    safetyChecks: sharedSafetyChecks,
  },
];

export function getAphroditeVipNatalNumerologyVisualReview(): AphroditeVipNatalNumerologyVisualReview {
  const copiedAreas = reviewAreas.map((area) => ({
    ...area,
    sourceFiles: [...area.sourceFiles],
    visualFocus: [...area.visualFocus],
    recommendations: [...area.recommendations],
    safetyChecks: [...area.safetyChecks],
  }));

  return {
    packageNumber: 202,
    title: APHRODITE_VIP_NATAL_NUMEROLOGY_VISUAL_REVIEW_TITLE,
    classification: APHRODITE_VIP_NATAL_NUMEROLOGY_VISUAL_REVIEW_CLASSIFICATION,
    safetyLabels: APHRODITE_VIP_NATAL_NUMEROLOGY_VISUAL_REVIEW_SAFETY_LABELS,
    reviewAreas: copiedAreas,
    requiredCoverage: [
      "VIP natal chart visual structure",
      "birth chart visual structure",
      "VIP numerology visual structure",
      "VIP couple calendar visual structure",
      "future locked sections",
      "free preview fallback",
      "readability",
      "card hierarchy",
      "mobile layout",
      "date input preservation",
      "no payment CTA",
      "no VIP unlock",
      "no hard prophecy",
      "no medical/legal/financial advice",
    ],
    safetyFlags: {
      liveVipChangedNow: false,
      paymentChangedNow: false,
      vipUnlockNow: false,
      entitlementChangedNow: false,
      telegramApiNow: false,
      databaseWriteNow: false,
      productionLaunchNow: false,
      dateInputPreservedNow: true,
    },
    summary: {
      reviewedAreas: copiedAreas.length,
      hasNatalChartReview: copiedAreas.some((area) => area.id === "vip-natal-chart"),
      hasNumerologyReview: copiedAreas.some((area) => area.id === "vip-numerology"),
      hasVipCoupleCalendarReview: copiedAreas.some((area) => area.id === "vip-couple-calendar"),
      hasLockedSectionReview: copiedAreas.some((area) => area.id === "future-locked-sections"),
      hasFreePreviewFallbackReview: copiedAreas.some((area) => area.id === "free-preview-fallback"),
    },
    nextRecommendedPackage: "Package 203 — Daily/Weekly/Monthly Horoscope Visual Cards",
  };
}
