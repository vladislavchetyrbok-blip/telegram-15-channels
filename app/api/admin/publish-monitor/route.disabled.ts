import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-auth";
import { getPublishMonitorStatus } from "@/lib/publish-monitor";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = requireAdminAccess();
  if (!access.allowed) {
    return NextResponse.json({ ok: false, message: "Admin access denied." }, { status: 401 });
  }

  return NextResponse.json(getPublishMonitorStatus(), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
