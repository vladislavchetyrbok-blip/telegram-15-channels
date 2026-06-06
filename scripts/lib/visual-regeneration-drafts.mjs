import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { getPremiumVisualQualityAnalysis } from "./premium-visual-quality.mjs";
import { enrichCandidateProviderFields, premiumScoreThreshold } from "./visual-provider-system.mjs";

const root = process.cwd();
const runtimeDir = path.join(root, "data", "runtime");
const weeklyContentPlanFile = path.join(runtimeDir, "weekly-content-plan.json");
export const visualRegenerationDraftsDir = path.join(root, "data", "visual-regeneration-drafts");
export const visualRegenerationDraftsFile = path.join(visualRegenerationDraftsDir, "visual-regeneration-drafts.json");
const backupRoot = path.join(visualRegenerationDraftsDir, "backups");

const targetChannelId = "ai-tech";
const draftStatuses = new Set(["draft", "approved", "rejected", "needs_changes", "applied"]);
const activeStatuses = new Set(["draft", "approved", "needs_changes"]);

export async function previewVisualRegenerationDraftCreation({ limit = 2 } = {}) {
  return buildDraftCreationReport({ write: false, limit });
}

export async function createVisualRegenerationDrafts({ limit = 2 } = {}) {
  return buildDraftCreationReport({ write: true, limit });
}

export async function getVisualRegenerationDraftStatus() {
  const errors = [];
  const store = readDraftStore(errors);
  const drafts = sortDrafts(store.drafts);
  const rows = drafts.map((draft) => buildApplyRow(draft, readWeeklyContentPlan(errors).items));
  const warnings = [];

  if (drafts.some((draft) => draft.previewOnly)) warnings.push("Some visual drafts are preview-only because their source posts are already published.");
  if (drafts.some((draft) => draft.status === "approved" && !draft.applied)) warnings.push("Approved visual draft(s) exist; apply still requires CLI flags and a draft id.");

  return {
    status: errors.length ? "error" : warnings.length ? "warning" : "ok",
    productionStoreMode: "json",
    sourceOfTruth: "json",
    safeToSwitchToSupabase: false,
    storePath: path.relative(root, visualRegenerationDraftsFile),
    backupRoot: path.relative(root, backupRoot),
    summary: buildSummary(drafts),
    drafts: rows.map(toStatusPreview),
    draftsByStatus: countBy(drafts, "status"),
    draftsByChannel: countBy(drafts, "channelId"),
    applySafety: rows.map((row) => ({
      draftId: row.draft.id,
      postId: row.draft.postId,
      channelId: row.draft.channelId,
      status: row.draft.status,
      safeToApply: row.safeToApply,
      blockReasons: row.blockReasons,
      affectedFields: row.affectedFields,
    })),
    warnings: Array.from(new Set(warnings)),
    errors: Array.from(new Set(errors)),
    telegramRealSendWasNotRun: true,
    githubActionsWereNotTriggered: true,
    publishSchedulerChanged: false,
    lastCheckedAt: new Date().toISOString(),
  };
}

export async function reviewVisualRegenerationDraft({ draftId, action, note }) {
  if (!draftId) {
    return { ok: false, message: "Missing required --draft-id value. No visual drafts were changed.", errors: ["Missing draftId."] };
  }

  if (!["approve", "reject", "needs_changes"].includes(action)) {
    return { ok: false, message: "Choose exactly one review action: approve, reject, or needs_changes. No visual drafts were changed.", errors: ["Invalid review action."] };
  }

  const errors = [];
  const store = readDraftStore(errors);
  if (errors.length) {
    return { ok: false, message: "Visual draft store could not be read. No visual drafts were changed.", errors };
  }

  const drafts = store.drafts.map(normalizeDraft);
  const draftIndex = drafts.findIndex((draft) => draft.id === draftId);
  if (draftIndex === -1) {
    return { ok: false, message: `Visual draft ${draftId} was not found. No visual drafts were changed.`, errors: [`Draft ${draftId} was not found.`] };
  }

  const now = new Date().toISOString();
  const nextDraft = applyReviewAction(drafts[draftIndex], { action, note, now });
  const nextDrafts = drafts.map((draft, index) => (index === draftIndex ? nextDraft : draft));
  mkdirSync(visualRegenerationDraftsDir, { recursive: true });
  writeDraftStore(nextDrafts);

  return {
    ok: true,
    message: `Visual draft ${draftId} review status updated to ${nextDraft.status}.`,
    draft: nextDraft,
    summary: buildSummary(nextDrafts),
    productionStoreMode: "json",
    sourceOfTruth: "json",
    telegramRealSendWasNotRun: true,
    githubActionsWereNotTriggered: true,
    postsWereNotPublished: true,
    lastReviewedAt: now,
  };
}

