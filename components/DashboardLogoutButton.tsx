"use client";

import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";

interface DashboardAuthStatusPayload {
  authEnabled?: boolean;
  authenticated?: boolean;
}

export function DashboardLogoutButton() {
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;

    fetch("/api/dashboard/auth/status", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload: DashboardAuthStatusPayload | null) => {
        if (!mounted || !payload) return;
        setVisible(Boolean(payload.authEnabled && payload.authenticated));
      })
      .catch(() => {
        if (mounted) setVisible(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/dashboard/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/dashboard/login";
    }
  }

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={logout}
      disabled={busy}
      className="inline-flex h-10 shrink-0 items-center gap-2 rounded-md border border-rose-300/30 bg-rose-300/10 px-4 text-sm font-semibold text-rose-100 transition hover:bg-rose-300/15 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <LogOut className="h-4 w-4" />
      Выйти
    </button>
  );
}
