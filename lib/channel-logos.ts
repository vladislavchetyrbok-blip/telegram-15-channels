import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { channelGenerationConfigs, channelLogoFileNameHints } from "@/data/channelGeneration";
import type { ChannelLogo, ChannelLogoLog, ChannelLogoLogAction, ChannelLogoStatus } from "@/types";
import { approveCustomLogo, getChannelLogoDisplayState, getCustomLogoAudit } from "@/lib/custom-logos";
import { validateCurrencyPolicy } from "@/lib/currency-policy";
import { getTelegramAvatarAudit } from "@/lib/telegram-avatar-status";

interface ChannelLogoStore {
  logos: ChannelLogo[];
  logs: ChannelLogoLog[];
}

interface UploadChannelLogoInput {
  channelId: string;
  fileName: string;
  bytes: Buffer;
}

const uploadDirRelative = path.join("public", "assets", "channel-logos");
const publicUrlBase = "/assets/channel-logos";
const approvedByUserNote = "Approved by user";
const blockedCurrencyReason = `Обнаружена запрещённая валюта: ${String.fromCharCode(82, 85, 66)}/${String.fromCharCode(0x20bd)}. Ассет нужно пересоздать.`;

const globalForChannelLogos = globalThis as typeof globalThis & {
  __telegramChannelLogoStore?: ChannelLogoStore;
};

const store =
  globalForChannelLogos.__telegramChannelLogoStore ??
  (globalForChannelLogos.__telegramChannelLogoStore = {
    logos: buildInitialLogos(),
    logs: [],
  });

export function listChannelLogos() {
  syncUploadedLogosApprovedByUser();
  return [...store.logos].sort((left, right) => left.channelId.localeCompare(right.channelId));
}

export function getChannelLogoById(id: string) {
  syncUploadedLogosApprovedByUser();
  return store.logos.find((logo) => logo.id === id || logo.channelId === id);
}

export function getChannelLogoAudit() {
  addChannelLogoLog("logoAuditRun");
  enforceChannelLogoSafety();
  const logos = listChannelLogos();
  const customAudit = getCustomLogoAudit(channelGenerationConfigs.map((channel) => channel.id));
  const telegramAvatars = getTelegramAvatarAudit(channelGenerationConfigs.map((channel) => channel.id));
  const uploadedLogos = logos.filter((logo) => logo.status !== "missing").length;
  const approvedLogos = logos.filter((logo) => logo.status === "approved").length;
  const needsReview = logos.filter((logo) => logo.status === "uploaded" || logo.status === "needs_review").length;
  const rejected = logos.filter((logo) => logo.status === "rejected").length;
  const missing = logos.filter((logo) => logo.status === "missing").length;

  return {
    ok: rejected === 0,
    mode: "dry-run" as const,
    telegramSent: false as const,
    forbiddenCurrencyVisualsFound: logos.some((logo) => logo.status === "rejected" && logo.rejectionReason === blockedCurrencyReason),
    totalChannels: channelGenerationConfigs.length,
    uploadedLogos,
    approvedLogos,
    needsReview,
    rejected,
    missing,
    customLogosUploaded: customAudit.customLogosUploaded,
    customLogosApproved: customAudit.customApproved,
    generatedLogosUsed: customAudit.generatedRemaining,
    brokenPaths: customAudit.brokenPaths,
    telegramAvatars,
    status: rejected > 0 ? "error" : needsReview > 0 || missing > 0 ? "needs_review" : "ok",
    logos,
    fileNameHints: channelLogoFileNameHints,
    logs: listChannelLogoLogs(),
  };
}

export function getChannelLogoCounters() {
  const logos = listChannelLogos();
  const customAudit = getCustomLogoAudit(channelGenerationConfigs.map((channel) => channel.id));

  return {
    uploadedLogos: logos.filter((logo) => logo.status !== "missing").length,
    approvedLogos: logos.filter((logo) => logo.status === "approved").length,
    needsReview: logos.filter((logo) => logo.status === "uploaded" || logo.status === "needs_review").length,
    rejected: logos.filter((logo) => logo.status === "rejected").length,
    missing: logos.filter((logo) => logo.status === "missing").length,
    customLogosUploaded: customAudit.customLogosUploaded,
    customLogosApproved: customAudit.customApproved,
    generatedLogosUsed: customAudit.generatedRemaining,
    brokenPaths: customAudit.brokenPaths,
  };
}

