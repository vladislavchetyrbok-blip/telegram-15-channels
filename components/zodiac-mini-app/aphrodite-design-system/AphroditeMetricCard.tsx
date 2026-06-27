import { AphroditeBadge } from "./AphroditeBadge";
import { AphroditeCard } from "./AphroditeCard";
import type { AphroditeTone } from "./shared";

export type AphroditeMetricCardProps = {
  label: string;
  value: string;
  detail: string;
  tone?: AphroditeTone;
  className?: string;
};

export function AphroditeMetricCard({ label, value, detail, tone = "gold", className }: AphroditeMetricCardProps) {
  return (
    <AphroditeCard tone={tone} className={`min-h-[132px] ${className ?? ""}`}>
      <div className="flex h-full min-w-0 flex-col justify-between gap-4">
        <AphroditeBadge tone={tone}>{label}</AphroditeBadge>
        <div className="min-w-0">
          <div className="aphrodite-wrap-anywhere text-3xl font-semibold leading-none text-[#fff7ed]">{value}</div>
          <p className="aphrodite-wrap-anywhere mt-2 text-sm leading-6 text-slate-300">{detail}</p>
        </div>
      </div>
    </AphroditeCard>
  );
}
