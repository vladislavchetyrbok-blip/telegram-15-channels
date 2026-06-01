import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

export type ImageProviderType = "local_template" | "comfyui_sdxl" | "comfyui_flux_schnell" | "external_api" | "disabled";
export type ImageGenerationMode = "template_first" | "ai_preview" | "ai_first";
export type ImageHardwareProfile = "low" | "medium" | "high";

export interface VisualEngineConfig {
  imageProvider: ImageProviderType;
  fallbackProvider: ImageProviderType;
  imageAiEnabled: boolean;
  imageGenerationMode: ImageGenerationMode;
  imageHardwareProfile: ImageHardwareProfile;
  imageWidth: number;
  imageHeight: number;
  imagePremiumStyle: boolean;
  comfyUiUrl: string;
}

export interface VisualEngineRuntimeSettings {
  imageProvider?: ImageProviderType;
  fallbackProvider?: ImageProviderType;
  imageAiEnabled?: boolean;
  imageGenerationMode?: ImageGenerationMode;
  imageHardwareProfile?: ImageHardwareProfile;
  imageWidth?: number;
  imageHeight?: number;
  imagePremiumStyle?: boolean;
  comfyUiUrl?: string;
  lastProviderError?: string | null;
  updatedAt?: string;
}

export const visualEngineDefaults: VisualEngineConfig = {
  imageProvider: "local_template",
  fallbackProvider: "local_template",
  imageAiEnabled: false,
  imageGenerationMode: "template_first",
  imageHardwareProfile: "low",
  imageWidth: 1080,
  imageHeight: 1350,
  imagePremiumStyle: true,
  comfyUiUrl: "http://127.0.0.1:8188",
};

const runtimePath = path.join(process.cwd(), "data", "runtime", "visual-engine-settings.json");
let envLoaded = false;

export function getVisualEngineConfig(): VisualEngineConfig & { lastProviderError: string | null } {
  loadDotEnvLocal();
  const runtime = readRuntimeSettings();

  return {
    imageProvider: pickProvider(runtime.imageProvider ?? process.env.IMAGE_PROVIDER, visualEngineDefaults.imageProvider),
    fallbackProvider: pickProvider(runtime.fallbackProvider ?? process.env.IMAGE_FALLBACK_PROVIDER, visualEngineDefaults.fallbackProvider),
    imageAiEnabled: pickBoolean(runtime.imageAiEnabled ?? process.env.IMAGE_AI_ENABLED, visualEngineDefaults.imageAiEnabled),
    imageGenerationMode: pickMode(runtime.imageGenerationMode ?? process.env.IMAGE_GENERATION_MODE, visualEngineDefaults.imageGenerationMode),
    imageHardwareProfile: pickHardware(runtime.imageHardwareProfile ?? process.env.IMAGE_HARDWARE_PROFILE, visualEngineDefaults.imageHardwareProfile),
    imageWidth: pickNumber(runtime.imageWidth ?? process.env.IMAGE_WIDTH, visualEngineDefaults.imageWidth),
    imageHeight: pickNumber(runtime.imageHeight ?? process.env.IMAGE_HEIGHT, visualEngineDefaults.imageHeight),
    imagePremiumStyle: pickBoolean(runtime.imagePremiumStyle ?? process.env.IMAGE_PREMIUM_STYLE, visualEngineDefaults.imagePremiumStyle),
    comfyUiUrl: String(runtime.comfyUiUrl ?? process.env.COMFYUI_URL ?? visualEngineDefaults.comfyUiUrl),
    lastProviderError: runtime.lastProviderError ?? null,
  };
}

export function readRuntimeSettings(): VisualEngineRuntimeSettings {
  if (!existsSync(runtimePath)) return {};

  try {
    return JSON.parse(readFileSync(runtimePath, "utf8")) as VisualEngineRuntimeSettings;
  } catch {
    return {};
  }
}

export function updateVisualEngineRuntimeSettings(patch: VisualEngineRuntimeSettings) {
  const next: VisualEngineRuntimeSettings = {
    ...readRuntimeSettings(),
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  mkdirSync(path.dirname(runtimePath), { recursive: true });
  writeFileSync(runtimePath, JSON.stringify(next, null, 2), "utf8");
  return next;
}

export function getProviderSafety({
  provider,
  hardwareProfile,
  requestedCount,
  confirmed,
}: {
  provider: ImageProviderType;
  hardwareProfile: ImageHardwareProfile;
  requestedCount: number;
  confirmed?: boolean;
}) {
  const isHeavy = provider !== "local_template" && provider !== "disabled";
  const previewLimit = hardwareProfile === "high" ? 3 : hardwareProfile === "medium" ? 3 : 0;

  if (!isHeavy) {
    return { ok: true, reason: null as string | null, maxPreviewCount: requestedCount };
  }

  if (hardwareProfile === "low") {
    return {
      ok: false,
      reason: "Heavy AI providers are disabled on low hardware profile. Use local_template.",
      maxPreviewCount: 0,
    };
  }

  if (requestedCount > previewLimit && !confirmed) {
    return {
      ok: false,
      reason: "Heavy AI image provider may be slow on this PC. Mass generation requires separate confirmation.",
      maxPreviewCount: previewLimit,
    };
  }

  return { ok: true, reason: null as string | null, maxPreviewCount: previewLimit };
}

export function providerSource(provider: ImageProviderType) {
  if (provider === "local_template") return "template";
  if (provider === "external_api") return "external_api";
  if (provider === "disabled") return "disabled";
  return "comfyui";
}

function loadDotEnvLocal() {
  if (envLoaded) return;
  envLoaded = true;

  const envPath = path.join(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return;

  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

function pickProvider(value: unknown, fallback: ImageProviderType): ImageProviderType {
  return isProvider(value) ? value : fallback;
}

function isProvider(value: unknown): value is ImageProviderType {
  return value === "local_template" || value === "comfyui_sdxl" || value === "comfyui_flux_schnell" || value === "external_api" || value === "disabled";
}

function pickMode(value: unknown, fallback: ImageGenerationMode): ImageGenerationMode {
  return value === "template_first" || value === "ai_preview" || value === "ai_first" ? value : fallback;
}

function pickHardware(value: unknown, fallback: ImageHardwareProfile): ImageHardwareProfile {
  return value === "low" || value === "medium" || value === "high" ? value : fallback;
}

function pickBoolean(value: unknown, fallback: boolean) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }
  return fallback;
}

function pickNumber(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
