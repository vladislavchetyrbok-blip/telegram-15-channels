import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { channelGenerationConfigs, channelLogoFileNameHints } from "@/data/channelGeneration";
import { getTelegramAvatarStatus } from "@/lib/telegram-avatar-status";
import type { ChannelLogoStatus } from "@/types";

const uploadDir = path.join(process.cwd(), "public", "assets", "custom-logos");
const statePath = path.join(process.cwd(), "data", "runtime", "custom-logos.json");
const maxSizeBytes = 5 * 1024 * 1024;
const allowedExtensions = new Set(["png", "jpg", "jpeg", "webp", "svg"]);

export interface CustomLogoRecord {
  channelId: string;
  customLogoUrl: string;
  customLogoFileName: string;
  customLogoUploadedAt: string;
  logoSource: "custom";
  approvalStatus: Exclude<ChannelLogoStatus, "uploaded">;
  visualPolicyOk: boolean;
  notes: string;
  approvedAt?: string | null;
  rejectionReason?: string | null;
  updatedAt: string;
}

export interface ChannelLogoDisplayState {
  channelId: string;
  currentLogoUrl: string;
  customLogoUrl: string | null;
  customLogoFileName: string | null;
  customLogoUploadedAt: string | null;
  logoSource: "custom" | "generated";
  sourceLabel: "Мой логотип" | "Сгенерированный";
  status: "Мой логотип" | "Сгенерированный" | "fallback to generated";
  fileStatus: "logo OK" | "missing" | "fallback";
  approvalStatus: Exclude<ChannelLogoStatus, "uploaded">;
  logoOk: boolean;
  visualPolicyOk: boolean;
  notes: string;
  browserUrl: string;
  fileSystemPath: string;
  fileExists: boolean;
  debug: {
    browserUrl: string;
    fileSystemPath: string;
    exists: boolean;
    logoSource: "custom" | "generated";
    channelId: string;
  };
  telegramAvatarStatus: "manual_configured" | "unknown" | "not_configured";
  telegramAvatarLabel: string;
}