export async function previewVisualRegenerationDraftApply({ draftId } = {}) {
  return buildApplyReport({ draftId, write: false, confirm: false });
}

export async function applyVisualRegenerationDraft({ draftId, confirm }) {
  return buildApplyReport({ draftId, write: true, confirm });
}

async function buildDraftCreationReport({ write, limit }) {
  const errors = [];
  const warnings = [];
  const plan = readWeeklyContentPlan(errors);
  const store = readDraftStore(errors);
  const activeKeys = new Set(store.drafts.filter(isActiveDraft).map((draft) => draft.sourceKey));
  const analysis = await getPremiumVisualQualityAnalysis({ sampleLimit: 20 });
  const candidates = selectCandidates(analysis.weakVisuals, plan.items, limit);
  const skippedExisting = [];
  const draftsToCreate = [];

  for (const candidate of candidates) {
    if (activeKeys.has(candidate.sourceKey)) {
      skippedExisting.push(candidate);
      continue;
    }
    draftsToCreate.push(candidate);
  }

  const createdDrafts = write ? draftsToCreate.map(candidateToDraft) : [];
  if (write && createdDrafts.length) {
    mkdirSync(visualRegenerationDraftsDir, { recursive: true });
    for (const draft of createdDrafts) {
      createDraftBackup(draft);
    }
    writeDraftStore([...store.drafts, ...createdDrafts]);
  }

  if (!candidates.length) warnings.push("No ai-tech visual regeneration candidates were found.");
  if (analysis.errors?.length) errors.push(...analysis.errors);
  if (analysis.warnings?.length) warnings.push(...analysis.warnings);

  return {
    status: errors.length ? "error" : "ok",
    mode: write ? "create" : "dry-run",
    productionStoreMode: "json",
    sourceOfTruth: "json",
    safeToSwitchToSupabase: false,
    targetChannelId,
    selectionLimit: limit,
    storePath: path.relative(root, visualRegenerationDraftsFile),
    backupRoot: path.relative(root, backupRoot),
    candidates: candidates.length,
    skippedExistingDrafts: skippedExisting.length,
    createdDrafts: createdDrafts.length,
    candidatePreview: candidates.map(toCandidatePreview),
    skippedExistingPreview: skippedExisting.map(toCandidatePreview),
    draftPreview: createdDrafts.map((draft) => toStatusPreview(buildApplyRow(draft, plan.items))),
    realImageGeneration: "not_run",
    realImageGenerationNote: "Controlled Visual Regeneration v1 creates draft prompts and placeholder image metadata only; no external image generation was run.",
    telegramRealSendWasNotRun: true,
    githubActionsWereNotTriggered: true,
    publishSchedulerChanged: false,
    warnings: Array.from(new Set(warnings)),
    errors: Array.from(new Set(errors)),
    lastCheckedAt: new Date().toISOString(),
  };
}

function selectCandidates(weakVisuals, posts, limit) {
  const postsById = new Map(posts.map((post) => [postIdFor(post), post]));
  const aiTech = weakVisuals
    .filter((item) => item.channelId === targetChannelId)
    .map((item) => buildCandidate(item, postsById.get(item.postId)))
    .filter(Boolean);
  const safe = aiTech.filter((candidate) => !candidate.isPublished && candidate.isTestSafe);
  const published = aiTech.filter((candidate) => candidate.isPublished);
  const selected = safe.length ? safe : published;

  return selected.slice(0, Math.max(1, Math.min(2, limit)));
}

