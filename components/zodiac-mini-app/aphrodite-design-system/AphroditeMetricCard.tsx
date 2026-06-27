import { AphroditeBadge } from "./AphroditeBadge";
import { AphroditeCard } from "./AphroditeCard";
import type { AphroditeTone } from "./shared";

export type AphroditeMetricCardProps = {
  label: string;
  value: string;
  detail: string;
  tone?: AphroditeTone;
};

export function AphroditeMetricCard({ label, value, detail, tone = "gold" }: AphroditeMetricCardProps) {
  return (
    <AphroditeCard tone={tone} className="min-h-[132px]">
      <div className="flex h-full flex-col justify-between gap-4">
        <AphroditeBadge tone={tone}>{label}</AphroditeBadge>
        <div>
          <div className="text-3xl font-semibold leading-none text-[#fff7ed]">{value}</div>
          <p className="mt-2 text-sm leading-6 text-slate-300">{detail}</p>
        </div>
      </div>
    </AphroditeCard>
  );
}
