import { getTelegramTargetBinding, listTelegramTargetBindings } from "@/lib/telegram-target-store";

export interface TelegramChannelTarget {
  index: number;
  envKey: string;
  channelId: string;
  channelTitle: string;
  fallbackChatId: string;
  target: string;
  configured: boolean;
  targetTitle: string;
  targetType: string;
  linkSource: string | null;
}

export function getTelegramChannelTargets(): TelegramChannelTarget[] {
  return listTelegramTargetBindings().map((binding, index) => ({
    index: index + 1,
    envKey: `TELEGRAM_CHANNEL_${String(index + 1).padStart(2, "0")}`,
    channelId: binding.channelId,
    channelTitle: binding.channelTitle,
    fallbackChatId: "",
    target: binding.telegramTarget,
    configured: Boolean(binding.telegramTarget),
    targetTitle: binding.telegramTargetTitle,
    targetType: binding.telegramTargetType,
    linkSource: binding.telegramLinkSource,
  }));
}

export function getTelegramChannelTargetByKey(envKey?: string) {
  if (!envKey) {
    return null;
  }

  return getTelegramChannelTargets().find((target) => target.envKey === envKey) ?? null;
}

export function getTelegramChannelTargetByChannelId(channelId?: string) {
  if (!channelId) {
    return null;
  }

  const binding = getTelegramTargetBinding(channelId);

  if (!binding) {
    return null;
  }

  const index = listTelegramTargetBindings().findIndex((item) => item.channelId === channelId);

  return {
    index: index + 1,
    envKey: `TELEGRAM_CHANNEL_${String(index + 1).padStart(2, "0")}`,
    channelId: binding.channelId,
    channelTitle: binding.channelTitle,
    fallbackChatId: "",
    target: binding.telegramTarget,
    configured: Boolean(binding.telegramTarget),
    targetTitle: binding.telegramTargetTitle,
    targetType: binding.telegramTargetType,
    linkSource: binding.telegramLinkSource,
  } satisfies TelegramChannelTarget;
}

export function getTelegramChannelTargetByValue(value?: string) {
  if (!value) {
    return null;
  }

  return getTelegramChannelTargets().find((target) => target.target === value) ?? null;
}

export function getDefaultTelegramTestTarget() {
  return getTelegramChannelTargets().find((target) => target.configured) ?? null;
}

export function maskTelegramTarget(target: string) {
  if (!target) {
    return "missing";
  }

  if (target.startsWith("@")) {
    return target;
  }

  return `configured ****${target.slice(-4)}`;
}
