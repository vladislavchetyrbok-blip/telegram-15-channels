import type { ReactNode } from "react";
import { ArrowRight, Bookmark, Crown, Gift, Hash, HeartHandshake, History, Lock, Moon, Sparkles, Star, User } from "lucide-react";
import { relationshipModes } from "./constants";
import { panelClass } from "./ui-primitives";
import type { HubTab, MoreFeatureId, RelationshipMode, ZodiacSign } from "./types";

export type HomeBottomItem = "home" | "saved" | "history" | "profile";

export interface MainMenuCategoryTarget {
  tab: HubTab;
  feature?: MoreFeatureId | null;
}

interface MainMenuCategory {
  id: string;
  title: string;
  text: string;
  icon: ReactNode;
  target: MainMenuCategoryTarget;
  tone: "violet" | "rose" | "cyan" | "amber" | "emerald" | "slate";
  locked?: boolean;
}

const categoryIconClass: Record<MainMenuCategory["tone"], string> = {
  violet: "border-fuchsia-200/25 bg-fuchsia-200/12 text-fuchsia-100",
  rose: "border-rose-200/25 bg-rose-200/12 text-rose-100",
  cyan: "border-cyan-200/25 bg-cyan-200/12 text-cyan-100",
  amber: "border-amber-200/30 bg-amber-200/12 text-amber-100",
  emerald: "border-emerald-200/25 bg-emerald-200/12 text-emerald-100",
  slate: "border-white/15 bg-white/8 text-slate-100",
};

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
  const categories: MainMenuCategory[] = [
    {
      id: "horoscopes",
      title: "✨ Гороскопы",
      text: "Ежедневные, недельные и месячные прогнозы",
      icon: <Sparkles className="h-5 w-5" />,
      target: { tab: "forecasts", feature: "todayForecast" },
      tone: "violet",
    },
    {
      id: "compatibility",
      title: "💞 Совместимость",
      text: "Любовь, дружба, работа, семья",
      icon: <HeartHandshake className="h-5 w-5" />,
      target: { tab: "love", feature: "compatibilityTool" },
      tone: "rose",
    },
    {
      id: "mystic",
      title: "🔮 Мистика",
      text: "Таро, руны, ритуалы, знаки дня",
      icon: <Moon className="h-5 w-5" />,
      target: { tab: "mystic", feature: "dailyCard" },
      tone: "cyan",
    },
    {
      id: "birth_matrix",
      title: "🧿 Матрица судьбы",
      text: "Расчёт и расшифровка по дате рождения",
      icon: <Star className="h-5 w-5" />,
      target: { tab: "mystic", feature: "birthMatrix" },
      tone: "amber",
    },
    {
      id: "numerology",
      title: "🔢 Нумерология",
      text: "Числа судьбы, души и личности",
      icon: <Hash className="h-5 w-5" />,
      target: { tab: "profile", feature: "numerology" },
      tone: "emerald",
    },
    {
      id: "vip",
      title: "👑 VIP раздел",
      text: `11 премиум-функций бесплатно до ${vipUntilLabel}`,
      icon: <Crown className="h-5 w-5" />,
      target: { tab: "vip", feature: "vip" },
      tone: "amber",
    },
    {
      id: "giveaways",
      title: "🎁 Розыгрыши",
      text: "Скоро, locked preview",
      icon: <Gift className="h-5 w-5" />,
      target: { tab: "vip", feature: "giveaways" },
      tone: "slate",
      locked: true,
    },
    {
      id: "profile",
      title: "👤 Мой профиль",
      text: "Данные не сохраняются, настройки пока preview",
      icon: <User className="h-5 w-5" />,
      target: { tab: "profile", feature: "natalChart" },
      tone: "slate",
    },
  ];

  return (
    <section className={panelClass(publicMode)}>
      <div className="relative overflow-hidden rounded-lg border border-fuchsia-200/15 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.16),transparent_13rem),radial-gradient(circle_at_bottom_right,rgba(34,211,238,0.14),transparent_14rem),rgba(255,255,255,0.06)] p-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className="inline-flex items-center gap-2 rounded-full border border-amber-200/25 bg-amber-200/10 px-3 py-1 text-xs font-semibold text-amber-100">
            <Sparkles className="h-3.5 w-3.5" />
            VIP доступ бесплатно до {vipUntilLabel}
          </p>
          {selectedSign ? (
            <p className="inline-flex items-center rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs font-semibold text-slate-100">
              {selectedSign.emoji} {selectedSign.name}
            </p>
          ) : null}
        </div>
        <h2 className="mt-4 text-2xl font-semibold leading-tight text-white">Астрологический центр ✨</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">Гороскопы, совместимость, мистика и личные расчёты в одном месте</p>
        <p className="mt-3 text-base font-semibold leading-6 text-amber-50">Выберите, что хотите узнать сегодня</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onOpenCategory(category.target, category.id)}
            className="min-h-[138px] rounded-lg border border-white/12 bg-white/8 p-3 text-left shadow-[0_16px_50px_rgba(8,13,30,0.24)] transition hover:border-fuchsia-200/40 hover:bg-white/12 focus:outline-none focus:ring-2 focus:ring-amber-200/50"
          >
            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border ${categoryIconClass[category.tone]}`}>{category.icon}</span>
            <span className="mt-3 block break-words text-sm font-semibold leading-5 text-white">{category.title}</span>
            <span className="mt-1 block break-words text-xs leading-4 text-slate-300">{category.text}</span>
            {category.locked ? (
              <span className="mt-3 inline-flex items-center gap-1 rounded-md border border-white/12 bg-black/20 px-2 py-1 text-[11px] font-semibold text-slate-300">
                <Lock className="h-3 w-3 text-amber-100" />
                locked
              </span>
            ) : null}
          </button>
        ))}
      </div>
    </section>
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
      <div className="mt-4 grid grid-cols-2 gap-2">
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
      <p className="text-xs font-semibold text-amber-100">Preview</p>
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
  onSaved,
  onHistory,
  onProfile,
}: {
  activeItem: HomeBottomItem;
  onHome: () => void;
  onSaved: () => void;
  onHistory: () => void;
  onProfile: () => void;
}) {
  const items: Array<{ id: HomeBottomItem; label: string; icon: ReactNode; action: () => void }> = [
    { id: "home", label: "Главная", icon: <Sparkles className="h-4 w-4" />, action: onHome },
    { id: "saved", label: "Сохранённое", icon: <Bookmark className="h-4 w-4" />, action: onSaved },
    { id: "history", label: "История", icon: <History className="h-4 w-4" />, action: onHistory },
    { id: "profile", label: "Профиль", icon: <User className="h-4 w-4" />, action: onProfile },
  ];

  return (
    <nav className="sticky bottom-[calc(0.75rem+var(--zma-safe-area-bottom,0px))] z-20 mt-auto grid grid-cols-4 gap-2 rounded-lg border border-white/12 bg-[#0c0b18]/90 p-2 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur">
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
            <span className="block max-w-full break-words text-center">{item.label}</span>
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
