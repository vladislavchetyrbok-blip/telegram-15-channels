import { NextResponse } from "next/server";
import { getTelegramQuickTestStatus, runTelegramQuickTest } from "@/lib/telegram-quick-test";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getTelegramQuickTestStatus(), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const result = await runTelegramQuickTest({
    confirmed: body.confirmed === true,
    mode: body.mode === "retry_failed" || body.mode === "force_repeat" ? body.mode : "batch",
    channelId: typeof body.channelId === "string" ? body.channelId : undefined,
    postId: typeof body.postId === "string" ? body.postId : undefined,
  });

  return NextResponse.json(result, {
    status: result.confirmed ? 200 : 409,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
