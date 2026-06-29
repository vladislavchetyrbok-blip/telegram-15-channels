import { useState, type ElementType, type ReactNode } from "react";
import { ArrowLeft, Bookmark, CalendarDays, Check, Copy, Crown, HeartHandshake, Lock, MapPin, Share2, Sparkles, Star } from "lucide-react";
import type { ZodiacAnalyticsEventName, ZodiacAnalyticsPayload } from "@/lib/zodiac-mini-app-analytics-shared";
import { shareZodiacMiniAppContent } from "@/lib/zodiac-mini-app-share";
import { synthesizeVipMysticDay } from "@/lib/zodiac-vip-content";
import { buildPersonalizedCoupleCalendar } from "@/lib/zodiac-couple-calendar-personalization";
import type { ZodiacSignId } from "@/lib/zodiac-mystic-content";
import { relationshipModes, signs } from "./zodiac-mini-app/constants";
import { AstroChartVisual } from "./zodiac-mini-app/AstroChartVisual";
import { NatalChartVisual, type NatalChartMode } from "./zodiac-mini-app/NatalChartVisual";
import { ZodiacCityAutocompleteInput } from "./zodiac-mini-app/ZodiacCityAutocompleteInput";
import { ZodiacUnifiedDateInput } from "./zodiac-mini-app/ZodiacUnifiedDateInput";
import { ZodiacUnifiedTimeInput } from "./zodiac-mini-app/ZodiacUnifiedTimeInput";
import { AphroditeBadge, AphroditeCard, AphroditeLockedPreviewCard, AphroditeShareCard } from "./zodiac-mini-app/aphrodite-design-system";
import type { ZodiacRetentionDraft } from "./zodiac-mini-app/retention";
import { ZodiacSelect, type ZodiacSelectOption } from "./zodiac-mini-app/ZodiacSelect";
import { dateInputToIsoDate, isoDateToDateInput } from "@/lib/zodiac-date-input";
import { parseBirthDateInput, sanitizeBirthDateInputDraft } from "@/lib/zodiac-birth-date-range";
import type {
  AngelNumberProfile,
  CompatibilityResult,
  CoupleCalendarDay,
  Gender,
  MonthForecast,
  MoreFeatureId,
  NameProfile,
  NatalChart,
  NumerologyProfile,
  PersonState,
  DailyTalismanProfile,
  RelationshipMode,
  ZodiacSign,
  ZodiacVipConfig,
} from "./zodiac-mini-app/types";

interface VipStatusPillProps {
  publicMode: boolean;
  label: string;
  value: string;
}

interface VipToolBaseProps {
  publicMode: boolean;
  onBack: () => void;
  onSave?: (action?: ZodiacRetentionDraft) => void;
  onShare?: (action?: ZodiacRetentionDraft) => Promise<string | void> | string | void;
  onEvent?: (event: ZodiacAnalyticsEventName, payload: ZodiacAnalyticsPayload) => void;
  defaultSign?: ZodiacSign | null;
  defaultSecondSign?: ZodiacSign | null;
  relationshipMode?: RelationshipMode;
  scoreTier?: ZodiacAnalyticsPayload["scoreTier"];
}

type VipFeatureKey = Extract<
  MoreFeatureId,
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
  | "vipMysticDay"
>;

type VipGoal = "love" | "work" | "energy" | "clarity" | "reconciliation";
type VipTone = "soft" | "warm" | "direct" | "romantic";

const goalOptions: Array<{ id: VipGoal; label: string }> = [
  { id: "love", label: "Любовь" },
  { id: "work", label: "Дела" },
  { id: "energy", label: "Энергия" },
  { id: "clarity", label: "Ясность" },
  { id: "reconciliation", label: "Примирение" },
];

const toneOptions: Array<{ id: VipTone; label: string }> = [
  { id: "soft", label: "Мягкий" },
  { id: "warm", label: "Тёплый" },
  { id: "direct", label: "Прямой" },
  { id: "romantic", label: "Романтичный" },
];

const genderOptions: Array<{ id: Gender; label: string }> = [
  { id: "unspecified", label: "Не указывать" },
  { id: "female", label: "Женщина" },
  { id: "male", label: "Мужчина" },
];

const signSelectOptions: ZodiacSelectOption[] = signs.map((sign) => ({
  value: sign.slug,
  label: `${sign.emoji} ${sign.name}`,
  description: sign.range,
}));

const goalSelectOptions: Array<ZodiacSelectOption<VipGoal>> = goalOptions.map((goal) => ({
  value: goal.id,
  label: goal.label,
}));

const toneSelectOptions: Array<ZodiacSelectOption<VipTone>> = toneOptions.map((tone) => ({
  value: tone.id,
  label: tone.label,
}));

const genderSelectOptions: Array<ZodiacSelectOption<Gender>> = genderOptions.map((gender) => ({
  value: gender.id,
  label: gender.label,
}));

const relationshipModeSelectOptions: Array<ZodiacSelectOption<RelationshipMode>> = relationshipModes.map((mode) => ({
  value: mode.id,
  label: mode.label,
  description: mode.caption,
}));

const VIP_PREVIEW_LOCKED_SCOPE_COPY = "Показана короткая версия. Полный отчёт закрыт. Оплата не активна.";
const VIP_PREVIEW_DISCLAIMER_FALLBACK = "Это мягкая навигация для разговора, а не жёсткое предсказание.";

function compactPreviewSentence(value: string, maxLength = 104) {
  const normalized = value.replace(/\s+/g, " ").trim();
  const firstStop = normalized.search(/[.!?]/);
  const firstSentence = firstStop > 24 ? normalized.slice(0, firstStop + 1) : normalized;
  return firstSentence.length > maxLength ? `${firstSentence.slice(0, maxLength - 1).trim()}…` : firstSentence;
}

function compactDayMood(day: CoupleCalendarDay) {
  return day.energy || day.status || "мягкий фокус";
}

function VipStatusPill({ publicMode, label, value }: VipStatusPillProps) {
  return (
    <div className={publicMode ? "rounded-md border border-white/10 bg-white/5 p-2" : "rounded-md border border-amber-100 bg-amber-50/50 p-2"}>
      <p className={publicMode ? "text-[10px] font-semibold uppercase tracking-wider text-slate-400" : "text-[10px] font-semibold uppercase tracking-wider text-slate-500"}>{label}</p>
      <p className={publicMode ? "mt-0.5 text-sm font-semibold text-white" : "mt-0.5 text-sm font-semibold text-slate-900"}>{value}</p>
    </div>
  );
}

function SectionHeading({ title, publicMode }: { title: string; publicMode: boolean }) {
  return (
    <h3 className={publicMode ? "mt-6 text-sm font-semibold uppercase tracking-widest text-slate-400" : "mt-6 text-sm font-semibold uppercase tracking-widest text-slate-500"}>
      {title}
    </h3>
  );
}

function VipCardButton({
  title,
  text,
  icon: Icon,
  publicMode,
  onClick,
  locked = false,
}: {
  title: string;
  text: string;
  icon: ElementType;
  publicMode: boolean;
  onClick: () => void;
  locked?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={locked}
      onClick={onClick}
      className={
        publicMode
          ? `aphrodite-touch-target flex min-h-[88px] w-full min-w-0 flex-col justify-center rounded-lg border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-amber-200/40 ${
              locked ? "border-white/5 bg-white/5 opacity-60" : "border-white/10 bg-white/10 hover:border-amber-200/35 hover:bg-white/10"
            }`
          : `aphrodite-touch-target flex min-h-[88px] w-full min-w-0 flex-col justify-center rounded-lg border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-amber-200 ${
              locked ? "border-slate-200 bg-slate-50 opacity-60" : "border-amber-100 bg-white hover:border-amber-300"
            }`
      }
    >
      <div className="flex min-w-0 items-center gap-2">
        <Icon className={publicMode ? "h-4 w-4 text-amber-200" : "h-4 w-4 text-amber-500"} />
        <p className={publicMode ? "aphrodite-wrap-anywhere text-sm font-semibold text-white" : "aphrodite-wrap-anywhere text-sm font-semibold text-slate-950"}>{title}</p>
      </div>
      <p className={publicMode ? "aphrodite-wrap-anywhere mt-1.5 text-xs leading-5 text-slate-300" : "aphrodite-wrap-anywhere mt-1.5 text-xs leading-5 text-slate-600"}>{text}</p>
    </button>
  );
}

export function VipMenuCard({
  publicMode,
  config,
  untilLabel,
  pairReady,
  natalReady,
  nameReady,
  onFeatureOpen,
}: {
  publicMode: boolean;
  config: ZodiacVipConfig;
  untilLabel: string;
  pairReady: boolean;
  natalReady: boolean;
  nameReady: boolean;
  onFeatureOpen: (feature: string) => void;
}) {
  return (
    <div className={publicMode ? "rounded-lg border border-amber-200/25 bg-amber-200/10 p-4" : "rounded-lg border border-amber-200 bg-amber-50 p-4"}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={publicMode ? "text-lg font-semibold text-white" : "text-lg font-semibold text-slate-950"}>👑 VIP превью</p>
          <p className={publicMode ? "mt-1 text-sm font-semibold text-amber-100" : "mt-1 text-sm font-semibold text-amber-800"}>Превью до {untilLabel}</p>
          <p className={publicMode ? "mt-2 text-sm leading-6 text-slate-300" : "mt-2 text-sm leading-6 text-slate-700"}>
            Показана короткая версия. Полный отчёт закрыт. Оплата не активна.
          </p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-200/25 bg-black/20 text-amber-100">
          <Crown className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <VipStatusPill publicMode={publicMode} label="Сейчас" value="превью" />
        <VipStatusPill publicMode={publicMode} label="Оплата" value="не активна" />
        <VipStatusPill publicMode={publicMode} label="VIP" value="закрыт" />
      </div>

      <SectionHeading title="1. Личный VIP" publicMode={publicMode} />
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <VipCardButton publicMode={publicMode} icon={Star} title="Расширенная натальная карта" text={natalReady ? "Полный разбор личности, любви, денег и теней" : "Частичный режим: можно рассчитать по знаку и дате"} onClick={() => onFeatureOpen("vipNatalChart")} />
        <VipCardButton publicMode={publicMode} icon={MapPin} title="Месячный прогноз" text="Энергия, риск, любовь и лучший период месяца" onClick={() => onFeatureOpen("vipMonthForecast")} />
        <VipCardButton publicMode={publicMode} icon={Crown} title="Расширенный именной профиль" text={nameReady ? "Глубокий анализ имени, рисков и стиля общения" : "Имя можно ввести только на экране расчёта"} onClick={() => onFeatureOpen("vipNameProfile")} />
      </div>

      <SectionHeading title="2. Любовь и пара" publicMode={publicMode} />
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <VipCardButton publicMode={publicMode} icon={HeartHandshake} title="Расширенная совместимость" text={pairReady ? "Детальный разбор быта, общения и рисков" : "Можно рассчитать по двум знакам прямо здесь"} onClick={() => onFeatureOpen("vipCompatibility")} />
        <VipCardButton publicMode={publicMode} icon={Sparkles} title="Ментальная карта пары" text={pairReady ? "Динамика споров, доверия и примирения" : "Выберите два знака для карты мышления пары"} onClick={() => onFeatureOpen("vipMentalMap")} />
        <VipCardButton publicMode={publicMode} icon={CalendarDays} title="30-дневный календарь пары" text="Прогноз динамики на месяц вперед" onClick={() => onFeatureOpen("vipCoupleCalendar")} />
        <VipCardButton publicMode={publicMode} icon={HeartHandshake} title="Помощник сообщений" text="Готовые решения для диалога и примирения" onClick={() => onFeatureOpen("vipMessageHelper")} />
      </div>

      <SectionHeading title="3. Мистика и числа" publicMode={publicMode} />
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <VipCardButton publicMode={publicMode} icon={Star} title="Расширенная нумерология" text="Число пути, имени и личный месяц" onClick={() => onFeatureOpen("vipNumerology")} />
        <VipCardButton publicMode={publicMode} icon={Sparkles} title="Толкование ангельских чисел" text="Глубокий разбор числовых паттернов" onClick={() => onFeatureOpen("vipAngelNumbers")} />
        <VipCardButton publicMode={publicMode} icon={Star} title="Талисманы и символы силы" text="Камень, цвет, число и действие дня" onClick={() => onFeatureOpen("vipTalismans")} />
        <VipCardButton publicMode={publicMode} icon={Sparkles} title="VIP мистический день" text="Синтез дня: Таро, руна, цвет и совет" onClick={() => onFeatureOpen("vipMysticDay")} />
      </div>

      <SectionHeading title="4. Скоро" publicMode={publicMode} />
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <VipCardButton publicMode={publicMode} icon={Lock} locked title="Розыгрыши (Скоро)" text="Доступ к премиум-розыгрышам" onClick={() => {}} />
      </div>
    </div>
  );
}

