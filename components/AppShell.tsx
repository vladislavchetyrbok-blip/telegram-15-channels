"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { UnifiedStatusStrip } from "@/components/UnifiedStatusStrip";

export const PUBLIC_MINIAPP_ROUTE_PREFIXES = [
  "/miniapp",
  "/compatibility",
  "/birth-matrix",
  "/vip-preview",
  "/vip-compatibility-report",
  "/mystic-numbers",
  "/mystic-cards",
  "/affirmations",
] as const;

export const PUBLIC_WEBSITE_ROUTE_PREFIXES = [
  "/tarot",
  "/zodiac",
  "/privacy",
  "/terms",
] as const;

export function isRouteOrChild(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function isPublicMiniAppRoute(pathname: string) {
  return PUBLIC_MINIAPP_ROUTE_PREFIXES.some((route) => isRouteOrChild(pathname, route));
}

export function isPublicWebsiteRoute(pathname: string) {
  return pathname === "/" || PUBLIC_WEBSITE_ROUTE_PREFIXES.some((route) => isRouteOrChild(pathname, route));
}

export function isDashboardRoute(pathname: string) {
  return isRouteOrChild(pathname, "/dashboard");
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isDashboardLoginRoute = pathname === "/dashboard/login";

  if (isPublicWebsiteRoute(pathname) || isPublicMiniAppRoute(pathname) || isDashboardLoginRoute) {
    return <div className="min-h-screen overflow-x-hidden bg-[#070b14] text-slate-100">{children}</div>;
  }

  const isAphroditeRoute =
    isDashboardRoute(pathname) &&
    (pathname === "/dashboard/networks/aphrodite" ||
      pathname.startsWith("/dashboard/networks/aphrodite/") ||
      pathname === "/dashboard/networks/zodiac" ||
      pathname.startsWith("/dashboard/networks/zodiac/"));

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
