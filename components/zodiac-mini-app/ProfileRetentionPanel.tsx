import type { ReactNode } from "react";
import { Bookmark, CloudOff, History, ShieldCheck, Trash2, User } from "lucide-react";
import type { ZodiacAnalyticsEventName, ZodiacAnalyticsPayload } from "@/lib/zodiac-mini-app-analytics-shared";
import { relationshipModes } from "./constants";
import { SoftLaunchFeedbackPanel } from "./SoftLaunchFeedbackPanel";
import { panelClass } from "./ui-primitives";
import type { HubTab, MoreFeatureId, RelationshipMode, ZodiacSign } from "./types";
import type { RetentionPanelFocus, ZodiacRetentionItem, ZodiacRetentionState } from "./retention";

export interface ProfileQuickTarget {
  tab: HubTab;
  feature?: MoreFeatureId | null;
}

export function ProfileRetentionPanel({
  publicMode,
  selectedSign,
  retention,
  focus,
  onQuickAction,
  onOpenFavorite,
  onClearLocalData,
  onFeedbackEvent,
  onShareFeedbackDraft,
}: {
  publicMode: boolean;
  selectedSign: ZodiacSign | null;
  retention: ZodiacRetentionState;
  focus: RetentionPanelFocus;
  onQuickAction: (target: ProfileQuickTarget, categoryId: string) => void;
  onOpenFavorite: (item: ZodiacRetentionItem) => void;
  onClearLocalData: () => void;
  onFeedbackEvent: (event: ZodiacAnalyticsEventName, payload: ZodiacAnalyticsPayload) => void;
  onShareFeedbackDraft: (draft: string, payload: ZodiacAnalyticsPayload) => Promise<string> | string;
}) {
  const signLabel = selectedSign ? `${selectedSign.emoji} ${selectedSign.name}` : retention.lastSign ? retention.lastSign : "знак ещё не выбран";
  const lastSectionLabel = retention.lastSection?.label ?? "откройте любой раздел";
  const compatibilityModeLabel = retention.lastCompatibilityMode ? relationshipModeLabel(retention.lastCompatibilityMode) : "режим ещё не выбран";

  return (
    <section className={panelClass(publicMode)}>
      <div className="flex items-start gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-amber-200/25 bg-amber-200/10 text-amber-100">
          <User className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-amber-100">Локальный профиль</p>
          <h2 className="mt-1 text-xl font-semibold leading-tight text-white">👤 Мой профиль</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">История, избранное и быстрые переходы хранятся только на этом устройстве.</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 min-[390px]:grid-cols-3">
        <ProfileStat publicMode={publicMode} label="Знак" value={signLabel} />
        <ProfileStat publicMode={publicMode} label="Последний раздел" value={lastSectionLabel} />
        <ProfileStat publicMode={publicMode} label="Совместимость" value={compatibilityModeLabel} />
      </div>

      <div className="mt-3 rounded-lg border border-sky-200/20 bg-sky-200/10 p-3">
        <div className="flex items-start gap-3">
          <CloudOff className="mt-0.5 h-5 w-5 shrink-0 text-sky-100" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-sky-50">
              Синхронизация выключена
              <span className="sr-only">Синхронизация между устройствами: выключена</span>
            </p>
            <p className="mt-1 text-xs leading-4 text-sky-50/85">Данные остаются на устройстве.</p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold text-white">Быстрые действия</p>
        <div className="aphrodite-pkg-267-two-after-430 mt-3 grid gap-2">
          {quickActions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => onQuickAction(action.target, action.id)}
              className="min-h-[76px] rounded-lg border border-white/12 bg-white/8 p-3 text-left transition hover:border-fuchsia-200/35 hover:bg-white/12 focus:outline-none focus:ring-2 focus:ring-amber-200/50"
            >
              <span className="text-lg">{action.icon}</span>
              <span className="mt-1 block text-sm font-semibold leading-5 text-white">{action.title}</span>
              <span className="mt-1 block text-xs leading-4 text-slate-300">{action.text}</span>
            </button>
          ))}
        </div>
      </div>

      <ProfileList
        publicMode={publicMode}
        title="Избранное"
        icon={<Bookmark className="h-4 w-4" />}
        active={focus === "favorites"}
        items={retention.favorites}
        emptyText="Здесь появятся сохранённые расчёты и быстрые переходы"
        onOpen={onOpenFavorite}
      />

      <ProfileList
        publicMode={publicMode}
        title="История"
        icon={<History className="h-4 w-4" />}
        active={focus === "history"}
        items={retention.history}
        emptyText="Здесь появятся последние расчёты и открытые разделы"
        onOpen={onOpenFavorite}
      />

      <SoftLaunchFeedbackPanel publicMode={publicMode} onEvent={onFeedbackEvent} onShareDraft={onShareFeedbackDraft} />

      <div className="mt-3 rounded-lg border border-emerald-200/20 bg-emerald-200/10 p-3">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-100" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-emerald-50">Локальные данные</p>
            <p className="mt-1 text-xs leading-4 text-emerald-50/85">Данные остаются на устройстве.</p>
            <button type="button" onClick={onClearLocalData} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-rose-200/25 bg-rose-200/10 px-3 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-200/15">
              <Trash2 className="h-4 w-4" />
              Очистить данные
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProfileStat({ publicMode, label, value }: { publicMode: boolean; label: string; value: string }) {
  return (
    <div className={publicMode ? "rounded-lg border border-white/12 bg-white/8 p-3" : "rounded-lg border border-white/12 bg-white/8 p-3"}>
      <p className="text-xs font-semibold text-amber-100">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold leading-5 text-white">{value}</p>
    </div>
  );
}