function buildCandidate(item, sourcePost) {
  if (!item?.postId) return null;
  const sourceImagePath = imagePathFor(sourcePost) || item.originalImage || "";
  const isPublished = isPublishedPost(sourcePost) || item.isPublished;
  const safeStatus = String(sourcePost?.status ?? item.status ?? "").toLowerCase();
  const isTestSafe = !isPublished && ["scheduled", "ready_to_publish", "draft", "queued", "test_safe", "test-safe"].includes(safeStatus);
  const expectedAfter = {
    visualQualityScore: Math.max(item.visualQualityScore, 86),
    premiumScore: Math.max(item.premiumScore, 90),
    channelFitScore: Math.max(item.channelFitScore, 88),
  };
  const createdAtHint = new Date().toISOString().replace(/\D/g, "");
  const sourceKey = `${item.postId}::visual`;

  return {
    sourceKey,
    idSeed: `${createdAtHint}_${slugify(item.postId)}`,
    postId: item.postId,
    channelId: item.channelId,
    channelName: sourcePost?.channelName ?? item.channelName ?? item.channelId,
    title: item.title,
    status: sourcePost?.status ?? item.status ?? "unknown",
    isPublished,
    isTestSafe,
    previewOnly: isPublished,
    oldImage: sourceImagePath,
    oldPrompt: item.originalImagePrompt || sourcePost?.imagePrompt || sourcePost?.visualPrompt || sourcePost?.visualMetadata?.prompt || "",
    newPremiumPrompt: item.improvedPrompt,
    negativePrompt: item.negativePrompt,
    regenerationReason: item.reason,
    scores: {
      before: {
        visualQualityScore: item.visualQualityScore,
        premiumScore: item.premiumScore,
        channelFitScore: item.channelFitScore,
      },
      expectedAfter,
      expectedImprovement: {
        visualQualityScore: expectedAfter.visualQualityScore - item.visualQualityScore,
        premiumScore: expectedAfter.premiumScore - item.premiumScore,
        channelFitScore: expectedAfter.channelFitScore - item.channelFitScore,
      },
    },
    issues: item.flags,
    visualMode: item.visualMode,
    imageCount: item.imageCount,
  };
}

function candidateToDraft(candidate) {
  const createdAt = new Date().toISOString();
  const id = `visual_draft_${createdAt.replace(/\D/g, "")}_${slugify(candidate.postId)}`;
  const backupPath = candidate.oldImage ? path.join(backupRoot, id, path.basename(candidate.oldImage)) : null;

  return {
    id,
    sourceKey: candidate.sourceKey,
    postId: candidate.postId,
    channelId: candidate.channelId,
    channelName: candidate.channelName,
    title: candidate.title,
    sourceStatus: candidate.status,
    createdAt,
    updatedAt: createdAt,
    status: "draft",
    approved: false,
    approvedAt: null,
    rejectedAt: null,
    reviewNote: "",
    applied: false,
    appliedAt: null,
    previewOnly: candidate.previewOnly,
    isPublishedSource: candidate.isPublished,
    isTestSafe: candidate.isTestSafe,
    oldImage: candidate.oldImage,
    oldPrompt: candidate.oldPrompt,
    newPremiumPrompt: candidate.newPremiumPrompt,
    negativePrompt: candidate.negativePrompt,
    newImagePath: null,
    placeholderPath: path.join(visualRegenerationDraftsDir, "previews", `${id}.placeholder.json`),
    backupPath,
    backupCreated: false,
    regenerationReason: candidate.regenerationReason,
    scores: candidate.scores,
    issues: candidate.issues,
    visualMode: candidate.visualMode,
    imageCount: candidate.imageCount,
    realImageGeneration: "not_run",
    realImageGenerationNote: "Draft prompt architecture only; no image file was generated for this draft.",
    applySafety: {
      requiresDraftId: true,
      requiresApplyFlag: true,
      requiresConfirmFlag: true,
      requiresApprovedStatus: true,
      blocksPublishedSource: true,
    },
  };
}

function createDraftBackup(draft) {
  mkdirSync(path.dirname(draft.placeholderPath), { recursive: true });
  writeFileSync(draft.placeholderPath, `${JSON.stringify({
    draftId: draft.id,
    postId: draft.postId,
    channelId: draft.channelId,
    newPremiumPrompt: draft.newPremiumPrompt,
    negativePrompt: draft.negativePrompt,
    note: "Placeholder preview metadata only; no image file was generated.",
    createdAt: draft.createdAt,
  }, null, 2)}\n`, "utf8");

  if (!draft.oldImage || !path.isAbsolute(draft.oldImage) || !existsSync(draft.oldImage)) return;

  mkdirSync(path.dirname(draft.backupPath), { recursive: true });
  if (!existsSync(draft.backupPath)) copyFileSync(draft.oldImage, draft.backupPath);
  draft.backupCreated = existsSync(draft.backupPath);
}

