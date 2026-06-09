import { NextResponse } from "next/server";
import { runVisualAssetAudit } from "@/lib/visual-assets";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(runVisualAssetAudit());
}
