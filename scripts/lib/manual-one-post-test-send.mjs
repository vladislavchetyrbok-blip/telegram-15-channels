import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createSystemBackup } from "./backup-center.mjs";
import { getContentQualityAnalysis } from "./content-quality.mjs";
import { getFinalPublishPreviewReport } from "./final-publish-preview.mjs";
import { loadLocalEnv } from "./load-local-env.mjs";

const root = process.cwd();
const runtimeDir = path.join(root, "data", "runtime");
const planPath = path.join(runtimeDir, "weekly-content-plan.json");
const targetsPath = path.join(runtimeDir, "telegram-targets.json");
const logsPath = path.join(runtimeDir, "publication_logs.json");

const candidateStatuses = new Set(["ready", "approved", "scheduled", "ready_to_publish"]);
const publishedStatuses = new Set(["published", "sent", "success", "testpublished"]);
const blockingIssues = new Set([
  "already_published",
  "image_missing",
  "image_file_missing",
  "image_path_missing",
  "missing_image",
  "missing_text",
  "empty_text",
  "not_ready_or_scheduled",
  "post_not_found",
  "channel_not_found",
  "telegram_target_missing",
  "telegram_token_missing",
  "real_publish_disabled",
  "unsafe_or_blocked_status",
]);

export async function getManualOnePostTestSendStatus(options = {}) {
  loadLocalEnv({ cwd: root });

  const lastCheckedAt = new Date().toISOString();
  const warnings = [];
  const errors = [];
  const finalPreview = await getFinalPublishPreviewReport();
  const quality = await getContentQualityAnalysis();
  const plan = readJson(planPath, { version: 1, items: [] }, errors);
  const targets = readJson(targetsPath, {}, errors);
  const logs = readJson(logsPath, [], errors);
  const posts = Array.isArray(plan.items) ? plan.items : [];
  const requestedPostId = stringOrNull(options.postId);
  const selectedPostId = requestedPostId ?? finalPreview.recommendedFirstTestPost?.postId ?? null;
  const selectedPost = selectedPostId ? posts.find((post) => postIdFor(post) === selectedPostId) ?? null : null;
  const previewPost =
    (selectedPostId ? finalPreview.previewPosts.find((post) => post.postId === selectedPostId) : null) ??
    (selectedPost ? buildPreviewPost(selectedPost, quality.analyzed.find((post) => post.postId === selectedPostId)) : null);
  const target = selectedPost ? getChannelTarget(targets, selectedPost.channelId) : null;
  const logsArray = Array.isArray(logs) ? logs : [];
  const validation = validateSelectedPost({ selectedPost, previewPost, target, logs: logsArray, requestedPostId, hasSelectedPostId: Boolean(selectedPostId) });
  const selectedPostPreview = previewPost
    ? buildSelectedPostPreview({ previewPost, selectedPost, target, issues: validation.issues })
    : null;
  const safeForManualOnePostTest = Boolean(selectedPostPreview && validation.ok);

  if (!finalPreview.recommendedFirstTestPost) {
    warnings.push("No recommended first test post was found by Final Preview.");
  }
  if (!selectedPostId) {
    warnings.push("No postId was supplied and no recommended post is available.");
  }
  if (requestedPostId && !selectedPost) {
    errors.push(`Requested postId was not found: ${requestedPostId}`);
  }
  if (validation.warnings.length) warnings.push(...validation.warnings);
  if (validation.errors.length) errors.push(...validation.errors);

  return {
    ok: errors.length === 0,
    status: errors.length ? "error" : warnings.length || !safeForManualOnePostTest ? "warning" : "ok",
    mode: "dry-run",
    recommendedFirstTestPost: finalPreview.recommendedFirstTestPost,
    safeForManualOnePostTest,
    safeForBulkPublishing: false,
    productionStoreMode: "json",
    sourceOfTruth: "json",
    selectedPostPreview,
    telegram: {
      botTokenConfigured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
      realPublishEnabled: envValue("TELEGRAM_REAL_PUBLISH_ENABLED"),
      dryRun: envValue("TELEGRAM_DRY_RUN"),
      tokenValueExposed: false,
    },
    safety: {
      githubActionsTriggered: false,
      bulkPublishing: false,
      supabaseDirectWrite: false,
      schedulerYamlChanged: false,
      wouldSendToTelegram: false,
    },
    readinessIssues: validation.issues,
    warnings: Array.from(new Set(warnings)),
    errors: Array.from(new Set(errors)),
    lastCheckedAt,
  };
}

