import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { getChannelGenerationConfig } from "@/data/channelGeneration";
import { validateCurrencyPolicy } from "@/lib/currency-policy";
import { buildPostVisualPng } from "@/lib/post-visual-generator";
import { hasBrokenText } from "@/lib/text-quality";
import type {
  Post,
  PostDraft,
  PostImageIssue,
  PostImageStatus,
  PostReadinessIssue,
  PublicationReadinessStatus,
} from "@/types";

export const missingPostImageMessage = "Post is not ready: missing post image";

type PostMediaInput = Pick<Post | PostDraft, "id" | "channelId" | "title"> & {
  excerpt?: string;
  content?: string;
  imageUrl?: string;
  imageCaption?: string;
  imageStatus?: PostImageStatus;
  imageIssue?: PostImageIssue;
  readinessReasons?: PostReadinessIssue[];
  readinessStatus?: PublicationReadinessStatus;
  status?: Post["status"] | PostDraft["status"];
};

export const channelPostImageFolders: Record<string, string> = {
  "money-opportunities": "01-money-opportunities",
  "ai-tech": "02-ai-technologies",
  "ukraine-market": "03-ukraine-opportunities-market",
  "mens-style": "04-men-style-things",
  "home-tech": "05-home-tech",
  "fishing-rest": "06-fishing-rest",
  "dnipro-city": "07-dnipro-city",
  "auto-comfort": "08-auto-comfort",
  "business-ideas": "09-business-ideas",
  "personal-progress": "10-personal-progress",
  "dnipro-real-estate-ru": "11-dnipro-real-estate-ru",
  "dnipro-real-estate-ua": "12-dnipro-real-estate-ua",
  "commercial-real-estate": "13-commercial-real-estate",
  "land-houses": "14-land-houses",
  "real-estate-investments": "15-real-estate-investments",
};

export function getChannelAssetPaths(channelId: string) {
  const base = `/assets/channels/${channelId}`;

  return {
    logo: `${base}/logo.svg`,
    icon: `${base}/icon.svg`,
    preview: `${base}/preview.svg`,
  };
}

export function getPostImagePath(channelId: string, postId: string) {
  const folder = channelPostImageFolders[channelId] ?? channelId;

  return `/assets/posts/${folder}/${getPostImageFileName(postId)}`;
}

export function getDefaultPostImageForChannel(channelId: string, postId = "draft") {
  return getPostImagePath(channelId, postId);
}

export function getDefaultPostImageCaption(channelId: string) {
  const channel = getChannelGenerationConfig(channelId);

  return channel ? `${channel.name}: post image` : "Post image";
}

export function hasWorkingPublicAsset(publicPath: string) {
  if (!publicPath || !publicPath.startsWith("/")) {
    return false;
  }

  return existsSync(publicPathToFilePath(publicPath));
}

export function isPostImagePath(publicPath?: string) {
  return Boolean(publicPath?.startsWith("/assets/posts/") || publicPath?.startsWith("/assets/telegram-posts/"));
}

export function isChannelAssetImagePath(publicPath?: string) {
  return Boolean(publicPath?.startsWith("/assets/channels/") || /\/(logo|icon|preview)\.svg$/i.test(publicPath ?? ""));
}

export function getPostImageStatus(post: Pick<PostMediaInput, "imageUrl">): {
  status: PostImageStatus;
  issue: PostImageIssue;
} {
  if (isChannelAssetImagePath(post.imageUrl)) {
    return { status: "Invalid", issue: "invalid_post_image_uses_channel_asset" };
  }

  if (!post.imageUrl?.trim() || !isPostImagePath(post.imageUrl)) {
    return { status: "Missing", issue: "missing_post_image" };
  }

  if (!hasWorkingPublicAsset(post.imageUrl)) {
    return { status: "Path broken", issue: "broken_image_path" };
  }

  return { status: "OK", issue: null };
}

export function getPostReadiness(post: PostMediaInput) {
  const reasons: PostReadinessIssue[] = [];
  const image = getPostImageStatus(post);
  const text = getPostText(post);

  if (!post.channelId?.trim()) reasons.push("missing_channel");
  if (!post.title?.trim()) reasons.push("missing_title");
  if (!text.trim()) reasons.push("missing_text");
  if (image.issue) reasons.push(image.issue);
  if (image.issue === "broken_image_path") reasons.push("image_not_found");
  if (!validateCurrencyPolicy([post.title, text].join("\n")).ok) reasons.push("forbidden_currency_detected");
  if (hasBrokenText([post.title, text].join("\n"))) reasons.push("mojibake_detected");

  return {
    status: (reasons.length ? "not_ready" : "ready_for_test") as PublicationReadinessStatus,
    reasons,
    imageStatus: image.status,
    imageIssue: image.issue,
  };
}

export function ensureDraftMedia(draft: PostDraft): PostDraft {
  const repaired = ensurePostImageForItem(draft);

  Object.assign(draft, repaired);
  return draft;
}

export function ensurePostImageForItem<T extends PostMediaInput>(item: T): T {
  const imageUrl = isPostImagePath(item.imageUrl) ? item.imageUrl : getPostImagePath(item.channelId, item.id);
  ensurePostImageFile({
    channelId: item.channelId,
    postId: item.id,
    title: item.title,
    imageUrl,
  });

  item.imageUrl = imageUrl;
  item.imageCaption = item.imageCaption || getDefaultPostImageCaption(item.channelId);

  const readiness = getPostReadiness(item);
  item.imageStatus = readiness.imageStatus;
  item.imageIssue = readiness.imageIssue;
  item.readinessReasons = readiness.reasons;
  item.readinessStatus = readiness.status;

  if (readiness.status === "not_ready" && "status" in item) {
    item.status = "not_ready";
  }

  return item;
}

export function getDraftReadinessStatus(draft: Pick<PostMediaInput, "channelId" | "imageUrl" | "title"> & { content?: string; excerpt?: string }): PublicationReadinessStatus {
  const hasText = Boolean(draft.title?.trim()) && Boolean(getPostText(draft).trim());
  const hasChannel = Boolean(draft.channelId?.trim());
  const hasImage = getPostImageStatus(draft).status === "OK";
  const currencyOk = validateCurrencyPolicy([draft.title, getPostText(draft)].join("\n")).ok;

  return hasText && hasChannel && hasImage && currencyOk ? "ready_for_test" : "not_ready";
}

export function validatePostHasImage(draft: Pick<PostDraft, "imageUrl">) {
  return getPostImageStatus(draft).status === "OK";
}

export function ensurePostImageFile({
  channelId,
  postId,
  title,
  imageUrl = getPostImagePath(channelId, postId),
  force = false,
}: {
  channelId: string;
  postId: string;
  title?: string;
  imageUrl?: string;
  force?: boolean;
}) {
  const filePath = publicPathToFilePath(imageUrl);

  if (!force && existsSync(filePath)) {
    return { created: false, filePath, publicUrl: imageUrl };
  }

  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, buildPostVisualPng({ channelId, postId, title }));

  return { created: true, filePath, publicUrl: imageUrl };
}

export function publicPathToFilePath(publicPath: string) {
  return path.join(process.cwd(), "public", publicPath.replace(/^\//, ""));
}

function getPostImageFileName(postId: string) {
  const match = postId.match(/post-\d{3}$/);

  return `${match?.[0] ?? postId}.png`;
}

function getPostText(post: { content?: string; excerpt?: string }) {
  return post.content ?? post.excerpt ?? "";
}