export function getChannelLogoDisplayState(channelId: string): ChannelLogoDisplayState {
  const record = getCustomLogoRecord(channelId);
  const telegramAvatar = getTelegramAvatarStatus(channelId);
  const generatedUrl = `/assets/channels/${channelId}/logo.svg`;
  const generatedPath = publicPathToFilePath(generatedUrl);

  if (record) {
    const customPath = publicPathToFilePath(record.customLogoUrl);
    const customExists = existsSync(customPath);
    const customRejected = record.approvalStatus === "rejected";

    if (customExists && !customRejected) {
      return {
        channelId,
        currentLogoUrl: record.customLogoUrl,
        customLogoUrl: record.customLogoUrl,
        customLogoFileName: record.customLogoFileName,
        customLogoUploadedAt: record.customLogoUploadedAt,
        logoSource: "custom",
        sourceLabel: "Мой логотип",
        status: "Мой логотип",
        fileStatus: "logo OK",
        approvalStatus: record.approvalStatus ?? "needs_review",
        logoOk: true,
        visualPolicyOk: Boolean(record.visualPolicyOk),
        notes: record.notes,
        browserUrl: record.customLogoUrl,
        fileSystemPath: customPath,
        fileExists: true,
        debug: {
          browserUrl: record.customLogoUrl,
          fileSystemPath: customPath,
          exists: true,
          logoSource: "custom",
          channelId,
        },
        telegramAvatarStatus: telegramAvatar.status,
        telegramAvatarLabel: telegramAvatar.label,
      };
    }

    if (customRejected) {
      const generatedExists = existsSync(generatedPath);

      return {
        channelId,
        currentLogoUrl: generatedUrl,
        customLogoUrl: record.customLogoUrl,
        customLogoFileName: record.customLogoFileName,
        customLogoUploadedAt: record.customLogoUploadedAt,
        logoSource: "generated",
        sourceLabel: "Сгенерированный",
        status: "fallback to generated",
        fileStatus: generatedExists ? "fallback" : "missing",
        approvalStatus: "rejected",
        logoOk: generatedExists,
        visualPolicyOk: false,
        notes: "Мой логотип отклонён. Сейчас используется сгенерированный логотип.",
        browserUrl: generatedUrl,
        fileSystemPath: generatedPath,
        fileExists: generatedExists,
        debug: {
          browserUrl: generatedUrl,
          fileSystemPath: generatedPath,
          exists: generatedExists,
          logoSource: "generated",
          channelId,
        },
        telegramAvatarStatus: telegramAvatar.status,
        telegramAvatarLabel: telegramAvatar.label,
      };
    }

    return {
      channelId,
      currentLogoUrl: generatedUrl,
      customLogoUrl: record.customLogoUrl,
      customLogoFileName: record.customLogoFileName,
      customLogoUploadedAt: record.customLogoUploadedAt,
      logoSource: "generated",
      sourceLabel: "Сгенерированный",
      status: "fallback to generated",
      fileStatus: "fallback",
      approvalStatus: "missing",
      logoOk: existsSync(generatedPath),
      visualPolicyOk: false,
      notes: "Мой логотип не найден на диске, используется сгенерированный fallback.",
      browserUrl: record.customLogoUrl,
      fileSystemPath: customPath,
      fileExists: false,
      debug: {
        browserUrl: record.customLogoUrl,
        fileSystemPath: customPath,
        exists: false,
        logoSource: "generated",
        channelId,
      },
      telegramAvatarStatus: telegramAvatar.status,
      telegramAvatarLabel: telegramAvatar.label,
    };
  }

  const generatedExists = existsSync(generatedPath);

  return {
    channelId,
    currentLogoUrl: generatedUrl,
    customLogoUrl: null,
    customLogoFileName: null,
    customLogoUploadedAt: null,
    logoSource: "generated",
    sourceLabel: "Сгенерированный",
    status: "Сгенерированный",
    fileStatus: generatedExists ? "logo OK" : "missing",
    approvalStatus: generatedExists ? "approved" : "missing",
    logoOk: generatedExists,
    visualPolicyOk: generatedExists,
    notes: generatedExists ? "Используется сгенерированный логотип." : "Сгенерированный логотип не найден.",
    browserUrl: generatedUrl,
    fileSystemPath: generatedPath,
    fileExists: generatedExists,
    debug: {
      browserUrl: generatedUrl,
      fileSystemPath: generatedPath,
      exists: generatedExists,
      logoSource: "generated",
      channelId,
    },
    telegramAvatarStatus: telegramAvatar.status,
    telegramAvatarLabel: telegramAvatar.label,
  };
}

export function getCustomLogoAudit(channelIds: string[]) {
  const states = channelIds.map(getChannelLogoDisplayState);

  return {
    totalChannels: states.length,
    customLogosUploaded: states.filter((state) => Boolean(state.customLogoUrl)).length,
    customApproved: states.filter((state) => Boolean(state.customLogoUrl) && state.approvalStatus === "approved" && state.fileExists).length,
    generatedRemaining: states.filter((state) => state.logoSource === "generated").length,
    brokenPaths: states.filter((state) => !state.logoOk).length,
    states,
  };
}

export function getCustomLogoRecord(channelId: string) {
  return normalizeCustomLogoRecord(readCustomLogoState()[channelId]);
}

export async function uploadCustomLogo(channelId: string, file: File) {
  const extension = getFileExtension(file.name);

  if (!extension || !allowedExtensions.has(extension)) {
    return { ok: false, error: "Неподдерживаемый формат логотипа." };
  }

  if (file.size > maxSizeBytes) {
    return { ok: false, error: "Файл больше 5 MB." };
  }

  mkdirSync(uploadDir, { recursive: true });
  const state = readCustomLogoState();
  const current = state[channelId];

  if (current?.customLogoUrl) {
    const currentPath = publicPathToFilePath(current.customLogoUrl);
    if (existsSync(currentPath)) {
      rmSync(currentPath, { force: true });
    }
  }

  const fileName = `${getLogoBaseName(channelId)}.${extension}`;
  const filePath = path.join(uploadDir, fileName);
  const bytes = Buffer.from(await file.arrayBuffer());
  writeFileSync(filePath, bytes);

  const now = new Date().toISOString();
  const record: CustomLogoRecord = {
    channelId,
    customLogoUrl: `/assets/custom-logos/${fileName}`,
    customLogoFileName: fileName,
    customLogoUploadedAt: now,
    logoSource: "custom",
    approvalStatus: "needs_review",
    visualPolicyOk: false,
    notes: "Логотип загружен. Нужна ручная проверка.",
    approvedAt: null,
    rejectionReason: null,
    updatedAt: now,
  };
  state[channelId] = record;
  writeCustomLogoState(state);

  return {
    ok: true,
    ...record,
    display: getChannelLogoDisplayState(channelId),
  };
}

