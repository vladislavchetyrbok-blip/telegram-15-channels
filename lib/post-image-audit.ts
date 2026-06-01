import { channelGenerationConfigs } from "@/data/channelGeneration";
import { posts } from "@/data/posts";
import {
  ensurePostImageFile,
  getPostImagePath,
  getPostImageStatus,
  getPostReadiness,
  hasWorkingPublicAsset,
  isPostImagePath,
  publicPathToFilePath,
} from "@/lib/post-media";
import { listPostDrafts, repairDraftPostImages } from "@/lib/post-draft-store";
import type { Post, PostDraft, PostImageIssue, PostImageStatus, PostReadinessIssue, PublicationReadinessStatus } from "@/types";

type PostImageKind = "mock_post" | "draft";

export interface PostImageAuditItem {
  id: string;
  channelId: string;
  channelTitle: string;
  title: string;
  kind: PostImageKind;
  imageUrl: string;
  expectedImageUrl: string;
  imageStatus: PostImageStatus;
  imageIssue: PostImageIssue;
  fileExists: boolean;
  browserPath: string;
  fileSystemPath: string;
  text: string;
  postStatus: string;
  normalizedPostStatus: "not_ready" | "ready_for_test";
  imageFields: {
    imageUrl: string;
    image: string | null;
    coverImage: string | null;
    assetPath: string | null;
  };
  imageKind: "post_image" | "channel_asset" | "missing" | "unknown";
  readinessStatus: PublicationReadinessStatus;
  readinessReasons: PostReadinessIssue[];
}

export function auditPostImages() {
  const allItems = getPostImageAuditItems();
  const missing = allItems.filter((item) => item.readinessReasons.includes("missing_post_image"));
  const broken = allItems.filter((item) => item.readinessReasons.includes("broken_image_path") || item.readinessReasons.includes("image_not_found"));
  const invalidChannelAsset = allItems.filter((item) => item.readinessReasons.includes("invalid_post_image_uses_channel_asset"));
  const forbiddenCurrency = allItems.filter((item) => item.readinessReasons.includes("forbidden_currency_detected"));
  const ready = allItems.filter((item) => item.readinessStatus === "ready_for_test");
  const notReady = allItems.filter((item) => item.readinessStatus === "not_ready");

  return {
    ok: notReady.length === 0,
    mode: "dry-run" as const,
    telegramSent: false as const,
    totals: {
      channelsTotal: channelGenerationConfigs.length,
      postsTotal: allItems.length,
      postsWithImages: allItems.filter((item) => item.imageStatus === "OK").length,
      postsWithoutImages: missing.length,
      postsWithBrokenImagePath: broken.length,
      invalidChannelAssetImages: invalidChannelAsset.length,
      forbiddenCurrencyPosts: forbiddenCurrency.length,
      readyForTest: ready.length,
      notReady: notReady.length,
    },
    byChannel: channelGenerationConfigs.map((channel) => {
      const channelItems = allItems.filter((item) => item.channelId === channel.id);
      const sample = channelItems.find((item) => item.imageUrl)?.imageUrl ?? "";
      const channelNotReady = channelItems.filter((item) => item.readinessStatus === "not_ready");

      return {
        channelId: channel.id,
        channelTitle: channel.name,
        postsTotal: channelItems.length,
        postsWithImages: channelItems.filter((item) => item.imageStatus === "OK").length,
        postsWithoutImages: channelItems.filter((item) => item.readinessReasons.includes("missing_post_image")).length,
        postsWithBrokenImagePath: channelItems.filter((item) => item.readinessReasons.includes("broken_image_path") || item.readinessReasons.includes("image_not_found")).length,
        invalidChannelAssetImages: channelItems.filter((item) => item.readinessReasons.includes("invalid_post_image_uses_channel_asset")).length,
        forbiddenCurrencyPosts: channelItems.filter((item) => item.readinessReasons.includes("forbidden_currency_detected")).length,
        readyForTest: channelItems.filter((item) => item.readinessStatus === "ready_for_test").length,
        notReady: channelNotReady.length,
        sampleImagePath: sample,
        sampleFileExists: sample ? hasWorkingPublicAsset(sample) : false,
        imageStatus: channelNotReady.length === 0 ? "OK" : channelItems.some((item) => item.imageStatus === "Path broken") ? "Path broken" : channelItems.some((item) => item.imageStatus === "Invalid") ? "Invalid" : "Missing",
        readinessStatus: channelNotReady.length === 0 ? "ready_for_test" : "not_ready",
        readinessReasons: Array.from(new Set(channelNotReady.flatMap((item) => item.readinessReasons))),
      };
    }),
    items: allItems,
  };
}

