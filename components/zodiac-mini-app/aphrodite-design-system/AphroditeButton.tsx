import type { ReactNode } from "react";

import { aphroditeClassNames } from "./shared";

export type AphroditeButtonVariant = "primary" | "secondary" | "share" | "locked";

export type AphroditeButtonProps = {
  children: ReactNode;
  variant?: AphroditeButtonVariant;
  disabled?: boolean;
  className?: string;
  icon?: ReactNode;
};

const variantClassNames: Record<AphroditeButtonVariant, string> = {
  primary:
    "border-amber-100/35 bg-[linear-gradient(135deg,#fb7185,#f6d58a)] text-[#190914] shadow-[0_16px_44px_rgba(251,113,133,0.28)]",
  secondary: "border-white/20 bg-white/[0.075] text-slate-100 shadow-[0_12px_32px_rgba(7,7,19,0.28)]",
  share: "border-violet-200/25 bg-[#17152e] text-violet-50 shadow-[0_12px_32px_rgba(88,28,135,0.24)]",
  locked: "border-amber-200/25 bg-slate-950/70 text-amber-100 opacity-85",
};

export function AphroditeButton({
  children,
  variant = "primary",
  disabled = false,
  className,
  icon,
}: AphroditeButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled || variant === "locked"}
      className={aphroditeClassNames(
        "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold leading-5 transition-colors",
        "aphrodite-touch-target max-w-full text-center",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200",
        variantClassNames[variant],
        className,
      )}
    >
      {icon ? <span className="shrink-0">{icon}</span> : null}
      <span className="aphrodite-wrap-anywhere min-w-0 break-words">{children}</span>
    </button>
  );
}
