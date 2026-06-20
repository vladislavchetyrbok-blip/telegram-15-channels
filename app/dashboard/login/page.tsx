import { LockKeyhole, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { DashboardLoginForm } from "@/components/DashboardLoginForm";
import { getDashboardAuthStatus, sanitizeDashboardNextPath } from "@/lib/zodiac-dashboard-auth";

export const dynamic = "force-dynamic";

export default function DashboardLoginPage({
  searchParams,
}: {
  searchParams?: {
    next?: string;
    error?: string;
  };
}) {
  const nextPath = sanitizeDashboardNextPath(searchParams?.next);
  const status = getDashboardAuthStatus();

  if (status.authEnabled && status.configured && status.authenticated) {
    redirect(nextPath);
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#070b14] px-4 py-8 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl items-center">
        <div className="grid w-full gap-6 lg:grid-cols-[1fr_0.85fr] lg:items-center">
          <section className="space-y-5">
            <p className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100">
              <ShieldCheck className="h-3.5 w-3.5" />
              Owner dashboard
            </p>
            <div>
              <h1 className="break-words text-3xl font-semibold tracking-tight text-white sm:text-5xl">Вход в Telegram Platform Dashboard</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                Защитный passcode-слой для owner dashboard. Он не включает live publish, weekly live, платежи, profile sync, exact astro или server write API для платформенных данных.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <StatusPill label="Session cookie" value="httpOnly, 12h" />
              <StatusPill label="Telegram Mini App" value="public route unaffected" />
            </div>
          </section>

          <section className="rounded-lg border border-white/10 bg-white/[0.03] p-4 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
                <LockKeyhole className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-semibold text-white">Проверка доступа</h2>
                <p className="text-sm text-slate-400">Env-controlled auth gate</p>
              </div>
            </div>
            <DashboardLoginForm
              nextPath={nextPath}
              authEnabled={status.authEnabled}
              configured={status.configured}
              initialError={searchParams?.error === "config" ? "config" : null}
            />
          </section>
        </div>
      </div>
    </main>
  );
}

function StatusPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.05] px-4 py-3">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-cyan-100">{value}</p>
    </div>
  );
}
