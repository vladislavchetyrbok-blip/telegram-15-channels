import { NextResponse } from "next/server";
import { generateContentPlanForChannel } from "@/lib/content-plan-store";

interface GenerateDayBody {
  channelId?: string;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as GenerateDayBody;

  if (!body.channelId) {
    return NextResponse.json(
      {
        ok: false,
        mode: "dry-run",
        telegramSent: false,
        error: "channelId is required",
      },
      { status: 400 },
    );
  }

  const result = await generateContentPlanForChannel(body.channelId, 1);

  return NextResponse.json(
    {
      ok: result.ok,
      mode: "dry-run",
      dryRun: true,
      telegramSent: false,
      items: result.items,
      error: result.error,
    },
    { status: result.ok ? 200 : 400 },
  );
}
