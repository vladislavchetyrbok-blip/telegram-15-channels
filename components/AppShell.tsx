"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { UnifiedStatusStrip } from "@/components/UnifiedStatusStrip";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPublicCompatibilityRoute = pathname === "/compatibility" || pathname.startsWith("/compatibility/");
  const isDashboardLoginRoute = pathname === "/dashboard/login";

  if (isPublicCompatibilityRoute) {
    return <div className="min-h-screen overflow-x-hidden bg-[#070b14] text-slate-100">{children}</div>;
  }

  if (isDashboardLoginRoute) {
    return <div className="min-h-screen overflow-x-hidden bg-[#070b14] text-slate-100">{children}</div>;
  }

  const isAphroditeRoute = pathname === "/dashboard/networks/aphrodite" || pathname.startsWith("/dashboard/networks/aphrodite/");

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#070b14] text-slate-100 grid-surface">
      <Sidebar />
      <div className="min-h-screen min-w-0 lg:pl-72">
        {!isAphroditeRoute && (
          <>
            <Header />
            <UnifiedStatusStrip />
          </>
        )}
        <main className="min-w-0 overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