async function buildApplyReport({ draftId, write, confirm }) {
  const errors = [];
  const store = readDraftStore(errors);
  const plan = readWeeklyContentPlan(errors);
  const drafts = store.drafts.map(normalizeDraft);
  const rows = drafts.map((draft) => buildApplyRow(draft, plan.items));

  if (errors.length) {
    return {
      ok: false,
      status: "error",
      mode: write ? "apply" : "dry-run",
      message: "Visual draft apply inputs could not be read. No posts or drafts were changed.",
      errors,
      wroteJson: false,
      published: false,
      githubActionsTriggered: false,
    };
  }

  if (!draftId && !write) {
    return {
      ok: true,
      status: "ok",
      mode: "dry-run",
      message: "Visual draft apply dry-run completed. No posts or drafts were changed.",
      summary: buildApplySummary(rows),
      drafts: rows.map(toApplyPreview),
      productionStoreMode: "json",
      sourceOfTruth: "json",
      wroteJson: false,
      wroteSupabase: false,
      published: false,
      githubActionsTriggered: false,
    };
  }

  if (!draftId) {
    return blockedApplyResponse({ write, message: "Missing required --draft-id value. No posts or drafts were changed.", blockReasons: ["Missing draftId."] });
  }

  const row = rows.find((candidate) => candidate.draft.id === draftId);
  if (!row) {
    return blockedApplyResponse({ write, message: `Visual draft ${draftId} was not found. No posts or drafts were changed.`, blockReasons: [`Draft ${draftId} was not found.`] });
  }

  const blockReasons = [...row.blockReasons];
  if (write && !confirm) blockReasons.push("Confirmed apply requires --confirm-visual-draft-apply.");
  const safeToApply = row.safeToApply && (!write || confirm);

  if (!safeToApply) {
    return {
      ok: false,
      status: "blocked",
      mode: write ? "apply" : "dry-run",
      message: "Visual draft apply is blocked. No posts or drafts were changed.",
      draft: toApplyPreview(row),
      diff: buildApplyDiff(row),
      affectedFields: row.affectedFields,
      blockReasons: Array.from(new Set(blockReasons)),
      productionStoreMode: "json",
      sourceOfTruth: "json",
      wroteJson: false,
      wroteSupabase: false,
      published: false,
      githubActionsTriggered: false,
    };
  }

  if (!write) {
    return {
      ok: true,
      status: "ok",
      mode: "dry-run",
      message: "Visual draft apply dry-run completed. No posts or drafts were changed.",
      draft: toApplyPreview(row),
      diff: buildApplyDiff(row),
      affectedFields: row.affectedFields,
      productionStoreMode: "json",
      sourceOfTruth: "json",
      wroteJson: false,
      wroteSupabase: false,
      published: false,
      githubActionsTriggered: false,
    };
  }

  const now = new Date().toISOString();
  const nextPost = applyDraftToPost(row.sourcePost, row.draft, { now });
  const nextPlan = {
    ...plan.raw,
    updatedAt: now,
    items: plan.items.map((post) => (postIdFor(post) === row.draft.postId ? nextPost : post)),
  };
  const nextDraft = {
    ...row.draft,
    updatedAt: now,
    status: "applied",
    applied: true,
    appliedAt: now,
    applySummary: {
      draftId: row.draft.id,
      postId: row.draft.postId,
      channelId: row.draft.channelId,
      affectedFields: row.affectedFields,
      oldImagePreserved: true,
      imageReplaced: Boolean(row.draft.newImagePath && fileExists(row.draft.newImagePath)),
      publicationWasNotTriggered: true,
      githubActionsWereNotTriggered: true,
      supabaseWasNotChanged: true,
    },
  };
  const nextDrafts = drafts.map((draft) => (draft.id === nextDraft.id ? nextDraft : draft));

  writeJson(weeklyContentPlanFile, nextPlan);
  writeDraftStore(nextDrafts);

  return {
    ok: true,
    status: "ok",
    mode: "apply",
    message: `Visual draft ${row.draft.id} was applied to JSON source post ${row.draft.postId}. No publishing was triggered.`,
    draft: toApplyPreview(buildApplyRow(nextDraft, nextPlan.items)),
    diff: buildApplyDiff(row),
    affectedFields: row.affectedFields,
    productionStoreMode: "json",
    sourceOfTruth: "json",
    wroteJson: true,
    wroteSupabase: false,
    published: false,
    githubActionsTriggered: false,
    telegramRealSendWasNotRun: true,
  };
}

