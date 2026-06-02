"use client";

import { LogOut } from "lucide-react";

export function AdminLogoutButton() {
  async function logout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  return (
    <button type="button" onClick={() => void logout()} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-line bg-slate-950/70 px-3 text-xs font-semibold text-slate-200 transition hover:border-cyan-300/40 hover:text-cyan-100">
      <LogOut className="h-4 w-4" />
      Выйти
    </button>
  );
}
