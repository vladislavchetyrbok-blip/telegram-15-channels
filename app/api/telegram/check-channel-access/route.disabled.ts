import { NextResponse } from "next/server";
import { checkTelegramChannelAccess } from "@/lib/telegram-access";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const result = await checkTelegramChannelAccess({
    channelId: typeof body.channelId === "string" ? body.channelId : undefined,
    telegramTarget: typeof body.telegramTarget === "string" ? body.telegramTarget : undefined,
  });

  return NextResponse.json(
    {
      ok: result.accessStatus === "ok",
      tokenConfigured: process.env.TELEGRAM_BOT_TOKEN ? true : false,
      chatFound: result.accessStatus === "ok" || result.accessStatus === "bot_not_admin" || result.accessStatus === "not_enough_rights",
      botAdmin: result.botAdmin,
      canPost: result.canPost,
      result,
    },
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    },
  );
}
