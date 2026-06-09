import { NextResponse } from "next/server";
import { getPostDraftById } from "@/lib/post-draft-store";
import { validateTelegramSendSafety } from "@/lib/telegram-safety";
import type { PostDraftStatus } from "@/types";

export const dynamic = "force-dynamic";

interface SafetyCheckBody {
  channelId?: string;
  telegramChatId?: string;
  draftId?: string;
  draftStatus?: PostDraftStatus;
  messagesInRun?: number;
  messagesForChannelToday?: number;
  manualConfirmationToken?: string;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as SafetyCheckBody;
  const draft = body.draftId ? getPostDraftById(body.draftId) : undefined;
  const result = validateTelegramSendSafety({
    channelId: body.channelId ?? draft?.channelId,
    telegramChatId: body.telegramChatId ?? draft?.telegramChatId,
    draftId: body.draftId,
    draftStatus: body.draftStatus ?? draft?.status,
    messagesInRun: body.messagesInRun,
    messagesForChannelToday: body.messagesForChannelToday,
    manualConfirmationToken: body.manualConfirmationToken,
  });

  return NextResponse.json({
    ok: result.ok,
    canSendReal: result.canSendReal,
    mode: result.mode,
    dryRun: result.dryRun,
    realSendingEnabled: result.realSendingEnabled,
    reasons: result.reasons,
    checks: result.checks,
    telegramSent: false,
    productionLocked: true,
  });
}
