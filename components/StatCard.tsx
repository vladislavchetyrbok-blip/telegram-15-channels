import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  caption?: string;
  icon: LucideIcon;
  tone?: "cyan" | "blue" | "emerald" | "amber" | "rose" | "slate";
}

const toneStyles = {
  cyan: "from-cyan-400/20 to-cyan-400/5 text-cyan-200 ring-cyan-400/20",
  blue: "from-blue-400/20 to-blue-400/5 text-blue-200 ring-blue-400/20",
  emerald: "from-emerald-400/20 to-emerald-400/5 text-emerald-200 ring-emerald-400/20",
  amber: "from-amber-400/20 to-amber-400/5 text-amber-200 ring-amber-400/20",
  rose: "from-rose-400/20 to-rose-400/5 text-rose-200 ring-rose-400/20",
  slate: "from-slate-400/20 to-slate-400/5 text-slate-200 ring-slate-400/20",
};

export function StatCard({ title, value, caption, icon: Icon, tone = "cyan" }: StatCardProps) {
  return (
    <div className="rounded-lg border border-line bg-panel/82 p-4 shadow-glow backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
        </div>
        <div className={cn("rounded-lg bg-gradient-to-br p-2 ring-1", toneStyles[tone])}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      {caption ? <p className="mt-3 text-sm text-slate-400">{caption}</p> : null}
    </div>
  );
}
