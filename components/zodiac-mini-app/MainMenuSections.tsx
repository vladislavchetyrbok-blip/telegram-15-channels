import type { ReactNode } from "react";
import { ArrowRight, CalendarDays, Crown, HeartHandshake, Sparkles, User } from "lucide-react";
import { AphroditeAstrologyCenterHome } from "./AphroditeHomeScreen";
import { relationshipModes } from "./constants";
import { panelClass } from "./ui-primitives";
import type { HubTab, MoreFeatureId, RelationshipMode, ZodiacSign } from "./types";

export type HomeBottomItem = "home" | "forecasts" | "love" | "vip" | "profile";

export interface MainMenuCategoryTarget {
  tab: HubTab;
  feature?: MoreFeatureId | null;
}

export function AstrologyCenterHome({
  publicMode,
  selectedSign,
  vipUntilLabel,
  onOpenCategory,
}: {
  publicMode: boolean;
  selectedSign: ZodiacSign | null;
  vipUntilLabel: string;
  onOpenCategory: (target: MainMenuCategoryTarget, categoryId: string) => void;
}) {
  return (
    <AphroditeAstrologyCenterHome
      publicMode={publicMode}
      selectedSign={selectedSign}
      vipUntilLabel={vipUntilLabel}
      onOpenCategory={onOpenCategory}
    />
  );
}

export function CategorySignGate({
  publicMode,
  title,
  subtitle,
  featureLabels,
  children,
}: {
  publicMode: boolean;
  title: string;
  subtitle: string;
  featureLabels: string[];
  children: ReactNode;
}) {
  return (
    <section className={panelClass(publicMode)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-amber-100">Раздел</p>
          <h2 className="mt-1 break-words text-xl font-semibold leading-tight text-white">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">{subtitle}</p>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-fuchsia-200/20 bg-fuchsia-200/10 text-fuchsia-100">
          <ArrowRight className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-4 grid gap-2">
        {featureLabels.map((label) => (
          <div key={label} className="rounded-lg border border-white/10 bg-white/7 px-3 py-2 text-sm font-semibold text-slate-100">
            {label}
          </div>
        ))}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function CompatibilityCategoryChooser({
  publicMode,
  selectedMode,
  onSelectMode,
  children,
}: {
  publicMode: boolean;
  selectedMode: RelationshipMode | null;
  onSelectMode: (mode: RelationshipMode) => void;
  children: ReactNode;
}) {
  return (
    <section className={panelClass(publicMode)}>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-amber-100">Раздел</p>
        <h2 className="mt-1 text-xl font-semibold leading-tight text-white">💞 Совместимость</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">Выберите тип связи, а затем укажите знаки или данные для расчёта.</p>
      </div>
      <div className="aphrodite-pkg-267-two-after-430 mt-4 grid gap-2">
        {relationshipModes.map((item) => {
          const active = selectedMode === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectMode(item.id)}
              className={
                active
                  ? "min-h-[82px] rounded-lg border border-amber-200/55 bg-amber-200/15 p-3 text-left text-amber-50"
                  : "min-h-[82px] rounded-lg border border-white/12 bg-white/8 p-3 text-left text-slate-100 transition hover:border-fuchsia-200/35 hover:bg-white/12"
              }
            >
              <span className="block text-sm font-semibold leading-5">{compatibilityModeTitle(item.id)}</span>
              <span className="mt-1 block text-xs leading-4 text-slate-300">{item.label}</span>
            </button>
          );
        })}
      </div>
      {selectedMode ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}

export function ReadinessPanel({ publicMode, title, text, items }: { publicMode: boolean; title: string; text: string; items: string[] }) {
  return (
    <section className={panelClass(publicMode)}>
      <p className="text-xs font-semibold text-amber-100">Превью</p>
      <h2 className="mt-1 text-xl font-semibold text-white">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-300">{text}</p>
      <ul className="mt-4 space-y-2 text-sm leading-5 text-slate-300">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-200" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function MiniAppBottomNavigation({
  activeItem,
  onHome,
  onForecasts,
  onLove,
  onVip,
  onProfile,
}: {
  activeItem: HomeBottomItem;
  onHome: () => void;
  onForecasts: () => void;
  onLove: () => void;
  onVip: () => void;
  onProfile: () => void;
}) {
  const items: Array<{ id: HomeBottomItem; label: string; icon: ReactNode; action: () => void }> = [
    { id: "home", label: "Главная", icon: <Sparkles className="h-4 w-4" />, action: onHome },
    { id: "forecasts", label: "Прогноз", icon: <CalendarDays className="h-4 w-4" />, action: onForecasts },
    { id: "love", label: "Совмест.", icon: <HeartHandshake className="h-4 w-4" />, action: onLove },
    { id: "vip", label: "VIP", icon: <Crown className="h-4 w-4" />, action: onVip },
    { id: "profile", label: "Профиль", icon: <User className="h-4 w-4" />, action: onProfile },
  ];

  return (
    <nav className="aphrodite-pkg-267-bottom-nav-fix sticky bottom-[calc(0.75rem+var(--zma-safe-area-bottom,0px))] z-20 mt-auto grid grid-cols-5 gap-1 rounded-lg border border-white/12 bg-[#0c0b18]/90 p-2 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur" data-aphrodite-critical-mobile-webview-bottom-nav="package-267">
      {items.map((item) => {
        const active = activeItem === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={item.action}
            className={
              active
                ? "flex min-h-[54px] min-w-0 flex-col items-center justify-center gap-1 rounded-lg border border-amber-200/45 bg-amber-200/14 px-1 text-[11px] font-semibold leading-tight text-amber-50"
                : "flex min-h-[54px] min-w-0 flex-col items-center justify-center gap-1 rounded-lg border border-white/8 bg-white/6 px-1 text-[11px] font-semibold leading-tight text-slate-300 transition hover:border-fuchsia-200/35 hover:bg-white/10"
            }
            aria-current={active ? "page" : undefined}
          >
            {item.icon}
            <span className="aphrodite-pkg-267-text-fix block max-w-full break-words text-center">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function compatibilityModeTitle(mode: RelationshipMode) {
  const titles: Record<RelationshipMode, string> = {
    love: "Любовная совместимость",
    friendship: "Дружеская совместимость",
    work: "Деловая совместимость",
    family: "Семейная совместимость",
    passion: "Страсть",
    reconciliation: "Примирение",
  };
  return titles[mode];
}
