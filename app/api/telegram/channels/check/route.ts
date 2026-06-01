import { NextResponse } from "next/server";
import { checkTelegramChannelsConnection } from "@/lib/telegram";

export async function GET() {
  return NextResponse.json(checkTelegramChannelsConnection());
}
