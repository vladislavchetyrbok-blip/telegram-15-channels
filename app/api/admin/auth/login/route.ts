import { NextResponse } from "next/server";
import { canCreateAdminSession, createAdminSessionCookie, isAdminAuthEnabled, verifyAdminPassword } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const authEnabled = isAdminAuthEnabled();
  if (!authEnabled) {
    return NextResponse.json({ ok: true, authEnabled, authenticated: true });
  }

  const body = await request.json().catch(() => ({}));
  const password = typeof body.password === "string" ? body.password : "";

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ ok: false, authEnabled, authenticated: false, message: "Invalid admin password." }, { status: 401 });
  }

  if (!canCreateAdminSession()) {
    return NextResponse.json({ ok: false, authEnabled, authenticated: false, message: "Admin session secret is not configured." }, { status: 500 });
  }

  const sessionCookie = createAdminSessionCookie();
  const response = NextResponse.json({ ok: true, authEnabled, authenticated: true });
  response.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.options);
  return response;
}
