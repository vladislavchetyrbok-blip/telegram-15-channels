import type { ReactNode } from "react";
import { Lock } from "lucide-react";

export function EmptyFeatureCard({ publicMode, title, text }: { publicMode: boolean; title: string; text: string }) {
  return (
    <FeatureCard publicMode={publicMode} title={title} subtitle={text}>
      <p className={publicMode ? "text-sm leading-5 text-slate-400" : "text-sm leading-5 text-slate-500"}>Данные остаются только на экране и не сохраняются.</p>
    </FeatureCard>
  );
}

export function FeatureCard({ publicMode, title, subtitle, children }: { publicMode: boolean; title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className={publicMode ? "min-w-0 max-w-full overflow-hidden rounded-lg border border-white/12 bg-[radial-gradient(circle_at_16%_0%,rgba(244,114,182,0.12),transparent_30%),radial-gradient(circle_at_92%_10%,rgba(246,213,138,0.09),transparent_26%),linear-gradient(155deg,rgba(10,12,30,0.9),rgba(20,16,44,0.92)_48%,rgba(33,18,52,0.88))] p-3 text-slate-100 shadow-[0_16px_52px_rgba(4,6,18,0.32)] min-[390px]:p-4" : "min-w-0 max-w-full overflow-hidden rounded-lg border border-slate-200 bg-white p-3 text-slate-700 shadow-sm min-[390px]:p-4"}>
      <p className={publicMode ? "aphrodite-wrap-anywhere text-base font-semibold leading-6 text-white" : "aphrodite-wrap-anywhere text-base font-semibold leading-6 text-slate-950"}>{title}</p>
      <p className={publicMode ? "aphrodite-wrap-anywhere mt-1 text-sm leading-5 text-slate-300" : "aphrodite-wrap-anywhere mt-1 text-sm leading-5 text-slate-600"}>{subtitle}</p>
      <div className="mt-4 min-w-0">{children}</div>
    </div>
  );
}

export function VipStatusPill({ publicMode, label, value }: { publicMode: boolean; label: string; value: string }) {
  return (
    <div className={publicMode ? "rounded-lg border border-white/12 bg-white/8 p-3" : "rounded-lg border border-amber-100 bg-white p-3"}>
      <p className={publicMode ? "aphrodite-wrap-anywhere text-xs font-semibold text-amber-100" : "aphrodite-wrap-anywhere text-xs font-semibold text-amber-800"}>{label}</p>
      <p className={publicMode ? "aphrodite-wrap-anywhere mt-1 text-sm font-semibold text-white" : "aphrodite-wrap-anywhere mt-1 text-sm font-semibold text-slate-950"}>{value}</p>
    </div>
  );
}

export function VipPreviewPanel({ publicMode, title, text }: { publicMode: boolean; title: string; text: string }) {
  return (
    <div className={publicMode ? "rounded-lg border border-white/12 bg-white/8 p-3" : "rounded-lg border border-amber-100 bg-white p-3"}>
      <p className={publicMode ? "aphrodite-wrap-anywhere text-sm font-semibold text-amber-100" : "aphrodite-wrap-anywhere text-sm font-semibold text-amber-800"}>{title}</p>
      <p className={publicMode ? "aphrodite-wrap-anywhere mt-2 line-clamp-3 text-sm leading-5 text-slate-300" : "aphrodite-wrap-anywhere mt-2 line-clamp-3 text-sm leading-5 text-slate-600"}>{text}</p>
    </div>
  );
}