function VipScreenLayout({ publicMode, title, onBack, children }: { publicMode: boolean; title: string; onBack: () => void; children: ReactNode }) {
  return (
    <div className={publicMode ? "min-w-0 rounded-lg border border-amber-200/20 bg-black/40 p-3 min-[390px]:p-4" : "min-w-0 rounded-lg border border-slate-200 bg-white p-3 shadow-sm min-[390px]:p-4"}>
      <div className="mb-4 flex min-w-0 items-center gap-3">
        <button type="button" onClick={onBack} className={publicMode ? "aphrodite-touch-target rounded-full p-2 text-white hover:bg-white/10" : "aphrodite-touch-target rounded-full p-2 text-slate-700 hover:bg-slate-100"}>
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className={publicMode ? "aphrodite-wrap-anywhere text-lg font-bold text-amber-200" : "aphrodite-wrap-anywhere text-lg font-bold text-slate-900"}>{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function VipIntro({ publicMode, text }: { publicMode: boolean; text: string }) {
  return <p className={publicMode ? "text-sm leading-6 text-slate-300" : "text-sm leading-6 text-slate-600"}>{text}</p>;
}

function PairInlineHint({ publicMode }: { publicMode: boolean }) {
  return (
    <div className={publicMode ? "rounded-lg border border-cyan-200/20 bg-cyan-200/10 p-3" : "rounded-lg border border-cyan-100 bg-cyan-50 p-3"}>
      <p className={publicMode ? "text-sm font-semibold text-cyan-50" : "text-sm font-semibold text-cyan-950"}>Нужна пара для расчёта</p>
      <p className={publicMode ? "mt-1 text-sm leading-5 text-cyan-50/85" : "mt-1 text-sm leading-5 text-cyan-900"}>
        Выберите два знака прямо здесь: результат построится без перехода в другой раздел и без сохранения личных данных.
      </p>
    </div>
  );
}

function VipInputPanel({ publicMode, children }: { publicMode: boolean; children: ReactNode }) {
  return (
    <div className={publicMode ? "rounded-lg border border-white/10 bg-white/5 p-3" : "rounded-lg border border-slate-200 bg-slate-50 p-3"}>
      <p className={publicMode ? "text-xs font-semibold uppercase tracking-widest text-amber-100" : "text-xs font-semibold uppercase tracking-widest text-amber-700"}>Ввод для расчёта</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function VipField({ publicMode, label, children }: { publicMode: boolean; label: string; children: ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className={publicMode ? "text-xs font-semibold text-slate-300" : "text-xs font-semibold text-slate-600"}>{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function inputClass(publicMode: boolean) {
  return publicMode
    ? "h-11 w-full rounded-md border border-white/10 bg-white/10 px-3 text-sm text-white outline-none focus:border-amber-200"
    : "h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:border-amber-400";
}

function SignSelect({ publicMode, value, onChange, label = "Знак" }: { publicMode: boolean; value: string; onChange: (value: string) => void; label?: string }) {
  return (
    <ZodiacSelect publicMode={publicMode} label={label} value={value} options={signSelectOptions} onChange={onChange} />
  );
}

function GoalSelect({ publicMode, value, onChange, label = "Фокус" }: { publicMode: boolean; value: VipGoal; onChange: (value: VipGoal) => void; label?: string }) {
  return (
    <ZodiacSelect publicMode={publicMode} label={label} value={value} options={goalSelectOptions} onChange={onChange} />
  );
}

function ToneSelect({ publicMode, value, onChange }: { publicMode: boolean; value: VipTone; onChange: (value: VipTone) => void }) {
  return (
    <ZodiacSelect publicMode={publicMode} label="Тон" value={value} options={toneSelectOptions} onChange={onChange} />
  );
}

function GenderSelect({ publicMode, value, onChange }: { publicMode: boolean; value: Gender; onChange: (value: Gender) => void }) {
  return (
    <ZodiacSelect publicMode={publicMode} label="Пол (необязательно)" value={value} options={genderSelectOptions} onChange={onChange} />
  );
}

function PrimaryVipButton({ publicMode, onClick, children }: { publicMode: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        publicMode
          ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-amber-200 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-100"
          : "inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
      }
    >
      {children}
    </button>
  );
}

function SecondaryVipButton({ publicMode, onClick, children }: { publicMode: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        publicMode
          ? "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
          : "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
      }
    >
      {children}
    </button>
  );
}

function VipResultPanel({ publicMode, title, children }: { publicMode: boolean; title: string; children: ReactNode }) {
  return (
    <div className={publicMode ? "rounded-lg border border-amber-200/20 bg-amber-200/10 p-4" : "rounded-lg border border-amber-200 bg-amber-50 p-4"}>
      <p className={publicMode ? "text-xs font-semibold uppercase tracking-widest text-amber-100" : "text-xs font-semibold uppercase tracking-widest text-amber-800"}>Результат VIP</p>
      <h3 className={publicMode ? "mt-1 text-base font-semibold text-white" : "mt-1 text-base font-semibold text-slate-950"}>{title}</h3>
      <div className="mt-3 space-y-3">{children}</div>
    </div>
  );
}

function InfoBlock({ title, text, publicMode }: { title: string; text: string; publicMode: boolean }) {
  return (
    <div className={publicMode ? "rounded-lg bg-white/5 p-3" : "rounded-lg border border-slate-100 bg-white/80 p-3"}>
      <h4 className={publicMode ? "text-sm font-semibold text-amber-100" : "text-sm font-semibold text-amber-800"}>{title}</h4>
      <p className={publicMode ? "mt-1 text-sm leading-6 text-slate-300" : "mt-1 text-sm leading-6 text-slate-700"}>{text}</p>
    </div>
  );
}

function VipResultActions({
  publicMode,
  saved,
  shared,
  shareStatus,
  onSave,
  onShare,
  saveLabel = "Сохранить результат",
  shareLabel = "Поделиться результатом",
}: {
  publicMode: boolean;
  saved: boolean;
  shared: boolean;
  shareStatus?: string;
  onSave: () => void;
  onShare: () => void;
  saveLabel?: string;
  shareLabel?: string;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <SecondaryVipButton publicMode={publicMode} onClick={onSave}>
        {saved ? <Check className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        {saved ? "Сохранено" : saveLabel}
      </SecondaryVipButton>
      <SecondaryVipButton publicMode={publicMode} onClick={onShare}>
        {shared ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
        {shared ? shareStatus || "Готово к отправке" : shareLabel}
      </SecondaryVipButton>
    </div>
  );
}

function VipReuseButton({ publicMode, onClick }: { publicMode: boolean; onClick: () => void }) {
  return (
    <SecondaryVipButton publicMode={publicMode} onClick={onClick}>
      <Sparkles className="h-4 w-4" />
      Использовать текущие данные
    </SecondaryVipButton>
  );
}

function useResultActions(featureKey: VipFeatureKey, onEvent?: VipToolBaseProps["onEvent"], onSave?: VipToolBaseProps["onSave"], onShare?: VipToolBaseProps["onShare"]) {
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);
  const [shareStatus, setShareStatus] = useState("");

  function save(payload: ZodiacAnalyticsPayload, retentionAction?: ZodiacRetentionDraft) {
    onEvent?.("vip_tool_saved", { featureKey, ...payload });
    if (featureKey === "vipNatalChart") onEvent?.("natal_chart_saved", { featureKey, chartType: "natal", ...payload });
    trackFinalMapEvent("final_map_saved", payload);
    onSave?.(retentionAction);
    setSaved(true);
  }

  async function share(payload: ZodiacAnalyticsPayload, retentionAction?: ZodiacRetentionDraft) {
    onEvent?.("vip_tool_shared", { featureKey, ...payload });
    if (featureKey === "vipNatalChart") onEvent?.("natal_chart_shared", { featureKey, chartType: "natal", ...payload });
    trackFinalMapEvent("final_map_shared", payload);
    if (onShare) {
      const status = await onShare(retentionAction);
      setShareStatus(typeof status === "string" && status ? status : "Ссылка готова");
    } else {
      const result = await shareZodiacMiniAppContent({
        text: buildVipToolShareText(featureKey),
        url: "https://t.me/zodiac_love_check_bot?startapp=vip",
      });
      setShareStatus(result.label);
    }
    setShared(true);
  }

  function calculate(payload: ZodiacAnalyticsPayload) {
    onEvent?.("vip_tool_started", { featureKey, ...payload });
    onEvent?.("vip_tool_calculated", { featureKey, ...payload });
    if (featureKey === "vipNatalChart") {
      onEvent?.("natal_chart_started", { featureKey, chartType: "natal", ...payload });
      onEvent?.("natal_chart_calculated", { featureKey, chartType: "natal", ...payload });
    }
  }

  function chart(payload: ZodiacAnalyticsPayload) {
    onEvent?.("chart_visual_opened", { featureKey, ...payload });
    trackFinalMapEvent("final_map_opened", payload);
    trackFinalMapEvent("feature_depth_viewed", payload);
  }

  function reuse(payload: ZodiacAnalyticsPayload) {
    onEvent?.("vip_input_reused", { featureKey, ...payload });
  }

  function trackFinalMapEvent(event: ZodiacAnalyticsEventName, payload: ZodiacAnalyticsPayload) {
    const chartType = vipFinalMapChartType(featureKey);
    if (!chartType) return;
    onEvent?.(event, { ...payload, section: "vip", featureKey, chartType });
  }

  return { saved, shared, shareStatus, save, share, calculate, chart, reuse };
}

function vipFinalMapChartType(featureKey: VipFeatureKey) {
  const chartTypes: Partial<Record<VipFeatureKey, string>> = {
    vipNatalChart: "personal",
    vipCompatibility: "couple",
    vipMentalMap: "couple",
    vipNumerology: "numerology",
    vipMysticDay: "mystic",
  };
  return chartTypes[featureKey];
}

function buildVipToolShareText(featureKey: VipFeatureKey) {
  if (featureKey === "vipNatalChart") {
    return "Я открыл(а) символическую натальную карту ✨\nПопробуй тоже:";
  }
  const labels: Record<VipFeatureKey, string> = {
    vipNatalChart: "Расширенная натальная карта",
    vipCompatibility: "Расширенная совместимость",
    vipMentalMap: "Ментальная карта пары",
    vipCoupleCalendar: "30-дневный календарь пары",
    vipMonthForecast: "Месячный прогноз",
    vipMessageHelper: "Помощник сообщений",
    vipNameProfile: "Расширенный именной профиль",
    vipNumerology: "Расширенная нумерология",
    vipAngelNumbers: "Ангельские числа",
    vipTalismans: "Талисманы и символы силы",
    vipMysticDay: "VIP мистический день",
  };
  return `Я открыл(а) ${labels[featureKey]} в Астрологическом центре ✨\nПопробуй тоже:`;
}

function signBySlug(slug?: string | null) {
  return signs.find((sign) => sign.slug === slug) ?? signs[0];
}

function relationshipModeLabel(mode: RelationshipMode) {
  return relationshipModes.find((item) => item.id === mode)?.label.replace(/^[^A-Za-zА-Яа-яЁё0-9]+/, "").trim() ?? "Любовь";
}

function goalLabel(goal: VipGoal) {
  return goalOptions.find((item) => item.id === goal)?.label ?? "Ясность";
}

function toneLabel(tone: VipTone) {
  return toneOptions.find((item) => item.id === tone)?.label ?? "Мягкий";
}

function safeScoreTier(score: number): ZodiacAnalyticsPayload["scoreTier"] {
  if (score >= 85) return "strong";
  if (score >= 70) return "good";
  if (score >= 55) return "medium";
  if (score >= 40) return "difficult";
  return "tense";
}

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

function pick<T>(items: T[], seed: string, offset = 0) {
  return items[(hashString(`${seed}:${offset}`) + offset) % items.length];
}

function reduceNumber(value: number): number {
  let next = Math.abs(Math.trunc(value));
  while (next > 9) next = String(next).split("").reduce((sum, digit) => sum + Number(digit), 0);
  return next || 1;
}

function parseIsoDate(value: string) {
  const isoValue = dateInputToIsoDate(value);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoValue ?? "");
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}

function parseBirthIsoDate(value: string) {
  const parsed = parseBirthDateInput(value, { emptyError: "" });
  if (!parsed.ok) return null;
  return { year: parsed.year, month: parsed.month, day: parsed.day };
}

function birthDateError(value: string) {
  if (!value) return "";
  const parsed = parseBirthDateInput(value, { emptyError: "" });
  return parsed.ok ? "" : parsed.error;
}

function displayDate(value: string) {
  return isoDateToDateInput(value) || value;
}

function displayMonth(value: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return value;
  return `${match[2]}.${match[1]}`;
}

function signFromBirthDate(value: string, fallbackSlug: string) {
  const parsed = parseBirthIsoDate(value);
  if (!parsed) return signBySlug(fallbackSlug);
  const dayCode = parsed.month * 100 + parsed.day;
  if (dayCode >= 321 && dayCode <= 419) return signBySlug("aries");
  if (dayCode >= 420 && dayCode <= 520) return signBySlug("taurus");
  if (dayCode >= 521 && dayCode <= 620) return signBySlug("gemini");
  if (dayCode >= 621 && dayCode <= 722) return signBySlug("cancer");
  if (dayCode >= 723 && dayCode <= 822) return signBySlug("leo");
  if (dayCode >= 823 && dayCode <= 922) return signBySlug("virgo");
  if (dayCode >= 923 && dayCode <= 1022) return signBySlug("libra");
  if (dayCode >= 1023 && dayCode <= 1121) return signBySlug("scorpio");
  if (dayCode >= 1122 && dayCode <= 1221) return signBySlug("sagittarius");
  if (dayCode >= 1222 || dayCode <= 119) return signBySlug("capricorn");
  if (dayCode >= 120 && dayCode <= 218) return signBySlug("aquarius");
  return signBySlug("pisces");
}

function calculatePairScore(firstSign: ZodiacSign, secondSign: ZodiacSign, mode: RelationshipMode) {
  const sameElement = firstSign.element === secondSign.element ? 12 : 0;
  const base = 56 + (hashString(`${firstSign.slug}:${secondSign.slug}:${mode}`) % 28) + sameElement;
  return Math.min(96, base);
}

function vipPayload(input: {
  sign?: string;
  firstSign?: string;
  secondSign?: string;
  relationshipMode?: RelationshipMode;
  scoreTier?: ZodiacAnalyticsPayload["scoreTier"];
  hasBirthDate?: boolean;
  hasBirthTime?: boolean;
  hasBirthCity?: boolean;
  inputMode?: string;
  chartType?: string;
  goal?: VipGoal | string;
  tone?: VipTone | string;
  selectedPresetKey?: string;
  patternType?: string;
}): ZodiacAnalyticsPayload {
  return input;
}

function buildNatalBlocks(sign: ZodiacSign, birthDate: string, birthTime: string, birthCity: string, gender: Gender, natalChart: NatalChart | null) {
  const mode = natalChartMode(birthDate, birthTime, birthCity);
  const hasDate = mode !== "basic";
  const traits = vipNatalTraits(sign);
  const seed = `${sign.slug}:${birthDate || "no-date"}:${birthTime ? "time" : "no-time"}:${birthCity ? "city" : "no-city"}:${gender}`;
  const element = vipElementLabel(sign.element);
  return {
    mode,
    modeLabel: natalChartModeLabel(mode),
    title: `${sign.emoji} ${sign.name} · премиальная натальная карта`,
    summary: natalChart?.summary?.[0]?.value ?? `${sign.name} раскрывается через стихию ${element}: важно соединять личный темп, чувства и практичный выбор без давления. Карта показывает не судьбу как приговор, а рабочий компас на день, месяц и отношения.`,
    items: [
      { title: "Главный код личности", text: natalChart?.archetype ? `${natalChart.archetype}. В повседневности это проявляется как способность видеть главный импульс ситуации и выбирать форму реакции, а не жить только на автомате.` : `${sign.name} действует через энергию "${traits.energy}": сильнее всего раскрывается, когда есть понятная цель, честный контакт с собой и один видимый шаг вместо десятка тревожных вариантов.` },
      { title: "Стихия и темперамент", text: `${element} даёт темперамент, который ${traits.tempo}. Качество знака — ${traits.quality}, поэтому важно не ломать свой ритм чужой скоростью, а переводить его в понятный план.` },
      { title: "Сильные стороны", text: natalChart?.strengths ?? pick(["умение быстро собирать смысл из разрозненных деталей; способность вдохновлять без давления; готовность начинать заново после честного вывода", "внимание к нюансам, устойчивость в долгих задачах и талант создавать вокруг себя ощущение надёжности", "легкость в контакте, гибкость мышления и способность находить слова там, где другие застревают в эмоции", "интуиция, тонкое считывание атмосферы и способность поддерживать людей без громких обещаний"], seed, 1) },
      { title: "Внутренний конфликт", text: pick(["хочется действовать быстрее, чем созревает ясность. Помогает короткая пауза перед обещанием и один вопрос: что я действительно выбираю?", "часть энергии тянет к стабильности, а часть просит обновления. Не смешивайте оба решения в один день: сначала база, потом эксперимент.", "эмоция может звучать громче факта. Сначала проверьте, что именно задело, затем выбирайте слова.", "желание быть полезным иногда превращается в контроль. Лучше предлагать, а не спасать."], seed, 2) },
      { title: "Как человек принимает решения", text: pick(["лучшее решение рождается после короткого теста реальностью: один маленький шаг покажет больше, чем долгий внутренний спор", "нужен критерий заранее: что важно, что допустимо, что точно нельзя; тогда выбор становится спокойнее", "решение созревает через разговор, но финальное слово стоит оставлять себе", "перед важным выбором полезно отделить факт, страх и желание — это сразу снижает шум"], seed, 3) },
      { title: "Отношения и близость", text: natalChart?.loveStyle ?? pick(["лучше открывается через честный интерес и маленькие подтверждения внимания. Не любит эмоциональные проверки и холодное молчание.", "сближается там, где есть уважение к личному пространству, ясные обещания и спокойный тон.", "нуждается в диалоге, где можно быть живым человеком, а не идеальной ролью.", "важно, чтобы близость не забирала свободу выбора и не превращалась в постоянный экзамен."], seed, 4) },
      { title: "Работа / деньги / реализация", text: pick(["деньги лучше приходят через понятную систему, повторяемый навык и умение не распыляться на чужие срочности", "реализация растёт, когда есть пространство для инициативы и критерий завершённости", "сильная сторона в работе — связывать людей, идеи и процессы; риск — обещать больше, чем даёт текущий ресурс", "лучше работает стратегия маленьких улучшений: регулярный темп, чистые договорённости и один фокус на неделю"], seed, 5) },
      { title: "Энергия месяца", text: natalChart?.vipBlocks?.[1]?.text ?? pick(["месяц просит снизить внутренний шум и выбрать одну задачу, которая даст чувство опоры", "главная энергия месяца — не рывок, а выравнивание: сон, план, контакт и бережный отказ от лишнего", "месяц подходит для пересборки привычек: меньше драматичных обещаний, больше маленьких повторяемых действий", "лучший период начинается там, где вы перестаёте доказывать и начинаете спокойно делать"], seed, 6) },
      { title: "Зона роста", text: natalChart?.growth ?? pick(["не торопить выводы и выбирать один ясный шаг", "мягко отделять своё желание от чужого ожидания", "держать баланс между вдохновением и режимом", "не превращать сильную сторону в обязанность быть сильным всегда"], seed, 7) },
      { title: "Что делать сегодня", text: pick(["запишите одну главную мысль дня и переведите её в действие на 15 минут", "сделайте один разговор короче, теплее и конкретнее обычного", "закройте маленький долг перед собой: сон, порядок, сообщение или честный отказ", "выберите символ дня и держите его как напоминание не распыляться"], seed, 8) },
      { title: "Точность и честность", text: hasDate ? "Дата учтена в символической интерпретации. Время и город могут расширять нюансы, но точные дома, асцендент и планетные градусы требуют отдельного astro engine." : "Можно начать по знаку, а дату добавить позже для более личного слоя. Без даты это базовая карта по знаку." },
    ],
    recommendations: [
      pick(["Сформулируйте один главный выбор дня и не добавляйте к нему вторую большую цель.", "Держите темп через короткий список: сделать, обсудить, отпустить.", "Сначала восстановите ресурс, потом принимайте решение с последствиями."], seed, 9),
      pick(["В отношениях замените намёк на одну прямую просьбу.", "В работе уберите лишнее обещание и оставьте один измеримый результат.", "Для энергии тела выберите мягкую дисциплину, а не наказание."], seed, 10),
      pick(["Не спорьте с собой на усталости: перенесите сложный вывод на время, когда есть опора.", "Если хочется всё поменять сразу, начните с одной привычки на три дня.", "Сохраняйте карту как компас, но проверяйте советы реальным опытом."], seed, 11),
    ],
  };
}

function natalChartMode(birthDate: string, birthTime: string, birthCity: string): NatalChartMode {
  if (parseBirthIsoDate(birthDate) && /^\d{2}:\d{2}$/.test(birthTime) && birthCity.trim()) return "extended";
  if (parseBirthIsoDate(birthDate)) return "date";
  return "basic";
}

function natalInputMode(mode: NatalChartMode) {
  if (mode === "extended") return "natal_extended";
  if (mode === "date") return "natal_date";
  return "natal_basic";
}

function natalChartModeLabel(mode: NatalChartMode) {
  if (mode === "extended") return "Расширенная карта по введённым данным";
  if (mode === "date") return "Карта по дате рождения и знаку";
  return "Базовая карта по знаку";
}

function buildNatalRetentionAction(sign: ZodiacSign, mode: NatalChartMode): ZodiacRetentionDraft {
  return {
    section: "natal_chart",
    featureKey: "vipNatalChart",
    label: `Натальная карта: ${sign.name}`,
    sign: sign.slug,
    mode,
    detail: natalChartModeLabel(mode),
  };
}

function vipElementLabel(element: ZodiacSign["element"]) {
  const labels: Record<ZodiacSign["element"], string> = {
    fire: "Огонь",
    earth: "Земля",
    air: "Воздух",
    water: "Вода",
  };
  return labels[element];
}

function vipNatalTraits(sign: ZodiacSign) {
  const traits: Record<string, { quality: string; tempo: string; energy: string }> = {
    aries: { quality: "кардинальное", tempo: "любит старт, честный вызов и быстрый отклик", energy: "инициатива" },
    taurus: { quality: "фиксированное", tempo: "раскрывается через устойчивость, тело и понятный режим", energy: "опора" },
    gemini: { quality: "мутабельное", tempo: "оживает через разговор, движение и смену угла зрения", energy: "связи" },
    cancer: { quality: "кардинальное", tempo: "собирается через заботу, безопасность и эмоциональный смысл", energy: "дом" },
    leo: { quality: "фиксированное", tempo: "любит тепло, признание и пространство для самовыражения", energy: "сердце" },
    virgo: { quality: "мутабельное", tempo: "усиливается через порядок, пользу и точную настройку деталей", energy: "мастерство" },
    libra: { quality: "кардинальное", tempo: "ищет баланс, диалог и красивую форму решения", energy: "гармония" },
    scorpio: { quality: "фиксированное", tempo: "идёт глубоко, требует честности и не любит поверхностных ответов", energy: "трансформация" },
    sagittarius: { quality: "мутабельное", tempo: "раскрывается через смысл, свободу и большой горизонт", energy: "поиск" },
    capricorn: { quality: "кардинальное", tempo: "держится на структуре, ответственности и длинной дистанции", energy: "цель" },
    aquarius: { quality: "фиксированное", tempo: "сильнее всего там, где есть свобода мысли и нестандартное решение", energy: "обновление" },
    pisces: { quality: "мутабельное", tempo: "тонко чувствует поток, символы и эмоциональную атмосферу", energy: "интуиция" },
  };
  return traits[sign.slug] ?? traits.aries;
}

type NatalResultTabId = "main" | "character" | "relationships" | "money" | "growth" | "today";
type NatalResult = ReturnType<typeof buildNatalBlocks>;
type NatalResultItem = NatalResult["items"][number];

const natalResultTabs: Array<{ id: NatalResultTabId; label: string; hint: string }> = [
  { id: "main", label: "Главное", hint: "код и стихия" },
  { id: "character", label: "Характер", hint: "сила и тень" },
  { id: "relationships", label: "Отношения", hint: "близость" },
  { id: "money", label: "Деньги", hint: "реализация" },
  { id: "growth", label: "Рост", hint: "месяц и зона роста" },
  { id: "today", label: "Сегодня", hint: "один шаг" },
];

function natalItem(result: NatalResult, title: string): NatalResultItem {
  return result.items.find((item) => item.title === title) ?? { title, text: result.summary };
}

function buildNatalResultSections(result: NatalResult): Record<NatalResultTabId, { title: string; subtitle: string; items: NatalResultItem[]; recommendations?: string[] }> {
  return {
    main: {
      title: "Главное в карте",
      subtitle: "Коротко: ядро личности, стихия и рабочий способ использовать эту карту.",
      items: [
        natalItem(result, "Главный код личности"),
        natalItem(result, "Стихия и темперамент"),
      ],
    },
    character: {
      title: "Характер и внутренний ритм",
      subtitle: "Где твоя сила, что мешает и как принимать решения спокойнее.",
      items: [
        natalItem(result, "Сильные стороны"),
        natalItem(result, "Внутренний конфликт"),
        natalItem(result, "Как человек принимает решения"),
      ],
    },
    relationships: {
      title: "Отношения и близость",
      subtitle: "Как раскрывается контакт, какие слова и границы помогают.",
      items: [natalItem(result, "Отношения и близость")],
    },
    money: {
      title: "Работа, деньги и реализация",
      subtitle: "Как переводить энергию знака в понятный результат.",
      items: [natalItem(result, "Работа / деньги / реализация")],
    },
    growth: {
      title: "Рост и энергия месяца",
      subtitle: "Что усилить в ближайшие недели и какие привычки поддержат.",
      items: [
        natalItem(result, "Энергия месяца"),
        natalItem(result, "Зона роста"),
      ],
      recommendations: result.recommendations,
    },
    today: {
      title: "Что сделать сегодня",
      subtitle: "Один практичный шаг и честная рамка точности расчёта.",
      items: [
        natalItem(result, "Что делать сегодня"),
        natalItem(result, "Точность и честность"),
      ],
    },
  };
}

function NatalResultHero({ publicMode, result, resultSign }: { publicMode: boolean; result: NatalResult; resultSign: ZodiacSign }) {
  const strength = natalItem(result, "Сильные стороны").text;
  const conflict = natalItem(result, "Внутренний конфликт").text;
  const today = natalItem(result, "Что делать сегодня").text;
  return (
    <div
      className={
        publicMode
          ? "overflow-hidden rounded-lg border border-amber-200/20 bg-gradient-to-br from-amber-200/14 via-fuchsia-300/10 to-cyan-300/8 p-4"
          : "overflow-hidden rounded-lg border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-violet-50 p-4"
      }
      data-premium-natal-hero
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={publicMode ? "text-xs font-semibold uppercase tracking-widest text-amber-100" : "text-xs font-semibold uppercase tracking-widest text-amber-800"}>Символическая натальная карта</p>
          <h3 className={publicMode ? "mt-1 text-2xl font-semibold text-white" : "mt-1 text-2xl font-semibold text-slate-950"}>
            {resultSign.emoji} {resultSign.name}
          </h3>
        </div>
        <span
          className={publicMode ? "rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1 text-xs font-semibold text-cyan-50" : "rounded-full border border-cyan-100 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-900"}
          data-premium-natal-honesty-badge
        >
          без точных домов и асцендента
        </span>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <VipStatusPill publicMode={publicMode} label="Режим" value={result.modeLabel} />
        <VipStatusPill publicMode={publicMode} label="Стихия" value={vipElementLabel(resultSign.element)} />
        <VipStatusPill publicMode={publicMode} label="Точность" value={result.mode === "extended" ? "расширенная" : result.mode === "date" ? "по дате" : "по знаку"} />
      </div>
      <p className={publicMode ? "mt-4 text-sm leading-6 text-slate-200" : "mt-4 text-sm leading-6 text-slate-700"}>{result.summary}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <NatalQuickInsight publicMode={publicMode} title="Где твоя сила" text={strength} />
        <NatalQuickInsight publicMode={publicMode} title="Что мешает" text={conflict} />
        <NatalQuickInsight publicMode={publicMode} title="Что сделать сегодня" text={today} />
      </div>
      <p className={publicMode ? "mt-3 text-xs font-semibold text-amber-100" : "mt-3 text-xs font-semibold text-amber-800"}>Открой вкладки ниже, чтобы развернуть карту без длинного полотна.</p>
    </div>
  );
}

function NatalQuickInsight({ publicMode, title, text }: { publicMode: boolean; title: string; text: string }) {
  return (
    <div className={publicMode ? "rounded-md border border-white/10 bg-white/5 p-3" : "rounded-md border border-slate-100 bg-white/75 p-3"}>
      <p className={publicMode ? "text-xs font-semibold text-amber-100" : "text-xs font-semibold text-amber-800"}>{title}</p>
      <p className={publicMode ? "mt-1 line-clamp-3 text-xs leading-5 text-slate-300" : "mt-1 line-clamp-3 text-xs leading-5 text-slate-600"}>{text}</p>
    </div>
  );
}

function NatalResultTabs({
  publicMode,
  activeTab,
  onTabChange,
}: {
  publicMode: boolean;
  activeTab: NatalResultTabId;
  onTabChange: (tab: NatalResultTabId) => void;
}) {
  return (
    <div className="zodiac-miniapp-horizontal-scroll pb-1" data-premium-natal-tabs>
      <div className="flex min-w-max gap-2">
        {natalResultTabs.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              aria-pressed={active}
              data-premium-natal-tab={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={
                publicMode
                  ? `aphrodite-touch-target min-h-[54px] rounded-lg border px-3 py-2 text-left transition focus:outline-none focus:ring-2 focus:ring-amber-200/40 ${active ? "border-amber-200/45 bg-amber-200/16 text-white" : "border-white/10 bg-white/5 text-slate-300"}`
                  : `aphrodite-touch-target min-h-[54px] rounded-lg border px-3 py-2 text-left transition focus:outline-none focus:ring-2 focus:ring-amber-300 ${active ? "border-amber-300 bg-amber-100 text-slate-950" : "border-slate-200 bg-white text-slate-700"}`
              }
            >
              <span className="block text-sm font-semibold">{tab.label}</span>
              <span className={publicMode ? "block text-[11px] text-slate-400" : "block text-[11px] text-slate-500"}>{tab.hint}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NatalSectionPanel({
  publicMode,
  section,
}: {
  publicMode: boolean;
  section: { title: string; subtitle: string; items: NatalResultItem[]; recommendations?: string[] };
}) {
  return (
    <section
      className={publicMode ? "rounded-lg border border-white/10 bg-white/5 p-3" : "rounded-lg border border-slate-200 bg-white/85 p-3"}
      data-premium-natal-section
    >
      <h4 className={publicMode ? "text-base font-semibold text-white" : "text-base font-semibold text-slate-950"}>{section.title}</h4>
      <p className={publicMode ? "mt-1 text-sm leading-5 text-slate-400" : "mt-1 text-sm leading-5 text-slate-600"}>{section.subtitle}</p>
      <div className="mt-3 grid gap-2">
        {section.items.map((item) => (
          <InfoBlock key={item.title} publicMode={publicMode} title={item.title} text={item.text} />
        ))}
      </div>
      {section.recommendations?.length ? <NatalRecommendationList publicMode={publicMode} recommendations={section.recommendations} /> : null}
    </section>
  );
}

function NatalRecommendationList({ publicMode, recommendations }: { publicMode: boolean; recommendations: string[] }) {
  return (
    <div className={publicMode ? "mt-3 rounded-lg bg-white/5 p-3" : "mt-3 rounded-lg border border-slate-100 bg-slate-50 p-3"}>
      <h4 className={publicMode ? "text-sm font-semibold text-amber-100" : "text-sm font-semibold text-amber-800"}>3 персональные рекомендации</h4>
      <ul className="mt-2 grid gap-2">
        {recommendations.map((item) => (
          <li key={item} className={publicMode ? "rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm leading-5 text-slate-200" : "rounded-md border border-slate-100 bg-white px-3 py-2 text-sm leading-5 text-slate-700"}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function NatalBottomActions({ publicMode, children }: { publicMode: boolean; children: ReactNode }) {
  return (
    <div
      className={publicMode ? "rounded-lg border border-amber-200/20 bg-slate-950/50 p-3" : "rounded-lg border border-amber-200 bg-amber-50/80 p-3"}
      data-premium-natal-bottom-actions
    >
      {children}
    </div>
  );
}

export function ExtendedNatalFeature({
  publicMode,
  natalChart,
  onBack,
  onSave,
  onShare,
  onEvent,
  defaultSign,
}: VipToolBaseProps & { natalChart: NatalChart | null }) {
  const featureKey: VipFeatureKey = "vipNatalChart";
  const [signSlug, setSignSlug] = useState((natalChart?.sign ?? defaultSign ?? signs[0]).slug);
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthCity, setBirthCity] = useState("");
  const [gender, setGender] = useState<Gender>("unspecified");
  const [calculated, setCalculated] = useState(false);
  const [activeNatalTab, setActiveNatalTab] = useState<NatalResultTabId>("main");
  const actions = useResultActions(featureKey, onEvent, onSave, onShare);
  const resultSign = birthDate ? signFromBirthDate(birthDate, signSlug) : signBySlug(signSlug);
  const result = buildNatalBlocks(resultSign, birthDate, birthTime, birthCity, gender, natalChart?.sign.slug === resultSign.slug ? natalChart : null);
  const natalSections = buildNatalResultSections(result);
  const activeNatalSection = natalSections[activeNatalTab];
  const parsedBirthDate = parseBirthIsoDate(birthDate);
  const birthDateValidationError = birthDateError(birthDate);
  const payload = vipPayload({
    sign: resultSign.slug,
    hasBirthDate: Boolean(parsedBirthDate),
    hasBirthTime: /^\d{2}:\d{2}$/.test(birthTime),
    hasBirthCity: Boolean(birthCity.trim()),
    inputMode: natalInputMode(result.mode),
    chartType: "natal",
  });

  function updateBirthDate(value: string) {
    const nextValue = sanitizeBirthDateInputDraft(value);
    setBirthDate(nextValue);
    const nextSign = signFromBirthDate(nextValue, signSlug);
    if (parseBirthIsoDate(nextValue)) setSignSlug(nextSign.slug);
  }

  return (
    <VipScreenLayout publicMode={publicMode} title="Расширенная натальная карта" onBack={onBack}>
      <div className="space-y-4" data-aphrodite-natal-flow-redesign="package-240">
        <VipIntro publicMode={publicMode} text="Премиальная натальная карта показывает личный код, темперамент, отношения, решения, работу, рост и действие на сегодня. Данные используются только на экране расчёта." />
        <div data-aphrodite-natal-input="package-240">
          <AphroditeCard tone="rose" className="mb-3 space-y-3">
            <AphroditeBadge tone="rose">Натальная карта</AphroditeBadge>
            <div>
              <h3 className="text-base font-semibold leading-6 text-[#fff7ed]">Что даст натальная карта</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Ввод остаётся тем же: знак, дата рождения ДД.ММ.ГГГГ, время и город по желанию. Результат собирается в личный отчёт: характер, отношения, деньги, рост и один понятный шаг на сегодня.
              </p>
            </div>
          </AphroditeCard>
          <VipInputPanel publicMode={publicMode}>
            <SignSelect publicMode={publicMode} value={signSlug} onChange={setSignSlug} />
            <VipField publicMode={publicMode} label="Дата рождения">
              <ZodiacUnifiedDateInput
                publicMode={publicMode}
                value={birthDate}
                onChange={updateBirthDate}
                hasError={Boolean(birthDateValidationError)}
                birthDateScope="vip-natal"
                hint="Формат: ДД.ММ.ГГГГ. Например: 15.06.1998. Можно ввести дату рождения с 1900 года до сегодняшнего дня."
              />
              {birthDateValidationError ? (
                <p className={publicMode ? "mt-2 text-xs font-semibold text-rose-200" : "mt-2 text-xs font-semibold text-rose-700"}>{birthDateValidationError}</p>
              ) : null}
            </VipField>
            <VipField publicMode={publicMode} label="Время рождения">
              <ZodiacUnifiedTimeInput publicMode={publicMode} value={birthTime} onChange={setBirthTime} />
            </VipField>
            <VipField publicMode={publicMode} label="Город рождения">
              <ZodiacCityAutocompleteInput publicMode={publicMode} value={birthCity} onChange={setBirthCity} />
            </VipField>
            <GenderSelect publicMode={publicMode} value={gender} onChange={setGender} />
          </VipInputPanel>
        </div>
        <div className={publicMode ? "rounded-lg border border-white/10 bg-white/5 p-3 text-sm leading-6 text-slate-300" : "rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-600"}>
          {result.mode === "extended" ? "Данные учтены в расширенной интерпретации, но точные дома и асцендент не заявляются без real astro engine." : result.mode === "date" ? "Базовый расчёт без точного времени: дата определяет знак автоматически, время и город можно не вводить." : "Базовая карта по знаку: дату можно добавить позже, чтобы открыть более личный слой."}
        </div>
        {natalChart ? (
          <VipReuseButton publicMode={publicMode} onClick={() => {
            setSignSlug(natalChart.sign.slug);
            actions.reuse({ featureKey, sign: natalChart.sign.slug, hasBirthDate: natalChart.hasBirthDate, hasBirthTime: natalChart.hasBirthTime, hasBirthCity: natalChart.hasBirthCity, inputMode: "profile" });
          }} />
        ) : null}
        <PrimaryVipButton publicMode={publicMode} onClick={() => {
          actions.calculate(payload);
          actions.chart(payload);
          setActiveNatalTab("main");
          setCalculated(true);
        }}>
          Рассчитать
        </PrimaryVipButton>
        {calculated ? (
          <VipResultPanel publicMode={publicMode} title={result.title}>
            <div className="space-y-3" data-aphrodite-natal-report="package-240">
              <NatalResultHero publicMode={publicMode} result={result} resultSign={resultSign} />
              <AphroditeShareCard
                variant="natal"
                scope="vip-natal"
                eyebrow="Карточка Natal"
                title={`${resultSign.emoji} ${resultSign.name}`}
                subtitle={result.modeLabel}
                scoreLabel={vipElementLabel(resultSign.element)}
                scoreDetail={result.mode === "extended" ? "расширено" : result.mode === "date" ? "дата" : "знак"}
                insight={result.summary}
                highlights={[
                  { label: "сила", value: resultSign.element, detail: result.items[0]?.text ?? result.summary },
                  { label: "рост", value: "фокус", detail: result.recommendations[1] ?? result.summary },
                  { label: "сегодня", value: "действие", detail: result.recommendations[0] ?? result.summary },
                ]}
                footer="Визуальная карточка Natal. Safe share fallback, DB и расчет остаются без изменений."
              />
              <NatalChartVisual publicMode={publicMode} sign={resultSign} birthDate={birthDate} birthTime={birthTime} birthCity={birthCity} gender={gender} mode={result.mode} title={`${resultSign.name} · символическая натальная карта`} />
              <NatalResultTabs publicMode={publicMode} activeTab={activeNatalTab} onTabChange={setActiveNatalTab} />
              <NatalSectionPanel publicMode={publicMode} section={activeNatalSection} />
              <div data-aphrodite-natal-vip-preview="package-240">
                <AphroditeLockedPreviewCard
                  variant="natal"
                  scope="vip-natal"
                  title="Pro Natal слой"
                  subtitle="Natal превью закрыто"
                  preview="Pro-слой показан как короткое превью."
                  features={["Натальный профиль", "Связь с Матрицей", "Личный совет"]}
                  previewItems={["Личные циклы", "Карьерные сценарии", "Ритуал недели"]}
                />
              </div>
              <NatalBottomActions publicMode={publicMode}>
                <VipResultActions publicMode={publicMode} saved={actions.saved} shared={actions.shared} shareStatus={actions.shareStatus} saveLabel="Сохранить карту" shareLabel="Поделиться картой" onSave={() => actions.save(payload, buildNatalRetentionAction(resultSign, result.mode))} onShare={() => actions.share(payload, buildNatalRetentionAction(resultSign, result.mode))} />
              </NatalBottomActions>
            </div>
          </VipResultPanel>
        ) : null}
      </div>
    </VipScreenLayout>
  );
}

export function VipMonthForecastFeature({
  publicMode,
  monthForecast,
  onBack,
  onSave,
  onShare,
  onEvent,
  defaultSign,
}: VipToolBaseProps & { monthForecast: MonthForecast | null }) {
  const featureKey: VipFeatureKey = "vipMonthForecast";
  const [signSlug, setSignSlug] = useState((defaultSign ?? signs[0]).slug);
  const [month, setMonth] = useState("2026-06");
  const [goal, setGoal] = useState<VipGoal>("clarity");
  const [calculated, setCalculated] = useState(false);
  const sign = signBySlug(signSlug);
  const actions = useResultActions(featureKey, onEvent, onSave, onShare);
  const payload = vipPayload({ sign: sign.slug, goal, inputMode: "month" });
  const seed = `${sign.slug}:${month}:${goal}`;

  return (
    <VipScreenLayout publicMode={publicMode} title="Месячный прогноз" onBack={onBack}>
      <VipIntro publicMode={publicMode} text="VIP-прогноз собирает месяц в понятную карту: тема, любовь, деньги, энергия, риски и лучший период." />
      <VipInputPanel publicMode={publicMode}>
        <SignSelect publicMode={publicMode} value={signSlug} onChange={setSignSlug} />
        <VipField publicMode={publicMode} label="Месяц">
          <input className={inputClass(publicMode)} type="month" value={month} onChange={(event) => setMonth(event.target.value)} />
        </VipField>
        <GoalSelect publicMode={publicMode} value={goal} onChange={setGoal} />
      </VipInputPanel>
      {monthForecast ? (
        <VipReuseButton publicMode={publicMode} onClick={() => {
          actions.reuse({ featureKey, sign: sign.slug, goal, inputMode: "current_sign" });
        }} />
      ) : null}
      <PrimaryVipButton publicMode={publicMode} onClick={() => {
        actions.calculate(payload);
        setCalculated(true);
      }}>
        Показать
      </PrimaryVipButton>
      {calculated ? (
        <VipResultPanel publicMode={publicMode} title={`${sign.emoji} ${sign.name} · прогноз на ${displayMonth(month)}`}>
          <InfoBlock publicMode={publicMode} title="Главная тема" text={monthForecast?.theme ?? `${goalLabel(goal)} требует спокойного плана: сначала выбрать приоритет, затем распределить силы по неделям.`} />
          <InfoBlock publicMode={publicMode} title="Любовь и отношения" text={monthForecast?.love ?? pick(["лучше работают короткие честные разговоры", "отношениям полезна мягкая инициатива", "не проверяйте чувства молчанием"], seed, 1)} />
          <InfoBlock publicMode={publicMode} title="Деньги и дела" text={monthForecast?.money ?? pick(["хороший месяц для ревизии расходов", "дела требуют одного ясного маршрута", "не берите лишнее из желания всё успеть"], seed, 2)} />
          <InfoBlock publicMode={publicMode} title="Энергия" text={monthForecast?.energy ?? pick(["берегите сон и не спорьте на усталости", "силы прибавит стабильный режим", "лучше чередовать рывок и восстановление"], seed, 3)} />
          <InfoBlock publicMode={publicMode} title="Риск" text={monthForecast?.risk ?? pick(["переоценить скорость других людей", "сказать слишком резко в момент напряжения", "застрять в сравнении себя с чужим темпом"], seed, 4)} />
          <InfoBlock publicMode={publicMode} title="Лучший период" text={monthForecast?.bestPeriod ?? "середина месяца: больше ясности, легче договариваться и завершать небольшие дела"} />
          <InfoBlock publicMode={publicMode} title="Главный совет" text={monthForecast?.advice ?? "выберите один приоритет месяца и возвращайтесь к нему, когда эмоции начинают распылять внимание"} />
          <VipResultActions publicMode={publicMode} saved={actions.saved} shared={actions.shared} shareStatus={actions.shareStatus} onSave={() => actions.save(payload)} onShare={() => actions.share(payload)} />
        </VipResultPanel>
      ) : null}
    </VipScreenLayout>
  );
}

export function ExtendedNameProfileFeature({
  publicMode,
  nameProfile,
  onBack,
  onSave,
  onShare,
  onEvent,
  defaultSign,
}: VipToolBaseProps & { nameProfile: NameProfile | null }) {
  const featureKey: VipFeatureKey = "vipNameProfile";
  const [name, setName] = useState("");
  const [signSlug, setSignSlug] = useState((defaultSign ?? signs[0]).slug);
  const [goal, setGoal] = useState<VipGoal>("clarity");
  const [calculated, setCalculated] = useState(false);
  const sign = signBySlug(signSlug);
  const actions = useResultActions(featureKey, onEvent, onSave, onShare);
  const payload = vipPayload({ sign: sign.slug, goal, inputMode: name.trim() ? "name_entered" : "sign_only" });
  const seed = `${name.length}:${sign.slug}:${goal}`;

  return (
    <VipScreenLayout publicMode={publicMode} title="Расширенный именной профиль" onBack={onBack}>
      <VipIntro publicMode={publicMode} text="Короткий разбор имени. Данные остаются на устройстве." />
      <VipInputPanel publicMode={publicMode}>
        <VipField publicMode={publicMode} label="Имя">
          <input className={inputClass(publicMode)} value={name} onChange={(event) => setName(event.target.value)} />
        </VipField>
        <SignSelect publicMode={publicMode} value={signSlug} onChange={setSignSlug} />
        <GoalSelect publicMode={publicMode} value={goal} onChange={setGoal} />
      </VipInputPanel>
      {nameProfile ? (
        <VipReuseButton publicMode={publicMode} onClick={() => {
          actions.reuse({ featureKey, sign: sign.slug, goal, inputMode: "profile" });
        }} />
      ) : null}
      <PrimaryVipButton publicMode={publicMode} onClick={() => {
        actions.calculate(payload);
        setCalculated(true);
      }}>
        Рассчитать
      </PrimaryVipButton>
      {calculated ? (
        <VipResultPanel publicMode={publicMode} title={`${sign.emoji} ${sign.name} · именной резонанс`}>
          <InfoBlock publicMode={publicMode} title="Внутренний портрет" text={nameProfile?.portrait ?? `${name.trim() ? "Введённое имя" : "Имя"} задаёт символический ритм: важно говорить с собой мягко и выбирать формулировки, которые не усиливают внутреннее давление.`} />
          <InfoBlock publicMode={publicMode} title="Сильная сторона" text={nameProfile?.vipBlocks?.[0]?.text ?? pick(["умение слышать нюансы", "способность быстро собираться", "тёплый стиль контакта", "внимание к деталям"], seed, 1)} />
          <InfoBlock publicMode={publicMode} title="Риск" text={nameProfile?.vipBlocks?.[3]?.text ?? pick(["пытаться доказать ценность слишком резко", "застревать в ожидании идеальной реакции", "сравнивать себя с чужим образом"], seed, 2)} />
          <InfoBlock publicMode={publicMode} title="Совет" text={`Фокус "${goalLabel(goal)}": сформулируйте одну просьбу коротко и оставьте место для спокойного ответа.`} />
          <VipResultActions publicMode={publicMode} saved={actions.saved} shared={actions.shared} shareStatus={actions.shareStatus} onSave={() => actions.save(payload)} onShare={() => actions.share(payload)} />
        </VipResultPanel>
      ) : null}
    </VipScreenLayout>
  );
}

export function ExtendedCompatibilityFeature({
  publicMode,
  result,
  pairReady,
  onBack,
  onSave,
  onShare,
  onEvent,
  defaultSign,
  defaultSecondSign,
  relationshipMode = "love",
  scoreTier,
}: VipToolBaseProps & { result: CompatibilityResult | null; pairReady: boolean }) {
  const featureKey: VipFeatureKey = "vipCompatibility";
  const [firstSlug, setFirstSlug] = useState((defaultSign ?? signs[0]).slug);
  const [secondSlug, setSecondSlug] = useState((defaultSecondSign ?? signs[2]).slug);
  const [mode, setMode] = useState<RelationshipMode>(relationshipMode);
  const [calculated, setCalculated] = useState(false);
  const first = signBySlug(firstSlug);
  const second = signBySlug(secondSlug);
  const score = pairReady && result ? result.scores.total : calculatePairScore(first, second, mode);
  const tier = scoreTier ?? safeScoreTier(score);
  const actions = useResultActions(featureKey, onEvent, onSave, onShare);
  const payload = vipPayload({ firstSign: first.slug, secondSign: second.slug, relationshipMode: mode, scoreTier: tier, inputMode: "sign_pair" });

  return (
    <VipScreenLayout publicMode={publicMode} title="Расширенная совместимость" onBack={onBack}>
      <VipIntro publicMode={publicMode} text="Расчёт показывает не только процент, а температуру пары: чувства, общение, быт, притяжение и главный совет." />
      {!pairReady ? <PairInlineHint publicMode={publicMode} /> : null}
      <VipInputPanel publicMode={publicMode}>
        <SignSelect publicMode={publicMode} value={firstSlug} onChange={setFirstSlug} label="Первый знак" />
        <SignSelect publicMode={publicMode} value={secondSlug} onChange={setSecondSlug} label="Второй знак" />
        <ZodiacSelect publicMode={publicMode} label="Режим" value={mode} options={relationshipModeSelectOptions} onChange={setMode} />
      </VipInputPanel>
      {pairReady ? (
        <VipReuseButton publicMode={publicMode} onClick={() => {
          setFirstSlug((defaultSign ?? first).slug);
          setSecondSlug((defaultSecondSign ?? second).slug);
          actions.reuse({ featureKey, firstSign: (defaultSign ?? first).slug, secondSign: (defaultSecondSign ?? second).slug, relationshipMode: mode, scoreTier: tier, inputMode: "current_pair" });
        }} />
      ) : null}
      <PrimaryVipButton publicMode={publicMode} onClick={() => {
        actions.calculate(payload);
        actions.chart(payload);
        setCalculated(true);
      }}>
        Рассчитать
      </PrimaryVipButton>
      {calculated ? (
        <VipResultPanel publicMode={publicMode} title={`${first.emoji} ${first.name} + ${second.emoji} ${second.name} · ${relationshipModeLabel(mode)}`}>
          <AstroChartVisual publicMode={publicMode} kind="pair" primarySign={first} secondarySign={second} mode={mode} title="VIP карта отношений" />
          <div className="grid gap-2 sm:grid-cols-3">
            <VipStatusPill publicMode={publicMode} label="Score" value={`${score}%`} />
            <VipStatusPill publicMode={publicMode} label="Уровень" value={tier ?? "medium"} />
            <VipStatusPill publicMode={publicMode} label="Режим" value={relationshipModeLabel(mode)} />
          </div>
          <InfoBlock publicMode={publicMode} title="Главный вывод" text={result?.overviewText ?? `Пара держится на сочетании темпа ${first.name} и реакции ${second.name}: чем яснее договорённости, тем меньше напряжения.`} />
          <InfoBlock publicMode={publicMode} title="Любовь" text={result?.loveText ?? "лучше работают тёплые действия, а не проверка чувств"} />
          <InfoBlock publicMode={publicMode} title="Общение" text={result?.communicationText ?? "говорите короче, конкретнее и без скрытых тестов"} />
          <InfoBlock publicMode={publicMode} title="Быт / ритм" text={result?.householdText ?? "распределите ожидания заранее, чтобы бытовые мелочи не становились символом отношения"} />
          <InfoBlock publicMode={publicMode} title="Главный совет" text={result?.adviceText ?? "не пытайтесь победить в разговоре: выбирайте общий следующий шаг"} />
          <InfoBlock publicMode={publicMode} title="3 сильные стороны" text={`${first.name} даёт паре свой темп; ${second.name} добавляет ответную реакцию; режим "${relationshipModeLabel(mode)}" помогает выбрать язык разговора. Сильнее всего работает не процент, а повторяемый маленький шаг.`} />
          <InfoBlock publicMode={publicMode} title="3 риска" text="спор на усталости; проверка чувств молчанием; попытка решить весь сценарий одним разговором. Лучше заранее договориться о паузе, формулировке и следующем действии." />
          <InfoBlock publicMode={publicMode} title="Что делать дальше" text={`Сегодня выберите один общий шаг: короткое сообщение, бытовую договорённость или спокойную встречу. Если score ${score}%, не перегружайте пару доказательствами, закрепите то, что уже работает.`} />
          <VipResultActions publicMode={publicMode} saved={actions.saved} shared={actions.shared} shareStatus={actions.shareStatus} onSave={() => actions.save(payload)} onShare={() => actions.share(payload)} />
        </VipResultPanel>
      ) : null}
    </VipScreenLayout>
  );
}

export function VipMentalMapFeature({
  publicMode,
  result,
  pairReady,
  onBack,
  onSave,
  onShare,
  onEvent,
  defaultSign,
  defaultSecondSign,
  relationshipMode = "love",
  scoreTier,
}: VipToolBaseProps & { result: CompatibilityResult | null; pairReady: boolean }) {
  const featureKey: VipFeatureKey = "vipMentalMap";
  const [firstSlug, setFirstSlug] = useState((defaultSign ?? signs[0]).slug);
  const [secondSlug, setSecondSlug] = useState((defaultSecondSign ?? signs[2]).slug);
  const [goal, setGoal] = useState<VipGoal>("clarity");
  const [calculated, setCalculated] = useState(false);
  const first = signBySlug(firstSlug);
  const second = signBySlug(secondSlug);
  const score = pairReady && result ? result.scores.total : calculatePairScore(first, second, relationshipMode);
  const tier = scoreTier ?? safeScoreTier(score);
  const actions = useResultActions(featureKey, onEvent, onSave, onShare);
  const payload = vipPayload({ firstSign: first.slug, secondSign: second.slug, relationshipMode, scoreTier: tier, goal, inputMode: "sign_pair" });

  return (
    <VipScreenLayout publicMode={publicMode} title="Ментальная карта пары" onBack={onBack}>
      <VipIntro publicMode={publicMode} text="Ментальная карта показывает, как пара думает, спорит, мирится и возвращается к доверию." />
      {!pairReady ? <PairInlineHint publicMode={publicMode} /> : null}
      <VipInputPanel publicMode={publicMode}>
        <SignSelect publicMode={publicMode} value={firstSlug} onChange={setFirstSlug} label="Первый знак" />
        <SignSelect publicMode={publicMode} value={secondSlug} onChange={setSecondSlug} label="Второй знак" />
        <GoalSelect publicMode={publicMode} value={goal} onChange={setGoal} />
      </VipInputPanel>
      <PrimaryVipButton publicMode={publicMode} onClick={() => {
        actions.calculate(payload);
        actions.chart(payload);
        setCalculated(true);
      }}>
        Рассчитать
      </PrimaryVipButton>
      {calculated ? (
        <VipResultPanel publicMode={publicMode} title={`${first.name} + ${second.name} · карта мышления`}>
          <AstroChartVisual publicMode={publicMode} kind="pair" primarySign={first} secondarySign={second} mode={relationshipMode} title="Ментальная карта связи" />
          <InfoBlock publicMode={publicMode} title="Как вы думаете" text={result?.mentalMapDynamics?.[0]?.text ?? `${first.name} быстрее реагирует на импульс, а ${second.name} добавляет свой способ проверки реальности. Важно сначала назвать цель разговора.`} />
          <InfoBlock publicMode={publicMode} title="Как спорите" text={result?.mentalMapDynamics?.[1]?.text ?? "напряжение растёт, когда один ждёт мгновенного ответа, а второй пытается защитить темп"} />
          <InfoBlock publicMode={publicMode} title="Как миритесь" text={result?.mentalMapDynamics?.[2]?.text ?? "лучше помогает короткое признание эмоции и одно действие, которое можно выполнить сегодня"} />
          <InfoBlock publicMode={publicMode} title="Что укрепляет" text={result?.mentalMapSummary?.helps?.join("; ") || `фокус "${goalLabel(goal)}", честный вопрос, пауза перед выводом`} />
          <InfoBlock publicMode={publicMode} title="Что избегать" text={result?.mentalMapSummary?.avoid?.join("; ") || "сарказм, молчаливые проверки и спор на усталости"} />
          <InfoBlock publicMode={publicMode} title="Лучший тон" text={`Для ${first.name} + ${second.name} лучше работает тон: коротко, тепло, без скрытого экзамена. Фокус "${goalLabel(goal)}" стоит назвать в начале разговора.`} />
          <InfoBlock publicMode={publicMode} title="Следующий шаг" text="Напишите одну фразу о цели, затем предложите конкретное действие на сегодня. Если реакция жёсткая, вернитесь к карте через паузу, а не через новый спор." />
          <VipResultActions publicMode={publicMode} saved={actions.saved} shared={actions.shared} shareStatus={actions.shareStatus} onSave={() => actions.save(payload)} onShare={() => actions.share(payload)} />
        </VipResultPanel>
      ) : null}
    </VipScreenLayout>
  );
}

export function VipCoupleCalendarFeature({
  publicMode,
  calendarDays,
  pairReady,
  firstPerson,
  secondPerson,
  onBack,
  onSave,
  onShare,
  onEvent,
  defaultSign,
  defaultSecondSign,
  relationshipMode = "love",
  scoreTier,
}: VipToolBaseProps & {
  calendarDays: CoupleCalendarDay[];
  pairReady: boolean;
  firstPerson?: Pick<PersonState, "name" | "birthDate" | "sign">;
  secondPerson?: Pick<PersonState, "name" | "birthDate" | "sign">;
}) {
  const featureKey: VipFeatureKey = "vipCoupleCalendar";
  const [firstSlug, setFirstSlug] = useState((defaultSign ?? signs[0]).slug);
  const [secondSlug, setSecondSlug] = useState((defaultSecondSign ?? signs[2]).slug);
  const [startDate, setStartDate] = useState("19.06.2026");
  const [calculated, setCalculated] = useState(false);
  const first = signBySlug(firstSlug);
  const second = signBySlug(secondSlug);
  const score = pairReady ? 72 : calculatePairScore(first, second, relationshipMode);
  const tier = scoreTier ?? safeScoreTier(score);
  const actions = useResultActions(featureKey, onEvent, onSave, onShare);
  const payload = vipPayload({ firstSign: first.slug, secondSign: second.slug, relationshipMode, scoreTier: tier, inputMode: "date_range" });
  const days = calendarDays.length >= 30 && pairReady ? calendarDays : buildPersonalizedCoupleCalendar({
    firstName: firstPerson?.name,
    secondName: secondPerson?.name,
    firstBirthDate: firstPerson?.birthDate,
    secondBirthDate: secondPerson?.birthDate,
    firstSign: firstPerson?.sign || first.slug,
    secondSign: secondPerson?.sign || second.slug,
    relationshipMode,
    startDate,
    count: 30,
    scoreTotal: score,
  });
  const previewDays = days.slice(0, 5);
  const compactDays = days.slice(5, 30);
  const sharedDisclaimer = days[0]?.softDisclaimer ?? VIP_PREVIEW_DISCLAIMER_FALLBACK;

  return (
    <VipScreenLayout publicMode={publicMode} title="30-дневный календарь пары" onBack={onBack}>
      <VipIntro publicMode={publicMode} text="Календарь пары показан как компактное VIP превью: первые 5 дней раскрыты коротко, остальные собраны в список." />
      {!pairReady ? <PairInlineHint publicMode={publicMode} /> : null}
      <VipInputPanel publicMode={publicMode}>
        <SignSelect publicMode={publicMode} value={firstSlug} onChange={setFirstSlug} label="Первый знак" />
        <SignSelect publicMode={publicMode} value={secondSlug} onChange={setSecondSlug} label="Второй знак" />
        <VipField publicMode={publicMode} label="Старт">
          <ZodiacUnifiedDateInput dateKind="calendar" publicMode={publicMode} value={startDate} onChange={setStartDate} autoComplete="off" />
        </VipField>
      </VipInputPanel>
      <PrimaryVipButton publicMode={publicMode} onClick={() => {
        actions.calculate(payload);
        setCalculated(true);
      }}>
        Показать
      </PrimaryVipButton>
      {calculated ? (
        <VipResultPanel publicMode={publicMode} title={`30 дней пары · ${first.name} + ${second.name}`}>
          <div className={publicMode ? "mb-3 rounded-lg border border-amber-200/20 bg-amber-200/10 p-3 text-sm leading-5 text-amber-50" : "mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm leading-5 text-amber-900"}>
            {VIP_PREVIEW_LOCKED_SCOPE_COPY} {sharedDisclaimer}
          </div>
          <div className="space-y-2">
            {previewDays.map((day, index) => (
              <div key={`${day.dateKey}-${index}`} className={publicMode ? "rounded-lg border border-white/10 bg-white/5 p-3" : "rounded-lg border border-slate-100 bg-white p-3"}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className={publicMode ? "text-sm font-semibold text-white" : "text-sm font-semibold text-slate-950"}>День {day.dayNumber} · {day.date}</p>
                  <span className={publicMode ? "rounded-full bg-amber-200/15 px-2 py-1 text-[11px] font-semibold text-amber-100" : "rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-800"}>{compactDayMood(day)}</span>
                </div>
                <p className={publicMode ? "mt-1 text-sm leading-5 text-slate-300" : "mt-1 text-sm leading-5 text-slate-700"}>{compactPreviewSentence(`${day.title}: ${day.emotionalTheme}`)}</p>
                <p className={publicMode ? "mt-1 text-sm font-medium leading-5 text-amber-50" : "mt-1 text-sm font-medium leading-5 text-amber-900"}>Действие: {compactPreviewSentence(day.recommendedAction, 96)}</p>
              </div>
            ))}
            {compactDays.length ? (
              <div className={publicMode ? "rounded-lg border border-white/10 bg-white/[0.03] p-3" : "rounded-lg border border-slate-100 bg-slate-50 p-3"}>
                <p className={publicMode ? "text-sm font-semibold text-white" : "text-sm font-semibold text-slate-950"}>Остальные дни · компактно</p>
                <div className="mt-2 grid gap-1.5">
                  {compactDays.map((day) => (
                    <div key={day.dateKey} className={publicMode ? "flex min-w-0 items-center gap-2 rounded-md border border-white/8 bg-black/15 px-2.5 py-2" : "flex min-w-0 items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-2"}>
                      <span className={publicMode ? "shrink-0 text-xs font-semibold text-amber-100" : "shrink-0 text-xs font-semibold text-amber-800"}>{day.dayNumber}</span>
                      <span className={publicMode ? "shrink-0 text-xs text-slate-400" : "shrink-0 text-xs text-slate-500"}>{day.date}</span>
                      <span className={publicMode ? "min-w-0 flex-1 truncate text-xs text-slate-200" : "min-w-0 flex-1 truncate text-xs text-slate-700"}>{compactDayMood(day)} · {compactPreviewSentence(day.recommendedAction, 68)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          <VipResultActions publicMode={publicMode} saved={actions.saved} shared={actions.shared} shareStatus={actions.shareStatus} onSave={() => actions.save(payload)} onShare={() => actions.share(payload)} />
        </VipResultPanel>
      ) : null}
    </VipScreenLayout>
  );
}

export function VipMessageHelperFeature({
  publicMode,
  messageVariants,
  pairReady,
  onBack,
  onSave,
  onShare,
  onEvent,
  defaultSign,
  defaultSecondSign,
  relationshipMode = "love",
  scoreTier,
}: VipToolBaseProps & { messageVariants: Array<{ label: string; text: string }>; pairReady: boolean }) {
  const featureKey: VipFeatureKey = "vipMessageHelper";
  const [firstSlug, setFirstSlug] = useState((defaultSign ?? signs[0]).slug);
  const [secondSlug, setSecondSlug] = useState((defaultSecondSign ?? signs[2]).slug);
  const [goal, setGoal] = useState<VipGoal>("reconciliation");
  const [tone, setTone] = useState<VipTone>("soft");
  const [calculated, setCalculated] = useState(false);
  const [copiedId, setCopiedId] = useState("");
  const first = signBySlug(firstSlug);
  const second = signBySlug(secondSlug);
  const tier = scoreTier ?? safeScoreTier(calculatePairScore(first, second, relationshipMode));
  const actions = useResultActions(featureKey, onEvent, onSave, onShare);
  const payload = vipPayload({ firstSign: first.slug, secondSign: second.slug, relationshipMode, scoreTier: tier, goal, tone, inputMode: "message_goal" });
  const generatedMessages = buildVipMessages(first, second, goal, tone, pairReady ? messageVariants : []);

  function copyMessage(id: string, text: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(text).catch(() => {
        // Clipboard access is optional in Telegram WebView/browser smoke.
      });
    }
    setCopiedId(id);
    onEvent?.("vip_message_copied", { featureKey, firstSign: first.slug, secondSign: second.slug, relationshipMode, scoreTier: tier, goal, tone });
  }

  return (
    <VipScreenLayout publicMode={publicMode} title="Помощник сообщений" onBack={onBack}>
      <VipIntro publicMode={publicMode} text="Три короткие фразы для разговора. Данные остаются на устройстве." />
      {!pairReady ? <PairInlineHint publicMode={publicMode} /> : null}
      <VipInputPanel publicMode={publicMode}>
        <SignSelect publicMode={publicMode} value={firstSlug} onChange={setFirstSlug} label="Первый знак" />
        <SignSelect publicMode={publicMode} value={secondSlug} onChange={setSecondSlug} label="Второй знак" />
        <GoalSelect publicMode={publicMode} value={goal} onChange={setGoal} label="Цель сообщения" />
        <ToneSelect publicMode={publicMode} value={tone} onChange={setTone} />
      </VipInputPanel>
      <PrimaryVipButton publicMode={publicMode} onClick={() => {
        actions.calculate(payload);
        setCalculated(true);
      }}>
        Показать
      </PrimaryVipButton>
      {calculated ? (
        <VipResultPanel publicMode={publicMode} title={`Что написать · ${toneLabel(tone).toLowerCase()} тон`}>
          {generatedMessages.map((message) => (
            <div key={message.id} className={publicMode ? "rounded-lg border border-white/10 bg-white/5 p-3" : "rounded-lg border border-slate-100 bg-white p-3"}>
              <p className={publicMode ? "text-sm font-semibold text-amber-100" : "text-sm font-semibold text-amber-800"}>{message.label}</p>
              <p className={publicMode ? "mt-2 text-sm leading-6 text-slate-200" : "mt-2 text-sm leading-6 text-slate-800"}>{message.text}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <SecondaryVipButton publicMode={publicMode} onClick={() => copyMessage(message.id, message.text)}>
                  {copiedId === message.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copiedId === message.id ? "Скопировано" : "Скопировать"}
                </SecondaryVipButton>
              </div>
            </div>
          ))}
          <VipResultActions publicMode={publicMode} saved={actions.saved} shared={actions.shared} shareStatus={actions.shareStatus} onSave={() => actions.save(payload)} onShare={() => actions.share(payload)} />
        </VipResultPanel>
      ) : null}
    </VipScreenLayout>
  );
}

function buildVipMessages(first: ZodiacSign, second: ZodiacSign, goal: VipGoal, tone: VipTone, variants: Array<{ label: string; text: string }>) {
  const base = variants.filter((item) => !item.text.includes("выберите два знака")).slice(0, 3);
  if (base.length >= 3) {
    return base.map((item, index) => ({ id: `message_${index}`, label: item.label, text: item.text }));
  }
  const tonePrefix: Record<VipTone, string> = {
    soft: "Мне важно сказать это спокойно:",
    warm: "Я хочу сохранить тепло между нами:",
    direct: "Скажу прямо и бережно:",
    romantic: "Мне хочется быть ближе к тебе:",
  };
  const goalLine: Record<VipGoal, string> = {
    love: "давай сделаем сегодня один маленький шаг навстречу друг другу.",
    work: "давай договоримся о понятном плане без лишнего давления.",
    energy: "давай не спорить на усталости и выбрать более мягкий темп.",
    clarity: "давай проясним главное коротко, без догадок и проверок.",
    reconciliation: "мне жаль за резкость; я хочу услышать тебя и восстановить контакт.",
  };
  return [
    { id: "warm_start", label: "Тёплый старт", text: `${tonePrefix[tone]} ${first.name} и ${second.name} могут не совпадать в темпе, но ${goalLine[goal]}` },
    { id: "clear_step", label: "Мягкий шаг", text: `Мне важно не победить в разговоре, а понять нас. Давай выберем один следующий шаг и не будем давить друг на друга.` },
    { id: "careful_close", label: "Бережное завершение", text: `Спасибо, что слышишь меня. Я рядом и хочу говорить так, чтобы нам обоим было спокойнее.` },
  ];
}

export function ExtendedNumerologyFeature({
  publicMode,
  numerology,
  onBack,
  onSave,
  onShare,
  onEvent,
  defaultSign,
}: VipToolBaseProps & { numerology: NumerologyProfile }) {
  const featureKey: VipFeatureKey = "vipNumerology";
  const [birthDate, setBirthDate] = useState("");
  const [name, setName] = useState("");
  const [goal, setGoal] = useState<VipGoal>("energy");
  const [calculated, setCalculated] = useState(false);
  const sign = defaultSign ?? signs[0];
  const parsedDate = parseBirthIsoDate(birthDate);
  const birthDateValidationError = birthDateError(birthDate);
  const lifePath = parsedDate ? reduceNumber(parsedDate.day + parsedDate.month + parsedDate.year) : numerology.lifePath;
  const nameNumber = name.trim() ? reduceNumber(Array.from(name.trim()).reduce((sum, char) => sum + char.charCodeAt(0), 0)) : numerology.nameNumber;
  const actions = useResultActions(featureKey, onEvent, onSave, onShare);
  const payload = vipPayload({ sign: sign.slug, hasBirthDate: Boolean(parsedDate), inputMode: name.trim() ? "date_and_name" : parsedDate ? "date" : "day_number", goal });

  return (
    <VipScreenLayout publicMode={publicMode} title="Расширенная нумерология" onBack={onBack}>
      <VipIntro publicMode={publicMode} text="Нумерология показывает число пути, число имени, личный месяц и практичный совет. Имя и дата остаются только на экране." />
      <VipInputPanel publicMode={publicMode}>
        <VipField publicMode={publicMode} label="Дата рождения">
          <ZodiacUnifiedDateInput
            publicMode={publicMode}
            value={birthDate}
            onChange={setBirthDate}
            hasError={Boolean(birthDateValidationError)}
            birthDateScope="vip-numerology"
            hint="Формат: ДД.ММ.ГГГГ. Например: 15.06.1998. Можно ввести дату рождения с 1900 года до сегодняшнего дня."
          />
          {birthDateValidationError ? (
            <p className={publicMode ? "mt-2 text-xs font-semibold text-rose-200" : "mt-2 text-xs font-semibold text-rose-700"}>{birthDateValidationError}</p>
          ) : null}
        </VipField>
        <VipField publicMode={publicMode} label="Имя">
          <input className={inputClass(publicMode)} value={name} onChange={(event) => setName(event.target.value)} />
        </VipField>
        <GoalSelect publicMode={publicMode} value={goal} onChange={setGoal} />
      </VipInputPanel>
      <PrimaryVipButton publicMode={publicMode} onClick={() => {
        actions.calculate(payload);
        actions.chart(payload);
        setCalculated(true);
      }}>
        Рассчитать
      </PrimaryVipButton>
      {calculated ? (
        <VipResultPanel publicMode={publicMode} title="Числовой профиль">
          <AstroChartVisual publicMode={publicMode} kind="numerology" primarySign={sign} title="VIP числовой круг" />
          <div className="grid gap-2 sm:grid-cols-4">
            <VipStatusPill publicMode={publicMode} label="Путь" value={String(lifePath ?? numerology.dayNumber)} />
            <VipStatusPill publicMode={publicMode} label="Имя" value={String(nameNumber ?? "—")} />
            <VipStatusPill publicMode={publicMode} label="Месяц" value={String(numerology.personalMonth ?? numerology.dayNumber)} />
            <VipStatusPill publicMode={publicMode} label="День" value={String(numerology.dayNumber)} />
          </div>
          <InfoBlock publicMode={publicMode} title="Сильные стороны" text={numerology.strengths} />
          <InfoBlock publicMode={publicMode} title="Риски" text={numerology.risks} />
          <InfoBlock publicMode={publicMode} title="Совет" text={`${numerology.advice}. Фокус "${goalLabel(goal)}" лучше раскрывать через один небольшой завершённый шаг.`} />
          <InfoBlock publicMode={publicMode} title="Что сделать" text={`Число пути ${lifePath ?? numerology.dayNumber} просит практики: выберите одно действие, которое можно закрыть сегодня, и отметьте результат без самооценки.`} />
          <InfoBlock publicMode={publicMode} title="Чего избегать" text={`Не превращайте число имени ${nameNumber ?? numerology.nameNumber} в ярлык. Это символический фокус, а не приговор: проверяйте его через реальные решения.`} />
          <VipResultActions publicMode={publicMode} saved={actions.saved} shared={actions.shared} shareStatus={actions.shareStatus} onSave={() => actions.save(payload)} onShare={() => actions.share(payload)} />
        </VipResultPanel>
      ) : null}
    </VipScreenLayout>
  );
}

export function ExtendedAngelNumberFeature({
  publicMode,
  angelNumber,
  onBack,
  onSave,
  onShare,
  onEvent,
  defaultSign,
}: VipToolBaseProps & { angelNumber: AngelNumberProfile }) {
  const featureKey: VipFeatureKey = "vipAngelNumbers";
  const [value, setValue] = useState(angelNumber.isValid ? angelNumber.label : "11:11");
  const [goal, setGoal] = useState<VipGoal>("clarity");
  const [calculated, setCalculated] = useState(false);
  const sign = defaultSign ?? signs[0];
  const safeValue = /^\d{2}:\d{2}$/.test(value) ? value : "11:11";
  const actions = useResultActions(featureKey, onEvent, onSave, onShare);
  const payload = vipPayload({ sign: sign.slug, selectedPresetKey: `angel_${safeValue.replace(":", "")}`, patternType: angelNumber.patternType, inputMode: "angel_time", goal });

  return (
    <VipScreenLayout publicMode={publicMode} title="Толкование ангельских чисел" onBack={onBack}>
      <VipIntro publicMode={publicMode} text="VIP-толкование разбирает повторяющиеся и зеркальные числа: любовь, дела, интуицию, действие и осторожность." />
      <VipInputPanel publicMode={publicMode}>
        <VipField publicMode={publicMode} label="Комбинация">
          <input className={inputClass(publicMode)} value={value} onChange={(event) => setValue(event.target.value)} />
        </VipField>
        <GoalSelect publicMode={publicMode} value={goal} onChange={setGoal} />
      </VipInputPanel>
      <PrimaryVipButton publicMode={publicMode} onClick={() => {
        actions.calculate(payload);
        setCalculated(true);
      }}>
        Рассчитать
      </PrimaryVipButton>
      {calculated ? (
        <VipResultPanel publicMode={publicMode} title={`${safeValue} · знак Вселенной`}>
          <InfoBlock publicMode={publicMode} title="Главный смысл" text={angelNumber.isValid && angelNumber.label === safeValue ? angelNumber.meaning : "это мягкое напоминание вернуть внимание к главному и не ждать идеального знака вместо действия"} />
          <InfoBlock publicMode={publicMode} title="Любовь" text={angelNumber.isValid ? angelNumber.love : "лучше выбрать одно честное сообщение без проверки чувств"} />
          <InfoBlock publicMode={publicMode} title="Дела" text={angelNumber.isValid ? angelNumber.workMoney : "сверьте план, деньги и обещания без спешки"} />
          <InfoBlock publicMode={publicMode} title="Интуиция" text={angelNumber.isValid ? angelNumber.intuition : "заметьте мысль, которая была рядом с числом"} />
          <InfoBlock publicMode={publicMode} title="Действие" text={(angelNumber.isValid ? angelNumber.actions : ["сделать один ясный шаг"]).join("; ")} />
          <InfoBlock publicMode={publicMode} title="Осторожность" text={(angelNumber.isValid ? angelNumber.avoid : ["не строить вывод по одному совпадению"]).join("; ")} />
          <VipResultActions publicMode={publicMode} saved={actions.saved} shared={actions.shared} shareStatus={actions.shareStatus} onSave={() => actions.save(payload)} onShare={() => actions.share(payload)} />
        </VipResultPanel>
      ) : null}
    </VipScreenLayout>
  );
}

export function VipTalismansFeature({
  publicMode,
  dailyTalisman,
  selfSign,
  onBack,
  onSave,
  onShare,
  onEvent,
}: VipToolBaseProps & { dailyTalisman: DailyTalismanProfile | null; selfSign: ZodiacSign | null }) {
  const featureKey: VipFeatureKey = "vipTalismans";
  const [signSlug, setSignSlug] = useState((selfSign ?? signs[0]).slug);
  const [goal, setGoal] = useState<VipGoal>("energy");
  const [calculated, setCalculated] = useState(false);
  const sign = signBySlug(signSlug);
  const actions = useResultActions(featureKey, onEvent, onSave, onShare);
  const payload = vipPayload({ sign: sign.slug, goal, inputMode: "sign_goal" });
  const seed = `${sign.slug}:${goal}`;

  return (
    <VipScreenLayout publicMode={publicMode} title="Талисманы и символы силы" onBack={onBack}>
      <VipIntro publicMode={publicMode} text="Инструмент подбирает символы для фокуса дня: камень, цвет, число, фразу силы и маленькое действие." />
      <VipInputPanel publicMode={publicMode}>
        <SignSelect publicMode={publicMode} value={signSlug} onChange={setSignSlug} />
        <GoalSelect publicMode={publicMode} value={goal} onChange={setGoal} />
      </VipInputPanel>
      <PrimaryVipButton publicMode={publicMode} onClick={() => {
        actions.calculate(payload);
        setCalculated(true);
      }}>
        Показать
      </PrimaryVipButton>
      {calculated ? (
        <VipResultPanel publicMode={publicMode} title={`${sign.emoji} ${sign.name} · символы силы`}>
          <div className="grid gap-2 sm:grid-cols-3">
            <VipStatusPill publicMode={publicMode} label="Камень" value={dailyTalisman?.stone ?? pick(["лунный камень", "цитрин", "аметист", "гранат"], seed, 1)} />
            <VipStatusPill publicMode={publicMode} label="Цвет" value={dailyTalisman?.color ?? pick(["золотой", "серебристый", "изумрудный", "синий"], seed, 2)} />
            <VipStatusPill publicMode={publicMode} label="Число" value={String(dailyTalisman?.number ?? (hashString(seed) % 9) + 1)} />
          </div>
          <InfoBlock publicMode={publicMode} title="Фраза силы" text={dailyTalisman?.phrase ?? "я выбираю спокойный шаг и держу фокус на главном"} />
          <InfoBlock publicMode={publicMode} title="Действие" text={dailyTalisman?.action ?? `для фокуса "${goalLabel(goal)}" выберите один видимый символ и одно маленькое действие`} />
          <InfoBlock publicMode={publicMode} title="Осторожность" text={dailyTalisman?.avoid ?? "не превращайте символ в обещание результата; он нужен как опора внимания"} />
          <VipResultActions publicMode={publicMode} saved={actions.saved} shared={actions.shared} shareStatus={actions.shareStatus} onSave={() => actions.save(payload)} onShare={() => actions.share(payload)} />
        </VipResultPanel>
      ) : null}
    </VipScreenLayout>
  );
}

export function VipMysticDayFeature({
  publicMode,
  dateKey,
  sign,
  angelNumber,
  onBack,
  onSave,
  onShare,
  onEvent,
}: VipToolBaseProps & { dateKey: string; sign: ZodiacSign | null; angelNumber: AngelNumberProfile }) {
  const featureKey: VipFeatureKey = "vipMysticDay";
  const [signSlug, setSignSlug] = useState((sign ?? signs[0]).slug);
  const [date, setDate] = useState(() => isoDateToDateInput(dateKey) || dateKey);
  const [goal, setGoal] = useState<VipGoal>("clarity");
  const [calculated, setCalculated] = useState(false);
  const selectedSign = signBySlug(signSlug);
  const actions = useResultActions(featureKey, onEvent, onSave, onShare);
  const payload = vipPayload({ sign: selectedSign.slug, goal, inputMode: "date_sign" });
  const selectedDateKey = dateInputToIsoDate(date) ?? dateKey;
  const synthesis = synthesizeVipMysticDay(selectedDateKey, selectedSign.slug as ZodiacSignId, angelNumber);

  return (
    <VipScreenLayout publicMode={publicMode} title="VIP мистический день" onBack={onBack}>
      <VipIntro publicMode={publicMode} text="Мистический день объединяет Таро, руну, цвет ауры, ангельское число и практичный совет." />
      <VipInputPanel publicMode={publicMode}>
        <SignSelect publicMode={publicMode} value={signSlug} onChange={setSignSlug} />
        <VipField publicMode={publicMode} label="Дата">
          <ZodiacUnifiedDateInput dateKind="calendar" publicMode={publicMode} value={date} onChange={setDate} autoComplete="off" />
        </VipField>
        <GoalSelect publicMode={publicMode} value={goal} onChange={setGoal} />
      </VipInputPanel>
      <PrimaryVipButton publicMode={publicMode} onClick={() => {
        actions.calculate(payload);
        actions.chart(payload);
        setCalculated(true);
      }}>
        Показать
      </PrimaryVipButton>
      {calculated ? (
        <VipResultPanel publicMode={publicMode} title={`${selectedSign.emoji} ${selectedSign.name} · ${displayDate(selectedDateKey)}`}>
          <AstroChartVisual publicMode={publicMode} kind="matrix" primarySign={selectedSign} title="VIP мистическая карта дня" caption="Символическая карта связывает знак, дату, цвет, руну, предупреждение и действие дня без обещаний точного предсказания." />
          <InfoBlock publicMode={publicMode} title="Таро и карта дня" text={`${synthesis.tarotCard.card} и ${synthesis.dailyCard.title}. ${synthesis.tarotCard.mainMeaning}`} />
          <InfoBlock publicMode={publicMode} title="Руна дня" text={`${synthesis.runeDay.symbol} ${synthesis.runeDay.name}. ${synthesis.runeDay.mainMeaning}`} />
          <InfoBlock publicMode={publicMode} title="Цвет и аура" text={`${synthesis.auraColor.color}. ${synthesis.auraColor.meaning}`} />
          {synthesis.angelNumber.isValid ? <InfoBlock publicMode={publicMode} title={`Синхрония чисел (${synthesis.angelNumber.safeKey})`} text={synthesis.angelNumber.label} /> : null}
          <InfoBlock publicMode={publicMode} title="Главный совет" text={synthesis.advice} />
          <InfoBlock publicMode={publicMode} title="Осторожность" text={synthesis.warning} />
          <InfoBlock publicMode={publicMode} title="Маленькое действие" text={`Фокус "${goalLabel(goal)}": выберите один символ дня и закрепите его простым действием до вечера.`} />
          <VipResultActions publicMode={publicMode} saved={actions.saved} shared={actions.shared} shareStatus={actions.shareStatus} onSave={() => actions.save(payload)} onShare={() => actions.share(payload)} />
        </VipResultPanel>
      ) : null}
    </VipScreenLayout>
  );
}
