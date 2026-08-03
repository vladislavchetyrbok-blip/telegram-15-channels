import { CalendarDays, Crown, HeartHandshake, Sparkles, Star } from "lucide-react";
import { signs } from "./constants";
import { menuHubTabs } from "./feature-tabs";
import { SectionHeader, eyebrowClass, panelClass, sectionTitleClass } from "./ui-primitives";
import type { HubTab, ZodiacSign } from "./types";

export function SignSelection({ publicMode, hintSign, onSelect }: { publicMode: boolean; hintSign: ZodiacSign | null; onSelect: (slug: string) => void }) {
  return (
    <section className={panelClass(publicMode)}>
      <div className="min-w-0">
        <p className={eyebrowClass(publicMode)}>Выбор знака</p>
        <h2 className={sectionTitleClass(publicMode)}>Выберите знак</h2>
        <p className="mt-2 text-sm leading-5 text-slate-300">
          Выберите знак — откроем прогноз и совместимость.
        </p>
      </div>

      {hintSign ? (
        <div className="mt-4 rounded-lg border border-amber-200/25 bg-amber-200/10 p-3 text-sm text-amber-50">
          <p>Вы пришли из канала {hintSign.name}</p>
          <button type="button" onClick={() => onSelect(hintSign.slug)} className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-amber-100/40 bg-amber-200/15 px-3 text-sm font-semibold text-amber-50 transition hover:bg-amber-200/20">
            Выбрать {hintSign.name}
          </button>
        </div>
      ) : null}

      <div className="aphrodite-pkg-267-three-after-430 mt-4 grid grid-cols-2 gap-2 min-[430px]:grid-cols-3">
        {signs.map((sign) => (
          <button
            key={sign.slug}
            type="button"
            onClick={() => onSelect(sign.slug)}
            className="flex min-h-[58px] items-center gap-2 rounded-lg border border-white/12 bg-white/8 px-2.5 py-2 text-left shadow-[0_10px_30px_rgba(8,13,30,0.16)] transition hover:border-fuchsia-200/45 hover:bg-white/12"
          >
            <span className="shrink-0 text-lg leading-none text-amber-100">{sign.emoji}</span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold leading-5 text-white">{sign.name}</span>
              <span className="block truncate text-[11px] leading-4 text-slate-300">{sign.range}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function HeaderStatusStrip({ publicMode, sign, dateLabel, vipUntilLabel }: { publicMode: boolean; sign: ZodiacSign; dateLabel: string; vipUntilLabel: string }) {
  const items = [
    `${sign.emoji} ${sign.name}`,
    dateLabel ? `Сегодня: ${dateLabel} · Europe/Kyiv` : "Дата обновляется",
    "VIP превью · без оплаты",
    "профиль хранится на устройстве",
  ];

  return (
    <div className={publicMode ? "grid gap-2 rounded-lg border border-white/12 bg-white/8 p-3 text-xs font-semibold text-slate-100" : "aphrodite-pkg-267-two-after-430 grid gap-2 rounded-lg border border-white/12 bg-white/8 p-3 text-xs font-semibold text-slate-100"}>
      {items.map((item) => (
        <span key={item} className="min-w-0 rounded-md border border-white/10 bg-black/15 px-3 py-2 [overflow-wrap:anywhere]">
          {item}
        </span>
      ))}
    </div>
  );
}

export function HomeQuickSection({
  publicMode,
  onOpenLove,
  onOpenProfile,
  onOpenForecasts,
  onOpenMystic,
  onOpenVip,
}: {
  publicMode: boolean;
  onOpenLove: () => void;
  onOpenProfile: () => void;
  onOpenForecasts: () => void;
  onOpenMystic: () => void;
  onOpenVip: () => void;
}) {
  const cards = [
    { title: "Сегодня", text: "короткий прогноз дня", action: onOpenForecasts, icon: <Sparkles className="h-4 w-4" /> },
    { title: "Совместимость", text: "расчёт пары", action: onOpenLove, icon: <HeartHandshake className="h-4 w-4" /> },
    { title: "Ангельские числа", text: "10:10, 12:12, 02:22", action: onOpenForecasts, icon: <Star className="h-4 w-4" /> },
    { title: "Натальная карта", text: "профиль рождения", action: onOpenProfile, icon: <CalendarDays className="h-4 w-4" /> },
    { title: "VIP превью", text: "без оплаты", action: onOpenVip, icon: <Crown className="h-4 w-4" /> },
    { title: "Ментальная карта", text: "карта отношений", action: onOpenLove, icon: <Sparkles className="h-4 w-4" /> },
  ];

  return (
    <section className={panelClass(publicMode)}>
      <SectionHeader publicMode={publicMode} icon={<Sparkles className="h-5 w-5" />} title="Главная" subtitle="быстрый вход в основные разделы" />
      <div className="aphrodite-pkg-267-two-after-430 mt-4 grid gap-2">
        {cards.map((card) => (
          <button
            key={card.title}
            type="button"
            onClick={card.action}
            className={publicMode ? "flex min-h-[58px] items-center gap-2.5 rounded-lg border border-white/12 bg-white/8 p-2.5 text-left transition hover:border-fuchsia-200/35 hover:bg-white/12" : "flex min-h-[58px] items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-2.5 text-left transition hover:border-violet-200 hover:bg-violet-50/50"}
          >
            <span className={publicMode ? "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-amber-200/25 bg-amber-200/10 text-amber-100" : "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-violet-100 bg-violet-50 text-violet-700"}>
              {card.icon}
            </span>
            <span className="min-w-0">
              <span className={publicMode ? "block truncate text-sm font-semibold leading-5 text-white" : "block truncate text-sm font-semibold leading-5 text-slate-950"}>{card.title}</span>
              <span className={publicMode ? "block truncate text-xs leading-4 text-slate-400" : "block truncate text-xs leading-4 text-slate-500"}>{card.text}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

export function HubNavigation({ publicMode, activeTab, onChange }: { publicMode: boolean; activeTab: HubTab; onChange: (tab: HubTab) => void }) {
  return (
    <nav className={publicMode ? "grid grid-cols-5 gap-2" : "grid grid-cols-5 gap-2"}>
      {menuHubTabs.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={
              active
                ? "flex min-h-[58px] min-w-0 flex-col items-center justify-center gap-1 rounded-lg border border-amber-200/55 bg-amber-200/15 px-1 text-center text-[11px] font-semibold leading-tight text-amber-50 shadow-sm"
                : "flex min-h-[58px] min-w-0 flex-col items-center justify-center gap-1 rounded-lg border border-white/10 bg-white/7 px-1 text-center text-[11px] font-semibold leading-tight text-slate-300 transition hover:border-fuchsia-200/35 hover:bg-white/10"
            }
            aria-label={tab.label}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="block max-w-full break-words">{tab.shortLabel}</span>
          </button>
        );
      })}
    </nav>
  );
}
