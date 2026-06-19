"use client";

import {
  DEFAULT_ZODIAC_TIME_ZONE,
  addDaysToDateKey,
  formatZodiacDisplayDate,
  getCurrentZodiacDateKey,
  getLuckyDaysStartDate,
  getWeekRangeForDate,
} from "@/lib/zodiac-date";
import { useTelegramBackButton, useTelegramWebApp, type TelegramWebAppState } from "@/lib/use-telegram-webapp";
import { shareZodiacMiniAppContent } from "@/lib/zodiac-mini-app-share";
import { trackZodiacMiniAppEvent } from "@/lib/zodiac-mini-app-analytics-client";
import { zodiacAnalyticsScoreTier, zodiacAnalyticsStartappType, type ZodiacAnalyticsEventName, type ZodiacAnalyticsPayload } from "@/lib/zodiac-mini-app-analytics-shared";
import { ArrowLeft, ArrowRight, Bookmark, CalendarDays, Check, Copy, Crown, Gift, MapPin, Share2, ShieldCheck, Sparkles, Star } from "lucide-react";
import Link from "next/link";
import {
  AuraColorFeature,
  BirthMatrixFeature,
  DailyCardFeature,
  IntuitiveSignFeature,
  KarmicLessonsFeature,
  LunarRitualFeature,
  RuneDayFeature,
  TalismansFeature,
  TarotCardFeature,
} from "./ZodiacMysticSections";
import {
  ExtendedAngelNumberFeature,
  ExtendedCompatibilityFeature,
  ExtendedNameProfileFeature,
  ExtendedNatalFeature,
  ExtendedNumerologyFeature,
  VipCoupleCalendarFeature,
  VipMentalMapFeature,
  VipMenuCard,
  VipMessageHelperFeature,
  VipMonthForecastFeature,
  VipMysticDayFeature,
  VipTalismansFeature,
} from "./ZodiacVipSections";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { modeAnalyticsEvents, tabAnalytics, vipFeatureAnalyticsEvents } from "./zodiac-mini-app/analytics";
import {
  citySelectionWarning,
  exactBirthDataNote,
  genderLabels,
  modes,
  relationshipModes,
  signSlugs,
  signs,
  unknownBirthTimeNote,
  zodiacVipConfig,
} from "./zodiac-mini-app/constants";
import { defaultMenuFeatureByGroup, hubCategoryByTab, menuFeatureGroups, menuFeatureTabs, menuHubTabs } from "./zodiac-mini-app/feature-tabs";
import { findSign, sectionForFeature, vipDetailFeatureIds } from "./zodiac-mini-app/feature-routing";
import {
  cityLabel,
  createInitialPerson,
  formatDateInput,
  formatTimeInput,
  genderSuffix,
  getCityById,
  normalizeName,
  sanitizeNameInput,
  searchCities,
  isValidTime,
} from "./zodiac-mini-app/person-state";
import { DateLoadingSection, EnergyCard } from "./zodiac-mini-app/ForecastCards";
import { HeaderStatusStrip, HubNavigation, SignSelection } from "./zodiac-mini-app/MiniAppHeader";
import {
  AstrologyCenterHome,
  CategorySignGate,
  CompatibilityCategoryChooser,
  MiniAppBottomNavigation,
  type HomeBottomItem,
  type MainMenuCategoryTarget,
} from "./zodiac-mini-app/MainMenuSections";
import { MoreFeatureNavigation } from "./zodiac-mini-app/MoreFeatureNavigation";
import { ProfileRetentionPanel, type ProfileQuickTarget } from "./zodiac-mini-app/ProfileRetentionPanel";
import { useZodiacMiniAppRetention, type RetentionPanelFocus, type ZodiacRetentionDraft, type ZodiacRetentionItem } from "./zodiac-mini-app/retention";
import { ResultPanel, ResultTextCard } from "./zodiac-mini-app/ResultCards";
import { ZodiacSelect, type ZodiacSelectOption } from "./zodiac-mini-app/ZodiacSelect";
import {
  Field,
  ModeSelector,
  RelationshipModeSelector,
  StepProgress,
  WizardCard,
  primaryButtonClass,
  primaryTinyButtonClass,
  secondaryButtonClass,
  secondaryTinyButtonClass,
} from "./zodiac-mini-app/WizardControls";
import {
  EmptyFeatureCard,
  FeatureCard,
  InfoRow,
  LockedPreviewCard,
  SectionHeader,
  VipPreviewPanel,
  VipStatusPill,
  panelClass,
} from "./zodiac-mini-app/ui-primitives";
import type {
  AngelNumberPatternType,
  AngelNumberProfile,
  ChineseHoroscope,
  City,
  CompatibilityResult,
  CoupleAction,
  CoupleCalendarDay,
  CoupleHoroscope,
  CoupleMessageTemplate,
  DailyTalismanProfile,
  DayEnergy,
  DreamProfile,
  Gender,
  GiftBySignProfile,
  GiftRecipientType,
  HubTab,
  LunarCalendarProfile,
  MenuFeatureGroup,
  MentalMapDynamic,
  MentalMapSummary,
  MessageTone,
  Mode,
  MonthForecast,
  MoreFeatureId,
  NameCompatibilityProfile,
  NameProfile,
  NameResonance,
  NatalChart,
  NatalCityTone,
  NatalCompass,
  NatalInsightSection,
  NatalSummaryItem,
  NatalTimeTone,
  NatalVipBlock,
  NumerologyProfile,
  ParsedDate,
  PersonState,
  PersonalityArchetypeProfile,
  ReconciliationDay,
  RelationshipMapScore,
  RelationshipMode,
  TelegramHapticKind,
  VipFeature,
  WizardStep,
  ZodiacCompatibilityMiniAppProps,
  ZodiacSign,
  ZodiacStoneProfile,
  ZodiacVipConfig,
} from "./zodiac-mini-app/types";
export type {
  AngelNumberProfile,
  CompatibilityResult,
  CoupleCalendarDay,
  DailyTalismanProfile,
  MonthForecast,
  NameProfile,
  NatalChart,
  NumerologyProfile,
  ZodiacSign,
  ZodiacVipConfig,
} from "./zodiac-mini-app/types";

const signSelectOptions: ZodiacSelectOption[] = [
  { value: "", label: "Выберите знак...", disabled: true },
  ...signs.map((sign) => ({
    value: sign.slug,
    label: `${sign.emoji} ${sign.name}`,
    description: sign.range,
  })),
];

export function ZodiacCompatibilityMiniApp({
  variant = "dashboard",
  initialSign,
  initialMode,
  source,
  startParam,
}: ZodiacCompatibilityMiniAppProps) {
  const publicMode = variant === "public";
  const telegram = useTelegramWebApp();
  const resolvedMode = normalizeMode(initialMode);
  const hintSignSlug = useMemo(() => resolveInitialSign(initialSign, startParam), [initialSign, startParam]);
  const initialActiveTab = useMemo(() => resolveInitialHubTab(startParam), [startParam]);
  const initialMoreFeature = useMemo(() => resolveInitialMoreFeature(startParam), [startParam]);
  const initialHomePanel = useMemo(() => resolveInitialHomePanel(startParam), [startParam]);
  const initialRelationshipMode = useMemo(() => resolveInitialRelationshipMode(startParam), [startParam]);
  const hintSign = hintSignSlug ? findSign(hintSignSlug) : null;
  const retention = useZodiacMiniAppRetention();
  const lastPairAction = useMemo(() => findLastPairRetentionItem(retention.state.history, retention.state.favorites), [retention.state.favorites, retention.state.history]);
  const [appDateKey, setAppDateKey] = useState<string | null>(null);
  const [selectedSignSlug, setSelectedSignSlug] = useState("");
  const [activeTab, setActiveTab] = useState<HubTab>(initialActiveTab);
  const [requestedMoreFeature, setRequestedMoreFeature] = useState<MoreFeatureId | null>(initialMoreFeature);
  const [homePanel, setHomePanel] = useState<"home" | RetentionPanelFocus>(initialHomePanel);
  const [shareFallbackText, setShareFallbackText] = useState("");
  const [pendingCompatibilityMode, setPendingCompatibilityMode] = useState<RelationshipMode | null>(initialRelationshipMode);
  const [mode, setMode] = useState<Mode>(resolvedMode);
  const [relationshipMode, setRelationshipMode] = useState<RelationshipMode>(initialRelationshipMode ?? "love");
  const [step, setStep] = useState<WizardStep>(1);
  const [self, setSelf] = useState<PersonState>(() => createInitialPerson("", "unspecified", false, ""));
  const [partner, setPartner] = useState<PersonState>(() => createInitialPerson("", "unspecified", false, ""));
  const appOpenTrackedRef = useRef(false);
  const lastTabTrackedRef = useRef("");
  const lastMoreTrackedRef = useRef("");
  const lastNatalOpenedTrackedRef = useRef("");
  const lastNatalResultTrackedRef = useRef("");
  const telegramReadyTrackedRef = useRef(false);
  const mainMenuTrackedRef = useRef("");
  const compatibilityWizardTrackedRef = useRef("");

  const result = useMemo(() => buildCompatibilityResult(mode, relationshipMode, self, partner), [mode, partner, relationshipMode, self]);
  const selectedSign = selectedSignSlug ? findSign(selectedSignSlug) : null;
  const stepTitle = step === 1 ? "Вы" : step === 2 ? "Партнёр" : "Результат";
  const appDisplayDate = appDateKey ? formatZodiacDisplayDate(appDateKey) : "";
  const vipUntilLabel = formatVipFreeAccessDate(zodiacVipConfig.vipFreeAccessUntil);
  const analyticsSource = source ?? (publicMode ? "telegram_mini_app" : "dashboard_preview");
  const analyticsStartappType = zodiacAnalyticsStartappType(startParam);
  const analyticsPayload = useCallback(
    (payload: ZodiacAnalyticsPayload = {}): ZodiacAnalyticsPayload => ({
      source: analyticsSource,
      startappType: analyticsStartappType,
      dateKey: appDateKey ?? undefined,
      ...payload,
    }),
    [analyticsSource, analyticsStartappType, appDateKey],
  );
  const telegramImpactOccurred = telegram.impactOccurred;
  const telegramSelectionChanged = telegram.selectionChanged;
  const telegramThemeStyle = buildTelegramThemeStyle(telegram);

  useEffect(() => {
    function refreshAppDate() {
      const nextDateKey = getCurrentZodiacDateKey(DEFAULT_ZODIAC_TIME_ZONE);
      setAppDateKey((currentDateKey) => (currentDateKey === nextDateKey ? currentDateKey : nextDateKey));
    }

    refreshAppDate();
    const intervalId = window.setInterval(refreshAppDate, 60000);
    const handleVisibilityChange = () => {
      if (!document.hidden) refreshAppDate();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!appDateKey || process.env.NODE_ENV === "production") return;
    const warnings = validateZodiacMiniAppContent(appDateKey);
    if (warnings.length > 0) console.warn("Zodiac Mini App content validation", warnings);
  }, [appDateKey]);

  useEffect(() => {
    if (!appDateKey || appOpenTrackedRef.current) return;
    appOpenTrackedRef.current = true;
    trackZodiacMiniAppEvent("app_open", analyticsPayload({ sign: hintSignSlug ?? undefined }));
  }, [analyticsPayload, appDateKey, hintSignSlug]);

  useEffect(() => {
    if (!appDateKey || !telegram.isTelegramWebApp || !telegram.isReady || telegramReadyTrackedRef.current) return;
    telegramReadyTrackedRef.current = true;
    trackZodiacMiniAppEvent(
      "telegram_webapp_ready",
      analyticsPayload({
        section: "telegram",
        category: telegram.platform ?? undefined,
        featureKey: telegram.colorScheme ?? undefined,
      }),
    );
  }, [analyticsPayload, appDateKey, telegram.colorScheme, telegram.isReady, telegram.isTelegramWebApp, telegram.platform]);

  useEffect(() => {
    if (!appDateKey || activeTab !== "today" || homePanel !== "home") return;
    const trackKey = `${appDateKey}:${selectedSignSlug || "no-sign"}`;
    if (mainMenuTrackedRef.current === trackKey) return;
    mainMenuTrackedRef.current = trackKey;
    trackZodiacMiniAppEvent("main_menu_opened", analyticsPayload({ section: "main_menu", sign: selectedSignSlug || undefined }));
  }, [activeTab, analyticsPayload, appDateKey, homePanel, selectedSignSlug]);

  useEffect(() => {
    if (!appDateKey || activeTab !== "love") return;
    const trackKey = `${appDateKey}:${relationshipMode}:${selectedSignSlug || "no-sign"}`;
    if (compatibilityWizardTrackedRef.current === trackKey) return;
    compatibilityWizardTrackedRef.current = trackKey;
    trackZodiacMiniAppEvent("compatibility_wizard_started", analyticsPayload({ section: "compatibility", relationshipMode, sign: selectedSignSlug || undefined }));
  }, [activeTab, analyticsPayload, appDateKey, relationshipMode, selectedSignSlug]);

  useEffect(() => {
    if (!appDateKey || activeTab !== "today" || (homePanel !== "profile" && homePanel !== "favorites" && homePanel !== "history")) return;
    trackZodiacMiniAppEvent("profile_opened", analyticsPayload({ section: "profile", category: homePanel, sign: selectedSignSlug || retention.state.lastSign }));
    if (homePanel === "history") trackZodiacMiniAppEvent("history_opened", analyticsPayload({ section: "history", category: "profile", sign: selectedSignSlug || retention.state.lastSign }));
  }, [activeTab, analyticsPayload, appDateKey, homePanel, retention.state.lastSign, selectedSignSlug]);

  useEffect(() => {
    if (!appDateKey || !selectedSign) return;
    const menuCategory = hubCategoryByTab[activeTab];
    const trackKey = `${appDateKey}:${selectedSign.slug}:${activeTab}:${menuCategory.group}`;
    if (lastTabTrackedRef.current === trackKey) return;
    lastTabTrackedRef.current = trackKey;
    trackZodiacMiniAppEvent("hub_category_opened", analyticsPayload({ section: "hub", category: String(menuCategory.group), sign: selectedSign.slug, mode }));

    if (activeTab === "today" || activeTab === "forecasts" || activeTab === "love") {
      const tab = tabAnalytics[activeTab];
      trackZodiacMiniAppEvent(tab.event, analyticsPayload({ section: tab.section, sign: selectedSign.slug, mode }));
    }

    if (activeTab === "mystic") {
      trackZodiacMiniAppEvent("mystic_category_opened", analyticsPayload({ section: "mystic", sign: selectedSign.slug, mode }));
    }

    if (activeTab === "vip") {
      trackZodiacMiniAppEvent("section_open_vip", analyticsPayload({ section: "vip", sign: selectedSign.slug, mode }));
      trackZodiacMiniAppEvent("vip_opened", analyticsPayload({ section: "vip", sign: selectedSign.slug, mode }));
      if (zodiacVipConfig.vipFreeAccessEnabled) trackZodiacMiniAppEvent("vip_free_access_viewed", analyticsPayload({ section: "vip", sign: selectedSign.slug, mode }));
    }
  }, [activeTab, analyticsPayload, appDateKey, mode, selectedSign]);

  useEffect(() => {
    if (!appDateKey || !selectedSign || activeTab !== "profile") return;
    const scoreTier = zodiacAnalyticsScoreTier(result.scores.total);
    const trackKey = `${appDateKey}:${self.sign}:${partner.sign}:${relationshipMode}:${scoreTier}`;
    if (lastMoreTrackedRef.current === trackKey) return;
    lastMoreTrackedRef.current = trackKey;

    trackZodiacMiniAppEvent("section_open_natal_chart", analyticsPayload({ section: "natal_chart", sign: self.sign || selectedSign.slug }));
    trackZodiacMiniAppEvent("natal_chart_started", analyticsPayload({ section: "natal_chart", sign: self.sign || selectedSign.slug }));
    if (buildNatalChart(self)) trackZodiacMiniAppEvent("natal_chart_completed", analyticsPayload({ section: "natal_chart", sign: self.sign }));

    if (self.sign && partner.sign) {
      const pairPayload = analyticsPayload({
        firstSign: self.sign,
        secondSign: partner.sign,
        scoreTier,
        mode,
        relationshipMode,
      });
      trackZodiacMiniAppEvent("section_open_couple_horoscope", { ...pairPayload, section: "couple_horoscope" });
      trackZodiacMiniAppEvent("couple_horoscope_viewed", { ...pairPayload, section: "couple_horoscope" });
      trackZodiacMiniAppEvent("section_open_relationship_map", { ...pairPayload, section: "relationship_map" });
      trackZodiacMiniAppEvent("relationship_map_viewed", { ...pairPayload, section: "relationship_map" });
      trackZodiacMiniAppEvent("final_map_opened", { ...pairPayload, section: "relationship_map", featureKey: "relationship_result", chartType: "couple" });
      trackZodiacMiniAppEvent("feature_depth_viewed", { ...pairPayload, section: "relationship_map", featureKey: "relationship_result", chartType: "couple" });
      trackZodiacMiniAppEvent("mental_map_viewed", { ...pairPayload, section: "relationship_map" });
    }

    trackZodiacMiniAppEvent("section_open_vip", analyticsPayload({ section: "vip", sign: selectedSign.slug }));
    trackZodiacMiniAppEvent("vip_opened", analyticsPayload({ section: "vip", sign: selectedSign.slug }));
    if (zodiacVipConfig.vipFreeAccessEnabled) trackZodiacMiniAppEvent("vip_free_access_viewed", analyticsPayload({ section: "vip", sign: selectedSign.slug }));
    trackZodiacMiniAppEvent("section_open_giveaways", analyticsPayload({ section: "giveaways", sign: selectedSign.slug }));
  }, [activeTab, analyticsPayload, appDateKey, mode, partner.sign, relationshipMode, result.scores.total, selectedSign, self]);

  const triggerTelegramHaptic = useCallback(
    (kind: TelegramHapticKind, category: string, featureKey?: string) => {
      const used = kind === "selection" ? telegramSelectionChanged() : telegramImpactOccurred("light");
      if (!used) return;
      trackZodiacMiniAppEvent(
        "telegram_haptic_used",
        analyticsPayload({
          section: "telegram",
          category,
          featureKey: featureKey ?? kind,
        }),
      );
    },
    [analyticsPayload, telegramImpactOccurred, telegramSelectionChanged],
  );

  const trackTelegramBackUsed = useCallback(
    (category: string, featureKey: string) => {
      trackZodiacMiniAppEvent("telegram_back_button_used", analyticsPayload({ section: "telegram", category, featureKey }));
    },
    [analyticsPayload],
  );

  const returnToMainMenu = useCallback(() => {
    triggerTelegramHaptic("impact", "back", "main_menu");
    setHomePanel("home");
    setActiveTab("today");
    setRequestedMoreFeature(null);
    setPendingCompatibilityMode(null);
    setShareFallbackText("");
  }, [triggerTelegramHaptic]);

  const homeTelegramBackVisible = telegram.isTelegramWebApp && !selectedSign && (activeTab !== "today" || homePanel !== "home");
  const handleHomeTelegramBack = useCallback(() => {
    trackTelegramBackUsed("main_menu", activeTab === "today" ? homePanel : activeTab);
    returnToMainMenu();
  }, [activeTab, homePanel, returnToMainMenu, trackTelegramBackUsed]);

  useTelegramBackButton(telegram.webApp, homeTelegramBackVisible, handleHomeTelegramBack);

  function openMenuCategory(target: MainMenuCategoryTarget, categoryId: string) {
    triggerTelegramHaptic("selection", "main_menu", categoryId);
    if (categoryId === "profile") {
      openHomePanel("profile");
      return;
    }
    setHomePanel("home");
    setShareFallbackText("");
    setActiveTab(target.tab);
    setRequestedMoreFeature(target.feature ?? null);
    if (target.tab !== "love") setPendingCompatibilityMode(null);
    retention.recordAction({ section: categoryId, label: mainMenuCategoryLabel(categoryId), featureKey: target.feature ?? target.tab, sign: selectedSignSlug || undefined });
    trackZodiacMiniAppEvent(
      "main_menu_category_opened",
      analyticsPayload({
        section: "main_menu",
        category: categoryId,
        featureKey: target.feature ?? target.tab,
        sign: selectedSignSlug || undefined,
      }),
    );
    if (target.tab === "forecasts") {
      trackZodiacMiniAppEvent("horoscope_category_opened", analyticsPayload({ section: "week", category: categoryId, featureKey: target.feature ?? "forecasts", sign: selectedSignSlug || undefined }));
    }
    if (categoryId === "angel_numbers") {
      trackZodiacMiniAppEvent("angel_numbers_category_opened", analyticsPayload({ section: "angel_numbers", category: categoryId, featureKey: "angelNumbers", sign: selectedSignSlug || undefined }));
    }
    if (categoryId === "profile") {
      trackZodiacMiniAppEvent("profile_preview_opened", analyticsPayload({ section: "profile_preview", category: "profile", sign: selectedSignSlug || undefined }));
    }
  }

  function selectCompatibilityCategory(nextMode: RelationshipMode) {
    triggerTelegramHaptic("selection", "compatibility", nextMode);
    setRelationshipMode(nextMode);
    setPendingCompatibilityMode(nextMode);
    retention.recordAction({ section: "compatibility", label: `Совместимость: ${relationshipModeText(nextMode)}`, featureKey: "compatibilityTool", relationshipMode: nextMode, sign: selectedSignSlug || undefined });
    trackZodiacMiniAppEvent("compatibility_category_selected", analyticsPayload({ section: "compatibility", relationshipMode: nextMode, sign: selectedSignSlug || undefined }));
    trackZodiacMiniAppEvent("compatibility_mode_selected", analyticsPayload({ section: "compatibility", relationshipMode: nextMode, sign: selectedSignSlug || undefined }));
  }

  function openHomePanel(nextPanel: RetentionPanelFocus) {
    triggerTelegramHaptic("selection", "bottom_nav", nextPanel);
    setActiveTab("today");
    setHomePanel(nextPanel);
    setRequestedMoreFeature(null);
    setPendingCompatibilityMode(null);
    setShareFallbackText("");
    trackZodiacMiniAppEvent("profile_preview_opened", analyticsPayload({ section: "profile_preview", category: nextPanel, sign: selectedSignSlug || retention.state.lastSign }));
  }

  function openProfileFromBottom() {
    openHomePanel("profile");
  }

  function openBottomTarget(target: ProfileQuickTarget, categoryId: string) {
    openMenuCategory(target, categoryId);
  }

  function startPairSetup(featureKey = "pair_required") {
    triggerTelegramHaptic("selection", "compatibility", featureKey);
    setActiveTab("love");
    setHomePanel("home");
    setRequestedMoreFeature("compatibilityTool");
    setPendingCompatibilityMode(relationshipMode);
    setStep(1);
  }

  function useLastPair(featureKey = "pair_required") {
    if (!lastPairAction?.firstSign || !lastPairAction.secondSign) return;
    const nextRelationshipMode = lastPairAction.relationshipMode ?? "love";
    triggerTelegramHaptic("selection", "compatibility", featureKey);
    setRelationshipMode(nextRelationshipMode);
    setPendingCompatibilityMode(nextRelationshipMode);
    setMode("fast");
    setSelectedSignSlug(lastPairAction.firstSign);
    setSelf((current) => ({ ...current, sign: lastPairAction.firstSign || current.sign }));
    setPartner((current) => ({ ...current, sign: lastPairAction.secondSign || current.sign }));
    setStep(3);
  }

  function changeActiveTab(nextTab: HubTab) {
    if (nextTab !== activeTab) triggerTelegramHaptic("selection", "tab", nextTab);
    setHomePanel("home");
    setRequestedMoreFeature(null);
    setShareFallbackText("");
    if (nextTab !== "love") setPendingCompatibilityMode(null);
    setActiveTab(nextTab);
  }

  function chooseSign(slug: string) {
    triggerTelegramHaptic("selection", "sign", slug);
    setSelectedSignSlug(slug);
    setActiveTab((currentTab) => (currentTab === "today" ? initialActiveTab : currentTab));
    setSelf((current) => ({ ...current, sign: !current.sign || current.sign === selectedSignSlug ? slug : current.sign }));
    retention.recordAction({ section: "sign", label: `Выбран знак: ${findSign(slug).name}`, featureKey: "sign", sign: slug });
    trackZodiacMiniAppEvent("sign_selected", analyticsPayload({ sign: slug }));
  }

  function clearSelectedSign() {
    setSelectedSignSlug("");
    setActiveTab("today");
    setHomePanel("home");
    setRequestedMoreFeature(null);
    setPendingCompatibilityMode(null);
  }

  function changeMode(nextMode: Mode) {
    setMode(nextMode);
    trackZodiacMiniAppEvent(modeAnalyticsEvents[nextMode], analyticsPayload({ mode: nextMode, sign: selectedSignSlug || undefined, section: "compatibility" }));
  }

  function changeRelationshipMode(nextMode: RelationshipMode) {
    setRelationshipMode(nextMode);
    setPendingCompatibilityMode(nextMode);
    trackZodiacMiniAppEvent("compatibility_mode_selected", analyticsPayload({ section: "compatibility", relationshipMode: nextMode, sign: selectedSignSlug || undefined }));
  }

  function trackCompatibilityBirthdateAutosign(personRole: "self" | "partner", person: PersonState, signSlug: string) {
    trackZodiacMiniAppEvent(
      "compatibility_birthdate_autosign_used",
      analyticsPayload({
        section: "compatibility",
        category: personRole,
        relationshipMode,
        sign: signSlug,
        hasBirthDate: true,
        hasBirthTime: person.knowsTime && isValidTime(person.birthTime),
        hasBirthCity: person.knowsTime && Boolean(getCityById(person.selectedCityId)),
      }),
    );
  }

  function calculateCompatibility() {
    if (isReadyToCalculate(mode, self, partner)) {
      const scoreTier = zodiacAnalyticsScoreTier(result.scores.total);
      const payload = analyticsPayload({
        mode,
        relationshipMode,
        firstSign: self.sign,
        secondSign: partner.sign,
        scoreTier,
        section: "compatibility",
      });
      trackZodiacMiniAppEvent("compatibility_calculated", payload);
      if (result.nameResonance) trackZodiacMiniAppEvent("name_resonance_shown", payload);
      retention.recordAction({
        ...compatibilityRetentionAction(self, partner, relationshipMode, result),
      });
    }
    setStep(3);
  }

  function trackLuckyDayClick(_dateKey: string) {
    trackZodiacMiniAppEvent("lucky_day_clicked", analyticsPayload({ sign: selectedSignSlug || undefined, section: "lucky_days" }));
  }

  function trackGiveawayPreviewClick() {
    const payload = analyticsPayload({ section: "giveaways", featureKey: "giveaways_locked", sign: selectedSignSlug || undefined });
    trackZodiacMiniAppEvent("giveaway_locked_viewed", payload);
    trackZodiacMiniAppEvent("giveaway_clicked", payload);
  }

  function trackVipFeatureOpen(feature: string) {
    const featureId = feature as MoreFeatureId;
    const payload = analyticsPayload({ section: "vip", category: feature, featureKey: feature, sign: selectedSignSlug || undefined });
    setHomePanel("home");
    setActiveTab("vip");
    setRequestedMoreFeature(featureId);
    setPendingCompatibilityMode(null);
    setShareFallbackText("");
    trackZodiacMiniAppEvent("vip_feature_opened", payload);
    const featureEvent = vipFeatureAnalyticsEvents[featureId];
    if (featureEvent) trackZodiacMiniAppEvent(featureEvent, payload);
  }

  function trackVipFutureSubscriptionClick() {
    trackZodiacMiniAppEvent("vip_future_subscription_clicked", analyticsPayload({ section: "vip", sign: selectedSignSlug || undefined }));
  }

  function trackMessageHelperUse() {
    trackZodiacMiniAppEvent("message_helper_used", analyticsPayload({ section: "message_helper", firstSign: self.sign, secondSign: partner.sign, mode, scoreTier: zodiacAnalyticsScoreTier(result.scores.total) }));
  }

  function trackRelationshipMapCategoryOpen(category: string) {
    if (!self.sign || !partner.sign) return;
    trackZodiacMiniAppEvent(
      "relationship_map_category_opened",
      analyticsPayload({
        section: "relationship_map",
        category,
        firstSign: self.sign,
        secondSign: partner.sign,
        mode,
        relationshipMode,
        scoreTier: zodiacAnalyticsScoreTier(result.scores.total),
      }),
    );
  }

  function natalSafePayload(person: PersonState, chart: NatalChart | null, category?: string): ZodiacAnalyticsPayload {
    const parsed = parseBirthDate(person.birthDate);
    const hasBirthTime = person.knowsTime && isValidTime(person.birthTime);
    const hasBirthCity = person.knowsTime && Boolean(getCityById(person.selectedCityId));
    return analyticsPayload({
      section: "natal_chart",
      sign: chart?.sign.slug || (parsed.ok ? parsed.signSlug : person.sign || selectedSignSlug || undefined),
      category,
      hasBirthDate: parsed.ok,
      hasBirthTime,
      hasBirthCity,
      timeKnown: person.knowsTime,
    });
  }

  function trackNatalChartOpened(person: PersonState, chart: NatalChart | null) {
    const parsed = parseBirthDate(person.birthDate);
    const trackKey = `${appDateKey ?? "no-date"}:${parsed.ok ? "valid" : "empty"}:${chart?.sign.slug ?? person.sign ?? selectedSignSlug}:${person.knowsTime ? "time-known" : "time-unknown"}`;
    if (lastNatalOpenedTrackedRef.current === trackKey) return;
    lastNatalOpenedTrackedRef.current = trackKey;
    trackZodiacMiniAppEvent("natal_chart_opened", natalSafePayload(person, chart));
  }

  function trackNatalChartResultViewed(person: PersonState, chart: NatalChart) {
    const trackKey = `${appDateKey ?? "no-date"}:${chart.sign.slug}:${chart.hasBirthTime ? "time" : "no-time"}:${chart.hasBirthCity ? "city" : "no-city"}`;
    if (lastNatalResultTrackedRef.current === trackKey) return;
    lastNatalResultTrackedRef.current = trackKey;
    trackZodiacMiniAppEvent("natal_chart_result_viewed", natalSafePayload(person, chart));
  }

  function trackNatalChartSectionOpen(person: PersonState, chart: NatalChart, category: string) {
    trackZodiacMiniAppEvent("natal_chart_section_opened", natalSafePayload(person, chart, category));
  }

  function trackNatalChartVipFreeOpen(person: PersonState, chart: NatalChart) {
    trackZodiacMiniAppEvent("natal_chart_vip_free_opened", natalSafePayload(person, chart, "vip_free_natal"));
  }

  function trackPersonalToolEvent(event: ZodiacAnalyticsEventName, payload: ZodiacAnalyticsPayload) {
    trackZodiacMiniAppEvent(event, analyticsPayload(payload));
  }

  function saveFavorite(action: ZodiacRetentionDraft) {
    const item = retention.saveFavorite(action);
    trackZodiacMiniAppEvent("favorite_saved", analyticsPayload({ section: "favorites", category: item.section, featureKey: item.featureKey, sign: item.sign }));
    if (item.featureKey === "compatibilityTool" || item.section === "compatibility") {
      trackZodiacMiniAppEvent(
        "compatibility_pair_saved",
        analyticsPayload({
          section: "compatibility",
          relationshipMode: item.relationshipMode,
          firstSign: item.firstSign || item.sign,
          secondSign: item.secondSign,
          scoreTier: safeAnalyticsScoreTier(item.scoreTier),
        }),
      );
    }
  }

  function openFavorite(item: ZodiacRetentionItem) {
    const isFavorite = retention.state.favorites.some((favorite) => favorite.id === item.id);
    if (isFavorite) trackZodiacMiniAppEvent("favorite_opened", analyticsPayload({ section: "favorites", category: item.section, featureKey: item.featureKey, sign: item.sign }));
    if (item.featureKey === "compatibilityTool" || item.section === "compatibility") {
      const firstSign = signSlugs.has(item.firstSign || "") ? item.firstSign : signSlugs.has(item.sign || "") ? item.sign : undefined;
      const secondSign = signSlugs.has(item.secondSign || "") ? item.secondSign : undefined;
      const nextRelationshipMode = item.relationshipMode ?? "love";
      setRelationshipMode(nextRelationshipMode);
      setPendingCompatibilityMode(nextRelationshipMode);
      setMode("fast");
      if (firstSign) {
        setSelectedSignSlug(firstSign);
        setSelf((current) => ({ ...current, sign: firstSign }));
      }
      if (secondSign) setPartner((current) => ({ ...current, sign: secondSign }));
      if (firstSign && secondSign) setStep(3);
      trackZodiacMiniAppEvent(
        "compatibility_pair_reopened",
        analyticsPayload({
          section: "compatibility",
          relationshipMode: nextRelationshipMode,
          firstSign,
          secondSign,
          scoreTier: safeAnalyticsScoreTier(item.scoreTier),
        }),
      );
    }
    const target = targetForRetentionItem(item);
    openMenuCategory(target, item.section || "favorites");
  }

  function clearLocalData() {
    retention.clearAll();
    trackZodiacMiniAppEvent("local_data_cleared", analyticsPayload({ section: "profile", category: "local_storage" }));
  }

  async function shareSafeAction(action: ZodiacRetentionDraft) {
    const text = buildSafeShareText(action);
    setShareFallbackText("");
    trackZodiacMiniAppEvent("share_clicked", analyticsPayload({ section: "share", category: action.section, featureKey: action.featureKey, sign: action.sign }));
    const appLink = `https://t.me/zodiac_love_check_bot?startapp=${shareStartParamForAction(action)}`;
    const result = await shareZodiacMiniAppContent({ text, url: appLink, telegramWebApp: telegram.webApp });
    setShareFallbackText(result.fallbackText ?? result.label);
    return result.label;
  }

  function resetFlow() {
    setMode(resolvedMode);
    setRelationshipMode(initialRelationshipMode ?? "love");
    setSelf(createInitialPerson(selectedSignSlug, "unspecified", false, ""));
    setPartner(createInitialPerson("", "unspecified", false, ""));
    setStep(1);
  }

  const bottomActiveItem: HomeBottomItem =
    homePanel === "profile" || homePanel === "favorites" || homePanel === "history"
      ? "profile"
      : activeTab === "forecasts" || activeTab === "love" || activeTab === "vip"
        ? activeTab
        : "home";
  const activeRequestedFeature = requestedMoreFeature ?? (activeTab === initialActiveTab ? initialMoreFeature : null);

  function renderHomePanelContent() {
    if (homePanel === "profile" || homePanel === "favorites" || homePanel === "history") {
      return (
        <ProfileRetentionPanel
          publicMode={publicMode}
          selectedSign={selectedSign}
          retention={retention.state}
          focus={homePanel}
          onQuickAction={openBottomTarget}
          onOpenFavorite={openFavorite}
          onClearLocalData={clearLocalData}
        />
      );
    }

    return <AstrologyCenterHome publicMode={publicMode} selectedSign={selectedSign} vipUntilLabel={vipUntilLabel} onOpenCategory={openMenuCategory} />;
  }

  function renderUnsignedCategoryContent() {
    if (activeTab === "love") {
      return (
        <CompatibilityCategoryChooser publicMode={publicMode} selectedMode={pendingCompatibilityMode} onSelectMode={selectCompatibilityCategory}>
          <SignSelection publicMode={publicMode} hintSign={hintSign} onSelect={chooseSign} />
        </CompatibilityCategoryChooser>
      );
    }

    const copy = getCategoryStartCopy(activeTab, activeRequestedFeature);
    return (
      <CategorySignGate publicMode={publicMode} title={copy.title} subtitle={copy.subtitle} featureLabels={copy.features}>
        <SignSelection publicMode={publicMode} hintSign={hintSign} onSelect={chooseSign} />
      </CategorySignGate>
    );
  }

  return (
    <div
      data-telegram-webapp={telegram.isTelegramWebApp ? "true" : "false"}
      data-telegram-platform={telegram.platform ?? "browser"}
      data-telegram-color-scheme={telegram.colorScheme ?? "dark"}
      style={telegramThemeStyle}
      className={
        publicMode
          ? "min-h-[var(--zma-viewport-height,100vh)] w-full max-w-full overflow-x-hidden bg-[#070712] bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.14)_1px,transparent_0),radial-gradient(circle_at_top,rgba(168,85,247,0.26),transparent_24rem),linear-gradient(180deg,#070712_0%,#13091f_44%,#070b14_100%)] bg-[length:28px_28px,100%_100%,100%_100%] px-4 pb-[calc(1.25rem+var(--zma-safe-area-bottom,0px))] pt-[calc(1.25rem+var(--zma-safe-area-top,0px))] text-slate-100 sm:px-6"
          : "-mx-4 -my-6 min-h-[var(--zma-viewport-height,100vh)] overflow-x-hidden bg-[#070712] bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.12)_1px,transparent_0),radial-gradient(circle_at_top,rgba(168,85,247,0.2),transparent_24rem),linear-gradient(180deg,#070712_0%,#13091f_48%,#070b14_100%)] bg-[length:28px_28px,100%_100%,100%_100%] px-4 pb-[calc(1.5rem+var(--zma-safe-area-bottom,0px))] pt-[calc(1.5rem+var(--zma-safe-area-top,0px))] text-slate-100 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
      }
    >
      <div className={publicMode ? "mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-md flex-col space-y-4" : "mx-auto flex min-h-screen max-w-3xl flex-col space-y-5"}>
        <header
          className={
            publicMode
              ? "w-full overflow-hidden rounded-lg border border-fuchsia-200/15 bg-white/8 p-4 shadow-[0_24px_80px_rgba(8,13,30,0.45)] backdrop-blur"
              : "rounded-lg border border-fuchsia-200/15 bg-white/8 p-5 shadow-[0_24px_80px_rgba(8,13,30,0.45)] backdrop-blur"
          }
        >
          {!publicMode ? (
            <Link href="/dashboard/networks/zodiac" className="text-sm font-semibold text-amber-100 hover:text-white">
              Назад к Zodiac
            </Link>
          ) : null}

          <div className={publicMode ? "flex flex-col gap-4" : "mt-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"}>
            <div className="min-w-0">
              <p
                className={
                  publicMode
                    ? "inline-flex items-center gap-2 rounded-full border border-amber-200/25 bg-amber-200/10 px-3 py-1 text-xs font-semibold text-amber-100"
                    : "inline-flex items-center gap-2 rounded-full border border-amber-200/25 bg-amber-200/10 px-3 py-1 text-xs font-semibold text-amber-100"
                }
              >
                <Sparkles className="h-3.5 w-3.5" />
                {selectedSign ? `${selectedSign.emoji} ${selectedSign.name}` : "Зодиакальный центр"}
              </p>
              <h1
                className={
                  publicMode
                    ? "mt-3 break-words text-2xl font-semibold leading-tight text-white [overflow-wrap:anywhere]"
                    : "mt-4 break-words text-2xl font-semibold leading-tight text-white [overflow-wrap:anywhere] sm:text-4xl"
                }
              >
                {selectedSign ? "Гороскопы и совместимость" : "Астрологический центр ✨"}
              </h1>
              <p
                className={
                  publicMode
                    ? "mt-2 break-words text-sm leading-6 text-slate-300 [overflow-wrap:anywhere]"
                    : "mt-3 max-w-3xl break-words text-sm leading-6 text-slate-300 [overflow-wrap:anywhere] sm:text-base sm:leading-7"
                }
              >
                {selectedSign ? "Выберите раздел и откройте прогнозы, совместимость, карту пары и натальную подсказку" : "Гороскопы, совместимость, мистика и личные расчёты в одном месте"}
              </p>
            </div>
            {selectedSign ? (
              <button type="button" onClick={clearSelectedSign} className="inline-flex w-fit items-center rounded-lg border border-white/15 bg-white/8 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:bg-white/12">
                Выбрать другой знак
              </button>
            ) : (
              <div className="inline-flex w-fit items-center rounded-lg border border-emerald-300/25 bg-emerald-300/10 px-3 py-2 text-xs font-semibold text-emerald-100">
                <ShieldCheck className="mr-2 h-4 w-4" />
                без сохранения данных
              </div>
            )}
          </div>
        </header>

        {selectedSign ? (
          <HeaderStatusStrip publicMode={publicMode} sign={selectedSign} dateLabel={appDisplayDate} vipUntilLabel={vipUntilLabel} />
        ) : null}

        {!selectedSign ? (
          <>
            {activeTab === "today" ? renderHomePanelContent() : renderUnsignedCategoryContent()}
            <MiniAppBottomNavigation activeItem={bottomActiveItem} onHome={returnToMainMenu} onForecasts={() => openBottomTarget({ tab: "forecasts", feature: "todayForecast" }, "horoscopes")} onLove={() => openBottomTarget({ tab: "love", feature: "compatibilityTool" }, "compatibility")} onVip={() => openBottomTarget({ tab: "vip", feature: "vip" }, "vip")} onProfile={openProfileFromBottom} />
          </>
        ) : (
          <>
            <HubNavigation publicMode={publicMode} activeTab={activeTab} onChange={changeActiveTab} />

            <section className="min-w-0 flex-1">
              {activeTab === "today" ? (
                <div className="space-y-4">
                  {renderHomePanelContent()}
                  {appDateKey ? <TodaySection publicMode={publicMode} sign={selectedSign} dateKey={appDateKey} /> : <DateLoadingSection publicMode={publicMode} title="Сегодня" />}
                </div>
              ) : null}
              {activeTab === "forecasts" ? (
                <div className="space-y-4">
                  {appDateKey ? <WeekSection publicMode={publicMode} sign={selectedSign} dateKey={appDateKey} /> : <DateLoadingSection publicMode={publicMode} title="Неделя" />}
                  <MoreSection
                    publicMode={publicMode}
                    appDateKey={appDateKey}
                    category="forecasts"
                    initialFeature={activeTab === "forecasts" ? activeRequestedFeature : null}
                    selectedSign={selectedSign}
                    selectedSignSlug={selectedSignSlug}
                    self={self}
                    partner={partner}
                    result={result}
                    relationshipMode={relationshipMode}
                    telegram={telegram}
                    onCategoryBack={returnToMainMenu}
                    onHaptic={triggerTelegramHaptic}
                    onTelegramBackUsed={trackTelegramBackUsed}
                    onLuckyDayClick={trackLuckyDayClick}
                    onVipFeatureOpen={trackVipFeatureOpen}
                    onVipFutureSubscriptionClick={trackVipFutureSubscriptionClick}
                    onGiveawayClick={trackGiveawayPreviewClick}
                    onMessageHelperUsed={trackMessageHelperUse}
                    onRelationshipMapCategoryOpen={trackRelationshipMapCategoryOpen}
                    onNatalChartOpened={trackNatalChartOpened}
                    onNatalChartResultViewed={trackNatalChartResultViewed}
                    onNatalChartSectionOpen={trackNatalChartSectionOpen}
                    onNatalChartVipFreeOpen={trackNatalChartVipFreeOpen}
                    onPersonalToolEvent={trackPersonalToolEvent}
                    onRetentionAction={retention.recordAction}
                    onFavoriteSave={saveFavorite}
                    lastPairAction={lastPairAction}
                    onCreatePair={startPairSetup}
                    onUseLastPair={useLastPair}
                    onShare={shareSafeAction}
                  />
                </div>
              ) : null}
              {activeTab === "vip" ? (
                <MoreSection
                  publicMode={publicMode}
                  appDateKey={appDateKey}
                  category="vip"
                  initialFeature={activeTab === "vip" ? activeRequestedFeature : null}
                  selectedSign={selectedSign}
                  selectedSignSlug={selectedSignSlug}
                  self={self}
                  partner={partner}
                  result={result}
                  relationshipMode={relationshipMode}
                  telegram={telegram}
                  onCategoryBack={returnToMainMenu}
                  onHaptic={triggerTelegramHaptic}
                  onTelegramBackUsed={trackTelegramBackUsed}
                  onLuckyDayClick={trackLuckyDayClick}
                  onVipFeatureOpen={trackVipFeatureOpen}
                  onVipFutureSubscriptionClick={trackVipFutureSubscriptionClick}
                  onGiveawayClick={trackGiveawayPreviewClick}
                  onMessageHelperUsed={trackMessageHelperUse}
                  onRelationshipMapCategoryOpen={trackRelationshipMapCategoryOpen}
                  onNatalChartOpened={trackNatalChartOpened}
                  onNatalChartResultViewed={trackNatalChartResultViewed}
                  onNatalChartSectionOpen={trackNatalChartSectionOpen}
                  onNatalChartVipFreeOpen={trackNatalChartVipFreeOpen}
                  onPersonalToolEvent={trackPersonalToolEvent}
                  onRetentionAction={retention.recordAction}
                  onFavoriteSave={saveFavorite}
                  lastPairAction={lastPairAction}
                  onCreatePair={startPairSetup}
                  onUseLastPair={useLastPair}
                  onShare={shareSafeAction}
                />
              ) : null}
              {activeTab === "profile" ? (
                <MoreSection
                  publicMode={publicMode}
                  appDateKey={appDateKey}
                  category="profile"
                  initialFeature={activeTab === "profile" ? activeRequestedFeature : null}
                  selectedSign={selectedSign}
                  selectedSignSlug={selectedSignSlug}
                  self={self}
                  partner={partner}
                  result={result}
                  relationshipMode={relationshipMode}
                  telegram={telegram}
                  onCategoryBack={returnToMainMenu}
                  onHaptic={triggerTelegramHaptic}
                  onTelegramBackUsed={trackTelegramBackUsed}
                  onLuckyDayClick={trackLuckyDayClick}
                  onVipFeatureOpen={trackVipFeatureOpen}
                  onVipFutureSubscriptionClick={trackVipFutureSubscriptionClick}
                  onGiveawayClick={trackGiveawayPreviewClick}
                  onMessageHelperUsed={trackMessageHelperUse}
                  onRelationshipMapCategoryOpen={trackRelationshipMapCategoryOpen}
                  onNatalChartOpened={trackNatalChartOpened}
                  onNatalChartResultViewed={trackNatalChartResultViewed}
                  onNatalChartSectionOpen={trackNatalChartSectionOpen}
                  onNatalChartVipFreeOpen={trackNatalChartVipFreeOpen}
                  onPersonalToolEvent={trackPersonalToolEvent}
                  onRetentionAction={retention.recordAction}
                  onFavoriteSave={saveFavorite}
                  lastPairAction={lastPairAction}
                  onCreatePair={startPairSetup}
                  onUseLastPair={useLastPair}
                  onShare={shareSafeAction}
                />
              ) : null}
              {activeTab === "mystic" ? (
                <MoreSection
                  publicMode={publicMode}
                  appDateKey={appDateKey}
                  category="mystic"
                  initialFeature={activeTab === "mystic" ? activeRequestedFeature : null}
                  selectedSign={selectedSign}
                  selectedSignSlug={selectedSignSlug}
                  self={self}
                  partner={partner}
                  result={result}
                  relationshipMode={relationshipMode}
                  telegram={telegram}
                  onCategoryBack={returnToMainMenu}
                  onHaptic={triggerTelegramHaptic}
                  onTelegramBackUsed={trackTelegramBackUsed}
                  onLuckyDayClick={trackLuckyDayClick}
                  onVipFeatureOpen={trackVipFeatureOpen}
                  onVipFutureSubscriptionClick={trackVipFutureSubscriptionClick}
                  onGiveawayClick={trackGiveawayPreviewClick}
                  onMessageHelperUsed={trackMessageHelperUse}
                  onRelationshipMapCategoryOpen={trackRelationshipMapCategoryOpen}
                  onNatalChartOpened={trackNatalChartOpened}
                  onNatalChartResultViewed={trackNatalChartResultViewed}
                  onNatalChartSectionOpen={trackNatalChartSectionOpen}
                  onNatalChartVipFreeOpen={trackNatalChartVipFreeOpen}
                  onPersonalToolEvent={trackPersonalToolEvent}
                  onRetentionAction={retention.recordAction}
                  onFavoriteSave={saveFavorite}
                  lastPairAction={lastPairAction}
                  onCreatePair={startPairSetup}
                  onUseLastPair={useLastPair}
                  onShare={shareSafeAction}
                />
              ) : null}
              {activeTab === "love" ? (
                <div className="space-y-4">
                  <button type="button" onClick={returnToMainMenu} className={secondaryButtonClass(publicMode)}>
                    <ArrowLeft className="h-4 w-4" />
                    Главное меню
                  </button>
                  <StepProgress publicMode={publicMode} step={step} />
                  <ModeSelector publicMode={publicMode} mode={mode} onChange={changeMode} />
                  <RelationshipModeSelector publicMode={publicMode} mode={relationshipMode} onChange={changeRelationshipMode} />
                  <div className="min-w-0 flex-1 transition-all duration-300">
                    {step === 1 ? (
                      <WizardCard publicMode={publicMode} stepLabel="Шаг 1 из 3" title="Вы">
                        <PersonPanel publicMode={publicMode} title="Вы" mode={mode} value={self} onChange={setSelf} onBirthDateAutosign={(person, signSlug) => trackCompatibilityBirthdateAutosign("self", person, signSlug)} />
                        <div className="mt-5">
                          <button type="button" onClick={() => setStep(2)} className={primaryButtonClass(publicMode)}>
                            Далее
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </WizardCard>
                    ) : null}

                    {step === 2 ? (
                      <WizardCard publicMode={publicMode} stepLabel="Шаг 2 из 3" title="Партнёр">
                        <PersonPanel publicMode={publicMode} title="Партнёр" mode={mode} value={partner} onChange={setPartner} onBirthDateAutosign={(person, signSlug) => trackCompatibilityBirthdateAutosign("partner", person, signSlug)} />
                        <div className="mt-5 grid grid-cols-2 gap-3">
                          <button type="button" onClick={() => setStep(1)} className={secondaryButtonClass(publicMode)}>
                            <ArrowLeft className="h-4 w-4" />
                            Назад
                          </button>
                          <button type="button" onClick={calculateCompatibility} className={primaryButtonClass(publicMode)}>
                            Рассчитать
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        </div>
                      </WizardCard>
                    ) : null}

                    {step === 3 ? (
                      <WizardCard publicMode={publicMode} stepLabel="Шаг 3 из 3" title={stepTitle}>
                        {isReadyToCalculate(mode, self, partner) ? (
                          <ResultPanel
                            publicMode={publicMode}
                            result={result}
                            levelLabel={compatibilityLevelLabel(result.scores.total)}
                            onEdit={() => setStep(1)}
                            onReset={resetFlow}
                            onSave={() => saveFavorite(compatibilityRetentionAction(self, partner, relationshipMode, result))}
                            onShare={() => shareSafeAction(compatibilityRetentionAction(self, partner, relationshipMode, result))}
                            firstSign={findSign(self.sign)}
                            secondSign={findSign(partner.sign)}
                          />
                        ) : (
                          <div className="py-8 text-center">
                            <p className="text-slate-300">Заполните данные, чтобы увидеть совместимость.</p>
                            <div className="mt-6 flex justify-center">
                              <button type="button" onClick={() => setStep(1)} className={secondaryButtonClass(publicMode)}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Вернуться к заполнению
                              </button>
                            </div>
                          </div>
                        )}
                      </WizardCard>
                    ) : null}
                  </div>
                  <MoreSection
                    publicMode={publicMode}
                    appDateKey={appDateKey}
                    category="love"
                    initialFeature={activeTab === "love" ? activeRequestedFeature : null}
                    selectedSign={selectedSign}
                    selectedSignSlug={selectedSignSlug}
                    self={self}
                    partner={partner}
                    result={result}
                    relationshipMode={relationshipMode}
                    telegram={telegram}
                    onCategoryBack={returnToMainMenu}
                    onHaptic={triggerTelegramHaptic}
                    onTelegramBackUsed={trackTelegramBackUsed}
                    onLuckyDayClick={trackLuckyDayClick}
                    onVipFeatureOpen={trackVipFeatureOpen}
                    onVipFutureSubscriptionClick={trackVipFutureSubscriptionClick}
                    onGiveawayClick={trackGiveawayPreviewClick}
                    onMessageHelperUsed={trackMessageHelperUse}
                    onRelationshipMapCategoryOpen={trackRelationshipMapCategoryOpen}
                    onNatalChartOpened={trackNatalChartOpened}
                    onNatalChartResultViewed={trackNatalChartResultViewed}
                    onNatalChartSectionOpen={trackNatalChartSectionOpen}
                    onNatalChartVipFreeOpen={trackNatalChartVipFreeOpen}
                  onPersonalToolEvent={trackPersonalToolEvent}
                  onRetentionAction={retention.recordAction}
                  onFavoriteSave={saveFavorite}
                  lastPairAction={lastPairAction}
                  onCreatePair={startPairSetup}
                  onUseLastPair={useLastPair}
                  onShare={shareSafeAction}
                />
                </div>
              ) : null}
            </section>
            <MiniAppBottomNavigation activeItem={bottomActiveItem} onHome={returnToMainMenu} onForecasts={() => openBottomTarget({ tab: "forecasts", feature: "todayForecast" }, "horoscopes")} onLove={() => openBottomTarget({ tab: "love", feature: "compatibilityTool" }, "compatibility")} onVip={() => openBottomTarget({ tab: "vip", feature: "vip" }, "vip")} onProfile={openProfileFromBottom} />
          </>
        )}
        {shareFallbackText ? (
          <div className={publicMode ? "rounded-lg border border-amber-200/25 bg-amber-200/10 p-3 text-sm leading-5 text-amber-50" : "rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-5 text-amber-900"}>
            <p className="font-semibold">Текст для копирования</p>
            <p className="mt-2 whitespace-pre-line break-words">{shareFallbackText}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function getCategoryStartCopy(tab: HubTab, feature: MoreFeatureId | null) {
  if (tab === "forecasts") {
    return {
      title: "✨ Гороскопы",
      subtitle: "Выберите знак, чтобы открыть прогнозы на сегодня, неделю и ближайший месяц.",
      features: ["Гороскоп сегодня", "Гороскоп недели", "Месячный прогноз", "Удачные дни", "Лунный календарь"],
    };
  }

  if (tab === "mystic" && feature === "birthMatrix") {
    return {
      title: "🧿 Матрица судьбы",
      subtitle: "Выберите знак для входа, затем рассчитайте матрицу по дате рождения без сохранения данных.",
      features: ["Расчёт по дате рождения", "Личные коды", "Сильные стороны", "Точки роста"],
    };
  }

  if (tab === "mystic" && feature === "angelNumbers") {
    return {
      title: "👼 Ангельские числа",
      subtitle: "Выберите знак для входа и откройте толкование 11:11, 22:22, зеркальных чисел и знаков дня.",
      features: ["11:11 и 22:22", "Зеркальные комбинации", "Знаки Вселенной", "Базовое толкование", "VIP-расширение внутри VIP"],
    };
  }

  if (tab === "mystic" && (feature === "tarotCard" || feature === "runeDay")) {
    return {
      title: "🃏 Таро и руны",
      subtitle: "Выберите знак, чтобы открыть карту дня, руну дня и короткую подсказку на текущую ситуацию.",
      features: ["Карта дня", "Таро дня", "Руна дня", "Интуитивная подсказка"],
    };
  }

  if (tab === "mystic" && feature === "lunarRitual") {
    return {
      title: "🌙 Луна и ритуалы",
      subtitle: "Выберите знак, чтобы открыть лунный ритм, практики и мягкие действия на день.",
      features: ["Лунный календарь", "Лунный ритуал", "Практика дня", "Что усилить", "Чего избегать"],
    };
  }

  if (tab === "mystic") {
    return {
      title: "🔮 Мистика",
      subtitle: "Выберите знак, чтобы открыть карты, Таро, руны, ритуалы и символы дня.",
      features: ["Карта дня", "Таро дня", "Руна дня", "Интуитивный знак", "Талисманы", "Цвет ауры", "Лунный ритуал", "Кармические уроки"],
    };
  }

  if (tab === "vip" && feature === "giveaways") {
    return {
      title: "🎁 Розыгрыши",
      subtitle: "Розыгрыши остаются locked preview. Основной VIP-доступ открыт бесплатно до 17.09.2026.",
      features: ["Locked preview", "Без оплаты", "Без Telegram Stars", "VIP-функции доступны отдельно"],
    };
  }

  if (tab === "vip") {
    return {
      title: "👑 VIP раздел",
      subtitle: "Выберите знак и откройте 11 премиум-функций бесплатно до 17.09.2026.",
      features: ["Натальная карта+", "Расширенная совместимость", "Карта пары", "30 дней пары", "Месячный прогноз", "VIP мистический день"],
    };
  }

  return {
    title: feature === "numerology" ? "🔢 Нумерология" : "👤 Мой профиль",
    subtitle: "Выберите знак для личных расчётов. Данные остаются только на экране и не сохраняются.",
    features: feature === "numerology" ? ["Число судьбы", "Число души", "Число личности", "Рекомендации дня"] : ["Натальная карта", "Имя", "Камни знака", "Архетип", "Нумерология"],
  };
}

function buildTelegramThemeStyle(telegram: TelegramWebAppState): CSSProperties {
  const viewportHeight = telegram.viewportStableHeight ?? telegram.viewportHeight;
  const theme = telegram.themeParams;
  const style: Record<string, string> = {
    "--zma-safe-area-top": "env(safe-area-inset-top, 0px)",
    "--zma-safe-area-bottom": "env(safe-area-inset-bottom, 0px)",
    "--zma-viewport-height": viewportHeight ? `${Math.max(viewportHeight, 320)}px` : "100vh",
  };

  if (theme.bg_color) style["--tg-theme-bg-color"] = theme.bg_color;
  if (theme.text_color) style["--tg-theme-text-color"] = theme.text_color;
  if (theme.hint_color) style["--tg-theme-hint-color"] = theme.hint_color;
  if (theme.button_color) style["--tg-theme-button-color"] = theme.button_color;
  if (theme.button_text_color) style["--tg-theme-button-text-color"] = theme.button_text_color;
  if (theme.secondary_bg_color) style["--tg-theme-secondary-bg-color"] = theme.secondary_bg_color;

  return style as CSSProperties;
}

function TodaySection({ publicMode, sign, dateKey }: { publicMode: boolean; sign: ZodiacSign; dateKey: string }) {
  const forecast = buildDailyForecast(sign, dateKey);
  const dayEnergy = buildDayEnergy(dateKey, sign.slug);

  return (
    <section className={panelClass(publicMode)}>
      <SectionHeader publicMode={publicMode} icon={<Sparkles className="h-5 w-5" />} title="Сегодня" subtitle={`${sign.emoji} ${sign.name} · ${formatZodiacDisplayDate(dateKey)}`} />

      <div className="mt-5 space-y-3">
        <EnergyCard publicMode={publicMode} energy={dayEnergy} />
        <InfoRow publicMode={publicMode} label="💡 Совет дня" text={forecast.advice} />
        <InfoRow publicMode={publicMode} label="✅ Стоит сделать" text={forecast.action} />
        <InfoRow publicMode={publicMode} label="⚠️ Лучше избегать" text={forecast.avoid} />
      </div>

      <div className="mt-4 rounded-lg border border-fuchsia-200/15 bg-fuchsia-200/10 p-4">
        <p className="text-sm font-semibold text-amber-100">Краткий прогноз</p>
        <p className="mt-2 text-sm leading-6 text-slate-200">{forecast.text}</p>
      </div>
    </section>
  );
}

function WeekSection({ publicMode, sign, dateKey }: { publicMode: boolean; sign: ZodiacSign; dateKey: string }) {
  const forecast = buildWeekForecast(sign, dateKey);
  const weekRange = getWeekRangeForDate(dateKey, DEFAULT_ZODIAC_TIME_ZONE);

  return (
    <section className={panelClass(publicMode)}>
      <SectionHeader
        publicMode={publicMode}
        icon={<Star className="h-5 w-5" />}
        title="Неделя"
        subtitle={`${sign.emoji} ${sign.name} · ${formatZodiacDisplayDate(weekRange.startDateKey)} - ${formatZodiacDisplayDate(weekRange.endDateKey)}`}
      />

      <div className="mt-5 grid gap-3">
        <InfoRow publicMode={publicMode} label="Главная тема недели" text={forecast.theme} />
        <InfoRow publicMode={publicMode} label="Любовь" text={forecast.love} />
        <InfoRow publicMode={publicMode} label="Работа и деньги" text={forecast.money} />
        <InfoRow publicMode={publicMode} label="Энергия" text={forecast.energy} />
        <InfoRow publicMode={publicMode} label="Совет недели" text={forecast.advice} />
      </div>
    </section>
  );
}

function LuckyDaysSection({
  publicMode,
  sign,
  dateKey,
  onLuckyDayClick,
}: {
  publicMode: boolean;
  sign: ZodiacSign;
  dateKey: string;
  onLuckyDayClick: (dateKey: string) => void;
}) {
  const startDateKey = getLuckyDaysStartDate(dateKey);
  const days = buildLuckyDays(sign, startDateKey, 7);
  const dayEnergy = buildDayEnergy(dateKey, sign.slug);

  return (
    <section className={panelClass(publicMode)}>
      <SectionHeader
        publicMode={publicMode}
        icon={<CalendarDays className="h-5 w-5" />}
        title="Удачные дни"
        subtitle={`${sign.emoji} ${sign.name} · с ${formatZodiacDisplayDate(startDateKey)}`}
      />

      <div className="mt-5 space-y-3">
        <EnergyCard publicMode={publicMode} energy={dayEnergy} />
      </div>

      <div className="mt-4 grid max-h-[520px] gap-3 overflow-y-auto pr-1">
        {days.map((day) => (
          <button key={day.iso} type="button" onClick={() => onLuckyDayClick(day.iso)} className="rounded-lg border border-white/12 bg-white/8 p-3 text-left transition hover:border-amber-200/40 hover:bg-white/12">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">{day.date}</p>
                <p className="mt-1 text-xs text-slate-400">{day.weekday}</p>
              </div>
              <span className="rounded-full border border-amber-200/25 bg-amber-200/10 px-3 py-1 text-xs font-semibold text-amber-50">{day.status}</span>
            </div>
            <p className="mt-3 text-sm leading-5 text-slate-300">Лучше всего: {day.area}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

function MoreSection({
  publicMode,
  appDateKey,
  category,
  initialFeature,
  selectedSign,
  selectedSignSlug,
  self,
  partner,
  result,
  relationshipMode,
  telegram,
  onCategoryBack,
  onHaptic,
  onTelegramBackUsed,
  onLuckyDayClick,
  onVipFeatureOpen,
  onVipFutureSubscriptionClick,
  onGiveawayClick,
  onMessageHelperUsed,
  onRelationshipMapCategoryOpen,
  onNatalChartOpened,
  onNatalChartResultViewed,
  onNatalChartSectionOpen,
  onNatalChartVipFreeOpen,
  onPersonalToolEvent,
  onRetentionAction,
  onFavoriteSave,
  lastPairAction,
  onCreatePair,
  onUseLastPair,
  onShare,
}: {
  publicMode: boolean;
  appDateKey: string | null;
  category: MenuFeatureGroup;
  initialFeature?: MoreFeatureId | null;
  selectedSign: ZodiacSign;
  selectedSignSlug: string;
  self: PersonState;
  partner: PersonState;
  result: CompatibilityResult;
  relationshipMode: RelationshipMode;
  telegram: TelegramWebAppState;
  onCategoryBack?: () => void;
  onHaptic: (kind: TelegramHapticKind, category: string, featureKey?: string) => void;
  onTelegramBackUsed: (category: string, featureKey: string) => void;
  onLuckyDayClick: (dateKey: string) => void;
  onVipFeatureOpen: (feature: string) => void;
  onVipFutureSubscriptionClick: () => void;
  onGiveawayClick: () => void;
  onMessageHelperUsed: () => void;
  onRelationshipMapCategoryOpen: (category: string) => void;
  onNatalChartOpened: (person: PersonState, chart: NatalChart | null) => void;
  onNatalChartResultViewed: (person: PersonState, chart: NatalChart) => void;
  onNatalChartSectionOpen: (person: PersonState, chart: NatalChart, category: string) => void;
  onNatalChartVipFreeOpen: (person: PersonState, chart: NatalChart) => void;
  onPersonalToolEvent: (event: ZodiacAnalyticsEventName, payload: ZodiacAnalyticsPayload) => void;
  onRetentionAction: (action: ZodiacRetentionDraft) => void;
  onFavoriteSave: (action: ZodiacRetentionDraft) => void;
  lastPairAction?: ZodiacRetentionItem | null;
  onCreatePair: (featureKey?: string) => void;
  onUseLastPair: (featureKey?: string) => void;
  onShare: (action: ZodiacRetentionDraft) => Promise<string | void> | string | void;
}) {
  const [messageTone, setMessageTone] = useState<MessageTone>("soft");
  const [angelNumberInput, setAngelNumberInput] = useState("11:11");
  const [angelNumberPresetKey, setAngelNumberPresetKey] = useState("11:11");
  const [dreamSymbolKey, setDreamSymbolKey] = useState("water");
  const [dreamText, setDreamText] = useState("");
  const [giftRecipientType, setGiftRecipientType] = useState<GiftRecipientType>("partner");
  const [nameCompatibilitySelf, setNameCompatibilitySelf] = useState("");
  const [nameCompatibilityPartner, setNameCompatibilityPartner] = useState("");
  const categoryFeatures = menuFeatureTabs.filter((item) => item.group === category);
  const defaultMoreFeature = defaultMenuFeatureByGroup[category];
  const [activeMoreFeature, setActiveMoreFeature] = useState<MoreFeatureId>(() => {
    const categoryHasInitialFeature = initialFeature ? categoryFeatures.some((item) => item.id === initialFeature) || (category === "vip" && vipDetailFeatureIds.has(initialFeature)) : false;
    return categoryHasInitialFeature && initialFeature ? initialFeature : defaultMoreFeature;
  });
  const [natalPerson, setNatalPerson] = useState<PersonState>(() => ({
    ...createInitialPerson(self.sign || selectedSignSlug, self.gender, self.knowsTime, self.selectedCityId),
    name: self.name,
    birthDate: self.birthDate,
    birthTime: self.birthTime,
    cityQuery: self.cityQuery,
  }));
  const lastPersonalToolTrackedRef = useRef("");
  const lastCompatibilityToolTrackedRef = useRef("");
  const dateKey = appDateKey ?? getCurrentZodiacDateKey(DEFAULT_ZODIAC_TIME_ZONE);
  const pairReady = Boolean(self.sign && partner.sign);
  const vipFreeAccess = zodiacVipConfig.vipFreeAccessEnabled && !zodiacVipConfig.vipPaymentsEnabled && !zodiacVipConfig.telegramStarsEnabled;
  const coupleHoroscope = pairReady ? buildCoupleHoroscope(self, partner, dateKey, relationshipMode, result) : null;
  const coupleAction = pairReady ? buildCoupleAction(self, partner, dateKey, relationshipMode, result) : null;
  const coupleCalendar = pairReady ? buildCoupleCalendar(self, partner, dateKey, relationshipMode, result, vipFreeAccess ? 30 : 7) : [];
  const reconciliation = pairReady ? buildReconciliationDay(self, partner, dateKey, result) : null;
  const message = pairReady ? buildPartnerMessage(self, partner, dateKey, messageTone, result) : null;
  const messageTemplates = pairReady ? buildCoupleMessageTemplates(self, partner, dateKey, relationshipMode, result) : [];
  const natalChart = buildNatalChart(natalPerson);
  const selfSign = self.sign || selectedSignSlug ? findSign(self.sign || selectedSignSlug) : null;
  const partnerSign = partner.sign ? findSign(partner.sign) : null;
  const vipScoreTier = pairReady ? zodiacAnalyticsScoreTier(result.scores.total) : undefined;
  const chineseHoroscope = buildChineseHoroscope(natalPerson, dateKey);
  const zodiacStoneProfile = selfSign ? buildZodiacStoneProfile(selfSign) : null;
  const nameProfile = buildNameProfile(natalPerson, selfSign, dateKey, vipFreeAccess);
  const numerology = buildNumerologyProfile(natalPerson, dateKey);
  const lunarCalendar = selfSign ? buildLunarCalendarProfile(selfSign, dateKey) : null;
  const dailyTalisman = selfSign ? buildDailyTalismanProfile(selfSign, dateKey) : null;
  const hasNatalName = Boolean(normalizeName(natalPerson.name));
  const angelNumber = buildAngelNumberProfile(angelNumberInput, dateKey, selfSign, hasNatalName, dailyTalisman, numerology, vipFreeAccess);
  const angelNumberSafePresetKey = angelNumberPresetKey && normalizeAngelTimeInput(angelNumberPresetKey).label === angelNumber.label ? angelNumber.safeKey : undefined;
  const dreamProfile = buildDreamProfile(dreamSymbolKey, dreamText, selfSign, dateKey);
  const giftProfile = selfSign ? buildGiftBySignProfile(selfSign, giftRecipientType, dateKey) : null;
  const nameCompatibility = buildNameCompatibilityProfile(nameCompatibilitySelf, nameCompatibilityPartner, selfSign, dateKey);
  const archetype = buildPersonalityArchetypeProfile(natalPerson, selfSign, chineseHoroscope, numerology, dailyTalisman, dateKey);
  const monthForecast = selfSign ? buildPersonalMonthForecast(selfSign, dateKey, result) : null;
  const selectedMoreFeature = categoryFeatures.find((item) => item.id === activeMoreFeature) ?? categoryFeatures[0] ?? menuFeatureTabs[0];
  const currentRetentionAction = useMemo(
    () =>
      buildFeatureRetentionAction({
        category,
        activeMoreFeature,
        selectedFeatureLabel: selectedMoreFeature.label,
        selectedFeatureShortLabel: selectedMoreFeature.shortLabel,
        selectedSignSlug,
        selfSignSlug: selfSign?.slug,
        partnerSignSlug: partner.sign,
        relationshipMode,
        scoreTier: pairReady ? zodiacAnalyticsScoreTier(result.scores.total) : undefined,
      }),
    [activeMoreFeature, category, pairReady, partner.sign, relationshipMode, result.scores.total, selectedMoreFeature.label, selectedMoreFeature.shortLabel, selectedSignSlug, selfSign?.slug],
  );
  const categoryBackEnabled = Boolean(onCategoryBack);
  const telegramBackVisible = telegram.isTelegramWebApp && (activeMoreFeature !== defaultMoreFeature || categoryBackEnabled);
  const returnToMoreMenu = useCallback(() => {
    onHaptic("impact", "back", activeMoreFeature);
    setActiveMoreFeature(defaultMoreFeature);
  }, [activeMoreFeature, defaultMoreFeature, onHaptic]);
  const handleTelegramBack = useCallback(() => {
    if (activeMoreFeature !== defaultMoreFeature) {
      onTelegramBackUsed(category, activeMoreFeature);
      returnToMoreMenu();
      return;
    }
    onTelegramBackUsed(category, "main_menu");
    onCategoryBack?.();
  }, [activeMoreFeature, category, defaultMoreFeature, onCategoryBack, onTelegramBackUsed, returnToMoreMenu]);
  const changeMoreFeature = useCallback(
    (feature: MoreFeatureId) => {
      if (feature !== activeMoreFeature) onHaptic("selection", category, feature);
      setActiveMoreFeature(feature);
    },
    [activeMoreFeature, category, onHaptic],
  );
  const openVipFeature = useCallback(
    (feature: string) => {
      onHaptic("impact", "vip", feature);
      onVipFeatureOpen(feature);
      setActiveMoreFeature(feature as MoreFeatureId);
    },
    [onHaptic, onVipFeatureOpen],
  );
  const handlePairRequiredAction = useCallback(
    (action: "create_pair" | "select_here" | "use_last_pair") => {
      onPersonalToolEvent("pair_required_action_clicked", {
        section: "compatibility",
        category: action,
        featureKey: activeMoreFeature,
        firstSign: action === "use_last_pair" ? lastPairAction?.firstSign : self.sign || selectedSignSlug || undefined,
        secondSign: action === "use_last_pair" ? lastPairAction?.secondSign : partner.sign || undefined,
        relationshipMode,
        scoreTier: pairReady ? zodiacAnalyticsScoreTier(result.scores.total) : safeAnalyticsScoreTier(lastPairAction?.scoreTier),
      });
      if (action === "create_pair") {
        onCreatePair(activeMoreFeature);
        return;
      }
      if (action === "use_last_pair") {
        onUseLastPair(activeMoreFeature);
        return;
      }
      openVipFeature(vipInlinePairFeatureFor(activeMoreFeature));
    },
    [activeMoreFeature, lastPairAction, onCreatePair, onPersonalToolEvent, onUseLastPair, openVipFeature, pairReady, partner.sign, relationshipMode, result.scores.total, selectedSignSlug, self.sign],
  );
  const openNatalVipFreeFeature = useCallback(
    (person: PersonState, chart: NatalChart) => {
      onNatalChartVipFreeOpen(person, chart);
      onPersonalToolEvent("dead_cta_resolved", {
        section: "natal_chart",
        category: "vip_free_extensions",
        featureKey: "vipNatalChart",
        sign: chart.sign.slug,
        hasBirthDate: chart.hasBirthDate,
        hasBirthTime: chart.hasBirthTime,
        hasBirthCity: chart.hasBirthCity,
      });
      openVipFeature("vipNatalChart");
    },
    [onNatalChartVipFreeOpen, onPersonalToolEvent, openVipFeature],
  );
  const openNatalVipBlockFeature = useCallback(
    (blockTitle: string, chart: NatalChart) => {
      const targetFeature = vipFeatureForNatalBlock(blockTitle);
      onPersonalToolEvent("dead_cta_resolved", {
        section: "natal_chart",
        category: natalVipBlockCategory(blockTitle),
        featureKey: targetFeature,
        sign: chart.sign.slug,
        hasBirthDate: chart.hasBirthDate,
        hasBirthTime: chart.hasBirthTime,
        hasBirthCity: chart.hasBirthCity,
      });
      openVipFeature(targetFeature);
    },
    [onPersonalToolEvent, openVipFeature],
  );
  const handleMessageTemplateCopy = useCallback(
    (templateId: string) => {
      if (!pairReady) return;
      onMessageHelperUsed();
      onPersonalToolEvent("compatibility_message_copied", {
        section: "compatibility",
        category: templateId,
        featureKey: "messageHelper",
        relationshipMode,
        firstSign: self.sign,
        secondSign: partner.sign,
        scoreTier: zodiacAnalyticsScoreTier(result.scores.total),
      });
    },
    [onMessageHelperUsed, onPersonalToolEvent, pairReady, partner.sign, relationshipMode, result.scores.total, self.sign],
  );

  useTelegramBackButton(telegram.webApp, telegramBackVisible, handleTelegramBack);

  useEffect(() => {
    onRetentionAction(currentRetentionAction);
  }, [currentRetentionAction, onRetentionAction]);

  useEffect(() => {
    if (!pairReady) return;
    if (activeMoreFeature !== "coupleCalendar" && activeMoreFeature !== "coupleHoroscope") return;
    const scoreTier = zodiacAnalyticsScoreTier(result.scores.total);
    const trackKey = `${activeMoreFeature}:${self.sign}:${partner.sign}:${relationshipMode}:${scoreTier}:${dateKey}`;
    if (lastCompatibilityToolTrackedRef.current === trackKey) return;
    lastCompatibilityToolTrackedRef.current = trackKey;
    const payload = {
      section: "compatibility",
      category: activeMoreFeature,
      featureKey: activeMoreFeature,
      relationshipMode,
      firstSign: self.sign,
      secondSign: partner.sign,
      scoreTier,
      hasBirthDate: parseBirthDate(self.birthDate).ok || parseBirthDate(partner.birthDate).ok,
      hasBirthTime: (self.knowsTime && isValidTime(self.birthTime)) || (partner.knowsTime && isValidTime(partner.birthTime)),
      hasBirthCity: (self.knowsTime && Boolean(getCityById(self.selectedCityId))) || (partner.knowsTime && Boolean(getCityById(partner.selectedCityId))),
    };
    onPersonalToolEvent(activeMoreFeature === "coupleCalendar" ? "compatibility_calendar_opened" : "compatibility_action_opened", payload);
  }, [activeMoreFeature, dateKey, onPersonalToolEvent, pairReady, partner, relationshipMode, result.scores.total, self]);

  useEffect(() => {
    const categoryHasFeature = categoryFeatures.some((item) => item.id === activeMoreFeature) || (category === "vip" && vipDetailFeatureIds.has(activeMoreFeature));
    if (!categoryHasFeature) setActiveMoreFeature(defaultMenuFeatureByGroup[category]);
  }, [activeMoreFeature, category, categoryFeatures]);

  useEffect(() => {
    if (!self.sign && !selectedSignSlug) return;
    setNatalPerson((current) => {
      const hasPersonalInput = Boolean(current.name || current.birthDate || current.birthTime || current.cityQuery || current.selectedCityId);
      if (hasPersonalInput) return current.sign ? current : { ...current, sign: self.sign || selectedSignSlug };
      return {
        ...current,
        name: self.name,
        sign: self.sign || selectedSignSlug,
        gender: self.gender,
        birthDate: self.birthDate,
        knowsTime: self.knowsTime,
        birthTime: self.birthTime,
        cityQuery: self.cityQuery,
        selectedCityId: self.selectedCityId,
      };
    });
  }, [selectedSignSlug, self]);

  useEffect(() => {
    if (activeMoreFeature !== "chineseHoroscope" && activeMoreFeature !== "zodiacStones" && activeMoreFeature !== "nameProfile") return;

    const parsedDate = parseBirthDate(natalPerson.birthDate);
    const hasBirthDate = parsedDate.ok;
    const hasName = Boolean(normalizeName(natalPerson.name));
    const sign = selfSign?.slug || (hasBirthDate ? parsedDate.signSlug : undefined);
    const trackKey = [
      activeMoreFeature,
      sign ?? "no-sign",
      hasBirthDate ? "birth-date" : "no-birth-date",
      hasName ? "name" : "no-name",
      chineseHoroscope ? "chinese-result" : "no-chinese-result",
      zodiacStoneProfile ? "stones-result" : "no-stones-result",
      nameProfile ? "name-result" : "no-name-result",
    ].join(":");

    if (lastPersonalToolTrackedRef.current === trackKey) return;
    lastPersonalToolTrackedRef.current = trackKey;

    if (activeMoreFeature === "chineseHoroscope") {
      const payload = { section: "chinese_horoscope", sign, hasBirthDate, hasName, freeVipActive: vipFreeAccess };
      onPersonalToolEvent("chinese_horoscope_opened", payload);
      if (chineseHoroscope) onPersonalToolEvent("chinese_horoscope_result_viewed", payload);
    }

    if (activeMoreFeature === "zodiacStones") {
      const payload = { section: "zodiac_stones", sign: selfSign?.slug, hasBirthDate, hasName, freeVipActive: vipFreeAccess };
      onPersonalToolEvent("zodiac_stones_opened", payload);
      if (zodiacStoneProfile) onPersonalToolEvent("zodiac_stones_sign_viewed", payload);
    }

    if (activeMoreFeature === "nameProfile") {
      const payload = { section: "name_profile", sign, hasBirthDate, hasName, freeVipActive: vipFreeAccess };
      onPersonalToolEvent("name_profile_opened", payload);
      if (nameProfile) onPersonalToolEvent("name_profile_result_viewed", payload);
    }
  }, [activeMoreFeature, chineseHoroscope, nameProfile, natalPerson.birthDate, natalPerson.name, onPersonalToolEvent, selfSign, vipFreeAccess, zodiacStoneProfile]);

  useEffect(() => {
    const parsedDate = parseBirthDate(natalPerson.birthDate);
    const hasBirthDate = parsedDate.ok;
    const hasBirthTime = natalPerson.knowsTime && isValidTime(natalPerson.birthTime);
    const hasBirthCity = natalPerson.knowsTime && Boolean(getCityById(natalPerson.selectedCityId));
    const hasName = Boolean(normalizeName(natalPerson.name));
    const hasSecondName = Boolean(normalizeName(nameCompatibilityPartner));
    const sign = selfSign?.slug || (hasBirthDate ? parsedDate.signSlug : selectedSignSlug);
    const selectedPresetKey =
      activeMoreFeature === "angelNumbers"
        ? angelNumberSafePresetKey
        : activeMoreFeature === "dreamDictionary"
          ? dreamProfile.safeKey
          : undefined;
    const patternType = activeMoreFeature === "angelNumbers" ? angelNumber.patternType : undefined;
    const trackKey = [
      activeMoreFeature,
      sign,
      hasBirthDate ? "birth-date" : "no-birth-date",
      hasBirthTime ? "birth-time" : "no-birth-time",
      hasBirthCity ? "birth-city" : "no-birth-city",
      hasName ? "name" : "no-name",
      hasSecondName ? "second-name" : "no-second-name",
      selectedPresetKey ?? "no-preset",
      patternType ?? "no-pattern",
      vipFreeAccess ? "vip-free" : "vip-closed",
    ].join(":");

    if (lastPersonalToolTrackedRef.current === trackKey) return;

    const payload = {
      section: sectionForFeature(activeMoreFeature),
      category,
      featureKey: activeMoreFeature,
      sign,
      hasBirthDate,
      hasBirthTime,
      hasBirthCity,
      hasName,
      hasSecondName,
      selectedPresetKey,
      patternType,
      freeVipActive: vipFreeAccess,
    };

    if (activeMoreFeature === "numerology") {
      lastPersonalToolTrackedRef.current = trackKey;
      onPersonalToolEvent("numerology_opened", payload);
      onPersonalToolEvent("numerology_result_viewed", payload);
    }
    if (activeMoreFeature === "angelNumbers") {
      lastPersonalToolTrackedRef.current = trackKey;
      onPersonalToolEvent("angel_numbers_opened", payload);
      onPersonalToolEvent("angel_number_viewed", payload);
    }
    if (activeMoreFeature === "lunarCalendar") {
      lastPersonalToolTrackedRef.current = trackKey;
      onPersonalToolEvent("lunar_calendar_opened", payload);
    }
    if (activeMoreFeature === "dailyTalisman") {
      lastPersonalToolTrackedRef.current = trackKey;
      onPersonalToolEvent("daily_talisman_opened", payload);
    }
    if (activeMoreFeature === "dreamDictionary") {
      lastPersonalToolTrackedRef.current = trackKey;
      onPersonalToolEvent("dream_dictionary_opened", payload);
      onPersonalToolEvent("dream_symbol_viewed", payload);
    }
    if (activeMoreFeature === "giftBySign") {
      lastPersonalToolTrackedRef.current = trackKey;
      onPersonalToolEvent("gift_by_sign_opened", payload);
    }
    if (activeMoreFeature === "dailyCard") {
      lastPersonalToolTrackedRef.current = trackKey;
      onPersonalToolEvent("daily_card_opened", payload);
    }
    if (activeMoreFeature === "tarotCard") {
      lastPersonalToolTrackedRef.current = trackKey;
      onPersonalToolEvent("tarot_card_opened", payload);
    }
    if (activeMoreFeature === "runeDay") {
      lastPersonalToolTrackedRef.current = trackKey;
      onPersonalToolEvent("rune_day_opened", payload);
    }
    if (activeMoreFeature === "intuitiveSign") {
      lastPersonalToolTrackedRef.current = trackKey;
      onPersonalToolEvent("intuitive_sign_opened", payload);
    }
    if (activeMoreFeature === "talismans") {
      lastPersonalToolTrackedRef.current = trackKey;
      onPersonalToolEvent("talismans_opened", payload);
    }
    if (activeMoreFeature === "auraColor") {
      lastPersonalToolTrackedRef.current = trackKey;
      onPersonalToolEvent("aura_color_opened", payload);
    }
    if (activeMoreFeature === "lunarRitual") {
      lastPersonalToolTrackedRef.current = trackKey;
      onPersonalToolEvent("lunar_ritual_opened", payload);
    }
    if (activeMoreFeature === "karmicLessons") {
      lastPersonalToolTrackedRef.current = trackKey;
      onPersonalToolEvent("karmic_lessons_opened", payload);
    }
    if (activeMoreFeature === "birthMatrix") {
      lastPersonalToolTrackedRef.current = trackKey;
      onPersonalToolEvent("birth_matrix_opened", payload);
    }
    if (activeMoreFeature === "nameCompatibility") {
      lastPersonalToolTrackedRef.current = trackKey;
      onPersonalToolEvent("name_compatibility_opened", payload);
      if (nameCompatibility) onPersonalToolEvent("name_compatibility_result_viewed", payload);
    }
    if (activeMoreFeature === "archetype") {
      lastPersonalToolTrackedRef.current = trackKey;
      onPersonalToolEvent("archetype_opened", payload);
      onPersonalToolEvent("archetype_result_viewed", payload);
    }
    if (activeMoreFeature === "vip") {
      lastPersonalToolTrackedRef.current = trackKey;
      onPersonalToolEvent("vip_opened", payload);
      onPersonalToolEvent("vip_free_access_viewed", payload);
    }
    if (activeMoreFeature === "giveaways") {
      lastPersonalToolTrackedRef.current = trackKey;
      onPersonalToolEvent("giveaway_locked_viewed", { ...payload, featureKey: "giveaways_locked" });
    }
  }, [
    activeMoreFeature,
    angelNumber.patternType,
    angelNumber.safeKey,
    angelNumberSafePresetKey,
    category,
    dreamProfile.safeKey,
    nameCompatibility,
    nameCompatibilityPartner,
    natalPerson.birthDate,
    natalPerson.birthTime,
    natalPerson.knowsTime,
    natalPerson.name,
    natalPerson.selectedCityId,
    onPersonalToolEvent,
    selectedSignSlug,
    selfSign,
    vipFreeAccess,
  ]);

  const menuGroup = menuFeatureGroups.find((item) => item.id === category) ?? menuFeatureGroups[0];

  return (
    <section className={panelClass(publicMode)}>
      {onCategoryBack ? (
        <button type="button" onClick={onCategoryBack} className={secondaryButtonClass(publicMode)}>
          <ArrowLeft className="h-4 w-4" />
          Главное меню
        </button>
      ) : null}
      <SectionHeader publicMode={publicMode} icon={<Crown className="h-5 w-5" />} title={menuGroup.title} subtitle={menuGroup.subtitle} />
      <div className={publicMode ? "mt-3 flex gap-2 rounded-lg border border-emerald-200/20 bg-emerald-200/10 p-3 text-sm leading-5 text-emerald-50" : "mt-3 flex gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm leading-5 text-emerald-900"}>
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
        <p>без сохранения данных: имена, даты, время и город остаются только на этом экране.</p>
      </div>
      <MoreFeatureNavigation features={categoryFeatures} activeFeature={activeMoreFeature} pairReady={pairReady} natalReady={Boolean(natalChart)} signReady={Boolean(selfSign)} onChange={changeMoreFeature} />
      <div className={publicMode ? "mt-3 rounded-lg border border-white/10 bg-white/7 p-3" : "mt-3 rounded-lg border border-slate-200 bg-white p-3"}>
        <p className={publicMode ? "text-xs font-semibold text-amber-100" : "text-xs font-semibold text-violet-800"}>Открыт раздел</p>
        <p className={publicMode ? "mt-1 text-base font-semibold text-white" : "mt-1 text-base font-semibold text-slate-950"}>{selectedMoreFeature.label}</p>
        {activeMoreFeature !== "giveaways" ? (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => onFavoriteSave(currentRetentionAction)} className={secondaryTinyButtonClass(publicMode)}>
              <Bookmark className="h-4 w-4" />
              Сохранить
            </button>
            <button type="button" onClick={() => onShare(currentRetentionAction)} className={secondaryTinyButtonClass(publicMode)}>
              <Share2 className="h-4 w-4" />
              Поделиться
            </button>
          </div>
        ) : null}
      </div>
      <div className="mt-4">
        {activeMoreFeature === "compatibilityTool" ? <CompatibilityToolCard publicMode={publicMode} /> : null}
        {activeMoreFeature === "todayForecast" ? <TodaySection publicMode={publicMode} sign={selectedSign} dateKey={dateKey} /> : null}
        {activeMoreFeature === "weekForecast" ? <WeekSection publicMode={publicMode} sign={selectedSign} dateKey={dateKey} /> : null}
        {activeMoreFeature === "luckyDays" ? <LuckyDaysSection publicMode={publicMode} sign={selectedSign} dateKey={dateKey} onLuckyDayClick={onLuckyDayClick} /> : null}
        {activeMoreFeature === "coupleHoroscope" ? <CoupleHoroscopeCard publicMode={publicMode} horoscope={coupleHoroscope} actionToday={coupleAction} lastPairAction={lastPairAction} onPairRequiredAction={handlePairRequiredAction} /> : null}
        {activeMoreFeature === "mentalMap" ? <RelationshipMapCard publicMode={publicMode} result={result} pairReady={pairReady} lastPairAction={lastPairAction} onPairRequiredAction={handlePairRequiredAction} onCategoryOpen={onRelationshipMapCategoryOpen} /> : null}
        {activeMoreFeature === "coupleCalendar" ? <CoupleCalendarCard publicMode={publicMode} days={coupleCalendar} pairReady={pairReady} lastPairAction={lastPairAction} onPairRequiredAction={handlePairRequiredAction} /> : null}
        {activeMoreFeature === "reconciliation" ? <ReconciliationDayCard publicMode={publicMode} reconciliation={reconciliation} lastPairAction={lastPairAction} onPairRequiredAction={handlePairRequiredAction} /> : null}
        {activeMoreFeature === "messageHelper" ? (
          <PartnerMessageCard
            publicMode={publicMode}
            message={message}
            messageTemplates={messageTemplates}
            tone={messageTone}
            onToneChange={setMessageTone}
            onUsed={onMessageHelperUsed}
            onCopy={handleMessageTemplateCopy}
            onSave={() => onFavoriteSave(currentRetentionAction)}
            onShare={() => onShare(currentRetentionAction)}
            pairReady={pairReady}
            lastPairAction={lastPairAction}
            onPairRequiredAction={handlePairRequiredAction}
          />
        ) : null}
        {activeMoreFeature === "nameCompatibility" ? (
          <NameCompatibilityCard
            publicMode={publicMode}
            firstName={nameCompatibilitySelf}
            secondName={nameCompatibilityPartner}
            onFirstNameChange={setNameCompatibilitySelf}
            onSecondNameChange={setNameCompatibilityPartner}
            profile={nameCompatibility}
            vipFreeAccess={vipFreeAccess}
          />
        ) : null}
        {activeMoreFeature === "natalChart" ? (
          <NatalChartV1Card
            publicMode={publicMode}
            person={natalPerson}
            chart={natalChart}
            onPersonChange={setNatalPerson}
            onOpened={onNatalChartOpened}
            onResultViewed={onNatalChartResultViewed}
            onSectionOpen={onNatalChartSectionOpen}
            onVipFreeOpen={openNatalVipFreeFeature}
            onVipBlockOpen={openNatalVipBlockFeature}
          />
        ) : null}
        {activeMoreFeature === "chineseHoroscope" ? <ChineseHoroscopeCard publicMode={publicMode} person={natalPerson} horoscope={chineseHoroscope} onPersonChange={setNatalPerson} /> : null}
        {activeMoreFeature === "zodiacStones" ? <ZodiacStonesCard publicMode={publicMode} profile={zodiacStoneProfile} /> : null}
        {activeMoreFeature === "nameProfile" ? <NameProfileCard publicMode={publicMode} person={natalPerson} profile={nameProfile} onPersonChange={setNatalPerson} vipFreeAccess={vipFreeAccess} /> : null}
        {activeMoreFeature === "numerology" ? <NumerologyCard publicMode={publicMode} person={natalPerson} profile={numerology} onPersonChange={setNatalPerson} vipFreeAccess={vipFreeAccess} /> : null}
        {activeMoreFeature === "angelNumbers" ? (
          <AngelNumbersCard
            publicMode={publicMode}
            value={angelNumberInput}
            profile={angelNumber}
            selectedPresetKey={angelNumberSafePresetKey}
            onChange={(nextValue) => {
              setAngelNumberInput(formatAngelTimeInputForDisplay(nextValue));
              setAngelNumberPresetKey("");
            }}
            onPresetSelect={(preset) => {
              setAngelNumberInput(preset);
              setAngelNumberPresetKey(preset);
            }}
          />
        ) : null}
        {activeMoreFeature === "lunarCalendar" ? <LunarCalendarCard publicMode={publicMode} profile={lunarCalendar} /> : null}
        {activeMoreFeature === "dailyTalisman" ? <DailyTalismanCard publicMode={publicMode} profile={dailyTalisman} /> : null}
        {activeMoreFeature === "dreamDictionary" ? <DreamDictionaryCard publicMode={publicMode} symbolKey={dreamSymbolKey} dreamText={dreamText} profile={dreamProfile} onSymbolChange={setDreamSymbolKey} onDreamTextChange={setDreamText} /> : null}
        {activeMoreFeature === "giftBySign" ? <GiftBySignCard publicMode={publicMode} recipientType={giftRecipientType} profile={giftProfile} onRecipientTypeChange={setGiftRecipientType} /> : null}
        {activeMoreFeature === "archetype" ? <PersonalityArchetypeCard publicMode={publicMode} person={natalPerson} profile={archetype} onPersonChange={setNatalPerson} vipFreeAccess={vipFreeAccess} /> : null}
        {activeMoreFeature === "dailyCard" ? <DailyCardFeature publicMode={publicMode} dateKey={dateKey} sign={(selfSign?.slug as any) || "aries"} /> : null}
        {activeMoreFeature === "tarotCard" ? (
          <TarotCardFeature
            publicMode={publicMode}
            dateKey={dateKey}
            sign={(selfSign?.slug as any) || "aries"}
            onSave={(action) => onFavoriteSave(action)}
            onShare={(action) => onShare(action)}
            onEvent={onPersonalToolEvent}
          />
        ) : null}
        {activeMoreFeature === "runeDay" ? (
          <RuneDayFeature
            publicMode={publicMode}
            dateKey={dateKey}
            sign={(selfSign?.slug as any) || "aries"}
            onSave={(action) => onFavoriteSave(action)}
            onShare={(action) => onShare(action)}
            onEvent={onPersonalToolEvent}
          />
        ) : null}
        {activeMoreFeature === "intuitiveSign" ? <IntuitiveSignFeature publicMode={publicMode} dateKey={dateKey} sign={(selfSign?.slug as any) || "aries"} /> : null}
        {activeMoreFeature === "talismans" ? <TalismansFeature publicMode={publicMode} sign={(selfSign?.slug as any) || ""} /> : null}
        {activeMoreFeature === "auraColor" ? <AuraColorFeature publicMode={publicMode} dateKey={dateKey} sign={(selfSign?.slug as any) || "aries"} /> : null}
        {activeMoreFeature === "lunarRitual" ? (
          <LunarRitualFeature
            publicMode={publicMode}
            dateKey={dateKey}
            sign={(selfSign?.slug as any) || "aries"}
            onSave={(action) => onFavoriteSave(action)}
            onShare={(action) => onShare(action)}
            onEvent={onPersonalToolEvent}
          />
        ) : null}
        {activeMoreFeature === "karmicLessons" ? <KarmicLessonsFeature publicMode={publicMode} sign={(selfSign?.slug as any) || ""} birthDateKey={self.birthDate} /> : null}
        {activeMoreFeature === "birthMatrix" ? (
          <BirthMatrixFeature
            publicMode={publicMode}
            birthDateString={natalPerson.birthDate}
            onBirthDateChange={(val) => setNatalPerson((s) => ({ ...s, birthDate: val }))}
            onSave={(action) => onFavoriteSave(action)}
            onShare={(action) => onShare(action)}
            onEvent={onPersonalToolEvent}
          />
        ) : null}
        {activeMoreFeature === "vip" ? (
          <VipMenuCard
            publicMode={publicMode}
            config={zodiacVipConfig}
            untilLabel={formatVipFreeAccessDate(zodiacVipConfig.vipFreeAccessUntil)}
            pairReady={pairReady}
            natalReady={Boolean(natalChart)}
            nameReady={Boolean(nameProfile)}
            onFeatureOpen={openVipFeature}
          />
        ) : null}
        {activeMoreFeature === "vipNatalChart" ? (
          <ExtendedNatalFeature publicMode={publicMode} natalChart={natalChart} defaultSign={selfSign} onBack={returnToMoreMenu} onSave={(action) => onFavoriteSave(action ?? currentRetentionAction)} onShare={(action) => onShare(action ?? currentRetentionAction)} onEvent={onPersonalToolEvent} />
        ) : null}
        {activeMoreFeature === "vipCompatibility" ? (
          <ExtendedCompatibilityFeature publicMode={publicMode} result={result} pairReady={pairReady} defaultSign={selfSign} defaultSecondSign={partnerSign} relationshipMode={relationshipMode} scoreTier={vipScoreTier} onBack={returnToMoreMenu} onSave={() => onFavoriteSave(currentRetentionAction)} onShare={() => onShare(currentRetentionAction)} onEvent={onPersonalToolEvent} />
        ) : null}
        {activeMoreFeature === "vipMentalMap" ? (
          <VipMentalMapFeature publicMode={publicMode} result={result} pairReady={pairReady} defaultSign={selfSign} defaultSecondSign={partnerSign} relationshipMode={relationshipMode} scoreTier={vipScoreTier} onBack={returnToMoreMenu} onSave={() => onFavoriteSave(currentRetentionAction)} onShare={() => onShare(currentRetentionAction)} onEvent={onPersonalToolEvent} />
        ) : null}
        {activeMoreFeature === "vipCoupleCalendar" ? (
          <VipCoupleCalendarFeature publicMode={publicMode} calendarDays={coupleCalendar} pairReady={pairReady} defaultSign={selfSign} defaultSecondSign={partnerSign} relationshipMode={relationshipMode} scoreTier={vipScoreTier} onBack={returnToMoreMenu} onSave={() => onFavoriteSave(currentRetentionAction)} onShare={() => onShare(currentRetentionAction)} onEvent={onPersonalToolEvent} />
        ) : null}
        {activeMoreFeature === "vipMonthForecast" ? (
          <VipMonthForecastFeature publicMode={publicMode} monthForecast={monthForecast} defaultSign={selfSign} onBack={returnToMoreMenu} onSave={() => onFavoriteSave(currentRetentionAction)} onShare={() => onShare(currentRetentionAction)} onEvent={onPersonalToolEvent} />
        ) : null}
        {activeMoreFeature === "vipMessageHelper" ? (
          <VipMessageHelperFeature publicMode={publicMode} messageVariants={messageTones.map((tone) => ({
            label: tone.label,
            text: pairReady ? buildPartnerMessage(self, partner, dateKey, tone.id, result) : "выберите два знака, чтобы открыть вариант сообщения",
          }))} pairReady={pairReady} defaultSign={selfSign} defaultSecondSign={partnerSign} relationshipMode={relationshipMode} scoreTier={vipScoreTier} onBack={returnToMoreMenu} onSave={() => onFavoriteSave(currentRetentionAction)} onShare={() => onShare(currentRetentionAction)} onEvent={onPersonalToolEvent} />
        ) : null}
        {activeMoreFeature === "vipNameProfile" ? (
          <ExtendedNameProfileFeature publicMode={publicMode} nameProfile={nameProfile} defaultSign={selfSign} onBack={returnToMoreMenu} onSave={() => onFavoriteSave(currentRetentionAction)} onShare={() => onShare(currentRetentionAction)} onEvent={onPersonalToolEvent} />
        ) : null}
        {activeMoreFeature === "vipNumerology" ? (
          <ExtendedNumerologyFeature publicMode={publicMode} numerology={numerology} defaultSign={selfSign} onBack={returnToMoreMenu} onSave={() => onFavoriteSave(currentRetentionAction)} onShare={() => onShare(currentRetentionAction)} onEvent={onPersonalToolEvent} />
        ) : null}
        {activeMoreFeature === "vipAngelNumbers" ? (
          <ExtendedAngelNumberFeature publicMode={publicMode} angelNumber={angelNumber} defaultSign={selfSign} onBack={returnToMoreMenu} onSave={() => onFavoriteSave(currentRetentionAction)} onShare={() => onShare(currentRetentionAction)} onEvent={onPersonalToolEvent} />
        ) : null}
        {activeMoreFeature === "vipTalismans" ? (
          <VipTalismansFeature publicMode={publicMode} dailyTalisman={dailyTalisman} selfSign={selfSign} onBack={returnToMoreMenu} onSave={() => onFavoriteSave(currentRetentionAction)} onShare={() => onShare(currentRetentionAction)} onEvent={onPersonalToolEvent} />
        ) : null}
        {activeMoreFeature === "vipMysticDay" ? (
          <VipMysticDayFeature publicMode={publicMode} dateKey={dateKey} sign={selfSign} angelNumber={angelNumber} onBack={returnToMoreMenu} onSave={() => onFavoriteSave(currentRetentionAction)} onShare={() => onShare(currentRetentionAction)} onEvent={onPersonalToolEvent} />
        ) : null}
        {activeMoreFeature === "giveaways" ? (
          <LockedPreviewCard
            publicMode={publicMode}
            icon={<Gift className="h-5 w-5" />}
            title="🔒 Розыгрыши"
            text="Скоро появится"
            items={[
              "Розыгрыши появятся позже: задания, бонусы и призы для активных подписчиков.",
              "Сейчас это только превью без участия, аккаунтов и выбора победителей.",
              "Проверки подписки, призовая логика и хранение участников не реализованы.",
            ]}
            onPreviewClick={onGiveawayClick}
          />
        ) : null}
      </div>
    </section>
  );
}

function PairRequiredCard({
  publicMode,
  title,
  lastPairAction,
  onPairRequiredAction,
}: {
  publicMode: boolean;
  title: string;
  lastPairAction?: ZodiacRetentionItem | null;
  onPairRequiredAction: (action: "create_pair" | "select_here" | "use_last_pair") => void;
}) {
  const lastPairLabel = lastPairAction?.firstSign && lastPairAction.secondSign ? `${findSign(lastPairAction.firstSign).name} + ${findSign(lastPairAction.secondSign).name}` : "";
  return (
    <FeatureCard publicMode={publicMode} title={title} subtitle="Нужна пара для расчёта">
      <div className={publicMode ? "rounded-lg border border-cyan-200/20 bg-cyan-200/10 p-4" : "rounded-lg border border-cyan-100 bg-cyan-50 p-4"}>
        <p className={publicMode ? "text-base font-semibold text-cyan-50" : "text-base font-semibold text-cyan-950"}>Нужна пара для расчёта</p>
        <p className={publicMode ? "mt-2 text-sm leading-6 text-cyan-50/85" : "mt-2 text-sm leading-6 text-cyan-900"}>
          Выберите два знака, чтобы открыть этот инструмент. Можно создать пару в основном расчёте или быстро перейти к выбору знаков.
        </p>
        <div className="mt-4 grid gap-2">
          <button type="button" onClick={() => onPairRequiredAction("create_pair")} className={primaryTinyButtonClass(publicMode)}>
            Создать пару
          </button>
          <button type="button" onClick={() => onPairRequiredAction("select_here")} className={secondaryTinyButtonClass(publicMode)}>
            Выбрать знаки здесь
          </button>
          {lastPairLabel ? (
            <button type="button" onClick={() => onPairRequiredAction("use_last_pair")} className={secondaryTinyButtonClass(publicMode)}>
              Использовать последнюю пару: {lastPairLabel}
            </button>
          ) : null}
        </div>
      </div>
    </FeatureCard>
  );
}

function CoupleHoroscopeCard({
  publicMode,
  horoscope,
  actionToday,
  lastPairAction,
  onPairRequiredAction,
}: {
  publicMode: boolean;
  horoscope: CoupleHoroscope | null;
  actionToday: CoupleAction | null;
  lastPairAction?: ZodiacRetentionItem | null;
  onPairRequiredAction: (action: "create_pair" | "select_here" | "use_last_pair") => void;
}) {
  if (!horoscope) return <PairRequiredCard publicMode={publicMode} title="💑 Гороскоп пары" lastPairAction={lastPairAction} onPairRequiredAction={onPairRequiredAction} />;

  return (
    <FeatureCard publicMode={publicMode} title="💑 Гороскоп пары на сегодня" subtitle={horoscope.summary}>
      <div className="grid gap-3">
        <InfoRow publicMode={publicMode} label="❤️ Для отношений" text={horoscope.relationship} />
        <InfoRow publicMode={publicMode} label="💬 Для разговора" text={horoscope.talk} />
        <InfoRow publicMode={publicMode} label="🌹 Для свидания" text={horoscope.date} />
        <InfoRow publicMode={publicMode} label="🕊 Для примирения" text={horoscope.reconciliation} />
        <InfoRow publicMode={publicMode} label="✅ Стоит сделать" text={horoscope.action} />
        <InfoRow publicMode={publicMode} label="⚠️ Лучше избегать" text={horoscope.avoid} />
        {actionToday ? (
          <div className={publicMode ? "rounded-lg border border-emerald-200/20 bg-gradient-to-br from-emerald-200/14 to-cyan-200/8 p-4" : "rounded-lg border border-emerald-200 bg-gradient-to-br from-emerald-50 to-cyan-50 p-4"}>
            <div className="flex items-start gap-3">
              <span className={publicMode ? "grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-emerald-100/20 bg-emerald-100/10 text-emerald-50" : "grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-emerald-200 bg-white text-emerald-700"}>
                <Check className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className={publicMode ? "text-base font-semibold text-emerald-50" : "text-base font-semibold text-emerald-950"}>Действие сегодня</p>
                <p className={publicMode ? "mt-1 break-words text-sm leading-6 text-emerald-50/90 [overflow-wrap:anywhere]" : "mt-1 break-words text-sm leading-6 text-emerald-950 [overflow-wrap:anywhere]"}>{actionToday.mainAction}</p>
              </div>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <InfoRow publicMode={publicMode} label="Избегать" text={actionToday.avoid} />
              <InfoRow publicMode={publicMode} label="Лучший тон" text={actionToday.bestTone} />
              <InfoRow publicMode={publicMode} label="Маленький шаг" text={actionToday.smallStep} />
            </div>
          </div>
        ) : null}
        <EnergyCard publicMode={publicMode} energy={horoscope.energy} />
      </div>
    </FeatureCard>
  );
}

function RelationshipMapCard({
  publicMode,
  result,
  pairReady,
  lastPairAction,
  onPairRequiredAction,
  onCategoryOpen,
}: {
  publicMode: boolean;
  result: CompatibilityResult;
  pairReady: boolean;
  lastPairAction?: ZodiacRetentionItem | null;
  onPairRequiredAction: (action: "create_pair" | "select_here" | "use_last_pair") => void;
  onCategoryOpen: (category: string) => void;
}) {
  if (!pairReady) return <PairRequiredCard publicMode={publicMode} title="🧠 Ментальная карта пары" lastPairAction={lastPairAction} onPairRequiredAction={onPairRequiredAction} />;

  return (
    <FeatureCard publicMode={publicMode} title="🧠 Ментальная карта пары" subtitle="Как вы думаете, спорите, миритесь и поддерживаете друг друга">
      <div className="space-y-3">
        <div className={publicMode ? "rounded-lg border border-amber-200/20 bg-amber-200/10 p-3" : "rounded-lg border border-amber-200 bg-amber-50 p-3"}>
          <p className={publicMode ? "text-xs font-semibold uppercase tracking-wide text-amber-100" : "text-xs font-semibold uppercase tracking-wide text-amber-800"}>Карта отношений</p>
          <p className={publicMode ? "mt-2 text-sm leading-5 text-slate-200" : "mt-2 text-sm leading-5 text-slate-700"}>{result.mapSummary}</p>
        </div>
        <MentalMapSummaryBlock publicMode={publicMode} summary={result.mentalMapSummary} />
        <div className="grid gap-3 sm:grid-cols-2">
          {result.mapScores.map((item) => (
            <MentalMapCategoryTile key={item.id} publicMode={publicMode} item={item} onOpen={onCategoryOpen} />
          ))}
        </div>
        <MentalMapDynamicsGrid publicMode={publicMode} items={result.mentalMapDynamics} />
        <div className="grid gap-3 sm:grid-cols-2">
          <MentalMapAdviceCard publicMode={publicMode} title="✅ Что поможет" items={result.mentalMapSummary.helps} />
          <MentalMapAdviceCard publicMode={publicMode} title="⚠️ Чего избегать" items={result.mentalMapSummary.avoid} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <ResultTextCard publicMode={publicMode} title="Сильная сторона" text={result.strengthText} />
          <ResultTextCard publicMode={publicMode} title="Зона внимания" text={result.riskText} />
        </div>
      </div>
    </FeatureCard>
  );
}

function MentalMapSummaryBlock({ publicMode, summary }: { publicMode: boolean; summary: MentalMapSummary }) {
  return (
    <div className={publicMode ? "rounded-lg border border-fuchsia-200/20 bg-white/8 p-3" : "rounded-lg border border-violet-100 bg-white p-3"}>
      <div className="grid gap-3 sm:grid-cols-3">
        <MentalMapSummaryItem publicMode={publicMode} label="Сильные стороны" text={summary.strengths} />
        <MentalMapSummaryItem publicMode={publicMode} label="Зоны риска" text={summary.risks} />
        <MentalMapSummaryItem publicMode={publicMode} label="Главный совет" text={summary.advice} />
      </div>
    </div>
  );
}

function MentalMapSummaryItem({ publicMode, label, text }: { publicMode: boolean; label: string; text: string }) {
  return (
    <div>
      <p className={publicMode ? "text-xs font-semibold text-amber-100" : "text-xs font-semibold text-violet-800"}>{label}</p>
      <p className={publicMode ? "mt-1 break-words text-sm leading-5 text-slate-200 [overflow-wrap:anywhere]" : "mt-1 break-words text-sm leading-5 text-slate-700 [overflow-wrap:anywhere]"}>{text}</p>
    </div>
  );
}

function MentalMapCategoryTile({ publicMode, item, onOpen }: { publicMode: boolean; item: RelationshipMapScore; onOpen: (category: string) => void }) {
  const tone = item.value >= 70 ? "Сила" : item.value >= 55 ? "Баланс" : "Риск";
  const toneClass =
    item.value >= 70
      ? publicMode
        ? "border-emerald-200/25 bg-emerald-200/10 text-emerald-100"
        : "border-emerald-100 bg-emerald-50 text-emerald-800"
      : item.value >= 55
        ? publicMode
          ? "border-amber-200/25 bg-amber-200/10 text-amber-100"
          : "border-amber-100 bg-amber-50 text-amber-800"
        : publicMode
          ? "border-rose-200/25 bg-rose-200/10 text-rose-100"
          : "border-rose-100 bg-rose-50 text-rose-800";

  return (
    <button
      type="button"
      onClick={() => onOpen(item.id)}
      className={
        publicMode
          ? "min-h-[136px] w-full rounded-lg border border-white/12 bg-white/8 p-3 text-left text-slate-100 transition hover:border-fuchsia-200/30 hover:bg-white/12 focus:outline-none focus:ring-2 focus:ring-fuchsia-200/50"
          : "min-h-[136px] w-full rounded-lg border border-slate-200 bg-white p-3 text-left text-slate-700 transition hover:border-violet-200 hover:bg-violet-50/50 focus:outline-none focus:ring-2 focus:ring-violet-200"
      }
      aria-label={`${item.label}: ${item.value}%`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={publicMode ? "break-words text-sm font-semibold leading-5 text-white [overflow-wrap:anywhere]" : "break-words text-sm font-semibold leading-5 text-slate-950 [overflow-wrap:anywhere]"}>{item.label}</p>
          <p className={publicMode ? "mt-1 text-xs text-slate-400" : "mt-1 text-xs text-slate-500"}>{item.shortLabel}</p>
        </div>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${toneClass}`}>{tone}</span>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <div className={publicMode ? "h-2 flex-1 rounded-full bg-white/12" : "h-2 flex-1 rounded-full bg-slate-100"}>
          <div className={publicMode ? "h-2 rounded-full bg-gradient-to-r from-fuchsia-300 via-rose-300 to-amber-200" : "h-2 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-amber-400"} style={{ width: `${item.value}%` }} />
        </div>
        <span className={publicMode ? "w-10 text-right text-sm font-semibold text-amber-100" : "w-10 text-right text-sm font-semibold text-violet-700"}>{item.value}%</span>
      </div>
      <p className={publicMode ? "mt-3 break-words text-sm leading-5 text-slate-300 [overflow-wrap:anywhere]" : "mt-3 break-words text-sm leading-5 text-slate-600 [overflow-wrap:anywhere]"}>{item.text}</p>
    </button>
  );
}

function MentalMapDynamicsGrid({ publicMode, items }: { publicMode: boolean; items: MentalMapDynamic[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className={publicMode ? "rounded-lg border border-white/12 bg-white/8 p-3" : "rounded-lg border border-slate-200 bg-white p-3"}>
          <p className={publicMode ? "text-xs font-semibold text-amber-100" : "text-xs font-semibold text-violet-800"}>{item.label}</p>
          <p className={publicMode ? "mt-2 break-words text-sm leading-5 text-slate-300 [overflow-wrap:anywhere]" : "mt-2 break-words text-sm leading-5 text-slate-600 [overflow-wrap:anywhere]"}>{item.text}</p>
        </div>
      ))}
    </div>
  );
}

function MentalMapAdviceCard({ publicMode, title, items }: { publicMode: boolean; title: string; items: string[] }) {
  return (
    <div className={publicMode ? "rounded-lg border border-white/12 bg-white/8 p-3" : "rounded-lg border border-slate-200 bg-white p-3"}>
      <p className={publicMode ? "text-sm font-semibold text-amber-100" : "text-sm font-semibold text-violet-800"}>{title}</p>
      <ul className="mt-2 space-y-2">
        {items.map((item) => (
          <li key={item} className={publicMode ? "break-words text-sm leading-5 text-slate-300 [overflow-wrap:anywhere]" : "break-words text-sm leading-5 text-slate-600 [overflow-wrap:anywhere]"}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CoupleCalendarCard({
  publicMode,
  days,
  pairReady,
  lastPairAction,
  onPairRequiredAction,
}: {
  publicMode: boolean;
  days: CoupleCalendarDay[];
  pairReady: boolean;
  lastPairAction?: ZodiacRetentionItem | null;
  onPairRequiredAction: (action: "create_pair" | "select_here" | "use_last_pair") => void;
}) {
  if (!pairReady) return <PairRequiredCard publicMode={publicMode} title="📅 Календарь пары" lastPairAction={lastPairAction} onPairRequiredAction={onPairRequiredAction} />;

  return (
    <FeatureCard publicMode={publicMode} title="📅 30 дней пары" subtitle={`Ближайшие ${days.length} дней: тема, энергия, действие и риск`}>
      <div className="grid max-h-[560px] gap-3 overflow-y-auto pr-1">
        {days.map((day, index) => {
          const isToday = index === 0;
          return (
            <div
              key={day.dateKey}
              className={
                isToday
                  ? publicMode
                    ? "rounded-lg border border-amber-200/35 bg-amber-200/10 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.16)]"
                    : "rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm"
                  : publicMode
                    ? "rounded-lg border border-white/12 bg-white/8 p-4"
                    : "rounded-lg border border-slate-200 bg-white p-4"
              }
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={publicMode ? "rounded-full border border-white/12 bg-white/8 px-2.5 py-1 text-xs font-semibold text-slate-200" : "rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600"}>
                      День {index + 1}
                    </span>
                    {isToday ? (
                      <span className={publicMode ? "rounded-full border border-amber-200/30 bg-amber-200/12 px-2.5 py-1 text-xs font-semibold text-amber-50" : "rounded-full border border-amber-200 bg-white px-2.5 py-1 text-xs font-semibold text-amber-800"}>
                        Сегодня
                      </span>
                    ) : null}
                  </div>
                  <p className={publicMode ? "mt-2 text-base font-semibold text-white" : "mt-2 text-base font-semibold text-slate-950"}>{day.date}</p>
                  <p className={publicMode ? "mt-1 text-xs text-slate-400" : "mt-1 text-xs text-slate-500"}>{day.weekday}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <span className={publicMode ? "rounded-full border border-amber-200/25 bg-amber-200/10 px-3 py-1 text-xs font-semibold text-amber-50" : "rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-800"}>{day.status}</span>
                  <span className={publicMode ? "rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-xs font-semibold text-cyan-50" : "rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800"}>{day.energy}</span>
                </div>
              </div>
              <div className="mt-4 grid gap-3">
                <InfoRow publicMode={publicMode} label="Тема" text={day.theme} />
                <InfoRow publicMode={publicMode} label="Действие" text={day.action} />
                <div className="grid gap-2 sm:grid-cols-2">
                  <InfoRow publicMode={publicMode} label="Риск" text={day.risk} />
                  <InfoRow publicMode={publicMode} label="Совет" text={day.advice} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </FeatureCard>
  );
}

function ReconciliationDayCard({
  publicMode,
  reconciliation,
  lastPairAction,
  onPairRequiredAction,
}: {
  publicMode: boolean;
  reconciliation: ReconciliationDay | null;
  lastPairAction?: ZodiacRetentionItem | null;
  onPairRequiredAction: (action: "create_pair" | "select_here" | "use_last_pair") => void;
}) {
  if (!reconciliation) return <PairRequiredCard publicMode={publicMode} title="🕊 День для примирения" lastPairAction={lastPairAction} onPairRequiredAction={onPairRequiredAction} />;

  return (
    <FeatureCard publicMode={publicMode} title="🕊 День для примирения" subtitle={reconciliation.status}>
      <div className="grid gap-3">
        <InfoRow publicMode={publicMode} label="Как подойти" text={reconciliation.approach} />
        <InfoRow publicMode={publicMode} label="Чего избегать" text={reconciliation.avoid} />
        <EnergyCard publicMode={publicMode} energy={reconciliation.energy} />
      </div>
    </FeatureCard>
  );
}

function PartnerMessageCard({
  publicMode,
  message,
  messageTemplates,
  tone,
  onToneChange,
  onUsed,
  onCopy,
  onSave,
  onShare,
  pairReady,
  lastPairAction,
  onPairRequiredAction,
}: {
  publicMode: boolean;
  message: string | null;
  messageTemplates: CoupleMessageTemplate[];
  tone: MessageTone;
  onToneChange: (tone: MessageTone) => void;
  onUsed: () => void;
  onCopy: (templateId: string) => void;
  onSave: () => void;
  onShare: () => void;
  pairReady: boolean;
  lastPairAction?: ZodiacRetentionItem | null;
  onPairRequiredAction: (action: "create_pair" | "select_here" | "use_last_pair") => void;
}) {
  const [copiedTemplateId, setCopiedTemplateId] = useState<string | null>(null);

  if (!pairReady) return <PairRequiredCard publicMode={publicMode} title="💌 Что написать партнёру" lastPairAction={lastPairAction} onPairRequiredAction={onPairRequiredAction} />;

  async function copyMessage(template: CoupleMessageTemplate) {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) await navigator.clipboard.writeText(template.text);
    } catch {
      // Clipboard access is optional in WebView/browser smoke; copy failure must not break the helper.
    }
    onCopy(template.id);
    setCopiedTemplateId(template.id);
  }

  return (
    <FeatureCard publicMode={publicMode} title="💌 Что написать" subtitle="3 уважительных варианта под выбранный тип отношений">
      <div className="grid gap-3">
        {messageTemplates.map((template) => (
          <div key={template.id} className={publicMode ? "rounded-lg border border-white/12 bg-white/8 p-4" : "rounded-lg border border-slate-200 bg-white p-4"}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className={publicMode ? "text-sm font-semibold text-amber-100" : "text-sm font-semibold text-violet-800"}>{template.label}</p>
                <p className={publicMode ? "mt-2 break-words text-sm leading-6 text-slate-100 [overflow-wrap:anywhere]" : "mt-2 break-words text-sm leading-6 text-slate-700 [overflow-wrap:anywhere]"}>{template.text}</p>
              </div>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <button type="button" onClick={() => copyMessage(template)} className={secondaryTinyButtonClass(publicMode)} aria-live="polite">
                {copiedTemplateId === template.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copiedTemplateId === template.id ? "Скопировано" : "Скопировать"}
              </button>
              <button type="button" onClick={onSave} className={secondaryTinyButtonClass(publicMode)}>
                <Bookmark className="h-4 w-4" />
                Сохранить
              </button>
              <button type="button" onClick={onShare} className={secondaryTinyButtonClass(publicMode)}>
                <Share2 className="h-4 w-4" />
                Поделиться
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className={publicMode ? "mt-4 text-xs font-semibold text-slate-400" : "mt-4 text-xs font-semibold text-slate-500"}>Дополнительный тон</p>
      <div className="grid grid-cols-2 gap-2">
        {messageTones.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              onToneChange(item.id);
              onUsed();
            }}
            className={
              publicMode
                ? `rounded-lg border px-3 py-2 text-left text-xs font-semibold transition ${tone === item.id ? "border-rose-200/70 bg-rose-200/15 text-rose-50" : "border-white/10 bg-white/6 text-slate-300"}`
                : `rounded-lg border px-3 py-2 text-left text-xs font-semibold transition ${tone === item.id ? "border-rose-300 bg-rose-50 text-rose-900" : "border-slate-200 bg-white text-slate-700"}`
            }
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className={publicMode ? "mt-3 rounded-lg border border-white/12 bg-white/8 p-3 text-sm leading-6 text-slate-100" : "mt-3 rounded-lg border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-700"}>
        {message}
      </div>
    </FeatureCard>
  );
}

function CompatibilityToolCard({ publicMode }: { publicMode: boolean }) {
  return (
    <FeatureCard publicMode={publicMode} title="💞 Совместимость знаков" subtitle="основной расчёт открыт в верхней части раздела Любовь">
      <div className={publicMode ? "rounded-lg border border-emerald-200/20 bg-emerald-200/10 p-3 text-sm leading-6 text-emerald-50" : "rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-900"}>
        Выберите два знака в калькуляторе выше. Имена, даты, время и города не сохраняются.
      </div>
    </FeatureCard>
  );
}

function NumerologyCard({
  publicMode,
  person,
  profile,
  onPersonChange,
  vipFreeAccess,
}: {
  publicMode: boolean;
  person: PersonState;
  profile: NumerologyProfile;
  onPersonChange: (value: PersonState) => void;
  vipFreeAccess: boolean;
}) {
  const parsedDate = parseBirthDate(person.birthDate);
  const dateError = person.birthDate && !parsedDate.ok ? parsedDate.error : "";

  return (
    <FeatureCard publicMode={publicMode} title="🔢 Нумерология" subtitle="числа имени, даты и текущего месяца без сохранения данных">
      <div className="grid gap-4">
        <div className={publicMode ? "grid gap-3 rounded-lg border border-white/12 bg-white/8 p-3" : "grid gap-3 rounded-lg border border-slate-200 bg-white p-3"}>
          <Field label="Имя (необязательно)" publicMode={publicMode}>
            <input value={person.name} onChange={(event) => onPersonChange({ ...person, name: sanitizeNameInput(event.target.value) })} placeholder="можно оставить пустым" autoComplete="off" autoCorrect="off" spellCheck={false} className="h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-base text-slate-900" />
          </Field>
          <Field label="Дата рождения (необязательно)" publicMode={publicMode}>
            <input value={person.birthDate} onChange={(event) => updateBirthDate(person, event.target.value, onPersonChange)} placeholder="дд.мм.гггг" inputMode="numeric" autoComplete="off" className={`h-12 w-full rounded-lg border bg-white px-3 text-base text-slate-900 ${dateError ? "border-rose-300" : "border-slate-200"}`} />
            {dateError ? <p className="mt-2 text-xs font-semibold text-rose-600">{dateError}</p> : null}
          </Field>
          <p className={publicMode ? "text-xs font-semibold text-emerald-100" : "text-xs font-semibold text-emerald-800"}>имя и дата остаются только на экране</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <InfoRow publicMode={publicMode} label="Число пути" text={profile.lifePath ? String(profile.lifePath) : "добавьте дату рождения"} />
          <InfoRow publicMode={publicMode} label="Число имени" text={profile.nameNumber ? String(profile.nameNumber) : "добавьте имя"} />
          <InfoRow publicMode={publicMode} label="Число дня" text={String(profile.dayNumber)} />
          <InfoRow publicMode={publicMode} label="Личный месяц" text={profile.personalMonth ? String(profile.personalMonth) : "появится с датой рождения"} />
        </div>
        <InfoRow publicMode={publicMode} label="Портрет" text={profile.summary} />
        <InfoRow publicMode={publicMode} label="Сильные стороны" text={profile.strengths} />
        <InfoRow publicMode={publicMode} label="Зоны риска" text={profile.risks} />
        <InfoRow publicMode={publicMode} label="Совет" text={profile.advice} />
        {vipFreeAccess ? <VipInlineNote publicMode={publicMode} /> : null}
      </div>
    </FeatureCard>
  );
}

function AngelNumbersCard({
  publicMode,
  value,
  profile,
  selectedPresetKey,
  onChange,
  onPresetSelect,
}: {
  publicMode: boolean;
  value: string;
  profile: AngelNumberProfile;
  selectedPresetKey?: string;
  onChange: (value: string) => void;
  onPresetSelect: (value: string) => void;
}) {
  return (
    <FeatureCard publicMode={publicMode} title="👼 Ангельские числа" subtitle="Значение зеркальных и повторяющихся комбинаций времени">
      <div className="grid gap-4">
        <div className={publicMode ? "rounded-lg border border-amber-200/20 bg-amber-200/10 p-3" : "rounded-lg border border-amber-200 bg-amber-50 p-3"}>
          <p className={publicMode ? "text-sm font-semibold text-amber-50" : "text-sm font-semibold text-amber-950"}>👑 Расширенное толкование открыто бесплатно до {formatVipFreeAccessDate(zodiacVipConfig.vipFreeAccessUntil)}</p>
          <p className={publicMode ? "mt-1 text-xs leading-5 text-amber-100" : "mt-1 text-xs leading-5 text-amber-900"}>Без оплаты: любовь, дела, личное действие, талисман и связь с числами доступны в раннем доступе.</p>
        </div>
        <div className="grid gap-3">
          {angelNumberPresetGroups.map((group) => (
            <div key={group.id} className={publicMode ? "rounded-lg border border-white/10 bg-white/7 p-3" : "rounded-lg border border-slate-200 bg-slate-50 p-3"}>
              <p className={publicMode ? "text-xs font-semibold uppercase tracking-wide text-slate-300" : "text-xs font-semibold uppercase tracking-wide text-slate-500"}>{group.title}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {group.items.map((preset) => {
                  const safePresetKey = angelSafeKey(preset);
                  const active = selectedPresetKey === safePresetKey || (!selectedPresetKey && preset === profile.label);
                  return (
                    <button key={`${group.id}-${preset}`} type="button" onClick={() => onPresetSelect(preset)} className={active ? primaryTinyButtonClass(publicMode) : secondaryTinyButtonClass(publicMode)}>
                      {preset}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <Field label="Своя комбинация времени" publicMode={publicMode}>
          <input value={value} onChange={(event) => onChange(event.target.value)} placeholder="10:10" inputMode="numeric" autoComplete="off" className="h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-base text-slate-900" />
          <p className={publicMode ? "mt-2 text-xs font-semibold text-emerald-100" : "mt-2 text-xs font-semibold text-emerald-800"}>можно ввести 1010, 10-10, 10 10, 10:10, 222 или 1111; своя комбинация и имя не отправляются в аналитику</p>
        </Field>
        {!profile.isValid ? (
          <div className={publicMode ? "rounded-lg border border-rose-200/30 bg-rose-200/10 p-3 text-sm font-semibold text-rose-50" : "rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800"}>
            {profile.prompt}
          </div>
        ) : (
          <div className="grid gap-3">
            <div className={publicMode ? "rounded-lg border border-white/12 bg-white/8 p-3" : "rounded-lg border border-slate-200 bg-white p-3"}>
              <p className={publicMode ? "text-xs font-semibold uppercase tracking-wide text-slate-300" : "text-xs font-semibold uppercase tracking-wide text-slate-500"}>{formatAngelPatternLabel(profile.patternType)}</p>
              <p className={publicMode ? "mt-1 text-3xl font-semibold text-white" : "mt-1 text-3xl font-semibold text-slate-950"}>{profile.label}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <InfoRow publicMode={publicMode} label="🔢 Главное значение" text={profile.meaning} />
              <InfoRow publicMode={publicMode} label="👁 Что это может подсвечивать" text={profile.highlights} />
              <InfoRow publicMode={publicMode} label="❤️ В любви" text={profile.love} />
              <InfoRow publicMode={publicMode} label="💼 В деньгах и делах" text={profile.workMoney} />
              <InfoRow publicMode={publicMode} label="🌙 Интуитивный сигнал" text={profile.intuition} />
              <InfoRow publicMode={publicMode} label="✅ Что стоит сделать" text={profile.actions.join(" · ")} />
              <InfoRow publicMode={publicMode} label="⚠️ Чего избегать" text={profile.avoid.join(" · ")} />
              <InfoRow publicMode={publicMode} label="🧘 Фраза настройки" text={profile.phrase} />
              <InfoRow publicMode={publicMode} label="🧭 Совет на ближайшие 24 часа" text={profile.next24Hours} />
            </div>
            {profile.vipBlocks.length ? (
              <div className={publicMode ? "rounded-lg border border-amber-200/20 bg-white/8 p-3" : "rounded-lg border border-amber-200 bg-amber-50 p-3"}>
                <p className={publicMode ? "text-sm font-semibold text-amber-50" : "text-sm font-semibold text-amber-950"}>VIP-детали раннего доступа</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {profile.vipBlocks.map((block) => (
                    <InfoRow key={block.title} publicMode={publicMode} label={block.title} text={block.text} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </FeatureCard>
  );
}

function LunarCalendarCard({ publicMode, profile }: { publicMode: boolean; profile: LunarCalendarProfile | null }) {
  if (!profile) return <EmptyFeatureCard publicMode={publicMode} title="🌙 Лунный календарь" text="Выберите знак, чтобы открыть мягкий ритм дня." />;
  return (
    <FeatureCard publicMode={publicMode} title="🌙 Лунный календарь" subtitle={profile.title}>
      <div className="grid gap-2 sm:grid-cols-2">
        <InfoRow publicMode={publicMode} label="Ритм дня" text={profile.rhythm} />
        <InfoRow publicMode={publicMode} label="Любовь" text={profile.love} />
        <InfoRow publicMode={publicMode} label="Дела и деньги" text={profile.workMoney} />
        <InfoRow publicMode={publicMode} label="Разговоры" text={profile.talks} />
        <InfoRow publicMode={publicMode} label="Примирение" text={profile.reconciliation} />
        <InfoRow publicMode={publicMode} label="Сделать" text={profile.action} />
        <InfoRow publicMode={publicMode} label="Избегать" text={profile.avoid} />
      </div>
      <p className={publicMode ? "mt-3 rounded-lg border border-white/12 bg-white/8 p-3 text-xs leading-5 text-slate-300" : "mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-600"}>Это календарная интерпретация настроения дня, а не точные астрономические данные.</p>
    </FeatureCard>
  );
}

function DailyTalismanCard({ publicMode, profile }: { publicMode: boolean; profile: DailyTalismanProfile | null }) {
  if (!profile) return <EmptyFeatureCard publicMode={publicMode} title="🧿 Талисман дня" text="Выберите знак, чтобы увидеть камень, цвет и фразу дня." />;
  return (
    <FeatureCard publicMode={publicMode} title="🧿 Талисман дня" subtitle="символическая подсказка для настроя">
      <div className="grid gap-2 sm:grid-cols-2">
        <InfoRow publicMode={publicMode} label="Камень" text={profile.stone} />
        <InfoRow publicMode={publicMode} label="Цвет" text={profile.color} />
        <InfoRow publicMode={publicMode} label="Число" text={String(profile.number)} />
        <InfoRow publicMode={publicMode} label="Фраза" text={profile.phrase} />
        <InfoRow publicMode={publicMode} label="Действие" text={profile.action} />
        <InfoRow publicMode={publicMode} label="Избегать" text={profile.avoid} />
      </div>
    </FeatureCard>
  );
}

function DreamDictionaryCard({
  publicMode,
  symbolKey,
  dreamText,
  profile,
  onSymbolChange,
  onDreamTextChange,
}: {
  publicMode: boolean;
  symbolKey: string;
  dreamText: string;
  profile: DreamProfile;
  onSymbolChange: (value: string) => void;
  onDreamTextChange: (value: string) => void;
}) {
  const dreamSymbolOptions: ZodiacSelectOption[] = dreamSymbols.map((symbol) => ({
    value: symbol.key,
    label: symbol.label,
  }));

  return (
    <FeatureCard publicMode={publicMode} title="🌙 Сонник" subtitle="бережная расшифровка популярных символов без страшных предсказаний">
      <div className="grid gap-4">
        <ZodiacSelect publicMode={publicMode} label="Символ сна" value={symbolKey} options={dreamSymbolOptions} onChange={onSymbolChange} />
        <Field label="Свой фрагмент сна (необязательно)" publicMode={publicMode}>
          <textarea value={dreamText} onChange={(event) => onDreamTextChange(event.target.value.slice(0, 160))} placeholder="можно оставить пустым" autoComplete="off" className="min-h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-base text-slate-900" />
          <p className={publicMode ? "mt-2 text-xs font-semibold text-emerald-100" : "mt-2 text-xs font-semibold text-emerald-800"}>текст сна не сохраняется и не отправляется в аналитику</p>
        </Field>
        <div className="grid gap-2 sm:grid-cols-2">
          <InfoRow publicMode={publicMode} label={profile.symbol} text={profile.general} />
          <InfoRow publicMode={publicMode} label="Эмоциональный смысл" text={profile.emotional} />
          <InfoRow publicMode={publicMode} label="Что подсвечивает" text={profile.highlight} />
          <InfoRow publicMode={publicMode} label="Совет" text={profile.advice} />
          <InfoRow publicMode={publicMode} label="Связь со знаком" text={profile.signConnection} />
        </div>
      </div>
    </FeatureCard>
  );
}

function GiftBySignCard({ publicMode, recipientType, profile, onRecipientTypeChange }: { publicMode: boolean; recipientType: GiftRecipientType; profile: GiftBySignProfile | null; onRecipientTypeChange: (value: GiftRecipientType) => void }) {
  if (!profile) return <EmptyFeatureCard publicMode={publicMode} title="🎁 Подарок по знаку" text="Выберите знак, чтобы увидеть идеи подарков." />;
  return (
    <FeatureCard publicMode={publicMode} title="🎁 Подарок по знаку" subtitle={`${profile.sign.emoji} ${profile.sign.name} · ${profile.recipientLabel}`}>
      <div className="grid gap-4">
        <div className="flex flex-wrap gap-2">
          {giftRecipientOptions.map((option) => (
            <button key={option.id} type="button" onClick={() => onRecipientTypeChange(option.id)} className={recipientType === option.id ? primaryTinyButtonClass(publicMode) : secondaryTinyButtonClass(publicMode)}>
              {option.label}
            </button>
          ))}
        </div>
        <ul className="grid gap-2">
          {profile.ideas.map((idea) => (
            <li key={idea} className={publicMode ? "rounded-lg border border-white/12 bg-white/8 px-3 py-2 text-sm leading-5 text-slate-200" : "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-5 text-slate-700"}>{idea}</li>
          ))}
        </ul>
        <div className="grid gap-2 sm:grid-cols-2">
          <InfoRow publicMode={publicMode} label="Ценит" text={profile.appreciates} />
          <InfoRow publicMode={publicMode} label="Не лучший вариант" text={profile.avoid} />
          <InfoRow publicMode={publicMode} label="Символический подарок" text={profile.symbolic} />
          <InfoRow publicMode={publicMode} label="Премиум-идея" text={profile.premium} />
        </div>
      </div>
    </FeatureCard>
  );
}

function NameCompatibilityCard({
  publicMode,
  firstName,
  secondName,
  profile,
  onFirstNameChange,
  onSecondNameChange,
  vipFreeAccess,
}: {
  publicMode: boolean;
  firstName: string;
  secondName: string;
  profile: NameCompatibilityProfile | null;
  onFirstNameChange: (value: string) => void;
  onSecondNameChange: (value: string) => void;
  vipFreeAccess: boolean;
}) {
  return (
    <FeatureCard publicMode={publicMode} title="🔤 Совместимость имён" subtitle="эмоциональный резонанс пары без сохранения имён">
      <div className="grid gap-4">
        <div className={publicMode ? "grid gap-3 rounded-lg border border-white/12 bg-white/8 p-3" : "grid gap-3 rounded-lg border border-slate-200 bg-white p-3 sm:grid-cols-2"}>
          <Field label="Первое имя" publicMode={publicMode}>
            <input value={firstName} onChange={(event) => onFirstNameChange(sanitizeNameInput(event.target.value))} placeholder="Имя" autoComplete="off" autoCorrect="off" spellCheck={false} className="h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-base text-slate-900" />
          </Field>
          <Field label="Второе имя" publicMode={publicMode}>
            <input value={secondName} onChange={(event) => onSecondNameChange(sanitizeNameInput(event.target.value))} placeholder="Имя" autoComplete="off" autoCorrect="off" spellCheck={false} className="h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-base text-slate-900" />
          </Field>
        </div>
        {!profile ? (
          <EmptyFeatureCard publicMode={publicMode} title="Добавьте два имени" text="Результат появится здесь. Имена не сохраняются и не отправляются в аналитику." />
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            <InfoRow publicMode={publicMode} label={profile.title} text={profile.emotional} />
            <InfoRow publicMode={publicMode} label="Общение" text={profile.communication} />
            <InfoRow publicMode={publicMode} label="Притяжение" text={profile.attraction} />
            <InfoRow publicMode={publicMode} label="Риск конфликта" text={profile.conflictRisk} />
            <InfoRow publicMode={publicMode} label="Примирение" text={profile.reconciliation} />
            <InfoRow publicMode={publicMode} label="Что поможет" text={profile.helps} />
            <InfoRow publicMode={publicMode} label="Чего избегать" text={profile.avoid} />
          </div>
        )}
        {vipFreeAccess ? <VipInlineNote publicMode={publicMode} /> : null}
      </div>
    </FeatureCard>
  );
}

function PersonalityArchetypeCard({ publicMode, person, profile, onPersonChange, vipFreeAccess }: { publicMode: boolean; person: PersonState; profile: PersonalityArchetypeProfile; onPersonChange: (value: PersonState) => void; vipFreeAccess: boolean }) {
  const parsedDate = parseBirthDate(person.birthDate);
  const dateError = person.birthDate && !parsedDate.ok ? parsedDate.error : "";
  return (
    <FeatureCard publicMode={publicMode} title="✨ Архетип личности" subtitle="сборный портрет по знаку, дате, имени и символам">
      <div className="grid gap-4">
        <div className={publicMode ? "grid gap-3 rounded-lg border border-white/12 bg-white/8 p-3" : "grid gap-3 rounded-lg border border-slate-200 bg-white p-3"}>
          <Field label="Имя (необязательно)" publicMode={publicMode}>
            <input value={person.name} onChange={(event) => onPersonChange({ ...person, name: sanitizeNameInput(event.target.value) })} placeholder="можно оставить пустым" autoComplete="off" autoCorrect="off" spellCheck={false} className="h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-base text-slate-900" />
          </Field>
          <Field label="Дата рождения (необязательно)" publicMode={publicMode}>
            <input value={person.birthDate} onChange={(event) => updateBirthDate(person, event.target.value, onPersonChange)} placeholder="дд.мм.гггг" inputMode="numeric" autoComplete="off" className={`h-12 w-full rounded-lg border bg-white px-3 text-base text-slate-900 ${dateError ? "border-rose-300" : "border-slate-200"}`} />
            {dateError ? <p className="mt-2 text-xs font-semibold text-rose-600">{dateError}</p> : null}
          </Field>
        </div>
        <div className={publicMode ? "rounded-lg border border-amber-200/25 bg-amber-200/10 p-4" : "rounded-lg border border-amber-200 bg-amber-50 p-4"}>
          <p className={publicMode ? "text-xl font-semibold text-white" : "text-xl font-semibold text-slate-950"}>{profile.title}</p>
          <p className={publicMode ? "mt-2 text-sm leading-5 text-amber-100" : "mt-2 text-sm leading-5 text-amber-800"}>{profile.completeness}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <InfoRow publicMode={publicMode} label="Главная сила" text={profile.coreStrength} />
          <InfoRow publicMode={publicMode} label="Тень / риск" text={profile.shadowRisk} />
          <InfoRow publicMode={publicMode} label="Отношения" text={profile.relationship} />
          <InfoRow publicMode={publicMode} label="Дела и деньги" text={profile.workMoney} />
          <InfoRow publicMode={publicMode} label="Талисман" text={profile.talisman} />
          <InfoRow publicMode={publicMode} label="Совет месяца" text={profile.monthAdvice} />
        </div>
        {vipFreeAccess ? <VipInlineNote publicMode={publicMode} /> : null}
      </div>
    </FeatureCard>
  );
}

function VipInlineNote({ publicMode }: { publicMode: boolean }) {
  return (
    <p className={publicMode ? "rounded-lg border border-amber-200/25 bg-amber-200/10 p-3 text-sm font-semibold leading-5 text-amber-50" : "rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold leading-5 text-amber-900"}>
      👑 Расширенный разбор открыт бесплатно до 17.09.2026.
    </p>
  );
}

function NatalChartCard({ publicMode, chart }: { publicMode: boolean; chart: NatalChart | null }) {
  if (!chart) return <EmptyFeatureCard publicMode={publicMode} title="🌌 Натальная карта" text="Дата рождения необязательна, но если добавить её в блоке «Вы», появится натальная подсказка." />;

  return (
    <FeatureCard publicMode={publicMode} title="🌌 Натальная карта" subtitle={`${chart.sign.emoji} ${chart.sign.name} · ${chart.element} · ${chart.modality}`}>
      <div className="grid gap-3">
        <InfoRow publicMode={publicMode} label="База" text={chart.archetype} />
        <InfoRow publicMode={publicMode} label="Сильные стороны" text={chart.strengths} />
        <InfoRow publicMode={publicMode} label="Зона роста" text={chart.growth} />
        <InfoRow publicMode={publicMode} label="В любви" text={chart.loveStyle} />
        <InfoRow publicMode={publicMode} label="В общении" text={chart.communicationStyle} />
        <p className={publicMode ? "rounded-lg border border-amber-200/20 bg-amber-200/10 p-3 text-sm leading-5 text-amber-50" : "rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-5 text-amber-900"}>{chart.precisionNote}</p>
      </div>
    </FeatureCard>
  );
}

function NatalChartV1Card({
  publicMode,
  person,
  chart,
  onPersonChange,
  onOpened,
  onResultViewed,
  onSectionOpen,
  onVipFreeOpen,
  onVipBlockOpen,
}: {
  publicMode: boolean;
  person: PersonState;
  chart: NatalChart | null;
  onPersonChange: (value: PersonState) => void;
  onOpened: (person: PersonState, chart: NatalChart | null) => void;
  onResultViewed: (person: PersonState, chart: NatalChart) => void;
  onSectionOpen: (person: PersonState, chart: NatalChart, category: string) => void;
  onVipFreeOpen: (person: PersonState, chart: NatalChart) => void;
  onVipBlockOpen: (blockTitle: string, chart: NatalChart) => void;
}) {
  const [openSectionId, setOpenSectionId] = useState("core");
  const openedTrackedRef = useRef("");
  const resultTrackedRef = useRef("");
  const parsedDate = parseBirthDate(person.birthDate);
  const dateError = person.birthDate && !parsedDate.ok ? parsedDate.error : "";
  const openedTrackKey = `${parsedDate.ok ? "date" : "no-date"}:${person.knowsTime ? "time-known" : "time-unknown"}:${chart?.sign.slug ?? person.sign}`;
  const resultTrackKey = chart ? `${chart.sign.slug}:${chart.hasBirthTime ? "time" : "no-time"}:${chart.hasBirthCity ? "city" : "no-city"}` : "";

  useEffect(() => {
    if (openedTrackedRef.current === openedTrackKey) return;
    openedTrackedRef.current = openedTrackKey;
    onOpened(person, chart);
  }, [chart, onOpened, openedTrackKey, person]);

  useEffect(() => {
    if (!chart || resultTrackedRef.current === resultTrackKey) return;
    resultTrackedRef.current = resultTrackKey;
    onResultViewed(person, chart);
  }, [chart, onResultViewed, person, resultTrackKey]);

  function setTimeKnown(knowsTime: boolean) {
    onPersonChange({
      ...person,
      knowsTime,
      birthTime: knowsTime ? person.birthTime : "",
      cityQuery: knowsTime ? person.cityQuery : "",
      selectedCityId: knowsTime ? person.selectedCityId : "",
    });
  }

  function openNatalSection(sectionId: string) {
    setOpenSectionId((current) => (current === sectionId ? "" : sectionId));
    if (chart) onSectionOpen(person, chart, sectionId);
  }

  return (
    <FeatureCard publicMode={publicMode} title="🔮 Натальная карта" subtitle="Личный астрологический профиль">
      <div className="grid gap-4">
        <div className={publicMode ? "rounded-lg border border-fuchsia-200/20 bg-fuchsia-200/10 p-3" : "rounded-lg border border-violet-100 bg-violet-50 p-3"}>
          <p className={publicMode ? "text-sm leading-6 text-slate-100" : "text-sm leading-6 text-slate-700"}>
            Разбор характера, эмоций, отношений, сильных сторон и зон роста по дате рождения.
          </p>
          <p className={publicMode ? "mt-2 text-xs font-semibold text-emerald-100" : "mt-2 text-xs font-semibold text-emerald-800"}>
            без сохранения данных: имя, дата, время и город остаются только на этом экране
          </p>
        </div>

        <div className={publicMode ? "grid gap-3 rounded-lg border border-white/12 bg-white/8 p-3" : "grid gap-3 rounded-lg border border-slate-200 bg-white p-3"}>
          <Field label="Имя (необязательно)" publicMode={publicMode}>
            <input
              value={person.name}
              onChange={(event) => onPersonChange({ ...person, name: sanitizeNameInput(event.target.value) })}
              placeholder="можно оставить пустым"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className="h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-base text-slate-900"
            />
          </Field>

          <Field label="Дата рождения" publicMode={publicMode}>
            <input
              value={person.birthDate}
              onChange={(event) => updateBirthDate(person, event.target.value, onPersonChange)}
              placeholder="дд.мм.гггг"
              inputMode="numeric"
              autoComplete="off"
              className={`h-12 w-full rounded-lg border bg-white px-3 text-base text-slate-900 ${dateError ? "border-rose-300" : "border-slate-200"}`}
            />
            {dateError ? <p className="mt-2 text-xs font-semibold text-rose-600">{dateError}</p> : null}
          </Field>

          <label className={publicMode ? "flex items-center gap-3 rounded-lg border border-amber-200/20 bg-amber-200/10 p-3 text-sm font-semibold text-amber-50" : "flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900"}>
            <input type="checkbox" checked={!person.knowsTime} onChange={(event) => setTimeKnown(!event.target.checked)} className="h-4 w-4 rounded border-slate-300 text-violet-700" />
            Не знаю время рождения
          </label>

          {person.knowsTime ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Время рождения (необязательно)" publicMode={publicMode}>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck={false}
                  placeholder="чч:мм"
                  value={person.birthTime}
                  onChange={(event) => onPersonChange({ ...person, birthTime: formatTimeInput(event.target.value) })}
                  className="h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-base text-slate-900"
                />
                {person.birthTime && !isValidTime(person.birthTime) ? <p className="mt-2 text-xs font-semibold text-amber-700">Если время неизвестно, оставьте поле пустым или включите режим без времени.</p> : null}
              </Field>
              <NatalCitySelector publicMode={publicMode} value={person} onChange={onPersonChange} />
            </div>
          ) : (
            <p className={publicMode ? "rounded-lg border border-white/10 bg-white/6 p-3 text-sm leading-5 text-slate-300" : "rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm leading-5 text-slate-600"}>
              Расчёт выполнится по дате рождения. Некоторые детали будут мягче и шире, потому что время и место не указаны.
            </p>
          )}
        </div>

        {!chart ? (
          <div className={publicMode ? "rounded-lg border border-white/12 bg-white/8 p-4 text-sm leading-6 text-slate-300" : "rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600"}>
            {dateError ? "Проверьте дату рождения, и профиль появится здесь." : "Введите дату рождения, чтобы открыть личный астрологический профиль. Имя, время и город можно не указывать."}
          </div>
        ) : (
          <div className="grid gap-4">
            <div className={publicMode ? "rounded-lg border border-amber-200/25 bg-amber-200/10 p-4" : "rounded-lg border border-amber-200 bg-amber-50 p-4"}>
              <p className={publicMode ? "text-sm font-semibold text-amber-100" : "text-sm font-semibold text-amber-800"}>{chart.profileLabel}</p>
              <p className={publicMode ? "mt-2 text-xs font-semibold text-slate-300" : "mt-2 text-xs font-semibold text-slate-600"}>{chart.calculationLabel}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {chart.summary.map((item) => (
                  <InfoRow key={item.label} publicMode={publicMode} label={item.label} text={item.value} />
                ))}
              </div>
              <p className={publicMode ? "mt-3 rounded-lg border border-white/12 bg-black/15 p-3 text-sm leading-5 text-slate-200" : "mt-3 rounded-lg border border-amber-100 bg-white p-3 text-sm leading-5 text-slate-700"}>{chart.accuracyNote}</p>
            </div>

            <div className="grid gap-2">
              {chart.sections.map((section) => (
                <NatalInsightSectionCard
                  key={section.id}
                  publicMode={publicMode}
                  section={section}
                  open={openSectionId === section.id}
                  onToggle={() => openNatalSection(section.id)}
                />
              ))}
            </div>

            <NatalCompassCard publicMode={publicMode} compass={chart.compass} />

            <div className={publicMode ? "rounded-lg border border-amber-200/25 bg-gradient-to-br from-amber-200/12 via-fuchsia-300/10 to-cyan-300/10 p-4" : "rounded-lg border border-amber-200 bg-amber-50 p-4"}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={publicMode ? "text-base font-semibold text-white" : "text-base font-semibold text-slate-950"}>👑 VIP-разбор открыт бесплатно до {formatVipFreeAccessDate(zodiacVipConfig.vipFreeAccessUntil)}</p>
                  <p className={publicMode ? "mt-1 text-sm leading-5 text-slate-300" : "mt-1 text-sm leading-5 text-slate-700"}>Ранний доступ открыт без оплаты. Позже часть расширенных функций может перейти в подписку.</p>
                </div>
                <Crown className={publicMode ? "h-5 w-5 shrink-0 text-amber-100" : "h-5 w-5 shrink-0 text-amber-700"} />
              </div>
              <button type="button" onClick={() => onVipFreeOpen(person, chart)} className={publicMode ? "mt-3 rounded-lg border border-amber-200/30 bg-amber-200/10 px-3 py-2 text-sm font-semibold text-amber-50" : "mt-3 rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm font-semibold text-amber-900"}>
                Смотреть бесплатные расширения
              </button>
              <div className="mt-3 grid gap-2">
                {chart.vipBlocks.map((block) => (
                  <button
                    key={block.title}
                    type="button"
                    onClick={() => onVipBlockOpen(block.title, chart)}
                    className={publicMode ? "rounded-lg border border-white/12 bg-white/8 p-3 text-left transition hover:border-amber-200/35 hover:bg-white/12" : "rounded-lg border border-amber-100 bg-white p-3 text-left transition hover:border-amber-300"}
                  >
                    <span className={publicMode ? "block text-sm font-semibold text-amber-100" : "block text-sm font-semibold text-amber-800"}>{block.title}</span>
                    <span className={publicMode ? "mt-1 block text-sm leading-5 text-slate-300" : "mt-1 block text-sm leading-5 text-slate-700"}>{block.text}</span>
                    <span className={publicMode ? "mt-2 block text-xs font-semibold text-amber-100" : "mt-2 block text-xs font-semibold text-amber-800"}>Открыть VIP-инструмент</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </FeatureCard>
  );
}

function NatalCitySelector({ publicMode, value, onChange }: { publicMode: boolean; value: PersonState; onChange: (value: PersonState) => void }) {
  const selectedCity = getCityById(value.selectedCityId);
  const suggestions = value.cityQuery.trim() && !selectedCity ? searchCities(value.cityQuery).slice(0, 5) : [];

  return (
    <div>
      <Field label="Город рождения (необязательно)" publicMode={publicMode}>
        <input
          value={value.cityQuery}
          onChange={(event) => onChange({ ...value, cityQuery: event.target.value, selectedCityId: "" })}
          placeholder="Киев или Kyiv"
          autoComplete="off"
          className="h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-base text-slate-900"
        />
      </Field>

      {suggestions.length > 0 ? (
        <div className="mt-2 max-h-44 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          {suggestions.map((city) => (
            <button
              key={city.cityId}
              type="button"
              onClick={() => onChange({ ...value, selectedCityId: city.cityId, cityQuery: cityLabel(city) })}
              className="flex w-full items-start gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-cyan-50"
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan-700" />
              <span>
                <span className="block font-semibold text-slate-950">{city.nameRu}, {city.countryRu}</span>
                <span className="block text-xs text-slate-500">{city.nameEn} · {city.timezone}</span>
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {selectedCity ? (
        <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900">
          {cityLabel(selectedCity)} · {selectedCity.timezone}
        </div>
      ) : null}
    </div>
  );
}

function NatalInsightSectionCard({ publicMode, section, open, onToggle }: { publicMode: boolean; section: NatalInsightSection; open: boolean; onToggle: () => void }) {
  return (
    <div className={publicMode ? "rounded-lg border border-white/12 bg-white/8" : "rounded-lg border border-slate-200 bg-white"}>
      <button type="button" onClick={onToggle} aria-expanded={open} className={publicMode ? "flex w-full items-center justify-between gap-3 px-3 py-3 text-left text-sm font-semibold text-white" : "flex w-full items-center justify-between gap-3 px-3 py-3 text-left text-sm font-semibold text-slate-950"}>
        <span>{section.title}</span>
        <span className={publicMode ? "text-xs text-slate-300" : "text-xs text-slate-500"}>{open ? "Свернуть" : "Открыть"}</span>
      </button>
      {open ? (
        <div className="grid gap-2 px-3 pb-3">
          {section.items.map((item) => (
            <InfoRow key={item.label} publicMode={publicMode} label={item.label} text={item.text} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function NatalCompassCard({ publicMode, compass }: { publicMode: boolean; compass: NatalCompass }) {
  return (
    <div className={publicMode ? "rounded-lg border border-cyan-200/20 bg-cyan-200/10 p-4" : "rounded-lg border border-cyan-100 bg-cyan-50 p-4"}>
      <p className={publicMode ? "text-base font-semibold text-white" : "text-base font-semibold text-slate-950"}>🧭 Личный компас</p>
      <div className="mt-3 grid gap-3">
        <NatalCompassList publicMode={publicMode} title="3 сильные стороны" items={compass.strengths} />
        <NatalCompassList publicMode={publicMode} title="3 зоны риска" items={compass.risks} />
        <NatalCompassList publicMode={publicMode} title="3 действия на ближайший месяц" items={compass.actions} />
      </div>
    </div>
  );
}

function NatalCompassList({ publicMode, title, items }: { publicMode: boolean; title: string; items: string[] }) {
  return (
    <div>
      <p className={publicMode ? "text-xs font-semibold uppercase tracking-[0.08em] text-cyan-100" : "text-xs font-semibold uppercase tracking-[0.08em] text-cyan-800"}>{title}</p>
      <ul className="mt-2 grid gap-2">
        {items.map((item) => (
          <li key={item} className={publicMode ? "rounded-lg border border-white/10 bg-white/7 px-3 py-2 text-sm leading-5 text-slate-200" : "rounded-lg border border-cyan-100 bg-white px-3 py-2 text-sm leading-5 text-slate-700"}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function ChineseHoroscopeCard({
  publicMode,
  person,
  horoscope,
  onPersonChange,
}: {
  publicMode: boolean;
  person: PersonState;
  horoscope: ChineseHoroscope | null;
  onPersonChange: (value: PersonState) => void;
}) {
  const parsedDate = parseBirthDate(person.birthDate);
  const dateError = person.birthDate && !parsedDate.ok ? parsedDate.error : "";

  return (
    <FeatureCard publicMode={publicMode} title="🐉 Китайский гороскоп" subtitle="Животное года, стихия, характер и совместимость по восточной традиции">
      <div className="grid gap-4">
        <div className={publicMode ? "rounded-lg border border-fuchsia-200/20 bg-fuchsia-200/10 p-3" : "rounded-lg border border-violet-100 bg-violet-50 p-3"}>
          <p className={publicMode ? "text-sm leading-6 text-slate-100" : "text-sm leading-6 text-slate-700"}>
            Введите дату рождения, чтобы увидеть восточный знак, стихию и мягкие подсказки для отношений, работы и месяца.
          </p>
          <p className={publicMode ? "mt-2 text-xs font-semibold text-emerald-100" : "mt-2 text-xs font-semibold text-emerald-800"}>
            без сохранения данных: дата остаётся только на этом экране
          </p>
        </div>

        <Field label="Дата рождения" publicMode={publicMode}>
          <input
            value={person.birthDate}
            onChange={(event) => updateBirthDate(person, event.target.value, onPersonChange)}
            placeholder="дд.мм.гггг"
            inputMode="numeric"
            autoComplete="off"
            className={`h-12 w-full rounded-lg border bg-white px-3 text-base text-slate-900 ${dateError ? "border-rose-300" : "border-slate-200"}`}
          />
          {dateError ? <p className="mt-2 text-xs font-semibold text-rose-600">{dateError}</p> : null}
        </Field>

        {!horoscope ? (
          <div className={publicMode ? "rounded-lg border border-white/12 bg-white/8 p-4 text-sm leading-6 text-slate-300" : "rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600"}>
            Введите дату рождения, чтобы определить знак китайского гороскопа.
          </div>
        ) : (
          <div className="grid gap-3">
            <div className={publicMode ? "rounded-lg border border-amber-200/25 bg-amber-200/10 p-4" : "rounded-lg border border-amber-200 bg-amber-50 p-4"}>
              <p className={publicMode ? "text-sm font-semibold text-amber-100" : "text-sm font-semibold text-amber-800"}>{horoscope.profileLabel}</p>
              <p className={publicMode ? "mt-2 text-xl font-semibold text-white" : "mt-2 text-xl font-semibold text-slate-950"}>
                {horoscope.emoji} {horoscope.animal} · {horoscope.element} · {horoscope.yinYang}
              </p>
              <p className={publicMode ? "mt-2 text-sm leading-6 text-slate-300" : "mt-2 text-sm leading-6 text-slate-700"}>{horoscope.summary}</p>
              <p className={publicMode ? "mt-3 rounded-lg border border-white/12 bg-black/15 p-3 text-xs leading-5 text-amber-50" : "mt-3 rounded-lg border border-amber-100 bg-white p-3 text-xs leading-5 text-amber-900"}>
                {horoscope.boundaryNote}
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <InfoRow publicMode={publicMode} label="💪 Сильные стороны" text={horoscope.strengths} />
              <InfoRow publicMode={publicMode} label="⚠️ Зоны риска" text={horoscope.risks} />
              <InfoRow publicMode={publicMode} label="❤️ В отношениях" text={horoscope.relationshipStyle} />
              <InfoRow publicMode={publicMode} label="💼 Работа и деньги" text={horoscope.workMoneyStyle} />
              <InfoRow publicMode={publicMode} label="🗓 Совет месяца" text={horoscope.monthAdvice} />
              <InfoRow publicMode={publicMode} label="🤝 Совместимость" text={horoscope.compatibilityHints.join(" · ")} />
            </div>
          </div>
        )}
      </div>
    </FeatureCard>
  );
}

function ZodiacStonesCard({ publicMode, profile }: { publicMode: boolean; profile: ZodiacStoneProfile | null }) {
  if (!profile) {
    return (
      <EmptyFeatureCard
        publicMode={publicMode}
        title="💎 Камни знака"
        text="Выберите знак зодиака, чтобы увидеть камни, талисманы и мягкие подсказки для личного настроя."
      />
    );
  }

  return (
    <FeatureCard publicMode={publicMode} title="💎 Камни знака" subtitle="Талисманы, энергия и смысл камней для каждого знака">
      <div className="grid gap-4">
        <div className={publicMode ? "rounded-lg border border-cyan-200/20 bg-cyan-200/10 p-4" : "rounded-lg border border-cyan-100 bg-cyan-50 p-4"}>
          <p className={publicMode ? "text-sm font-semibold text-cyan-100" : "text-sm font-semibold text-cyan-800"}>{profile.sign.emoji} {profile.sign.name}</p>
          <p className={publicMode ? "mt-2 text-xl font-semibold text-white" : "mt-2 text-xl font-semibold text-slate-950"}>{profile.mainStone}</p>
          <p className={publicMode ? "mt-2 text-sm leading-6 text-slate-300" : "mt-2 text-sm leading-6 text-slate-700"}>{profile.symbol}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {profile.additionalStones.map((stone) => (
              <span key={stone} className={publicMode ? "rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs font-semibold text-slate-200" : "rounded-full border border-cyan-100 bg-white px-3 py-1 text-xs font-semibold text-slate-700"}>
                {stone}
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <InfoRow publicMode={publicMode} label="❤️ Для отношений" text={profile.loveStone} />
          <InfoRow publicMode={publicMode} label="🛡 Для спокойствия" text={profile.calmStone} />
          <InfoRow publicMode={publicMode} label="💼 Для фокуса в делах" text={profile.workStone} />
          <InfoRow publicMode={publicMode} label="✨ Когда носить" text={profile.whenToUse} />
        </div>
        <InfoRow publicMode={publicMode} label="⚠️ Чего избегать" text={profile.avoid} />
        <p className={publicMode ? "rounded-lg border border-emerald-200/20 bg-emerald-200/10 p-3 text-sm leading-5 text-emerald-50" : "rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm leading-5 text-emerald-900"}>
          Раздел носит развлекательный и символический характер. Камни могут использоваться как личный талисман, но не заменяют решения, заботу о здоровье или финансовую внимательность.
        </p>
      </div>
    </FeatureCard>
  );
}

function NameProfileCard({
  publicMode,
  person,
  profile,
  onPersonChange,
  vipFreeAccess,
}: {
  publicMode: boolean;
  person: PersonState;
  profile: NameProfile | null;
  onPersonChange: (value: PersonState) => void;
  vipFreeAccess: boolean;
}) {
  const [openSectionId, setOpenSectionId] = useState("meaning");
  const parsedDate = parseBirthDate(person.birthDate);
  const dateError = person.birthDate && !parsedDate.ok ? parsedDate.error : "";

  return (
    <FeatureCard publicMode={publicMode} title="🔤 Именной профиль" subtitle="Сильные стороны, характер и личный резонанс имени">
      <div className="grid gap-4">
        <div className={publicMode ? "rounded-lg border border-fuchsia-200/20 bg-fuchsia-200/10 p-3" : "rounded-lg border border-violet-100 bg-violet-50 p-3"}>
          <p className={publicMode ? "text-sm leading-6 text-slate-100" : "text-sm leading-6 text-slate-700"}>
            Это интерпретационный профиль имени: символическое значение, личный резонанс и мягкие подсказки без утверждений о характере как о факте.
          </p>
          <p className={publicMode ? "mt-2 text-xs font-semibold text-emerald-100" : "mt-2 text-xs font-semibold text-emerald-800"}>
            без сохранения данных: имя, дата, время и город остаются только на этом экране
          </p>
        </div>

        <div className={publicMode ? "grid gap-3 rounded-lg border border-white/12 bg-white/8 p-3" : "grid gap-3 rounded-lg border border-slate-200 bg-white p-3"}>
          <Field label="Имя" publicMode={publicMode}>
            <input
              value={person.name}
              onChange={(event) => onPersonChange({ ...person, name: sanitizeNameInput(event.target.value) })}
              placeholder="Введите имя"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              className="h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-base text-slate-900"
            />
          </Field>

          <Field label="Дата рождения (необязательно)" publicMode={publicMode}>
            <input
              value={person.birthDate}
              onChange={(event) => updateBirthDate(person, event.target.value, onPersonChange)}
              placeholder="дд.мм.гггг"
              inputMode="numeric"
              autoComplete="off"
              className={`h-12 w-full rounded-lg border bg-white px-3 text-base text-slate-900 ${dateError ? "border-rose-300" : "border-slate-200"}`}
            />
            {dateError ? <p className="mt-2 text-xs font-semibold text-rose-600">{dateError}</p> : null}
          </Field>
        </div>

        {!profile ? (
          <div className={publicMode ? "rounded-lg border border-white/12 bg-white/8 p-4 text-sm leading-6 text-slate-300" : "rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600"}>
            Введите имя, чтобы увидеть именной профиль. Данные не сохраняются.
          </div>
        ) : (
          <div className="grid gap-4">
            <div className={publicMode ? "rounded-lg border border-amber-200/25 bg-amber-200/10 p-4" : "rounded-lg border border-amber-200 bg-amber-50 p-4"}>
              <p className={publicMode ? "text-sm font-semibold text-amber-100" : "text-sm font-semibold text-amber-800"}>⭐ Краткий портрет</p>
              <p className={publicMode ? "mt-2 text-sm leading-6 text-slate-200" : "mt-2 text-sm leading-6 text-slate-700"}>{profile.portrait}</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {profile.summary.map((item) => (
                  <InfoRow key={item.label} publicMode={publicMode} label={item.label} text={item.value} />
                ))}
              </div>
            </div>

            <div className="grid gap-2">
              {profile.sections.map((section) => (
                <NatalInsightSectionCard
                  key={section.id}
                  publicMode={publicMode}
                  section={section}
                  open={openSectionId === section.id}
                  onToggle={() => setOpenSectionId((current) => (current === section.id ? "" : section.id))}
                />
              ))}
            </div>

            {vipFreeAccess ? (
              <div className={publicMode ? "rounded-lg border border-amber-200/25 bg-gradient-to-br from-amber-200/12 via-fuchsia-300/10 to-cyan-300/10 p-4" : "rounded-lg border border-amber-200 bg-amber-50 p-4"}>
                <p className={publicMode ? "text-base font-semibold text-white" : "text-base font-semibold text-slate-950"}>👑 Расширенный именной профиль открыт бесплатно до {formatVipFreeAccessDate(zodiacVipConfig.vipFreeAccessUntil)}</p>
                <p className={publicMode ? "mt-1 text-sm leading-5 text-slate-300" : "mt-1 text-sm leading-5 text-slate-700"}>
                  Сейчас ранний доступ открыт без оплаты. Позже часть расширенных функций может перейти в подписку.
                </p>
                <div className="mt-3 grid gap-2">
                  {profile.vipBlocks.map((block) => (
                    <InfoRow key={block.title} publicMode={publicMode} label={block.title} text={block.text} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </FeatureCard>
  );
}


function VipFreeAccessCard({
  publicMode,
  config,
  untilLabel,
  pairReady,
  natalReady,
  result,
  natalChart,
  nameProfile,
  numerology,
  angelNumber,
  dailyTalisman,
  selfSign,
  messageVariants,
  calendarDays,
  monthForecast,
  onFeatureOpen,
  onFutureSubscriptionClick,
}: {
  publicMode: boolean;
  config: ZodiacVipConfig;
  untilLabel: string;
  pairReady: boolean;
  natalReady: boolean;
  result: CompatibilityResult;
  natalChart: NatalChart | null;
  nameProfile: NameProfile | null;
  numerology: NumerologyProfile;
  angelNumber: AngelNumberProfile;
  dailyTalisman: DailyTalismanProfile | null;
  selfSign: ZodiacSign | null;
  messageVariants: Array<{ label: string; text: string }>;
  calendarDays: CoupleCalendarDay[];
  monthForecast: MonthForecast | null;
  onFeatureOpen: (feature: string) => void;
  onFutureSubscriptionClick: () => void;
}) {
  const features: VipFeature[] = [
    { id: "extended_natal_chart", title: "👑 Расширенная натальная карта", text: natalReady ? "личность, эмоции, любовь, деньги, тени и компас открыты" : "частичный режим: добавьте дату рождения для глубины" },
    { id: "extended_compatibility", title: "💞 Расширенная совместимость", text: pairReady ? `${result.scores.total}% · ${compatibilityLevelLabel(result.scores.total)}` : "выберите два знака, чтобы открыть разбор пары" },
    { id: "vip_mental_map", title: "🧠 VIP Ментальная карта пары", text: pairReady ? "динамика мыслей, споров, доверия и примирения открыта" : "появится после выбора пары" },
    { id: "couple_calendar_30_days", title: "📅 30-дневный календарь пары", text: pairReady ? `${calendarDays.length} дней открыты без оплаты` : "выберите два знака, чтобы открыть календарь" },
    { id: "month_forecast", title: "🌙 Месячный прогноз", text: monthForecast ? monthForecast.title : "выберите знак, чтобы увидеть месяц" },
    { id: "message_variants", title: "💌 Расширенный помощник сообщений", text: `${messageVariants.length} вариантов для разных ситуаций` },
    { id: "extended_name_profile", title: "🔤 Расширенный именной профиль", text: nameProfile ? "сильные стороны, риски, любовь и стиль общения открыты" : "добавьте имя, чтобы открыть профиль" },
    { id: "extended_numerology", title: "🔢 Расширенная нумерология", text: `число дня ${numerology.dayNumber}${numerology.lifePath ? ` · путь ${numerology.lifePath}` : ""}` },
    { id: "extended_angel_numbers", title: "👼 Расширенное толкование ангельских чисел", text: angelNumber.isValid ? `${angelNumber.label} · ${formatAngelPatternLabel(angelNumber.patternType)}` : "введите комбинацию времени" },
    { id: "vip_talismans", title: "🧿 VIP талисманы и символы силы", text: dailyTalisman ? `${dailyTalisman.stone}, ${dailyTalisman.color}` : "выберите знак, чтобы открыть талисман" },
  ];
  return (
    <div className={publicMode ? "rounded-lg border border-amber-200/25 bg-amber-200/10 p-4" : "rounded-lg border border-amber-200 bg-amber-50 p-4"}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={publicMode ? "text-lg font-semibold text-white" : "text-lg font-semibold text-slate-950"}>👑 VIP открыт бесплатно</p>
          <p className={publicMode ? "mt-1 text-sm font-semibold text-amber-100" : "mt-1 text-sm font-semibold text-amber-800"}>Ранний доступ до {untilLabel}</p>
          <p className={publicMode ? "mt-2 text-sm leading-6 text-slate-300" : "mt-2 text-sm leading-6 text-slate-700"}>
            Мы открыли VIP-функции бесплатно на период запуска. Пользуйтесь расширенными прогнозами, а позже здесь появится подписка.
          </p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-200/25 bg-black/20 text-amber-100">
          <Crown className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <VipStatusPill publicMode={publicMode} label="Сейчас" value="бесплатно" />
        <VipStatusPill publicMode={publicMode} label="Доступ до" value={untilLabel} />
        <VipStatusPill publicMode={publicMode} label="Подписка" value={config.vipPaymentsEnabled || config.telegramStarsEnabled ? "позже" : "не нужна сейчас"} />
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {features.map((feature) => (
          <button
            key={feature.id}
            type="button"
            onClick={() => onFeatureOpen(feature.id)}
            className={
              publicMode
                ? "min-h-[88px] rounded-lg border border-white/12 bg-white/8 p-3 text-left transition hover:border-amber-200/35 hover:bg-white/12 focus:outline-none focus:ring-2 focus:ring-amber-200/40"
                : "min-h-[88px] rounded-lg border border-amber-100 bg-white p-3 text-left transition hover:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200"
            }
          >
            <p className={publicMode ? "text-sm font-semibold text-white" : "text-sm font-semibold text-slate-950"}>{feature.title}</p>
            <p className={publicMode ? "mt-1 text-sm leading-5 text-slate-300" : "mt-1 text-sm leading-5 text-slate-600"}>{feature.text}</p>
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <VipPreviewPanel publicMode={publicMode} title="👑 Расширенная натальная карта" text={natalChart ? `Личность: ${natalChart.archetype} Эмоции и стиль: ${natalChart.communicationStyle} Любовь: ${natalChart.loveStyle} Деньги и реализация: ${natalChart.sections[0]?.items[0]?.text ?? natalChart.strengths} Тени: ${natalChart.compass.risks.join("; ")} Зона роста: ${natalChart.growth} Личный компас: ${natalChart.compass.actions.join("; ")} Совет месяца: ${natalChart.vipBlocks[0]?.text ?? natalChart.precisionNote}` : "Частичный режим открыт: выберите знак, а дату рождения можно добавить для более глубокого профиля."} />
        <VipPreviewPanel publicMode={publicMode} title="💞 Расширенная совместимость" text={pairReady ? `${result.scores.total}% · ${compatibilityLevelLabel(result.scores.total)}. Любовь: ${result.loveText} Общение: ${result.communicationText} Конфликты: ${result.weakSpotText} Быт: ${result.householdText} Деньги и решения: ${result.attractionText} Примирение: ${result.mentalMapDynamics.find((item) => item.label.includes("мир"))?.text ?? result.adviceText} Сильные стороны: ${result.strengthText} Зоны риска: ${result.riskText} Главный совет: ${result.adviceText}` : "Выберите два знака в разделе «Любовь», чтобы открыть расширенную совместимость без оплаты."} />
        <VipPreviewPanel publicMode={publicMode} title="🧠 VIP Ментальная карта пары" text={pairReady ? `Как думаете: ${result.mentalMapDynamics[0]?.text ?? result.mentalMapSummary.strengths} Как спорите: ${result.mentalMapDynamics[1]?.text ?? result.mentalMapSummary.risks} Как миритесь: ${result.mentalMapDynamics[2]?.text ?? result.mentalMapSummary.advice} Где сильная связь: ${result.mentalMapSummary.strengths} Что разрушает доверие: ${result.mentalMapSummary.risks} Что укрепляет контакт: ${result.mentalMapSummary.helps.join("; ")}.` : "После выбора пары появится динамика мыслей, споров, примирения и доверия."} />
        <VipPreviewPanel publicMode={publicMode} title="📅 30-дневный календарь пары" text={pairReady ? formatVipCalendarHighlights(calendarDays) : "Выберите два знака, чтобы увидеть 30 дней пары: разговоры, свидания, примирение, осторожность и решения."} />
        <VipPreviewPanel publicMode={publicMode} title="🌙 Месячный прогноз" text={monthForecast ? `Тема: ${monthForecast.theme} Любовь: ${monthForecast.love} Деньги и дела: ${monthForecast.money} Энергия: ${monthForecast.energy} Риск: ${monthForecast.risk} Лучший период: ${monthForecast.bestPeriod} Совет: ${monthForecast.advice}` : "Выберите знак, чтобы открыть тему месяца, любовь, деньги, энергию, риск и лучший период."} />
        <VipPreviewPanel publicMode={publicMode} title="💌 Расширенный помощник сообщений" text={messageVariants.map((variant) => `${variant.label}: ${variant.text}`).join(" ")} />
        <VipPreviewPanel publicMode={publicMode} title="🔤 Расширенный именной профиль" text={nameProfile ? `Сильные стороны: ${nameProfile.sections[0]?.items[0]?.text ?? nameProfile.portrait} Риски: ${nameProfile.sections[1]?.items[0]?.text ?? "не делать вывод по одному впечатлению"}. Стиль общения, любовь, работа и внутренний характер: ${nameProfile.vipBlocks.map((block) => `${block.title}: ${block.text}`).join(" ")}` : "Добавьте имя, чтобы открыть сильные стороны, риски, стиль общения, любовь, работу и личный резонанс без сохранения данных."} />
        <VipPreviewPanel publicMode={publicMode} title="🔢 Расширенная нумерология" text={`Число жизненного пути: ${numerology.lifePath ?? "добавьте дату рождения"}. Число имени: ${numerology.nameNumber ?? "добавьте имя"}. Личный месяц: ${numerology.personalMonth ?? "появится с датой рождения"}. Сильные стороны: ${numerology.strengths} Риски: ${numerology.risks} Деньги/любовь: ${numerology.summary} Совет месяца: ${numerology.advice}`} />
        <VipPreviewPanel publicMode={publicMode} title="👼 Расширенное толкование ангельских чисел" text={angelNumber.isValid ? `${angelNumber.label}: ${angelNumber.vipBlocks.map((block) => `${block.title}: ${block.text}`).join(" ")}` : "Введите комбинацию времени, чтобы открыть любовь, дела, интуицию, действие, осторожность, знак и текущий день."} />
        <VipPreviewPanel publicMode={publicMode} title="🧿 VIP талисманы и символы силы" text={dailyTalisman ? `Камень силы: ${dailyTalisman.stone}. Цвет силы: ${dailyTalisman.color}. Число силы: ${dailyTalisman.number}. Символ: ${selfSign ? buildZodiacStoneProfile(selfSign).symbol : "личный знак"}. Тотем: ${selfSign ? `${selfSign.emoji} ${selfSign.name}` : "выберите знак"}. Фраза силы: ${dailyTalisman.phrase}. Действие дня: ${dailyTalisman.action}` : "Выберите знак, чтобы открыть камень, цвет, число, символ, тотем, фразу силы и действие дня."} />
      </div>

      <div className={publicMode ? "mt-4 rounded-lg border border-emerald-200/20 bg-emerald-200/10 p-3 text-sm leading-5 text-emerald-50" : "mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm leading-5 text-emerald-900"}>
        <div className="flex gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Без логина, без платежей, без хранения имён, дат, времени или городов.</p>
        </div>
      </div>

      <div className="mt-3">
        <button type="button" onClick={onFutureSubscriptionClick} className={publicMode ? "inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-white/12 bg-white/7 px-3 text-sm font-semibold text-slate-100 transition hover:bg-white/12" : "inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"}>
          Что будет позже
        </button>
      </div>
      <p className={publicMode ? "mt-3 text-xs leading-5 text-slate-400" : "mt-3 text-xs leading-5 text-slate-600"}>
        Позже часть расширенных функций может перейти в подписку, но сейчас ранний доступ открыт бесплатно.
      </p>
    </div>
  );
}

function PersonPanel({
  publicMode,
  title,
  mode,
  value,
  onChange,
  onBirthDateAutosign,
}: {
  publicMode: boolean;
  title: string;
  mode: Mode;
  value: PersonState;
  onChange: (value: PersonState) => void;
  onBirthDateAutosign?: (value: PersonState, signSlug: string) => void;
}) {
  const showBirthDate = mode !== "fast";
  const showPrecise = mode === "precise";
  const parsedDate = parseBirthDate(value.birthDate);
  const detectedSign = parsedDate.ok ? findSign(parsedDate.signSlug) : null;
  const isSelfPanel = title === "Вы";
  const nameLabel = isSelfPanel ? "Ваше имя" : "Имя партнёра";
  const namePlaceholder = "необязательно";

  return (
    <div className={publicMode ? "min-w-0 space-y-4" : "min-w-0 space-y-4"}>
      {!publicMode ? <h2 className="text-lg font-semibold text-slate-950">{title}</h2> : null}
      <div className="mt-5 space-y-4">
        <Field label={nameLabel} publicMode={publicMode}>
          <input
            type="text"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            maxLength={30}
            value={value.name}
            onBlur={() => onChange({ ...value, name: normalizeName(value.name) })}
            onChange={(event) => onChange({ ...value, name: sanitizeNameInput(event.target.value) })}
            placeholder={namePlaceholder}
            className="h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-base text-slate-900"
          />
        </Field>

        <ZodiacSelect publicMode={publicMode} label="Знак" value={value.sign} options={signSelectOptions} onChange={(nextSign) => onChange({ ...value, sign: nextSign })} />

        {showBirthDate ? (
          <>
            <Field label="Пол" publicMode={publicMode}>
              <div className="grid gap-2 sm:grid-cols-3">
                {(Object.keys(genderLabels) as Gender[]).map((gender) => (
                  <button
                    key={gender}
                    type="button"
                    onClick={() => onChange({ ...value, gender })}
                    className={`min-h-11 rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                      value.gender === gender ? "border-cyan-300 bg-cyan-50 text-cyan-900" : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  >
                    {genderLabels[gender]}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Дата рождения" publicMode={publicMode}>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                value={value.birthDate}
                onChange={(event) => updateBirthDate(value, event.target.value, onChange, onBirthDateAutosign)}
                placeholder="дд.мм.гггг"
                className={`h-12 w-full rounded-lg border bg-white px-3 text-base text-slate-900 ${
                  value.birthDate && !parsedDate.ok ? "border-rose-300" : "border-slate-200"
                }`}
              />
              {detectedSign ? (
                <p className="mt-2 rounded-md border border-cyan-100 bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-900">
                  Определён знак: {detectedSign.emoji} {detectedSign.name}
                </p>
              ) : null}
              {value.birthDate && !parsedDate.ok ? <p className="mt-2 text-xs font-semibold text-rose-700">{parsedDate.error}</p> : null}
            </Field>
          </>
        ) : null}

        {showPrecise ? (
          <div className={publicMode ? "space-y-3 rounded-lg border border-amber-200/25 bg-amber-200/10 p-3" : "space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-3"}>
            <div className="grid gap-2">
              <button
                type="button"
                onClick={() => onChange({ ...value, knowsTime: true })}
                className={`min-h-11 rounded-lg border px-3 py-2 text-left text-sm font-semibold transition ${
                  value.knowsTime ? "border-amber-300 bg-amber-50 text-amber-950" : "border-white/10 bg-white/90 text-slate-700"
                }`}
              >
                Знаю точное время
              </button>
              <button
                type="button"
                onClick={() => onChange({ ...value, knowsTime: false })}
                className={`min-h-11 rounded-lg border px-3 py-2 text-left text-sm font-semibold transition ${
                  !value.knowsTime ? "border-amber-300 bg-amber-50 text-amber-950" : "border-white/10 bg-white/90 text-slate-700"
                }`}
              >
                Не знаю точное время
              </button>
            </div>
            {!value.knowsTime ? <p className="text-sm text-amber-800">{unknownBirthTimeNote}</p> : null}
            {value.knowsTime ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Время" publicMode={publicMode}>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    placeholder="чч:мм"
                    value={value.birthTime}
                    onChange={(event) => onChange({ ...value, birthTime: formatTimeInput(event.target.value) })}
                    className="h-12 w-full rounded-lg border border-slate-200 bg-white px-3 text-base text-slate-900"
                  />
                  {value.knowsTime && value.birthTime && !isValidTime(value.birthTime) ? (
                    <p className="mt-2 text-xs font-semibold text-rose-700">Укажите корректное время (00:00 - 23:59).</p>
                  ) : null}
                </Field>
                <CitySelector publicMode={publicMode} value={value} onChange={onChange} />
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CitySelector({ publicMode, value, onChange }: { publicMode: boolean; value: PersonState; onChange: (value: PersonState) => void }) {
  const selectedCity = getCityById(value.selectedCityId);
  const suggestions = searchCities(value.cityQuery).slice(0, 5);
  const needsSelection = value.knowsTime && value.cityQuery.trim() && !selectedCity;
  const missingCity = value.knowsTime && !value.cityQuery.trim() && !selectedCity;

  return (
    <div>
      <Field label="Город" publicMode={publicMode}>
        <input
          value={value.cityQuery}
          onChange={(event) => onChange({ ...value, cityQuery: event.target.value, selectedCityId: "" })}
          placeholder="Воронеж или Voronezh"
          className={`h-12 w-full rounded-lg border bg-white px-3 text-base text-slate-900 ${needsSelection || missingCity ? "border-amber-300" : "border-slate-200"}`}
        />
      </Field>

      {suggestions.length > 0 && !selectedCity ? (
        <div className="mt-2 max-h-44 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          {suggestions.map((city) => (
            <button
              key={city.cityId}
              type="button"
              onClick={() => onChange({ ...value, selectedCityId: city.cityId, cityQuery: cityLabel(city) })}
              className="flex w-full items-start gap-2 rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-cyan-50"
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan-700" />
              <span>
                <span className="block font-semibold text-slate-950">{city.nameRu}, {city.countryRu}</span>
                <span className="block text-xs text-slate-500">{city.nameEn} · {city.timezone}</span>
              </span>
            </button>
          ))}
        </div>
      ) : null}

      {selectedCity ? (
        <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900">
          {cityLabel(selectedCity)} · {selectedCity.timezone}
        </div>
      ) : null}

      {needsSelection || missingCity ? <p className="mt-2 text-xs font-semibold text-amber-800">{citySelectionWarning}</p> : null}
    </div>
  );
}

function isReadyToCalculate(mode: Mode, self: PersonState, partner: PersonState) {
  if (!self.sign || !partner.sign) return false;
  if (mode !== "fast") {
    if (!parseBirthDate(self.birthDate).ok) return false;
    if (!parseBirthDate(partner.birthDate).ok) return false;
  }
  if (mode === "precise") {
    if (self.knowsTime && (!isValidTime(self.birthTime) || !self.selectedCityId)) return false;
    if (partner.knowsTime && (!isValidTime(partner.birthTime) || !partner.selectedCityId)) return false;
  }
  return true;
}

function updateBirthDate(value: PersonState, rawValue: string, onChange: (value: PersonState) => void, onAutosign?: (value: PersonState, signSlug: string) => void) {
  const formatted = formatBirthDateInput(rawValue);
  const parsed = parseBirthDate(formatted);
  const nextValue = { ...value, birthDate: formatted, sign: parsed.ok ? parsed.signSlug : value.sign };
  onChange(nextValue);
  if (parsed.ok && parsed.signSlug !== value.sign) onAutosign?.(nextValue, parsed.signSlug);
}

function formatBirthDateInput(rawValue: string) {
  const trimmed = String(rawValue || "").trim();
  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return `${isoMatch[3]}.${isoMatch[2]}.${isoMatch[1]}`;
  return formatDateInput(rawValue);
}


function buildCompatibilityResult(mode: Mode, relationshipMode: RelationshipMode, self: PersonState, partner: PersonState): CompatibilityResult {
  const selfSign = findSign(self.sign);
  const partnerSign = findSign(partner.sign);
  const selfDate = parseBirthDate(self.birthDate);
  const partnerDate = parseBirthDate(partner.birthDate);
  const selfCity = self.knowsTime ? getCityById(self.selectedCityId) : null;
  const partnerCity = partner.knowsTime ? getCityById(partner.selectedCityId) : null;
  const modeLabel = modes.find((item) => item.id === mode)?.resultLabel ?? "Расчёт";
  const relationshipLabel = relationshipModes.find((item) => item.id === relationshipMode)?.label ?? "❤️ Любовь";
  const relationshipModeLabel = relationshipModePlainText(relationshipLabel);
  const title = `${selfSign.emoji} ${selfSign.name}${genderSuffix(self.gender)} + ${partnerSign.emoji} ${partnerSign.name}${genderSuffix(partner.gender)}`;
  const validationMessages = buildValidationMessages(mode, self, partner, selfDate, partnerDate, selfCity, partnerCity);
  const nameResonance = buildNameResonance(self.name, partner.name);
  const seed = hashString([
    mode,
    relationshipMode,
    self.gender,
    mode === "fast" ? "" : selfDate.iso ?? self.birthDate,
    self.sign,
    mode === "precise" && self.knowsTime ? self.birthTime : "",
    mode === "precise" && self.knowsTime ? selfCity?.cityId ?? "" : "",
    partner.gender,
    mode === "fast" ? "" : partnerDate.iso ?? partner.birthDate,
    partner.sign,
    mode === "precise" && partner.knowsTime ? partner.birthTime : "",
    mode === "precise" && partner.knowsTime ? partnerCity?.cityId ?? "" : "",
  ].join("|"));
  const base = baseCompatibilityScore(selfSign, partnerSign);
  const modeBoost = mode === "fast" ? 0 : mode === "personal" ? 2 : 4;
  const relationshipShift = relationshipModeScoreShift(relationshipMode, selfSign, partnerSign, seed);
  const personalShift = mode === "fast" ? 0 : birthDateCompatibilityShift(selfDate, partnerDate);
  const preciseShift = mode === "precise" ? preciseCompatibilityShift(self, partner, selfCity, partnerCity) : 0;
  const nameTotalShift = nameResonance ? Math.round((nameResonance.communicationShift + nameResonance.loveShift) / 2) : 0;
  const total = clampScore(base + modeBoost + relationshipShift + personalShift + preciseShift + variance(seed, 0, 13) - 6 + nameTotalShift);
  const scores = {
    total,
    attraction: clampScore(total + relationshipScoreNudge(relationshipMode, "attraction") + variance(seed, 1, 17) - 8),
    communication: clampScore(total + relationshipScoreNudge(relationshipMode, "communication") + variance(seed, 2, 19) - 9 + (nameResonance?.communicationShift ?? 0)),
    love: clampScore(total + relationshipScoreNudge(relationshipMode, "love") + variance(seed, 3, 21) - 10 + (nameResonance?.loveShift ?? 0)),
    household: clampScore(total + relationshipScoreNudge(relationshipMode, "household") + variance(seed, 4, 17) - 8),
  };
  const mapScores = buildRelationshipMapScores(scores, seed, relationshipMode);
  const mentalMapSummary = buildMentalMapSummary(mapScores, scores, seed);
  const mentalMapDynamics = buildMentalMapDynamics(mapScores, scores, seed);
  const preciseKnown = mode === "precise" && self.knowsTime && partner.knowsTime && Boolean(selfCity && partnerCity);
  const unknownPreciseTime = mode === "precise" && (!self.knowsTime || !partner.knowsTime);
  const scoreTierLabel = buildScoreTierLabel(total);
  return {
    title,
    pairLabel: `${selfSign.name} + ${partnerSign.name}`,
    modeLabel: `${modeLabel} · ${relationshipLabel}`,
    relationshipModeLabel,
    relationshipMode,
    dataUseLabel: buildDataUseLabel(mode, preciseKnown),
    scoreTierLabel,
    connectionLevel: buildConnectionLevel(total, relationshipMode),
    overviewText: buildCompatibilityOverview(selfSign, partnerSign, relationshipMode, total, seed),
    emotionalDynamicsText: buildEmotionalDynamicsText(scores, relationshipMode, seed),
    communicationPlanText: buildCommunicationPlanText(scores.communication, relationshipMode, seed),
    conflictPointsText: buildConflictPointsText(scores, relationshipMode, seed),
    bestContactFormat: buildBestContactFormat(scores, relationshipMode, seed),
    coupleAdvice: buildCoupleAdviceText(scores, relationshipMode, seed),
    note: preciseKnown ? exactBirthDataNote : unknownPreciseTime ? unknownBirthTimeNote : null,
    validationMessages,
    scores,
    attractionText: buildScoreText("attraction", scores.attraction, seed),
    communicationText: buildScoreText("communication", scores.communication, seed),
    loveText: buildScoreText("love", scores.love, seed),
    householdText: buildScoreText("household", scores.household, seed),
    weakSpotText: buildRiskText(total, seed),
    adviceText: nameResonance ? `${buildAdviceText(total, relationshipMode, seed)}. ${nameResonance.adviceText}` : buildAdviceText(total, relationshipMode, seed),
    conclusionText: buildConclusion(total, mode, relationshipMode),
    nameResonance,
    mapScores,
    mapSummary: buildMapSummary(total, relationshipMode),
    mentalMapSummary,
    mentalMapDynamics,
    strengthText: buildStrengthText(scores, seed),
    riskText: buildRiskText(total, seed + 11),
  };
}

function buildValidationMessages(
  mode: Mode,
  self: PersonState,
  partner: PersonState,
  selfDate: ParsedDate,
  partnerDate: ParsedDate,
  selfCity: City | null,
  partnerCity: City | null,
) {
  const messages: string[] = [];
  if (mode !== "fast") {
    if (self.birthDate && !selfDate.ok) messages.push(`Вы: ${selfDate.error}`);
    if (partner.birthDate && !partnerDate.ok) messages.push(`Партнёр: ${partnerDate.error}`);
  }
  if (mode === "precise") {
    if (self.knowsTime && !selfCity) messages.push(`Вы: ${citySelectionWarning}`);
    if (partner.knowsTime && !partnerCity) messages.push(`Партнёр: ${citySelectionWarning}`);
  }
  return messages;
}

function buildDataUseLabel(mode: Mode, preciseKnown: boolean) {
  if (mode === "fast") return "Используются только знаки.";
  if (mode === "personal") return "Учитываются пол и дата рождения.";
  return preciseKnown ? "Учитываются пол, дата, время и выбранный город." : "Точный режим работает приблизительно, если время или город не выбраны.";
}

function baseCompatibilityScore(firstSign: ZodiacSign, secondSign: ZodiacSign) {
  const firstTraits = signTraits[firstSign.slug];
  const secondTraits = signTraits[secondSign.slug];
  const elementKey = [firstSign.element, secondSign.element].sort().join("+");
  const elementShift =
    firstSign.element === secondSign.element
      ? 10
      : elementKey === "air+fire" || elementKey === "earth+water"
        ? 16
        : elementKey === "air+water" || elementKey === "earth+fire"
          ? -8
          : -2;
  const distance = zodiacDistance(firstSign.slug, secondSign.slug);
  const aspectShift = aspectScoreShift(distance);
  const modalityShift = firstTraits.modality === secondTraits.modality ? -5 : 3;
  const polarityShift = firstTraits.polarity === secondTraits.polarity ? 3 : -2;

  return 58 + elementShift + aspectShift + modalityShift + polarityShift;
}

function zodiacDistance(firstSlug: string, secondSlug: string) {
  const firstIndex = signIndex(firstSlug);
  const secondIndex = signIndex(secondSlug);
  const direct = Math.abs(firstIndex - secondIndex);
  return Math.min(direct, 12 - direct);
}

function signIndex(slug: string) {
  return signs.findIndex((sign) => sign.slug === slug);
}

function aspectScoreShift(distance: number) {
  if (distance === 0) return 0;
  if (distance === 1) return -9;
  if (distance === 2) return 9;
  if (distance === 3) return -14;
  if (distance === 4) return 13;
  if (distance === 5) return -7;
  if (distance === 6) return -3;
  return 0;
}

function relationshipModeScoreShift(mode: RelationshipMode, firstSign: ZodiacSign, secondSign: ZodiacSign, seed: number) {
  const firstTraits = signTraits[firstSign.slug];
  const secondTraits = signTraits[secondSign.slug];
  const sameElement = firstSign.element === secondSign.element;
  const sameModality = firstTraits.modality === secondTraits.modality;

  if (mode === "friendship") return (sameElement ? 5 : 0) + (variance(seed, 9, 5) - 2);
  if (mode === "work") return (firstTraits.modality !== secondTraits.modality ? 5 : -2) + (variance(seed, 10, 5) - 2);
  if (mode === "family") return (firstSign.element === "earth" || secondSign.element === "earth" ? 4 : 0) + (sameModality ? -2 : 2);
  if (mode === "passion") return (zodiacDistance(firstSign.slug, secondSign.slug) === 1 ? 6 : 0) + (variance(seed, 11, 7) - 3);
  if (mode === "reconciliation") return (sameElement ? 2 : -1) + (sameModality ? -4 : 3);
  return variance(seed, 8, 5) - 2;
}

function relationshipScoreNudge(mode: RelationshipMode, score: "attraction" | "communication" | "love" | "household") {
  const nudges: Record<RelationshipMode, Record<typeof score, number>> = {
    love: { attraction: 2, communication: 0, love: 5, household: 0 },
    friendship: { attraction: -2, communication: 6, love: 0, household: 1 },
    work: { attraction: -4, communication: 5, love: -2, household: 4 },
    family: { attraction: -1, communication: 1, love: 2, household: 7 },
    passion: { attraction: 8, communication: -2, love: 1, household: -3 },
    reconciliation: { attraction: -2, communication: 7, love: 1, household: 0 },
  };

  return nudges[mode][score];
}

function birthDateCompatibilityShift(selfDate: ParsedDate, partnerDate: ParsedDate) {
  if (!selfDate.ok || !partnerDate.ok) return 0;
  const distance = Math.abs(getDateOrdinal(selfDate.iso) - getDateOrdinal(partnerDate.iso));
  const rhythm = distance % 9;
  if (rhythm === 0 || rhythm === 3) return 4;
  if (rhythm === 1 || rhythm === 8) return -4;
  return rhythm === 5 ? -2 : 1;
}

function preciseCompatibilityShift(self: PersonState, partner: PersonState, selfCity: City | null, partnerCity: City | null) {
  let shift = 0;
  if (self.knowsTime && isValidTime(self.birthTime)) shift += 1;
  if (partner.knowsTime && isValidTime(partner.birthTime)) shift += 1;
  if (selfCity && partnerCity) shift += selfCity.timezone === partnerCity.timezone ? 2 : 0;
  return shift;
}

function buildRelationshipMapScores(scores: CompatibilityResult["scores"], seed: number, relationshipMode: RelationshipMode): RelationshipMapScore[] {
  const conflictPressure = clampScore(100 - scores.communication + variance(seed, 12, 13) - 6);
  const conflictBalance = clampScore(100 - conflictPressure + relationshipScoreNudge(relationshipMode, "communication") + variance(seed, 18, 7) - 3);
  const money = clampScore(Math.round((scores.household + scores.communication) / 2) + relationshipScoreNudge(relationshipMode, "household") + variance(seed, 13, 11) - 5);
  const mental = clampScore(scores.communication + variance(seed, 14, 11) - 5);
  const reconciliation = clampScore(Math.round((scores.communication + scores.love) / 2) + relationshipScoreNudge("reconciliation", "communication") + variance(seed, 15, 9) - 4);
  const support = clampScore(Math.round((scores.communication + scores.love + scores.household) / 3) + variance(seed, 17, 11) - 5);
  const potential = clampScore(Math.round((scores.total + scores.communication + scores.love + support) / 4) + variance(seed, 16, 9) - 4);

  return [
    buildRelationshipMapScore("mental_connection", "🧠 Ментальная связь", "мышление", mental, [
      "мысли быстро сходятся, легче строить общий план",
      "часть идей совпадает, но лучше уточнять смысл",
      "темп мышления разный, потребуется больше терпения",
    ]),
    buildRelationshipMapScore("communication", "💬 Общение", "диалог", scores.communication, [
      buildScoreText("communication", scores.communication, seed + 3),
      "можно договориться, если говорить прямо и без проверок",
      "важны короткие просьбы и пауза перед резкими словами",
    ]),
    buildRelationshipMapScore("conflicts", "⚠️ Конфликты", "споры", conflictBalance, [
      "споры можно удержать в рамках без резких слов",
      "важны паузы, границы и возврат к сути разговора",
      "есть риск спорить на эмоциях; лучше брать паузу",
    ]),
    buildRelationshipMapScore("reconciliation", "🕊 Примирение", "мириться", reconciliation, [
      "мягкий разговор быстро снижает напряжение",
      "поможет честный разговор без требования ответа сразу",
      "лучше мириться маленькими шагами и возвращаться к теме позже",
    ]),
    buildRelationshipMapScore("emotional_closeness", "❤️ Эмоциональная близость", "тепло", scores.love, [
      buildScoreText("love", scores.love, seed + 1),
      "тепло есть, но его важно подкреплять действиями",
      "близость растёт медленнее, чем ожидания; важны бережные просьбы",
    ]),
    buildRelationshipMapScore("household_rhythm", "🏠 Быт и ритм", "быт", scores.household, [
      buildScoreText("household", scores.household, seed + 4),
      "общий ритм возможен, если заранее делить ответственность",
      "быт может цеплять чаще чувств; правила лучше проговаривать заранее",
    ]),
    buildRelationshipMapScore("money_decisions", "💰 Деньги и решения", "деньги", money, [
      "можно спокойно обсуждать планы, траты и общий бюджет",
      "решения лучше фиксировать конкретно, без намёков",
      "финансовые темы лучше обсуждать заранее и без давления",
    ]),
    buildRelationshipMapScore("support", "🤝 Поддержка", "опора", support, [
      "есть ресурс быть друг для друга опорой",
      "поддержка работает лучше через конкретные действия",
      "поддержку важно просить прямо, иначе легко ждать невозможного",
    ]),
    buildRelationshipMapScore("couple_potential", "⭐ Потенциал пары", "рост", potential, [
      "у пары есть хороший запас роста",
      "потенциал раскрывается через правила разговора и общий ритм",
      "потенциал есть, но он зависит от границ, терпения и ясных просьб",
    ]),
  ];
}

function buildRelationshipMapScore(id: string, label: string, shortLabel: string, value: number, lines: [string, string, string]): RelationshipMapScore {
  return {
    id,
    label,
    shortLabel,
    value,
    text: value >= 70 ? lines[0] : value >= 55 ? lines[1] : lines[2],
  };
}

function buildMentalMapSummary(mapScores: RelationshipMapScore[], scores: CompatibilityResult["scores"], seed: number): MentalMapSummary {
  const rankedHigh = [...mapScores].sort((first, second) => second.value - first.value);
  const rankedLow = [...mapScores].sort((first, second) => first.value - second.value);
  const strengths = rankedHigh.slice(0, 3).map((item) => item.shortLabel).join(", ");
  const risks = rankedLow.slice(0, 3).map((item) => item.shortLabel).join(", ");
  const mainRisk = rankedLow[0];
  const mainAdvice = mentalMapAdviceForRisk(mainRisk.id, seed);
  const helps = [
    `опираться на ${rankedHigh[0].shortLabel} и не требовать одинакового темпа`,
    "говорить просьбами, а не проверками",
    scores.communication >= 55 ? "фиксировать договорённости простыми словами" : "переспрашивать смысл перед ответом",
  ];
  const avoid = [
    mentalMapAvoidForRisk(mainRisk.id),
    "не спорить на эмоциях",
    "не превращать разницу характеров в борьбу за правоту",
  ];

  return {
    strengths,
    risks,
    advice: mainAdvice,
    helps,
    avoid,
  };
}

function buildMentalMapDynamics(mapScores: RelationshipMapScore[], scores: CompatibilityResult["scores"], seed: number): MentalMapDynamic[] {
  const mental = findMentalMapScore(mapScores, "mental_connection");
  const communication = findMentalMapScore(mapScores, "communication");
  const reconciliation = findMentalMapScore(mapScores, "reconciliation");
  const support = findMentalMapScore(mapScores, "support");
  const trustRisk = [...mapScores].sort((first, second) => first.value - second.value)[0];
  const easiest = [communication, findMentalMapScore(mapScores, "money_decisions"), findMentalMapScore(mapScores, "household_rhythm")].sort((first, second) => second.value - first.value)[0];

  return [
    { label: "Как вы думаете", text: mental.value >= 60 ? "мысли чаще можно собрать в общий план" : "ход мысли разный, поэтому помогает уточнять смысл и не угадывать за партнёра" },
    { label: "Где легко договориться", text: `${easiest.shortLabel}: ${easiest.value >= 60 ? "здесь легче искать общий вариант" : "здесь нужен спокойный формат и конкретные правила"}` },
    { label: "Где чаще возникают споры", text: `${trustRisk.shortLabel}: эта зона требует внимания, особенно когда усталость сильнее терпения` },
    { label: "Как лучше мириться", text: reconciliation.value >= 60 ? "начинать с признания эмоций и одной конкретной просьбы" : "сначала снизить градус, потом возвращаться к теме без давления" },
    { label: "Что укрепляет связь", text: support.value >= 60 ? "маленькие подтверждения поддержки и общий ритм" : "честные ожидания, границы и регулярные короткие разговоры" },
    { label: "Что может разрушать доверие", text: scores.total >= 55 ? "молчаливые проверки, резкий тон и накопленные обиды" : pickLine(["давление, сарказм и обещания без действий", "игнорирование границ и разговоры на пике эмоций"], seed, 19) },
  ];
}

function findMentalMapScore(mapScores: RelationshipMapScore[], id: string) {
  return mapScores.find((item) => item.id === id) ?? mapScores[0];
}

function mentalMapAdviceForRisk(riskId: string, seed: number) {
  const adviceByRisk: Record<string, string[]> = {
    mental_connection: ["не спорить о формулировках, а уточнять смысл", "проверять, одинаково ли вы поняли план"],
    communication: ["говорить короче и честнее, без намёков", "не копить обиды до большого разговора"],
    conflicts: ["брать паузу до того, как спор станет соревнованием", "обсуждать проблему, а не характер друг друга"],
    reconciliation: ["мириться маленькими шагами и не требовать мгновенного ответа", "начинать с признания эмоций, потом переходить к фактам"],
    emotional_closeness: ["подтверждать чувства действиями, не только словами", "не проверять любовь молчанием"],
    household_rhythm: ["разделить быт заранее, пока нет раздражения", "обсудить ритм, усталость и личное пространство"],
    money_decisions: ["договариваться о тратах до эмоций и дедлайнов", "фиксировать решения конкретно, без намёков"],
    support: ["просить поддержку прямо и благодарить за маленькие шаги", "не ждать, что партнёр угадает нужную помощь"],
    couple_potential: ["держать границы и не торопить общий темп", "не превращать разницу характеров в борьбу за правоту"],
  };
  return pickLine(adviceByRisk[riskId] ?? adviceByRisk.couple_potential, seed, 18);
}

function mentalMapAvoidForRisk(riskId: string) {
  const avoidByRisk: Record<string, string> = {
    mental_connection: "не угадывать мысли партнёра",
    communication: "не говорить намёками и проверками",
    conflicts: "не спорить ради победы",
    reconciliation: "не требовать примирения сразу",
    emotional_closeness: "не мерить чувства только словами",
    household_rhythm: "не оставлять быт без правил",
    money_decisions: "не принимать денежные решения в раздражении",
    support: "не ждать помощи без прямой просьбы",
    couple_potential: "не торопить отношения через давление",
  };
  return avoidByRisk[riskId] ?? "не спорить на эмоциях";
}

function buildScoreText(kind: "attraction" | "communication" | "love" | "household", score: number, seed: number) {
  const lineSet = kind === "attraction" ? attractionLines : kind === "communication" ? communicationLines : kind === "love" ? loveLines : householdLines;
  if (score >= 70) return pickLine(lineSet.strong, seed, 1);
  if (score >= 55) return pickLine(lineSet.medium, seed, 2);
  return pickLine(lineSet.tense, seed, 3);
}

function buildAdviceText(score: number, mode: RelationshipMode, seed: number) {
  const lines = score >= 70 ? adviceLines.strong : score >= 55 ? adviceLines.medium : adviceLines.tense;
  const modeTip = relationshipModeAdvice[mode];
  return `${pickLine(lines, seed, 6)}. ${pickLine(modeTip, seed, 7)}`;
}

function buildRiskText(score: number, seed: number) {
  const lines = score >= 70 ? weakSpotLines.strong : score >= 55 ? weakSpotLines.medium : weakSpotLines.tense;
  return pickLine(lines, seed, 5);
}

function buildScoreTierLabel(score: number) {
  if (score >= 85) return "сильный ресурс пары";
  if (score >= 70) return "хороший потенциал";
  if (score >= 55) return "средний потенциал с зонами роста";
  if (score >= 40) return "сложная, но рабочая динамика";
  return "напряжённая динамика";
}

function buildConnectionLevel(score: number, mode: RelationshipMode) {
  const modeLabel = relationshipModeText(mode).replace(/^[^A-Za-zА-Яа-яЁё0-9]+/, "").trim();
  if (score >= 85) return `${modeLabel}: связь легко поддерживать, если не превращать близость в привычку без внимания.`;
  if (score >= 70) return `${modeLabel}: хороший контакт, которому помогают регулярные маленькие договорённости.`;
  if (score >= 55) return `${modeLabel}: контакт есть, но его важно не оставлять на догадки и молчаливые ожидания.`;
  if (score >= 40) return `${modeLabel}: нужна бережная настройка темпа, границ и формата разговора.`;
  return `${modeLabel}: лучше двигаться короткими спокойными шагами и не требовать быстрых решений.`;
}

function buildCompatibilityOverview(firstSign: ZodiacSign, secondSign: ZodiacSign, mode: RelationshipMode, score: number, seed: number) {
  const modeHint = pickLine(relationshipModeAdvice[mode], seed, 22);
  const tier = buildScoreTierLabel(score);
  return `${firstSign.name} + ${secondSign.name}: ${tier}. Главная тема пары сейчас — ${modeHint}; результат стоит воспринимать как мягкую навигацию для разговора, а не как диагноз.`;
}

function buildEmotionalDynamicsText(scores: CompatibilityResult["scores"], mode: RelationshipMode, seed: number) {
  const emotionalBase = scores.love >= 70 ? "эмоции быстро теплеют через внимание и честное присутствие" : scores.love >= 55 ? "эмоциям помогает предсказуемость и спокойный темп" : "эмоции лучше не ускорять: сначала безопасность, потом сближение";
  const modeTail = mode === "work" ? "в рабочих задачах это проявляется как уважение к роли и срокам" : mode === "friendship" ? "в дружбе это держится на надёжности без давления" : mode === "family" ? "в семье особенно важны бытовые договорённости" : mode === "reconciliation" ? "для примирения начните с признания чувства, а не с разбора правоты" : mode === "passion" ? "для страсти полезна игра без ревности и проверок" : "в любви лучше работают маленькие тёплые жесты";
  return `${emotionalBase}; ${modeTail}. ${pickLine(strengthLines, seed, 23)}.`;
}

function buildCommunicationPlanText(score: number, mode: RelationshipMode, seed: number) {
  const base = score >= 70 ? "говорите прямо и оставляйте место для лёгкости" : score >= 55 ? "выбирайте одну тему за раз и уточняйте смысл" : "сократите длинные переписки и начинайте с нейтральной фразы";
  const modeTip = mode === "work" ? "фиксируйте итог письменно" : mode === "family" ? "разделяйте просьбы и заботу" : mode === "reconciliation" ? "не требуйте ответа сразу" : mode === "friendship" ? "поддержку лучше называть конкретно" : mode === "passion" ? "желание стоит проговаривать без игры в догадки" : "тепло важнее проверки чувств";
  return `${base}: ${modeTip}. ${pickLine(coupleTalkLines[scoreBand(score)], seed, 24)}.`;
}

function buildConflictPointsText(scores: CompatibilityResult["scores"], mode: RelationshipMode, seed: number) {
  const lowest = [
    { label: "притяжение", value: scores.attraction },
    { label: "общение", value: scores.communication },
    { label: "эмоциональная близость", value: scores.love },
    { label: "бытовой ритм", value: scores.household },
  ].sort((first, second) => first.value - second.value)[0];
  const modeRisk = mode === "reconciliation" ? "возвращаться к старому спору без новой цели" : mode === "work" ? "смешивать личный тон и рабочие решения" : mode === "family" ? "копить бытовые ожидания молча" : mode === "friendship" ? "обесценивать поддержку, если она выглядит простой" : mode === "passion" ? "проверять интерес ревностью" : "мерить чувства скоростью ответа";
  return `Главная зона внимания: ${lowest.label}. Лучше не ${modeRisk}; ${pickLine(coupleAvoidLines[scoreBand(lowest.value)], seed, 25)}.`;
}

function buildBestContactFormat(scores: CompatibilityResult["scores"], mode: RelationshipMode, seed: number) {
  const base = scores.communication >= 70 ? "живой разговор или короткий голосовой контакт" : scores.communication >= 55 ? "короткое сообщение с ясной просьбой" : "пауза, затем очень спокойная фраза без претензии";
  const modeFormat = mode === "work" ? "с итогом в одном списке" : mode === "family" ? "с конкретным бытовым шагом" : mode === "reconciliation" ? "с правом другого человека ответить позже" : mode === "friendship" ? "с простым вопросом о состоянии" : mode === "passion" ? "с лёгким приглашением без давления" : "с тёплым жестом внимания";
  return `${base} ${modeFormat}. ${pickLine(coupleActionLines, seed, 26)}.`;
}

function buildCoupleAdviceText(scores: CompatibilityResult["scores"], mode: RelationshipMode, seed: number) {
  const best = [
    { label: "притяжение", value: scores.attraction },
    { label: "общение", value: scores.communication },
    { label: "тепло", value: scores.love },
    { label: "ритм", value: scores.household },
  ].sort((first, second) => second.value - first.value)[0];
  return `Опирайтесь на сильную сторону: ${best.label}. ${buildAdviceText(Math.round((scores.total + best.value) / 2), mode, seed)}.`;
}

function buildStrengthText(scores: CompatibilityResult["scores"], seed: number) {
  const ranked = [
    { key: "love", value: scores.love, text: "тепло и желание поддерживать друг друга" },
    { key: "communication", value: scores.communication, text: "диалог, если говорить прямо и без проверок" },
    { key: "attraction", value: scores.attraction, text: "искренний интерес и живая искра" },
    { key: "household", value: scores.household, text: "способность выстраивать общий ритм" },
  ].sort((first, second) => second.value - first.value);

  return `${ranked[0].text}; ${pickLine(strengthLines, seed, 4)}`;
}

function buildMapSummary(score: number, mode: RelationshipMode) {
  const modeLabel = relationshipModes.find((item) => item.id === mode)?.label ?? "❤️ Любовь";
  if (score >= 70) return `${modeLabel}: сильные стороны заметны, но привычки всё равно важно проговаривать.`;
  if (score >= 55) return `${modeLabel}: есть ресурс, если не копить обиды и держать границы.`;
  return `${modeLabel}: потребуется больше терпения, честный разговор и уважение к разному темпу.`;
}

function normalizeMode(value?: string | null): Mode {
  const normalized = String(value || "precise").trim().toLowerCase();
  return normalized === "fast" || normalized === "personal" || normalized === "precise" ? normalized : "precise";
}

function resolveInitialHubTab(startParam?: string | null): HubTab {
  const normalized = normalizeStartParam(startParam);
  if (!normalized) return "today";
  if (normalized === "compat" || normalized.startsWith("compat_")) return "love";
  if (normalized === "mystic" || normalized === "birth_matrix" || normalized === "angel_numbers") return "mystic";
  if (normalized === "vip") return "vip";
  if (normalized === "week") return "forecasts";
  return "today";
}

function resolveInitialMoreFeature(startParam?: string | null): MoreFeatureId | null {
  const normalized = normalizeStartParam(startParam);
  if (normalized === "birth_matrix") return "birthMatrix";
  if (normalized === "angel_numbers") return "angelNumbers";
  if (normalized === "week") return "weekForecast";
  return null;
}

function resolveInitialHomePanel(startParam?: string | null): "home" | RetentionPanelFocus {
  const normalized = normalizeStartParam(startParam);
  if (normalized === "profile" || normalized === "favorites" || normalized === "history") return normalized;
  return "home";
}

function resolveInitialRelationshipMode(startParam?: string | null): RelationshipMode | null {
  const normalized = normalizeStartParam(startParam);
  if (normalized === "compat_love") return "love";
  if (normalized === "compat_reconciliation") return "reconciliation";
  return null;
}

function resolveInitialSign(sign?: string | null, startParam?: string | null) {
  const fromStart = parseCompatibilityStartParam(startParam);
  const normalized = String(sign || fromStart || "").trim().toLowerCase();
  return signSlugs.has(normalized) ? normalized : null;
}

function parseCompatibilityStartParam(value?: string | null) {
  const normalized = normalizeStartParam(value);
  if (!normalized || normalized === "compat") return null;
  const match = normalized.match(/^compat_([a-z-]+)$/);
  if (!match) return null;
  return signSlugs.has(match[1]) ? match[1] : null;
}

function normalizeStartParam(value?: string | null) {
  return String(value || "").trim().toLowerCase();
}

function mainMenuCategoryLabel(categoryId: string) {
  const labels: Record<string, string> = {
    horoscopes: "Гороскопы",
    compatibility: "Совместимость",
    birth_matrix: "Матрица судьбы",
    angel_numbers: "Ангельские числа",
    numerology: "Нумерология",
    mystic: "Мистика",
    tarot_runes: "Таро и руны",
    moon_rituals: "Луна и ритуалы",
    vip: "VIP раздел",
    profile: "Мой профиль",
    profile_horoscopes: "Гороскопы",
    profile_compatibility: "Совместимость",
    profile_birth_matrix: "Матрица судьбы",
    profile_angel_numbers: "Ангельские числа",
    profile_vip: "VIP раздел",
  };
  return labels[categoryId] ?? categoryId.replace(/_/g, " ");
}

function relationshipModeText(mode: RelationshipMode) {
  return relationshipModes.find((item) => item.id === mode)?.label ?? mode;
}

function relationshipModePlainText(label: string) {
  return label.replace(/^[^A-Za-zА-Яа-яЁё0-9]+/, "").trim();
}

function safeAnalyticsScoreTier(value?: string): ZodiacAnalyticsPayload["scoreTier"] {
  return value === "strong" || value === "good" || value === "medium" || value === "difficult" || value === "tense" ? value : undefined;
}

function findLastPairRetentionItem(history: ZodiacRetentionItem[], favorites: ZodiacRetentionItem[]) {
  return [...history, ...favorites].find((item) => signSlugs.has(item.firstSign || "") && signSlugs.has(item.secondSign || "")) ?? null;
}

function compatibilityRetentionAction(self: PersonState, partner: PersonState, relationshipMode: RelationshipMode, result?: CompatibilityResult): ZodiacRetentionDraft {
  const selfLabel = self.sign ? findSign(self.sign).name : "первый знак";
  const partnerLabel = partner.sign ? findSign(partner.sign).name : "второй знак";
  const scoreTier = result ? zodiacAnalyticsScoreTier(result.scores.total) : undefined;
  return {
    section: "compatibility",
    featureKey: "compatibilityTool",
    label: `Совместимость: ${selfLabel} + ${partnerLabel}`,
    relationshipMode,
    sign: self.sign || undefined,
    firstSign: self.sign || undefined,
    secondSign: partner.sign || undefined,
    scoreTier,
    detail: scoreTier ? `${relationshipModeText(relationshipMode)} · ${compatibilityLevelLabel(result?.scores.total ?? 0)}` : relationshipModeText(relationshipMode),
  };
}

function buildFeatureRetentionAction({
  category,
  activeMoreFeature,
  selectedFeatureLabel,
  selectedFeatureShortLabel,
  selectedSignSlug,
  selfSignSlug,
  partnerSignSlug,
  relationshipMode,
  scoreTier,
}: {
  category: MenuFeatureGroup;
  activeMoreFeature: MoreFeatureId;
  selectedFeatureLabel: string;
  selectedFeatureShortLabel: string;
  selectedSignSlug: string;
  selfSignSlug?: string;
  partnerSignSlug?: string;
  relationshipMode: RelationshipMode;
  scoreTier?: string;
}): ZodiacRetentionDraft {
  const section = sectionForFeature(activeMoreFeature);
  const isAngelNumberFeature = activeMoreFeature === "angelNumbers" || activeMoreFeature === "vipAngelNumbers";
  return {
    section,
    featureKey: activeMoreFeature,
    label: selectedFeatureLabel,
    relationshipMode: activeMoreFeature === "compatibilityTool" ? relationshipMode : undefined,
    sign: selfSignSlug || selectedSignSlug || undefined,
    firstSign: activeMoreFeature === "compatibilityTool" ? selfSignSlug || selectedSignSlug || undefined : undefined,
    secondSign: activeMoreFeature === "compatibilityTool" ? partnerSignSlug || undefined : undefined,
    scoreTier: activeMoreFeature === "compatibilityTool" ? scoreTier : undefined,
    detail: isAngelNumberFeature ? "Без сохранения числового ввода" : category === "vip" ? "VIP бесплатно до 17.09.2026" : selectedFeatureShortLabel,
  };
}

function targetForRetentionItem(item: ZodiacRetentionItem): MainMenuCategoryTarget {
  const feature = isMoreFeatureId(item.featureKey) ? item.featureKey : null;
  if (!feature) return { tab: "today" };
  if (feature === "compatibilityTool") return { tab: "love", feature };
  if (feature === "todayForecast" || feature === "weekForecast" || feature === "luckyDays" || feature === "lunarCalendar" || feature === "dailyTalisman" || feature === "giftBySign") {
    return { tab: "forecasts", feature };
  }
  if (feature === "natalChart" || feature === "chineseHoroscope" || feature === "zodiacStones" || feature === "nameProfile" || feature === "numerology" || feature === "archetype") {
    return { tab: "profile", feature };
  }
  if (feature === "vip" || feature === "giveaways" || vipDetailFeatureIds.has(feature)) return { tab: "vip", feature };
  return { tab: "mystic", feature };
}

function isMoreFeatureId(value: unknown): value is MoreFeatureId {
  return typeof value === "string" && (menuFeatureTabs.some((item) => item.id === value) || vipDetailFeatureIds.has(value as MoreFeatureId));
}

function shareStartParamForAction(action: ZodiacRetentionDraft) {
  if (action.featureKey === "compatibilityTool" || action.section === "compatibility") {
    if (action.relationshipMode === "reconciliation") return "compat_reconciliation";
    if (action.relationshipMode === "love") return "compat_love";
    return "compat";
  }
  if (action.featureKey === "birthMatrix") return "birth_matrix";
  if (action.featureKey === "angelNumbers" || action.featureKey === "vipAngelNumbers") return "angel_numbers";
  if (action.featureKey === "vipNatalChart" || action.featureKey === "natalChart" || action.section === "natal_chart") return "vip";
  if (action.featureKey === "vip" || String(action.featureKey || "").startsWith("vip")) return "vip";
  if (action.section === "mystic") return "mystic";
  if (action.featureKey === "weekForecast") return "week";
  return "compat";
}

function vipFeatureForNatalBlock(title: string): MoreFeatureId {
  if (title.includes("Глубже про отношения")) return "vipCompatibility";
  if (title.includes("Фокус месяца")) return "vipMonthForecast";
  if (title.includes("Стиль лучших дней")) return "vipCoupleCalendar";
  return "vipNatalChart";
}

function vipInlinePairFeatureFor(feature: MoreFeatureId): MoreFeatureId {
  if (feature === "mentalMap") return "vipMentalMap";
  if (feature === "coupleCalendar") return "vipCoupleCalendar";
  if (feature === "messageHelper") return "vipMessageHelper";
  return "vipCompatibility";
}

function natalVipBlockCategory(title: string) {
  if (title.includes("Глубже про отношения")) return "relationship_deep_dive";
  if (title.includes("Фокус месяца")) return "month_focus";
  if (title.includes("Стиль лучших дней")) return "best_days_style";
  return "vip_natal_block";
}

function buildSafeShareText(action: ZodiacRetentionDraft) {
  const startParam = shareStartParamForAction(action);
  const appLink = `https://t.me/zodiac_love_check_bot?startapp=${startParam}`;
  if (action.featureKey === "compatibilityTool" || action.section === "compatibility") {
    const firstSign = signSlugs.has(action.firstSign || "") ? findSign(action.firstSign || "") : null;
    const secondSign = signSlugs.has(action.secondSign || "") ? findSign(action.secondSign || "") : null;
    const pairLabel = firstSign && secondSign ? `${firstSign.name} + ${secondSign.name}` : "пару знаков";
    return `Я проверил(а) совместимость: ${pairLabel} ✨\nОткрой Mini App и попробуй безопасный расчёт без сохранения личных данных: ${appLink}`;
  }
  if (action.featureKey === "birthMatrix") {
    return `Открыл(а) Матрицу судьбы в Астрологическом центре ✨\nПопробуй свой расчёт: ${appLink}`;
  }
  if (action.featureKey === "lunarRitual") {
    return `Открыл(а) лунный ритуал в Астрологическом центре ✨\nПопробуй тоже: ${appLink}`;
  }
  if (action.featureKey === "tarotCard" || action.featureKey === "runeDay") {
    return `Открыл(а) символический расклад в Астрологическом центре ✨\nПопробуй тоже: ${appLink}`;
  }
  if (action.featureKey === "angelNumbers" || action.featureKey === "vipAngelNumbers") {
    return `Ангельские числа в Астрологическом центре 👼\nПосмотри значение своего знака: ${appLink}`;
  }
  if (action.featureKey === "vipNatalChart" || action.featureKey === "natalChart" || action.section === "natal_chart") {
    return `Я открыл(а) натальную карту в Астрологическом центре ✨\nПопробуй тоже: ${appLink}`;
  }
  if (action.featureKey === "vip" || String(action.featureKey || "").startsWith("vip")) {
    return `Открыл(а) VIP раздел в Астрологическом центре 👑\nСейчас доступ бесплатный до 17.09.2026: ${appLink}`;
  }
  return `Открыл(а) ${action.label || "раздел"} в Астрологическом центре ✨\nПопробуй тоже: ${appLink}`;
}

function getDateOrdinal(dateIso: string) {
  const date = parseIsoDate(dateIso);
  return Math.floor(date.getTime() / 86400000);
}

function parseIsoDate(dateIso: string) {
  const [year, month, day] = dateIso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatShortDate(dateIso: string) {
  return parseIsoDate(dateIso).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
}

function formatWeekday(dateIso: string) {
  return parseIsoDate(dateIso).toLocaleDateString("ru-RU", { weekday: "long" });
}

function formatVipFreeAccessDate(dateKey: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    timeZone: DEFAULT_ZODIAC_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${dateKey}T12:00:00Z`));
}

function formatVipCalendarHighlights(days: CoupleCalendarDay[]) {
  const sample = days.slice(0, 30);
  const talks = sample.filter((day) => day.advice.includes("разговор") || day.advice.includes("вопрос")).slice(0, 3);
  const dates = sample.filter((day) => day.status.includes("искр") || day.advice.includes("свид") || day.advice.includes("тепл")).slice(0, 3);
  const reconciliation = sample.filter((day) => day.advice.includes("пауза") || day.advice.includes("поддерж")).slice(0, 3);
  const caution = sample.filter((day) => day.status.includes("осторожнее")).slice(0, 3);
  const decisions = sample.filter((day) => day.status.includes("ясность") || day.advice.includes("реш")).slice(0, 3);
  return [
    `Лучшие дни для разговора: ${formatCalendarGroup(talks)}.`,
    `Для свидания: ${formatCalendarGroup(dates)}.`,
    `Для примирения: ${formatCalendarGroup(reconciliation)}.`,
    `Дни осторожности: ${formatCalendarGroup(caution)}.`,
    `Для решений: ${formatCalendarGroup(decisions)}.`,
  ].join(" ");
}

function formatCalendarGroup(days: CoupleCalendarDay[]) {
  if (days.length === 0) return "появятся в списке по мере выбора пары";
  return days.map((day) => `${day.date} ${day.status}`).join("; ");
}

function getWeekKey(dateIso: string) {
  return getWeekRangeForDate(dateIso, DEFAULT_ZODIAC_TIME_ZONE).startDateKey;
}

function pickByKey(items: string[], key: string, offset: number) {
  return items[variance(hashString(key), offset, items.length)];
}

function buildDailyForecast(sign: ZodiacSign, dateIso: string) {
  const key = `${sign.slug}:${dateIso}:today`;
  const elementSet = dailyGuidanceByElement[sign.element] ?? dailyGuidanceByElement.fire;
  const signSet = signDailyProfiles[sign.slug];
  return {
    advice: pickByKey(elementSet.advice, key, 1),
    action: pickByKey(elementSet.action, key, 2),
    avoid: pickByKey(elementSet.avoid, key, 3),
    text: `${sign.name}: ${pickByKey(signSet.openers, key, 4)} ${pickByKey(dailyForecastLines, key, 5)} ${pickByKey(signSet.focus, key, 6)}`,
  };
}

function buildWeekForecast(sign: ZodiacSign, dateIso: string) {
  const key = `${sign.slug}:${getWeekKey(dateIso)}:week`;
  const elementSet = weeklyGuidanceByElement[sign.element] ?? weeklyGuidanceByElement.fire;
  const signSet = signWeeklyProfiles[sign.slug];
  return {
    theme: `${pickByKey(signSet.theme, key, 1)}: ${pickByKey(elementSet.theme, key, 2)}`,
    love: pickByKey(elementSet.love, key, 2),
    money: pickByKey(elementSet.money, key, 3),
    energy: pickByKey(elementSet.energy, key, 4),
    advice: pickByKey(elementSet.advice, key, 5),
  };
}

function buildPersonalMonthForecast(sign: ZodiacSign, dateIso: string, result: CompatibilityResult): MonthForecast {
  const monthKey = dateIso.slice(0, 7);
  const key = `${sign.slug}:${monthKey}:vip-month:${result.scores.total}`;
  const elementSet = weeklyGuidanceByElement[sign.element] ?? weeklyGuidanceByElement.fire;
  const signSet = signWeeklyProfiles[sign.slug];
  const monthLabel = new Intl.DateTimeFormat("ru-RU", {
    timeZone: DEFAULT_ZODIAC_TIME_ZONE,
    month: "long",
    year: "numeric",
  }).format(new Date(`${dateIso}T12:00:00Z`));

  return {
    title: `${sign.emoji} ${sign.name} · ${monthLabel}`,
    theme: pickByKey(signSet.theme, key, 2),
    love: pickByKey(elementSet.love, key, 1),
    money: pickByKey(elementSet.money, key, 3),
    energy: pickByKey(elementSet.energy, key, 4),
    risk: result.riskText,
    bestPeriod: pickByKey(["первая неделя месяца", "середина месяца", "последняя неделя месяца", "период после спокойного разговора"], key, 5),
    advice: pickByKey(elementSet.advice, key, 4),
  };
}

function buildLuckyDays(sign: ZodiacSign, dateIso: string, count: number) {
  return Array.from({ length: count }, (_, index) => {
    const iso = addDaysToDateKey(dateIso, index);
    const key = `${sign.slug}:${iso}:lucky`;
    const seed = hashString(key);
    const signSet = signLuckyProfiles[sign.slug];
    return {
      iso,
      date: formatShortDate(iso),
      weekday: formatWeekday(iso),
      status: luckyStatuses[variance(seed, 1, luckyStatuses.length)],
      area: `${luckyAreas[variance(seed, 2, luckyAreas.length)]}: ${pickLine(signSet, seed, 3)}`,
    };
  });
}

function validateZodiacMiniAppContent(dateKey: string) {
  const todayTexts = new Map<string, string[]>();
  const weekTexts = new Map<string, string[]>();
  const luckyTexts = new Map<string, string[]>();

  for (const sign of signs) {
    const today = buildDailyForecast(sign, dateKey).text;
    const week = buildWeekForecast(sign, dateKey).theme;
    const lucky = buildLuckyDays(sign, dateKey, 7).map((day) => `${day.status}|${day.area}`).join(";");
    addContentValidationValue(todayTexts, today, sign.name);
    addContentValidationValue(weekTexts, week, sign.name);
    addContentValidationValue(luckyTexts, lucky, sign.name);
  }

  return [
    ...buildDuplicateWarnings("Today short forecast", todayTexts),
    ...buildDuplicateWarnings("Week main theme", weekTexts),
    ...buildDuplicateWarnings("Lucky Days summary", luckyTexts),
  ];
}

function addContentValidationValue(map: Map<string, string[]>, value: string, signName: string) {
  map.set(value, [...(map.get(value) ?? []), signName]);
}

function buildDuplicateWarnings(label: string, values: Map<string, string[]>) {
  return Array.from(values.entries())
    .filter(([, signNames]) => signNames.length > 1)
    .map(([text, signNames]) => `${label} duplicate for ${signNames.join(", ")}: ${text}`);
}

function buildDayEnergy(dateKey: string, scope = "general"): DayEnergy {
  const seed = hashString(`${dateKey}:${scope}:energy`);
  return {
    type: pickLine(dayEnergyTypes, seed, 1),
    bestFor: pickLine(dayEnergyBestFor, seed, 2),
    avoid: pickLine(dayEnergyAvoid, seed, 3),
    mood: pickLine(dayEnergyMoods, seed, 4),
    relationshipTone: pickLine(dayEnergyRelationshipTone, seed, 5),
  };
}

function buildCoupleHoroscope(self: PersonState, partner: PersonState, dateKey: string, relationshipMode: RelationshipMode, result: CompatibilityResult): CoupleHoroscope {
  const seed = pairSeed(self, partner, dateKey, `couple:${relationshipMode}`);
  const energy = buildDayEnergy(dateKey, pairKey(self, partner));
  const reconciliationStatus = buildReconciliationStatus(result.scores.communication, seed);
  return {
    summary: `${formatZodiacDisplayDate(dateKey)} · ${compatibilityLevelLabel(result.scores.total)}`,
    relationship: pickLine(coupleRelationshipLines[scoreBand(result.scores.love)], seed, 1),
    talk: pickLine(coupleTalkLines[scoreBand(result.scores.communication)], seed, 2),
    date: pickLine(coupleDateLines[scoreBand(result.scores.attraction)], seed, 6),
    reconciliation: `${reconciliationStatus}: ${pickLine(coupleReconciliationLines[scoreBand(result.mapScores.find((item) => item.label.includes("Примирение"))?.value ?? result.scores.communication)], seed, 3)}`,
    action: pickLine(coupleActionLines, seed, 4),
    avoid: pickLine(coupleAvoidLines[scoreBand(result.scores.total)], seed, 5),
    energy,
  };
}

function buildCoupleAction(self: PersonState, partner: PersonState, dateKey: string, relationshipMode: RelationshipMode, result: CompatibilityResult): CoupleAction {
  const seed = pairSeed(self, partner, dateKey, `action:${relationshipMode}:${result.scores.total}`);
  const profile = coupleActionProfiles[relationshipMode];
  return {
    mainAction: pickLine(profile.mainAction, seed, 1),
    avoid: pickLine(profile.avoid, seed, 2),
    bestTone: pickLine(profile.bestTone, seed, 3),
    smallStep: pickLine(profile.smallStep, seed, 4),
  };
}

function buildCoupleCalendar(self: PersonState, partner: PersonState, dateKey: string, relationshipMode: RelationshipMode, result: CompatibilityResult, count = 7): CoupleCalendarDay[] {
  return Array.from({ length: count }, (_, index) => {
    const currentDateKey = addDaysToDateKey(dateKey, index);
    const seed = pairSeed(self, partner, currentDateKey, `calendar:${relationshipMode}`);
    const status = pickLine(coupleCalendarStatuses, seed + result.scores.total, 1);
    const advice = pickLine(coupleCalendarAdvice[status] ?? coupleCalendarAdvice["🌙 спокойный день"], seed, 2);
    return {
      dateKey: currentDateKey,
      date: formatShortDate(currentDateKey),
      weekday: formatWeekday(currentDateKey),
      status,
      theme: pickLine(coupleCalendarThemes[relationshipMode], seed, 3),
      energy: pickLine(coupleCalendarEnergy[relationshipMode], seed, 4),
      action: pickLine(coupleCalendarActions[relationshipMode], seed, 5),
      risk: pickLine(coupleCalendarRisks[relationshipMode], seed, 6),
      advice,
    };
  });
}

function buildReconciliationDay(self: PersonState, partner: PersonState, dateKey: string, result: CompatibilityResult): ReconciliationDay {
  const seed = pairSeed(self, partner, dateKey, "reconciliation");
  const reconciliationScore = result.mapScores.find((item) => item.label.includes("Примирение"))?.value ?? result.scores.communication;
  return {
    status: buildReconciliationStatus(reconciliationScore, seed),
    approach: pickLine(reconciliationApproachLines[scoreBand(reconciliationScore)], seed, 1),
    avoid: pickLine(reconciliationAvoidLines[scoreBand(result.scores.total)], seed, 2),
    energy: buildDayEnergy(dateKey, `${pairKey(self, partner)}:reconciliation`),
  };
}

function buildPartnerMessage(self: PersonState, partner: PersonState, dateKey: string, tone: MessageTone, result: CompatibilityResult) {
  const seed = pairSeed(self, partner, dateKey, `message:${tone}:${result.scores.total}`);
  const partnerName = normalizeName(partner.name);
  const prefix = partnerName ? `${partnerName}, ` : "";
  return `${prefix}${pickLine(messageTemplates[tone], seed, 1)}`;
}

function buildCoupleMessageTemplates(self: PersonState, partner: PersonState, dateKey: string, relationshipMode: RelationshipMode, result: CompatibilityResult): CoupleMessageTemplate[] {
  const seed = pairSeed(self, partner, dateKey, `message-templates:${relationshipMode}:${result.scores.communication}`);
  return coupleMessageTemplatesByMode[relationshipMode].map((template, index) => ({
    id: `${relationshipMode}-${index + 1}`,
    label: template.label,
    text: `${template.text} ${pickLine(coupleMessageClosers, seed, index + 1)}`,
  }));
}

function buildNatalChart(person: PersonState): NatalChart | null {
  const parsed = parseBirthDate(person.birthDate);
  if (!parsed.ok) return null;
  const sign = findSign(parsed.signSlug);
  const traits = signTraits[sign.slug];
  const seed = hashString(`${sign.slug}:${parsed.iso}:${normalizeName(person.name)}`);
  const hasPreciseData = person.knowsTime && isValidTime(person.birthTime) && Boolean(getCityById(person.selectedCityId));
  const v1Details = buildNatalV1Details(person, parsed, sign, seed);

  return {
    sign,
    element: elementLabels[sign.element],
    modality: modalityLabels[traits.modality],
    polarity: polarityLabels[traits.polarity],
    archetype: pickLine(natalArchetypes[sign.slug], seed, 1),
    strengths: pickLine(natalStrengths[sign.element], seed, 2),
    growth: pickLine(natalGrowth[traits.modality], seed, 3),
    loveStyle: pickLine(natalLoveStyles[sign.element], seed, 4),
    communicationStyle: pickLine(natalCommunicationStyles[traits.polarity], seed, 5),
    ...v1Details,
    precisionNote: hasPreciseData
      ? "Время и город учтены как расширяющие нюансы интерпретации. Асцендент, дома и точные градусы планет не рассчитываются в этой версии."
      : "Расчёт выполнен без точного времени рождения. Асцендент, дома и точные градусы планет не рассчитываются в этой версии.",
  };
}

function buildNatalV1Details(person: PersonState, parsed: Extract<ParsedDate, { ok: true }>, sign: ZodiacSign, baseSeed: number): Omit<NatalChart, "sign" | "element" | "modality" | "polarity" | "archetype" | "strengths" | "growth" | "loveStyle" | "communicationStyle" | "precisionNote"> {
  const traits = signTraits[sign.slug];
  const selectedCity = getCityById(person.selectedCityId);
  const timeKnown = person.knowsTime;
  const hasBirthTime = timeKnown && isValidTime(person.birthTime);
  const hasBirthCity = timeKnown && Boolean(selectedCity);
  const timeTone = hasBirthTime ? natalTimeTone(person.birthTime) : "unknown";
  const cityTone = hasBirthCity ? natalCityTone(selectedCity) : "open";
  const nameTone = normalizeName(person.name) ? "name_present" : "name_absent";
  const seed = hashString([
    sign.slug,
    parsed.iso,
    hasBirthTime ? person.birthTime : "unknown_time",
    hasBirthCity ? selectedCity?.cityId : "unknown_city",
    nameTone,
  ].join("|"));
  const element = natalElementProfiles[sign.element];
  const modality = natalModalityProfiles[traits.modality];
  const polarity = natalPolarityProfiles[traits.polarity];
  const timeProfile = natalTimeProfiles[timeTone];
  const cityProfile = natalCityProfiles[cityTone];
  const nameResonance = nameTone === "name_present" ? pickLine(natalNameResonanceLines, baseSeed, 2) : pickLine(natalNoNameLines, baseSeed, 2);
  const monthAdvice = pickLine([...element.monthAdvice, ...modality.monthAdvice], seed, 7);
  const mainRisk = pickLine([...element.risks, ...modality.risks, ...polarity.risks], seed, 8);
  const mainStrength = pickLine([...element.strengths, ...modality.strengths, ...polarity.strengths], seed, 9);
  const relationshipNeed = pickLine([...element.relationshipNeeds, ...polarity.relationshipNeeds], seed, 10);
  const energyType = pickLine([...element.energyTypes, timeProfile.energy], seed, 11);
  const emotionalStyle = pickLine([...element.emotionalStyles, timeProfile.emotion], seed, 12);
  const profileLabel = `${sign.emoji} ${sign.name} · ${elementLabels[sign.element]} · ${modalityLabels[traits.modality]}`;
  const accuracyNote = hasBirthTime && hasBirthCity
    ? "Время и город добавляют личные нюансы, но результат остаётся символической интерпретацией без точных домов и асцендента."
    : "Расчёт выполнен без точного времени и места рождения. Точные дома, асцендент и планетные градусы здесь не заявляются.";

  const summary: NatalSummaryItem[] = [
    { label: "Тип энергии", value: energyType },
    { label: "Эмоциональный стиль", value: emotionalStyle },
    { label: "В отношениях", value: relationshipNeed },
    { label: "Главная сила", value: mainStrength },
    { label: "Главный риск", value: mainRisk },
    { label: "Совет месяца", value: monthAdvice },
  ];

  const sections: NatalInsightSection[] = [
    {
      id: "core",
      title: "☀️ Ядро личности",
      items: [
        { label: "Базовый характер", text: pickLine(natalArchetypes[sign.slug], seed, 1) },
        { label: "Источник силы", text: mainStrength },
        { label: "Как проявляется", text: pickLine([...modality.selfExpression, ...cityProfile.expression], seed, 13) },
      ],
    },
    {
      id: "emotions",
      title: "🌙 Эмоции и внутренний мир",
      items: [
        { label: "В стрессе", text: pickLine(element.stress, seed, 14) },
        { label: "Чувство безопасности", text: pickLine([...element.safety, timeProfile.safety], seed, 15) },
        { label: "Уязвимость", text: pickLine([...polarity.vulnerabilities, ...cityProfile.vulnerabilities], seed, 16) },
      ],
    },
    {
      id: "thinking",
      title: "💬 Мышление и общение",
      items: [
        { label: "Решения", text: pickLine([...modality.decisions, timeProfile.decisions], seed, 17) },
        { label: "В споре", text: pickLine([...element.arguments, ...polarity.arguments], seed, 18) },
        { label: "Как объяснять мысли", text: pickLine([...polarity.communication, ...natalCommunicationStyles[traits.polarity]], seed, 19) },
      ],
    },
    {
      id: "love",
      title: "❤️ Любовь и отношения",
      items: [
        { label: "Что важно", text: relationshipNeed },
        { label: "Привязанность", text: pickLine([...element.attachment, timeProfile.attachment], seed, 20) },
        { label: "Что может ранить", text: pickLine(element.loveWounds, seed, 21) },
        { label: "Подходящий партнёр", text: pickLine([...element.partnerStyle, ...modality.partnerStyle], seed, 22) },
      ],
    },
    {
      id: "energy",
      title: "🔥 Энергия и мотивация",
      items: [
        { label: "Что заряжает", text: pickLine([...element.motivation, timeProfile.motivation], seed, 23) },
        { label: "Где выгорает", text: pickLine([...element.burnout, ...modality.burnout], seed, 24) },
        { label: "Как действовать", text: pickLine([...modality.actionStyle, ...cityProfile.actionStyle], seed, 25) },
      ],
    },
    {
      id: "money",
      title: "💼 Деньги и реализация",
      items: [
        { label: "Рабочий стиль", text: pickLine([...element.workStyle, ...modality.workStyle], seed, 26) },
        { label: "Сильная сторона в делах", text: pickLine(element.businessStrengths, seed, 27) },
        { label: "Финансовый риск", text: pickLine([...element.moneyRisks, ...polarity.moneyRisks], seed, 28) },
      ],
    },
    {
      id: "shadow",
      title: "🧩 Тени характера",
      items: [
        { label: "Слабое место", text: mainRisk },
        { label: "Защитная реакция", text: pickLine([...polarity.defenses, timeProfile.defenses], seed, 29) },
        { label: "Что может мешать", text: pickLine([...modality.risks, ...element.risks], seed, 30) },
      ],
    },
    {
      id: "growth",
      title: "🌱 Зона роста",
      items: [
        { label: "Главный урок", text: pickLine(natalGrowth[traits.modality], seed, 31) },
        { label: "Что развивать", text: pickLine([...modality.growth, ...element.growth], seed, 32) },
        { label: "Мягкий совет", text: monthAdvice },
      ],
    },
  ];

  const compass: NatalCompass = {
    strengths: pickUniqueLines([...element.strengths, ...modality.strengths, ...polarity.strengths], seed, 40, 3),
    risks: pickUniqueLines([...element.risks, ...modality.risks, ...polarity.risks], seed, 50, 3),
    actions: pickUniqueLines([...element.monthAdvice, ...modality.monthAdvice, ...timeProfile.monthActions], seed, 60, 3),
  };

  const vipBlocks: NatalVipBlock[] = [
    { title: "Глубже про отношения", text: `${relationshipNeed}. ${pickLine(element.relationshipAdvice, seed, 70)}` },
    { title: "Фокус месяца", text: monthAdvice },
    { title: "Стиль лучших дней", text: pickLine([...timeProfile.bestDays, ...cityProfile.bestDays], seed, 71) },
    { title: "План роста", text: pickLine([...modality.growthPlan, ...element.growthPlan], seed, 72) },
    { title: "Как использовать в паре", text: pickLine([...element.compatibilityHints, nameResonance], seed, 73) },
  ];

  return {
    calculationLabel: "интерпретационный расчёт по введённым данным",
    accuracyNote,
    profileLabel,
    summary,
    sections,
    compass,
    vipBlocks,
    hasBirthDate: true,
    hasBirthTime,
    hasBirthCity,
    timeKnown,
  };
}

function buildChineseHoroscope(person: PersonState, dateKey: string): ChineseHoroscope | null {
  const parsed = parseBirthDate(person.birthDate);
  if (!parsed.ok) return null;

  const lunarYear = parsed.month === 1 || (parsed.month === 2 && parsed.day < 4) ? parsed.year - 1 : parsed.year;
  const animalIndex = positiveModulo(lunarYear - 1900, chineseAnimalProfiles.length);
  const stemIndex = positiveModulo(lunarYear - 4, 10);
  const animal = chineseAnimalProfiles[animalIndex];
  const element = chineseElements[Math.floor(stemIndex / 2)];
  const yinYang = stemIndex % 2 === 0 ? "Ян" : "Инь";
  const seed = hashString(`${lunarYear}:${animal.animal}:${element}:${dateKey.slice(0, 7)}`);

  return {
    animal: animal.animal,
    emoji: animal.emoji,
    element,
    yinYang,
    profileLabel: `год ${lunarYear} · восточная традиция`,
    summary: `${animal.summary} Стихия ${element.toLowerCase()} добавляет ${pickLine(chineseElementTone[element], seed, 1)}.`,
    strengths: pickLine(animal.strengths, seed, 2),
    risks: pickLine(animal.risks, seed, 3),
    relationshipStyle: pickLine(animal.relationshipStyle, seed, 4),
    workMoneyStyle: pickLine(animal.workMoneyStyle, seed, 5),
    monthAdvice: pickLine(chineseMonthAdvice, seed, 6),
    compatibilityHints: [
      `легче раскрывается рядом: ${animal.compatible.join(", ")}`,
      `для баланса полезны: ${animal.balancing.join(", ")}`,
    ],
    boundaryNote: "Расчёт приближённый, если дата рождения близко к китайскому Новому году.",
  };
}

function buildZodiacStoneProfile(sign: ZodiacSign): ZodiacStoneProfile {
  const profile = zodiacStoneProfiles[sign.slug];
  return { sign, ...profile };
}

function buildNameProfile(person: PersonState, selectedSign: ZodiacSign | null, dateKey: string, vipFreeAccess: boolean): NameProfile | null {
  const name = normalizeName(person.name);
  if (!name) return null;

  const firstName = name.split(/\s+/)[0].toLocaleLowerCase("ru-RU");
  const known = knownNameProfiles[firstName];
  const parsed = parseBirthDate(person.birthDate);
  const sign = person.sign ? findSign(person.sign) : selectedSign;
  const seed = hashString(`${firstName}:${sign?.slug ?? "no-sign"}:${parsed.ok ? `${parsed.month}-${parsed.day}` : "no-date"}:${dateKey.slice(0, 7)}`);
  const letters = Array.from(firstName.replace(/-/g, ""));
  const vowelCount = letters.filter(isNameVowel).length;
  const consonantCount = Math.max(0, letters.length - vowelCount);
  const repeatedLetters = new Set(letters).size < letters.length;
  const firstLetter = letters[0] ?? "";
  const letterTone = pickLine(nameLetterTones[firstLetter] ?? nameLetterTones.default, seed, 1);
  const rhythmTone =
    vowelCount >= consonantCount
      ? "мягкий и контактный ритм имени"
      : consonantCount - vowelCount >= 3
        ? "собранный и волевой ритм имени"
        : "сбалансированный ритм имени";
  const lengthTone =
    letters.length <= 4
      ? "короткое имя звучит собранно и быстро запоминается"
      : letters.length >= 8
        ? "длинное имя даёт ощущение глубины и многослойности"
        : "имя звучит ровно и легко держит внимание";
  const repeatTone = repeatedLetters ? "повторы букв усиливают ощущение устойчивости и внутреннего мотива" : "без повторов имя ощущается более подвижным и открытым";
  const signTone = sign ? `${sign.emoji} ${sign.name} добавляет ${pickLine(signWeeklyProfiles[sign.slug].theme, seed, 2)}` : "если выбрать знак, профиль получит дополнительный личный оттенок";
  const dateTone = parsed.ok ? `дата рождения добавляет ритм ${formatShortDate(parsed.iso)} без сохранения этой даты` : "дата рождения необязательна: имя уже даёт символический портрет";
  const baseMeaning = known?.meaning ?? `Символическое значение имени строится вокруг первого звука: ${letterTone}.`;
  const mainStrength = known?.strength ?? pickLine(nameStrengthLines, seed, 3);
  const mainRisk = known?.risk ?? pickLine(nameRiskLines, seed, 4);
  const relationshipStyle = known?.relationship ?? pickLine(nameRelationshipLines, seed, 5);
  const communicationStyle = known?.communication ?? pickLine(nameCommunicationLines, seed, 6);
  const workStyle = known?.work ?? pickLine(nameWorkLines, seed, 7);
  const innerStyle = pickLine(nameInnerLines, seed, 8);
  const growth = pickLine(nameGrowthLines, seed, 9);
  const advice = pickLine(nameAdviceLines, seed, 10);
  const portrait = `${baseMeaning} ${lengthTone}; ${repeatTone}. Это не диагноз характера, а личный резонанс имени для бережного самонаблюдения.`;

  const sections: NatalInsightSection[] = [
    {
      id: "meaning",
      title: "🧬 Общее значение имени",
      items: [
        { label: "Символическое значение", text: baseMeaning },
        { label: "Ритм имени", text: rhythmTone },
        { label: "Личный резонанс", text: `${letterTone}. ${dateTone}.` },
      ],
    },
    {
      id: "strengths",
      title: "💪 Сильные стороны",
      items: [
        { label: "Главная сила имени", text: mainStrength },
        { label: "Как проявляется", text: pickLine(nameManifestationLines, seed, 11) },
        { label: "Что помогает раскрыться", text: pickLine(nameOpeningLines, seed, 12) },
      ],
    },
    {
      id: "risks",
      title: "⚠️ Зоны риска",
      items: [
        { label: "Что может мешать", text: mainRisk },
        { label: "В напряжении", text: pickLine(nameStressLines, seed, 13) },
        { label: "Мягкая опора", text: "лучше возвращаться к простым словам, границам и одному понятному действию" },
      ],
    },
    {
      id: "relationships",
      title: "❤️ В отношениях",
      items: [
        { label: "Стиль близости", text: relationshipStyle },
        { label: "Какие люди подходят рядом", text: pickLine(namePartnerLines, seed, 14) },
        { label: "Как строить отношения", text: pickLine(nameRelationshipAdviceLines, seed, 15) },
      ],
    },
    {
      id: "communication",
      title: "💬 В общении",
      items: [
        { label: "Как лучше говорить", text: communicationStyle },
        { label: "Что слышится сильнее", text: pickLine(nameVoiceLines, seed, 16) },
        { label: "Практический совет", text: "формулируйте просьбу коротко и оставляйте место для ответа собеседника" },
      ],
    },
    {
      id: "work",
      title: "💼 В работе и деньгах",
      items: [
        { label: "Рабочий стиль", text: workStyle },
        { label: "Фокус в деньгах", text: pickLine(nameMoneyLines, seed, 17) },
        { label: "Чего избегать", text: "не принимать важные решения только из желания доказать свою ценность" },
      ],
    },
    {
      id: "inner",
      title: "🧠 Внутренний характер",
      items: [
        { label: "Внутренний тон", text: innerStyle },
        { label: "Невидимая потребность", text: pickLine(nameNeedLines, seed, 18) },
        { label: "Ресурс", text: pickLine(nameResourceLines, seed, 19) },
      ],
    },
    {
      id: "growth",
      title: "🌱 Что развивать",
      items: [
        { label: "Направление роста", text: growth },
        { label: "Что усилит имя", text: pickLine(nameGrowthSupportLines, seed, 20) },
        { label: "Маленький шаг", text: "выберите одну привычку, которая поддерживает ваш спокойный тон каждый день" },
      ],
    },
    {
      id: "advice",
      title: "🧭 Совет имени",
      items: [
        { label: "Совет", text: advice },
        { label: "На ближайший месяц", text: pickLine(nameMonthAdviceLines, seed, 21) },
        { label: "С партнёром", text: pickLine(nameCompatibilityHints, seed, 22) },
      ],
    },
    {
      id: "portrait",
      title: "⭐ Краткий портрет",
      items: [
        { label: "Портрет", text: portrait },
        { label: "Знак и имя", text: signTone },
        { label: "Итог", text: `${mainStrength}. Важно беречь баланс: ${mainRisk}.` },
      ],
    },
  ];

  return {
    summary: [
      { label: "Имя", value: "введено, но не сохраняется" },
      { label: "Главная сила", value: mainStrength },
      { label: "Зона роста", value: growth },
      { label: "Резонанс со знаком", value: signTone },
    ],
    sections,
    portrait,
    vipBlocks: vipFreeAccess
      ? [
          { title: "Имя + знак", text: signTone },
          { title: "Имя + отношения", text: relationshipStyle },
          { title: "Совет месяца", text: pickLine(nameMonthAdviceLines, seed, 23) },
          { title: "Сила и риск", text: `${mainStrength}. Риск: ${mainRisk}.` },
          { title: "Совместимость", text: pickLine(nameCompatibilityHints, seed, 24) },
        ]
      : [],
  };
}

const numerologyLines = {
  strengths: [
    "легко замечать ритм ситуации и выбирать спокойный следующий шаг",
    "соединять эмоции с практикой и не терять тепло в разговоре",
    "видеть скрытую структуру дня и возвращать себе фокус",
  ],
  risks: [
    "перегружать себя ожиданием идеального знака",
    "сравнивать настроение дня с чужим темпом",
    "делать вывод слишком быстро, пока эмоции ещё сильные",
  ],
  advice: [
    "выберите одно маленькое действие и доведите его до конца",
    "держите рядом простую опору: вода, пауза, короткая запись мысли",
    "сначала уточните желание, потом обсуждайте решение",
  ],
};

const angelRepeatingTimes = [
  "00:00",
  "01:01",
  "02:02",
  "03:03",
  "04:04",
  "05:05",
  "06:06",
  "07:07",
  "08:08",
  "09:09",
  "10:10",
  "11:11",
  "12:12",
  "13:13",
  "14:14",
  "15:15",
  "16:16",
  "17:17",
  "18:18",
  "19:19",
  "20:20",
  "21:21",
  "22:22",
  "23:23",
];

const angelMirrorTimes = ["01:10", "02:20", "03:30", "04:40", "05:50", "10:01", "12:21", "13:31", "14:41", "15:51", "20:02", "21:12", "23:32"];
const angelAmplifiedTimes = ["01:11", "02:22", "03:33", "04:44", "05:55", "11:11", "22:22"];

const angelNumberPresetGroups: Array<{ id: AngelNumberPatternType; title: string; items: string[] }> = [
  { id: "repeated", title: "Повторяющиеся числа", items: angelRepeatingTimes },
  { id: "mirror", title: "Зеркальные числа", items: angelMirrorTimes },
  { id: "amplified", title: "Усиленные комбинации", items: angelAmplifiedTimes },
];

const angelRepeatingSet = new Set(angelRepeatingTimes);
const angelMirrorSet = new Set(angelMirrorTimes);
const angelAmplifiedSet = new Set(angelAmplifiedTimes);

const angelPatternProfiles: Record<AngelNumberPatternType, {
  label: string;
  meaning: string[];
  highlights: string[];
  love: string[];
  workMoney: string[];
  intuition: string[];
  phrase: string[];
  next24Hours: string[];
  actions: string[];
  avoid: string[];
}> = {
  repeated: {
    label: "повторяющаяся комбинация",
    meaning: ["в эзотерической трактовке повтор может означать просьбу усилить фокус", "повторяющиеся числа символически связаны с темой, которую важно заметить сегодня"],
    highlights: ["где мысль ходит по кругу и просит ясного решения", "какая тема возвращается не случайно, а как мягкое напоминание"],
    love: ["в любви может подсвечивать привычный сценарий: лучше выбрать один тёплый поступок", "отношениям поможет повторить важное простыми словами без давления"],
    workMoney: ["в делах полезно проверить одну повторяющуюся задачу", "деньги и решения лучше вести через порядок, а не через спешку"],
    intuition: ["обратите внимание на мысль, с которой вы увидели время", "тело может подсказать, где нужен более спокойный темп"],
    phrase: ["я замечаю главное и выбираю один ясный шаг", "я возвращаю фокус туда, где есть смысл"],
    next24Hours: ["закройте одну маленькую петлю: сообщение, договорённость или задачу", "запишите повторяющуюся мысль и выберите для неё мягкое действие"],
    actions: ["сформулировать один приоритет", "повторить важную просьбу спокойно", "убрать одну лишнюю задачу"],
    avoid: ["не делать вывод по одному совпадению", "не ждать идеального знака вместо действия", "не давить на человека повторными проверками"],
  },
  mirror: {
    label: "зеркальная комбинация",
    meaning: ["зеркальные числа могут означать встречу с отражением своих ожиданий", "символически связано с балансом: что вы отдаёте и что хотите получить"],
    highlights: ["где вы смотрите на другого, но на самом деле видите свой страх", "какой разговор просит больше честности и меньше догадок"],
    love: ["в любви лучше уточнять, а не проверять", "может быть знаком обратить внимание на равновесие между близостью и свободой"],
    workMoney: ["в делах поддержит честный обмен задачами", "в решениях полезно сверить две стороны: желание и реальность"],
    intuition: ["если внутри появилась пауза, не заполняйте её тревогой", "отражение дня может подсказать, где нужна мягкая корректировка"],
    phrase: ["я вижу ситуацию спокойнее и выбираю честный баланс", "я не додумываю за других и говорю яснее"],
    next24Hours: ["задайте один уточняющий вопрос вместо вывода", "сравните ожидание и факт, затем выберите спокойный шаг"],
    actions: ["уточнить договорённость", "сверить ожидания", "сделать паузу перед ответом"],
    avoid: ["не читать молчание как окончательный ответ", "не зеркалить резкость резкостью", "не торопить признания"],
  },
  amplified: {
    label: "усиленная комбинация",
    meaning: ["усиленная комбинация может означать, что тема дня стала громче обычного", "в эзотерической трактовке это акцент на намерении, эмоции и личной ответственности"],
    highlights: ["где энергия сильная, но ей нужен бережный канал", "какое желание просит не драму, а точную формулировку"],
    love: ["в любви помогает честное, но мягкое сообщение", "сильное чувство лучше переводить в действие заботы"],
    workMoney: ["в делах поддержит смелый, но проверенный шаг", "деньги требуют ясного приоритета и отказа от лишнего риска"],
    intuition: ["интуиция звучит громче, если убрать шум и спешку", "первый внутренний отклик может быть важнее длинного анализа"],
    phrase: ["я направляю силу спокойно и с уважением к себе", "моя энергия становится действием, а не тревогой"],
    next24Hours: ["выберите сильное намерение и сделайте один измеримый шаг", "не распыляйтесь: важна одна точная просьба или задача"],
    actions: ["записать намерение", "сделать один смелый шаг", "поддержать тело отдыхом и водой"],
    avoid: ["не превращать знак в требование к миру", "не обещать на эмоциональном пике", "не подменять действие ожиданием"],
  },
  custom: {
    label: "особая комбинация",
    meaning: ["особая комбинация может означать личный ритм момента", "символически связано с темой дня, которую заметили именно вы"],
    highlights: ["какая мысль была рядом с этим временем", "где нужен не общий ответ, а свой честный ориентир"],
    love: ["в любви лучше выбрать простой знак внимания", "отношениям поможет мягкая формулировка без давления"],
    workMoney: ["в делах полезно сверить маршрут и ресурсы", "небольшая проверка деталей даст больше спокойствия"],
    intuition: ["личный смысл важнее громкой трактовки", "прислушайтесь к первому спокойному ощущению"],
    phrase: ["я доверяю спокойному внутреннему ориентиру", "я выбираю свой темп и ясное действие"],
    next24Hours: ["свяжите увиденное время с одним практическим шагом", "запишите мысль и вернитесь к ней вечером"],
    actions: ["сделать короткую заметку", "выбрать маленькое действие", "проверить своё настроение"],
    avoid: ["не искать страшный смысл", "не принимать решение только из-за совпадения", "не обесценивать обычный день"],
  },
  fallback: {
    label: "личная комбинация времени",
    meaning: ["любой допустимый ритм времени может быть личной подсказкой, если он зацепил внимание", "может быть знаком обратить внимание на контекст, в котором вы увидели часы"],
    highlights: ["не само число, а ваша мысль в этот момент", "где день просит больше ясности и меньше автоматизма"],
    love: ["в любви подойдёт маленький честный жест", "лучше не ждать идеального момента, а выбрать уважительный тон"],
    workMoney: ["в делах помогает спокойная проверка плана", "решения лучше принимать после короткой паузы"],
    intuition: ["интуитивный сигнал здесь мягкий: заметьте настроение, а не ищите точное обещание", "внутренний отклик стоит записать и проверить позже"],
    phrase: ["я замечаю знак, но выбираю действие осознанно", "мой ориентир внутри, а число лишь помогает остановиться"],
    next24Hours: ["сделайте одну практическую вещь, которую давно откладывали", "переведите ощущение в маленький ясный шаг"],
    actions: ["остановиться на минуту", "назвать своё желание", "сделать одну полезную вещь"],
    avoid: ["не искать обещаний результата", "не пугать себя трактовкой", "не отдавать числу право решать за вас"],
  },
};

const angelDigitThemes: Record<number, { meaning: string; action: string; avoid: string }> = {
  1: { meaning: "единица добавляет тему начала, выбора и личной инициативы", action: "начать с короткого первого шага", avoid: "не давить на себя требованием идеального старта" },
  2: { meaning: "двойка связана с диалогом, доверием и мягкими договорённостями", action: "задать вопрос вместо вывода", avoid: "не проверять чувства молчанием" },
  3: { meaning: "тройка подсвечивает общение, лёгкость и творческое выражение", action: "сказать мысль проще и теплее", avoid: "не распыляться на слишком много вариантов" },
  4: { meaning: "четвёрка напоминает о границах, порядке и устойчивости", action: "разложить задачу на понятные части", avoid: "не превращать контроль в напряжение" },
  5: { meaning: "пятёрка символически связана с переменами и свежим маршрутом", action: "попробовать новый подход без резкого шага", avoid: "не менять всё только из-за эмоций" },
  6: { meaning: "шестёрка усиливает тему заботы, красоты и домашнего тепла", action: "сделать жест внимания", avoid: "не брать на себя чужие эмоции полностью" },
  7: { meaning: "семёрка зовёт к тишине, наблюдению и внутренней честности", action: "выделить время без шума", avoid: "не уходить в холодную закрытость" },
  8: { meaning: "восьмёрка связана с ресурсами, ответственностью и зрелым обменом", action: "проверить баланс сил и денег", avoid: "не мерить ценность только результатом" },
  9: { meaning: "девятка помогает завершать, благодарить и отпускать лишнее", action: "закрыть одну старую тему", avoid: "не возвращаться к спору без новой цели" },
};

const dreamSymbols = [
  { key: "water", label: "Вода", general: "эмоции, обновление и необходимость услышать себя", emotional: "чувства могут быть сильнее слов", highlight: "где нужна мягкость", advice: "не торопите разговор" },
  { key: "road", label: "Дорога", general: "выбор маршрута и движение к решению", emotional: "есть желание понять следующий шаг", highlight: "направление и темп", advice: "выберите один путь на ближайшие дни" },
  { key: "money", label: "Деньги", general: "ценность, обмен и чувство безопасности", emotional: "может подниматься вопрос опоры", highlight: "границы ресурсов", advice: "сверьте траты и желания" },
  { key: "ex", label: "Бывший / бывшая", general: "незавершённая эмоция или старый сценарий", emotional: "память просит бережного вывода", highlight: "что больше не хочется повторять", advice: "не сравнивайте прошлое с настоящим напрямую" },
  { key: "house", label: "Дом", general: "личное пространство, тело и безопасность", emotional: "важно почувствовать опору", highlight: "домашний ритм", advice: "создайте маленький порядок вокруг себя" },
  { key: "snake", label: "Змея", general: "интуиция, осторожность и обновление", emotional: "может быть сигналом прислушаться к телу", highlight: "тонкие границы", advice: "не драматизируйте, но проверьте факты" },
  { key: "fish", label: "Рыба", general: "чувствительность, шанс и тихая удача", emotional: "эмоции созревают внутри", highlight: "маленькая возможность", advice: "заметьте спокойный знак поддержки" },
  { key: "falling", label: "Падение", general: "потеря контроля или усталость", emotional: "нужно больше опоры", highlight: "где темп слишком высокий", advice: "верните себе простую паузу" },
  { key: "car", label: "Машина", general: "управление ситуацией и скорость решений", emotional: "важно понять, кто ведёт процесс", highlight: "контроль и маршрут", advice: "не ускоряйте разговор без согласия" },
  { key: "deceased", label: "Ушедший человек", general: "память, благодарность и мягкое завершение", emotional: "может подниматься тема поддержки", highlight: "ценные слова прошлого", advice: "позвольте себе спокойное воспоминание" },
  { key: "fire", label: "Огонь", general: "энергия, желание и очищение", emotional: "много внутреннего тепла", highlight: "страсть и раздражение", advice: "направьте импульс в действие без резкости" },
  { key: "child", label: "Ребёнок", general: "новое начало и уязвимая часть души", emotional: "нужна бережность к себе", highlight: "простая радость", advice: "не обесценивайте маленькие шаги" },
  { key: "wedding", label: "Свадьба", general: "союз, обещание или важный выбор", emotional: "хочется ясности в связи", highlight: "ожидания от отношений", advice: "разделите мечту и реальный договор" },
  { key: "forest", label: "Лес", general: "поиск, тишина и внутренний маршрут", emotional: "нужно время без давления", highlight: "где вы теряете ориентир", advice: "не решайте всё сразу" },
  { key: "sea", label: "Море", general: "большие чувства и широкий горизонт", emotional: "эмоции хотят пространства", highlight: "мечты и глубину", advice: "говорите о чувствах спокойно" },
];

const giftRecipientOptions: Array<{ id: GiftRecipientType; label: string }> = [
  { id: "partner", label: "партнёр" },
  { id: "friend", label: "друг" },
  { id: "man", label: "мужчина" },
  { id: "woman", label: "женщина" },
  { id: "colleague", label: "коллега" },
];

function buildNumerologyProfile(person: PersonState, dateKey: string): NumerologyProfile {
  const parsed = parseBirthDate(person.birthDate);
  const normalizedName = normalizeName(person.name);
  const lifePath = parsed.ok ? reduceNumber(parsed.day + parsed.month + parsed.year) : null;
  const nameNumber = normalizedName ? reduceNumber(Array.from(normalizedName).reduce((total, char) => total + ((char.toLocaleLowerCase("ru-RU").charCodeAt(0) % 9) + 1), 0)) : null;
  const date = parseIsoDate(dateKey);
  const dayNumber = reduceNumber(date.getUTCDate() + date.getUTCMonth() + 1 + date.getUTCFullYear());
  const personalMonth = parsed.ok ? reduceNumber((lifePath ?? 0) + date.getUTCMonth() + 1) : null;
  const seed = hashString(`${lifePath ?? "x"}:${nameNumber ?? "x"}:${dateKey}`);
  return {
    lifePath,
    nameNumber,
    dayNumber,
    personalMonth,
    summary: lifePath ? `число пути ${lifePath} добавляет личный ритм, а число дня ${dayNumber} показывает настроение текущего момента` : `даже без даты рождения число дня ${dayNumber} даёт мягкую подсказку для выбора темпа`,
    strengths: pickLine(numerologyLines.strengths, seed, 1),
    risks: pickLine(numerologyLines.risks, seed, 2),
    advice: pickLine(numerologyLines.advice, seed, 3),
  };
}

function buildAngelNumberProfile(
  value: string,
  dateKey: string,
  sign: ZodiacSign | null,
  hasName: boolean,
  talisman: DailyTalismanProfile | null,
  numerology: NumerologyProfile,
  vipFreeAccess: boolean,
): AngelNumberProfile {
  const normalized = normalizeAngelTimeInput(value);
  if (!normalized.ok) {
    return {
      label: "",
      safeKey: "angel_invalid",
      isValid: false,
      prompt: "Введите комбинацию в формате 10:10, 12:12 или 02:22.",
      patternType: "fallback",
      meaning: "",
      highlights: "",
      love: "",
      workMoney: "",
      intuition: "",
      actions: [],
      avoid: [],
      phrase: "",
      next24Hours: "",
      vipBlocks: [],
    };
  }

  const patternType = classifyAngelNumberPattern(normalized.label);
  const pattern = angelPatternProfiles[patternType];
  const digits = normalized.label.replace(":", "");
  const digitRoot = reduceNumber(digits.split("").reduce((total, digit) => total + Number(digit), 0));
  const digitTheme = angelDigitThemes[digitRoot] ?? angelDigitThemes[1];
  const seed = hashString(`${digits}:${dateKey}:${patternType}:${sign?.slug ?? "no-sign"}:${hasName ? "name" : "no-name"}`);
  const exactMeaning = buildExactAngelMeaning(normalized.label);
  const phrase = pickLine(pattern.phrase, seed, 6);
  const talismanLine = talisman
    ? `${talisman.stone}, цвет ${talisman.color}, число ${talisman.number}`
    : `число ${numerology.dayNumber} и любой спокойный символ дня`;
  const signLine = sign
    ? `${sign.emoji} ${sign.name}: ${pickLine(signDailyProfiles[sign.slug].focus, seed, 9)}`
    : "если выбрать знак, появится личный оттенок трактовки";

  return {
    label: normalized.label,
    safeKey: angelSafeKey(normalized.label),
    isValid: true,
    patternType,
    meaning: exactMeaning ?? `${pickLine(pattern.meaning, seed, 1)}: ${digitTheme.meaning}.`,
    highlights: pickLine(pattern.highlights, seed, 2),
    love: pickLine(pattern.love, seed, 3),
    workMoney: pickLine(pattern.workMoney, seed, 4),
    intuition: pickLine(pattern.intuition, seed, 5),
    actions: pickUniqueLines([...pattern.actions, digitTheme.action, ...numerologyLines.advice], seed, 6, 3),
    avoid: pickUniqueLines([...pattern.avoid, digitTheme.avoid, ...numerologyLines.risks], seed, 7, 3),
    phrase,
    next24Hours: pickLine(pattern.next24Hours, seed, 8),
    vipBlocks: vipFreeAccess
      ? [
          { title: "❤️ Любовь глубже", text: `${pickLine(pattern.love, seed, 10)} Лучший формат: спокойное сообщение без проверки чувств.` },
          { title: "💼 Дела и деньги", text: `${pickLine(pattern.workMoney, seed, 11)} Символически число ${digitRoot} просит зрелого выбора.` },
          { title: "🌙 Интуиция", text: `${pickLine(pattern.intuition, seed, 12)} Свяжите знак с мыслью, которая была рядом.` },
          { title: "✅ Личное действие", text: pickLine([...pattern.actions, digitTheme.action], seed, 13) },
          { title: "⚠️ Осторожность", text: pickLine([...pattern.avoid, digitTheme.avoid], seed, 14) },
          { title: "♈ Связь со знаком", text: signLine },
          { title: "🧿 Талисман дня", text: talismanLine },
          { title: "🔢 Нумерология", text: `Число дня ${numerology.dayNumber}${numerology.lifePath ? `, число пути ${numerology.lifePath}` : ""}: ${numerology.advice}` },
          { title: "🔤 Именной резонанс", text: hasName ? "имя учтено только на экране: резонанс усиливает личный смысл фразы настройки" : "добавьте имя, если хотите увидеть именной оттенок без сохранения данных" },
        ]
      : [],
  };
}

function buildLunarCalendarProfile(sign: ZodiacSign, dateKey: string): LunarCalendarProfile {
  const seed = hashString(`${sign.slug}:${dateKey}:lunar`);
  const rhythm = pickLine(["день мягкого накопления сил", "день спокойного разговора", "день внутренней уборки", "день бережного старта"], seed, 1);
  return {
    title: `${formatZodiacDisplayDate(dateKey)} · ${sign.emoji} ${sign.name}`,
    rhythm,
    love: pickLine(["лучше выбирать тёплый тон и не требовать быстрых признаний", "подходит маленькое внимание без проверки чувств", "полезно говорить о желаниях простыми словами"], seed, 2),
    workMoney: pickLine(["день хорош для ревизии задач и спокойных покупок", "лучше не спешить с крупным решением", "поддержит план с запасом времени"], seed, 3),
    talks: pickLine(["заходите через вопрос, а не через вывод", "сначала уточните настроение собеседника", "короткая формулировка будет сильнее длинного объяснения"], seed, 4),
    reconciliation: pickLine(["можно сделать мягкий шаг навстречу", "лучше начать с признания эмоций", "подойдёт пауза и короткое доброе сообщение"], seed, 5),
    action: pickLine(["разберите одну маленькую задачу", "освободите вечер от лишнего шума", "сделайте жест заботы"], seed, 6),
    avoid: pickLine(["не драматизировать молчание", "не спорить на усталости", "не обещать из чувства вины"], seed, 7),
  };
}

function buildDailyTalismanProfile(sign: ZodiacSign, dateKey: string): DailyTalismanProfile {
  const seed = hashString(`${sign.slug}:${dateKey}:talisman`);
  const stones = zodiacStoneProfiles[sign.slug];
  return {
    stone: pickLine([stones.mainStone, stones.loveStone, stones.calmStone, stones.workStone], seed, 1),
    color: pickLine(["золотой", "глубокий синий", "молочный", "изумрудный", "серебристый", "ягодный"], seed, 2),
    number: variance(seed, 3, 9) + 1,
    phrase: pickLine(["я выбираю спокойный шаг", "моё тепло сильнее спешки", "я слышу себя и говорю ясно", "мне можно двигаться мягко"], seed, 4),
    action: pickLine(["носите рядом небольшой символ", "начните день с одного ясного намерения", "выберите цвет как визуальную опору"], seed, 5),
    avoid: pickLine(["не превращайте талисман в обещание результата", "не спорьте с собой из-за настроения", "не берите на себя чужой темп"], seed, 6),
  };
}

function buildDreamProfile(symbolKey: string, dreamText: string, sign: ZodiacSign | null, dateKey: string): DreamProfile {
  const safeSymbol = dreamSymbols.find((item) => item.key === symbolKey) ?? dreamSymbols[0];
  const seed = hashString(`${safeSymbol.key}:${sign?.slug ?? "no-sign"}:${dateKey}:${dreamText ? "has-text" : "no-text"}`);
  return {
    safeKey: safeSymbol.key,
    symbol: safeSymbol.label,
    general: safeSymbol.general,
    emotional: safeSymbol.emotional,
    highlight: safeSymbol.highlight,
    advice: safeSymbol.advice,
    signConnection: sign ? `${sign.emoji} ${sign.name}: ${pickLine(signWeeklyProfiles[sign.slug].theme, seed, 1)}` : "если выбрать знак, появится личный оттенок",
  };
}

function buildGiftBySignProfile(sign: ZodiacSign, recipientType: GiftRecipientType, dateKey: string): GiftBySignProfile {
  const seed = hashString(`${sign.slug}:${recipientType}:${dateKey}:gift`);
  const byElement: Record<string, string[]> = {
    fire: ["яркое впечатление", "билет на событие", "аксессуар с характером", "набор для активности", "личное письмо с планом свидания"],
    earth: ["качественная вещь для дома", "красивый ежедневник", "уходовый набор", "тёплый плед", "сертификат на спокойный вечер"],
    air: ["книга с заметкой", "настольная игра", "необычная подписка без оплаты сейчас", "стильный блокнот", "мини-путешествие по городу"],
    water: ["аромат для дома", "альбом воспоминаний", "украшение с символом", "чайный набор", "вечер без спешки и телефона"],
  };
  const recipient = giftRecipientOptions.find((item) => item.id === recipientType)?.label ?? "партнёр";
  return {
    sign,
    recipientLabel: recipient,
    ideas: pickUniqueLines(byElement[sign.element] ?? byElement.fire, seed, 1, 5),
    appreciates: pickLine(["внимание к деталям", "личный смысл подарка", "честное качество", "красивую подачу"], seed, 2),
    avoid: pickLine(["слишком безличный сувенир", "подарок с намёком на обязанность", "вещь, выбранная в спешке"], seed, 3),
    symbolic: pickLine(["камень знака в маленьком мешочке", "открытка с фразой дня", "цвет дня в упаковке"], seed, 4),
    premium: pickLine(["выходной-сюрприз с маршрутом", "персональный набор впечатлений", "качественная вещь, которая прослужит долго"], seed, 5),
  };
}

function buildNameCompatibilityProfile(firstRaw: string, secondRaw: string, sign: ZodiacSign | null, dateKey: string): NameCompatibilityProfile | null {
  const firstName = normalizeName(firstRaw);
  const secondName = normalizeName(secondRaw);
  if (!firstName || !secondName) return null;
  const seed = hashString(`${firstName.toLocaleLowerCase("ru-RU")}:${secondName.toLocaleLowerCase("ru-RU")}:${sign?.slug ?? "no-sign"}:${dateKey.slice(0, 7)}`);
  return {
    title: "Резонанс имён",
    emotional: pickLine(["эмоционально имена звучат мягко и могут быстро создавать ощущение близости", "связь строится через уважение к разному темпу", "есть живой интерес, если не давить выводами"], seed, 1),
    communication: pickLine(["лучше говорить коротко и прямо", "помогают уточняющие вопросы", "важно не путать паузу с холодностью"], seed, 2),
    attraction: pickLine(["притяжение держится на любопытстве и тёплых жестах", "симпатия усиливается через совместные планы", "сильнее всего работает спокойная надёжность"], seed, 3),
    conflictRisk: pickLine(["риск появляется, когда один ждёт догадки вместо просьбы", "напряжение растёт от молчаливых проверок", "лучше не спорить о тоне на пике эмоций"], seed, 4),
    reconciliation: pickLine(["начните с короткого признания: я услышал(а), что тебе было неприятно", "подойдёт мягкое сообщение без длинных объяснений", "пауза и одна конкретная просьба помогут вернуться к диалогу"], seed, 5),
    helps: pickLine(["повторять договорённости простыми словами", "держать регулярные маленькие знаки внимания", "разделять чувства и факты"], seed, 6),
    avoid: pickLine(["не сравнивать с прошлым", "не проверять любовь молчанием", "не делать вывод по одному сообщению"], seed, 7),
  };
}

function buildPersonalityArchetypeProfile(
  person: PersonState,
  sign: ZodiacSign | null,
  chineseHoroscope: ChineseHoroscope | null,
  numerology: NumerologyProfile,
  talisman: DailyTalismanProfile | null,
  dateKey: string,
): PersonalityArchetypeProfile {
  const resolvedSign = sign ?? findSign(person.sign || "gemini");
  const parsed = parseBirthDate(person.birthDate);
  const hasName = Boolean(normalizeName(person.name));
  const seed = hashString(`${resolvedSign.slug}:${parsed.ok ? parsed.iso : "no-date"}:${hasName}:${dateKey}:archetype`);
  const title = pickLine(
    [
      `Стратег тепла ${resolvedSign.emoji}`,
      `Тихий магнит ${resolvedSign.emoji}`,
      `Проводник ясности ${resolvedSign.emoji}`,
      `Хранитель ритма ${resolvedSign.emoji}`,
    ],
    seed,
    1,
  );
  return {
    title,
    coreStrength: pickLine(signDailyProfiles[resolvedSign.slug].focus, seed, 2),
    shadowRisk: pickLine(numerologyLines.risks, seed, 3),
    relationship: chineseHoroscope?.relationshipStyle ?? pickLine(weeklyGuidanceByElement[resolvedSign.element].love, seed, 4),
    workMoney: chineseHoroscope?.workMoneyStyle ?? pickLine(weeklyGuidanceByElement[resolvedSign.element].money, seed, 5),
    talisman: talisman ? `${talisman.stone}, цвет ${talisman.color}` : buildZodiacStoneProfile(resolvedSign).mainStone,
    monthAdvice: pickLine([numerology.advice, ...nameMonthAdviceLines], seed, 6),
    completeness: parsed.ok || hasName ? "профиль собран по доступным данным, без сохранения имени или даты" : "частичный профиль: добавьте имя или дату, если хотите больше деталей",
  };
}


function reduceNumber(value: number) {
  let current = Math.abs(Math.trunc(value));
  while (current > 9) {
    current = String(current)
      .split("")
      .reduce((total, digit) => total + Number(digit), 0);
  }
  return current || 1;
}

function normalizeAngelTimeInput(value: string): { ok: true; label: string; hour: number; minute: number } | { ok: false; label: "" } {
  const raw = String(value || "").trim();
  const directMatch = raw.match(/^(\d{1,2})\D+(\d{1,2})$/);
  const digits = raw.replace(/\D/g, "");
  let hour: number | null = null;
  let minute: number | null = null;

  if (directMatch) {
    hour = Number(directMatch[1]);
    minute = Number(directMatch[2]);
  } else if (digits.length === 3) {
    hour = Number(digits.slice(0, 1));
    minute = Number(digits.slice(1, 3));
  } else if (digits.length === 4) {
    hour = Number(digits.slice(0, 2));
    minute = Number(digits.slice(2, 4));
  }

  if (hour === null || minute === null || hour < 0 || hour > 23 || minute < 0 || minute > 59) return { ok: false, label: "" };
  return {
    ok: true,
    label: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
    hour,
    minute,
  };
}

function formatAngelTimeInputForDisplay(value: string) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  if (digits.length === 3) return `${digits.slice(0, 1)}:${digits.slice(1)}`;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function angelSafeKey(label: string) {
  const normalized = normalizeAngelTimeInput(label);
  return normalized.ok ? `angel_${normalized.label.replace(":", "")}` : "angel_custom";
}

function classifyAngelNumberPattern(label: string): AngelNumberPatternType {
  if (angelAmplifiedSet.has(label)) return "amplified";
  if (angelMirrorSet.has(label)) return "mirror";
  if (angelRepeatingSet.has(label)) return "repeated";
  return "fallback";
}

function formatAngelPatternLabel(patternType: AngelNumberPatternType) {
  return angelPatternProfiles[patternType]?.label ?? angelPatternProfiles.fallback.label;
}

function buildExactAngelMeaning(label: string) {
  const lines: Record<string, string> = {
    "00:00": "00:00 может означать символическую точку перезапуска: сначала тишина, потом новый выбор.",
    "10:10": "10:10 может подсвечивать момент ясного старта: мысль уже созрела, осталось выбрать спокойный первый шаг.",
    "11:11": "11:11 в эзотерической трактовке связано с намерением, фокусом и честной формулировкой желания.",
    "12:12": "12:12 символически связано с балансом: личное пространство и близость просят мягкой настройки.",
    "15:15": "15:15 может означать обновление привычки и бережный выход из старого сценария.",
    "20:20": "20:20 подсвечивает терпение, диалог и важность не торопить ответ.",
    "21:12": "21:12 может быть зеркальным напоминанием: сначала услышать себя, потом другого человека.",
    "22:22": "22:22 связано с доверием, устойчивостью и решениями, которые строятся не за один разговор.",
    "02:22": "02:22 может подсвечивать мягкое восстановление контакта и бережную просьбу о диалоге.",
  };
  return lines[label];
}

function isNameVowel(value: string) {
  return "аеёиоуыэюяіїєaeiouy".includes(value.toLocaleLowerCase("ru-RU"));
}

function pairSeed(self: PersonState, partner: PersonState, dateKey: string, scope: string) {
  return hashString(`${pairKey(self, partner)}:${dateKey}:${scope}`);
}

function pairKey(self: PersonState, partner: PersonState) {
  return [self.sign, partner.sign, normalizeName(self.name), normalizeName(partner.name)].join("|");
}

function buildReconciliationStatus(score: number, seed: number) {
  if (score >= 70) return "да";
  if (score >= 50) return variance(seed, 1, 2) === 0 ? "осторожно" : "да, но мягко";
  return "лучше позже";
}

function scoreBand(score: number): "strong" | "medium" | "tense" {
  if (score >= 70) return "strong";
  if (score >= 55) return "medium";
  return "tense";
}

function buildNameResonance(selfNameRaw: string, partnerNameRaw: string): NameResonance | null {
  const selfName = normalizeName(selfNameRaw);
  const partnerName = normalizeName(partnerNameRaw);
  if (!selfName || !partnerName) return null;

  const seed = hashString(`${selfName.toLocaleLowerCase("ru-RU")}|${partnerName.toLocaleLowerCase("ru-RU")}`);
  const communicationShift = variance(seed, 1, 9) - 4;
  const loveShift = communicationShift === 0 ? Math.max(1, variance(seed, 2, 9) - 4) : variance(seed, 2, 9) - 4;
  const tone = communicationShift + loveShift >= 3 ? "warm" : communicationShift + loveShift <= -3 ? "careful" : "balanced";
  const texts = nameResonanceLines[tone];
  const advice = nameResonanceAdvice[tone];

  return {
    text: pickLine(texts, seed, 3),
    adviceText: pickLine(advice, seed, 4),
    communicationShift,
    loveShift,
  };
}

const chineseElements = ["Дерево", "Огонь", "Земля", "Металл", "Вода"];

const chineseElementTone: Record<string, string[]> = {
  Дерево: ["рост, гибкость и умение договариваться", "интерес к развитию и новым связям"],
  Огонь: ["яркость, инициативу и желание действовать сердцем", "смелость проявляться и быстро зажигаться идеей"],
  Земля: ["устойчивость, практичность и внимание к реальным шагам", "спокойный темп и умение удерживать опору"],
  Металл: ["собранность, честность и точность в решениях", "внутренний стержень и уважение к правилам"],
  Вода: ["интуицию, мягкость и способность чувствовать настроение", "пластичность и глубину в общении"],
};

const chineseAnimalProfiles = [
  {
    animal: "Крыса",
    emoji: "🐀",
    summary: "Крыса символически связана с наблюдательностью, быстрым умом и умением видеть возможности.",
    strengths: ["быстро замечает детали и умеет находить короткий путь к решению", "сильна в переговорах, планировании и бережном обращении с ресурсами"],
    risks: ["может тревожиться из-за неопределённости и проверять людей чаще, чем нужно", "иногда держит слишком много планов в голове и устаёт от контроля"],
    relationshipStyle: ["в отношениях важны умный диалог, надёжность и чувство, что рядом можно быть честным", "лучше раскрывается через лёгкий юмор, интерес и регулярные маленькие знаки внимания"],
    workMoneyStyle: ["в делах помогает расчёт, гибкость и умение заранее видеть риски", "деньги лучше идут через систему, запасной план и спокойный выбор"],
    compatible: ["Дракон", "Обезьяна", "Бык"],
    balancing: ["Лошадь", "Коза"],
  },
  {
    animal: "Бык",
    emoji: "🐂",
    summary: "Бык символически связан с устойчивостью, терпением и силой доводить начатое.",
    strengths: ["умеет держать слово и создавать ощущение надёжной опоры", "сильнее всего проявляется там, где нужен план, качество и выдержка"],
    risks: ["может упрямиться, когда проще было бы пересмотреть маршрут", "иногда слишком долго терпит и говорит о потребностях поздно"],
    relationshipStyle: ["в любви ценит постоянство, уважение к быту и действия вместо громких обещаний", "раскрывается рядом с теми, кто не торопит и не обесценивает его темп"],
    workMoneyStyle: ["в работе выигрывает через дисциплину, устойчивый график и понятные правила", "финансовый фокус лучше держать через долгий план без резких решений"],
    compatible: ["Крыса", "Змея", "Петух"],
    balancing: ["Коза", "Лошадь"],
  },
  {
    animal: "Тигр",
    emoji: "🐅",
    summary: "Тигр символически связан со смелостью, независимостью и сильным внутренним импульсом.",
    strengths: ["умеет начинать, вдохновлять и защищать важное", "быстро чувствует, где нужна честность и живое действие"],
    risks: ["может торопиться с выводами или спорить из желания вернуть свободу", "иногда выбирает риск там, где помогла бы пауза"],
    relationshipStyle: ["в отношениях важны уважение к свободе, прямота и живая эмоциональная искра", "лучше раскрывается рядом с партнёром, который не тушит инициативу"],
    workMoneyStyle: ["в работе силён в старте, лидерстве и ситуациях, где нужна смелость", "деньги требуют паузы перед импульсивными покупками и ставками на настроение"],
    compatible: ["Лошадь", "Собака", "Свинья"],
    balancing: ["Обезьяна", "Змея"],
  },
  {
    animal: "Кролик",
    emoji: "🐇",
    summary: "Кролик символически связан с тонкостью, дипломатией и умением создавать мягкую атмосферу.",
    strengths: ["замечает настроение людей и умеет сглаживать острые углы", "сильнее всего проявляется через вкус, заботу и тактичность"],
    risks: ["может избегать прямого разговора, чтобы не нарушить мир", "иногда слишком долго выбирает безопасность вместо ясности"],
    relationshipStyle: ["в любви важны нежность, уважение к границам и спокойное пространство", "лучше раскрывается там, где не нужно защищаться от резкости"],
    workMoneyStyle: ["в работе помогает аккуратность, эстетика и умение договариваться", "финансовый фокус лучше держать через понятные цели и мягкую дисциплину"],
    compatible: ["Коза", "Свинья", "Собака"],
    balancing: ["Петух", "Дракон"],
  },
  {
    animal: "Дракон",
    emoji: "🐉",
    summary: "Дракон символически связан с масштабом, харизмой и способностью видеть большую цель.",
    strengths: ["умеет вдохновлять, собирать людей вокруг идеи и мыслить широко", "быстро поднимает энергию там, где другим не хватает уверенности"],
    risks: ["может брать слишком много на себя и ждать такого же масштаба от других", "иногда пропускает детали, если слишком увлечён большой картиной"],
    relationshipStyle: ["в отношениях важны восхищение, честность и пространство для яркого проявления", "лучше раскрывается рядом с теми, кто уважает силу и при этом мягко возвращает к деталям"],
    workMoneyStyle: ["в работе силён в стратегии, публичности и больших задачах", "деньги лучше держать через реалистичный план, а не только через вдохновение"],
    compatible: ["Крыса", "Обезьяна", "Петух"],
    balancing: ["Собака", "Кролик"],
  },
  {
    animal: "Змея",
    emoji: "🐍",
    summary: "Змея символически связана с глубиной, интуицией и умением чувствовать скрытые мотивы.",
    strengths: ["видит нюансы, умеет ждать правильного момента и выбирать точные слова", "сильна в анализе, стратегии и тонких переговорах"],
    risks: ["может закрываться, если не чувствует доверия", "иногда слишком долго проверяет ситуацию вместо прямого шага"],
    relationshipStyle: ["в любви важны доверие, глубина и уважение к личному пространству", "лучше раскрывается через спокойную честность и отсутствие давления"],
    workMoneyStyle: ["в работе помогает исследование, концентрация и умение не раскрывать план раньше времени", "финансовые решения лучше принимать без подозрительности и крайностей"],
    compatible: ["Бык", "Петух", "Обезьяна"],
    balancing: ["Тигр", "Свинья"],
  },
  {
    animal: "Лошадь",
    emoji: "🐎",
    summary: "Лошадь символически связана со свободой, движением и живым интересом к жизни.",
    strengths: ["быстро оживляет пространство, умеет заражать энтузиазмом и действовать смело", "сильна там, где нужен темп, контакт и вдохновение"],
    risks: ["может уставать от рутины и бросать начатое раньше результата", "иногда реагирует быстрее, чем успевает услышать другого"],
    relationshipStyle: ["в любви важны свобода, лёгкость и честный разговор без контроля", "лучше раскрывается рядом с теми, кто поддерживает движение, но не давит"],
    workMoneyStyle: ["в работе помогает энергия старта, коммуникация и мобильность", "финансовый фокус требует ритма: короткие планы лучше длинных обещаний"],
    compatible: ["Тигр", "Собака", "Коза"],
    balancing: ["Крыса", "Бык"],
  },
  {
    animal: "Коза",
    emoji: "🐐",
    summary: "Коза символически связана с мягкостью, творчеством и тонким чувством гармонии.",
    strengths: ["умеет создавать уют, замечать красоту и поддерживать людей деликатно", "сильна в творчестве, заботе и задачах, где важна атмосфера"],
    risks: ["может сомневаться, если нет поддержки или понятной опоры", "иногда уходит в переживания вместо простого шага"],
    relationshipStyle: ["в отношениях важны нежность, эмоциональная безопасность и бережный тон", "лучше раскрывается рядом с теми, кто не высмеивает чувствительность"],
    workMoneyStyle: ["в работе помогает вкус, эмпатия и умение видеть человеческую сторону дела", "финансовый фокус лучше строить через поддержку, план и спокойные рамки"],
    compatible: ["Кролик", "Свинья", "Лошадь"],
    balancing: ["Бык", "Крыса"],
  },
  {
    animal: "Обезьяна",
    emoji: "🐒",
    summary: "Обезьяна символически связана с находчивостью, юмором и умением быстро перестраиваться.",
    strengths: ["легко видит нестандартные решения и оживляет сложные темы", "сильна в обучении, переговорах и задачах, где нужно соединить разные идеи"],
    risks: ["может перескакивать с одного интереса на другой", "иногда шутит там, где человеку нужна серьёзность и тепло"],
    relationshipStyle: ["в любви важны игра, интеллект и чувство, что рядом не скучно", "лучше раскрывается, когда юмор сочетается с надёжностью"],
    workMoneyStyle: ["в работе помогает гибкость, быстрый ум и навык находить обходные пути", "деньги лучше держать через ясный приоритет, чтобы идеи не распыляли ресурс"],
    compatible: ["Крыса", "Дракон", "Змея"],
    balancing: ["Тигр", "Свинья"],
  },
  {
    animal: "Петух",
    emoji: "🐓",
    summary: "Петух символически связан с точностью, выразительностью и вниманием к порядку.",
    strengths: ["видит детали, умеет держать форму и говорить прямо", "сильнее всего проявляется там, где нужна ясность, стиль и ответственность"],
    risks: ["может критиковать резче, чем хотел", "иногда слишком много внимания отдаёт идеальной картинке"],
    relationshipStyle: ["в любви важны честность, уважение и понятные договорённости", "лучше раскрывается рядом с теми, кто ценит старание и не спорит ради спора"],
    workMoneyStyle: ["в работе помогает дисциплина, точность и умение улучшать качество", "финансовый фокус лучше держать через аккуратный учёт и спокойный тон к себе"],
    compatible: ["Бык", "Змея", "Дракон"],
    balancing: ["Кролик", "Собака"],
  },
  {
    animal: "Собака",
    emoji: "🐕",
    summary: "Собака символически связана с верностью, справедливостью и внутренним чувством правды.",
    strengths: ["умеет поддерживать, защищать и держать слово", "сильна там, где важны доверие, команда и честные правила"],
    risks: ["может тревожиться из-за несправедливости и ждать подвоха", "иногда берёт слишком много ответственности за чужое состояние"],
    relationshipStyle: ["в любви важны доверие, честность и спокойная верность без игр", "лучше раскрывается рядом с теми, кто не обесценивает её заботу"],
    workMoneyStyle: ["в работе помогает надёжность, командность и чувство ответственности", "финансовые решения лучше принимать без страха всё потерять или всем помочь сразу"],
    compatible: ["Тигр", "Лошадь", "Кролик"],
    balancing: ["Дракон", "Петух"],
  },
  {
    animal: "Свинья",
    emoji: "🐖",
    summary: "Свинья символически связана с щедростью, чувственностью и умением ценить простую радость.",
    strengths: ["умеет создавать тепло, доверять жизни и поддерживать близких", "сильна в заботе, терпении и задачах, где важна человечность"],
    risks: ["может соглашаться из доброты чаще, чем ей полезно", "иногда избегает сложного разговора ради мира"],
    relationshipStyle: ["в любви важны искренность, нежность и ощущение дома", "лучше раскрывается рядом с теми, кто ценит тепло и не пользуется мягкостью"],
    workMoneyStyle: ["в работе помогает терпение, доброжелательность и умение объединять людей", "финансовый фокус лучше держать через границы щедрости и понятный план"],
    compatible: ["Кролик", "Коза", "Тигр"],
    balancing: ["Змея", "Обезьяна"],
  },
];

const chineseMonthAdvice = [
  "на ближайший месяц выберите один главный фокус и не распыляйте силы на второстепенное",
  "лучше всего сработает спокойный разговор, где есть конкретная просьба и уважение к паузам",
  "поддержите себя простым режимом: сон, порядок в делах и один честный шаг каждый день",
  "не торопите события; мягкая последовательность сейчас сильнее резких решений",
  "добавьте больше живого контакта: вопрос, встречу или короткое сообщение без давления",
];

const zodiacStoneProfiles: Record<string, Omit<ZodiacStoneProfile, "sign">> = {
  aries: {
    mainStone: "Гранат",
    additionalStones: ["карнеол", "гематит", "рубин"],
    loveStone: "Розовый кварц традиционно считается мягким камнем для тепла и открытого сердца.",
    calmStone: "Аметист символически связан со спокойствием и паузой перед резким словом.",
    workStone: "Гематит может использоваться как личный талисман собранности и фокуса.",
    symbol: "Гранат символизирует смелость, импульс и честное действие.",
    whenToUse: "Когда нужен старт, решительность или короткий смелый разговор.",
    avoid: "Не превращайте талисман в повод давить на себя или действовать на эмоциях.",
  },
  taurus: {
    mainStone: "Изумруд",
    additionalStones: ["малахит", "розовый кварц", "агат"],
    loveStone: "Розовый кварц символически связан с нежностью и устойчивой заботой.",
    calmStone: "Агат традиционно считается камнем спокойного ритма и внутренней опоры.",
    workStone: "Малахит может использоваться как талисман аккуратного роста и практичных решений.",
    symbol: "Изумруд символизирует верность, вкус и способность беречь ценное.",
    whenToUse: "Когда важно укрепить отношения, режим, бюджет или домашнюю опору.",
    avoid: "Не использовать камень как замену разговору, плану или честному пересмотру привычек.",
  },
  gemini: {
    mainStone: "Агат",
    additionalStones: ["цитрин", "аквамарин", "тигровый глаз"],
    loveStone: "Аквамарин символически связан с ясным, мягким диалогом.",
    calmStone: "Агат помогает настроиться на более ровный темп мыслей.",
    workStone: "Цитрин традиционно связывают с идеями, контактами и рабочим тонусом.",
    symbol: "Агат символизирует гибкость, речь и соединение разных точек зрения.",
    whenToUse: "Когда нужно писать, договариваться, учиться или выбирать из нескольких идей.",
    avoid: "Не распыляться на десятки задач только потому, что каждая кажется интересной.",
  },
  cancer: {
    mainStone: "Лунный камень",
    additionalStones: ["жемчуг", "сердолик", "селенит"],
    loveStone: "Жемчуг символически связан с нежностью, памятью и семейным теплом.",
    calmStone: "Селенит может использоваться как талисман тишины и бережного восстановления.",
    workStone: "Сердолик поддерживает образ мягкой уверенности и действия без спешки.",
    symbol: "Лунный камень символизирует интуицию, эмоциональные циклы и заботу о себе.",
    whenToUse: "Когда нужно бережно обсудить чувства или вернуться к внутренней опоре.",
    avoid: "Не уходить в молчаливые ожидания вместо простых слов о потребностях.",
  },
  leo: {
    mainStone: "Солнечный камень",
    additionalStones: ["янтарь", "цитрин", "тигровый глаз"],
    loveStone: "Янтарь традиционно считается тёплым символом радости и сердечного внимания.",
    calmStone: "Тигровый глаз помогает держать образ спокойной силы без лишней драматичности.",
    workStone: "Цитрин может использоваться как талисман видимости, идей и уверенного голоса.",
    symbol: "Солнечный камень символизирует достоинство, творчество и щедрое проявление.",
    whenToUse: "Когда нужно выступить, признаться, вдохновить или поддержать собственную ценность.",
    avoid: "Не искать подтверждение ценности через спор, покупку или демонстративный жест.",
  },
  virgo: {
    mainStone: "Яшма",
    additionalStones: ["перидот", "сапфир", "агат"],
    loveStone: "Перидот символически связан с мягким обновлением и добрым взглядом на партнёра.",
    calmStone: "Яшма традиционно считается камнем устойчивости и внимания к телесному ритму.",
    workStone: "Сапфир может использоваться как талисман ясности, качества и точных решений.",
    symbol: "Яшма символизирует практичность, заботу через детали и спокойный порядок.",
    whenToUse: "Когда нужно разобрать задачи, вернуть режим или говорить без критики.",
    avoid: "Не превращать заботу в контроль и не требовать идеальности от себя или других.",
  },
  libra: {
    mainStone: "Лазурит",
    additionalStones: ["розовый кварц", "опал", "авантюрин"],
    loveStone: "Розовый кварц символически связан с теплом, примирением и мягкой симпатией.",
    calmStone: "Лазурит помогает настроиться на честные слова и внутреннее равновесие.",
    workStone: "Авантюрин может использоваться как талисман лёгкого выбора и дипломатии.",
    symbol: "Лазурит символизирует гармонию, вкус и ясный разговор без давления.",
    whenToUse: "Когда нужно выбрать, договориться или вернуть эстетичный порядок вокруг себя.",
    avoid: "Не соглашаться ради мира там, где давно нужен честный ответ.",
  },
  scorpio: {
    mainStone: "Обсидиан",
    additionalStones: ["гранат", "топаз", "малахит"],
    loveStone: "Гранат символически связан с глубиной чувства и честной страстью.",
    calmStone: "Обсидиан может использоваться как талисман границ и внутренней собранности.",
    workStone: "Топаз традиционно связывают с концентрацией и точным направлением силы.",
    symbol: "Обсидиан символизирует глубину, защиту личных границ и очищение от лишнего шума.",
    whenToUse: "Когда нужно сказать правду, отпустить подозрение или выбрать сильный спокойный шаг.",
    avoid: "Не использовать символ защиты как повод закрыться от доверительного разговора.",
  },
  sagittarius: {
    mainStone: "Бирюза",
    additionalStones: ["лазурит", "аметист", "содалит"],
    loveStone: "Бирюза символически связана с открытостью, дорогой и честным сердечным словом.",
    calmStone: "Аметист помогает настроиться на паузу перед слишком прямым выводом.",
    workStone: "Содалит может использоваться как талисман смысла, обучения и большого плана.",
    symbol: "Бирюза символизирует свободу, веру в путь и доброжелательную прямоту.",
    whenToUse: "Когда нужен разговор о будущем, поездка, обучение или смелый выбор направления.",
    avoid: "Не обещать больше, чем реально хочется и получается поддерживать.",
  },
  capricorn: {
    mainStone: "Оникс",
    additionalStones: ["гранат", "раухтопаз", "горный хрусталь"],
    loveStone: "Гранат символически связан с верностью и теплом, которое проявляется поступками.",
    calmStone: "Раухтопаз традиционно считается камнем заземления и спокойной выдержки.",
    workStone: "Оникс может использоваться как талисман дисциплины, статуса и долгого плана.",
    symbol: "Оникс символизирует структуру, ответственность и способность идти шаг за шагом.",
    whenToUse: "Когда нужно выдержать план, договориться о правилах или укрепить границы.",
    avoid: "Не путать контроль с безопасностью и не откладывать отдых до идеального результата.",
  },
  aquarius: {
    mainStone: "Аметист",
    additionalStones: ["флюорит", "аквамарин", "лабрадорит"],
    loveStone: "Аквамарин символически связан с дружеским теплом и свободным диалогом.",
    calmStone: "Аметист помогает настроиться на тишину и ясность в потоке идей.",
    workStone: "Флюорит может использоваться как талисман системного мышления и новых решений.",
    symbol: "Аметист символизирует независимость мысли, наблюдательность и внутреннюю свободу.",
    whenToUse: "Когда нужны идеи, команда, честный разговор или нестандартный взгляд.",
    avoid: "Не уходить в холодную дистанцию там, где близкому человеку нужна простая теплота.",
  },
  pisces: {
    mainStone: "Аквамарин",
    additionalStones: ["аметист", "лунный камень", "флюорит"],
    loveStone: "Лунный камень символически связан с нежностью, интуицией и эмоциональной близостью.",
    calmStone: "Аметист помогает настроиться на бережную паузу и ясные границы.",
    workStone: "Флюорит может использоваться как талисман структуры для творческих идей.",
    symbol: "Аквамарин символизирует мягкость, доверие, глубину и честное течение чувств.",
    whenToUse: "Когда нужно успокоить эмоции, говорить о чувствах или придать мечте форму.",
    avoid: "Не растворяться в чужом настроении и не заменять ясный план надеждой, что всё само сложится.",
  },
};

const knownNameProfiles: Record<string, { meaning: string; strength: string; risk: string; relationship: string; communication: string; work: string }> = {
  анна: {
    meaning: "Имя Анна символически связано с мягкой силой, достоинством и умением поддерживать без лишнего шума.",
    strength: "спокойная надёжность и способность быть рядом в важный момент",
    risk: "склонность терпеть дольше, чем полезно, чтобы не ранить других",
    relationship: "в отношениях раскрывается через верность, тепло и уважение к простым обещаниям",
    communication: "лучше всего звучит спокойно, ясно и без давления",
    work: "сильна там, где нужны ответственность, вкус и человеческая внимательность",
  },
  мария: {
    meaning: "Имя Мария символически связано с глубиной, заботой и внутренним достоинством.",
    strength: "умение соединять мягкость с сильным внутренним стержнем",
    risk: "риск брать на себя слишком много эмоциональной ответственности",
    relationship: "в любви важны доверие, домашнее тепло и честное отношение к чувствам",
    communication: "лучше раскрывается через тёплые слова и прямую просьбу без самокритики",
    work: "сильна в делах, где нужны терпение, эстетика и забота о результате",
  },
  александр: {
    meaning: "Имя Александр символически связано с защитой, лидерством и способностью собирать людей вокруг цели.",
    strength: "инициатива, ответственность и умение действовать, когда другим нужна опора",
    risk: "желание всё решить самому и не показывать усталость",
    relationship: "в отношениях важно учиться просить поддержку, а не только давать её",
    communication: "лучше звучит через ясные договорённости и уважение к ответу другого",
    work: "сильнее всего проявляется в задачах, где нужны решение, структура и ответственность",
  },
  елена: {
    meaning: "Имя Елена символически связано со светом, красотой и умением видеть тонкие оттенки ситуации.",
    strength: "чуткость, вкус и способность мягко объединять людей",
    risk: "сомнения из-за желания сделать красиво и правильно одновременно",
    relationship: "в отношениях важны внимание к деталям, нежность и спокойный диалог",
    communication: "лучше раскрывается через ясный тон, в котором есть и мягкость, и позиция",
    work: "сильна в проектах, где нужны эстетика, дипломатия и аккуратная организация",
  },
  олена: {
    meaning: "Имя Олена символически связано со светом, теплом и мягкой внутренней собранностью.",
    strength: "умение согревать пространство и при этом держать личную позицию",
    risk: "попытка сгладить конфликт ценой собственных потребностей",
    relationship: "в любви раскрывается через нежность, честность и уважение к личным границам",
    communication: "лучше всего звучит спокойно, без намёков и ожидания, что другой догадается",
    work: "сильна там, где нужны вкус, забота, точность и спокойная дипломатия",
  },
  владислав: {
    meaning: "Имя Владислав символически связано с достоинством, управлением силой и умением отвечать за выбранный путь.",
    strength: "воля, стратегическое мышление и способность держать направление",
    risk: "перегруз ответственностью и желание контролировать результат слишком жёстко",
    relationship: "в отношениях важно сочетать силу с тёплой открытостью и простыми словами",
    communication: "лучше звучит через спокойную уверенность, без необходимости доказывать правоту",
    work: "сильнее всего проявляется в задачах, где нужны план, лидерство и выдержка",
  },
  дарья: {
    meaning: "Имя Дарья символически связано с энергией дара, живостью и способностью быстро оживлять пространство.",
    strength: "эмоциональная выразительность, щедрость и быстрый контакт",
    risk: "резкие реакции, если тепло не встречает ответа",
    relationship: "в любви важны искренность, внимание и ощущение, что чувства не обесценивают",
    communication: "лучше раскрывается через прямой, но мягкий разговор",
    work: "сильна в задачах, где нужны энергия, контакт и красивое завершение",
  },
  дмитрий: {
    meaning: "Имя Дмитрий символически связано с земной силой, практичностью и устойчивым движением к цели.",
    strength: "надёжность, умение держать слово и решать реальные задачи",
    risk: "закрытость, когда эмоции кажутся лишними",
    relationship: "в отношениях помогает говорить о чувствах так же прямо, как о делах",
    communication: "лучше всего звучит через спокойные факты и честные намерения",
    work: "сильнее всего проявляется там, где нужен план, ответственность и практический результат",
  },
};

const nameLetterTones: Record<string, string[]> = {
  а: ["начало, открытость и желание действовать от сердца"],
  в: ["внутренний стержень, верность выбору и внимание к результату"],
  д: ["практичность, движение к делу и способность брать ответственность"],
  е: ["тонкость, наблюдательность и стремление к гармонии"],
  м: ["забота, глубина и способность удерживать тепло"],
  о: ["цельность, спокойная сила и желание видеть смысл"],
  с: ["собранность, ясность и способность замечать структуру"],
  ю: ["мягкая яркость, контактность и желание соединять людей"],
  default: ["личный оттенок, который раскрывается через звучание, привычки и выбранный темп"],
};

const nameStrengthLines = [
  "умение быстро чувствовать настроение и выбирать подходящий тон",
  "способность держать фокус и не терять себя в переменах",
  "тепло, которое проявляется через поступки и уважение к деталям",
  "внутренняя гибкость: можно менять путь, не теряя главную цель",
];

const nameRiskLines = [
  "желание понравиться может мешать говорить прямо",
  "склонность брать лишнюю ответственность, когда проще попросить о помощи",
  "риск торопиться с выводами, если эмоции накопились",
  "уход в молчание вместо короткой честной фразы",
];

const nameRelationshipLines = [
  "в отношениях раскрывается через доверие, регулярное внимание и спокойные обещания",
  "нуждается в партнёре, который уважает и нежность, и личное пространство",
  "лучше всего строит близость через разговор без давления и маленькие знаки заботы",
  "ценит честность, но сильнее слышит её в мягком тоне",
];

const nameCommunicationLines = [
  "лучше звучит, когда мысль короткая, ясная и сказана без проверки партнёра",
  "сильная сторона общения — умение соединить смысл и эмоцию",
  "важно не прятать просьбу в намёк, а говорить её спокойно и прямо",
  "слова становятся убедительнее, когда за ними есть действие",
];

const nameWorkLines = [
  "в работе помогает личная ответственность и умение доводить начатое до понятного результата",
  "сильнее раскрывается в задачах, где есть люди, смысл и пространство для выбора",
  "лучше держит деньги через спокойный план, а не через резкие эмоциональные решения",
  "умеет видеть слабое место в процессе и мягко улучшать систему",
];

const nameInnerLines = [
  "внутри много наблюдательности: перед важным шагом полезно дать себе паузу",
  "характер раскрывается через сочетание мягкости и желания держать направление",
  "внутренний мир сильнее, когда есть личный ритм и право на восстановление",
  "в глубине важно ощущать, что выбор сделан свободно, а не из давления",
];

const nameGrowthLines = [
  "развивать прямоту без резкости и мягкость без самоотмены",
  "учиться выбирать одну цель вместо нескольких параллельных ожиданий",
  "укреплять границы, не закрывая сердце",
  "развивать привычку просить поддержку раньше, чем накопится усталость",
];

const nameAdviceLines = [
  "сохраняйте свой тон: спокойная ясность сейчас сильнее попытки всем всё доказать",
  "не торопитесь объяснять себя тем, кто не готов слушать; лучше выбрать бережный момент",
  "пусть имя станет якорем: один честный шаг, одно важное слово, один понятный выбор",
  "сильнее всего вас поддержит разговор, где есть и правда, и уважение к границам",
];

const nameManifestationLines = [
  "человек проявляется через то, как держит слово в мелочах",
  "главная сила заметна в спокойной реакции, когда вокруг становится шумно",
  "лучше всего раскрывается там, где можно быть полезным без потери себя",
];

const nameOpeningLines = [
  "помогает ясный режим, тёплый круг людей и право не спешить",
  "раскрывает честный интерес к делу и ощущение, что вклад действительно нужен",
  "поддерживает среда, где ценят не только результат, но и человеческий тон",
];

const nameStressLines = [
  "может становиться резче или молчаливее, если слишком долго не говорить о потребностях",
  "может уходить в контроль, когда хочется вернуть ощущение безопасности",
  "может сомневаться в себе, если вокруг слишком много неопределённых ожиданий",
];

const namePartnerLines = [
  "подходят люди, рядом с которыми можно говорить прямо и не играть роль",
  "хорошо рядом с теми, кто держит слово и умеет быть бережным в споре",
  "подходит партнёр, который уважает личный ритм и не требует постоянного доказательства чувств",
];

const nameRelationshipAdviceLines = [
  "лучше просить конкретно: так тепло быстрее превращается в действие",
  "не проверяйте любовь молчанием; мягкая фраза работает честнее",
  "важно обсуждать границы до того, как усталость станет обидой",
];

const nameVoiceLines = [
  "сильнее всего слышится спокойная уверенность без давления",
  "люди лучше принимают мысль, когда в ней есть пример и понятный следующий шаг",
  "тёплый тон помогает сохранить влияние даже в сложном разговоре",
];

const nameMoneyLines = [
  "лучше работает план, где есть маленький запас и понятная цель",
  "деньги спокойнее движутся через регулярность, а не через резкий рывок",
  "полезно отделять желание порадовать себя от настоящей финансовой цели",
];

const nameNeedLines = [
  "быть услышанным без необходимости объяснять себя слишком долго",
  "чувствовать, что рядом есть уважение к темпу и личному пространству",
  "получать тепло не только за результат, но и за присутствие",
];

const nameResourceLines = [
  "возвращение к телу, дому и простому порядку",
  "короткий честный разговор с человеком, которому можно доверять",
  "творческий жест: текст, музыка, прогулка или красивое завершение дела",
];

const nameGrowthSupportLines = [
  "поддержит привычка каждый день завершать одну небольшую задачу",
  "усилит бережная прямота: говорить раньше и спокойнее",
  "поможет личный ритуал, который возвращает к своему центру",
];

const nameMonthAdviceLines = [
  "в этом месяце выбирайте простые договорённости и не перегружайте себя чужими ожиданиями",
  "лучший фокус месяца — ясная просьба, спокойный режим и один важный шаг",
  "месяц поддержит тех, кто бережёт энергию и не тратит её на доказательства",
  "поставьте границу там, где давно хотелось сказать мягкое, но честное нет",
];

const nameCompatibilityHints = [
  "в паре полезно проговаривать не только планы, но и настроение, с которым вы в них входите",
  "рядом подходят люди, которые слышат прямые просьбы и не обесценивают паузы",
  "лучшее сближение — маленькие регулярные действия, а не редкие большие жесты",
  "сильнее всего отношения поддержит уважение к личному ритму друг друга",
];


function parseBirthDate(value: string): ParsedDate {
  const raw = String(value || "").trim();
  if (!raw) return { ok: false, error: "Введите дату рождения." };
  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const dotMatch = raw.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  const year = isoMatch ? Number(isoMatch[1]) : dotMatch ? Number(dotMatch[3]) : NaN;
  const month = isoMatch ? Number(isoMatch[2]) : dotMatch ? Number(dotMatch[2]) : NaN;
  const day = isoMatch ? Number(isoMatch[3]) : dotMatch ? Number(dotMatch[1]) : NaN;

  if (!Number.isInteger(day) || !Number.isInteger(month) || !Number.isInteger(year)) {
    return { ok: false, error: "Используйте формат ДД.ММ.ГГГГ." };
  }
  if (year < 1900 || year > 2100) return { ok: false, error: "Проверьте год рождения." };
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return { ok: false, error: "Такой даты не существует." };
  }

  return {
    ok: true,
    iso: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    day,
    month,
    year,
    signSlug: signFromDate(day, month),
  };
}

function signFromDate(day: number, month: number) {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "aquarius";
  return "pisces";
}


function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function positiveModulo(value: number, divisor: number) {
  return ((value % divisor) + divisor) % divisor;
}

function variance(seed: number, offset: number, spread: number) {
  return (hashString(`${seed}:${offset}`) % spread);
}

function clampScore(value: number) {
  return Math.max(28, Math.min(98, value));
}

function compatibilityLevelLabel(score: number) {
  if (score >= 85) return "сильная совместимость";
  if (score >= 70) return "хорошая совместимость";
  if (score >= 55) return "средняя совместимость";
  if (score >= 40) return "сложная совместимость";
  return "напряжённая совместимость";
}

function pickLine(items: string[], seed: number, offset: number) {
  return items[variance(seed, offset, items.length)];
}

function buildConclusion(score: number, mode: Mode, relationshipMode: RelationshipMode) {
  const modeLabel = relationshipModes.find((item) => item.id === relationshipMode)?.label ?? "отношения";
  const precision = mode === "precise" ? "Расчёт остаётся подсказкой: время и город повышают точность, но не заменяют живой разговор." : "Это мягкий ориентир для разговора.";

  if (score >= 85) return `${modeLabel}: сильная совместимость. ${precision} Берегите доверие и не забывайте о границах.`;
  if (score >= 70) return `${modeLabel}: хорошая совместимость. ${precision} Лучший результат даст спокойный диалог и уважение к разному темпу.`;
  if (score >= 55) return `${modeLabel}: средняя совместимость. ${precision} Есть ресурс, но важны границы, честные просьбы и внимание к бытовым мелочам.`;
  if (score >= 40) return `${modeLabel}: сложная совместимость. ${precision} Потребуется больше терпения, меньше резких выводов и регулярный честный разговор.`;
  return `${modeLabel}: напряжённая совместимость. ${precision} Есть риск недопонимания, поэтому особенно важны мягкий тон, паузы и ясные договорённости.`;
}

const dailyGuidanceByElement: Record<string, { advice: string[]; action: string[]; avoid: string[] }> = {
  fire: {
    advice: [
      "двигайтесь смело, но оставьте место для паузы и мягкого тона",
      "инициатива сработает лучше, если вы заранее выберете один главный фокус",
      "сегодня важнее направить энергию, чем доказывать свою правоту",
    ],
    action: [
      "закрыть дело, которое давно просит решительного шага",
      "предложить идею, встречу или разговор без лишнего давления",
      "заняться задачей, где нужен быстрый старт и ясное решение",
    ],
    avoid: [
      "резких слов, поспешных покупок и обещаний на эмоциях",
      "соревнования там, где лучше договориться",
      "попытки ускорить людей, которым нужен другой темп",
    ],
  },
  earth: {
    advice: [
      "опирайтесь на факты и выбирайте спокойный, устойчивый темп",
      "сегодня лучше укреплять основу, чем начинать всё заново",
      "практичный шаг даст больше, чем длинные размышления",
    ],
    action: [
      "разобрать деньги, документы, порядок дома или рабочий список",
      "зафиксировать договорённость и убрать один лишний риск",
      "вернуться к задаче, где нужна аккуратность и терпение",
    ],
    avoid: [
      "упрямства в простом разговоре и покупок ради настроения",
      "затягивания решения только из-за привычки",
      "критики себя за то, что ещё можно спокойно поправить",
    ],
  },
  air: {
    advice: [
      "говорите короче и точнее: ясность сегодня притягивает нужных людей",
      "одна хорошая мысль станет сильнее, если сразу дать ей форму",
      "выбирайте лёгкий диалог без лишних обещаний",
    ],
    action: [
      "написать, уточнить, договориться или разобрать сообщения",
      "собрать идеи в список и выбрать одну для действия",
      "обновить план встречи, звонка или небольшого проекта",
    ],
    avoid: [
      "суеты, параллельных обещаний и спорных формулировок",
      "информационного шума, который сбивает с главного",
      "разговора ради разговора, если уже пора сделать шаг",
    ],
  },
  water: {
    advice: [
      "берегите внутреннее спокойствие и не принимайте чужой тон слишком близко",
      "интуиция поможет, если рядом есть простой план",
      "мягкость сегодня сильнее, когда у неё есть границы",
    ],
    action: [
      "поговорить с близким человеком спокойно и честно",
      "закрыть тонкий вопрос без давления и драматичных выводов",
      "уделить внимание дому, отдыху или эмоциональной опоре",
    ],
    avoid: [
      "молчаливых обид и решений из тревоги",
      "возвращения к старым переживаниям без новой причины",
      "чужих эмоций, которые забирают слишком много сил",
    ],
  },
};

const dailyForecastLines = [
  "день подходит для аккуратного выбора и одного уверенного действия. Не распыляйтесь, и нужная дверь откроется спокойнее.",
  "события могут идти волнами, поэтому держите фокус на главном и не торопитесь с окончательными выводами.",
  "хорошо работают честные разговоры, маленькие шаги и внимание к деталям, которые раньше ускользали.",
  "день мягко подталкивает к обновлению планов. Больше пользы принесёт простое решение, а не попытка всё контролировать.",
  "лучше выбирать то, что укрепляет отношения, здоровье и внутреннюю устойчивость. Спешка сегодня не главный союзник.",
];

const weeklyGuidanceByElement: Record<string, { theme: string[]; love: string[]; money: string[]; energy: string[]; advice: string[] }> = {
  fire: {
    theme: [
      "смелый шаг без лишнего давления",
      "выбор главной цели и честный разговор о желаниях",
      "новый импульс, который важно направить в одно дело",
    ],
    love: [
      "тепло растёт через внимание, комплименты и готовность слушать",
      "меньше борьбы за лидерство, больше игры и уважения",
      "романтика оживает, если не торопить ответ партнёра",
    ],
    money: [
      "подходят быстрые, но просчитанные решения",
      "лучше закрывать короткие задачи и не спорить из-за мелочей",
      "новая идея полезна, если у неё есть понятный срок",
    ],
    energy: [
      "высокая, но требует пауз, сна и бережного режима",
      "поднимается через движение и ясный план",
      "нестабильна при спешке, зато сильна в коротких рывках",
    ],
    advice: [
      "не доказывайте силу, покажите зрелость",
      "выберите один главный огонь и не распаляйте всё вокруг",
      "делайте первый шаг, но оставляйте людям право на свой темп",
    ],
  },
  earth: {
    theme: [
      "устойчивость, порядок и возвращение контроля",
      "практичные решения вместо эмоциональной спешки",
      "укрепление того, что уже приносит пользу",
    ],
    love: [
      "нежность лучше выражать делом, заботой и надёжностью",
      "разговоры о быте и планах могут сблизить сильнее романтики",
      "важно не превращать заботу в контроль",
    ],
    money: [
      "хорошая неделя для бюджета, документов и ясных договорённостей",
      "осторожные шаги принесут больше, чем рискованные покупки",
      "можно укрепить доход через дисциплину и проверку деталей",
    ],
    energy: [
      "ровная, если не брать на себя лишнюю ответственность",
      "растёт от режима, чистого пространства и понятного списка",
      "просит тишины, сна и меньшего количества раздражителей",
    ],
    advice: [
      "не держитесь за старую схему, если новая уже надёжнее",
      "оставьте место для гибкости и тёплого разговора",
      "сначала база, потом большие решения",
    ],
  },
  air: {
    theme: [
      "общение, идеи и точные формулировки",
      "новые контакты, которые стоит сразу переводить в действие",
      "лёгкость, если убрать лишний шум",
    ],
    love: [
      "сближает честная переписка, разговор или совместная идея",
      "лучше говорить прямо, не проверяя чувства намёками",
      "романтика приходит через интерес и чувство свободы",
    ],
    money: [
      "подходят переговоры, заявки, письма и маленькие сделки",
      "важно считать ресурсы, а не только вдохновляться возможностями",
      "полезно обновить план и убрать задачи без результата",
    ],
    energy: [
      "быстрая, но может распыляться",
      "зависит от качества информации и спокойного режима",
      "становится выше, когда в расписании меньше хаоса",
    ],
    advice: [
      "сначала ясность, потом обещания",
      "оставьте в неделе место для тишины и одного глубокого дела",
      "не отвечайте сразу, если хочется спорить",
    ],
  },
  water: {
    theme: [
      "эмоциональная ясность и мягкое восстановление",
      "границы, близость и честность без драматичных выводов",
      "интуиция, которую стоит подкрепить фактами",
    ],
    love: [
      "бережный разговор может снять старое напряжение",
      "тепло растёт через поддержку, а не через проверки",
      "лучше говорить о чувствах простыми словами",
    ],
    money: [
      "не принимайте финансовые решения из тревоги",
      "полезно разобрать расходы и убрать лишнюю неопределённость",
      "работа идёт легче, если есть спокойная атмосфера",
    ],
    energy: [
      "мягкая, чувствительная к окружению",
      "восстанавливается через сон, воду, дом и паузы",
      "просит меньше чужих проблем и больше личного пространства",
    ],
    advice: [
      "не угадывайте за других, спросите прямо",
      "оставьте прошлое там, где оно не помогает сегодняшнему выбору",
      "доверяйте ощущениям, но проверяйте важные детали",
    ],
  },
};

const luckyStatuses = ["🍀 удачный день", "⚖️ нейтральный день", "⚠️ осторожнее"];
const luckyAreas = ["любовь", "деньги", "дела", "отдых", "разговоры", "покупки", "документы"];


function natalTimeTone(value: string): NatalTimeTone {
  if (!isValidTime(value)) return "unknown";
  const hour = Number(value.slice(0, 2));
  if (hour >= 5 && hour < 11) return "morning";
  if (hour >= 11 && hour < 17) return "day";
  if (hour >= 17 && hour < 23) return "evening";
  return "night";
}

function natalCityTone(city: City | null): NatalCityTone {
  if (!city) return "open";
  if (city.latitude >= 50) return "north";
  if (city.latitude <= 35) return "south";
  if (city.longitude >= 50) return "east";
  if (city.longitude <= 20) return "west";
  return "open";
}

function pickUniqueLines(items: string[], seed: number, offset: number, count: number) {
  const available = Array.from(new Set(items));
  return Array.from({ length: Math.min(count, available.length) }, (_, index) => {
    const item = pickLine(available, seed, offset + index);
    available.splice(available.indexOf(item), 1);
    return item;
  });
}

const natalElementProfiles: Record<string, {
  energyTypes: string[];
  emotionalStyles: string[];
  strengths: string[];
  risks: string[];
  relationshipNeeds: string[];
  monthAdvice: string[];
  stress: string[];
  safety: string[];
  arguments: string[];
  attachment: string[];
  loveWounds: string[];
  partnerStyle: string[];
  motivation: string[];
  burnout: string[];
  workStyle: string[];
  businessStrengths: string[];
  moneyRisks: string[];
  growth: string[];
  relationshipAdvice: string[];
  growthPlan: string[];
  compatibilityHints: string[];
}> = {
  fire: {
    energyTypes: ["быстрая, живая, инициативная", "искренняя и смелая, когда есть ясная цель"],
    emotionalStyles: ["переживает ярко и быстро, поэтому помогает пауза перед ответом", "чувства включаются через действие и честный разговор"],
    strengths: ["смелость начинать", "умение вдохновлять", "прямота без лишней игры"],
    risks: ["поспешные решения", "резкий тон на эмоциях", "усталость от ожидания"],
    relationshipNeeds: ["важны искра, свобода и честное желание быть рядом", "нужен партнёр, который не гасит инициативу"],
    monthAdvice: ["выберите один смелый шаг и не распыляйте энергию", "сначала направление, потом скорость"],
    stress: ["в стрессе может давить темпом, хотя внутри просто хочет ясности"],
    safety: ["безопасность появляется, когда есть честность и право действовать"],
    arguments: ["в споре лучше говорить короче и не повышать градус"],
    attachment: ["привязанность проявляется через инициативу, защиту и живые жесты"],
    loveWounds: ["может ранить равнодушие, холодный тон и ощущение, что инициативу не замечают"],
    partnerStyle: ["подходит тёплый, самостоятельный партнёр с уважением к свободе"],
    motivation: ["заряжает вызов, движение и ощущение выбранного пути"],
    burnout: ["быстро выгорает там, где нужно долго ждать без обратной связи"],
    workStyle: ["работает сильнее, когда есть короткая цель и пространство для решения"],
    businessStrengths: ["умеет запускать процессы и брать ответственность в моменте"],
    moneyRisks: ["риск импульсивных покупок и решений на подъёме"],
    growth: ["важно развивать терпение и мягкую силу"],
    relationshipAdvice: ["в отношениях помогает сначала назвать желание, а потом просить ответ"],
    growthPlan: ["один день в неделю оставляйте для восстановления, а не для нового старта"],
    compatibilityHints: ["в паре полезно заранее договариваться о темпе и паузах"],
  },
  earth: {
    energyTypes: ["устойчивая, практичная, телесная", "спокойная и надёжная, когда есть понятная опора"],
    emotionalStyles: ["переживает глубоко, но раскрывается постепенно", "чувства становятся яснее через заботу и стабильность"],
    strengths: ["надёжность", "терпение", "умение доводить до результата"],
    risks: ["упрямство", "страх перемен", "желание контролировать детали"],
    relationshipNeeds: ["важны стабильность, верность и простые регулярные поступки", "нужен партнёр, который ценит спокойный ритм"],
    monthAdvice: ["укрепите базу: режим, деньги, дом или рабочий порядок", "выберите практичный шаг вместо долгих сомнений"],
    stress: ["в стрессе может замыкаться на контроле и привычных схемах"],
    safety: ["безопасность дают факты, повторяемая забота и телесный комфорт"],
    arguments: ["в споре важно не превращать принцип в стену"],
    attachment: ["привязанность проявляется через верность, помощь и постоянство"],
    loveWounds: ["может ранить нестабильность, обещания без действий и пренебрежение бытом"],
    partnerStyle: ["подходит партнёр, который умеет быть рядом спокойно и предсказуемо"],
    motivation: ["заряжает ощутимый результат и понятная польза"],
    burnout: ["быстро выгорает от хаоса, спешки и постоянной смены правил"],
    workStyle: ["работает сильнее через план, качество и аккуратный темп"],
    businessStrengths: ["видит слабые места в системе и умеет укреплять основу"],
    moneyRisks: ["риск держаться за старый финансовый сценарий дольше, чем нужно"],
    growth: ["важно развивать гибкость и доверие к новому опыту"],
    relationshipAdvice: ["в отношениях помогает говорить о потребностях до накопления усталости"],
    growthPlan: ["раз в неделю пробуйте маленькое новое действие без давления на идеальный результат"],
    compatibilityHints: ["в паре полезно разделять заботу и контроль, чтобы тепло не становилось обязанностью"],
  },
  air: {
    energyTypes: ["лёгкая, интеллектуальная, подвижная", "быстрая на идеи и контакты"],
    emotionalStyles: ["чувства легче понимать через разговор и ясные формулировки", "внутренний мир оживает, когда есть пространство для мысли"],
    strengths: ["ясность мысли", "любопытство", "умение договариваться"],
    risks: ["перегруз идеями", "уход от чувств в объяснения", "нехватка завершения"],
    relationshipNeeds: ["важны интерес, диалог и свобода быть собой", "нужен партнёр, который слышит слова и не душит контролем"],
    monthAdvice: ["сократите список идей до одной главной темы", "договоритесь письменно о том, что важно не забыть"],
    stress: ["в стрессе может говорить слишком быстро или уходить в анализ"],
    safety: ["безопасность появляется через ясные слова, честные вопросы и уважение к дистанции"],
    arguments: ["в споре лучше не выигрывать логикой, а уточнять чувства"],
    attachment: ["привязанность проявляется через интерес, переписку и желание делиться мыслями"],
    loveWounds: ["может ранить молчание без объяснений и давление на свободу"],
    partnerStyle: ["подходит партнёр, с которым можно разговаривать легко и честно"],
    motivation: ["заряжают новые идеи, люди и ощущение выбора"],
    burnout: ["быстро выгорает от рутины без смысла и бесконечных обещаний"],
    workStyle: ["работает сильнее через коммуникацию, анализ и быстрые связки"],
    businessStrengths: ["умеет видеть варианты и превращать хаос в понятную схему"],
    moneyRisks: ["риск тратить из любопытства или держать слишком много открытых планов"],
    growth: ["важно развивать глубину, последовательность и контакт с телом"],
    relationshipAdvice: ["в отношениях помогает говорить не только мысли, но и чувства"],
    growthPlan: ["каждую неделю завершайте одну маленькую задачу до конца"],
    compatibilityHints: ["в паре полезно фиксировать договорённости и не додумывать за партнёра"],
  },
  water: {
    energyTypes: ["чувствительная, глубокая, интуитивная", "мягкая и сильная через эмоциональную честность"],
    emotionalStyles: ["переживает глубоко и нуждается в бережном темпе", "чувства становятся опорой, когда есть границы"],
    strengths: ["эмпатия", "интуиция", "умение создавать близость"],
    risks: ["растворение в чужих эмоциях", "молчаливые ожидания", "уход в обиду"],
    relationshipNeeds: ["важны безопасность, нежность и эмоциональная честность", "нужен партнёр, который бережно относится к чувствам"],
    monthAdvice: ["сначала позаботьтесь о внутреннем ритме, затем принимайте решения", "назовите чувство простыми словами и не ждите угадывания"],
    stress: ["в стрессе может закрываться или принимать чужое настроение на себя"],
    safety: ["безопасность дают тепло, доверие и право быть чувствительным человеком"],
    arguments: ["в споре важно говорить прямо, не проверяя чувства молчанием"],
    attachment: ["привязанность проявляется через заботу, память о деталях и мягкое присутствие"],
    loveWounds: ["может ранить холодность, грубость и обесценивание переживаний"],
    partnerStyle: ["подходит внимательный партнёр, который не пугается глубины"],
    motivation: ["заряжает смысл, близость и ощущение нужности"],
    burnout: ["быстро выгорает от эмоциональной перегрузки и чужих драм"],
    workStyle: ["работает сильнее там, где есть доверие, красота и человеческий смысл"],
    businessStrengths: ["умеет чувствовать настроение людей и создавать поддерживающую среду"],
    moneyRisks: ["риск финансовых решений из тревоги или желания всем помочь"],
    growth: ["важно развивать границы, прямоту и спокойное различение своих чувств"],
    relationshipAdvice: ["в отношениях помогает просить поддержку прямо и вовремя"],
    growthPlan: ["каждую неделю выделяйте время на тишину, восстановление и честный разговор с собой"],
    compatibilityHints: ["в паре полезно договариваться о границах заботы и не угадывать молча"],
  },
};

const natalModalityProfiles: Record<"cardinal" | "fixed" | "mutable", {
  strengths: string[];
  risks: string[];
  monthAdvice: string[];
  selfExpression: string[];
  decisions: string[];
  partnerStyle: string[];
  burnout: string[];
  actionStyle: string[];
  workStyle: string[];
  growth: string[];
  growthPlan: string[];
}> = {
  cardinal: {
    strengths: ["умение начинать", "готовность брать инициативу", "смелость делать первый шаг"],
    risks: ["желание решить всё сразу", "нетерпение к чужому темпу", "перегруз ответственностью"],
    monthAdvice: ["начинайте с одного шага, который можно спокойно завершить", "перед стартом оставьте место для чужого мнения"],
    selfExpression: ["проявляется через действие и ясное направление", "лучше раскрывается, когда не тащит всё в одиночку"],
    decisions: ["решения принимает быстрее, если видит цель и ближайший шаг"],
    partnerStyle: ["подходит партнёр, который уважает инициативу, но умеет мягко замедлять"],
    burnout: ["выгорает, когда всё держится только на личной инициативе"],
    actionStyle: ["действовать лучше по схеме: старт, пауза, сверка, продолжение"],
    workStyle: ["сильнее всего в запуске, переговорах и выборе направления"],
    growth: ["развивать завершение, делегирование и спокойную паузу"],
    growthPlan: ["планируйте не только старт, но и точку отдыха после него"],
  },
  fixed: {
    strengths: ["устойчивость", "верность выбранному пути", "умение удерживать качество"],
    risks: ["застревание в привычном", "сопротивление переменам", "накопление напряжения молча"],
    monthAdvice: ["оставьте одну привычку, которая поддерживает, и обновите одну, которая мешает", "проверьте, где стабильность стала тесной"],
    selfExpression: ["проявляется через постоянство и сильное внутреннее ядро", "лучше раскрывается, когда есть право менять форму без потери себя"],
    decisions: ["решения принимает глубоко и редко любит давление"],
    partnerStyle: ["подходит партнёр, который не ломает ритм, а договаривается о постепенных изменениях"],
    burnout: ["выгорает от долгого напряжения без возможности обновиться"],
    actionStyle: ["действовать лучше через маленькие устойчивые изменения"],
    workStyle: ["сильнее всего в долгих задачах, качестве и сохранении результата"],
    growth: ["развивать гибкость, обновление и мягкое отпускание старого"],
    growthPlan: ["раз в неделю меняйте одну мелкую привычку и наблюдайте, что стало легче"],
  },
  mutable: {
    strengths: ["гибкость", "адаптация", "умение видеть разные стороны"],
    risks: ["распыление", "сомнения перед выбором", "усталость от чужих ожиданий"],
    monthAdvice: ["выберите один фокус и защищайте его от лишнего шума", "меньше вариантов, больше маленьких завершений"],
    selfExpression: ["проявляется через живую настройку под ситуацию", "лучше раскрывается, когда есть ясная рамка"],
    decisions: ["решения принимает легче, если сократить выбор до двух вариантов"],
    partnerStyle: ["подходит партнёр, который даёт свободу, но помогает держать общий курс"],
    burnout: ["выгорает от слишком многих ролей и незавершённых обещаний"],
    actionStyle: ["действовать лучше короткими циклами: выбрать, сделать, зафиксировать"],
    workStyle: ["сильнее всего в адаптации, обучении и соединении разных идей"],
    growth: ["развивать устойчивость, личные границы и простую систему выбора"],
    growthPlan: ["каждую неделю закрывайте один хвост, чтобы освободить внимание"],
  },
};

const natalPolarityProfiles: Record<"active" | "receptive", {
  strengths: string[];
  risks: string[];
  relationshipNeeds: string[];
  vulnerabilities: string[];
  arguments: string[];
  communication: string[];
  moneyRisks: string[];
  defenses: string[];
}> = {
  active: {
    strengths: ["умение проявляться открыто", "быстрая реакция", "инициатива в контакте"],
    risks: ["спешка с выводами", "давление на ответ", "желание быть услышанным первым"],
    relationshipNeeds: ["важна ясная обратная связь", "нужна свобода говорить прямо"],
    vulnerabilities: ["уязвимость возникает, когда инициативу встречают холодом"],
    arguments: ["в споре важно не ускорять другого человека"],
    communication: ["лучше начинать с мягкого факта и вопроса, а не с требования"],
    moneyRisks: ["финансовый риск связан с быстрыми решениями без паузы"],
    defenses: ["защита может включаться через резкость или уход в действие"],
  },
  receptive: {
    strengths: ["глубина восприятия", "чуткость", "умение замечать подтекст"],
    risks: ["молчаливые ожидания", "накопление обиды", "сложность попросить прямо"],
    relationshipNeeds: ["важны безопасность и бережный тон", "нужно время, чтобы раскрыться без давления"],
    vulnerabilities: ["уязвимость возникает, когда чувства торопят или обесценивают"],
    arguments: ["в споре важно не уходить в молчание вместо просьбы"],
    communication: ["лучше заранее назвать потребность простыми словами"],
    moneyRisks: ["финансовый риск связан с тревогой или желанием сохранить комфорт любой ценой"],
    defenses: ["защита может включаться через закрытость или проверку настроения"],
  },
};

const natalTimeProfiles: Record<NatalTimeTone, {
  energy: string;
  emotion: string;
  safety: string;
  decisions: string;
  attachment: string;
  motivation: string;
  defenses: string;
  monthActions: string[];
  bestDays: string[];
}> = {
  morning: {
    energy: "утренний импульс: легче начинать и быстро собираться",
    emotion: "эмоции яснее после движения и простого плана",
    safety: "чувство безопасности усиливает понятное начало дня",
    decisions: "решения лучше принимать после короткой проверки фактов",
    attachment: "привязанность проявляется через заботливую инициативу",
    motivation: "заряжает ощущение свежего старта",
    defenses: "в защите может торопиться с ответом",
    monthActions: ["начинайте важные дела с утра", "ставьте короткий первый шаг", "планируйте отдых до перегруза"],
    bestDays: ["лучшие дни — те, где есть ранний понятный старт", "хорошо работают встречи без затяжного ожидания"],
  },
  day: {
    energy: "дневная энергия: сильнее в ясных задачах и контактах",
    emotion: "эмоции становятся устойчивее через структуру",
    safety: "безопасность дают понятные правила и обратная связь",
    decisions: "решения лучше принимать, когда виден практический результат",
    attachment: "привязанность проявляется через участие в реальных делах",
    motivation: "заряжает видимый прогресс",
    defenses: "в защите может уходить в контроль деталей",
    monthActions: ["закрывайте дела по одному", "фиксируйте договорённости", "оставляйте окно для восстановления"],
    bestDays: ["лучшие дни — с понятной задачей и спокойным темпом", "подойдут дни для деловых разговоров и планов"],
  },
  evening: {
    energy: "вечерний ритм: сильнее в близости и творческом настрое",
    emotion: "эмоции раскрываются через атмосферу и мягкий разговор",
    safety: "безопасность усиливает тёплый контакт без спешки",
    decisions: "решения лучше принимать после паузы и внутренней сверки",
    attachment: "привязанность проявляется через внимание и присутствие",
    motivation: "заряжает красота, контакт и ощущение смысла",
    defenses: "в защите может ждать, что другой сам почувствует настроение",
    monthActions: ["планируйте важные разговоры без спешки", "добавляйте в неделю творческий вечер", "не решайте всё на пике эмоций"],
    bestDays: ["лучшие дни — с мягкой атмосферой и временем на разговор", "подойдут дни для свиданий и восстановления связи"],
  },
  night: {
    energy: "ночной ритм: глубже чувствует скрытые мотивы и тишину",
    emotion: "эмоции нуждаются в бережном выходе, а не в резких выводах",
    safety: "безопасность дают границы, сон и честная тишина",
    decisions: "решения лучше переносить на момент, когда меньше тревоги",
    attachment: "привязанность проявляется через глубокое доверие",
    motivation: "заряжает смысл и внутреннее сосредоточение",
    defenses: "в защите может уходить в молчание или подозрения",
    monthActions: ["берегите сон", "проверяйте тревожные мысли фактами", "оставляйте место для тихого восстановления"],
    bestDays: ["лучшие дни — без перегруза и с правом на тишину", "подойдут дни для глубоких разговоров без давления"],
  },
  unknown: {
    energy: "общий ритм знака без уточнения времени",
    emotion: "эмоциональный стиль описан мягко, без деталей по времени",
    safety: "безопасность усиливают ясные границы и спокойный темп",
    decisions: "решения лучше принимать после паузы и проверки ощущения",
    attachment: "привязанность проявляется через поступки, которые повторяются",
    motivation: "заряжает то, что совпадает с личным смыслом",
    defenses: "в защите важно не действовать на эмоциях",
    monthActions: ["наблюдайте, в какое время дня больше сил", "не требуйте от себя постоянного одинакового темпа", "выберите один бережный ритуал недели"],
    bestDays: ["лучшие дни — те, где есть гибкость и меньше давления", "подойдут дни с возможностью менять темп"],
  },
};

const natalCityProfiles: Record<NatalCityTone, {
  expression: string[];
  vulnerabilities: string[];
  actionStyle: string[];
  bestDays: string[];
}> = {
  north: {
    expression: ["проявляется спокойнее, когда есть выдержка и долгий горизонт"],
    vulnerabilities: ["уязвимость усиливается от эмоционального холода"],
    actionStyle: ["действовать лучше через выдержку и ясный план"],
    bestDays: ["лучше выбирать дни, где есть запас времени и меньше спешки"],
  },
  south: {
    expression: ["проявляется теплее, когда есть живой контакт и движение"],
    vulnerabilities: ["уязвимость усиливается от резкого обрыва общения"],
    actionStyle: ["действовать лучше через короткий живой шаг"],
    bestDays: ["лучше выбирать дни для встреч, движения и лёгкого контакта"],
  },
  east: {
    expression: ["проявляется через поиск смысла, обучения и нового маршрута"],
    vulnerabilities: ["уязвимость усиливается, когда нет пространства для роста"],
    actionStyle: ["действовать лучше через расширение кругозора и один новый опыт"],
    bestDays: ["лучше выбирать дни для обучения, поездок и обновления планов"],
  },
  west: {
    expression: ["проявляется через диалог, социальный такт и чувство формы"],
    vulnerabilities: ["уязвимость усиливается, когда нарушается баланс и уважение"],
    actionStyle: ["действовать лучше через переговоры и красивую простую форму"],
    bestDays: ["лучше выбирать дни для договорённостей и спокойных встреч"],
  },
  open: {
    expression: ["проявляется через личный темп без привязки к месту рождения"],
    vulnerabilities: ["уязвимость лучше смотреть через реальные реакции, а не догадки"],
    actionStyle: ["действовать лучше через простую проверку: что сейчас действительно помогает"],
    bestDays: ["лучше выбирать дни, где меньше давления и больше ясности"],
  },
};

const natalNameResonanceLines = [
  "Имя добавляет лёгкий личный оттенок: полезно замечать, какие обращения дают больше тепла.",
  "Личный ритм имени усиливает тему мягкого самовыражения и честного тона.",
  "Имя здесь используется только как лёгкий резонанс, без хранения и без передачи куда-либо.",
];

const natalNoNameLines = [
  "Имя можно не указывать: профиль всё равно строится по дате и выбранным дополнительным данным.",
  "Без имени результат остаётся нейтральнее и не теряет основную логику.",
  "Если не хочется вводить имя, достаточно даты рождения.",
];

const signTraits: Record<string, { modality: "cardinal" | "fixed" | "mutable"; polarity: "active" | "receptive" }> = {
  aries: { modality: "cardinal", polarity: "active" },
  taurus: { modality: "fixed", polarity: "receptive" },
  gemini: { modality: "mutable", polarity: "active" },
  cancer: { modality: "cardinal", polarity: "receptive" },
  leo: { modality: "fixed", polarity: "active" },
  virgo: { modality: "mutable", polarity: "receptive" },
  libra: { modality: "cardinal", polarity: "active" },
  scorpio: { modality: "fixed", polarity: "receptive" },
  sagittarius: { modality: "mutable", polarity: "active" },
  capricorn: { modality: "cardinal", polarity: "receptive" },
  aquarius: { modality: "fixed", polarity: "active" },
  pisces: { modality: "mutable", polarity: "receptive" },
};

const elementLabels: Record<string, string> = {
  fire: "огонь",
  earth: "земля",
  air: "воздух",
  water: "вода",
};

const modalityLabels: Record<string, string> = {
  cardinal: "инициатор",
  fixed: "устойчивый ритм",
  mutable: "гибкость",
};

const polarityLabels: Record<string, string> = {
  active: "внешний фокус",
  receptive: "внутренняя опора",
};

const signDailyProfiles: Record<string, { openers: string[]; focus: string[] }> = {
  aries: {
    openers: ["импульс дня просит смелого, но короткого шага", "сегодня важна инициатива без давления", "энергия включается через честное действие"],
    focus: ["Держите темп, но не превращайте разговор в соревнование.", "Лучше один точный старт, чем пять обещаний.", "Мягкий тон усилит вашу уверенность."],
  },
  taurus: {
    openers: ["день поддерживает устойчивость и заботу о базе", "лучше выбирать надёжное, а не шумное", "практичный шаг вернёт ощущение контроля"],
    focus: ["Деньги, тело и быт требуют спокойного внимания.", "Не спорьте из упрямства, если можно договориться проще.", "Красота простых решений сегодня особенно заметна."],
  },
  gemini: {
    openers: ["день раскрывается через ясные слова и быстрые уточнения", "новая мысль может стать полезной договорённостью", "общение работает лучше, если убрать лишний шум"],
    focus: ["Пишите короче, слушайте внимательнее.", "Не обещайте больше, чем готовы сделать.", "Одна точная фраза снимет больше напряжения, чем длинное объяснение."],
  },
  cancer: {
    openers: ["день просит беречь чувства и не копить молчание", "дом, близкие и внутренний ритм становятся главной опорой", "мягкость сегодня сильна, если рядом есть границы"],
    focus: ["Скажите о важном спокойно и без намёков.", "Не принимайте чужую усталость на свой счёт.", "Поддержка начинается с честного вопроса."],
  },
  leo: {
    openers: ["день помогает проявиться, если не давить на внимание", "тепло и достоинство работают лучше громких жестов", "ваша щедрость заметна, когда в ней нет ожидания ответа"],
    focus: ["Похвала и уважение откроют нужную дверь.", "Не спорьте за центр сцены.", "Покажите результат, а не только намерение."],
  },
  virgo: {
    openers: ["день подходит для точности, порядка и аккуратного выбора", "детали сегодня помогают увидеть реальную картину", "спокойная настройка процессов даст быстрый эффект"],
    focus: ["Не превращайте заботу в критику.", "Список дел лучше сократить до главного.", "Тёплая формулировка сделает просьбу сильнее."],
  },
  libra: {
    openers: ["день зовёт к балансу, но не к удобному молчанию", "важно выбрать честную гармонию, а не красивую уступку", "отношения выигрывают от ясной договорённости"],
    focus: ["Говорите прямо, но оставляйте место для другого мнения.", "Не соглашайтесь только ради спокойствия.", "Красивый жест сработает, если за ним есть смысл."],
  },
  scorpio: {
    openers: ["день усиливает глубину и просит честности без давления", "скрытое напряжение лучше назвать мягко", "интуиция работает, если не подменять её подозрением"],
    focus: ["Не проверяйте чувства молчанием.", "Границы сегодня важнее контроля.", "Откровенность будет сильнее резких выводов."],
  },
  sagittarius: {
    openers: ["день расширяет горизонт, но просит не разбрасываться", "свобода станет полезной, если есть понятный маршрут", "идея оживает через действие и честный разговор"],
    focus: ["Обещайте меньше, делайте яснее.", "Не уходите от деталей, если они держат доверие.", "Разговор о будущем лучше связать с конкретным шагом."],
  },
  capricorn: {
    openers: ["день поддерживает зрелые решения и спокойную ответственность", "структура вернёт уверенность и снизит суету", "лучше укреплять основу, чем спорить о форме"],
    focus: ["Не берите всё на себя молча.", "Чёткий план поможет и в делах, и в отношениях.", "Тепло можно показать поступком, но слова тоже важны."],
  },
  aquarius: {
    openers: ["день поднимает свежие идеи и просит уважать дистанцию", "нестандартный взгляд поможет, если не спорить ради свободы", "общение оживает через честность и лёгкость"],
    focus: ["Дайте людям понять ваш замысел простыми словами.", "Не исчезайте из диалога без объяснения.", "Совместная идея может стать точкой сближения."],
  },
  pisces: {
    openers: ["день тонкий и мягкий, поэтому особенно важны границы", "интуиция подсказывает верно, если рядом есть факт", "эмпатия сегодня сильна, когда вы не растворяетесь в чужом настроении"],
    focus: ["Не додумывайте за партнёра.", "Пауза поможет услышать себя.", "Мягкая просьба будет лучше долгого ожидания."],
  },
};

const signWeeklyProfiles: Record<string, { theme: string[] }> = Object.fromEntries(
  signs.map((sign) => [
    sign.slug,
    {
      theme: [
        `${sign.name}: главный акцент недели`,
        `${sign.name}: что стоит настроить в ближайшие дни`,
        `${sign.name}: где появится точка роста`,
      ],
    },
  ]),
) as Record<string, { theme: string[] }>;

const signLuckyProfiles: Record<string, string[]> = Object.fromEntries(
  signs.map((sign) => [
    sign.slug,
    [
      `${sign.name} выигрывает через спокойный выбор времени`,
      `${sign.name} стоит выбирать шаг без лишнего давления`,
      `${sign.name} полезно заранее проговорить ожидания`,
    ],
  ]),
) as Record<string, string[]>;

const dayEnergyTypes = ["мягкая волна", "ясный фокус", "живой диалог", "тихое восстановление", "смелый импульс", "день настройки"];
const dayEnergyBestFor = ["коротких договорённостей", "заботы о себе и близких", "планов без спешки", "честного разговора", "маленького шага к примирению", "встречи без давления"];
const dayEnergyAvoid = ["резких выводов", "разговора на повышенном тоне", "обещаний из эмоций", "молчаливых проверок", "спора ради правоты", "попытки решить всё сразу"];
const dayEnergyMoods = ["спокойное любопытство", "чуткость", "собранность", "лёгкая романтика", "бережная честность"];
const dayEnergyRelationshipTone = ["говорить проще и теплее", "сначала услышать, потом отвечать", "оставить место для паузы", "не давить на быстрый ответ", "поддержать делом и мягким словом"];

const nameResonanceLines: Record<string, string[]> = {
  warm: [
    "Ваши имена усиливают ощущение интереса и живого общения. Важно не спорить за лидерство, а поддерживать лёгкость и уважение.",
    "В именах чувствуется тёплый ритм: он помогает быстрее находить общий тон и мягче выходить из недопониманий.",
    "Именной отклик добавляет паре больше доверия и желания слышать друг друга без лишних проверок.",
  ],
  balanced: [
    "Ваши имена дают спокойный отклик: многое зависит не от первого впечатления, а от ясных слов и регулярной заботы.",
    "Именной резонанс здесь ровный. Он помогает общению, если оба говорят прямо и не копят маленькие обиды.",
    "В именах есть разный темп, но он может дополнять пару, если не торопить события и не сравнивать чувства.",
  ],
  careful: [
    "Ваши имена могут создавать разный темп в общении. Это не мешает близости, если заранее беречь тон и не давить на ответ.",
    "Именной отклик просит больше мягкости: меньше резких выводов, больше простых вопросов и спокойных объяснений.",
    "В именах есть напряжение характеров, которое можно превратить в интерес, если не спорить из-за мелочей.",
  ],
};

const nameResonanceAdvice: Record<string, string[]> = {
  warm: [
    "Добавьте больше живого диалога: этой паре полезны лёгкие вопросы, юмор и благодарность.",
    "Поддерживайте тепло маленькими знаками внимания, не превращая близость в соревнование.",
  ],
  balanced: [
    "Помогут ясные просьбы и привычка проговаривать ожидания до того, как накопится усталость.",
    "Не угадывайте настроение партнёра: лучше выбрать спокойный прямой разговор.",
  ],
  careful: [
    "Снижайте резкость в переписке и проверяйте, правильно ли поняли друг друга.",
    "Не торопите признания и решения: этой паре особенно важен безопасный тон.",
  ],
};

const attractionLines: Record<"strong" | "medium" | "tense", string[]> = {
  strong: [
    "искры достаточно, чтобы поддерживать интерес без лишнего давления",
    "притяжение заметное, особенно если оба сохраняют уважение к свободе",
    "интерес легко оживить через игру, внимание и честные комплименты",
  ],
  medium: [
    "притяжение есть, но ему нужен спокойный темп и меньше проверок",
    "искра появляется волнами: помогает тёплая инициатива без ожиданий",
    "интерес держится на любопытстве, но резкость быстро снижает тепло",
  ],
  tense: [
    "притяжение может смешиваться с раздражением, поэтому важны паузы",
    "искра есть, но её легко погасить давлением или соревнованием",
    "интересу нужна безопасность: меньше резких выводов, больше уважения к границам",
  ],
};

const communicationLines: Record<"strong" | "medium" | "tense", string[]> = {
  strong: [
    "диалог получается живым, если говорить прямо и слушать до конца",
    "пара хорошо раскрывается через ясные просьбы и короткие договорённости",
    "общение может стать сильной опорой, когда нет намёков и проверок",
  ],
  medium: [
    "разговор возможен, но важно не додумывать мотивы друг друга",
    "есть риск недопонимания, если говорить слишком быстро или слишком резко",
    "диалогу помогает простая структура: факт, чувство, просьба",
  ],
  tense: [
    "общение требует терпения: слова могут восприниматься острее, чем задумано",
    "есть риск недопонимания, поэтому важны границы и спокойные вопросы",
    "лучше обсуждать одну тему за раз и не требовать мгновенной реакции",
  ],
};

const loveLines: Record<"strong" | "medium" | "tense", string[]> = {
  strong: [
    "тепло растёт через регулярные знаки внимания и доверие",
    "романтика раскрывается, когда рядом есть уважение и свобода",
    "чувства легче укреплять через заботу, благодарность и мягкую инициативу",
  ],
  medium: [
    "чувствам нужна ясность: меньше догадок, больше прямого тепла",
    "близость может расти, если не сравнивать темпы и ожидания",
    "романтика становится устойчивее через маленькие повторяемые жесты",
  ],
  tense: [
    "в любви возможны качели, если копить обиды или проверять чувства",
    "чувствам нужны границы и честный разговор без давления",
    "тепло лучше возвращать маленькими шагами, не требуя быстрых обещаний",
  ],
};

const householdLines: Record<"strong" | "medium" | "tense", string[]> = {
  strong: [
    "общий ритм можно выстроить через понятные правила и заботу",
    "быт легче, когда обязанности проговорены заранее",
    "домашние вопросы становятся точкой опоры, если не копить мелкие претензии",
  ],
  medium: [
    "ритм пары требует настройки: привычки могут отличаться сильнее, чем кажется",
    "быт лучше обсуждать фактами, а не намёками",
    "помогают списки, ясные зоны ответственности и право на отдых",
  ],
  tense: [
    "домашний ритм может стать источником споров, если молчать о нагрузке",
    "важно разделить ответственность и не ждать, что партнёр сам догадается",
    "быт потребует больше терпения, честных правил и бережного тона",
  ],
};

const weakSpotLines: Record<"strong" | "medium" | "tense", string[]> = {
  strong: [
    "даже сильной паре вредят молчаливые ожидания и спешка в выводах",
    "главный риск — принять привычное тепло за само собой разумеющееся",
    "не стоит спорить за лидерство там, где помогает партнёрство",
  ],
  medium: [
    "разный темп решений может восприниматься как равнодушие",
    "молчаливые ожидания быстро превращаются в напряжение",
    "попытка переделать партнёра снижает доверие",
  ],
  tense: [
    "есть риск недопонимания, если оба защищаются вместо разговора",
    "резкие слова могут закрыть диалог быстрее, чем кажется",
    "важны границы: без них напряжение будет возвращаться по кругу",
  ],
};

const adviceLines: Record<"strong" | "medium" | "tense", string[]> = {
  strong: [
    "выберите один общий фокус на ближайшие дни и укрепите то, что уже работает",
    "добавьте больше благодарности и не откладывайте простые тёплые слова",
    "поддерживайте баланс между инициативой и личным пространством",
  ],
  medium: [
    "проговорите ожидания простыми словами и не превращайте разговор в экзамен",
    "сравнивайте не только знаки, но и реальные привычки: отдых, спор, просьбы о поддержке",
    "сначала договоритесь о тоне, потом обсуждайте сложную тему",
  ],
  tense: [
    "нужен честный разговор, но лучше начать с короткой мягкой фразы",
    "потребуется больше терпения: не решайте всё одним разговором",
    "важны границы, паузы и отказ от резких обвинений",
  ],
};

const relationshipModeAdvice: Record<RelationshipMode, string[]> = {
  love: ["для любви сейчас важнее тепло, чем проверка чувств", "романтика растёт через простые знаки внимания"],
  friendship: ["для дружбы важны надёжность и честное присутствие", "не обесценивайте поддержку, даже если она выглядит простой"],
  work: ["в рабочих делах фиксируйте договорённости письменно", "разделите роли, чтобы не спорить о мелочах"],
  family: ["для быта помогает ясный режим и честное распределение нагрузки", "забота не должна превращаться в контроль"],
  passion: ["для страсти важна игра без давления и ревности", "не подменяйте близость соревнованием"],
  reconciliation: ["для примирения начните с признания чувства, а не с доказательств", "мягкий тон сейчас важнее идеальной формулировки"],
};

const strengthLines = [
  "это можно развивать через маленькие повторяемые жесты",
  "эта зона станет опорой, если не ждать угадывания",
  "здесь паре полезно чаще замечать хорошее",
];

const coupleRelationshipLines: Record<"strong" | "medium" | "tense", string[]> = {
  strong: ["сегодня можно укрепить близость через внимание и спокойную инициативу", "подходит день для тёплого жеста и честного разговора"],
  medium: ["отношениям поможет мягкая ясность: меньше намёков, больше простых слов", "лучше не проверять чувства, а прямо сказать о потребности"],
  tense: ["сегодня важно не давить на ответ и не спорить за правоту", "если есть напряжение, начните с паузы и короткой спокойной фразы"],
};

const coupleTalkLines: Record<"strong" | "medium" | "tense", string[]> = {
  strong: ["разговор может быстро стать ближе, если слушать без перебивания", "хорошо обсуждать планы и желания без скрытых проверок"],
  medium: ["говорите по одной теме за раз и уточняйте смысл", "диалогу поможет формула: факт, чувство, просьба"],
  tense: ["лучше избегать длинных переписок на эмоциях", "важны паузы и фразы без обвинений"],
};

const coupleDateLines: Record<"strong" | "medium" | "tense", string[]> = {
  strong: ["подойдёт встреча с лёгкой романтикой и живым разговором", "хороший день для свидания без сложных тем"],
  medium: ["лучше выбрать спокойный формат без спешки и ожиданий", "подойдёт короткая встреча, если заранее договориться о настроении"],
  tense: ["свидание лучше делать тихим и коротким, без выяснения отношений", "если есть напряжение, начните с простой прогулки или перенесите встречу"],
};

const coupleReconciliationLines: Record<"strong" | "medium" | "tense", string[]> = {
  strong: ["подойдёт мягкий шаг навстречу", "можно начать с признания своей части напряжения"],
  medium: ["лучше идти осторожно и не требовать быстрых обещаний", "подойдёт короткое сообщение без давления"],
  tense: ["сначала снизьте тон и выберите спокойное время", "лучше позже, если разговор сейчас легко сорвётся в спор"],
};

const coupleActionLines = ["предложить небольшой общий план", "сказать спасибо за конкретный поступок", "выбрать спокойный формат разговора", "сделать один тёплый жест без ожидания ответа"];
const coupleAvoidLines: Record<"strong" | "medium" | "tense", string[]> = {
  strong: ["не принимать тепло как должное", "не спорить из-за мелкой формы"],
  medium: ["не копить ожидания молча", "не проверять партнёра намёками"],
  tense: ["не начинать разговор с обвинения", "не требовать немедленного решения"],
};

const coupleCalendarStatuses = ["❤️ день для любви", "💬 день для разговора", "🕊 день для примирения", "⚠️ осторожнее", "🌙 спокойный день"];
const coupleCalendarAdvice: Record<string, string[]> = {
  "❤️ день для любви": ["подойдёт тёплая встреча или маленький знак внимания", "лучше говорить о приятном и укреплять доверие"],
  "💬 день для разговора": ["обсудите одну тему и заранее договоритесь о спокойном тоне", "подойдёт честная переписка без проверок"],
  "🕊 день для примирения": ["начните с мягкой фразы и не требуйте ответа сразу", "лучше признать чувство, а не спорить о деталях"],
  "⚠️ осторожнее": ["сегодня легко обострить мелочь, поэтому важны паузы", "сложные темы лучше сократить до одного вопроса"],
  "🌙 спокойный день": ["подойдёт тихая поддержка без больших решений", "лучше восстановить силы и не торопить события"],
};

const coupleCalendarThemes: Record<RelationshipMode, string[]> = {
  love: ["тепло и внимание", "маленький романтический жест", "честный разговор о близости"],
  friendship: ["поддержка без давления", "общий интерес", "бережная проверка состояния"],
  work: ["ясные роли", "одно рабочее решение", "сверка ожиданий"],
  family: ["домашний ритм", "забота и границы", "простая бытовая договорённость"],
  passion: ["искра без ревности", "игра и лёгкость", "притяжение без проверки"],
  reconciliation: ["мягкий шаг навстречу", "пауза перед ответом", "признание своей части напряжения"],
};

const coupleCalendarEnergy: Record<RelationshipMode, string[]> = {
  love: ["тёплая", "нежная", "романтичная"],
  friendship: ["ровная", "поддерживающая", "доверительная"],
  work: ["собранная", "деловая", "структурная"],
  family: ["заземляющая", "заботливая", "спокойная"],
  passion: ["яркая", "живая", "магнитная"],
  reconciliation: ["осторожная", "мягкая", "восстанавливающая"],
};

const coupleCalendarActions: Record<RelationshipMode, string[]> = {
  love: ["предложить короткую встречу без спешки", "сказать одну конкретную благодарность", "добавить в день маленький знак внимания"],
  friendship: ["спросить, чем можно поддержать", "поделиться простой хорошей новостью", "предложить общий спокойный план"],
  work: ["зафиксировать следующий шаг письменно", "согласовать один приоритет", "разделить задачи без оценок личности"],
  family: ["договориться об одной бытовой мелочи", "снять с другого человека одну маленькую нагрузку", "сказать просьбу прямо и мягко"],
  passion: ["предложить лёгкий формат без давления", "оставить место для игры и паузы", "сделать комплимент без ожидания ответа"],
  reconciliation: ["начать с короткой мирной фразы", "признать чувство без обвинения", "предложить разговор в удобное время"],
};

const coupleCalendarRisks: Record<RelationshipMode, string[]> = {
  love: ["проверять чувства скоростью ответа", "ждать угадывания", "сравнивать жесты с идеалом"],
  friendship: ["обесценить простую поддержку", "исчезнуть без объяснения", "перевести заботу в контроль"],
  work: ["смешать личные эмоции и задачу", "менять договорённость на ходу", "спорить о статусе вместо результата"],
  family: ["копить бытовое раздражение", "говорить намёками", "делать заботу обязательством"],
  passion: ["подменить близость ревностью", "проверять реакцию молчанием", "ускорять то, что просит паузы"],
  reconciliation: ["требовать примирения сразу", "возвращаться к старому спору без цели", "начинать с доказательств правоты"],
};

const coupleActionProfiles: Record<RelationshipMode, { mainAction: string[]; avoid: string[]; bestTone: string[]; smallStep: string[] }> = {
  love: {
    mainAction: ["сделайте один тёплый жест без проверки ответа", "предложите спокойный момент только для вас"],
    avoid: ["не измеряйте чувства скоростью переписки", "не задавайте вопрос как проверку"],
    bestTone: ["мягкий, прямой, с интересом к состоянию другого", "тёплый и не требующий немедленного ответа"],
    smallStep: ["напишите короткую фразу благодарности", "предложите спокойный вечер без сложных тем"],
  },
  friendship: {
    mainAction: ["спросите, нужна ли поддержка, и оставьте человеку выбор", "предложите простой общий план"],
    avoid: ["не превращайте заботу в совет без запроса", "не обесценивайте молчание"],
    bestTone: ["надёжный, простой, без драматизации", "дружеский и спокойный"],
    smallStep: ["отправьте одно сообщение с вопросом «как ты сегодня?»", "поделитесь короткой хорошей новостью"],
  },
  work: {
    mainAction: ["согласуйте один следующий шаг и критерий результата", "разделите ответственность без оценки личности"],
    avoid: ["не спорьте о личных качествах вместо задачи", "не меняйте цель без короткого согласования"],
    bestTone: ["деловой, спокойный, с коротким итогом", "структурный и уважительный"],
    smallStep: ["запишите договорённость в одном сообщении", "уточните срок и формат результата"],
  },
  family: {
    mainAction: ["разберите одну бытовую мелочь до понятного решения", "снимите напряжение через маленькую понятную помощь"],
    avoid: ["не копите ожидания молча", "не превращайте заботу в контроль"],
    bestTone: ["заботливый, конкретный, без упрёка", "домашний и ясный"],
    smallStep: ["предложите одну посильную помощь", "попросите о конкретной мелочи прямо"],
  },
  passion: {
    mainAction: ["добавьте лёгкую инициативу без давления", "поддержите искру через игру и уважение к границам"],
    avoid: ["не используйте ревность как проверку интереса", "не ускоряйте ответ там, где нужна пауза"],
    bestTone: ["живой, уверенный, но бережный", "яркий и не требующий доказательств"],
    smallStep: ["сделайте комплимент и оставьте пространство для ответа", "предложите лёгкий формат встречи"],
  },
  reconciliation: {
    mainAction: ["начните с признания своей части напряжения", "предложите разговор без требования немедленного решения"],
    avoid: ["не требуйте быстрого финального решения", "не возвращайтесь к старому спору без новой цели"],
    bestTone: ["тихий, уважительный, без обвинений", "мягкий и признающий чувства"],
    smallStep: ["напишите одну фразу о желании понять, а не доказать", "предложите короткий разговор в удобное время"],
  },
};

const reconciliationApproachLines: Record<"strong" | "medium" | "tense", string[]> = {
  strong: ["напишите коротко и тепло: начните с желания понять, а не доказать", "подойдите спокойно и назовите, что именно хотите исправить"],
  medium: ["лучше начать с мягкой просьбы о разговоре и дать время на ответ", "скажите о своём чувстве без обвинения и предложите маленький шаг"],
  tense: ["сначала выдержите паузу и выберите нейтральное время", "лучше написать очень коротко, без спора и давления"],
};

const reconciliationAvoidLines: Record<"strong" | "medium" | "tense", string[]> = {
  strong: ["не превращайте примирение в длинный разбор прошлого", "не проверяйте, кто первым сделает шаг"],
  medium: ["избегайте сарказма и слов «всегда» или «никогда»", "не смешивайте одну обиду со всеми старыми темами"],
  tense: ["не требуйте немедленного ответа", "не начинайте с обвинений и ультиматумов"],
};

const messageTones: Array<{ id: MessageTone; label: string }> = [
  { id: "soft", label: "мягко" },
  { id: "romantic", label: "романтично" },
  { id: "afterFight", label: "после ссоры" },
  { id: "longSilence", label: "давно не общались" },
  { id: "invite", label: "пригласить" },
  { id: "reconciliation", label: "для примирения" },
  { id: "short", label: "коротко" },
  { id: "honest", label: "глубже и честнее" },
];

const coupleMessageTemplatesByMode: Record<RelationshipMode, Array<{ label: string; text: string }>> = {
  love: [
    { label: "Тёплый старт", text: "Мне хочется сегодня быть ближе к тебе. Давай выберем спокойный момент и просто побудем рядом без спешки." },
    { label: "Нежная просьба", text: "Мне важно сохранить между нами тепло. Если тебе удобно, давай поговорим о хорошем и о том, чего каждому сейчас не хватает." },
    { label: "Короткое приглашение", text: "Хочу добавить в день немного нежности. Предлагаю сделать что-то простое вместе, без ожиданий и давления." },
  ],
  friendship: [
    { label: "Поддержка", text: "Я рядом и хочу понять, как ты. Если нужна помощь или просто спокойный разговор, я открыт(а)." },
    { label: "Лёгкий контакт", text: "Вспомнил(а) о тебе и захотелось написать. Как проходит день? Можно без подробностей, если не хочется." },
    { label: "Общий план", text: "Давай на этой неделе выберем простой формат для встречи или созвона, чтобы спокойно восстановить контакт." },
  ],
  work: [
    { label: "Ясность", text: "Предлагаю сверить один следующий шаг: что делаем, кто отвечает и какой результат считаем готовым." },
    { label: "Спокойное уточнение", text: "Хочу уточнить ожидания, чтобы не спорить о мелочах. Давай зафиксируем главное коротко и спокойно." },
    { label: "Деловая поддержка", text: "Вижу, что задача важная. Готов(а) обсудить решение без лишних эмоций и выбрать понятный порядок действий." },
  ],
  family: [
    { label: "Быт без упрёка", text: "Давай выберем одну бытовую вещь и договоримся по ней спокойно, чтобы всем стало легче." },
    { label: "Забота", text: "Я хочу поддержать наш общий ритм. Скажи, где тебе сейчас нужна помощь, а я тоже скажу свою просьбу прямо." },
    { label: "Тихий вечер", text: "Предлагаю сегодня не разбирать всё сразу, а сделать один маленький шаг для спокойствия дома." },
  ],
  passion: [
    { label: "Искра", text: "Мне нравится энергия между нами. Хочу сохранить лёгкость и добавить немного игры без давления." },
    { label: "Комплимент", text: "Ты сегодня особенно притягиваешь моё внимание. Просто хочу сказать это прямо и тепло." },
    { label: "Приглашение", text: "Если тебе откликается, давай устроим небольшой момент только для нас — легко, красиво и без лишних ожиданий." },
  ],
  reconciliation: [
    { label: "Мягкий шаг", text: "Мне жаль, что между нами появилось напряжение. Я хочу поговорить спокойно и понять тебя без спора." },
    { label: "Без давления", text: "Не хочу требовать ответа сразу. Просто хочу сказать, что мне важно восстановить уважительный контакт." },
    { label: "Признание", text: "Я вижу свою часть в этом напряжении и готов(а) обсудить её спокойно, когда тебе будет удобно." },
  ],
};

const coupleMessageClosers = [
  "Ответ не обязательно давать сразу.",
  "Можно начать с одного короткого сообщения.",
  "Главное — сохранить уважение и спокойный темп.",
];

const messageTemplates: Record<MessageTone, string[]> = {
  soft: ["хочу спокойно поговорить и лучше понять тебя. Давай без спешки и без давления.", "мне важно сохранить тепло между нами. Напиши, когда тебе будет удобно поговорить."],
  romantic: ["я сегодня поймал(а) себя на мысли, что мне хочется быть к тебе ближе. Давай устроим спокойный вечер?", "мне приятно думать о нас. Хочу добавить в день немного тепла и увидеться, если ты тоже хочешь."],
  afterFight: ["я не хочу продолжать спор. Мне важно понять тебя и спокойно объяснить свою сторону.", "давай попробуем вернуться к разговору мягче. Я готов(а) слушать и не давить."],
  longSilence: ["давно не общались, но я хочу написать бережно. Как ты? Если будет желание, я буду рад(а) поговорить.", "не хочу врываться в твоё пространство, просто хочу узнать, как ты себя чувствуешь."],
  invite: ["хочу увидеться без суеты. Давай выберем время для прогулки или спокойного кофе?", "если тебе откликается, давай встретимся и просто побудем рядом без лишних ожиданий."],
  reconciliation: ["мне жаль, что между нами появилось напряжение. Я хочу поговорить спокойно и с уважением к тебе.", "я хочу сделать шаг навстречу. Давай начнём с честного разговора без обвинений."],
  short: ["думаю о тебе. Если захочешь, давай спокойно поговорим.", "хочу сохранить тепло между нами. Напиши, когда будет удобно."],
  honest: ["мне важно быть честным(ой): я скучаю по нашему спокойному контакту и хочу понять, как ты сейчас.", "я не хочу давить, но хочу сказать прямо: мне важны мы, и я готов(а) говорить мягко и честно."],
};

const natalArchetypes: Record<string, string[]> = Object.fromEntries(
  signs.map((sign) => [
    sign.slug,
    [
      `${sign.name} ищет свой способ проявлять силу мягко и честно`,
      `${sign.name} раскрывается, когда рядом есть смысл, доверие и личный темп`,
      `${sign.name} лучше всего растёт через осознанный выбор, а не через давление`,
    ],
  ]),
) as Record<string, string[]>;

const natalStrengths: Record<string, string[]> = {
  fire: ["инициатива, смелость и способность зажигать других", "быстрый старт, честность и живое вдохновение"],
  earth: ["надёжность, практичность и умение доводить до результата", "терпение, вкус к качеству и уважение к реальности"],
  air: ["ясное мышление, любопытство и способность договариваться", "идеи, лёгкость контакта и умение видеть варианты"],
  water: ["эмпатия, глубина и тонкое чувство атмосферы", "забота, интуиция и способность создавать эмоциональную опору"],
};

const natalGrowth: Record<string, string[]> = {
  cardinal: ["не брать на себя всё сразу и оставлять другим право на свой темп", "учиться начинать без давления и завершать без спешки"],
  fixed: ["мягче отпускать старые схемы, если они перестали помогать", "оставлять место для гибкости и нового взгляда"],
  mutable: ["не распыляться и чаще выбирать один главный фокус", "переводить идеи и чувства в понятные действия"],
};

const natalLoveStyles: Record<string, string[]> = {
  fire: ["в любви важны искра, честность и ощущение живого выбора", "тепло проявляется через инициативу и прямоту"],
  earth: ["любовь крепнет через надёжность, заботу и простые регулярные поступки", "важны стабильность, телесное тепло и доверие"],
  air: ["любовь начинается с интереса, диалога и свободы быть собой", "важны разговор, чувство лёгкости и уважение к пространству"],
  water: ["любовь раскрывается через безопасность, нежность и эмоциональную честность", "важны поддержка, тишина и бережный контакт"],
};

const natalCommunicationStyles: Record<string, string[]> = {
  active: ["лучше говорить прямо, но проверять, не звучит ли это слишком резко", "важно оставлять место для ответа и не ускорять собеседника"],
  receptive: ["лучше не ждать, что другие сами догадаются о чувствах", "важно называть потребность простыми словами и держать границы"],
};