export function regenerateMissingPostImages() {
  return repairPostImages({ onlyBroken: false });
}

export function fixBrokenPostImagePaths() {
  return repairPostImages({ onlyBroken: true });
}

function repairPostImages({ onlyBroken }: { onlyBroken: boolean }) {
  const before = getPostImageAuditItems();
  const createdFiles: string[] = [];
  const fixedPaths: Array<{ id: string; from: string; to: string }> = [];

  for (const post of posts) {
    const expectedImageUrl = getPostImagePath(post.channelId, post.id);
    const current = getPostImageStatus(post);

    if (!onlyBroken && (post.imageUrl !== expectedImageUrl || !isPostImagePath(post.imageUrl))) {
      fixedPaths.push({ id: post.id, from: post.imageUrl, to: expectedImageUrl });
      post.imageUrl = expectedImageUrl;
    }

    if ((onlyBroken && current.status === "Path broken") || (!onlyBroken && current.status !== "OK")) {
      const file = ensurePostImageFile({
        channelId: post.channelId,
        postId: post.id,
        title: post.title,
        imageUrl: expectedImageUrl,
      });

      if (file.created) {
        createdFiles.push(file.publicUrl);
      }
    }
  }

  const repairedDrafts = repairDraftPostImages();

  for (const draft of repairedDrafts.drafts) {
    const expectedImageUrl = getPostImagePath(draft.channelId, draft.id);
    const file = ensurePostImageFile({
      channelId: draft.channelId,
      postId: draft.id,
      title: draft.title,
      imageUrl: expectedImageUrl,
    });

    if (file.created) {
      createdFiles.push(file.publicUrl);
    }
  }

  const after = auditPostImages();

  return {
    ok: after.ok,
    mode: "dry-run" as const,
    telegramSent: false as const,
    before: toTotals(before),
    after: after.totals,
    createdFiles,
    fixedPaths,
    repairedDrafts: repairedDrafts.fixed,
    audit: after,
  };
}

function getPostImageAuditItems(): PostImageAuditItem[] {
  return [
    ...posts.map((post) => toAuditItem(post, "mock_post")),
    ...listPostDrafts().map((draft) => toAuditItem(draft, "draft")),
  ];
}

function toAuditItem(post: Post | PostDraft, kind: PostImageKind): PostImageAuditItem {
  const expectedImageUrl = getPostImagePath(post.channelId, post.id);
  const image = getPostImageStatus(post);
  const text = "excerpt" in post ? post.excerpt : post.content;
  const readiness = getPostReadiness({
    id: post.id,
    channelId: post.channelId,
    title: post.title,
    excerpt: "excerpt" in post ? text : undefined,
    content: "content" in post ? text : undefined,
    imageUrl: post.imageUrl,
  });
  const channel = channelGenerationConfigs.find((item) => item.id === post.channelId);
  const normalizedPostStatus = readiness.status === "ready_for_test" ? "ready_for_test" : "not_ready";

  return {
    id: post.id,
    channelId: post.channelId,
    channelTitle: "channelTitle" in post ? post.channelTitle : channel?.name ?? post.channelId,
    title: post.title,
    text,
    postStatus: post.status,
    normalizedPostStatus,
    kind,
    imageUrl: post.imageUrl,
    expectedImageUrl,
    imageFields: {
      imageUrl: post.imageUrl,
      image: null,
      coverImage: null,
      assetPath: null,
    },
    imageKind: !post.imageUrl ? "missing" : isPostImagePath(post.imageUrl) ? "post_image" : "unknown",
    imageStatus: image.status,
    imageIssue: image.issue,
    fileExists: hasWorkingPublicAsset(post.imageUrl),
    browserPath: post.imageUrl,
    fileSystemPath: post.imageUrl ? publicPathToFilePath(post.imageUrl) : "",
    readinessStatus: readiness.status,
    readinessReasons: readiness.reasons.length ? readiness.reasons : ["test_publish_required"],
  };
}

function toTotals(items: PostImageAuditItem[]) {
  return {
    postsTotal: items.length,
    postsWithImages: items.filter((item) => item.imageStatus === "OK").length,
    postsWithoutImages: items.filter((item) => item.readinessReasons.includes("missing_post_image")).length,
    postsWithBrokenImagePath: items.filter((item) => item.readinessReasons.includes("broken_image_path") || item.readinessReasons.includes("image_not_found")).length,
    readyForTest: items.filter((item) => item.readinessStatus === "ready_for_test").length,
    notReady: items.filter((item) => item.readinessStatus === "not_ready").length,
  };
}
