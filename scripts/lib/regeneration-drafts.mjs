import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createSystemBackup, getBackupCenterStatus } from "./backup-center.mjs";
import { getRegenerationQueueReport } from "./regeneration-queue.mjs";

const root = process.cwd();
const runtimeDir = path.join(root, "data", "runtime");
const weeklyContentPlanFile = path.join(runtimeDir, "weekly-content-plan.json");
export const regenerationDraftsDir = path.join(root, "data", "regeneration-drafts");
export const regenerationDraftsFile = path.join(regenerationDraftsDir, "regeneration-drafts.json");

const activeStatuses = new Set(["draft", "approved"]);
const reviewStatuses = new Set(["draft", "approved", "rejected", "needs_changes"]);
const regenerationTypes = new Set(["text", "image", "both", "manual_review"]);
const priorities = new Set(["high", "medium", "low"]);
const staleAfterMs = 7 * 24 * 60 * 60 * 1000;

export async function previewRegenerationDraftCreation() {
  return buildDraftCreationReport({ write: false });
}

export async function createRegenerationDrafts() {
  return buildDraftCreationReport({ write: true });
}

export async function getRegenerationDraftStatus() {
  const errors = [];
  const store = readDraftStore(errors);
  const drafts = sortDrafts(store.drafts);
  const summary = buildDraftSummary(drafts);
  const staleDrafts = drafts.filter(isStaleActiveDraft);
  const warnings = [];

  if (staleDrafts.length) warnings.push(`${staleDrafts.length} active draft(s) are older than 7 days.`);
  if (summary.highPriorityDrafts > 0) warnings.push(`${summary.highPriorityDrafts} high-priority draft(s) need manual review.`);

  return {
    status: errors.length ? "error" : warnings.length ? "warning" : "ok",
    productionStoreMode: "json",
    sourceOfTruth: "json",
    safeToSwitchToSupabase: false,
    storePath: path.relative(root, regenerationDraftsFile),
    summary,
    drafts: drafts.slice(0, 20),
    draftsByChannel: countBy(drafts, "channelId"),
    draftsByType: countBy(drafts, "regenerationType"),
    staleDrafts: staleDrafts.map((draft) => draft.id).slice(0, 20),
    warnings,
    errors,
    lastCheckedAt: new Date().toISOString(),
  };
}

export async function getRegenerationReviewStatus() {
  const errors = [];
  const store = readDraftStore(errors);
  const drafts = sortDrafts(store.drafts);
  const summary = buildReviewSummary(drafts);
  const warnings = [];

  if (summary.highPriorityPending > 0) warnings.push(`${summary.highPriorityPending} high-priority draft(s) are pending manual review.`);
  if (summary.applied > 0) warnings.push(`${summary.applied} draft(s) have applied=true, but review center does not apply drafts.`);

  return {
    status: errors.length ? "error" : warnings.length ? "warning" : "ok",
    productionStoreMode: "json",
    sourceOfTruth: "json",
    safeToSwitchToSupabase: false,
    storePath: path.relative(root, regenerationDraftsFile),
    summary,
    drafts: drafts.slice(0, 20),
    first20Drafts: drafts.slice(0, 20),
    draftsByChannel: countBy(drafts, "channelId"),
    draftsByType: countBy(drafts, "regenerationType"),
    highPriorityPending: drafts.filter(isHighPriorityPending).map((draft) => draft.id).slice(0, 20),
    warnings,
    errors,
    lastCheckedAt: new Date().toISOString(),
  };
}

