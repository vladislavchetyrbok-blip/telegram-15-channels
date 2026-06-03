import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin-auth";
import { getScheduledAutopublishStatus } from "@/lib/autopublish";
import { getAdminReportsStatus } from "@/lib/admin-reports";

export const dynamic = "force-dynamic";

export async function GET() {
  const access = requireAdminAccess();
  if (!access.allowed) {
    return NextResponse.json({ ok: false, message: "Admin access denied." }, { status: 401 });
  }

  const status = await getScheduledAutopublishStatus();

  return NextResponse.json(
    {
      ok: status.ok,
      autopublish: {
        enabled: status.enabled,
        paused: status.paused,
        pausedReason: status.pausedReason,
        workerRunning: status.workerRunning,
        activeChannels: status.activeChannels,
        totalChannels: status.totalChannels,
        publishedToday: status.publishedToday,
        waitingToday: status.waitingToday,
        errorsLast24h: status.errorsLast24h,
        nextPublication: status.nextPublication,
      },
      protectionMode: status.protectionMode,
      adminReports: getAdminReportsStatus(),
      lastDailyReportAt: status.lastDailyReportAt,
      lastWorkerHeartbeatAt: status.lastWorkerHeartbeatAt,
      errorCounters: status.errorCounters,
      dailyStats: status.dailyStats,
      checkedAt: status.checkedAt,
    },
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    },
  );
}