export async function sendManualOnePostTest(options = {}) {
  const postId = stringOrNull(options.postId);
  const confirm = options.confirm === true;
  const warnings = [];
  const errors = [];

  if (!postId) errors.push("Send mode requires --post-id / postId.");
  if (!confirm) errors.push("Send mode requires explicit confirmation.");

  const statusReport = await getManualOnePostTestSendStatus({ postId });
  if (!statusReport.safeForManualOnePostTest) {
    errors.push("Selected post is not safe for a manual one-post test send.");
  }
  if (process.env.TELEGRAM_REAL_PUBLISH_ENABLED !== "true") {
    errors.push("TELEGRAM_REAL_PUBLISH_ENABLED must be true for send mode.");
  }
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    errors.push("TELEGRAM_BOT_TOKEN is not configured.");
  }

  if (errors.length) {
    return {
      ok: false,
      sent: false,
      postId,
      channelId: statusReport.selectedPostPreview?.channel?.channelId ?? null,
      backupPath: null,
      publicationLogId: null,
      telegramMessageId: null,
      warnings: Array.from(new Set([...statusReport.warnings, ...warnings])),
      errors: Array.from(new Set([...statusReport.errors, ...errors])),
      tokenValueExposed: false,
    };
  }

  const selected = statusReport.selectedPostPreview;
  const backup = await createSystemBackup();
  const send = await sendPhoto({
    token: process.env.TELEGRAM_BOT_TOKEN,
    telegramTarget: selected.telegramPayload.chatId,
    caption: selected.telegramPayload.caption,
    imageFilePath: selected.telegramPayload.imagePath,
  });

  if (!send.ok) {
    return {
      ok: false,
      sent: false,
      postId,
      channelId: selected.channel.channelId,
      backupPath: backup.backupDir ?? null,
      publicationLogId: null,
      telegramMessageId: null,
      warnings,
      errors: [send.error || "Telegram send failed."],
      tokenValueExposed: false,
    };
  }

  const publicationLogId = appendPublicationLog({
    channelId: selected.channel.channelId,
    postId,
    status: "success",
    message: `manual_one_post_test_send message_id=${send.messageId}`,
    telegramMessageId: send.messageId,
    telegramMessageLink: buildTelegramMessageLink(selected.telegramPayload.chatId, send.messageId),
  });
  markJsonItemTestPublished({ postId, messageId: send.messageId, publicationLogId });

  return {
    ok: true,
    sent: true,
    postId,
    channelId: selected.channel.channelId,
    backupPath: backup.backupDir ?? null,
    publicationLogId,
    telegramMessageId: send.messageId,
    warnings,
    errors: [],
    githubActionsTriggered: false,
    bulkPublishing: false,
    supabaseDirectWrite: false,
    schedulerYamlChanged: false,
    tokenValueExposed: false,
  };
}

function validateSelectedPost({ selectedPost, previewPost, target, logs, requestedPostId, hasSelectedPostId }) {
  const issues = new Set(previewPost?.issues ?? []);
  const warnings = [];
  const errors = [];

  if (!selectedPost && hasSelectedPostId) issues.add("post_not_found");
  if (selectedPost && !target) issues.add("telegram_target_missing");
  if (selectedPost && !candidateStatuses.has(normalizeStatus(selectedPost.status))) issues.add("not_ready_or_scheduled");
  if (selectedPost && isAlreadyPublished(selectedPost, logs)) issues.add("already_published");
  if (previewPost && !previewPost.imageExists) issues.add("image_missing");
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    issues.add("telegram_token_missing");
    warnings.push("TELEGRAM_BOT_TOKEN is not configured; dry-run remains safe, send mode will be blocked.");
  }
  if (process.env.TELEGRAM_REAL_PUBLISH_ENABLED !== "true") {
    issues.add("real_publish_disabled");
    warnings.push("TELEGRAM_REAL_PUBLISH_ENABLED is not true; dry-run remains safe, send mode will be blocked.");
  }

  const hasBlockingIssue = Array.from(issues).some((issue) => blockingIssues.has(issue));
  for (const issue of issues) {
    if (blockingIssues.has(issue) && issue !== "telegram_token_missing" && issue !== "real_publish_disabled") {
      if (issue !== "post_not_found" || requestedPostId) errors.push(issue);
    }
  }

  return {
    ok: !hasBlockingIssue,
    issues: Array.from(issues),
    warnings,
    errors,
  };
}

