import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { deflateSync } from "node:zlib";

const root = process.cwd();
const draftsDir = path.join(root, "data", "visual-regeneration-drafts");
const draftsFile = path.join(draftsDir, "visual-regeneration-drafts.json");
const imageCandidatesDir = path.join(root, "public", "assets", "visual-regeneration-candidates");
const imageCandidatesFile = path.join(draftsDir, "visual-regeneration-image-candidates.json");
const targetChannelId = "ai-tech";
const width = 1080;
const height = 1350;

export async function previewVisualRegenerationImageCandidate() {
  return buildImageCandidateReport({ write: false });
}

export async function createVisualRegenerationImageCandidate() {
  return buildImageCandidateReport({ write: true });
}

export async function getVisualRegenerationImageCandidateStatus() {
  const errors = [];
  const store = readImageCandidateStore(errors);
  const candidates = store.imageCandidates.map(normalizeImageCandidate).map(withFileState);

  return {
    status: errors.length ? "error" : "ok",
    mode: "status",
    productionStoreMode: "json",
    sourceOfTruth: "json",
    imageCandidates: candidates,
    summary: {
      totalCandidates: candidates.length,
      generated: candidates.filter((candidate) => candidate.generationStatus === "generated").length,
      generationUnavailable: candidates.filter((candidate) => candidate.generationStatus === "generationUnavailable").length,
      failed: candidates.filter((candidate) => candidate.generationStatus === "failed").length,
      fileExists: candidates.filter((candidate) => candidate.fileExists).length,
      previewComparable: candidates.filter((candidate) => candidate.previewComparable).length,
    },
    errors,
    telegramRealSendWasNotRun: true,
    githubActionsWereNotTriggered: true,
    publishedPostsChanged: false,
    oldImagesDeleted: false,
    lastCheckedAt: new Date().toISOString(),
  };
}

