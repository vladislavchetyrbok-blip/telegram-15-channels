import Link from "next/link";
import { AlertTriangle, ExternalLink, Github, ListChecks, Rocket, Smartphone, TimerReset } from "lucide-react";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { requireAdminPageAccess } from "@/lib/admin-page-guard";

export const dynamic = "force-dynamic";

const links = [
  { href: "/admin/phone-dashboard", label: "Open monitor", icon: Smartphone },
  { href: "/admin/publish-scheduler", label: "Open publish scheduler", icon: TimerReset },
  { href: "/admin/publish-scheduler#publication-events", label: "Open publication logs", icon: ListChecks },
  { href: "/admin/deploy-readiness", label: "Open deploy readiness", icon: Rocket },
  { href: "/admin/publish-monitor", label: "Open publish monitor", icon: ListChecks },
];

export default function PhoneStartPage() {
  requireAdminPageAccess("/admin/phone-start");
  const actionsUrl = process.env.NEXT_PUBLIC_GITHUB_ACTIONS_URL || "";

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4 pb-8">
      <div className="flex justify-end">
        <AdminLogoutButton />
      </div>

      <section className="rounded-lg border border-line bg-panel/82 p-4 shadow-glow">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-cyan-100">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Phone Start</p>
            <h1 className="mt-1 text-2xl font-semibold text-white">Mobile control entry</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Fast links for checking autonomous Telegram publishing from a phone. Real sends stay in GitHub Actions.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-3">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="inline-flex min-h-14 items-center justify-between gap-3 rounded-lg border border-line bg-panel/82 px-4 text-base font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:text-cyan-100">
              <span className="inline-flex items-center gap-3">
                <Icon className="h-5 w-5" />
                {item.label}
              </span>
              <span className="text-slate-500">›</span>
            </Link>
          );
        })}
        {actionsUrl ? (
          <a href={actionsUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-14 items-center justify-between gap-3 rounded-lg bg-cyan-300 px-4 text-base font-semibold text-slate-950 transition hover:bg-cyan-200">
            <span className="inline-flex items-center gap-3">
              <Github className="h-5 w-5" />
              Open GitHub Actions
            </span>
            <ExternalLink className="h-4 w-4" />
          </a>
        ) : (
          <div className="rounded-lg border border-line bg-panel/82 p-4 text-sm leading-6 text-slate-400">
            Set <span className="font-semibold text-slate-200">NEXT_PUBLIC_GITHUB_ACTIONS_URL</span> to show a direct GitHub Actions button.
          </div>
        )}
      </section>

      <section className="rounded-lg border border-amber-300/25 bg-amber-300/10 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-200" />
          <div className="space-y-2 text-sm leading-6 text-amber-50">
            <h2 className="font-semibold text-white">Emergency stop instructions</h2>
            <p>Stop publishing: set TELEGRAM_REAL_PUBLISH_ENABLED=false.</p>
            <p>Safe test mode: set TELEGRAM_DRY_RUN=true.</p>
            <p>Live mode: TELEGRAM_DRY_RUN=false and TELEGRAM_REAL_PUBLISH_ENABLED=true.</p>
            <p>Do not press Run workflow many times in a row.</p>
          </div>
        </div>
      </section>

      <p className="rounded-lg border border-line bg-panel/82 p-4 text-sm leading-6 text-slate-400">
        Documentation file: <span className="font-semibold text-slate-200">PHONE_DASHBOARD_GUIDE.md</span> in the repository root.
      </p>
    </div>
  );
}
