import Link from "next/link";
import { BookOpen, Cloud, FileText, LayoutDashboard, ListChecks, Radio, Smartphone, TimerReset } from "lucide-react";
import { AdminLogoutButton } from "@/components/AdminLogoutButton";
import { requireAdminPageAccess } from "@/lib/admin-page-guard";

export const dynamic = "force-dynamic";

const cards = [
  { href: "/admin/publish-monitor", title: "Publish Monitor", text: "Queue reserve, today coverage, GitHub Actions checklist and recent outcomes.", icon: Radio },
  { href: "/admin/publish-scheduler", title: "Publish Scheduler", text: "Scheduler runs, publication status, skipped events and errors.", icon: TimerReset },
  { href: "/admin/mobile-control", title: "Mobile Control", text: "Phone-first control panel with safe dry-run actions.", icon: Smartphone },
  { href: "/admin/deploy-readiness", title: "Deploy Readiness", text: "General GitHub Actions, Supabase and admin auth readiness.", icon: ListChecks },
  { href: "/admin/vercel-readiness", title: "Vercel Readiness", text: "Hosted admin safety, ADMIN_* env, JSON warning and phone access checklist.", icon: Cloud },
  { href: "/admin/publish-scheduler#publication-events", title: "Publication Logs", text: "Recent publication, skipped and failed events.", icon: FileText },
  { href: "/admin/deploy-readiness", title: "Documentation / Plans", text: "Migration plans and safe phone access notes.", icon: BookOpen },
];

export default function AdminHomePage() {
  requireAdminPageAccess("/admin");

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      <section className="rounded-lg border border-line bg-panel/82 p-5 shadow-glow">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-cyan-100">
              <LayoutDashboard className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Admin</p>
              <h1 className="mt-1 text-2xl font-semibold text-white">Control panel</h1>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Main entry point for Telegram 15 Channels. Real Telegram publishing remains controlled through GitHub Actions and GitHub Secrets.
              </p>
            </div>
          </div>
          <AdminLogoutButton />
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href} className="rounded-lg border border-line bg-panel/82 p-4 transition hover:border-cyan-300/40 hover:bg-cyan-300/5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-line bg-slate-950/60 text-cyan-100">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">{card.title}</h2>
                  <p className="mt-1 text-sm leading-6 text-slate-400">{card.text}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
