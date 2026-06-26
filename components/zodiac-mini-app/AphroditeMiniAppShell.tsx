import type { ReactNode } from "react";

import { getAphroditeMiniAppDesignTokens } from "@/lib/zodiac/aphrodite-design-tokens";

export type AphroditeMiniAppShellProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  statusSlot?: ReactNode;
  children: ReactNode;
  footerSlot?: ReactNode;
  className?: string;
};

export function AphroditeMiniAppShell({
  eyebrow = "Aphrodite Mini App",
  title,
  description,
  statusSlot,
  children,
  footerSlot,
  className = "",
}: AphroditeMiniAppShellProps) {
  const tokens = getAphroditeMiniAppDesignTokens();

  return (
    <main
      data-aphrodite-ui-shell="package-197"
      className={`min-h-screen bg-[#070b14] text-slate-100 ${tokens.sectionRhythm[3]?.value ?? "pb-8"} ${className}`}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 py-5">
        <header className="space-y-3 pb-4 pt-2">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-md border border-white/10 bg-white/[0.045] px-2.5 py-1 text-xs font-medium text-rose-200">
              {eyebrow}
            </span>
            {statusSlot}
          </div>
          <div className="space-y-2">
            <h1 className={tokens.textHierarchy[0]?.className ?? "text-2xl font-semibold text-white"}>{title}</h1>
            {description ? <p className={tokens.textHierarchy[2]?.className ?? "text-sm leading-6 text-slate-300"}>{description}</p> : null}
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4">{children}</div>

        {footerSlot ? <footer className="pt-4">{footerSlot}</footer> : null}
      </div>
    </main>
  );
}
