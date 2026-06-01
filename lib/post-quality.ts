import { existsSync, statSync } from "node:fs";
import { posts } from "@/data/posts";
import { ensurePostImageFile, getPostImageStatus, publicPathToFilePath } from "@/lib/post-media";
import { ensureTelegramImageForPost } from "@/lib/telegram-post-images";
import { validateCurrencyPolicy } from "@/lib/currency-policy";
import { hasBrokenText, isFailedGenerationText } from "@/lib/text-quality";
import type { Post, PostQuality } from "@/types";

export interface PostQualityItem {
  postId: string;
  channelId: string;
  title: string;
  textLength: number;
  textQuality: PostQuality;
  imageQuality: PostQuality;
  telegramImageReady: boolean;
  placeholderDetected: boolean;
  imageUrl: string;
  telegramImagePath: string;
  issues: string[];
}

export function auditPostQuality() {
  const items = posts.map((post) => evaluatePostQuality(post));
  const weakText = items.filter((item) => item.textQuality === "weak").length;
  const weakImage = items.filter((item) => item.imageQuality === "weak").length;

  return {
    ok: weakText === 0 && weakImage === 0,
    checked: items.length,
    weakText,
    weakImage,
    strong: items.filter((item) => item.textQuality === "strong" && item.imageQuality === "strong").length,
    medium: items.filter((item) => item.textQuality === "medium" || item.imageQuality === "medium").length,
    weak: items.filter((item) => item.textQuality === "weak" || item.imageQuality === "weak").length,
    channelsWithTwoQualityPosts: new Set(
      posts
        .map((post) => post.channelId)
        .filter((channelId) => items.filter((item) => item.channelId === channelId && item.textQuality !== "weak" && item.imageQuality !== "weak").length >= 2),
    ).size,
    items,
  };
}

export function improveWeakPostMaterials() {
  const before = auditPostQuality();
  const regeneratedImages: string[] = [];
  const affectedPosts = before.items.filter((item) => item.textQuality === "weak" || item.imageQuality === "weak" || item.issues.length > 0);

  for (const item of affectedPosts) {
    const post = posts.find((candidate) => candidate.id === item.postId);
    if (!post) continue;

    const file = ensurePostImageFile({
      channelId: post.channelId,
      postId: post.id,
      title: post.title,
      imageUrl: post.imageUrl,
      force: true,
    });
    regeneratedImages.push(file.publicUrl);
    ensureTelegramImageForPost(post);
  }

  const after = auditPostQuality();

  return {
    ok: after.ok,
    checked: before.checked,
    weakTextBefore: before.weakText,
    weakImageBefore: before.weakImage,
    regeneratedPosts: affectedPosts.length,
    regeneratedImages,
    after,
  };
}

export function evaluatePostQuality(post: Post): PostQualityItem {
  const text = `${post.title}\n${post.excerpt}`;
  const image = getPostImageStatus(post);
  const imagePath = post.imageUrl ? publicPathToFilePath(post.imageUrl) : "";
  const imageExists = Boolean(imagePath && existsSync(imagePath));
  const imageSize = imageExists ? statSync(imagePath).size : 0;
  const telegramImage = ensureTelegramImageForPost(post);
  const issues: string[] = [];

  if (hasBrokenText(text) || isFailedGenerationText(text)) issues.push("invalid_text_encoding");
  if (!validateCurrencyPolicy(text).ok) issues.push("forbidden_currency_detected");
  if (post.excerpt.length < 450) issues.push("text_too_short");
  if (post.excerpt.length > 1400) issues.push("text_too_long");
  if (image.status !== "OK") issues.push(image.issue ?? "missing_post_image");
  if (!imageExists || imageSize < 5000) issues.push("placeholder_or_missing_image");
  if (post.imageUrl.endsWith(".svg")) issues.push("svg_post_image");
  if (telegramImage.telegramImageStatus !== "OK") issues.push("telegram_image_not_ready");
  if (isPlaceholderImage(post, imageSize)) issues.push("placeholder_image_detected");

  const textQuality = getTextQuality(post, issues);
  const imageQuality = getImageQuality(post, imageSize, issues);

  return {
    postId: post.id,
    channelId: post.channelId,
    title: post.title,
    textLength: post.excerpt.length,
    textQuality,
    imageQuality,
    telegramImageReady: telegramImage.telegramImageStatus === "OK",
    placeholderDetected: issues.includes("placeholder_image_detected"),
    imageUrl: post.imageUrl,
    telegramImagePath: telegramImage.telegramImagePath,
    issues,
  };
}

function getTextQuality(post: Post, issues: string[]): PostQuality {
  if (issues.some((issue) => issue === "invalid_text_encoding" || issue === "forbidden_currency_detected" || issue === "text_too_short")) {
    return "weak";
  }

  if (post.excerpt.length >= 650 && post.excerpt.includes("\n\n")) {
    return "strong";
  }

  return "medium";
}

function getImageQuality(post: Post, imageSize: number, issues: string[]): PostQuality {
  if (issues.some((issue) => issue === "missing_post_image" || issue === "broken_image_path" || issue === "svg_post_image" || issue === "telegram_image_not_ready" || issue === "placeholder_image_detected")) {
    return "weak";
  }

  if (imageSize > 20000 && post.imageUrl.endsWith(".png")) {
    return "strong";
  }

  return "medium";
}

function isPlaceholderImage(post: Post, imageSize: number) {
  if (!post.imageUrl.startsWith("/assets/posts/")) return true;
  if (post.imageUrl.endsWith(".svg")) return true;
  if (imageSize < 18000) return true;

  const title = post.title.toLowerCase();
  return title.includes("test post") || title.includes("draft") || title.includes("failed first draft");
}
