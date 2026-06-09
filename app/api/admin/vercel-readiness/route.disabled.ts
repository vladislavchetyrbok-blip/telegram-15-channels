import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-auth";
import { getVercelReadinessStatus } from "@/lib/vercel-readiness";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = requireAdminAccess();
  if (!access.allowed) {
    return NextResponse.json({ ok: false, message: "Admin access denied." }, { status: 401 });
  }

  return NextResponse.json(getVercelReadinessStatus());
}
