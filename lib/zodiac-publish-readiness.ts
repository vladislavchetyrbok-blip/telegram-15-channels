import { zodiacChannelConnections } from "@/data/zodiacChannelConnections";
import { generateZodiacWeeklyPlan } from "./zodiac-weekly-plan";

export interface ChannelReadiness {
  channelId: string;
  displayName: string;
  ready: boolean;
  missingFields: string[];
  issues: string[];
  nextAction: string | null;
}

export interface ZodiacPublishReadinessReport {
  ready: boolean;
  blockingIssues: string[];
  warnings: string[];
  nextActions: string[];
  summary: {
    totalChannels: number;
    connectedChannels: number;
    publishReadyChannels: number;
    totalPosts: number;
    postsPassingQuality: number;
    postsNeedingReview: number;
  };
  channelReadiness: ChannelReadiness[];
}

export function getZodiacPublishReadinessReport(): ZodiacPublishReadinessReport {
  const blockingIssues: string[] = [];
  const warnings: string[] = [];
  const nextActions: string[] = [];
  const channelReadiness: ChannelReadiness[] = [];

  let connectedChannels = 0;
  let publishReadyChannels = 0;

  // 1. Channel Connections Check
  for (const conn of zodiacChannelConnections) {
    const missingFields: string[] = [];
    const issues: string[] = [];
    let ready = true;
    let nextAction: string | null = null;

    if (!conn.actualUsername) missingFields.push("actualUsername");
    if (!conn.publicLink) missingFields.push("publicLink");
    if (!conn.telegramChannelId) missingFields.push("telegramChannelId");
    
    if (conn.creationStatus !== "created") {
      issues.push("Channel not created");
    }
    if (conn.botAdminStatus !== "admin_added") {
      issues.push("Bot admin not added");
    }

    if (missingFields.length > 0 || issues.length > 0) {
      ready = false;
      if (conn.creationStatus !== "created") {
        nextAction = "Create channel in Telegram";
      } else if (conn.botAdminStatus !== "admin_added") {
        nextAction = "Add bot as Admin";
      } else {
        nextAction = "Fill missing connection fields in data config";
      }
    } else {
      connectedChannels++;
    }

    if (conn.publishStatus === "publish_ready") {
      publishReadyChannels++;
    } else if (ready) {
      issues.push("Publish status not set to ready");
      ready = false;
      if (!nextAction) nextAction = "Set publishStatus to 'publish_ready'";
    }

    channelReadiness.push({
      channelId: conn.id,
      displayName: conn.displayName,
      ready,
      missingFields,
      issues,
      nextAction,
    });
  }

  if (zodiacChannelConnections.length !== 13) {
    blockingIssues.push(`Expected 13 channels, found ${zodiacChannelConnections.length}`);
  }
  if (publishReadyChannels !== 13) {
    blockingIssues.push(`${13 - publishReadyChannels} channels are not marked as publish_ready.`);
    nextActions.push("Connect all channels and set them to publish_ready.");
  }

  // 2. Content Generation Check (Dry Run 1 day to verify posts)
  const todayStr = new Date().toISOString().slice(0, 10);
  const weeklyPlan = generateZodiacWeeklyPlan(todayStr);

  let totalPosts = weeklyPlan.summary.totalPosts;
  let postsNeedingReview = weeklyPlan.summary.postsNeedingReview;
  let postsPassingQuality = totalPosts - postsNeedingReview;

  if (totalPosts === 0) {
    blockingIssues.push("Zero posts generated for the upcoming week.");
  }
  if (postsNeedingReview > 0) {
    warnings.push(`${postsNeedingReview} posts require editorial review (quality score < 70 or safety issues).`);
    nextActions.push("Review daily preview for posts failing quality check.");
  }

  // 3. System check
  const ready = blockingIssues.length === 0;

  return {
    ready,
    blockingIssues,
    warnings,
    nextActions,
    summary: {
      totalChannels: zodiacChannelConnections.length,
      connectedChannels,
      publishReadyChannels,
      totalPosts,
      postsPassingQuality,
      postsNeedingReview,
    },
    channelReadiness,
  };
}