async function buildImageCandidateReport({ write }) {
  const errors = [];
  const drafts = readDrafts(errors);
  const store = readImageCandidateStore(errors);
  const draft = selectOneDraft(drafts);

  if (errors.length) {
    return blockedReport({ write, message: "Image candidate inputs could not be read.", errors });
  }

  if (!draft) {
    return {
      ok: false,
      status: "blocked",
      mode: write ? "create" : "dry-run",
      message: "No active ai-tech visual regeneration draft was found. No image candidate was created.",
      selectedDrafts: 0,
      imageCandidatesCreated: 0,
      errors: ["No active ai-tech visual regeneration draft found."],
      telegramRealSendWasNotRun: true,
      githubActionsWereNotTriggered: true,
      publishedPostsChanged: false,
      oldImagesDeleted: false,
    };
  }

  const existing = store.imageCandidates.map(normalizeImageCandidate).find((candidate) => candidate.draftId === draft.id);
  const candidatePath = existing?.newImageCandidatePath || path.join(imageCandidatesDir, draft.id, `${draft.postId}.png`);
  const baseCandidate = buildCandidateMetadata({ draft, candidatePath, generationStatus: existing?.generationStatus ?? "planned", generatorUsed: existing?.generatorUsed ?? "local_draft_png" });

  if (!write) {
    return {
      ok: true,
      status: "ok",
      mode: "dry-run",
      selectedDrafts: 1,
      imageCandidatesCreated: 0,
      candidatePreview: baseCandidate,
      message: "Dry-run selected exactly one visual regeneration draft. No files were created.",
      telegramRealSendWasNotRun: true,
      githubActionsWereNotTriggered: true,
      publishedPostsChanged: false,
      oldImagesDeleted: false,
      lastCheckedAt: new Date().toISOString(),
    };
  }

  if (existing?.generationStatus === "generated" && fileExists(existing.newImageCandidatePath)) {
    return {
      ok: true,
      status: "ok",
      mode: "create",
      selectedDrafts: 1,
      imageCandidatesCreated: 0,
      imageCandidate: withFileState(existing),
      message: "Image candidate already exists for the selected draft. No duplicate was created.",
      telegramRealSendWasNotRun: true,
      githubActionsWereNotTriggered: true,
      publishedPostsChanged: false,
      oldImagesDeleted: false,
      lastCheckedAt: new Date().toISOString(),
    };
  }

  let nextCandidate = baseCandidate;
  try {
    mkdirSync(path.dirname(candidatePath), { recursive: true });
    writeFileSync(candidatePath, buildAiTechDraftPng(draft));
    const fileState = inspectPng(candidatePath);
    nextCandidate = {
      ...baseCandidate,
      generationStatus: fileState.ok ? "generated" : "failed",
      generatorUsed: "local_draft_png",
      visualQualityEstimate: {
        ...baseCandidate.visualQualityEstimate,
        fileSize: fileState.fileSize,
        width: fileState.width,
        height: fileState.height,
        qualityStatus: fileState.ok ? "strong" : "weak",
        issues: fileState.issues,
      },
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    nextCandidate = {
      ...baseCandidate,
      generationStatus: "generationUnavailable",
      generatorUsed: "local_draft_png",
      generationError: error instanceof Error ? error.message : String(error),
      newImageCandidatePath: null,
      visualQualityEstimate: {
        ...baseCandidate.visualQualityEstimate,
        qualityStatus: "weak",
        issues: ["local_generator_unavailable"],
      },
      createdAt: new Date().toISOString(),
    };
  }

  const nextCandidates = upsertCandidate(store.imageCandidates.map(normalizeImageCandidate), nextCandidate);
  writeImageCandidateStore(nextCandidates);
  updateDraftImageFields(drafts, draft.id, nextCandidate);

  return {
    ok: nextCandidate.generationStatus === "generated",
    status: nextCandidate.generationStatus === "generated" ? "ok" : "warning",
    mode: "create",
    selectedDrafts: 1,
    imageCandidatesCreated: 1,
    imageCandidate: withFileState(nextCandidate),
    message: nextCandidate.generationStatus === "generated"
      ? "One image candidate was created as a draft asset. No posts were changed."
      : "Image generation was unavailable or failed. No success file was invented.",
    telegramRealSendWasNotRun: true,
    githubActionsWereNotTriggered: true,
    publishedPostsChanged: false,
    oldImagesDeleted: false,
    lastCheckedAt: new Date().toISOString(),
  };
}

function buildCandidateMetadata({ draft, candidatePath, generationStatus, generatorUsed }) {
  return {
    draftId: draft.id,
    postId: draft.postId,
    channelId: draft.channelId,
    oldImagePath: draft.oldImage,
    newImageCandidatePath: candidatePath,
    newPremiumPrompt: draft.newPremiumPrompt,
    prompt: draft.newPremiumPrompt,
    negativePrompt: draft.negativePrompt,
    qualityReasons: draft.issues,
    generationStatus,
    generatorUsed,
    createdAt: new Date().toISOString(),
    visualQualityEstimate: {
      expectedVisualQualityScore: Number(draft.scores?.expectedAfter?.visualQualityScore ?? 86),
      expectedPremiumScore: Number(draft.scores?.expectedAfter?.premiumScore ?? 100),
      expectedChannelFitScore: Number(draft.scores?.expectedAfter?.channelFitScore ?? 88),
      qualityStatus: generationStatus === "generated" ? "strong" : "planned",
      issues: [],
    },
    backupPath: draft.backupPath,
    draftStatus: draft.status,
    approved: draft.approved,
    applied: draft.applied,
    previewComparable: Boolean(draft.oldImage && candidatePath),
    publishedPostsChanged: false,
    telegramRealSendWasNotRun: true,
  };
}

function buildAiTechDraftPng(draft) {
  const raw = Buffer.alloc((width * 3 + 1) * height);
  paintBackground(raw, hash(`${draft.id}:${draft.postId}`));
  drawWorkspace(raw);
  drawDevice(raw, 172, 300, 720, 440, [10, 24, 40], [98, 232, 249]);
  drawPanel(raw, 245, 388, 245, 28, [103, 232, 249], 0.95);
  drawPanel(raw, 245, 444, 410, 18, [167, 139, 250], 0.72);
  drawPanel(raw, 245, 493, 330, 18, [226, 232, 240], 0.52);
  drawBars(raw, 690, 412);
  drawNetwork(raw);
  drawPhone(raw);
  drawFrame(raw);
  return encodePng(raw);
}

function paintBackground(raw, seed) {
  for (let y = 0; y < height; y += 1) {
    const row = y * (width * 3 + 1);
    raw[row] = 0;
    for (let x = 0; x < width; x += 1) {
      const offset = row + 1 + x * 3;
      const t = x / width;
      const u = y / height;
      const wave = Math.sin((x + seed) * 0.009) * 7 + Math.cos((y - seed) * 0.011) * 6;
      raw[offset] = clamp(5 + 18 * t + 8 * u + wave);
      raw[offset + 1] = clamp(13 + 48 * u + 18 * t + wave / 2);
      raw[offset + 2] = clamp(30 + 56 * t + 24 * (1 - u) + wave);
    }
  }
  drawCircle(raw, 220, 170, 390, [34, 211, 238], 0.16);
  drawCircle(raw, 930, 1040, 520, [167, 139, 250], 0.14);
  drawCircle(raw, 130, 1180, 360, [45, 212, 191], 0.13);
}

function drawWorkspace(raw) {
  fillPoly(raw, [[0, 930], [1080, 760], [1080, 1350], [0, 1350]], [5, 12, 22], 0.72);
  drawPanel(raw, 110, 810, 860, 72, [226, 232, 240], 0.11);
  drawPanel(raw, 160, 910, 740, 42, [103, 232, 249], 0.16);
}

function drawDevice(raw, x, y, w, h, body, accent) {
  drawPanel(raw, x, y, w, h, body, 0.94);
  drawPanel(raw, x + 28, y + 32, w - 56, h - 74, [8, 17, 30], 0.96);
  drawLine(raw, x + 32, y + h - 36, x + w - 32, y + h - 36, accent, 4);
}

function drawBars(raw, x, y) {
  const colors = [[103, 232, 249], [167, 139, 250], [226, 232, 240], [45, 212, 191]];
  for (let i = 0; i < 5; i += 1) {
    drawPanel(raw, x + i * 40, y + 110 - i * 18, 22, 60 + i * 18, colors[i % colors.length], 0.76);
  }
  drawLine(raw, x - 8, y + 174, x + 214, y + 64, [103, 232, 249], 5);
}

function drawNetwork(raw) {
  const nodes = [
    [654, 206], [742, 154], [836, 222], [921, 172], [950, 286], [802, 322], [684, 298], [760, 245],
  ];
  for (let i = 0; i < nodes.length - 1; i += 1) {
    drawLine(raw, nodes[i][0], nodes[i][1], nodes[i + 1][0], nodes[i + 1][1], [103, 232, 249], 2);
  }
  for (const [x, y] of nodes) drawCircle(raw, x, y, 13, [167, 139, 250], 0.82);
}

function drawPhone(raw) {
  drawPanel(raw, 735, 690, 190, 330, [8, 18, 32], 0.94);
  drawPanel(raw, 760, 735, 140, 28, [103, 232, 249], 0.86);
  drawPanel(raw, 760, 795, 108, 18, [226, 232, 240], 0.5);
  drawPanel(raw, 760, 842, 128, 18, [167, 139, 250], 0.65);
  drawCircle(raw, 830, 965, 20, [103, 232, 249], 0.6);
}

function drawFrame(raw) {
  drawLine(raw, 54, 58, 1026, 58, [103, 232, 249], 3);
  drawLine(raw, 1026, 58, 1026, 1292, [167, 139, 250], 3);
  drawLine(raw, 1026, 1292, 54, 1292, [103, 232, 249], 3);
  drawLine(raw, 54, 1292, 54, 58, [167, 139, 250], 3);
}

function drawPanel(raw, x, y, w, h, color, alpha = 1) {
  drawRect(raw, x, y, w, h, color, alpha);
  drawLine(raw, x, y, x + w, y, [226, 232, 240], Math.max(1, Math.round(2 * alpha)));
}

function fillPoly(raw, points, color, alpha = 1) {
  const minY = Math.max(0, Math.min(...points.map((point) => point[1])));
  const maxY = Math.min(height - 1, Math.max(...points.map((point) => point[1])));
  for (let y = minY; y <= maxY; y += 1) {
    const xs = [];
    for (let i = 0; i < points.length; i += 1) {
      const a = points[i];
      const b = points[(i + 1) % points.length];
      if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) {
        xs.push(Math.round(a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1])));
      }
    }
    xs.sort((left, right) => left - right);
    for (let i = 0; i < xs.length; i += 2) drawRect(raw, xs[i], y, xs[i + 1] - xs[i], 1, color, alpha);
  }
}

