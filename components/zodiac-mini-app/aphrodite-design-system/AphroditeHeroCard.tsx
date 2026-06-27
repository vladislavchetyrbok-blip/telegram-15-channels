import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

import { AphroditeBadge } from "./AphroditeBadge";
import { AphroditeButton } from "./AphroditeButton";

export type AphroditeHeroCardProps = {
  title: string;
  description: string;
  primaryLabel: string;
  secondary?: ReactNode;
  className?: string;
};

export function AphroditeHeroCard({
  title,
  description,
  primaryLabel,
  secondary,
  className = "",
}: AphroditeHeroCardProps) {
  return (
    <article className={`relative min-w-0 max-w-full overflow-hidden rounded-lg border border-rose-200/20 bg-[linear-gradient(145deg,rgba(251,113,133,0.2),rgba(167,139,250,0.16)_42%,rgba(246,213,138,0.12))] p-3 shadow-[0_20px_70px_rgba(7,7,19,0.52)] min-[390px]:p-4 ${className}`}>
      <div className="min-w-0 space-y-4">
        <AphroditeBadge tone="rose">premium mystical romantic modern</AphroditeBadge>
        <div className="space-y-2">
          <h2 className="aphrodite-wrap-anywhere break-words text-2xl font-semibold leading-8 text-[#fff7ed]">{title}</h2>
          <p className="aphrodite-wrap-anywhere text-sm leading-6 text-slate-200">{description}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
          <AphroditeButton icon={<Sparkles aria-hidden="true" className="h-4 w-4" />}>{primaryLabel}</AphroditeButton>
          {secondary ? <div className="aphrodite-wrap-anywhere text-xs leading-5 text-slate-300">{secondary}</div> : null}
        </div>
      </div>
    </article>
  );
}
