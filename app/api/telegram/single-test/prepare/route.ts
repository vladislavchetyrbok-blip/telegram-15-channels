import { NextResponse } from "next/server";
import { prepareSingleChannelTest } from "@/lib/telegram-single-test";

export const dynamic = "force-dynamic";

interface PrepareBody {
  channelId?: string;
  draftId?: string;
  text?: string;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as PrepareBody;
  const result = prepareSingleChannelTest({
    channelId: body.channelId,
    draftId: body.draftId,
    text: body.text,
  });

  return NextResponse.json(result, { status: result.reason === "Channel was not found." ? 404 : 200 });
}
