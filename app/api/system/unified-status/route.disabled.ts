import { NextResponse } from "next/server";
import { getUnifiedSystemStatus } from "@/lib/unified-system-status";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getUnifiedSystemStatus());
}
