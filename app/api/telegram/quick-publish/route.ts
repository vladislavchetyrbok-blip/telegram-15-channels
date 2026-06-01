import { NextResponse } from "next/server";
import { getTelegramQuickPublishStatus, runTelegramQuickPublish } from "@/lib/telegram-quick-publish";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getTelegramQuickPublishStatus(), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const mode = body.mode === "retry_failed" || body.mode === "continue_queue" || body.mode === "autopublish" ? body.mode : "quick_publish";
  const result = await runTelegramQuickPublish({
    confirmed: body.confirmed === true,
    mode,
  });

  return NextResponse.json(result, {
    status: result.confirmed ? 200 : 409,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