function buildApplyRow(draft, posts) {
  const sourcePost = posts.find((post) => postIdFor(post) === draft.postId) ?? null;
  const blockReasons = [];
  const affectedFields = [];

  if (draft.channelId !== targetChannelId) blockReasons.push("Draft channelId is not ai-tech.");
  if (draft.status !== "approved") blockReasons.push("Draft status is not approved.");
  if (draft.approved !== true) blockReasons.push("Draft approved flag is not true.");
  if (draft.applied === true || draft.status === "applied") blockReasons.push("Draft is already applied.");
  if (draft.previewOnly) blockReasons.push("Draft is preview-only and cannot be applied.");
  if (draft.isPublishedSource) blockReasons.push("Source post is already published.");
  if (!sourcePost) blockReasons.push("Source post was not found in JSON posts.");
  if (sourcePost && isPublishedPost(sourcePost)) blockReasons.push("Source post is already published.");
  if (!isJsonProductionStoreMode()) blockReasons.push("Production store mode is not json.");
  if (!draft.newPremiumPrompt.trim()) blockReasons.push("New premium prompt is empty.");
  const imageCandidate = draft.imageCandidate ? enrichCandidateProviderFields(draft.imageCandidate) : null;
  if (imageCandidate) {
    if (imageCandidate.provider === "placeholder") blockReasons.push("Image candidate uses placeholder provider and is not eligible for premium apply.");
    if (imageCandidate.placeholderProviderUsed) blockReasons.push("Image candidate has placeholderProviderUsed=true.");
    if (imageCandidate.visualQualityStatus !== "approved") blockReasons.push(`Image candidate visualQualityStatus is ${imageCandidate.visualQualityStatus}; expected approved.`);
    if (imageCandidate.premiumUsable === false) blockReasons.push("Image candidate is not marked premiumUsable.");
    for (const reason of imageCandidate.providerApplyBlockReasons ?? []) blockReasons.push(reason);
    const premiumScore = Number(imageCandidate.visualQualityEstimate?.expectedPremiumScore ?? imageCandidate.visualQualityEstimate?.premiumScore ?? 0);
    if (premiumScore > 0 && premiumScore < premiumScoreThreshold) blockReasons.push(`Image candidate premium score ${premiumScore} is below ${premiumScoreThreshold}.`);
    if (imageCandidate.newImageCandidatePath && !fileExists(imageCandidate.newImageCandidatePath)) blockReasons.push("Image candidate file does not exist.");
  }
  if (draft.newImagePath && !fileExists(draft.newImagePath)) blockReasons.push("Draft newImagePath points to a missing file.");

  if (sourcePost && draft.newPremiumPrompt.trim() && draft.newPremiumPrompt.trim() !== String(sourcePost.imagePrompt ?? "")) {
    affectedFields.push("draftImagePrompt", "imagePrompt", "visualRegeneration");
  }
  if (sourcePost && draft.newImagePath && fileExists(draft.newImagePath)) {
    affectedFields.push("draftImagePath", "imagePath", "telegramImagePath", "imageUrl");
  }

  return {
    draft,
    sourcePost,
    safeToApply: blockReasons.length === 0,
    blockReasons,
    affectedFields: Array.from(new Set(affectedFields)),
  };
}

function applyDraftToPost(sourcePost, draft, { now }) {
  const next = { ...sourcePost, updatedAt: now };
  next.draftImagePrompt = draft.newPremiumPrompt.trim();
  next.imagePrompt = draft.newPremiumPrompt.trim();
  next.visualRegeneration = {
    draftId: draft.id,
    appliedAt: now,
    status: "prompt_metadata_applied",
    oldImage: draft.oldImage,
    backupPath: draft.backupPath,
    oldPrompt: draft.oldPrompt,
    newPremiumPrompt: draft.newPremiumPrompt,
    negativePrompt: draft.negativePrompt,
    regenerationReason: draft.regenerationReason,
    scores: draft.scores,
    oldImagePreserved: true,
    publicationWasNotTriggered: true,
  };

  if (draft.newImagePath && fileExists(draft.newImagePath)) {
    next.draftImagePath = draft.newImagePath;
    next.imagePath = draft.newImagePath;
    next.telegramImagePath = draft.newImagePath;
    next.imageUrl = filePathToPublicUrl(draft.newImagePath) ?? next.imageUrl;
    next.telegramImageStatus = "OK";
    next.visualRegeneration.status = "image_and_prompt_applied";
  }

  return next;
}

