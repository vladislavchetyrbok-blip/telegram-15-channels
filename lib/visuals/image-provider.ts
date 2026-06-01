import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import { getPremiumVisualProfile } from "@/lib/premium-visual-profiles";
import { premiumVisualHeight, premiumVisualVersion, premiumVisualWidth, validatePremiumVisual } from "@/lib/premium-visual-generator";
import {
  getProviderSafety,
  getVisualEngineConfig,
  providerSource,
  updateVisualEngineRuntimeSettings,
  type ImageProviderType,
} from "@/lib/visual-engine-config";
import { getWeeklyContentPlanState, type WeeklyContentPlanItem } from "@/lib/weekly-content-plan";

const execFileAsync = promisify(execFile);
const premiumScriptPath = path.join(process.cwd(), "scripts", "generate-premium-visuals.ps1");

export interface ImageProviderResult {
  provider: ImageProviderType;
  fallbackProvider: ImageProviderType;
  fallbackUsed: boolean;
  stylePreset: string;
  imagePath: string;
  previewPath: string;
  width: number;
  height: number;
  format: "png" | "jpg" | "jpeg";
  imageQuality: "strong" | "medium" | "weak";
  generatedAt: string;
  premiumVersion: string;
  source: "template" | "comfyui" | "external_api" | "disabled";
  error?: string | null;
}

export async function getVisualEngineStatus() {
  const config = getVisualEngineConfig();
  const state = getWeeklyContentPlanState();
  const localTemplateItems = state.items.filter((item) => item.provider === "local_template" || item.visualVersion === premiumVisualVersion);
  const strong = state.items.filter((item) => item.imageQuality === "strong").length;
  const weak = state.items.filter((item) => item.imageQuality === "weak").length;
  const telegramOk = state.items.filter((item) => item.telegramImageStatus === "OK").length;
  const comfyui = await checkComfyUiHealth(config.comfyUiUrl);

  return {
    ok: true,
    config,
    providers: {
      local_template: { available: true, status: "OK", source: "template" },
      comfyui_sdxl: { available: comfyui.available, status: comfyui.status, error: comfyui.error ?? null },
      comfyui_flux_schnell: { available: comfyui.available, status: comfyui.status, error: comfyui.error ?? null },
      external_api: { available: false, status: "DISABLED_STUB", error: "External API provider is not configured." },
      disabled: { available: false, status: "DISABLED" },
    },
    comfyui,
    safety: getProviderSafety({
      provider: config.imageProvider,
      hardwareProfile: config.imageHardwareProfile,
      requestedCount: state.items.length,
    }),
    summary: {
      totalImages: state.items.length,
      localTemplate: localTemplateItems.length,
      premiumV2: state.items.filter((item) => item.premiumVersion === premiumVisualVersion || item.visualVersion === premiumVisualVersion).length,
      telegramImageOk: telegramOk,
      strong,
      weak,
      providerMetadataMissing: state.items.filter((item) => !item.provider || !item.premiumVersion).length,
    },
    telegramSent: false,
    autopublishEnabledChanged: false,
    targetsChanged: false,
  };
}

export async function generateWithVisualProvider({
  postId,
  provider,
  confirmed,
}: {
  postId: string;
  provider?: ImageProviderType;
  confirmed?: boolean;
}): Promise<ImageProviderResult> {
  const config = getVisualEngineConfig();
  const requestedProvider = provider ?? config.imageProvider;
  const safety = getProviderSafety({
    provider: requestedProvider,
    hardwareProfile: config.imageHardwareProfile,
    requestedCount: 1,
    confirmed,
  });

  if (!safety.ok) {
    updateVisualEngineRuntimeSettings({ lastProviderError: safety.reason });
    return generateLocalTemplate(postId, true, safety.reason);
  }

  if (requestedProvider === "local_template") return generateLocalTemplate(postId, false);
  if (requestedProvider === "disabled") return generateLocalTemplate(postId, true, "Image provider disabled. Fallback local_template used.");

  if (requestedProvider === "comfyui_sdxl" || requestedProvider === "comfyui_flux_schnell") {
    const health = await checkComfyUiHealth(config.comfyUiUrl);
    if (!health.available) {
      const error = health.error ?? "COMFYUI_NOT_AVAILABLE";
      updateVisualEngineRuntimeSettings({ lastProviderError: error });
      return generateLocalTemplate(postId, true, error);
    }

    updateVisualEngineRuntimeSettings({ lastProviderError: "ComfyUI adapter is preview-only. Workflow is not configured yet." });
    return generateLocalTemplate(postId, true, "ComfyUI workflow is not configured. Fallback local_template used.");
  }

  updateVisualEngineRuntimeSettings({ lastProviderError: "External API provider is not configured." });
  return generateLocalTemplate(postId, true, "External API provider is not configured. Fallback local_template used.");
}

