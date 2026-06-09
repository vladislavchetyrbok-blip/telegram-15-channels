import { NextResponse } from "next/server";
import { prepareRealSend } from "@/lib/telegram-production-flow";

export const dynamic = "force-dynamic";

interface PrepareRealSendBody {
  draftId?: string;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as PrepareRealSendBody;
  const result = prepareRealSend({ draftId: body.draftId });

  return NextResponse.json(result, { status: result.request ? 200 : 400 });
}
