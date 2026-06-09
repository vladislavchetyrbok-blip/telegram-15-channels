import { NextResponse } from "next/server";
import { updateVisualAssetStatus } from "@/lib/visual-assets";

export const dynamic = "force-dynamic";

export function POST(_request: Request, { params }: { params: { id: string } }) {
  const result = updateVisualAssetStatus(params.id, "rejected");
  return NextResponse.json(result, { status: result.ok ? 200 : 404 });
}