function drawRect(raw, x, y, w, h, color, alpha = 1) {
  const left = Math.max(0, Math.round(x));
  const top = Math.max(0, Math.round(y));
  const right = Math.min(width, Math.round(x + w));
  const bottom = Math.min(height, Math.round(y + h));
  for (let yy = top; yy < bottom; yy += 1) {
    const row = yy * (width * 3 + 1);
    for (let xx = left; xx < right; xx += 1) {
      blend(raw, row + 1 + xx * 3, color, alpha);
    }
  }
}

function drawCircle(raw, cx, cy, radius, color, alpha = 1) {
  const r2 = radius * radius;
  for (let y = Math.max(0, cy - radius); y < Math.min(height, cy + radius); y += 1) {
    const row = y * (width * 3 + 1);
    for (let x = Math.max(0, cx - radius); x < Math.min(width, cx + radius); x += 1) {
      const d2 = (x - cx) ** 2 + (y - cy) ** 2;
      if (d2 <= r2) blend(raw, row + 1 + x * 3, color, alpha * (1 - d2 / r2));
    }
  }
}

function drawLine(raw, x0, y0, x1, y1, color, thickness = 3) {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const steps = Math.max(dx, dy);
  for (let i = 0; i <= steps; i += 1) {
    const t = steps === 0 ? 0 : i / steps;
    drawCircle(raw, Math.round(x0 + (x1 - x0) * t), Math.round(y0 + (y1 - y0) * t), thickness, color, 0.75);
  }
}

