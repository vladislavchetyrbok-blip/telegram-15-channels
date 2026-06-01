import { NextResponse } from "next/server";
import { seedTelegramTargetsFromKnownChatIds } from "@/lib/telegram-target-store";

export const dynamic = "force-dynamic";

export async function POST() {
  const result = seedTelegramTargetsFromKnownChatIds();

  return NextResponse.json(result, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
