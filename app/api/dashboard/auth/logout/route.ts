import { NextResponse } from "next/server";
import { clearDashboardSessionCookie, getDashboardAuthStatus } from "@/lib/zodiac-dashboard-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const sessionCookie = clearDashboardSessionCookie();
  const status = getDashboardAuthStatus();
  const response = NextResponse.json({
    ok: true,
    authEnabled: status.authEnabled,
    configured: status.configured,
    authenticated: false,
  });

  response.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.options);
  return response;
}
