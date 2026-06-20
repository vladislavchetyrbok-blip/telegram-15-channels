import { NextResponse } from "next/server";
import { getDashboardAuthStatus } from "@/lib/zodiac-dashboard-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const status = getDashboardAuthStatus();

  return NextResponse.json({
    ok: true,
    authEnabled: status.authEnabled,
    configured: status.configured,
    authenticated: status.authenticated,
    passwordHashConfigured: status.passwordHashConfigured,
    sessionSecretConfigured: status.sessionSecretConfigured,
    sessionCookie: status.sessionCookie,
  });
}