export async function reviewRegenerationDraft({ draftId, action, note }) {
  const errors = [];
  if (!draftId) {
    return {
      ok: false,
      message: "Missing required --draft-id value. No regeneration drafts were changed.",
      errors: ["Missing draftId."],
    };
  }

  if (!["approve", "reject", "needs_changes"].includes(action)) {
    return {
      ok: false,
      message: "Choose exactly one review action: approve, reject, or needs_changes. No regeneration drafts were changed.",
      errors: ["Invalid review action."],
    };
  }

  const store = readDraftStore(errors);
  if (errors.length) {
    return {
      ok: false,
      message: "Regeneration draft store could not be read. No regeneration drafts were changed.",
      errors,
    };
  }

  const drafts = store.drafts.map(normalizeDraft);
  const draftIndex = drafts.findIndex((draft) => draft.id === draftId);
  if (draftIndex === -1) {
    return {
      ok: false,
      message: `Draft ${draftId} was not found. No regeneration drafts were changed.`,
      errors: [`Draft ${draftId} was not found.`],
    };
  }

  const now = new Date().toISOString();
  const nextDraft = applyReviewAction(drafts[draftIndex], { action, note, now });
  const nextDrafts = drafts.map((draft, index) => (index === draftIndex ? nextDraft : draft));
  mkdirSync(regenerationDraftsDir, { recursive: true });
  writeDraftStore(nextDrafts);

  const sortedDrafts = sortDrafts(nextDrafts);
  const summary = buildReviewSummary(sortedDrafts);

  return {
    ok: true,
    message: `Draft ${draftId} review status updated to ${nextDraft.status}.`,
    draft: nextDraft,
    summary,
    productionStoreMode: "json",
    sourceOfTruth: "json",
    safeToSwitchToSupabase: false,
    appliedDraftsWereNotApplied: true,
    postsWereNotChanged: true,
    lastReviewedAt: now,
  };
}

export async function getDraftApplyStatus() {
  const errors = [];
  const warnings = [];
  const store = readDraftStore(errors);
  const plan = readWeeklyContentPlan(errors);
  const backupStatus = await getBackupCenterStatus().catch(() => null);
  const drafts = sortDrafts(store.drafts);
  const rows = drafts.map((draft) => buildApplyRow(draft, plan.items));
  const approvedNotApplied = rows.filter((row) => row.draft.status === "approved" && row.draft.approved && !row.draft.applied);
  const applied = rows.filter((row) => row.draft.applied);
  const safeRows = approvedNotApplied.filter((row) => row.safeToApply);
  const blockedRows = approvedNotApplied.filter((row) => !row.safeToApply);

  if (blockedRows.length) warnings.push(`${blockedRows.length} approved draft(s) are blocked from apply.`);
  if (!backupStatus?.latestBackup) warnings.push("No existing backup folder was found. A confirmed apply will create one first.");

  return {
    status: errors.length ? "error" : warnings.length ? "warning" : "ok",
    productionStoreMode: "json",
    sourceOfTruth: "json",
    safeToSwitchToSupabase: false,
    summary: {
      totalDrafts: drafts.length,
      approvedNotApplied: approvedNotApplied.length,
      appliedDrafts: applied.length,
      rejected: drafts.filter((draft) => draft.status === "rejected").length,
      needsChanges: drafts.filter((draft) => draft.status === "needs_changes").length,
      safeToApplyCount: safeRows.length,
      blockedApplyCount: blockedRows.length,
    },
    approvedNotApplied: approvedNotApplied.map(toApplyPreview),
    applied: applied.map(toApplyPreview),
    blocked: blockedRows.map(toApplyPreview),
    appliedByChannel: countBy(applied.map((row) => row.draft), "channelId"),
    lastAppliedDrafts: applied
      .filter((row) => row.draft.appliedAt)
      .sort((left, right) => (Date.parse(right.draft.appliedAt ?? "") || 0) - (Date.parse(left.draft.appliedAt ?? "") || 0))
      .slice(0, 10)
      .map(toApplyPreview),
    pendingApprovedDrafts: approvedNotApplied.slice(0, 20).map(toApplyPreview),
    latestBackup: backupStatus?.latestBackup ?? null,
    warnings: Array.from(new Set(warnings)),
    errors: Array.from(new Set(errors)),
    lastCheckedAt: new Date().toISOString(),
  };
}

export async function previewRegenerationDraftApply({ draftId }) {
  return buildDraftApplyReport({ draftId, write: false, confirm: false });
}

export async function applyRegenerationDraft({ draftId, confirm }) {
  return buildDraftApplyReport({ draftId, write: true, confirm });
}

