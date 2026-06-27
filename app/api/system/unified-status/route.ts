import { NextResponse } from "next/server";
import { getRedactedUnifiedSystemStatus } from "@/lib/unified-system-status";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getRedactedUnifiedSystemStatus());
}
