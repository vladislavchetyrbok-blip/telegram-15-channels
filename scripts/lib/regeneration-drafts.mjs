import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { getRegenerationQueueReport } from "./regeneration-queue.mjs";

const root = process.cwd();
const runtimeDir = path.join(root, "data", "runtime");
export const regenerationDraftsDir = path.join(root, "data", "regeneration-drafts");
export const regenerationDraftsFile = path.join(regenerationDraftsDir, "regeneration-drafts.json");

const activeStatuses = new Set(["draft", "approved"]);
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

function candidateToDraft(candidate, index) {
  const createdAt = new Date().toISOString();
  return {
    id: `draft_${createdAt.replace(/\D/g, "")}_${slugify(candidate.sourcePostId)}_${index + 1}`,
    sourcePostId: candidate.sourcePostId,
    channelId: candidate.channelId,
    createdAt,
    regenerationType: candidate.regenerationType,
    priority: candidate.priority,
    original: candidate.original,
    draft: candidate.draft,
    issues: candidate.issues,
    recommendation: candidate.recommendation,
    status: "draft",
    approved: false,
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

function buildDraftSummary(drafts) {
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
  if (Array.isArray(parsed)) return { version: 1, updatedAt: null, drafts: parsed };
  if (Array.isArray(parsed.drafts)) return { ...fallback, ...parsed, drafts: parsed.drafts };

  errors.push(`${path.relative(root, regenerationDraftsFile)} does not contain a drafts array.`);
  return fallback;
}

function writeDraftStore(drafts) {
  const payload = {
    version: 1,
    updatedAt: new Date().toISOString(),
    drafts: sortDrafts(drafts),
  };
  writeFileSync(regenerationDraftsFile, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
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
