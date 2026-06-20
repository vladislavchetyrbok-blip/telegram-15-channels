import { AphroditePageHeader } from "@/components/AphroditePageHeader";
import { ChevronLeft, FileText, ShieldCheck , Sparkles } from "lucide-react";
import Link from "next/link";

import { requireDashboardPageAccess } from "@/lib/zodiac-dashboard-auth";
import { zodiacPlatformDocPaths } from "@/lib/zodiac-platform-management";

export const dynamic = "force-dynamic";

export default function ZodiacPlatformDocsPage() {
  requireDashboardPageAccess("/dashboard/networks/zodiac/docs");
  return (
    <div className="-mx-4 -my-6 min-h-screen overflow-x-hidden bg-[#070b14] px-4 py-6 text-slate-100 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
                <AphroditePageHeader
          title="Документы Зодиака"
          description="Управление модулем Зодиак внутри Афродиты."
          badgeText="Зодиак"
          icon={Sparkles}
          safetyLocked={true}
          safetyMessage="Read-only mode"
        />

        <section className="rounded-lg border border-slate-800 bg-slate-900/50 p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-100">Основные документы</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {zodiacPlatformDocPaths.map((docPath) => (
              <code key={docPath} className="block rounded-md border border-slate-800 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                {docPath}
              </code>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
