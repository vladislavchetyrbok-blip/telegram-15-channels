import type { ReactNode } from "react";

import { type AphroditeTone, aphroditeClassNames } from "./shared";

export type AphroditeCardProps = {
  children: ReactNode;
  tone?: AphroditeTone;
  className?: string;
};

const toneClassNames: Record<AphroditeTone, string> = {
  cosmic: "border-white/10 bg-white/[0.075] shadow-[0_18px_54px_rgba(7,7,19,0.42)]",
  violet: "border-violet-300/20 bg-violet-300/[0.09] shadow-[0_18px_54px_rgba(88,28,135,0.32)]",
  rose: "border-rose-300/20 bg-rose-300/[0.085] shadow-[0_18px_54px_rgba(190,24,93,0.22)]",
  gold: "border-amber-200/25 bg-amber-200/[0.08] shadow-[0_18px_54px_rgba(146,64,14,0.22)]",
  locked: "border-amber-200/25 bg-slate-950/46 shadow-[0_18px_54px_rgba(146,64,14,0.2)]",
};

export function AphroditeCard({ children, tone = "cosmic", className }: AphroditeCardProps) {
  return (
    <article
      className={aphroditeClassNames(
        "aphrodite-pkg-246-visual-fix aphrodite-card-spacing-fix min-w-0 max-w-full overflow-hidden rounded-lg border p-3 backdrop-blur-md min-[390px]:p-4",
        toneClassNames[tone],
        className,
      )}
    >
      {children}
    </article>
  );
}
