import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { posts } from "@/data/posts";
import { channelPostImageFolders, publicPathToFilePath } from "@/lib/post-media";
import { buildPostVisualPng } from "@/lib/post-visual-generator";
import type { Post } from "@/types";

export type TelegramImageStatus = "OK" | "missing" | "unsupported_format" | "image_process_risk" | "broken_file" | "conversion_failed";

export interface TelegramPostImageCheck {
  postId: string;
  channelId: string;
  title: string;
  imageUrl: string;
  imagePath: string;
  fileExists: boolean;
  fileExtension: string;
  mimeType: string;
  fileSize: number;
  canOpenAsImage: boolean;
  sourceIsSvg: boolean;
  telegramImageUrl: string;
  telegramImagePath: string;
  telegramImageStatus: TelegramImageStatus;
  created: boolean;
  reason: string | null;
}

export interface TelegramPostImagesAudit {
  ok: boolean;
  checked: number;
  svgCount: number;
  pngOrJpgCreated: number;
  telegramImageStatusOk: number;
  missing: number;
  broken: number;
  failed: number;
  unsupportedOrBroken: number;
  images: TelegramPostImageCheck[];
}

const allowedTelegramExtensions = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const maxTelegramPhotoSize = 10 * 1024 * 1024;

export function getTelegramImagePublicUrl(post: Pick<Post, "id" | "channelId">) {
  const folder = channelPostImageFolders[post.channelId] ?? post.channelId;
  const match = post.id.match(/post-\d{3}$/);
  const fileName = `${match?.[0] ?? post.id}.png`;

  return `/assets/telegram-posts/${folder}/${fileName}`;
}

export function getTelegramImagePath(post: Pick<Post, "id" | "channelId">) {
  return publicPathToFilePath(getTelegramImagePublicUrl(post));
}

export function ensureTelegramImageForPost(post: Post): TelegramPostImageCheck {
  return inspectTelegramImage(post, true);
}

export function inspectTelegramImage(post: Post, createIfNeeded = false): TelegramPostImageCheck {
  const sourcePath = post.imageUrl ? publicPathToFilePath(post.imageUrl) : "";
  const sourceExists = Boolean(sourcePath && existsSync(sourcePath));
  const sourceExt = sourcePath ? path.extname(sourcePath).toLowerCase() : "";
  const telegramImageUrl = getTelegramImagePublicUrl(post);
  const telegramImagePath = getTelegramImagePath(post);
  const sourceStats = sourceExists ? statSync(sourcePath) : null;
  const sourceMime = getMimeType(sourceExt);
  const sourceReadable = sourceExists ? canOpenAsImage(sourcePath, sourceExt) : false;
  let created = false;

  const telegramNeedsRefresh =
    createIfNeeded ||
    !existsSync(telegramImagePath) ||
    sourceExt === ".svg" ||
    (sourceStats ? !existsSync(telegramImagePath) || sourceStats.mtimeMs > statSync(telegramImagePath).mtimeMs : false);

  if (createIfNeeded && sourceExists && telegramNeedsRefresh) {
    try {
      mkdirSync(path.dirname(telegramImagePath), { recursive: true });
      writeFileSync(telegramImagePath, buildTelegramReadyPng(post));
      created = true;
    } catch {
      return {
        postId: post.id,
        channelId: post.channelId,
        title: post.title,
        imageUrl: post.imageUrl,
        imagePath: sourcePath,
        fileExists: sourceExists,
        fileExtension: sourceExt || "missing",
        mimeType: sourceMime,
        fileSize: sourceStats?.size ?? 0,
        canOpenAsImage: sourceReadable,
        sourceIsSvg: sourceExt === ".svg",
        telegramImageUrl,
        telegramImagePath,
        telegramImageStatus: "conversion_failed",
        created: false,
        reason: "telegram-ready PNG conversion failed",
      };
    }
  }

  const telegramExists = existsSync(telegramImagePath);
  const telegramExt = path.extname(telegramImagePath).toLowerCase();
  const telegramSize = telegramExists ? statSync(telegramImagePath).size : 0;
  const telegramReadable = telegramExists ? canOpenAsImage(telegramImagePath, telegramExt) : false;
  const telegramStatus = getTelegramImageStatus({
    sourceExists,
    sourceExt,
    sourceReadable,
    telegramExists,
    telegramExt,
    telegramSize,
    telegramReadable,
  });

  return {
    postId: post.id,
    channelId: post.channelId,
    title: post.title,
    imageUrl: post.imageUrl,
    imagePath: sourcePath,
    fileExists: sourceExists,
    fileExtension: sourceExt || "missing",
    mimeType: sourceMime,
    fileSize: sourceStats?.size ?? 0,
    canOpenAsImage: sourceReadable,
    sourceIsSvg: sourceExt === ".svg",
    telegramImageUrl,
    telegramImagePath,
    telegramImageStatus: telegramStatus.status,
    created,
    reason: telegramStatus.reason,
  };
}

