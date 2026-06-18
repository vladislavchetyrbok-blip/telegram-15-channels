import type { ReactNode } from "react";

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
