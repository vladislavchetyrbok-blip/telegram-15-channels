import { channelGenerationConfigs } from "@/data/channelGeneration";
import { checkLocalAiConnection, getAiProviderConfig } from "@/lib/ai";
import { getChannelLogoCounters } from "@/lib/channel-logos";
import { listContentPlanItems } from "@/lib/content-plan-store";
import { listEditorialProfiles } from "@/lib/editorial";
import { listDryRunPostLogs, listPostDrafts } from "@/lib/post-draft-store";
import { listPublicationScheduleItems, listPublicationScheduleLogs } from "@/lib/publication-schedule-store";
import { checkTelegramConfig } from "@/lib/telegram";
import { getTelegramRealTestState } from "@/lib/telegram-real-test-state";
import type { ChannelAnalytics, NetworkAnalytics, NetworkHealth, NetworkLog, NetworkLogAction } from "@/types";

interface NetworkAnalyticsStore {
  logs: NetworkLog[];
}

const globalForNetworkAnalytics = globalThis as typeof globalThis & {
  __telegramNetworkAnalyticsStore?: NetworkAnalyticsStore;
};

const store =
  globalForNetworkAnalytics.__telegramNetworkAnalyticsStore ??
  (globalForNetworkAnalytics.__telegramNetworkAnalyticsStore = {
    logs: [],
  });

export function getNetworkAnalytics(): NetworkAnalytics {
  addNetworkLog("analyticsViewed");

  const drafts = listPostDrafts();
  const scheduleItems = listPublicationScheduleItems();
  const contentPlanItems = listContentPlanItems();
  const realTestState = getTelegramRealTestState();
  const profiles = listEditorialProfiles();
  const logoCounters = getChannelLogoCounters();
  const connectedChannels = channelGenerationConfigs.filter(
    (channel) => channel.telegramChatId && channel.botAdded && channel.status === "connected_mock",
  );
  const dryRunPostLogs = listDryRunPostLogs();
  const scheduleLogs = listPublicationScheduleLogs();
  const dryRunLogDates = [
    ...dryRunPostLogs.filter((log) => log.action === "dryRunSent").map((log) => log.timestamp),
    ...scheduleLogs.filter((log) => log.action === "scheduledDryRunSent").map((log) => log.timestamp),
  ];
  const generationDates = drafts.map((draft) => draft.createdAt);

  return {
    channelsTotal: channelGenerationConfigs.length,
    channelsConnected: connectedChannels.length,
    draftsTotal: drafts.length,
    draftsPendingReview: drafts.filter((draft) => draft.status === "pending_review").length,
    draftsApproved: drafts.filter((draft) => draft.status === "approved").length,
    draftsRejected: drafts.filter((draft) => draft.status === "rejected").length,
    scheduledTotal: scheduleItems.filter((item) => item.status === "scheduled" || item.status === "dry_run_ready").length,
    dryRunSentTotal:
      drafts.filter((draft) => draft.status === "dry_run_sent").length +
      scheduleItems.filter((item) => item.status === "dry_run_sent").length,
    realTelegramSentTotal: realTestState.realSendsTotal,
    lastRealSendChannelTitle: realTestState.channelTitle,
    lastRealSendAt: realTestState.lastRealTestSentAt,
    productionBroadcast: realTestState.productionBroadcast,
    dryRunActive: true,
    contentPlanItemsTotal: contentPlanItems.length,
    editorialProfilesTotal: profiles.length,
    logosUploaded: logoCounters.uploadedLogos,
    logosApproved: logoCounters.approvedLogos,
    logosNeedReview: logoCounters.needsReview,
    logosRejected: logoCounters.rejected,
    errorsTotal:
      drafts.filter((draft) => draft.status === "generated_failed" || draft.status === "needs_revision").length +
      scheduleItems.filter((item) => item.status === "cancelled").length,
    lastGeneratedAt: getLatestIso(generationDates),
    lastDryRunAt: getLatestIso(dryRunLogDates),
    mode: "dry-run",
  };
}

