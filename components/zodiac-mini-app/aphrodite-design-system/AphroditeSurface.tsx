import type { ReactNode } from "react";

import { aphroditeClassNames } from "./shared";

export type AphroditeSurfaceProps = {
  children: ReactNode;
  className?: string;
};

export function AphroditeSurface({ children, className }: AphroditeSurfaceProps) {
  return (
    <section
      className={aphroditeClassNames(
        "min-w-0 max-w-full overflow-hidden rounded-lg border border-white/10 bg-[#070713] text-[#fff7ed] shadow-[0_24px_90px_rgba(7,7,19,0.65)]",
        className,
      )}
    >
      <div className="relative isolate min-w-0">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(167,139,250,0.22),transparent_30%,rgba(251,113,133,0.16)_62%,rgba(246,213,138,0.12)),linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.015)_45%,rgba(7,7,19,0.58))]" />
        <div className="min-w-0 px-3 py-4 min-[390px]:px-4 min-[390px]:py-5 sm:px-5 sm:py-6">{children}</div>
      </div>
    </section>
  );
}
