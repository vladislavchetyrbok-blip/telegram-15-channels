import { AphroditePageHeader } from "@/components/AphroditePageHeader";
import { CheckCircle2, ShieldAlert, FileQuestion, Ban, AlertTriangle, ShieldCheck, Smartphone } from "lucide-react";
import { requireDashboardPageAccess } from "@/lib/zodiac-dashboard-auth";
import { zodiacMiniAppNavigationAudit } from "@/lib/zodiac/zodiac-miniapp-navigation-audit";
import type { AuditStatus, RiskLevel } from "@/lib/zodiac/zodiac-miniapp-navigation-audit";

export const dynamic = "force-dynamic";

const statusIcons: Record<AuditStatus, React.ElementType> = {
  verified: CheckCircle2,
  "needs review": FileQuestion,
  placeholder: Ban,
  missing: AlertTriangle,
  risky: ShieldAlert,
  protected: ShieldCheck,
};

const statusColors: Record<AuditStatus, string> = {
  verified: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  "needs review": "text-amber-400 bg-amber-400/10 border-amber-400/20",
  placeholder: "text-slate-400 bg-slate-400/10 border-slate-400/20",
  missing: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  risky: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  protected: "text-violet-400 bg-violet-400/10 border-violet-400/20",
};

const riskColors: Record<RiskLevel, string> = {
  none: "text-slate-400",
  low: "text-emerald-400",
  medium: "text-amber-400",
  high: "text-rose-400",
};

export default async function MiniAppAuditPage() {
  requireDashboardPageAccess("/dashboard/networks/zodiac/miniapp-audit");

  return (
    <div className="-mx-4 -my-6 min-h-screen overflow-x-hidden bg-[#070b14] px-4 py-6 text-slate-100 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <AphroditePageHeader
          title="Mini App Route & Navigation Audit"
          description="Read-only audit of Mini App routing, CTA paths, and VIP entry points."
          badgeText="Package 101"
          icon={Smartphone}
          safetyLocked={true}
          safetyMessage="Read-only audit mode"
        />

        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="pb-3 pr-4 font-semibold">Area</th>
                  <th className="pb-3 pr-4 font-semibold">Route / Label</th>
                  <th className="pb-3 pr-4 font-semibold">Status</th>
                  <th className="pb-3 pr-4 font-semibold">Risk Level</th>
                  <th className="pb-3 pr-4 font-semibold">Checked Reference</th>
                  <th className="pb-3 font-semibold">Next Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {zodiacMiniAppNavigationAudit.map((item) => {
                  const StatusIcon = statusIcons[item.status];
                  return (
                    <tr key={item.id} className="group transition-colors hover:bg-slate-800/30">
                      <td className="py-4 pr-4 align-top text-slate-300">{item.area}</td>
                      <td className="py-4 pr-4 align-top font-medium text-slate-100">{item.label}</td>
                      <td className="py-4 pr-4 align-top">
                        <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium ${statusColors[item.status]}`}>
                          <StatusIcon className="h-3.5 w-3.5" />
                          {item.status}
                        </span>
                      </td>
                      <td className={`py-4 pr-4 align-top font-medium capitalize ${riskColors[item.riskLevel]}`}>
                        {item.riskLevel}
                      </td>
                      <td className="py-4 pr-4 align-top text-slate-400">
                        <code className="rounded bg-slate-800/50 px-1.5 py-0.5 text-xs text-slate-300">
                          {item.checked}
                        </code>
                      </td>
                      <td className="py-4 align-top text-slate-400">{item.nextAction}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