function ProfileList({
  publicMode,
  title,
  icon,
  active,
  items,
  emptyText,
  onOpen,
}: {
  publicMode: boolean;
  title: string;
  icon: ReactNode;
  active: boolean;
  items: ZodiacRetentionItem[];
  emptyText: string;
  onOpen: (item: ZodiacRetentionItem) => void;
}) {
  return (
    <div className={active ? "mt-4 rounded-lg border border-amber-200/35 bg-amber-200/10 p-4" : "mt-4 rounded-lg border border-white/12 bg-white/8 p-4"}>
      <div className="flex items-center gap-2">
        <span className="text-amber-100">{icon}</span>
        <h3 className="text-base font-semibold text-white">{title}</h3>
      </div>
      {items.length ? (
        <div className="mt-3 space-y-2">
          {items.map((item) => (
            <div key={item.id} className={publicMode ? "rounded-lg border border-white/10 bg-black/18 p-3" : "rounded-lg border border-white/10 bg-white/8 p-3"}>
              <p className="text-sm font-semibold leading-5 text-white">{item.label}</p>
              {item.detail ? <p className="mt-1 text-xs leading-4 text-slate-300">{item.detail}</p> : null}
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{formatStoredAt(item.createdAt)}</span>
                <button type="button" onClick={() => onOpen(item)} className="rounded-md border border-fuchsia-200/25 bg-fuchsia-200/10 px-3 py-1.5 text-xs font-semibold text-fuchsia-50">
                  Открыть
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 rounded-lg border border-white/10 bg-black/15 p-3 text-sm leading-5 text-slate-300">{emptyText}</p>
      )}
    </div>
  );
}

const quickActions: Array<{ id: string; title: string; text: string; icon: string; target: ProfileQuickTarget }> = [
  { id: "profile_horoscopes", title: "Прогноз", text: "сегодня и неделя", icon: "✨", target: { tab: "forecasts", feature: "todayForecast" } },
  { id: "profile_compatibility", title: "Совместимость", text: "любовь и диалог", icon: "💞", target: { tab: "love", feature: "compatibilityTool" } },
  { id: "profile_birth_matrix", title: "Матрица судьбы", text: "расчёт по дате", icon: "🧿", target: { tab: "mystic", feature: "birthMatrix" } },
  { id: "profile_angel_numbers", title: "Ангельские числа", text: "11:11 и знаки", icon: "👼", target: { tab: "forecasts", feature: "angelNumbers" } },
  { id: "profile_vip", title: "VIP", text: "доступ бесплатно", icon: "👑", target: { tab: "vip", feature: "vip" } },
];

function relationshipModeLabel(mode: RelationshipMode) {
  return relationshipModes.find((item) => item.id === mode)?.label ?? mode;
}

function formatStoredAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "локально";
  return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
}