async function buildDraftApplyReport({ draftId, write, confirm }) {
  const errors = [];
  if (!draftId) {
    return {
      ok: false,
      status: "error",
      mode: write ? "apply" : "dry-run",
      message: "Missing required --draft-id value. No posts or drafts were changed.",
      errors: ["Missing draftId."],
    };
  }

  const store = readDraftStore(errors);
  const plan = readWeeklyContentPlan(errors);
  if (errors.length) {
    return {
      ok: false,
      status: "error",
      mode: write ? "apply" : "dry-run",
      message: "Draft apply inputs could not be read. No posts or drafts were changed.",
      errors,
    };
  }

  const drafts = store.drafts.map(normalizeDraft);
  const draftIndex = drafts.findIndex((draft) => draft.id === draftId);
  const draft = draftIndex === -1 ? null : drafts[draftIndex];
  const postIndex = draft ? findPostIndex(plan.items, draft.sourcePostId) : -1;
  const sourcePost = postIndex === -1 ? null : plan.items[postIndex];
  const row = draft ? buildApplyRow(draft, plan.items) : null;
  const blockReasons = row?.blockReasons ?? [`Draft ${draftId} was not found.`];
  const affectedFields = row?.affectedFields ?? [];

  if (write && !confirm) {
    blockReasons.push("Confirmed apply requires --confirm-draft-apply.");
  }

  const safeToApply = Boolean(row?.safeToApply) && (!write || confirm);
  const diff = draft && sourcePost ? buildApplyDiff(sourcePost, draft, affectedFields) : null;

  if (!safeToApply) {
    return {
      ok: false,
      status: "blocked",
      mode: write ? "apply" : "dry-run",
      message: "Draft apply is blocked. No posts or drafts were changed.",
      draft: row ? toApplyPreview(row) : null,
      diff,
      affectedFields,
      blockReasons: Array.from(new Set(blockReasons)),
      warnings: row?.warnings ?? [],
      errors: [],
      productionStoreMode: "json",
      sourceOfTruth: "json",
      safeToSwitchToSupabase: false,
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
      message: "Draft apply dry-run completed. No posts or drafts were changed.",
      draft: toApplyPreview(row),
      diff,
      affectedFields,
      warnings: row.warnings,
      errors: [],
      productionStoreMode: "json",
      sourceOfTruth: "json",
      safeToSwitchToSupabase: false,
      wroteJson: false,
      wroteSupabase: false,
      published: false,
      githubActionsTriggered: false,
    };
  }

  const backup = await createApplyBackup();
  if (!backup.ok) {
    return {
      ok: false,
      status: "error",
      mode: "apply",
      message: "Backup was not created. No posts or drafts were changed.",
      draft: toApplyPreview(row),
      diff,
      affectedFields,
      backup,
      errors: ["Backup creation failed."],
      productionStoreMode: "json",
      sourceOfTruth: "json",
      safeToSwitchToSupabase: false,
      wroteJson: false,
      wroteSupabase: false,
      published: false,
      githubActionsTriggered: false,
    };
  }

  const now = new Date().toISOString();
  const nextPost = applyDraftToPost(sourcePost, draft, { now });
  const nextPlan = {
    ...plan.raw,
    updatedAt: now,
    items: plan.items.map((post, index) => (index === postIndex ? nextPost : post)),
  };
  const applySummary = {
    draftId: draft.id,
    sourcePostId: draft.sourcePostId,
    channelId: draft.channelId,
    regenerationType: draft.regenerationType,
    appliedAt: now,
    affectedFields,
    backupPath: backup.backupDir,
    publicationWasNotTriggered: true,
    githubActionsWereNotTriggered: true,
    supabaseWasNotChanged: true,
  };
  const nextDraft = {
    ...draft,
    updatedAt: now,
    applied: true,
    appliedAt: now,
    applyBackupPath: backup.backupDir,
    applySummary,
  };
  const nextDrafts = drafts.map((candidate, index) => (index === draftIndex ? nextDraft : candidate));

  writeJson(weeklyContentPlanFile, nextPlan);
  mkdirSync(regenerationDraftsDir, { recursive: true });
  writeDraftStore(nextDrafts);

  return {
    ok: true,
    status: "ok",
    mode: "apply",
    message: `Draft ${draft.id} was applied to JSON source post ${draft.sourcePostId}. No publishing was triggered.`,
    draft: toApplyPreview(buildApplyRow(nextDraft, nextPlan.items)),
    diff,
    affectedFields,
    backup,
    applySummary,
    productionStoreMode: "json",
    sourceOfTruth: "json",
    safeToSwitchToSupabase: false,
    wroteJson: true,
    wroteSupabase: false,
    publicationLogsChanged: false,
    schedulerRunsChanged: false,
    published: false,
    githubActionsTriggered: false,
  };
}

