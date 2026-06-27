import type { ReactNode } from "react";

import { type AphroditeTone, aphroditeClassNames } from "./shared";

export type AphroditeBadgeProps = {
  children: ReactNode;
  tone?: AphroditeTone;
  className?: string;
};

const toneClassNames: Record<AphroditeTone, string> = {
  cosmic: "border-slate-300/20 bg-white/[0.07] text-slate-100",
  violet: "border-violet-300/25 bg-violet-300/[0.12] text-violet-100",
  rose: "border-rose-300/25 bg-rose-300/[0.12] text-rose-100",
  gold: "border-amber-200/30 bg-amber-200/[0.13] text-amber-100",
  locked: "border-amber-200/25 bg-slate-950/70 text-amber-100",
};

export function AphroditeBadge({ children, tone = "cosmic", className }: AphroditeBadgeProps) {
  return (
    <span
      className={aphroditeClassNames(
        "inline-flex min-w-0 max-w-full items-center rounded-md border px-2.5 py-1 text-[11px] font-medium leading-4",
        toneClassNames[tone],
        className,
      )}
    >
      <span className="aphrodite-wrap-anywhere break-words">{children}</span>
    </span>
  );
}
