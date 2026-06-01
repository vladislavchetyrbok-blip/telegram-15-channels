import { NextResponse } from "next/server";
import { getTelegramBotDiagnostics } from "@/lib/telegram-diagnostics";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getTelegramBotDiagnostics());
}