async function buildDraftCreationReport({ write }) {
  const errors = [];
  const warnings = [];
  const queueReport = await getRegenerationQueueReport();
  const planPosts = readPlanPosts(errors);
  const postIndex = new Map(planPosts.map((post) => [stringOrNull(post.postId) ?? stringOrNull(post.id), post]));
  const store = readDraftStore(errors);
  const activeKeys = new Set(store.drafts.filter(isActiveDraft).map(draftKey));
  const candidates = queueReport.queue.map((item) => buildCandidate(item, postIndex.get(item.postId))).filter(Boolean);
  const skippedExisting = [];
  const draftsToCreate = [];

  for (const candidate of candidates) {
    if (activeKeys.has(candidate.key)) {
      skippedExisting.push(candidate);
      continue;
    }
    draftsToCreate.push(candidate);
  }

  const createdDrafts = write ? draftsToCreate.map((candidate, index) => candidateToDraft(candidate, index)) : [];
  if (write && createdDrafts.length) {
    mkdirSync(regenerationDraftsDir, { recursive: true });
    writeDraftStore([...store.drafts, ...createdDrafts]);
  }

  if (queueReport.errors?.length) errors.push(...queueReport.errors);
  if (queueReport.warnings?.length) warnings.push(...queueReport.warnings);

  return {
    status: errors.length ? "error" : "ok",
    mode: write ? "create" : "dry-run",
    productionStoreMode: "json",
    sourceOfTruth: "json",
    safeToSwitchToSupabase: false,
    storePath: path.relative(root, regenerationDraftsFile),
    candidates: candidates.length,
    skippedExistingDrafts: skippedExisting.length,
    createdDrafts: createdDrafts.length,
    candidatePreview: candidates.slice(0, 10).map(toCandidatePreview),
    skippedExistingPreview: skippedExisting.slice(0, 10).map(toCandidatePreview),
    draftPreview: createdDrafts.slice(0, 10),
    warnings: Array.from(new Set(warnings)),
    errors: Array.from(new Set(errors)),
    lastCheckedAt: new Date().toISOString(),
  };
}

function buildCandidate(queueItem, sourcePost) {
  if (!queueItem?.postId) return null;

  const originalText = cleanText(
    stringOrNull(sourcePost?.telegramCaption) ??
      stringOrNull(sourcePost?.body) ??
      stringOrNull(sourcePost?.text) ??
      stringOrNull(sourcePost?.excerpt) ??
      "",
  );
  const topic = stringOrNull(sourcePost?.contentTopic) ?? stringOrNull(queueItem.topic) ?? stringOrNull(queueItem.title) ?? "";
  const title = stringOrNull(sourcePost?.title) ?? stringOrNull(queueItem.title) ?? topic;
  const channelName = stringOrNull(sourcePost?.channelName) ?? stringOrNull(queueItem.channel) ?? queueItem.channelId;
  const imagePath =
    stringOrNull(sourcePost?.telegramImagePath) ??
    stringOrNull(sourcePost?.imagePath) ??
    stringOrNull(sourcePost?.imageUrl) ??
    stringOrNull(sourcePost?.previewPath) ??
    "";

  return {
    key: `${queueItem.postId}::${queueItem.regenerationType}`,
    sourcePostId: queueItem.postId,
    channelId: queueItem.channelId,
    channelName,
    regenerationType: queueItem.regenerationType,
    priority: queueItem.priority,
    original: {
      text: originalText,
      imagePath,
      topic,
    },
    draft: {
      text: shouldRewriteText(queueItem.regenerationType)
        ? buildDraftText({ title, topic, channelName, originalText, issues: queueItem.issues })
        : originalText,
      imagePrompt: buildImagePrompt({ title, topic, channelName, imagePath, issues: queueItem.issues }),
      imagePath: null,
    },
    issues: Array.isArray(queueItem.issues) ? queueItem.issues : [],
    recommendation: queueItem.recommendation ?? "Manual review is required before approval.",
  };
}