function encodePng(raw) {
  const chunks = [
    pngChunk("IHDR", Buffer.concat([uint32(width), uint32(height), Buffer.from([8, 2, 0, 0, 0])])),
    pngChunk("IDAT", deflateSync(raw, { level: 9 })),
    pngChunk("IEND", Buffer.alloc(0)),
  ];
  return Buffer.concat([Buffer.from("89504e470d0a1a0a", "hex"), ...chunks]);
}

function pngChunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const crcBuffer = Buffer.concat([typeBuffer, data]);
  return Buffer.concat([uint32(data.length), typeBuffer, data, uint32(crc32(crcBuffer))]);
}

function uint32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32BE(value >>> 0);
  return buffer;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function blend(raw, index, color, alpha) {
  raw[index] = clamp(raw[index] * (1 - alpha) + color[0] * alpha);
  raw[index + 1] = clamp(raw[index + 1] * (1 - alpha) + color[1] * alpha);
  raw[index + 2] = clamp(raw[index + 2] * (1 - alpha) + color[2] * alpha);
}

function inspectPng(filePath) {
  if (!fileExists(filePath)) return { ok: false, fileSize: 0, width: null, height: null, issues: ["missing"] };
  const buffer = readFileSync(filePath);
  const fileSize = statSync(filePath).size;
  const fileWidth = buffer.length >= 24 && buffer.subarray(0, 8).toString("hex") === "89504e470d0a1a0a" ? buffer.readUInt32BE(16) : null;
  const fileHeight = fileWidth ? buffer.readUInt32BE(20) : null;
  const issues = [];
  if (fileSize <= 80_000) issues.push("file_too_small");
  if (fileWidth !== width || fileHeight !== height) issues.push("unexpected_dimensions");
  return { ok: issues.length === 0, fileSize, width: fileWidth, height: fileHeight, issues };
}

function selectOneDraft(drafts) {
  return sortDrafts(drafts)
    .filter((draft) => draft.channelId === targetChannelId)
    .filter((draft) => !draft.applied)
    .filter((draft) => ["draft", "approved", "needs_changes"].includes(draft.status))
    .filter((draft) => !draft.previewOnly)
    .slice(0, 1)[0] ?? null;
}