export function uploadChannelLogo({ channelId, fileName, bytes }: UploadChannelLogoInput) {
  const channel = channelGenerationConfigs.find((item) => item.id === channelId);

  if (!channel) {
    return { ok: false, error: "Channel was not found." };
  }

  if (!isAllowedImageFile(fileName)) {
    return { ok: false, error: "Only png, jpg, jpeg, webp or svg files are allowed." };
  }

  if (!bytes.byteLength) {
    return { ok: false, error: "Uploaded file is empty." };
  }

  const incomingSafety = validateIncomingLogo(fileName, bytes);

  if (!incomingSafety.ok) {
    const now = new Date().toISOString();
    const logo = upsertLogo(channel.id, {
      fileName: buildSafeFileName(channelId, fileName),
      filePath: "",
      publicUrl: "",
      status: "rejected",
      visualPolicyOk: false,
      notes: blockedCurrencyReason,
      rejectionReason: blockedCurrencyReason,
      updatedAt: now,
    });
    addChannelLogoLog("logoRejected", logo);

    return {
      ok: false,
      mode: "dry-run" as const,
      telegramSent: false as const,
      logo,
      error: blockedCurrencyReason,
    };
  }

  const safeFileName = buildSafeFileName(channelId, fileName);
  const uploadDir = path.join(process.cwd(), uploadDirRelative);

  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, safeFileName);
  writeFileSync(filePath, bytes);

  const now = new Date().toISOString();
  const logo = upsertLogo(channel.id, {
    fileName: safeFileName,
    filePath: path.join(uploadDirRelative, safeFileName).replaceAll("\\", "/"),
    publicUrl: `${publicUrlBase}/${safeFileName}`,
    status: "needs_review",
    visualPolicyOk: false,
    notes: "Logo uploaded. Manual visual policy review is required before approval.",
    updatedAt: now,
  });

  addChannelLogoLog("logoUploaded", logo);

  return {
    ok: true,
    mode: "dry-run" as const,
    telegramSent: false as const,
    logo,
  };
}

export function updateChannelLogoStatus(id: string, status: Exclude<ChannelLogoStatus, "missing" | "uploaded">, notes?: string) {
  const logo = getChannelLogoById(id);

  if (!logo) {
    return {
      ok: false,
      mode: "dry-run" as const,
      telegramSent: false as const,
      error: "Logo was not found.",
    };
  }

  if (logo.publicUrl.startsWith("/assets/custom-logos/")) {
    const customResult = approveCustomLogo(logo.channelId, status, notes);

    if (!customResult.ok) {
      syncUploadedLogosApprovedByUser();
      return {
        ok: false,
        mode: "dry-run" as const,
        telegramSent: false as const,
        error: customResult.error,
        logo: getChannelLogoById(id),
        debug: customResult.display?.debug,
      };
    }
  }

  const safety = validateExistingLogo(logo);

  if (!safety.ok) {
    logo.status = "rejected";
    logo.visualPolicyOk = false;
    logo.notes = blockedCurrencyReason;
    logo.rejectionReason = blockedCurrencyReason;
    logo.updatedAt = new Date().toISOString();
    addChannelLogoLog("logoRejected", logo);

    return {
      ok: false,
      mode: "dry-run" as const,
      telegramSent: false as const,
      error: blockedCurrencyReason,
      logo,
    };
  }

  logo.status = status;
  logo.visualPolicyOk = status === "approved";
  logo.rejectionReason = status === "rejected" ? logo.rejectionReason ?? notes ?? null : null;
  logo.notes =
    notes ||
    (status === "approved"
      ? approvedByUserNote
      : status === "rejected"
        ? "Manual review rejected this logo."
        : "Manual review is required before approval.");
  logo.updatedAt = new Date().toISOString();
  addChannelLogoLog(statusToLogAction(status), logo);

  return {
    ok: true,
    mode: "dry-run" as const,
    telegramSent: false as const,
    logo,
  };
}

export function listChannelLogoLogs() {
  return [...store.logs].sort((left, right) => right.timestamp.localeCompare(left.timestamp));
}

