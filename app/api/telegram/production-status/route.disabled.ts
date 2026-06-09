import { NextResponse } from "next/server";
import { getProductionStatus } from "@/lib/telegram-production-flow";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getProductionStatus());
}
