import { ChevronLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";
import React from "react";

interface AphroditePageHeaderProps {
  title: string;
  description: string;
  badgeText: string;
  icon: React.ElementType;
  safetyLocked?: boolean;
  safetyMessage?: string;
  backLink?: string;
  backLabel?: string;
}

export function AphroditePageHeader({
  title,
  description,
  badgeText,
  icon: Icon,
  safetyLocked = false,
  safetyMessage = "Тестовый режим",
  backLink = "/dashboard/networks/aphrodite",
  backLabel = "Платформа / Афродита",
}: AphroditePageHeaderProps) {
  return (
    <header className="space-y-4 border-b border-slate-800/80 pb-6">
      <Link href={backLink} className="inline-flex items-center gap-2 text-sm font-semibold text-blue-400 transition hover:text-blue-300">
        <ChevronLeft className="h-4 w-4" />
        {backLabel}
      </Link>
      
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-300 mb-4">
            <Icon className="h-3.5 w-3.5" />
            {badgeText}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">{description}</p>
        </div>
        
        {safetyLocked && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <div className="text-sm">
              <p className="font-semibold text-emerald-300">Заблокировано</p>
              <p className="text-emerald-400/70 text-xs">{safetyMessage}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
