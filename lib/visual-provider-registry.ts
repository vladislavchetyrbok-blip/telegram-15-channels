import { type VisualProviderConfig, type VisualProviderDefinition, type VisualProviderType, visualProviderTypes } from "./visual-provider";

export function getVisualProviderConfig(env: NodeJS.ProcessEnv = process.env): VisualProviderConfig {
  const requestedProvider = String(env.VISUAL_PROVIDER ?? "placeholder").trim() as VisualProviderType;
  const currentProvider = visualProviderTypes.includes(requestedProvider) ? requestedProvider : "placeholder";

  return {
    currentProvider,
    allowPlaceholderPremium: String(env.ALLOW_PLACEHOLDER_PREMIUM ?? "false").toLowerCase() === "true",
    manualImportEnabled: String(env.ENABLE_MANUAL_VISUAL_IMPORT ?? "true").toLowerCase() !== "false",
    externalAiConfigured: Boolean(env.VISUAL_EXTERNAL_AI_API_KEY || env.OPENAI_API_KEY || env.IMAGE_PROVIDER_API_KEY),
    localComfyUiConfigured: Boolean(env.COMFYUI_API_URL || env.LOCAL_COMFYUI_URL),
    productionStoreMode: "json",
    sourceOfTruth: "json",
  };
}

export function getVisualProviderRegistry(config = getVisualProviderConfig()): Record<VisualProviderType, VisualProviderDefinition> {
  return {
    placeholder: {
      id: "placeholder",
      label: "Placeholder demo generator",
      status: "devOnly",
      available: true,
      premiumEligible: config.allowPlaceholderPremium,
      warning: "placeholderProviderUsed",
      note: "Allowed for dev/test only; not a premium success path by default.",
    },
    manual_upload: {
      id: "manual_upload",
      label: "Manual upload",
      status: config.manualImportEnabled ? "available" : "disabled",
      available: config.manualImportEnabled,
      premiumEligible: config.manualImportEnabled,
      warning: null,
      note: "Imports a local PNG/JPG/WebP as a candidate without applying it.",
    },
    external_ai: {
      id: "external_ai",
      label: "External AI",
      status: config.externalAiConfigured ? "configured" : "notConfigured",
      available: config.externalAiConfigured,
      premiumEligible: config.externalAiConfigured,
      warning: config.externalAiConfigured ? null : "externalAiNotConfigured",
      note: "Future external AI provider interface; no keys are required by v1.",
    },
    local_comfyui: {
      id: "local_comfyui",
      label: "Local ComfyUI",
      status: config.localComfyUiConfigured ? "configured" : "notConfigured",
      available: config.localComfyUiConfigured,
      premiumEligible: config.localComfyUiConfigured,
      warning: config.localComfyUiConfigured ? null : "localComfyUiNotConfigured",
      note: "Future local ComfyUI provider interface; v1 does not start ComfyUI.",
    },
    premium_library: {
      id: "premium_library",
      label: "Premium library",
      status: "available",
      available: true,
      premiumEligible: true,
      warning: null,
      note: "Selects prepared premium images from data/premium-visual-library/index.json.",
    },
  };
}