function buildApplyRow(draft, posts) {
  const sourcePost = posts.find((post) => postIdFor(post) === draft.sourcePostId) ?? null;
  const affectedFields = sourcePost ? getAffectedFields(sourcePost, draft) : [];
  const blockReasons = [];
  const warnings = [];

  if (draft.status !== "approved") blockReasons.push("Draft status is not approved.");
  if (draft.approved !== true) blockReasons.push("Draft approved flag is not true.");
  if (draft.applied === true) blockReasons.push("Draft is already applied.");
  if (!sourcePost) blockReasons.push("Source post was not found in JSON posts.");
  if (sourcePost && isPublishedPost(sourcePost)) blockReasons.push("Source post is already published.");
  if (!isJsonProductionStoreMode()) blockReasons.push("Production store mode is not json.");
  if (!affectedFields.length && sourcePost) warnings.push("Draft has no changed fields for the selected regeneration type.");
  if (draft.regenerationType === "image" && draft.draft.imagePath && !fileExists(draft.draft.imagePath)) {
    warnings.push("Draft imagePath does not point to an existing file; existing source imagePath will be preserved.");
  }

  return {
    draft,
    sourcePost,
    safeToApply: blockReasons.length === 0,
    blockReasons,
    warnings,
    affectedFields,
    currentPostText: sourcePost ? postText(sourcePost) : "",
    currentImagePath: sourcePost ? postImagePath(sourcePost) : "",
    draftText: draft.draft.text,
    draftImagePrompt: draft.draft.imagePrompt,
    draftImagePath: draft.draft.imagePath,
  };
}

function toApplyPreview(row) {
  return {
    id: row.draft.id,
    sourcePostId: row.draft.sourcePostId,
    channelId: row.draft.channelId,
    channelName: row.sourcePost?.channelName ?? row.draft.channelId,
    regenerationType: row.draft.regenerationType,
    priority: row.draft.priority,
    status: row.draft.status,
    approved: row.draft.approved,
    approvedAt: row.draft.approvedAt,
    applied: row.draft.applied,
    appliedAt: row.draft.appliedAt,
    applyBackupPath: row.draft.applyBackupPath,
    applySummary: row.draft.applySummary,
    issues: row.draft.issues,
    recommendation: row.draft.recommendation,
    safeToApply: row.safeToApply,
    blockReason: row.blockReasons.join("; "),
    blockReasons: row.blockReasons,
    warnings: row.warnings,
    affectedFields: row.affectedFields,
    currentPostText: row.currentPostText,
    draftText: row.draftText,
    currentImagePath: row.currentImagePath,
    draftImagePrompt: row.draftImagePrompt,
    draftImagePath: row.draftImagePath,
  };
}

function buildApplyDiff(sourcePost, draft, affectedFields) {
  return {
    text: {
      original: postText(sourcePost),
      draft: draft.draft.text,
      changed: affectedFields.some((field) => ["body", "textLength", "telegramCaption", "telegramCaptionLength", "telegramCaptionStatus"].includes(field)),
    },
    image: {
      originalImagePath: postImagePath(sourcePost),
      draftImagePath: draft.draft.imagePath,
      draftImagePrompt: draft.draft.imagePrompt,
      changed: affectedFields.some((field) => field.includes("image") || field.includes("visual")),
    },
    affectedFields,
  };
}

function getAffectedFields(sourcePost, draft) {
  const fields = [];
  const textDraft = shouldRewriteText(draft.regenerationType) ? draft.draft.text.trim() : "";
  const imageDraft = shouldRewriteImage(draft.regenerationType);

  if (textDraft && textDraft !== postText(sourcePost)) {
    fields.push("body", "textLength", "telegramCaption", "telegramCaptionLength", "telegramCaptionStatus");
  }

  if (imageDraft) {
    if (draft.draft.imagePrompt && draft.draft.imagePrompt !== String(sourcePost.draftImagePrompt ?? sourcePost.imagePrompt ?? "")) {
      fields.push("draftImagePrompt");
    }
    if (draft.draft.imagePath && fileExists(draft.draft.imagePath) && draft.draft.imagePath !== postImagePath(sourcePost)) {
      fields.push("draftImagePath", "imagePath", "telegramImagePath");
    } else if (draft.draft.imagePath) {
      fields.push("draftImagePath");
    }
    if (draft.draft.imagePrompt || draft.draft.imagePath) {
      fields.push("imageApplyStatus");
    }
  }

  return Array.from(new Set(fields));
}

