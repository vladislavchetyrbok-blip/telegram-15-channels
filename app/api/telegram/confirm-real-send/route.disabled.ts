import { NextResponse } from "next/server";
import { confirmRealSend } from "@/lib/telegram-production-flow";

export const dynamic = "force-dynamic";

interface ConfirmRealSendBody {
  requestId?: string;
  confirmationPhrase?: string;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ConfirmRealSendBody;
  const result = confirmRealSend({
    requestId: body.requestId,
    confirmationPhrase: body.confirmationPhrase,
  });

  return NextResponse.json(result);
}
