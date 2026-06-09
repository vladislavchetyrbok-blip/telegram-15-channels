import { NextResponse } from "next/server";
import { clearAdminSessionCookie, isAdminAuthEnabled } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({
    ok: true,
    authEnabled: isAdminAuthEnabled(),
    authenticated: false,
  });
  const sessionCookie = clearAdminSessionCookie();
  response.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.options);
  return response;
}