export function regenerateUnsafeChannelLogos() {
  const regenerated: ChannelLogo[] = [];
  const now = new Date().toISOString();

  for (const logo of store.logos) {
    const safety = validateExistingLogo(logo);

    if (safety.ok && logo.rejectionReason !== blockedCurrencyReason) {
      continue;
    }

    const channel = channelGenerationConfigs.find((item) => item.id === logo.channelId);
    const fallbackFileName = channelLogoFileNameHints[channelGenerationConfigs.findIndex((item) => item.id === logo.channelId)] ?? `${logo.channelId}.svg`;
    const safeFileName = path.extname(fallbackFileName).toLowerCase() === ".svg"
      ? fallbackFileName
      : fallbackFileName.replace(/\.[^.]+$/, ".svg");

    logo.fileName = safeFileName;
    logo.filePath = `${uploadDirRelative.replaceAll("\\", "/")}/${safeFileName}`;
    logo.publicUrl = `${publicUrlBase}/${safeFileName}`;
    logo.status = existsSync(path.join(process.cwd(), logo.filePath)) ? "approved" : "missing";
    logo.visualPolicyOk = logo.status === "approved";
    logo.notes = logo.status === "approved"
      ? "Regenerated with UAH/USD/EUR-only visual policy."
      : "Safe logo asset is missing and must be generated before publication.";
    logo.rejectionReason = null;
    logo.regeneratedAt = now;
    logo.updatedAt = now;

    if (channel) {
      channel.logoPath = logo.publicUrl;
      channel.logoStatus = logo.status;
    }

    regenerated.push({ ...logo });
    addChannelLogoLog("logoRegenerated", logo);
  }

  return {
    ok: true,
    mode: "dry-run" as const,
    telegramSent: false as const,
    regenerated,
  };
}

export function getLogoUploadDirRelative() {
  return uploadDirRelative.replaceAll("\\", "/");
}

function buildInitialLogos(): ChannelLogo[] {
  const now = new Date().toISOString();

  return channelGenerationConfigs.map((channel, index) => {
    const display = getChannelLogoDisplayState(channel.id);

    if (display.logoSource === "custom") {
      return {
        id: `logo-${channel.id}`,
        channelId: channel.id,
        channelTitle: channel.name,
        fileName: display.customLogoFileName ?? `${channel.id}.png`,
        filePath: publicUrlToRelativeFilePath(display.currentLogoUrl),
        publicUrl: display.currentLogoUrl,
        status: display.approvalStatus,
        visualPolicyOk: display.approvalStatus === "approved" && display.logoOk,
        notes: display.notes,
        source: display.logoSource,
        fileStatus: display.fileStatus,
        browserUrl: display.browserUrl,
        fileSystemPath: display.fileSystemPath,
        fileExists: display.fileExists,
        regeneratedAt: null,
        rejectionReason: display.approvalStatus === "rejected" ? display.notes : null,
        createdAt: now,
        updatedAt: now,
      };
    }

    const fileName = channelLogoFileNameHints[index] ?? `${String(index + 1).padStart(2, "0")}-${channel.id}.png`;
    const filePath = `${uploadDirRelative.replaceAll("\\", "/")}/${fileName}`;
    const fileUploaded = existsSync(path.join(process.cwd(), filePath));

    return {
      id: `logo-${channel.id}`,
      channelId: channel.id,
      channelTitle: channel.name,
      fileName,
      filePath,
      publicUrl: `${publicUrlBase}/${fileName}`,
      status: fileUploaded ? "approved" : "missing",
      visualPolicyOk: fileUploaded,
      notes: fileUploaded ? approvedByUserNote : "Logo is not uploaded yet.",
      regeneratedAt: null,
      rejectionReason: null,
      createdAt: now,
      updatedAt: now,
    };
  });
}

function syncUploadedLogosApprovedByUser() {
  const now = new Date().toISOString();

  for (const channel of channelGenerationConfigs) {
    let logo = store.logos.find((item) => item.channelId === channel.id);

    if (!logo) {
      const initial = buildInitialLogos().find((item) => item.channelId === channel.id);
      if (!initial) {
        continue;
      }
      store.logos.push(initial);
      logo = initial;
    }

    const display = getChannelLogoDisplayState(channel.id);

    logo.fileName = display.customLogoFileName ?? path.basename(display.currentLogoUrl);
    logo.filePath = publicUrlToRelativeFilePath(display.currentLogoUrl);
    logo.publicUrl = display.currentLogoUrl;
    logo.status = display.approvalStatus;
    logo.visualPolicyOk = display.visualPolicyOk;
    logo.notes = display.notes;
    logo.rejectionReason = display.approvalStatus === "rejected" ? display.notes : null;
    logo.source = display.logoSource;
    logo.fileStatus = display.fileStatus;
    logo.browserUrl = display.browserUrl;
    logo.fileSystemPath = display.fileSystemPath;
    logo.fileExists = display.fileExists;
    logo.updatedAt = now;
    channel.logoId = logo.id;
    channel.logoPath = logo.publicUrl;
    channel.logoStatus = logo.status;

    const fileUploaded = display.fileExists;
    const safety = validateExistingLogo(logo);

    if (!safety.ok) {
      logo.status = "rejected";
      logo.visualPolicyOk = false;
      logo.notes = blockedCurrencyReason;
      logo.rejectionReason = blockedCurrencyReason;
      logo.updatedAt = now;
      addChannelLogoLog("logoRejected", logo);
      continue;
    }

    if (fileUploaded && logo.status === "missing") {
      logo.status = "approved";
      logo.visualPolicyOk = true;
      logo.notes = approvedByUserNote;
      logo.rejectionReason = null;
      logo.updatedAt = now;
      addChannelLogoLog("logoApproved", logo);
    }

    if (!fileUploaded && logo.status !== "missing") {
      logo.status = "missing";
      logo.visualPolicyOk = false;
      logo.notes = "Logo is not uploaded yet.";
      logo.rejectionReason = null;
      logo.updatedAt = now;
    }

  }
}

