export type AphroditeStatusPillTone = "safe" | "accent" | "muted" | "locked";

export type AphroditeStatusPillProps = {
  label: string;
  tone?: AphroditeStatusPillTone;
  className?: string;
};

const toneClasses: Record<AphroditeStatusPillTone, string> = {
  safe: "border-emerald-300/20 bg-emerald-950/20 text-emerald-300",
  accent: "border-rose-300/20 bg-rose-950/25 text-rose-200",
  muted: "border-white/10 bg-white/[0.045] text-slate-300",
  locked: "border-slate-700 bg-slate-900/70 text-slate-400",
};

export function AphroditeStatusPill({ label, tone = "muted", className = "" }: AphroditeStatusPillProps) {
  return (
    <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-medium leading-4 ${toneClasses[tone]} ${className}`}>
      {label}
    </span>
  );
}
