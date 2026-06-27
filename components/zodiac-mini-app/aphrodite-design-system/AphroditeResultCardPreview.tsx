import { HeartHandshake, Share2 } from "lucide-react";

import { AphroditeBadge } from "./AphroditeBadge";
import { AphroditeButton } from "./AphroditeButton";
import { AphroditeCard } from "./AphroditeCard";

export type AphroditeResultCardPreviewProps = {
  scoreLabel?: string;
  title?: string;
  insight?: string;
};

export function AphroditeResultCardPreview({
  scoreLabel = "84%",
  title = "Compatibility score visual language",
  insight = "A calm romantic result card: readable, premium, mystical, and ready for a screenshot without casino-like pressure.",
}: AphroditeResultCardPreviewProps) {
  return (
    <AphroditeCard tone="gold" className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <AphroditeBadge tone="gold">shareable result card</AphroditeBadge>
        <HeartHandshake aria-hidden="true" className="h-5 w-5 shrink-0 text-amber-100" />
      </div>
      <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-lg border border-amber-100/30 bg-[#17152e] text-3xl font-semibold text-amber-100">
          {scoreLabel}
        </div>
        <div className="min-w-0">
          <h3 className="break-words text-base font-semibold leading-6 text-[#fff7ed]">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">{insight}</p>
        </div>
      </div>
      <AphroditeButton variant="share" icon={<Share2 aria-hidden="true" className="h-4 w-4" />}>
        Share result preview
      </AphroditeButton>
    </AphroditeCard>
  );
}
