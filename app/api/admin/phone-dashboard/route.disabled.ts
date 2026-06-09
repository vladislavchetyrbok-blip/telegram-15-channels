import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-auth";
import { getPhoneDashboardStatus } from "@/lib/phone-dashboard";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = requireAdminAccess();
  if (!access.allowed) {
    return NextResponse.json({ ok: false, message: "Admin access denied." }, { status: 401 });
  }

  return NextResponse.json(getPhoneDashboardStatus(), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
