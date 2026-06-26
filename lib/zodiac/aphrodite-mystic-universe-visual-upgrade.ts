/**
 * Package 204: Aphrodite Mystic / Cards / Universe Message Visual Upgrade.
 *
 * UI/readability model only. The live component upgrade is presentation-only and
 * does not add Telegram API calls, database writes, payment, VIP unlock, or
 * external analytics.
 */

export type AphroditeMysticUniverseVisualArea = {
  id: string;
  title: string;
  sourceFiles: readonly string[];
  visualChange: string;
  safetyNotes: readonly string[];
};

export type AphroditeMysticUniverseVisualUpgradeModel = {
  packageNumber: 204;
  title: string;
  classification: string;
  safetyLabels: readonly string[];
  visualAreas: AphroditeMysticUniverseVisualArea[];
  safetyFlags: {
    telegramApiNow: false;
    databaseWriteNow: false;
    paymentChangedNow: false;
    vipUnlockNow: false;
    externalAnalyticsNow: false;
    hardProphecyNow: false;
    medicalLegalFinancialAdviceNow: false;
  };
  nextRecommendedPackage: string;
};

export const APHRODITE_MYSTIC_UNIVERSE_VISUAL_UPGRADE_TITLE =
  "Визуальный апгрейд Mystic / Cards / Universe Message";

export const APHRODITE_MYSTIC_UNIVERSE_VISUAL_UPGRADE_CLASSIFICATION =
  "Только UI upgrade / Mystic logic не изменена / Нет Telegram API";

export const APHRODITE_MYSTIC_UNIVERSE_VISUAL_UPGRADE_SAFETY_LABELS = [
  "Нет жёстких пророчеств",
  "Нет манипуляции страхом",
  "Нет medical/legal/financial advice",
  "Нет оплаты",
  "Нет VIP-разблокировки",
  "Нет Telegram API",
  "Нет записи в базу данных",
] as const;

export const APHRODITE_MYSTIC_UNIVERSE_VISUAL_UPGRADE_RULE =
  "Package 204 усиливает читаемость Mystic cards и блока «Послание Вселенной», но не меняет расчёты, date input, analytics callbacks, Telegram API, DB, оплату или VIP.";

const visualAreas: AphroditeMysticUniverseVisualArea[] = [
  {
    id: "universe-message-panel",
    title: "Послание Вселенной",
    sourceFiles: ["components/zodiac-mini-app/AphroditeMysticUniversePanel.tsx", "components/ZodiacMysticSections.tsx"],
    visualChange: "Новый compact panel выделяет message, focus и safety note перед деталями карты.",
    safetyNotes: ["символическая подсказка", "не жёсткое предсказание", "без страха и давления"],
  },
  {
    id: "daily-card-layout",
    title: "Карта дня",
    sourceFiles: ["components/ZodiacMysticSections.tsx", "lib/zodiac-mystic-content.ts"],
    visualChange: "Карта дня получает главный universe message перед love/resources/action деталями.",
    safetyNotes: ["нет оплаты", "нет VIP unlock", "нет medical/legal/financial advice"],
  },
  {
    id: "tarot-layout",
    title: "Таро и карты",
    sourceFiles: ["components/ZodiacMysticSections.tsx", "components/zodiac-mini-app/TarotSpreadVisual.tsx"],
    visualChange: "Tarot flow показывает мягкое послание до выбора темы и сохраняет честный формат.",
    safetyNotes: ["вопрос не сохраняется", "нет фатальности", "нет Telegram API"],
  },
  {
    id: "rune-layout",
    title: "Руны",
    sourceFiles: ["components/ZodiacMysticSections.tsx", "components/zodiac-mini-app/RuneSpreadVisual.tsx"],
    visualChange: "Rune flow получает clearer universe message и отдельный фокус действия.",
    safetyNotes: ["символическая подсказка", "нет DB write", "нет external analytics"],
  },
];

export function getAphroditeMysticUniverseVisualUpgrade(): AphroditeMysticUniverseVisualUpgradeModel {
  return {
    packageNumber: 204,
    title: APHRODITE_MYSTIC_UNIVERSE_VISUAL_UPGRADE_TITLE,
    classification: APHRODITE_MYSTIC_UNIVERSE_VISUAL_UPGRADE_CLASSIFICATION,
    safetyLabels: APHRODITE_MYSTIC_UNIVERSE_VISUAL_UPGRADE_SAFETY_LABELS,
    visualAreas: visualAreas.map((area) => ({
      ...area,
      sourceFiles: [...area.sourceFiles],
      safetyNotes: [...area.safetyNotes],
    })),
    safetyFlags: {
      telegramApiNow: false,
      databaseWriteNow: false,
      paymentChangedNow: false,
      vipUnlockNow: false,
      externalAnalyticsNow: false,
      hardProphecyNow: false,
      medicalLegalFinancialAdviceNow: false,
    },
    nextRecommendedPackage: "Package 205 — Final Mobile UX Smoke & Polish",
  };
}
