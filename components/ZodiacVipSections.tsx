import { useState, type ElementType, type ReactNode } from "react";
import { ArrowLeft, Bookmark, CalendarDays, Check, Copy, Crown, HeartHandshake, Lock, MapPin, Share2, Sparkles, Star } from "lucide-react";
import type { ZodiacAnalyticsEventName, ZodiacAnalyticsPayload } from "@/lib/zodiac-mini-app-analytics-shared";
import { shareZodiacMiniAppContent } from "@/lib/zodiac-mini-app-share";
import { synthesizeVipMysticDay } from "@/lib/zodiac-vip-content";
import type { ZodiacSignId } from "@/lib/zodiac-mystic-content";
import { relationshipModes, signs } from "./zodiac-mini-app/constants";
import { AstroChartVisual } from "./zodiac-mini-app/AstroChartVisual";
import { ZodiacSelect, type ZodiacSelectOption } from "./zodiac-mini-app/ZodiacSelect";
import type {
  AngelNumberProfile,
  CompatibilityResult,
  CoupleCalendarDay,
  MonthForecast,
  MoreFeatureId,
  NameProfile,
  NatalChart,
  NumerologyProfile,
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
  onSave?: () => void;
  onShare?: () => Promise<string | void> | string | void;
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

const relationshipModeSelectOptions: Array<ZodiacSelectOption<RelationshipMode>> = relationshipModes.map((mode) => ({
  value: mode.id,
  label: mode.label,
  description: mode.caption,
}));

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
          ? `flex min-h-[88px] w-full flex-col justify-center rounded-lg border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-amber-200/40 ${
              locked ? "border-white/5 bg-white/5 opacity-60" : "border-white/10 bg-white/10 hover:border-amber-200/35 hover:bg-white/10"
            }`
          : `flex min-h-[88px] w-full flex-col justify-center rounded-lg border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-amber-200 ${
              locked ? "border-slate-200 bg-slate-50 opacity-60" : "border-amber-100 bg-white hover:border-amber-300"
            }`
      }
    >
      <div className="flex items-center gap-2">
        <Icon className={publicMode ? "h-4 w-4 text-amber-200" : "h-4 w-4 text-amber-500"} />
        <p className={publicMode ? "text-sm font-semibold text-white" : "text-sm font-semibold text-slate-950"}>{title}</p>
      </div>
      <p className={publicMode ? "mt-1.5 text-xs leading-5 text-slate-300" : "mt-1.5 text-xs leading-5 text-slate-600"}>{text}</p>
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
          <p className={publicMode ? "text-lg font-semibold text-white" : "text-lg font-semibold text-slate-950"}>👑 VIP открыт бесплатно</p>
          <p className={publicMode ? "mt-1 text-sm font-semibold text-amber-100" : "mt-1 text-sm font-semibold text-amber-800"}>Ранний доступ до {untilLabel}</p>
          <p className={publicMode ? "mt-2 text-sm leading-6 text-slate-300" : "mt-2 text-sm leading-6 text-slate-700"}>
            На период запуска все премиум-функции открыты бесплатно. Позже они войдут в подписку.
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
    <div className={publicMode ? "rounded-lg border border-amber-200/20 bg-black/40 p-4" : "rounded-lg border border-slate-200 bg-white p-4 shadow-sm"}>
      <div className="mb-4 flex items-center gap-3">
        <button type="button" onClick={onBack} className={publicMode ? "rounded-full p-2 text-white hover:bg-white/10" : "rounded-full p-2 text-slate-700 hover:bg-slate-100"}>
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className={publicMode ? "text-lg font-bold text-amber-200" : "text-lg font-bold text-slate-900"}>{title}</h2>
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
}: {
  publicMode: boolean;
  saved: boolean;
  shared: boolean;
  shareStatus?: string;
  onSave: () => void;
  onShare: () => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <SecondaryVipButton publicMode={publicMode} onClick={onSave}>
        {saved ? <Check className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
        {saved ? "Сохранено" : "Сохранить результат"}
      </SecondaryVipButton>
      <SecondaryVipButton publicMode={publicMode} onClick={onShare}>
        {shared ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
        {shared ? shareStatus || "Готово к отправке" : "Поделиться результатом"}
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

function useResultActions(featureKey: VipFeatureKey, onEvent?: VipToolBaseProps["onEvent"], onSave?: () => void, onShare?: () => void) {
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);
  const [shareStatus, setShareStatus] = useState("");

  function save(payload: ZodiacAnalyticsPayload) {
    onEvent?.("vip_tool_saved", { featureKey, ...payload });
    trackFinalMapEvent("final_map_saved", payload);
    onSave?.();
    setSaved(true);
  }

  async function share(payload: ZodiacAnalyticsPayload) {
    onEvent?.("vip_tool_shared", { featureKey, ...payload });
    trackFinalMapEvent("final_map_shared", payload);
    if (onShare) {
      const status = await onShare();
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
  return `Открыл(а) ${labels[featureKey]} в Астрологическом центре 👑\nVIP доступ сейчас бесплатный до 17.09.2026.`;
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
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null;
  return { year, month, day };
}

function addDays(value: string, offset: number) {
  const date = new Date(`${value}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

function displayDate(value: string) {
  const parsed = parseIsoDate(value);
  if (!parsed) return value;
  return `${String(parsed.day).padStart(2, "0")}.${String(parsed.month).padStart(2, "0")}.${parsed.year}`;
}

function displayMonth(value: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return value;
  return `${match[2]}.${match[1]}`;
}

function signFromBirthDate(value: string, fallbackSlug: string) {
  const parsed = parseIsoDate(value);
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
  goal?: VipGoal | string;
  tone?: VipTone | string;
  selectedPresetKey?: string;
  patternType?: string;
}): ZodiacAnalyticsPayload {
  return input;
}

function buildNatalBlocks(sign: ZodiacSign, birthDate: string, birthTime: string, birthCity: string, natalChart: NatalChart | null) {
  const hasDate = Boolean(parseIsoDate(birthDate));
  const seed = `${sign.slug}:${birthDate || "no-date"}:${birthTime || "no-time"}:${birthCity ? "city" : "no-city"}`;
  return {
    title: `${sign.emoji} ${sign.name} · личная карта`,
    summary: natalChart?.summary?.[0]?.value ?? `${sign.name} раскрывается через стихию ${sign.element}: важно соединять личный темп, чувства и практичный выбор без давления.`,
    items: [
      { title: "Сильные стороны", text: natalChart?.archetype ? `${natalChart.archetype}: это даёт умение быстро распознавать, где нужна инициатива, а где лучше удержать паузу.` : pick(["инициатор перемен: сильнее всего раскрывается, когда сам выбирает первый шаг", "тихий стратег: видит скрытый порядок и умеет собирать план без лишнего шума", "сердечный проводник: помогает людям возвращаться к теплу и простым словам", "исследователь смысла: умеет находить связь между событиями и внутренним выбором"], seed, 1) },
      { title: "Внутренний конфликт", text: pick(["хочется действовать быстрее, чем созревает ясность; помогает короткая пауза перед обещанием", "часть энергии тянет к стабильности, а часть просит обновления; не смешивайте оба решения в один день", "эмоция может звучать громче факта; сначала проверьте, что именно задело", "желание быть полезным иногда превращается в контроль; лучше предлагать, а не спасать"], seed, 2) },
      { title: "Отношения", text: natalChart?.loveStyle ?? pick(["лучше открывается через честный интерес и маленькие подтверждения внимания", "ценит тепло, но не любит эмоциональные проверки", "сближается там, где есть уважение к личному пространству"], seed, 3) },
      { title: "Решения", text: pick(["выбирайте вариант, который можно объяснить одним предложением и выполнить без драматичного рывка", "сначала фиксируйте критерий, потом сравнивайте варианты; так меньше риска пойти за чужой тревогой", "важное решение лучше делить на тестовый шаг и финальное подтверждение", "если тело устало, решение нужно отложить хотя бы до восстановления ритма"], seed, 4) },
      { title: "Рекомендации", text: natalChart?.growth ?? pick(["не торопить выводы и выбирать один ясный шаг", "мягко отделять своё желание от чужого ожидания", "держать баланс между вдохновением и режимом"], seed, 5) },
      { title: "Точность", text: hasDate ? "Дата учтена в расчёте; время и город только повышают детализацию и не сохраняются." : "Можно начать по знаку, а дату добавить позже для более точного слоя." },
    ],
  };
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
  const [calculated, setCalculated] = useState(false);
  const actions = useResultActions(featureKey, onEvent, onSave, onShare);
  const resultSign = birthDate ? signFromBirthDate(birthDate, signSlug) : signBySlug(signSlug);
  const payload = vipPayload({
    sign: resultSign.slug,
    hasBirthDate: Boolean(parseIsoDate(birthDate)),
    hasBirthTime: /^\d{2}:\d{2}$/.test(birthTime),
    hasBirthCity: Boolean(birthCity.trim()),
    inputMode: birthDate ? "birth_date" : "sign_only",
  });
  const result = buildNatalBlocks(resultSign, birthDate, birthTime, birthCity, natalChart?.sign.slug === resultSign.slug ? natalChart : null);

  return (
    <VipScreenLayout publicMode={publicMode} title="Расширенная натальная карта" onBack={onBack}>
      <VipIntro publicMode={publicMode} text="Персональная карта показывает сильные стороны, любовь, рост и мягкие риски. Данные используются только на экране расчёта." />
      <VipInputPanel publicMode={publicMode}>
        <SignSelect publicMode={publicMode} value={signSlug} onChange={setSignSlug} />
        <VipField publicMode={publicMode} label="Дата рождения">
          <input className={inputClass(publicMode)} type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} />
        </VipField>
        <VipField publicMode={publicMode} label="Время рождения">
          <input className={inputClass(publicMode)} type="time" value={birthTime} onChange={(event) => setBirthTime(event.target.value)} />
        </VipField>
        <VipField publicMode={publicMode} label="Город рождения">
          <input className={inputClass(publicMode)} value={birthCity} onChange={(event) => setBirthCity(event.target.value)} />
        </VipField>
      </VipInputPanel>
      {natalChart ? (
        <VipReuseButton publicMode={publicMode} onClick={() => {
          setSignSlug(natalChart.sign.slug);
          actions.reuse({ featureKey, sign: natalChart.sign.slug, hasBirthDate: natalChart.hasBirthDate, hasBirthTime: natalChart.hasBirthTime, hasBirthCity: natalChart.hasBirthCity, inputMode: "profile" });
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
        <VipResultPanel publicMode={publicMode} title={result.title}>
          <AstroChartVisual publicMode={publicMode} kind="natal" primarySign={resultSign} title="VIP натальная схема" />
          <InfoBlock publicMode={publicMode} title="Главный вывод" text={result.summary} />
          {result.items.map((item) => (
            <InfoBlock key={item.title} publicMode={publicMode} title={item.title} text={item.text} />
          ))}
          <VipResultActions publicMode={publicMode} saved={actions.saved} shared={actions.shared} shareStatus={actions.shareStatus} onSave={() => actions.save(payload)} onShare={() => actions.share(payload)} />
        </VipResultPanel>
      ) : null}
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
      <VipIntro publicMode={publicMode} text="Именной профиль разбирает звучание имени, стиль общения, сильные стороны и мягкие риски. Само имя не сохраняется и не отправляется в аналитику." />
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
  onBack,
  onSave,
  onShare,
  onEvent,
  defaultSign,
  defaultSecondSign,
  relationshipMode = "love",
  scoreTier,
}: VipToolBaseProps & { calendarDays: CoupleCalendarDay[]; pairReady: boolean }) {
  const featureKey: VipFeatureKey = "vipCoupleCalendar";
  const [firstSlug, setFirstSlug] = useState((defaultSign ?? signs[0]).slug);
  const [secondSlug, setSecondSlug] = useState((defaultSecondSign ?? signs[2]).slug);
  const [startDate, setStartDate] = useState("2026-06-19");
  const [calculated, setCalculated] = useState(false);
  const first = signBySlug(firstSlug);
  const second = signBySlug(secondSlug);
  const score = pairReady ? 72 : calculatePairScore(first, second, relationshipMode);
  const tier = scoreTier ?? safeScoreTier(score);
  const actions = useResultActions(featureKey, onEvent, onSave, onShare);
  const payload = vipPayload({ firstSign: first.slug, secondSign: second.slug, relationshipMode, scoreTier: tier, inputMode: "date_range" });
  const days = calendarDays.length >= 30 && pairReady ? calendarDays : Array.from({ length: 30 }, (_, index) => {
    const dateKey = addDays(startDate, index);
    const seed = `${first.slug}:${second.slug}:${relationshipMode}:${dateKey}`;
    return {
      dateKey,
      date: displayDate(dateKey),
      weekday: `день ${index + 1}`,
      status: pick(["мягкий контакт", "день разговора", "пауза и наблюдение", "совместное действие"], seed, 1),
      theme: pick(["доверие", "планы", "тепло", "границы", "поддержка"], seed, 2),
      energy: pick(["спокойная", "живая", "чувствительная", "собранная"], seed, 3),
      action: pick(["задать один вопрос", "сделать маленький жест", "договориться о быте", "оставить место для ответа"], seed, 4),
      risk: pick(["спешка", "намёки", "усталость", "соревнование"], seed, 5),
      advice: pick(["говорите прямо и мягко", "не перегружайте день ожиданиями", "выберите общий маленький шаг", "дайте эмоциям созреть"], seed, 6),
    };
  });

  return (
    <VipScreenLayout publicMode={publicMode} title="30-дневный календарь пары" onBack={onBack}>
      <VipIntro publicMode={publicMode} text="Календарь пары показывает ближайшие 30 дней: тему, энергию, действие, риск и короткий совет." />
      {!pairReady ? <PairInlineHint publicMode={publicMode} /> : null}
      <VipInputPanel publicMode={publicMode}>
        <SignSelect publicMode={publicMode} value={firstSlug} onChange={setFirstSlug} label="Первый знак" />
        <SignSelect publicMode={publicMode} value={secondSlug} onChange={setSecondSlug} label="Второй знак" />
        <VipField publicMode={publicMode} label="Старт">
          <input className={inputClass(publicMode)} type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
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
          <div className="space-y-2">
            {days.map((day, index) => (
              <div key={`${day.dateKey}-${index}`} className={publicMode ? "rounded-lg border border-white/10 bg-white/5 p-3" : "rounded-lg border border-slate-100 bg-white p-3"}>
                <div className="flex items-center justify-between gap-2">
                  <p className={publicMode ? "text-sm font-semibold text-white" : "text-sm font-semibold text-slate-950"}>День {index + 1} · {day.date}</p>
                  <span className={publicMode ? "rounded-full bg-amber-200/15 px-2 py-1 text-[11px] font-semibold text-amber-100" : "rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-800"}>{day.energy}</span>
                </div>
                <p className={publicMode ? "mt-1 text-sm text-slate-300" : "mt-1 text-sm text-slate-700"}>{day.theme}: {day.action}. Риск: {day.risk}. Совет: {day.advice}</p>
              </div>
            ))}
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
      <VipIntro publicMode={publicMode} text="Помощник собирает три готовые фразы для разговора. Текст не сохраняется в localStorage и не уходит в аналитику." />
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
  const parsedDate = parseIsoDate(birthDate);
  const lifePath = parsedDate ? reduceNumber(parsedDate.day + parsedDate.month + parsedDate.year) : numerology.lifePath;
  const nameNumber = name.trim() ? reduceNumber(Array.from(name.trim()).reduce((sum, char) => sum + char.charCodeAt(0), 0)) : numerology.nameNumber;
  const actions = useResultActions(featureKey, onEvent, onSave, onShare);
  const payload = vipPayload({ sign: sign.slug, hasBirthDate: Boolean(parsedDate), inputMode: name.trim() ? "date_and_name" : parsedDate ? "date" : "day_number", goal });

  return (
    <VipScreenLayout publicMode={publicMode} title="Расширенная нумерология" onBack={onBack}>
      <VipIntro publicMode={publicMode} text="Нумерология показывает число пути, число имени, личный месяц и практичный совет. Имя и дата остаются только на экране." />
      <VipInputPanel publicMode={publicMode}>
        <VipField publicMode={publicMode} label="Дата рождения">
          <input className={inputClass(publicMode)} type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} />
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
  const [date, setDate] = useState(dateKey);
  const [goal, setGoal] = useState<VipGoal>("clarity");
  const [calculated, setCalculated] = useState(false);
  const selectedSign = signBySlug(signSlug);
  const actions = useResultActions(featureKey, onEvent, onSave, onShare);
  const payload = vipPayload({ sign: selectedSign.slug, goal, inputMode: "date_sign" });
  const synthesis = synthesizeVipMysticDay(date || dateKey, selectedSign.slug as ZodiacSignId, angelNumber);

  return (
    <VipScreenLayout publicMode={publicMode} title="VIP мистический день" onBack={onBack}>
      <VipIntro publicMode={publicMode} text="Мистический день объединяет Таро, руну, цвет ауры, ангельское число и практичный совет." />
      <VipInputPanel publicMode={publicMode}>
        <SignSelect publicMode={publicMode} value={signSlug} onChange={setSignSlug} />
        <VipField publicMode={publicMode} label="Дата">
          <input className={inputClass(publicMode)} type="date" value={date} onChange={(event) => setDate(event.target.value)} />
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
        <VipResultPanel publicMode={publicMode} title={`${selectedSign.emoji} ${selectedSign.name} · ${displayDate(date || dateKey)}`}>
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