function toStatusPreview(row) {
  return {
    draftId: row.draft.id,
    postId: row.draft.postId,
    channelId: row.draft.channelId,
    title: row.draft.title,
    sourceStatus: row.draft.sourceStatus,
    status: row.draft.status,
    approved: row.draft.approved,
    applied: row.draft.applied,
    previewOnly: row.draft.previewOnly,
    oldImage: row.draft.oldImage,
    oldPrompt: row.draft.oldPrompt,
    newPremiumPrompt: row.draft.newPremiumPrompt,
    negativePrompt: row.draft.negativePrompt,
    regenerationReason: row.draft.regenerationReason,
    scores: row.draft.scores,
    backupPath: row.draft.backupPath,
    backupCreated: row.draft.backupCreated,
    placeholderPath: row.draft.placeholderPath,
    newImagePath: row.draft.newImagePath,
    realImageGeneration: row.draft.realImageGeneration,
    imageCandidate: row.draft.imageCandidate ? enrichCandidateProviderFields(row.draft.imageCandidate) : null,
    applySafety: {
      safeToApply: row.safeToApply,
      blockReasons: row.blockReasons,
      affectedFields: row.affectedFields,
    },
    createdAt: row.draft.createdAt,
    updatedAt: row.draft.updatedAt,
  };
}

function toApplyPreview(row) {
  return {
    draftId: row.draft.id,
    postId: row.draft.postId,
    channelId: row.draft.channelId,
    title: row.draft.title,
    status: row.draft.status,
    approved: row.draft.approved,
    applied: row.draft.applied,
    previewOnly: row.draft.previewOnly,
    sourceStatus: row.sourcePost?.status ?? row.draft.sourceStatus,
    oldImage: row.draft.oldImage,
    newImagePath: row.draft.newImagePath,
    imageCandidateProvider: row.draft.imageCandidate ? enrichCandidateProviderFields(row.draft.imageCandidate).provider : null,
    imageCandidateVisualQualityStatus: row.draft.imageCandidate ? enrichCandidateProviderFields(row.draft.imageCandidate).visualQualityStatus : null,
    oldPrompt: row.draft.oldPrompt,
    newPremiumPrompt: row.draft.newPremiumPrompt,
    negativePrompt: row.draft.negativePrompt,
    regenerationReason: row.draft.regenerationReason,
    backupPath: row.draft.backupPath,
    safeToApply: row.safeToApply,
    blockReasons: row.blockReasons,
    affectedFields: row.affectedFields,
  };
}

function buildApplyDiff(row) {
  return {
    imagePrompt: {
      original: String(row.sourcePost?.imagePrompt ?? row.sourcePost?.draftImagePrompt ?? row.draft.oldPrompt ?? ""),
      draft: row.draft.newPremiumPrompt,
      changed: row.affectedFields.includes("imagePrompt"),
    },
    image: {
      originalImagePath: imagePathFor(row.sourcePost) || row.draft.oldImage,
      draftImagePath: row.draft.newImagePath,
      changed: row.affectedFields.includes("imagePath"),
      oldImagePreserved: true,
    },
    visualRegeneration: {
      regenerationReason: row.draft.regenerationReason,
      scores: row.draft.scores,
      backupPath: row.draft.backupPath,
    },
  };
}

function blockedApplyResponse({ write, message, blockReasons }) {
  return {
    ok: false,
    status: "blocked",
    mode: write ? "apply" : "dry-run",
    message,
    blockReasons,
    productionStoreMode: "json",
    sourceOfTruth: "json",
    wroteJson: false,
    wroteSupabase: false,
    published: false,
    githubActionsTriggered: false,
  };
}

function buildSummary(drafts) {
  return {
    totalDrafts: drafts.length,
    draft: drafts.filter((draft) => draft.status === "draft").length,
    approved: drafts.filter((draft) => draft.status === "approved").length,
    rejected: drafts.filter((draft) => draft.status === "rejected").length,
    needsChanges: drafts.filter((draft) => draft.status === "needs_changes").length,
    applied: drafts.filter((draft) => draft.status === "applied" || draft.applied).length,
    activeDrafts: drafts.filter(isActiveDraft).length,
    previewOnly: drafts.filter((draft) => draft.previewOnly).length,
    withBackup: drafts.filter((draft) => draft.backupCreated).length,
    realImageGenerated: drafts.filter((draft) => draft.realImageGeneration === "generated" && draft.newImagePath).length,
  };
}

