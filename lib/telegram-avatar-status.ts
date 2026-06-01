import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { channelGenerationConfigs } from "@/data/channelGeneration";
import type { TelegramAvatarStatus } from "@/types";

const statePath = path.join(process.cwd(), "data", "runtime", "telegram-avatar-status.json");
const defaultStatus: TelegramAvatarStatus = "manual_configured";

export interface TelegramAvatarState {
  channelId: string;
  status: TelegramAvatarStatus;
  label: string;
  updatedAt: string;
}

export function getTelegramAvatarStatus(channelId: string): TelegramAvatarState {
  const state = readState();
  const status = state[channelId]?.status ?? defaultStatus;

  return {
    channelId,
    status,
    label: getTelegramAvatarLabel(status),
    updatedAt: state[channelId]?.updatedAt ?? "",
  };
}

export function setTelegramAvatarStatus(channelId: string, status: TelegramAvatarStatus) {
  const channel = channelGenerationConfigs.find((item) => item.id === channelId);

  if (!channel) {
    return { ok: false, error: "Channel was not found." };
  }

  const state = readState();
  const record: TelegramAvatarState = {
    channelId,
    status,
    label: getTelegramAvatarLabel(status),
    updatedAt: new Date().toISOString(),
  };
  state[channelId] = record;
  writeState(state);

  return {
    ok: true,
    mode: "dry-run" as const,
    telegramSent: false as const,
    avatar: record,
  };
}

export function getTelegramAvatarAudit(channelIds = channelGenerationConfigs.map((channel) => channel.id)) {
  const states = channelIds.map(getTelegramAvatarStatus);

  return {
    totalChannels: states.length,
    manualConfigured: states.filter((state) => state.status === "manual_configured").length,
    unknown: states.filter((state) => state.status === "unknown").length,
    notConfigured: states.filter((state) => state.status === "not_configured").length,
    states,
  };
}

function getTelegramAvatarLabel(status: TelegramAvatarStatus) {
  if (status === "manual_configured") return "Настроен вручную в Telegram";
  if (status === "not_configured") return "Не настроен";
  return "Неизвестно";
}

function readState(): Record<string, TelegramAvatarState> {
  if (!existsSync(statePath)) {
    return {};
  }

  return JSON.parse(readFileSync(statePath, "utf8")) as Record<string, TelegramAvatarState>;
}

function writeState(state: Record<string, TelegramAvatarState>) {
  mkdirSync(path.dirname(statePath), { recursive: true });
  writeFileSync(statePath, JSON.stringify(state, null, 2), "utf8");
}
