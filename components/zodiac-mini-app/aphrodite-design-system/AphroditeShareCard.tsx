import { HeartHandshake, Share2, Sparkles } from "lucide-react";

import { AphroditeBadge } from "./AphroditeBadge";
import { AphroditeCard } from "./AphroditeCard";
import { aphroditeClassNames, type AphroditeTone } from "./shared";

export type AphroditeShareCardVariant =
  | "general"
  | "compatibility"
  | "birthMatrix"
  | "mystic"
  | "natal"
  | "vipPreview";

export type AphroditeShareCardHighlight = {
  label: string;
  value: string;
  detail?: string;
};

export type AphroditeShareCardProps = {
  variant?: AphroditeShareCardVariant;
  scope?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  scoreLabel?: string;
  scoreDetail?: string;
  insight: string;
  highlights?: readonly AphroditeShareCardHighlight[];
  footer?: string;
  className?: string;
};

const variantTone: Record<AphroditeShareCardVariant, AphroditeTone> = {
  general: "gold",
  compatibility: "rose",
  birthMatrix: "gold",
  mystic: "violet",
  natal: "cosmic",
  vipPreview: "locked",
};

const variantAccent: Record<AphroditeShareCardVariant, string> = {
  general: "before:from-amber-200/18 before:via-violet-300/12 before:to-rose-300/12",
  compatibility: "before:from-rose-300/20 before:via-fuchsia-300/12 before:to-amber-200/12",
  birthMatrix: "before:from-amber-200/20 before:via-cyan-300/10 before:to-violet-300/12",
  mystic: "before:from-violet-300/20 before:via-fuchsia-300/14 before:to-amber-200/10",
  natal: "before:from-cyan-300/16 before:via-violet-300/12 before:to-rose-300/12",
  vipPreview: "before:from-amber-200/18 before:via-rose-300/12 before:to-violet-300/12",
};

const defaultScoreLabel: Record<AphroditeShareCardVariant, string> = {
  general: "preview",
  compatibility: "match",
  birthMatrix: "core",
  mystic: "reveal",
  natal: "profile",
  vipPreview: "locked",
};

export function AphroditeShareCard({
  variant = "general",
  scope,
  eyebrow = "Share-ready preview",
  title,
  subtitle,
  scoreLabel,
  scoreDetail = "result card",
  insight,
  highlights = [],
  footer = "Share-ready visual only. No real Telegram share/send API, no canvas export, no DB write.",
  className,
}: AphroditeShareCardProps) {
  return (
    <div
      className={aphroditeClassNames("min-w-0", className)}
      data-aphrodite-result-share-card="package-243"
      data-aphrodite-result-share-scope={scope ?? variant}
      data-aphrodite-share-ready-preview="package-243"
    >
      <AphroditeCard
        tone={variantTone[variant]}
        className={aphroditeClassNames(
          "relative overflow-hidden p-0",
          "before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-br before:content-['']",
          variantAccent[variant],
        )}
      >
        <div className="relative space-y-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap gap-2">
                <AphroditeBadge tone="gold">share-ready preview</AphroditeBadge>
                <AphroditeBadge tone={variantTone[variant]}>{eyebrow}</AphroditeBadge>
              </div>
              <div>
                <h3 className="break-words text-xl font-semibold leading-7 text-[#fff7ed] [overflow-wrap:anywhere]">{title}</h3>
                {subtitle ? <p className="mt-1 break-words text-sm leading-5 text-slate-300 [overflow-wrap:anywhere]">{subtitle}</p> : null}
              </div>
            </div>
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg border border-amber-100/25 bg-black/25 text-center">
              <div>
                <p className="text-lg font-semibold leading-5 text-amber-100">{scoreLabel ?? defaultScoreLabel[variant]}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase leading-3 text-amber-100/70">{scoreDetail}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-black/18 p-3">
            <div className="flex items-start gap-2">
              <HeartHandshake aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-rose-200" />
              <p className="break-words text-sm leading-6 text-slate-100 [overflow-wrap:anywhere]">{insight}</p>
            </div>
          </div>

          {highlights.length ? (
            <div className="grid gap-2 min-[390px]:grid-cols-3">
              {highlights.map((item) => (
                <div key={`${item.label}-${item.value}`} className="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2">
                  <p className="text-[11px] font-semibold uppercase leading-4 text-slate-300">{item.label}</p>
                  <p className="mt-1 break-words text-sm font-semibold leading-5 text-[#fff7ed] [overflow-wrap:anywhere]">{item.value}</p>
                  {item.detail ? <p className="mt-1 line-clamp-2 text-xs leading-4 text-slate-400">{item.detail}</p> : null}
                </div>
              ))}
            </div>
          ) : null}

          <div className="flex items-start gap-2 rounded-lg border border-emerald-200/20 bg-emerald-200/10 px-3 py-2 text-xs leading-5 text-emerald-50">
            <Share2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-100" />
            <span>{footer}</span>
          </div>

          <div className="flex flex-wrap gap-2" aria-hidden="true">
            <span className="h-1.5 w-12 rounded-full bg-rose-300/70" />
            <span className="h-1.5 w-8 rounded-full bg-violet-300/70" />
            <span className="h-1.5 w-14 rounded-full bg-amber-200/70" />
            <Sparkles className="h-4 w-4 text-amber-100/80" />
          </div>
        </div>
      </AphroditeCard>
    </div>
  );
}
