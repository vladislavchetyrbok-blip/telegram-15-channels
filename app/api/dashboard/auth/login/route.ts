import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  await request.arrayBuffer().catch(() => null);

  return NextResponse.json(
    {
      ok: false,
      status: "legacy_dashboard_auth_disabled",
      canonicalAuth: "aphrodite_session",
      canonicalLoginPath: "/login",
      message: "Legacy zodiac_dashboard_session auth is disabled. Use the canonical Aphrodite login flow.",
    },
    { status: 410 },
  );
}