function buildApplySummary(rows) {
  return {
    totalDrafts: rows.length,
    approvedNotApplied: rows.filter((row) => row.draft.status === "approved" && !row.draft.applied).length,
    safeToApplyCount: rows.filter((row) => row.safeToApply).length,
    blockedApplyCount: rows.filter((row) => !row.safeToApply).length,
  };
}

function toCandidatePreview(candidate) {
  return {
    postId: candidate.postId,
    channelId: candidate.channelId,
    title: candidate.title,
    sourceStatus: candidate.status,
    isPublished: candidate.isPublished,
    isTestSafe: candidate.isTestSafe,
    previewOnly: candidate.previewOnly,
    oldImage: candidate.oldImage,
    oldPrompt: candidate.oldPrompt,
    newPremiumPrompt: candidate.newPremiumPrompt,
    negativePrompt: candidate.negativePrompt,
    regenerationReason: candidate.regenerationReason,
    scores: candidate.scores,
    issues: candidate.issues,
  };
}

function readWeeklyContentPlan(errors = []) {
  const fallback = { version: 1, updatedAt: null, items: [] };
  const raw = readJson(weeklyContentPlanFile, fallback, errors);
  if (!Array.isArray(raw.items)) {
    errors.push(`${path.relative(root, weeklyContentPlanFile)} does not contain an items array.`);
    return { raw: fallback, items: [] };
  }
  return { raw, items: raw.items };
}

function readDraftStore(errors = []) {
  const fallback = { version: 1, updatedAt: null, drafts: [] };
  if (!existsSync(visualRegenerationDraftsFile)) return fallback;
  const parsed = readJson(visualRegenerationDraftsFile, fallback, errors);
  if (Array.isArray(parsed)) return { ...fallback, drafts: parsed.map(normalizeDraft) };
  if (Array.isArray(parsed.drafts)) return { ...fallback, ...parsed, drafts: parsed.drafts.map(normalizeDraft) };
  errors.push(`${path.relative(root, visualRegenerationDraftsFile)} does not contain a drafts array.`);
  return fallback;
}

function writeDraftStore(drafts) {
  const payload = {
    version: 1,
    updatedAt: new Date().toISOString(),
    drafts: sortDrafts(drafts.map(normalizeDraft)),
  };
  mkdirSync(visualRegenerationDraftsDir, { recursive: true });
  writeJson(visualRegenerationDraftsFile, payload);
}

function normalizeDraft(draft) {
  const status = draftStatuses.has(String(draft?.status)) ? String(draft.status) : "draft";
  const approved = status === "approved" ? true : Boolean(draft?.approved);
  const applied = status === "applied" || Boolean(draft?.applied);
  return {
    id: String(draft?.id ?? ""),
    sourceKey: String(draft?.sourceKey ?? `${draft?.postId ?? ""}::visual`),
    postId: String(draft?.postId ?? ""),
    channelId: String(draft?.channelId ?? ""),
    channelName: String(draft?.channelName ?? draft?.channelId ?? ""),
    title: String(draft?.title ?? ""),
    sourceStatus: String(draft?.sourceStatus ?? ""),
    createdAt: stringOrNull(draft?.createdAt) ?? new Date(0).toISOString(),
    updatedAt: stringOrNull(draft?.updatedAt) ?? stringOrNull(draft?.createdAt) ?? new Date(0).toISOString(),
    status,
    approved,
    approvedAt: approved ? stringOrNull(draft?.approvedAt) : null,
    rejectedAt: status === "rejected" ? stringOrNull(draft?.rejectedAt) : null,
    reviewNote: String(draft?.reviewNote ?? ""),
    applied,
    appliedAt: applied ? stringOrNull(draft?.appliedAt) : null,
    previewOnly: Boolean(draft?.previewOnly),
    isPublishedSource: Boolean(draft?.isPublishedSource),
    isTestSafe: Boolean(draft?.isTestSafe),
    oldImage: String(draft?.oldImage ?? ""),
    oldPrompt: String(draft?.oldPrompt ?? ""),
    newPremiumPrompt: String(draft?.newPremiumPrompt ?? ""),
    negativePrompt: String(draft?.negativePrompt ?? ""),
    newImagePath: draft?.newImagePath ? String(draft.newImagePath) : null,
    placeholderPath: String(draft?.placeholderPath ?? ""),
    backupPath: draft?.backupPath ? String(draft.backupPath) : null,
    backupCreated: Boolean(draft?.backupCreated),
    regenerationReason: String(draft?.regenerationReason ?? ""),
    scores: isPlainObject(draft?.scores) ? draft.scores : { before: {}, expectedAfter: {}, expectedImprovement: {} },
    issues: Array.isArray(draft?.issues) ? draft.issues.map(String) : [],
    visualMode: String(draft?.visualMode ?? ""),
    imageCount: Number(draft?.imageCount ?? 1),
    realImageGeneration: String(draft?.realImageGeneration ?? "not_run"),
    realImageGenerationNote: String(draft?.realImageGenerationNote ?? ""),
    imageCandidate: isPlainObject(draft?.imageCandidate) ? enrichCandidateProviderFields(draft.imageCandidate) : null,
    applySafety: isPlainObject(draft?.applySafety) ? draft.applySafety : {},
    applySummary: isPlainObject(draft?.applySummary) ? draft.applySummary : null,
  };
}

