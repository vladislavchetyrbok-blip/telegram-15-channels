import { NextResponse } from "next/server";
import { getTelegramControlTestStatus } from "@/lib/telegram-control-test";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(getTelegramControlTestStatus());
}
