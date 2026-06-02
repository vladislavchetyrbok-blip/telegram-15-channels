"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, LockKeyhole } from "lucide-react";

export function AdminLoginPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [authEnabled, setAuthEnabled] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/admin/auth/status", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        setAuthEnabled(Boolean(payload.authEnabled));
        if (payload.authenticated) router.replace(searchParams.get("next") || "/admin");
      })
      .catch(() => setAuthEnabled(true));
  }, [router, searchParams]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.authenticated) {
        throw new Error(payload.message ?? "Не удалось войти.");
      }
      router.replace(searchParams.get("next") || "/admin");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Не удалось войти.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center">
      <section className="w-full rounded-lg border border-line bg-panel/82 p-5 shadow-glow">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-300/10 text-cyan-100">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-cyan-300">Admin Access</p>
            <h1 className="mt-1 text-2xl font-semibold text-white">Вход в админку</h1>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Пароль задаётся через ADMIN_PASSWORD в env/Vercel Secrets.
            </p>
          </div>
        </div>

        {authEnabled === false ? (
          <div className="mt-5 rounded-md border border-amber-300/25 bg-amber-300/10 p-3 text-sm leading-6 text-amber-50">
            ADMIN_AUTH_ENABLED=false: локальный доступ сейчас разрешён без пароля.
          </div>
        ) : null}

        <form onSubmit={submit} className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-slate-200">Пароль администратора</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 h-12 w-full rounded-md border border-line bg-slate-950 px-3 text-base text-white outline-none transition focus:border-cyan-300/60"
              autoComplete="current-password"
              disabled={busy || authEnabled === false}
            />
          </label>

          <button type="submit" disabled={busy || authEnabled === false} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 text-base font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60">
            {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
            Войти
          </button>
        </form>

        {error ? <p className="mt-4 rounded-md border border-rose-300/25 bg-rose-300/10 p-3 text-sm text-rose-100">{error}</p> : null}
      </section>
    </div>
  );
}
