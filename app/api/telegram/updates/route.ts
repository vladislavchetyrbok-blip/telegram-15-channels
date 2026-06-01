import { NextResponse } from "next/server";
import { getTelegramUpdates } from "@/lib/telegram-updates";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await getTelegramUpdates();

  return NextResponse.json(result, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