export function approveCustomLogo(channelId: string, status: Exclude<ChannelLogoStatus, "missing" | "uploaded">, notes?: string) {
  const state = readCustomLogoState();
  const current = normalizeCustomLogoRecord(state[channelId]);

  if (!current) {
    return { ok: false, error: "Мой логотип для канала не найден." };
  }

  const fileSystemPath = publicPathToFilePath(current.customLogoUrl);

  if (!existsSync(fileSystemPath)) {
    current.approvalStatus = "missing";
    current.visualPolicyOk = false;
    current.notes = "Файл моего логотипа не найден на диске.";
    current.updatedAt = new Date().toISOString();
    state[channelId] = current;
    writeCustomLogoState(state);

    return {
      ok: false,
      error: "Файл моего логотипа не найден на диске.",
      display: getChannelLogoDisplayState(channelId),
    };
  }

  const now = new Date().toISOString();
  current.approvalStatus = status;
  current.visualPolicyOk = status === "approved";
  current.notes =
    notes ??
    (status === "approved"
      ? "Approved by user"
      : status === "rejected"
        ? "Логотип отклонён вручную."
        : "Логотип требует ручной проверки.");
  current.approvedAt = status === "approved" ? now : current.approvedAt ?? null;
  current.rejectionReason = status === "rejected" ? current.notes : null;
  current.updatedAt = now;
  state[channelId] = current;
  writeCustomLogoState(state);

  return {
    ok: true,
    display: getChannelLogoDisplayState(channelId),
  };
}

export function deleteCustomLogo(channelId: string) {
  const state = readCustomLogoState();
  const current = state[channelId];

  if (current?.customLogoUrl) {
    const currentPath = publicPathToFilePath(current.customLogoUrl);
    if (existsSync(currentPath)) {
      rmSync(currentPath, { force: true });
    }
  }

  delete state[channelId];
  writeCustomLogoState(state);

  return {
    ok: true,
    display: getChannelLogoDisplayState(channelId),
  };
}

export function publicLogoUrlToFilePath(publicPath: string) {
  return publicPathToFilePath(publicPath);
}

function readCustomLogoState(): Record<string, CustomLogoRecord> {
  if (!existsSync(statePath)) {
    return {};
  }

  return JSON.parse(readFileSync(statePath, "utf8")) as Record<string, CustomLogoRecord>;
}

function writeCustomLogoState(state: Record<string, CustomLogoRecord>) {
  mkdirSync(path.dirname(statePath), { recursive: true });
  writeFileSync(statePath, JSON.stringify(state, null, 2), "utf8");
}

function normalizeCustomLogoRecord(record?: Partial<CustomLogoRecord> | null): CustomLogoRecord | null {
  if (!record?.channelId || !record.customLogoUrl || !record.customLogoFileName || !record.customLogoUploadedAt) {
    return null;
  }

  return {
    channelId: record.channelId,
    customLogoUrl: record.customLogoUrl,
    customLogoFileName: record.customLogoFileName,
    customLogoUploadedAt: record.customLogoUploadedAt,
    logoSource: "custom",
    approvalStatus: record.approvalStatus ?? "needs_review",
    visualPolicyOk: Boolean(record.visualPolicyOk),
    notes: record.notes ?? "Логотип загружен. Нужна ручная проверка.",
    approvedAt: record.approvedAt ?? null,
    rejectionReason: record.rejectionReason ?? null,
    updatedAt: record.updatedAt ?? record.customLogoUploadedAt,
  };
}

function getLogoBaseName(channelId: string) {
  const index = channelGenerationConfigs.findIndex((channel) => channel.id === channelId);
  const hint = index >= 0 ? channelLogoFileNameHints[index] : undefined;
  return hint ? hint.replace(/\.[^.]+$/, "") : channelId;
}

function getFileExtension(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase();
  return extension && extension !== fileName ? extension : null;
}

function publicPathToFilePath(publicPath: string) {
  return path.join(process.cwd(), "public", publicPath.replace(/^\//, ""));
}