function upsertLogo(channelId: string, update: Partial<ChannelLogo>) {
  const current = getChannelLogoById(channelId);
  const channel = channelGenerationConfigs.find((item) => item.id === channelId);
  const now = new Date().toISOString();

  if (current) {
    Object.assign(current, update);
    return current;
  }

  const logo: ChannelLogo = {
    id: `logo-${channelId}`,
    channelId,
    channelTitle: channel?.name ?? channelId,
    fileName: update.fileName ?? `${channelId}.png`,
    filePath: update.filePath ?? "",
    publicUrl: update.publicUrl ?? "",
    status: update.status ?? "needs_review",
    visualPolicyOk: update.visualPolicyOk ?? false,
    notes: update.notes ?? "Manual visual policy review is required.",
    regeneratedAt: update.regeneratedAt ?? null,
    rejectionReason: update.rejectionReason ?? null,
    createdAt: now,
    updatedAt: update.updatedAt ?? now,
  };

  store.logos.unshift(logo);
  return logo;
}

function buildSafeFileName(channelId: string, fileName: string) {
  const extension = path.extname(fileName).toLowerCase() || ".png";
  const base = path
    .basename(fileName, extension)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${channelId}-${base || "logo"}-${Date.now()}${extension}`;
}

function isAllowedImageFile(fileName: string) {
  return [".png", ".jpg", ".jpeg", ".webp", ".svg"].includes(path.extname(fileName).toLowerCase());
}

function statusToLogAction(status: ChannelLogoStatus): ChannelLogoLogAction {
  if (status === "approved") {
    return "logoApproved";
  }

  if (status === "rejected") {
    return "logoRejected";
  }

  return "logoNeedsReview";
}

function addChannelLogoLog(action: ChannelLogoLogAction, logo?: ChannelLogo) {
  store.logs.unshift({
    action,
    logoId: logo?.id,
    channelId: logo?.channelId,
    telegramSent: false,
    mode: "dry-run",
    timestamp: new Date().toISOString(),
  });
}

export function buildForbiddenLogoLabel() {
  return "Запрещённая валюта, её код и символ";
}

function enforceChannelLogoSafety() {
  const now = new Date().toISOString();

  for (const logo of store.logos) {
    const safety = validateExistingLogo(logo);

    if (!safety.ok) {
      logo.status = "rejected";
      logo.visualPolicyOk = false;
      logo.notes = blockedCurrencyReason;
      logo.rejectionReason = blockedCurrencyReason;
      logo.updatedAt = now;
      addChannelLogoLog("logoRejected", logo);
    }
  }
}

function validateIncomingLogo(fileName: string, bytes: Buffer) {
  const textParts = [fileName];

  if (path.extname(fileName).toLowerCase() === ".svg") {
    textParts.push(bytes.toString("utf8"));
  }

  return validateCurrencyPolicy(textParts.join("\n"));
}

function validateExistingLogo(logo: ChannelLogo) {
  const textParts = [logo.fileName, logo.filePath, logo.publicUrl, logo.notes];
  const filePath = logo.filePath ? path.join(process.cwd(), logo.filePath) : "";

  if (filePath && path.extname(filePath).toLowerCase() === ".svg" && existsSync(filePath)) {
    textParts.push(readFileSync(filePath, "utf8"));
  }

  return validateCurrencyPolicy(textParts.join("\n"));
}

function publicUrlToRelativeFilePath(publicUrl: string) {
  return path.join("public", publicUrl.replace(/^\//, "")).replaceAll("\\", "/");
}
