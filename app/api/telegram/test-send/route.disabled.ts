import { NextResponse } from "next/server";
import { getTelegramTestSendStatus, runTelegramTestSend } from "@/lib/telegram-test-send";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getTelegramTestSendStatus(), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const result = await runTelegramTestSend({
    postId: typeof body.postId === "string" ? body.postId : undefined,
    channelId: typeof body.channelId === "string" ? body.channelId : undefined,
    targetEnvKey: typeof body.targetEnvKey === "string" ? body.targetEnvKey : undefined,
    telegramTarget: typeof body.telegramTarget === "string" ? body.telegramTarget : undefined,
    force: body.force === true,
  });

  return NextResponse.json(result, {
    status: result.ok ? 200 : 422,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
