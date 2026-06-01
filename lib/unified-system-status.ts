import { getAutopublishStatus } from "@/lib/autopublish";
import { getLastTelegramAccessDiagnostics } from "@/lib/telegram-diagnostics";
import { getTelegramConfig } from "@/lib/telegram";
import { listTelegramTargetBindings } from "@/lib/telegram-target-store";
import { getTelegramRealTestState } from "@/lib/telegram-real-test-state";
import { getWeeklyContentPlanState } from "@/lib/weekly-content-plan";
import { getPublicationScheduleState } from "@/lib/publication-schedule-store";

export async function getUnifiedSystemStatus() {
  const [autopublish, weeklyPlan] = await Promise.all([
    getAutopublishStatus(),
    Promise.resolve(getWeeklyContentPlanState()),
  ]);
  const telegramConfig = getTelegramConfig();
  const access = getLastTelegramAccessDiagnostics();
  const targets = listTelegramTargetBindings();
  const realTest = getTelegramRealTestState();
  const schedule = getPublicationScheduleState();
  const lastTelegramError =
    access?.checks.find((check) => check.accessStatus !== "OK")?.exactError ??
    access?.exactError ??
    autopublish.publishLog.find((entry) => entry.result === "failed" || entry.result === "blocked")?.error ??
    null;

  return {
    channelsTotal: 15,
    telegram: {
      tokenConfigured: telegramConfig.tokenStatus === "configured",
      getMeOk: access?.getMeOk ?? false,
      botUsername: access?.botUsername ?? null,
      targetsLinked: targets.filter((target) => Boolean(target.telegramTarget)).length,
      chatFound: access?.chatFound ?? 0,
      botAdmin: access?.botAdmin ?? 0,
      canPost: access?.canPost ?? 0,
      botAccessOk: access?.accessOk ?? autopublish.botAccessOk,
      mode: telegramConfig.dryRun ? "dry-run" : "real-test",
      productionEnabled: telegramConfig.realPublishEnabled,
      realSendsTotal: realTest.realSendsTotal,
      lastRealSend: realTest.lastRealTestSentAt ?? null,
      lastError: lastTelegramError,
    },
    autopublish: {
      enabled: autopublish.config.enabled,
      currentMode: autopublish.currentMode,
      schedulerStatus: autopublish.scheduler.status,
      workerRunning: autopublish.scheduler.workerRunning,
      lastCheck: autopublish.scheduler.lastCheck,
      nextCheck: autopublish.scheduler.nextCheck,
      nextPublicationTime: autopublish.nextPublication,
      nextChannel: autopublish.nextChannel,
      nextPost: autopublish.nextPost,
      publishedToday: autopublish.todayPublished,
      failedToday: autopublish.failedToday,
      blockedToday: autopublish.blockedToday,
      skippedToday: autopublish.skippedToday,
      queueHealth: autopublish.queueHealth,
      telegramConnection: autopublish.telegramConnection,
      contentQuality: autopublish.contentQuality,
    },
    content: {
      weeklyPlanTotal: weeklyPlan.summary.total,
      readyToPublish: weeklyPlan.summary.readyToPublish,
      scheduled: weeklyPlan.summary.scheduled + schedule.counters.scheduled,
      published: weeklyPlan.summary.published,
      blocked: weeklyPlan.summary.blocked,
      weakText: weeklyPlan.summary.weakText,
      weakImage: weeklyPlan.summary.weakImage,
      telegramImagesOk: weeklyPlan.summary.telegramImageStatusOk,
      legacyTestPublishable: weeklyPlan.items.filter((item) => item.qualityIssues.includes("legacy_test")).length,
    },
    nonBlockers: {
      logos: "not blocking",
      statistics: "not blocking",
    },
    updatedAt: new Date().toISOString(),
  };
}