export function auditTelegramPostImages({ createMissing = false }: { createMissing?: boolean } = {}): TelegramPostImagesAudit {
  const images = posts.map((post) => inspectTelegramImage(post, createMissing));
  const created = images.filter((item) => item.created).length;
  const ok = images.every((item) => item.telegramImageStatus === "OK");

  return {
    ok,
    checked: images.length,
    svgCount: images.filter((item) => item.sourceIsSvg).length,
    pngOrJpgCreated: created,
    telegramImageStatusOk: images.filter((item) => item.telegramImageStatus === "OK").length,
    missing: images.filter((item) => item.telegramImageStatus === "missing").length,
    broken: images.filter((item) => item.telegramImageStatus === "broken_file" || item.telegramImageStatus === "image_process_risk" || item.telegramImageStatus === "unsupported_format").length,
    failed: images.filter((item) => item.telegramImageStatus === "conversion_failed").length,
    unsupportedOrBroken: images.filter((item) => item.telegramImageStatus !== "OK").length,
    images,
  };
}

export function getTelegramImageMime(filePath: string) {
  return getMimeType(path.extname(filePath).toLowerCase());
}

function getTelegramImageStatus({
  sourceExists,
  sourceExt,
  sourceReadable,
  telegramExists,
  telegramExt,
  telegramSize,
  telegramReadable,
}: {
  sourceExists: boolean;
  sourceExt: string;
  sourceReadable: boolean;
  telegramExists: boolean;
  telegramExt: string;
  telegramSize: number;
  telegramReadable: boolean;
}): { status: TelegramImageStatus; reason: string | null } {
  if (!sourceExists) {
    return { status: "missing", reason: "source image missing" };
  }

  if (!sourceReadable) {
    return { status: "broken_file", reason: "source image cannot be opened" };
  }

  if (!telegramExists) {
    return { status: "missing", reason: "telegram-ready image missing" };
  }

  if (!allowedTelegramExtensions.has(telegramExt)) {
    return { status: "unsupported_format", reason: "telegram-ready image must be PNG/JPG/WEBP" };
  }

  if (telegramSize <= 64 || !telegramReadable) {
    return { status: "broken_file", reason: "telegram-ready image is broken" };
  }

  if (telegramSize > maxTelegramPhotoSize) {
    return { status: "image_process_risk", reason: "telegram-ready image is too large for sendPhoto" };
  }

  if (sourceExt === ".svg" && telegramExt !== ".png") {
    return { status: "image_process_risk", reason: "SVG must be replaced with PNG for Telegram" };
  }

  return { status: "OK", reason: null };
}

function canOpenAsImage(filePath: string, ext: string) {
  if (!existsSync(filePath)) return false;

  const bytes = readFileSync(filePath);
  if (bytes.length <= 8) return false;

  if (ext === ".svg") {
    const sample = bytes.subarray(0, Math.min(bytes.length, 256)).toString("utf8").toLowerCase();
    return sample.includes("<svg");
  }

  if (ext === ".png") {
    return bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }

  if (ext === ".jpg" || ext === ".jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[bytes.length - 2] === 0xff && bytes[bytes.length - 1] === 0xd9;
  }

  if (ext === ".webp") {
    return bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP";
  }

  return false;
}

function getMimeType(ext: string) {
  if (ext === ".png") return "image/png";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".svg") return "image/svg+xml";

  return "application/octet-stream";
}

function buildTelegramReadyPng(post: Post) {
  return buildPostVisualPng({
    channelId: post.channelId,
    postId: post.id,
    title: post.title,
  });
}
