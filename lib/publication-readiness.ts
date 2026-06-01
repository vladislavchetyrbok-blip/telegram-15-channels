import { channelGenerationConfigs } from "@/data/channelGeneration";
import { channels } from "@/data/channels";
import { posts } from "@/data/posts";
import { getChannelLogoDisplayState } from "@/lib/custom-logos";
import { validateCurrencyPolicy } from "@/lib/currency-policy";
import { getChannelAssetPaths, getPostImageStatus, getPostReadiness, hasWorkingPublicAsset, missingPostImageMessage } from "@/lib/post-media";
import { listPostDrafts } from "@/lib/post-draft-store";
import { checkTelegramConfig } from "@/lib/telegram";
import { getTelegramAvatarAudit } from "@/lib/telegram-avatar-status";
import { getLastTelegramAccessDiagnostics } from "@/lib/telegram-diagnostics";
import { listTelegramTargetBindings } from "@/lib/telegram-target-store";
import { getTextQualityStatus } from "@/lib/text-quality";
import { getWeeklyContentPlanState } from "@/lib/weekly-content-plan";

export function getPublicationReadinessState() {
  const drafts = listPostDrafts();
  const telegram = checkTelegramConfig();
  const telegramAvatarAudit = getTelegramAvatarAudit();
  const weeklyState = getWeeklyContentPlanState();
  const targetBindings = listTelegramTargetBindings();
  const lastAccess = getLastTelegramAccessDiagnostics();
  const channelCards = channelGenerationConfigs.map((channel) => {
    const publicChannel = channels.find((item) => item.id === channel.id);
    const platformLogo = getChannelLogoDisplayState(channel.id);
    const assets = getChannelAssetPaths(channel.id);
    const logoOk = hasWorkingPublicAsset(assets.logo);
    const iconOk = hasWorkingPublicAsset(assets.icon);
    const previewOk = hasWorkingPublicAsset(assets.preview);
    const weeklyPosts = weeklyState.items
      .filter((item) => item.channelId === channel.id && (item.status === "ready_to_publish" || item.status === "scheduled"))
      .map((item) => ({
        id: item.postId,
        channelId: item.channelId,
        title: item.title,
        excerpt: item.body,
        content: item.body,
        imageUrl: item.imageUrl,
        status: item.status,
      }));
    const legacyPosts = [
      ...posts.filter((post) => post.channelId === channel.id),
      ...drafts.filter((draft) => draft.channelId === channel.id),
    ].filter((post) => {
      const text = "content" in post ? post.content : [post.title, post.excerpt].join("\n");
      return /test post|failed first draft|local-model|mock text|draft placeholder/i.test(text);
    });
    const channelPosts = weeklyPosts.length ? weeklyPosts : legacyPosts;
    const postReadiness = channelPosts.map((post) =>
      getPostReadiness({
        id: post.id,
        channelId: post.channelId,
        title: post.title,
        excerpt: "excerpt" in post ? post.excerpt : undefined,
        content: "content" in post ? post.content : undefined,
        imageUrl: post.imageUrl,
      }),
    );
    const postImageStatuses = channelPosts.map((post) => getPostImageStatus(post));
    const postsWithoutImages = postReadiness.filter((item) => item.reasons.includes("missing_post_image")).length;
    const postsWithBrokenImagePath = postReadiness.filter((item) => item.reasons.includes("broken_image_path")).length;
    const postsWithInvalidChannelAssetImage = postReadiness.filter((item) => item.reasons.includes("invalid_post_image_uses_channel_asset")).length;
    const postsWithForbiddenCurrency = postReadiness.filter((item) => item.reasons.includes("forbidden_currency_detected")).length;
    const postsReadyForTest = postReadiness.filter((item) => item.status === "ready_for_test").length;
    const postsNotReady = postReadiness.filter((item) => item.status === "not_ready").length;
    const postsWithImages = postImageStatuses.filter((image) => image.status === "OK").length;
    const sampleImagePath = channelPosts.find((post) => post.imageUrl)?.imageUrl ?? "";
    const targetBinding = targetBindings.find((item) => item.channelId === channel.id);
    const accessCheck = lastAccess?.checks.find((item) => item.channelId === channel.id);
    const hasTelegramChannelConfig = Boolean(targetBinding?.telegramTarget);
    const textViolations = channelPosts.filter((post) => {
      const text = "content" in post ? post.content : [post.title, post.excerpt].join("\n");

      return !validateCurrencyPolicy(text).ok;
    }).length;
    const textQuality = channelPosts.map((post) =>
      getTextQualityStatus({
        title: post.title,
        text: "content" in post ? post.content : post.excerpt,
        status: post.status,
      }),
    );
    const brokenText = textQuality.filter((status) => status === "BROKEN TEXT").length;
    const failedGeneration = textQuality.filter((status) => status === "FAILED GENERATION").length;
    const ready = Boolean(
      channel.name &&
        channel.topic &&
        publicChannel?.description &&
        postsTotalIsEnough(channelPosts.length) &&
        postsWithoutImages === 0 &&
        postsWithBrokenImagePath === 0 &&
        postsWithInvalidChannelAssetImage === 0 &&
        postsWithForbiddenCurrency === 0 &&
        postsNotReady === 0 &&
        textViolations === 0 &&
        brokenText === 0 &&
        failedGeneration === 0 &&
        hasTelegramChannelConfig
    );

    return {
      channelId: channel.id,
      channelTitle: channel.name,
      description: publicChannel?.description ?? channel.postStyle,
      topic: channel.topic,
      language: channel.language,
      logoPath: assets.logo,
      platformLogoUrl: platformLogo.currentLogoUrl,
      platformLogoSource: platformLogo.logoSource,
      platformLogoStatus: platformLogo.fileStatus,
      telegramAvatarStatus: platformLogo.telegramAvatarStatus,
      telegramAvatarLabel: platformLogo.telegramAvatarLabel,
      iconPath: assets.icon,
      previewPath: assets.preview,
      logoOk,
      iconOk,
      previewOk,
      postsTotal: channelPosts.length,
      postsWithImages,
      postsWithoutImages,
      postsWithBrokenImagePath,
      postsWithInvalidChannelAssetImage,
      postsWithForbiddenCurrency,
      postsReadyForTest,
      postsNotReady,
      hasTelegramChannelConfig,
      sampleImagePath,
      sampleFileExists: sampleImagePath ? hasWorkingPublicAsset(sampleImagePath) : false,
      postImageStatus: postsWithInvalidChannelAssetImage > 0 ? "Invalid" : postsWithoutImages > 0 ? "Missing" : postsWithBrokenImagePath > 0 ? "Path broken" : "OK",
      textViolations,
      brokenText,
      failedGeneration,
      status: ready ? "ready_for_test" : "not_ready",
      readinessReasons: buildReadinessReasons({
        hasDescription: Boolean(publicChannel?.description),
        hasTopic: Boolean(channel.topic),
        postsWithoutImages,
        postsWithBrokenImagePath,
        postsWithInvalidChannelAssetImage,
        postsWithForbiddenCurrency,
        postsNotReady,
        textViolations,
        brokenText,
        failedGeneration,
        postsTotal: channelPosts.length,
        hasTelegramChannelConfig,
        botAccessOk: accessCheck?.accessStatus === "OK",
      }),
    };
  });

  const postImageBlockers = channelCards.reduce(
    (sum, channel) => sum + channel.postsWithoutImages + channel.postsWithBrokenImagePath + channel.postsWithInvalidChannelAssetImage,
    0,
  );
  const textQualityBlockers = channelCards.reduce((sum, channel) => sum + channel.brokenText + channel.failedGeneration + channel.postsNotReady, 0);
  const forbiddenCurrencyBlockers = channelCards.reduce((sum, channel) => sum + channel.postsWithForbiddenCurrency + channel.textViolations, 0);
  const linkedTargets = targetBindings.filter((target) => Boolean(target.telegramTarget)).length;
  const telegramConnectionBlockers = telegram.tokenPresent && linkedTargets > 0 ? 0 : 1;
  const channelsReady = channelCards.filter((channel) => channel.status === "ready_for_test").length;
  const channelsBlocked = channelCards.length - channelsReady;
  const testPublishBlockers = channelsBlocked;
  const realPublishPermissionBlockers = 1;
  const totalBlockingIssues =
    postImageBlockers +
    textQualityBlockers +
    forbiddenCurrencyBlockers +
    telegramConnectionBlockers +
    testPublishBlockers +
    realPublishPermissionBlockers;

  return {
    ok: channelCards.every((channel) => channel.status === "ready_for_test"),
    mode: "dry-run" as const,
    telegramSent: false as const,
    dryRun: telegram.dryRun,
    realSendingEnabled: telegram.realSendingEnabled,
    realSendsTotal: telegram.realSendsTotal,
    counters: {
      channelsTotal: channelCards.length,
      telegramAvatarsManualConfigured: telegramAvatarAudit.manualConfigured,
      telegramAvatarsUnknown: telegramAvatarAudit.unknown,
      platformLogosCustom: channelCards.filter((channel) => channel.platformLogoSource === "custom").length,
      platformLogosGenerated: channelCards.filter((channel) => channel.platformLogoSource === "generated").length,
      platformLogosMissing: channelCards.filter((channel) => channel.platformLogoStatus === "missing").length,
      readyForTest: channelsReady,
      notReady: channelsBlocked,
      channelsBlocked,
      postsWithoutImages: channelCards.reduce((sum, channel) => sum + channel.postsWithoutImages, 0),
      postsWithImages: channelCards.reduce((sum, channel) => sum + channel.postsWithImages, 0),
      postsWithBrokenImagePath: channelCards.reduce((sum, channel) => sum + channel.postsWithBrokenImagePath, 0),
      postsWithInvalidChannelAssetImage: channelCards.reduce((sum, channel) => sum + channel.postsWithInvalidChannelAssetImage, 0),
      postsWithForbiddenCurrency: channelCards.reduce((sum, channel) => sum + channel.postsWithForbiddenCurrency, 0),
      postsReadyForTest: channelCards.reduce((sum, channel) => sum + channel.postsReadyForTest, 0),
      postsNotReady: channelCards.reduce((sum, channel) => sum + channel.postsNotReady, 0),
      postsTotal: channelCards.reduce((sum, channel) => sum + channel.postsTotal, 0),
      textOk: channelCards.reduce((sum, channel) => sum + channel.postsTotal - channel.brokenText - channel.failedGeneration, 0),
      brokenText: channelCards.reduce((sum, channel) => sum + channel.brokenText, 0),
      failedGeneration: channelCards.reduce((sum, channel) => sum + channel.failedGeneration, 0),
      blockedFromPublish: totalBlockingIssues,
      telegramConnectionOk: Boolean(telegram.tokenPresent && linkedTargets > 0),
      testPublishReady: channelsReady === channelCards.length,
      realPublishAllowed: false,
      blockers: {
        postImages: postImageBlockers,
        textQuality: textQualityBlockers,
        forbiddenCurrency: forbiddenCurrencyBlockers,
        telegramConnection: telegramConnectionBlockers,
        testPublishStatus: testPublishBlockers,
        realPublishPermission: realPublishPermissionBlockers,
      },
      brokenAssetLinks: channelCards.reduce(
        (sum, channel) => sum + [channel.logoOk, channel.iconOk, channel.previewOk].filter((ok) => !ok).length,
        0,
      ),
      realSendsTotal: telegram.realSendsTotal,
    },
    channels: channelCards,
  };
}