function buildSelectedPostPreview({ previewPost, selectedPost, target, issues }) {
  const imagePath = resolveAssetPath(selectedPost.telegramImagePath || selectedPost.imagePath || selectedPost.imageUrl || previewPost.imagePath);
  const caption = previewPost.telegramText || buildTelegramText(selectedPost);

  return {
    channel: {
      channelId: previewPost.channelId,
      channelName: previewPost.channelName,
      telegramTargetConfigured: Boolean(target),
    },
    postId: previewPost.postId,
    postStatus: previewPost.postStatus,
    title: previewPost.title,
    topic: previewPost.topic,
    text: caption,
    textLength: caption.length,
    imagePath: previewPost.imagePath,
    resolvedImagePath: imagePath,
    imageExists: Boolean(imagePath && existsSync(imagePath) && statSync(imagePath).isFile()),
    issues,
    readinessScore: previewPost.publishReadinessScore,
    wouldSendToTelegram: false,
    telegramPayload: {
      method: "sendPhoto",
      chatId: target?.telegramTarget ?? null,
      photo: imagePath,
      imagePath,
      caption,
      parseMode: "HTML",
    },
  };
}

function buildPreviewPost(post, qualityPost) {
  const postId = postIdFor(post);
  const postStatus = normalizeStatus(post.status);
  const telegramText = buildTelegramText(post);
  const imagePath = resolveAssetPath(post.telegramImagePath || post.imagePath || post.imageUrl || post.previewPath);
  const issues = new Set(Array.isArray(qualityPost?.issues) ? qualityPost.issues : []);

  if (!telegramText.trim()) issues.add("missing_text");
  if (telegramText.length > 1024) issues.add("too_long_text");
  if (!imagePath) issues.add("image_missing");
  if (!candidateStatuses.has(postStatus)) issues.add("not_ready_or_scheduled");
  if (publishedStatuses.has(postStatus) || publishedStatuses.has(normalizeStatus(post.publishResult)) || post.telegramMessageId) issues.add("already_published");

  const issueList = Array.from(issues);
  const renderStatus = issueList.some((issue) => blockingIssues.has(issue)) ? "blocked" : issueList.length ? "warning" : "ok";
  const score = calculateReadinessScore(qualityPost?.qualityScore, issueList, renderStatus);

  return {
    postId,
    channelId: stringOrNull(post.channelId) ?? "unknown",
    channelName: stringOrNull(post.channelName) ?? stringOrNull(post.channelTitle) ?? stringOrNull(post.channelId) ?? "unknown",
    topic: stringOrNull(post.contentTopic) ?? stringOrNull(post.topic) ?? stringOrNull(post.title) ?? "Untitled",
    title: stringOrNull(post.title) ?? stringOrNull(post.contentTopic) ?? "Untitled",
    postStatus,
    telegramText,
    imagePath: stringOrNull(post.telegramImagePath) ?? stringOrNull(post.imagePath) ?? stringOrNull(post.imageUrl) ?? "",
    imageExists: Boolean(imagePath),
    issues: issueList,
    publishReadinessScore: score,
  };
}

async function sendPhoto({ token, telegramTarget, caption, imageFilePath }) {
  if (!token) return { ok: false, messageId: null, error: "TELEGRAM_BOT_TOKEN missing" };
  if (!telegramTarget) return { ok: false, messageId: null, error: "telegram target missing" };
  if (!imageFilePath || !existsSync(imageFilePath)) return { ok: false, messageId: null, error: "image file missing" };

  const imageBuffer = readFileSync(imageFilePath);
  const form = new FormData();
  form.set("chat_id", telegramTarget);
  form.set("photo", new Blob([new Uint8Array(imageBuffer)], { type: getImageMime(imageFilePath) }), path.basename(imageFilePath));
  form.set("caption", caption);
  form.set("parse_mode", "HTML");

  const response = await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, { method: "POST", body: form });
  const body = await response.json().catch(() => null);
  if (!response.ok || !body?.ok) {
    return { ok: false, messageId: null, error: body?.description || `Telegram API returned ${response.status}` };
  }
  return { ok: true, messageId: body.result?.message_id ?? null, error: null };
}

