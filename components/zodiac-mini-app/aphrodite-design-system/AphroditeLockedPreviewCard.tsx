import { LockKeyhole, Sparkles } from "lucide-react";

import { AphroditeBadge } from "./AphroditeBadge";
import { AphroditeButton } from "./AphroditeButton";
import { AphroditeCard } from "./AphroditeCard";

export type AphroditeLockedPreviewCardProps = {
  title?: string;
  preview?: string;
};

export function AphroditeLockedPreviewCard({
  title = "VIP locked preview",
  preview = "A desirable preview can show what feels valuable while staying honest: payment inactive, VIP unlock inactive, entitlement unchanged.",
}: AphroditeLockedPreviewCardProps) {
  return (
    <AphroditeCard tone="locked" className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <AphroditeBadge tone="locked">no payment / no VIP unlock</AphroditeBadge>
        <LockKeyhole aria-hidden="true" className="h-5 w-5 shrink-0 text-amber-100" />
      </div>
      <div className="space-y-2">
        <h3 className="break-words text-base font-semibold leading-6 text-[#fff7ed]">{title}</h3>
        <p className="text-sm leading-6 text-slate-300">{preview}</p>
      </div>
      <div className="rounded-lg border border-amber-100/20 bg-black/20 p-3 text-xs leading-5 text-amber-100">
        Locked state is visual-only in Package 237. It does not activate payment, entitlement, or real VIP access.
      </div>
      <AphroditeButton
        variant="locked"
        icon={<Sparkles aria-hidden="true" className="h-4 w-4" />}
      >
        Locked preview only
      </AphroditeButton>
    </AphroditeCard>
  );
}
