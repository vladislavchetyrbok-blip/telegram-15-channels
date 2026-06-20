import { NextResponse } from "next/server";
import {
  createDashboardSessionCookie,
  isDashboardAuthConfigured,
  isDashboardAuthEnabled,
  sanitizeDashboardNextPath,
  verifyDashboardPassword,
} from "@/lib/zodiac-dashboard-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const authEnabled = isDashboardAuthEnabled();
  const configured = isDashboardAuthConfigured();
  const body = await readLoginBody(request);
  const redirectTo = sanitizeDashboardNextPath(body.next);

  if (!authEnabled) {
    return NextResponse.json({ ok: true, authEnabled, configured, authenticated: true, redirectTo });
  }

  if (!configured) {
    return NextResponse.json(
      {
        ok: false,
        authEnabled,
        configured,
        authenticated: false,
        message: "Dashboard auth is enabled but password hash or session secret is missing.",
      },
      { status: 503 },
    );
  }

  if (!verifyDashboardPassword(body.password)) {
    return NextResponse.json(
      {
        ok: false,
        authEnabled,
        configured,
        authenticated: false,
        message: "Invalid passcode.",
      },
      { status: 401 },
    );
  }

  const sessionCookie = createDashboardSessionCookie();
  const response = NextResponse.json({ ok: true, authEnabled, configured, authenticated: true, redirectTo });
  response.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.options);
  return response;
}

async function readLoginBody(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const payload = (await request.json()) as { password?: unknown; next?: unknown };
      return {
        password: typeof payload.password === "string" ? payload.password : "",
        next: typeof payload.next === "string" ? payload.next : "",
      };
    }

    const formData = await request.formData();
    return {
      password: String(formData.get("password") ?? ""),
      next: String(formData.get("next") ?? ""),
    };
  } catch {
    return { password: "", next: "" };
  }
}
