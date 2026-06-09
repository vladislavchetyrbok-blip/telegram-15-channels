import { NextResponse } from "next/server";
import { getTelegramSafetyConfig, listTelegramSafetyLogs } from "@/lib/telegram-safety";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = getTelegramSafetyConfig();

  return NextResponse.json({
    ok: config.dryRun && !config.realSendingEnabled,
    mode: config.mode,
    dryRun: config.dryRun,
    realSendingEnabled: config.realSendingEnabled,
    emergencyStop: config.emergencyStop,
    maxMessagesPerRun: config.maxMessagesPerRun,
    maxMessagesPerChannelPerDay: config.maxMessagesPerChannelPerDay,
    requireApprovedDraftOnly: config.requireApprovedDraftOnly,
    requireScheduledOnly: config.requireScheduledOnly,
    requireManualConfirm: config.requireManualConfirm,
    requireTelegramChatId: config.requireTelegramChatId,
    requireBotToken: config.requireBotToken,
    productionLocked: true,
    telegramSent: false,
    logs: listTelegramSafetyLogs(),
  });
}
