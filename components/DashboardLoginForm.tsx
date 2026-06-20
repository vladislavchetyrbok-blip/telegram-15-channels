"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { LockKeyhole, LogIn, ShieldAlert } from "lucide-react";

interface DashboardLoginFormProps {
  nextPath: string;
  authEnabled: boolean;
  configured: boolean;
  initialError?: "config" | null;
}

export function DashboardLoginForm({ nextPath, authEnabled, configured, initialError }: DashboardLoginFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(initialError === "config" ? "Auth включён, но hash или session secret не настроены." : "");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!authEnabled || !configured) return;

    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/dashboard/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password, next: nextPath }),
      });
      const payload = (await response.json().catch(() => null)) as { authenticated?: boolean; redirectTo?: string; message?: string } | null;

      if (!response.ok || !payload?.authenticated) {
        setMessage(response.status === 401 ? "Неверный passcode." : payload?.message ?? "Не удалось открыть dashboard.");
        return;
      }

      router.replace(payload.redirectTo ?? nextPath);
      router.refresh();
    } catch {
      setMessage("Не удалось проверить passcode. Попробуйте ещё раз.");
    } finally {
      setBusy(false);
    }
  }

  if (!authEnabled) {
    return (
      <div className="rounded-lg border border-amber-300/25 bg-amber-300/10 p-5 text-amber-50">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">Auth отключён для local/dev режима.</p>
            <p className="mt-2 text-sm leading-6 text-amber-50/85">Dashboard доступен без passcode. Для production перед расширением доступа включите env-gate.</p>
            <button type="button" onClick={() => router.replace(nextPath)} className="mt-4 inline-flex h-10 items-center gap-2 rounded-md border border-amber-100/30 bg-amber-100/10 px-4 text-sm font-semibold text-white transition hover:bg-amber-100/15">
              Открыть dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-2xl">
      <label className="grid gap-2 text-sm font-semibold text-slate-200">
        <span>Passcode владельца</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          className="h-12 rounded-md border border-white/10 bg-black/30 px-3 text-base text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
          placeholder="Введите passcode"
        />
      </label>

      {message ? (
        <p className="rounded-md border border-rose-300/25 bg-rose-300/10 px-3 py-2 text-sm font-semibold leading-5 text-rose-100">{message}</p>
      ) : null}

      {!configured ? (
        <p className="rounded-md border border-amber-300/25 bg-amber-300/10 px-3 py-2 text-sm font-semibold leading-5 text-amber-50">
          Dashboard закрыт fail-closed: задайте SHA-256 hash и session secret в env.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy || !configured || !password.trim()}
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-cyan-300 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? <LockKeyhole className="h-4 w-4 animate-pulse" /> : <LogIn className="h-4 w-4" />}
        Войти в dashboard
      </button>
    </form>
  );
}
