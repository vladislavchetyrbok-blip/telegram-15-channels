import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = requireAdminAccess();
  if (!access.allowed) {
    return NextResponse.json({ ok: false, message: "Admin access denied." }, { status: 401 });
  }

  // @ts-ignore - Shared read-only Node utility is authored as ESM for CLI reuse.
  const { getActionsSchedulerMonitorReport } = await import("../../../../../scripts/lib/actions-scheduler-monitor.mjs");
  const report = await getActionsSchedulerMonitorReport({ loadEnv: true });

  return NextResponse.json(report, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
