import type { ReactNode } from "react";

export type AphroditeSectionCardTone = "base" | "primary" | "safe" | "locked";

export type AphroditeSectionCardProps = {
  title: string;
  eyebrow?: string;
  description?: string;
  tone?: AphroditeSectionCardTone;
  actionSlot?: ReactNode;
  children?: ReactNode;
  className?: string;
};

const toneClasses: Record<AphroditeSectionCardTone, string> = {
  base: "border-white/10 bg-white/[0.045]",
  primary: "border-rose-200/15 bg-rose-950/20",
  safe: "border-emerald-300/20 bg-emerald-950/15",
  locked: "border-slate-700/80 bg-slate-900/70",
};

export function AphroditeSectionCard({
  title,
  eyebrow,
  description,
  tone = "base",
  actionSlot,
  children,
  className = "",
}: AphroditeSectionCardProps) {
  return (
    <section className={`min-w-0 max-w-full overflow-hidden rounded-lg border p-3 min-[390px]:p-4 ${toneClasses[tone]} ${className}`}>
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          {eyebrow ? <p className="aphrodite-wrap-anywhere text-xs font-medium text-rose-200">{eyebrow}</p> : null}
          <h2 className="aphrodite-wrap-anywhere text-base font-semibold leading-6 text-white">{title}</h2>
          {description ? <p className="aphrodite-wrap-anywhere text-sm leading-6 text-slate-300">{description}</p> : null}
        </div>
        {actionSlot ? <div className="shrink-0">{actionSlot}</div> : null}
      </div>
      {children ? <div className="mt-4 min-w-0">{children}</div> : null}
    </section>
  );
}
