import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

export const root = process.cwd();
export const visualProviderTypes = ["placeholder", "manual_upload", "external_ai", "local_comfyui", "premium_library"];
export const manualImportDir = path.join(root, "data", "manual-visual-imports");
export const premiumLibraryDir = path.join(root, "data", "premium-visual-library");
export const premiumLibraryIndexFile = path.join(premiumLibraryDir, "index.json");
export const imageCandidatesDir = path.join(root, "public", "assets", "visual-regeneration-candidates");
export const draftsDir = path.join(root, "data", "visual-regeneration-drafts");
export const draftsFile = path.join(draftsDir, "visual-regeneration-drafts.json");
export const imageCandidatesFile = path.join(draftsDir, "visual-regeneration-image-candidates.json");
export const premiumScoreThreshold = 80;

const imageExtensions = new Set([".png", ".jpg", ".jpeg", ".webp"]);
const targetChannelId = "ai-tech";

export function getVisualProviderConfig(env = process.env) {
  const requestedProvider = String(env.VISUAL_PROVIDER ?? "placeholder").trim();
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

export function getProviderDefinitions(config = getVisualProviderConfig()) {
  return {
    placeholder: {
      id: "placeholder",
      label: "Placeholder demo generator",
      status: "devOnly",
      available: true,
      premiumEligible: config.allowPlaceholderPremium,
      warning: "placeholderProviderUsed",
      note: "Allowed for dev/test only. It must not be counted as premium success unless ALLOW_PLACEHOLDER_PREMIUM=true.",
    },
    manual_upload: {
      id: "manual_upload",
      label: "Manual upload",
      status: config.manualImportEnabled ? "available" : "disabled",
      available: config.manualImportEnabled,
      premiumEligible: config.manualImportEnabled,
      warning: null,
      note: "Imports a user-provided PNG/JPG/WebP as a candidate without applying it.",
    },
    external_ai: {
      id: "external_ai",
      label: "External AI",
      status: config.externalAiConfigured ? "configured" : "notConfigured",
      available: config.externalAiConfigured,
      premiumEligible: config.externalAiConfigured,
      warning: config.externalAiConfigured ? null : "externalAiNotConfigured",
      note: "Interface stub for a future external AI image provider. No API call is made by v1.",
    },
    local_comfyui: {
      id: "local_comfyui",
      label: "Local ComfyUI",
      status: config.localComfyUiConfigured ? "configured" : "notConfigured",
      available: config.localComfyUiConfigured,
      premiumEligible: config.localComfyUiConfigured,
      warning: config.localComfyUiConfigured ? null : "localComfyUiNotConfigured",
      note: "Interface stub for a future local ComfyUI provider. ComfyUI is not started by v1.",
    },
    premium_library: {
      id: "premium_library",
      label: "Premium library",
      status: "available",
      available: true,
      premiumEligible: true,
      warning: null,
      note: "Selects a prepared premium image from data/premium-visual-library/index.json.",
    },
  };
}

export function normalizeProviderId(provider) {
  const value = String(provider ?? "").trim();
  if (value === "local_draft_png" || value === "local_template" || value === "demo" || value === "template") return "placeholder";
  return visualProviderTypes.includes(value) ? value : "placeholder";
}

export function buildProviderCandidateFields({ provider, generatorUsed, visualQualityEstimate = {}, originalFileName = null, sourceNote = null } = {}) {
  const config = getVisualProviderConfig();
  const providerId = normalizeProviderId(provider ?? generatorUsed);
  const placeholderProviderUsed = providerId === "placeholder";
  const premiumScore = Number(visualQualityEstimate.expectedPremiumScore ?? visualQualityEstimate.premiumScore ?? 0);
  const placeholderBlocked = placeholderProviderUsed && !config.allowPlaceholderPremium;
  const premiumScoreBlocked = premiumScore > 0 && premiumScore < premiumScoreThreshold;
  const warnings = [];
  const applyBlockReasons = [];

  if (placeholderProviderUsed) {
    warnings.push("placeholderProviderUsed");
    if (placeholderBlocked) {
      warnings.push("placeholderPremiumDisabled");
      applyBlockReasons.push("Candidate uses the placeholder/demo provider and ALLOW_PLACEHOLDER_PREMIUM is false.");
    }
  }

  if (premiumScoreBlocked) {
    warnings.push("premiumScoreBelowThreshold");
    applyBlockReasons.push(`Candidate premium score is below ${premiumScoreThreshold}.`);
  }

  return {
    provider: providerId,
    providerLabel: getProviderDefinitions(config)[providerId]?.label ?? providerId,
    providerStatus: getProviderDefinitions(config)[providerId]?.status ?? "unknown",
    placeholderProviderUsed,
    allowPlaceholderPremium: config.allowPlaceholderPremium,
    visualQualityStatus: placeholderBlocked ? "notPremium" : "pending_review",
    premiumUsable: !placeholderBlocked && !premiumScoreBlocked,
    providerWarnings: Array.from(new Set(warnings)),
    providerApplyBlockReasons: Array.from(new Set(applyBlockReasons)),
    originalFileName,
    sourceNote,
  };
}

export function enrichCandidateProviderFields(candidate) {
  const providerFields = buildProviderCandidateFields({
    provider: candidate?.provider,
    generatorUsed: candidate?.generatorUsed,
    visualQualityEstimate: candidate?.visualQualityEstimate,
    originalFileName: candidate?.originalFileName ?? null,
    sourceNote: candidate?.sourceNote ?? null,
  });

  const provider = normalizeProviderId(candidate?.provider ?? candidate?.generatorUsed);
  const visualQualityStatus = provider === "placeholder" && !providerFields.allowPlaceholderPremium
    ? "notPremium"
    : String(candidate?.visualQualityStatus ?? providerFields.visualQualityStatus);

  return {
    ...providerFields,
    ...candidate,
    provider,
    providerLabel: providerFields.providerLabel,
    providerStatus: providerFields.providerStatus,
    placeholderProviderUsed: providerFields.placeholderProviderUsed || Boolean(candidate?.placeholderProviderUsed),
    allowPlaceholderPremium: providerFields.allowPlaceholderPremium,
    visualQualityStatus,
    premiumUsable: providerFields.premiumUsable && visualQualityStatus !== "notPremium",
    providerWarnings: Array.from(new Set([...(providerFields.providerWarnings ?? []), ...(Array.isArray(candidate?.providerWarnings) ? candidate.providerWarnings.map(String) : [])])),
    providerApplyBlockReasons: Array.from(new Set([...(providerFields.providerApplyBlockReasons ?? []), ...(Array.isArray(candidate?.providerApplyBlockReasons) ? candidate.providerApplyBlockReasons.map(String) : [])])),
  };
}

export async function getVisualProviderStatus() {
  const config = getVisualProviderConfig();
  const providers = getProviderDefinitions(config);
  const manualAssets = listManualImportAssets();
  const premiumLibrary = readPremiumLibraryIndex();
  const candidates = readImageCandidateStore().imageCandidates.map(enrichCandidateProviderFields).map(withFileState);
  const candidatesByProvider = visualProviderTypes.reduce((acc, provider) => {
    acc[provider] = candidates.filter((candidate) => candidate.provider === provider).length;
    return acc;
  }, {});
  const warnings = [];
  const recommendations = [];

  if (config.currentProvider === "placeholder" && !config.allowPlaceholderPremium) {
    warnings.push("Current provider is placeholder and ALLOW_PLACEHOLDER_PREMIUM=false; generated candidates are demo/notPremium.");
    recommendations.push("Use manual_upload or premium_library for the first production-grade premium candidate.");
  }
  if (!manualAssets.length) recommendations.push("Place one PNG/JPG/WebP in data/manual-visual-imports/ to use manual_upload.");
  if (!premiumLibrary.items.length) recommendations.push("Add reviewed premium images to data/premium-visual-library/index.json before using premium_library.");

  return {
    status: "ok",
    currentProvider: config.currentProvider,
    allowPlaceholderPremium: config.allowPlaceholderPremium,
    manualImportEnabled: config.manualImportEnabled,
    externalAiConfigured: config.externalAiConfigured,
    localComfyUiConfigured: config.localComfyUiConfigured,
    providers,
    manualImportStatus: {
      directory: path.relative(root, manualImportDir),
      enabled: config.manualImportEnabled,
      availableAssets: manualAssets.length,
      assets: manualAssets,
      message: manualAssets.length ? "manual assets available" : "no manual assets found",
    },
    premiumLibraryStatus: {
      directory: path.relative(root, premiumLibraryDir),
      indexPath: path.relative(root, premiumLibraryIndexFile),
      count: premiumLibrary.items.length,
      items: premiumLibrary.items,
      errors: premiumLibrary.errors,
    },
    candidatesByProvider,
    candidates: candidates.map((candidate) => ({
      draftId: candidate.draftId,
      postId: candidate.postId,
      channelId: candidate.channelId,
      provider: candidate.provider,
      visualQualityStatus: candidate.visualQualityStatus,
      premiumUsable: candidate.premiumUsable,
      placeholderProviderUsed: candidate.placeholderProviderUsed,
      fileExists: candidate.fileExists,
      providerWarnings: candidate.providerWarnings,
    })),
    warnings,
    recommendations,
    productionStoreMode: "json",
    sourceOfTruth: "json",
    telegramRealSendWasNotRun: true,
    githubActionsWereNotTriggered: true,
    lastCheckedAt: new Date().toISOString(),
  };
}

export async function previewManualAssetImport({ draftId = "" } = {}) {
  const assets = listManualImportAssets();
  const draft = selectDraft(draftId);
  return {
    ok: true,
    status: assets.length ? "ok" : "warning",
    mode: "dry-run",
    message: assets.length ? "Manual assets are available. No files were changed." : "no manual assets found",
    selectedDraft: draft ? draftSummary(draft) : null,
    availableAssets: assets,
    wouldImportCount: assets.length && draft ? 1 : 0,
    wroteFiles: false,
    wroteJson: false,
    telegramRealSendWasNotRun: true,
    githubActionsWereNotTriggered: true,
    publishedPostsChanged: false,
    oldImagesDeleted: false,
    lastCheckedAt: new Date().toISOString(),
  };
}

export async function importManualAsset({ draftId = "" } = {}) {
  const config = getVisualProviderConfig();
  if (!config.manualImportEnabled) return blockedResult("manual_upload is disabled by ENABLE_MANUAL_VISUAL_IMPORT=false.", "import");

  const assets = listManualImportAssets();
  if (!assets.length) {
    return {
      ok: true,
      status: "warning",
      mode: "import",
      message: "no manual assets found",
      imageCandidatesCreated: 0,
      wroteFiles: false,
      wroteJson: false,
      telegramRealSendWasNotRun: true,
      githubActionsWereNotTriggered: true,
      publishedPostsChanged: false,
      oldImagesDeleted: false,
      lastCheckedAt: new Date().toISOString(),
    };
  }

  const draft = selectDraft(draftId);
  if (!draft) return blockedResult("No active visual regeneration draft was found for manual import.", "import");

  const asset = assets[0];
  const extension = path.extname(asset.filePath).toLowerCase();
  const destination = path.join(imageCandidatesDir, draft.id, `manual-upload-${safeBaseName(asset.name)}${extension}`);
  mkdirSync(path.dirname(destination), { recursive: true });
  copyFileSync(asset.filePath, destination);
  const candidate = buildImportedCandidate({ draft, asset, destination, provider: "manual_upload", sourceNote: "Imported from data/manual-visual-imports." });
  upsertCandidateAndUpdateDraft(candidate);

  return {
    ok: true,
    status: "ok",
    mode: "import",
    message: "One manual asset was imported as a visual candidate. It was not applied.",
    imageCandidatesCreated: 1,
    imageCandidate: withFileState(candidate),
    wroteFiles: true,
    wroteJson: true,
    telegramRealSendWasNotRun: true,
    githubActionsWereNotTriggered: true,
    publishedPostsChanged: false,
    oldImagesDeleted: false,
    lastCheckedAt: new Date().toISOString(),
  };
}

export async function getManualAssetImportStatus() {
  const candidates = readImageCandidateStore().imageCandidates
    .map(enrichCandidateProviderFields)
    .filter((candidate) => candidate.provider === "manual_upload")
    .map(withFileState);
  return {
    ok: true,
    status: "ok",
    mode: "status",
    manualImportDirectory: path.relative(root, manualImportDir),
    availableAssets: listManualImportAssets(),
    importedCandidates: candidates,
    summary: {
      availableAssets: listManualImportAssets().length,
      importedCandidates: candidates.length,
      fileExists: candidates.filter((candidate) => candidate.fileExists).length,
    },
    message: listManualImportAssets().length ? "manual assets available" : "no manual assets found",
    telegramRealSendWasNotRun: true,
    githubActionsWereNotTriggered: true,
    lastCheckedAt: new Date().toISOString(),
  };
}

export async function getPremiumLibraryStatus() {
  const library = readPremiumLibraryIndex();
  const candidates = readImageCandidateStore().imageCandidates
    .map(enrichCandidateProviderFields)
    .filter((candidate) => candidate.provider === "premium_library")
    .map(withFileState);
  return {
    ok: library.errors.length === 0,
    status: library.errors.length ? "warning" : "ok",
    mode: "status",
    libraryDirectory: path.relative(root, premiumLibraryDir),
    indexPath: path.relative(root, premiumLibraryIndexFile),
    count: library.items.length,
    items: library.items,
    candidates,
    errors: library.errors,
    telegramRealSendWasNotRun: true,
    githubActionsWereNotTriggered: true,
    lastCheckedAt: new Date().toISOString(),
  };
}

export async function previewPremiumLibraryCandidate({ draftId = "" } = {}) {
  const library = readPremiumLibraryIndex();
  const draft = selectDraft(draftId);
  const item = selectLibraryItem(library.items, draft);
  return {
    ok: true,
    status: item && draft ? "ok" : "warning",
    mode: "dry-run",
    message: item && draft ? "One premium library candidate can be created. No files were changed." : "No matching premium library asset was found.",
    selectedDraft: draft ? draftSummary(draft) : null,
    selectedLibraryItem: item,
    libraryCount: library.items.length,
    errors: library.errors,
    wroteFiles: false,
    wroteJson: false,
    telegramRealSendWasNotRun: true,
    githubActionsWereNotTriggered: true,
    lastCheckedAt: new Date().toISOString(),
  };
}

export async function createPremiumLibraryCandidate({ draftId = "" } = {}) {
  const library = readPremiumLibraryIndex();
  const draft = selectDraft(draftId);
  const item = selectLibraryItem(library.items, draft);
  if (!draft) return blockedResult("No active visual regeneration draft was found for premium library candidate.", "create");
  if (!item) {
    return {
      ok: true,
      status: "warning",
      mode: "create",
      message: "No matching premium library asset was found. No candidate was created.",
      imageCandidatesCreated: 0,
      libraryCount: library.items.length,
      errors: library.errors,
      telegramRealSendWasNotRun: true,
      githubActionsWereNotTriggered: true,
      publishedPostsChanged: false,
      oldImagesDeleted: false,
      lastCheckedAt: new Date().toISOString(),
    };
  }

  const sourcePath = path.isAbsolute(item.filePath) ? item.filePath : path.join(root, item.filePath);
  if (!fileExists(sourcePath)) return blockedResult(`Premium library file does not exist: ${item.filePath}`, "create");
  const extension = path.extname(sourcePath).toLowerCase();
  const destination = path.join(imageCandidatesDir, draft.id, `premium-library-${safeBaseName(item.id)}${extension}`);
  mkdirSync(path.dirname(destination), { recursive: true });
  copyFileSync(sourcePath, destination);
  const candidate = buildImportedCandidate({ draft, asset: { ...item, name: path.basename(sourcePath), filePath: sourcePath }, destination, provider: "premium_library", sourceNote: item.sourceNote ?? "Selected from premium visual library." });
  upsertCandidateAndUpdateDraft(candidate);

  return {
    ok: true,
    status: "ok",
    mode: "create",
    message: "One premium library candidate was created. It was not applied.",
    imageCandidatesCreated: 1,
    imageCandidate: withFileState(candidate),
    telegramRealSendWasNotRun: true,
    githubActionsWereNotTriggered: true,
    publishedPostsChanged: false,
    oldImagesDeleted: false,
    lastCheckedAt: new Date().toISOString(),
  };
}

function buildImportedCandidate({ draft, asset, destination, provider, sourceNote }) {
  const fileInfo = inspectImageFile(destination);
  return enrichCandidateProviderFields({
    draftId: draft.id,
    postId: draft.postId,
    channelId: draft.channelId,
    oldImagePath: draft.oldImage,
    newImageCandidatePath: destination,
    candidatePath: destination,
    originalFileName: asset.name ?? path.basename(asset.filePath),
    newPremiumPrompt: draft.newPremiumPrompt,
    prompt: draft.newPremiumPrompt,
    negativePrompt: draft.negativePrompt,
    qualityReasons: Array.isArray(draft.issues) ? draft.issues : [],
    generationStatus: "generated",
    generatorUsed: provider,
    provider,
    visualQualityStatus: "pending_review",
    createdAt: new Date().toISOString(),
    importedAt: new Date().toISOString(),
    visualQualityEstimate: {
      expectedVisualQualityScore: Number(draft.scores?.expectedAfter?.visualQualityScore ?? 86),
      expectedPremiumScore: Number(draft.scores?.expectedAfter?.premiumScore ?? 100),
      expectedChannelFitScore: Number(draft.scores?.expectedAfter?.channelFitScore ?? 88),
      qualityStatus: "pending_review",
      issues: fileInfo.issues,
      fileSize: fileInfo.fileSize,
      width: fileInfo.width,
      height: fileInfo.height,
    },
    backupPath: draft.backupPath,
    draftStatus: draft.status,
    approved: Boolean(draft.approved),
    applied: Boolean(draft.applied),
    previewComparable: Boolean(draft.oldImage && destination),
    publishedPostsChanged: false,
    telegramRealSendWasNotRun: true,
    sourceNote,
    licenseNote: asset.licenseNote ?? null,
    libraryId: provider === "premium_library" ? asset.id : null,
  });
}

function upsertCandidateAndUpdateDraft(candidate) {
  const store = readImageCandidateStore();
  const nextCandidates = sortCandidates([...store.imageCandidates.map(enrichCandidateProviderFields).filter((row) => row.draftId !== candidate.draftId), candidate]);
  writeJson(imageCandidatesFile, { version: 1, updatedAt: new Date().toISOString(), imageCandidates: nextCandidates });

  const draftsStore = readDraftStore();
  const nextDrafts = draftsStore.drafts.map((draft) => draft.id === candidate.draftId
    ? {
        ...draft,
        updatedAt: new Date().toISOString(),
        newImagePath: candidate.newImageCandidatePath,
        realImageGeneration: "generated",
        realImageGenerationNote: `One ${candidate.provider} image candidate was imported as a draft asset only.`,
        imageCandidate: candidate,
      }
    : draft);
  writeJson(draftsFile, { ...draftsStore, version: 1, updatedAt: new Date().toISOString(), drafts: sortDrafts(nextDrafts) });
}

function selectDraft(draftId = "") {
  const drafts = readDraftStore().drafts.map(normalizeDraft);
  if (draftId) return drafts.find((draft) => draft.id === draftId) ?? null;
  return sortDrafts(drafts)
    .filter((draft) => draft.channelId === targetChannelId)
    .filter((draft) => !draft.applied)
    .filter((draft) => ["draft", "approved", "needs_changes"].includes(draft.status))
    .filter((draft) => !draft.previewOnly)
    .slice(0, 1)[0] ?? null;
}

function selectLibraryItem(items, draft) {
  if (!draft) return null;
  return items.find((item) => item.channelId === draft.channelId) ?? items[0] ?? null;
}

function listManualImportAssets() {
  if (!existsSync(manualImportDir)) return [];
  return readdirSync(manualImportDir, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(manualImportDir, entry.name))
    .filter((filePath) => imageExtensions.has(path.extname(filePath).toLowerCase()))
    .map((filePath) => {
      const stats = statSync(filePath);
      return {
        name: path.basename(filePath),
        filePath,
        relativePath: path.relative(root, filePath),
        size: stats.size,
        updatedAt: stats.mtime.toISOString(),
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name));
}

function readPremiumLibraryIndex() {
  const fallback = { items: [], errors: [] };
  if (!existsSync(premiumLibraryIndexFile)) return fallback;
  try {
    const parsed = JSON.parse(readFileSync(premiumLibraryIndexFile, "utf8"));
    const rawItems = Array.isArray(parsed) ? parsed : Array.isArray(parsed.items) ? parsed.items : [];
    return {
      items: rawItems.map((item) => ({
        id: String(item?.id ?? ""),
        channelId: String(item?.channelId ?? ""),
        tags: Array.isArray(item?.tags) ? item.tags.map(String) : [],
        style: String(item?.style ?? ""),
        filePath: String(item?.filePath ?? ""),
        sourceNote: String(item?.sourceNote ?? ""),
        licenseNote: String(item?.licenseNote ?? ""),
        createdAt: String(item?.createdAt ?? ""),
      })).filter((item) => item.id && item.filePath),
      errors: [],
    };
  } catch (error) {
    return { ...fallback, errors: [`${path.relative(root, premiumLibraryIndexFile)} could not be parsed: ${error instanceof Error ? error.message : String(error)}`] };
  }
}

function readImageCandidateStore() {
  const fallback = { version: 1, updatedAt: null, imageCandidates: [] };
  if (!existsSync(imageCandidatesFile)) return fallback;
  try {
    const parsed = JSON.parse(readFileSync(imageCandidatesFile, "utf8"));
    if (Array.isArray(parsed)) return { ...fallback, imageCandidates: parsed };
    if (Array.isArray(parsed.imageCandidates)) return { ...fallback, ...parsed };
    return fallback;
  } catch {
    return fallback;
  }
}

function readDraftStore() {
  const fallback = { version: 1, updatedAt: null, drafts: [] };
  if (!existsSync(draftsFile)) return fallback;
  try {
    const parsed = JSON.parse(readFileSync(draftsFile, "utf8"));
    if (Array.isArray(parsed)) return { ...fallback, drafts: parsed };
    if (Array.isArray(parsed.drafts)) return { ...fallback, ...parsed };
    return fallback;
  } catch {
    return fallback;
  }
}

function normalizeDraft(draft) {
  return {
    ...(draft && typeof draft === "object" ? draft : {}),
    id: String(draft?.id ?? ""),
    postId: String(draft?.postId ?? ""),
    channelId: String(draft?.channelId ?? ""),
    status: String(draft?.status ?? "draft"),
    approved: Boolean(draft?.approved),
    applied: Boolean(draft?.applied),
    previewOnly: Boolean(draft?.previewOnly),
    oldImage: String(draft?.oldImage ?? ""),
    newPremiumPrompt: String(draft?.newPremiumPrompt ?? ""),
    negativePrompt: String(draft?.negativePrompt ?? ""),
    issues: Array.isArray(draft?.issues) ? draft.issues.map(String) : [],
    scores: draft?.scores && typeof draft.scores === "object" ? draft.scores : {},
    createdAt: String(draft?.createdAt ?? new Date(0).toISOString()),
    updatedAt: String(draft?.updatedAt ?? draft?.createdAt ?? new Date(0).toISOString()),
  };
}

function withFileState(candidate) {
  const fileExistsValue = fileExists(candidate.newImageCandidatePath);
  return {
    ...candidate,
    fileExists: fileExistsValue,
    previewComparable: Boolean(candidate.oldImagePath && fileExistsValue),
    publicCandidateUrl: fileExistsValue ? filePathToPublicUrl(candidate.newImageCandidatePath) : null,
    publicOldImageUrl: filePathToPublicUrl(candidate.oldImagePath),
  };
}

function inspectImageFile(filePath) {
  const issues = [];
  const fileSize = fileExists(filePath) ? statSync(filePath).size : 0;
  const extension = path.extname(filePath).toLowerCase();
  let width = null;
  let height = null;

  try {
    const buffer = readFileSync(filePath);
    if (extension === ".png" && buffer.length >= 24 && buffer.toString("ascii", 1, 4) === "PNG") {
      width = buffer.readUInt32BE(16);
      height = buffer.readUInt32BE(20);
    }
  } catch {
    issues.push("image_inspection_failed");
  }

  if (!fileSize) issues.push("file_missing_or_empty");
  return { fileSize, width, height, issues };
}

function fileExists(filePath) {
  if (!filePath || !path.isAbsolute(filePath)) return false;
  try {
    return existsSync(filePath) && statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function filePathToPublicUrl(filePath) {
  if (!filePath) return null;
  const normalized = path.resolve(filePath);
  const publicRoot = path.join(root, "public");
  if (!normalized.startsWith(publicRoot)) return null;
  return `/${path.relative(publicRoot, normalized).replaceAll("\\", "/")}`;
}

function draftSummary(draft) {
  return {
    draftId: draft.id,
    postId: draft.postId,
    channelId: draft.channelId,
    status: draft.status,
    approved: draft.approved,
    applied: draft.applied,
  };
}

function safeBaseName(value) {
  return String(value ?? "asset").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 90) || "asset";
}

function sortDrafts(drafts) {
  return [...drafts].sort((left, right) => (Date.parse(right.createdAt) || 0) - (Date.parse(left.createdAt) || 0) || left.id.localeCompare(right.id));
}

function sortCandidates(candidates) {
  return [...candidates].sort((left, right) => (Date.parse(right.createdAt) || 0) - (Date.parse(left.createdAt) || 0) || left.draftId.localeCompare(right.draftId));
}

function ensureProviderDirs() {
  mkdirSync(manualImportDir, { recursive: true });
  mkdirSync(premiumLibraryDir, { recursive: true });
  if (!existsSync(premiumLibraryIndexFile)) {
    writeJson(premiumLibraryIndexFile, { version: 1, items: [] });
  }
}

function writeJson(filePath, value) {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function blockedResult(message, mode) {
  return {
    ok: false,
    status: "blocked",
    mode,
    message,
    imageCandidatesCreated: 0,
    wroteFiles: false,
    wroteJson: false,
    telegramRealSendWasNotRun: true,
    githubActionsWereNotTriggered: true,
    publishedPostsChanged: false,
    oldImagesDeleted: false,
    lastCheckedAt: new Date().toISOString(),
  };
}
