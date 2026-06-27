import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      status: "legacy_dashboard_auth_disabled",
      canonicalAuth: "aphrodite_session",
      canonicalLogoutPath: "/api/auth/logout",
      message: "Legacy zodiac_dashboard_session auth is disabled. Use the canonical Aphrodite logout flow.",
    },
    { status: 410 },
  );
}
