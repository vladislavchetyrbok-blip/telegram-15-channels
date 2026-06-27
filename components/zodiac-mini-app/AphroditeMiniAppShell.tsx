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
      data-aphrodite-telegram-webview-mobile-polish="package-244"
      className={`aphrodite-mobile-shell zodiac-miniapp-safe-area bg-[#070b14] text-slate-100 ${tokens.sectionRhythm[3]?.value ?? "pb-8"} ${className}`}
    >
      <div className="aphrodite-scroll-safe aphrodite-safe-top aphrodite-safe-bottom mx-auto flex min-h-[100svh] w-full max-w-md flex-col px-3 min-[390px]:px-4">
        <header className="min-w-0 space-y-3 pb-4 pt-2">
          <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
            <span className="aphrodite-wrap-anywhere rounded-md border border-white/10 bg-white/[0.045] px-2.5 py-1 text-xs font-medium text-rose-200">
              {eyebrow}
            </span>
            {statusSlot}
          </div>
          <div className="min-w-0 space-y-2">
            <h1 className={`aphrodite-wrap-anywhere ${tokens.textHierarchy[0]?.className ?? "text-2xl font-semibold text-white"}`}>{title}</h1>
            {description ? <p className={`aphrodite-wrap-anywhere ${tokens.textHierarchy[2]?.className ?? "text-sm leading-6 text-slate-300"}`}>{description}</p> : null}
          </div>
        </header>

        <div className="flex min-w-0 flex-1 flex-col gap-4">{children}</div>

        {footerSlot ? <footer className="min-w-0 pt-4">{footerSlot}</footer> : null}
      </div>
    </main>
  );
}
