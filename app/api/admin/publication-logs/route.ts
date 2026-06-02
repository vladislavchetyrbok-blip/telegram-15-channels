import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-auth";
import { getPublicationLogs } from "@/lib/publish-scheduler-status";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const access = requireAdminAccess();
  if (!access.allowed) {
    return NextResponse.json({ ok: false, message: "Admin access denied." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const requestedLimit = Number(searchParams.get("limit") ?? 100);
  const limit = Number.isFinite(requestedLimit) ? Math.min(500, Math.max(1, requestedLimit)) : 100;
  const logs = getPublicationLogs(limit).reverse();

  return NextResponse.json({
    ok: true,
    total: logs.length,
    logs,
  });
}
