import Link from "next/link";
import type { ReactNode } from "react";

export type AphroditePrimaryCtaVariant = "primary" | "secondary" | "locked";

export type AphroditePrimaryCtaProps = {
  href: string;
  children: ReactNode;
  icon?: ReactNode;
  variant?: AphroditePrimaryCtaVariant;
  ariaLabel?: string;
  className?: string;
};

const variantClasses: Record<AphroditePrimaryCtaVariant, string> = {
  primary: "bg-rose-500 text-white hover:bg-rose-400",
  secondary: "border border-white/10 bg-white/[0.06] text-slate-200 hover:bg-white/[0.09]",
  locked: "border border-slate-700 bg-slate-900/70 text-slate-400",
};

export function AphroditePrimaryCta({
  href,
  children,
  icon,
  variant = "primary",
  ariaLabel,
  className = "",
}: AphroditePrimaryCtaProps) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-center text-sm font-semibold transition active:scale-[0.99] ${variantClasses[variant]} ${className}`}
    >
      {icon ? <span className="flex h-5 w-5 items-center justify-center">{icon}</span> : null}
      <span>{children}</span>
    </Link>
  );
}
