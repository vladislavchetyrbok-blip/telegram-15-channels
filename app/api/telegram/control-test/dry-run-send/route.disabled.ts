import { NextResponse } from "next/server";
import { dryRunSendTelegramControlTest } from "@/lib/telegram-control-test";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    channelId?: string;
    text?: string;
  };
  const result = dryRunSendTelegramControlTest(body);

  return NextResponse.json(result, { status: result.ok ? 200 : 422 });
}
