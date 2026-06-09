import { NextResponse } from "next/server";
import { checkTelegramChannelsConnection } from "@/lib/telegram";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(checkTelegramChannelsConnection());
}
