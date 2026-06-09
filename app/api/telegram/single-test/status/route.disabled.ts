import { NextResponse } from "next/server";
import { getSingleChannelTestStatus } from "@/lib/telegram-single-test";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  return NextResponse.json(getSingleChannelTestStatus(searchParams.get("channelId") ?? undefined));
}