export function runPublicationReadinessTest(channelId: string) {
  const state = getPublicationReadinessState();
  const channel = state.channels.find((item) => item.channelId === channelId);

  if (!channel) {
    return {
      ok: false,
      mode: "dry-run" as const,
      telegramSent: false as const,
      status: "not_ready" as const,
      error: "Channel was not found.",
    };
  }

  if (
    channel.postsWithoutImages > 0 ||
    channel.postsWithBrokenImagePath > 0 ||
    channel.postsWithInvalidChannelAssetImage > 0 ||
    channel.postsWithForbiddenCurrency > 0 ||
    channel.postsNotReady > 0
  ) {
    return {
      ok: false,
      mode: "dry-run" as const,
      telegramSent: false as const,
      status: "not_ready" as const,
      channel,
      error: missingPostImageMessage,
    };
  }

  if (channel.status !== "ready_for_test") {
    return {
      ok: false,
      mode: "dry-run" as const,
      telegramSent: false as const,
      status: "not_ready" as const,
      channel,
      error: channel.readinessReasons.join(" ") || "Channel is not ready for test publication.",
    };
  }

  return {
    ok: true,
    mode: "dry-run" as const,
    telegramSent: false as const,
    status: "test_published" as const,
    channel,
    message: "Тестовая публикация проверена в dry-run. Реальная отправка не выполнялась.",
  };
}

