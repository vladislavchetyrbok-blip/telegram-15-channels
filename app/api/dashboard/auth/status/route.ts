import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      ok: false,
      status: "legacy_dashboard_auth_disabled",
      canonicalAuth: "aphrodite_session",
      canonicalCookie: "aphrodite_session",
      canonicalLoginPath: "/login",
      legacyCookie: "zodiac_dashboard_session",
      message: "Legacy zodiac_dashboard_session status is non-authoritative and disabled.",
    },
    { status: 410 },
  );
}
