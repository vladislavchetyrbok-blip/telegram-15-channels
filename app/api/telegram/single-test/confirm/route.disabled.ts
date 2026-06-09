import { NextResponse } from "next/server";
import { confirmSingleChannelTest } from "@/lib/telegram-single-test";

export const dynamic = "force-dynamic";

interface ConfirmBody {
  channelId?: string;
  confirmationPhrase?: string;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ConfirmBody;

  return NextResponse.json(
    confirmSingleChannelTest({
      channelId: body.channelId,
      confirmationPhrase: body.confirmationPhrase,
    }),
  );
}
