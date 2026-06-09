import { NextResponse } from "next/server";
import { sendSingleChannelRealTest } from "@/lib/telegram-single-test";

export const dynamic = "force-dynamic";

interface SendRealBody {
  channelId?: string | string[];
  text?: string;
  confirmationPhrase?: string;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as SendRealBody;
  const result = await sendSingleChannelRealTest({
    channelId: body.channelId,
    text: body.text,
    confirmationPhrase: body.confirmationPhrase,
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 423 });
}
