import { NextResponse } from "next/server";
import { clearTelegramTargetBinding, isValidTelegramTarget, saveTelegramTargetBinding } from "@/lib/telegram-target-store";

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: { params: { channelId: string } }) {
  const body = await request.json().catch(() => ({}));
  const telegramTarget = typeof body.telegramTarget === "string" ? body.telegramTarget.trim() : "";

  if (telegramTarget && !isValidTelegramTarget(telegramTarget)) {
    return NextResponse.json(
      {
        ok: false,
        error: "wrong channel username/chat_id",
      },
      { status: 422 },
    );
  }

  const binding = saveTelegramTargetBinding(params.channelId, {
    telegramTarget,
    telegramTargetTitle: typeof body.telegramTargetTitle === "string" ? body.telegramTargetTitle : "",
    telegramTargetType: typeof body.telegramTargetType === "string" ? body.telegramTargetType : "",
    telegramLinkSource: body.telegramLinkSource === "getUpdates" ? "getUpdates" : "manual",
  });

  if (!binding) {
    return NextResponse.json({ ok: false, error: "platform channel not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, binding });
}

export async function DELETE(_request: Request, { params }: { params: { channelId: string } }) {
  clearTelegramTargetBinding(params.channelId);

  return NextResponse.json({ ok: true });
}
