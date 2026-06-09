import { NextResponse } from "next/server";
import { checkAllTelegramAccess } from "@/lib/telegram-diagnostics";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(await checkAllTelegramAccess());
}
