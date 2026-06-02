import { NextResponse } from "next/server";
import { getAdminAuthStatus } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = getAdminAuthStatus();
  return NextResponse.json({
    authEnabled: status.authEnabled,
    authenticated: status.authenticated,
  });
}
