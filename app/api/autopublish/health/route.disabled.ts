import { NextResponse } from "next/server";
import { getAutopublishStatus } from "@/lib/autopublish";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = await getAutopublishStatus();
  const lastError =
    status.todayLog.find((entry) => entry.result === "failed" || entry.result === "blocked")?.error ??
    status.publishLog.find((entry) => entry.result === "failed" || entry.result === "blocked")?.error ??
    null;

  return NextResponse.json({
    autopublishEnabled: status.config.enabled,
    currentMode: status.currentMode,
    workerRunning: status.scheduler.workerRunning,
    schedulerStatus: !status.config.enabled && status.scheduler.status === "stopped" ? "stopped_by_disabled" : status.scheduler.status,
    schedulerLastCheck: status.scheduler.lastCheck,
    schedulerNextCheck: status.scheduler.nextCheck,
    nextPublicationTime: status.nextPublication,
    nextChannel: status.nextChannel,
    nextPost: status.nextPost,
    publishedToday: status.todayPublished,
    failedToday: status.failedToday,
    blockedToday: status.blockedToday,
    skippedToday: status.skippedToday,
    queueHealth: status.queueHealth,
    telegramConnection: status.telegramConnection,
    contentQuality: status.contentQuality,
    lastError,
    updatedAt: new Date().toISOString(),
  });
}