export function getChannelAnalytics(): ChannelAnalytics[] {
  addNetworkLog("channelAnalyticsLoaded");

  const drafts = listPostDrafts();
  const scheduleItems = listPublicationScheduleItems();
  const contentPlanItems = listContentPlanItems();
  const realTestState = getTelegramRealTestState();

  return channelGenerationConfigs.map((channel) => {
    const channelDrafts = drafts.filter((draft) => draft.channelId === channel.id);
    const channelSchedule = scheduleItems.filter((item) => item.channelId === channel.id);
    const channelIdeas = contentPlanItems.filter((item) => item.channelId === channel.id);
    const failedGenerations = channelDrafts.filter(
      (draft) => draft.status === "generated_failed" || draft.status === "needs_revision",
    ).length;

    return {
      channelId: channel.id,
      channelTitle: channel.name,
      language: channel.language,
      telegramChatId: channel.telegramChatId,
      botAdded: channel.botAdded,
      status: channel.status,
      draftsTotal: channelDrafts.length,
      approvedDrafts: channelDrafts.filter((draft) => draft.status === "approved").length,
      scheduledPosts: channelSchedule.filter((item) => item.status === "scheduled" || item.status === "dry_run_ready").length,
      dryRunSent:
        channelDrafts.filter((draft) => draft.status === "dry_run_sent").length +
        channelSchedule.filter((item) => item.status === "dry_run_sent").length,
      failedGenerations,
      contentIdeas: channelIdeas.length,
      lastGeneratedAt: getLatestIso(channelDrafts.map((draft) => draft.createdAt)),
      lastScheduledFor: getLatestIso([
        ...channelSchedule.map((item) => item.scheduledFor),
        ...channelDrafts.map((draft) => draft.scheduledFor).filter(Boolean),
      ] as string[]),
      qualityScoreMock: calculateQualityScore(channelDrafts.length, channelDrafts.filter((draft) => draft.status === "approved").length, failedGenerations),
      realTelegramSent: channel.id === realTestState.channelId ? realTestState.realSendsTotal : 0,
    };
  });
}

export async function getNetworkHealth(): Promise<NetworkHealth> {
  addNetworkLog("networkHealthChecked");

  const telegram = checkTelegramConfig();
  const realTestState = getTelegramRealTestState();
  const aiConfig = getAiProviderConfig();
  const ai = await checkLocalAiConnection();
  const drafts = listPostDrafts();
  const scheduleItems = listPublicationScheduleItems();
  const contentPlanItems = listContentPlanItems();
  const profiles = listEditorialProfiles();
  const warnings: string[] = [];

  if (!telegram.tokenPresent) {
    warnings.push("TELEGRAM_BOT_TOKEN is not configured.");
  }

  if (!telegram.dryRun) {
    warnings.push("TELEGRAM_DRY_RUN is disabled. Real sending must stay blocked.");
  }

  if (telegram.channelsTotal !== 15 || telegram.channelsWithChatId !== 15) {
    warnings.push("Not all 15 channels have telegramChatId.");
  }

  if (profiles.length !== 15) {
    warnings.push("Editorial profiles are incomplete.");
  }

  if (!ai.ok) {
    warnings.push("LM Studio is not available.");
  }

  return {
    ok: telegram.ok && telegram.dryRun && telegram.channelsTotal === 15 && telegram.channelsWithChatId === 15 && profiles.length === 15 && ai.ok,
    mode: "dry-run",
    telegramSent: false,
    telegram: {
      tokenPresent: telegram.tokenPresent,
      dryRun: telegram.dryRun,
      channelsTotal: telegram.channelsTotal,
      channelsWithChatId: telegram.channelsWithChatId,
      realSendingEnabled: telegram.realSendingEnabled,
    },
    ai: {
      provider: "lmstudio",
      connected: ai.ok,
      model: ai.models?.[0] ?? aiConfig.model,
      models: ai.models ?? [],
      message: ai.message,
    },
    content: {
      draftsTotal: drafts.length,
      scheduledTotal: scheduleItems.length,
      contentPlanItemsTotal: contentPlanItems.length,
      editorialProfilesTotal: profiles.length,
    },
    safety: {
      telegramSentReal: realTestState.realSendsTotal,
      sendMessageBlockedByDryRun: telegram.dryRun,
    },
    warnings,
    checkedAt: new Date().toISOString(),
  };
}

export async function runFullSystemCheck() {
  addNetworkLog("fullSystemCheck");
  return getNetworkHealth();
}

export function listNetworkLogs() {
  return [...store.logs].sort((left, right) => right.timestamp.localeCompare(left.timestamp));
}

function addNetworkLog(action: NetworkLogAction) {
  store.logs.unshift({
    action,
    telegramSent: false,
    mode: "dry-run",
    timestamp: new Date().toISOString(),
  });
}

function getLatestIso(values: string[]) {
  const normalized = values.filter(Boolean).sort((left, right) => right.localeCompare(left));
  return normalized[0] ?? null;
}

function calculateQualityScore(total: number, approved: number, failed: number) {
  if (total === 0) {
    return 72;
  }

  const score = 76 + approved * 4 - failed * 10 + Math.min(total, 5);
  return Math.max(35, Math.min(98, score));
}
