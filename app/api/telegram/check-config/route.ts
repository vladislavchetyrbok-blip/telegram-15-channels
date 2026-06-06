import { NextResponse } from "next/server";
import { checkTelegramConfig } from "@/lib/telegram";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(checkTelegramConfig(), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
