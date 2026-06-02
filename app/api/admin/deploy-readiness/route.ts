import { NextResponse } from "next/server";
import { requireAdminAccessPlaceholder } from "@/lib/admin-auth";
import { getDeployReadinessStatus } from "@/lib/deploy-readiness";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = requireAdminAccessPlaceholder();
  if (!access.allowed) {
    return NextResponse.json({ ok: false, message: "Admin access denied." }, { status: 401 });
  }

  return NextResponse.json(getDeployReadinessStatus());
}
