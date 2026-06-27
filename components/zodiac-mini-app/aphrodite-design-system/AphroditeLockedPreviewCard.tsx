import { LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";

import { AphroditeBadge } from "./AphroditeBadge";
import { AphroditeCard } from "./AphroditeCard";
import { aphroditeClassNames } from "./shared";

export type AphroditeLockedPreviewVariant =
  | "general"
  | "home"
  | "compatibility"
  | "birthMatrix"
  | "mystic"
  | "natal";

export type AphroditeLockedPreviewCardProps = {
  variant?: AphroditeLockedPreviewVariant;
  scope?: string;
  title?: string;
  subtitle?: string;
  preview?: string;
  features?: readonly string[];
  previewItems?: readonly string[];
  lockLabel?: string;
  safetyLabel?: string;
  className?: string;
};

const variantAccent: Record<AphroditeLockedPreviewVariant, string> = {
  general: "before:from-amber-200/18 before:via-violet-300/12 before:to-rose-300/10",
  home: "before:from-rose-300/18 before:via-violet-300/14 before:to-amber-200/12",
  compatibility: "before:from-rose-300/20 before:via-fuchsia-300/14 before:to-amber-200/12",
  birthMatrix: "before:from-amber-200/20 before:via-violet-300/14 before:to-cyan-200/10",
  mystic: "before:from-violet-300/20 before:via-fuchsia-300/14 before:to-amber-200/12",
  natal: "before:from-cyan-200/16 before:via-violet-300/14 before:to-rose-300/12",
};

const defaultFeatures: Record<AphroditeLockedPreviewVariant, readonly string[]> = {
  general: ["Deep compatibility report", "Birth Matrix Pro", "Personal advice"],
  home: ["Deep compatibility report", "Birth Matrix Pro", "Shareable premium card"],
  compatibility: ["Deep compatibility report", "Relationship calendar", "Conflict risks"],
  birthMatrix: ["Birth Matrix Pro", "Personal advice", "Relationship insight"],
  mystic: ["Mystic deep reading", "Personal ritual", "Relationship warning"],
  natal: ["Natal profile", "Personal advice", "Career and cycle hints"],
};

const defaultPreviewItems: Record<AphroditeLockedPreviewVariant, readonly string[]> = {
  general: ["Preview-only", "No active payment", "No real VIP unlock"],
  home: ["Preview-only value ladder", "No active payment", "Owner review required"],
  compatibility: ["Emotional dynamics", "Love calendar", "Birth Matrix connection"],
  birthMatrix: ["Cycles", "Money and purpose", "Relationship patterns"],
  mystic: ["Deep card interpretation", "Love and money focus", "Personal ritual/advice"],
  natal: ["Personal cycles", "Matrix connection", "Weekly ritual preview"],
};

export function AphroditeLockedPreviewCard({
  variant = "general",
  scope,
  title = "VIP locked preview",
  subtitle = "Preview-only premium layer",
  preview = "A desirable preview can show what feels valuable while staying honest: payment inactive, VIP unlock inactive, entitlement unchanged.",
  features,
  previewItems,
  lockLabel = "locked preview only",
  safetyLabel = "No active payment. No real VIP unlock. No entitlement bypass.",
  className,
}: AphroditeLockedPreviewCardProps) {
  const featureList = features ?? defaultFeatures[variant];
  const previewList = previewItems ?? defaultPreviewItems[variant];

  return (
    <div
      className={aphroditeClassNames("min-w-0", className)}
      data-aphrodite-vip-locked-preview-redesign="package-242"
      data-aphrodite-vip-locked-scope={scope ?? variant}
    >
      <AphroditeCard
        tone="locked"
        className={aphroditeClassNames(
          "relative overflow-hidden p-0",
          "before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-br before:opacity-100 before:content-['']",
          variantAccent[variant],
        )}
      >
        <div className="relative space-y-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 flex-wrap gap-2">
              <AphroditeBadge tone="locked">VIP locked preview</AphroditeBadge>
              <AphroditeBadge tone="gold">preview-only</AphroditeBadge>
            </div>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-amber-100/25 bg-black/25 text-amber-100">
              <LockKeyhole aria-hidden="true" className="h-5 w-5" />
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase leading-4 text-amber-100/80">{subtitle}</p>
            <h3 className="break-words text-lg font-semibold leading-7 text-[#fff7ed] [overflow-wrap:anywhere]">{title}</h3>
            <p className="break-words text-sm leading-6 text-slate-300 [overflow-wrap:anywhere]">{preview}</p>
          </div>

          <div className="grid gap-2 min-[390px]:grid-cols-2">
            {featureList.map((feature) => (
              <div key={feature} className="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold leading-5 text-slate-100">
                {feature}
              </div>
            ))}
          </div>

          <div className="grid gap-2">
            {previewList.map((item) => (
              <div key={item} className="flex items-start gap-2 rounded-lg border border-amber-100/16 bg-black/18 px-3 py-2 text-xs leading-5 text-amber-50/90">
                <Sparkles aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-100" />
                <span className="break-words">{item}</span>
              </div>
            ))}
          </div>

          <div className="grid gap-2 rounded-lg border border-emerald-200/20 bg-emerald-200/10 p-3 text-xs leading-5 text-emerald-50">
            <div className="flex items-start gap-2">
              <ShieldCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-100" />
              <span>{safetyLabel}</span>
            </div>
            <div className="inline-flex w-fit max-w-full rounded-md border border-amber-100/20 bg-black/20 px-2.5 py-1 text-[11px] font-semibold uppercase leading-4 text-amber-100">
              {lockLabel}
            </div>
          </div>
        </div>
      </AphroditeCard>
    </div>
  );
}
