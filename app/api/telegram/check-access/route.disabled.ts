import { NextResponse } from "next/server";
import { checkTelegramChannelsAccess } from "@/lib/telegram-access";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await checkTelegramChannelsAccess();

  return NextResponse.json(result, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
