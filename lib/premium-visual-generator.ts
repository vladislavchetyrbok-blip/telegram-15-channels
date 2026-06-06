import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { hasBrokenText, isFailedGenerationText } from "@/lib/text-quality";
import { validateCurrencyPolicy } from "@/lib/currency-policy";
import { getPremiumVisualProfile, type PremiumVisualPreset } from "@/lib/premium-visual-profiles";

export const premiumVisualVersion = "premium_v2";
export const premiumVisualWidth = 1080;
export const premiumVisualHeight = 1350;
export const premiumVisualAspectRatio = premiumVisualWidth / premiumVisualHeight;

export interface PremiumVisualMetadata {
  width: number;
  height: number;
  format: "png";
  visualStyle: string;
  visualPreset: PremiumVisualPreset;
  textStatus: "OK" | "BROKEN TEXT";
  qualityStatus: "strong" | "medium" | "weak";
  generatedAt: string;
  version: typeof premiumVisualVersion;
}

export interface PremiumVisualValidation {
  ok: boolean;
  qualityStatus: "strong" | "medium" | "weak";
  issues: string[];
  width: number | null;
  height: number | null;
  format: string | null;
  fileSize: number;
}

const forbiddenVisuals = ["RUB", "₽", "руб", "ruble", "rouble", "watermark", "random logo", "local-model", "test post", "premium_v2", "telegram ready", "service label", "template label"];

export function buildPremiumVisualMetadata({
  channelId,
  title,
  generatedAt = new Date().toISOString(),
}: {
  channelId: string;
  title: string;
  generatedAt?: string;
}): PremiumVisualMetadata {
  const visualProfile = getPremiumVisualProfile(channelId);
  const textStatus = hasBrokenText(title) || isFailedGenerationText(title) || !validateCurrencyPolicy(title).ok ? "BROKEN TEXT" : "OK";

  return {
    width: premiumVisualWidth,
    height: premiumVisualHeight,
    format: "png",
    visualStyle: `${visualProfile.stylePreset}, ${visualProfile.palette}, premium editorial Telegram cover`,
    visualPreset: visualProfile.stylePreset,
    textStatus,
    qualityStatus: textStatus === "OK" ? "strong" : "weak",
    generatedAt,
    version: premiumVisualVersion,
  };
}

export function validatePremiumVisual(filePath: string, overlayText = ""): PremiumVisualValidation {
  const issues: string[] = [];

  if (!filePath || !existsSync(filePath)) {
    return { ok: false, qualityStatus: "weak", issues: ["missing"], width: null, height: null, format: null, fileSize: 0 };
  }

  const ext = path.extname(filePath).toLowerCase();
  const fileSize = statSync(filePath).size;
  const dimensions = ext === ".png" ? readPngDimensions(filePath) : { width: null, height: null };

  if (ext !== ".png" && ext !== ".jpg" && ext !== ".jpeg") issues.push("unsupported_format");
  if (fileSize <= 1024) issues.push("empty_or_too_small_file");
  if (!dimensions.width || !dimensions.height) issues.push("dimensions_unreadable");
  if (dimensions.width && dimensions.width < 1000) issues.push("width_too_small");
  if (dimensions.width && dimensions.height && Math.abs(dimensions.width / dimensions.height - premiumVisualAspectRatio) > 0.04) issues.push("wrong_aspect_ratio");
  if (hasBrokenText(overlayText) || isFailedGenerationText(overlayText)) issues.push("mojibake_or_bad_overlay_text");
  if (!validateCurrencyPolicy(overlayText).ok) issues.push("forbidden_currency_detected");
  if (forbiddenVisuals.some((fragment) => overlayText.toLowerCase().includes(fragment.toLowerCase()))) issues.push("forbidden_visual_text");

  return {
    ok: issues.length === 0,
    qualityStatus: issues.length === 0 && fileSize > 80_000 ? "strong" : issues.length === 0 ? "medium" : "weak",
    issues,
    width: dimensions.width,
    height: dimensions.height,
    format: ext.replace(".", "") || null,
    fileSize,
  };
}

function readPngDimensions(filePath: string) {
  const buffer = readFileSync(filePath);
  if (buffer.length < 24) return { width: null, height: null };
  const signature = buffer.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a") return { width: null, height: null };
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}
