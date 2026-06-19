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
    <div className={publicMode ? "rounded-lg border border-white/12 bg-white/8 p-4 text-slate-100" : "rounded-lg border border-slate-200 bg-white p-4 text-slate-700"}>
      <p className={publicMode ? "text-base font-semibold text-white" : "text-base font-semibold text-slate-950"}>{title}</p>
      <p className={publicMode ? "mt-1 text-sm leading-5 text-slate-300" : "mt-1 text-sm leading-5 text-slate-600"}>{subtitle}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export function VipStatusPill({ publicMode, label, value }: { publicMode: boolean; label: string; value: string }) {
  return (
    <div className={publicMode ? "rounded-lg border border-white/12 bg-white/8 p-3" : "rounded-lg border border-amber-100 bg-white p-3"}>
      <p className={publicMode ? "text-xs font-semibold text-amber-100" : "text-xs font-semibold text-amber-800"}>{label}</p>
      <p className={publicMode ? "mt-1 text-sm font-semibold text-white" : "mt-1 text-sm font-semibold text-slate-950"}>{value}</p>
    </div>
  );
}

export function VipPreviewPanel({ publicMode, title, text }: { publicMode: boolean; title: string; text: string }) {
  return (
    <div className={publicMode ? "rounded-lg border border-white/12 bg-white/8 p-3" : "rounded-lg border border-amber-100 bg-white p-3"}>
      <p className={publicMode ? "text-sm font-semibold text-amber-100" : "text-sm font-semibold text-amber-800"}>{title}</p>
      <p className={publicMode ? "mt-2 text-sm leading-5 text-slate-300" : "mt-2 text-sm leading-5 text-slate-600"}>{text}</p>
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
        <p className={publicMode ? "mt-1 text-sm text-slate-300" : "mt-1 text-sm text-slate-600"}>{subtitle}</p>
      </div>
    </div>
  );
}

export function InfoRow({ publicMode, label, text }: { publicMode: boolean; label: string; text: string }) {
  return (
    <div className={publicMode ? "rounded-lg border border-white/12 bg-white/8 p-3" : "rounded-lg border border-slate-200 bg-slate-50 p-3"}>
      <p className={publicMode ? "text-sm font-semibold text-amber-100" : "text-sm font-semibold text-amber-800"}>{label}</p>
      <p className={publicMode ? "mt-2 text-sm leading-5 text-slate-300" : "mt-2 text-sm leading-5 text-slate-700"}>{text}</p>
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
    <div className={publicMode ? "rounded-lg border border-amber-200/20 bg-amber-200/10 p-4" : "rounded-lg border border-amber-200 bg-amber-50 p-4"}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={publicMode ? "text-lg font-semibold text-white" : "text-lg font-semibold text-slate-900"}>{title}</p>
          <p className={publicMode ? "mt-2 text-sm leading-6 text-slate-300" : "mt-2 text-sm leading-6 text-slate-700"}>{text}</p>
        </div>
        <span className={publicMode ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-200/25 bg-black/20 text-amber-100" : "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-300 bg-amber-100 text-amber-800"}>
          {icon}
        </span>
      </div>
      <div className={publicMode ? "mt-4 flex items-center gap-2 rounded-lg border border-white/12 bg-white/7 px-3 py-2 text-xs font-semibold text-slate-300" : "mt-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600"}>
        <Lock className={publicMode ? "h-4 w-4 text-amber-100" : "h-4 w-4 text-amber-600"} />
        только превью
      </div>
      {onPreviewClick ? (
        <button type="button" onClick={onPreviewClick} className={publicMode ? "mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-amber-200/30 bg-amber-200/12 px-3 text-sm font-semibold text-amber-50 transition hover:bg-amber-200/18" : "mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-amber-300 bg-amber-100 px-3 text-sm font-semibold text-amber-900 transition hover:bg-amber-300"}>
          Открыть превью
        </button>
      ) : null}
      <ul className={publicMode ? "mt-4 space-y-2 text-sm leading-5 text-slate-300" : "mt-4 space-y-2 text-sm leading-5 text-slate-700"}>
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span className={publicMode ? "mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-200" : "mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400"} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function panelClass(publicMode: boolean) {
  return publicMode
    ? "min-w-0 rounded-lg border border-white/12 bg-white/10 p-4 shadow-[0_18px_60px_rgba(8,13,30,0.38)] backdrop-blur transition-all duration-300"
    : "min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300";
}

export function eyebrowClass(publicMode: boolean) {
  return publicMode ? "text-xs font-semibold text-amber-100" : "text-xs font-semibold text-amber-800";
}

export function sectionTitleClass(publicMode: boolean) {
  return publicMode
    ? "mt-1 break-words text-xl font-semibold leading-tight text-white [overflow-wrap:anywhere]"
    : "mt-1 break-words text-xl font-semibold leading-tight text-slate-950 [overflow-wrap:anywhere]";
}
