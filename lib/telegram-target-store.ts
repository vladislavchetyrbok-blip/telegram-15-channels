import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { channelGenerationConfigs } from "@/data/channelGeneration";
import { getCanonicalChannelTitle } from "@/lib/channel-canonical";

export type TelegramLinkSource = "getUpdates" | "manual";

export interface TelegramTargetBinding {
  channelId: string;
  channelTitle: string;
  telegramTarget: string;
  telegramTargetTitle: string;
  telegramTargetType: string;
  telegramLinkedAt: string | null;
  telegramLinkSource: TelegramLinkSource | null;
}

export interface TelegramTargetInput {
  telegramTarget: string;
  telegramTargetTitle?: string;
  telegramTargetType?: string;
  telegramLinkSource?: TelegramLinkSource;
}

const statePath = path.join(process.cwd(), "data", "runtime", "telegram-targets.json");

export function listTelegramTargetBindings(): TelegramTargetBinding[] {
  const stored = readStoredBindings();

  return channelGenerationConfigs.map((channel) => {
    const item = stored[channel.id];

    return {
      channelId: channel.id,
      channelTitle: getCanonicalChannelTitle(channel.id, channel.name),
      telegramTarget: item?.telegramTarget ?? "",
      telegramTargetTitle: item?.telegramTargetTitle ?? "",
      telegramTargetType: item?.telegramTargetType ?? "",
      telegramLinkedAt: item?.telegramLinkedAt ?? null,
      telegramLinkSource: item?.telegramLinkSource ?? null,
    };
  });
}

export function getTelegramTargetBinding(channelId: string) {
  return listTelegramTargetBindings().find((item) => item.channelId === channelId) ?? null;
}

export function saveTelegramTargetBinding(channelId: string, input: TelegramTargetInput) {
  const channel = channelGenerationConfigs.find((item) => item.id === channelId);

  if (!channel) {
    return null;
  }

  const target = input.telegramTarget.trim();
  const stored = readStoredBindings();
  const binding: TelegramTargetBinding = {
    channelId,
    channelTitle: getCanonicalChannelTitle(channel.id, channel.name),
    telegramTarget: target,
    telegramTargetTitle: input.telegramTargetTitle?.trim() ?? "",
    telegramTargetType: input.telegramTargetType?.trim() ?? "",
    telegramLinkedAt: target ? new Date().toISOString() : null,
    telegramLinkSource: target ? input.telegramLinkSource ?? "manual" : null,
  };

  stored[channelId] = binding;
  writeStoredBindings(stored);

  return binding;
}

export function clearTelegramTargetBinding(channelId: string) {
  const stored = readStoredBindings();
  delete stored[channelId];
  writeStoredBindings(stored);
}

export function seedTelegramTargetsFromKnownChatIds() {
  const stored = readStoredBindings();
  let linked = 0;
  let created = 0;

  for (const channel of channelGenerationConfigs) {
    if (stored[channel.id]?.telegramTarget || !channel.telegramChatId) {
      if (stored[channel.id]?.telegramTarget) linked += 1;
      continue;
    }

    stored[channel.id] = {
      channelId: channel.id,
      channelTitle: channel.name,
      telegramTarget: channel.telegramChatId,
      telegramTargetTitle: channel.name,
      telegramTargetType: "channel",
      telegramLinkedAt: new Date().toISOString(),
      telegramLinkSource: "manual",
    };
    created += 1;
    linked += 1;
  }

  writeStoredBindings(stored);

  return {
    ok: true,
    created,
    linked,
    total: channelGenerationConfigs.length,
    targets: listTelegramTargetBindings(),
  };
}

export function isValidTelegramTarget(value: string) {
  const target = value.trim();

  return /^@\w{5,}$/.test(target) || /^-100\d{7,}$/.test(target) || /^-?\d{5,}$/.test(target);
}

function readStoredBindings() {
  if (!existsSync(statePath)) {
    return {} as Record<string, TelegramTargetBinding>;
  }

  return JSON.parse(readFileSync(statePath, "utf8")) as Record<string, TelegramTargetBinding>;
}

function writeStoredBindings(bindings: Record<string, TelegramTargetBinding>) {
  mkdirSync(path.dirname(statePath), { recursive: true });
  writeFileSync(statePath, JSON.stringify(bindings, null, 2), "utf8");
}