export function SectionHeader({ publicMode, icon, title, subtitle }: { publicMode: boolean; icon: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className={publicMode ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-fuchsia-200/20 bg-fuchsia-200/10 text-fuchsia-100" : "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-fuchsia-100 bg-fuchsia-50 text-fuchsia-700"}>
        {icon}
      </span>
      <div className="min-w-0">
        <p className={eyebrowClass(publicMode)}>Гороскоп</p>
        <h2 className={sectionTitleClass(publicMode)}>{title}</h2>
        <p className={publicMode ? "aphrodite-wrap-anywhere mt-1 text-sm text-slate-300" : "aphrodite-wrap-anywhere mt-1 text-sm text-slate-600"}>{subtitle}</p>
      </div>
    </div>
  );
}

export function InfoRow({ publicMode, label, text }: { publicMode: boolean; label: string; text: string }) {
  return (
    <div className={publicMode ? "rounded-lg border border-white/12 bg-white/8 p-3" : "rounded-lg border border-slate-200 bg-slate-50 p-3"}>
      <p className={publicMode ? "text-sm font-semibold text-amber-100" : "text-sm font-semibold text-amber-800"}>{label}</p>
      <p className={publicMode ? "aphrodite-wrap-anywhere mt-2 text-sm leading-5 text-slate-300" : "aphrodite-wrap-anywhere mt-2 text-sm leading-5 text-slate-700"}>{text}</p>
    </div>
  );
}

export function LockedPreviewCard({
  publicMode,
  icon,
  title,
  text,
  items,
  onPreviewClick,
}: {
  publicMode: boolean;
  icon: ReactNode;
  title: string;
  text: string;
  items: string[];
  onPreviewClick?: () => void;
}) {
  return (
    <div className={publicMode ? "rounded-lg border border-amber-200/24 bg-[radial-gradient(circle_at_14%_0%,rgba(246,213,138,0.16),transparent_28%),linear-gradient(155deg,rgba(24,16,34,0.9),rgba(14,16,38,0.92))] p-4 shadow-[0_18px_58px_rgba(4,6,18,0.34)]" : "rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm"}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={publicMode ? "aphrodite-wrap-anywhere text-lg font-semibold text-white" : "aphrodite-wrap-anywhere text-lg font-semibold text-slate-900"}>{title}</p>
          <p className={publicMode ? "aphrodite-wrap-anywhere mt-2 text-sm leading-6 text-slate-300" : "aphrodite-wrap-anywhere mt-2 text-sm leading-6 text-slate-700"}>{text}</p>
        </div>
        <span className={publicMode ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-200/30 bg-amber-200/10 text-amber-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]" : "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-300 bg-amber-100 text-amber-800"}>
          {icon}
        </span>
      </div>
      <div className={publicMode ? "mt-4 flex items-center gap-2 rounded-lg border border-white/12 bg-black/18 px-3 py-2 text-xs font-semibold text-slate-300" : "mt-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600"}>
        <Lock className={publicMode ? "h-4 w-4 text-amber-100" : "h-4 w-4 text-amber-600"} />
        только превью
      </div>
      {onPreviewClick ? (
        <button type="button" onClick={onPreviewClick} className={publicMode ? "aphrodite-touch-target mt-3 inline-flex w-full items-center justify-center rounded-lg border border-amber-200/30 bg-amber-200/12 px-3 py-2 text-sm font-semibold text-amber-50 transition hover:bg-amber-200/18 focus:outline-none focus:ring-2 focus:ring-amber-100/50" : "aphrodite-touch-target mt-3 inline-flex w-full items-center justify-center rounded-lg border border-amber-300 bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-900 transition hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-300"}>
          Открыть превью
        </button>
      ) : null}
      <ul className={publicMode ? "mt-4 space-y-2 text-sm leading-5 text-slate-300" : "mt-4 space-y-2 text-sm leading-5 text-slate-700"}>
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className={publicMode ? "mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-200" : "mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400"} />
            <span className="aphrodite-wrap-anywhere">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function panelClass(publicMode: boolean) {
  return publicMode
    ? "min-w-0 max-w-full overflow-hidden rounded-lg border border-white/12 bg-[radial-gradient(circle_at_14%_0%,rgba(244,114,182,0.12),transparent_30%),radial-gradient(circle_at_86%_8%,rgba(246,213,138,0.09),transparent_25%),linear-gradient(160deg,rgba(7,9,23,0.92),rgba(15,16,38,0.94)_48%,rgba(26,17,45,0.92))] p-3 shadow-[0_20px_70px_rgba(4,6,18,0.44)] backdrop-blur transition-all duration-300 min-[390px]:p-4"
    : "min-w-0 max-w-full overflow-hidden rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all duration-300 min-[390px]:p-4";
}

export function eyebrowClass(publicMode: boolean) {
  return publicMode ? "text-xs font-semibold text-amber-100" : "text-xs font-semibold text-amber-800";
}

export function sectionTitleClass(publicMode: boolean) {
  return publicMode
    ? "mt-1 break-words text-xl font-semibold leading-tight text-white [overflow-wrap:anywhere]"
    : "mt-1 break-words text-xl font-semibold leading-tight text-slate-950 [overflow-wrap:anywhere]";
}
