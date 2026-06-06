export const visualProviderTypes = ["placeholder", "manual_upload", "external_ai", "local_comfyui", "premium_library"] as const;

export type VisualProviderType = (typeof visualProviderTypes)[number];

export interface VisualProviderConfig {
  currentProvider: VisualProviderType;
  allowPlaceholderPremium: boolean;
  manualImportEnabled: boolean;
  externalAiConfigured: boolean;
  localComfyUiConfigured: boolean;
  productionStoreMode: "json";
  sourceOfTruth: "json";
}

export interface VisualProviderDefinition {
  id: VisualProviderType;
  label: string;
  status: "available" | "configured" | "devOnly" | "disabled" | "notConfigured";
  available: boolean;
  premiumEligible: boolean;
  warning: string | null;
  note: string;
}

export function normalizeVisualProvider(provider: string | null | undefined): VisualProviderType {
  if (provider === "local_draft_png" || provider === "local_template" || provider === "demo" || provider === "template") return "placeholder";
  return visualProviderTypes.includes(provider as VisualProviderType) ? (provider as VisualProviderType) : "placeholder";
}

