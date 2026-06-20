import { AphroditePageHeader } from "@/components/AphroditePageHeader";
import { ChevronLeft, LockKeyhole, MessageSquareText, ShieldCheck , Sparkles } from "lucide-react";
import Link from "next/link";
import { FeedbackCenterWorkspace } from "@/components/zodiac-platform/FeedbackCenterWorkspace";

import { requireDashboardPageAccess } from "@/lib/zodiac-dashboard-auth";

export const dynamic = "force-dynamic";

export default function ZodiacFeedbackCenterPage() {
  requireDashboardPageAccess("/dashboard/networks/zodiac/feedback");
  return (
    <div className="-mx-4 -my-6 min-h-screen overflow-x-hidden bg-[#070b14] px-4 py-6 text-slate-100 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
                <AphroditePageHeader
          title="Отзывы"
          description="Управление модулем Зодиак внутри Афродиты."
          badgeText="Зодиак"
          icon={Sparkles}
          safetyLocked={true}
          safetyMessage="Read-only mode"
        />

        <FeedbackCenterWorkspace />
      </div>
    </div>
  );
}