function applyDraftToPost(sourcePost, draft, { now }) {
  const next = { ...sourcePost, updatedAt: now };
  const affectedFields = getAffectedFields(sourcePost, draft);

  if (shouldRewriteText(draft.regenerationType) && draft.draft.text.trim()) {
    const body = draft.draft.text.trim();
    const caption = buildCaption(next.title, body);
    next.body = body;
    next.textLength = body.length;
    next.telegramCaption = caption.text;
    next.telegramCaptionLength = caption.length;
    next.telegramCaptionStatus = caption.status;
    next.draftTextAppliedAt = now;
  }

  if (shouldRewriteImage(draft.regenerationType)) {
    if (draft.draft.imagePrompt.trim()) {
      next.draftImagePrompt = draft.draft.imagePrompt.trim();
      next.imagePrompt = draft.draft.imagePrompt.trim();
    }
    if (draft.draft.imagePath && fileExists(draft.draft.imagePath)) {
      next.draftImagePath = draft.draft.imagePath;
      next.imagePath = draft.draft.imagePath;
      next.telegramImagePath = draft.draft.imagePath;
      next.imageUrl = filePathToPublicUrl(draft.draft.imagePath) ?? next.imageUrl;
      next.telegramImageStatus = "OK";
    } else if (draft.draft.imagePath) {
      next.draftImagePath = draft.draft.imagePath;
    }
    next.imageApplyStatus = "draft_metadata_applied";
    next.draftImageAppliedAt = now;
  }

  next.lastDraftApply = {
    draftId: draft.id,
    appliedAt: now,
    affectedFields,
    publicationWasNotTriggered: true,
  };

  return next;
}

