import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

import { AphroditeBadge } from "./AphroditeBadge";
import { AphroditeButton } from "./AphroditeButton";

export type AphroditeHeroCardProps = {
  title: string;
  description: string;
  primaryLabel: string;
  secondary?: ReactNode;
};

export function AphroditeHeroCard({
  title,
  description,
  primaryLabel,
  secondary,
}: AphroditeHeroCardProps) {
  return (
    <article className="relative overflow-hidden rounded-lg border border-rose-200/20 bg-[linear-gradient(145deg,rgba(251,113,133,0.2),rgba(167,139,250,0.16)_42%,rgba(246,213,138,0.12))] p-4 shadow-[0_20px_70px_rgba(7,7,19,0.52)]">
      <div className="space-y-4">
        <AphroditeBadge tone="rose">premium mystical romantic modern</AphroditeBadge>
        <div className="space-y-2">
          <h2 className="break-words text-2xl font-semibold leading-8 text-[#fff7ed]">{title}</h2>
          <p className="text-sm leading-6 text-slate-200">{description}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
          <AphroditeButton icon={<Sparkles aria-hidden="true" className="h-4 w-4" />}>{primaryLabel}</AphroditeButton>
          {secondary ? <div className="text-xs leading-5 text-slate-300">{secondary}</div> : null}
        </div>
      </div>
    </article>
  );
}