function buildReadinessReasons({
  hasDescription,
  hasTopic,
  postsWithoutImages,
  postsWithBrokenImagePath,
  postsWithInvalidChannelAssetImage,
  postsWithForbiddenCurrency,
  postsNotReady,
  textViolations,
  brokenText,
  failedGeneration,
  postsTotal,
  hasTelegramChannelConfig,
  botAccessOk,
}: {
  hasDescription: boolean;
  hasTopic: boolean;
  postsWithoutImages: number;
  postsWithBrokenImagePath: number;
  postsWithInvalidChannelAssetImage: number;
  postsWithForbiddenCurrency: number;
  postsNotReady: number;
  textViolations: number;
  brokenText: number;
  failedGeneration: number;
  postsTotal: number;
  hasTelegramChannelConfig: boolean;
  botAccessOk: boolean;
}) {
  const reasons: string[] = [];

  if (!hasDescription) reasons.push("description missing");
  if (!hasTopic) reasons.push("topic missing");
  if (!postsTotalIsEnough(postsTotal)) reasons.push("At least 1 ready post with a post image is required");
  if (!hasTelegramChannelConfig) reasons.push("Telegram token/chat configuration is incomplete");
  if (hasTelegramChannelConfig && !botAccessOk) reasons.push("Telegram access not checked or blocked for this channel");
  if (postsWithoutImages > 0) reasons.push(missingPostImageMessage);
  if (postsWithBrokenImagePath > 0) reasons.push("broken_post_image_path");
  if (postsWithInvalidChannelAssetImage > 0) reasons.push("invalid_post_image_uses_channel_asset");
  if (postsWithForbiddenCurrency > 0) reasons.push("forbidden_currency_detected");
  if (postsNotReady > 0) reasons.push("Some posts are not ready");
  if (textViolations > 0) reasons.push("CurrencyPolicy violation");
  if (brokenText > 0) reasons.push("invalid_text_encoding");
  if (failedGeneration > 0) reasons.push("Failed generation");

  return reasons;
}

function postsTotalIsEnough(postsTotal: number) {
  return postsTotal >= 1;
}