async function createApplyBackup() {
  const backup = await createSystemBackup();
  if (!backup.ok || !backup.backupDir) return backup;

  const backupDir = path.join(root, backup.backupDir);
  const draftBackupDir = path.join(backupDir, "regeneration-drafts");
  mkdirSync(draftBackupDir, { recursive: true });
  if (existsSync(regenerationDraftsFile)) {
    copyFileSync(regenerationDraftsFile, path.join(draftBackupDir, "regeneration-drafts.json"));
  }

  return {
    ...backup,
    regenerationDraftStoreCopied: existsSync(regenerationDraftsFile),
    regenerationDraftStoreBackupPath: path.relative(root, path.join(draftBackupDir, "regeneration-drafts.json")),
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

function writeJson(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function candidateToDraft(candidate, index) {
  const createdAt = new Date().toISOString();
  return {
    id: `draft_${createdAt.replace(/\D/g, "")}_${slugify(candidate.sourcePostId)}_${index + 1}`,
    sourcePostId: candidate.sourcePostId,
    channelId: candidate.channelId,
    createdAt,
    updatedAt: createdAt,
    regenerationType: candidate.regenerationType,
    priority: candidate.priority,
    original: candidate.original,
    draft: candidate.draft,
    issues: candidate.issues,
    recommendation: candidate.recommendation,
    status: "draft",
    approved: false,
    approvedAt: null,
    rejectedAt: null,
    reviewNote: "",
    applied: false,
  };
}

function buildDraftText({ title, topic, channelName, originalText, issues }) {
  const cleanTitle = title || topic || "Draft update";
  const issueList = Array.isArray(issues) && issues.length ? issues.join(", ") : "quality review";
  const usefulOriginal = firstSentence(originalText);

  return [
    `Hook: ${cleanTitle}`,
    "",
    `- Channel angle: make this useful for ${channelName} without service labels or template phrasing.`,
    `- Specific value: add one concrete check, comparison, number, place, or decision rule tied to ${topic || cleanTitle}.`,
    `- Quality fix: address ${issueList} and keep the text ready for manual review before any publishing step.`,
    usefulOriginal ? `- Source context: ${usefulOriginal}` : "- Source context: confirm facts, tone, and reader value before approval.",
    "",
    "Conclusion: keep the final version practical, channel-specific, and safe for a human approve/apply step later.",
  ].join("\n");
}

function buildImagePrompt({ title, topic, channelName, imagePath, issues }) {
  const issueText = Array.isArray(issues) && issues.length ? issues.join(", ") : "quality review";
  const baseTopic = topic || title || "Telegram post";

  return [
    `Create a Telegram-ready visual concept for ${channelName}.`,
    `Topic: ${baseTopic}.`,
    `Goal: distinct, channel-specific cover image with no service labels, no placeholder look, no visible generation metadata.`,
    `Fix focus: ${issueText}.`,
    imagePath ? `Reference existing image only for continuity, not as a file to overwrite: ${imagePath}.` : "No original image path is available.",
  ].join(" ");
}

function shouldRewriteText(type) {
  return type === "text" || type === "both" || type === "manual_review";
}

function shouldRewriteImage(type) {
  return type === "image" || type === "both" || type === "manual_review";
}

function postIdFor(post) {
  return stringOrNull(post?.postId) ?? stringOrNull(post?.id) ?? "";
}

function postText(post) {
  return stringOrNull(post?.body) ?? stringOrNull(post?.text) ?? stringOrNull(post?.telegramCaption) ?? "";
}

function postImagePath(post) {
  return (
    stringOrNull(post?.telegramImagePath) ??
    stringOrNull(post?.imagePath) ??
    stringOrNull(post?.imageUrl) ??
    stringOrNull(post?.previewPath) ??
    ""
  );
}

function findPostIndex(posts, sourcePostId) {
  return posts.findIndex((post) => postIdFor(post) === sourcePostId);
}

function isPublishedPost(post) {
  return (
    String(post?.status ?? "").toLowerCase() === "published" ||
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

function filePathToPublicUrl(filePath) {
  const normalized = path.resolve(filePath);
  const publicRoot = path.join(root, "public");
  if (!normalized.startsWith(publicRoot)) return null;
  return `/${path.relative(publicRoot, normalized).replaceAll("\\", "/")}`;
}

function buildCaption(title, body) {
  const cleanTitle = String(title ?? "").trim();
  const cleanBody = cleanText(body);
  const text = cleanTitle && !cleanBody.startsWith(cleanTitle)
    ? `<b>${escapeHtml(cleanTitle)}</b>\n\n${cleanBody}`
    : cleanBody;

  return {
    text,
    length: text.length,
    status: !text ? "missing" : text.length > 1024 ? "too_long" : "OK",
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function buildDraftSummary(drafts) {
  const reviewSummary = buildReviewSummary(drafts);
  return {
    totalDrafts: drafts.length,
    activeDrafts: drafts.filter(isActiveDraft).length,
    approvedDrafts: drafts.filter((draft) => draft.approved || draft.status === "approved").length,
    appliedDrafts: drafts.filter((draft) => draft.applied || draft.status === "applied").length,
    textDrafts: drafts.filter((draft) => draft.regenerationType === "text").length,
    imageDrafts: drafts.filter((draft) => draft.regenerationType === "image").length,
    bothDrafts: drafts.filter((draft) => draft.regenerationType === "both").length,
    manualReviewDrafts: drafts.filter((draft) => draft.regenerationType === "manual_review").length,
    highPriorityDrafts: drafts.filter((draft) => draft.priority === "high").length,
    staleDrafts: drafts.filter(isStaleActiveDraft).length,
    draft: reviewSummary.draft,
    approved: reviewSummary.approved,
    rejected: reviewSummary.rejected,
    needsChanges: reviewSummary.needsChanges,
    applied: reviewSummary.applied,
    pendingReview: reviewSummary.pendingReview,
    highPriorityPending: reviewSummary.highPriorityPending,
  };
}

function buildReviewSummary(drafts) {
  return {
    totalDrafts: drafts.length,
    draft: drafts.filter((draft) => draft.status === "draft").length,
    approved: drafts.filter((draft) => draft.status === "approved").length,
    rejected: drafts.filter((draft) => draft.status === "rejected").length,
    needsChanges: drafts.filter((draft) => draft.status === "needs_changes").length,
    applied: drafts.filter((draft) => draft.applied).length,
    pendingReview: drafts.filter(isPendingReview).length,
    highPriorityPending: drafts.filter(isHighPriorityPending).length,
  };
}

function readPlanPosts(errors) {
  const plan = readJson(path.join(runtimeDir, "weekly-content-plan.json"), { items: [] }, errors);
  return Array.isArray(plan.items) ? plan.items : [];
}

function readDraftStore(errors = []) {
  const fallback = { version: 1, updatedAt: null, drafts: [] };
  if (!existsSync(regenerationDraftsFile)) return fallback;

  const parsed = readJson(regenerationDraftsFile, fallback, errors);
  if (Array.isArray(parsed)) return { version: 1, updatedAt: null, drafts: parsed.map(normalizeDraft) };
  if (Array.isArray(parsed.drafts)) return { ...fallback, ...parsed, drafts: parsed.drafts.map(normalizeDraft) };

  errors.push(`${path.relative(root, regenerationDraftsFile)} does not contain a drafts array.`);
  return fallback;
}

function writeDraftStore(drafts) {
  const payload = {
    version: 1,
    updatedAt: new Date().toISOString(),
    drafts: sortDrafts(drafts.map(normalizeDraft)),
  };
  writeFileSync(regenerationDraftsFile, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function normalizeDraft(draft) {
  const status = reviewStatuses.has(String(draft?.status)) ? String(draft.status) : "draft";
  const createdAt = stringOrNull(draft?.createdAt) ?? new Date(0).toISOString();
  const updatedAt = stringOrNull(draft?.updatedAt) ?? createdAt;
  const approved = status === "approved";
  const applied = Boolean(draft?.applied);

  return {
    id: String(draft?.id ?? ""),
    sourcePostId: String(draft?.sourcePostId ?? ""),
    channelId: String(draft?.channelId ?? ""),
    createdAt,
    updatedAt,
    regenerationType: regenerationTypes.has(String(draft?.regenerationType)) ? String(draft.regenerationType) : "manual_review",
    priority: priorities.has(String(draft?.priority)) ? String(draft.priority) : "medium",
    original: {
      text: String(draft?.original?.text ?? ""),
      imagePath: String(draft?.original?.imagePath ?? ""),
      topic: String(draft?.original?.topic ?? ""),
    },
    draft: {
      text: String(draft?.draft?.text ?? ""),
      imagePrompt: String(draft?.draft?.imagePrompt ?? ""),
      imagePath: draft?.draft?.imagePath ? String(draft.draft.imagePath) : null,
    },
    issues: Array.isArray(draft?.issues) ? draft.issues.map((issue) => String(issue)) : [],
    recommendation: String(draft?.recommendation ?? ""),
    status,
    approved,
    approvedAt: approved ? stringOrNull(draft?.approvedAt) : null,
    rejectedAt: status === "rejected" ? stringOrNull(draft?.rejectedAt) : null,
    reviewNote: String(draft?.reviewNote ?? ""),
    applied,
    appliedAt: applied ? stringOrNull(draft?.appliedAt) : null,
    applyBackupPath: applied ? stringOrNull(draft?.applyBackupPath) : null,
    applySummary: isPlainObject(draft?.applySummary) ? draft.applySummary : null,
  };
}

function applyReviewAction(draft, { action, note, now }) {
  const noteWasProvided = typeof note === "string";
  const reviewNote = noteWasProvided ? note : draft.reviewNote;

  if (action === "approve") {
    return {
      ...draft,
      updatedAt: now,
      status: "approved",
      approved: true,
      approvedAt: now,
      rejectedAt: null,
      reviewNote,
      applied: false,
    };
  }

  if (action === "reject") {
    return {
      ...draft,
      updatedAt: now,
      status: "rejected",
      approved: false,
      approvedAt: null,
      rejectedAt: now,
      reviewNote,
      applied: false,
    };
  }

  return {
    ...draft,
    updatedAt: now,
    status: "needs_changes",
    approved: false,
    approvedAt: null,
    rejectedAt: null,
    reviewNote,
    applied: false,
  };
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

function isStaleActiveDraft(draft) {
  if (!isActiveDraft(draft)) return false;
  const createdAt = Date.parse(draft.createdAt ?? "");
  return Boolean(createdAt && Date.now() - createdAt > staleAfterMs);
}

function isPendingReview(draft) {
  return !draft.applied && (draft.status === "draft" || draft.status === "needs_changes");
}

function isHighPriorityPending(draft) {
  return draft.priority === "high" && isPendingReview(draft);
}

function draftKey(draft) {
  return `${draft.sourcePostId}::${draft.regenerationType}`;
}

function countBy(items, key) {
  return items.reduce((counts, item) => {
    const value = String(item[key] ?? "unknown");
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

function toCandidatePreview(candidate) {
  return {
    sourcePostId: candidate.sourcePostId,
    channelId: candidate.channelId,
    regenerationType: candidate.regenerationType,
    priority: candidate.priority,
    issues: candidate.issues,
    originalPreview: candidate.original.text.slice(0, 180),
    draftPreview: candidate.draft.text.slice(0, 180),
    imagePromptPreview: candidate.draft.imagePrompt.slice(0, 180),
  };
}

function cleanText(value) {
  return String(value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function firstSentence(value) {
  const text = cleanText(value);
  if (!text) return "";
  return text.split(/(?<=[.!?])\s+/u)[0].slice(0, 260);
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