function applyReviewAction(draft, { action, note, now }) {
  const reviewNote = typeof note === "string" ? note : draft.reviewNote;
  if (action === "approve") {
    return { ...draft, updatedAt: now, status: "approved", approved: true, approvedAt: now, rejectedAt: null, reviewNote, applied: false };
  }
  if (action === "reject") {
    return { ...draft, updatedAt: now, status: "rejected", approved: false, approvedAt: null, rejectedAt: now, reviewNote, applied: false };
  }
  return { ...draft, updatedAt: now, status: "needs_changes", approved: false, approvedAt: null, rejectedAt: null, reviewNote, applied: false };
}

function readJson(filePath, fallback, errors) {
  if (!existsSync(filePath)) return fallback;
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    errors.push(`${path.relative(root, filePath)} could not be parsed: ${error instanceof Error ? error.message : String(error)}`);
    return fallback;
  }
}

function writeJson(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function sortDrafts(drafts) {
  return [...drafts].sort((left, right) => {
    const rightTime = Date.parse(right.createdAt ?? "") || 0;
    const leftTime = Date.parse(left.createdAt ?? "") || 0;
    return rightTime - leftTime || String(left.id).localeCompare(String(right.id));
  });
}

function isActiveDraft(draft) {
  return !draft.applied && activeStatuses.has(String(draft.status ?? "draft"));
}

function postIdFor(post) {
  return stringOrNull(post?.postId) ?? stringOrNull(post?.id) ?? "";
}

function imagePathFor(post) {
  return stringOrNull(post?.telegramImagePath) ?? stringOrNull(post?.imagePath) ?? publicToFilePath(stringOrNull(post?.imageUrl)) ?? publicToFilePath(stringOrNull(post?.previewPath)) ?? "";
}

function isPublishedPost(post) {
  return (
    String(post?.status ?? "").toLowerCase() === "published" ||
    String(post?.status ?? "").toLowerCase() === "sent" ||
    Boolean(post?.telegramMessageId) ||
    String(post?.publishResult ?? "").toLowerCase() === "success"
  );
}

function isJsonProductionStoreMode() {
  const mode = process.env.PUBLISH_DUE_STORE;
  return !mode || String(mode).toLowerCase() === "json";
}

function fileExists(filePath) {
  if (!filePath || !path.isAbsolute(filePath)) return false;
  try {
    return existsSync(filePath) && statSync(filePath).isFile();
  } catch {
    return false;
  }
}

function publicToFilePath(value) {
  if (!value || !value.startsWith("/")) return null;
  return path.join(root, "public", value.replace(/^\/+/, ""));
}

function filePathToPublicUrl(filePath) {
  const normalized = path.resolve(filePath);
  const publicRoot = path.join(root, "public");
  if (!normalized.startsWith(publicRoot)) return null;
  return `/${path.relative(publicRoot, normalized).replaceAll("\\", "/")}`;
}

function countBy(items, key) {
  return items.reduce((counts, item) => {
    const value = String(item[key] ?? "unknown");
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

function slugify(value) {
  return String(value ?? "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "unknown";
}

function stringOrNull(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