export async function checkComfyUiHealth(comfyUiUrl: string) {
  const startedAt = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const response = await fetch(`${comfyUiUrl.replace(/\/$/, "")}/system_stats`, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return {
        available: false,
        status: "COMFYUI_NOT_AVAILABLE",
        url: comfyUiUrl,
        httpStatus: response.status,
        latencyMs: Date.now() - startedAt,
        error: `ComfyUI returned HTTP ${response.status}`,
      };
    }

    return {
      available: true,
      status: "OK",
      url: comfyUiUrl,
      httpStatus: response.status,
      latencyMs: Date.now() - startedAt,
      error: null,
    };
  } catch (error) {
    return {
      available: false,
      status: "COMFYUI_NOT_AVAILABLE",
      url: comfyUiUrl,
      httpStatus: null,
      latencyMs: Date.now() - startedAt,
      error: error instanceof Error ? error.message : "ComfyUI is not reachable.",
    };
  }
}

export function buildProviderMetadataForItem(item: WeeklyContentPlanItem) {
  const profile = getPremiumVisualProfile(item.channelId);
  const validation = item.telegramImagePath ? validatePremiumVisual(item.telegramImagePath, `${item.title}\n${item.contentTopic}`) : null;

  return {
    provider: item.provider ?? "local_template",
    fallbackProvider: item.fallbackProvider ?? "local_template",
    fallbackUsed: item.fallbackUsed ?? false,
    stylePreset: item.visualPreset ?? profile.stylePreset,
    imagePath: item.telegramImagePath,
    previewPath: item.imageUrl,
    width: validation?.width ?? item.imageDimensions?.width ?? premiumVisualWidth,
    height: validation?.height ?? item.imageDimensions?.height ?? premiumVisualHeight,
    format: "png" as const,
    imageQuality: item.imageQuality,
    generatedAt: item.visualGeneratedAt ?? item.updatedAt,
    premiumVersion: item.premiumVersion ?? item.visualVersion ?? premiumVisualVersion,
    source: item.source ?? providerSource((item.provider ?? "local_template") as ImageProviderType),
  };
}

async function generateLocalTemplate(postId: string, fallbackUsed: boolean, error: string | null = null): Promise<ImageProviderResult> {
  const stateBefore = getWeeklyContentPlanState();
  const before = stateBefore.items.find((item) => item.postId === postId || item.id === postId);
  if (!before) throw new Error(`Post not found: ${postId}`);

  const args = ["-ExecutionPolicy", "Bypass", "-File", premiumScriptPath, "-PostId", before.postId];
  await execFileAsync("powershell", args, {
    cwd: process.cwd(),
    timeout: 10 * 60 * 1000,
    windowsHide: true,
  });

  const stateAfter = getWeeklyContentPlanState();
  const item = stateAfter.items.find((candidate) => candidate.postId === before.postId) ?? before;
  const metadata = buildProviderMetadataForItem(item);

  return {
    ...metadata,
    provider: "local_template",
    fallbackProvider: "local_template",
    fallbackUsed,
    source: "template",
    imagePath: existsSync(item.telegramImagePath) ? item.telegramImagePath : metadata.imagePath,
    error,
  };
}