function updateDraftImageFields(drafts, draftId, candidate) {
  const nextDrafts = drafts.map((draft) => draft.id === draftId
    ? {
        ...draft,
        updatedAt: new Date().toISOString(),
        newImagePath: candidate.generationStatus === "generated" ? candidate.newImageCandidatePath : draft.newImagePath,
        realImageGeneration: candidate.generationStatus,
        realImageGenerationNote: candidate.generationStatus === "generated"
          ? "One controlled premium image candidate was generated as a draft asset only."
          : "Image candidate generation did not produce a physical file.",
        imageCandidate: candidate,
      }
    : draft);
  writeJson(draftsFile, { version: 1, updatedAt: new Date().toISOString(), drafts: sortDrafts(nextDrafts) });
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

function readDrafts(errors = []) {
  const fallback = { drafts: [] };
  const parsed = readJson(draftsFile, fallback, errors);
  const rawDrafts = Array.isArray(parsed) ? parsed : Array.isArray(parsed.drafts) ? parsed.drafts : [];
  return rawDrafts.map(normalizeDraft);
}

function readImageCandidateStore(errors = []) {
  const fallback = { version: 1, updatedAt: null, imageCandidates: [] };
  if (!existsSync(imageCandidatesFile)) return fallback;
  const parsed = readJson(imageCandidatesFile, fallback, errors);
  if (Array.isArray(parsed)) return { ...fallback, imageCandidates: parsed };
  if (Array.isArray(parsed.imageCandidates)) return { ...fallback, ...parsed };
  errors.push(`${path.relative(root, imageCandidatesFile)} does not contain an imageCandidates array.`);
  return fallback;
}

function writeImageCandidateStore(imageCandidates) {
  writeJson(imageCandidatesFile, { version: 1, updatedAt: new Date().toISOString(), imageCandidates: imageCandidates.map(normalizeImageCandidate) });
}

function normalizeDraft(draft) {
  return {
    ...(draft && typeof draft === "object" ? draft : {}),
    id: String(draft?.id ?? ""),
    postId: String(draft?.postId ?? ""),
    channelId: String(draft?.channelId ?? ""),
    title: String(draft?.title ?? ""),
    sourceStatus: String(draft?.sourceStatus ?? ""),
    status: String(draft?.status ?? "draft"),
    approved: Boolean(draft?.approved),
    applied: Boolean(draft?.applied),
    previewOnly: Boolean(draft?.previewOnly),
    oldImage: String(draft?.oldImage ?? ""),
    oldPrompt: String(draft?.oldPrompt ?? ""),
    newPremiumPrompt: String(draft?.newPremiumPrompt ?? ""),
    negativePrompt: String(draft?.negativePrompt ?? ""),
    newImagePath: draft?.newImagePath ? String(draft.newImagePath) : null,
    backupPath: draft?.backupPath ? String(draft.backupPath) : null,
    issues: Array.isArray(draft?.issues) ? draft.issues.map(String) : [],
    scores: draft?.scores && typeof draft.scores === "object" ? draft.scores : {},
    createdAt: String(draft?.createdAt ?? new Date(0).toISOString()),
    updatedAt: String(draft?.updatedAt ?? draft?.createdAt ?? new Date(0).toISOString()),
  };
}

function normalizeImageCandidate(candidate) {
  return {
    draftId: String(candidate?.draftId ?? ""),
    postId: String(candidate?.postId ?? ""),
    channelId: String(candidate?.channelId ?? ""),
    oldImagePath: String(candidate?.oldImagePath ?? ""),
    newImageCandidatePath: candidate?.newImageCandidatePath ? String(candidate.newImageCandidatePath) : null,
    newPremiumPrompt: String(candidate?.newPremiumPrompt ?? candidate?.prompt ?? ""),
    prompt: String(candidate?.prompt ?? candidate?.newPremiumPrompt ?? ""),
    negativePrompt: String(candidate?.negativePrompt ?? ""),
    qualityReasons: Array.isArray(candidate?.qualityReasons) ? candidate.qualityReasons.map(String) : [],
    generationStatus: String(candidate?.generationStatus ?? "unknown"),
    generatorUsed: String(candidate?.generatorUsed ?? "unknown"),
    generationError: candidate?.generationError ? String(candidate.generationError) : null,
    createdAt: String(candidate?.createdAt ?? new Date(0).toISOString()),
    visualQualityEstimate: candidate?.visualQualityEstimate && typeof candidate.visualQualityEstimate === "object" ? candidate.visualQualityEstimate : {},
    backupPath: candidate?.backupPath ? String(candidate.backupPath) : null,
    draftStatus: String(candidate?.draftStatus ?? ""),
    approved: Boolean(candidate?.approved),
    applied: Boolean(candidate?.applied),
    previewComparable: Boolean(candidate?.previewComparable),
    publishedPostsChanged: false,
    telegramRealSendWasNotRun: true,
  };
}

function upsertCandidate(candidates, nextCandidate) {
  const others = candidates.filter((candidate) => candidate.draftId !== nextCandidate.draftId);
  return sortCandidates([...others, nextCandidate]);
}

function sortDrafts(drafts) {
  return [...drafts].sort((left, right) => (Date.parse(right.createdAt) || 0) - (Date.parse(left.createdAt) || 0) || left.id.localeCompare(right.id));
}

function sortCandidates(candidates) {
  return [...candidates].sort((left, right) => (Date.parse(right.createdAt) || 0) - (Date.parse(left.createdAt) || 0) || left.draftId.localeCompare(right.draftId));
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

function hash(value) {
  let result = 2166136261;
  for (const char of String(value)) {
    result ^= char.charCodeAt(0);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function clamp(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function blockedReport({ write, message, errors }) {
  return {
    ok: false,
    status: "error",
    mode: write ? "create" : "dry-run",
    message,
    selectedDrafts: 0,
    imageCandidatesCreated: 0,
    errors,
    telegramRealSendWasNotRun: true,
    githubActionsWereNotTriggered: true,
    publishedPostsChanged: false,
    oldImagesDeleted: false,
  };
}