function markJsonItemTestPublished({ postId, messageId, publicationLogId }) {
  const state = readJson(planPath, { version: 1, items: [] }, []);
  const now = new Date().toISOString();
  state.items = (state.items ?? []).map((item) =>
    postIdFor(item) === postId
      ? {
          ...item,
          status: "published",
          publishResult: "success",
          testPublished: true,
          publishSource: "manual-one-post-test-send",
          telegramMessageId: messageId,
          telegramPublishedAt: now,
          manualTestPublishedAt: now,
          manualTestPublicationLogId: publicationLogId,
          updatedAt: now,
        }
      : item,
  );
  state.updatedAt = now;
  writeJson(planPath, state);
}

function appendPublicationLog(entry) {
  const logs = readJson(logsPath, [], []);
  const id = randomUUID();
  logs.push({
    id,
    runId: randomUUID(),
    source: "manual-one-post-test-send",
    channelId: entry.channelId ?? null,
    postId: entry.postId ?? null,
    status: entry.status,
    message: entry.message ?? null,
    telegramMessageId: entry.telegramMessageId ?? null,
    telegramMessageLink: entry.telegramMessageLink ?? null,
    dryRun: false,
    createdAt: new Date().toISOString(),
  });
  writeJson(logsPath, logs.slice(-1000));
  return id;
}

function isAlreadyPublished(item, logs) {
  const postId = postIdFor(item);
  return (
    publishedStatuses.has(normalizeStatus(item.status)) ||
    publishedStatuses.has(normalizeStatus(item.publishResult)) ||
    Boolean(item.telegramMessageId) ||
    logs.some((log) => log.postId === postId && normalizeStatus(log.status) === "success")
  );
}

function getChannelTarget(targets, channelId) {
  if (!channelId || !targets || typeof targets !== "object") return null;
  const target = targets[channelId];
  return target?.telegramTarget ? target : null;
}

function resolveAssetPath(value) {
  if (!value) return "";
  const rawValue = String(value);
  const normalized = rawValue.replaceAll("\\", "/");
  const candidates = [];
  if (path.isAbsolute(rawValue)) candidates.push(rawValue);
  if (normalized.startsWith("/assets/")) candidates.push(path.join(root, "public", normalized.replace(/^\/+/, "")));
  const publicIndex = normalized.lastIndexOf("/public/");
  if (publicIndex >= 0) candidates.push(path.join(root, normalized.slice(publicIndex + 1)));
  candidates.push(path.join(root, normalized));
  return candidates.find((candidate) => candidate && existsSync(candidate) && statSync(candidate).isFile()) || "";
}

function buildTelegramText(post) {
  const caption = stringOrNull(post.telegramCaption);
  if (caption) return caption;

  const title = stringOrNull(post.title) ?? stringOrNull(post.contentTopic) ?? "";
  const body = stringOrNull(post.body) ?? stringOrNull(post.text) ?? stringOrNull(post.excerpt) ?? "";
  if (title && body && !body.startsWith(title)) return `<b>${escapeHtml(title)}</b>\n\n${body}`;
  return body || title;
}

function calculateReadinessScore(qualityScore, issues, renderStatus) {
  let score = Number.isFinite(Number(qualityScore)) ? Number(qualityScore) : 80;
  if (renderStatus === "blocked") score -= 25;
  if (renderStatus === "warning") score -= 8;
  if (issues.some((issue) => issue.includes("image"))) score -= 20;
  if (issues.includes("too_long_text")) score -= 8;
  return Math.max(0, Math.min(100, Math.round(score)));
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
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function buildTelegramMessageLink(telegramTarget, messageId) {
  if (!telegramTarget || !messageId) return null;
  return telegramTarget.startsWith("-100") ? `https://t.me/c/${telegramTarget.slice(4)}/${messageId}` : null;
}

function getImageMime(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".jpg" || extension === ".jpeg") return "image/jpeg";
  if (extension === ".webp") return "image/webp";
  return "image/png";
}

function envValue(name) {
  return process.env[name] ?? "unset";
}

function postIdFor(post) {
  return stringOrNull(post?.postId) ?? stringOrNull(post?.id) ?? "unknown";
}

function normalizeStatus(value) {
  return String(value ?? "").trim().toLowerCase() || "unknown";
}

function stringOrNull(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
